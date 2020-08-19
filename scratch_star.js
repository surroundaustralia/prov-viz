var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1250 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

var svgStarContainer = d3.select("#starDiv")

var svgStar = svgStarContainer.append("svg")
    // .classed("svg-content-responsive", true)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("font", "20px times")
    .append("g")
    // .attr("transform",
    //     "translate(" + margin.left + "," + margin.top + ")")

var colorStarNode = d3.scaleOrdinal(d3.schemeCategory20);

// color scale
displayTypes = JSON.parse(readJSON("data/graph_viz_styles.json"))
var array = Object.keys(displayTypes.Display_types_nodes).map(function(key) { return displayTypes.Display_types_nodes[key]; })
var colorLabelsStar = []
var colorsStar = []
for (x in array) {
    colorLabelsStar.push(array[x].name)
    colorsStar.push(array[x].node_color)
}

var colorStarNode = d3.scaleOrdinal()
    .domain(colorLabelsStar)
    .range(colorsStar)


// build the arrow.
svgStar.append("svgStar:defs").selectAll("marker")
    .data(["end"]) // Different link/path types can be defined here
    .enter().append("svgStar:marker") // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 19)
    .attr("refY", 0)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
    .append("svgStar:path")
    .attr("d", "M0,-5L10,0L0,5");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.ID; }))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

    var responseFromServer;
    // set ajax to run synchronously to ensure data is ready
    $.ajaxSetup({
        async: false
    });
    $.getJSON("https://data.surroundaustralia.com/gov-agencies.json", function(json){
        responseFromServer = json
    })
createForce(responseFromServer)
function createForce(responseFromServer){
    graph = responseFromServer
    var link = svgStar.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", "1")
        .attr("marker-end", "url(#end)");

    var node = svgStar.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")

    var circles = node.append("circle")
        .attr("r", 10)
        .style("fill", function(d) {
            str = d.prov_class;
            return d.color = colorStarNode(str);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); });

    var lables = node.append("text")
        .text(function(d) {
            return d.ID;
        })
        .attr('x', 6)
        .attr('y', 3);

    node.append("title")
        .text(function(d) { return d.ID; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }
};

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function readJSON(file) {
    var request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.send(null);
    if (request.status == 200)
        return request.responseText;
};