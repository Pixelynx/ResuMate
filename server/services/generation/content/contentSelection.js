// @ts-check

/**
 * @typedef {import('../../ai.service').ResumeData} ResumeData
 * @typedef {import('../../ai.service').JobDetails} JobDetails
 */

/**
 * @typedef {Object} WorkExperience
 * @property {string} jobTitle - Job title
 * @property {string} description - Job description
 * @property {string} [startDate] - Start date
 * @property {string} [endDate] - End date
 */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} [technologies] - Technologies used
 */

/**
 * @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} fieldOfStudy - Field of study
 */

/**
 * @typedef {Object} Skills
 * @property {string} skills_ - Comma-separated list of skills
 */

/**
 * @typedef {Object} ContentQualityMetrics
 * @property {number} specificity - Score for specific details (0-1)
 * @property {number} relevance - Score for job relevance (0-1)
 * @property {number} impact - Score for measurable impact (0-1)
 * @property {number} freshness - Score for content recency (0-1)
 */

/**
 * @typedef {Object} ScoredItem
 * @property {ContentQualityMetrics} score - Quality metrics
 */

/**
 * @typedef {Object} SectionContent
 * @property {Array<any>} content - Selected content items
 * @property {number} score - Section score
 */

/**
 * @typedef {Object} SelectedContent
 * @property {SectionContent} experience - Selected experience content
 * @property {SectionContent} skills - Selected skills content
 * @property {SectionContent} projects - Selected projects content
 * @property {SectionContent} education - Selected education content
 * @property {ContentQualityMetrics} metrics - Overall quality metrics
 * @property {number} overallScore - Combined quality score
 * @property {string[]} strengths - Content strengths
 * @property {string[]} weaknesses - Areas for improvement
 */

/** @type {Map<string, SelectedContent>} */
const contentAnalysisCache = new Map();

/**
 * Assesses the quality of resume content
 * @param {string} content - Content to assess
 * @param {string} jobDescription - Job description for relevance comparison
 * @returns {ContentQualityMetrics}
 */
const assessContentQuality = (content, jobDescription) => {
  if (!content || !jobDescription) {
    return { specificity: 0, relevance: 0, impact: 0, freshness: 0 };
  }

  // Calculate specificity based on quantifiable metrics
  const specificity = calculateSpecificityScore(content);
  
  // Calculate relevance to job description
  const relevance = calculateRelevanceScore(content, jobDescription);
  
  // Calculate impact based on achievement metrics
  const impact = calculateImpactScore(content);
  
  // Calculate freshness based on date indicators
  const freshness = calculateFreshnessScore(content);

  return { specificity, relevance, impact, freshness };
};

/**
 * Calculates specificity score based on quantifiable details
 * @param {string} content - Content to analyze
 * @returns {number} Specificity score (0-1)
 */
const calculateSpecificityScore = (content) => {
  const metrics = {
    numbers: (content.match(/\d+%|\d+ years|\$\d+|\d+ projects/g) || []).length,
    specificTerms: (content.match(/\b(developed|implemented|managed|led|created|designed)\b/gi) || []).length,
    technicalTerms: (content.match(/\b(API|SDK|framework|database|system|platform)\b/gi) || []).length
  };

  return Math.min(1, (
    (Math.min(1, metrics.numbers / 3) * 0.4) +
    (Math.min(1, metrics.specificTerms / 4) * 0.3) +
    (Math.min(1, metrics.technicalTerms / 3) * 0.3)
  ));
};

/**
 * Calculates relevance score compared to job description
 * @param {string} content - Content to analyze
 * @param {string} jobDescription - Job description
 * @returns {number} Relevance score (0-1)
 */
const calculateRelevanceScore = (content, jobDescription) => {
  if (!content || !jobDescription) return 0;

  const contentWords = new Set(content.toLowerCase().match(/\b\w+\b/g) || []);
  const jobWords = new Set(jobDescription.toLowerCase().match(/\b\w+\b/g) || []);
  
  let matches = 0;
  for (const word of contentWords) {
    if (jobWords.has(word)) matches++;
  }
  
  return matches / (jobWords.size || 1);
};

