import re
from textblob import TextBlob

SYMPTOM_MAP = {
    'headache': ['headache', 'head hurts', 'migraine'],
    'vomiting': ['vomiting', 'throwing up', 'puking'],
    'fatigue': ['tired', 'fatigue', 'weakness'],
    'high_fever': ['fever', 'temperature', 'high fever'],
    'chills': ['chills', 'shivering'],
    'muscle_pain': ['body ache', 'muscle pain', 'body aches']
}

def extract_symptoms(text):
    corrected = str(TextBlob(text).correct()).lower()
    found = []
    for key, synonyms in SYMPTOM_MAP.items():
        if any(s in corrected for s in synonyms):
            found.append(key)
    return {'symptoms': list(set(found)), 'corrected': corrected}

def extract_duration(text):
    match = re.search(r'(\d+)\s*(day|week|month|hour)', text.lower())
    return match.group(0) if match else "not specified"

def extract_severity_words(text):
    return 8 if "severe" in text.lower() or "killing" in text.lower() else 5