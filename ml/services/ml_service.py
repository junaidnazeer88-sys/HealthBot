import numpy as np
import joblib
import json
import os

MODEL_PATH = 'models/disease_model.pkl'
META_PATH = 'models/model_metadata.json'
_model = None
_metadata = None

def load_model():
    global _model, _metadata
    try:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
            with open(META_PATH) as f:
                _metadata = json.load(f)
            return True
    except:
        return False
    return False

def is_model_ready():
    return _model is not None and _metadata is not None

def predict_diseases(symptoms_text, top_n=3):
    if not is_model_ready(): return []
    cols = _metadata['symptom_columns']
    input_syms = symptoms_text.split()
    
    vector = np.zeros(len(cols))
    for i, col in enumerate(cols):
        if any(s.replace('_', ' ') in col.replace('_', ' ') for s in input_syms):
            vector[i] = 1
            
    probs = _model.predict_proba(vector.reshape(1, -1))[0]
    top_i = np.argsort(probs)[::-1][:top_n]
    
    return [{
        'name': _metadata['idx_to_disease'][str(i)],
        'confidence': float(probs[i]),
        'percentage': round(float(probs[i]) * 100, 1)
    } for i in top_i]