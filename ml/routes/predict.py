# ml/routes/predict.py  — UPDATED version
# Now uses the trained ML model instead of keyword fallbacks

from flask import Blueprint, request, jsonify
from services.ml_service import load_model, predict_diseases, is_model_ready

predict_bp = Blueprint('predict', __name__)

# Load model when this module is imported
model_loaded = load_model()

@predict_bp.route('/predict', methods=['POST'])
def predict():
    try:
        data    = request.get_json()
        message = data.get('message', '')
        history = data.get('conversation_history', [])

        if not message:
            return jsonify({'error': 'message is required'}), 400

        # Try ML prediction
        if is_model_ready():
            predictions = predict_diseases(message, top_n=5)

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
                response += "How long have you had these symptoms?"

                return jsonify({
                    'response'   : response,
                    'assessment' : {
                        'predictedConditions': predictions,
                        'severityLevel'      : None,  # set by /severity
                    },
                    'model_ready': True
                })

        # Fallback if model not confident enough
        return jsonify({
            'response'   : get_fallback_response(message),
            'assessment' : None,
            'model_ready': is_model_ready()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def  get_fallback_response(message):
    msg = message.lower()
    if 'chest' in msg and ('pain' in msg or 'tight' in msg):
        return 'EMERGENCY: Chest pain can be serious. Call 102 immediately.'
    if 'headache' in msg:
        return 'I understand you have a headache. How severe is it on a scale of 1–10? Is it on one side or both?'
    if 'fever' in msg:
        return 'How high is your temperature and how long have you had it? Any chills or body aches?'
    if 'cough' in msg:
        return 'Is it a dry cough or with mucus? How long have you had it?'
    if 'stomach' in msg or 'abdomen' in msg:
        return 'Where is the pain — upper, lower, or all over? Constant or intermittent?'
    return 'Thank you. How long have you had this, and on a scale of 1–10, how severe is it?'
