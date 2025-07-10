# Gemini AI Resume Parser Setup

## 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

## 2. Update Environment Variables

Add your Gemini API key to the `.env` file:

```bash
GEMINI_API_KEY=your-actual-gemini-api-key
```

## 3. Update Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Add new fields to candidates table for enhanced resume parsing
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS education text,
ADD COLUMN IF NOT EXISTS current_role text,
ADD COLUMN IF NOT EXISTS summary text;
```

## 4. How It Works

### Resume Processing Flow:
1. **File Upload**: User uploads PDF/DOCX resume
2. **Text Extraction**: 
   - PDF files: Uses `pdf-parse`
   - DOCX files: Uses `mammoth`
3. **AI Analysis**: Gemini AI analyzes the text and extracts:
   - Technical skills
   - Years of experience
   - Seniority level
   - Education
   - Current role
   - Summary
4. **JSON Response**: Gemini returns structured data
5. **Database Storage**: All extracted data is stored in Supabase
6. **Job Matching**: Enhanced matching using real skills and experience

### Gemini Prompt:
The AI is prompted to analyze resumes and return structured JSON with:
- Skills array
- Experience years
- Seniority level (entry/mid/senior)
- Education details
- Current role
- Professional summary

### Fallback System:
If Gemini fails, the system falls back to keyword-based parsing.

## 5. Testing

1. Start the server: `npm run dev`
2. Upload a resume through the web interface
3. Check the console for Gemini analysis logs
4. View the extracted data in the candidate dashboard

## 6. Supported File Types

- ✅ PDF files
- ✅ DOCX files
- ❌ DOC files (not supported)

## 7. Cost Considerations

- Gemini API charges per request
- Consider implementing rate limiting for production
- Monitor API usage in Google AI Studio dashboard 