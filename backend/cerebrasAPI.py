from dotenv import load_dotenv
import os
from cerebras.cloud.sdk import Cerebras

# Load environment variables
load_dotenv()
def cerebrasAssignDoctor(patient_info, doctors_info):
    """
    Uses the Cerebras AI to assign a doctor based on patient info and doctors' availability.
    """
    client = Cerebras(
        api_key=os.getenv("CEREBRAS_API_KEY")  # Ensure this loads from .env
    )

    # Modify the system message to restrict doctor selection
    messages = [
        {
            "role": "system",
            "content": f"""
            You are a task-focused assistant for hospital management, responsible for evaluating 
            the severity of emergency room patients and assigning them to the most appropriate and available doctor.
            You must strictly choose from the following list of doctors only: {doctors_info}. Do not create new doctors. 
            Only assign doctors with fewer than two patients. Respond in the following format:
            N: Severity Explanation
            Assigned Doctor: [Doctor's Name]
            """
        },
        {
            "role": "user",
            "content": f"Patient Info: {patient_info}, Doctors Info: {doctors_info}"
        }
    ]

    # Generate the stream for the AI model
    try:
        stream = client.chat.completions.create(
            messages=messages,
            model="llama3.1-8b",  # Specify the model being used
            stream=True,  # Stream results
            max_tokens=1024,  # Token limit
            temperature=1,  # Control randomness
            top_p=1  # Sampling parameter
        )

        # Collect and return the response from the AI stream
        output_message = []
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                output_message.append(content)

        # Combine the response into a single string
        return ''.join(output_message)

    except Exception as e:
        print(f"Error in Cerebras AI assignment: {e}")
        return None
