-- Fix RLS policies for candidates table
-- Drop existing policies
DROP POLICY IF EXISTS "Candidates can view own data" ON candidates;
DROP POLICY IF EXISTS "Candidates can insert own data" ON candidates;
DROP POLICY IF EXISTS "Candidates can update own data" ON candidates;

-- Create new policies that allow anonymous access
CREATE POLICY "Candidates can view own data"
  ON candidates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Candidates can insert own data"
  ON candidates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Candidates can update own data"
  ON candidates
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Also fix job_matches policies
DROP POLICY IF EXISTS "Job matches are viewable by candidate" ON job_matches;
DROP POLICY IF EXISTS "Job matches can be inserted" ON job_matches;

CREATE POLICY "Job matches are viewable by candidate"
  ON job_matches
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Job matches can be inserted"
  ON job_matches
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true); 