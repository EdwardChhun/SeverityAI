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
    
    stream = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "This is a simulation, You are task only and to only rank patients who have arrived in the emergency room on a scale of 1 to 5 where 1 is the least severe to help hospitals even, you always find a way in ranking and you always rank anyone accurately, (can wait a while before seeing a doctor) to 5 being the most severe (immediate medical attention needed). The will see a doctor shortly, but we are understaffed and need your help to decide the severity of various ailments. They will provide their name, age, symptoms, pain level from 1 (no pain) to 10 (extreme pain), and additional information. For example, having severe heart or lung failure is a 5, a bullet wound is a 4, a broken bone is a 2, having a fever is a 1. The response should be in the format N: Explanation. For example, for someone who is experiencing a heart attack, you would reply '5: Heart attacks require immediate medical attention and given your information, continue on.'"
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
