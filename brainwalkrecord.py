#!/usr/bin/env python
from __future__ import absolute_import, division, print_function
from enum import Enum
"""Colorize the SVG by modifying the XML directly, via ElementTree."""
import random
import sys
from xml.etree import ElementTree as ET
import os 
import yaml

BODY_PART_TO_BRAINWALK_FIELDS = {"arm_right":["right_arm","strength_rt_arm","spasm_rt_arm","tremor_arms"],
        "arm_left":["left_arm","strength_lt_arm","spasm_lt_arm","tremor_arms"],
        "leg_right":["right_leg","strength_rt_leg","spasm_rt_leg","tremor_legs"],
        "leg_left": ["left_leg","strength_lt_leg","spasm_lt_leg","tremor_legs"],
        "eye_left": ["vision_lt"],
        "eye_right":["vision_rt"],
        "face_right":["rt_face","feeling_rt"],
        "face_left":["lt_face","feeling_lt"],
        "abdomen":["bowel_bladder_score"],
        "brain": ["cognition","mfis_fatigue"],
        "mouth":["speak"],
        "neck":["swallow"],
        "ear_left":["hearing"],
        "ear_right":["hearing"]}

BRAINWALK_FIELD_STRING_TO_INT_SCORE = {"speak": {"":0, "I do not have problems speaking":0, "I sometimes slur words but others don't seem to notice":1, "I often slur words and others notice":2, "I slur words so much that it interferes with my ability to have conversations":3, "I slur my words so much that others cannot understand me":4, "I cannot speak":5},
        "swallow": {"":0, "I do not have any problems swallowing liquids or foods":0, "I have problems swallowing liquids or solid foods":1, "I have frequent problems with swallowing and need a pureed diet":2, "I cannot swallow food or liquids":3},
        "hearing": {"":0, "I do not have problems hearing":0, "I have mild hearing loss on one side":1, "I have moderate or severe hearing loss on one side":2, "I have total hearing loss on both sides. I am effectively deaf.":3}, 
        "cognition": {"I have no problems with concentration or memory":0, "I have some concentration and memory problems, or problems with coping with stress, but I am able to handle my daily routines including completing this survey":1, "I have problems with concentration and memory that my friends and family notice; this is beginning to affect my daily routine. It makes completing this survey difficult":2, "I have severe impairment in my cognitive (thinking) abilities; for example, I sometimes forget where I am and who I am talking to. I need help completing this survey":3, "I have no meaningful conversation and am unable to handle my affairs because of my severe cognitive problems; I need someone else to complete this survey":4},
        "rt_face": {"":0,"I do not have muscle weakness in my face":0, "A little, such as when I furrow my eyebrows or laugh":1,"A lot, such as trouble with drooling or when closing my eye(s)":2,"Total weakness or palsy, such as Bell's palsy":3},
        "lt_face": {"":0,"I do not have muscle weakness in my face":0, "A little, such as when I furrow my eyebrows or laugh":1,"A lot, such as trouble with drooling or when closing my eye(s)":2,"Total weakness or palsy, such as Bell's palsy":3},
        "feeling_rt": {"":0, "Feeling is very good. No numbness or pain":0, "Feeling is good. Some numbness":1, "Feeling is fair. Hard to tell sharp touch from dull touch":2, "Feeling is poor. Mild pain":3, "Feeling is very poor or gone. Moderate to severe pain":4},
        "feeling_lt": {"":0, "Feeling is very good. No numbness or pain":0, "Feeling is good. Some numbness":1, "Feeling is fair. Hard to tell sharp touch from dull touch":2, "Feeling is poor. Mild pain":3, "Feeling is very poor or gone. Moderate to severe pain":4},
        "vision_rt": {"":0, "I have no problems with my ability to see.":0, "My vision is slightly impaired":1, "My vision is very impaired":2, "I am blind, or almost blind, in that eye":3},
        "vision_lt": {"":0, "I have no problems with my ability to see.":0, "My vision is slightly impaired":1, "My vision is very impaired":2, "I am blind, or almost blind, in that eye":3},
        "right_arm": {"":0,"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "right_leg": {"":0,"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "left_arm": {"":0,"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "left_leg": {"":0,"Feeling is very good - No problems": 0, "Feeling is mildly impaired": 1, "Feeling is clearly impaired": 2, "Feeling is very poor or completely gone": 3},
        "strength_rt_arm": {"":0,"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "strength_lt_arm": {"":0,"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "strength_lt_leg": {"":0,"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "strength_rt_leg": {"":0,"I can easily raise it and keep it raised":0, "I can raise it, but have mild or occasional trouble with my full strength": 1, "I have to make some effort to raise it": 2, "I can barely raise it": 3, "I can move my limb, but I cannot raise it": 4, "I cannot move it at all":5},
        "tremor_legs": {"":0,"I do not have tremors or coordination problems":0, "Rarely make it hard for me to use":1, "Sometimes make it hard for me to use":2, "Often make it hard for me to use":3, "Always make it hard for me to use":4},
        "tremor_arms": {"":0,"I do not have tremors or coordination problems":0, "Rarely make it hard for me to use":1, "Sometimes make it hard for me to use":2, "Often make it hard for me to use":3, "Always make it hard for me to use":4},
        "spasm_rt_arm": {"":0,"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4},
        "spasm_lt_arm": {"":0,"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4},
        "spasm_rt_leg": {"":0,"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4},
        "spasm_lt_leg": {"":0,"I do not have stiffness or spasms":0, "Mild, does not make it hard for me to use":1, "Moderate stiffness, but with effort I can use":2, "Sometimes I cannot overcome the stiffness to use my arm or leg":3, "My arm or leg is so contracted that I cannot use it at all":4}}

def leaf_labels(obj):
    """Get terminal node labels from a YAML/JSON-sourced dict/list object tree.

    Returns only terminal node labels in DFS order.
    """
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

class BrainWalkData:
    def __init__(self, row):
        # create map with body part to dictionary of symptoms
        self.patient_id = row['DeID']
        # dictionary of body part -> {shade_intensity, {field_map}}
        self.body_parts = {}
        self.initializeBodyPartData(row)

    def initializeBodyPartData(self,row):
        yaml_path = os.path.join(os.getcwd(), 'bodymap', 'maps','molemapper','molemapper.yaml')
        with open(yaml_path) as f:
            vocab_tree = yaml.full_load(f)
        labels = set(leaf_labels(vocab_tree))

        svg_path = os.path.join(os.getcwd(), 'bodymap', 'maps','molemapper','molemapper.plain.svg')
        tree = ET.ElementTree(file=svg_path)
        for element in tree.iter():
            id = element.get("id")
            if id in labels:
                bodyPart = BodyPart(id,row)
                self.body_parts[id] = [bodyPart.shade_intensity,bodyPart.scores]
  
class BodyPart:
    def __init__(self,name,row):
        self.name = name
        self.shade_intensity = ""
        self.scores = {}
        self.setScores(row)
    
    def setScores(self,row):
        fields = BODY_PART_TO_BRAINWALK_FIELDS[self.name] if self.name in BODY_PART_TO_BRAINWALK_FIELDS.keys() else []
        max_score = 0
        for field in fields:
            map = BRAINWALK_FIELD_STRING_TO_INT_SCORE[field] if field in BRAINWALK_FIELD_STRING_TO_INT_SCORE.keys() else {}
            value = 0
            string_entry = ""
            if field in row.keys():
                string_entry = row[field]
                value = map[string_entry]/(len(map.keys())-1)
                max_score = max(max_score,value)
            self.scores[field] = string_entry
        self.shade_intensity = self.intensity2color(max_score)

    def intensity2color(self,scale):
        """Interpolate from pale green to pale pink

        Boundaries:

            min, 0.0: #cccccc = (204, 204, 204)
            max, 1.0: #ff2000 = (255, 32, 0)
        """
        assert 0.0 <= scale <= 1.0
        baseline = 204
        max_rgb = (0, 32, 255)
        new_rbg = tuple(baseline + int(round(scale * (component - baseline)))
                        for component in max_rgb)
        return "#%02x%02x%02x" % new_rbg


    

        
        
            
    

