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

MapVis.prototype.initVis = function() {
    let vis = this;

    // Aggregate data by year
    console.log("data", vis.data);
};