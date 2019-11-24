/**
 * BubbleVis
 * @param _parentElement 	-- the HTML element in which to draw the bubble vis
 * @param _data			    -- the dataset incarceration_trends_clean.csv
 */
BubbleVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
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

    const sum = (lst => lst.reduce(((a,b) => a+b),0));

    console.log(vis.data);
    vis.data = d3.nest()
        .key(d => d.state)
        // .rollup(v => )
        .entries(vis.data);
    console.log(vis.data);

    // scales & force directed initialization stuff

    vis.wrangleData();
};


BubbleVis.prototype.wrangleData = function() {
    let vis = this;
    console.log("BubbleVis::wrangleData");
    // console.log(vis.data);
    let selected = "TX"; // TODO: form for state selection



    vis.updateVis();
};


BubbleVis.prototype.updateVis = function() {
    let vis = this;
    console.log("BubbleVis::updateVis");

    //TODO
};