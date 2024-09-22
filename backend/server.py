from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from cerebrasAPI import cerebrasINF
from bson import ObjectId
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv
import os


load_dotenv()
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

    # Make sure to have mongoDB working before 
    
    # # Store patient data in MongoDB
    # patient = {
    #     "name": data['name'],
    #     "age": data['age'],
    #     "symptoms": data['symptoms'],
    #     "painLevel": data['painLevel'],
    #     "additionalInfo": data['additionalInfo'],
    #     "severity": severity,
    #     "explanation": explanation,
    #     "status": "waiting"
    # }
    # patients_collection.insert_one(patient)

    return jsonify({"message": "Data received", "Summary": [severity, explanation]}), 200


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
