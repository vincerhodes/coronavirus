const margin = {top: 20, right: 10, bottom: 20, left: 10},
    width = 920 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

const svg = d3.select('.canvas.map').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

// create a graph within the svg where the map will be drawn
const graph = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const tip = d3.select('body')
  .append('div')
	.attr('class', 'tooltip')
  .style('opacity', 0);

// colour scale (not in use as too many provinces)
const colour = d3.scaleOrdinal(d3.schemeAccent);

// setup the projection to be used and centre on China
const projection = d3.geoMercator()
 .center([110, 25])
 .scale([800])
 .translate([550,550])
 .precision([.1]);

// setup the path function to draw paths correctly
const boundaries = d3.geoPath()
    .projection(projection);

// fetch data and draw the map
d3.json("data/china-provinces.json").then(data => {

  // extract features from the map json using topojson
  features = topojson.feature(data, data.objects.provinces).features;

  // draw the map
  const path = graph.selectAll('g')
      .data(features)
      .enter()
      .append('path')

  // set map
  path
      .attr("d", boundaries)
      // .attr("fill", (d,i) => colour(i))
      .attr("fill", "#ccc")
      .attr("id", d => d.properties.NAME_1)
      .attr("stroke","#fff")
      .attr("stroke-width", 1);

  // setup mouse events
  path
    .on('mouseover', (d,i,n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('fill', '#3ed');
      tip
        .style('opacity', 0.8)
        .html(`<div class="en_name">${d.properties.NAME_1}</div>` +
              `<div class="cn_name">${d.properties.NL_NAME_1}</div>` +
              `<div class="delete">Click to display data</div>`
            );

    })
    .on('mouseout', (d,i,n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('fill', '#ccc');
      tip.style('opacity', 0);
    })
    .on('mousemove', function() {
      tip
        .style("top", (d3.event.pageY - 100) + "px")
        .style("left", (d3.event.pageX) + "px");
    });
});
