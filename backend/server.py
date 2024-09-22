import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from cerebrasAPI import cerebrasAssignDoctor

app = Flask(__name__)
CORS(app)

# Paths to the JSON files
PATIENTS_FILE = os.path.join(os.getcwd(), "patients.json")
DOCTORS_FILE = os.path.join(os.getcwd(), "doctors.json")

# Helper functions
def load_json(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r") as file:
        return json.load(file)

def save_json(data, file_path):
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

# Auto-assign a doctor based on AI evaluation
def auto_assign_doctor(patient):
    doctors = load_json(DOCTORS_FILE)

    # Prepare patient info for AI
    patient_info = f"Patient {patient['name']}, age {patient['age']} with symptoms: {patient['symptoms']} and a pain level of {patient['painLevel']}."
    
    # Prepare doctor info for AI
    doctors_info = ", ".join([f"Dr. {doc['name']} ({doc['specialty']}, {len(doc['assignedPatients'])}/2 patients)" for doc in doctors])

    # Get AI's recommendation for severity and doctor assignment
    ai_response = cerebrasAssignDoctor(patient_info, doctors_info)
    
    # Extract severity and doctor recommendation from AI response
    severity = int(ai_response[0])  # Get severity as the first character (assuming it's a number)
    explanation = ai_response.split('\n')[0][3:]  # Rest of the line after severity
    assigned_doctor_name = ai_response.split('Assigned Doctor: ')[1].strip()

    # Find the doctor recommended by the AI
    assigned_doctor = next((doc for doc in doctors if doc['name'] == assigned_doctor_name), None)

    if assigned_doctor and len(assigned_doctor.get('assignedPatients', [])) < 2:
        # Assign the patient to the doctor
        assigned_doctor['assignedPatients'].append(patient['id'])
        patient['severity'] = severity
        patient['explanation'] = explanation
        patient['assignedDoctor'] = assigned_doctor['id']

        # Save the updated patient and doctor data
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

    # Auto-assign a doctor using AI
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
    doctor_id = data['DoctorId']

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
