from flask import Blueprint, request, jsonify
import joblib
import os

predict_bp = Blueprint('predict', __name__)

# Load model once at startup — not on every request
MODEL_PATH = os.getenv('MODEL_PATH', 'models/disease_model.pkl')
VECTORIZER_PATH = os.getenv('VECTORIZER_PATH', 'models/vectorizer.pkl')

model = None
vectorizer = None

def load_model():
    global model, vectorizer
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        print('ML model loaded successfully')
    else:
        print('WARNING: Model files not found — using fallback responses')

# Load on import
load_model()

@predict_bp.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('conversation_history', [])

        # If model not loaded yet — return fallback response
        if model is None:
            return jsonify({
                'response': get_fallback_response(message),
                'assessment': None,
                'model_ready': False
            })

        # TODO: Phase 4 — add full ML prediction here
        # For now return smart fallback
        return jsonify({
            'response': get_fallback_response(message),
            'assessment': None,
            'model_ready': False
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_fallback_response(message):
    """Smart keyword-based responses until ML model is trained."""
    msg = message.lower()
    if 'chest' in msg and ('pain' in msg or 'tight' in msg):
        return ('EMERGENCY: Chest pain can be serious. '
                'Please call 102 immediately.')
    if 'headache' in msg:
        return 'I understand you have a headache. How severe is it on a scale of 1–10? Is it on one side or both?'
    if 'fever' in msg:
        return 'How high is your temperature and how long have you had it? Any chills or body aches?'
    if 'cough' in msg:
        return 'Is it a dry cough or with mucus? How long have you had it? Any breathlessness?'
    if 'stomach' in msg or 'abdomen' in msg:
        return 'Where is the pain — upper, lower, or all over? Constant or comes and goes?'
    if 'nausea' in msg or 'vomit' in msg:
        return 'How long have you felt nauseous? Did it come on suddenly? Any fever alongside it?'
    return 'Thank you for sharing. How long have you had this, and on a scale of 1–10, how severe is it?'