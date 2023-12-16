#!/usr/bin/env python
"""Colorize the SVG by modifying the XML directly, via ElementTree."""
from __future__ import absolute_import, division, print_function
import random
import sys
from brainwalkrecord import BrainWalkData
from xml.etree import ElementTree as ET
import os 
import yaml


class ShapeStyle(object):
    base_styles = {
        "fill": "#cccccc",
        "fill-rule": "evenodd",
        "stroke": "grey",
        "stroke-width": "2px",
        "stroke-linecap": "butt",
        "stroke-linejoin": "miter",
        "stroke-opacity": 1,
    }

    def __init__(self,styles):
        styles = dict(styles)
        # Safety dance
        for k in styles:
            if k not in self.base_styles:
                raise ValueError("Unexpected style: %s" % k)
        self._styles = self.base_styles.copy()
        self._styles.update(styles)

    def __getitem__(self, key):
        return self._styles[key]

    def __setitem__(self, key, value):
        assert key in self._styles
        self._styles[key] = value

    def __str__(self):
        return ';'.join("%s:%s" % (k, v)
                        for k, v in sorted(self._styles.items()))

def all_labels(obj):
    """Flatten a YAML/JSON-sourced dict/list object tree.

    Returns all internal and external node labels in DFS pre-order.
    """
    def iter_dict(dc):
        for k, v in dc.items():
            yield k
            if isinstance(v, dict):
                for key in iter_dict(v):
                    yield key
            else:
                for val in v:
                    yield val

    assert isinstance(obj, dict)
    for key in iter_dict(obj):
        yield key


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

def execute(brainwalkrecord):
    ET.register_namespace("","http://www.w3.org/2000/svg")
    # take in names of body parts etc, write data
     # Take region names from the vocabulary definition file
    yaml_path = os.path.join(os.getcwd(), 'bodymap', 'maps','molemapper','molemapper.yaml')
    with open(yaml_path) as f:
        vocab_tree = yaml.full_load(f)
    labels = set(leaf_labels(vocab_tree))

    # Load the SVG as an XML tree
    svg_path = os.path.join(os.getcwd(), 'bodymap', 'maps','molemapper','molemapper.plain.svg')
    tree = ET.ElementTree(file=svg_path)
    for element in tree.iter():
        id = element.get("id")
        intensity = "#cccccc"
        if id in labels:
            intensity = brainwalkrecord.body_parts[id][0] if id in brainwalkrecord.body_parts.keys() else 0.0
        # get current style
        # then modify
        style = ShapeStyle({"fill": intensity})
        element.set("style", str(style))

    # Serialize the XML back to an SVG file
    final_path = os.path.join(os.getcwd(),'static','patient_avatars','avatar_patient_' + brainwalkrecord.patient_id +  '.svg')
    tree.write(final_path)


if __name__ == '__main__':
    execute()
