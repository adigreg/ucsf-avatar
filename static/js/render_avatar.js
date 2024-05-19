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
"tremor": {"arm_right": "tremor_arms","arm_left":"tremor_arms","leg_right": "tremor_legs","leg_left":"tremor_legs"},
"strength": {"arm_right": "strength_rt_arm","arm_left":"strength_lt_arm","leg_right": "strength_rt_leg","leg_left":"strength_lt_leg"},
"spasm": {"arm_right": "spasm_rt_arm","arm_left":"spasm_lt_arm","leg_right": "spasm_rt_leg","leg_left":"spasm_lt_leg"},
"feeling": {"arm_right": "feeling_right_arm","arm_left":"feeling_left_arm","leg_right": "feeling_right_leg","leg_left":"feeling_left_leg","face_right":"feeling_rt","face_left":"feeling_lt"},
"weakness": {"face_right":"weakness_rt_face","face_left":"weakness_lt_face"},
"cognition" : {"brain":"cognition"},
"fatigue" : {"brain":"fatigue"},
"bladder" : {"abdomen":"bladder_urgency_change"},
"bowel" : {"abdomen":"bowel_bladder_max"},
"swallow" : {"neck": "swallow"},
"speak" : {"neck": "speak"},
"vision" : {"eye_right":"vision_rt","eye_left":"vision_lt"},
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
    constructor(name) {
        this.name = name;
        this.paired_stack = new PairedStack();
        this.initializeBodyPart();
    }
    // takes in surveydatamap
    initializeBodyPart() {
        for(const field of BODY_PART_TO_BRAINWALK_FIELDS[this.name]){
            const score = surveyDataMap[field][0];
            this.paired_stack.pushAndSort(field,score);
        }
    }

}

class BrainWalkRecord {
    constructor(surveyDataMap){
        this.survey_data_map = surveyDataMap;
        this.body_part_to_score = {};
        this.body_part_to_color = {};
        this.initializeScoresAndColors();
        this.handleCheckboxChanged = this.handleCheckboxChanged.bind(this)
        this.handleTemplateChanged = this.handleTemplateChanged.bind(this)
        this.handleCheckedBox = this.handleCheckedBox.bind(this)
        this.handleUncheckedBox = this.handleUncheckedBox.bind(this)
        this.renderAvatar(this.body_part_to_color,this.body_part_to_score,avatarUrl)
    }

    initializeScoresAndColors(){
        for(const bodyPart in BODY_PART_TO_BRAINWALK_FIELDS){
            let newBodyPart = new BodyPart(bodyPart)
            let score = newBodyPart.paired_stack.isEmpty() ? 0 : newBodyPart.paired_stack.peek().score
            this.body_part_to_score[bodyPart] = newBodyPart
            this.body_part_to_color[bodyPart] = this.getColor(score)
        }
    }

    handleCheckboxChanged(event){
        let box = event.target.id
        if(event.target.checked){
            this.handleCheckedBox(box)
        } else {
            this.handleUncheckedBox(box)
        }
    }

    handleCheckedBox(box){
        // Iterate through each body part involved in that symptom.
        for(const bodyPart in SYMPTOM_TO_BODY_PART_MAP[box]){
            let bodyPartObject = this.body_part_to_score[bodyPart]
            let fieldFromCheckedBox = SYMPTOM_TO_BODY_PART_MAP[box][bodyPart]
            if(fieldFromCheckedBox == null){
                continue
            }
            let fieldFromCheckedBoxScore = this.survey_data_map[fieldFromCheckedBox][0]
            let topItem = bodyPartObject.paired_stack.peek()
            if(bodyPartObject.paired_stack.isEmpty() || topItem.score < fieldFromCheckedBoxScore){
                bodyPartObject.paired_stack.push(fieldFromCheckedBox, fieldFromCheckedBoxScore)
                this.body_part_to_color[bodyPart] = this.getColor(fieldFromCheckedBoxScore)
                d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
            } else {
                bodyPartObject.paired_stack.pushAndSort(fieldFromCheckedBox, fieldFromCheckedBoxScore)
            }
        }
    }

