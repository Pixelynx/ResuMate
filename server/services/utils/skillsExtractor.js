const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Common technical skills and keywords
const TECHNICAL_SKILLS = new Set([
  'javascript', 'python', 'java', 'c++', 'ruby', 'php', 'swift',
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
  'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
  'git', 'ci/cd', 'jenkins', 'github', 'gitlab',
  'machine learning', 'ai', 'data science', 'nlp',
  'agile', 'scrum', 'kanban', 'jira'
]);

/**
 * Extract skills from text using NLP and pattern matching
 * @param {string} text - Text to extract skills from
 * @returns {Promise<string[]>} Array of extracted skills
 */
async function extractSkills(text) {
  if (!text) return [];
  
  // Tokenize and normalize text
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Extract single-word skills
  const singleWordSkills = tokens.filter(token => 
    TECHNICAL_SKILLS.has(token)
  );
  
  // Extract multi-word skills
  const multiWordSkills = Array.from(TECHNICAL_SKILLS)
    .filter(skill => skill.includes(' '))
    .filter(skill => text.toLowerCase().includes(skill));
  
  // Combine and deduplicate skills
  return [...new Set([...singleWordSkills, ...multiWordSkills])];
}

module.exports = {
  extractSkills
}; 