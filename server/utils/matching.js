// Enterprise Job Matching Algorithm - Strict Rule-Based System
// Designed to prevent cross-career field matches completely

// Career field definitions with strict rules
const CAREER_FIELDS = {
  TECHNOLOGY: {
    name: 'technology',
    // Primary indicators (any of these = technology field)
    primary: [
      'software engineer', 'developer', 'programmer', 'software developer',
      'frontend developer', 'backend developer', 'full stack developer',
      'data engineer', 'devops engineer', 'cloud engineer', 'ai engineer',
      'machine learning engineer', 'systems engineer', 'platform engineer',
      'api engineer', 'infrastructure engineer', 'security engineer',
      'mobile developer', 'web developer', 'game developer', 'ios developer',
      'android developer', 'python developer', 'java developer', 'javascript developer',
      'react developer', 'node developer', 'aws developer', 'azure developer',
      'docker engineer', 'kubernetes engineer', 'microservices engineer',
      'distributed systems engineer', 'data scientist', 'ml engineer',
      'artificial intelligence engineer', 'cybersecurity engineer'
    ],
    // Secondary indicators (multiple = technology field)
    secondary: [
      'javascript', 'python', 'java', 'react', 'node', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'git', 'sql', 'nosql', 'api', 'rest', 'graphql',
      'microservices', 'serverless', 'lambda', 'cloud', 'devops', 'ci/cd',
      'machine learning', 'ai', 'data science', 'cybersecurity', 'infrastructure',
      'distributed systems', 'observability', 'monitoring', 'logging',
      'typescript', 'go', 'rust', 'scala', 'kotlin', 'swift', 'objective-c',
      'vue', 'angular', 'express', 'django', 'flask', 'spring', 'laravel',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'kafka',
      'rabbitmq', 'terraform', 'ansible', 'jenkins', 'github actions'
    ],
    // Education indicators
    education: [
      'computer science', 'software engineering', 'information technology',
      'computer engineering', 'information systems', 'data science degree',
      'computer programming', 'web development', 'mobile development'
    ]
  },
  HEALTHCARE: {
    name: 'healthcare',
    // Primary indicators
    primary: [
      'nurse', 'registered nurse', 'rn', 'lpn', 'cna', 'medical assistant',
      'doctor', 'physician', 'therapist', 'pharmacist', 'dental hygienist',
      'radiologist', 'laboratory technician', 'medical technologist',
      'healthcare assistant', 'patient care technician', 'clinical assistant',
      'nursing assistant', 'medical office assistant', 'healthcare coordinator'
    ],
    // Secondary indicators
    secondary: [
      'patient care', 'medical', 'healthcare', 'clinical', 'hospital',
      'clinic', 'pharmacy', 'radiology', 'laboratory', 'medical technology',
      'healthcare technology', 'patient', 'care', 'medical field',
      'healthcare field', 'nursing field', 'clinical practice'
    ],
    // Education indicators
    education: [
      'nursing degree', 'medical degree', 'healthcare degree', 'nursing',
      'medical assistant degree', 'healthcare administration', 'pharmacy degree',
      'radiology degree', 'laboratory science', 'medical technology degree'
    ]
  },
  BUSINESS: {
    name: 'business',
    // Primary indicators
    primary: [
      'business analyst', 'marketing manager', 'sales manager', 'account manager',
      'project manager', 'product manager', 'operations manager', 'hr manager',
      'human resources manager', 'finance manager', 'accounting manager',
      'customer service manager', 'retail manager', 'store manager',
      'business consultant', 'strategy consultant', 'management consultant',
      'investment analyst', 'financial analyst', 'data analyst',
      'marketing coordinator', 'sales representative', 'account executive',
      'customer service representative', 'administrative assistant',
      'executive assistant', 'office manager', 'coordinator'
    ],
    // Secondary indicators
    secondary: [
      'business', 'administration', 'management', 'marketing', 'sales',
      'finance', 'accounting', 'hr', 'human resources', 'operations',
      'project', 'consultant', 'analyst', 'coordinator', 'assistant',
      'executive', 'director', 'manager', 'strategy', 'consulting',
      'investment', 'banking', 'insurance', 'real estate', 'customer service',
      'retail', 'hospitality', 'food service', 'restaurant', 'host',
      'waiter', 'waitress', 'bartender', 'chef', 'cook'
    ],
    // Education indicators
    education: [
      'business administration', 'business degree', 'management degree',
      'marketing degree', 'finance degree', 'accounting degree',
      'business field', 'administration degree', 'management'
    ]
  },
  EDUCATION: {
    name: 'education',
    // Primary indicators
    primary: [
      'teacher', 'professor', 'instructor', 'educator', 'academic',
      'school administrator', 'principal', 'vice principal', 'dean',
      'curriculum coordinator', 'instructional designer', 'education consultant',
      'student advisor', 'academic advisor', 'guidance counselor'
    ],
    // Secondary indicators
    secondary: [
      'teaching', 'education', 'academic', 'school', 'university',
      'college', 'curriculum', 'student', 'pedagogy', 'instructional',
      'educational technology', 'student affairs', 'academic field'
    ],
    // Education indicators
    education: [
      'education degree', 'teaching degree', 'academic degree',
      'pedagogy degree', 'instructional design', 'education field'
    ]
  }
};

