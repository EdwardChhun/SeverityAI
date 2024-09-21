from flask import Flask, request, jsonify
from flask_cors import CORS

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