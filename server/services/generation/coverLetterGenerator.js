// @ts-check
const { selectOptimalContent } = require('./content/contentSelection');
const { validateContentAuthenticity } = require('./content/contentAuthenticity');

/**
 * @typedef {import('../ai.service').ResumeData} ResumeData
 * @typedef {import('../ai.service').JobDetails} JobDetails
 */

/**
 * @typedef {Object} Education
 * @property {string} endDate - End date of education
 */

/**
 * @typedef {Object} Skills
 * @property {string} skills_ - Comma-separated list of skills
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether content is valid
 * @property {string[]} errors - List of validation errors
 * @property {string[]} warnings - List of validation warnings
 * @property {ValidationMetrics} metrics - Validation metrics
 */

/**
 * @typedef {Object} ValidationMetrics
 * @property {number} specificity - Specificity score
 * @property {number} personalization - Personalization score
 * @property {number} completeness - Completeness score
 * @property {number} professionalism - Professionalism score
 */

/**
 * @typedef {Object} GenerationMetadata
 * @property {number} processingTime - Time taken to generate in ms
 * @property {ValidationResult} validation - Content validation results
 * @property {Object} contentMetrics - Content quality metrics
 * @property {string[]} enhancementSuggestions - Suggestions for improvement
 */

/**
 * @typedef {Object} GenerationResult
 * @property {string} content - Generated cover letter content
 * @property {GenerationMetadata} metadata - Generation metadata
 */

/** @type {Set<string>} */
const PLACEHOLDER_PATTERNS = new Set([
  '\\[.*?\\]',                    // [company name], [position]
  '\\{.*?\\}',                    // {company}, {role}
  '<.*?>',                        // <company>, <position>
  'the company',
  'this organization',
  'the role',
  'the position',
  'your company',
  'your organization'
]);

/** @type {Set<string>} */
const REQUIRED_ELEMENTS = new Set([
  'company',
  'position',
  'specific skills',
  'relevant experience',
  'achievements',
  'greeting',
  'closing'
]);

/**
 * Type guard for education array
 * @param {unknown} value - Value to check
 * @returns {boolean} Whether the value is an education array
 */
const isEducationArray = (value) => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null && 'endDate' in item
  );
};

/**
 * Type guard for skills object
 * @param {unknown} value - Value to check
 * @returns {boolean} Whether the value is a skills object
 */
const isSkills = (value) => {
  return typeof value === 'object' && value !== null && 'skills_' in value;
};

/**
 * Validates generated content for quality and completeness
 * @param {string} content - Generated content
 * @param {JobDetails} jobDetails - Job details
 * @returns {ValidationResult}
 */
const validateContent = (content, jobDetails) => {
  const errors = [];
  const warnings = [];
  const metrics = {
    specificity: 0,
    personalization: 0,
    completeness: 0,
    professionalism: 0
  };

  // Check for placeholders
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(content)) {
      errors.push(`Found placeholder pattern: ${pattern}`);
    }
  }

  // Check for required elements
  const lowerContent = content.toLowerCase();
  const companyMentioned = lowerContent.includes(jobDetails.company.toLowerCase());
  const titleMentioned = lowerContent.includes(jobDetails.jobTitle.toLowerCase());

  if (!companyMentioned) {
    errors.push('Company name not mentioned');
  }
  if (!titleMentioned) {
    errors.push('Job title not mentioned');
  }

  // Calculate metrics
  metrics.specificity = calculateSpecificityScore(content);
  metrics.personalization = calculatePersonalizationScore(content, jobDetails);
  metrics.completeness = calculateCompletenessScore(content);
  metrics.professionalism = calculateProfessionalismScore(content);

  // Add warnings for low metrics
  if (metrics.specificity < 0.7) {
    warnings.push('Content could be more specific');
  }
  if (metrics.personalization < 0.7) {
    warnings.push('Content could be more personalized');
  }

  return {
    isValid: errors.length === 0 && metrics.specificity >= 0.6 && metrics.personalization >= 0.6,
    errors,
    warnings,
    metrics
  };
};

/**
 * Calculates content specificity score
 * @param {string} content - Content to analyze
 * @returns {number} Specificity score (0-1)
 */
