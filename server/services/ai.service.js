// @ts-check
const { OpenAI } = require('openai');
const { generateEnhancedCoverLetter } = require('./generation/coverLetterGenerator');
const { prioritizeContent } = require('./generation/content/contentAnalysis');

/**
 * @typedef {Object} PersonalDetails
 * @property {string} [title] - Professional title
 */

/**
 * @typedef {Object} Education
 * @property {string} [endDate] - End date of education
 */

/**
 * @typedef {Object} Skills
 * @property {string} skills_ - Comma-separated list of skills
 */

/**
 * @typedef {Object} ResumeData
 * @property {PersonalDetails} [personalDetails]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [title]
 * @property {Array<Object>} [workExperience]
 * @property {Array<Education>} [education]
 * @property {Skills} [skills]
 * @property {Array<Object>} [projects]
 * @property {string} [id] - Resume identifier
 */

/**
 * @typedef {Object} JobDetails
 * @property {string} company - Company name
 * @property {string} jobTitle - Job title
 * @property {string} jobDescription - Job description
 */

/**
 * @typedef {'EXPERIENCED' | 'TECHNICAL' | 'CAREER_CHANGER' | 'NEW_GRADUATE'} CandidateProfile
 */

/**
 * @typedef {Object} GenerationOptions
 * @property {string} [tone] - Desired tone (professional, enthusiastic, etc.)
 * @property {string[]} [emphasisAreas] - Areas to emphasize
 * @property {'short' | 'standard' | 'detailed'} [length] - Desired length
 * @property {'basic' | 'strict' | 'thorough'} [validationLevel] - Content validation level
 * @property {boolean} [mockMode] - Whether to run in mock mode
 */

/** @type {Map<string, string>} */
const cache = new Map();
const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000;
const IS_TEST_MODE = process.env.NODE_ENV === 'test';

/** @type {OpenAI | undefined} */
let openaiClient;
try {
  if (!IS_TEST_MODE) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
  }
} catch (error) {
  const err = /** @type {Error} */ (error);
  console.warn('OpenAI client initialization failed:', err.message);
  console.warn('API functionality will be limited to prompt generation only.');
}

/**
 * Type guard for Skills object
 * @param {unknown} value - Value to check
 * @returns {value is Skills} Whether the value is a Skills object
 */
const isSkills = (value) => {
  return typeof value === 'object' && value !== null && 'skills_' in value;
};

/**
 * Type guard for Education array
 * @param {unknown} value - Value to check
 * @returns {value is Education[]} Whether the value is an Education array
 */
const isEducationArray = (value) => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null && 'endDate' in item
  );
};

/**
 * Detects the candidate's profile type based on resume content
 * @param {ResumeData} resumeData - Resume data
 * @returns {CandidateProfile} Detected profile type
 */
const detectCandidateProfile = (resumeData) => {
  const hasStrongExperience = (resumeData.workExperience?.length ?? 0) >= 3;
  
  const skills = resumeData.skills;
  const hasTechnicalSkills = isSkills(skills) && (
    skills.skills_.toLowerCase().includes('programming') ||
    skills.skills_.toLowerCase().includes('software')
  );
  
  const education = resumeData.education;
  const isRecentGraduate = isEducationArray(education) && education.some(edu => {
    if (!edu.endDate) return false;
    return new Date(edu.endDate).getFullYear() >= new Date().getFullYear() - 1;
  });

  if (hasStrongExperience) return 'EXPERIENCED';
  if (hasTechnicalSkills) return 'TECHNICAL';
  if (isRecentGraduate) return 'NEW_GRADUATE';
  return 'CAREER_CHANGER';
};

/**
 * Allocates content space based on section priorities
 * @param {Object.<string, import('./generation/content/contentAnalysis').SectionPriority>} sections
 * @returns {Object.<string, number>} Character limits per section
 */
const allocateContentSpace = (sections) => {
  const TOTAL_CHARS = 2500; // Standard cover letter length
  const MIN_SECTION_CHARS = 200;
  
  return Object.fromEntries(
    Object.entries(sections)
      .filter(([, priority]) => priority.allocationPercentage > 0)
      .map(([section, priority]) => [
        section,
        Math.max(
          MIN_SECTION_CHARS,
          Math.floor(TOTAL_CHARS * (priority.allocationPercentage / 100))
        )
      ])
  );
};

/**
 * Handles missing content sections with strategic alternatives
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @returns {Object.<string, string[]>} Alternative content strategies
 */
