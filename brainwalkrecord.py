#!/usr/bin/env python
from __future__ import absolute_import, division, print_function
from enum import Enum
from xml.etree import ElementTree as ET
import os 
import logging
import yaml

BODY_PART_TO_BRAINWALK_FIELDS = {"arm_right":["right_arm","strength_rt_arm","spasm_rt_arm","tremor_arms"],
        "arm_left":["left_arm","strength_lt_arm","spasm_lt_arm","tremor_arms"],
        "leg_right":["right_leg","strength_rt_leg","spasm_rt_leg","tremor_legs"],
        "leg_left": ["left_leg","strength_lt_leg","spasm_lt_leg","tremor_legs"],
        "face_right":["rt_face","feeling_rt","vision_rt","blind_spots","speak"],
        "face_left":["lt_face","feeling_lt","vision_lt","blind_spots","speak"],
        "abdomen":["bowel_bladder_max","bladder_urgency_change"],
        "brain": ["cognition","fatigue","mfis_score","mfis_cognitive_score"],
        "neck":["swallow"],
        "ear_left":["hearing"],
        "ear_right":["hearing"]}

BRAINWALK_FIELD_STRING_TO_INT_SCORE = {"speak": {"I do not have problems speaking":0, "I sometimes slur words but others don't seem to notice":1, "I often slur words and others notice":2, "I slur words so much that it interferes with my ability to have conversations":3, "I slur my words so much that others cannot understand me":4, "I cannot speak":5},
        "swallow": {"I do not have any problems swallowing liquids or foods":0, "I have problems swallowing liquids or solid foods":1, "I have frequent problems with swallowing and need a pureed diet":2, "I cannot swallow food or liquids":3},
        "hearing": {"I do not have problems hearing":0, "I have mild hearing loss on one side":1, "I have moderate or severe hearing loss on one side":2, "I have total hearing loss on both sides. I am effectively deaf.":3}, 
        "cognition": {"I have no problems with concentration or memory":0, "I have some concentration and memory problems, or problems with coping with stress, but I am able to handle my daily routines including completing this survey":1, "I have problems with concentration and memory that my friends and family notice; this is beginning to affect my daily routine. It makes completing this survey difficult":2, "I have severe impairment in my cognitive (thinking) abilities; for example, I sometimes forget where I am and who I am talking to. I need help completing this survey":3, "I have no meaningful conversation and am unable to handle my affairs because of my severe cognitive problems; I need someone else to complete this survey":4},
        "rt_face": {"I do not have muscle weakness in my face":0, "A little, such as when I furrow my eyebrows or laugh":1,"A lot, such as trouble with drooling or when closing my eye(s)":2,"Total weakness or palsy, such as Bell's palsy":3},
        "lt_face": {"I do not have muscle weakness in my face":0, "A little, such as when I furrow my eyebrows or laugh":1,"A lot, such as trouble with drooling or when closing my eye(s)":2,"Total weakness or palsy, such as Bell's palsy":3},
        "feeling_rt": {"Feeling is very good. No numbness or pain":0, "Feeling is good. Some numbness":1, "Feeling is fair. Hard to tell sharp touch from dull touch":2, "Feeling is poor. Mild pain":3, "Feeling is very poor or gone. Moderate to severe pain":4},
        "feeling_lt": {"Feeling is very good. No numbness or pain":0, "Feeling is good. Some numbness":1, "Feeling is fair. Hard to tell sharp touch from dull touch":2, "Feeling is poor. Mild pain":3, "Feeling is very poor or gone. Moderate to severe pain":4},
        "vision_rt": {"I have no problems with my ability to see.":0, "My vision is slightly impaired":1, "My vision is very impaired":2, "I am blind, or almost blind, in that eye":3},
        "vision_lt": {"I have no problems with my ability to see.":0, "My vision is slightly impaired":1, "My vision is very impaired":2, "I am blind, or almost blind, in that eye":3},
        "right_arm": {"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "right_leg": {"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "left_arm": {"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "left_leg": {"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "strength_rt_arm": {"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "strength_lt_arm": {"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "strength_lt_leg": {"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "strength_rt_leg": {"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "tremor_legs": {"I do not have tremors or coordination problems":0, "Rarely make it hard for me to use":1, "Sometimes make it hard for me to use":2, "Often make it hard for me to use":3, "Always make it hard for me to use":4},
        "tremor_arms": {"I do not have tremors or coordination problems":0, "Rarely make it hard for me to use":1, "Sometimes make it hard for me to use":2, "Often make it hard for me to use":3, "Always make it hard for me to use":4},
        "spasm_rt_arm": {"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4},
        "spasm_lt_arm": {"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4},
        "spasm_rt_leg": {"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4},
        "spasm_lt_leg": {"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4},
        "fatigue": {"I experience no fatigue":0,"I experience mild fatigue. I do feel the need to rest more often, but I can still complete all my daily tasks":1,"Due to my fatigue I have to rest unusually often; this affects less than half of my daily activities. I often cannot complete my daily routine without naps or significant rest.":2},
        "blind_spots": {"I do not have any blind spots in my vision": 0, "My doctor has told me I have a blind spot but I do not notice it":1,"Yes, I notice a blind spot in my vision":2}}

BRAINWALK_FIELD_INT_TO_MAX_SCORE_MAP = {
    "bowel_bladder_total_score": 3,
    "bowel_bladder_max": 4,
    "bladder_urgency_change": 1,
     "mfis_score": 84,
     "mfis_cognitive_score": 40
}

class BrainWalkData:
    def __init__(self, row):
        logging.basicConfig(level=logging.DEBUG)
        self.patient_id = row['DeID']
        self.body_parts = {}
        self.initializeBodyPartData(row)

    def initializeBodyPartData(self,row):
        labels = self.getLabels()
        for id in labels:
            logging.debug(id)
            scores, max_score = self.parseScores(id,row)
            self.body_parts[id] = {"scores":scores, "color": self.intensity2color(max_score)}
                
    def getLabels(self):
        def leaf_labels(obj):
            def iter_dict(dc):
                for k, v in dc.items():
                    if not v:
                        yield k
                    elif isinstance(v, dict):
                        for key in iter_dict(v):
                            yield key
                    else:
                        for val in v:
                            yield val

            assert isinstance(obj, dict)
            for key in iter_dict(obj):
                yield key
        yaml_path = os.path.join(os.getcwd(), 'static', 'body_parts.yaml')
        with open(yaml_path) as f:
            vocab_tree = yaml.full_load(f)
        return set(leaf_labels(vocab_tree))

    def parseScores(self,name,row):
        fields = BODY_PART_TO_BRAINWALK_FIELDS[name] if name in BODY_PART_TO_BRAINWALK_FIELDS.keys() else []
        max_score = 0
        scores = {}
        for field in fields:
            map = {}
            value = 0
            string_entry = ""
            if field in BRAINWALK_FIELD_STRING_TO_INT_SCORE.keys():
                # In this case, field has value of type string (ex. string survey response).
                # Since each survey response maps to an int value, we convert this to a score.
                map = BRAINWALK_FIELD_STRING_TO_INT_SCORE[field]
                string_entry = ""
                if field in row.keys():
                    string_entry = row[field]
                value = map[string_entry]/(len(map.keys())-1) if string_entry != "" else 0
            elif field in BRAINWALK_FIELD_INT_TO_MAX_SCORE_MAP.keys():
                # In this case, field has value of type int (ex. MFIS score).
                # Here, we calculate the score relative to the max score.
                max_possible_score = BRAINWALK_FIELD_INT_TO_MAX_SCORE_MAP[field]
                if field in row.keys():
                    value = int(row[field])/max_possible_score
                string_entry = str(row[field])
            # Set values to display and set new max score for body part.
            scores[field] = string_entry
            max_score = max(max_score,value)
        return scores, max_score

    def intensity2color(self,scale):
        """
        Map score to shades of blue (if score is zero, map to grey).
        """
        assert 0.0 <= scale <= 1.0
        if scale == 0:
            return "#cccccc"
        elif scale <= 0.2:
            return "#accbff"
        elif scale <= 0.4:
            return "#92bbff"
        elif scale <= 0.6:
            return "#78aaff"
        elif scale <= 0.8:
            return "#649eff"
        else:
            return "#4188ff"



    

        
        
            
    