/**
 * Calculates impact score based on achievement metrics
 * @param {string} content - Content to analyze
 * @returns {number} Impact score (0-1)
 */
const calculateImpactScore = (content) => {
  const metrics = {
    achievements: (content.match(/\b(improved|increased|reduced|saved|grew|achieved)\b/gi) || []).length,
    metrics: (content.match(/\d+%|\$\d+|\d+ hours|\d+ users/g) || []).length,
    scope: (content.match(/\b(team|company|organization|department|global)\b/gi) || []).length
  };

  return Math.min(1, (
    (Math.min(1, metrics.achievements / 3) * 0.4) +
    (Math.min(1, metrics.metrics / 2) * 0.4) +
    (Math.min(1, metrics.scope / 2) * 0.2)
  ));
};

/**
 * Calculates freshness score based on date indicators
 * @param {string} content - Content to analyze
 * @returns {number} Freshness score (0-1)
 */
const calculateFreshnessScore = (content) => {
  const currentYear = new Date().getFullYear();
  const years = content.match(/\b20\d{2}\b/g) || [];
  
  if (years.length === 0) return 0.5; // Default if no dates found
  
  const mostRecent = Math.max(...years.map(y => parseInt(y)));
  const yearDiff = currentYear - mostRecent;
  
  return Math.max(0, 1 - (yearDiff * 0.2)); // 20% penalty per year
};

/**
 * Selects optimal content based on quality and relevance
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @returns {SelectedContent} Selected content with quality scores
 */
const selectOptimalContent = (resumeData, jobDetails) => {
  const cacheKey = JSON.stringify({ resumeId: resumeData.id, jobId: jobDetails.jobTitle });
  
  if (contentAnalysisCache.has(cacheKey)) {
    return contentAnalysisCache.get(cacheKey) || createEmptyContent();
  }

  const experienceContent = selectExperienceContent(
    /** @type {WorkExperience[]} */ (resumeData.workExperience || []), 
    jobDetails
  );
  const skillsContent = selectSkillsContent(
    /** @type {Skills} */ (resumeData.skills || { skills_: '' }), 
    jobDetails
  );
  const projectContent = selectProjectContent(
    /** @type {Project[]} */ (resumeData.projects || []), 
    jobDetails
  );
  const educationContent = selectEducationContent(
    /** @type {Education[]} */ (resumeData.education || []), 
    jobDetails
  );

  // Calculate overall metrics
  const metrics = {
    specificity: calculateOverallMetric([experienceContent, projectContent], 'specificity'),
    relevance: calculateOverallMetric([experienceContent, skillsContent, projectContent], 'relevance'),
    impact: calculateOverallMetric([experienceContent, projectContent], 'impact'),
    freshness: calculateOverallMetric([experienceContent, educationContent], 'freshness')
  };

  // Calculate overall score
  const overallScore = (
    metrics.specificity * 0.3 +
    metrics.relevance * 0.3 +
    metrics.impact * 0.2 +
    metrics.freshness * 0.2
  );

  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];

  if (metrics.relevance > 0.7) strengths.push('High job relevance');
  if (metrics.impact > 0.7) strengths.push('Strong achievements');
  if (metrics.specificity > 0.7) strengths.push('Detailed experience');
  
  if (metrics.relevance < 0.3) weaknesses.push('Low job relevance');
  if (metrics.impact < 0.3) weaknesses.push('Limited achievements');
  if (metrics.specificity < 0.3) weaknesses.push('Lacks specific details');

  const result = {
    experience: experienceContent,
    skills: skillsContent,
    projects: projectContent,
    education: educationContent,
    metrics,
    overallScore,
    strengths,
    weaknesses
  };

  contentAnalysisCache.set(cacheKey, result);
  return result;
};

/**
 * Creates empty content structure
 * @returns {SelectedContent}
 */
const createEmptyContent = () => ({
  experience: { content: [], score: 0 },
  skills: { content: [], score: 0 },
  projects: { content: [], score: 0 },
  education: { content: [], score: 0 },
  metrics: { specificity: 0, relevance: 0, impact: 0, freshness: 0 },
  overallScore: 0,
  strengths: [],
  weaknesses: ['No content available']
});

