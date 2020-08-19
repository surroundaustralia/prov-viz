function modalStar(){
    // select modal and set settings
    document.getElementById("modalContent").innerHTML = "";
    var modal = document.getElementById("myModal")
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    }

    // create data structure for modal graph
    propertiesNodes = []
    propertiesLinks = []
    includeProperty = ["ID", "prov_class", "targetLinks", "sourceLinks"]
    propertiesNodes.push({propertyType: 'source', Name: currentNode.Name, node: currentNode})
    for(const property in currentNode){
        if (includeProperty.includes(property)) {
            if ("targetLinks" == `${property}`) {
                for (i=0; i < currentNode[property].length; i++){
                    propertiesNode = {propertyType: `${property}`, Name: currentNode[property][i].source.Name, node: currentNode[property][i].source}
                    propertiesNodes.push(propertiesNode)
                    propertiesLink = {target: currentNode.Name , source: currentNode[property][i].source.Name, linkType: "derived from"}
                    propertiesLinks.push(propertiesLink)
                    
                }

            } else if ("sourceLinks" == `${property}`) {
                for (i=0; i < currentNode[property].length; i++){
                    propertiesNode = {propertyType: `${property}`, Name: currentNode[property][i].target.Name, node: currentNode[property][i].target}
                    propertiesNodes.push(propertiesNode)
                    propertiesLink = {target: currentNode.Name , source: currentNode[property][i].target.Name, linkType: "derives to"}
                    propertiesLinks.push(propertiesLink)
                }
            } else{
                propertiesNode = {propertyType: `${property}`, Name: `${currentNode[property]}`}
                propertiesNodes.push(propertiesNode)
                propertiesLink = {target: currentNode.Name , source: `${currentNode[property]}`, linkType: "property"}
                propertiesLinks.push(propertiesLink)
            }

        }
    }

    // create graph
    var marginTree = {
        top: 100,
        right: 200,
        bottom: 50,
        left: 90
    },
    width = 1400 - marginTree.left - marginTree.right,
    height = 600 - marginTree.top - marginTree.bottom;

    var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.Name; }))
    .force("charge", d3.forceManyBody().strength(-20))
    .force('collision', d3.forceCollide().radius(function(d){return 60}))
    .force("center", d3.forceCenter(width / 2, height / 2));

    var svgTree = d3.select("#modalContent").append("svg")
    .attr("width", width + marginTree.left + marginTree.right)
    .attr("height", height + marginTree.top + marginTree.bottom),
    gTree = svgTree.append("g")
    .attr("transform",
        "translate(" + marginTree.left + "," + marginTree.top + ")");

    //arrow head marker 
    // build the arrow.
    svgTree.append("svgTree:defs").selectAll("marker")
    .data(["start"]) // Different link/path types can be defined here
    .enter().append("svgStar:marker") // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", 0)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto-start-reverse")
    .append("svgTree:path")
    .attr("d", "M0,-5L10,0L0,5");

    //set links
    var link = svgTree.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(propertiesLinks)
    .enter().append("line")
    .attr("stroke-width", "1")

    //filter links for derived from
    link.filter(function(d){
        return d.linkType == "derived from"
    })
    .attr("marker-end", "url(#start)");

    //filter links for derives too
    link.filter(function(d){
        return d.linkType == "derives to"
    })
    .attr("marker-start", "url(#start)");

    //append nodes
    var node = svgTree.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(propertiesNodes)
    .enter().append("g")

    // add shapes for nodes
    var circles = node.append("circle")
    .attr("r", 15)
    .style('fill', function(d){
        if((d.propertyType == "source") 
        || (d.propertyType == "sourceLinks") 
        || (d.propertyType == "targetLinks")){
            return d.node.color
        }
        return "black"
    })
    .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // add floating text with node name
    var lables = node.append("text")
        .text(function(d) {
            return d.Name;
        })
        .attr('x', 6)
        .attr('y', -15);

    //adds mouseover title
    node.append("title")
        .text(function(d) { return d.Name; });

    
    simulation
        .nodes(propertiesNodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(propertiesLinks);


    // create legend
    svgTree.append("text")
        .attr("x", 1400 - marginTree.right - 250)
        .attr("y", 50)
        .text("Legend")
        .style("font-size", "30px")


    var propertyNodeSet = new Set();
    for (x in propertiesNodes){
        // if either a source link, source, or target link, then must be a node
        if((propertiesNodes[x].propertyType == "source") 
        || (propertiesNodes[x].propertyType == "sourceLinks") 
        || (propertiesNodes[x].propertyType == "targetLinks")){
            propertyNodeSet.add(propertiesNodes[x].node.prov_class)
        }
    }

    var index = 0;
    // uses arraynodes from diagramKeyDiv.js
    for (x in arrayNodes){
        if (propertyNodeSet.has(arrayNodes[x].name)){
            console.log(arrayNodes[x])
            drawCircle(arrayNodes[x].name, arrayNodes[x].node_color, index)
            index++;
        }
    }
    drawCircle("Property", "black", index)




    // helper functions for force diagram
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

    //drawing functions
    function drawCircle(name, color, index) {

        svgTree.append("circle")
            .attr("cx", 1400 - marginTree.right - 250)
            .attr("cy", 100 + 70*index)
            .attr("r", 15)
            .attr("id", "linkLegend")
            .style("fill", color)
            .style("stroke", "black")
    
        svgTree.append("text")
            .attr("x", 1400 - marginTree.right - 230)
            .attr("y", 100 + 70*index)
            .text(name)
            .attr("id", "linkLegend")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")
    
    }


}