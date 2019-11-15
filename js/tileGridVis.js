function TileGridVis(parent, data) {
    let vis = this;

    vis.parent = d3.select(parent);
    vis.data = data;

    vis.tiles = [];

    vis.initVis();
}

TileGridVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {"top": 50, "left": 50, "right": 50, "bottom": 50}

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 800 - vis.margin.top - vis.margin.bottom;

    vis.svg = vis.parent.append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.right + ")");

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

    vis.tileX = d3.scaleLinear()
        .domain([1970, 2015])
        .range([0, vis.x.bandwidth()]);
    vis.tileY = d3.scaleLinear()
        .domain([
            0,
            d3.max(vis.data, function(d) {
                return d3.max(d.origValues, y => y.pct_imprisoned);
            })
        ])
        .range([vis.y.bandwidth(), 0]);
    vis.tileC = d3.scaleOrdinal()
        .domain([
            "pct_asian_total",
            "pct_white_total",
            "pct_black_total",
            "pct_other_total",
            "pct_latino_total",
            "pct_native_total"
        ])
        .range(d3.schemeCategory10.slice(0, 6));

    vis.wrangleData();
};

TileGridVis.prototype.wrangleData = function() {
    let vis = this;

    let stack = d3.stack()
        .keys([
            "pct_asian_total",
            "pct_white_total",
            "pct_black_total",
            "pct_other_total",
            "pct_latino_total",
            "pct_native_total"
        ])
        .order(d3.stackOrderAscending);

    vis.data.forEach(function(stateData) {
        stateData.values = stack(stateData.origValues);
    });

    vis.updateVis();
};

TileGridVis.prototype.updateVis = function() {
    let vis = this;

    let states = vis.svg.selectAll("g.state")
        .data(vis.data, d => d.state);

    states.enter()
        .append("g")
        .attr("class", "state")
        .attr("id", d => d.state)
        .attr("transform", function(d) {
            return "translate(" + vis.x(d.col) + "," + vis.y(d.row) + ")";
        });

    if (vis.tiles.length === 0) {
        vis.data.forEach(function(d) {
            vis.tiles.push(
                new Tile(
                    "g.state#" + d.state,
                    d,
                    vis.tileX,
                    vis.tileY,
                    vis.tileC
                )
            );
        });
    }
};

function Tile(parent, data, x, y, c) {
    let vis = this;

    vis.parent = d3.select(parent);
    vis.data = data;
    vis.x = x;
    vis.y = y;
    vis.c = c;
    vis.width = vis.x.range()[1];
    vis.height = vis.y.range()[0];

    vis.initVis();
}

Tile.prototype.initVis = function() {
    let vis = this;

    vis.parent.append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("fill", "#eeeeee");

    vis.parent.append("text")
        .text(vis.data.state)
        .style("font-size", "10px")
        .attr("text-anchor", "start")
        .attr("x", 5)
        .attr("y", 10);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickSize(0)
        .ticks(0);
    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickSize(0)
        .ticks(0);

    vis.parent.append("g")
        .attr("class", "axis tile-x-axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);
    vis.parent.append("g")
        .attr("class", "axis tile-y-axis")
        .call(vis.yAxis);

    vis.area = d3.area()
        .x0(d => vis.x(d.data.year))
        .x1(d => vis.x(d.data.year))
        .y0(d => vis.y(d[0]))
        .y1(d => vis.y(d[1]))
        .defined(d => d[0] !== d[1]);

    vis.wrangleData();
};

Tile.prototype.wrangleData = function() {
    let vis = this;

    vis.updateVis();
};

Tile.prototype.updateVis = function() {
    let vis = this;

    vis.parent.selectAll("path.area")
        .data(vis.data.values)
        .enter()
        .append("path")
        .attr("class", "area")
        .attr("d", vis.area)
        .style("fill", d => vis.c(d.key));
};