/**
 * Calculates overall metric from section scores
 * @param {Array<SectionContent>} sections - Sections to evaluate
 * @param {keyof ContentQualityMetrics} metric - Metric to calculate
 * @returns {number} Overall metric score
 */
const calculateOverallMetric = (sections, metric) => {
  const scores = sections
    .filter(section => section && section.content.length > 0)
    .map(section => section.content[0]?.score?.[metric] || 0);
  
  return scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
    : 0;
};

/**
 * Selects most relevant work experience content
 * @param {WorkExperience[]} experiences - Work experience entries
 * @param {JobDetails} jobDetails - Job details
 * @returns {SectionContent} Selected experience content with scores
 */
const selectExperienceContent = (experiences, jobDetails) => {
  if (!experiences?.length) return { content: [], score: 0 };

  /** @type {(WorkExperience & ScoredItem)[]} */
  const scoredExperiences = experiences.map(exp => ({
    ...exp,
    score: assessContentQuality(
      `${exp.jobTitle} ${exp.description}`,
      jobDetails.jobDescription
    )
  }));

  return {
    content: scoredExperiences
      .sort((a, b) => (
        (b.score.relevance + b.score.freshness) -
        (a.score.relevance + a.score.freshness)
      ))
      .slice(0, 3),
    score: scoredExperiences.reduce((max, exp) => 
      Math.max(max, (exp.score.relevance + exp.score.freshness) / 2), 0)
  };
};

/**
 * Selects most relevant skills content
 * @param {Skills} skills - Skills section
 * @param {JobDetails} jobDetails - Job details
 * @returns {SectionContent} Selected skills content with scores
 */
const selectSkillsContent = (skills, jobDetails) => {
  if (!skills?.skills_) return { content: [], score: 0 };

  const skillsList = skills.skills_.split(',').map((s) => s.trim());
  /** @type {Array<{ skill: string; score: number }>} */
  const scoredSkills = skillsList.map((skill) => ({
    skill,
    score: calculateRelevanceScore(skill, jobDetails.jobDescription)
  }));

  return {
    content: scoredSkills
      .filter((s) => s.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8),
    score: Math.max(...scoredSkills.map((s) => s.score))
  };
};

/**
 * Selects most relevant project content
 * @param {Project[]} projects - Project entries
 * @param {JobDetails} jobDetails - Job details
 * @returns {SectionContent} Selected project content with scores
 */
const selectProjectContent = (projects, jobDetails) => {
  if (!projects?.length) return { content: [], score: 0 };

  /** @type {(Project & ScoredItem)[]} */
  const scoredProjects = projects.map(proj => ({
    ...proj,
    score: assessContentQuality(
      `${proj.title} ${proj.description} ${proj.technologies || ''}`,
      jobDetails.jobDescription
    )
  }));

  return {
    content: scoredProjects
      .sort((a, b) => (
        (b.score.relevance + b.score.impact) -
        (a.score.relevance + a.score.impact)
      ))
      .slice(0, 2),
    score: scoredProjects.reduce((max, proj) => 
      Math.max(max, (proj.score.relevance + proj.score.impact) / 2), 0)
  };
};

/**
 * Selects most relevant education content
 * @param {Education[]} education - Education entries
 * @param {JobDetails} jobDetails - Job details
 * @returns {SectionContent} Selected education content with scores
 */
const selectEducationContent = (education, jobDetails) => {
  if (!education?.length) return { content: [], score: 0 };

  /** @type {(Education & ScoredItem)[]} */
  const scoredEducation = education.map(edu => ({
    ...edu,
    score: assessContentQuality(
      `${edu.degree} ${edu.fieldOfStudy}`,
      jobDetails.jobDescription
    )
  }));

  return {
    content: scoredEducation
      .sort((a, b) => b.score.relevance - a.score.relevance)
      .slice(0, 2),
    score: scoredEducation.reduce((max, edu) => 
      Math.max(max, edu.score.relevance), 0)
  };
};

module.exports = {
  assessContentQuality,
  selectOptimalContent,
  calculateSpecificityScore,
  calculateRelevanceScore,
  calculateImpactScore,
  calculateFreshnessScore
}; 