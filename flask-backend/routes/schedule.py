from flask import Blueprint, request, jsonify
import joblib, numpy as np, uuid, os
from datetime import datetime
from database import read_db, write_db

schedule_bp = Blueprint('schedule', __name__)

BASE_MODEL = os.path.join(os.path.dirname(__file__), '..', 'models', 'schedule_risk_model.pkl')
TYPE_MAP = {'structured':0,'unstructured':1,'social':2,'transition':3,'therapy':4}
ENV_MAP  = {'indoor':0,'outdoor':1,'crowded':2,'noisy':3,'public':4}

def load_model(user_id=None):
    if user_id:
        patient_model = os.path.join(os.path.dirname(__file__), '..', 'models', 'patients', user_id, 'schedule_risk_model.pkl')
        if os.path.exists(patient_model):
            return joblib.load(patient_model), True
    return joblib.load(BASE_MODEL), False

def get_time_of_day(time_str):
    try:
        hour = int(time_str.split(':')[0])
        return 0 if hour < 12 else 1 if hour < 17 else 2
    except: return 0

@schedule_bp.route('/predict', methods=['POST'])
def predict():
    data = request.json
    user_id = data.get('userId')

    model, is_personalized = load_model(user_id)

    features = np.array([[
        TYPE_MAP.get(data.get('type','structured').lower(), 0),
        ENV_MAP.get(data.get('environment','indoor').lower(), 0),
        get_time_of_day(data.get('time','09:00'))
    ]])

    risk_cat   = model.predict(features)[0]
    risk_score = [20, 55, 85][risk_cat]

    db = read_db()
    db['schedules'] = db.get('schedules', [])
    entry = {
        'id': str(uuid.uuid4()),
        'userId': user_id,
        'activity': data.get('activity'),
        'time': data.get('time'),
        'type': data.get('type'),
        'environment': data.get('environment'),
        'riskScore': risk_score,
        'riskCategory': ['Low','Medium','High'][risk_cat],
        'personalized': is_personalized,
        'date': datetime.now().isoformat()
    }
    db['schedules'].append(entry)
    write_db(db)

    return jsonify({
        'riskScore': risk_score,
        'riskCategory': entry['riskCategory'],
        'personalized': is_personalized,
        'entry': entry
    })

@schedule_bp.route('/<user_id>', methods=['GET'])
def get_schedules(user_id):
    db = read_db()
    schedules = [s for s in db.get('schedules',[]) if s.get('userId') == user_id]
    return jsonify(sorted(schedules, key=lambda x: x['date'], reverse=True))