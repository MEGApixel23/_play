function buildChart(listHospitals, dataChart) {
console.log(dataChart);
    //Clear previous Charts
    clearChart();

    if (dataChart.length > 0)
        $.each(listHospitals, function (index, item) {

            var chartElement = '<div class=""><div class="labelChart">' + item + '</div><svg class="chart' + index + '"></svg></div>';
            $('#blCharts').append(chartElement);

            var data = {
                labels: [item],
                series: dataChart
            };

            var chartWidth = 300,
                barHeight = 20,
                groupHeight = barHeight * data.series.length,
                gapBetweenGroups = 10,
                spaceForLabels = 40,
                spaceForLegend = 150;

            // Zip the series data together (first values, second values, etc.)
            var zippedData = [];
            for (var j = 0; j < data.series.length; j++) {
                zippedData.push(data.series[j].values[index]);
            }

            // Color scale
            var color = d3.scale.category20b();
            var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

            var x = d3.scale.linear()
                .domain([0, d3.max(zippedData)])
                .range([0, chartWidth]);

            var y = d3.scale.linear()
                .range([chartHeight + gapBetweenGroups, 0]);

            var yAxis = d3.svg.axis()
                .scale(y)
                .tickFormat('')
                .tickSize(0)
                .orient("left");

            // Specify the chart area and dimensions
            var chart = d3.select(".chart" + index)
                .attr("width", spaceForLabels + chartWidth + spaceForLegend)
                .attr("height", chartHeight + 20);

            // Create bars
            var bar = chart.selectAll("g")
                .data(zippedData)
                .enter().append("g")
                .attr("transform", function (d, i) {
                    return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / data.series.length))) + ")";
                });

            // Create rectangles of the correct width
            bar.append("rect")
                .attr("fill", function (d, i) {
                    return color(i % data.series.length);
                })
                .attr("class", "bar")
                .attr("width", x)
                .attr("height", barHeight - 1);

            // Add text label in bar
            bar.append("text")
                .attr("x", function(d) { return x(d) + 3; })
                .attr("y", barHeight / 2)
                .attr("fill", "red")
                .attr("dy", ".25em")
                .style('font-size', '0.8em')
                .text(function(d) { return d; });

            // Draw labels
            bar.append("text")
                .attr("class", "label")
                .attr("x", function (d) {
                    return -35;
                })
                .attr("y", 13)
                .text(function (d, i) {
                    var index = i % data.series.length;
                    if (typeof data.series[index] != 'undefined')
                        return data.series[index].label;
                    else
                        return "";
                }
            );

            chart.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups / 2 + ")")
                .call(yAxis);
        });

    else {
        $('#blCharts').html('<span class="pd-left-10">No data</span>');
    }
}

function clearChart() {

    $('#blCharts').html('');

}