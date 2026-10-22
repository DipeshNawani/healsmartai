<p align="center">
  <img src="frontend/public/favicon.svg" width="80" alt="HealSmart AI Logo" />
</p>

<h1 align="center">HealSmart AI</h1>

<p align="center">
  <strong>AI-Powered Healthcare Platform — Talk to an AI Doctor, Book Real Ones Too</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Gemini%20AI-3.5%20Flash-4285F4?logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white" alt="Razorpay" />
</p>

---

## 🩺 What is HealSmart AI?

HealSmart AI is a **full-stack healthcare web application** that brings together AI-powered medical consultation, real doctor appointments, medicine delivery, and lab test booking — all in one platform.

**The core idea:** Tell the AI your symptoms, get a clinical-grade assessment, and seamlessly book a specialist, order medicines, or schedule a lab test — without leaving the app.

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **🤖 AI Doctor Chat** | Powered by Google Gemini 3.5 Flash. Describe symptoms → get diagnosis, home remedies, urgency level, and specialist recommendations. Supports English, Hindi & Hinglish. |
| 2 | **🔐 Google OAuth** | One-click sign-in with Google. JWT-based session management. |
| 3 | **👨‍⚕️ Doctor Appointments** | Browse 500+ doctors across 12 specializations. Filter by specialty, view experience & fees, pick a time slot, and pay online. |
| 4 | **💊 Medicine Ordering** | Search medicines by category, add to cart, checkout with Razorpay or COD. |
| 5 | **🧪 Lab Test Booking** | Book blood tests, thyroid panels, full checkups. Home collection or walk-in. |
| 6 | **💳 Razorpay Payments** | Integrated payment gateway for appointments, medicines, and lab tests. |
| 7 | **🔍 Symptom Checker** | Interactive symptom analysis with guided questionnaire. |
| 8 | **📊 Health Tools** | BMI Calculator and other wellness utilities. |
| 9 | **💊 Drug Interaction Checker** | AI-powered check for medicine combinations and potential conflicts. |
| 10 | **👤 User Profile** | Manage health records, family members, and order history. |
| 11 | **🛡️ Admin Dashboard** | Manage doctors, medicines, lab tests, and platform data. |
| 12 | **🌙 Dark / Light Theme** | System-aware theme toggle with smooth transitions. |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Framer Motion** | Animations & transitions |
| **Axios** | HTTP client |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library |
| **@react-oauth/google** | Google sign-in |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express 5** | REST API framework |
| **Mongoose 9** | MongoDB ODM |
| **Google Gemini AI** | Primary AI provider (gemini-3.5-flash) |
| **NVIDIA NIM** | Secondary AI provider (fallback) |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Razorpay SDK** | Payment processing |
| **Helmet** | Security headers |
| **express-rate-limit** | API rate limiting |

---

## 📁 Project Structure

```
healsmartai/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT auth middleware
│   ├── models/                   # 11 Mongoose schemas
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── ChatSession.js
│   │   ├── Medicine.js
│   │   ├── Order.js
│   │   ├── LabTest.js
│   │   ├── TestBooking.js
│   │   ├── HealthRecord.js
│   │   ├── FamilyMember.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js               # Login / Register / Google OAuth
│   │   ├── ai.js                 # AI Doctor + Drug Interactions
│   │   ├── doctors.js            # Doctor CRUD & appointments
│   │   ├── medicines.js          # Medicine catalog & orders
│   │   ├── labTests.js           # Lab test booking
│   │   └── payment.js            # Razorpay integration
│   ├── server.js                 # Express app entry point
│   ├── .env.example              # Environment variable template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   └── Footer/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing/          # Homepage with interactive mockup
│   │   │   ├── Auth/             # Login & Register
│   │   │   ├── AiDoctor/         # AI chat interface
│   │   │   ├── Appointments/     # Doctor booking
│   │   │   ├── Medicines/        # Medicine store
│   │   │   ├── LabTests/         # Lab test booking
│   │   │   ├── HealthTools/      # BMI calculator etc.
│   │   │   ├── SymptomChecker/   # Symptom analysis
│   │   │   ├── Profile/          # User dashboard
│   │   │   └── Admin/            # Admin panel
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Design system & tokens
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x → [Download](https://nodejs.org/)
- **MongoDB** ≥ 6.x → [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** → [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/DipeshNawani/healsmartai.git
cd healsmartai
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create your environment file
cp .env.example .env
# Then edit .env with your actual credentials (see Environment Variables section below)
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install

# Create your environment file
cp .env.example .env
# Then edit .env with your Google Client ID
```

