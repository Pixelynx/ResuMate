// @ts-check

/** @typedef {import('./skillsCompensation').SkillMatchQuality} SkillMatchQuality */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string[]} technologies - Technologies used
 */

/**
 * @typedef {Object} ProjectRelevance
 * @property {number} relevanceScore - Overall relevance score (0-1)
 * @property {string[]} matchedKeywords - Matched job requirement keywords
 * @property {string[]} matchedTechnologies - Matched required technologies
 * @property {boolean} isHighlyRelevant - Whether project is highly relevant
 */

/**
 * @typedef {Object} CompensationStack
 * @property {Object.<string, number>} baseReductions - Initial penalty reductions
 * @property {Object.<string, number>} synergyBonuses - Additional synergy-based reductions
 * @property {Object.<string, number>} finalReductions - Final combined reductions
 * @property {string[]} appliedSynergies - List of synergy effects applied
 */

/** @type {Object.<string, number>} */
const COMPENSATION_LIMITS = {
  EDUCATION: 0.8,    // Maximum 80% reduction
  EXPERIENCE: 0.7,   // Maximum 70% reduction
  TECHNICAL: 0.6,    // Maximum 60% reduction
  OVERALL: 0.85      // Maximum 85% total reduction
};

/**
 * Assesses project relevance to job requirements
 * @param {Project} project - Project to assess
 * @param {string[]} requiredSkills - Required job skills
 * @param {string} jobDescription - Full job description
 * @returns {ProjectRelevance} Project relevance assessment
 */
const assessProjectRelevance = (project, requiredSkills, jobDescription) => {
  const description = jobDescription.toLowerCase();
  const projectDesc = project.description.toLowerCase();
  const projectTech = new Set(project.technologies.map(t => t.toLowerCase()));
  
  // Match technologies
  const matchedTechnologies = requiredSkills
    .filter(skill => projectTech.has(skill.toLowerCase()));
  
  // Match keywords from job description
  const jobKeywords = new Set([
    ...requiredSkills,
    ...extractKeyPhrases(jobDescription)
  ].map(k => k.toLowerCase()));
  
  const matchedKeywords = Array.from(jobKeywords)
    .filter(keyword => projectDesc.includes(keyword));
  
  // Calculate relevance score
  const techScore = matchedTechnologies.length / Math.max(1, requiredSkills.length);
  const keywordScore = matchedKeywords.length / Math.max(1, jobKeywords.size);
  const relevanceScore = (techScore * 0.6) + (keywordScore * 0.4);
  
  return {
    relevanceScore,
    matchedKeywords,
    matchedTechnologies,
    isHighlyRelevant: relevanceScore >= 0.7
  };
};

/**
 * Extracts key phrases from job description
 * @param {string} text - Text to analyze
 * @returns {string[]} Extracted key phrases
 */
const extractKeyPhrases = (text) => {
  const phrases = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);  // Filter out short words
    
  return Array.from(new Set(phrases));
};

/**
 * Calculates project-based compensation
 * @param {Project[]} projects - Candidate's projects
 * @param {string[]} requiredSkills - Required job skills
 * @param {string} jobDescription - Full job description
 * @returns {{ reductions: Object.<string, number>, relevantProjects: ProjectRelevance[] }}
 */
const calculateProjectCompensation = (projects, requiredSkills, jobDescription) => {
  const projectAssessments = projects.map(project => 
    assessProjectRelevance(project, requiredSkills, jobDescription)
  );
  
  const highlyRelevant = projectAssessments.filter(p => p.isHighlyRelevant);
  const moderatelyRelevant = projectAssessments.filter(p => 
    p.relevanceScore >= 0.4 && !p.isHighlyRelevant
  );
  
  /** @type {Object.<string, number>} */
  const reductions = {
    experience: 0,
    education: 0
  };
  
  // Apply reductions based on project relevance
  if (highlyRelevant.length > 0) {
    reductions.experience = 0.2;  // 20% reduction for highly relevant projects
  }
  
  if (highlyRelevant.length + moderatelyRelevant.length >= 2) {
    reductions.experience = Math.max(reductions.experience, 0.15);
    reductions.education = 0.15;  // 15% reduction for multiple relevant projects
  }
  
  return {
    reductions,
    relevantProjects: projectAssessments
  };
};

/**
 * Calculates synergy bonuses between skills and projects
 * @param {SkillMatchQuality} skillMatch - Skill match assessment
 * @param {ProjectRelevance[]} projectRelevance - Project relevance assessments
 * @returns {Object.<string, number>} Synergy-based reductions
 */
const calculateSynergyBonuses = (skillMatch, projectRelevance) => {
  /** @type {Object.<string, number>} */
  const synergyBonuses = {
    experience: 0,
    education: 0,
    technical: 0
  };
  
  // Check for skill-project synergies
  const hasSkillProjectSynergy = projectRelevance.some(project =>
    project.matchedTechnologies.some(tech =>
      skillMatch.matchedCoreSkills.includes(tech)
    )
  );
  
  if (hasSkillProjectSynergy && skillMatch.overallMatch >= 0.7) {
    synergyBonuses.experience = 0.1;  // 10% additional reduction
    synergyBonuses.technical = 0.1;   // 10% additional reduction
  }
  
  return synergyBonuses;
};

/**
 * Stacks multiple compensation sources with proper bounds
 * @param {Object.<string, number>} skillReductions - Skill-based reductions
 * @param {Object.<string, number>} projectReductions - Project-based reductions
 * @param {Object.<string, number>} synergyBonuses - Synergy-based reductions
 * @returns {CompensationStack} Final stacked compensation
 */
const stackCompensation = (skillReductions, projectReductions, synergyBonuses) => {
  const baseReductions = { ...skillReductions };
  const appliedSynergies = [];
  
  // Stack project reductions multiplicatively
  for (const [key, reduction] of Object.entries(projectReductions)) {
    if (baseReductions[key]) {
      baseReductions[key] = 1 - ((1 - baseReductions[key]) * (1 - reduction));
    } else {
      baseReductions[key] = reduction;
    }
  }
  
  // Apply synergy bonuses
  const finalReductions = { ...baseReductions };
  for (const [key, bonus] of Object.entries(synergyBonuses)) {
    if (bonus > 0) {
      const currentReduction = finalReductions[key] || 0;
      const newReduction = 1 - ((1 - currentReduction) * (1 - bonus));
      
      // Check category-specific limits
      const categoryLimit = COMPENSATION_LIMITS[key.toUpperCase()] || COMPENSATION_LIMITS.OVERALL;
      finalReductions[key] = Math.min(newReduction, categoryLimit);
      
      if (newReduction > currentReduction) {
        appliedSynergies.push(`${key}_synergy`);
      }
    }
  }
  
  // Ensure overall compensation doesn't exceed maximum
  const maxReduction = Math.max(...Object.values(finalReductions));
  if (maxReduction > COMPENSATION_LIMITS.OVERALL) {
    const scale = COMPENSATION_LIMITS.OVERALL / maxReduction;
    for (const key in finalReductions) {
      finalReductions[key] *= scale;
    }
  }
  
  return {
    baseReductions,
    synergyBonuses,
    finalReductions,
    appliedSynergies
  };
};

module.exports = {
  calculateProjectCompensation,
  calculateSynergyBonuses,
  stackCompensation,
  COMPENSATION_LIMITS
}; 