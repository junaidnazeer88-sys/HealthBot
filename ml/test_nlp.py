import sys
import os
import pandas as pd

# Ensure the script can see the 'services' folder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.nlp_service import NLPService

# Load symptoms from CSV
df = pd.read_csv('data/Training.csv')
symptom_columns = df.columns[:-1].tolist()

tests = [
    "my head is killing me and i feel like throwing up",
    "I have high fever and chills since 2 days",
    "chest pain and difficulty breathing"
]

print("\n" + "="*30)
print(" NLP EXTRACTION TESTS ")
print("="*30 + "\n")

for text in tests:
    symptoms, corrected = NLPService.extract_symptoms(text, symptom_columns)
    duration = NLPService.extract_duration(text)
    severity = NLPService.extract_severity_words(text)

    print(f"Input     : {text}")
    print(f"Corrected : {corrected}")
    print(f"Symptoms  : {symptoms}")
    print(f"Duration  : {duration}")
    print(f"Severity  : {severity}/10")
    print("-" * 30)