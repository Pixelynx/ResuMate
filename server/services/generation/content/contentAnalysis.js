// @ts-check

/** @typedef {import('../../ai.service').ResumeData} ResumeData */

/**
 * @typedef {Object} ContentRelevance
 * @property {number} score - Relevance score (0-1)
 * @property {string[]} matchedKeywords - Keywords found in both resume and job description
 * @property {string[]} missingKeywords - Important keywords from job description not found in content
 * @property {Object.<string, number>} subsectionScores - Individual scores for subsections
 */

/**
 * @typedef {Object} SectionPriority
 * @property {'PRIMARY' | 'SECONDARY' | 'MINIMAL'} tier - Priority tier based on relevance
 * @property {number} allocationPercentage - Percentage of content to allocate (0-100)
 * @property {string[]} focusPoints - Key points to emphasize
 * @property {string[]} suggestedTransitions - Suggested transition phrases
 */

/**
 * @typedef {Object} ContentAllocation
 * @property {Object.<string, SectionPriority>} sections - Priority and allocation for each section
 * @property {string[]} suggestedOrder - Recommended order of sections
 * @property {Object.<string, string[]>} emphasisKeywords - Keywords to emphasize per section
 */

/**
 * @typedef {Object} JobDetails
 * @property {string} jobDescription - Job description text
 */

/** @type {Object.<string, number>} */
const SECTION_BASE_WEIGHTS = {
  workExperience: 0.35,
  skills: 0.25,
  projects: 0.25,
  education: 0.15
};

/** @type {Object.<string, string[]>} */
const SECTION_INDICATORS = {
  workExperience: [
    'experience', 'work', 'history', 'background', 'role', 'position',
    'responsibilities', 'achievements', 'track record'
  ],
  skills: [
    'skills', 'abilities', 'competencies', 'proficiency', 'expertise',
    'qualifications', 'technical', 'technologies', 'tools'
  ],
  projects: [
    'projects', 'portfolio', 'implementations', 'developments',
    'initiatives', 'solutions', 'applications', 'systems'
  ],
  education: [
    'education', 'degree', 'certification', 'academic', 'university',
    'college', 'diploma', 'qualification', 'training'
  ]
};

/**
 * Calculates relevance score for a section's content against job requirements
 * @param {string} content - Section content to analyze
 * @param {string} jobDescription - Job description to match against
 * @param {string[]} [sectionIndicators] - Keywords indicating section relevance
 * @returns {ContentRelevance} Relevance analysis
 */
const calculateSectionRelevance = (content, jobDescription, sectionIndicators = []) => {
  if (!content || !jobDescription) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      subsectionScores: {}
    };
  }

  const contentLower = content.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  // Extract key phrases from job description
  const jobPhrases = jobLower
    .split(/[.,!?]/)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length > 0);

  // Find matching keywords and calculate basic score
  const matchedKeywords = sectionIndicators.filter(keyword =>
    jobLower.includes(keyword) && contentLower.includes(keyword)
  );

  const missingKeywords = sectionIndicators.filter(keyword =>
    jobLower.includes(keyword) && !contentLower.includes(keyword)
  );

  // Calculate phrase-level matches
  const phraseMatches = jobPhrases.filter(phrase =>
    contentLower.includes(phrase.toLowerCase())
  );

  // Calculate weighted score
  const keywordScore = matchedKeywords.length / Math.max(1, sectionIndicators.length);
  const phraseScore = phraseMatches.length / Math.max(1, jobPhrases.length);
  
  const score = (keywordScore * 0.4) + (phraseScore * 0.6);

  return {
    score: Math.min(1, score),
    matchedKeywords,
    missingKeywords,
    subsectionScores: {
      keywordMatch: keywordScore,
      phraseMatch: phraseScore
    }
  };
};

/**
 * Determines priority tier and allocation percentage based on relevance score
 * @param {number} relevanceScore - Section relevance score (0-1)
 * @param {number} contentQuality - Content quality score (0-1)
 * @returns {SectionPriority} Priority and allocation details
 */
