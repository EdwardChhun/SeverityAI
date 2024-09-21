from flask import Flask, request, jsonify
from flask_cors import CORS
from propelauth_flask import init_auth, current_user
from dotenv import load_dotenv
import os
from cerebrasAPI import cerebrasINF
from cerebras.cloud.sdk import Cerebras

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



auth = init_auth(os.getenv("AUTH_URL"), os.getenv("AUTH_API_KEY"))

@app.route("/api/whoami")
@auth.require_user
def who_am_i():
    """This route is protected, current_user is always set"""
    return {"user_id": current_user.user_id}

client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))

@app.route('/chat', methods=['POST'])
def chatbot():
    user_message = request.json['message']
    
    # Create a chat completion using Cerebras
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_message}
        ],
        model="llama3.1-8b",
        max_tokens=150
    )
    
    bot_response = response.choices[0].message.content
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    app.run(debug=True)