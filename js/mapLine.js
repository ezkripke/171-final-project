/**
 * Choropleth Map
 * @param _parentElement 	-- the HTML element in which to draw the map vis
 * @param _data			    -- the dataset incarceration_trends_clean.csv
 */
MapLineVis = function(_parentElement, _data, _eventHandler) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;

    this.initVis();
};

MapLineVis.prototype.initVis = function() {
    let vis = this;

    vis.parseDate = d3.timeParse("%Y");

    vis.year = 1998;

    // Aggregate data by year
    //console.log("data", vis.data);
    vis.aggrData = [];
    var length = 38;
    for (var i = 0; i < length; i++) {
        vis.aggrData.push(0)
    }
    vis.data.forEach(function(d) {
        for(var i = 0; i < length; i++) {
            var year = (i + 1978).toString();
            if (!isNaN(+d[year])) {
                vis.aggrData[i] = (vis.aggrData[i] + (+d[year] * 1e5 / 5e6));
            }
        }
    });

    // Initialize line chart
    // Adapted from https://www.d3-graph-gallery.com/graph/line_basic.html
    // create SVG drawing area
    vis.margin = { top: 50, right: 20, bottom: 70, left: 50 };
    vis.width =  300 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Add X axis
    vis.x = d3.scaleTime()
        .domain([vis.parseDate(1978), vis.parseDate(2016)])
        .range([0, vis.width]);
    vis.xAxis = d3.axisBottom(vis.x);

    vis.svg.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .attr("class", "axisWhite map-line-x-axis")
        .call(vis.xAxis);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);
    vis.yAxis = d3.axisLeft(vis.y)
        .tickFormat(d3.format(",.0f"));

    vis.svg.append("g")
        .attr("class", "axisWhite map-line-y-axis");

    // Add title
    vis.svg.append("text")
        .attr("fill", '#fcae91')
        .attr("x", vis.width / 2)
        .attr("y", vis.height + 30)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .text("Total incarcerated per year");

    vis.svg.append("text")
        .attr("fill", '#fcae91')
        .attr("x", vis.width / 2)
        .attr("y", vis.height + 44)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .text("(per 100,000)");

    vis.usPath = vis.svg.append("path")
        .datum(vis.aggrData)
        .attr("class", "map-line-us")
        .attr("fill", "none")
        .attr("stroke", '#a50f15')
        .attr("stroke-width", 2);

    vis.svg.append("line")
        .attr("class", "legend-national")
        .attr("stroke", "#a50f15")
        .attr("stroke-width", 2)
        .attr("x1", vis.width - 10)
        .attr("x2", vis.width)
        .attr("y1", vis.height - 30)
        .attr("y2", vis.height - 30);

    vis.svg.append("text")
        .attr("class", "legend-national-label")
        .attr("text-anchor", "end")
        .attr("fill", "white")
        .attr("font-size", 12)
        .attr("x", vis.width - 15)
        .attr("y", vis.height - 26)
        .text("National");

    vis.svg.append("line")
        .attr("class", "legend-state")
        .attr("stroke", "#fcae91")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2 2")
        .attr("x1", vis.width - 10)
        .attr("x2", vis.width)
        .attr("y1", vis.height - 15)
        .attr("y2", vis.height - 15)
        .attr("stroke-opacity", 0);

    vis.svg.append("text")
        .attr("class", "legend-state-label")
        .attr("text-anchor", "end")
        .attr("fill", "white")
        .attr("font-size", 12)
        .attr("x", vis.width - 15)
        .attr("y", vis.height - 11)
        .attr("fill-opacity", 0);

    vis.statePath = vis.svg.append("path")
        .attr("class", "map-line-state")
        .attr("fill", "none")
        .attr("stroke", "#fcae91")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2 2");

    vis.circle = vis.svg.append("circle")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2 2")
        .attr("r", 8);

    vis.hline = vis.svg.append("line")
        .attr("class", "hline")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2 2");

    vis.vline = vis.svg.append("line")
        .attr("class", "vline")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2 2");

    vis.svg.append("clipPath")
        .attr("id", "map-line-clip-path")
        .append("rect")
        .attr("fill", "none")
        .attr("x", -50)
        .attr("y", -10)
        .attr("width", vis.width + 50)
        .attr("height", vis.height + 60);

    vis.svg
        .attr("clip-path", "url(#map-line-clip-path)");

    $(vis.eventHandler).bind("choroStateHover", function(e, stateName, stateData) {
        vis.updateVis(stateData);
    });

    $(vis.eventHandler).bind("choroStateUnhover", function(e) {
        vis.updateVis();
    });

    vis.updateVis();
};

MapLineVis.prototype.updateVis = function(stateData, duration) {
    let vis = this;

    if (duration == null) {
        duration = 500;
    }

    let stateName = null;
    if (stateData) {
        stateName = stateData.State;
        let newStateData = [];
        for (let i = 0; i < vis.aggrData.length; i++) {
            newStateData.push(+stateData[1978 + i]);
        }
        stateData = newStateData;
    }

    if (!stateData) {
        vis.y.domain([0, d3.max(vis.aggrData)]);
    } else {
        vis.y.domain([
            0,
            d3.max([d3.max(vis.aggrData), d3.max(stateData)])
        ]);
    }

    vis.svg.select(".map-line-y-axis")
        .transition()
        .duration(duration)
        .call(vis.yAxis);

    vis.circle
        .transition()
        .duration(duration)
        .attr("cx", vis.x(vis.parseDate(vis.year)))
        .attr("cy", vis.y(vis.aggrData[vis.year - 1978]));

    vis.hline
        .transition()
        .duration(duration)
        .attr("x1", 0)
        .attr("x2", vis.x(vis.parseDate(vis.year)))
        .attr("y1", vis.y(vis.aggrData[vis.year - 1978]))
        .attr("y2", vis.y(vis.aggrData[vis.year - 1978]));

    vis.vline
        .transition()
        .duration(duration)
        .attr("y1", vis.height)
        .attr("y2", vis.y(vis.aggrData[vis.year - 1978]))
        .attr("x1", vis.x(vis.parseDate(vis.year)))
        .attr("x2", vis.x(vis.parseDate(vis.year)));

    let line = d3.line()
        .x(function(d, i) {
            return vis.x(vis.parseDate(1978 + i));
        })
        .y(function(d) {
            return vis.y(d)
        });

    vis.usPath
        .transition()
        .duration(duration)
        .attr("d", line);

    if (stateData) {
        vis.statePath
            .datum(stateData)
            .transition()
            .duration(duration)
            .style("stroke-opacity", 1)
            .attr("d", line);

        vis.svg.select(".legend-state-label")
            .text(stateName)
            .transition()
            .duration(duration)
            .style("fill-opacity", 1);

        vis.svg.select(".legend-state")
            .transition()
            .duration(duration)
            .style("stroke-opacity", 1);
    } else {
        vis.statePath
            .transition()
            .duration(duration)
            .style("stroke-opacity", 0);

        vis.svg.select(".legend-state-label")
            .transition()
            .duration(duration)
            .style("fill-opacity", 0);

        vis.svg.select(".legend-state")
            .transition()
            .duration(duration)
            .style("stroke-opacity", 0);
    }
};

MapLineVis.prototype.moveCircle = function(year) {
    // Update color based on year
    let vis = this;

    vis.year = year;
    vis.updateVis(null, 0);
};


