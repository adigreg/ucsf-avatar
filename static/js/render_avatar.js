const BODY_PART_TO_BRAINWALK_FIELDS = {"arm_right":["feeling_right_arm","strength_rt_arm","spasm_rt_arm","tremor_arms"],
        "arm_left":["feeling_left_arm","strength_lt_arm","spasm_lt_arm","tremor_arms"],
        "leg_right":["feeling_right_leg","strength_rt_leg","spasm_rt_leg","tremor_legs"],
        "leg_left": ["feeling_left_leg","strength_lt_leg","spasm_lt_leg","tremor_legs"],
        "face_right":["weakness_rt_face","feeling_rt"],
        "face_left":["weakness_lt_face","feeling_lt"],
        "abdomen":["bowel_bladder_max","bladder_urgency_change"],
        "brain": ["cognition","fatigue"],
        "torso":[],
        "neck":["swallow","speak"],
        "eye_right":["vision_rt"],
        "eye_left":["vision_lt"],
        "ear_left":["hearing"],
        "ear_right":["hearing"]};
const SYMPTOM_TO_BODY_PART_MAP = {
"bowel-bladder" : {"abdomen":["bowel_bladder_max","bladder_urgency_change"]},
"tremor": {"arm_right": ["tremor_arms"],"arm_left":["tremor_arms"],"leg_right": ["tremor_legs"],"leg_left":["tremor_legs"]},
"strength": {"arm_right": ["strength_rt_arm"],"arm_left":["strength_lt_arm"],"leg_right": ["strength_rt_leg"],"leg_left":["strength_lt_leg"]},
"sensation": {"arm_right": ["feeling_right_arm"],"arm_left":["feeling_left_arm"],"leg_right": ["feeling_right_leg"],"leg_left":["feeling_left_leg"],"face_right":["feeling_rt"],"face_left":["feeling_lt"]},
};

class PairedStack {
    constructor() {
        this.stack = [];
    }
    
    // Push a paired item (string, number) onto the stack
    pushAndSort(item, score) {
        this.stack.push({ item, score });
        this.stack.sort((a, b) => a.score - b.score); // Sort by score (ascending order)
    }

    push(item, score) {
        this.stack.push({ item, score });
    }
    
    // Pop the top paired item from the stack
    pop() {
        return this.stack.pop();
    }
    
    // Peek at the top paired item without removing it
    peek() {
        return this.stack[this.stack.length - 1];
    }

    removeByValue(itemToRemove) {
        const index = this.stack.findIndex(pair => pair.item === itemToRemove);
        if (index !== -1) {
          this.stack.splice(index, 1);
        }
    }
    
    // Check if the stack is empty
    isEmpty() {
        return this.stack.length === 0;
    }
    
    // Get the size of the stack
    size() {
        return this.stack.length;
    }
    
    // Print the stack
    print() {
        console.log(this.stack.map(pair => `${pair.item} (${pair.score})`).join(' -> '));
    }
    }

