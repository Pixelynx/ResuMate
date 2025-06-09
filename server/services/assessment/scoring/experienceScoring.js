// @ts-check

/** @typedef {'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT'} SeniorityLevel */

/**
 * @typedef {Object} WorkExperience
 * @property {string} jobtitle - Job title
 * @property {string} companyName - Company name
 * @property {string} description - Job description
 * @property {string} [startDate] - Start date
 * @property {string} [endDate] - End date
 */

/**
 * @typedef {Object} JobDetails
 * @property {string} description - Job description
 * @property {string} [title] - Job title
 * @property {string} [industry] - Job industry
 */

/**
 * @typedef {Object} ExperienceScore
 * @property {number} relevanceScore - Overall relevance score (0-1)
 * @property {number} seniorityScore - Seniority level match score (0-1)
 * @property {number} recencyScore - Recency-weighted score (0-1)
 * @property {number} industryScore - Industry relevance score (0-1)
 * @property {string[]} matchedKeywords - Matched relevant keywords
 * @property {string[]} strengths - Identified strengths
 * @property {string[]} gaps - Identified gaps
 */

/**
 * @typedef {Object} ExperiencePenalty
 * @property {number} penalty - Calculated penalty value (0-1)
 * @property {Object} analysis - Analysis of the penalty calculation
 * @property {number} analysis.totalYears - Total years of experience
 * @property {boolean} analysis.isSeniorRole - Whether the job is a senior role
 * @property {boolean} analysis.isJuniorRole - Whether the job is a junior role
 * @property {string} [analysis.reason] - Reason for the penalty
 * @property {number} analysis.levelConfidence - Confidence in the seniority level detection
 */

/** @type {Map<string, Set<string>>} */
const INDUSTRY_KEYWORDS = new Map([
  ['tech', new Set(['software', 'technology', 'it', 'digital', 'web', 'cloud', 'data'])],
  ['finance', new Set(['banking', 'financial', 'investment', 'trading', 'fintech'])],
  ['healthcare', new Set(['medical', 'health', 'clinical', 'patient', 'pharmaceutical'])]
]);

/** @type {Map<string, Set<string>>} */
const RELATED_INDUSTRIES = new Map([
  ['tech', new Set(['fintech', 'healthtech', 'edtech'])],
  ['finance', new Set(['fintech', 'insurtech'])],
  ['healthcare', new Set(['healthtech', 'biotech'])]
]);

const SENIORITY_INDICATORS = {
  senior: ['senior', 'lead', 'principal', 'architect', 'head of', 'manager'],
  junior: ['junior', 'entry', 'associate', 'intern', 'trainee']
};

/**
 * Calculates months between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of months
 */
const calculateMonthsBetween = (date1, date2) => {
  return (date2.getFullYear() - date1.getFullYear()) * 12 +
         (date2.getMonth() - date1.getMonth());
};

/**
 * Calculates recency score based on date
 * @param {string} startDate - Experience start date
 * @param {string} endDate - Experience end date
 * @returns {number} Recency score (0-1)
 */
const calculateRecencyScore = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const now = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    const monthsAgo = calculateMonthsBetween(end, now);
    // Exponential decay: score = e^(-months/24)
    // 2 years old = 0.37, 4 years = 0.14, 6 years = 0.05
    return Math.exp(-monthsAgo / 24);
  } catch (error) {
    console.error('Error calculating recency score:', error);
    return 0;
  }
};

/**
 * Detects industry from text
 * @param {string} text - Text to analyze
 * @returns {{ industry: string, confidence: number }} Detected industry
 */
const detectIndustry = (text) => {
  const textLower = text.toLowerCase();
  let bestMatch = { industry: 'unknown', confidence: 0 };

  for (const [industry, keywords] of INDUSTRY_KEYWORDS) {
    const matches = Array.from(keywords)
      .filter(keyword => textLower.includes(keyword))
      .length;
    
    const confidence = matches / keywords.size;
    if (confidence > bestMatch.confidence) {
      bestMatch = { industry, confidence };
    }
  }

  return bestMatch;
};

/**
 * Enhanced industry relevance calculation with transferable skills
 * @param {WorkExperience} experience - Work experience
 * @param {string} targetIndustry - Target industry
 * @returns {{ score: number, transferableSkills: string[] }}
 */
const calculateEnhancedIndustryScore = (experience, targetIndustry) => {
  const expIndustry = detectIndustry(
    `${experience.companyName} ${experience.description}`
  );

  // Define transferable skills by industry
  const TRANSFERABLE_SKILLS = {
    tech: ['scalability', 'optimization', 'architecture', 'agile', 'testing'],
    finance: ['security', 'compliance', 'analytics', 'risk management'],
    healthcare: ['security', 'compliance', 'data privacy', 'integration']
  };

  // Identify transferable skills
  const transferableSkills = (TRANSFERABLE_SKILLS[targetIndustry] || [])
    .filter(skill => experience.description.toLowerCase().includes(skill));

  let score = 0;
  
  // Direct industry match
  if (expIndustry.industry === targetIndustry) {
    score = 0.8 + (0.2 * expIndustry.confidence);
  } 
  // Related industry
  else if (RELATED_INDUSTRIES.get(targetIndustry)?.has(expIndustry.industry)) {
    score = 0.6;
  } 
  // Different industry but with transferable skills
  else if (transferableSkills.length > 0) {
    score = 0.3 + Math.min(0.3, transferableSkills.length * 0.1);
  }
  // Different industry
  else {
    score = 0.2;
  }

  return {
    score,
    transferableSkills
  };
};

