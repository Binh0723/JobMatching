-- Add new fields to candidates table for enhanced resume parsing
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS education text,
ADD COLUMN IF NOT EXISTS current_role text,
ADD COLUMN IF NOT EXISTS summary text; 