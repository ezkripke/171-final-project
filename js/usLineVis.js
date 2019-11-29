function USLineVis(parent, data, eventHandler) {
    let vis = this;

    vis.parent = d3.select(parent);
    vis.data = data;
    vis.eventHandler = eventHandler;

    vis.keys = [
        "Latino",
        "White",
        "Black",
        "Asian",
        "Other"
    ];

    vis.initVis();
}

USLineVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {"top": 30, "left": 50, "right": 100, "bottom": 30};

    let width = vis.parent.node().getBoundingClientRect().width;
    let height = d3.select("#small-mult-area").node().getBoundingClientRect().height;

    vis.width = width - vis.margin.left - vis.margin.right;
    vis.height = height - vis.margin.top - vis.margin.bottom;

    vis.svg = vis.parent.append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleOrdinal()
        .domain(["Total", "Prison"])
        .range([0, vis.width]);
    vis.y = d3.scaleLinear()
        .domain([0, 1])
        .range([vis.height, 0]);
    vis.c = d3.scaleOrdinal()
        .domain(vis.keys)
        .range(d3.schemeCategory10.slice(0, 5));

    vis.leftAxis = vis.svg.append("g")
        .attr("class", "axis left-axis")
        .call(
            d3.axisLeft()
                .scale(vis.y)
                .tickFormat(d3.format(".0%"))
        );

    vis.svg.append("text")
        .attr("class", "left-axis-label")
        .attr("text-anchor", "middle")
        .text("Pct. of Total Pop.")
        .style("font-size", "13px")
        .attr("y", vis.height + 20);

    vis.rightAxis = vis.svg.append("g")
        .attr("class", "axis right-axis")
        .attr("transform", "translate(" + vis.width + ",0)")
        .call(
            d3.axisRight()
                .scale(vis.y)
                .tickFormat(d3.format(".0%"))
        );

    vis.svg.append("text")
        .attr("class", "right-axis-label")
        .attr("text-anchor", "middle")
        .text("Pct. of Incarcerated Pop.")
        .style("font-size", "13px")
        .attr("x", vis.width)
        .attr("y", vis.height + 20);

    vis.wrangleData();
};

USLineVis.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

USLineVis.prototype.updateVis = function(stateData) {
    let vis = this;

    let lines = vis.svg.selectAll("line.us-line")
        .data(vis.keys);

    lines.enter()
        .append("line")
        .attr("class", "us-line")
        .attr("id", d => d)
        .attr("x1", vis.x("Total"))
        .attr("x2", vis.x("Prison"))
        .attr("y1", function(k) {
            return vis.y(vis.data[k + "Total"] / vis.data["Total"]);
        })
        .attr("y2", function(k) {
            return vis.y(vis.data[k + "TotalPrison"] / vis.data["TotalPrison"]);
        })
        .style("stroke", k => vis.c(k))
        .style("stroke-width", 3)
        .style("stroke-opacity", 0.8)
        .style("stroke-dasharray", "4 4")
        .on("mouseover", function(k) {
            d3.select(this).style("stroke-dasharray", "none");
            $(vis.eventHandler).trigger("USLineMouseOver", k);
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke-dasharray", "4 4");
            $(vis.eventHandler).trigger("USLineMouseOut");
        });

    if (!stateData) {
        vis.svg.selectAll("line.state-line").remove();
    } else {
        vis.svg.selectAll("line.state-line")
            .data(vis.keys)
            .enter()
            .append("line")
            .attr("class", "state-line")
            .attr("x1", vis.x("Total"))
            .attr("x2", vis.x("Prison"))
            .attr("y1", function(k) {
                return vis.y(stateData[k + "Total"] / stateData["Total"]);
            })
            .attr("y2", function(k) {
                return vis.y(stateData[k + "TotalPrison"] / stateData["TotalPrison"]);
            })
            .style("stroke", k => vis.c(k))
            .style("stroke-width", 3)
            .style("stroke-opacity", 1)
            .style("fill", "none");
    }
};

USLineVis.prototype.onTileMouseOver = function(stateData) {
    this.updateVis(stateData);
};

USLineVis.prototype.onTileMouseOut = function() {
    this.updateVis();
};

USLineVis.prototype.highlightLine = function(id) {
    let vis = this;

    let lines = vis.svg.selectAll(".us-line")
        .data(vis.keys);

    lines.enter()
        .merge(lines)
        .transition()
        .duration(1000)
        .style("stroke-opacity", function(d) {
            if (d === id) {
                return 1;
            } else {
                return 0.2;
            }
        });
};

USLineVis.prototype.unhighlightLine = function(id) {
    let vis = this;

    let lines = vis.svg.selectAll(".us-line")
        .data(vis.keys);

    lines.enter()
        .merge(lines)
        .transition()
        .duration(1000)
        .style("stroke-opacity", 0.8);
};