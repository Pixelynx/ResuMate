// @ts-check
const { calculateJobFitScore } = require('../../jobFitService');
const { extractKeywords } = require('../../assessment/analysis/jobCategories');

/**
 * @typedef {import('../../jobFitService').CoverLetter} CoverLetter
 * @typedef {import('../../jobFitService').JobFitResult} JobFitResult
 */

/**
 * @typedef {Object} ContentAnalysisResult
 * @property {number} relevanceScore - Score indicating content relevance (0-1)
 * @property {number} impactScore - Score indicating achievement impact (0-1)
 * @property {number} specificityScore - Score indicating detail level (0-1)
 * @property {string[]} keywords - Extracted relevant keywords
 * @property {Object} metrics - Additional analysis metrics
 */

/**
 * Analyzes content quality and relevance
 * @param {Object} content - Content to analyze
 * @param {CoverLetter} jobDetails - Job details for context
 * @returns {Promise<ContentAnalysisResult>} Analysis results
 */
const analyzeContent = async (content, jobDetails) => {
  try {
    // Extract keywords from content
    const keywords = extractKeywords(content);
    
    // Calculate relevance score
    const relevanceScore = await calculateRelevanceScore(content, jobDetails);
    
    // Calculate impact score
    const impactScore = calculateImpactScore(content);
    
    // Calculate specificity score
    const specificityScore = calculateSpecificityScore(content);
    
    // Calculate additional metrics
    const metrics = {
      keywordDensity: calculateKeywordDensity(content, keywords),
      sentimentScore: analyzeSentiment(content),
      readabilityScore: calculateReadability(content),
      technicalityScore: calculateTechnicality(content, keywords)
    };

    return {
      relevanceScore,
      impactScore,
      specificityScore,
      keywords,
      metrics
    };
  } catch (error) {
    console.error('Error in content analysis:', error);
    return {
      relevanceScore: 0,
      impactScore: 0,
      specificityScore: 0,
      keywords: [],
      metrics: {
        keywordDensity: 0,
        sentimentScore: 0,
        readabilityScore: 0,
        technicalityScore: 0
      }
    };
  }
};

/**
 * Calculates content relevance score
 * @param {Object} content - Content to analyze
 * @param {CoverLetter} jobDetails - Job details
 * @returns {Promise<number>} Relevance score (0-1)
 */
const calculateRelevanceScore = async (content, jobDetails) => {
  const result = await calculateJobFitScore(content, jobDetails);
  return Math.min(1, Math.max(0, result?.score || 0));
};

/**
 * Calculates impact score based on achievements and metrics
 * @param {Object} content - Content to analyze
 * @returns {number} Impact score (0-1)
 */
const calculateImpactScore = (content) => {
  const text = JSON.stringify(content).toLowerCase();
  
  // Impact indicators
  const metrics = text.match(/\d+%|\$\d+|\d+ million|\d+ billion/g) || [];
  const achievements = text.match(/achieved|improved|increased|reduced|saved|led|managed|developed/g) || [];
  const scale = text.match(/team of \d+|company-wide|enterprise|global|international/g) || [];
  
  const score = (
    (metrics.length * 0.4) +
    (achievements.length * 0.4) +
    (scale.length * 0.2)
  ) / 10; // Normalize to 0-1
  
  return Math.min(1, Math.max(0, score));
};

/**
 * Calculates specificity score based on detail level
 * @param {Object} content - Content to analyze
 * @returns {number} Specificity score (0-1)
 */
const calculateSpecificityScore = (content) => {
  const text = JSON.stringify(content).toLowerCase();
  
  // Specificity indicators
  const numbers = text.match(/\d+/g) || [];
  const technologies = text.match(/\w+\.\w+|[A-Z][a-z]*[A-Z]\w+|\w+\.js/g) || [];
  const timeframes = text.match(/\d{4}|\d+ months|\d+ years/g) || [];
  const details = text.match(/specifically|detailed|through|using|by|with/g) || [];
  
  const score = (
    (numbers.length * 0.3) +
    (technologies.length * 0.3) +
    (timeframes.length * 0.2) +
    (details.length * 0.2)
  ) / 15; // Normalize to 0-1
  
  return Math.min(1, Math.max(0, score));
};

/**
 * Calculates keyword density
 * @param {Object} content - Content to analyze
 * @param {string[]} keywords - Keywords to check
 * @returns {number} Keyword density score (0-1)
 */
const calculateKeywordDensity = (content, keywords) => {
  const text = JSON.stringify(content).toLowerCase();
  const words = text.split(/\W+/);
  
  let keywordCount = 0;
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const matches = text.match(regex);
    if (matches) keywordCount += matches.length;
  });
  
  return Math.min(1, keywordCount / words.length * 10);
};

/**
 * Analyzes content sentiment
 * @param {Object} content - Content to analyze
 * @returns {number} Sentiment score (0-1)
 */
const analyzeSentiment = (content) => {
  const text = JSON.stringify(content).toLowerCase();
  
  const positiveWords = [
    'achieved', 'improved', 'increased', 'successful', 'innovative',
    'efficient', 'effective', 'optimized', 'enhanced', 'excellent'
  ];
  
  const negativeWords = [
    'failed', 'decreased', 'reduced', 'problem', 'difficult',
    'challenging', 'limited', 'restricted', 'constrained', 'issue'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  const total = positiveCount + negativeCount;
  return total === 0 ? 0.5 : (positiveCount / total);
};

/**
 * Calculates content readability
 * @param {Object} content - Content to analyze
 * @returns {number} Readability score (0-1)
 */
const calculateReadability = (content) => {
  const text = JSON.stringify(content);
  
  // Simple readability metrics
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\W+/).length;
  const longWords = text.split(/\W+/).filter(word => word.length > 6).length;
  
  const avgWordsPerSentence = words / sentences;
  const longWordRatio = longWords / words;
  
  // Penalize very short or very long sentences, and too many long words
  const score = (
    (1 - Math.abs(avgWordsPerSentence - 15) / 15) * 0.6 +
    (1 - longWordRatio) * 0.4
  );
  
  return Math.min(1, Math.max(0, score));
};

/**
 * Calculates technical content score
 * @param {Object} content - Content to analyze
 * @param {string[]} keywords - Technical keywords
 * @returns {number} Technical score (0-1)
 */
const calculateTechnicality = (content, keywords) => {
  const text = JSON.stringify(content).toLowerCase();
  const technicalTerms = keywords.filter(keyword => 
    /^[A-Z]/.test(keyword) || // Capitalized terms
    keyword.includes('.') || // Software/versions
    /\d/.test(keyword) // Contains numbers
  );
  
  let technicalCount = 0;
  technicalTerms.forEach(term => {
    const regex = new RegExp(term.toLowerCase(), 'g');
    const matches = text.match(regex);
    if (matches) technicalCount += matches.length;
  });
  
  return Math.min(1, technicalCount / 10); // Normalize to 0-1
};

module.exports = {
  analyzeContent,
  calculateRelevanceScore,
  calculateImpactScore,
  calculateSpecificityScore,
  calculateKeywordDensity,
  analyzeSentiment,
  calculateReadability,
  calculateTechnicality
}; 