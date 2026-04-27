from flask import Blueprint, request, jsonify
import uuid
from datetime import datetime
from database import read_db, write_db

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/log', methods=['POST'])
def log_mood():
    data = request.json
    db = read_db()
    db['moods'] = db.get('moods', [])
    entry = {'id': str(uuid.uuid4()), **data, 'date': datetime.now().isoformat()}
    db['moods'].append(entry)
    write_db(db)
    return jsonify({'message': 'Mood logged', 'entry': entry})

@mood_bp.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    db = read_db()
    moods = [m for m in db.get('moods', []) if m.get('userId') == user_id]
    return jsonify(sorted(moods, key=lambda x: x['date'], reverse=True))