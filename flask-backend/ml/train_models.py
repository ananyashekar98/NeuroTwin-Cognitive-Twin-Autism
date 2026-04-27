import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

# ── 1. Schedule Risk Model ──────────────────────────────────────────
print("Training Schedule Risk Model...")

# Features: [activity_type, environment, time_of_day]
# activity_type: structured=0, unstructured=1, social=2, transition=3, therapy=4
# environment:   indoor=0, outdoor=1, crowded=2, noisy=3, public=4
# time_of_day:   morning=0, afternoon=1, evening=2

X_schedule = np.array([
    [0, 0, 0], [0, 0, 1], [0, 0, 2],  # structured indoor → low risk
    [4, 0, 0], [4, 0, 1],              # therapy → low risk
    [1, 1, 0], [1, 1, 1], [1, 2, 1],  # unstructured outdoor → medium
    [2, 2, 0], [2, 3, 1], [2, 4, 2],  # social crowded → high
    [3, 2, 0], [3, 3, 1], [3, 4, 2],  # transition crowded → high
    [1, 2, 2], [2, 4, 1], [3, 3, 2],  # more high risk
    [0, 1, 0], [4, 1, 1], [0, 0, 2],  # more low risk
])

y_schedule = np.array([
    10, 15, 20,   # structured indoor
    10, 15,       # therapy
    40, 45, 55,   # unstructured outdoor
    75, 80, 85,   # social crowded
    80, 85, 90,   # transition crowded
    70, 88, 82,   # more high
    20, 15, 12,   # more low
])

# Convert to risk category: low=0, medium=1, high=2
y_cat = np.where(y_schedule < 35, 0, np.where(y_schedule < 65, 1, 2))

risk_model = GradientBoostingClassifier(n_estimators=100, random_state=42)
risk_model.fit(X_schedule, y_cat)
joblib.dump(risk_model, os.path.join(MODELS_DIR, 'schedule_risk_model.pkl'))
print("✅ Schedule Risk Model saved!")

# ── 2. Emotion Detection Model ──────────────────────────────────────
print("Training Emotion Detection Model...")

# Features: keyword scores [frustration_kw, anxiety_kw, happiness_kw, sadness_kw, calm_kw]
X_emotion = np.array([
    [5, 2, 0, 1, 0], [4, 3, 0, 2, 0], [6, 1, 0, 0, 0],  # frustration
    [1, 5, 0, 2, 0], [0, 6, 0, 3, 0], [2, 4, 0, 1, 0],  # anxiety
    [0, 0, 5, 0, 3], [0, 0, 6, 1, 2], [0, 0, 4, 0, 4],  # happiness
    [1, 2, 0, 5, 0], [0, 1, 0, 6, 0], [2, 3, 0, 4, 0],  # sadness
    [0, 0, 1, 0, 5], [0, 0, 2, 0, 6], [0, 0, 0, 0, 5],  # calm
])
y_emotion = np.array([
    0, 0, 0,  # frustration
    1, 1, 1,  # anxiety
    2, 2, 2,  # happiness
    3, 3, 3,  # sadness
    4, 4, 4,  # calm
])

emotion_model = RandomForestClassifier(n_estimators=100, random_state=42)
emotion_model.fit(X_emotion, y_emotion)
joblib.dump(emotion_model, os.path.join(MODELS_DIR, 'emotion_model.pkl'))
print("✅ Emotion Model saved!")

# ── 3. Breakdown Risk Model ─────────────────────────────────────────
print("Training Breakdown Prediction Model...")

# Features: [avg_intensity, frequency_per_week, avg_duration, sensory_trigger]
X_breakdown = np.array([
    [2, 1, 5,  0], [3, 1, 10, 0], [2, 2, 8,  0],  # low risk
    [5, 3, 15, 1], [6, 3, 20, 1], [5, 4, 18, 0],  # medium risk
    [8, 5, 30, 1], [9, 6, 35, 1], [7, 5, 25, 1],  # high risk
    [1, 1, 3,  0], [3, 2, 10, 0], [4, 2, 12, 1],  # low-medium
    [7, 4, 20, 1], [8, 5, 28, 1], [6, 4, 22, 0],  # medium-high
])
y_breakdown = np.array([0,0,0, 1,1,1, 2,2,2, 0,0,1, 2,2,1])

breakdown_model = RandomForestClassifier(n_estimators=100, random_state=42)
breakdown_model.fit(X_breakdown, y_breakdown)
joblib.dump(breakdown_model, os.path.join(MODELS_DIR, 'breakdown_model.pkl'))
print("✅ Breakdown Model saved!")

print("\n🎉 All 3 ML models trained and saved to /models folder!")