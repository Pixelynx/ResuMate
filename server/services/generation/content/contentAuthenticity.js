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
 * @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} fieldOfStudy - Field of study
 * @property {string} [startDate] - Start date
 * @property {string} [endDate] - End date
 */

/**
 * @typedef {Object} Skills
 * @property {string} skills_ - Comma-separated list of skills
 */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} [technologies] - Technologies used
 */

/**
 * @typedef {Object} ContentAvailability
 * @property {boolean} hasWorkExperience
 * @property {boolean} hasProjects
 * @property {boolean} hasSkills
 * @property {boolean} hasEducation
 * @property {Object.<string, number>} contentStrengths
 */

/**
 * @typedef {Object} GapCompensation
 * @property {string[]} emphasizedAreas - Areas to emphasize
 * @property {string[]} transitionStrategies - Strategies for smooth transitions
 * @property {Record<string, string>} alternativeHighlights - Alternative content to highlight
 */

/**
 * @typedef {Object} AuthenticityMetrics
 * @property {number} timelineConsistency - Score for timeline consistency
 * @property {number} skillConsistency - Score for skill consistency
 * @property {number} achievementRealism - Score for achievement realism
 * @property {number} overallAuthenticity - Combined authenticity score
 */

/**
 * @typedef {Object} PersonalDetails
 * @property {string} [title] - Professional title
 * @property {string} [linkedIn] - LinkedIn profile URL
 * @property {string} [portfolio] - Portfolio URL
 * @property {string} [location] - Location information
 */

/**
 * @typedef {Object} PersonalDetailsValidation
 * @property {boolean} isValid - Whether validation passed
 * @property {ValidationIssue[]} issues - List of validation issues
 * @property {string[]} suggestions - Improvement suggestions
 * @property {number} score - Validation score (0-1)
 */

/**
 * @typedef {Object} ValidationIssue
 * @property {string} type - Issue type (placeholder, format, missing, etc.)
 * @property {string} message - Detailed issue description
 * @property {string} location - Where in content issue was found
 * @property {string} severity - Issue severity (error, warning, info)
 */

/**
 * @typedef {Object} PlaceholderDetectionResult
 * @property {ValidationIssue[]} issues - Detected placeholder issues
 * @property {number} severityScore - Overall severity score (0-1)
 * @property {Map<string, string[]>} locations - Map of placeholder types to their locations
 */

/**
 * @typedef {Object} ContactValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {ValidationIssue[]} issues - List of validation issues
 * @property {Object} metrics - Validation metrics
 */

/**
 * Type guard for work experience array
 * @param {unknown} value - Value to check
 * @returns {value is WorkExperience[]} Whether the value is a work experience array
 */
const isWorkExperienceArray = (value) => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null &&
    'jobTitle' in item && 'description' in item
  );
};

/**
 * Type guard for education array
 * @param {unknown} value - Value to check
 * @returns {value is Education[]} Whether the value is an education array
 */
const isEducationArray = (value) => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null &&
    'degree' in item && 'fieldOfStudy' in item
  );
};

/**
 * Type guard for skills object
 * @param {unknown} value - Value to check
 * @returns {value is Skills} Whether the value is a skills object
 */
const isSkills = (value) => {
  return typeof value === 'object' && value !== null && 'skills_' in value;
};

/**
 * Type guard for project array
 * @param {unknown} value - Value to check
 * @returns {value is Project[]} Whether the value is a project array
 */
const isProjectArray = (value) => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null &&
    'title' in item && 'description' in item
  );
};

/**
 * Analyzes content availability and authenticity
 * @param {ResumeData} resumeData - Resume data
 * @returns {ContentAvailability}
 */
const analyzeContentAvailability = (resumeData) => {
  const workExperience = resumeData.workExperience || [];
  const projects = resumeData.projects || [];
  const skills = resumeData.skills || {};
  const education = resumeData.education || [];

  const hasWorkExperience = isWorkExperienceArray(workExperience) && workExperience.length > 0;
  const hasProjects = isProjectArray(projects) && projects.length > 0;
  const hasSkills = isSkills(skills) && Boolean(skills.skills_);
  const hasEducation = isEducationArray(education) && education.length > 0;

  // Calculate content strength scores (0-1)
  const contentStrengths = {
    workExperience: hasWorkExperience ? calculateSectionStrength(workExperience) : 0,
    projects: hasProjects ? calculateSectionStrength(projects) : 0,
    skills: hasSkills ? calculateSkillsStrength(skills.skills_) : 0,
    education: hasEducation ? calculateSectionStrength(education) : 0
  };

  return {
    hasWorkExperience,
    hasProjects,
    hasSkills,
    hasEducation,
    contentStrengths
  };
};

