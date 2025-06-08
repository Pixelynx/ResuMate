// @ts-check
const { z } = require('zod');

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

module.exports = {
  validateSkillMatchRequest,
  validateJobAnalysisRequest,
  validateRecommendationsRequest
}; 