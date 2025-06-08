// @ts-check
const { calculateTechnicalDensity, isTechnicalRole } = require('../analysis/technicalKeywordLibrary');
const { scoreExperience } = require('../scoring/experienceScoring');

/** @typedef {import('../analysis/technicalKeywordLibrary').Resume} Resume */
/** @typedef {import('../analysis/technicalKeywordLibrary').WorkExperience} WorkExperience */
/** @typedef {import('../analysis/technicalKeywordLibrary').CategoryScore} CategoryScore */

/**
 * @typedef {Object} Skills
 * @property {string} skills_ - List of skills
 */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} technologies - Technologies used
 */

/**
 * @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} fieldOfStudy - Field of study
 * @property {string} [graduationDate] - Graduation date
 */

/**
 * Component weights for overall score calculation
 * @type {Object.<string, number>}
 */
const COMPONENT_WEIGHTS = {
  SKILLS: 0.30,
  WORK_EXPERIENCE: 0.25,
  PROJECTS: 0.20,
  EDUCATION: 0.15,
  JOB_TITLE: 0.10
};

/**
 * Calculates skills match score
 * @param {Skills} skills - Resume skills section
 * @param {string} jobDescription - Job description
 * @returns {{ score: number, analysis: Object }}
 */
function calculateSkillsScore(skills, jobDescription) {
  if (!skills?.skills_ || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing skills or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  const skillsTechProfile = calculateTechnicalDensity(skills.skills_);

  // Calculate skill relevance
  const relevantSkills = skillsTechProfile.matches.filter(skill =>
    jobTechProfile.matches.includes(skill)
  );

  // Calculate missing critical skills
  const missingSkills = jobTechProfile.matches.filter(skill =>
    !skillsTechProfile.matches.includes(skill)
  );

  // Base score from relevant skills
  let score = relevantSkills.length / (jobTechProfile.matches.length || 1);

  // Apply diminishing returns
  score = Math.sqrt(score);

  // Penalize for missing critical skills
  const missingPenalty = missingSkills.length * 0.1;
  score = Math.max(0, score - missingPenalty);

  return {
    score,
    analysis: {
      relevantSkills,
      missingSkills,
      technicalDensity: skillsTechProfile.score,
      categoryScores: skillsTechProfile.categoryScores
    }
  };
}

/**
 * Calculates work experience match score
 * @param {WorkExperience[]} experience - Work experience entries
 * @param {string} jobDescription - Job description
 * @param {string} jobTitle - Job title
 * @returns {{ score: number, analysis: Object }}
 */
function calculateExperienceScore(experience, jobDescription, jobTitle) {
  if (!experience?.length || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing experience or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  const { isTechnical: isTargetTechnical } = isTechnicalRole(jobTitle);

  let totalScore = 0;
  const experienceAnalysis = experience.map(exp => {
    const expScore = scoreExperience(exp, {
      description: jobDescription,
      title: jobTitle
    }, (text) => {
      const techProfile = calculateTechnicalDensity(text);
      const exactMatches = techProfile.matches.filter(skill => 
        jobTechProfile.matches.includes(skill)
      );
      return {
        matchScore: exactMatches.length / (jobTechProfile.matches.length || 1),
        exactMatches,
        partialMatches: [],
        missingSkills: jobTechProfile.matches.filter(skill => !exactMatches.includes(skill))
      };
    });

    totalScore += expScore.relevanceScore;
    return expScore;
  });

  // Average score with diminishing returns
  const score = Math.sqrt(totalScore / (experience.length || 1));

  return {
    score,
    analysis: {
      entries: experienceAnalysis,
      overallTechnicalAlignment: isTargetTechnical
    }
  };
}

/**
 * Calculates project relevance score
 * @param {Project[]} projects - Project entries
 * @param {string} jobDescription - Job description
 * @returns {{ score: number, analysis: Object }}
 */
function calculateProjectScore(projects, jobDescription) {
  if (!projects?.length || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing projects or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  
  let totalScore = 0;
  const projectAnalysis = projects.map(project => {
    const projectTechProfile = calculateTechnicalDensity(
      `${project.title} ${project.description} ${project.technologies}`
    );

    const matchingTech = projectTechProfile.matches.filter(tech => 
      jobTechProfile.matches.includes(tech)
    );

    const relevanceScore = matchingTech.length / (jobTechProfile.matches.length || 1);
    totalScore += relevanceScore;

    return {
      matchingTechnologies: matchingTech,
      relevanceScore,
      technicalDensity: projectTechProfile.score
    };
  });

  // Average score with diminishing returns
  const score = Math.sqrt(totalScore / (projects.length || 1));

  return {
    score,
    analysis: {
      projects: projectAnalysis,
      overallTechnicalAlignment: score > 0.3
    }
  };
}

/**
 * Calculates education match score
 * @param {Education[]} education - Education entries
 * @param {string} jobDescription - Job description
 * @returns {{ score: number, analysis: Object }}
 */
function calculateEducationScore(education, jobDescription) {
  if (!education?.length || !jobDescription) {
    return { score: 0, analysis: { reason: 'Missing education or job description' } };
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  
  let totalScore = 0;
  const educationAnalysis = education.map(edu => {
    const fieldTechProfile = calculateTechnicalDensity(
      `${edu.degree} ${edu.fieldOfStudy}`
    );

    const relevanceScore = fieldTechProfile.matches.filter(tech => 
      jobTechProfile.matches.includes(tech)
    ).length / (jobTechProfile.matches.length || 1);

    // Weight recent education more heavily
    const recencyBonus = edu.graduationDate ? 
      (new Date().getFullYear() - new Date(edu.graduationDate).getFullYear() < 5 ? 0.2 : 0) : 
      0;

    const entryScore = relevanceScore + recencyBonus;
    totalScore += entryScore;

    return {
      fieldRelevance: relevanceScore,
      recencyBonus,
      entryScore
    };
  });

  // Average score
  const score = totalScore / (education.length || 1);

  return {
    score,
    analysis: {
      entries: educationAnalysis
    }
  };
}

/**
 * Calculates weighted component scores
 * @param {Resume} resume - Resume object
 * @param {string} jobDescription - Job description
 * @param {string} jobTitle - Job title
 * @returns {{ score: number, componentScores: Object, analysis: Object }}
 */
function calculateComponentScores(resume, jobDescription, jobTitle) {
  const skills = calculateSkillsScore(resume.skills, jobDescription);
  const experience = calculateExperienceScore(resume.workExperience, jobDescription, jobTitle);
  const projects = calculateProjectScore(resume.projects, jobDescription);
  const education = calculateEducationScore(resume.education, jobDescription);
  
  // Calculate job title match
  const titleMatch = isTechnicalRole(resume.personalDetails?.title || '');
  const targetRole = isTechnicalRole(jobTitle);
  const titleScore = {
    score: titleMatch.isTechnical === targetRole.isTechnical ? 
      Math.min(titleMatch.confidence, targetRole.confidence) : 0.2,
    analysis: { titleMatch, targetRole }
  };

  // Calculate weighted score
  const weightedScore = 
    (skills.score * COMPONENT_WEIGHTS.SKILLS) +
    (experience.score * COMPONENT_WEIGHTS.WORK_EXPERIENCE) +
    (projects.score * COMPONENT_WEIGHTS.PROJECTS) +
    (titleScore.score * COMPONENT_WEIGHTS.JOB_TITLE) +
    (education.score * COMPONENT_WEIGHTS.EDUCATION);

  return {
    score: weightedScore,
    componentScores: {
      skills: skills.score,
      experience: experience.score,
      projects: projects.score,
      jobTitle: titleScore.score,
      education: education.score
    },
    analysis: {
      skills: skills.analysis,
      experience: experience.analysis,
      projects: projects.analysis,
      education: education.analysis,
      jobTitle: titleScore.analysis
    }
  };
}

module.exports = {
  COMPONENT_WEIGHTS,
  calculateComponentScores,
  calculateSkillsScore,
  calculateExperienceScore,
  calculateProjectScore,
  calculateEducationScore
}; 