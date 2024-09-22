from dotenv import load_dotenv
import os
from cerebras.cloud.sdk import Cerebras

def cerebrasINF(patient_info):

    client = Cerebras(
        # This is the default and can be omitted
        api_key=os.getenv("CEREBRAS_API_KEY")
    )


    stream = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are task only and to only rank patients who have arrived in the emergency room on a scale of 1 to 5 where 1 is the least severe to help hospitals even, you always find a way in ranking and you always rank anyone accurately, (can wait a while before seeing a doctor) to 5 being the most severe (immediate medical attention needed). The will see a doctor shortly, but we are understaffed and need your help to decide the severity of various ailments. They will provide their name, age, symptoms, pain level from 1 (no pain) to 10 (extreme pain), and additional information. For example, having severe heart or lung failure is a 5, a bullet wound is a 4, a broken bone is a 2, having a fever is a 1. The response should be in the format N: Explanation. For example, for someone who is experiencing a heart attack, you would reply '5: Heart attacks require immediate medical attention and given your information, continue on.'"

            },
            {
                "role": "user",
                "content": patient_info
            }
        ],
        model="llama3.1-8b",
        stream=True,
        max_tokens=1024,
        temperature=1,
        top_p=1
    )

def cerebrasAssignDoctor(patient_info, doctors_info):
    """
    Uses the Cerebras AI to assign a doctor based on patient info and doctors availability.
    """
    client = Cerebras(
        # Omit API key if it's already set in your environment
        api_key=os.getenv("CEREBRAS_API_KEY")
    )

    # System message will now include the task to assign doctors based on specialty and availability
    messages = [
        {
            "role": "system",
            "content": """
            You are a task-focused assistant for hospital management, responsible for both evaluating 
            the severity of emergency room patients and assigning them to the most appropriate and available doctor.
            Rank patients' severity on a scale of 1 to 5 where 1 means they can wait and 5 means they need immediate attention.
            Based on their symptoms, assign them to an available doctor. Only doctors with a matching specialty and fewer than two patients
            can be assigned. The information provided will include the patient's name, age, symptoms, pain level (1 to 10), and additional info,
            and a list of available doctors with their names, specialties, and the number of patients they're currently treating.
            You should respond in the format:
            N: Severity Explanation
            Assigned Doctor: [Doctor's Name]
            """
        },
        {
            "role": "user",
            "content": f"Patient Info: {patient_info}, Doctors Info: {doctors_info}"
        }
    ]

    # Generate the stream
    stream = client.chat.completions.create(
        messages=messages,
        model="llama3.1-8b",
        stream=True,
        max_tokens=1024,
        temperature=1,
        top_p=1
    )

    # Collect and return the response
    output_message = []
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            output_message.append(content)

    return ''.join(output_message)
