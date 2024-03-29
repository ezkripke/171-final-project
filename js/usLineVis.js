function USLineVis(parent, data, eventHandler) {
    let vis = this;

    vis.parent = d3.select(parent);
    vis.data = data;
    vis.eventHandler = eventHandler;

    vis.keys = [
        "Asian",
        "Black",
        "Latino",
        "White",
        "Other"
    ];

    vis.initVis();
}

USLineVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {"top": 30, "left": 50, "right": 100, "bottom": 60};

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
        .range(colors);

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

    vis.svg.append("text")
        .attr("class", "us-line-title")
        .attr("x", vis.width / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("US National Data");

    vis.wrangleData();
};

USLineVis.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

USLineVis.prototype.updateVis = function(stateData) {
    let vis = this;

    vis.makeLines("us-line");
    vis.makeLines("us-line-invis");

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

    lines = vis.svg.selectAll(".us-line-invis")
        .data(vis.keys);

    lines.enter()
        .merge(lines)
        .attr("pointer-events", "none");
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

    lines = vis.svg.selectAll(".us-line-invis")
        .data(vis.keys);

    lines.enter()
        .merge(lines)
        .attr("pointer-events", "all");
};

USLineVis.prototype.makeLines = function(type) {
    let vis = this;

    let lines = vis.svg.selectAll("line." + type)
        .data(vis.keys);

    let selection = lines.enter()
        .append("line")
        .attr("class", type)
        .attr("id", d => d + "-" + type)
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
        .style("stroke-opacity", function() {
            if (type === "us-line") {
                return 0.8;
            } else {
                return 0;
            }
        })
        .style("stroke-dasharray", function() {
            if (type === "us-line") {
                return "4 4";
            } else {
                return null;
            }
        });

        if (type === "us-line-invis") {
            selection.on("mouseover", function(k) {
                d3.select(this).style("stroke-opacity", 1);
                $(vis.eventHandler).trigger("USLineMouseOver", k);
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke-opacity", 0);
                $(vis.eventHandler).trigger("USLineMouseOut");
            });
        }
};