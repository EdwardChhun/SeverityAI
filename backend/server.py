from flask import Flask, request, jsonify
from flask_cors import CORS
from cerebrasAPI import cerebrasINF
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
    parsed_data = f"There is a new patient named {data['name']} who is {data['age']} years old. The person's symptoms are {data['symptoms']} and their pain level is {data['painLevel']}. Additional Info: {data['additionalInfo']}"
    
    llm_output = cerebrasINF(parsed_data)
    output_message = []
    # Assuming llm_output is the stream you are receiving chunks from
    for chunk in llm_output:
        # Check if there's content in this chunk
        content = chunk.choices[0].delta.content
        if content:
            output_message.append(content)

    # Combine the chunks to get the full message
    full_message = ''.join(output_message)
    severity = full_message[0]
    explanation = full_message[3:]

    return jsonify({"message": "Data received", "Summary": [severity,explanation]})

if __name__ == '__main__':
    app.run(debug=True)


auth = init_auth(os.getenv("AUTH_URL"), os.getenv("AUTH_API_KEY"))

@app.route("/api/whoami")
@auth.require_user
def who_am_i():
    """This route is protected, current_user is always set"""
    return {"user_id": current_user.user_id}