// Experience level rules
const EXPERIENCE_RULES = {
  'entry-level': {
    canApplyTo: ['entry-level', 'mid-level'],
    cannotApplyTo: ['senior-level'],
    maxScoreForSenior: 0
  },
  'mid-level': {
    canApplyTo: ['entry-level', 'mid-level', 'senior-level'],
    cannotApplyTo: [],
    maxScoreForSenior: 60
  },
  'senior-level': {
    canApplyTo: ['mid-level', 'senior-level'],
    cannotApplyTo: ['entry-level'],
    maxScoreForEntry: 0
  }
};

// Calculate match score between candidate and job
export function calculateMatchScore(candidate, job) {
  console.log(`\n=== STRICT MATCHING: ${candidate.name || 'Candidate'} vs ${job.title} ===`);
  
  // STEP 1: Strict Career Field Detection and Blocking
  const candidateField = detectCareerFieldStrict(candidate);
  const jobField = detectJobFieldStrict(job);
  
  console.log(`🎯 Career Fields - Candidate: ${candidateField}, Job: ${jobField}`);
  
  // CRITICAL: Block cross-field matches completely
  if (candidateField && jobField && candidateField !== jobField) {
    console.log(`❌ CAREER FIELD BLOCKED: ${candidateField} candidate cannot match ${jobField} job`);
    return 0;
  }
  
  // STEP 2: Experience Level Progression Rules
  const candidateLevel = candidate.seniority_level || 'entry-level';
  const jobLevel = job.experience_level || 'mid-level';
  
  console.log(`📊 Experience Levels - Candidate: ${candidateLevel}, Job: ${jobLevel}`);
  
  const experienceRules = EXPERIENCE_RULES[candidateLevel];
  if (!experienceRules.canApplyTo.includes(jobLevel)) {
    console.log(`❌ EXPERIENCE LEVEL BLOCKED: ${candidateLevel} cannot apply to ${jobLevel}`);
    return 0;
  }
  
  // STEP 3: Calculate Component Scores (only if fields match or are undetected)
  let totalScore = 0;
  
  // Skill Matching (50% weight)
  const skillScore = calculateSkillScoreStrict(candidate, job);
  totalScore += skillScore * 0.5;
  
  // Experience Level Matching (30% weight)
  const experienceScore = calculateExperienceScoreStrict(candidateLevel, jobLevel);
  totalScore += experienceScore * 0.3;
  
  // Education Matching (20% weight)
  const educationScore = calculateEducationScoreStrict(candidate, job);
  totalScore += educationScore * 0.2;
  
  // STEP 4: Apply Experience Level Penalties
  if (candidateLevel === 'entry-level' && jobLevel === 'senior-level') {
    totalScore = Math.min(totalScore, experienceRules.maxScoreForSenior);
  }
  
  const finalScore = Math.round(Math.min(100, totalScore));
  
  console.log(`📊 SCORES - Skills: ${skillScore}, Experience: ${experienceScore}, Education: ${educationScore}`);
  console.log(`🎯 FINAL SCORE: ${finalScore}/100`);
  
  return finalScore;
}

