// Job matching and scoring utilities

// Calculate match score between candidate and job
export function calculateMatchScore(candidate, job) {
  let score = 0;
  
  // Skill matching (40% weight) - More strict matching
  const candidateSkills = candidate.skills || [];
  const jobRequirements = job.requirements || [];
  
  // Use exact word matching instead of includes()
  const matchingSkills = candidateSkills.filter(candidateSkill => 
    jobRequirements.some(jobReq => {
      // Convert to lowercase and split into words for better matching
      const candidateWords = candidateSkill.toLowerCase().split(/\s+/);
      const jobWords = jobReq.toLowerCase().split(/\s+/);
      
      // Check if any candidate skill word matches any job requirement word
      return candidateWords.some(candidateWord => 
        jobWords.some(jobWord => candidateWord === jobWord)
      );
    })
  );
  
  // Only give points if there are actual matching skills
  const skillScore = matchingSkills.length > 0 ? 
    (matchingSkills.length / Math.max(jobRequirements.length, 1)) * 40 : 0;
  score += skillScore;

  // Career progression bonus (30% weight)
  const careerProgressionScore = calculateCareerProgressionScore(candidate, job);
  score += careerProgressionScore;

  // Experience level matching (20% weight)
  const experienceLevels = { 'entry-level': 1, 'mid-level': 2, 'senior-level': 3 };
  const candidateLevel = experienceLevels[candidate.seniority_level] || 1;
  const jobLevel = experienceLevels[job.experience_level] || 2;
  const experienceScore = Math.max(0, (1 - Math.abs(candidateLevel - jobLevel) / 2)) * 20;
  score += experienceScore;

  // Location preference (10% weight)
  const locationScore = (candidate.preferred_location && 
    job.location.toLowerCase().includes(candidate.preferred_location.toLowerCase())) ? 10 : 0;
  score += locationScore;

  console.log(`Match score for ${job.title}: ${score} (matching skills: ${matchingSkills.join(', ')}, career progression: ${careerProgressionScore})`);

  return Math.min(100, Math.round(score));
}

// Calculate career progression score based on logical next steps
export function calculateCareerProgressionScore(candidate, job) {
  const currentRole = candidate.current_role?.toLowerCase() || '';
  const jobTitle = job.title.toLowerCase();
  
  // Define career progression paths
  const careerPaths = {
    // Hospitality progression
    'host': ['server', 'bartender', 'restaurant manager', 'food service manager', 'hospitality manager'],
    'server': ['bartender', 'restaurant manager', 'food service manager', 'hospitality manager'],
    'bartender': ['bar manager', 'restaurant manager', 'food service manager'],
    'restaurant manager': ['food service manager', 'hospitality manager', 'operations manager'],
    
    // Customer service progression
    'customer service': ['customer service supervisor', 'customer service manager', 'account manager', 'sales representative'],
    'customer service representative': ['customer service supervisor', 'customer service manager', 'account manager', 'sales representative'],
    
    // Administrative progression
    'administrative assistant': ['office manager', 'executive assistant', 'project coordinator', 'operations coordinator'],
    'receptionist': ['administrative assistant', 'office manager', 'executive assistant'],
    
    // Sales progression
    'sales representative': ['senior sales representative', 'account manager', 'sales manager', 'business development representative'],
    
    // Entry-level to specialized roles
    'data entry': ['administrative assistant', 'office coordinator', 'data analyst', 'business analyst'],
    'intern': ['junior developer', 'associate', 'coordinator', 'specialist'],
    'student': ['intern', 'junior developer', 'associate', 'entry-level'],
    
    // Technical progression
    'junior developer': ['software developer', 'full stack developer', 'frontend developer', 'backend developer'],
    'software developer': ['senior software developer', 'tech lead', 'software engineer'],
    'web developer': ['full stack developer', 'senior web developer', 'frontend developer'],
    
    // Business progression
    'business analyst': ['senior business analyst', 'product manager', 'project manager', 'strategy analyst'],
    'project coordinator': ['project manager', 'program manager', 'operations manager'],
    
    // Marketing progression
    'marketing assistant': ['marketing coordinator', 'digital marketing specialist', 'marketing manager'],
    'content writer': ['content marketing specialist', 'content manager', 'digital marketing specialist'],
    
    // HR progression
    'hr assistant': ['hr coordinator', 'hr generalist', 'recruiter', 'talent acquisition specialist'],
    'recruiter': ['senior recruiter', 'talent acquisition manager', 'hr manager'],
    
    // Finance progression
    'accountant': ['senior accountant', 'financial analyst', 'accounting manager', 'controller'],
    'financial analyst': ['senior financial analyst', 'finance manager', 'investment analyst'],
    
    // Healthcare progression
    'medical assistant': ['registered nurse', 'healthcare administrator', 'medical office manager'],
    'nurse': ['senior nurse', 'nurse manager', 'healthcare administrator'],
    
    // Education progression
    'teacher': ['senior teacher', 'department head', 'educational administrator', 'curriculum coordinator'],
    'professor': ['senior professor', 'department chair', 'dean', 'educational administrator']
  };
  
  let progressionScore = 0;
  
  // Check if current role has a defined progression path
  for (const [currentRoleKey, nextRoles] of Object.entries(careerPaths)) {
    if (currentRole.includes(currentRoleKey) || currentRoleKey.includes(currentRole)) {
      // Check if job title matches any of the next logical roles
      const isNextStep = nextRoles.some(nextRole => 
        jobTitle.includes(nextRole) || nextRole.includes(jobTitle.split(' ')[0])
      );
      
      if (isNextStep) {
        progressionScore = 30; // Full bonus for logical next step
        console.log(`Career progression match: ${currentRole} -> ${job.title}`);
        break;
      } else {
        // Partial bonus for related roles in the same field
        const isRelatedField = nextRoles.some(nextRole => 
          jobTitle.includes(nextRole.split(' ')[0]) || 
          nextRole.includes(jobTitle.split(' ')[0])
        );
        if (isRelatedField) {
          progressionScore = 15; // Partial bonus for related roles
        }
      }
    }
  }
  
  return progressionScore;
}

// Filter jobs based on experience level compatibility
export function filterJobsByLevel(jobs, candidateLevel) {
  const levelCompatibility = {
    'entry-level': ['entry-level'],
    'mid-level': ['entry-level', 'mid-level'],
    'senior-level': ['mid-level', 'senior-level'],
    'manager': ['senior-level', 'manager'],
    'director': ['senior-level', 'manager', 'director'],
    'vp': ['manager', 'director', 'vp'],
    'c-level': ['director', 'vp', 'c-level']
  };
  
  return jobs.filter(job => {
    const jobLevel = job.experience_level;
    return levelCompatibility[candidateLevel]?.includes(jobLevel) || false;
  });
}

// Filter matches by minimum score threshold
export function filterByScoreThreshold(matches, threshold = 30) {
  return matches.filter(match => match.match_score >= threshold);
} 