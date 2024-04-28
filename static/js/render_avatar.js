const BODY_PART_TO_BRAINWALK_FIELDS = {"arm_right":["feeling_right_arm","strength_rt_arm","spasm_rt_arm","tremor_arms"],
        "arm_left":["feeling_left_arm","strength_lt_arm","spasm_lt_arm","tremor_arms"],
        "leg_right":["feeling_right_leg","strength_rt_leg","spasm_rt_leg","tremor_legs"],
        "leg_left": ["feeling_left_leg","strength_lt_leg","spasm_lt_leg","tremor_legs"],
        "face_right":["weakness_rt_face","feeling_rt","vision_rt","blind_spots","speak"],
        "face_left":["weakness_lt_face","feeling_lt","vision_lt","blind_spots","speak"],
        "abdomen":["bowel_bladder_max","bladder_urgency_change"],
        "brain": ["cognition","fatigue","mfis_score","mfis_cognitive_score"],
        "neck":["swallow"],
        "ear_left":["hearing"],
        "ear_right":["hearing"]};
const SYMPTOM_TO_LIMB_DATA = {
"tremor": {"arm_right": "tremor_arms","arm_left":"tremor_arms","leg_right": "tremor_legs","leg_left":"tremor_legs"},
"strength": {"arm_right": "strength_rt_arm","arm_left":"strength_lt_arm","leg_right": "strength_rt_leg","leg_left":"strength_lt_leg"},
"spasm": {"arm_right": "spasm_rt_arm","arm_left":"spasm_lt_arm","leg_right": "spasm_rt_leg","leg_left":"spasm_lt_leg"},
"feeling": {"arm_right": "feeling_rt_arm","arm_left":"feeling_lt_arm","leg_right": "feeling_rt_leg","leg_left":"feeling_lt_leg","face_right":"feeling_rt","face_left":"feeling_lt"},
"cognition" : {"brain":"cognition"},
"fatigue" : {"brain":"fatigue"},
"bladder" : {"abdomen":"bladder_urgency_change"},
"bowel" : {"abdomen":"bowel_bladder_max"},
"swallow" : {"neck": "swallow"},
"speak" : {"neck": "speak"},
};
class BrainWalkRecord {
    constructor(surveyDataMap){
        this.survey_data_map = surveyDataMap;
        this.body_part_to_score = {};
        this.body_part_to_color = {};
        this.initializeScoresAndColors();
    }

    initializeScoresAndColors(){
        for(const bodyPart in BODY_PART_TO_BRAINWALK_FIELDS){
            let maxScore = 0;
            for(let i = 0; i < BODY_PART_TO_BRAINWALK_FIELDS[bodyPart].length; i++){
                let field = BODY_PART_TO_BRAINWALK_FIELDS[bodyPart][i]
                maxScore = Math.max(maxScore,this.survey_data_map[field][0]);
                this.body_part_to_score[bodyPart] = maxScore
            }
            this.body_part_to_color[bodyPart] = this.getColor(maxScore)
        }
    }

    handleCheckboxChanged(event){
        if(event.target.checked){
            this.newBoxChecked(event.target.id);
        }
        this.boxCheckRemoved(event.target.id)
    }

    handleTemplateChanged(event){
        let gender = event.target.id
        // Modify the avatarUrl based on the selected gender
        if (gender === 'male') {
            avatarUrl = "static/avatar_template/male.svg";
        } else if (gender === 'female') {
            avatarUrl = "static/avatar_template/female.svg";
        } else if (gender === 'neutral') {
            avatarUrl = "static/avatar_template/neutral.svg";
        }

        // Re-render the avatar
        renderAvatar(this.body_part_to_color,this.body_part_to_score,avatarUrl);
    }

    newBoxChecked(newBox){
        for(const bodyPart in SYMPTOM_TO_LIMB_DATA[newBox]){
            field = SYMPTOM_TO_LIMB_DATA[newBox][bodyPart]
            if(this.body_part_to_score[bodyPart] < this.survey_data_map[field][0]){
                this.body_part_to_score[bodyPart] = this.survey_data_map[field][0]
                this.body_part_to_color[bodyPart] = this.getColor(this.body_part_to_score[bodyPart])
                renderAvatar(this.body_part_to_color,avatarUrl);
            }
        }
    }

    boxCheckRemoved(oldBox){

    }

    getColor(score){
        if(score == 0){
            return "#cccccc"
        } else if (score <= 0.2){
            return "#accbff"
        } else if (score <= 0.4){
            return "#92bbff"
        } else if (score <= 0.6){
            return "#78aaff"
        } else if (score <= 0.8){
            return "#649eff"
        } else {
            return "#4188ff"
        }
    }

}

let brainWalkRecord = new BrainWalkRecord(surveyDataMap)

console.log(brainWalkRecord.body_part_to_color);
console.log(brainWalkRecord.body_part_to_score);

// Add event listeners for checkboxes
var inputs = document.getElementsByTagName("input");
for(var i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("change", brainWalkRecord.handleCheckboxChanged);
}

// Add event listeners to male female templates
var buttons = document.getElementsByTagName("button");
for(var i = 0; i < buttons.length; i++){
    inputs[i].addEventListener("click", brainWalkRecord.handleTemplateChanged);
}

function renderAvatar(bodyPartToColor,bodyPartToScore,newAvatarUrl){
    d3.selectAll('svg').remove();
    let finalUrl = newAvatarUrl != "" ? newAvatarUrl : avatarUrl
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
        var pathElements = d3.selectAll("path")
        
        pathElements.each(function(d,i){
            var currentPath = d3.select(this);
            var id = currentPath.attr('id')
            currentPath.style('fill',bodyPartToColor[id])
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
            for(var surveyValue in bodyPartToScore[id]){
                formattedHtml += 
                "<div><strong>" + surveyValue + "</strong>" + "</div>"
                + "<div>" + bodyPartToScore[id] + "</div>";
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

renderAvatar(brainWalkRecord.body_part_to_color,brainWalkRecord.body_part_to_score,"");

// Attach click event listeners to buttons
d3.select('.button-container').selectAll('.button')
    .on('click', function() {
        var gender = d3.select(this).text().toLowerCase();
        handleButtonClick(gender);
    });