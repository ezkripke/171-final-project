queue()
    .defer(d3.csv, "data/us_tile_grid.csv")
    .defer(d3.csv, "data/incarceration_trends_clean.csv")
    .defer(d3.csv, "data/prison_population.csv")
    .await(loadData);

function loadData(error, usTileGrid, incarcerationTrends, prisonPop) {
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

    let tileGridData = [];
    for (let state in incarcerationTrends) {
        tileGridData.push({
            "state": state,
            "stateName": usTileGrid[state].stateName,
            "origValues": incarcerationTrends[state],
            "row": +usTileGrid[state].row,
            "col": +usTileGrid[state].col,
            "party": usTileGrid[state].party
        });
    }

    console.log(tileGridData);

    let tileGridVis = new TileGridVis("#small-mult-area", tileGridData);
    let bubbleVis = new BubbleVis("#bubble-area", prisonPop);
}