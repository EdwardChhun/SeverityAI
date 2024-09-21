from dotenv import load_dotenv
import os
from cerebras.cloud.sdk import Cerebras

def cerebrasINF(patient_info):
    client = Cerebras(
        api_key=os.getenv("CEREBRAS_API_KEY")  # Ensure this is correctly set in the .env file
    )

    stream = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are ranking patients who have arrived in the emergency room on a scale of 1 to 5..."
            },
            {
                "role": "user",
                "content": patient_info
            }
        ],
        model="llama3.1-8b",  # Ensure the correct model is used
        stream=True,
        max_tokens=1024,
        temperature=1,
        top_p=1
    )

    return stream