/**
 * Calculates strength of a resume section
 * @param {Array<WorkExperience | Project | Education>} sectionData - Section data array
 * @returns {number} Section strength score (0-1)
 */
const calculateSectionStrength = (sectionData) => {
  if (!sectionData?.length) return 0;

  const metrics = sectionData.map(item => ({
    length: String('description' in item ? item.description : '').length,
    details: (String('description' in item ? item.description : '').match(/\b\d+%|\d+ years|\$\d+|\d+ projects/g) || []).length,
    keywords: (String('description' in item ? item.description : '').match(/\b(developed|managed|created|improved|led)\b/gi) || []).length
  }));

  const avgScore = metrics.reduce((sum, m) => 
    sum + (
      Math.min(1, m.length / 200) * 0.4 +
      Math.min(1, m.details / 2) * 0.3 +
      Math.min(1, m.keywords / 3) * 0.3
    ), 0) / metrics.length;

  return Math.min(1, avgScore);
};

/**
 * Calculates strength of skills section
 * @param {string} skills - Skills string
 * @returns {number} Skills strength score (0-1)
 */
const calculateSkillsStrength = (skills) => {
  if (!skills) return 0;

  const skillsList = skills.split(',').map(s => s.trim());
  const metrics = {
    count: skillsList.length,
    specificity: skillsList.filter(s => 
      /\b(advanced|expert|proficient|certified|specialized)\b/i.test(s)
    ).length
  };

  return Math.min(1, (
    Math.min(1, metrics.count / 10) * 0.7 +
    Math.min(1, metrics.specificity / 3) * 0.3
  ));
};

/**
 * Generates compensation strategies for missing content
 * @param {ContentAvailability} availability - Content availability analysis
 * @param {JobDetails} jobDetails - Job details
 * @returns {GapCompensation}
 */
const compensateForGaps = (availability, jobDetails) => {
  /** @type {string[]} */
  const emphasizedAreas = [];
  /** @type {string[]} */
  const transitionStrategies = [];
  /** @type {Record<string, string>} */
  const alternativeHighlights = {};

  // Identify strongest sections to emphasize
  const sortedStrengths = Object.entries(availability.contentStrengths)
    .sort(([, a], [, b]) => b - a);

  // Only emphasize sections with meaningful content
  const validStrengths = sortedStrengths.filter(([, score]) => score > 0.3);

  if (validStrengths.length === 0) {
    return {
      emphasizedAreas: [],
      transitionStrategies: ['Focus on aspirations and learning potential'],
      alternativeHighlights: {}
    };
  }

  // Build compensation strategies
  validStrengths.forEach(([section, score]) => {
    if (score > 0.6) {
      emphasizedAreas.push(section);
    }
  });

  // Generate transition strategies
  if (!availability.hasWorkExperience) {
    if (availability.hasProjects) {
      transitionStrategies.push('Lead with relevant projects');
      alternativeHighlights['experience'] = 'project_achievements';
    } else if (availability.hasEducation) {
      transitionStrategies.push('Emphasize academic achievements');
      alternativeHighlights['experience'] = 'academic_experience';
    }
  }

  if (!availability.hasProjects && availability.hasWorkExperience) {
    transitionStrategies.push('Focus on work achievements');
    alternativeHighlights['projects'] = 'work_implementations';
  }

  return {
    emphasizedAreas,
    transitionStrategies,
    alternativeHighlights
  };
};

/**
 * Validates the authenticity of resume content
 * @param {ResumeData} resumeData - Resume data to validate
 * @returns {boolean} Whether content is authentic
 */
const validateContentAuthenticity = (resumeData) => {
  const metrics = calculateAuthenticityMetrics(resumeData);
  return metrics.overallAuthenticity >= 0.7;
};

