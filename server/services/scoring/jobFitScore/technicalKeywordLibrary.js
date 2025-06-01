// @ts-check

/** @typedef {Object} WorkExperience
 * @property {string} jobtitle - Job title
 * @property {string} companyName - Company name
 * @property {string} description - Job description
 * @property {string} [startDate] - Start date
 * @property {string} [endDate] - End date
 */

/** @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} technologies - Technologies used
 */

/** @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} fieldOfStudy - Field of study
 * @property {string} institutionName - Institution name
 * @property {string} [graduationDate] - Graduation date
 */

/** @typedef {Object} PersonalDetails
 * @property {string} [title] - Professional title
 * @property {string} firstname - First name
 * @property {string} lastname - Last name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} location - Location
 * @property {string} [linkedin] - LinkedIn URL
 * @property {string} [github] - GitHub URL
 * @property {string} [website] - Personal website URL
 */

/** @typedef {Object} Resume
 * @property {PersonalDetails} personalDetails - Personal details
 * @property {Object} skills - Skills section
 * @property {string} skills.skills_ - Comma-separated skills
 * @property {WorkExperience[]} workExperience - Work experience entries
 * @property {Project[]} projects - Project entries
 * @property {Education[]} education - Education entries
 */

/** @typedef {{ score: number, matches: string[] }} CategoryScore */

/**
 * Technical keywords categorized by type
 * @type {Object.<string, string[]>}
 */
const TECHNICAL_CATEGORIES = {
  PROGRAMMING_LANGUAGES: [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift',
    'kotlin', 'go', 'rust', 'typescript', 'scala', 'perl', 'r', 'matlab'
  ],
  
  FRAMEWORKS: [
    'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express',
    'laravel', 'rails', 'asp.net', 'node.js', 'next.js', 'nuxt', 'svelte'
  ],
  
  DATABASES: [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'dynamodb', 'cassandra', 'oracle', 'firebase', 'neo4j', 'graphql'
  ],
  
  CLOUD_DEVOPS: [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform',
    'ansible', 'circleci', 'gitlab', 'github actions', 'prometheus', 'grafana'
  ],
  
  TECHNICAL_CONCEPTS: [
    'api', 'rest', 'microservices', 'ci/cd', 'tdd', 'agile', 'scrum',
    'algorithms', 'data structures', 'design patterns', 'architecture'
  ],
  
  TECHNICAL_ROLES: [
    'software engineer', 'developer', 'programmer', 'architect', 'devops',
    'full stack', 'frontend', 'backend', 'sre', 'data scientist', 'ml engineer',
    'qa engineer', 'security engineer', 'cloud engineer', 'systems engineer'
  ]
};

/**
 * Flattened list of all technical keywords
 * @type {string[]}
 */
const ALL_TECHNICAL_KEYWORDS = Object.values(TECHNICAL_CATEGORIES).flat();

/**
 * Technical role indicators that suggest a technical position
 * @type {string[]}
 */
const TECHNICAL_ROLE_INDICATORS = [
  'engineer', 'developer', 'programmer', 'architect', 'analyst',
  'administrator', 'technician', 'specialist', 'consultant'
];

/**
 * Calculates the technical density score of a text
 * @param {string} text - The text to analyze
 * @returns {{ 
 *   score: number, 
 *   matches: string[],
 *   categoryScores: { [key: string]: CategoryScore }
 * }}
 */
function calculateTechnicalDensity(text) {
  const textLower = text.toLowerCase();
  const words = textLower.split(/\W+/);
  const matches = new Set();
  /** @type {{ [key: string]: CategoryScore }} */
  const categoryScores = {};
  
  // Calculate per-category scores
  for (const [category, keywords] of Object.entries(TECHNICAL_CATEGORIES)) {
    const categoryMatches = keywords.filter(keyword => {
      // Check for exact word match or phrase match
      return keyword.includes(' ') ? 
        textLower.includes(keyword) : 
        words.includes(keyword);
    });
    
    categoryMatches.forEach(match => matches.add(match));
    
    categoryScores[category] = {
      score: categoryMatches.length / keywords.length,
      matches: categoryMatches
    };
  }
  
  // Calculate overall technical density
  const totalScore = matches.size / ALL_TECHNICAL_KEYWORDS.length;
  
  return {
    score: totalScore,
    matches: Array.from(matches),
    categoryScores
  };
}

/**
 * Determines if a job title indicates a technical role
 * @param {string} jobTitle - The job title to analyze
 * @returns {{ isTechnical: boolean, confidence: number }}
 */
function isTechnicalRole(jobTitle) {
  const titleLower = jobTitle.toLowerCase();
  
  // Check for exact technical role matches
  const exactMatch = TECHNICAL_CATEGORIES.TECHNICAL_ROLES.some(role => 
    titleLower.includes(role)
  );
  
  if (exactMatch) {
    return { isTechnical: true, confidence: 1.0 };
  }
  
  // Check for technical role indicators
  const indicatorMatches = TECHNICAL_ROLE_INDICATORS.filter(indicator =>
    titleLower.includes(indicator)
  );
  
  const confidence = indicatorMatches.length > 0 ? 
    Math.min(0.8, 0.4 + (indicatorMatches.length * 0.2)) : 0;
  
  return {
    isTechnical: confidence > 0.4,
    confidence
  };
}

module.exports = {
  TECHNICAL_CATEGORIES,
  ALL_TECHNICAL_KEYWORDS,
  TECHNICAL_ROLE_INDICATORS,
  calculateTechnicalDensity,
  isTechnicalRole,
  /** @typedef {Resume} */
  Resume: null,
  /** @typedef {WorkExperience} */
  WorkExperience: null
}; 