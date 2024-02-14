import logging
from flask import Flask, request, jsonify
from flask import render_template
from brainwalkrecord import BrainWalkData
import os
import csv
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
    with open(file_path, 'r',encoding="Windows-1252") as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            if row['DeID'] == patientId:
                brainWalkData = BrainWalkData(row)
                return jsonify(brainWalkData.body_parts)
    return jsonify({})
    
if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True)