// Strict career field detection for candidates
function detectCareerFieldStrict(candidate) {
  const skills = candidate.skills || [];
  const currentRole = (candidate.current_role || '').toLowerCase();
  const education = (candidate.education || '').toLowerCase();
  const summary = (candidate.summary || '').toLowerCase();
  
  console.log(`🔍 DETECTING CANDIDATE FIELD:`);
  console.log(`   Education: "${education}"`);
  console.log(`   Current Role: "${currentRole}"`);
  console.log(`   Skills: [${skills.join(', ')}]`);
  
  // Check each career field with strict rules
  for (const [fieldKey, fieldConfig] of Object.entries(CAREER_FIELDS)) {
    // Check primary indicators (any match = field)
    const primaryMatches = fieldConfig.primary.filter(keyword => 
      currentRole.includes(keyword) || 
      education.includes(keyword) ||
      summary.includes(keyword) ||
      skills.some(skill => skill.toLowerCase().includes(keyword))
    );
    
    if (primaryMatches.length > 0) {
      console.log(`   ✅ Detected as ${fieldConfig.name} (primary: ${primaryMatches.join(', ')})`);
      return fieldConfig.name;
    }
    
    // Check education indicators (any match = field)
    const educationMatches = fieldConfig.education.filter(keyword => 
      education.includes(keyword)
    );
    
    if (educationMatches.length > 0) {
      console.log(`   ✅ Detected as ${fieldConfig.name} (education: ${educationMatches.join(', ')})`);
      return fieldConfig.name;
    }
    
    // Check secondary indicators (need multiple matches)
    const secondaryMatches = fieldConfig.secondary.filter(keyword => 
      currentRole.includes(keyword) || 
      summary.includes(keyword) ||
      skills.some(skill => skill.toLowerCase().includes(keyword))
    );
    
    if (secondaryMatches.length >= 2) {
      console.log(`   ✅ Detected as ${fieldConfig.name} (secondary: ${secondaryMatches.join(', ')})`);
      return fieldConfig.name;
    }
  }
  
  console.log(`   ❓ No clear field detected`);
  return null;
}

// Strict career field detection for jobs
function detectJobFieldStrict(job) {
  const title = (job.title || '').toLowerCase();
  const company = (job.company || '').toLowerCase();
  const requirements = (job.requirements || []).join(' ').toLowerCase();
  const description = (job.description || '').toLowerCase();
  
  const allText = `${title} ${company} ${requirements} ${description}`;
  
  console.log(`🔍 DETECTING JOB FIELD: "${job.title}"`);
  
  // Priority order: Technology first (most specific), then others
  const priorityOrder = ['TECHNOLOGY', 'HEALTHCARE', 'BUSINESS', 'EDUCATION'];
  
  for (const fieldKey of priorityOrder) {
    const fieldConfig = CAREER_FIELDS[fieldKey];
    
    // Check primary indicators (any match = field)
    const primaryMatches = fieldConfig.primary.filter(keyword => allText.includes(keyword));
    
    if (primaryMatches.length > 0) {
      console.log(`   ✅ Detected as ${fieldConfig.name} (primary: ${primaryMatches.join(', ')})`);
      return fieldConfig.name;
    }
    
    // Check secondary indicators (need multiple matches)
    const secondaryMatches = fieldConfig.secondary.filter(keyword => allText.includes(keyword));
    
    if (secondaryMatches.length >= 2) {
      console.log(`   ✅ Detected as ${fieldConfig.name} (secondary: ${secondaryMatches.join(', ')})`);
      return fieldConfig.name;
    }
  }
  
  console.log(`   ❓ No clear field detected`);
  return null;
}

// Calculate skill matching score (0-100)
function calculateSkillScoreStrict(candidate, job) {
  const candidateSkills = candidate.skills || [];
  const jobRequirements = job.requirements || [];
  
  if (jobRequirements.length === 0) return 50; // Neutral score if no requirements
  
  const matchingSkills = candidateSkills.filter(candidateSkill => 
    jobRequirements.some(jobReq => {
      const candidateSkillLower = candidateSkill.toLowerCase();
      const jobReqLower = jobReq.toLowerCase();
      
      // Exact match
      if (candidateSkillLower === jobReqLower) return true;
      
      // Contains match
      if (candidateSkillLower.includes(jobReqLower) || jobReqLower.includes(candidateSkillLower)) return true;
      
      // Word-level match
      const candidateWords = candidateSkillLower.split(/\s+/);
      const jobWords = jobReqLower.split(/\s+/);
      
      return candidateWords.some(candidateWord => 
        jobWords.some(jobWord => 
          candidateWord === jobWord || 
          candidateWord.includes(jobWord) || 
          jobWord.includes(candidateWord)
        )
      );
    })
  );
  
  const matchRatio = matchingSkills.length / jobRequirements.length;
  return Math.round(matchRatio * 100);
}

