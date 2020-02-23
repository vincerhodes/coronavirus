// create a graph within the svg where the circle plot will be drawn
const dimCircle = {top: 5, right: 5, bottom: 5, left: 5};
    dimCircle.width = (dimMap.width + dimMap.left + dimMap.right) / 3 - dimCircle.left - dimCircle.right;
    dimCircle.height = (dimCircle.width + dimCircle.left + dimCircle.right) * 2/3 - dimCircle.top - dimCircle.bottom;

const graphCircle = svgMap.append('g')
  .attr('width', dimCircle.width + dimCircle.left + dimCircle.right)
  .attr('height', dimCircle.height + dimCircle.top + dimCircle.bottom)
  .attr('transform', `translate(${dimMap.width/2.2}, ${dimMap.height/5})`)

// setup constants for calculating pie and arcs
const pie = Math.PI,
  chartRadius = 120,
  arcMinRadius = 40,
  arcPadding = 5,
  labelPadding = -5,
  numTicks = 12
  numArcs = 0
  arcWidth = 0;

// create scale
const scale = d3.scalePow()
  .range([0, 2 * pie])
  .exponent(0.5);

const arc = d3.arc()
  .innerRadius((d, i) => getInnerRadius(i))
  .outerRadius((d, i) => getOuterRadius(i))
  .startAngle(0)
  .cornerRadius(3)
  .endAngle((d, i) => scale(d));

// define transition constants and tweens
const t = {duration: 500, delay: 100};

function arcTweenEnter(d, i) {
  let interpolate = d3.interpolate(0, d.value);
  return t => arc(interpolate(t), i);
};

function arcTweenUpdate(d, i) {
  let interpolate = d3.interpolate(0, d.value);
  return t => arc(interpolate(t), i);
};

function arcTweenExit(d, i) {
  let interpolate = d3.interpolate(d.value, 0);
  return t => arc(interpolate(t), i);
};

// set colour scheme
const colour = d3.scaleOrdinal(['#B29DD9', '#77DD77', '#FE6B64', '#779ECB', '#FDFD98']);

// legend
const legendGroup = graphCircle.append('g')
	.attr("transform", `translate(${dimCircle.width/2 - 10}, ${ -dimCircle.height/2 - 20})`);

const legend = d3.legendColor()
	.shape('circle')
	.shapePadding(10)
	.scale(colour);

const title = graphCircle.append('text')
  .attr('class', 'circle-title')
  .style('text-anchor', 'middle')
  .style("font-size", "20px")
  .attr('fill', 'white');

title_cn = title.append('tspan')
  .attr('class', 'title-cn')
  .attr('x', 0)
  .attr('dy', 0);

title_en = title.append('tspan')
  .attr('class', 'title-en')
  .attr('x', 0)
  .attr('dy', 20)
  .attr('font-size', '0.8em');

// setup axes
const radialAxisGroup = graphCircle.append('g')
  .attr('class', 'r axis');

radialAxisGroup
  .append('circle')
  .attr('r', arcMinRadius - arcPadding);

const ticks = scale.ticks(numTicks).slice(0, -1);

const axialAxisGroup = graphCircle.append('g')
  .attr('class', 'a axis');

const axialAxis = axialAxisGroup.selectAll('g')
    .data(ticks)
    .enter().append('g')
      .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

axialAxis.append('line')
  .attr('x1', arcMinRadius)
  .attr('x2', chartRadius)
  .attr('stroke-dasharray', 4);

// setup data area
const dataArea = graphCircle.append('g')
  .attr('class', 'data-area');

// setup arc text area
const arcTextArea = graphCircle.append('g')
  .attr('class', 'text-area');

// setup the tooltip
const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip');

// update routine
const updateCircle = (data) => {

  data = data.filter(item  => item.province_ch == selectedProvince.cn);
  // data = data.slice().sort((a, b) => d3.ascending(a.value, b.value));

  // update colour scales
  colour.domain(data.map(d => d.name));

  // update and call legend
  legendGroup.call(legend)
    .selectAll('text')
    .attr('fill', 'white');

  scale.domain([0, d3.max(data, d => d.value) * 1.01]);

  let keys = data.map((d, i) => d.name);

  //number of arcs
  numArcs = keys.length;
  arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

  const radialAxis = radialAxisGroup.selectAll('.updates')
    .data(data)

  const arcs = dataArea
    .selectAll('path')
    .data(data);

  const arcText = arcTextArea
    .selectAll('text')
    .data(data);

  // DOM exits
  radialAxis.exit().remove();
  arcs.exit().remove();
  arcText.exit().remove();

  // DOM updates
  title_cn.text(selectedProvince.cn);
  title_en.text(selectedProvince.en);

  radialAxis
    .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

  arcs.transition()
        .delay(t.delay)
        .duration(t.duration)
        .attrTween('d', arcTweenEnter);

  arcText
    .select('textPath')
      .attr("xlink:href", d => '#' + d.name)
      .text(d => d.value);

  // DOM additions
  radialAxis.enter()
    .append('circle')
    .attr('class', 'updates')
    .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

  arcs.enter()
    .append('path')
      .attr('class', 'arc')
      .style('fill', d => colour(d.name))
      .attr('id', d => d.name)
      .transition()
        .delay(t.delay)
        .duration(t.duration)
        .attrTween('d', arcTweenEnter);

  arcText.enter()
    .append('text')
    .attr('class', 'arcText')
    .attr("x", 5)
    .attr("dy", 18)
    .append('textPath')
    .attr("xlink:href", d => '#' + d.name)
    .text(d => d.value);

  // add events
  graphCircle.selectAll('path')
    .on('mousemove', d => {tooltip.style('left', (d3.event.pageX) + 'px')
      .style('top', (d3.event.pageY - 50) + 'px')
      .style('display', 'inline-block')
      .style('opacity', 0.8)
      .html(`<div>${d.name}: ${d.value}</div>`);
    })
    .on('mouseout', d => {
      tooltip.style('display', 'none');
    });

};

// functions
function getInnerRadius(index) {
  return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + 2 * arcPadding);
}

function getOuterRadius(index) {
  return getInnerRadius(index) + arcWidth;
}

function rad2deg(angle) {
  return angle * 180 / pie;
}
