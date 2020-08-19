// Configs
linkHighlightedOpacity = 0.6;
linkNormalOpacity = 0.2;


// set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1400 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svgContainerSankey = d3.select("#sankeyDiv")

// append the svg object to the body of the page
var svgSankey = svgContainerSankey.append("svg")
    .classed("svg-content-responsive", true)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("font", "20px times")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

// Tooltip used on click
var clickToolTip = svgContainerSankey
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .on("click", function(d) {
        d3.select(this).style("visibility", "hidden")
    })

// Color scale used
displayTypes = JSON.parse(readJSON("data/graph_viz_styles.json"))
var array = Object.keys(displayTypes.Display_types_nodes).map(function(key) { return displayTypes.Display_types_nodes[key]; })
var colorLabelsSankey = []
var colorsSankey = []
for (x in array) {
    colorLabelsSankey.push(array[x].name)
    colorsSankey.push(array[x].node_color)
}

var colorSankeyNode = d3.scaleOrdinal()
    .domain(colorLabelsSankey)
    .range(colorsSankey)

var sankey = d3.sankey()
    .nodeWidth(24)
    .nodePadding(10)
    .size([width, height]);

// variable used for determining the currently clicked node
var currentNode = undefined;

var responseFromServer;
// set ajax to run synchronously to ensure data is ready
$.ajaxSetup({
    async: false
});
$.getJSON("https://data.surroundaustralia.com/gov-agencies.json", function(json){
    responseFromServer = json
})
// console.log(responseFromServer.readyState)
// load the data
// d3.json("data/gov-agencies.json", function(error, graph) { // THIS IS USED TO LOAD THE JSON FILE, NOT USED WHEN USING OBJECT AS THE SOURCE DATA
// d3.json(responseFromServer, function(error, graph) {
    // remap as per:https://stackoverflow.com/questions/14629853/json-representation-for-d3-force-directed-networks
    // this section allows the use of named tagets
    var nodeMap = {};
    graph = responseFromServer

    graph.nodes.forEach(function(x) { nodeMap[x.ID] = x; }); // change x.node to x.name if using names as targets
    graph.links = graph.links.map(function(x) {
        return {
            source: nodeMap[x.source],
            target: nodeMap[x.target],
            value: x.value
        };
    });

    // Constructs a new Sankey generator with the default settings.
    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(15); // iterations of improving map


    // reassign node x values
    // console.log(graph.nodes)
    // maxHeight = 0;
    // maxXPos = 0;
    // graph.nodes.forEach(node => {
    //     maxXPos = Math.max(maxXPos, node.x);
    //     maxHeight = Math.max(maxHeight, findNodeHeight(node))
    // })
    // graph.nodes.forEach(node => node.x = (findNodeHeight(node) / maxHeight * maxXPos))
    // add in the links
    // sankey.layout(10)

    var link = svgSankey.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .attr("id", function(d, i) {
            // assign each link an id, maybe a better way to do this
            d.id = i;
            return "link-" + i;
        })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    // Array of nodes clicked
    var nodesHighlighted = []
    var nodesClicked = []

    // add in the nodes
    var node = svgSankey.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", onclickNode)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function(d) { return d; })
            // .on("start", function() { this.parentNode.appendChild(this); }) // this line breaks click, not sure what the results of not including this is, but appears to work normally
            .on("drag", dragmove));


    // add the rectangles for the nodes
    node
        .append("rect")
        .attr("height", function(d) {
            if (d.dy < 0) {
                console.log(height)
            }
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
            str = d.prov_class;
            return d.color = colorSankeyNode(str);
        })
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        .on("mouseover", mouseoverNodeRect)
        .on("mouseout", mouseoutNodeRect)
        .append("title")
        .text(function(d) {
            return d.Name;
        })

    // add in the title for the nodes
    node
        .append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .style("font-size", "15px")
        .attr("transform", null)
        .text(function(d) {
            return d.Name;
        })
        .filter(function(d) { return d.x < width / 2; }) // gets all the left hand side
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start")

    node.select("text")
        .call(wrap, 100)
        // mouseover of node
    function mouseover(d) {
        d3.select(this).style("fill", "blue")
    }

    // mouseout of node
    function mouseout(d) {
        d3.select(this).style("fill", "black")
    }

    function onclickNode(d) {
        // changeHorizontal(d)
        // addClickImage(d)
        // highlightNodeLinks(d)
        currentNode = d;
        // modalData();
        modalStar();
        displayClickTooltip(d)
    }

    // mouseover of node rect function
    function mouseoverNodeRect(d) {
        d3.select(this).style("fill", "red")
    }

    // mouseout of node rect function
    function mouseoutNodeRect(d) {
        // console.log(colorSankeyNode(d.prov_class))
        d3.select(this).style("fill", function(d) { return d.color = colorSankeyNode(d.prov_class); })
    }

    // the function for moving the nodes
    function dragmove(d) {
        d3.select(this)
            .attr("transform",
                "translate(" +
                d.x + "," +
                // (d.y = d3.event.y) + // need to figure out why adding math max min functions breaks
                // ")");
                (d.y = Math.max(
                    0, Math.min(height - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", sankey.link());
    }

    function addClickImage(d) {
        if (nodesClicked.length) {
            svg.selectAll("image").remove();
            nodesClicked.splice(nodesClicked.indexOf(d), 1)
        }
        var icon1 = svg.append('image')
            .attr('xlink:href', 'resources/rocket-64x64.png')
            .attr('width', 20)
            .attr('height', 20)
            .attr('x', Math.max(d.x, 0))
            .attr('y', Math.max(d.y - 20, 0))
            .on("click", function(d) {
                d3.select(this).style("opacity", 0.5)
                link._groups[0].forEach(x => highlightLink(x.id.replace('link-', ''), linkNormalOpacity))
                nodesHighlighted = []
                svg.selectAll("image").remove();
            })
        nodesClicked.push(d)

    }

    function highlightNodeLinks(d) {
        if (nodesHighlighted.includes(d)) {
            sourceLinks = d.sourceLinks;
            sourceLinks.forEach(link => highlightLink(link.id, linkNormalOpacity));

            targetLinks = d.targetLinks;
            targetLinks.forEach(link => highlightLink(link.id, linkNormalOpacity));
            nodesHighlighted.splice(nodesHighlighted.indexOf(d), 1)
        } else {
            sourceLinks = d.sourceLinks;
            sourceLinks.forEach(link => highlightLink(link.id, linkHighlightedOpacity));

            targetLinks = d.targetLinks;
            targetLinks.forEach(link => highlightLink(link.id, linkHighlightedOpacity));
            nodesHighlighted.push(d)
        }
    }

    function highlightLink(id, nodeOpacity) {
        d3.select("#link-" + id).style("stroke-opacity", nodeOpacity)
    }

    function displayClickTooltip(d) {
        var functionsList = d.Function.split(", ")
        var toolTipText = "";
        functionsList.forEach(line => {
            toolTipText = toolTipText + "<a href=\"http://linked.data.gov.au/def/crs-th/\">" +
                line.toLowerCase().replace(/ /g, "-") +
                "</a><br />";
        })
        clickToolTip.style("visibility", "visible")
        clickToolTip.style("top", (d.y) + "px")
            .style("left", (d.x) + "px")
            .html("<a href=\"" +
                d.uri + "\">" +
                "<strong>" + d.Name + "</strong>" +
                "</a><br />" +
                "<a href=\javascript:clickThroughFunction()>Click Through Properties<br /></a>" +
                "<strong>Functions:</strong><br />" +
                toolTipText)

    }

// });  // THIS IS USED TO LOAD THE JSON FILE, NOT USED WHEN USING OBJECT AS THE SOURCE DATA


function changeHorizontal(d) {
    // console.clear();
    // findNodeSources(d)
    // console.log(findNodeHeight(d))
    // d.x = 100;
}

function findNodeSources(d) {
    d.targetLinks.forEach(targetLink => {
        findNodeSources(targetLink.source)
    })
}
// finds the height of a node (in this case the node position from the left)
function findNodeHeight(d) {
    // if no target link height = 1;
    height = 0;
    if (d.targetLinks.length == 0) {
        return height;
    } else {
        max = 0;
        d.targetLinks.forEach(targetLink => {
            max = Math.max(max, findNodeHeight(targetLink.source) + 1)
        })
    }
    return height = max;
}

function readJSON(file) {
    var request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.send(null);
    if (request.status == 200)
        return request.responseText;
};


function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy"))
        if (x < 0) {
            tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y - 20).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", -10).attr("y", y - 20).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        } else {
            tspan = text.text(null).append("tspan").attr("x", 30).attr("y", y - 20).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 30).attr("y", y - 20).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        }
    });
}