// Calculate experience level matching score (0-100)
function calculateExperienceScoreStrict(candidateLevel, jobLevel) {
  const levels = { 'entry-level': 1, 'mid-level': 2, 'senior-level': 3 };
  const candidateValue = levels[candidateLevel] || 1;
  const jobValue = levels[jobLevel] || 2;
  
  const difference = Math.abs(candidateValue - jobValue);
  
  if (difference === 0) return 100; // Perfect match
  if (difference === 1) return 60;  // Adjacent levels
  if (difference === 2) return 20;  // Large gap
  
  return 0;
}

// Calculate education matching score (0-100)
function calculateEducationScoreStrict(candidate, job) {
  const candidateEducation = (candidate.education || '').toLowerCase();
  const jobRequirements = (job.requirements || []).join(' ').toLowerCase();
  const jobDescription = (job.description || '').toLowerCase();
  
  const allJobText = `${jobRequirements} ${jobDescription}`;
  
  // Check for degree requirements
  const degreeKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certification'];
  const hasDegreeRequirement = degreeKeywords.some(keyword => allJobText.includes(keyword));
  
  if (!hasDegreeRequirement) return 70; // Neutral score if no degree requirement
  
  // Check if candidate has any degree
  const hasDegree = degreeKeywords.some(keyword => candidateEducation.includes(keyword));
  
  if (hasDegree) return 100;
  return 30; // Penalty for no degree when required
}

// Filter jobs based on experience level compatibility
export function filterJobsByLevel(jobs, candidateLevel) {
  const experienceRules = EXPERIENCE_RULES[candidateLevel] || EXPERIENCE_RULES['entry-level'];
  
  return jobs.filter(job => {
    const jobLevel = job.experience_level || 'mid-level';
    return experienceRules.canApplyTo.includes(jobLevel);
  });
}

// Filter matches by minimum score threshold
export function filterByScoreThreshold(matches, threshold = 30) {
  return matches.filter(match => {
    const effectiveThreshold = match.candidate?.seniority_level === 'entry-level' ? 25 : threshold;
    return match.match_score >= effectiveThreshold;
  });
}

// Get related skills for soft matching
function getRelatedSkills(skill) {
  const skillMappings = {
    // Healthcare skills
    'nursing': ['patient care', 'medical', 'healthcare', 'clinical', 'patient', 'care'],
    'patient care': ['nursing', 'medical', 'healthcare', 'clinical', 'patient'],
    'medical': ['nursing', 'healthcare', 'clinical', 'patient', 'care'],
    'healthcare': ['nursing', 'medical', 'clinical', 'patient', 'care'],
    
    // Technology skills
    'javascript': ['js', 'web', 'frontend', 'programming', 'coding'],
    'python': ['programming', 'coding', 'scripting', 'automation'],
    'java': ['programming', 'coding', 'development'],
    'react': ['frontend', 'web', 'javascript', 'ui', 'user interface'],
    'node': ['javascript', 'backend', 'server', 'web'],
    'aws': ['cloud', 'amazon', 'infrastructure', 'devops'],
    'docker': ['containerization', 'devops', 'deployment'],
    
    // Business skills
    'management': ['leadership', 'supervision', 'administration', 'coordination'],
    'marketing': ['advertising', 'promotion', 'sales', 'communication'],
    'sales': ['marketing', 'customer service', 'communication', 'negotiation'],
    'customer service': ['sales', 'communication', 'support', 'help'],
    
    // Soft skills
    'communication': ['interpersonal', 'verbal', 'written', 'presentation'],
    'leadership': ['management', 'supervision', 'team', 'coordination'],
    'problem solving': ['analytical', 'critical thinking', 'troubleshooting'],
    'teamwork': ['collaboration', 'cooperation', 'group', 'team']
  };
  
  return skillMappings[skill] || [];
}
