from flask import Blueprint, request, jsonify
import joblib, numpy as np, uuid, os
from datetime import datetime
from database import read_db, write_db

schedule_bp = Blueprint('schedule', __name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'schedule_risk_model.pkl')
model = joblib.load(MODEL_PATH)

TYPE_MAP  = {'structured': 0, 'unstructured': 1, 'social': 2, 'transition': 3, 'therapy': 4}
ENV_MAP   = {'indoor': 0, 'outdoor': 1, 'crowded': 2, 'noisy': 3, 'public': 4}
TIME_MAP  = {'morning': 0, 'afternoon': 1, 'evening': 2}

def get_time_of_day(time_str):
    try:
        hour = int(time_str.split(':')[0])
        if hour < 12: return 0
        elif hour < 17: return 1
        else: return 2
    except: return 0

@schedule_bp.route('/predict', methods=['POST'])
def predict():
    data = request.json
    activity_type = TYPE_MAP.get(data.get('type', 'structured').lower(), 0)
    environment   = ENV_MAP.get(data.get('environment', 'indoor').lower(), 0)
    time_of_day   = get_time_of_day(data.get('time', '09:00'))

    features = np.array([[activity_type, environment, time_of_day]])
    risk_cat = model.predict(features)[0]
    risk_score = [20, 55, 85][risk_cat]

    db = read_db()
    db['schedules'] = db.get('schedules', [])
    entry = {
        'id': str(uuid.uuid4()),
        'userId': data.get('userId'),
        'activity': data.get('activity'),
        'time': data.get('time'),
        'type': data.get('type'),
        'environment': data.get('environment'),
        'riskScore': risk_score,
        'riskCategory': ['Low', 'Medium', 'High'][risk_cat],
        'date': datetime.now().isoformat()
    }
    db['schedules'].append(entry)
    write_db(db)
    return jsonify({'riskScore': risk_score, 'riskCategory': entry['riskCategory'], 'entry': entry})

@schedule_bp.route('/<user_id>', methods=['GET'])
def get_schedules(user_id):
    db = read_db()
    schedules = [s for s in db.get('schedules', []) if s.get('userId') == user_id]
    return jsonify(sorted(schedules, key=lambda x: x['date'], reverse=True))