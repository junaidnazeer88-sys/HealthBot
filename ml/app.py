from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)

# This line is CRITICAL: It allows your React app (port 3000) 
# to talk to this Python server (port 5000)
CORS(app)

# --- MODEL LOADING ---
# Try to load your trained model. 
# If you don't have a 'model.pkl' yet, we use a fallback response.
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✅ ML Model loaded successfully!")
except FileNotFoundError:
    model = None
    print("⚠️ Model file not found - using fallback responses")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "HealthBot ML service is running"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        symptoms = data.get('symptoms', '').lower()

        # LOGIC: If model exists, use it. Otherwise, use simple keyword matching.
        if model:
            # Here you would transform 'symptoms' text into the format your model needs
            # Example: prediction = model.predict(transformed_input)
            prediction = "Based on the model, you might have a common cold." 
        else:
            # Fallback Logic (Keyword matching)
            if 'fever' in symptoms or 'headache' in symptoms:
                prediction = "It sounds like you might have a viral infection. Please rest and stay hydrated."
            elif 'cough' in symptoms or 'throat' in symptoms:
                prediction = "This could be a respiratory issue. If it persists, see a doctor."
            elif 'stomach' in symptoms or 'nausea' in symptoms:
                prediction = "You might be experiencing digestive distress."
            else:
                prediction = "I'm not quite sure. Could you describe your symptoms in more detail?"

        return jsonify({"prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/severity', methods=['POST'])
def check_severity():
    # Simple logic to determine if the user needs urgent care
    data = request.json
    symptoms = data.get('symptoms', '').lower()
    
    urgent_keywords = ['chest pain', 'breath', 'unconscious', 'bleeding']
    is_urgent = any(word in symptoms for word in urgent_keywords)
    
    return jsonify({
        "severity": "High" if is_urgent else "Low",
        "action": "Seek emergency care immediately!" if is_urgent else "Monitor symptoms."
    })

if __name__ == '__main__':
    print("🚀 HealthBot ML service starting on port 5000")
    app.run(port=5000, debug=True)