const calculateSpecificityScore = (content) => {
  const metrics = {
    specificTerms: (content.match(/\b(specifically|particularly|notably|achieved|improved|developed)\b/gi) || []).length,
    numbers: (content.match(/\d+%|\d+ years|\$\d+|\d+ projects/g) || []).length,
    properNouns: (content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || []).length
  };

  return Math.min(1, (
    (Math.min(1, metrics.specificTerms / 5) * 0.4) +
    (Math.min(1, metrics.numbers / 3) * 0.3) +
    (Math.min(1, metrics.properNouns / 5) * 0.3)
  ));
};

/**
 * Calculates content personalization score
 * @param {string} content - Content to analyze
 * @param {JobDetails} jobDetails - Job details
 * @returns {number} Personalization score (0-1)
 */
const calculatePersonalizationScore = (content, jobDetails) => {
  const lowerContent = content.toLowerCase();
  const lowerJobDesc = jobDetails.jobDescription.toLowerCase();

  const metrics = {
    companyMentions: (content.match(new RegExp(jobDetails.company, 'gi')) || []).length,
    titleMentions: (content.match(new RegExp(jobDetails.jobTitle, 'gi')) || []).length,
    keywordMatches: lowerJobDesc.split(/\W+/).filter(word => 
      word.length > 4 && lowerContent.includes(word)
    ).length
  };

  return Math.min(1, (
    (Math.min(1, metrics.companyMentions / 2) * 0.3) +
    (Math.min(1, metrics.titleMentions / 2) * 0.3) +
    (Math.min(1, metrics.keywordMatches / 10) * 0.4)
  ));
};

/**
 * Calculates content completeness score
 * @param {string} content - Content to analyze
 * @returns {number} Completeness score (0-1)
 */
const calculateCompletenessScore = (content) => {
  const sections = {
    introduction: /^.*?\n\n/,
    body: /\n\n.*?\n\n/,
    conclusion: /\n\n.*?$/
  };

  const metrics = {
    hasIntro: sections.introduction.test(content),
    hasBody: sections.body.test(content),
    hasConclusion: sections.conclusion.test(content),
    paragraphCount: (content.match(/\n\n/g) || []).length + 1,
    sentenceCount: (content.match(/[.!?]+\s/g) || []).length
  };

  return Math.min(1, (
    (metrics.hasIntro ? 0.2 : 0) +
    (metrics.hasBody ? 0.3 : 0) +
    (metrics.hasConclusion ? 0.2 : 0) +
    (Math.min(1, metrics.paragraphCount / 4) * 0.15) +
    (Math.min(1, metrics.sentenceCount / 12) * 0.15)
  ));
};

/**
 * Calculates professionalism score
 * @param {string} content - Content to analyze
 * @returns {number} Professionalism score (0-1)
 */
const calculateProfessionalismScore = (content) => {
  const metrics = {
    formalLanguage: (content.match(/\b(sincerely|appreciate|opportunity|experience|professional|expertise)\b/gi) || []).length,
    informalLanguage: (content.match(/\b(cool|awesome|great|huge|basically|really|very)\b/gi) || []).length,
    properFormatting: /^Dear.*?\n\n.*?\n\nSincerely,?\n/is.test(content)
  };

  return Math.min(1, (
    (Math.min(1, metrics.formalLanguage / 5) * 0.4) +
    (Math.max(0, 1 - metrics.informalLanguage / 3) * 0.3) +
    (metrics.properFormatting ? 0.3 : 0)
  ));
};

/**
 * Custom error class for prompt generation failures
 * @extends Error
 */
class PromptGenerationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'PromptGenerationError';
    this.details = details;
  }
}

/**
 * Validates and formats personal details from resume data
 * @param {import('../ai.service').ResumeData} resumeData - Resume data object
 * @throws {PromptGenerationError} If required personal details are missing
 * @returns {string} Formatted personal details section
 */
