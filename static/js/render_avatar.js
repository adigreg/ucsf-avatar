function renderAvatar(newAvatarUrl){
    d3.selectAll('svg').remove();
    finalUrl = newAvatarUrl != "" ? newAvatarUrl : avatarUrl
    d3.xml(finalUrl).then(function(xml) {
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
        d3.select("body").node().appendChild(xml.documentElement);
        pathElements = d3.selectAll("path")
        
        pathElements.each(function(d,i){
            currentPath = d3.select(this);
            id = currentPath.attr('id')
            currentPath.style('fill',bodyPartData[id]["color"])
        })


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
    });
}
renderAvatar("");
// Function to handle button click
function handleButtonClick(gender) {
    // Modify the avatarUrl based on the selected gender
    if (gender === 'male') {
        avatarUrl = "static/avatar_template/male.svg";
    } else if (gender === 'female') {
        avatarUrl = "static/avatar_template/female.svg";
    } else if (gender === 'neutral') {
        avatarUrl = "static/avatar_template/neutral.svg";
    }

    // Re-render the avatar
    renderAvatar(avatarUrl);
}

// Attach click event listeners to buttons
d3.select('.button-container').selectAll('.button')
    .on('click', function() {
        var gender = d3.select(this).text().toLowerCase();
        handleButtonClick(gender);
    });