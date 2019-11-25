/**
 * BubbleVis
 * @param _parentElement 	-- the HTML element in which to draw the bubble vis
 * @param _data			    -- the dataset incarceration_trends_clean.csv
 */
BubbleVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.nodes = [];
    this.initVis();
};


BubbleVis.prototype.initVis = function() {
    let vis = this;
    console.log("BubbleVis::initVis");

    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    vis.width =  $(vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    let simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-20))
        .force('center', d3.forceCenter(vis.width / 2, vis.height / 2));

    vis.wrangleData();
};

// Creates Nodes from data
BubbleVis.prototype.wrangleData = function() {
    let vis = this;
    console.log("BubbleVis::wrangleData");
    let nodes = d3.range(0, 1000).map(_ => {});


    vis.data.forEach(function(o) {

    });

    vis.updateVis();
};


BubbleVis.prototype.updateVis = function() {
    let vis = this;

    // filter based on user selection

};