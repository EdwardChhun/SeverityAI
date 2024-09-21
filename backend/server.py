import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize the Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Path to the JSON file
JSON_FILE_PATH = os.path.join(os.getcwd(), "patients.json")


# Helper functions to interact with JSON file
def load_patients():
    """Load the patients from the JSON file."""
    if not os.path.exists(JSON_FILE_PATH):
        return []
    with open(JSON_FILE_PATH, "r") as file:
        return json.load(file)


def save_patients(patients):
    """Save the patients to the JSON file."""
    with open(JSON_FILE_PATH, "w") as file:
        json.dump(patients, file, indent=4)


# API to submit new patient data
@app.route('/patient-data', methods=['POST'])
def patient_data():
    data = request.json

    # Construct data string for response (mocking your Cerebras call)
    parsed_data = f"There is a new patient named {data['name']} who is {data['age']} years old. The person's symptoms are {data['symptoms']} and their pain level is {data['painLevel']}. Additional Info: {data['additionalInfo']}"

    # Mocking a severity score, replace with actual AI call if necessary
    severity = "3"
    explanation = "Moderate condition based on symptoms."

    # Load patients from JSON
    patients = load_patients()

    # Add new patient data
    new_patient = {
        "id": len(patients) + 1,  # Simple auto-increment ID
        "name": data['name'],
        "age": data['age'],
        "symptoms": data['symptoms'],
        "painLevel": data['painLevel'],
        "additionalInfo": data['additionalInfo'],
        "severity": severity,
        "explanation": explanation,
        "status": "waiting"
    }
    patients.append(new_patient)

    # Save updated patients to JSON
    save_patients(patients)

    return jsonify({"message": "Data received", "Summary": [severity, explanation]}), 200


# API to get live patient data for the doctor portal
@app.route('/patients', methods=['GET'])
def get_patients():
    # Load patients from JSON
    patients = load_patients()

    # Filter patients by status 'waiting'
    waiting_patients = [p for p in patients if p["status"] == "waiting"]
    sorted_patients = sorted(waiting_patients, key=lambda p: int(p['severity']), reverse=True)

    return jsonify({"patients": sorted_patients})


# API for doctor to mark patient as 'seen'
@app.route('/mark-seen/<int:patient_id>', methods=['POST'])
def mark_seen(patient_id):
    # Load patients from JSON
    patients = load_patients()

    # Find patient by ID and update status to 'seen'
    for patient in patients:
        if patient["id"] == patient_id:
            patient["status"] = "seen"
            break
    else:
        return jsonify({"error": "Patient not found"}), 404

    # Save updated patients to JSON
    save_patients(patients)

    return jsonify({"message": "Patient marked as seen"})


# API to fetch seen patients
@app.route('/seen-patients', methods=['GET'])
def get_seen_patients():
    # Load patients from JSON
    patients = load_patients()

    # Filter patients by status 'seen'
    seen_patients = [p for p in patients if p["status"] == "seen"]
    
    return jsonify({"seen_patients": seen_patients})


if __name__ == '__main__':
    app.run(debug=True)
