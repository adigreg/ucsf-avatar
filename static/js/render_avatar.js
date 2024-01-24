d3.xml(avatarUrl).then(function(xml) {
    var tooltip = d3.select("body").append('div')
        .attr('class', 'tooltip')
        .style('position','absolute')
        .style('opacity', 0)
        .style('width', 'auto') // Set the width of the tooltip
        .style('height', 'auto')
        .style("background-color", "#fff") // Set background color
        .style("border", "1px solid #ccc");
    d3.select("body").node().appendChild(xml.documentElement);
    pathElements = d3.selectAll("path");
    pathElements.on("mouseover", mouseMoveOrMouseOver);
    pathElements.on("mousemove", mouseMoveOrMouseOver);
    pathElements.on("mouseout", function(d) {
        var pathElement = d3.select(this);
        tooltip.transition()
        .delay(0)
        .style('position','absolute')
        .style("left", (d3.event.offsetX + 30) + "px")
        .style("top", (d3.event.offsetY + 10) + "px")
        .style('opacity', 0);
        pathElement.style('stroke','grey').style('stroke-width','2px');
    });
    function mouseMoveOrMouseOver(d){
        var pathElement = d3.select(this);
        var id = pathElement.attr('id');
        if(id != null && (id[0] == "g" || id[0] == "p")){
            id = "brain"
            pathElement = d3.select("#parent")
        }
        var formattedHtml = ""
        for(var surveyValue in bodyPartData[id]){
            formattedHtml += 
            "<div><strong>" + surveyValue + "</strong>" + "</div>"
            + "<div>" + bodyPartData[id][surveyValue] + "</div>";
        }
        if(formattedHtml == ""){
            formattedHtml = "<div>No issues with " + id + "!</div>"
        }
        tooltip.html(formattedHtml)
        .transition()
        .style('opacity', 1)
        .delay(0)
        .style('position','absolute')
        .style("left", (d3.event.offsetX + 30) + "px")
        .style("top", (d3.event.offsetY + 10) + "px")
        .style("display", "block");
        pathElement.style('stroke','green').style('stroke-width','2px');
    }
});