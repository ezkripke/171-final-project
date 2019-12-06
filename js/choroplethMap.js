// // With guidance from https://observablehq.com/@d3/state-choropleth
/**
 * Choropleth Map
 * @param _parentElement 	-- the HTML element in which to draw the map vis
 */
MapVis = function(_parentElement, _data, _abbrevData, _stateJson, _eventHandler) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.abbrevData = _abbrevData;
    this.stateJson = _stateJson;
    this.year = "1998";
    this.eventHandler = _eventHandler;

    this.initVis();
};

MapVis.prototype.initVis = function() {
    let vis = this;
    //console.log(vis.parentElement);
    // create SVG drawing area
    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    vis.width =  1000 - vis.margin.left - vis.margin.right;
    vis.height = 650 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Init projections
    vis.projection = d3.geoAlbersUsa()
                .translate([vis.width / 2.3, vis.height / 1.85]) // translate to center of screen
                .scale([800]); // scale things down so see entire US

    // Create d3 geo path
    vis.path = d3.geoPath()
                .projection(vis.projection);

    // Filter data so it only contains prison rate
    vis.filteredData = vis.data.filter(function(d) {
        return (d["Prison/Jail Rate"] == "Prison Rate");
    });

    // Initialize tooltip
    // http://bl.ocks.org/lwhitaker3/e8090246a20d9515789b
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(d => vis.getInfo(d));
    vis.svg.call(vis.tip);

    // Index data by state abbreviation
    vis.abToName = {};
    var prisonRates = [];
    //console.log("abbrev data", vis.abbrevData);
        for (var i = 0; i < vis.abbrevData.length; i++) {
            //console.log("abbrevs[i", abbrevs[i]);
            var currState = vis.abbrevData[i];
            vis.abToName[currState.Code] = currState.State;
            vis.abToName[currState.State] = currState.Code;
        };

        //console.log("abtoname2", this.abToName);
        vis.indexedData = {};
        vis.filteredData.forEach(function(d) {
            //console.log(d);
            var currState = d.State;
            var abbrev = vis.abToName[currState];
            vis.indexedData[abbrev] = d;
        });
        console.log("indexed data", vis.indexedData);

        // Initialize color scale
        // Put all number vals into an array
        vis.filteredData.forEach(function (d) {
            //console.log("d", d);
            for (var i = 0; i < 37; i++) {
                var year = (1978 + i).toString();
                //console.log("year", year);
                //console.log("+d[i]", d[year]);
                if (!isNaN(+d[year])) {
                    //console.log("+d[i] 2", +d[year]);
                    prisonRates.push(+d[year]);
                }
            }
        });
        //console.log("prisonRates", prisonRates);
        var maxVal = d3.max(prisonRates);
        console.log("max val", maxVal);

        vis.color = d3.scaleQuantize()
            .domain([0.0, (maxVal - 512)])
            .range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']);

        // Convert topojson format
        // Help from https://bl.ocks.org/mbostock/4090848
            vis.usStates = topojson.feature(vis.stateJson, vis.stateJson.objects.states).features;
            //console.log("usStates", vis.usStates);

            // Draw path
            vis.myPath = vis.svg
                .selectAll("path")
                .data(vis.usStates)
                .enter()
                .append("path")
                .attr("d", vis.path)
                .attr("fill", d => vis.updateColor(d))
                .on('mouseover', vis.tip.show)
                .on('mouseout', vis.tip.hide);
                // .on("mouseover", function(d) {
                //     vis.tooltip.html("hello" + "<br>")
                //         .style("left", (d3.event.pageX) + "px")
                //         .style("top", (d3.event.pageY - 28) + "px")
                // })
                // .on("mouseout", vis.tooltip.style("opacity", 0));

            vis.svg.append("path")
                .attr("class", "state-borders")
                .attr("d", vis.path(vis.usStates, function (a, b) {
                    return a !== b;
                }));

    // Initialize slider
    // Adapted from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
    // More info at https://github.com/johnwalley/d3-simple-slider
    var dataTime = d3.range(0, 19).map(function(d) {
        return new Date(1978 + (d*2), 10, 3);
    });

    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(800)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(1998, 10, 3))
        .on('onchange', function(val) {
            vis.year = val.getFullYear().toString();
            //console.log("val", year);
            //d3.select('#value-scale').text(val.getFullYear().toString());

            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.eventHandler).trigger("selectionChanged", val.getFullYear().toString());

            vis.updateVis();
        });

    // Append label for year
    vis.yearLabel = vis.svg.append("text")
        .attr("fill", "white")
        .attr("x", vis.width/2)
        .attr("y", 110)
        .attr("font-size", 20)
        .attr("font-weight", "bold")
        .text("1998");
    // 4. Bind event handler
    // when 'selectionChanged' is triggered, specified function is called
    $(vis.eventHandler).bind("selectionChanged", function(event, year){
       // vis.selectionChanged(year);
        //vis.zoomFunction()
        vis.yearLabel.text(year);
    });

    var gTime = vis.svg
        .append('g')
        .attr('transform', 'translate(80,30)');

    // Initialize legend
    // Adapted from https://stackoverflow.com/questions/21838013/d3-choropleth-map-with-legend
    vis.legend = vis.svg.selectAll('rect')
        .data(vis.color.range().reverse());

    vis.legend.enter()
        .append('rect')
        .attr("x", 10)
        .attr("y", function(d, i) {
            return i * 18 + 150;
        })
        .attr("width", 18)
        .attr("height", 18)
        .style("stroke", "white")
        .style("stroke-width", 1)
        .style("fill", function(d){return d;});

    // Append legend labels
    vis.myLabels = vis.svg.selectAll('text.legendLabels')
        .data(vis.color.range().reverse())
        .enter()
        .append('text')
        .attr("x", 35) //leave 5 pixel space after the <rect>
        .attr("y", function(d, i) {
            return i * 19 + 150;
        })
        .attr("font-size", 10)
        .attr("dy", "0.9em") //place text one line *below* the x,y point
        .attr("fill", "white")
        .text(function(d,i) {
            var extent = vis.color.invertExtent(d);
            //extent will be a two-element array, format it however you want:
            var format = d3.format("0.0f");
            //console.log("extent", extent);
            //console.log("format extent", format(extent[0]));
            return format(extent[0]) + " - " + format(extent[1]);
        });

    // Append legend title
    vis.legendTitle = vis.svg
        .append("text")
        .attr("x", 1)
        .attr("y", 125)
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text("People incarcerated");

    // Append legend title 2
    vis.legendTitle2 = vis.svg
        .append("text")
        .attr("x", 1)
        .attr("y", 140)
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text("(per 100,000)");


    gTime.call(sliderTime);

    vis.wrangleData();
};