const buildPersonalDetailsSection = (resumeData) => {
  const {
    personalDetails,
    title: resumeTitle
  } = resumeData;

  // Get firstName and lastName from personalDetails
  const firstName = personalDetails?.firstname;
  const lastName = personalDetails?.lastname;

  // Validate required fields
  const missingFields = [];
  if (!firstName) missingFields.push('firstName');
  if (!lastName) missingFields.push('lastName');

  if (missingFields.length > 0) {
    throw new PromptGenerationError('Missing required personal details', {
      missingFields,
      resumeData
    });
  }

  const professionalTitle = personalDetails?.title || resumeTitle || `${firstName} ${lastName}`;

  return `
    CANDIDATE DETAILS:
    Full Name: ${firstName} ${lastName}
    Professional Title: ${professionalTitle}
    ${personalDetails?.email ? `Email: ${personalDetails.email}` : ''}
    ${personalDetails?.phone ? `Phone: ${personalDetails.phone}` : ''}

    USE THESE EXACT DETAILS - DO NOT MODIFY OR USE PLACEHOLDERS
  `;
};

/**
 * Processes and formats work experience based on relevance to job
 * @param {import('../ai.service').ResumeData} resumeData - Resume data
 * @param {import('../ai.service').JobDetails} jobDetails - Job details
 * @returns {string} Formatted experience section
 */
const buildExperienceSection = (resumeData, jobDetails) => {
  if (!resumeData.workExperience?.length) {
    return `
      EXPERIENCE CONTEXT:
      Candidate is new to the workforce or transitioning careers.
      Focus on transferable skills, education, and projects instead of direct work experience.
    `;
    }

    // Sort experiences by relevance and recency
    const sortedExperience = [...resumeData.workExperience].sort((a, b) => {
      const dateA = new Date(a.endDate || Date.now());
      const dateB = new Date(b.endDate || Date.now());
      return dateB.getTime() - dateA.getTime();
    });

    const experienceDetails = sortedExperience.map(exp => `
      Position: ${exp.jobtitle}
      Company: ${exp.companyName}
      ${exp.startDate ? `Duration: ${exp.startDate} to ${exp.endDate || 'Present'}` : ''}
      Key Responsibilities:
      ${exp.description}
    `).join('\n');

    return `
      RELEVANT EXPERIENCE:
      Use these specific experiences - DO NOT generalize or use placeholders.
      ${experienceDetails}

      EXPERIENCE GUIDELINES:
      - Reference specific company names and roles
      - Include actual dates and durations
      - Use concrete achievements and metrics from the descriptions
      - Maintain professional tone while being specific
    `;
};

/**
 * Maps and formats skills based on job requirements
 * @param {import('../ai.service').ResumeData} resumeData - Resume data
 * @param {import('../ai.service').JobDetails} jobDetails - Job details
 * @returns {string} Formatted skills section
 */
const buildSkillsSection = (resumeData, jobDetails) => {
  if (!resumeData.skills?.skills_) {
    return `
      SKILLS CONTEXT:
      Focus on demonstrating capabilities through experience and projects.
      Emphasize learning ability and adaptability.
    `;
    }

    const skills = resumeData.skills.skills_.split(',').map(s => s.trim());
        
    return `
      TECHNICAL AND PROFESSIONAL SKILLS:
      ${skills.join(', ')}

      SKILLS USAGE GUIDELINES:
      - Reference these exact skills when relevant to the position
      - Demonstrate practical application in experience or projects
      - Do not invent or assume additional skills
      - Connect skills directly to job requirements
    `;
  };

/**
 * Builds enhanced prompt with strict data usage rules
 * @param {import('../ai.service').ResumeData} resumeData - Resume data
 * @param {import('../ai.service').JobDetails} jobDetails - Job details
 * @param {import('../ai.service').GenerationOptions} [options] - Generation options
 * @returns {string} Complete generation prompt
 */
