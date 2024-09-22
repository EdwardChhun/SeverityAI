import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from cerebrasAPI import cerebrasAssignDoctor

app = Flask(__name__)
CORS(app)

# Doctor authentication (ensure to handle properly in frontend)
@app.route('/doctor-login', methods=['POST'])
def doctor_login():
    # Implement proper doctor authentication
    return jsonify({"message": "Doctor logged in successfully"})

client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))

@app.route('/chat/initialize', methods=['POST'])
def initialize_chat():
    summary = request.json['summary']
    
    # Create a system message that includes the patient summary and instructions
    system_message =  f"""You are an AI assistant replying in short few clauses in an emergency room triage system. You have the following information about a patient: {summary} Based on this information, provide an initial message to the patient. Be empathetic, reassuring, and ask if they need any immediate assistance or have any questions. Do not provide medical advice or diagnosis. Respond initially with a short message that is concise and empathetic enough to prone the user to give up more information that could be important for doctors"""
    
    # Generate the initial response using Cerebras
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": "Please provide an initial message to the patient."}
        ],
        model="llama3.1-8b",
        max_tokens=150
    )
    
    initial_response = response.choices[0].message.content
    return jsonify({'response': initial_response})

@app.route('/chat', methods=['POST'])
def chatbot():
    user_message = request.json['message']
    patient_summary = request.json.get('summary', '')  # Get the summary if provided
    
    # Create a system message that includes the patient summary
    system_message = f"""You are an AI assistant in an emergency room triage system. 
    You have the following information about a patient:

    {patient_summary}

    Provide empathetic and helpful responses to the patient's questions or concerns. 
    Do not provide medical advice or diagnosis. If the patient's condition seems to 
    worsen or they report new severe symptoms, advise them to immediately notify the medical staff. 
    Do not use bold letters in your responses."""

    # Create a chat completion using Cerebras
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        model="llama3.1-8b",
        max_tokens=150
    )
    
    bot_response = response.choices[0].message.content
    return jsonify({'response': bot_response})

# API to submit new patient data
@app.route('/patient-data', methods=['POST'])
def patient_data():
# Paths to the JSON files
PATIENTS_FILE = os.path.join(os.getcwd(), "patients.json")
DOCTORS_FILE = os.path.join(os.getcwd(), "doctors.json")

import logging

# Setup logging configuration
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Helper functions
def load_json(file_path):
    logging.debug(f"Loading data from {file_path}")
    if not os.path.exists(file_path):
        logging.warning(f"File {file_path} does not exist.")
        return []
    with open(file_path, "r") as file:
        return json.load(file)

def save_json(data, file_path):
    logging.debug(f"Saving data to {file_path}")
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

def auto_assign_doctor(patient):
    doctors = load_json(DOCTORS_FILE)

    # Create a strict list of available doctors
    doctors_info = ", ".join([f"Dr. {doc['name']} ({doc['specialty']}, {len(doc['assignedPatients'])}/2 patients)" for doc in doctors])

    # Send patient info and doctor info to the AI
    try:
        ai_response = cerebrasAssignDoctor(f"Patient {patient['name']}, age {patient['age']} with symptoms: {patient['symptoms']} and a pain level of {patient['painLevel']}.", doctors_info)
        severity = int(ai_response[0])  # Parse severity from response
        explanation = ai_response.split('\n')[0][3:]  # Parse explanation
        assigned_doctor_name = ai_response.split('Assigned Doctor: ')[1].strip()

        # Find the recommended doctor by the AI in the list of doctors
        assigned_doctor = next((doc for doc in doctors if doc['name'] == assigned_doctor_name), None)

        if assigned_doctor and len(assigned_doctor.get('assignedPatients', [])) < 2:
            # Assign the patient to the doctor
            assigned_doctor['assignedPatients'].append(patient['id'])
            patient['severity'] = severity
            patient['explanation'] = explanation
            patient['assignedDoctor'] = assigned_doctor['id']

            # Save updated data
            save_json(doctors, DOCTORS_FILE)
            save_json(load_json(PATIENTS_FILE), PATIENTS_FILE)
            return assigned_doctor
        else:
            return None
    except Exception as e:
        print(f"AI assignment failed: {e}")
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
@app.route('/assign-patient', methods=['POST'])
@app.route('/assign-patient', methods=['POST'])
def assign_patient():
    data = request.json
    patient_id = data['patientId']
    doctor_id = data['doctorId']  # Corrected key name

    logging.debug(f"Assigning doctor {doctor_id} to patient {patient_id}")

    # Load current data
    patients = load_json(PATIENTS_FILE)
    doctors = load_json(DOCTORS_FILE)

    # Find the patient and doctor
    patient = next((p for p in patients if p['id'] == patient_id), None)
    doctor = next((d for d in doctors if d['id'] == doctor_id), None)

    if patient and doctor:
        # Check if the patient already has an assigned doctor
        if patient['assignedDoctor']:
            logging.debug(f"Patient {patient_id} already assigned to doctor {patient['assignedDoctor']}. Reassigning.")
            # Remove the patient from the currently assigned doctor
            current_doctor = next((d for d in doctors if d['id'] == patient['assignedDoctor']), None)
            if current_doctor:
                current_doctor['assignedPatients'].remove(patient_id)
        
        # Check if the new doctor is already assigned to 2 patients
        if len(doctor['assignedPatients']) >= 2:
            logging.warning(f"Doctor {doctor_id} is at capacity")
            return jsonify({"error": "Doctor is at capacity"}), 400

        # Assign patient to the new doctor
        doctor['assignedPatients'].append(patient_id)
        patient['assignedDoctor'] = doctor_id

        logging.debug(f"Successfully assigned doctor {doctor_id} to patient {patient_id}")

        # Save updated data
        save_json(patients, PATIENTS_FILE)
        save_json(doctors, DOCTORS_FILE)

        return jsonify({"message": f"Patient reassigned to Dr. {doctor['name']}"}), 200
    else:
        logging.error(f"Patient {patient_id} or doctor {doctor_id} not found")
        return jsonify({"error": "Patient or doctor not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
