import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { parseResumeContent } from '../resumeParser.js';
import { calculateMatchScore, filterJobsByLevel, filterByScoreThreshold } from '../utils/matching.js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Upload resume and create candidate
export async function uploadResume(req, res) {
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
    console.log('Resume parsed successfully:', resumeData);

    // Check if candidate already exists
    console.log('Checking if candidate already exists...');
    const { data: existingCandidate, error: checkError } = await supabase
      .from('candidates')
      .select('*')
      .eq('email', email)
      .single();

    let candidate;
    if (existingCandidate) {
      // Update existing candidate
      console.log('Updating existing candidate...');
      const { data: updatedCandidate, error: updateError } = await supabase
        .from('candidates')
        .update({
          name,
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
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }
      candidate = updatedCandidate;
      console.log('Candidate updated successfully:', candidate);
    } else {
      // Create new candidate
      console.log('Creating new candidate...');
      const { data: newCandidate, error } = await supabase
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

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      candidate = newCandidate;
      console.log('Candidate created successfully:', candidate);
    }

    // Generate job matches
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*');

    // Filter jobs based on candidate's experience level
    const filteredJobs = filterJobsByLevel(jobs, candidate.seniority_level);
    console.log(`Found ${filteredJobs.length} jobs matching candidate's experience level (${candidate.seniority_level})`);

    // If no jobs match the candidate's level, return empty matches
    if (filteredJobs.length === 0) {
      console.log('No jobs found matching candidate\'s experience level. No matches will be created.');
      res.json({ 
        message: 'Resume uploaded successfully, but no matching jobs found for your experience level',
        candidateId: candidate.id,
        candidate,
        matchesCount: 0
      });
      return;
    }

    const matches = filteredJobs.map(job => ({
      candidate_id: candidate.id,
      job_id: job.id,
      match_score: calculateMatchScore(candidate, job)
    }));

    // Filter out matches with very low scores (below 30)
    const qualityMatches = filterByScoreThreshold(matches, 30);
    
    console.log(`Created ${matches.length} total matches, ${qualityMatches.length} with score >= 30`);
    
    // If no quality matches found, return early
    if (qualityMatches.length === 0) {
      console.log('No quality matches found (all scores below 30). No matches will be created.');
      res.json({ 
        message: 'Resume uploaded successfully, but no suitable job matches found. Consider updating your skills or experience.',
        candidateId: candidate.id,
        candidate,
        matchesCount: 0
      });
      return;
    }

    // Insert job matches
    await supabase
      .from('job_matches')
      .insert(qualityMatches);

    res.json({ 
      message: 'Resume uploaded successfully',
      candidateId: candidate.id,
      candidate
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
}

// Get candidate dashboard data
export async function getDashboard(req, res) {
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

    // Filter matches based on candidate's experience level
    const filteredMatches = matches.filter(match => {
      const candidateLevel = candidate.seniority_level;
      const jobLevel = match.jobs.experience_level;
      
      // Define level compatibility
      const levelCompatibility = {
        'entry-level': ['entry-level'],
        'mid-level': ['entry-level', 'mid-level'],
        'senior-level': ['mid-level', 'senior-level'],
        'manager': ['senior-level', 'manager'],
        'director': ['senior-level', 'manager', 'director'],
        'vp': ['manager', 'director', 'vp'],
        'c-level': ['director', 'vp', 'c-level']
      };
      
      return levelCompatibility[candidateLevel]?.includes(jobLevel) || false;
    });

    // Also filter by match score threshold (30%)
    const qualityMatches = filterByScoreThreshold(filteredMatches, 30);

    console.log(`Dashboard: Found ${matches.length} total matches, ${filteredMatches.length} after level filtering, ${qualityMatches.length} with score >= 30`);

    res.json({
      candidate,
      recommendations: qualityMatches,
      matchesCount: qualityMatches.length
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

export { uploadResume, getDashboard }; 