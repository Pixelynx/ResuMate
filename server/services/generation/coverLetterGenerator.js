// @ts-check
const { selectOptimalContent } = require('./content/contentSelection');
const { validateContentAuthenticity } = require('./content/contentAuthenticity');
const { prioritizeContent } = require('./content/contentAnalysis');

/**
 * @typedef {import('../ai.service').ResumeData} ResumeData
 * @typedef {import('../ai.service').JobDetails} JobDetails
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether content is valid
 * @property {string[]} errors - List of validation errors
 * @property {string[]} warnings - List of validation warnings
 * @property {Object} metrics - Validation metrics
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
  
  // Extract actual experience details
  const workExperience = resumeData.workExperience || [];
  const latestExperience = workExperience[0] || {};
  const skills = resumeData.skills?.skills_ || '';
  const projects = resumeData.projects || [];

  // Calculate total years of experience
  const totalExperience = workExperience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);

  // Extract actual achievements
  const achievements = workExperience
    .map(exp => exp.description || '')
    .join('\n')
    .split('\n')
    .filter(line => line.includes('●'))
    .map(line => line.replace('●', '').trim());

  return `
    STRICT COVER LETTER GENERATION INSTRUCTIONS:
    
    USE ONLY THE FOLLOWING VERIFIED INFORMATION - DO NOT ADD ANY INFORMATION NOT LISTED BELOW:
    
    Work Experience:
    ${workExperience.map(exp => `
    - ${exp.title} at ${exp.company || 'Company'} (${exp.startDate} - ${exp.endDate || 'Present'})
    ${exp.description || ''}
    `).join('\n')}
    
    Total Years of Experience: ${Math.round(totalExperience * 10) / 10} years
    
    Verified Skills: ${skills}
    
    Projects:
    ${projects.map(proj => `
    - ${proj.title || 'Project'}
    ${proj.description || ''}
    `).join('\n')}
    
    Verified Achievements:
    ${achievements.slice(0, 3).join('\n')}
    
    Target Job:
    - Company: ${jobDetails.company}
    - Position: ${jobDetails.jobTitle}
    - Key Requirements: ${extractKeyRequirements(jobDetails.jobDescription)}
    
    IMPORTANT RULES:
    1. ONLY use information provided above - DO NOT make up or infer any details
    2. ONLY mention achievements that are explicitly listed
    3. DO NOT mention any companies or roles not listed in the work experience
    4. DO NOT add any skills not listed in the skills section
    5. DO NOT make up percentages or metrics not provided in the achievements
    6. If certain information is missing, focus on what IS available rather than making up details
    7. Maintain a professional tone while being strictly factual
    8. Format as a proper cover letter with greeting and signature
    9. Use actual metrics and numbers only when they appear in the achievements section
    
    Content Structure:
    ${contentPriority.suggestedOrder.map(section => 
      `- ${section} (${contentPriority.sections[section].allocationPercentage}% focus, ~${spaceAllocation[section]} chars)`
    ).join('\n    ')}
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
 * @param {Function} generateContent - Function to generate content using AI
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
    if (!jobDetails) {
      throw new Error('Job details are required');
    }
    if (!jobDetails.company || !jobDetails.jobTitle || !jobDetails.jobDescription) {
      throw new Error('Job details must include company, jobTitle, and jobDescription');
    }
    if (!generateContent || typeof generateContent !== 'function') {
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
      // Build enhancement prompt based on validation results
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
    console.error('Error generating enhanced cover letter:', error);
    throw new Error('Failed to generate enhanced cover letter: ' + error.message);
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