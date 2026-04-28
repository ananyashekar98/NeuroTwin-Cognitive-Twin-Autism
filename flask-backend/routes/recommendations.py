from flask import Blueprint, jsonify
from database import read_db

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    db = read_db()
    breakdowns = [b for b in db.get('breakdowns',[]) if b.get('userId') == user_id]
    avg_intensity = sum(b['intensity'] for b in breakdowns) / max(len(breakdowns),1)
    suggestions = [
        {'id':1,'category':'Sensory','tip':'Use noise-cancelling headphones in loud environments','priority':'high'},
        {'id':2,'category':'Routine','tip':'Keep a visual schedule on the wall for daily activities','priority':'high'},
        {'id':3,'category':'Communication','tip':'Use simple, short sentences when giving instructions','priority':'medium'},
        {'id':4,'category':'Calming','tip':'Try deep pressure techniques like weighted blankets','priority':'medium'},
        {'id':5,'category':'Environment','tip':'Reduce clutter and bright lights in the main living area','priority':'low'},
    ]
    if avg_intensity > 6:
        suggestions.insert(0, {'id':0,'category':'Urgent','tip':'High intensity patterns detected — consult a therapist this week','priority':'urgent'})
    return jsonify({'suggestions': suggestions, 'breakdownCount': len(breakdowns), 'avgIntensity': round(avg_intensity,1)})