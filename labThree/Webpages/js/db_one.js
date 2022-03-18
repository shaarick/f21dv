const readCovid = d3.csv("https://covid.ourworldindata.org/data/owid-covid-data.csv");
const readMap = d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')


readCovid.then(function (covidData) {
    calculateSummary(covidData);

    readMap.then(function (mapData) {
        addMap(mapData, covidData);
        addCircle(mapData, covidData);
        // addCharts(mapData, covidData);
    });


});

const width = 1440;
const height = 600;
const svg = d3.select('.dashboardOne').append('svg').attr('width', width).attr('height', height)
const g = svg.append('g');
const projection = d3.geoMercator().scale(140).translate([width / 2, height / 1.4]);

function calculateSummary(data) {
    const totalCases = d3.sum(data.map(function (d) { return d.new_cases }));
    const totalDeaths = d3.sum(data.map(function (d) { return d.new_deaths }));
    const totalVacs = d3.sum(data.map(function (d) { return d.new_vaccinations }));

    d3.select('#caseCount').text(totalCases);
    d3.select('#deathCount').text(totalDeaths);
    d3.select('#vaccCount').text(totalVacs);
}

function addMap(mapData, covidData) {
    const path = d3.geoPath(projection);
    const countries = topojson.feature(mapData, mapData.objects.countries)

    g.selectAll('path').data(countries.features).enter().append('path')
        .attr('class', 'country').attr('d', path)
        .on('mouseover', function (event, data) {
            d3.select(this).attr('class', 'hover');
        })
        .on('mouseout', function (data) {
            d3.select(this).attr('class', 'country');
        })
        .on('click', function (event, data) {
            if (d3.select(this).classed('selected')) {
                svg.selectAll('path').attr('class', 'country');
                d3.select('.cases').text('Total Cases')
                d3.select('.deaths').text('Total Deaths')
                d3.select('.vaccines').text('Total Vaccines')
                calculateSummary(covidData);
            } else {
                svg.selectAll('path').attr('class', 'country')
                d3.selectAll('path').on('mouseover', function (d) {
                    d3.select(this).attr('class', 'hover');
                    d3.select(this).on('mouseout', function (d) {
                        d3.select(this).attr('class', 'country')
                    });
                });
                d3.select(this).on('mouseout', null);
                d3.select(this).on('mouseover', null);
                d3.select(this).attr('class', 'selected')

                let cName = data.properties.name;

                d3.select('.cases').text('Total Cases: ' + cName)
                d3.select('.deaths').text('Total Deaths: ' + cName)
                d3.select('.vaccines').text('Total Vaccines: ' + cName)

                let countryData = covidData.filter(c => c.location == cName);
                calculateSummary(countryData);
            }
        })
}

function addCircle(mapData, covidData) {
    console.log(covidData);
    const countries = topojson.feature(mapData, mapData.objects.countries)
    const scale = d3.scaleSqrt();
    scale.domain([0, d3.max(covidData, function (d) {
        return d.new_cases
    })])
    scale.range([0, 10])

    g.selectAll('circle').data(countries.features).enter().append('circle')
        .attr('class', 'country-circle')
        .attr('cx', d => projection(d3.geoCentroid(d))[0])
        .attr('cy', d => projection(d3.geoCentroid(d))[1])
        .transition()
        .ease(d3.easeLinear)
        .delay(4000)
        .duration(4000)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', '2px')
        .attr('r', function (data) {
            let cName = data.properties.name;
            let countryData = covidData.filter(c => c.location == cName);
            latestDate = d3.max(countryData.map(d => d.date))
            let latestData = countryData.filter(d => d.date == latestDate)
            if (latestData[0]) {
                let x = scale(parseInt(latestData[0].new_cases))
                return x
            } else {
                return 0
            }
        })
}

// function addBubbles(mapData, covidData) {
//     const margin = { top: 40, right: 150, bottom: 60, left: 30 },
//         width = 500 - margin.left - margin.right,
//         height = 420 - margin.top - margin.bottom;

//     const svg = d3.select("#my_dataviz")
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3.scaleLinear()
//         .domain([0, 45000])
//         .range([0, width])

//     svg.append('g')
//         .attr("transform", `translate(0, ${height})`)
//         .call(d3.axisBottom(x).ticks(3));

//     svg.append("text")
//         .attr("text-anchor", "end")
//         .attr("x", width)
//         .attr("y", height + 50)
//         .text("Gdp per Capita");



// }
