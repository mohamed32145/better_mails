from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://dafockjdmflndfkpikgagocddepdjmnj", "http://localhost:8000"],  # Add your Chrome extension ID here
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

model_path = 'backend/app/data/email_classifier_model.h5'
model = load_model('email_classifier_model.h5')

# Load the tokenizer
with open('tokenizer.pkl', 'rb') as f:
    tokenizer = pickle.load(f)


# Define the request structure
class EmailContent(BaseModel):
    email_text: str

# Placeholder function to simulate deep learning model
def should_improve_email(email_text: str) -> bool:
    # Tokenize and pad the email text
    new_email_seq = tokenizer.texts_to_sequences([email_text])
    new_email_padded = pad_sequences(new_email_seq, maxlen=model.input_shape[1])

    # Make the prediction
    prediction = model.predict(new_email_padded)
    
    # Convert prediction to binary (0 or 1)
    is_respectful = (prediction > 0.5).astype("int32")
    
    # If the email is considered rude (0), return True to improve it
    return not bool(is_respectful)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the homepage!"}



#a route to processing the mail 
@app.post("/process_email/")
def process_email(email: EmailContent):
    decision = should_improve_email(email.email_text)
    return {"improve": decision}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
