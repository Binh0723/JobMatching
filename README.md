# Personalized Career Site

AI-powered job matching platform that analyzes resumes and provides personalized job recommendations using Google's Gemini AI.

## ✨ Features

- **Smart Resume Parsing** - Upload PDF/DOC/DOCX files for AI analysis
- **Intelligent Matching** - Career field detection prevents cross-industry mismatches
- **Personalized Dashboard** - Tailored job recommendations with match scores
- **Advanced Search** - Filter by location, experience level, and remote options
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express, Google Gemini AI  
**Database:** PostgreSQL (Supabase)  
**Deployment:** Vercel

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd personalized-career-site
   npm install
   ```

2. **Environment Setup**
   Create `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_ai_api_key
   ```

3. **Database Setup**
   - Create Supabase project
   - Run migration: `supabase/migrations/20250710195238_frosty_surf.sql`

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🎯 How It Works

1. **Upload Resume** - AI extracts skills, experience, and career level
2. **Smart Matching** - Algorithm prevents cross-industry mismatches
3. **Get Results** - Personalized dashboard with match scores (0-100%)

---

Production App: [https://job-matching-first-evjlbml4r-b2307s-projects.vercel.app/](https://job-matching-first-evjlbml4r-b2307s-projects.vercel.app/)

