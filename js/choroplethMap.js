// With guidance from https://observablehq.com/@d3/state-choropleth

// --> CREATE SVG DRAWING AREA
var width = 1000,
    height = 1000;

var mapSvg = d3.select("#map-chart").append("svg")
    .attr("width", width)
    .attr("height", height);

// Initialize projection
// Create Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2]) // translate to center of screen
    .scale([1000]); // scale things down so see entire US

// Create d3 geo path
var path = d3.geoPath()
    .projection(projection);

// Load data
queue()
    //.defer(d3.json, "data/states-10m.json")
    .defer(d3.json, "data/states-10m.json")
    .defer(d3.csv, "data/incarceration_trends_clean.csv")
    .defer(d3.csv, "data/stateAbbrevs.csv")
    .defer(d3.csv, "data/prison_population.csv")
    .await(function(error, statesJson, prisonData, abbrevs, prisonPop){

        // --> PROCESS DATA
        //console.log("hello test");
        console.log("states json", statesJson);
        console.log("prison data", prisonData);
        //console.log("abbrevs", abbrevs);
        console.log("prison pop", prisonPop);

        // Build dictionary of state abbrev to state name
        var abToName = {};
        for (var i = 0; i < abbrevs.length; i++){
            //console.log("abbrevs[i", abbrevs[i]);
            var currState = abbrevs[i];
            abToName[currState.Code] = currState.State;
            abToName[currState.State] = currState.Code;
        };
        //console.log("abToName", abToName);

        // Build dictionary of state abbrev: data in prisonDict
        var prisonDataDict = {};
        prisonData.forEach(function(d) {
            prisonDataDict[d.state] = d;
        });
        //console.log("prisondatadict", prisonDataDict);

        // Build dict of state abbrev: data in prisonPop
        var prisonPopDict = {};
        prisonPop.forEach(function(d) {
            prisonPopDict[d.state] = d;
        });


        // Initialize color scale
        // Note - adapted from d3 textbook
        var maxVal = d3.max(prisonPop, function(d) {
            if (d.prison_population) {
                return +d.prison_population;
            }
        });
        console.log("max val", maxVal);
        var color = d3.scaleQuantize()
            .domain([0.0, maxVal])
            .range(["rgb(237,248,233)", "rgb(186,228,179)",
                "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);

        // Convert topojson format
        // Help from https://bl.ocks.org/mbostock/4090848
        var usStates = topojson.feature(statesJson, statesJson.objects.states).features;
        console.log("usStates", usStates);
        // Draw path
        mapSvg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(usStates)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function(d) {
                //console.log("d", d);
                //console.log(prisonData)
                var stateName = d.properties.name;
                var stateCode = abToName[stateName];
                var stateData = prisonPopDict[stateCode];
                //console.log("stateData", stateData);
                if (stateData) {
                    var prisonPop = +stateData.prison_population;
                    if (prisonPop) {
                        console.log("color", color(prisonPop));
                        return color(prisonPop);
                    }
                    else {
                        return "#ccc"
                    }
                    //console.log("col",color((+stateData.pct_imprisoned * 10000)));
                }
                else {
                    //console.log("else");
                    return "#ccc";
                }
            });

        mapSvg.append("path")
            .attr("class", "state-borders")
            .attr("d", path(usStates, function(a, b) {
                return a !== b;
            }));
/*
        // Filter Global data for countries in africa
        malariaData = malariaDataCsv.filter(function(d) {
            // Remove Algeria and South Sudan from array (they are outliers)
            return (d.WHO_region == "African" && d.Country != "Algeria" && d.Country != "South Sudan")
        });
        var africanCountries = topojson.feature(statesJson, mapTopJson.objects.collection).features;

        console.log(africanCountries);

        // Transform types of malaria data
        malariaData.forEach(function(d) {
            d.UN_Population = +d.UN_Population;
            d.At_risk = +d.At_risk;
            d.At_high_risk = +d.At_high_risk;
            d.Suspected_malaria_cases = +d.Suspected_malaria_cases;
            d.Malaria_cases = +d.Malaria_cases;
        });
        console.log(malariaData);


        // Map country data to array
        for (var i = 0; i < malariaData.length; i++){
            var currData = malariaData[i];
            countryDataById[currData.Code] = currData
        }


        // Render the map of Africa by using the path generator
        // Start by visualizing the data field ‘UN population’ on the choropleth
        myPath = mapSvg.selectAll("path")
            .data(africanCountries).enter()
            .append("path")
            .attr("d", path)
            .on("mouseover",function(d,i){
                //d3.select(this).attr("fill","grey").attr("stroke-width",2);
                //return tooltip.style("hidden", false).html(d.name)
                //console.log(getLabel(d));
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .95);
                tooltip.html(getLabel(d))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .style("fill", function(d) {
                if (countryDataById[d.properties.adm0_a3_is]) {
                    return color(updateColor(d, input))
                }
                else {
                    return "#ccc"
                }
            });

        // myPath.exit().remove();

        // Create legend - adapted from https://stackoverflow.com/questions/21838013/d3-choropleth-map-with-legend
        myLegend = mapSvg.selectAll('rect')
            .data(color.range().reverse());

        //console.log("color.range().reverse()", color.domain().reverse());

        myLegend.enter()
            .append('rect')
            .attr("x", width - 230)
            .attr("y", function(d, i) {
                return i * 15 + 15;
            })
            .attr("width", 18)
            .attr("height", 18)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", function(d){return d;});
        //the data objects are the fill colors


        myLabels = mapSvg.selectAll('text')
            .data(color.range().reverse())
            .enter()
            .append('text')
            .attr("x", width - 235) //leave 5 pixel space after the <rect>
            .attr("y", function(d, i) {
                return i * 15 + 19;
            })
            .attr("font-size", 10)
            .attr("dy", "0.8em") //place text one line *below* the x,y point
            .text(function(d,i) {
                var extent = color.invertExtent(d);
                //console.log("extent", extent);
                //extent will be a two-element array, format it however you want:
                //var format = d3.format("0.2f");
                return extent[0];
            });

        myLegend.exit().remove();
        // myLabels.exit().remove();


        // Update choropleth
        updateChoropleth();
    });


function updateChoropleth() {

    // --> Choropleth implementation
    // Get value from user
    var inputValue = d3.select("#input-type").property("value");
    input = d3.select("#input-type").property("value");
    console.log("inputval", inputValue);

    // Update domain of color scale
    var color = d3.scaleQuantize()
        .domain([d3.min(malariaData, x => x[inputValue]), d3.max(malariaData, x => x[inputValue])])
        .range(["rgb(237,248,233)", "rgb(186,228,179)",
            "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);

    // call update color
    myPath.enter()
        .append("path")
        .attr("d", path)
        .merge(myPath)
        .style("fill", function(d) {
            if (countryDataById[d.properties.adm0_a3_is]) {
                return color(updateColor(d, inputValue))
            }
            else {
                return "#ccc"
            }
        })
        .on("mouseover",function(d){
            //console.log(getLabel(d));
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(getLabel(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    myPath.exit().remove();


    // Update legend labels
    myLabels.data(color.range().reverse())
        .enter()
        .append('text')
        .merge(myLabels)
        .transition()
        .duration(300)
        .attr("x", width - 210) //leave 5 pixel space after the <rect>
        .attr("y", function(d, i) {
            return i * 15 + 19;
        })
        .attr("dy", "0.8em") //place text one line *below* the x,y point
        .text(function(d,i) {
            var extent = color.invertExtent(d);
            console.log("extent", extent);
            //extent will be a two-element array, format it however you want:

            if (inputValue == "At_risk" || inputValue == "At_high_risk") {
                return extent[0] + "% - " + extent[1] + "%";
            }
            else {
                var format = d3.format("0.0f");
                return format(extent[0]) + "-" + format(extent[1]);
            }
        });

    //myLabels.exit().remove();

 */

    });
    /*
function updateColor(d, input) {
    //Get data value
    var code = d.properties.adm0_a3_is;
    //console.log(d);
    //console.log(code);
    if (countryDataById[code]) {
        //If value exists... return color(value);
        //console.log("countryDataById[code]", countryDataById[code]);
        var value = countryDataById[code][input];
        //console.log("unpop", value);
        return value
    }
    else{
        //If value is undefined... return "#ccc";
        return "#ccc"
    }
}

function getLabel(d) {
    //Get data value
    var code = d.properties.adm0_a3_is;

    if (countryDataById[code]) {
        //If value exists...
        var value = countryDataById[code][input];
        var country = countryDataById[code]["Country"];
        //console.log("unpop", value);
        if (input == "At_risk" || input == "At_high_risk") {
            return country + "<br>" + input + ": " + value + "%";
        }
        else {
            return country + "<br>" + input + ": " + value;
        }
    }
    else{
        //If value is undefined... return "#ccc";
        return input + ": undefined";
    }

}

     */