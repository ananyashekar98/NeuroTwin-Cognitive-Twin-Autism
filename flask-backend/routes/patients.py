from flask import Blueprint, request, jsonify
import uuid
from datetime import datetime
from database import read_db, write_db

patients_bp = Blueprint('patients', __name__)

# Get all patients for a caregiver
@patients_bp.route('/list/<caregiver_id>', methods=['GET'])
def list_patients(caregiver_id):
    db = read_db()
    db['patients'] = db.get('patients', [])
    patients = [p for p in db['patients'] if p.get('caregiverId') == caregiver_id]
    return jsonify(sorted(patients, key=lambda x: x['name']))

# Create new patient
@patients_bp.route('/create', methods=['POST'])
def create_patient():
    data = request.json
    db = read_db()
    db['patients'] = db.get('patients', [])
    patient = {
        'id': str(uuid.uuid4()),
        'caregiverId': data.get('caregiverId'),
        'name': data.get('name'),
        'age': data.get('age'),
        'gender': data.get('gender'),
        'supportLevel': data.get('supportLevel', '2'),
        'diagnosis': data.get('diagnosis', ''),
        'school': data.get('school', ''),
        'therapist': data.get('therapist', ''),
        'avatarColor': data.get('avatarColor', '#7c83fd'),
        'createdAt': datetime.now().isoformat()
    }
    db['patients'].append(patient)
    write_db(db)
    return jsonify({'message': 'Patient created', 'patient': patient})

# Update patient
@patients_bp.route('/update/<patient_id>', methods=['POST'])
def update_patient(patient_id):
    data = request.json
    db = read_db()
    db['patients'] = db.get('patients', [])
    for i, p in enumerate(db['patients']):
        if p['id'] == patient_id:
            db['patients'][i] = {**p, **data, 'id': patient_id}
    write_db(db)
    return jsonify({'message': 'Patient updated'})

# Delete patient
@patients_bp.route('/delete/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    db = read_db()
    db['patients'] = [p for p in db.get('patients', []) if p['id'] != patient_id]
    write_db(db)
    return jsonify({'message': 'Patient deleted'})

# Get single patient
@patients_bp.route('/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    db = read_db()
    patient = next((p for p in db.get('patients', []) if p['id'] == patient_id), None)
    return jsonify(patient)