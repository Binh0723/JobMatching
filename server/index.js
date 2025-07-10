import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes and middleware
import { uploadResume, getDashboard } from './routes/candidates.js';
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
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/jobs', getAllJobs);
app.get('/api/jobs/:id', getJobDetails);
app.post('/api/upload-resume', upload.single('resume'), uploadResume);
app.get('/api/candidate/:id/dashboard', getDashboard);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});