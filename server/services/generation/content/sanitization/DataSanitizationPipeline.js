// @ts-check

/**
 * @typedef {import('../../../ai.service').ResumeData} ResumeData
 * @typedef {import('../../../ai.service').JobDetails} JobDetails
 */

/**
 * @typedef {Object} SanitizationResult
 * @property {Object} data - Sanitized data
 * @property {Object} metadata - Processing metadata
 * @property {Object} metrics - Quality metrics
 * @property {string[]} warnings - Processing warnings
 * @property {string[]} errors - Processing errors
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Validation errors
 * @property {string[]} warnings - Validation warnings
 * @property {Object} metrics - Validation metrics
 */

/**
 * @typedef {'basicFields' | 'workExperience' | 'skills' | 'completenessValidation' | 'qualityScoring'} SanitizationStep
 */

class DataSanitizationPipeline {
  /**
   * Process data through the sanitization pipeline
   * @param {Object} data - Raw data to process
   * @returns {Promise<SanitizationResult>} Sanitized data with metadata
   */
  static async process(data) {
    const pipeline = new DataSanitizationPipeline();
    
    try {
      // Step 1: Basic field sanitization
      const sanitizedBasic = await pipeline.sanitizeBasicFields(data);
      
      // Step 2: Work experience sanitization
      const sanitizedWork = await pipeline.sanitizeWorkExperience(sanitizedBasic);
      
      // Step 3: Skills sanitization
      const sanitizedSkills = await pipeline.sanitizeSkills(sanitizedWork);
      
      // Step 4: Data completeness validation
      const validated = await pipeline.validateDataCompleteness(sanitizedSkills);
      
      // Step 5: Quality scoring
      const scored = await pipeline.calculateQualityScores(validated);
      
      // Step 6: Enrich with metadata
      const enriched = await pipeline.enrichWithMetadata(scored);
      
      return {
        data: enriched,
        metadata: pipeline.getMetadata(),
        metrics: pipeline.getMetrics(),
        warnings: pipeline.warnings,
        errors: pipeline.errors
      };
    } catch (error) {
      pipeline.errors.push(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  constructor() {
    this.warnings = [];
    this.errors = [];
    this.metrics = {
      completeness: 0,
      quality: 0,
      consistency: 0
    };
    /** @type {{ processedAt: Date, sanitizationSteps: SanitizationStep[] }} */
    this.metadata = {
      processedAt: new Date(),
      sanitizationSteps: []
    };
  }

  /**
   * Sanitize basic fields
   * @param {Object} data - Data to sanitize
   * @returns {Promise<Object>} Sanitized data
   */
  async sanitizeBasicFields(data) {
    const sanitized = { ...data };
    
    // Sanitize strings
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      }
    }
    
    // Sanitize dates
    if (sanitized.startDate) {
      sanitized.startDate = this.sanitizeDate(sanitized.startDate);
    }
    if (sanitized.endDate) {
      sanitized.endDate = this.sanitizeDate(sanitized.endDate);
    }
    
    this.metadata.sanitizationSteps.push('basicFields');
    return sanitized;
  }

  /**
   * Sanitize work experience entries
   * @param {Object} data - Data containing work experience
   * @returns {Promise<Object>} Data with sanitized work experience
   */
  async sanitizeWorkExperience(data) {
    if (!data.workExperience || !Array.isArray(data.workExperience)) {
      this.warnings.push('No work experience data to sanitize');
      return data;
    }

    data.workExperience = data.workExperience.map(exp => ({
      ...exp,
      jobTitle: this.sanitizeString(exp.jobTitle),
      company: this.sanitizeString(exp.company),
      description: this.sanitizeString(exp.description),
      startDate: this.sanitizeDate(exp.startDate),
      endDate: this.sanitizeDate(exp.endDate),
      achievements: Array.isArray(exp.achievements) 
        ? exp.achievements.map(a => this.sanitizeString(a))
        : []
    }));

    this.metadata.sanitizationSteps.push('workExperience');
    return data;
  }

  /**
   * Sanitize skills data
   * @param {Object} data - Data containing skills
   * @returns {Promise<Object>} Data with sanitized skills
   */
  async sanitizeSkills(data) {
    if (!data.skills) {
      this.warnings.push('No skills data to sanitize');
      return data;
    }

    // Split skills string and sanitize each skill
    if (typeof data.skills.skills_ === 'string') {
      data.skills.skills_ = data.skills.skills_
        .split(',')
        .map(skill => this.sanitizeString(skill))
        .filter(Boolean)
        .join(',');
    }

    this.metadata.sanitizationSteps.push('skills');
    return data;
  }

  /**
   * Validate data completeness
   * @param {Object} data - Data to validate
   * @returns {Promise<Object>} Validated data
   */
  async validateDataCompleteness(data) {
    const validation = this.validateRequiredFields(data);
    
    if (!validation.isValid) {
      this.errors.push(...validation.errors);
    }
    if (validation.warnings.length > 0) {
      this.warnings.push(...validation.warnings);
    }

    this.metrics.completeness = validation.metrics.completeness;
    this.metadata.sanitizationSteps.push('completenessValidation');
    
    return data;
  }

  /**
   * Calculate quality scores for the data
   * @param {Object} data - Data to score
   * @returns {Promise<Object>} Scored data
   */
  async calculateQualityScores(data) {
    this.metrics.quality = this.calculateContentQuality(data);
    this.metrics.consistency = this.calculateDataConsistency(data);
    
    this.metadata.sanitizationSteps.push('qualityScoring');
    return data;
  }

  /**
   * Enrich data with metadata
   * @param {Object} data - Data to enrich
   * @returns {Promise<Object>} Enriched data
   */
  async enrichWithMetadata(data) {
    return {
      ...data,
      metadata: {
        ...this.metadata,
        qualityMetrics: this.metrics
      }
    };
  }

  /**
   * Sanitize a string value
   * @param {string} value - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeString(value) {
    if (!value) return '';
    
    return value
      .trim()
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[^\w\s.,!?@#$%&*()-]/g, '') // Remove special chars except common punctuation
      .replace(/\.{3,}/g, '...') // Normalize ellipsis
      .replace(/!!+/g, '!') // Normalize multiple exclamation marks
      .replace(/\?!+/g, '?') // Normalize question-exclamation combinations
      .trim();
  }

  /**
   * Sanitize a date value
   * @param {string|Date} value - Date to sanitize
   * @returns {string} ISO date string or empty string
   */
  sanitizeDate(value) {
    if (!value) return '';
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        this.warnings.push(`Invalid date: ${value}`);
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      this.warnings.push(`Error parsing date: ${value}`);
      return '';
    }
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @returns {ValidationResult} Validation result
   */
  validateRequiredFields(data) {
    const errors = [];
    const warnings = [];
    let completeness = 0;
    let fieldsChecked = 0;

    // Required personal details
    if (!data.firstName || !data.lastName) {
      errors.push('Missing required name fields');
    }
    if (!data.email) {
      warnings.push('Missing email address');
    }
    fieldsChecked += 3;
    completeness += (data.firstName ? 1 : 0) + (data.lastName ? 1 : 0) + (data.email ? 1 : 0);

    // Work experience validation
    if (Array.isArray(data.workExperience)) {
      data.workExperience.forEach((exp, index) => {
        if (!exp.jobTitle) {
          errors.push(`Missing job title in experience #${index + 1}`);
        }
        if (!exp.company) {
          errors.push(`Missing company name in experience #${index + 1}`);
        }
        if (!exp.description) {
          warnings.push(`Missing description in experience #${index + 1}`);
        }
        fieldsChecked += 3;
        completeness += (exp.jobTitle ? 1 : 0) + (exp.company ? 1 : 0) + (exp.description ? 1 : 0);
      });
    } else {
      warnings.push('No work experience data provided');
    }

    // Skills validation
    if (!data.skills?.skills_) {
      warnings.push('No skills provided');
    } else {
      fieldsChecked += 1;
      completeness += 1;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        completeness: fieldsChecked > 0 ? completeness / fieldsChecked : 0
      }
    };
  }

