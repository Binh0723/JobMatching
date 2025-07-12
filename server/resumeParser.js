import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini AI
const geminiApiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key present:', !!geminiApiKey);

if (!geminiApiKey) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

// Function to extract text from different file types using buffer
async function extractTextFromBuffer(fileBuffer, originalName) {
  const fileExtension = path.extname(originalName).toLowerCase();
  
  try {
    if (fileExtension === '.pdf') {
      // Use pdf2json for PDF parsing with buffer
      return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on("pdfParser_dataReady", function(pdfData) {
          const text = pdfParser.getRawTextContent();
          console.log('Extracted PDF text length:', text.length);
          console.log('Extracted PDF text (first 1000 chars):', text.substring(0, 1000));
          
          // Clean up the text
          const cleanedText = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
            .trim();
          
          console.log('Cleaned text length:', cleanedText.length);
          console.log('Cleaned text (first 1000 chars):', cleanedText.substring(0, 1000));
          
          if (cleanedText.length < 50) {
            console.warn('Warning: Very little text extracted from PDF. This might indicate a parsing issue.');
            // Try alternative parsing method
            try {
              const alternativeText = extractTextFromPDFPages(pdfData);
              if (alternativeText.length > cleanedText.length) {
                console.log('Using alternative PDF parsing method');
                resolve(alternativeText);
                return;
              }
            } catch (altError) {
              console.log('Alternative parsing also failed:', altError.message);
            }
          }
          
          resolve(cleanedText);
        });
        
        pdfParser.on("pdfParser_dataError", function(errData) {
          console.error('PDF parsing error:', errData);
          reject(new Error('Failed to parse PDF: ' + errData.parserError));
        });
        
        pdfParser.parseBuffer(fileBuffer);
      });
    } else if (fileExtension === '.docx') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      console.log('Extracted DOCX text:', result.value.substring(0, 500) + '...'); // Log first 500 chars
      return result.value;
    } else if (fileExtension === '.doc') {
      // For .doc files, you might need additional libraries
      throw new Error('DOC files are not supported yet. Please convert to PDF or DOCX.');
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX files.');
    }
  } catch (error) {
    console.error('Error extracting text from file buffer:', error);
    throw error;
  }
}

// Alternative PDF text extraction method
function extractTextFromPDFPages(pdfData) {
  let text = '';
  
  if (pdfData.Pages && pdfData.Pages.length > 0) {
    for (let pageIndex = 0; pageIndex < pdfData.Pages.length; pageIndex++) {
      const page = pdfData.Pages[pageIndex];
      if (page.Texts && page.Texts.length > 0) {
        for (let textIndex = 0; textIndex < page.Texts.length; textIndex++) {
          const textItem = page.Texts[textIndex];
          if (textItem.R && textItem.R.length > 0) {
            for (let rIndex = 0; rIndex < textItem.R.length; rIndex++) {
              const r = textItem.R[rIndex];
              if (r.T) {
                text += decodeURIComponent(r.T) + ' ';
              }
            }
          }
        }
      }
    }
  }
  
  return text.trim();
}

// Function to analyze resume with Gemini AI
async function analyzeResumeWithGemini(resumeText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze the following resume and extract ONLY the information that is explicitly stated. DO NOT make assumptions or infer information that is not directly mentioned.

    Expected JSON structure:
    {
      "skills": ["skill1", "skill2", "skill3"],
      "experience_years": number,
      "seniority_level": "entry-level|mid-level|senior-level",
      "education": "highest_degree",
      "current_role": "current_job_title",
      "summary": "brief_summary_of_candidate"
    }
    
    CRITICAL RULES FOR EXPERIENCE CALCULATION:
    - Look for actual dates (e.g., "2020-2023", "Jan 2021 - Dec 2022", "3 years")
    - Calculate total professional experience by adding up all work periods
    - Count internships and co-ops as experience (typically 0.5-2 years depending on duration)
    - Include part-time work and freelance work
    - If dates are not clear, estimate conservatively
    - Recent graduates with only internships = 0-2 years experience
    - Students with no work experience = 0 years
    - Entry-level: 0-2 years experience
    - Mid-level: 3-6 years experience  
    - Senior-level: 7+ years experience
    
    CRITICAL RULES FOR SKILLS:
    - Only extract skills that are EXPLICITLY mentioned in the resume
    - Include programming languages, tools, frameworks, methodologies
    - Do not infer skills from job titles or company names
    
    CRITICAL RULES FOR SENIORITY:
    - DEFAULT to "entry-level" unless clearly demonstrated otherwise
    - Recent graduates, students, and those with <3 years experience should be "entry-level"
    - Only mark as "senior-level" if explicitly stated or clearly demonstrated (5+ years, senior titles)
    - If no professional experience is mentioned, use 0 years and "entry-level"
    - If no current role is mentioned, use "Student" or "Recent Graduate"
    - If no education is mentioned, use "Not specified"
    
    Resume content:
    ${resumeText}
    
    IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);
    
    // Clean the response to extract JSON from markdown if present
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    console.log('Cleaned JSON text:', jsonText);
    
    // Try to find JSON object in the response
    try {
      // Look for JSON object boundaries
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      // Parse the JSON response
      const parsedData = JSON.parse(jsonText);
      
      // Validate and correct experience years
      let experienceYears = parsedData.experience_years || 0;
      if (typeof experienceYears !== 'number' || experienceYears < 0) {
        experienceYears = 0;
      }
      
      // Determine seniority level based on experience years
      let seniorityLevel = parsedData.seniority_level || 'entry-level';
      if (experienceYears >= 7) {
        seniorityLevel = 'senior-level';
      } else if (experienceYears >= 3) {
        seniorityLevel = 'mid-level';
      } else {
        seniorityLevel = 'entry-level';
      }
      
      return {
        skills: parsedData.skills || [],
        experienceYears: experienceYears,
        seniorityLevel: seniorityLevel,
        education: parsedData.education || '',
        currentRole: parsedData.current_role || '',
        summary: parsedData.summary || '',
        content: resumeText
      };
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Attempted to parse:', jsonText);
      // Fallback to basic parsing
      return fallbackResumeParsing(resumeText);
    }
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    // Fallback to basic parsing if Gemini fails
    return fallbackResumeParsing(resumeText);
  }
}

