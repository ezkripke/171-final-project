let colors = [
    "#37C200",
    "#7A07E6",
    "#00C7C0",
    "#CC0701",
    "#E0C200"
];

let guideSelector = "#guide";

queue()
    .defer(d3.csv, "data/us_tile_grid.csv")
    .defer(d3.csv, "data/race_ethnicity_gender_2010.csv")
    .defer(d3.csv, "data/StatePrisonRateByYear.csv")
    .defer(d3.csv, "data/stateAbbrevs.csv")
    .defer(d3.json, "data/states-10m.json")
    .await(loadData);

function loadData(error, usTileGrid, raceData, stateData, stateAbbrevs, stateJson) {
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

    let eventHandler = {};

    let tileGridVis = new TileGridVis("#small-mult-area", raceData, eventHandler);

    let usLineVis = new USLineVis("#us-line-area", USData, eventHandler);

    let bubbleVis = new BubbleVis("#bubble-area", raceData);

    let mapVis = new MapVis("#map-chart", stateData, stateAbbrevs, stateJson, eventHandler);

    let mapLineVis = new MapLineVis("#map-line-area", stateData, eventHandler);

    setUpTileGridWalkthrough(usLineVis, tileGridVis);

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

    $(eventHandler).bind("selectionChanged", function(event, year){
        mapLineVis.moveCircle(year);
    });
}

function setUpTileGridWalkthrough(usLineVis, tileGridVis) {
    let wt = new Walkthrough(
        "tile-grid-walkthrough",
        "#tile-grid-row",
        "right",
        null,
        "Begin Guide"
    );

    wt.addStep({
        "placement": ["#tile-grid-row", "right"],
        "text": "The line chart to the left shows " +
            "<i>nation-wide</i> data. The left axis " +
            "shows the percentage of the US population " +
            "made up by a given race, and the right axis " +
            "shows the percentage of the total US incarcerated " +
            "population made up by a given race.",
        "buttonText": "Continue",
        "moveTo": "#tile-grid-row",
        "lock": true,
        "animate": true
    });

    wt.addStep({
        "placement": ["#tile-grid-row", "left"],
        "text": "Each tile to the right corresponds to a state. Within " +
            "each tile is the same kind of line chart showing data for that " +
            "specific state. The background color for each tile corresponds to the " +
            "most incarcerated population in that state.",
        "buttonText": "Continue",
        "lock": true,
        "animate": true
    });

    wt.addStep({
        "placement": ["#tile-grid-row", "left"],
        "text": "Hover over a state to compare its data to the " +
            "nation-wide statistics.",
        "buttonText": "Continue",
        "lock": true,
        "animate": true
    });

    wt.addStep({
        "placement": ["#tile-grid-row", "right"],
        "text": "Hover over a line to highlight that race across every state.",
        "buttonText": "Continue",
        "lock": true,
        "animate": true
    });

    wt.addStep({
        "placement": ["#tile-grid-row", "right"],
        "text": "While white people make up about 65% of " +
            "the US population, they make up only 40% of the " +
            "incarcerated population. Note that in <i>every</i> state, " +
            "white people are incarcerated at disproportionately low rates.",
        "buttonText": "Continue",
        "lock": true,
        "animate": true,
        "preFunc": function() {
            usLineVis.highlightLine("White");
            tileGridVis.tiles.forEach(t => t.highlightLine("White"));
        },
        "postFunc": function() {
            usLineVis.unhighlightLine();
            tileGridVis.tiles.forEach(t => t.unhighlightLine());
        }
    });

    wt.addStep({
        "placement": ["#tile-grid-row", "right"],
        "text": "Meanwhile, while black people make up about 12% of the " +
            "US population, they make up approximately 40% of the incarcerated " +
            "population. Note that in <i>every</i> state, black people are " +
            "incarcerated at disproportionately high rates.",
        "buttonText": "Explore",
        "lock": true,
        "animate": true,
        "preFunc": function() {
            usLineVis.highlightLine("Black");
            tileGridVis.tiles.forEach(t => t.highlightLine("Black"));
        },
        "postFunc": function() {
            usLineVis.unhighlightLine();
            tileGridVis.tiles.forEach(t => t.unhighlightLine());
        }
    });
}