const calculateSectionPriority = (relevanceScore, contentQuality) => {
  const combinedScore = (relevanceScore * 0.7) + (contentQuality * 0.3);
  
  if (combinedScore >= 0.7) {
    return {
      tier: 'PRIMARY',
      allocationPercentage: Math.min(40, Math.round(combinedScore * 50)),
      focusPoints: ['Emphasize specific achievements', 'Use detailed examples'],
      suggestedTransitions: [
        'Most notably,',
        'Of particular relevance,',
        'A key highlight of my background is'
      ]
    };
  }
  
  if (combinedScore >= 0.4) {
    return {
      tier: 'SECONDARY',
      allocationPercentage: Math.min(30, Math.round(combinedScore * 40)),
      focusPoints: ['Summarize relevant aspects', 'Focus on transferable elements'],
      suggestedTransitions: [
        'Additionally,',
        'I also bring experience in',
        'My background includes'
      ]
    };
  }
  
  return {
    tier: 'MINIMAL',
    allocationPercentage: Math.min(20, Math.round(combinedScore * 30)),
    focusPoints: ['Brief mention if relevant', 'Focus on strongest connection'],
    suggestedTransitions: [
      'Furthermore,',
      'I have also',
      'My experience extends to'
    ]
  };
};

/**
 * Assesses the quality of available content
 * @param {string} content - Content to assess
 * @returns {number} Quality score (0-1)
 */
const assessContentQuality = (content) => {
  if (!content) return 0;
  
  const metrics = {
    length: Math.min(1, content.length / 500),  // Ideal length ~500 chars
    specificity: content.match(/\b\d+%|\d+ years|\$\d+|\d+ projects/g)?.length || 0,
    actionVerbs: content.match(/\b(developed|implemented|managed|led|created|designed)\b/gi)?.length || 0
  };
  
  return Math.min(1, (
    (metrics.length * 0.4) +
    (Math.min(1, metrics.specificity / 3) * 0.3) +
    (Math.min(1, metrics.actionVerbs / 4) * 0.3)
  ));
};

/**
 * Prioritizes resume content sections based on job requirements
 * @param {ResumeData} resumeData - Resume content by section
 * @param {JobDetails} jobDetails - Job details
 * @returns {ContentAllocation} Prioritized content allocation
 */
const prioritizeContent = (resumeData, jobDetails) => {
  /** @type {Object.<string, SectionPriority>} */
  const sectionScores = {};
  let totalAllocation = 0;
  
  // Calculate relevance and priority for each section
  for (const [section, weight] of Object.entries(SECTION_BASE_WEIGHTS)) {
    // @ts-ignore - We know these sections exist in ResumeData
    const content = extractSectionContent(resumeData[section]);
    const relevance = calculateSectionRelevance(
      content,
      jobDetails.jobDescription,
      SECTION_INDICATORS[section]
    );
    const quality = assessContentQuality(content);
    const priority = calculateSectionPriority(relevance.score * weight, quality);
    
    sectionScores[section] = priority;
    totalAllocation += priority.allocationPercentage;
  }
  
  // Normalize allocations to 100%
  if (totalAllocation > 100) {
    const scale = 100 / totalAllocation;
    Object.values(sectionScores).forEach(section => {
      section.allocationPercentage = Math.round(section.allocationPercentage * scale);
    });
  }
  
  // Determine optimal section order
  const sectionOrder = Object.entries(sectionScores)
    .sort(([,a], [,b]) => b.allocationPercentage - a.allocationPercentage)
    .map(([section]) => section);
  
  return {
    sections: sectionScores,
    suggestedOrder: sectionOrder,
    emphasisKeywords: Object.fromEntries(
      Object.entries(sectionScores).map(([section, priority]) => [
        section,
        priority.tier === 'PRIMARY' ? SECTION_INDICATORS[section].slice(0, 5) : []
      ])
    )
  };
};

/**
 * Type guard for string values
 * @param {unknown} val - Value to check
 * @returns {val is string} Whether the value is a string
 */
const isString = (val) => typeof val === 'string';

/**
 * Extracts content from a resume section
 * @param {any} sectionData - Section data in resume
 * @returns {string} Concatenated section content
 */
const extractSectionContent = (sectionData) => {
  if (!sectionData) return '';
  
  if (Array.isArray(sectionData)) {
    return sectionData
      .map(item => {
        if (typeof item !== 'object' || item === null) return '';
        return Object.values(item)
          .filter(isString)
          .join(' ');
      })
      .join(' ');
  }
  
  if (typeof sectionData === 'object' && sectionData !== null) {
    return Object.values(sectionData)
      .filter(isString)
      .join(' ');
  }
  
  return String(sectionData);
};

module.exports = {
  calculateSectionRelevance,
  calculateSectionPriority,
  assessContentQuality,
  prioritizeContent,
  SECTION_BASE_WEIGHTS,
  SECTION_INDICATORS
}; 