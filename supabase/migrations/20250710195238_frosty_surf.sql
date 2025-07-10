/*
  # Career Site Database Schema

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `description` (text)
      - `location` (text)
      - `salary_range` (text)
      - `requirements` (text array)
      - `experience_level` (text)
      - `employment_type` (text)
      - `remote_friendly` (boolean)
      - `created_at` (timestamp)

    - `candidates`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `resume_filename` (text)
      - `resume_content` (text)
      - `skills` (text array)
      - `experience_years` (integer)
      - `seniority_level` (text)
      - `preferred_location` (text)
      - `created_at` (timestamp)

    - `job_matches`
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, foreign key)
      - `job_id` (uuid, foreign key)
      - `match_score` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  salary_range text,
  requirements text[] DEFAULT '{}',
  experience_level text DEFAULT 'mid-level',
  employment_type text DEFAULT 'full-time',
  remote_friendly boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  resume_filename text,
  resume_content text,
  skills text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  seniority_level text DEFAULT 'entry-level',
  preferred_location text,
  created_at timestamptz DEFAULT now()
);

-- Job matches table
CREATE TABLE IF NOT EXISTS job_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  match_score integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- Jobs policies (public read access)
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Jobs can be inserted by authenticated users"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Candidates policies
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

-- Job matches policies
CREATE POLICY "Job matches are viewable by candidate"
  ON job_matches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Job matches can be inserted"
  ON job_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert sample jobs
INSERT INTO jobs (title, company, description, location, salary_range, requirements, experience_level, employment_type, remote_friendly) VALUES
  ('Senior Software Engineer', 'TechCorp', 'Lead development of scalable web applications using modern technologies. Work with cross-functional teams to deliver high-quality software solutions.', 'San Francisco, CA', '$120,000 - $180,000', ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'], 'senior-level', 'full-time', true),
  ('Frontend Developer', 'InnovateUI', 'Create beautiful and intuitive user interfaces using React and modern CSS frameworks. Collaborate with designers to implement pixel-perfect designs.', 'New York, NY', '$80,000 - $120,000', ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'Figma'], 'mid-level', 'full-time', false),
  ('Full Stack Developer', 'StartupXYZ', 'Build end-to-end web applications from database to user interface. Work in a fast-paced startup environment with modern tech stack.', 'Austin, TX', '$90,000 - $140,000', ARRAY['Python', 'Django', 'React', 'PostgreSQL', 'Docker'], 'mid-level', 'full-time', true),
  ('DevOps Engineer', 'CloudTech', 'Manage cloud infrastructure and CI/CD pipelines. Ensure high availability and scalability of production systems.', 'Seattle, WA', '$100,000 - $160,000', ARRAY['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'], 'senior-level', 'full-time', true),
  ('Junior Web Developer', 'WebStudio', 'Learn and grow while building responsive websites and web applications. Great opportunity for recent graduates or career changers.', 'Chicago, IL', '$50,000 - $70,000', ARRAY['HTML', 'CSS', 'JavaScript', 'WordPress', 'Git'], 'entry-level', 'full-time', false),
  ('Data Scientist', 'DataInsights', 'Analyze large datasets to extract meaningful insights and build predictive models. Work with machine learning and statistical analysis.', 'Boston, MA', '$110,000 - $170,000', ARRAY['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'], 'senior-level', 'full-time', true);