### 4. Start MongoDB

```bash
# If installed locally:
mongod

# Or verify it's running:
mongosh --eval "db.runCommand({ ping: 1 })"
```

### 5. Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### 6. Open in Browser

Navigate to **http://localhost:5173** 🎉

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `PORT` | Server port | Default: `5000` |
| `MONGODB_URI` | MongoDB connection string | Local: `mongodb://localhost:27017/healsmart` or [MongoDB Atlas](https://www.mongodb.com/atlas) |
| `JWT_SECRET` | Secret key for JWT tokens | Generate any random 64-char string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GEMINI_API_KEY` | Google Gemini AI API key | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NVIDIA_API_KEY` | NVIDIA NIM API key (optional fallback) | [NVIDIA Build](https://build.nvidia.com/) |
| `RAZORPAY_KEY_ID` | Razorpay key ID | [Razorpay Dashboard](https://dashboard.razorpay.com/) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | [Razorpay Dashboard](https://dashboard.razorpay.com/) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth client ID as backend |
| `VITE_API_URL` | Backend API URL (default: `http://localhost:5000/api`) |

---

## 🧠 AI Architecture

HealSmart AI uses a **3-tier intelligent fallback** system to ensure the AI Doctor never fails:

```
┌─────────────────────────────────┐
│  Tier 1: Google Gemini          │  ← Primary (gemini-3.5-flash)
│  Fast, multilingual, accurate   │
├─────────────────────────────────┤
│  Tier 2: NVIDIA NIM             │  ← Secondary fallback
│  nemotron-70b-instruct          │
├─────────────────────────────────┤
│  Tier 3: Clinical Assistant     │  ← Offline safety net
│  Built-in medical knowledge     │     (never crashes)
└─────────────────────────────────┘
```

**Features:**
- 🌐 Auto-detects English, Hindi, and Hinglish — responds in the same language
- 🚨 Emergency detection (chest pain, breathing difficulty) → immediate ER advice
- 📋 Structured assessments with urgency levels (LOW / MEDIUM / HIGH / EMERGENCY)
- 💊 Drug interaction checking between multiple medications

---

## 🔒 Security

- **Helmet** — HTTP security headers
- **Rate Limiting** — 200 req/15min general, 10 req/min for AI endpoints
- **JWT Authentication** — Stateless token-based auth
- **bcryptjs** — Password hashing with salt rounds
- **CORS** — Restricted to known origins
- **Input Sanitization** — MongoDB query injection prevention

---

## 📜 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login with email/password | ❌ |
| `POST` | `/api/auth/google` | Google OAuth login | ❌ |
| `POST` | `/api/ai/chat` | AI Doctor consultation | ✅ |
| `POST` | `/api/ai/interactions` | Drug interaction check | ✅ |
| `GET` | `/api/ai/sessions` | Get chat history | ✅ |
| `GET` | `/api/doctors` | List/search doctors | ❌ |
| `POST` | `/api/doctors/book` | Book appointment | ✅ |
| `GET` | `/api/medicines` | List/search medicines | ❌ |
| `POST` | `/api/medicines/order` | Place order | ✅ |
| `GET` | `/api/lab-tests` | List lab tests | ❌ |
| `POST` | `/api/lab-tests/book` | Book a test | ✅ |
| `POST` | `/api/payment/create` | Create Razorpay order | ✅ |
| `POST` | `/api/payment/verify` | Verify payment | ✅ |
| `GET` | `/api/health` | Health check | ❌ |

---

## 🛠️ Scripts

### Backend
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Production start
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/DipeshNawani">Dipesh Nawani</a>
</p>
