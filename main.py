from flask import Flask, request
from flask import jsonify
from flask import render_template
from brainwalkrecord import BrainWalkData
import matplotlib.pyplot as plt, mpld3
from MediPlot import BodyMap
from bodymap.demo import execute
import svgwrite
import os
import csv

'''
TODOs:
1. Change RGB color scheme from blues to pale green to pale red
2. Iterate through svg tree instead of yaml labels in brainwalkrecord
3. Try to think about adding support for other types of metrics coming from brainwalk
4. Formatting tooltip
5. Rendering tooltip next to 
6. Add date filtering
'''

app = Flask(__name__)

@app.route('/')
def main():
    patientId = request.args.get('patientId')
    file_name = 'avatar_data.csv'
    file_path = os.path.join(os.getcwd(), 'static', file_name)
    with open(file_path, 'r',encoding="Windows-1252") as csvfile:
        # Create a CSV reader object
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            # add logic here to get max date
            if row['DeID'] == patientId:
                brainWalkData = BrainWalkData(row)
                execute(brainWalkData)
                return render_template('index.html',patientId=patientId,data=brainWalkData.body_parts)
            break
        return render_template('index.html',patientId=patientId)
    
if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True)

