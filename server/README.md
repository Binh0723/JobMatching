# Server Structure

A modular Express server with AI-powered resume parsing and job matching.

## 📁 Folder Structure

```
server/
├── 📄 index.js              # Main server entry point
├── 🤖 resumeParser.js       # Gemini AI resume analysis
├── ⚙️ config/
│   └── database.js          # Supabase connection
├── 🔧 middleware/
│   └── upload.js            # File upload handling
├── 🛣️ routes/
│   ├── candidates.js        # Resume upload & dashboard
│   └── jobs.js             # Job listing & details
└── 🧮 utils/
    └── matching.js          # Job matching algorithms
```

## 🎯 What Each Folder Does

### `config/` - Database & External Services
- **database.js**: Supabase client setup and connection management

### `middleware/` - Request Processing
- **upload.js**: Handles PDF/DOC/DOCX file uploads with validation

### `routes/` - API Endpoints
- **candidates.js**: Resume upload and candidate dashboard
- **jobs.js**: Job listings and job details

### `utils/` - Business Logic
- **matching.js**: Job-candidate matching algorithms and scoring

## 🚀 Key Features

- **AI Resume Parsing** with Gemini
- **Smart Job Matching** with career progression
- **Quality Filtering** (30%+ match scores)
- **Experience Level Filtering**
- **Secure File Uploads**

## 📡 API Endpoints

- `POST /api/upload-resume` - Upload & parse resume
- `GET /api/candidate/:id/dashboard` - Get job matches
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details 