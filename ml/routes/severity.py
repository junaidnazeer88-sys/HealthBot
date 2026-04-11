from flask import Blueprint, request, jsonify

severity_bp = Blueprint('severity', __name__)

# Red flag symptoms that immediately trigger EMERGENCY
EMERGENCY_KEYWORDS = [
    'chest pain', 'chest tightness', 'cannot breathe', "can't breathe",
    'difficulty breathing', 'stroke', 'unconscious', 'severe bleeding',
    'coughing blood', 'vomiting blood', 'seizure', 'heart attack',
    'paralysis', 'sudden vision loss', 'worst headache ever'
]

@severity_bp.route('/severity', methods=['POST'])
def assess_severity():
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        severity_score = data.get('severity_score', 5)
        duration_days = data.get('duration_days', 1)
        age = data.get('age', 30)

        # Check emergency keywords first
        symptoms_text = ' '.join(symptoms).lower()
        for keyword in EMERGENCY_KEYWORDS:
            if keyword in symptoms_text:
                return jsonify({
                    'severity_level': 'EMERGENCY',
                    'recommendation': 'Call 102 immediately or go to the nearest emergency room.',
                    'color': 'red'
                })

        # Score-based assessment
        score = severity_score

        # Duration factor
        if duration_days > 7:
            score += 2
        elif duration_days > 3:
            score += 1

        # Age factor — children under 5 and elderly over 65
        if age < 5 or age > 65:
            score *= 1.4

        # Determine level
        if score >= 8:
            level = 'URGENT'
            rec = 'See a doctor today or visit urgent care.'
            color = 'orange'
        elif score >= 5:
            level = 'ROUTINE'
            rec = 'Schedule a doctor appointment within 2–3 days.'
            color = 'yellow'
        else:
            level = 'SELF-CARE'
            rec = 'Rest, stay hydrated, and monitor symptoms. See a doctor if no improvement in 3–5 days.'
            color = 'green'

        return jsonify({
            'severity_level': level,
            'recommendation': rec,
            'color': color,
            'score': round(score, 1)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500