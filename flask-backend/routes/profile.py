from flask import Blueprint, request, jsonify
from database import read_db, write_db
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/<user_id>', methods=['GET'])
def get_profile(user_id):
    db = read_db()
    profile = next((p for p in db.get('profiles',[]) if p.get('userId') == user_id), None)
    return jsonify(profile)

@profile_bp.route('/save', methods=['POST'])
def save_profile():
    data = request.json
    db = read_db()
    db['profiles'] = db.get('profiles', [])
    user_id = data.get('userId')
    idx = next((i for i,p in enumerate(db['profiles']) if p.get('userId') == user_id), None)
    profile = {**data, 'updatedAt': datetime.now().isoformat()}
    if idx is not None: db['profiles'][idx] = profile
    else: db['profiles'].append(profile)
    write_db(db)
    return jsonify({'message': 'Profile saved', 'profile': profile})