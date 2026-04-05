# backend/ai/triage.py

SYMPTOM_SEVERITY_MAP = {
    # Critical - Life Threatening (8-10)
    "heart attack": 10, "no pulse": 10, "not breathing": 10, "unconscious": 10,
    "anaphylaxis": 10, "severe bleeding": 9.5, "chest pain": 9, "chest pressure": 9,
    "can't breathe": 9.5, "shortness of breath": 8.5, "stroke": 9.5,
    "face drooping": 9.5, "arm weakness": 9, "throat swelling": 9.5,
    "worst headache of life": 9.5, "seizure": 8.5, "heavy bleeding": 8.5,
    "vomiting blood": 9, "poisoning": 9, "blue lips": 9.5, "lethargic": 8,

    # Moderate - Urgent (5-7.9)
    "difficulty breathing": 7.5, "severe burn": 7.5, "chemical burn": 8,
    "high fever": 6.5, "fever above 104": 7.5, "fracture": 6.5, "broken bone": 6.5,
    "severe headache": 7, "allergic reaction": 7, "abdominal pain": 5.5,
    "dehydration": 5, "persistent vomiting": 5.5, "deep cut": 6,

    # Low - Stable (1-4.9)
    "mild fever": 3, "cough": 2, "flu": 2.5, "mild headache": 2, "fatigue": 2,
    "cold": 1.5, "sore throat": 1.5, "earache": 2, "nausea": 3,
}

CONDITION_MAP = {
    frozenset(["chest pain", "shortness of breath", "left arm", "pressure"]): "Acute Coronary Syndrome",
    frozenset(["face drooping", "arm weakness", "speech", "numbness"]): "Stroke",
    frozenset(["unconscious", "not breathing", "no pulse"]): "Cardiac Arrest",
    frozenset(["seizure", "convulsion"]): "Neurological Emergency",
    frozenset(["severe bleeding", "hemorrhage"]): "Hemorrhagic Emergency",
    frozenset(["throat swelling", "allergic", "anaphylaxis"]): "Anaphylaxis",
    frozenset(["difficulty breathing", "shortness of breath"]): "Respiratory Distress",
}

def score_symptoms(symptoms: list[str]) -> float:
    if not symptoms: return 1.0
    scores = [SYMPTOM_SEVERITY_MAP.get(s.lower(), 2.0) for s in symptoms]
    # Logic: Start with max, then add 1/4 of other scores to account for complexity
    primary = max(scores)
    others = sum(sorted(scores)[:-1]) * 0.25
    return min(10.0, primary + others)

def score_vitals(hr: int, spo2: int) -> float:
    score = 0
    # Heart Rate (Tachycardia / Bradycardia)
    if hr > 150 or hr < 40: score += 4
    elif hr > 120 or hr < 50: score += 2
    # Oxygen Saturation (Hypoxia)
    if spo2 < 85: score += 5
    elif spo2 < 90: score += 3
    elif spo2 < 94: score += 1.5
    return score

def detect_condition(symptoms: list[str]) -> str:
    lower_text = " ".join([s.lower() for s in symptoms])
    for key_set, condition in CONDITION_MAP.items():
        if any(k in lower_text for k in key_set):
            return condition
    return "General Emergency"

def classify(symptom_score, vitals_score, voice_stress=0):
    # Weights: 65% Symptoms, 25% Vitals, 10% Voice Stress
    final = min(10, symptom_score * 0.65 + vitals_score * 0.25 + voice_stress * 0.10)
    if final >= 7.5: return "CRITICAL", round(final, 1)
    if final >= 4.0: return "MODERATE", round(final, 1)
    return "NORMAL", round(final, 1)

def analyze(symptoms: list, hr: int = 75, spo2: int = 98,
            transcript: str = "", wpm: int = 130):
    sym_score = score_symptoms(symptoms)
    vit_score = score_vitals(hr, spo2)
    # Stress: fast speech (>160 WPM) or very slow (<80 WPM) = stress
    stress = 0
    if wpm > 130: stress = min(10, (wpm - 130) / 10)
    elif wpm < 80: stress = 5

    severity, score = classify(sym_score, vit_score, stress)
    condition = detect_condition(symptoms)
    # Confidence: how well do the symptoms match our map?
    known_symptoms = [s for s in symptoms if s.lower() in SYMPTOM_SEVERITY_MAP]
    confidence = min(99, int(60 + (len(known_symptoms)/max(1, len(symptoms))) * 30 + score))

    actions = {
        "CRITICAL": "Life-threatening emergency. Head to nearest ER immediately. Notify dispatch now.",
        "MODERATE": "Urgent situation. Recommend medical evaluation within the hour.",
        "NORMAL": "Non-urgent symptoms. Monitor closely and see a GP if they persist.",
    }
    return {
        "severity": severity,
        "score": score,
        "confidence": confidence,
        "condition": condition,
        "action": actions[severity],
    }