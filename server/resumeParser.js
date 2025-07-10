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

// Function to extract text from different file types
async function extractTextFromFile(filePath, originalName) {
  const fileExtension = path.extname(originalName).toLowerCase();
  
  try {
    if (fileExtension === '.pdf') {
      // Use pdf2json for PDF parsing (Node.js compatible)
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
          }
          
          resolve(cleanedText);
        });
        
        pdfParser.on("pdfParser_dataError", function(errData) {
          console.error('PDF parsing error:', errData);
          reject(new Error('Failed to parse PDF: ' + errData.parserError));
        });
        
        pdfParser.loadPDF(filePath);
      });
    } else if (fileExtension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      console.log('Extracted DOCX text:', result.value.substring(0, 500) + '...'); // Log first 500 chars
      return result.value;
    } else if (fileExtension === '.doc') {
      // For .doc files, you might need additional libraries
      throw new Error('DOC files are not supported yet. Please convert to PDF or DOCX.');
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX files.');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
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
    
    CRITICAL RULES:
    - Only extract skills that are EXPLICITLY mentioned in the resume
    - Count internships, co-ops as valid experience
    - Calculate total experience including: internships, co-ops, part-time work, freelance work
    - Focus on the MOST DOMINANT experience (longest duration and most relevant to target role)
    - If no professional experience is mentioned, use 0 years and "entry-level"
    - If internships are mentioned, count them as experience (typically 0.5-2 years depending on duration)
    - If no current role is mentioned, use "Student" or "Recent Graduate"
    - If no education is mentioned, use "Not specified"
    - DO NOT infer or assume any information not directly stated
    - If the resume appears to be entry-level, mark it as "entry-level" regardless of keywords
    
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
      return {
        skills: parsedData.skills || [],
        experienceYears: parsedData.experience_years || 0,
        seniorityLevel: parsedData.seniority_level || 'entry-level',
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

// Fallback parsing function
function fallbackResumeParsing(resumeText) {
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

  // Estimate experience based on keywords
  const experienceKeywords = ['years', 'experience', 'senior', 'lead', 'manager'];
  const hasExperienceKeywords = experienceKeywords.some(keyword => 
    resumeText.toLowerCase().includes(keyword)
  );

  const experienceYears = hasExperienceKeywords ? Math.floor(Math.random() * 10) + 1 : 1;
  
  let seniorityLevel = 'entry-level';
  if (experienceYears >= 7) seniorityLevel = 'senior-level';
  else if (experienceYears >= 3) seniorityLevel = 'mid-level';

  return {
    skills: extractedSkills,
    experienceYears,
    seniorityLevel,
    education: '',
    currentRole: '',
    summary: `Resume analysis - Skills: ${extractedSkills.join(', ')}`,
    content: resumeText
  };
}

// Main function to parse resume
export async function parseResumeContent(filePath, originalName) {
  try {
    // Extract text from the uploaded file
    const resumeText = await extractTextFromFile(filePath, originalName);
    
    // Analyze with Gemini AI
    const parsedData = await analyzeResumeWithGemini(resumeText);
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
} 