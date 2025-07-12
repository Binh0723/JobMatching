import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes and middleware
import { uploadResumeResumeBased, getResumeBasedMatches } from './routes/candidates.js';
import { getAllJobs, getJobDetails } from './routes/jobs.js';
import { upload } from './middleware/upload.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/jobs', getAllJobs);
app.get('/api/jobs/:id', getJobDetails);

// Resume-based routes (no database storage of matches)
app.post('/api/upload-resume', upload.single('resume'), uploadResumeResumeBased);
app.get('/api/candidate/:id/dashboard', getResumeBasedMatches);

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  // Server started successfully
});