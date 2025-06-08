import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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

// Validation middleware functions
export const validateSkillMatchRequest = (req: Request, res: Response, next: NextFunction) => {
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

export const validateJobAnalysisRequest = (req: Request, res: Response, next: NextFunction) => {
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

export const validateRecommendationsRequest = (req: Request, res: Response, next: NextFunction) => {
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