    handleUncheckedBox(box){
        for(const bodyPart in SYMPTOM_TO_BODY_PART_MAP[box]){
            let bodyPartObject = this.body_part_to_score[bodyPart]
            let uncheckedBoxField = SYMPTOM_TO_BODY_PART_MAP[box][bodyPart]
            let topItem = bodyPartObject.paired_stack.peek()
            if(topItem.item == uncheckedBoxField){
                bodyPartObject.paired_stack.pop()
                if(bodyPartObject.paired_stack.isEmpty()){
                    this.body_part_to_color[bodyPart] = this.getColor(0)
                    d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
                    continue;
                }
                let newTopItem = bodyPartObject.paired_stack.peek()
                this.body_part_to_color[bodyPart] = this.getColor(newTopItem.score)
                d3.select("path#" + bodyPart).style('fill',this.body_part_to_color[bodyPart])
            } else {
                bodyPartObject.paired_stack.removeByValue(uncheckedBoxField)
            }
        }
    }

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
        d3.xml(newAvatarUrl).then(function(xml) {
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
            var allPaths = d3.selectAll("path")
            var excludedPaths = ['leg_left_feeling','leg_right_feeling','arm_right_feeling','arm_right_feeling','face_left_feeling','face_right_feeling']
            var pathElements = allPaths.filter(function() {
                var pathClass = this.getAttribute("class");
                var pathID = this.getAttribute("id");
                
                // Check if the path's class or ID is not in the excludedPaths array
                return !excludedPaths.includes(pathID);
            });
            
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
                var id = pathElement.attr('id');
                let feeling = d3.select("path#" + id + "_feeling");
                if(!feeling.empty()){
                    feeling.style('fill','#606060ff');
                    feeling.style('display','none');
                }
                var excludedPaths = ['leg_left_feeling','leg_right_feeling','arm_left_feeling','arm_right_feeling','face_left_feeling','face_right_feeling']
                if(excludedPaths.includes(id)){
                    return;
                }
                pathElement.style('stroke','grey').style('stroke-width','2px');
            });
            function mouseMoveOrMouseOver(d){
                var pathElement = d3.select(this);
                var id = pathElement.attr('id');
                var excludedPaths = ['torso','leg_left_feeling','leg_right_feeling','arm_left_feeling','arm_right_feeling']
                if(excludedPaths.includes(id)){
                    return;
                }
                var formattedHtml = ""
                for(let i = bodyPartToScore[id].paired_stack.size() - 1; i >= 0; i--){
                    let brainWalkObject = bodyPartToScore[id].paired_stack.stack[i];
                    formattedHtml += 
                    "<div><strong>" + brainWalkObject.item + "</strong>" + "</div>"
                    + "<div>" + brainWalkObject.score + "</div>";
                }
                if(formattedHtml == ""){
                    formattedHtml = "<div>No issues with " + id + "!</div>"
                }
                let feeling = d3.select("path#" + id + "_feeling");
                if(!feeling.empty()){
                    if((id == 'leg_left' && surveyDataMap["feeling_left_leg"][0] > 0) ||
                    (id == 'arm_left' && surveyDataMap["feeling_left_arm"][0] > 0) ||
                    (id == 'leg_right' && surveyDataMap["feeling_right_leg"][0] > 0) ||
                    (id == 'arm_right' && surveyDataMap["feeling_right_arm"][0] > 0)){
                        feeling.style('fill','purple')
                    }
                    feeling.style('display','block');
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

document.querySelectorAll('.category-title').forEach(title => {
    title.addEventListener('click', function() {
        const items = this.nextElementSibling;
        items.classList.toggle('show');
        this.querySelector('.toggle-arrow').classList.toggle('rotate');
    });
});