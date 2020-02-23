// create a graph within the svg where the circle plot will be drawn
// const graphCircle = svg.append('g')
//   .attr('transform', `translate(${370}, ${margin.top+20})`);

const dimCircle = {top: 5, right: 5, bottom: 5, left: 5};
    dimCircle.width = 210 - dimCircle.left - dimCircle.right;
    dimCircle.height = 210 - dimCircle.top - dimCircle.bottom;
console.log(dimCircle);

const graphCircle = svgMap.append('g')
  .attr('width', dimCircle.width + dimCircle.left + dimCircle.right)
  .attr('height', dimCircle.height + dimCircle.top + dimCircle.bottom)
  .attr('transform', `translate(${460}, ${dimMap.top+110})`)

// const graphCircle = svgCircle.append('g')
//   .attr('transform', `translate(${dimCircle.width / 2}, ${dimCircle.height / 2})`);

const chartRadius = 120;

const color = d3.scaleOrdinal(d3.schemePastel1);

const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip circle');

const PI = Math.PI,
  arcMinRadius = 30,
  arcPadding = 5,
  labelPadding = -5,
  numTicks = 12;

const updateCircle = (data) => {

  data = data.filter(item  => item.province_ch == selectedProvince);

  let scale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) * 1.1])
    .range([0, 2 * PI]);

  let ticks = scale.ticks(numTicks).slice(0, -1);
  let keys = data.map((d, i) => d.name);
  //number of arcs
  const numArcs = keys.length;
  const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

  let arc = d3.arc()
    .innerRadius((d, i) => getInnerRadius(i))
    .outerRadius((d, i) => getOuterRadius(i))
    .startAngle(0)
    .endAngle((d, i) => scale(d))

  let radialAxis = graphCircle.append('g')
    .attr('class', 'r axis')
    .selectAll('g')
      .data(data)
      .enter().append('g');

  radialAxis.append('circle')
    .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

  radialAxis.append('text')
    .attr('x', labelPadding)
    .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
    .text(d => d.name);

  let axialAxis = graphCircle.append('g')
    .attr('class', 'a axis')
    .selectAll('g')
      .data(ticks)
      .enter().append('g')
        .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

  axialAxis.append('line')
    .attr('x2', chartRadius);

  // axialAxis.append('text')
  //   .attr('x', chartRadius + 10)
  //   .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
  //   .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
  //   .text(d => d);

  //data arcs
  let arcs = graphCircle.append('g')
    .attr('class', 'data')
    .selectAll('path')
      .data(data)
      .enter().append('path')
      .attr('class', 'arc')
      .style('fill', (d, i) => color(i))

  arcs.transition()
    .delay((d, i) => i * 200)
    .duration(1000)
    .attrTween('d', arcTween);

  arcs.on('mousemove', showTooltip)
  arcs.on('mouseout', hideTooltip)

  function arcTween(d, i) {
    let interpolate = d3.interpolate(0, d.value);
    return t => arc(interpolate(t), i);
  }

  function showTooltip(d) {
    tooltip.style('left', (d3.event.pageX) + 'px')
      .style('top', (d3.event.pageY - 50) + 'px')
      .style('display', 'inline-block')
      .html(d.value);
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }

  function rad2deg(angle) {
    return angle * 180 / PI;
  }

  function getInnerRadius(index) {
    return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
  }

  function getOuterRadius(index) {
    return getInnerRadius(index) + arcWidth;
  }

};