MapVis.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

MapVis.prototype.updateVis = function() {
    // Update color based on year
    let vis = this;
    //console.log("vis.year", vis.year);

    vis.myPath.attr("fill", d => vis.updateColor(d));

};

MapVis.prototype.updateColor = function(d) {
    let vis = this;
    //console.log(d);
        //console.log("d", d);
        // //console.log(prisonData)
        var stateName = d.properties.name;
        var stateCode = vis.abToName[stateName];
        var stateData = vis.indexedData[stateCode];
        //console.log("stateData", stateData);
        if (stateData) {
            var prisonPop = +stateData[vis.year];
            if (prisonPop) {
                //console.log("prisonpop", stateName, prisonPop);
                //console.log("color", vis.color(prisonPop));
                return vis.color(prisonPop);
            } else {
                return "#ccc"
            }
        } else {
            //console.log("else");
            return "#ccc";
        }
};

MapVis.prototype.getInfo = function(d) {
    let vis = this;

    var stateName = d.properties.name;
    var stateCode = vis.abToName[stateName];
    var stateData = vis.indexedData[stateCode];
    //console.log("stateData", stateData);
    if (stateData) {
        var prisonPop = +stateData[vis.year];
        if (prisonPop) {
            //console.log("prisonpop", stateName, prisonPop);
            //console.log("color", vis.color(prisonPop));
            return stateCode + " Proportion Incarcerated:" + "<br>" + prisonPop + "/ 100,000";
        } else {
            return "N/A"
        }
    } else {
        //console.log("else");
        return "N/A";
    }
};

MapVis.prototype.selectionChanged = function(year){
    console.log("year", year)
};