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
                "content": "You are ranking patients who have arrived in the emergency room on a scale of 1 to 5 where 1 is the least severe (can wait a while before seeing a doctor) to 5 being the most severe (immediate medical attention needed). The will see a doctor shortly, but we are understaffed and need your help to decide the severity of various ailments. They will provide their name, age, symptoms, pain level from 1 (no pain) to 10 (extreme pain), and additional information. For example, having severe heart or lung failure is a 5, a bullet wound is a 4, a broken bone is a 2, having a fever is a 1. The response should be in the format N: Explanation. For example, for someone who is experiencing a heart attack, you would reply '5: Heart attacks require immediate medical attention and given your information, continue on.'"
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


    return stream