from flask import Blueprint, request, jsonify
import uuid
from datetime import datetime
from database import read_db, write_db

dailylog_bp = Blueprint('dailylog', __name__)

@dailylog_bp.route('/log', methods=['POST'])
def log():
    data = request.json
    db = read_db()
    db['dailylogs'] = db.get('dailylogs', [])
    entry = {'id': str(uuid.uuid4()), **data, 'date': datetime.now().isoformat()}
    db['dailylogs'].append(entry)
    write_db(db)
    return jsonify({'message': 'Daily log saved', 'entry': entry})

@dailylog_bp.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    db = read_db()
    logs = [l for l in db.get('dailylogs',[]) if l.get('userId') == user_id]
    return jsonify(sorted(logs, key=lambda x: x['date'], reverse=True))