const buildEnhancedPrompt = (resumeData, jobDetails, options = {}) => {
  // Validate inputs
  if (!resumeData || !jobDetails) {
    throw new PromptGenerationError('Missing required data', {
      hasResumeData: !!resumeData,
      hasJobDetails: !!jobDetails
    });
  }

  const personalDetails = buildPersonalDetailsSection(resumeData);
  const experienceSection = buildExperienceSection(resumeData, jobDetails);
  const skillsSection = buildSkillsSection(resumeData, jobDetails);

  return `
    You are a professional cover letter writer creating a personalized letter.
    Your task is to write a compelling cover letter using ONLY the provided information.

    JOB DETAILS:
    Company: ${jobDetails.company}
    Position: ${jobDetails.jobTitle}
    Description: ${jobDetails.jobDescription}

    ${personalDetails}

    ${experienceSection}

    ${skillsSection}

    STRICT REQUIREMENTS:
    1. NEVER use placeholder text like [Company Name] or [Your Name]
    2. NEVER mention missing information or gaps
    3. ONLY use details provided above
    4. Maintain professional tone
    5. Focus on specific, relevant experiences
    6. Include measurable achievements where available

    FORBIDDEN ELEMENTS:
    - Generic phrases like "I am writing to express my interest"
    - Placeholder text in brackets or parentheses
    - Hypothetical or assumed experiences
    - Unsubstantiated claims

    TONE AND STYLE:
    ${options.tone ? `- Maintain a ${options.tone} tone` : '- Maintain a professional, confident tone'}
    - Be specific and direct
    - Show enthusiasm through concrete examples
    - Demonstrate understanding of the company and role

    FORMAT:
    - Standard business letter format
    - 2-3 focused paragraphs
    - Clear opening and closing
    - Professional signature with provided contact details

    Remember: Quality over quantity. Be specific and relevant rather than comprehensive.
  `;
};

/**
 * Generates enhanced cover letter with validation
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @param {(prompt: string) => Promise<string>} generateContent - Function to generate content using AI
 * @param {Object} [options] - Generation options
 * @returns {Promise<GenerationResult>} Generated cover letter with metadata
 */
const generateEnhancedCoverLetter = async (resumeData, jobDetails, generateContent, options = {}) => {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!resumeData) {
      throw new Error('Resume data is required');
    }
    if (!jobDetails?.company || !jobDetails?.jobTitle || !jobDetails?.jobDescription) {
      throw new Error('Job details must include company, jobTitle, and jobDescription');
    }
    if (typeof generateContent !== 'function') {
      throw new Error('Content generation function is required');
    }

    const prompt = buildEnhancedPrompt(resumeData, jobDetails, options);
    
    const initialContent = await generateContent(prompt);
    
    const validation = validateContent(initialContent, jobDetails);
    
    // Enhancement if needed
    let finalContent = initialContent;
    if (!validation.isValid) {
      const enhancementPrompt = buildEnhancementPrompt(initialContent, validation, jobDetails);
      finalContent = await generateContent(enhancementPrompt);
    }

    const finalValidation = validateContent(finalContent, jobDetails);
    
    return {
      content: finalContent,
      metadata: {
        processingTime: Date.now() - startTime,
        validation: finalValidation,
        contentMetrics: {
          specificity: calculateSpecificityScore(finalContent),
          personalization: calculatePersonalizationScore(finalContent, jobDetails),
          completeness: calculateCompletenessScore(finalContent)
        },
        enhancementSuggestions: finalValidation.warnings
      }
    };
  } catch (error) {
    console.error('Error generating enhanced cover letter:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Unknown error in cover letter generation');
  }
};

/**
 * Builds a prompt for enhancing content based on validation results
 * @param {string} content - Original content
 * @param {ValidationResult} validation - Validation results
 * @param {JobDetails} jobDetails - Job details
 * @returns {string} Enhancement prompt
 */
const buildEnhancementPrompt = (content, validation, jobDetails) => {
  return `
    ENHANCE THE FOLLOWING COVER LETTER:
    
    Original Content:
    ${content}
    
    Required Improvements:
    ${validation.errors.map(error => `- Fix: ${error}`).join('\n')}
    
    Suggested Enhancements:
    ${validation.warnings.map(warning => `- Enhance: ${warning}`).join('\n')}
    
    Job Details:
    - Company: ${jobDetails.company}
    - Position: ${jobDetails.jobTitle}
    
    Requirements:
    - Maintain professional tone
    - Keep specific achievements and skills
    - Ensure proper formatting
    - Address all validation errors
    - Incorporate enhancement suggestions
  `;
};

module.exports = {
  generateEnhancedCoverLetter,
  validateContent,
  calculateSpecificityScore,
  calculatePersonalizationScore,
  calculateCompletenessScore,
  calculateProfessionalismScore,
  buildEnhancedPrompt
}; 