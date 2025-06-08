// @ts-check

/** @typedef {'TECHNICAL' | 'MANAGEMENT' | 'CREATIVE' | 'GENERAL'} JobCategory */

/** 
 * @typedef {Object} CategoryConfig
 * @property {string[]} keywords - Keywords that indicate this job category
 * @property {number} weight - Category weight for scoring
 * @property {string[]} [relatedSkills] - Skills commonly associated with this category
 * @property {string} description - Description of the job category
 */

/** 
 * @type {Record<JobCategory, CategoryConfig>} 
 * @readonly
 */
const JOB_CATEGORIES = {
  TECHNICAL: {
    keywords: [
      'engineer', 'developer', 'programmer', 'software', 'coding', 'technical',
      'data scientist', 'devops', 'qa', 'testing', 'analyst', 'administrator',
      'architect', 'security', 'network', 'database', 'systems', 'infrastructure'
    ],
    weight: 1.0,
    relatedSkills: [
      'programming', 'software development', 'coding', 'testing', 'debugging',
      'system design', 'algorithms', 'data structures', 'databases', 'apis'
    ],
    description: 'Roles focused on technical implementation, development, and maintenance of software and systems'
  },
  MANAGEMENT: {
    keywords: [
      'manager', 'director', 'lead', 'supervisor', 'executive', 'head of',
      'vp', 'president', 'chief', 'coordinator', 'principal', 'team lead',
      'project manager', 'program manager', 'scrum master'
    ],
    weight: 1.0,
    relatedSkills: [
      'leadership', 'team management', 'strategy', 'planning', 'budgeting',
      'project management', 'stakeholder management', 'decision making'
    ],
    description: 'Leadership roles focused on team and project management'
  },
  CREATIVE: {
    keywords: [
      'designer', 'creative', 'artist', 'writer', 'content', 'marketing',
      'brand', 'copywriter', 'ux', 'ui', 'graphic', 'visual', 'product designer',
      'interaction designer', 'art director', 'creative director'
    ],
    weight: 1.0,
    relatedSkills: [
      'design', 'creativity', 'visual design', 'user experience', 'branding',
      'typography', 'illustration', 'wireframing', 'prototyping'
    ],
    description: 'Roles focused on design, content creation, and creative direction'
  },
  GENERAL: {
    keywords: [],
    weight: 1.0,
    description: 'General business and administrative roles not fitting other categories'
  }
};

/**
 * Result of job classification
 * @typedef {Object} ClassificationResult
 * @property {JobCategory} category - The determined job category
 * @property {number} confidence - Confidence score (0-1)
 * @property {string[]} matchedKeywords - Keywords that matched
 * @property {string[]} [suggestedSkills] - Skills commonly needed for this category
 */

/**
 * Normalizes text for comparison
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Classifies a job based on title and description
 * @param {string} jobTitle - Job title
 * @param {string} jobDescription - Job description
 * @returns {ClassificationResult} Classification result
 */
const classifyJob = (jobTitle, jobDescription) => {
  const combinedText = normalizeText(`${jobTitle} ${jobDescription}`);
  const words = new Set(combinedText.split(' '));
  
  /** @type {{ category: JobCategory; matches: string[]; count: number; }[]} */
  const categoryMatches = Object.entries(JOB_CATEGORIES)
    .filter(([category]) => category !== 'GENERAL')
    .map(([category, config]) => {
      const matches = config.keywords.filter(keyword => {
        const normalizedKeyword = normalizeText(keyword);
        return normalizedKeyword.split(' ').every(word => words.has(word));
      });
      return {
        category: /** @type {JobCategory} */ (category),
        matches,
        count: matches.length
      };
    });

  // Find category with most matches
  const bestMatch = categoryMatches.reduce((best, current) => 
    current.count > best.count ? current : best, 
    { category: 'GENERAL', matches: [], count: 0 }
  );

  // Calculate confidence based on number of matches
  const totalKeywords = JOB_CATEGORIES[bestMatch.category].keywords.length;
  const confidence = totalKeywords > 0 ? 
    Math.min(1, (bestMatch.count / totalKeywords) + (bestMatch.count > 2 ? 0.3 : 0)) : 
    0;
  
  return {
    category: bestMatch.category,
    confidence,
    matchedKeywords: bestMatch.matches,
    suggestedSkills: JOB_CATEGORIES[bestMatch.category].relatedSkills
  };
};

/**
 * Gets related skills for a job category
 * @param {JobCategory} category - Job category
 * @returns {string[]} Related skills
 */
const getRelatedSkills = (category) => {
  return JOB_CATEGORIES[category].relatedSkills ?? [];
};

/**
 * Gets category weight for scoring
 * @param {JobCategory} category - Job category
 * @returns {number} Category weight
 */
const getCategoryWeight = (category) => {
  return JOB_CATEGORIES[category].weight;
};

/**
 * Checks if a category is valid
 * @param {string} category - Category to check
 * @returns {category is JobCategory} Whether the category is valid
 */
const isValidCategory = (category) => {
  return Object.keys(JOB_CATEGORIES).includes(category);
};

module.exports = {
  JOB_CATEGORIES,
  classifyJob,
  getRelatedSkills,
  getCategoryWeight,
  isValidCategory
}; 