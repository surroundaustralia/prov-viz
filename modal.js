function modalData() {
    document.getElementById("modalContent").innerHTML = "";

    var modal = document.getElementById("myModal")

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    }

    children = []
    excludeProperty = ["x", "dx", "Name", "Function", "uri", "value"]
    includeProperty = ["ID", "prov_class", "targetLinks", "sourceLinks"]
    for (const property in currentNode) {
        if (includeProperty.includes(property)) {
            if ("targetLinks" == `${property}`) {
                for (const links in currentNode[property]) {
                    propertyChild = findChildNodesSource(currentNode, property, links)
                        // propertyChild = { name: `Derives from: ${currentNode[property][links].source.Name}`, node: currentNode[property][links].source }
                    children.push(propertyChild)
                }
            } else if ("sourceLinks" == `${property}`) {
                for (const links in currentNode[property]) {
                    propertyChild = findChildNodesTarget(currentNode, property, links)
                    children.push(propertyChild)
                }
            } else {
                propertyChild = { name: `${property}: ${currentNode[property]}`, childType: "property" }
                children.push(propertyChild)
            }
        }

    }

    currentNodeTree = { name: currentNode.Name, children: children, childType: "source", node: currentNode }
        // set the dimensions and marginTrees of the diagram
    var marginTree = {
            top: 100,
            right: 200,
            bottom: 50,
            left: 90
        },
        width = 1400 - marginTree.left - marginTree.right,
        height = 600 - marginTree.top - marginTree.bottom;

    // declares a tree layout and assigns the size
    var treemap = d3.tree()
        .size([height, width]); // width height for vertical tree, height width for horizontal

    //  assigns the data to a hierarchy using parent-child relationships
    var nodesTree = d3.hierarchy(currentNodeTree);

    // maps the node data to the tree layout
    nodesTree = treemap(nodesTree);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left marginTree
    var svgTree = d3.select("#modalContent").append("svg")
        .attr("width", width + marginTree.left + marginTree.right)
        .attr("height", height + marginTree.top + marginTree.bottom),
        gTree = svgTree.append("g")
        .attr("transform",
            "translate(" + marginTree.left + "," + marginTree.top + ")");

    // builds arrow


    // adds the links between the nodesTree
    var linkTree = gTree.selectAll(".link")
        .data(nodesTree
            .descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            // radial tree
            console.log(d)
            return "M" + project(d.x, d.y) +
                "C" + project(d.x, (d.y + d.parent.y) / 2) +
                " " + project(d.parent.x, (d.y + d.parent.y) / 2) +
                " " + project(d.parent.x, d.parent.y);
        })

    var markerTypes = [
        { id: 0, name: 'arrowStart', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10', refX: '13', orient: "auto-start-reverse", color: "red" },
        { id: 1, name: 'arrowEnd', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10', refX: '-13', orient: "auto", color: "blue" }
    ]

    svgTree.append("svgTree:defs").selectAll("marker")
        .data(markerTypes) // Different link/path types can be defined here
        .enter().append("svgTree:marker") // This section adds in the arrows
        .attr("id", function(d) { return 'marker_' + d.name })
        .attr("viewBox", function(d) { return d.viewbox })
        .attr("refX", function(d) { return d.refX })
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", function(d) { return d.orient })
        .append("svgTree:path")
        .attr("d", function(d) { return d.path })
        .attr('fill', function(d) { return d.color });




    // display setting of links
    console.log(linkTree);
    linkTree
        .filter(function(d) {
            return d.data.childType == "target"
        })
        .style("stroke", function(d) {
            return "red"

        })
        .style("stroke-opacity", 0.6)
        .attr("marker-start", "url(#marker_arrowStart)");


    linkTree
        .filter(function(d) {
            return d.data.childType == "source"
        })
        .style("stroke", function(d) {
            return "blue"

        })
        .style("stroke-opacity", 0.6)
        .attr("marker-start", "url(#marker_arrowEnd)")



    // adds each node as a group
    var node = gTree.selectAll(".node")
        .data(nodesTree
            .descendants())
        .enter().append("g")
        .attr("class", function(d) {
            return "node" +
                (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function(d) {
            return "translate(" + project(d.x, d.y) + ")";
            // return "translate(" + d.y + "," + d.x + ")";

        })
        .on("click", function(d) {
            name = d.data.name
            if (name.includes("Derives")) {
                currentNode = d.data.node;
                modalData();
            }
        });

    // adds the circle to the node
    node.append("circle")
        .attr("r", 10)
        .filter(function(d) {
            return d.data.childType != "property"
        })
        .style("fill", function(d) {
            return d.data.node.color

        })
        .style("stroke", "black")
        .style("stroke-opacity", 0.4)
        .style("stroke-width", 1);

    // adds the text to the node
    node.append("text")
        .attr("dy", "0.5em")
        .attr("y", function(d) {
            return d.children ? -20 : 20;
        })
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.name;
        })
        .filter(function(d) { return d.y > height / 2; })

    function project(x, y) {
        xOffset = 500;
        yOffset = 200;
        modalWidth = $("#myModal").width();

        var angle = (x - 90) / 180 * Math.PI,
            radius = y / 4.5;
        return [radius * Math.cos(angle) + modalWidth / 3, radius * Math.sin(angle) + yOffset];
    }

    function findChildNodesSource(currentNode, property, links) {
        childNode = currentNode[property][links].source;
        sourceNodes = []
        for (const property in childNode) {
            if ("targetLinks" == `${property}`) {
                for (const links in childNode[property]) {
                    sourceNodes.push({ name: `${childNode[property][links].source.Name}`, node: childNode[property][links].source, childType: "source" })
                }
            }
        }
        return { name: `${childNode.Name}`, node: childNode, children: sourceNodes, childType: "source" }
    }


    function findChildNodesTarget(currentNode, property, links) {
        childNode = currentNode[property][links].target;
        targetNodes = []
        for (const property in childNode) {
            if ("sourceLinks" == `${property}`) {
                for (const links in childNode[property]) {
                    targetNodes.push({ name: `${childNode[property][links].target.Name}`, node: childNode[property][links].target, childType: "target" })
                }
            }
        }

        return { name: `${childNode.Name}`, node: childNode, children: targetNodes, childType: "target" }
    }
}