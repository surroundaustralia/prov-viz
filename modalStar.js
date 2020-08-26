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
    height = 750 - marginTree.top - marginTree.bottom;

    var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.Name; }).distance(150).strength(1))
    .force("charge", d3.forceManyBody().strength(-100))
    .force('collision', d3.forceCollide().radius(function(d){return 30}))
    .force("center", d3.forceCenter(width / 2 - 150, height / 2 + 50));

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
    .attr("refX", 27)
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
    var circles = node.filter(function(d){
        return (d.propertyType == "sourceLinks") || (d.propertyType == "targetLinks")
    })
    .append("circle")
    .attr("r", 14)
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
        .on("end", dragended))
    .on("mouseenter", mouseoverProperties)
    .on("mouseleave", mouseoutPropeties);

    var sourceShape = node.filter(function(d){
        return (d.propertyType == "source")
    })
    .append("circle")
    .attr("r", 20)
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
        .on("end", dragended))
    .on("mouseover", mouseoverProperties)
    .on("mouseleave", mouseoutPropeties);

    var squareLength = 50
    var literalShapes = node.filter(function(d){
        return !((d.propertyType == "sourceLinks")||(d.propertyType == "targetLinks")||(d.propertyType == "source"))
    })
    .append("rect")
    .attr("width", squareLength)
    .attr("height", squareLength)
    .attr("fill", "lightgrey")
    .attr("transform", "translate(" + (-squareLength/2) + "," + (-squareLength/2) + ")")
    .style("stroke", "black")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

    // add floating text with node name
    var lables = node.append("text")
        .filter(function(d){
            return ((d.propertyType == "source") 
        || (d.propertyType == "sourceLinks") 
        || (d.propertyType == "targetLinks"))
        })
        .text(function(d) {
            return d.Name;
        })
        .attr('x', 16)
        .attr('y', -15);

        var lablesLiteral = node.append("text")
        .filter(function(d){
            return !((d.propertyType == "source") 
        || (d.propertyType == "sourceLinks") 
        || (d.propertyType == "targetLinks"))
        })
        .text(function(d) {
            return d.Name;
        })
        .attr('x', -squareLength/2 + 5)
        .attr('y', 0);

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
            drawCircle(arrayNodes[x].name, arrayNodes[x].node_color, index)
            index++;
        }
    }
    drawRect("Literal", "lightgrey", index)
    index++;
    drawArrow()


    // helper functions for force diagram
    function mouseoverProperties(d){
        svgTree.selectAll("image").remove();
        var icon1 = svgTree.append('image')
        .attr('xlink:href', 'resources/focus.png')
        .attr('width', 15)
        .attr('height', 15)
        .attr('x', Math.max(d.x-20, 0))
        .attr('y', function(){
            if (d.propertyType == "source"){
                return  Math.max(d.y-45, 0)
            }
            return  Math.max(d.y-35, 0)
        })
        .on("click",function(){
            currentNode = d.node
            modalStar()
        })

        var icon2 = svgTree.append('image')
        .attr('xlink:href', 'resources/expand.png')
        .attr('width', 15)
        .attr('height', 15)
        .attr('x', Math.max(d.x, 0))
        .attr('y', function(){
            if (d.propertyType == "source"){
                return  Math.max(d.y-45, 0)
            }
            return  Math.max(d.y-35, 0)
        })
    }

    function mouseoutPropeties(d){
    }

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
        svgTree.selectAll("image").remove();

        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
        
    function dragged(d) {
        svgTree.selectAll("image").remove();

        d.fx = d3.event.x;
        d.fy = d3.event.y;
        }
        
    function dragended(d) {
        svgTree.selectAll("image").remove();

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

    function drawRect(name, color, index){
        
        svgTree.append("rect")
            .attr("x", 1388 - marginTree.right - 250)
            .attr("y", 85 + 70*index)
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", "black")
            .attr("id", "linkLegend")
            .style("fill", color)
            .style("stroke", "black")
    
        svgTree.append("text")
            .attr("x", 1400 - marginTree.right - 220)
            .attr("y", 100 + 70*index)
            .text(name)
            .attr("id", "linkLegend")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")
    }

    function drawArrow() {
        // build the arrow.
        svgTree.append("svgTree:defs").append("svgTree:marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr('refX', 0) //so that it comes towards the center.
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("svgTree:path")
            .attr("d", "M0,-5L10,0L0,5");
    
        svgTree.append("text")
            .attr("x", 1400 - marginTree.right - 275)
            .attr("y", 100 + 70*index)
            .text("Derived From")
            .attr("id", "linkLegend")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")
    
        svgTree.append("line")
            .style("stroke", "black")
            .attr("x1", 1400 - marginTree.right - 165)
            .attr("y1", 100 + 70*index)
            .attr("x2", 1400 - marginTree.right - 90)
            .attr("y2", 100 + 70*index)
            .attr("id", "linkLegend")
            .attr("marker-end", "url(#arrow)")
    
    
        svgTree.append("text")
            .attr("x", 1400 - marginTree.right - 75)
            .attr("y", 100 + 70*index)
            .text("Derived To")
            .attr("id", "linkLegend")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")
    }

}