import joblib
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'disease_model.pkl')
DATA_PATH = os.path.join(BASE_DIR, 'data', 'Training.csv')

# 1. Load the Model and the Data
print("Loading HealthBot brain...")
model = joblib.load(MODEL_PATH)
df = pd.read_csv(DATA_PATH)
symptom_columns = df.columns[:-1].tolist()

# 2. Get the official list of diseases from the dataset
# This maps numbers like 15 back to names like 'Fungal infection'
disease_names = sorted(df['prognosis'].unique())

def get_final_prediction(test_symptoms):
    input_vector = np.zeros(len(symptom_columns))
    
    for s in test_symptoms:
        if s in symptom_columns:
            input_vector[symptom_columns.index(s)] = 1
        else:
            print(f"⚠️ Warning: '{s}' not found in dataset columns.")

    # Get probabilities
    probs = model.predict_proba([input_vector])[0]
    top_idx = np.argsort(probs)[-1]
    
    # Map the numeric index to the actual disease name
    disease_name = disease_names[top_idx]
    confidence = probs[top_idx] * 100
    
    return disease_name, confidence

# --- THE PRESENTATION TEST ---
print("\n" + "="*35)
print("   HEALTHBOT AI DIAGNOSTIC TEST   ")
print("="*35)

# Test Case: Fungal Infection
# Note the space in 'dischromic _patches' which we found earlier!
test_case = ['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic _patches'] 

disease, conf = get_final_prediction(test_case)

print(f"Input Symptoms : {test_case}")
print(f"AI Prediction  : {disease}")
print(f"Confidence     : {conf:.2f}%")
print("-" * 35)