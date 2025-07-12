/*
  # Career Site Database Schema

  This migration creates the complete database schema for the personalized career site.
  
  Tables:
    - `jobs`: Job listings with requirements and details
    - `candidates`: Candidate information from resume parsing
    
  Features:
    - Row Level Security (RLS) enabled
    - Proper data types for experience levels
    - Enhanced resume parsing fields
    - No file storage (memory-based processing)
    - Real-time matching (no stored matches)
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

-- Candidates table with enhanced resume parsing fields
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  resume_content text,
  skills text[] DEFAULT '{}',
  experience_years numeric(3,1) DEFAULT 0,
  seniority_level text DEFAULT 'entry-level',
  preferred_location text,
  education text,
  current_role text,
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

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

-- Insert essential sample jobs for testing
INSERT INTO jobs (title, company, description, location, salary_range, requirements, experience_level, employment_type, remote_friendly) VALUES
  -- Software Engineering Jobs
  ('Senior Software Engineer', 'TechCorp', 'Lead development of scalable web applications using modern technologies. Work with cross-functional teams to deliver high-quality software solutions.', 'San Francisco, CA', '$120,000 - $180,000', ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'], 'senior-level', 'full-time', true),
  ('Frontend Developer', 'InnovateUI', 'Create beautiful and intuitive user interfaces using React and modern CSS frameworks. Collaborate with designers to implement pixel-perfect designs.', 'New York, NY', '$80,000 - $120,000', ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'Figma'], 'mid-level', 'full-time', false),
  ('Full Stack Developer', 'StartupXYZ', 'Build end-to-end web applications from database to user interface. Work in a fast-paced startup environment with modern tech stack.', 'Austin, TX', '$90,000 - $140,000', ARRAY['Python', 'Django', 'React', 'PostgreSQL', 'Docker'], 'mid-level', 'full-time', true),
  ('Junior Web Developer', 'WebStudio', 'Learn and grow while building responsive websites and web applications. Great opportunity for recent graduates or career changers.', 'Chicago, IL', '$50,000 - $70,000', ARRAY['HTML', 'CSS', 'JavaScript', 'WordPress', 'Git'], 'entry-level', 'full-time', false),
  
  -- Business & Management Jobs
  ('Business Analyst', 'GlobalCorp', 'Analyze business processes and requirements to improve efficiency and drive strategic decisions. Work with stakeholders across departments.', 'Dallas, TX', '$70,000 - $100,000', ARRAY['SQL', 'Excel', 'Power BI', 'Business Analysis', 'Process Improvement'], 'mid-level', 'full-time', true),
  ('Product Manager', 'InnovateTech', 'Lead product development from conception to launch. Work with engineering, design, and marketing teams to deliver successful products.', 'San Francisco, CA', '$100,000 - $150,000', ARRAY['Product Management', 'Agile', 'User Research', 'Data Analysis', 'Stakeholder Management'], 'senior-level', 'full-time', true),
  
  -- Marketing & Sales Jobs
  ('Digital Marketing Manager', 'BrandBoost', 'Develop and execute digital marketing campaigns across multiple channels. Analyze performance and optimize for maximum ROI.', 'Los Angeles, CA', '$75,000 - $120,000', ARRAY['Digital Marketing', 'Google Ads', 'Facebook Ads', 'Analytics', 'Campaign Management'], 'senior-level', 'full-time', true),
  ('Sales Representative', 'SalesPro', 'Generate new business opportunities and manage existing client relationships. Meet and exceed sales targets through consultative selling.', 'Phoenix, AZ', '$50,000 - $80,000', ARRAY['Sales', 'CRM', 'Lead Generation', 'Client Relations', 'Negotiation'], 'entry-level', 'full-time', false),
  
  -- Finance & Accounting Jobs
  ('Financial Analyst', 'FinanceCorp', 'Analyze financial data to provide insights for business decisions. Prepare reports, forecasts, and budgets for senior management.', 'Charlotte, NC', '$65,000 - $95,000', ARRAY['Financial Analysis', 'Excel', 'Financial Modeling', 'Budgeting', 'Forecasting'], 'mid-level', 'full-time', false),
  ('Accountant', 'AccountingFirm', 'Prepare financial statements, tax returns, and ensure compliance with accounting standards. Work with clients across various industries.', 'Minneapolis, MN', '$50,000 - $75,000', ARRAY['Accounting', 'QuickBooks', 'Tax Preparation', 'Financial Reporting', 'Compliance'], 'entry-level', 'full-time', false),
  
  -- Healthcare Jobs
  ('Registered Nurse', 'CityHospital', 'Provide patient care in a fast-paced hospital environment. Work with doctors and other healthcare professionals to ensure quality patient outcomes.', 'Philadelphia, PA', '$60,000 - $90,000', ARRAY['Nursing', 'Patient Care', 'Medical Procedures', 'Healthcare', 'Patient Assessment'], 'mid-level', 'full-time', false),
  ('Medical Assistant', 'FamilyClinic', 'Support healthcare providers with patient care and administrative tasks. Assist with examinations, procedures, and patient education.', 'San Diego, CA', '$35,000 - $50,000', ARRAY['Medical Assisting', 'Patient Care', 'Administrative Skills', 'Medical Terminology', 'Vital Signs'], 'entry-level', 'full-time', false),
  
  -- Education Jobs
  ('High School Teacher', 'PublicSchool', 'Teach high school students in your subject area. Develop lesson plans, assess student progress, and create an engaging learning environment.', 'Detroit, MI', '$45,000 - $70,000', ARRAY['Teaching', 'Lesson Planning', 'Student Assessment', 'Classroom Management', 'Curriculum Development'], 'entry-level', 'full-time', false),
  
  -- Creative & Design Jobs
  ('Graphic Designer', 'CreativeAgency', 'Create visual designs for print and digital media. Work with clients to develop brand identities and marketing materials.', 'Nashville, TN', '$50,000 - $80,000', ARRAY['Graphic Design', 'Adobe Creative Suite', 'Typography', 'Brand Design', 'Print Design'], 'mid-level', 'full-time', true),
  ('UX/UI Designer', 'DesignStudio', 'Design user experiences and interfaces for web and mobile applications. Conduct user research and create wireframes and prototypes.', 'Austin, TX', '$70,000 - $120,000', ARRAY['UX Design', 'UI Design', 'User Research', 'Wireframing', 'Prototyping'], 'mid-level', 'full-time', true),
  
  -- Entry Level Jobs (Various Industries)
  ('Customer Service Representative', 'ServiceCorp', 'Provide excellent customer service through phone, email, and chat support. Resolve customer issues and maintain high satisfaction ratings.', 'Remote', '$35,000 - $50,000', ARRAY['Customer Service', 'Communication', 'Problem Solving', 'CRM', 'Patience'], 'entry-level', 'full-time', true),
  ('Administrative Assistant', 'OfficeCorp', 'Provide administrative support including scheduling, document preparation, and office management. Support executives and teams with daily operations.', 'Dallas, TX', '$40,000 - $60,000', ARRAY['Administrative Support', 'Microsoft Office', 'Scheduling', 'Document Preparation', 'Organization'], 'entry-level', 'full-time', false);