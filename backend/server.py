from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from cerebrasAPI import cerebrasINF
from bson import ObjectId
import os

# Initialize the Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Initialize MongoDB client
client = MongoClient(os.getenv("MONGODB_URI"))
db = client['hospital_db']  # Specify the database
patients_collection = db['patients']  # Specify the collection for patients
seen_patients_collection = db['seen_patients']  # Collection for seen patients

# Doctor authentication (ensure to handle properly in frontend)
@app.route('/doctor-login', methods=['POST'])
def doctor_login():
    # Implement proper doctor authentication
    return jsonify({"message": "Doctor logged in successfully"})


# API to submit new patient data
@app.route('/patient-data', methods=['POST'])
def patient_data():
    data = request.json

    # Construct data string to send to Cerebras
    parsed_data = f"There is a new patient named {data['name']} who is {data['age']} years old. The person's symptoms are {data['symptoms']} and their pain level is {data['painLevel']}. Additional Info: {data['additionalInfo']}"

    # Call Cerebras to analyze the data and return a severity score
    llm_output = cerebrasINF(parsed_data)
    output_message = []
    for chunk in llm_output:
        content = chunk.choices[0].delta.content
        if content:
            output_message.append(content)

    full_message = ''.join(output_message)
    severity = full_message[0]
    explanation = full_message[3:]

    # Store patient data in MongoDB
    patient = {
        "name": data['name'],
        "age": data['age'],
        "symptoms": data['symptoms'],
        "painLevel": data['painLevel'],
        "additionalInfo": data['additionalInfo'],
        "severity": severity,
        "explanation": explanation,
        "status": "waiting"
    }
    patients_collection.insert_one(patient)

    return jsonify({"message": "Data received", "Summary": [severity, explanation]})


# API to get live patient data for the doctor portal
@app.route('/patients', methods=['GET'])
def get_patients():
    # Get all patients with status 'waiting'
    patients = list(patients_collection.find({"status": "waiting"}))
    sorted_patients = sorted(patients, key=lambda p: int(p['severity']), reverse=True)

    # Convert MongoDB _id (ObjectId) to string
    for patient in sorted_patients:
        patient['_id'] = str(patient['_id'])

    return jsonify({"patients": sorted_patients})


# API for doctor to mark patient as 'seen'
@app.route('/mark-seen/<patient_id>', methods=['POST'])
def mark_seen(patient_id):
    # Find patient by ID and update status to 'seen'
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if patient:
        # Move patient to seen_patients collection
        seen_patients_collection.insert_one(patient)
        # Delete from patients collection
        patients_collection.delete_one({"_id": ObjectId(patient_id)})
        return jsonify({"message": "Patient marked as seen"})
    else:
        return jsonify({"error": "Patient not found"}), 404


# API to fetch seen patients
@app.route('/seen-patients', methods=['GET'])
def get_seen_patients():
    seen_patients = list(seen_patients_collection.find())
    for patient in seen_patients:
        patient['_id'] = str(patient['_id'])
    return jsonify({"seen_patients": seen_patients})


if __name__ == '__main__':
    app.run(debug=True)
