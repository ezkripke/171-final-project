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
                            console.log("color", vis.color(prisonPop));
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
    vis.wrangleData();
};

MapVis.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

MapVis.prototype.updateVis = function() {
    // Update color based on year


};
//
// // --> CREATE SVG DRAWING AREA
// var width = 1000,
//     height = 1000;
//
// var mapSvg = d3.select("#map-chart").append("svg")
//     .attr("width", width)
//     .attr("height", height);
//
// // Initialize projection
// // Create Projection
// var projection = d3.geoAlbersUsa()
//     .translate([width / 2, height / 2]) // translate to center of screen
//     .scale([1000]); // scale things down so see entire US
//
// // Create d3 geo path
// var path = d3.geoPath()
//     .projection(projection);
//
// // Load data
// queue()
//     //.defer(d3.json, "data/states-10m.json")
//     .defer(d3.json, "data/states-10m.json")
//     .defer(d3.csv, "data/incarceration_trends_clean.csv")
//     .defer(d3.csv, "data/stateAbbrevs.csv")
//     .defer(d3.csv, "data/prison_population.csv")
//     .await(function(error, statesJson, prisonData, abbrevs, prisonPop) {
//
//         // --> PROCESS DATA
//         //console.log("hello test");
//         console.log("states json", statesJson);
//         console.log("prison data", prisonData);
//         //console.log("abbrevs", abbrevs);
//         console.log("prison pop", prisonPop);
//
//         // Build dictionary of state abbrev to state name
//         var abToName = {};
//         for (var i = 0; i < abbrevs.length; i++) {
//             //console.log("abbrevs[i", abbrevs[i]);
//             var currState = abbrevs[i];
//             abToName[currState.Code] = currState.State;
//             abToName[currState.State] = currState.Code;
//         }
//         ;
//         //console.log("abToName", abToName);
//
//         // Build dictionary of state abbrev: data in prisonDict
//         var prisonDataDict = {};
//         prisonData.forEach(function (d) {
//             prisonDataDict[d.state] = d;
//         });
//         //console.log("prisondatadict", prisonDataDict);
//
//         // Build dict of state abbrev: data in prisonPop
//         var prisonPopDict = {};
//         prisonPop.forEach(function (d) {
//             prisonPopDict[d.state] = d;
//         });
//
//
//         // Initialize color scale
//         // Note - adapted from d3 textbook
//         var maxVal = d3.max(prisonPop, function (d) {
//             if (d.prison_population) {
//                 return +d.prison_population;
//             }
//         });
//         console.log("max val", maxVal);
//         var color = d3.scaleQuantize()
//             .domain([0.0, maxVal])
//             .range(["rgb(237,248,233)", "rgb(186,228,179)",
//                 "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
//
//         // Convert topojson format
//         // Help from https://bl.ocks.org/mbostock/4090848
//         var usStates = topojson.feature(statesJson, statesJson.objects.states).features;
//         console.log("usStates", usStates);
//         // Draw path
//         mapSvg.append("g")
//             .attr("class", "states")
//             .selectAll("path")
//             .data(usStates)
//             .enter()
//             .append("path")
//             .attr("d", path)
//             .attr("fill", function (d) {
//                 //console.log("d", d);
//                 //console.log(prisonData)
//                 var stateName = d.properties.name;
//                 var stateCode = abToName[stateName];
//                 var stateData = prisonPopDict[stateCode];
//                 //console.log("stateData", stateData);
//                 if (stateData) {
//                     var prisonPop = +stateData.prison_population;
//                     if (prisonPop) {
//                         console.log("color", color(prisonPop));
//                         return color(prisonPop);
//                     } else {
//                         return "#ccc"
//                     }
//                     //console.log("col",color((+stateData.pct_imprisoned * 10000)));
//                 } else {
//                     //console.log("else");
//                     return "#ccc";
//                 }
//             });
//
//         mapSvg.append("path")
//             .attr("class", "state-borders")
//             .attr("d", path(usStates, function (a, b) {
//                 return a !== b;
//             }));
//     });