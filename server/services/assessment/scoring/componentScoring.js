// @ts-check
const { calculateTechnicalDensity, isTechnicalRole } = require('../analysis/technicalKeywordLibrary');
const { scoreExperience } = require('../scoring/experienceScoring');

/** @typedef {import('../analysis/technicalKeywordLibrary').Resume} Resume */
/** @typedef {import('../analysis/technicalKeywordLibrary').WorkExperience} WorkExperience */
/** @typedef {import('../analysis/technicalKeywordLibrary').CategoryScore} CategoryScore */

/**
 * @typedef {Object} Skills
 * @property {string} skills_ - List of skills
 */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} technologies - Technologies used
 */

/**
 * @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} fieldOfStudy - Field of study
 * @property {string} [graduationDate] - Graduation date
 */

/**
 * Component weights for overall score calculation
 * @type {Object.<string, number>}
 */
const COMPONENT_WEIGHTS = {
  SKILLS: 0.35,
  WORK_EXPERIENCE: 0.30,
  PROJECTS: 0.15,
  EDUCATION: 0.12,
  JOB_TITLE: 0.08
};

/**
 * Full-stack technology indicators
 * @type {Object.<string, string[]>}
 */
const FULL_STACK_INDICATORS = {
  FRONTEND: ['react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css'],
  BACKEND: ['node', 'python', 'java', 'c#', 'php', 'ruby', 'go'],
  DATABASE: ['sql', 'mongodb', 'postgresql', 'mysql', 'redis'],
  DEVOPS: ['aws', 'docker', 'kubernetes', 'ci/cd', 'jenkins']
};

/**
 * Calculates skills match score
 * @param {Skills} skills - Resume skills section
 * @param {string} jobDescription - Job description
 * @returns {{ score: number, analysis: Object }}
 */