const handleContentGaps = (resumeData, jobDetails) => {
  /** @type {Object.<string, string[]>} */
  const strategies = {};
  
  if (!(resumeData.workExperience?.length ?? 0)) {
    strategies.experience = [
      'Focus on relevant projects and technical skills',
      'Emphasize academic achievements and internships',
      'Highlight volunteer work or personal projects'
    ];
  }
  
  if (!(resumeData.projects?.length ?? 0)) {
    strategies.projects = [
      'Emphasize hands-on experience from work',
      'Focus on technical skills and certifications',
      'Highlight relevant coursework and academic achievements'
    ];
  }
  
  return strategies;
};

/**
 * Generates a cover letter using OpenAI
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @param {GenerationOptions} [options] - Generation options
 * @returns {Promise<Object>} Generated cover letter with metadata
 */
const generateCoverLetter = async (resumeData, jobDetails, options = {}) => {
  // Validate inputs
  if (!resumeData) {
    throw new Error('Resume data is required');
  }
  if (!jobDetails?.company || !jobDetails?.jobTitle || !jobDetails?.jobDescription) {
    throw new Error('Job details must include company, jobTitle, and jobDescription');
  }

  if (IS_TEST_MODE && !options.mockMode) {
    return {
      content: "This is a mock cover letter for testing purposes.",
      metadata: {
        processingTime: 0,
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          metrics: {}
        }
      }
    };
  }
  
  const cacheKey = JSON.stringify({
    resumeId: resumeData.id,
    jobTitle: jobDetails.jobTitle,
    company: jobDetails.company,
    options,
    timestamp: new Date().toDateString()
  });
  
  if (cache.has(cacheKey)) {
    console.log('Returning cached cover letter');
    return {
      content: cache.get(cacheKey),
      metadata: {
        fromCache: true,
        timestamp: new Date().toDateString()
      }
    };
  }

  try {
    // Create a content generation function that uses OpenAI
    /** @type {(prompt: string) => Promise<string>} */
    const generateContent = async (prompt) => {
      const content = await makeAPIRequestWithRetry(prompt);
      if (!content) {
        throw new Error('Failed to generate content');
      }
      return content;
    };

    // Use the enhanced cover letter generation with our content generator
    const result = await generateEnhancedCoverLetter(resumeData, jobDetails, generateContent, options);
    
    // Only cache valid content
    if (result.metadata.validation.isValid) {
      cache.set(cacheKey, result.content);
    }
    
    return result;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw handleError(error);
  }
};

/**
 * Makes API request with retry logic
 * @param {string} prompt - Generation prompt
 * @param {number} [attempt] - Current attempt number
 * @returns {Promise<string|undefined>} Generated content or undefined
 */
const makeAPIRequestWithRetry = async (prompt, attempt = 1) => {
  if (IS_TEST_MODE) {
    return "This is a mock API response for testing purposes.";
  }
  
  try {
    if (!openaiClient) {
      throw new Error("OpenAI client not initialized.");
    }
    
    const completion = await openaiClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer who creates personalized, tailored cover letters. You NEVER include placeholder text or mention missing information. If data is unavailable, you gracefully work around it and focus on what IS available."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
    });

    const content = completion.choices[0]?.message?.content;
    return content === null ? undefined : content;
  } catch (error) {
    if (attempt < RETRY_LIMIT && shouldRetry(/** @type {any} */ (error))) {
      console.log(`Retrying API request, attempt ${attempt + 1}`);
      await delay(RETRY_DELAY * attempt);
      return makeAPIRequestWithRetry(prompt, attempt + 1);
    }
    throw error;
  }
};

/**
 * Checks if an error should trigger a retry
 * @param {{ status?: number }} error - Error object
 * @returns {boolean} Whether to retry
 */
const shouldRetry = (error) => {
  return error.status === 429 || (error.status ?? 0) >= 500;
};

/**
 * Handles API errors
 * @param {unknown} error - Error object
 * @returns {Error} Formatted error
 */
const handleError = (error) => {
  if (typeof error === 'object' && error !== null) {
    const typedError = /** @type {{ status?: number }} */ (error);
    if (typedError.status === 429) {
      return new Error('Rate limit exceeded. Please try again later.');
    }
    if (typedError.status === 401) {
      return new Error('Authentication error. Please check API key.');
    }
  }
  return new Error('Failed to generate cover letter. Please try again.');
};

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateCoverLetter,
  detectCandidateProfile,
  allocateContentSpace,
  handleContentGaps
}; 