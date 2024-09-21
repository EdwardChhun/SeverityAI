from flask import Flask, request, jsonify
from flask_cors import CORS
from propelauth_flask import init_auth, current_user
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)  # This allows all origins by default

@app.route('/patient-data', methods=['POST'])
def patient_data():
    data = request.json
    
    # Parse the data into a simple string
    parsed_data = f"Name: {data['name']}, Age: {data['age']}, Symptoms: {data['symptoms']}, Pain Level: {data['painLevel']}, Additional Info: {data['additionalInfo']}"
    
    return jsonify({"message": "Data received", "parsed_data": parsed_data})

if __name__ == '__main__':
    app.run(debug=True)


auth = init_auth(os.getenv("AUTH_URL"), os.getenv("AUTH_API_KEY"))

@app.route("/api/whoami")
@auth.require_user
def who_am_i():
    """This route is protected, current_user is always set"""
    return {"user_id": current_user.user_id}

