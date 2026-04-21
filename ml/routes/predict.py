# ml/routes/predict.py  — FULLY UPDATED version
# Handles ML predictions and smart fallback logic to prevent loops

from flask import Blueprint, request, jsonify
from services.ml_service import load_model, predict_diseases, is_model_ready

predict_bp = Blueprint('predict', __name__)

# Load model when this module is imported
model_loaded = load_model()

@predict_bp.route('/predict', methods=['POST']) 
def predict():
    try:
        data = request.get_json()
        
        # FIXED: Handles different ways the frontend sends text
        message = data.get('message') or data.get('text') or data.get('symptoms', '')
        history = data.get('conversation_history', [])

        if not message:
            return jsonify({'error': 'message is required'}), 400

        # 1. Try ML prediction FIRST
        if is_model_ready():
            predictions = predict_diseases(message, top_n=5)

            # High confidence (Over 30%) triggers the ML result
            if predictions and predictions[0]['confidence'] > 0.3:
                top = predictions[0]
                response = (
                    f"Based on your symptoms, this may be "
                    f"<strong>{top['name']} ({top['percentage']}%)</strong>. "
                )
                if len(predictions) > 1:
                    others = ', '.join(
                        f"{p['name']} ({p['percentage']}%)"
                        for p in predictions[1:3]
                    )
                    response += f"Other possibilities: {others}. "
                
                response += "How long have you had these symptoms and what is the severity (1-10)?"

                return jsonify({
                    'response'   : response,
                    'assessment' : {
                        'predictedConditions': predictions,
                        'severityLevel'      : None, 
                    },
                    'model_ready': True
                })

        # 2. Fallback if model is not confident (This is your smart logic)
        return jsonify({
            'response'   : get_fallback_response(message),
            'assessment' : None,
            'model_ready': is_model_ready()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_fallback_response(message):
    msg = message.lower().strip()

    # --- A. CHECK FOR ANSWERS TO PREVIOUS QUESTIONS (Prevents Loops) ---
    
    # Check if user provided severity (a number)
    digits = ''.join(filter(str.isdigit, msg))
    if digits:
        score = int(digits)
        if score >= 7:
            return 'That level of severity is high. I recommend seeing a doctor today. Are you experiencing any other symptoms like fever or difficulty breathing?'
        elif score >= 4:
            return 'Moderate severity detected. Monitor your symptoms closely. Have you had any fever or body aches alongside this?'
        else:
            return 'That seems mild. Stay hydrated and rest. Has it been getting worse or staying the same?'

    # Check for duration keywords
    if any(w in msg for w in ['day', 'week', 'hour', 'yesterday', 'morning']):
        return 'Thank you for the update. Based on the duration, please continue monitoring. If symptoms worsen or fever develops, consult a doctor.'

    # Check for cough details
    if any(w in msg for w in ['dry', 'wet', 'mucus', 'phlegm', 'productive']):
        return 'Understood. How long have you had this cough, and have you noticed any shortness of breath?'

    # Check for simple confirmation
    if msg in ['yes', 'no', 'yeah', 'nope', 'yep']:
        return 'I understand. Please describe any other symptoms you are experiencing so I can help better.'

    # --- B. PRIMARY SYMPTOM DETECTION (First Questions) ---
    
    if 'chest' in msg and ('pain' in msg or 'tight' in msg):
        return 'EMERGENCY: Chest pain can be serious. Please call 102 or visit an emergency room immediately.'
    
    if 'headache' in msg or 'head' in msg:
        return 'I understand you have a headache. How severe is it on a scale of 1–10? Is it on one side or both?'
    
    if 'fever' in msg or 'temperature' in msg:
        return 'How high is your temperature and how long have you had it? Any chills or body aches?'
    
    if 'cough' in msg:
        return 'Is it a dry cough or with mucus? How long have you had it? Any breathlessness?'
    
    if 'stomach' in msg or 'abdomen' in msg or 'belly' in msg:
        return 'Where is the pain located — upper, lower, or all over? Is it constant or intermittent?'
    
    if 'tired' in msg or 'fatigue' in msg or 'weak' in msg:
        return 'How long have you been feeling this fatigue? Does it affect your daily work?'

    # --- C. DEFAULT FALLBACK ---
    return 'Could you describe your main symptom in more detail? For example: where does it hurt and how long has it been happening?'