/**
 * Calculates authenticity metrics for resume content
 * @param {ResumeData} resumeData - Resume data to analyze
 * @returns {AuthenticityMetrics} Authenticity metrics
 */
const calculateAuthenticityMetrics = (resumeData) => {
  const timelineConsistency = validateTimelineConsistency(resumeData);
  const skillConsistency = validateSkillConsistency(resumeData);
  const achievementRealism = validateAchievementRealism(resumeData);
  
  const overallAuthenticity = (
    timelineConsistency * 0.4 +
    skillConsistency * 0.3 +
    achievementRealism * 0.3
  );

  return {
    timelineConsistency,
    skillConsistency,
    achievementRealism,
    overallAuthenticity
  };
};

/**
 * Validates timeline consistency across resume sections
 * @param {ResumeData} resumeData - Resume data to validate
 * @returns {number} Timeline consistency score (0-1)
 */
const validateTimelineConsistency = (resumeData) => {
  const timelineIssues = [];
  
  // Check work experience timeline
  const workExperience = resumeData.workExperience || [];
  if (isWorkExperienceArray(workExperience) && workExperience.length > 1) {
    for (let i = 1; i < workExperience.length; i++) {
      const current = new Date(workExperience[i].startDate || '');
      const previous = new Date(workExperience[i-1].endDate || Date.now());
      
      if (current > previous) {
        timelineIssues.push('Overlapping work experience dates');
      }
    }
  }
  
  // Check education timeline
  const education = resumeData.education || [];
  if (isEducationArray(education) && education.length > 1) {
    for (let i = 1; i < education.length; i++) {
      const current = new Date(education[i].startDate || '');
      const previous = new Date(education[i-1].endDate || Date.now());
      
      if (current > previous) {
        timelineIssues.push('Overlapping education dates');
      }
    }
  }
  
  // Check for future dates
  const now = new Date();
  const futureIssues = [
    ...(isWorkExperienceArray(workExperience) ? 
      workExperience.filter(exp => new Date(exp.startDate || '') > now) : []),
    ...(isEducationArray(education) ? 
      education.filter(edu => new Date(edu.startDate || '') > now) : [])
  ];
  
  if (futureIssues.length > 0) {
    timelineIssues.push('Future dates detected');
  }
  
  return Math.max(0, 1 - (timelineIssues.length * 0.2));
};

/**
 * Validates skill consistency across resume sections
 * @param {ResumeData} resumeData - Resume data to validate
 * @returns {number} Skill consistency score (0-1)
 */
const validateSkillConsistency = (resumeData) => {
  const skills = resumeData.skills || {};
  if (!isSkills(skills)) return 0.5; // Default if no skills
  
  const declaredSkills = new Set(
    skills.skills_.toLowerCase().split(',').map(s => s.trim())
  );
  
  // Extract skills mentioned in experience
  const experienceSkills = new Set();
  const workExperience = resumeData.workExperience || [];
  if (isWorkExperienceArray(workExperience)) {
    workExperience.forEach(exp => {
      const skills = extractSkillsFromText(exp.description);
      skills.forEach(skill => experienceSkills.add(skill));
    });
  }
  
  // Extract skills mentioned in projects
  const projectSkills = new Set();
  const projects = resumeData.projects || [];
  if (isProjectArray(projects)) {
    projects.forEach(proj => {
      const skills = extractSkillsFromText(proj.description);
      skills.forEach(skill => projectSkills.add(skill));
    });
  }
  
  // Calculate consistency scores
  const experienceConsistency = calculateSetOverlap(declaredSkills, experienceSkills);
  const projectConsistency = calculateSetOverlap(declaredSkills, projectSkills);
  
  return (experienceConsistency * 0.6 + projectConsistency * 0.4);
};

/**
 * Validates realism of achievements in resume
 * @param {ResumeData} resumeData - Resume data to validate
 * @returns {number} Achievement realism score (0-1)
 */
