# Server Structure

The server has been refactored into a modular structure for better maintainability and organization.

## Directory Structure

```
server/
├── index.js                 # Main server file
├── resumeParser.js          # Resume parsing with Gemini AI
├── config/
│   └── database.js         # Database configuration and Supabase client
├── middleware/
│   └── upload.js           # File upload configuration
├── routes/
│   ├── candidates.js       # Candidate-related routes
│   └── jobs.js            # Job-related routes
├── utils/
│   └── matching.js        # Job matching and scoring utilities
└── README.md              # This file
```

## File Descriptions

### `index.js`
- Main Express server setup
- Middleware configuration
- Route registration
- Server startup

### `resumeParser.js`
- PDF/DOCX text extraction
- Gemini AI integration for resume analysis
- JSON parsing and error handling

### `config/database.js`
- Supabase client initialization
- Environment variable logging
- Database connection setup

### `middleware/upload.js`
- Multer configuration for file uploads
- File type validation (PDF, DOC, DOCX)
- File size limits (5MB)
- Upload directory management

### `routes/candidates.js`
- `uploadResume()`: Handle resume upload and candidate creation/update
- `getDashboard()`: Fetch candidate dashboard data with job matches
- Database operations for candidates and job matches

### `routes/jobs.js`
- `getAllJobs()`: Fetch all available jobs
- `getJobDetails()`: Fetch specific job details
- Job-related database operations

### `utils/matching.js`
- `calculateMatchScore()`: Calculate job-candidate match scores
- `calculateCareerProgressionScore()`: Career progression logic
- `filterJobsByLevel()`: Experience level filtering
- `filterByScoreThreshold()`: Quality threshold filtering

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a specific responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Testability**: Individual modules can be tested in isolation
4. **Scalability**: Easy to add new routes, utilities, or middleware
5. **Readability**: Smaller, focused files are easier to understand

## API Endpoints

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get specific job details
- `POST /api/upload-resume` - Upload resume and create/update candidate
- `GET /api/candidate/:id/dashboard` - Get candidate dashboard with job matches

## Key Features

- **Resume Parsing**: AI-powered resume analysis with Gemini
- **Smart Matching**: Career progression and skill-based job matching
- **Quality Filtering**: 30% minimum match score threshold
- **Level Filtering**: Experience-appropriate job recommendations
- **File Upload**: Secure PDF/DOC/DOCX upload handling 