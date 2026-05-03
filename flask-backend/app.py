from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

from routes.auth            import auth_bp
from routes.schedule        import schedule_bp
from routes.breakdown       import breakdown_bp
from routes.textanalysis    import text_bp
from routes.dashboard       import dashboard_bp
from routes.recommendations import recommendations_bp
from routes.profile         import profile_bp
from routes.mood            import mood_bp
from routes.dailylog        import dailylog_bp
from routes.retrain import retrain_bp
from routes.patients import patients_bp

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])

app.register_blueprint(auth_bp,            url_prefix='/api/auth')
app.register_blueprint(schedule_bp,        url_prefix='/api/schedule')
app.register_blueprint(breakdown_bp,       url_prefix='/api/breakdown')
app.register_blueprint(text_bp,            url_prefix='/api/text')
app.register_blueprint(dashboard_bp,       url_prefix='/api/dashboard')
app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
app.register_blueprint(profile_bp,         url_prefix='/api/profile')
app.register_blueprint(mood_bp,            url_prefix='/api/mood')
app.register_blueprint(dailylog_bp,        url_prefix='/api/dailylog')
app.register_blueprint(retrain_bp, url_prefix='/api/retrain')
app.register_blueprint(patients_bp, url_prefix='/api/patients')

@app.route('/')
def home():
    return {'message': '✅ CognitiveTwin Flask API running!', 'ml_models': ['schedule_risk','emotion_detection','breakdown_prediction']}

if __name__ == '__main__':
    app.run(debug=True, port=5000)