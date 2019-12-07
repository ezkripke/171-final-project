// We copied the tile layout from the following site:
// http://datavizcatalogue.com/blog/chart-combinations-tile-grid-maps/

function TileGridVis(parent, data, eventHandler) {
    let vis = this;

    vis.parent = d3.select(parent);
    vis.data = data;
    vis.data.sort((a, b) => b.TotalPrison - a.TotalPrison);
    vis.eventHandler = eventHandler;

    vis.displayMode = "geo";

    vis.tiles = [];

    vis.initVis();
}

TileGridVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {"top": 0, "left": 0, "right": 0, "bottom": 0};

    let width = vis.parent.node().getBoundingClientRect().width;
    let height = 8 / 11 * width;

    vis.width = width - vis.margin.left - vis.margin.right;
    vis.height = height - vis.margin.top - vis.margin.bottom;

    vis.svg = vis.parent.append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleBand()
        .domain(d3.range(
            d3.min(vis.data, d => d.col),
            d3.max(vis.data, d => d.col) + 1
        ))
        .range([0, vis.width])
        .paddingInner(0.1);
    vis.y = d3.scaleBand()
        .domain(d3.range(
            d3.min(vis.data, d => d.row),
            d3.max(vis.data, d => d.row) + 1
        ))
        .range([0, vis.height])
        .paddingInner(0.1);

    vis.tileX = d3.scaleOrdinal()
        .domain(["Total", "Prison"])
        .range([5, vis.x.bandwidth() - 5]);
    vis.tileY = d3.scaleLinear()
        .domain([0, 1])
        .range([vis.y.bandwidth() - 5, 5]);
    vis.tileC = d3.scaleOrdinal()
        .domain([
            "Latino",
            "White",
            "Black",
            "Asian",
            "Other"
        ])
        .range(d3.schemeCategory10.slice(0, 5));

    vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (vis.width - 100) + "," + (vis.height - 150) + ")")
        .style("font-size", "13px");

    let legend = d3.legendColor()
        .labels(vis.keys)
        .scale(vis.tileC);

    vis.svg.select(".legend")
        .call(legend);

    vis.wrangleData();
};

TileGridVis.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

TileGridVis.prototype.updateVis = function(race) {
    let vis = this;

    let states = vis.svg.selectAll("g.state")
        .data(vis.data, d => d.GEOID);

    states.enter()
        .append("g")
        .attr("class", "state")
        .attr("id", d => d.GEOID)
        .attr("transform", function(d) {
            return "translate(" + vis.x(d.col) + "," + vis.y(d.row) + ")";
        })
        .merge(states)
        .transition()
        .duration(1000)
        .attr("transform", function(d, i) {
            let col = d.col;
            let row = d.row;
            if (vis.displayMode === "prisonPop") {
                col = i % 11;
                row = Math.floor(i / 11);
            }
            return "translate(" + vis.x(col) + "," + vis.y(row) + ")";
        });

    if (vis.tiles.length === 0) {
        vis.data.forEach(function(d) {
            vis.tiles.push(
                new Tile(
                    "g.state#" + d.GEOID,
                    d,
                    vis.tileX,
                    vis.tileY,
                    vis.tileC,
                    vis.eventHandler
                )
            );
        });
    } else {
        vis.tiles.forEach(function (t) {
            t.updateVis(race);
        });
    }
};

TileGridVis.prototype.onUSLineMouseOver = function(race) {
    this.updateVis(race);
};

TileGridVis.prototype.onUSLineMouseOut = function() {
    this.updateVis();
};

function Tile(parent, data, x, y, c, eventHandler) {
    let vis = this;

    vis.parent = d3.select(parent);
    vis.data = data;
    vis.eventHandler = eventHandler;
    vis.x = x;
    vis.y = y;
    vis.c = c;
    vis.width = vis.x.range()[1] + 5;
    vis.height = vis.y.range()[0] + 5;

    vis.keys = [
        "Latino",
        "White",
        "Black",
        "Asian",
        "Other"
    ];

    vis.initVis();
}

Tile.prototype.initVis = function() {
    let vis = this;

    vis.parent.append("rect")
        .attr("class", "tile")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .style("fill-opacity", 0.15)
        .attr("stroke", "black")
        .attr("fill", function() {
            let maxRaceNum = -1;
            let maxRaceKey = null;
            vis.keys.forEach(function(k) {
                let trueK = k + "TotalPrison";
                if (vis.data[trueK] > maxRaceNum) {
                    maxRaceNum = vis.data[trueK];
                    maxRaceKey = k;
                }
            });
            return vis.c(maxRaceKey);
        })
        .on("mouseover", function() {
            $(vis.eventHandler).trigger("tileMouseOver", vis.data);
            d3.select(this).style("fill-opacity", 0.3);
        })
        .on("mouseout", function() {
            $(vis.eventHandler).trigger("tileMouseOut");
            d3.select(this).style("fill-opacity", 0.15);
        });

    vis.wrangleData();
};

Tile.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

Tile.prototype.updateVis = function(race) {
    let vis = this;

    let lines = vis.parent.selectAll("line.tile-line")
        .data(vis.keys);

    lines.enter()
        .append("line")
        .attr("class", "tile-line")
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
        .style("fill", "none")
        .merge(lines)
        .style("stroke-opacity", function(k) {
            if (race) {
                if (k === race) {
                    return 1;
                } else {
                    return 0.2;
                }
            } else {
                return 0.8;
            }
        });

    if (vis.parent.selectAll("text").empty()) {
        vis.parent.append("text")
            .text(vis.data.GEOID)
            .style("font-size", "10px")
            .attr("text-anchor", "start")
            .attr("x", 5)
            .attr("y", 10);
    }
};

Tile.prototype.highlightLine = function(id) {
    let vis = this;

    let lines = vis.parent.selectAll(".tile-line")
        .data(vis.keys);

    lines.enter()
        .merge(lines)
        .transition()
        .duration(1000)
        .style("stroke-opacity", function(d) {
            if (d === id) {
                return 1;
            } else {
                return 0.2
            }
        });
};

Tile.prototype.unhighlightLine = function() {
    let vis = this;

    let lines = vis.parent.selectAll(".tile-line")
        .data(vis.keys);

    lines.enter()
        .merge(lines)
        .transition()
        .duration(1000)
        .style("stroke-opacity", 0.8);
};

