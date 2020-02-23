
// append header
const header = d3.select("#datatable")
  .append('div')
  .attr('class', 'row')

header.append('div')
  .attr('class', 'col s3 header')
  .attr('id', 'province_ch')
  .text('Province cn');
header.append('div')
  .attr('class', 'col s3 header')
  .attr('id', 'province_en')
  .text('Province en');
header.append('div')
  .attr('class', 'col s2 header')
  .text('Confirmed');
header.append('div')
  .attr('class', 'col s2 header')
  .text('Cured');
header.append('div')
  .attr('class', 'col s2 header')
  .text('Deceased');

const datatable = d3.select("#datatable")
  .append('div')
  .attr('class', 'datatable');

// update function
const updateTable = (data) => {

  if (selectedProvince.cn == '中国') {
    header
      .select('#province_ch')
      .text('Province cn');
    header
      .select('#province_en')
      .text('Province en');
  } else {
    header
      .select('#province_ch')
      .text('City cn');
    header
      .select('#province_en')
      .text('City en');
    data = data.filter(item  => item.provinceShortName == selectedProvince.cn);
    data = data[0].cities;
  }

  data = data.slice().sort((a, b) => d3.descending(a.confirmedCount, b.confirmedCount));

  d3.selectAll('.datarow')
    .remove();

  const datarows = datatable.selectAll('div')
    .data(data);

  const row = datarows.enter()
    .append('div')
    .attr('class', 'row datarow')
    .attr('id', d => {
      if (selectedProvince.cn == '中国') {
        return d.provinceShortName
      } else {
        return d.cityName
      };
    });
  row.append('div')
    .attr('class', 'col s3 division')
    .text(d => {
      if (selectedProvince.cn == '中国') {
        return d.provinceShortName
      } else {
        return d.cityName
      };
    });
  row.append('div')
    .attr('class', 'col s3 division')
    .text(d => {
      if (selectedProvince.cn == '中国') {
        return d.provinceEnglishName
      } else {
        return d.cityEnglishName
      };
    });
  row.append('div')
    .attr('class', 'col s2 confirmed')
    .text(d => d.confirmedCount);
  row.append('div')
    .attr('class', 'col s2 cured')
    .text(d => d.curedCount);
  row.append('div')
    .attr('class', 'col s2 dead')
    .text(d => d.deadCount);

  // add events
  datatable.selectAll('.datarow')
    .on('mouseover', (d) => {
      if (selectedProvince.cn == '中国') {
        highlightProvince(d.provinceShortName);
      };
    })
    .on('mouseout', (d) => {
      if (selectedProvince.cn == '中国') {
        choroplethProvince(d.provinceShortName, d.confirmedCount);
      };
    })
    .on('click', (d) => {
      if (selectedProvince.cn == '中国') {
        selectedProvince = {cn: d.provinceShortName, en: d.provinceEnglishName};
        updateTable(data);
      };
    });
};
