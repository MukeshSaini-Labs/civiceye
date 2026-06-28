<div align="center">
  <img src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" width="800" alt="Google AI Studio Banner"/>
  <h1>🛡️ CivicEye Nexus</h1>
  <p><strong>Autonomous Urban Infrastructure Management System</strong></p>
  <p>Powered by Google Gemini 2.5 Flash & Google Cloud Platform</p>
</div>

---

## 📌 Problem Statement Selected
**Problem Statement 2 - Community Hero (Hyperlocal Problem Solver)**

Communities frequently face issues such as potholes, water leakages, damaged streetlights, and waste management concerns. Reporting these issues is often fragmented, difficult to track, and lacks transparency. CivicEye Nexus solves this by building an AI-first platform that enables citizens to identify, report, track, and resolve community issues through intelligent automation.

---

## 🚀 Solution Overview
CivicEye Nexus replaces outdated municipal reporting forms with an intelligent, agentic **AI Command Terminal**. Citizens can effortlessly report hazards, track issue telemetry in real-time, and view live geographical mapping of their city's health. 

Our AI acts as the central nervous system—it autonomously categorizes incoming issues via Vision API, verifies reports, predicts cascading infrastructure failures (generating 7-day technical forecasts), and seamlessly routes critical tasks to verified contractors. 

---

## ✨ Key Features (Deep Technical View)

1. **Multi-Frame Video Analysis & Speech Transcription:** 
   Citizens can upload videos, and our system automatically extracts multiple frames across the timeline and transcribes the citizen's voice via the Web Speech API. We feed these multimodal inputs to Gemini to get a near-perfect assessment of the issue.
2. **Structured AI Outputs (JSON Triage Parsing):** 
   We implemented a strict `responseSchema` for Gemini 2.5 Flash. It outputs highly structured JSON data (Severity Level, Triage Tier, Department Routing) which is programmatically injected straight into our headless CMS database.
3. **Autonomous AI Terminal & Nexus Protocols:** 
   A Cyberpunk-styled Nexus Command Terminal. Citizens can type casually in English, Hindi, or Hinglish. The AI Agent actively parses their intent and automatically triggers these complex backend workflows (Core Protocols):
   - `[REPORT] REPORT HAZARD` (Citizen Safety Protocol)
   - `[MAP] VIEW LIVE MAP` (Geo-Telemetry Tracking)
   - `[FORECAST] PREDICTIVE INSIGHTS` (AI Infrastructure Forecast)
   - `[ANALYTICS] CITY ANALYTICS` (Live DB Query)
   - `[TRACK] TRACK HISTORY` (Check Report Status)
   - `[TICKET] RAISE SUPPORT TICKET` (Technical Help Desk)
4. **Anti-Hacking Firewall & Secure Auth Binding:** 
   Every database record is cryptographically bound to the user's Firebase Auth UID to ensure strict data privacy. Our backend also features a custom regex-based firewall to strip out XSS and prompt-hijacking attempts.
5. **Agentic Forecasting (Predictive Insights):** 
   The Nexus AI continuously reads the live Sanity database of active issues to generate a 7-day predictive analytics report.
6. **Auto-Gamification (XP Bounties):** 
   The backend automatically calculates user participation. When a user reports or verifies a hazard, the AI triggers a database upsert to assign them `+100 XP`, updating the Civic Leaderboard.
7. **Live Holo-Map Telemetry (Geo-Location):** 
   A real-time, interactive geographical map powered by Google Maps Platform telemetry.

---

## 🛠️ Technologies & Ecosystem

- **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion
- **Database:** Sanity CMS (Headless real-time DB)
- **Email Communications:** Resend API
- **Deployment & Version Control:** Orchestrated via Antigravity directly to Google Cloud Platform & GitHub.

### 🧠 Google Technologies Utilized (The Core Engine)
* **Google AI Studio (Gemini 2.5 Flash API):** Handles conversational routing, structured JSON extraction, automated visual issue categorization, multi-language translation, and predictive forecasting.
* **Google Cloud Platform (GCP):** Deployed on GCP for enterprise-grade scalability, security, and minimal latency for real-time AI processing.
* **Firebase Authentication:** Utilized for secure, fast, and reliable user identity management and 1:1 data binding.
* **Google Maps Platform:** Powers the Live Holo-Map geospatial telemetry visualization.

---

## 💻 Run Locally

**Prerequisites:** Node.js (v18+)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/civiceye-nexus.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env.local`:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_key
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_id
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
