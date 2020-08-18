//canvas widths for key


displayTypes = JSON.parse(readJSON("data/graph_viz_styles.json"))
var arrayNodes = Object.keys(displayTypes.Display_types_nodes).map(function(key) { return displayTypes.Display_types_nodes[key]; })
var arrayLinks = Object.keys(displayTypes.Display_types_links).map(function(key) { return displayTypes.Display_types_links[key]; })
var dataUsed = JSON.parse(readJSON("data/gov-agencies.json"))
var keySVG = d3.select("#diagramKeySVG")

keySVG.append("text")
    .attr("x", 30)
    .attr("y", 20)
    .text("Legend")
    .style("font-size", "30px")
    .attr("alignment-baseline", "middle")

keySVG.append("text")
    .attr("x", 30)
    .attr("y", 60)
    .text("Nodes:")
    .style("font-size", "20px")
    .attr("alignment-baseline", 'middle')

keySVG.append("text")
    .attr("x", 30)
    .attr("y", 140)
    .text("Links:")
    .style("font-size", "20px")
    .attr("alignment-baseline", "middle")

var classNodeSet = new Set();
for (x in dataUsed.nodes) {
    classNodeSet.add(dataUsed.nodes[x].prov_class)
}

// create node legned
var index = 0;
for (x in arrayNodes) {
    if (classNodeSet.has(arrayNodes[x].name)) {
        drawRect(arrayNodes[x].name, arrayNodes[x].node_color, index);
        index++;
    }
}
// create legend links categories
index = 0;
for (x in arrayLinks) {
    drawCircle(arrayLinks[x].name, arrayLinks[x].link_color, index)
    index++;
}

var sankeyButton = document.getElementById("buttonSankey")
var starButton = document.getElementById("buttonStar")

sankeyButton.onclick = changeToSankey;
starButton.onclick = changeToStar;


// functions for button listens
function changeToSankey() {
    console.log("sankey")
    document.getElementById("sankeyDiv").style.visibility = "visible";
    document.getElementById("starDiv").style.visibility = "hidden";
    var linkLegend = document.getElementById("linkLegend");
    while (linkLegend != null) {
        linkLegend.remove()
        linkLegend = document.getElementById("linkLegend");
    }
    index = 0;
    for (x in arrayLinks) {
        drawCircle(arrayLinks[x].name, arrayLinks[x].link_color, index)
        index++;
    }
}

function changeToStar() {
    console.log("star")
    document.getElementById("starDiv").style.visibility = "visible";
    document.getElementById("sankeyDiv").style.visibility = "hidden";
    var linkLegend = document.getElementById("linkLegend");
    while (linkLegend != null) {
        linkLegend.remove()
        linkLegend = document.getElementById("linkLegend");
    }
    drawArrow();
}

// drawing functions
function drawCircle(name, color, index) {

    keySVG.append("circle")
        .attr("cx", 40 + index * 150)
        .attr("cy", 180)
        .attr("r", 15)
        .attr("id", "linkLegend")
        .style("fill", color)
        .style("stroke", "black")

    keySVG.append("text")
        .attr("x", 60 + index * 150)
        .attr("y", 180)
        .text(name)
        .attr("id", "linkLegend")
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")

}

function drawRect(name, color, index) {

    keySVG.append("rect")
        .attr("x", 40 + index * 150)
        .attr("y", 80)
        .attr("width", 15)
        .attr("height", 40)
        .style("fill", color)
        .style("stroke", "black")
    keySVG.append("text")
        .attr("x", 60 + index * 150)
        .attr("y", 100)
        .text(name)
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")
}

function drawArrow() {
    // build the arrow.
    keySVG.append("keySVG:defs").append("keySVG:marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr('refX', 0) //so that it comes towards the center.
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("keySVG:path")
        .attr("d", "M0,-5L10,0L0,5");

    keySVG.append("text")
        .attr("x", 30)
        .attr("y", 180)
        .text("Derived From")
        .attr("id", "linkLegend")
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")

    keySVG.append("line")
        .style("stroke", "black")
        .attr("x1", 135)
        .attr("y1", 180)
        .attr("x2", 200)
        .attr("y2", 180)
        .attr("id", "linkLegend")
        .attr("marker-end", "url(#arrow)")


    keySVG.append("text")
        .attr("x", 230)
        .attr("y", 180)
        .text("Derived To")
        .attr("id", "linkLegend")
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")
}




// read JSON
function readJSON(file) {
    var request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.send(null);
    if (request.status == 200)
        return request.responseText;
};