  /**
   * Calculate content quality score
   * @param {Object} data - Data to analyze
   * @returns {number} Quality score (0-1)
   */
  calculateContentQuality(data) {
    let totalScore = 0;
    let sections = 0;

    // Work experience quality
    if (Array.isArray(data.workExperience)) {
      const expScores = data.workExperience.map(exp => {
        const hasQuantifiableResults = /\d+%|\$\d+|\d+ (users|customers|projects)/i.test(exp.description);
        const hasActionVerbs = /(developed|implemented|managed|led|created|designed)/i.test(exp.description);
        const hasDetail = exp.description.length > 100;
        
        return (hasQuantifiableResults ? 0.4 : 0) + 
               (hasActionVerbs ? 0.3 : 0) + 
               (hasDetail ? 0.3 : 0);
      });
      
      totalScore += expScores.reduce((a, b) => a + b, 0) / expScores.length;
      sections++;
    }

    // Skills quality
    if (data.skills?.skills_) {
      const skills = data.skills.skills_.split(',');
      const hasEnoughSkills = skills.length >= 5;
      const hasSpecificSkills = skills.some(s => /\b(javascript|python|java|react|node\.js|aws)\b/i.test(s));
      
      totalScore += (hasEnoughSkills ? 0.5 : 0) + (hasSpecificSkills ? 0.5 : 0);
      sections++;
    }

    return sections > 0 ? totalScore / sections : 0;
  }

  /**
   * Calculate data consistency score
   * @param {Object} data - Data to analyze
   * @returns {number} Consistency score (0-1)
   */
  calculateDataConsistency(data) {
    let consistencyScore = 1;
    
    // Check date consistency
    if (Array.isArray(data.workExperience)) {
      for (let i = 1; i < data.workExperience.length; i++) {
        const current = new Date(data.workExperience[i].startDate);
        const previous = new Date(data.workExperience[i-1].endDate || new Date());
        
        if (current > previous) {
          consistencyScore *= 0.8; // 20% penalty for each timeline inconsistency
        }
      }
    }

    // Check skills consistency with experience
    if (data.skills?.skills_ && Array.isArray(data.workExperience)) {
      const skills = new Set(data.skills.skills_.toLowerCase().split(',').map(s => s.trim()));
      const experienceSkills = new Set();
      
      data.workExperience.forEach(exp => {
        const foundSkills = exp.description.toLowerCase().match(/\b\w+\b/g) || [];
        foundSkills.forEach(skill => {
          if (skills.has(skill)) {
            experienceSkills.add(skill);
          }
        });
      });

      const skillConsistency = experienceSkills.size / skills.size;
      consistencyScore *= (0.7 + (skillConsistency * 0.3)); // Up to 30% impact
    }

    return Math.max(0, Math.min(1, consistencyScore));
  }

  getMetadata() {
    return this.metadata;
  }

  getMetrics() {
    return this.metrics;
  }
}

module.exports = DataSanitizationPipeline; 