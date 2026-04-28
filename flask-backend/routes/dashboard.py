from flask import Blueprint, jsonify
from database import read_db

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/<user_id>', methods=['GET'])
def get_dashboard(user_id):
    db = read_db()
    breakdowns = [b for b in db.get('breakdowns',[]) if b.get('userId') == user_id]
    schedules  = [s for s in db.get('schedules', []) if s.get('userId') == user_id]
    avg_risk   = sum(s['riskScore'] for s in schedules) / max(len(schedules),1)
    recent     = sorted(breakdowns, key=lambda x: x['date'], reverse=True)[:5]
    return jsonify({'totalBreakdowns': len(breakdowns), 'totalSchedules': len(schedules), 'avgRiskScore': round(avg_risk), 'routineAdherence': 78 if schedules else 0, 'recentBreakdowns': recent})