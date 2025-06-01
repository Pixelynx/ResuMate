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
 * Validates content authenticity
 * @param {ResumeData} resumeData - Resume data
 * @returns {boolean} Whether content appears authentic
 */
const validateContentAuthenticity = (resumeData) => {
  // Check for unrealistic claims
  const redFlags = {
    experienceGaps: checkExperienceGaps(resumeData.workExperience || []),
    skillConsistency: checkSkillConsistency(resumeData),
    achievementRealism: checkAchievementRealism(resumeData.workExperience || [])
  };

  return Object.values(redFlags).every(flag => flag);
};

/**
 * Checks for suspicious gaps or overlaps in experience
 * @param {Array<WorkExperience>} experiences - Work experience entries
 * @returns {boolean} Whether experience timeline appears valid
 */
const checkExperienceGaps = (experiences) => {
  if (!experiences?.length) return true;

  const sortedExperiences = [...experiences]
    .filter(exp => exp.startDate && exp.endDate)
    .sort((a, b) => {
      // Ensure we have valid dates before comparison
      if (!a.startDate || !b.startDate) return 0;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  for (let i = 0; i < sortedExperiences.length - 1; i++) {
    const current = sortedExperiences[i];
    const next = sortedExperiences[i + 1];
    
    // Skip if we don't have valid dates
    if (!current.startDate || !next.endDate) continue;
    
    const currentDate = new Date(current.startDate);
    const nextDate = new Date(next.endDate);
    
    // Check for unrealistic overlaps (>6 months)
    if (currentDate.getTime() - nextDate.getTime() < -180 * 24 * 60 * 60 * 1000) {
      return false;
    }
  }

  return true;
};

/**
 * Checks if skills align with experience and projects
 * @param {ResumeData} resumeData - Resume data
 * @returns {boolean} Whether skills appear consistent
 */
const checkSkillConsistency = (resumeData) => {
  if (!resumeData.skills?.skills_) return true;

  const skills = new Set(
    resumeData.skills.skills_
      .toLowerCase()
      .split(',')
      .map(s => s.trim())
  );

  // Check if high-level skills are backed by experience
  const experienceText = resumeData.workExperience
    ?.map(exp => `${exp.jobTitle} ${exp.description}`)
    .join(' ')
    .toLowerCase() || '';

  const projectText = resumeData.projects
    ?.map(proj => `${proj.title} ${proj.description} ${proj.technologies || ''}`)
    .join(' ')
    .toLowerCase() || '';

  const contentText = `${experienceText} ${projectText}`;

  // Check if at least 30% of skills are mentioned in experience/projects
  let mentionedSkills = 0;
  for (const skill of skills) {
    if (contentText.includes(skill)) {
      mentionedSkills++;
    }
  }

  return mentionedSkills >= (skills.size * 0.3);
};

/**
 * Checks if achievements appear realistic
 * @param {Array<WorkExperience>} experiences - Work experience entries
 * @returns {boolean} Whether achievements appear realistic
 */
const checkAchievementRealism = (experiences) => {
  if (!experiences?.length) return true;

  const unrealisticPatterns = [
    /increased\s+(?:revenue|sales|growth|efficiency)\s+by\s+(?:100|[2-9]\d{2,})\s*%/i,
    /managed\s+(?:team|group|department)\s+of\s+(?:[1-9]\d{3,}|\d{5,})\s+(?:people|employees)/i,
    /saved\s+(?:company|organization|client)\s+\$\d{8,}/i
  ];

  return !experiences.some(exp =>
    unrealisticPatterns.some(pattern => 
      pattern.test(exp.description || '')
    )
  );
};

module.exports = {
  analyzeContentAvailability,
  compensateForGaps,
  validateContentAuthenticity,
  calculateSectionStrength,
  calculateSkillsStrength
}; 