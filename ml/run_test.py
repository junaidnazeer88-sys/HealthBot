from services.nlp_service import extract_symptoms, extract_duration, extract_severity_words
import pandas as pd
import os

# Get the path to your CSV
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'Training.csv')

# Load symptom list
df = pd.read_csv(DATA_PATH)
cols = df.columns[:-1].tolist()

tests = [
    "my head is killing me and i feel like throwing up",
    "I have high fever and chills since 2 days",
    "chest pain and difficulty breathing"
]

print("\n" + "="*30)
print(" HealthBot NLP Test ")
print("="*30)

for t in tests:
    print(f"\nInput   : {t}")
    print(f"Symptoms: {extract_symptoms(t, cols)}")
    print(f"Duration: {extract_duration(t)}")
    print(f"Severity: {extract_severity_words(t)}")
    print("-" * 30)