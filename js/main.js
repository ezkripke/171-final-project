queue()
    .defer(d3.csv, "data/us_tile_grid.csv")
    .defer(d3.csv, "data/prison_population.csv")
    .await(loadData);

function loadData(error, usTileGrid, prisonPop) {
    let tileInfo = {};

    usTileGrid.forEach(function(d) {
        tileInfo[d.state] = {};
        tileInfo[d.state].name = d.stateName;
        tileInfo[d.state].row = +d.row;
        tileInfo[d.state].col = +d.col;
    });

    let prisonPopByState = d3.nest()
        .key(function(d) {
            d.year = +d.year;
            d.population = +d.population;
            if (isNaN(d.population)) {
                d.population = 0;
            }
            d.prison_population = +d.prison_population;
            if (isNaN(d.prison_population)) {
                d.prison_population = 0;
            }
            return d.state;
        })
        .key(d => d.year)
        .rollup(function(countyData) {
            let stateData = {};
            stateData.year = countyData[0].year;
            stateData.population = countyData.reduce((total, d) => total + d.population, 0);
            stateData.prison_population = countyData.reduce((total, d) => total + d.prison_population, 0);
            if (stateData.population == 0 || stateData.prison_population == 0) {
                stateData.pctImprisoned = 0;
            } else {
                stateData.pctImprisoned = stateData.prison_population / stateData.population;
            }
            return stateData;
        })
        .object(prisonPop);

    let tileGridData = [];
    for (let state in prisonPopByState) {
        prisonPopByState[state] = {
            "values": Object.values(prisonPopByState[state]),
            "row": tileInfo[state].row,
            "col": tileInfo[state].col,
            "name": tileInfo[state].name,
            "state": state
        };
        tileGridData.push(prisonPopByState[state]);
    }
    console.log(tileGridData);
    let tileGridVis = new TileGridVis("#small-mult-area", tileGridData);
}