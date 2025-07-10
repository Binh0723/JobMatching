import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseResumeContent } from './resumeParser.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Debug: Log the values being used
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseKey);
console.log('Gemini API Key present:', !!process.env.GEMINI_API_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Resume parsing is now handled by the Gemini AI-powered parser in resumeParser.js

// Calculate match score between candidate and job
function calculateMatchScore(candidate, job) {
  let score = 0;
  
  // Skill matching (60% weight)
  const candidateSkills = candidate.skills || [];
  const jobRequirements = job.requirements || [];
  const matchingSkills = candidateSkills.filter(skill => 
    jobRequirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
  );
  const skillScore = (matchingSkills.length / Math.max(jobRequirements.length, 1)) * 60;
  score += skillScore;

  // Experience level matching (25% weight)
  const experienceLevels = { 'entry-level': 1, 'mid-level': 2, 'senior-level': 3 };
  const candidateLevel = experienceLevels[candidate.seniority_level] || 1;
  const jobLevel = experienceLevels[job.experience_level] || 2;
  const experienceScore = Math.max(0, (1 - Math.abs(candidateLevel - jobLevel) / 2)) * 25;
  score += experienceScore;

  // Location preference (15% weight)
  const locationScore = (candidate.preferred_location && 
    job.location.toLowerCase().includes(candidate.preferred_location.toLowerCase())) ? 15 : 0;
  score += locationScore;

  return Math.min(100, Math.round(score));
}

// Routes

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Upload resume and create candidate
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, email, preferredLocation } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Parse resume content using Gemini AI
    const resumeData = await parseResumeContent(req.file.path, req.file.originalname);

    // Create candidate record
    const { data: candidate, error } = await supabase
      .from('candidates')
      .insert({
        name,
        email,
        resume_filename: req.file.filename,
        resume_content: resumeData.content,
        skills: resumeData.skills,
        experience_years: resumeData.experienceYears,
        seniority_level: resumeData.seniorityLevel,
        preferred_location: preferredLocation || null,
        education: resumeData.education,
        current_role: resumeData.currentRole,
        summary: resumeData.summary
      })
      .select()
      .single();

    if (error) throw error;

    // Generate job matches
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*');

    const matches = jobs.map(job => ({
      candidate_id: candidate.id,
      job_id: job.id,
      match_score: calculateMatchScore(candidate, job)
    }));

    // Insert job matches
    await supabase
      .from('job_matches')
      .insert(matches);

    res.json({ 
      message: 'Resume uploaded successfully',
      candidateId: candidate.id,
      candidate
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get candidate dashboard data
app.get('/api/candidate/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;

    // Get candidate data
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (candidateError) throw candidateError;

    // Get job matches with job details
    const { data: matches, error: matchesError } = await supabase
      .from('job_matches')
      .select(`
        *,
        jobs (
          id,
          title,
          company,
          description,
          location,
          salary_range,
          requirements,
          experience_level,
          employment_type,
          remote_friendly
        )
      `)
      .eq('candidate_id', id)
      .order('match_score', { ascending: false });

    if (matchesError) throw matchesError;

    res.json({
      candidate,
      recommendations: matches
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get job details
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});