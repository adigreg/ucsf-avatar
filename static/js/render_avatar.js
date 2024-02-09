function modifySVG(inputFilePath,outputFilePath) {
    // Replace 'path/to/your/svg/file.svg' with the actual path to your SVG file
    return new Promise(function(resolve, reject)
    {
        var svgFilePath = inputFilePath;

        // Load SVG file using XMLHttpRequest
        var xhr = new XMLHttpRequest();
        console.log("hi")
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
              var svgString = xhr.responseText;
              // Parse SVG string
              var parser = new DOMParser();
              var xmlDoc = parser.parseFromString(svgString, 'image/svg+xml');
      
              // Modify the SVG (example: change circle color to blue)
              var paths = xmlDoc.querySelectorAll('path');
              paths.forEach(function(path){
                  console.log(path.id)
                  path.setAttribute('fill',bodyPartData[path.id]["color"])
              })
      
              // Convert the modified SVG to XML string
              var modifiedSvgString = new XMLSerializer().serializeToString(xmlDoc);
            }
          };
          xhr.open('GET', svgFilePath, true);
          resolve(xhr.send());
    });
  }
d3.xml(avatarTemplate).then(async function(xml) {
    try {
        const modifiedSvgString = await modifySVG(avatarTemplate,avatarUrl);
    var tooltip = d3.select("body").append('div')
        .attr('class', 'tooltip')
        .style('position','absolute')
        .style('opacity', 0)
        .style('width', 'auto')
        .style('height', 'auto')
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");
    console.log("append child")
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
        }
        var formattedHtml = ""
        for(var surveyValue in bodyPartData[id]["scores"]){
            formattedHtml += 
            "<div><strong>" + surveyValue + "</strong>" + "</div>"
            + "<div>" + bodyPartData[id]["scores"][surveyValue] + "</div>";
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
} catch (error){
        console.error(error);
}
});