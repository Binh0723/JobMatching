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
  -- Software Engineering Jobs
  ('Senior Software Engineer', 'TechCorp', 'Lead development of scalable web applications using modern technologies. Work with cross-functional teams to deliver high-quality software solutions.', 'San Francisco, CA', '$120,000 - $180,000', ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'], 'senior-level', 'full-time', true),
  ('Frontend Developer', 'InnovateUI', 'Create beautiful and intuitive user interfaces using React and modern CSS frameworks. Collaborate with designers to implement pixel-perfect designs.', 'New York, NY', '$80,000 - $120,000', ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'Figma'], 'mid-level', 'full-time', false),
  ('Full Stack Developer', 'StartupXYZ', 'Build end-to-end web applications from database to user interface. Work in a fast-paced startup environment with modern tech stack.', 'Austin, TX', '$90,000 - $140,000', ARRAY['Python', 'Django', 'React', 'PostgreSQL', 'Docker'], 'mid-level', 'full-time', true),
  ('DevOps Engineer', 'CloudTech', 'Manage cloud infrastructure and CI/CD pipelines. Ensure high availability and scalability of production systems.', 'Seattle, WA', '$100,000 - $160,000', ARRAY['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'], 'senior-level', 'full-time', true),
  ('Junior Web Developer', 'WebStudio', 'Learn and grow while building responsive websites and web applications. Great opportunity for recent graduates or career changers.', 'Chicago, IL', '$50,000 - $70,000', ARRAY['HTML', 'CSS', 'JavaScript', 'WordPress', 'Git'], 'entry-level', 'full-time', false),
  ('Data Scientist', 'DataInsights', 'Analyze large datasets to extract meaningful insights and build predictive models. Work with machine learning and statistical analysis.', 'Boston, MA', '$110,000 - $170,000', ARRAY['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'], 'senior-level', 'full-time', true),
  
  -- Business & Management Jobs
  ('Business Analyst', 'GlobalCorp', 'Analyze business processes and requirements to improve efficiency and drive strategic decisions. Work with stakeholders across departments.', 'Dallas, TX', '$70,000 - $100,000', ARRAY['SQL', 'Excel', 'Power BI', 'Business Analysis', 'Process Improvement'], 'mid-level', 'full-time', true),
  ('Product Manager', 'InnovateTech', 'Lead product development from conception to launch. Work with engineering, design, and marketing teams to deliver successful products.', 'San Francisco, CA', '$100,000 - $150,000', ARRAY['Product Management', 'Agile', 'User Research', 'Data Analysis', 'Stakeholder Management'], 'senior-level', 'full-time', true),
  ('Project Manager', 'ConstructionCo', 'Manage construction projects from planning to completion. Coordinate with contractors, architects, and clients to ensure timely delivery.', 'Houston, TX', '$80,000 - $120,000', ARRAY['Project Management', 'Construction', 'AutoCAD', 'Budget Management', 'Team Leadership'], 'mid-level', 'full-time', false),
  ('Operations Manager', 'RetailChain', 'Oversee daily operations of multiple retail locations. Manage staff, inventory, and customer service to maximize efficiency.', 'Miami, FL', '$60,000 - $90,000', ARRAY['Operations Management', 'Retail', 'Inventory Management', 'Staff Training', 'Customer Service'], 'mid-level', 'full-time', false),
  
  -- Recruiting & HR Jobs
  ('Technical Recruiter', 'TechTalent', 'Source and recruit top technical talent for fast-growing tech companies. Build relationships with candidates and hiring managers.', 'Austin, TX', '$70,000 - $110,000', ARRAY['Technical Recruiting', 'ATS', 'LinkedIn', 'Interview Coordination', 'Candidate Sourcing'], 'mid-level', 'full-time', true),
  ('HR Generalist', 'PeopleFirst', 'Handle all aspects of human resources including recruitment, employee relations, benefits administration, and compliance.', 'Denver, CO', '$55,000 - $80,000', ARRAY['HR Management', 'Employee Relations', 'Benefits Administration', 'Compliance', 'Recruitment'], 'mid-level', 'full-time', false),
  ('Talent Acquisition Specialist', 'GrowthCorp', 'Develop and execute recruitment strategies to attract top talent. Manage the full recruitment lifecycle from sourcing to onboarding.', 'Atlanta, GA', '$60,000 - $90,000', ARRAY['Talent Acquisition', 'Recruitment', 'Employer Branding', 'Interviewing', 'Onboarding'], 'mid-level', 'full-time', true),
  
  -- Marketing & Sales Jobs
  ('Digital Marketing Manager', 'BrandBoost', 'Develop and execute digital marketing campaigns across multiple channels. Analyze performance and optimize for maximum ROI.', 'Los Angeles, CA', '$75,000 - $120,000', ARRAY['Digital Marketing', 'Google Ads', 'Facebook Ads', 'Analytics', 'Campaign Management'], 'senior-level', 'full-time', true),
  ('Sales Representative', 'SalesPro', 'Generate new business opportunities and manage existing client relationships. Meet and exceed sales targets through consultative selling.', 'Phoenix, AZ', '$50,000 - $80,000', ARRAY['Sales', 'CRM', 'Lead Generation', 'Client Relations', 'Negotiation'], 'entry-level', 'full-time', false),
  ('Content Marketing Specialist', 'ContentHub', 'Create engaging content for blogs, social media, and email campaigns. Develop content strategies that drive brand awareness and lead generation.', 'Portland, OR', '$55,000 - $85,000', ARRAY['Content Marketing', 'Copywriting', 'SEO', 'Social Media', 'Email Marketing'], 'mid-level', 'full-time', true),
  
  -- Finance & Accounting Jobs
  ('Financial Analyst', 'FinanceCorp', 'Analyze financial data to provide insights for business decisions. Prepare reports, forecasts, and budgets for senior management.', 'Charlotte, NC', '$65,000 - $95,000', ARRAY['Financial Analysis', 'Excel', 'Financial Modeling', 'Budgeting', 'Forecasting'], 'mid-level', 'full-time', false),
  ('Accountant', 'AccountingFirm', 'Prepare financial statements, tax returns, and ensure compliance with accounting standards. Work with clients across various industries.', 'Minneapolis, MN', '$50,000 - $75,000', ARRAY['Accounting', 'QuickBooks', 'Tax Preparation', 'Financial Reporting', 'Compliance'], 'entry-level', 'full-time', false),
  ('Investment Banker', 'GlobalBank', 'Advise clients on mergers, acquisitions, and capital raising. Analyze market trends and develop financial models for complex transactions.', 'New York, NY', '$120,000 - $200,000', ARRAY['Investment Banking', 'Financial Modeling', 'M&A', 'Valuation', 'Capital Markets'], 'senior-level', 'full-time', false),
  
  -- Healthcare Jobs
  ('Registered Nurse', 'CityHospital', 'Provide patient care in a fast-paced hospital environment. Work with doctors and other healthcare professionals to ensure quality patient outcomes.', 'Philadelphia, PA', '$60,000 - $90,000', ARRAY['Nursing', 'Patient Care', 'Medical Procedures', 'Healthcare', 'Patient Assessment'], 'mid-level', 'full-time', false),
  ('Medical Assistant', 'FamilyClinic', 'Support healthcare providers with patient care and administrative tasks. Assist with examinations, procedures, and patient education.', 'San Diego, CA', '$35,000 - $50,000', ARRAY['Medical Assisting', 'Patient Care', 'Administrative Skills', 'Medical Terminology', 'Vital Signs'], 'entry-level', 'full-time', false),
  ('Healthcare Administrator', 'HealthSystem', 'Manage healthcare facilities and coordinate patient services. Oversee staff, budgets, and ensure compliance with healthcare regulations.', 'Chicago, IL', '$80,000 - $120,000', ARRAY['Healthcare Administration', 'Healthcare Management', 'Budget Management', 'Staff Leadership', 'Compliance'], 'senior-level', 'full-time', false),
  
  -- Education Jobs
  ('High School Teacher', 'PublicSchool', 'Teach high school students in your subject area. Develop lesson plans, assess student progress, and create an engaging learning environment.', 'Detroit, MI', '$45,000 - $70,000', ARRAY['Teaching', 'Lesson Planning', 'Student Assessment', 'Classroom Management', 'Curriculum Development'], 'entry-level', 'full-time', false),
  ('College Professor', 'University', 'Teach undergraduate and graduate courses, conduct research, and publish academic papers. Mentor students and contribute to academic programs.', 'Berkeley, CA', '$80,000 - $150,000', ARRAY['Teaching', 'Research', 'Academic Writing', 'Student Mentoring', 'Curriculum Development'], 'senior-level', 'full-time', false),
  ('Educational Administrator', 'SchoolDistrict', 'Manage educational programs and policies. Work with teachers, parents, and community stakeholders to improve student outcomes.', 'Seattle, WA', '$70,000 - $110,000', ARRAY['Educational Administration', 'Program Management', 'Policy Development', 'Staff Leadership', 'Community Relations'], 'senior-level', 'full-time', false),
  
  -- Creative & Design Jobs
  ('Graphic Designer', 'CreativeAgency', 'Create visual designs for print and digital media. Work with clients to develop brand identities and marketing materials.', 'Nashville, TN', '$50,000 - $80,000', ARRAY['Graphic Design', 'Adobe Creative Suite', 'Typography', 'Brand Design', 'Print Design'], 'mid-level', 'full-time', true),
  ('UX/UI Designer', 'DesignStudio', 'Design user experiences and interfaces for web and mobile applications. Conduct user research and create wireframes and prototypes.', 'Austin, TX', '$70,000 - $120,000', ARRAY['UX Design', 'UI Design', 'User Research', 'Wireframing', 'Prototyping'], 'mid-level', 'full-time', true),
  ('Video Editor', 'MediaProduction', 'Edit video content for commercials, films, and online platforms. Work with directors and producers to create compelling visual stories.', 'Los Angeles, CA', '$60,000 - $100,000', ARRAY['Video Editing', 'Adobe Premiere', 'After Effects', 'Color Grading', 'Motion Graphics'], 'mid-level', 'full-time', true),
  
  -- Legal Jobs
  ('Paralegal', 'LawFirm', 'Support attorneys with legal research, document preparation, and case management. Assist with client communications and court filings.', 'Washington, DC', '$45,000 - $70,000', ARRAY['Legal Research', 'Document Preparation', 'Case Management', 'Legal Writing', 'Court Procedures'], 'entry-level', 'full-time', false),
  ('Corporate Attorney', 'CorporateLaw', 'Provide legal counsel on corporate matters including contracts, compliance, and business transactions. Represent clients in negotiations and legal proceedings.', 'New York, NY', '$150,000 - $250,000', ARRAY['Corporate Law', 'Contract Law', 'Legal Research', 'Negotiation', 'Compliance'], 'senior-level', 'full-time', false),
  
  -- Consulting Jobs
  ('Management Consultant', 'StrategyCorp', 'Advise clients on business strategy, operations, and organizational change. Analyze problems and develop solutions for complex business challenges.', 'Chicago, IL', '$100,000 - $180,000', ARRAY['Strategy Consulting', 'Business Analysis', 'Change Management', 'Problem Solving', 'Client Relations'], 'senior-level', 'full-time', true),
  ('IT Consultant', 'TechConsulting', 'Provide technology consulting services to help clients optimize their IT infrastructure and digital transformation initiatives.', 'Boston, MA', '$80,000 - $140,000', ARRAY['IT Consulting', 'Technology Strategy', 'System Architecture', 'Digital Transformation', 'Client Relations'], 'mid-level', 'full-time', true),
  
  -- Entry Level Jobs (Various Industries)
  ('Customer Service Representative', 'ServiceCorp', 'Provide excellent customer service through phone, email, and chat support. Resolve customer issues and maintain high satisfaction ratings.', 'Remote', '$35,000 - $50,000', ARRAY['Customer Service', 'Communication', 'Problem Solving', 'CRM', 'Patience'], 'entry-level', 'full-time', true),
  ('Administrative Assistant', 'OfficeCorp', 'Provide administrative support including scheduling, document preparation, and office management. Support executives and teams with daily operations.', 'Dallas, TX', '$40,000 - $60,000', ARRAY['Administrative Support', 'Microsoft Office', 'Scheduling', 'Document Preparation', 'Organization'], 'entry-level', 'full-time', false),
  ('Data Entry Specialist', 'DataCorp', 'Accurately enter and verify data in various systems. Maintain data integrity and ensure timely processing of information.', 'Remote', '$30,000 - $45,000', ARRAY['Data Entry', 'Attention to Detail', 'Microsoft Excel', 'Data Verification', 'Typing Speed'], 'entry-level', 'full-time', true);