d3.xml(avatarUrl).then(function(xml) {
        var tooltip = d3.select("body").append('div')
            .attr('class', 'tooltip')
            .style('position','absolute')
            .style('opacity', 0).style('width', '500px') // Set the width of the tooltip
            .style('height', '50px');
    d3.select("body").node().appendChild(xml.documentElement);
    pathElements = d3.selectAll("path");
    pathElements.on("mouseover", function(d) {
        var pathElement = d3.select(this);
        var id = pathElement.attr('id');
        if(id != null && (id[0] == "g" || id[0] == "p")){
            id = "brain"
            pathElement = d3.select("#parent")
        }
    var tooltipText = JSON.stringify(bodyPartData[id])
        tooltip.transition()
        .style('opacity', 0.9)
        .delay(0)
        .style('position','absolute')
        .style("left", (event.offsetX + 10) + "px")
        .style("top", (event.offsetY + 10) + "px")
        .style("display", "block")
        .text(tooltipText);
        pathElement.style('stroke','green').style('stroke-width','4px')
    }).pathElements.on("mousemove", function(d) {
        var pathElement = d3.select(this);
        var id = pathElement.attr('id');
        if(id != null && (id[0] == "g" || id[0] == "p")){
            id = "brain"
            pathElement = d3.select("#parent")
        }
        var tooltipText = JSON.stringify(bodyPartData[id])
        tooltip.transition()
        .style('opacity', 0.9)
        .delay(0)
        .style('position','absolute')
        .style("left", (event.offsetX + 10) + "px")
        .style("top", (event.offsetY + 10) + "px")
        .style("display", "block")
        .text(tooltipText);
    })
    .on("mouseout", function(d) {
        var pathElement = d3.select(this);
        tooltip.transition()
        .delay(0)
        .style('position','absolute')
        .style('opacity', 0);
        pathElement.style('stroke','grey').style('stroke-width','2px');
    })
});