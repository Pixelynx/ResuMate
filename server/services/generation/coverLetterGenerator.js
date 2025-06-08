// @ts-check
const { selectOptimalContent } = require('./content/contentSelection');
const { validateContentAuthenticity } = require('./content/contentAuthenticity');
const { prioritizeContent } = require('./content/contentAnalysis');

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
 * Builds dynamic prompt based on content analysis
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @param {import('./content/contentAnalysis').ContentAllocation} contentPriority
 * @returns {string} Generated prompt
 */
const buildDynamicPrompt = (resumeData, jobDetails, contentPriority) => {
  const profile = detectCandidateProfile(resumeData);
  const spaceAllocation = allocateContentSpace(contentPriority.sections);
  
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
    
    Job Details:
    - Company: ${jobDetails.company}
    - Position: ${jobDetails.jobTitle}
    - Key Requirements: ${extractKeyRequirements(jobDetails.jobDescription)}
    
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
 * Extracts key requirements from job description
 * @param {string} description - Job description
 * @returns {string} Extracted requirements
 */
const extractKeyRequirements = (description) => {
  const requirements = description
    .split(/[.!?]/)
    .filter(sentence => 
      /require|must|should|need|essential|qualification|experience/i.test(sentence)
    )
    .map(req => req.trim())
    .filter(Boolean)
    .slice(0, 5);  // Take top 5 requirements

  return requirements.length > 0 
    ? requirements.join('. ') 
    : 'No specific requirements extracted';
};

/**
 * Detects candidate profile type
 * @param {ResumeData} resumeData - Resume data
 * @returns {'EXPERIENCED' | 'TECHNICAL' | 'CAREER_CHANGER' | 'NEW_GRADUATE'} Profile type
 */
const detectCandidateProfile = (resumeData) => {
  const hasStrongExperience = (resumeData.workExperience?.length ?? 0) >= 3;
  
  const skills = resumeData.skills || {};
  const hasTechnicalSkills = isSkills(skills) && (
    /** @type {Skills} */ (skills).skills_.toLowerCase().includes('programming') ||
    /** @type {Skills} */ (skills).skills_.toLowerCase().includes('software')
  );
  
  const education = resumeData.education || [];
  const isRecentGraduate = isEducationArray(education) && education.some(edu => {
    const typedEdu = /** @type {Education} */ (edu);
    if (!typedEdu.endDate) return false;
    return new Date(typedEdu.endDate).getFullYear() >= new Date().getFullYear() - 1;
  });

  if (hasStrongExperience) return 'EXPERIENCED';
  if (hasTechnicalSkills) return 'TECHNICAL';
  if (isRecentGraduate) return 'NEW_GRADUATE';
  return 'CAREER_CHANGER';
};

/**
 * Allocates content space based on section priorities
 * @param {Object.<string, import('./content/contentAnalysis').SectionPriority>} sections
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

    // Step 1: Content Analysis and Selection
    const selectedContent = selectOptimalContent(resumeData, jobDetails);
    const contentPriority = prioritizeContent(resumeData, jobDetails);
    
    // Step 2: Content Authenticity Validation
    const isAuthentic = validateContentAuthenticity(resumeData);
    if (!isAuthentic) {
      throw new Error('Resume content authenticity validation failed');
    }

    // Step 3: Generate Initial Content
    const prompt = buildDynamicPrompt(resumeData, jobDetails, contentPriority);
    const initialContent = await generateContent(prompt);
    
    // Step 4: Validate Generated Content
    const validation = validateContent(initialContent, jobDetails);
    
    // Step 5: Enhancement if needed
    let finalContent = initialContent;
    if (!validation.isValid) {
      const enhancementPrompt = buildEnhancementPrompt(initialContent, validation, jobDetails);
      finalContent = await generateContent(enhancementPrompt);
    }

    // Step 6: Final Validation
    const finalValidation = validateContent(finalContent, jobDetails);
    
    return {
      content: finalContent,
      metadata: {
        processingTime: Date.now() - startTime,
        validation: finalValidation,
        contentMetrics: selectedContent.metrics,
        enhancementSuggestions: finalValidation.warnings
      }
    };
  } catch (error) {
    console.error('Error generating enhanced cover letter:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error(`Failed to generate enhanced cover letter: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  buildDynamicPrompt
}; 