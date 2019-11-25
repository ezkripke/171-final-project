let colors = [
    "#37C200",
    "#7A07E6",
    "#E0C200",
    "#CC0701",
    "#00C7C0"
];

queue()
    .defer(d3.csv, "data/us_tile_grid.csv")
    .defer(d3.csv, "data/race_ethnicity_gender_2010.csv")
    .await(loadData);

function loadData(error, usTileGrid, raceData) {
    usTileGrid = d3.nest()
        .key(d => d.state)
        .rollup(d => d[0])
        .object(usTileGrid);

    raceData.forEach(function(d) {
        for (let prop in d) {
            let tmp = +(d[prop].replace(/,/g, ''));
            if (!isNaN(tmp)) {
                d[prop] = tmp;
            }
        }
        if (d.GEOID !== "US") {
            d.row = +usTileGrid[d.GEOID].row;
            d.col = +usTileGrid[d.GEOID].col;
        }
    });

    let USData = raceData[0];
    raceData = raceData.slice(1, raceData.length);

    console.log(raceData);

    let eventHandler = {};

    let tileGridVis = new TileGridVis("#small-mult-area", raceData, eventHandler);
    let usLineVis = new USLineVis("#us-line-area", USData, eventHandler);

    $(eventHandler).bind("tileMouseOver", function(e, stateData) {
         usLineVis.onTileMouseOver(stateData);
    });
    $(eventHandler).bind("tileMouseOut", function() {
        usLineVis.onTileMouseOut();
    });

    $(eventHandler).bind("USLineMouseOver", function(e, race) {
        tileGridVis.onUSLineMouseOver(race);
    });
    $(eventHandler).bind("USLineMouseOut", function() {
        tileGridVis.onUSLineMouseOut();
    });
}