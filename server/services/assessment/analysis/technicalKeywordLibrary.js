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
  ],
  
  VERSION_SPECIFIC: [],
  INDUSTRY_SPECIFIC: []
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
 * Version-specific technical keywords
 * @type {Object.<string, string[]>}
 */
const VERSION_SPECIFIC_KEYWORDS = {
  JAVASCRIPT_VERSIONS: [
    'ES6', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021'
  ],
  PYTHON_VERSIONS: [
    'Python 2.7', 'Python 3.6', 'Python 3.7', 'Python 3.8', 'Python 3.9', 'Python 3.10', 'Python 3.11'
  ],
  JAVA_VERSIONS: [
    'Java 8', 'Java 11', 'Java 17', 'Java 21', 'JDK 8', 'JDK 11', 'JDK 17', 'JDK 21'
  ],
  FRAMEWORK_VERSIONS: [
    'React 16', 'React 17', 'React 18',
    'Angular 12', 'Angular 13', 'Angular 14', 'Angular 15', 'Angular 16',
    'Vue 2', 'Vue 3',
    'Spring Boot 2', 'Spring Boot 3',
    'Django 3', 'Django 4'
  ]
};

/**
 * Industry-specific technical terms
 * @type {Object.<string, string[]>}
 */
const INDUSTRY_TECH_TERMS = {
  FINTECH: [
    'blockchain', 'cryptocurrency', 'payment processing', 'financial modeling',
    'trading systems', 'risk analysis', 'fraud detection', 'KYC', 'AML'
  ],
  HEALTHCARE: [
    'EMR', 'EHR', 'HIPAA', 'HL7', 'FHIR', 'medical imaging',
    'clinical data', 'telehealth', 'patient portal', 'ICD-10'
  ],
  E_COMMERCE: [
    'payment gateway', 'shopping cart', 'inventory management',
    'order processing', 'PCI compliance', 'product catalog'
  ],
  CYBERSECURITY: [
    'penetration testing', 'vulnerability assessment', 'SIEM',
    'intrusion detection', 'threat analysis', 'security audit'
  ]
};

// Update TECHNICAL_CATEGORIES to include new categories
TECHNICAL_CATEGORIES.VERSION_SPECIFIC = Object.values(VERSION_SPECIFIC_KEYWORDS).flat();
TECHNICAL_CATEGORIES.INDUSTRY_SPECIFIC = Object.values(INDUSTRY_TECH_TERMS).flat();

/**
 * Calculates confidence score for technical term matches
 * @param {string} term - Technical term to evaluate
 * @param {string} context - Context where term was found
 * @returns {{ confidence: number, reason: string }}
 */
function calculateTermConfidence(term, context) {
  // Exact match has highest confidence
  if (context.includes(term)) {
    return { confidence: 1.0, reason: 'Exact match found' };
  }

  // Check for version-specific matches
  for (const [category, versions] of Object.entries(VERSION_SPECIFIC_KEYWORDS)) {
    if (versions.some(v => term.includes(v))) {
      return { confidence: 0.9, reason: `Version-specific ${category} match` };
    }
  }

  // Check for industry-specific matches
  for (const [industry, terms] of Object.entries(INDUSTRY_TECH_TERMS)) {
    if (terms.includes(term)) {
      return { confidence: 0.85, reason: `Industry-specific ${industry} term` };
    }
  }

  // Partial matches have lower confidence
  const termWords = term.toLowerCase().split(' ');
  const contextWords = new Set(context.toLowerCase().split(/\W+/));
  const matchedWords = termWords.filter(word => contextWords.has(word));
  
  if (matchedWords.length === termWords.length) {
    return { confidence: 0.7, reason: 'All term words found in different locations' };
  }
  
  if (matchedWords.length > 0) {
    const confidence = 0.3 + (matchedWords.length / termWords.length * 0.4);
    return { confidence, reason: 'Partial word matches found' };
  }

  return { confidence: 0, reason: 'No significant match found' };
}

/**
 * Calculates the technical density score of a text
 * @param {string} text - The text to analyze
 * @returns {{ 
 *   score: number, 
 *   matches: string[],
 *   keywords: string[],
 *   categories: { [key: string]: CategoryScore }
 * }}
 */
function calculateTechnicalDensity(text) {
  const textLower = text.toLowerCase();
  const words = new Set(textLower.split(/\W+/));
  const matches = [];
  /** @type {{ [key: string]: CategoryScore }} */
  const categories = {};
  
  // Check each category
  for (const [category, keywords] of Object.entries(TECHNICAL_CATEGORIES)) {
    const categoryMatches = keywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      return textLower.includes(keywordLower) || 
             words.has(keywordLower) ||
             keywordLower.split(' ').every(word => words.has(word));
    });
    
    if (categoryMatches.length > 0) {
      matches.push(...categoryMatches);
      categories[category] = {
        score: categoryMatches.length / keywords.length,
        matches: categoryMatches
      };
    }
  }
  
  // Calculate overall technical density score
  const uniqueMatches = [...new Set(matches)];
  const score = uniqueMatches.length / (ALL_TECHNICAL_KEYWORDS.length * 0.2); // Normalize to 0-1
  
  return {
    score: Math.min(1, score),
    matches: uniqueMatches,
    keywords: uniqueMatches, // Add keywords to match expected interface
    categories
  };
}

/**
 * Enhanced technical density calculation with confidence scoring
 * @param {string} text - The text to analyze
 * @returns {{ 
 *   score: number, 
 *   matches: Array<{ term: string, confidence: number, reason: string }>,
 *   categoryScores: { [key: string]: CategoryScore }
 * }}
 */
function calculateTechnicalDensityWithConfidence(text) {
  const textLower = text.toLowerCase();
  const words = textLower.split(/\W+/);
  /** @type {Array<{ term: string, confidence: number, reason: string }>} */
  const matches = [];
  /** @type {{ [key: string]: CategoryScore }} */
  const categoryScores = {};
  
  // Calculate per-category scores with confidence
  for (const [category, keywords] of Object.entries(TECHNICAL_CATEGORIES)) {
    const categoryMatches = keywords
      .map(keyword => {
        const confidenceResult = calculateTermConfidence(keyword, text);
        return confidenceResult.confidence > 0 ? {
          term: keyword,
          confidence: confidenceResult.confidence,
          reason: confidenceResult.reason
        } : null;
      })
      .filter(match => match !== null)
      .map(match => /** @type {{ term: string, confidence: number, reason: string }} */ (match));
    
    categoryScores[category] = {
      score: categoryMatches.reduce((sum, match) => sum + match.confidence, 0) / keywords.length,
      matches: categoryMatches.map(m => m.term)
    };
    
    matches.push(...categoryMatches);
  }
  
  // Calculate overall technical density with confidence weighting
  const totalScore = matches.reduce((sum, match) => sum + match.confidence, 0) / 
    ALL_TECHNICAL_KEYWORDS.length;
  
  return {
    score: totalScore,
    matches,
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
  VERSION_SPECIFIC_KEYWORDS,
  INDUSTRY_TECH_TERMS,
  calculateTechnicalDensity,
  calculateTechnicalDensityWithConfidence,
  calculateTermConfidence,
  isTechnicalRole,
  /** @typedef {Resume} */
  Resume: null,
  /** @typedef {WorkExperience} */
  WorkExperience: null
}; 