/**
 * Utility class for normalizing and comparing skill names
 */
class SkillNormalizer {
  /**
   * Common variations of skill names
   * @type {Object.<string, string[]>}
   * @private
   */
  static skillVariations = {
    'javascript': ['js', 'ecmascript', 'es6', 'es2015+'],
    'typescript': ['ts'],
    'python': ['py', 'python3'],
    'react': ['reactjs', 'react.js'],
    'node.js': ['nodejs', 'node'],
    'postgresql': ['postgres', 'psql'],
    'mongodb': ['mongo'],
    'amazon web services': ['aws'],
    'google cloud platform': ['gcp'],
    'microsoft azure': ['azure'],
    'continuous integration': ['ci'],
    'continuous deployment': ['cd'],
    'devops': ['dev ops', 'development operations'],
    'machine learning': ['ml'],
    'artificial intelligence': ['ai']
  };

  /**
   * Common prefixes to normalize
   * @type {string[]}
   * @private
   */
  static commonPrefixes = [
    'senior', 'junior', 'lead', 'principal', 'expert',
    'certified', 'professional', 'advanced'
  ];

  /**
   * Normalize a skill name by removing common variations and formatting
   * @param {string} skill - Skill name to normalize
   * @returns {string} Normalized skill name
   */
  static normalizeSkill(skill) {
    let normalized = skill.toLowerCase().trim();
    
    // Remove common prefixes
    this.commonPrefixes.forEach(prefix => {
      normalized = normalized.replace(new RegExp(`^${prefix}\\s+`, 'i'), '');
    });

    // Check for known variations
    for (const [standard, variations] of Object.entries(this.skillVariations)) {
      if (variations.includes(normalized)) {
        return standard;
      }
    }

    return normalized;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   * @private
   */
  static levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Check if two skills are similar using fuzzy matching
   * @param {string} skill1 - First skill
   * @param {string} skill2 - Second skill
   * @param {number} [threshold=0.8] - Similarity threshold
   * @returns {boolean} Whether the skills are similar
   */
  static areSimilarSkills(skill1, skill2, threshold = 0.8) {
    const normalized1 = this.normalizeSkill(skill1);
    const normalized2 = this.normalizeSkill(skill2);

    if (normalized1 === normalized2) return true;

    // Check for known variations
    for (const [_, variations] of Object.entries(this.skillVariations)) {
      if (variations.includes(normalized1) && variations.includes(normalized2)) {
        return true;
      }
    }

    // Calculate similarity using Levenshtein distance
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
  }

  /**
   * Find the closest matching skill from a list of skills
   * @param {string} skill - Skill to match
   * @param {string[]} skillList - List of skills to match against
   * @returns {string|null} Closest matching skill or null if no match found
   */
  static findClosestSkill(skill, skillList) {
    const normalized = this.normalizeSkill(skill);
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const candidate of skillList) {
      const normalizedCandidate = this.normalizeSkill(candidate);
      
      if (normalized === normalizedCandidate) {
        return candidate;
      }

      const maxLength = Math.max(normalized.length, normalizedCandidate.length);
      const distance = this.levenshteinDistance(normalized, normalizedCandidate);
      const similarity = 1 - distance / maxLength;

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = candidate;
      }
    }

    return bestSimilarity >= 0.8 ? bestMatch : null;
  }
}

module.exports = {
  SkillNormalizer
}; 