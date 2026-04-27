from flask import Blueprint, request, jsonify
import os
from groq import Groq

text_bp = Blueprint('text', __name__)
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

@text_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    try:
        completion = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[
                {'role': 'system', 'content': 'You are an ASD behavioral analysis AI. Always respond ONLY with valid JSON, no markdown, no backticks.'},
                {'role': 'user', 'content': f'''Analyze this text from an individual with ASD: "{text}"
Respond ONLY in this exact JSON:
{{"emotions":{{"frustration":<0-100>,"anxiety":<0-100>,"happiness":<0-100>,"sadness":<0-100>,"calm":<0-100>}},"dominant_emotion":"<word>","intent":"<one sentence>","sarcasm_detected":<true/false>,"caregiver_suggestion":"<2 sentences>","alert_level":"<low/medium/high>"}}'''}
            ],
            temperature=0.3, max_tokens=500
        )
        import json
        raw = completion.choices[0].message.content.strip()
        parsed = json.loads(raw.replace('```json','').replace('```','').strip())
        return jsonify(parsed)
    except Exception as e:
        return jsonify({'error': str(e)}), 500