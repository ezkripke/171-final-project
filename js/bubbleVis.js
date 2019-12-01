/**
 * BubbleVis
 * @param _parentElement 	-- html element in which to draw bubble vis
 * @param _data
 */
BubbleVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.races = ["Asian", "Black", "Latino", "Other", "White"];
    this.wrangleData();
};

BubbleVis.prototype.wrangleData = function() {
    let vis = this;

    // compute [r]Rate ∀(r ∈ this.races), add to new state entry
    vis.data = vis.data.map(function(state) {
        let newEntry = {
            Name: state.Geography,
            geo_ID: state.GEOID,
            AsianPop: state.AsianTotal,
            AsianPrison: state.AsianTotalPrison,
            AsianRate: state.AsianTotalPrison / state.AsianTotal,
            BlackPop: state.BlackTotal,
            BlackPrison: state.BlackTotalPrison,
            BlackRate: state.BlackTotalPrison / state.BlackTotal,
            LatinoPop: state.LatinoTotal,
            LatinoPrison: state.LatinoTotalPrison,
            LatinoRate: state.LatinoTotalPrison / state.LatinoTotal,
            WhitePop: state.WhiteTotal,
            WhitePrison: state.WhiteTotalPrison,
            WhiteRate: state.WhiteTotalPrison / state.WhiteTotal,
            OtherPop: state.OtherTotal,
            OtherPrison: state.OtherTotalPrison,
            OtherRate: state.OtherTotalPrison / state.OtherTotal
        };
        let rates = vis.races.map(r => {return {race:r, rate:newEntry[r+'Rate']}});
        let highest = rates.filter(r => r.rate === d3.max(rates, r=>r.rate))[0];
        newEntry.HighestRateRace = highest.race;
        newEntry.HighestRate = highest.rate;

        return newEntry;
    });
    vis.initVis();
};

BubbleVis.prototype.initVis = function() {
    let vis = this;

    // define drawing area
    vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };
    vis.width = $(vis.parentElement).width()-(vis.margin.left+vis.margin.right);
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(${vis.margin.left}, ${vis.margin.top})");

    // init scales
    vis.r = d3.scaleSqrt()
        .domain(d3.extent(vis.data, d => d.HighestRate))
        .range([10, 75]);

    vis.color = d3.scaleOrdinal()
        .domain(vis.races)
        .range(colors);

    // add legend using d3-legend lib
    vis.legend = d3.legendColor()
        .labels(vis.keys)
        .scale(vis.color);
    vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(100,150)")
        .style("font-size", "13px")
        .style("fill", "white");
    vis.svg.select(".legend")
        .call(vis.legend);

    vis.updateVis();
};

BubbleVis.prototype.updateVis = function() {
    let vis = this;

    vis.force = d3.forceSimulation(vis.data)
        .force("x", d3.forceX(vis.width/1.75).strength(0.05))
        .force("y", d3.forceY(vis.height/1.6).strength(0.05))
        .force("c", d3.forceCollide(d => vis.r(d.HighestRate) + 1));

    vis.bubbles = vis.svg.selectAll(".bubble")
        .data(vis.data, d=> d.geo_ID)
        .enter()
        .append("circle")
            .attr("class", "bubble")
            .attr("r", d => vis.r(d.HighestRate))
            .style("stroke", "white")
            .style("fill", d => vis.color(d.HighestRateRace));

    vis.bubbles.append("title").text(d=>d.Name);

    vis.force.on("tick", _ => vis.bubbles.attr("cx", d=>d.x).attr("cy", d=>d.y))
};