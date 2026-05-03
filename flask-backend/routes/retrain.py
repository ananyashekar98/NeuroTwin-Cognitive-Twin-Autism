from flask import Blueprint, request, jsonify
import numpy as np
import joblib
import os
import io
import csv
import uuid
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from database import read_db, write_db

retrain_bp = Blueprint('retrain', __name__)

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
BASE_MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'base')

TYPE_MAP = {'structured':0,'unstructured':1,'social':2,'transition':3,'therapy':4}
ENV_MAP  = {'indoor':0,'outdoor':1,'crowded':2,'noisy':3,'public':4}

def get_time_of_day(time_str):
    try:
        hour = int(time_str.split(':')[0])
        return 0 if hour < 12 else 1 if hour < 17 else 2
    except: return 0

def get_patient_model_path(user_id, model_type):
    patient_dir = os.path.join(MODELS_DIR, 'patients', user_id)
    os.makedirs(patient_dir, exist_ok=True)
    return os.path.join(patient_dir, f'{model_type}.pkl')

# ── Upload + Retrain Breakdown Model ──────────────────────────
@retrain_bp.route('/breakdown/<user_id>', methods=['POST'])
def retrain_breakdown(user_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Please upload a CSV file'}), 400

    try:
        content = file.read().decode('utf-8')
        reader  = csv.DictReader(io.StringIO(content))
        rows    = list(reader)

        if len(rows) < 10:
            return jsonify({'error': f'Need at least 10 rows. Got {len(rows)}'}), 400

        # Parse CSV
        X, y = [], []
        for row in rows:
            try:
                intensity  = float(row.get('intensity', 5))
                duration   = float(row.get('duration', 10))
                sensory    = int(row.get('sensory', 0))
                risk_score = float(row.get('risk_score', intensity * 10))

                # frequency placeholder (use index-based approx)
                frequency = 3

                X.append([intensity, frequency, duration, sensory])

                # Label from intensity
                if intensity >= 7: label = 2  # High
                elif intensity >= 4: label = 1  # Medium
                else: label = 0  # Low
                y.append(label)
            except: continue

        if len(X) < 10:
            return jsonify({'error': 'Not enough valid rows parsed'}), 400

        X = np.array(X)
        y = np.array(y)

        # Train patient-specific model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)

        # Save patient model
        path = get_patient_model_path(user_id, 'breakdown_model')
        joblib.dump(model, path)

        # Save training metadata to DB
        db = read_db()
        db['model_training'] = db.get('model_training', {})
        db['model_training'][user_id] = db['model_training'].get(user_id, {})
        db['model_training'][user_id]['breakdown'] = {
            'trained_at': datetime.now().isoformat(),
            'samples': len(X),
            'model_path': path
        }
        write_db(db)

        # Also save uploaded data as breakdown history
        db2 = read_db()
        db2['breakdowns'] = db2.get('breakdowns', [])
        for row in rows:
            try:
                entry = {
                    'id': str(uuid.uuid4()),
                    'userId': user_id,
                    'trigger': row.get('trigger', 'Unknown'),
                    'intensity': int(float(row.get('intensity', 5))),
                    'duration': int(float(row.get('duration', 10))),
                    'location': row.get('location', ''),
                    'notes': 'Imported from CSV',
                    'mlRiskCategory': 'High' if float(row.get('intensity',5)) >= 7 else 'Medium' if float(row.get('intensity',5)) >= 4 else 'Low',
                    'date': datetime.now().isoformat()
                }
                db2['breakdowns'].append(entry)
            except: continue
        write_db(db2)

        return jsonify({
            'message': f'✅ Breakdown model retrained with {len(X)} patient records!',
            'samples': len(X),
            'model': 'breakdown_model',
            'userId': user_id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Upload + Retrain Schedule Model ───────────────────────────
@retrain_bp.route('/schedule/<user_id>', methods=['POST'])
def retrain_schedule(user_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Please upload a CSV file'}), 400

    try:
        content = file.read().decode('utf-8')
        reader  = csv.DictReader(io.StringIO(content))
        rows    = list(reader)

        if len(rows) < 5:
            return jsonify({'error': f'Need at least 5 rows. Got {len(rows)}'}), 400

        X, y = [], []
        for row in rows:
            try:
                activity_type = TYPE_MAP.get(row.get('type','structured').lower(), 0)
                environment   = ENV_MAP.get(row.get('environment','indoor').lower(), 0)
                time_of_day   = get_time_of_day(row.get('time','09:00'))
                risk_score    = float(row.get('risk_score', 50))

                X.append([activity_type, environment, time_of_day])

                if risk_score >= 65: label = 2
                elif risk_score >= 35: label = 1
                else: label = 0
                y.append(label)
            except: continue

        if len(X) < 5:
            return jsonify({'error': 'Not enough valid rows'}), 400

        X = np.array(X)
        y = np.array(y)

        # Train patient-specific model
        model = GradientBoostingClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)

        # Save
        path = get_patient_model_path(user_id, 'schedule_risk_model')
        joblib.dump(model, path)

        # Save metadata
        db = read_db()
        db['model_training'] = db.get('model_training', {})
        db['model_training'][user_id] = db['model_training'].get(user_id, {})
        db['model_training'][user_id]['schedule'] = {
            'trained_at': datetime.now().isoformat(),
            'samples': len(X),
            'model_path': path
        }
        write_db(db)

        # Save as schedule history
        db2 = read_db()
        db2['schedules'] = db2.get('schedules', [])
        for row in rows:
            try:
                risk = float(row.get('risk_score', 50))
                entry = {
                    'id': str(uuid.uuid4()),
                    'userId': user_id,
                    'activity': row.get('activity', 'Unknown'),
                    'time': row.get('time', '09:00'),
                    'type': row.get('type', 'structured'),
                    'environment': row.get('environment', 'indoor'),
                    'riskScore': int(risk),
                    'riskCategory': 'High' if risk >= 65 else 'Medium' if risk >= 35 else 'Low',
                    'date': datetime.now().isoformat()
                }
                db2['schedules'].append(entry)
            except: continue
        write_db(db2)

        return jsonify({
            'message': f'✅ Schedule model retrained with {len(X)} patient records!',
            'samples': len(X),
            'model': 'schedule_risk_model',
            'userId': user_id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Check training status ──────────────────────────────────────
@retrain_bp.route('/status/<user_id>', methods=['GET'])
def status(user_id):
    db = read_db()
    training = db.get('model_training', {}).get(user_id, {})

    bd_path = get_patient_model_path(user_id, 'breakdown_model')
    sc_path = get_patient_model_path(user_id, 'schedule_risk_model')

    return jsonify({
        'breakdown_model': {
            'trained': os.path.exists(bd_path),
            'info': training.get('breakdown', None)
        },
        'schedule_model': {
            'trained': os.path.exists(sc_path),
            'info': training.get('schedule', None)
        }
    })