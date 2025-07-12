import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { parseResumeContent } from '../resumeParser.js';
import { calculateMatchScore, filterJobsByLevel, filterByScoreThreshold } from '../utils/matching.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Initialize Supabase client with better error handling
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'your-supabase-url') {
  console.error('VITE_SUPABASE_URL environment variable is not set or is using placeholder value');
  console.error('Please set VITE_SUPABASE_URL to your actual Supabase project URL');
}

if (!supabaseKey || supabaseKey === 'your-supabase-anon-key') {
  console.error('VITE_SUPABASE_ANON_KEY environment variable is not set or is using placeholder value');
  console.error('Please set VITE_SUPABASE_ANON_KEY to your actual Supabase anon key');
}

// Only create Supabase client if we have valid credentials
let supabase = null;
if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url' && supabaseKey !== 'your-supabase-anon-key') {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully');
} else {
  console.error('Supabase client not initialized due to missing or invalid credentials');
}

// Upload resume and create candidate - RESUME-BASED (No database storage of matches)
export async function uploadResumeResumeBased(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { preferredLocation } = req.body;
    
    // Generate unique identifier for anonymous candidate
    const candidateId = uuidv4();
    const anonymousEmail = `anonymous_${candidateId}@resume-upload.com`;
    const anonymousName = `Candidate_${candidateId.substring(0, 8)}`;

    // Parse resume content using Gemini AI from buffer
    const resumeData = await parseResumeContent(req.file.buffer, req.file.originalname);
    console.log('Resume parsed successfully:', resumeData);

    // Create new candidate with anonymous data
    console.log('Creating new anonymous candidate...');
    const { data: newCandidate, error } = await supabase
      .from('candidates')
      .insert({
        id: candidateId,
        name: anonymousName,
        email: anonymousEmail,
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

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    console.log('Candidate created successfully:', newCandidate);

    // Generate job matches using NEW algorithm (NO DATABASE STORAGE)
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*');

    // Filter jobs based on candidate's experience level
    const filteredJobs = filterJobsByLevel(jobs, newCandidate.seniority_level);
    console.log(`Found ${filteredJobs.length} jobs matching candidate's experience level (${newCandidate.seniority_level})`);

    // Calculate matches using the NEW algorithm (PURELY RESUME-BASED)
    const matches = filteredJobs.map(job => ({
      candidate_id: newCandidate.id,
      job_id: job.id,
      match_score: calculateMatchScore(newCandidate, job),
      jobs: job
    }));

    // Filter by score threshold
    const qualityMatches = filterByScoreThreshold(matches.map(match => ({
      ...match,
      candidate: newCandidate
    })), 30);
    
    console.log(`Created ${matches.length} total matches, ${qualityMatches.length} with score >= 30`);
    
    // If no quality matches found, return early
    if (qualityMatches.length === 0) {
      console.log('No quality matches found (all scores below 30). No matches will be created.');
      res.json({ 
        message: 'Resume uploaded successfully, but no suitable job matches found. Consider updating your skills or experience.',
        candidateId: newCandidate.id,
        candidate: newCandidate,
        matchesCount: 0,
        recommendations: []
      });
      return;
    }

    // Return the matches directly without storing in database
    res.json({ 
      message: 'Resume uploaded successfully',
      candidateId: newCandidate.id,
      candidate: newCandidate,
      matchesCount: qualityMatches.length,
      recommendations: qualityMatches.slice(0, 10) // Return first 10 matches
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
}

// Get candidate dashboard data - PURELY RESUME-BASED
export async function getResumeBasedMatches(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get candidate data from database (we still need this for the resume info)
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (candidateError) throw candidateError;

    // Get all jobs from database (we still need the job data)
    const { data: allJobs } = await supabase
      .from('jobs')
      .select('*');

    // Filter jobs based on candidate's experience level
    const filteredJobs = filterJobsByLevel(allJobs, candidate.seniority_level);
    console.log(`Found ${filteredJobs.length} jobs matching candidate's experience level (${candidate.seniority_level})`);

    // Calculate matches using the NEW algorithm (PURELY RESUME-BASED)
    const matches = filteredJobs.map(job => ({
      candidate_id: candidate.id,
      job_id: job.id,
      match_score: calculateMatchScore(candidate, job),
      jobs: job
    }));

    // Filter by score threshold
    const qualityMatches = filterByScoreThreshold(matches.map(match => ({
      ...match,
      candidate: candidate
    })), 30);

    // Apply pagination
    const totalMatches = qualityMatches.length;
    const paginatedMatches = qualityMatches.slice(offset, offset + limitNum);

    console.log(`Dashboard: Found ${paginatedMatches.length} matches for ${candidate.seniority_level} candidate (page ${pageNum}, total: ${totalMatches})`);

    // Calculate pagination info
    const totalPages = Math.ceil(totalMatches / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      candidate,
      recommendations: paginatedMatches,
      matchesCount: paginatedMatches.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalMatches,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

 