/**
 * Calculates total years of experience
 * @param {WorkExperience[]} workExperience - Work experience entries
 * @returns {number} Total years of experience
 */
const calculateTotalExperience = (workExperience) => {
  if (!workExperience?.length) return 0;

  const totalMonths = workExperience.reduce((total, exp) => {
    if (!exp.startDate) return total;
    
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return total;
    
    const months = calculateMonthsBetween(start, end);
    return total + Math.max(0, months);
  }, 0);

  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
};

/**
 * Detects seniority level from job title and description
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {{ level: SeniorityLevel, confidence: number }} Detected seniority level
 */
const detectSeniorityLevel = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check for senior indicators
  const seniorMatches = SENIORITY_INDICATORS.senior
    .filter(indicator => text.includes(indicator)).length;
  
  // Check for junior indicators
  const juniorMatches = SENIORITY_INDICATORS.junior
    .filter(indicator => text.includes(indicator)).length;
  
  if (seniorMatches > juniorMatches) {
    return { 
      level: 'SENIOR',
      confidence: Math.min(1, seniorMatches / SENIORITY_INDICATORS.senior.length)
    };
  }
  
  if (juniorMatches > 0) {
    return { 
      level: 'JUNIOR',
      confidence: Math.min(1, juniorMatches / SENIORITY_INDICATORS.junior.length)
    };
  }
  
  return { level: 'MID', confidence: 0.6 };
};

/**
 * Calculates experience mismatch penalty
 * @param {WorkExperience[]} workExperience - Work experience entries
 * @param {string} jobDescription - Job description
 * @param {string} jobTitle - Job title
 * @returns {ExperiencePenalty} Penalty calculation result
 */
const calculateExperienceMismatchPenalty = (workExperience, jobDescription, jobTitle) => {
  const { level: jobLevel, confidence: levelConfidence } = detectSeniorityLevel(jobTitle, jobDescription);
  const totalYears = calculateTotalExperience(workExperience);
  
  let penalty = 0;
  let reason = '';

  // Apply penalties based on experience mismatches
  if (jobLevel === 'SENIOR' && totalYears < 5) {
    penalty = 0.4; // 40% penalty for junior applying to senior role
    reason = 'Insufficient experience for senior role';
  } else if (jobLevel === 'JUNIOR' && totalYears > 8) {
    penalty = 0.2; // 20% penalty for senior applying to junior role
    reason = 'Overqualified for junior role';
  }

  return {
    penalty,
    analysis: {
      totalYears,
      isSeniorRole: jobLevel === 'SENIOR',
      isJuniorRole: jobLevel === 'JUNIOR',
      reason,
      levelConfidence
    }
  };
};

/**
 * Scores a single experience entry
 * @param {WorkExperience} experience - Experience entry
 * @param {JobDetails} jobDetails - Job details
 * @param {Function} calculateSkillsScore - Skills scoring function
 * @returns {ExperienceScore}
 */
const scoreExperience = (experience, jobDetails, calculateSkillsScore) => {
  // Calculate base relevance
  const skillsMatch = calculateSkillsScore(experience.description);
  
  // Calculate recency score with default empty string
  const recencyScore = calculateRecencyScore(
    experience.startDate || '',
    experience.endDate || ''
  );
  
  // Calculate enhanced industry score
  const industryResult = calculateEnhancedIndustryScore(
    experience,
    detectIndustry(jobDetails.description).industry
  );
  
  // Calculate seniority match
  const expSeniority = detectSeniorityLevel(experience.jobtitle, experience.description);
  const jobSeniority = detectSeniorityLevel(jobDetails.title || '', jobDetails.description);
  const seniorityScore = expSeniority.level === jobSeniority.level ? 1 :
    Math.max(0, 1 - Math.abs(
      ['JUNIOR', 'MID', 'SENIOR'].indexOf(expSeniority.level) -
      ['JUNIOR', 'MID', 'SENIOR'].indexOf(jobSeniority.level)
    ) * 0.3);

  // Calculate overall relevance score with industry boost
  const relevanceScore = (
    skillsMatch.matchScore * 0.4 +
    industryResult.score * 0.3 +
    seniorityScore * 0.2 +
    recencyScore * 0.1
  );

  return {
    relevanceScore: Math.min(1, relevanceScore * 1.2), // 20% potential boost
    seniorityScore,
    recencyScore,
    industryScore: industryResult.score,
    matchedKeywords: skillsMatch.exactMatches,
    strengths: [
      ...industryResult.transferableSkills,
      ...(skillsMatch.exactMatches.length > 3 ? ['Strong technical match'] : []),
      ...(industryResult.score > 0.7 ? ['Relevant industry experience'] : []),
      ...(recencyScore > 0.8 ? ['Recent experience'] : [])
    ],
    gaps: [
      ...skillsMatch.missingSkills,
      ...(industryResult.score < 0.3 ? ['Limited industry experience'] : []),
      ...(recencyScore < 0.3 ? ['Experience not recent'] : [])
    ]
  };
};

module.exports = {
  calculateRecencyScore,
  calculateTotalExperience,
  calculateEnhancedIndustryScore,
  detectIndustry,
  detectSeniorityLevel,
  calculateExperienceMismatchPenalty,
  scoreExperience
}; 