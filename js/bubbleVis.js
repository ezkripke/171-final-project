/**
 * BubbleVis
 * @param _parentElement 	-- html element in which to draw bubble vis
 * @param _data
 */
BubbleVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.races = ["Asian", "Black", "Latino", "White", "Other"];
    this.wrangleData();
};

BubbleVis.prototype.wrangleData = function() {
    let vis = this;
    vis.highestRate = 0;
    vis.lowestRate = 1;

    // compute [r]Rate ∀(r ∈ this.races), add to new state entry
    vis.data = vis.data.map(function(state) {
        let newEntry = {
            Name: state.Geography,
            geo_ID: state.GEOID,
            row: state.row,
            col: state.col,
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
        let rates = vis.races.map(r => newEntry[r+'Rate']);
        let max = d3.max(rates);
        let min = d3.min(rates);
        if (vis.highestRate < d3.max(rates)) vis.highestRate = max;
        if (vis.lowestRate > d3.min(rates)) vis.lowestRate = min;

        return newEntry;
    });
    vis.initVis();
};

BubbleVis.prototype.initVis = function() {
    let vis = this;

    // define drawing area
    vis.margin = { top: 40, right: 100, bottom: 10, left: 40 };
    vis.width = $(vis.parentElement).width()-(vis.margin.left+vis.margin.right);
    vis.height = 650 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

    // init scales
    vis.radius = d3.scaleSqrt()
        // .domain([vis.lowestRate, vis.highestRate])
        .domain([0, vis.highestRate])
        .range([0, 40]);

    vis.x = d3.scaleBand()
        .domain(d3.range(
            d3.min(vis.data, d => d.col),
            d3.max(vis.data, d => d.col) + 1
        ))
        .range([0, vis.width])
        .paddingInner(0.05);

    vis.y = d3.scaleBand()
        .domain(d3.range(
            d3.min(vis.data, d => d.row),
            d3.max(vis.data, d => d.row) + 1
        ))
        .range([0, vis.height])
        .paddingInner(0.5);

    vis.color = d3.scaleOrdinal()
        .domain(vis.races)
        .range(colors);

    vis.totalPopScale = d3.scaleLog()
        .range([vis.height, 0]);

    vis.incarceratedPopScale = d3.scaleLinear()
        .range([0, vis.width]);

    // init choice marker
    vis.svg
        .append("rect")
        .attr("class", "choice-marker")
        .attr("width", "45")
        .attr("height", "2")
        .attr("x", 900.5)
        .attr("y", 125)
        .style("fill", "white");

    // select race option
    vis.svg.selectAll("text.bubble-race-choice")
        .data(vis.races, d=>d)
        .enter()
        .append("text")
        .attr("class", (_,i) => `bubble-race-choice, choice-${i}`)
        .attr("text-anchor", "middle")
        .attr("x", vis.width + 55)
        .attr("y", (_,i) => (vis.height/15)*i)
        .style("fill", "white")
        .text(d => d)
        .on("mouseover", function() {
            d3.select(this)
                .style("fill", "yellow")
                .style("cursor", "pointer");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("fill", "white")
        })
        .on("click", function(d,i){
            vis.selectedRace = d;
            console.log(vis.width + 32.5, (vis.height/15)*i + 5);
            vis.svg.select(".choice-marker")
                .transition().duration(400)
                .attr("x", vis.width + 32.5)
                .attr("y", (vis.height/15)*i + 5);
            vis.updateVis();
        });

    // legend
    vis.svg.append("g")
        .attr("class", "legendSize")
        .attr("transform", `translate(${vis.width-15}, 270)`)
        .style("stroke", "white")
        .style("stroke-width", "1px");

    vis.legendSize = d3.legendSize()
        .scale(vis.radius)
        .shape('circle')
        .cells([.005, .01, .02, .04, .08])
        .shapePadding(30)
        .labelOffset(20)
        .labelFormat(".1%");

    vis.svg.select(".legendSize")
        .call(vis.legendSize);

    vis.selectedRace = "White";
    vis.updateVis();
};

BubbleVis.prototype.updateVis = function() {
    let vis = this;

    // update scales for rosling-chart view
    vis.totalPopScale.domain([0, d3.max(vis.data, d => d[vis.selectedRace+'Pop'])]);
    vis.incarceratedPopScale.domain([0, d3.max(vis.data, d => d[vis.selectedRace+'Prison'])]);

    // tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(d => `<h5>${d.Name}</h5>1 in ${Math.round(1/d[vis.selectedRace+'Rate'])} ${vis.selectedRace} people are incarcerated`);

    vis.svg.call(vis.tip);

    vis.bubbles = vis.svg.selectAll(".bubble")
        .data(vis.data, d => d.geo_ID);

    vis.bubbles
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => vis.x(d.col))
        .attr("cy", d => vis.y(d.row))
        .attr("r", 1e-6)
        .on("mouseover", function(d) {
            vis.tip.show(d);
            d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
            vis.tip.hide(d);
        })
        .merge(vis.bubbles)
        .transition().duration(1000)
        .attr("r", d => vis.radius(d[vis.selectedRace+'Rate']))
        .style("fill", vis.color(vis.selectedRace));

    vis.labels = vis.svg.selectAll(".state-id")
        .data(vis.data);

    vis.labels
        .enter()
        .append("text")
        .attr("class", "state-id")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("x", vis.width/2)
        .attr("y", vis.height/2)
        .on("mouseover", function(d) {
            vis.tip.show(d);
            d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", vis.tip.hide)
        .merge(vis.labels)
        .transition().duration(1000)
        .attr("x", d => vis.x(d.col))
        .attr("y", d => vis.y(d.row) + vis.radius(d[vis.selectedRace+'Rate'])+13)
        .style("fill", "white")
        .text(d => d.geo_ID);

};