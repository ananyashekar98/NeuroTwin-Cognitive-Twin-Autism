from flask import Blueprint, request, jsonify
import bcrypt, jwt, uuid, datetime, os
from database import read_db, write_db

auth_bp = Blueprint('auth', __name__)
SECRET = os.getenv('JWT_SECRET', 'cognitivetwin_secret')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    db = read_db()
    if any(u['email'] == data['email'] for u in db['users']):
        return jsonify({'error': 'Email already registered'}), 400
    hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
    user = {'id': str(uuid.uuid4()), 'name': data['name'], 'email': data['email'], 'password': hashed, 'role': data.get('role','caregiver')}
    db['users'].append(user)
    write_db(db)
    token = jwt.encode({'id': user['id'], 'name': user['name'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}, SECRET, algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': user['role']}})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    db = read_db()
    user = next((u for u in db['users'] if u['email'] == data['email']), None)
    if not user:
        return jsonify({'error': 'Email not registered'}), 400
    if not bcrypt.checkpw(data['password'].encode(), user['password'].encode()):
        return jsonify({'error': 'Invalid password'}), 400
    token = jwt.encode({'id': user['id'], 'name': user['name'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}, SECRET, algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': user['role']}})