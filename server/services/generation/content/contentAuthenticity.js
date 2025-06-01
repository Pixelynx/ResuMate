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
 * Analyzes content availability and authenticity
 * @param {ResumeData} resumeData - Resume data
 * @returns {ContentAvailability}
 */
const analyzeContentAvailability = (resumeData) => {
  const hasWorkExperience = (resumeData.workExperience?.length ?? 0) > 0;
  const hasProjects = (resumeData.projects?.length ?? 0) > 0;
  const hasSkills = Boolean(resumeData.skills?.skills_);
  const hasEducation = (resumeData.education?.length ?? 0) > 0;

  // Calculate content strength scores (0-1)
  const contentStrengths = {
    workExperience: hasWorkExperience ? calculateSectionStrength(resumeData.workExperience || []) : 0,
    projects: hasProjects ? calculateSectionStrength(resumeData.projects || []) : 0,
    skills: hasSkills ? calculateSkillsStrength(resumeData.skills?.skills_ || '') : 0,
    education: hasEducation ? calculateSectionStrength(resumeData.education || []) : 0
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
 * @param {Array<Object>} sectionData - Section data array
 * @returns {number} Section strength score (0-1)
 */
const calculateSectionStrength = (sectionData) => {
  if (!sectionData?.length) return 0;

  const metrics = sectionData.map(item => ({
    length: String(item.description || '').length,
    details: (String(item.description || '').match(/\b\d+%|\d+ years|\$\d+|\d+ projects/g) || []).length,
    keywords: (String(item.description || '').match(/\b(developed|managed|created|improved|led)\b/gi) || []).length
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
  const emphasizedAreas = [];
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
  if (workExperience.length > 1) {
    for (let i = 1; i < workExperience.length; i++) {
      const current = new Date(workExperience[i].startDate);
      const previous = new Date(workExperience[i-1].endDate || Date.now());
      
      if (current > previous) {
        timelineIssues.push('Overlapping work experience dates');
      }
    }
  }
  
  // Check education timeline
  const education = resumeData.education || [];
  if (education.length > 1) {
    for (let i = 1; i < education.length; i++) {
      const current = new Date(education[i].startDate);
      const previous = new Date(education[i-1].endDate || Date.now());
      
      if (current > previous) {
        timelineIssues.push('Overlapping education dates');
      }
    }
  }
  
  // Check for future dates
  const now = new Date();
  const futureIssues = [
    ...workExperience.filter(exp => new Date(exp.startDate) > now),
    ...education.filter(edu => new Date(edu.startDate) > now)
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
  if (!resumeData.skills?.skills_) return 0.5; // Default if no skills
  
  const declaredSkills = new Set(
    resumeData.skills.skills_.toLowerCase().split(',').map(s => s.trim())
  );
  
  // Extract skills mentioned in experience
  const experienceSkills = new Set();
  resumeData.workExperience?.forEach(exp => {
    const skills = extractSkillsFromText(exp.description);
    skills.forEach(skill => experienceSkills.add(skill));
  });
  
  // Extract skills mentioned in projects
  const projectSkills = new Set();
  resumeData.projects?.forEach(proj => {
    const skills = extractSkillsFromText(proj.description);
    skills.forEach(skill => projectSkills.add(skill));
  });
  
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
  resumeData.workExperience?.forEach(exp => {
    const metrics = extractMetricsFromText(exp.description);
    
    metrics.forEach(metric => {
      if (!isMetricRealistic(metric)) {
        achievementIssues.push(`Unrealistic metric: ${metric}`);
      }
    });
  });
  
  // Check project achievements
  resumeData.projects?.forEach(proj => {
    const metrics = extractMetricsFromText(proj.description);
    
    metrics.forEach(metric => {
      if (!isMetricRealistic(metric)) {
        achievementIssues.push(`Unrealistic metric: ${metric}`);
      }
    });
  });
  
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

module.exports = {
  analyzeContentAvailability,
  compensateForGaps,
  validateContentAuthenticity,
  calculateAuthenticityMetrics,
  validateTimelineConsistency,
  validateSkillConsistency,
  validateAchievementRealism,
  calculateSectionStrength,
  calculateSkillsStrength
}; 