const validateAchievementRealism = (resumeData) => {
  const achievementIssues = [];
  
  // Check work experience achievements
  const workExperience = resumeData.workExperience || [];
  if (isWorkExperienceArray(workExperience)) {
    workExperience.forEach(exp => {
      const metrics = extractMetricsFromText(exp.description);
      
      metrics.forEach(metric => {
        if (!isMetricRealistic(metric)) {
          achievementIssues.push(`Unrealistic metric: ${metric}`);
        }
      });
    });
  }
  
  // Check project achievements
  const projects = resumeData.projects || [];
  if (isProjectArray(projects)) {
    projects.forEach(proj => {
      const metrics = extractMetricsFromText(proj.description);
      
      metrics.forEach(metric => {
        if (!isMetricRealistic(metric)) {
          achievementIssues.push(`Unrealistic metric: ${metric}`);
        }
      });
    });
  }
  
  return Math.max(0, 1 - (achievementIssues.length * 0.15));
};

/**
 * Extracts skills from text content
 * @param {string} text - Text to analyze
 * @returns {Set<string>} Extracted skills
 */
const extractSkillsFromText = (text) => {
  const skills = new Set();
  const skillPatterns = [
    /\b(JavaScript|Python|Java|C\+\+|SQL|React|Angular|Vue|Node\.js)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|CI\/CD)\b/gi,
    /\b(Agile|Scrum|Kanban|Waterfall)\b/gi
  ];
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => skills.add(match.toLowerCase()));
  });
  
  return skills;
};

/**
 * Extracts metrics from text content
 * @param {string} text - Text to analyze
 * @returns {string[]} Extracted metrics
 */
const extractMetricsFromText = (text) => {
  const metricPatterns = [
    /\d+%/g,                    // Percentages
    /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,  // Currency
    /\d+\s*(?:hours|days|weeks|months|years)/gi,  // Time periods
    /\d+\s*(?:users|customers|clients|employees)/gi  // People
  ];
  
  return metricPatterns
    .flatMap(pattern => text.match(pattern) || [])
    .filter(Boolean);
};

/**
 * Calculates overlap between two sets
 * @param {Set<string>} set1 - First set
 * @param {Set<string>} set2 - Second set
 * @returns {number} Overlap score (0-1)
 */
const calculateSetOverlap = (set1, set2) => {
  if (set1.size === 0 || set2.size === 0) return 0;
  
  const intersection = new Set(
    [...set1].filter(x => set2.has(x))
  );
  
  return intersection.size / Math.min(set1.size, set2.size);
};

/**
 * Validates if a metric value is realistic
 * @param {string} metric - Metric to validate
 * @returns {boolean} Whether metric is realistic
 */
const isMetricRealistic = (metric) => {
  // Percentage validation
  if (/%/.test(metric)) {
    const value = parseInt(metric);
    return value >= 0 && value <= 100;
  }
  
  // Currency validation (max $10M per achievement)
  if (/\$/.test(metric)) {
    const value = parseInt(metric.replace(/[\$,]/g, ''));
    return value >= 0 && value <= 10000000;
  }
  
  // Time period validation (max 30 years)
  if (/years/.test(metric)) {
    const value = parseInt(metric);
    return value >= 0 && value <= 30;
  }
  
  // User/customer count validation (max 1M per achievement)
  if (/users|customers|clients/.test(metric)) {
    const value = parseInt(metric);
    return value >= 0 && value <= 1000000;
  }
  
  return true; // Default to true for unknown metrics
};

/**
 * Validates personal details usage in generated content
 * @param {string} content - Generated content
 * @param {ResumeData} resumeData - Resume data
 * @returns {Promise<PersonalDetailsValidation>}
 */
const validatePersonalDetails = async (content, resumeData) => {
  const issues = [];
  const suggestions = [];
  let score = 1.0;

  // Check for placeholders
  const placeholderResults = detectPlaceholders(content);
  issues.push(...placeholderResults.issues);
  score *= (1 - placeholderResults.severityScore * 0.4);

  // Validate contact information
  const contactResults = validateContactInformation(content, resumeData);
  issues.push(...contactResults.issues);
  if (!contactResults.isValid) {
    score *= 0.7;
  }

  // Check name usage
  const namePattern = new RegExp(`\\b${resumeData.firstName}\\s+${resumeData.lastName}\\b`, 'i');
  if (!namePattern.test(content)) {
    issues.push({
      type: 'missing',
      message: 'Full name not found in content',
      location: 'global',
      severity: 'error'
    });
    score *= 0.8;
    suggestions.push('Include full name in the content');
  }

  // Check professional title usage
  if (resumeData.personalDetails?.title && !content.includes(resumeData.personalDetails.title)) {
    issues.push({
      type: 'missing',
      message: 'Professional title not utilized',
      location: 'global',
      severity: 'warning'
    });
    score *= 0.9;
    suggestions.push('Include professional title for better context');
  }

  return {
    isValid: score > 0.7 && !issues.some(i => i.severity === 'error'),
    issues,
    suggestions,
    score
  };
};