function calculateSkillsScore(skills, jobDescription) {
  if (!skills?.skills_ || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing skills or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  const skillsTechProfile = calculateTechnicalDensity(skills.skills_);

  // Calculate skill relevance
  const relevantSkills = skillsTechProfile.matches.filter(skill =>
    jobTechProfile.matches.includes(skill)
  );

  // Calculate missing critical skills
  const missingSkills = jobTechProfile.matches.filter(skill =>
    !skillsTechProfile.matches.includes(skill)
  );

  // Base score from relevant skills
  let score = relevantSkills.length / (jobTechProfile.matches.length || 1);

  // Apply diminishing returns
  score = Math.sqrt(score);

  // Check for full-stack capabilities
  const skillsLower = skills.skills_.toLowerCase();
  const fullStackScore = calculateFullStackBonus(skillsLower);
  
  // Add full-stack bonus (up to 20% boost)
  score = Math.min(1, score * (1 + fullStackScore * 0.2));

  // Penalize for missing critical skills (reduced penalty)
  const missingPenalty = missingSkills.length * 0.08; // Reduced from 0.1
  score = Math.max(0, score - missingPenalty);

  return {
    score,
    analysis: {
      relevantSkills,
      missingSkills,
      technicalDensity: skillsTechProfile.score,
      categoryScores: skillsTechProfile.categoryScores,
      fullStackScore
    }
  };
}

/**
 * Calculates full-stack capability bonus
 * @param {string} skills - Lowercase skills string
 * @returns {number} Full-stack score (0-1)
 */
function calculateFullStackBonus(skills) {
  const coverage = Object.entries(FULL_STACK_INDICATORS).map(([category, techs]) => {
    const matches = techs.filter(tech => skills.includes(tech)).length;
    return matches / techs.length;
  });
  
  // Calculate average coverage across all categories
  const avgCoverage = coverage.reduce((sum, score) => sum + score, 0) / coverage.length;
  
  // Bonus is based on balanced coverage across categories
  return Math.min(1, avgCoverage * 1.5);
}

/**
 * Calculates work experience match score
 * @param {WorkExperience[]} experience - Work experience entries
 * @param {string} jobDescription - Job description
 * @param {string} jobTitle - Job title
 * @returns {{ score: number, analysis: Object }}
 */
function calculateExperienceScore(experience, jobDescription, jobTitle) {
  if (!experience?.length || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing experience or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  const { isTechnical: isTargetTechnical } = isTechnicalRole(jobTitle);

  let totalScore = 0;
  const experienceAnalysis = experience.map(exp => {
    const expScore = scoreExperience(exp, {
      description: jobDescription,
      title: jobTitle
    }, (text) => {
      const techProfile = calculateTechnicalDensity(text);
      const exactMatches = techProfile.matches.filter(skill => 
        jobTechProfile.matches.includes(skill)
      );
      return {
        matchScore: exactMatches.length / (jobTechProfile.matches.length || 1),
        exactMatches,
        partialMatches: [],
        missingSkills: jobTechProfile.matches.filter(skill => !exactMatches.includes(skill))
      };
    });

    totalScore += expScore.relevanceScore;
    return expScore;
  });

  // Average score with diminishing returns
  const score = Math.sqrt(totalScore / (experience.length || 1));

  return {
    score,
    analysis: {
      entries: experienceAnalysis,
      overallTechnicalAlignment: isTargetTechnical
    }
  };
}

/**
 * Calculates project relevance score
 * @param {Project[]} projects - Project entries
 * @param {string} jobDescription - Job description
 * @returns {{ score: number, analysis: Object }}
 */
function calculateProjectScore(projects, jobDescription) {
  if (!projects?.length || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing projects or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  
  let totalScore = 0;
  const projectAnalysis = projects.map(project => {
    const projectTechProfile = calculateTechnicalDensity(
      `${project.title} ${project.description} ${project.technologies}`
    );

    const matchingTech = projectTechProfile.matches.filter(tech => 
      jobTechProfile.matches.includes(tech)
    );

    const relevanceScore = matchingTech.length / (jobTechProfile.matches.length || 1);
    totalScore += relevanceScore;

    return {
      matchingTechnologies: matchingTech,
      relevanceScore,
      technicalDensity: projectTechProfile.score
    };
  });

  // Average score with diminishing returns
  const score = Math.sqrt(totalScore / (projects.length || 1));

  return {
    score,
    analysis: {
      projects: projectAnalysis,
      overallTechnicalAlignment: score > 0.3
    }
  };
}

/**
 * Calculates education match score
 * @param {Education[]} education - Education entries
 * @param {string} jobDescription - Job description
 * @returns {{ score: number, analysis: Object }}
 */
function calculateEducationScore(education, jobDescription) {
  if (!education?.length || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing education or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  
  let totalScore = 0;
  const educationAnalysis = education.map(edu => {
    const fieldTechProfile = calculateTechnicalDensity(
      `${edu.degree} ${edu.fieldOfStudy}`
    );

    const relevanceScore = fieldTechProfile.matches.filter(tech => 
      jobTechProfile.matches.includes(tech)
    ).length / (jobTechProfile.matches.length || 1);

    // Weight recent education more heavily
    const recencyBonus = edu.graduationDate ? 
      (new Date().getFullYear() - new Date(edu.graduationDate).getFullYear() < 5 ? 0.2 : 0) : 
      0;

    const entryScore = relevanceScore + recencyBonus;
    totalScore += entryScore;

    return {
      fieldRelevance: relevanceScore,
      recencyBonus,
      entryScore
    };
  });

  // Average score
  const score = totalScore / (education.length || 1);

  return {
    score,
    analysis: {
      entries: educationAnalysis
    }
  };
}

/**
 * Calculates job title match score with support for related roles
 * @param {Array<Object>} workExperience - Work experience entries
 * @param {string} targetJobTitle - Target job title
 * @returns {{ score: number, analysis: Object }}
 */
function calculateJobTitleScore(workExperience, targetJobTitle) {
  if (!workExperience?.length || !targetJobTitle) return { score: 0, analysis: {} };

  const targetRole = normalizeJobTitle(targetJobTitle);
  let bestMatch = 0;
  let titleMatch = '';

  // Define role categories and related titles
  const roleCategories = {
    frontend: [
      'frontend', 'front-end', 'front end', 'ui', 'react', 'angular', 'vue'
    ],
    backend: [
      'backend', 'back-end', 'back end', 'api', 'server', 'nodejs', 'java', 'python'
    ],
    fullstack: [
      'fullstack', 'full-stack', 'full stack', 'software engineer', 'developer'
    ],
    devops: [
      'devops', 'dev ops', 'sre', 'reliability', 'infrastructure', 'platform'
    ],
    mobile: [
      'mobile', 'ios', 'android', 'react native', 'flutter'
    ],
    data: [
      'data', 'analytics', 'ml', 'ai', 'machine learning', 'artificial intelligence'
    ]
  };

  // Determine target role category
  let targetCategory = '';
  for (const [category, keywords] of Object.entries(roleCategories)) {
    if (keywords.some(k => targetRole.includes(k))) {
      targetCategory = category;
      break;
    }
  }

  for (const exp of workExperience) {
    const expRole = normalizeJobTitle(exp.jobtitle || '');
    let matchScore = 0;

    // Check for exact or close match
    if (expRole === targetRole) {
      matchScore = 1;
    } else if (expRole.includes(targetRole) || targetRole.includes(expRole)) {
      matchScore = 0.8;
    } else {
      // Check for related role in same category
      if (targetCategory) {
        const isRelatedRole = roleCategories[targetCategory].some(k => 
          expRole.includes(k)
        );
        if (isRelatedRole) {
          matchScore = 0.6;
        }
      }

      // Check for related role across categories
      if (matchScore === 0) {
        for (const keywords of Object.values(roleCategories)) {
          if (keywords.some(k => expRole.includes(k) && targetRole.includes(k))) {
            matchScore = 0.4;
            break;
          }
        }
      }
    }

    // Consider seniority level match
    const seniorityMatch = compareSeniorityLevels(expRole, targetRole);
    matchScore *= (1 + seniorityMatch * 0.2); // Up to 20% bonus for seniority match

    if (matchScore > bestMatch) {
      bestMatch = matchScore;
      titleMatch = exp.jobtitle || '';
    }
  }

  return {
    score: bestMatch,
    analysis: {
      bestMatchTitle: titleMatch,
      targetRole,
      matchCategory: targetCategory
    }
  };
}

/**
 * Normalizes job title for comparison
 * @param {string} title - Job title
 * @returns {string} Normalized title
 */
function normalizeJobTitle(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[-_]/g, ' ')
    .trim();
}

/**
 * Compares seniority levels between roles
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {number} Seniority match score (-1 to 1)
 */
function compareSeniorityLevels(role1, role2) {
  const seniorityLevels = {
    junior: ['junior', 'entry', 'associate'],
    mid: ['mid', 'intermediate', 'regular'],
    senior: ['senior', 'lead', 'principal', 'staff'],
    manager: ['manager', 'head', 'director', 'architect']
  };

  function getSeniority(role) {
    for (const [level, keywords] of Object.entries(seniorityLevels)) {
      if (keywords.some(k => role.includes(k))) {
        return level;
      }
    }
    return 'mid'; // Default to mid-level
  }

  const level1 = getSeniority(role1);
  const level2 = getSeniority(role2);

  if (level1 === level2) return 1;
  
  const levels = ['junior', 'mid', 'senior', 'manager'];
  const index1 = levels.indexOf(level1);
  const index2 = levels.indexOf(level2);
  
  // Return score based on level difference
  const diff = Math.abs(index1 - index2);
  return diff === 1 ? 0.5 : 0; // Adjacent levels get partial credit
}

/**
 * Calculates weighted component scores
 * @param {Resume} resume - Resume object
 * @param {string} jobDescription - Job description
 * @param {string} jobTitle - Job title
 * @returns {{ score: number, componentScores: Object, analysis: Object }}
 */
function calculateComponentScores(resume, jobDescription, jobTitle) {
  // Calculate individual component scores
  const skillsResult = calculateSkillsScore(resume.skills, jobDescription);
  const experienceResult = calculateExperienceScore(resume.workExperience, jobDescription, jobTitle);
  const projectsResult = calculateProjectScore(resume.projects, jobDescription);
  const educationResult = calculateEducationScore(resume.education, jobDescription);
  const jobTitleResult = calculateJobTitleScore(resume.workExperience, jobTitle);

  // Calculate base score
  const baseScore = (
    skillsResult.score * COMPONENT_WEIGHTS.SKILLS +
    experienceResult.score * COMPONENT_WEIGHTS.WORK_EXPERIENCE +
    projectsResult.score * COMPONENT_WEIGHTS.PROJECTS +
    educationResult.score * COMPONENT_WEIGHTS.EDUCATION +
    jobTitleResult.score * COMPONENT_WEIGHTS.JOB_TITLE
  );

  // Calculate transferable skills bonus
  const transferableBonus = calculateTransferableBonus(resume, jobDescription);
  
  // Apply transferable skills bonus (up to 15% boost)
  let finalScore = baseScore * (1 + transferableBonus * 0.15);

  // Apply minimum score threshold for qualified candidates
  if (finalScore >= 0.35 && (skillsResult.score > 0.4 || experienceResult.score > 0.4)) {
    finalScore = Math.max(0.4, finalScore); // Minimum 4.0/10 for qualified candidates
  }

  return {
    score: finalScore,
    componentScores: {
      skills: skillsResult.score,
      experience: experienceResult.score,
      projects: projectsResult.score,
      education: educationResult.score,
      jobTitle: jobTitleResult.score
    },
    analysis: {
      skills: skillsResult.analysis,
      experience: experienceResult.analysis,
      projects: projectsResult.analysis,
      education: educationResult.analysis,
      jobTitle: jobTitleResult.analysis,
      transferableBonus,
      qualifiedCandidate: finalScore >= 0.4
    }
  };
}

/**
 * Calculates bonus for transferable skills and experience
 * @param {Resume} resume - Resume data
 * @param {string} jobDescription - Job description
 * @returns {number} Bonus score (0-1)
 */
function calculateTransferableBonus(resume, jobDescription) {
  const transferableCategories = {
    leadership: ['lead', 'manage', 'supervise', 'mentor', 'coordinate'],
    projectManagement: ['agile', 'scrum', 'project', 'delivery', 'timeline', 'deadline'],
    communication: ['communicate', 'present', 'document', 'collaborate', 'stakeholder'],
    problemSolving: ['solve', 'analyze', 'debug', 'optimize', 'improve', 'design'],
    scalability: ['scale', 'performance', 'optimize', 'architect', 'system design']
  };

  let totalBonus = 0;
  const descLower = jobDescription.toLowerCase();
  const expText = resume.workExperience
    ?.map(exp => exp.description || '')
    .join(' ')
    .toLowerCase() || '';

  // Calculate bonus for each transferable category
  for (const [category, keywords] of Object.entries(transferableCategories)) {
    const isRequiredInJob = keywords.some(k => descLower.includes(k));
    const hasExperience = keywords.some(k => expText.includes(k));

    if (isRequiredInJob && hasExperience) {
      totalBonus += 0.2; // Increased bonus per matching category
    }
  }

  // Add bonus for industry experience overlap
  const industryTerms = extractIndustryTerms(jobDescription);
  const hasIndustryExperience = industryTerms.some(term => 
    expText.includes(term.toLowerCase())
  );
  if (hasIndustryExperience) {
    totalBonus += 0.2;
  }

  return Math.min(1, totalBonus);
}

/**
 * Extracts industry-specific terms from job description
 * @param {string} jobDescription - Job description
 * @returns {string[]} Industry terms
 */
function extractIndustryTerms(jobDescription) {
  const commonIndustryTerms = [
    'fintech', 'healthcare', 'e-commerce', 'retail', 'gaming',
    'streaming', 'media', 'advertising', 'analytics', 'security',
    'cloud', 'enterprise', 'mobile', 'payments', 'blockchain'
  ];

  return commonIndustryTerms.filter(term => 
    jobDescription.toLowerCase().includes(term)
  );
}

module.exports = {
  COMPONENT_WEIGHTS,
  calculateComponentScores,
  calculateSkillsScore,
  calculateExperienceScore,
  calculateProjectScore,
  calculateEducationScore,
  calculateJobTitleScore
}; 