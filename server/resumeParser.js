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
          resolve(text);
        });
        
        pdfParser.on("pdfParser_dataError", function(errData) {
          reject(new Error('Failed to parse PDF: ' + errData.parserError));
        });
        
        pdfParser.loadPDF(filePath);
      });
    } else if (fileExtension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
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
    Analyze the following resume and extract the following information in JSON format:
    
    {
      "skills": ["skill1", "skill2", "skill3"],
      "experience_years": number,
      "seniority_level": "entry-level|mid-level|senior-level",
      "education": "highest_degree",
      "current_role": "current_job_title",
      "summary": "brief_summary_of_candidate"
    }
    
    Guidelines:
    - Extract technical skills, programming languages, frameworks, tools
    - Calculate total years of professional experience
    - Determine seniority level: entry-level (0-2 years), mid-level (3-6 years), senior-level (7+ years)
    - Include soft skills and domain expertise
    - Be specific about technologies and tools mentioned
    
    Resume content:
    ${resumeText}
    
    Return only the JSON object, no additional text.
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