
var map = $("#map");
var container = map.parent();
var width = map.width();
var height = map.height();

console.log(container.width(), map.width());

const dimMap = {top: 10, right: 10, bottom: 20, left: 10};
    dimMap.width = container.width() - dimMap.left - dimMap.right;
    dimMap.height = (dimMap.width + dimMap.left + dimMap.right) * 7/9 - dimMap.top - dimMap.bottom;
console.log(dimMap);

const svgMap = d3.select('#map')
  .attr('width', dimMap.width)
  .attr('height', dimMap.height);

// create a graph within the svgMap where the map will be drawn
const graphMap = svgMap.append('g')
    .attr('transform', `translate(${dimMap.left}, ${dimMap.top})`);

const tip = d3.select('body')
  .append('div')
	.attr('class', 'tooltip')
  .style("top", "260px")
  .style("left", "660px")
  .style('opacity', 0);

// choropleth colour scale
var choropleth = d3.scaleThreshold()
  .range(d3.schemeReds[9]);

var scalefactor = dimMap.width*0.9;
console.log(scalefactor);
// setup the projection to be used and centre on China
const projection = d3.geoMercator()
 .center([106, 39])
 .scale([800])
 .translate([(dimMap.width)/2,(dimMap.height)/2])
 .precision([.1]);

// setup the path function to draw paths correctly
const boundaries = d3.geoPath()
    .projection(projection);

// declare variables that will be used for all charts
var selectedProvince = {cn: '中国', en: 'China'}; // variable to contain the selected province


// fetch all data
var promises = [
  d3.json("data/china-provinces.json"),
  // d3.json("https://raw.githubusercontent.com/BlankerL/DXY-COVID-19-data/master/json/DXYArea.json")
  d3.json("data/DXYArea.json") // local data
]

const promisesRes = Promise.all(promises)
// fetch data and draw the map
const updateMap = promisesRes.then(data => {

  // setup topo data
  const topo = data[0];
  // extract features from the map json using topojson
  features = topojson.feature(topo, topo.objects.provinces).features; // for topojson files
  // features = topo.features; // use this for geojson files

  // setup virus data and filter for China only
  virus_data = data[1].results
  virus_data = virus_data.filter(item  => item.countryName == '中国');
  updateTable(virus_data);

  // setup data for use in the bar circle
  var totals = {confirmed: 0, cured: 0, dead: 0};
  var circleData =  [];
  virus_data.forEach(data => {
    totals.confirmed += data.confirmedCount;
    totals.cured += data.curedCount;
    totals.dead += data.deadCount;
    circleData.push({
      province_ch: data.provinceShortName,
      province_en: data.provinceEnglishName,
      name: 'Confirmed',
      value: data.confirmedCount
    },
    {
      province_ch: data.provinceShortName,
      province_en: data.provinceEnglishName,
      name: 'Cured',
      value: data.curedCount
    },
    {
      province_ch: data.provinceShortName,
      province_en: data.provinceEnglishName,
      name: 'Deceased',
      value: data.deadCount
    });
  });
  circleData.push(
    {province_ch: '中国', province_en: 'China', name: 'Confirmed', 'value': totals.confirmed},
    {province_ch: '中国', province_en: 'China', name: 'Cured', 'value': totals.cured},
    {province_ch: '中国', province_en: 'China', name: 'Deceased', 'value': totals.dead}
  );

  // update choropleth domain based on the virus data
  // fixed domain
  const fixed_domain = [0,50,100,500,1000,5000,10000,50000,100000]; // fixed domain

  // calculated domain using exponents
  const v_max = d3.max(virus_data, d => d.confirmedCount);
  const scale_stops = 9; // change to 7 for calculated domain
  var domain = [0];
  for (var i = 0; i <= scale_stops - 1; i++) {
    domain.push(Math.floor(Math.pow(6, i)));
  };
  // console.log(scale_stops, domain);
  choropleth
    .range(d3.schemeReds[scale_stops])
    .domain(fixed_domain);

  // draw the map
  const path = graphMap.selectAll('g')
      .data(features)
      .enter()
      .append('path')

  path
      .attr("d", boundaries)
      .attr("fill", d => choropleth(virus_data.find(item => item.provinceShortName == d.properties.NL_NAME_1).confirmedCount))
      .attr("id", d => d.properties.NL_NAME_1)
      .attr("stroke","#fff")
      .attr("stroke-width", 1)
      // setup mouse events
    .on('mouseover', d => {
      highlightProvince(d.properties.NL_NAME_1);
      tip
        .style('opacity', 0.8)
        .html(data => {
          data = virus_data.find(item => item.provinceShortName == d.properties.NL_NAME_1);
          let content = `<div class="en_name">${d.properties.NL_NAME_1} | ${d.properties.NAME_1}</div>` +
              `<div class="cases">Confirmed: ${data.confirmedCount}</div>` +
              `<div class="cases">Recovered: ${data.curedCount}</div>` +
              `<div class="cases">Deceased: ${data.deadCount}</div>` +
              `<div class="update">Click to update chart</div>`;
          return content;
        });
    })
    .on('mouseout', d => {
      choroplethProvince(d.properties.NL_NAME_1,
        virus_data.find(item => item.provinceShortName == d.properties.NL_NAME_1).confirmedCount)
    })
    // pin tooltip to mouse cursor
    .on('mousemove', d => handleMouseMove(d))
    .on('click', d => {
      selectedProvince = {cn: d.properties.NL_NAME_1, en: d.properties.NAME_1};
      handleMouseClick(circleData, virus_data);
    });

    // initial update of the circle bar
    updateCircle(circleData);
});

const handleMouseClick = (cData, vData) => {
  updateCircle(cData);
  updateTable(vData);
};

const handleMouseMove = d => {
  tip
    .style("top", (d3.event.pageY - 100) + "px")
    .style("left", (d3.event.pageX) + "px");
};

const choroplethProvince = (provinceID, count) => {
  d3.select("#"+provinceID)
    .transition().duration(100)
    .attr("fill", choropleth(count));
    tip.style('opacity', 0);
};

const highlightProvince = provinceID => {
  // console.log(provinceID);
  d3.select("#"+provinceID)
    .transition().duration(100)
    .attr('fill', '#3ed');
};


document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.fixed-action-btn');
  var instances = M.FloatingActionButton.init(elems, options);
});
