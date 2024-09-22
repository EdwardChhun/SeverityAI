import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from cerebrasAPI import cerebrasINF

# Initialize the Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Path to the JSON files
PATIENTS_FILE = os.path.join(os.getcwd(), "patients.json")
DOCTORS_FILE = os.path.join(os.getcwd(), "doctors.json")

# Helper functions to interact with JSON files
def load_json(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r") as file:
        return json.load(file)

def save_json(data, file_path):
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

# Auto-assign a patient based on AI evaluation
def auto_assign_doctor(patient):
    doctors = load_json(DOCTORS_FILE)

    # Get the patient details as input for the AI
    patient_info = f"There is a patient named {patient['name']} who is {patient['age']} years old. They are experiencing {patient['symptoms']} with a pain level of {patient['painLevel']}."

    # Call the AI to rank severity
    ai_response = cerebrasINF(patient_info)
    
    output_message = []
    for chunk in ai_response:
        content = chunk.choices[0].delta.content
        if content:
            output_message.append(content)
    
    full_message = ''.join(output_message)
    severity = int(full_message[0])  # Extract the severity score
    explanation = full_message[3:]

    # Find an available doctor in the doctors.json list
    available_doctors = [doc for doc in doctors if len(doc.get('assignedPatients', [])) < 2]

    if available_doctors:
        # Auto-assign the first available doctor in the list
        assigned_doctor = available_doctors[0]
        assigned_doctor_id = assigned_doctor['id']
        assigned_doctor['assignedPatients'].append(patient['id'])

        # Update the patient record
        patient['severity'] = severity
        patient['explanation'] = explanation
        patient['assignedDoctor'] = assigned_doctor_id

        # Save updated data
        save_json(doctors, DOCTORS_FILE)
        return assigned_doctor
    else:
        return None

# Automatically assign new patients when they are added
@app.route('/add-patient', methods=['POST'])
def add_patient():
    data = request.json
    patients = load_json(PATIENTS_FILE)

    # Add the new patient to the list
    new_patient = {
        "id": str(len(patients) + 1),
        "name": data['name'],
        "age": data['age'],
        "symptoms": data['symptoms'],
        "painLevel": data['painLevel'],
        "severity": None,
        "explanation": None,
        "assignedDoctor": None
    }
    patients.append(new_patient)

    # Assign a doctor to the new patient automatically
    assigned_doctor = auto_assign_doctor(new_patient)

    # Save the updated patient list
    save_json(patients, PATIENTS_FILE)

    if assigned_doctor:
        return jsonify({"message": f"Patient assigned to Dr. {assigned_doctor['name']}"}), 200
    else:
        return jsonify({"message": "No doctors available at the moment"}), 200

# Load doctors and patients
@app.route('/load-data', methods=['GET'])
def load_data():
    patients = load_json(PATIENTS_FILE)
    doctors = load_json(DOCTORS_FILE)
    return jsonify({"patients": patients, "doctors": doctors})

# Reassign a patient to a different doctor manually (Nurse override)
@app.route('/assign-patient', methods=['POST'])
def assign_patient():
    data = request.json
    patient_id = data['patientId']
    doctor_id = data['doctorId']

    # Load current data
    patients = load_json(PATIENTS_FILE)
    doctors = load_json(DOCTORS_FILE)

    # Find the patient and doctor
    patient = next((p for p in patients if p['id'] == patient_id), None)
    doctor = next((d for d in doctors if d['id'] == doctor_id), None)

    if patient and doctor:
        # Check if the doctor is already assigned to 2 patients
        if len(doctor['assignedPatients']) >= 2:
            return jsonify({"error": "Doctor is at capacity"}), 400

        # Assign patient to doctor
        doctor['assignedPatients'].append(patient_id)
        patient['assignedDoctor'] = doctor_id

        # Save updated data
        save_json(patients, PATIENTS_FILE)
        save_json(doctors, DOCTORS_FILE)

        return jsonify({"message": "Patient reassigned to doctor"}), 200
    else:
        return jsonify({"error": "Patient or doctor not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
