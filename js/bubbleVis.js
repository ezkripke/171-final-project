/**
 * BubbleVis
 * @param _parentElement 	-- html element in which to draw bubble vis
 * @param _data
 */
BubbleVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.nodes = [];
    this.races = ["Asian", "Black", "Latino", "Other", "White"];
    this.initVis();
};

BubbleVis.prototype.initVis = function() {
    let vis = this;
    console.log("BubbleVis::initVis");

    vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };
    vis.width = $(vis.parentElement).width()-(vis.margin.left+vis.margin.right);
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(${vis.margin.left}, ${vis.margin.top})");

    vis.color = d3.scaleOrdinal()
        .domain(vis.races)
        .range(d3.schemeSet1.slice(0, 5));

    vis.legend = d3.legendColor()
        .labels(vis.keys)
        .scale(vis.color);

    vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(100, 150)")
        .style("font-size", "13px");

    vis.svg.select(".legend")
        .call(vis.legend);

    let stateIDs = vis.data.map(d=>d.GEOID);
    let s = "";
    stateIDs.forEach(function(d) {
        s += `<option value="${d}">${d}</option>`
    });
    document.getElementById("bubble-choice").innerHTML = s;

    vis.wrangleData();
};


BubbleVis.prototype.wrangleData = function() {
    let vis = this;
    console.log("BubbleVis::wrangleData");
    console.log(vis);

    vis.selected = d3.select("#bubble-choice").property("value");
    vis.nodes = [];
    vis.state = vis.data.filter(e => e['GEOID'] === vis.selected)[0];

    vis.races.forEach(function(r){
        let numBubbles = Math.round(vis.state[r+'Rate']/100);
        d3.range(0, numBubbles).forEach(_ => vis.nodes.push({race:r}));
    });

    vis.updateVis();
};


BubbleVis.prototype.updateVis = function() {
    let vis = this;

    vis.force = d3.forceSimulation(vis.nodes)
        .force('charge', d3.forceManyBody().strength(-2))
        .force('center', d3.forceCenter(vis.width / 1.5, vis.height / 1.75));

    vis.bubbles = vis.svg.selectAll(".node")
        .data(vis.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .style("stroke-width", 1)
        .style("stroke", "black")
        .style("fill", d => vis.color(d.race));

    vis.force.on("tick", function() {
        vis.bubbles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
};