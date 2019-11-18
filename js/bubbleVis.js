/**
 * BubbleVis
 * @param _parentElement 	-- the HTML element in which to draw the bubble vis
 * @param _data			    -- the dataset incarceration_trends_clean.csv
 */
BubbleVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.initVis();
};

//
BubbleVis.prototype.initVis = function() {
    let vis = this;

    // create SVG drawing area
    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    vis.width =  $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TODO: init scales

    vis.wrangleData();
};

BubbleVis.prototype.wrangleData = function() {
    let vis = this;

    //TODO

    vis.updateVis();
};

BubbleVis.prototype.updateVis = function() {
    let vis = this;

    //TODO
};