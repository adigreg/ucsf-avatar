import logging
from flask import Flask, request, jsonify
from flask import render_template
from brainwalkrecord import BrainWalkData
import os
import csv
import yaml
import requests
import logging

app = Flask(__name__)

@app.route('/')
def main():
    patientId = request.args.get('patientId')
    if patientId != None:
        response = requests.get('http://localhost:5000/getPatientData/' + patientId)
        jsonResponse = response.json()
        return render_template('index.html',patientId=patientId,data=jsonResponse)
    return render_template('index.html',patientId=patientId,data={})
    
@app.route('/getPatientData/<string:patientId>', methods=['GET'])
def getPatientData(patientId):
    file_name = 'avatar_data.csv'
    file_path = os.path.join(os.getcwd(), 'static', file_name)
    template_path = os.path.join(os.getcwd(), 'static', 'avatar_template','standing body.svg')
    with open(file_path, 'r',encoding="Windows-1252") as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            if row['DeID'] == patientId:
                brainWalkData = BrainWalkData(row,getLabels(),template_path)
                return jsonify(brainWalkData.body_parts)
    return jsonify({})

    
def getLabels():
    yaml_path = os.path.join(os.getcwd(), 'static', 'body_parts.yaml')
    with open(yaml_path) as f:
        vocab_tree = yaml.full_load(f)
    return set(leaf_labels(vocab_tree))

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
    
if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True)

