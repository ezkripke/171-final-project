/**
 * Choropleth Map
 * @param _parentElement 	-- the HTML element in which to draw the map vis
 * @param _data			    -- the dataset incarceration_trends_clean.csv
 */
MapLineVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};

MapLineVis.prototype.initVis = function() {
    let vis = this;

    // Aggregate data by year
    //console.log("data", vis.data);
    vis.aggrData = [];
    var length = 38;
    for (var i = 0; i < length; i++) {
        vis.aggrData.push(0)
    }
    vis.data.forEach(function(d) {
        //console.log("d", d);
        for(var i = 0; i < length; i++) {
            var year = (i + 1978).toString();
          //  console.log(year);
            //console.log(d[year]);
            if (!isNaN(+d[year])) {
                vis.aggrData[i] = (vis.aggrData[i] + (+d[year]));
                //console.log(vis.aggrData[i]);
            }
        }
    });
    console.log(vis.aggrData);

    // Initialize line chart
    // Adapted from https://www.d3-graph-gallery.com/graph/line_basic.html
    // create SVG drawing area
    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    vis.width =  300 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


            // Add X axis
            vis.x = d3.scaleTime()
                .domain([new Date("1979"), new Date("2016")])
                .range([ 0, vis.width - 20]);
            vis.xAxis = d3.axisBottom(vis.x);

            vis.svg.append("g")
                .attr("transform", "translate(20," + (vis.height - 50) + ")")
                .attr("class", "axisWhite")
                .call(vis.xAxis);

            // Add Y axis
            console.log("d3.max(vis.aggrData)", d3.max(vis.aggrData));
            vis.y = d3.scaleLinear()
                .domain([0, +d3.max(vis.aggrData)])
                .range([ vis.height - 50, 50 ]);
            vis.yAxis = d3.axisLeft(vis.y)
                .tickFormat(d3.format(",.0f"));

            console.log(vis.yAxis.tickValues());

            vis.svg.append("g")
                .attr("transform", "translate(20," + 0 + ")")
                .attr("class", "axisWhite")
                .call(vis.yAxis);

            // Add the line
            vis.svg.append("path")
                .datum(vis.aggrData)
                .attr("fill", "none")
                .attr("transform", "translate(20," + 0 + ")")
                .attr("stroke", '#a50f15')
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(function(d, i) {
                        //console.log("vis.x(new Date(i + 1978)", vis.x(new Date((i + 1979).toString())));
                        return vis.x(new Date((i + 1979).toString()));
                    })
                    .y(function(d) {
                        //console.log("vis.y(d.value)", d);
                        return vis.y(d)
                    })
                );

            // Add circular tooltip
            vis.circle = vis.svg.append("circle")
                .attr("fill", "white")
                .attr("r", 8)
                .attr("cx", vis.x(new Date("1999")) + 20)
                .attr("cy", vis.y(vis.aggrData[20]));

            // Add title
    vis.svg.append("text")
        .attr("fill", '#fcae91')
        .attr("x", 70)
        .attr("y", vis.height - 18)
        .attr("font-size", 12)
        .text("Total incarcerated per year");

    vis.svg.append("text")
        .attr("fill", '#fcae91')
        .attr("x", 95)
        .attr("y", vis.height - 5)
        .attr("font-size", 12)
        .text("(per 5,000,000)")

};

MapLineVis.prototype.moveCircle = function(year) {
    // Update color based on year
    let vis = this;
    console.log("vis.year", year);
    vis.circle.attr("cx", vis.x(new Date(year)) + 20)
        .attr("cy", vis.y(vis.aggrData[year - 1978]))

};


