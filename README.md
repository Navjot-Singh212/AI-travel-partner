# Explore Local — Grounded AI Heritage Guide & Mood-Based Travel

A modern, mobile-responsive local tourism web application built for hackathon evaluation. Features an **AI Heritage Lens** as the main centerpiece for landmark recognition and storytelling, alongside a secondary **Explore Section** providing vibe-based place discovery and personalized trip planning.

---

## 🌟 Core Features

### 1. AI Heritage Lens (Primary Centerpiece)
- **Photo Upload & Mobile Camera Capture**: Upload photos or capture directly using smartphone camera (`accept="image/*" capture="environment"`).
- **Client-Side Image Compression**: High-resolution photos (often 8–15 MB) are automatically downscaled and compressed via an HTML5 canvas pipeline to under 1 MB, safely complying with Vercel's 4.5 MB serverless payload limits.
- **Engaging Narrative & Architectural Analysis**: Identifies architectural style, visible features, and cultural background using Google's **Gemini 2.5 Flash**.
- **Strict Grounding & Truthfulness**:
  - **No False "Verified" Claims**: Visual estimations are explicitly labeled as *"Visual / Architectural Estimate (Unconfirmed)"*.
  - Historical facts are never invented; when records are uncorroborated, the app clearly notes this.
  - Sourced citations are rendered only when returned by Google Search grounding.
  - Direct **"Verify on Google Maps"** buttons allow instant fact-checking of hours, location, and authentic photos.
- **Browser-Native Audio Narration**: Built with the **Web Speech API** (`window.speechSynthesis`), providing instant, zero-latency text-to-speech with Play, Pause, Resume, and Stop controls, and animated audio waveforms.

### 2. Secondary Explore Section
- **Vibe-Based Discovery**: Input any city, region, or neighborhood and select or type a vibe (*"sandy"*, *"eerie"*, *"joyful"*, *"cute"*, *"historic"*, *"serene"*, etc.). Dynamic place suggestions are generated with context on why they match the vibe, plus Google Maps verification links.
- **Smart Trip Planner**: Generates a day-by-day (1 to 5 days) itinerary tailored to the traveler's pace (*relaxed*, *moderate*, *fast-paced*) and interests (*architecture*, *food*, *nature*, *photo spots*).
- **Zero Hallucinated Lists**: No hardcoded destinations or fake recommendations.

---

## 🔒 Security & Free Tier Compliance

- **Zero-Cost Safeguard**: Designed exclusively for Google AI Studio's **Free Tier** (`gemini-2.5-flash`). Does not invoke paid tools, Google Cloud billing accounts, or paid Google Maps APIs.
- **Server-Side API Key Only**: `GEMINI_API_KEY` is loaded in server route handlers (`/api/heritage-lens` and `/api/explore`). The key is **never** sent to the browser client or committed to Git.
- **Privacy First**: Uploaded images are kept strictly in browser memory/canvas during the session and are **never stored on disk or in databases**.

---

## 🛠️ How to Confirm Your Free Tier in Google AI Studio

1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Click the **Settings (gear icon)** or **Plan and billing** in the sidebar.
3. Confirm that your plan displays **"Free of charge"**.
4. Do not link a Google Cloud billing account or credit card.
5. Create a key in **Get API Key** and use it for local development.

---

## 🚀 Local Development

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repository-url>
cd "Travel guide"
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Add your free Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: Never paste your API key in chat or commit `.env.local` to Git)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Under **Settings > Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
5. Click **Deploy**. Next.js App Router will build and deploy cleanly.

---

## 📋 What Works & Limitations

| Feature | Status | Notes |
|---|---|---|
| **Heritage Lens Image Upload & Camera** | Working | Compresses to < 1 MB on canvas |
| **Server-Side Multimodal Analysis** | Working | Requires `GEMINI_API_KEY` in `.env.local` |
| **Web Speech Audio Storyteller** | Working | Native browser speech (works offline) |
| **Grounding Citations & Maps Verification** | Working | Direct links to Google Maps |
| **Vibe-Based Place Discovery** | Working | Dynamic real places matching vibes |
| **Custom Multi-Day Trip Planner** | Working | Dynamic day-by-day outline |
| **Keyless State / Quota Warning** | Working | Clear informative UI alerts |