/**
 * Detects placeholder text in content
 * @param {string} content - Content to check
 * @returns {PlaceholderDetectionResult}
 */
const detectPlaceholders = (content) => {
  const issues = [];
  const locations = new Map();
  let severityScore = 0;

  const patterns = {
    brackets: {
      pattern: /\[([^\]]+)\]/g,
      severity: 'error',
      weight: 1.0
    },
    braces: {
      pattern: /\{([^}]+)\}/g,
      severity: 'error',
      weight: 1.0
    },
    angles: {
      pattern: /<([^>]+)>/g,
      severity: 'error',
      weight: 1.0
    },
    genericTerms: {
      pattern: /\b(your|my|the) (company|organization|position|role|title)\b/gi,
      severity: 'warning',
      weight: 0.7
    },
    templatePhrases: {
      pattern: /\b(I am writing to express|I am excited to apply|To whom it may concern)\b/gi,
      severity: 'warning',
      weight: 0.5
    },
    incompleteContent: {
      pattern: /\.{3,}|\b(etc|and so on|and more)\b/gi,
      severity: 'info',
      weight: 0.3
    }
  };

  for (const [type, config] of Object.entries(patterns)) {
    const matches = [...content.matchAll(config.pattern)];
    if (matches.length > 0) {
      const matchLocations = matches.map(m => m[0]);
      locations.set(type, matchLocations);
      
      issues.push({
        type: 'placeholder',
        message: `Found ${type} placeholder: ${matchLocations.join(', ')}`,
        location: matchLocations.join('; '),
        severity: config.severity
      });

      severityScore = Math.max(severityScore, matches.length * config.weight / 5);
    }
  }

  return {
    issues,
    severityScore: Math.min(1, severityScore),
    locations
  };
};

/**
 * Validates contact information usage
 * @param {string} content - Generated content
 * @param {ResumeData} resumeData - Resume data
 * @returns {ContactValidationResult}
 */
