from flask import Blueprint, request, jsonify
import joblib, numpy as np, uuid, os
from datetime import datetime
from database import read_db, write_db

breakdown_bp = Blueprint('breakdown', __name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'breakdown_model.pkl')
model = joblib.load(MODEL_PATH)

@breakdown_bp.route('/log', methods=['POST'])
def log_breakdown():
    data = request.json
    db = read_db()
    db['breakdowns'] = db.get('breakdowns', [])

    user_breakdowns = [b for b in db['breakdowns'] if b.get('userId') == data.get('userId')]
    frequency = len([b for b in user_breakdowns if
        (datetime.now() - datetime.fromisoformat(b['date'])).days <= 7])
    avg_intensity = sum(b['intensity'] for b in user_breakdowns[-5:]) / max(len(user_breakdowns[-5:]), 1)
    avg_duration  = sum(b['duration']  for b in user_breakdowns[-5:]) / max(len(user_breakdowns[-5:]), 1)
    is_sensory = 1 if 'sensory' in data.get('trigger', '').lower() or 'noise' in data.get('trigger', '').lower() else 0

    features = np.array([[avg_intensity, frequency, avg_duration, is_sensory]])
    risk_cat = model.predict(features)[0]

    entry = {
        'id': str(uuid.uuid4()),
        'userId': data.get('userId'),
        'trigger': data.get('trigger'),
        'intensity': data.get('intensity'),
        'duration': data.get('duration'),
        'location': data.get('location', ''),
        'notes': data.get('notes', ''),
        'mlRiskCategory': ['Low', 'Medium', 'High'][risk_cat],
        'date': datetime.now().isoformat()
    }
    db['breakdowns'].append(entry)
    write_db(db)
    return jsonify({'message': 'Breakdown logged', 'entry': entry, 'mlRisk': entry['mlRiskCategory']})

@breakdown_bp.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    db = read_db()
    logs = [b for b in db.get('breakdowns', []) if b.get('userId') == user_id]
    return jsonify(sorted(logs, key=lambda x: x['date'], reverse=True))