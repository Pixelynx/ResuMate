// @ts-check
const { OpenAI } = require('openai');
const { generateEnhancedCoverLetter } = require('./generation/coverLetterGenerator');
const compatibilityAssessment = require('./assessment/CompatibilityAssessment');

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

  try {
    console.log('\n=== Starting Compatibility Assessment ===');
    console.log(`Job Title: ${jobDetails.jobTitle}`);
    console.log(`Company: ${jobDetails.company}`);
    
    // Perform compatibility assessment
    const assessment = await compatibilityAssessment.assessJobCompatibility(resumeData, jobDetails);
    
    console.log('\n=== Assessment Results ===');
    console.log(`Overall Compatibility Score: ${assessment.compatibilityScore}%`);
    console.log(`Is Compatible: ${assessment.isCompatible}`);
    
    if (assessment.metadata.skillsMatch?.length > 0) {
      console.log('\nMatched Skills:', assessment.metadata.skillsMatch.join(', '));
    }
    
    if (assessment.metadata.missingCriticalSkills?.length > 0) {
      console.log('\nMissing Critical Skills:', assessment.metadata.missingCriticalSkills.join(', '));
    }

    console.log('\nDetailed Assessment:');
    if (assessment.metadata.assessmentDetails) {
      Object.entries(assessment.metadata.assessmentDetails).forEach(([criterion, score]) => {
        console.log(`- ${criterion}: ${score}%`);
      });
    }

    // If incompatible, return structured response with compatibility details
    if (!assessment.isCompatible) {
      console.log('\n=== Compatibility Blockers ===');
      assessment.suggestions.forEach(suggestion => {
        console.log(`[${suggestion.severity.toUpperCase()}] ${suggestion.type}: ${suggestion.message}`);
      });

      return {
        success: true,
        isCompatible: false,
        blockers: assessment.suggestions.map(suggestion => ({
          type: suggestion.type,
          message: suggestion.message,
          severity: suggestion.severity
        })),
        compatibilityScore: assessment.compatibilityScore,
        metadata: {
          ...assessment.metadata,
          timestamp: new Date().toISOString()
        }
      };
    }

    console.log('\n=== Proceeding with Cover Letter Generation ===');

    // Continue with generation only if compatible
    if (IS_TEST_MODE && !options.mockMode) {
      return {
        success: true,
        isCompatible: true,
        content: "This is a mock cover letter for testing purposes.",
        metadata: {
          processingTime: 0,
          validation: {
            isValid: true,
            errors: [],
            warnings: [],
            metrics: {}
          },
          compatibility: assessment
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
        success: true,
        isCompatible: true,
        content: cache.get(cacheKey),
        metadata: {
          fromCache: true,
          timestamp: new Date().toDateString(),
          compatibility: assessment
        }
      };
    }

    try {
      const result = await generateEnhancedCoverLetter(resumeData, jobDetails, makeAPIRequestWithRetry, options);
      
      if (result.metadata.validation.isValid) {
        cache.set(cacheKey, result.content);
      }
      
      return {
        success: true,
        isCompatible: true,
        content: result.content,
        metadata: {
          ...result.metadata,
          compatibility: assessment
        }
      };
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw handleError(error);
    }
  } catch (error) {
    console.error('Error in cover letter generation:', error);
    throw error;
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
  detectCandidateProfile,
  allocateContentSpace,
  handleContentGaps
}; 