class BodyPart {
    constructor(name,symptom) {
        this.name = name;
        this.symptom = symptom;
        this.paired_stack = new PairedStack();
        this.initializeBodyPart();
    }
    // takes in surveydatamap
    initializeBodyPart() {
        for(let field of SYMPTOM_TO_BODY_PART_MAP[this.symptom][this.name]){
            console.log("initialize: ",this.symptom,this.name,field)
            const score = surveyDataMap[field][0];
            this.paired_stack.pushAndSort(field,score);
            this.color = this.getColor(this.paired_stack.isEmpty() ? 0 : this.paired_stack.peek().score)
        }
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

// for each symptom, we have a separate svg
// per svg, we can drill down to specific fields that concern that symptom category
//
class BrainWalkRecord {
    constructor(surveyDataMap){
        this.survey_data_map = surveyDataMap;
        // could change this to map to symptoms, one symptom per graph
        // symptom -> {name -> body part data}
        this.symptom_to_body_parts = {"bowel-bladder":{},"tremor":{},"strength":{},"sensation":{}};
        this.initializeBodyPartMap();
        // this.handleDropdownChanged = this.handleDropdownChanged.bind(this)
        // this.handleTemplateChanged = this.handleTemplateChanged.bind(this)
        // this.handleCheckedBox = this.handleCheckedBox.bind(this)
        // this.handleUncheckedBox = this.handleUncheckedBox.bind(this)
        this.renderAvatars(this.symptom_to_body_parts,avatarUrl)
    }

    initializeBodyPartMap(){
        for(const symptom in SYMPTOM_TO_BODY_PART_MAP){
            for(const bodyPart in SYMPTOM_TO_BODY_PART_MAP[symptom]){
                console.log(symptom,bodyPart)
                let bodyPartData = new BodyPart(bodyPart,symptom)
                this.symptom_to_body_parts[symptom][bodyPart] = bodyPartData
            }
        }
    }

    // handleDropdownChanged(event){
    //     let box = event.target.id
    //     if(event.target.checked){
    //         this.handleCheckedBox(box)
    //     } else {
    //         this.handleUncheckedBox(box)
    //     }
    // }

    // handleCheckedBox(box){
    //     // Iterate through each body part involved in that symptom.
    //     for(const bodyPart in SYMPTOM_TO_BODY_PART_MAP[box]){
    //         let bodyPartObject = this.body_part_to_score[bodyPart]
    //         let fieldFromCheckedBox = SYMPTOM_TO_BODY_PART_MAP[box][bodyPart]
    //         if(fieldFromCheckedBox == null){
    //             continue
    //         }
    //         let fieldFromCheckedBoxScore = this.survey_data_map[fieldFromCheckedBox][0]
    //         let topItem = bodyPartObject.paired_stack.peek()
    //         if(bodyPartObject.paired_stack.isEmpty() || topItem.score < fieldFromCheckedBoxScore){
    //             bodyPartObject.paired_stack.push(fieldFromCheckedBox, fieldFromCheckedBoxScore)
    //             this.body_part_to_color[bodyPart] = this.getColor(fieldFromCheckedBoxScore)
    //             d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
    //         } else {
    //             bodyPartObject.paired_stack.pushAndSort(fieldFromCheckedBox, fieldFromCheckedBoxScore)
    //         }
    //     }
    // }

    // handleUncheckedBox(box){
    //     for(const bodyPart in SYMPTOM_TO_BODY_PART_MAP[box]){
    //         let bodyPartObject = this.body_part_to_score[bodyPart]
    //         let uncheckedBoxField = SYMPTOM_TO_BODY_PART_MAP[box][bodyPart]
    //         let topItem = bodyPartObject.paired_stack.peek()
    //         if(topItem.item == uncheckedBoxField){
    //             bodyPartObject.paired_stack.pop()
    //             if(bodyPartObject.paired_stack.isEmpty()){
    //                 this.body_part_to_color[bodyPart] = this.getColor(0)
    //                 d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
    //                 continue;
    //             }
    //             let newTopItem = bodyPartObject.paired_stack.peek()
    //             this.body_part_to_color[bodyPart] = this.getColor(newTopItem.score)
    //             d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
    //         } else {
    //             bodyPartObject.paired_stack.removeByValue(uncheckedBoxField)
    //         }
    //     }
    // }

    // Modify the avatarUrl based on the selected gender
    handleTemplateChanged(event){
        let gender = event.target.id
        if (gender === 'male') {
            avatarUrl = "static/avatar_template/male.svg";
        } else if (gender === 'female') {
            avatarUrl = "static/avatar_template/female.svg";
        } else if (gender === 'neutral') {
            avatarUrl = "static/avatar_template/neutral.svg";
        }
        // Re-render the avatar with the new template
        this.renderAvatars(this.symptom_to_body_parts,avatarUrl)
    }

    renderAvatars(symptomToBodyPartData,newAvatarUrl){
        for(const symptom in SYMPTOM_TO_BODY_PART_MAP){
            this.renderAvatar(symptomToBodyPartData[symptom],newAvatarUrl,symptom)
        }
    }

    renderAvatarsWithNewTemplate(){

    }

    renderAvatar(bodyPartData,newAvatarUrl,symptom){
        // d3.select('#svg-' + symptom).remove();
        // d3.select("div.svg-"+symptom).remove();
        d3.xml(newAvatarUrl).then(function(xml) {
            var tooltip = d3.select("div.svg-"+symptom).append('div')
                .attr('class', 'tooltip')
                .style('position','relative')
                .style('opacity', 0)
                .style('width', 'auto')
                .style('height', 'auto')
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px");
            var svgElement = xml.documentElement;
            svgElement.setAttribute("id","svg-"+symptom)
            d3.select("div.svg-"+symptom).node().appendChild(svgElement);

            var svg = d3.select("#svg-"+symptom);
            var pathElements = svg.selectAll("path")
            pathElements.each(function(d,i){
                var currentPath = d3.select(this);
                var id = currentPath.attr('id')
                if(id in bodyPartData){
                    currentPath.style('fill',bodyPartData[id].color)
                } else {
                    currentPath.style('fill',"#cccccc")
                }
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
                var formattedHtml = ""
                for(let i = bodyPartData[id].paired_stack.size() - 1; i >= 0; i--){
                    let brainWalkObject = bodyPartData[id].paired_stack.stack[i];
                    formattedHtml += 
                    "<div><strong>" + brainWalkObject.item + "</strong>" + "</div>"
                    + "<div>" + brainWalkObject.score + "</div>";
                }
                if(formattedHtml == ""){
                    formattedHtml = "<div>No issues with " + id + "!</div>"
                }
                tooltip.html(formattedHtml)
                .transition()
                .style('opacity', 1)
                .delay(0)
                .style('position','relative')
                .style("left", (d3.event.offsetX + 30) + "px")
                .style("top", (d3.event.offsetY + 10) + "px")
                .style("display", "block");
                pathElement.style('stroke','green').style('stroke-width','2px');
            }
        });
    }
}

let brainWalkRecord = new BrainWalkRecord(surveyDataMap)

// // Add event listeners for dropdowns
var inputs = document.getElementsByName('Gender')
for(var i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("change", brainWalkRecord.handleTemplateChanged);
}

// var buttons = document.getElementsByTagName("button");
// for(var i = 0; i < buttons.length; i++){
//     buttons[i].addEventListener("click", brainWalkRecord.handleTemplateChanged);
// }