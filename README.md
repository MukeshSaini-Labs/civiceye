<div align="center">
  <img src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" width="800" alt="Google AI Studio Banner"/>
  <h1>🛡️ CivicEye Nexus</h1>
  <p><strong>Autonomous Urban Infrastructure Management System</strong></p>
  <p>Powered by Google Gemini 2.5 Flash & Google Cloud Platform</p>
</div>

---

## 📄 Google Doc Draft (Copy-Paste This for Submission)

**Problem Statement Selected:** Problem Statement 2 - Community Hero (Hyperlocal Problem Solver)

**Solution Overview:** 
CivicEye Nexus is a highly advanced, autonomous community management platform designed to revolutionize how citizens and municipalities interact. It replaces outdated, manual municipal reporting forms with an intelligent, agentic AI terminal (powered heavily by Google's Gemini 2.5 Flash). Citizens can effortlessly report hazards, track issue telemetry in real-time, and view live geographical mapping of their city's health.

Our AI acts as the central nervous system of the platform—it autonomously categorizes incoming issues, verifies reports, predicts cascading infrastructure failures (generating 7-day technical forecasts), and seamlessly routes critical tasks to verified contractors. By enforcing 1:1 strict authentication binding and live data tracking, CivicEye Nexus ensures total transparency, community-driven accountability, and zero manual bottleneck in urban infrastructure management.

### Key Features (Deep Technical View):

* **Multi-Frame Video Analysis & Speech Transcription:** Our hazard reporting isn't just photos. Citizens can upload videos, and our system automatically extracts multiple frames across the timeline and transcribes the citizen's voice via the Web Speech API. We feed these multimodal inputs to Gemini to get a near-perfect assessment of the issue.
* **Structured AI Outputs (JSON Triage Parsing):** Instead of using AI as a simple chatbot, we implemented a strict `responseSchema` for Gemini 2.5 Flash. It outputs highly structured JSON data (Severity Level, Triage Tier, Department Routing, Spam Detection) which is programmatically injected straight into our headless CMS database.
* **Autonomous AI Terminal & Nexus Protocols:** Unlike traditional click-through interfaces, our platform features a Cyberpunk-styled Nexus Command Terminal. Citizens can type casually in English, Hindi, or Hinglish. The AI Agent actively parses their intent and automatically triggers these complex backend workflows (Core Protocols):
  * `[REPORT] REPORT HAZARD` (Citizen Safety Protocol)
  * `[MAP] VIEW LIVE MAP` (Geo-Telemetry Tracking)
  * `[FORECAST] PREDICTIVE INSIGHTS` (AI Infrastructure Forecast)
  * `[ANALYTICS] CITY ANALYTICS` (Live DB Query)
  * `[TRACK] TRACK HISTORY` (Check Report Status)
  * `[TICKET] RAISE SUPPORT TICKET` (Technical Help Desk)
* **Anti-Hacking Firewall & Secure Auth Binding:** To maintain strict data privacy, every database record is cryptographically bound to the user's Firebase Auth UID. Furthermore, our backend features a custom regex-based firewall to strip out XSS tags, javascript injection, and prompt-hijacking attempts before it ever touches the AI.
* **Agentic Forecasting (Predictive Insights):** The Nexus AI continuously reads the live Sanity database of active issues to generate a 7-day predictive analytics report. It identifies key vulnerabilities, predicts potential cascading failures, and outputs actionable mitigation strategies for contractors.
* **Auto-Gamification (XP Bounties):** The backend automatically calculates user participation. When a user reports or verifies a hazard, the AI triggers a database upsert to strictly assign them +100 XP, which instantly updates the Civic Leaderboard to gamify citizen engagement.
* **Live Holo-Map Telemetry (Geo-Location):** A real-time, interactive geographical map powered by Google Maps Platform telemetry that plots Geo-JSON coordinates of reported hazards.
* **Automated Contractor Bidding & Communication:** Verified contractors can bid on live tenders directly on the platform, and the Resend API dispatches premium email alerts upon status changes.

### Technologies Used:

* **Frontend/Framework:** Next.js 15, React, Tailwind CSS, Framer Motion, Lucide Icons.
* **Backend/Database:** Sanity CMS (Headless real-time DB).
* **Authentication:** Firebase Auth.
* **Email Infrastructure:** Resend API.
* **UI Architecture:** Glassmorphism, Dynamic pulsing telemetry, and responsive grid layouts.

### Google Technologies Utilized (The Core Engine):

* **Google AI Studio (Gemini 2.5 Flash API):** The absolute brain of CivicEye Nexus. We utilized Google AI Studio to build our Autonomous Agent. It handles intelligent conversational routing, structural data extraction, automated visual issue categorization (via multi-frame video and images), live multi-language translation, and executing our Predictive Infrastructure Forecasting algorithm.
* **Google Cloud Platform (GCP) & Antigravity:** The entire application is orchestrated and deployed using Google Cloud Run infrastructure. Furthermore, adhering to the hackathon guidelines, the live deployment to GCP and version control pipeline to GitHub was fully managed and executed collaboratively using Antigravity, ensuring an enterprise-grade CI/CD process, flawless scalability, and minimal latency for our real-time AI processing.
* **Firebase Authentication:** Utilized for secure, fast, and reliable user identity management. It allows us to securely bind database records to specific users, enabling our strict auth-gated tracking protocol.
* **Google Maps Platform:** Powers our Live Holo-Map telemetry, allowing us to accurately plot Geo-JSON coordinates of reported hazards and visualize geospatial data for community members and contractors.

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
   RESEND_API_KEY=your_resend_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
