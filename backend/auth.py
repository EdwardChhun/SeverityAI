from propelauth_flask import init_auth
from dotenv import load_dotenv
import os
load_dotenv()

auth = init_auth(
    os.getenv("AUTH_URL"),
    os.getenv("AUTH_API_KEY"),
)            
