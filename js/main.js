queue()
    .defer(d3.csv, "data/us_tile_grid.csv")
    .defer(d3.csv, "data/incarceration_trends_clean.csv")
    .defer(d3.csv, "data/StatePrisonRateByYear.csv")
    .defer(d3.csv, "data/stateAbbrevs.csv")
    .defer(d3.json, "data/states-10m.json")
    .await(loadData);

function loadData(error, usTileGrid, incarcerationTrends, stateData, stateAbbrevs, stateJson) {
    usTileGrid = d3.nest()
        .key(d => d.state)
        .rollup(d => d[0])
        .object(usTileGrid);
    
    incarcerationTrends = d3.nest()
        .key(d => d.state)
        .rollup(function(d) {
            return d.map(function(e) {
                let new_e = {};
                for (let prop in e) {
                    if (prop === "state") {
                        continue;
                    } else if (!isNaN(+e[prop])) {
                        new_e[prop] = +e[prop];
                    } else {
                        new_e[prop] = e[prop];
                    }
                }
                return new_e
            });
        })
        .object(incarcerationTrends);

    let keys = [
        "pct_asian_total",
        "pct_white_total",
        "pct_black_total",
        "pct_other_total",
        "pct_latino_total",
        "pct_native_total"
    ];

    let tileGridData = [];
    for (let state in incarcerationTrends) {
        let filteredData = incarcerationTrends[state].filter(d => d.pct_imprisoned !== 0);
        let orderedKeys = keys.slice();
        let hasData = false;
        let pctImprisoned = null;
        let totalPrisonPop = -1;
        if (filteredData.length > 0) {
            hasData = true;
            filteredData = filteredData[filteredData.length - 1];
            orderedKeys.sort(function(a, b) {
                return filteredData[a] - filteredData[b];
            });
            pctImprisoned = filteredData.pct_imprisoned;
            totalPrisonPop = filteredData.total_prison_pop;
        }
        tileGridData.push({
            "state": state,
            "stateName": usTileGrid[state].stateName,
            "origValues": incarcerationTrends[state],
            "row": +usTileGrid[state].row,
            "col": +usTileGrid[state].col,
            "orderedKeys": orderedKeys,
            "hasData": hasData,
            "pctImprisoned": pctImprisoned,
            "totalPrisonPop": totalPrisonPop
        });
    }

    console.log(tileGridData);

    let tileGridVis = new TileGridVis("#small-mult-area", tileGridData);
    let bubbleVis = new BubbleVis("#bubble-area", incarcerationTrends);
    let mapVis = new MapVis("#map-chart", stateData, stateAbbrevs, stateJson);

    d3.select("#tile-grid-btn")
        .on("mousedown", function() {
            let btn = d3.select(this);
            if (btn.text() === "Sort by Prison Population") {
                btn.text("View as Map");
                tileGridVis.onButtonPress("prisonPop");
            } else {
                btn.text("Sort by Prison Population");
                tileGridVis.onButtonPress("geo");
            }
        })
}