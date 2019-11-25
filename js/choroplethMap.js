// // With guidance from https://observablehq.com/@d3/state-choropleth
/**
 * Choropleth Map
 * @param _parentElement 	-- the HTML element in which to draw the map vis
 * @param _data			    -- the dataset incarceration_trends_clean.csv
 */
MapVis = function(_parentElement, _data, _abbrevData, _stateJson) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.abbrevData = _abbrevData;
    this.stateJson = _stateJson;

    this.initVis();
};

MapVis.prototype.initVis = function() {
    let vis = this;
    //console.log(vis.parentElement);
    // create SVG drawing area
    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    vis.width =  1000 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Init projections
    vis.projection = d3.geoAlbersUsa()
                .translate([vis.width / 2, vis.height / 2]) // translate to center of screen
                .scale([1000]); // scale things down so see entire US

    // Create d3 geo path
    vis.path = d3.geoPath()
                .projection(vis.projection);

    // Filter data so it only contains prison rate
    vis.filteredData = vis.data.filter(function(d) {
        return (d["Prison/Jail Rate"] == "Prison Rate");
    });

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
        //console.log("abtoname", this.abToName);

        //console.log("abtoname2", this.abToName);
        vis.indexedData = {};
        vis.filteredData.forEach(function(d) {
            //console.log(d);
            var currState = d.State;
            var abbrev = vis.abToName[currState];
            vis.indexedData[abbrev] = d;
        });
        //console.log("indexed data", vis.indexedData);

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
        //console.log("max val", maxVal);

        vis.color = d3.scaleQuantize()
            .domain([0.0, maxVal])
            .range(["rgb(237,248,233)", "rgb(186,228,179)",
                "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);

        // Convert topojson format
        // Help from https://bl.ocks.org/mbostock/4090848
            vis.usStates = topojson.feature(vis.stateJson, vis.stateJson.objects.states).features;
            //console.log("usStates", vis.usStates);

            // Draw path
            vis.svg.append("g")
                .attr("class", "states")
                .selectAll("path")
                .data(vis.usStates)
                .enter()
                .append("path")
                .attr("d", vis.path)
                .attr("fill", function (d) {
                    //console.log("d", d);
                    // //console.log(prisonData)
                    var stateName = d.properties.name;
                    var stateCode = vis.abToName[stateName];
                    var stateData = vis.indexedData[stateCode];
                    //console.log("stateData", stateData);
                    if (stateData) {
                        var prisonPop = +stateData["2014"];
                        if (prisonPop) {
                            //console.log("color", vis.color(prisonPop));
                            return vis.color(prisonPop);
                        } else {
                            return "#ccc"
                        }
                    } else {
                        //console.log("else");
                        return "#ccc";
                    }
                });

            vis.svg.append("path")
                .attr("class", "state-borders")
                .attr("d", vis.path(vis.usStates, function (a, b) {
                    return a !== b;
                }));

    // initialize slider
    // Adapted from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
    var dataTime = d3.range(0, 10).map(function(d) {
        return new Date(1995 + d, 10, 3);
    });

    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(300)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(1998, 10, 3));

    var gTime = vis.svg
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);
    vis.wrangleData();
};

MapVis.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

MapVis.prototype.updateVis = function() {
    // Update color based on year


};