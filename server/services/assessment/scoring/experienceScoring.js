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
 * Calculates industry relevance score
 * @param {WorkExperience} experience - Work experience
 * @param {string} targetIndustry - Target industry
 * @returns {number} Industry relevance score (0-1)
 */
const calculateIndustryScore = (experience, targetIndustry) => {
  const expIndustry = detectIndustry(
    `${experience.companyName} ${experience.description}`
  );

  if (expIndustry.industry === targetIndustry) {
    return 0.7 + (0.3 * expIndustry.confidence);
  }

  const related = RELATED_INDUSTRIES.get(targetIndustry)?.has(expIndustry.industry);
  return related ? 0.5 : 0.2;
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
 * Scores work experience relevance
 * @param {WorkExperience} experience - Work experience entry
 * @param {JobDetails} jobDetails - Job details
 * @param {(text: string) => { matchScore: number, exactMatches: string[], partialMatches: string[], missingSkills: string[] }} calculateSkillsScore - Skills scoring function
 * @returns {ExperienceScore} Experience score details
 */
const scoreExperience = (experience, jobDetails, calculateSkillsScore) => {
  // Calculate seniority match
  const expSeniority = detectSeniorityLevel(experience.jobtitle, experience.description);
  const jobSeniority = detectSeniorityLevel(
    jobDetails.title ?? '',
    jobDetails.description
  );
  
  const seniorityScore = expSeniority.level === jobSeniority.level ? 
    0.7 + (0.3 * Math.min(expSeniority.confidence, jobSeniority.confidence)) :
    Math.max(0.2, 0.5 - Math.abs(
      ['JUNIOR', 'MID', 'SENIOR'].indexOf(expSeniority.level) -
      ['JUNIOR', 'MID', 'SENIOR'].indexOf(jobSeniority.level)
    ) * 0.2);

  // Calculate recency score
  const recencyScore = calculateRecencyScore(
    experience.startDate ?? '',
    experience.endDate ?? ''
  );

  // Calculate industry relevance
  const industryScore = calculateIndustryScore(
    experience,
    jobDetails.industry ?? detectIndustry(jobDetails.description).industry
  );

  // Calculate skill match
  const skillMatch = calculateSkillsScore(experience.description);

  const relevanceScore = (
    skillMatch.matchScore * 0.4 +
    seniorityScore * 0.3 +
    industryScore * 0.2 +
    recencyScore * 0.1
  );

  // Identify strengths and gaps
  const strengths = [];
  const gaps = [];

  if (skillMatch.matchScore > 0.7) strengths.push('Strong skill alignment');
  if (seniorityScore > 0.8) strengths.push('Appropriate seniority level');
  if (industryScore > 0.7) strengths.push('Relevant industry experience');
  if (recencyScore > 0.7) strengths.push('Recent experience');

  if (skillMatch.missingSkills.length > 0) {
    gaps.push(`Missing skills: ${skillMatch.missingSkills.join(', ')}`);
  }
  if (seniorityScore < 0.5) {
    gaps.push('Seniority level mismatch');
  }

  return {
    relevanceScore,
    seniorityScore,
    recencyScore,
    industryScore,
    matchedKeywords: [...skillMatch.exactMatches, ...skillMatch.partialMatches],
    strengths,
    gaps
  };
};

module.exports = {
  calculateRecencyScore,
  calculateTotalExperience,
  calculateIndustryScore,
  detectIndustry,
  detectSeniorityLevel,
  calculateExperienceMismatchPenalty,
  scoreExperience
}; 