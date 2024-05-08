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
"feeling": {"arm_right": "feeling_right_arm","arm_left":"feeling_left_arm","leg_right": "feeling_right_leg","leg_left":"feeling_left_leg","face_right":"feeling_rt","face_left":"feeling_lt"},
"cognition" : {"brain":"cognition"},
"fatigue" : {"brain":"fatigue"},
"bladder" : {"abdomen":"bladder_urgency_change"},
"bowel" : {"abdomen":"bowel_bladder_max"},
"swallow" : {"neck": "swallow"},
"speak" : {"neck": "speak"},
};
const SYMPTOM_TO_BRAINWALK_FIELDS = {
    "tremor": ["tremor_arms","tremor_legs"],
    "strength": ["strength_rt_arm","strength_lt_arm","strength_rt_leg","strength_lt_leg"],
    "spasm": ["spasm_rt_arm","spasm_lt_arm","spasm_rt_leg","spasm_lt_leg"],
    "feeling": ["feeling_right_arm","feeling_left_arm","feeling_right_leg","feeling_left_leg","feeling_rt","feeling_lt"],
    "cognition" : ["cognition"],
    "fatigue" : ["fatigue"],
    "bladder" : ["bladder_urgency_change"],
    "bowel" : ["bowel_bladder_max"],
    "swallow" : ["swallow"],
    "speak" : ["speak"],
    };

    const BRAINwALK_FIELD_TO_BODY_PART = {
        "tremor_arms": ["arm_right", "arm_left"],
        "tremor_legs": ["leg_right", "leg_left"],
        "strength_rt_arm": ["arm_right"],
        "strength_lt_arm": ["arm_left"],
        "strength_rt_leg": ["leg_right"],
        "strength_lt_leg": ["leg_left"],
        "spasm_rt_arm": ["arm_right"],
        "spasm_lt_arm": ["arm_left"],
        "spasm_rt_leg": ["leg_right"],
        "spasm_lt_leg": ["leg_left"],
        "feeling_right_arm": ["arm_right"],
        "feeling_left_arm": ["arm_left"],
        "feeling_right_leg": ["leg_right"],
        "feeling_left_leg": ["leg_left"],
        "feeling_rt": ["face_right"],
        "feeling_lt": ["face_left"],
        "cognition": ["brain"],
        "fatigue": ["brain"],
        "bladder_urgency_change": ["abdomen"],
        "bowel_bladder_max": ["abdomen"],
        "swallow": ["neck"],
        "speak": ["face_right", "face_left"],
        "weakness_rt_face": ["face_right"],
        "weakness_lt_face": ["face_left"],
        "vision_rt": ["face_right"],
        "vision_lt": ["face_left"],
        "blind_spots": ["face_right", "face_left"],
        "mfis_score": ["brain"],
        "mfis_cognitive_score": ["brain"],
        "hearing": ["ear_left", "ear_right"]
    };

class BrainWalkRecord {
    constructor(surveyDataMap){
        this.survey_data_map = surveyDataMap;
        this.body_part_to_score = {};
        this.body_part_to_color = {};
        this.initializeScoresAndColors();
        this.checked_boxes = new Set(['tremor','strength','spasm','weakness','feeling'])
        this.handleCheckboxChanged = this.handleCheckboxChanged.bind(this)
        this.handleTemplateChanged = this.handleTemplateChanged.bind(this)
        this.renderAvatar(this.body_part_to_color,this.body_part_to_score,"")
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
        let box = event.target.id
        if(event.target.checked){
            this.checked_boxes.add(box)
            for(const bodyPart in SYMPTOM_TO_LIMB_DATA[box]){
                const field = SYMPTOM_TO_LIMB_DATA[box][bodyPart]
                if(this.survey_data_map[field][0] > this.body_part_to_score[bodyPart]){
                    this.body_part_to_score[bodyPart] = this.survey_data_map[field][0]
                    this.body_part_to_color[bodyPart] = this.getColor(this.survey_data_map[field][0])
                    d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
                }
            }
        } else {
            this.checked_boxes.delete(box)
            for(const bodyPart in BODY_PART_TO_BRAINWALK_FIELDS){
                if(['arm_left','arm_right','leg_left','leg_right'].includes(bodyPart)){
                    this.body_part_to_score[bodyPart] = 0
                    this.body_part_to_color[bodyPart] = this.getColor(0)
                    d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
                }
            }
            for(const symptom in SYMPTOM_TO_LIMB_DATA){
                if(this.checked_boxes.has(symptom)){
                    for(const bodyPart in SYMPTOM_TO_LIMB_DATA[symptom]){
                        for(const field of BODY_PART_TO_BRAINWALK_FIELDS[bodyPart]){
                            if(SYMPTOM_TO_BRAINWALK_FIELDS[symptom].includes(field)){
                                this.body_part_to_score[bodyPart] = Math.max(this.body_part_to_score[bodyPart],this.survey_data_map[field][0])
                            }
                        }
                        this.body_part_to_color[bodyPart] = this.getColor(this.body_part_to_score[bodyPart])
                        d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
                    }
                }
            }
        }
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
        this.renderAvatar(this.body_part_to_color,this.body_part_to_score,avatarUrl);
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

    renderAvatar(bodyPartToColor,bodyPartToScore,newAvatarUrl){
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
                for(var brainWalkField of BODY_PART_TO_BRAINWALK_FIELDS[id]){
                    var surveyScore = surveyDataMap[brainWalkField][0]
                    var surveyValue = surveyDataMap[brainWalkField][1]
                    formattedHtml += 
                    "<div><strong>" + brainWalkField + "</strong>" + "</div>"
                    + "<div>" + surveyValue + "</div>";
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
}

let brainWalkRecord = new BrainWalkRecord(surveyDataMap)

// Add event listeners for checkboxes
var inputs = document.getElementsByTagName("input");
for(var i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("change", brainWalkRecord.handleCheckboxChanged);
}

var buttons = document.getElementsByTagName("button");
for(var i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", brainWalkRecord.handleTemplateChanged);
}

d3.select('.button-container').selectAll('.button')
    .on('click', function() {
        var gender = d3.select(this).text().toLowerCase();
        handleButtonClick(gender);
    });