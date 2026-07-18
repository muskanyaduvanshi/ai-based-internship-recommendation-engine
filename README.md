# AI-Based Internship Recommendation Engine

An AI-powered internship recommendation platform built with **React, TypeScript, and Vite** that helps students discover relevant internship opportunities based on their skills, interests, and preferences. The platform integrates **Google Gemini AI** to provide resume analysis, career guidance, personalized career paths, live internship search, and an interactive internship simulation experience.

The application provides separate portals for **Students** and **Recruiters**, allowing recruiters to post internship opportunities, manage applicants, and review candidate profiles.

---

## 🚀 Features

### 👨‍🎓 Student Portal
- Student Registration & Login
- Personalized Internship Recommendations
- AI Resume Analysis
- AI Career Coach
- Personalized Career Path Generation
- Live Internship Search using Google Gemini
- Interactive "Day 1 Internship" Simulator
- Apply for Internships
- Track Application Status
- Persistent Login Sessions

### 🏢 Recruiter Portal
- Recruiter Registration & Login
- Post Internship Opportunities
- Manage Posted Jobs
- View Candidate Profiles
- Review Applications
- Update Application Status

### 🤖 AI Features
- Resume Analysis using Google Gemini
- AI Career Guidance
- Personalized Career Roadmaps
- Live Internship Search
- Interactive Internship Simulation

---

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite

### Styling
- Tailwind CSS

### AI Integration
- Google Gemini API

### Recommendation Engine
- Hybrid Recommendation System
- Content-Based Filtering
- Collaborative Filtering

### Data Storage
- Browser LocalStorage

---

## 📂 Project Structure

```
src/
├── components/
├── context/
├── data/
├── services/
├── types/
├── App.tsx
└── main.tsx
```

---

## ⚙️ Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later (Node.js 22 recommended)
- npm
- Google Gemini API Key

Generate your API key from:

https://aistudio.google.com/app/apikey

---

## ▶️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/muskanyaduvanshi/ai-based-internship-recommendation-engine.git
```

### 2. Navigate to the project

```bash
cd ai-based-internship-recommendation-engine
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create a `.env.local` file

Add your Gemini API key:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 5. Start the development server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## 🏗️ Build for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key used for AI-powered features such as resume analysis, career guidance, internship search, and internship simulation. |

> **Note:** The `.env.local` file is ignored by Git, so your API key remains private.

---

## 💾 Data Persistence

The application currently uses **Browser LocalStorage** for persistent data storage.

The following information is stored locally:

- Student Accounts
- Recruiter Accounts
- Internship Listings
- Job Applications
- User Interactions
- Login Sessions

Data persists across browser refreshes and application restarts unless browser storage is manually cleared.

---

## 🌐 Deployment

This project can be deployed on any static hosting platform such as:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Before deployment, configure the following environment variable:

```
GEMINI_API_KEY
```

> **Security Note:** Since this is a frontend application, the Gemini API key is bundled into the client during the build process. For production applications, it is recommended to route AI requests through a secure backend instead of exposing the API key in the frontend.

---

## 🔮 Future Enhancements

- Node.js & Express Backend
- MongoDB Database Integration
- JWT Authentication
- Resume Upload (PDF)
- Email Notifications
- Admin Dashboard
- AI-Based Skill Gap Analysis
- Company Analytics Dashboard

---

## 👩‍💻 Author

**Muskan Yaduvanshi**

- GitHub: https://github.com/muskanyaduvanshi

---

## 📄 License

This project is developed for educational and portfolio purposes.
