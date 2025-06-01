// @ts-check
const { OpenAI } = require('openai');
const { prioritizeContent } = require('./generation/content/contentAnalysis');

/**
 * @typedef {Object} ResumeData
 * @property {Object} [personalDetails]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [title]
 * @property {Array<Object>} [workExperience]
 * @property {Array<Object>} [education]
 * @property {Object} [skills]
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

/** @type {Map<string, string>} */
const cache = new Map();
const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000;
const IS_TEST_MODE = process.env.NODE_ENV === 'test';

let openaiClient;
try {
  if (!IS_TEST_MODE) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error.message);
  console.warn('API functionality will be limited to prompt generation only.');
}

/**
 * Detects the candidate's profile type based on resume content
 * @param {ResumeData} resumeData - Resume data
 * @returns {CandidateProfile} Detected profile type
 */
const detectCandidateProfile = (resumeData) => {
  const hasStrongExperience = (resumeData.workExperience?.length ?? 0) >= 3;
  const hasTechnicalSkills = resumeData.skills?.skills_?.toLowerCase().includes('programming') ||
    resumeData.skills?.skills_?.toLowerCase().includes('software');
  const isRecentGraduate = resumeData.education?.some(edu => 
    edu.endDate && new Date(edu.endDate).getFullYear() >= new Date().getFullYear() - 1
  );

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
 * Builds dynamic prompt based on content analysis
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @param {import('./generation/content/contentAnalysis').ContentAllocation} contentPriority
 * @returns {string} Generated prompt
 */
const buildDynamicPrompt = (resumeData, jobDetails, contentPriority) => {
  const profile = detectCandidateProfile(resumeData);
  const spaceAllocation = allocateContentSpace(contentPriority.sections);
  const gapStrategies = handleContentGaps(resumeData, jobDetails);
  
  const profileGuidance = {
    EXPERIENCED: 'Emphasize career progression and key achievements',
    TECHNICAL: 'Focus on technical expertise and project implementations',
    CAREER_CHANGER: 'Highlight transferable skills and relevant projects',
    NEW_GRADUATE: 'Emphasize academic projects and technical capabilities'
  }[profile];

  return `
    DYNAMIC COVER LETTER GENERATION INSTRUCTIONS:
    
    Profile Type: ${profile}
    Primary Strategy: ${profileGuidance}
    
    Content Priority Structure:
    ${contentPriority.suggestedOrder.map(section => 
      `- ${section} (${contentPriority.sections[section].allocationPercentage}% focus, ~${spaceAllocation[section]} chars)`
    ).join('\n    ')}
    
    Section-Specific Guidance:
    ${Object.entries(contentPriority.sections)
      .filter(([, priority]) => priority.tier === 'PRIMARY')
      .map(([section, priority]) => `
    ${section}:
    - Focus Points: ${priority.focusPoints.join(', ')}
    - Key Transitions: "${priority.suggestedTransitions[0]}"
    - Emphasis Keywords: ${contentPriority.emphasisKeywords[section].join(', ')}
    `).join('\n')}
    
    ${Object.entries(gapStrategies).length > 0 ? `
    Gap Compensation Strategies:
    ${Object.entries(gapStrategies)
      .map(([section, strategies]) => `
    ${section}:
    ${strategies.map(strategy => `- ${strategy}`).join('\n    ')}
    `).join('\n')}
    ` : ''}
    
    Content Quality Requirements:
    - Only include sections meeting quality thresholds
    - Maintain natural flow between sections
    - Use provided transition phrases
    - Focus on concrete examples and metrics
    - Adapt tone to match company culture
    
    DO NOT:
    - Include placeholder text
    - Mention missing information
    - Exceed allocated section lengths
    - Use generic statements without context
  `;
};

/**
 * Generates a cover letter using OpenAI
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @param {Object} [options] - Generation options
 */
const generateCoverLetter = async (resumeData, jobDetails, options = {}) => {
  if (IS_TEST_MODE && !options.mockMode) {
    return "This is a mock cover letter for testing purposes.";
  }
  
  const cacheKey = JSON.stringify({
    resumeId: resumeData.id,
    jobTitle: jobDetails.jobTitle,
    company: jobDetails.company,
    timestamp: new Date().toDateString()
  });
  
  if (cache.has(cacheKey)) {
    console.log('Returning cached cover letter');
    return cache.get(cacheKey);
  }

  try {
    const contentPriority = prioritizeContent(resumeData, jobDetails);
    const prompt = buildDynamicPrompt(resumeData, jobDetails, contentPriority);
    
    if (IS_TEST_MODE && options.mockMode === 'prompt') {
      return prompt;
    }
    
    const response = await makeAPIRequestWithRetry(prompt);
    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw handleError(error);
  }
};

/**
 * Makes API request with retry logic
 * @param {string} prompt - Generation prompt
 * @param {number} [attempt] - Current attempt number
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

    return completion.choices[0].message.content;
  } catch (error) {
    if (attempt < RETRY_LIMIT && shouldRetry(error)) {
      console.log(`Retrying API request, attempt ${attempt + 1}`);
      await delay(RETRY_DELAY * attempt);
      return makeAPIRequestWithRetry(prompt, attempt + 1);
    }
    throw error;
  }
};

const shouldRetry = (error) => {
  return error.status === 429 || error.status >= 500;
};

const handleError = (error) => {
  if (error.status === 429) {
    return new Error('Rate limit exceeded. Please try again later.');
  }
  if (error.status === 401) {
    return new Error('Authentication error. Please check API key.');
  }
  return new Error('Failed to generate cover letter. Please try again.');
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateCoverLetter,
  buildDynamicPrompt,
  detectCandidateProfile,
  allocateContentSpace,
  handleContentGaps
}; 