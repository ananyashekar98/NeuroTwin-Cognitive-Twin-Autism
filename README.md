# 🧠 CognitiveTwin — AI-Based ASD Support System

<div align="center">

![CognitiveTwin Banner](https://img.shields.io/badge/CognitiveTwin-ASD%20Support-7c83fd?style=for-the-badge&logo=brain&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-Python-000000?style=for-the-badge&logo=flask&logoColor=white)
![ML](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-00A67E?style=for-the-badge)

**A full-stack AI/ML system for real-time behavioral analysis and personalized support for individuals with Autism Spectrum Disorder (ASD)**



</div>


## 📌 Project Overview

CognitiveTwin is an intelligent, role-based ASD support platform that combines **Machine Learning**, **Generative AI**, and **behavioral data tracking** to help caregivers, therapists, and individuals with Autism Spectrum Disorder.

The system creates a "cognitive twin" — a digital model of the individual's behavioral patterns — enabling proactive intervention and personalized care.

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React + Vite | UI Framework |
| React Router | Navigation |
| Axios | API Communication |
| Recharts | Data Visualization |
| i18next | Multi-language Support |
| jsPDF + AutoTable | PDF Report Generation |
| SpeechRecognition API | Voice Input |

### Backend
| Technology | Purpose |
|-----------|---------|
| Flask (Python) | REST API Framework |
| Flask-CORS | Cross Origin Requests |
| PyJWT | Authentication |
| bcrypt | Password Hashing |
| Groq SDK | LLM Integration |
| python-dotenv | Environment Variables |

### AI / ML
| Technology | Purpose |
|-----------|---------|
| Scikit-learn | ML Model Training |
| Gradient Boosting | Schedule Risk Prediction |
| Random Forest | Breakdown Risk Prediction |
| Random Forest | Emotion Detection |
| Groq Llama 3.3 70B | Text Emotion Analysis |
| NumPy + Pandas | Data Processing |
| Joblib | Model Serialization |

---

## 🤖 ML Models

The system includes **3 trained ML models**:

### 1. Schedule Risk Model (`schedule_risk_model.pkl`)
- **Algorithm:** Gradient Boosting Classifier
- **Features:** Activity type, environment, time of day
- **Output:** Low / Medium / High risk category
- **Use case:** Predicts stress risk for daily activities

### 2. Breakdown Prediction Model (`breakdown_model.pkl`)
- **Algorithm:** Random Forest Classifier
- **Features:** Avg intensity, frequency, duration, sensory trigger
- **Output:** Low / Medium / High risk
- **Use case:** Predicts future breakdown likelihood from history

### 3. Emotion Detection Model (`emotion_model.pkl`)
- **Algorithm:** Random Forest Classifier
- **Features:** Keyword frequency scores
- **Output:** Dominant emotion class
- **Use case:** Supports text-based emotion analysis

---

## ✨ Features

### 👨‍👩‍👧 Caregiver Features
- 📊 **Dashboard** — Real-time charts (bar, pie, line)
- 👤 **Patient Profile** — Detailed ASD individual management
- 😊 **Mood Tracker** — Daily mood, energy, sleep logging
- 📅 **Schedule Risk Predictor** — ML-powered activity risk scoring
- ⚡ **Breakdown Log** — Event logging with ML risk prediction
- 📓 **Daily Log** — Routine, behavior, health tracking
- 💡 **Recommendations** — AI-generated personalized strategies
- 📊 **Weekly Report Card** — Grade-based progress tracking with radar chart
- 📄 **PDF Export** — Professional patient report generation
- 🔔 **Smart Notifications** — Real-time ML-based alerts

### 👨‍⚕️ Therapist Features
- All caregiver features
- 🗒️ **Clinical Notes** — Session documentation
- 📊 **Analytics** — Comparative trend analysis

### 🧑 Patient Features
- 🏠 **Patient Home** — Personalized welcome dashboard
- 😊 **Mood Tracker** — Simplified mood logging
- 📓 **Daily Log** — Personal routine tracking
- 🗣️ **Communication Board** — AAC visual communication with Text-to-Speech
- ⭐ **Routine Assistant** — Gamified task completion with points
- 🔔 **Smart Reminders** — Visual + audio alerts
- 🤝 **Social Skills Trainer** — Scenario-based learning
- 📊 **Report Card** — Personal weekly progress grade

### 🌟 Special Features
- 🌙 **Dark Mode** — Full dark/light theme toggle
- 🌐 **4 Languages** — English, Hindi, Telugu, Kannada
- 🎤 **Voice Input** — Speech-to-text for text analyzer
- 📱 **Mobile Responsive** — Works on all screen sizes

---

## 📁 Project Structure
CognitiveTwin-Autism/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── DarkModeToggle.jsx
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   └── NotificationBell.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── MoodTracker.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Breakdown.jsx
│   │   │   ├── TextAnalyzer.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── DailyLog.jsx
│   │   │   ├── PatientHome.jsx
│   │   │   ├── ReportCard.jsx
│   │   │   └── ExportReport.jsx
│   │   ├── i18n.js              # Multi-language config
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── flask-backend/               # Python + Flask
│   ├── routes/
│   │   ├── auth.py
│   │   ├── schedule.py
│   │   ├── breakdown.py
│   │   ├── textanalysis.py
│   │   ├── dashboard.py
│   │   ├── recommendations.py
│   │   ├── profile.py
│   │   ├── mood.py
│   │   ├── dailylog.py
│   │   ├── medication.py
│   │   ├── chat.py
│   │   ├── analytics.py
│   │   ├── abc.py
│   │   ├── notes.py
│   │   ├── routine.py
│   │   └── reminders.py
│   ├── ml/
│   │   └── train_models.py      # ML training scripts
│   ├── models/                  # Trained .pkl files
│   │   ├── schedule_risk_model.pkl
│   │   ├── breakdown_model.pkl
│   │   └── emotion_model.pkl
│   ├── app.py                   # Main Flask app
│   ├── database.py              # JSON database
│   └── requirements.txt
│
└── README.md
---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ananyashekar98/CognitiveTwin-Autism.git
cd CognitiveTwin-Autism
```

### 2. Setup Backend
```bash
cd flask-backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install flask flask-cors python-dotenv bcrypt pyjwt scikit-learn numpy pandas joblib groq
```

### 3. Create `.env` file in `flask-backend/`
JWT_SECRET=cognitivetwin_secret_key_2025
GROQ_API_KEY=your_groq_api_key_here
> Get free Groq API key at: https://console.groq.com

### 4. Train ML Models
```bash
python ml/train_models.py
```

### 5. Start Backend
```bash
python app.py
```
✅ Backend runs at `http://localhost:5000`

### 6. Setup Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs at `http://localhost:5173`

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/schedule/predict` | ML risk prediction |
| GET  | `/api/schedule/:userId` | Get schedules |
| POST | `/api/breakdown/log` | Log breakdown event |
| GET  | `/api/breakdown/history/:userId` | Get breakdown history |
| POST | `/api/text/analyze` | Groq AI text analysis |
| GET  | `/api/dashboard/:userId` | Dashboard data |
| GET  | `/api/recommendations/:userId` | AI recommendations |
| POST | `/api/profile/save` | Save patient profile |
| POST | `/api/mood/log` | Log mood entry |
| GET  | `/api/mood/history/:userId` | Mood history |
| POST | `/api/dailylog/log` | Save daily log |
| GET  | `/api/analytics/:userId` | Analytics data |

---

## 🌐 Multi-Language Support

The system supports **4 languages**:

| Language | Code | Script |
|----------|------|--------|
| English  | `en` | Latin |
| Hindi    | `hi` | देवनागरी |
| Telugu   | `te` | తెలుగు |
| Kannada  | `kn` | ಕನ್ನಡ |

Switch language using the buttons at the bottom of the sidebar.

---

## 📊 ML Model Performance

| Model | Algorithm | Training Samples | Purpose |
|-------|-----------|-----------------|---------|
| Schedule Risk | Gradient Boosting | 20 samples | Activity risk (Low/Med/High) |
| Breakdown Prediction | Random Forest | 15 samples | Future breakdown risk |
| Emotion Detection | Random Forest | 15 samples | Dominant emotion class |

---

## 🎯 Role-Based Access

| Feature | Caregiver | Therapist | Patient |
|---------|-----------|-----------|---------|
| Dashboard | ✅ Full | ✅ Full | ✅ Simple |
| Patient Profile | ✅ Full | ✅ View | ✅ Self |
| Mood Tracker | ✅ | ❌ | ✅ |
| Schedule Risk (ML) | ✅ | ✅ | ❌ |
| Breakdown Log | ✅ | ✅ View | ❌ |
| Text Analyzer (AI) | ✅ | ✅ | ❌ |
| Clinical Notes | ❌ | ✅ | ❌ |
| Communication Board | ❌ | ❌ | ✅ |
| Routine Assistant | ❌ | ❌ | ✅ |
| Report Card | ✅ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ❌ |

---

## 📸 Screenshots

> Dashboard with live charts, dark mode, and notification bell

> Weekly Report Card with Radar Chart and grade

> AI Text Emotion Analyzer with Voice Input

> Visual Communication Board (AAC)

---

## 🔮 Future Scope

- [ ] MongoDB Atlas integration for production
- [ ] Real-time WebSocket notifications
- [ ] Mobile app (React Native)
- [ ] Advanced deep learning models (LSTM for pattern prediction)
- [ ] Wearable device integration (heart rate, sleep tracking)
- [ ] Video analysis for behavioral detection
- [ ] Parent-therapist video consultation

---



<div align="center">

Made with ❤️ for autism support

**CognitiveTwin — Because every mind deserves to be understood**

</div>