// Fallback parsing function with better experience calculation
export function fallbackResumeParsing(resumeText) {
  const skillsDatabase = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'PostgreSQL',
    'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'TypeScript',
    'Vue.js', 'Angular', 'Express', 'Django', 'Spring Boot', 'Machine Learning',
    'Data Science', 'DevOps', 'CI/CD', 'Agile', 'Scrum', 'REST APIs', 'GraphQL'
  ];

  // Simple keyword matching
  const extractedSkills = skillsDatabase.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );

  // Better experience calculation based on actual content analysis
  let experienceYears = calculateExperienceFromText(resumeText);
  
  // Determine seniority level based on experience years
  let seniorityLevel = 'entry-level';
  if (experienceYears >= 7) {
    seniorityLevel = 'senior-level';
  } else if (experienceYears >= 3) {
    seniorityLevel = 'mid-level';
  } else {
    seniorityLevel = 'entry-level';
  }

  return {
    skills: extractedSkills,
    experienceYears: experienceYears,
    seniorityLevel: seniorityLevel,
    education: '',
    currentRole: '',
    summary: `Resume analysis - Skills: ${extractedSkills.join(', ')}`,
    content: resumeText
  };
}

// Helper function to calculate experience from text
export function calculateExperienceFromText(resumeText) {
  const text = resumeText.toLowerCase();
  
  // Look for explicit year mentions
  const yearPattern = /(\d+)\s*(?:years?|yrs?)/g;
  const yearMatches = [...text.matchAll(yearPattern)];
  
  if (yearMatches.length > 0) {
    // Take the highest mentioned year count
    const years = yearMatches.map(match => parseInt(match[1])).sort((a, b) => b - a);
    return Math.min(years[0], 15); // Cap at 15 years to be reasonable
  }
  
  // Look for date ranges
  const dateRangePattern = /(\d{4})\s*[-–]\s*(\d{4}|\bpresent\b|\bcurrent\b)/gi;
  const dateMatches = [...text.matchAll(dateRangePattern)];
  
  if (dateMatches.length > 0) {
    let totalYears = 0;
    const currentYear = new Date().getFullYear();
    
    dateMatches.forEach(match => {
      const startYear = parseInt(match[1]);
      const endYear = match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current' 
        ? currentYear 
        : parseInt(match[2]);
      
      if (startYear && endYear && endYear >= startYear) {
        totalYears += (endYear - startYear);
      }
    });
    
    if (totalYears > 0) {
      return Math.min(totalYears, 15); // Cap at 15 years
    }
  }
  
  // Look for keywords that indicate experience level
  const seniorKeywords = ['senior', 'lead', 'manager', 'director', 'vp', 'chief', 'head of'];
  const hasSeniorKeywords = seniorKeywords.some(keyword => text.includes(keyword));
  
  const midLevelKeywords = ['mid-level', 'intermediate', 'experienced'];
  const hasMidLevelKeywords = midLevelKeywords.some(keyword => text.includes(keyword));
  
  const entryLevelKeywords = ['entry-level', 'junior', 'graduate', 'student', 'intern', 'internship'];
  const hasEntryLevelKeywords = entryLevelKeywords.some(keyword => text.includes(keyword));
  
  // Estimate based on keywords
  if (hasSeniorKeywords) {
    return Math.floor(Math.random() * 3) + 7; // 7-9 years
  } else if (hasMidLevelKeywords) {
    return Math.floor(Math.random() * 2) + 3; // 3-4 years
  } else if (hasEntryLevelKeywords) {
    return Math.floor(Math.random() * 2); // 0-1 years
  }
  
  // Default to entry-level if no clear indicators
  return 0;
}

// Main function to parse resume from buffer
export async function parseResumeContent(fileBuffer, originalName) {
  try {
    // Extract text from the uploaded file buffer
    const resumeText = await extractTextFromBuffer(fileBuffer, originalName);
    
    // Analyze with Gemini AI
    const parsedData = await analyzeResumeWithGemini(resumeText);
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
} 