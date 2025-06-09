// @ts-check
const { z } = require('zod');
const { ResumeDataError, ValidationError } = require('../services/generation/resumeDataProcessor');

// Validation schemas
const skillMatchRequestSchema = z.object({
  jobSkills: z.array(z.string()),
  candidateSkills: z.array(z.string()),
  config: z.object({
    baseWeight: z.number().optional(),
    contextMultiplier: z.number().optional(),
    compensationFactor: z.number().optional(),
    minThreshold: z.number().optional()
  }).optional()
});

const jobAnalysisRequestSchema = z.object({
  jobDescription: z.string(),
  resume: z.string(),
  includeContext: z.boolean().optional()
});

const recommendationsRequestSchema = z.object({
  currentSkills: z.array(z.string()),
  targetRole: z.string(),
  experienceLevel: z.string().optional()
});

/**
 * Validate skill match request middleware
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const validateSkillMatchRequest = (req, res, next) => {
  try {
    skillMatchRequestSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request data',
      details: error
    });
  }
};

/**
 * Validate job analysis request middleware
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const validateJobAnalysisRequest = (req, res, next) => {
  try {
    jobAnalysisRequestSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request data',
      details: error
    });
  }
};

/**
 * Validate recommendations request middleware
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const validateRecommendationsRequest = (req, res, next) => {
  try {
    recommendationsRequestSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request data',
      details: error
    });
  }
};

/**
 * Middleware to validate resume data before processing
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const validateResumeDataMiddleware = async (req, res, next) => {
  try {
    const resumeid = req.body.resumeid;
    if (!resumeid) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required',
        code: 'MISSING_RESUME_ID'
      });
    }

    // Resume data validation will be handled by extractCompleteResumeData
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code,
        field: error.field,
        suggestions: error.suggestions
      });
    }
    
    if (error instanceof ResumeDataError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details
      });
    }

    next(error);
  }
};

/**
 * Middleware to validate job details before processing
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const validateJobDetailsMiddleware = (req, res, next) => {
  try {
    const { jobtitle, company } = req.body;
    const missingFields = [];

    if (!jobtitle) missingFields.push('jobtitle');
    if (!company) missingFields.push('company');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required job details',
        code: 'MISSING_JOB_DETAILS',
        details: {
          missingFields,
          suggestions: [
            'Please provide both job title and company name',
            'These fields are required for generating a targeted cover letter'
          ]
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate generation options
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const validateGenerationOptionsMiddleware = (req, res, next) => {
  try {
    const options = req.body.options || {};
    
    // Validate tone if provided
    if (options.tone && !['professional', 'enthusiastic', 'confident', 'humble'].includes(options.tone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tone specified',
        code: 'INVALID_TONE',
        details: {
          allowedTones: ['professional', 'enthusiastic', 'confident', 'humble'],
          suggestions: [
            'Please choose from the allowed tone options',
            'If unsure, omit the tone option to use the default professional tone'
          ]
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateSkillMatchRequest,
  validateJobAnalysisRequest,
  validateRecommendationsRequest,
  validateResumeDataMiddleware,
  validateJobDetailsMiddleware,
  validateGenerationOptionsMiddleware
}; 