const validateContactInformation = (content, resumeData) => {
  const issues = [];
  const metrics = {
    emailFound: false,
    phoneFound: false,
    linkedInFound: false,
    portfolioFound: false
  };

  // Validate email
  if (resumeData.email) {
    const emailPattern = new RegExp(resumeData.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    metrics.emailFound = emailPattern.test(content);
    if (!metrics.emailFound) {
      issues.push({
        type: 'missing',
        message: 'Email address not included',
        location: 'contact section',
        severity: 'warning'
      });
    }
  }

  // Validate phone
  if (resumeData.phoneNumber) {
    const phonePattern = new RegExp(resumeData.phoneNumber.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'), 'i');
    metrics.phoneFound = phonePattern.test(content);
    if (!metrics.phoneFound) {
      issues.push({
        type: 'missing',
        message: 'Phone number not included',
        location: 'contact section',
        severity: 'warning'
      });
    }
  }

  // Validate LinkedIn
  if (resumeData.personalDetails?.linkedIn) {
    metrics.linkedInFound = content.includes(resumeData.personalDetails.linkedIn);
    if (!metrics.linkedInFound) {
      issues.push({
        type: 'missing',
        message: 'LinkedIn profile not included',
        location: 'contact section',
        severity: 'info'
      });
    }
  }

  // Validate portfolio
  if (resumeData.personalDetails?.portfolio) {
    metrics.portfolioFound = content.includes(resumeData.personalDetails.portfolio);
    if (!metrics.portfolioFound) {
      issues.push({
        type: 'missing',
        message: 'Portfolio URL not included',
        location: 'contact section',
        severity: 'info'
      });
    }
  }

  return {
    isValid: metrics.emailFound || metrics.phoneFound, // At least one contact method required
    issues,
    metrics
  };
};

/**
 * Replaces detected placeholders with actual data
 * @param {string} content - Content with placeholders
 * @param {ResumeData} resumeData - Resume data
 * @param {JobDetails} jobDetails - Job details
 * @returns {string} Content with placeholders replaced
 */
const replaceDetectedPlaceholders = (content, resumeData, jobDetails) => {
  let updatedContent = content;

  // Create replacement map with null checks
  const replacements = new Map([
    [/\[Your Name\]/gi, resumeData.firstName && resumeData.lastName ? 
      `${resumeData.firstName} ${resumeData.lastName}` : ''],
    [/\[Name\]/gi, resumeData.firstName && resumeData.lastName ? 
      `${resumeData.firstName} ${resumeData.lastName}` : ''],
    [/\[Company( Name)?\]/gi, jobDetails.company || ''],
    [/\[Position\]/gi, jobDetails.jobTitle || ''],
    [/\[Role\]/gi, jobDetails.jobTitle || ''],
    [/\[Email\]/gi, resumeData.email || ''],
    [/\[Phone\]/gi, resumeData.phoneNumber || ''],
    [/\bmy company\b/gi, jobDetails.company || ''],
    [/\byour company\b/gi, jobDetails.company || ''],
    [/\bthe company\b/gi, jobDetails.company || ''],
    [/\bthe (position|role)\b/gi, jobDetails.jobTitle || ''],
    [/\byour (position|role)\b/gi, jobDetails.jobTitle || '']
  ]);

  // Apply replacements
  for (const [pattern, replacement] of replacements) {
    updatedContent = updatedContent.replace(pattern, replacement);
  }

  return updatedContent;
};

/**
 * Calculates content quality score
 * @param {string} content - Generated content
 * @param {ResumeData} resumeData - Resume data
 * @returns {Object} Quality score and metrics
 */
const calculateContentQualityScore = (content, resumeData) => {
  const metrics = {
    personalization: 0,
    specificity: 0,
    coherence: 0,
    overall: 0
  };

  // Calculate personalization score
  const personalDetails = [
    resumeData.firstName,
    resumeData.lastName,
    resumeData.email,
    resumeData.phoneNumber,
    resumeData.personalDetails?.title
  ].filter(Boolean);

  const personalizedContent = personalDetails.filter(detail => 
    content.includes(detail)
  ).length;

  metrics.personalization = personalizedContent / personalDetails.length;

  // Calculate specificity score
  const specificityPatterns = [
    /\b\d+(\+)?\s*(year|month)s?\b/gi,
    /\b(led|managed|developed|created|implemented)\b/gi,
    /\b\d+%|\$\d+|\d+ (projects|teams|people)\b/gi
  ];

  metrics.specificity = specificityPatterns.reduce((score, pattern) => {
    const matches = content.match(pattern) || [];
    return score + Math.min(1, matches.length / 3);
  }, 0) / specificityPatterns.length;

  // Calculate coherence score
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => 
    sum + s.trim().split(/\s+/).length, 0
  ) / sentences.length;

  metrics.coherence = Math.min(1, Math.max(0, 
    (avgSentenceLength - 5) / 15
  ));

  // Calculate overall score
  metrics.overall = (
    metrics.personalization * 0.4 +
    metrics.specificity * 0.4 +
    metrics.coherence * 0.2
  );

  return {
    score: metrics.overall,
    metrics,
    suggestions: generateQualityImprovementSuggestions(metrics)
  };
};

/**
 * Generates suggestions for improving content quality
 * @param {Object} metrics - Quality metrics
 * @returns {string[]} Improvement suggestions
 */
const generateQualityImprovementSuggestions = (metrics) => {
  const suggestions = [];

  if (metrics.personalization < 0.7) {
    suggestions.push('Include more personal details and achievements');
  }
  if (metrics.specificity < 0.7) {
    suggestions.push('Add more specific examples and quantifiable results');
  }
  if (metrics.coherence < 0.7) {
    suggestions.push('Improve sentence structure and flow');
  }

  return suggestions;
};

module.exports = {
  analyzeContentAvailability,
  compensateForGaps,
  validateContentAuthenticity,
  calculateAuthenticityMetrics,
  validateTimelineConsistency,
  validateSkillConsistency,
  validateAchievementRealism,
  calculateSectionStrength,
  calculateSkillsStrength,
  validatePersonalDetails,
  detectPlaceholders,
  validateContactInformation,
  replaceDetectedPlaceholders,
  calculateContentQualityScore
}; 