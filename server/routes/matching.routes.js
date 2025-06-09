const express = require('express');
const router = express.Router();
const MatchingIntegrationService = require('../services/matching/integration/MatchingIntegrationService');
const { extractCompleteResumeData } = require('../services/generation/resumeDataProcessor');
const { validateResumeDataMiddleware, validateJobDetailsMiddleware } = require('../middleware/validation');

const matchingService = new MatchingIntegrationService({
  cacheEnabled: process.env.MATCHING_CACHE_ENABLED !== 'false',
  cacheTTL: parseInt(process.env.MATCHING_CACHE_TTL) || 3600000,
  maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_MATCHING) || 10
});

/**
 * Get relevant content for cover letter generation
 * @route GET /api/matching/relevance/:resumeId/:jobId
 */
router.get('/relevance/:resumeId/:jobId', [
  validateResumeDataMiddleware,
  validateJobDetailsMiddleware
], async (req, res) => {
  const startTime = performance.now();
  
  try {
    const resumeData = await extractCompleteResumeData(req.resume);
    const jobDetails = {
      jobTitle: req.job.jobTitle,
      company: req.job.company,
      jobDescription: req.job.jobDescription
    };

    const relevanceData = await matchingService.getRelevantContent(resumeData, jobDetails);
    
    res.json({
      success: true,
      data: relevanceData,
      metadata: {
        processingTime: performance.now() - startTime,
        cacheHit: relevanceData.fromCache || false
      }
    });
  } catch (error) {
    console.error('Error in matching relevance:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error in matching service',
        code: error instanceof Error ? error.code : 'UNKNOWN_ERROR',
        details: error instanceof Error ? error.details : undefined
      }
    });
  }
});

/**
 * Get experience relevance scores
 * @route GET /api/matching/experiences/:resumeId/:jobId
 */
router.get('/experiences/:resumeId/:jobId', [
  validateResumeDataMiddleware,
  validateJobDetailsMiddleware
], async (req, res) => {
  try {
    const resumeData = await extractCompleteResumeData(req.resume);
    const jobDetails = {
      jobTitle: req.job.jobTitle,
      company: req.job.company,
      jobDescription: req.job.jobDescription
    };

    const experiences = await matchingService.getRelevantExperiences(resumeData, jobDetails);
    
    res.json({
      success: true,
      data: experiences
    });
  } catch (error) {
    console.error('Error getting relevant experiences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error getting experiences',
        code: error instanceof Error ? error.code : 'UNKNOWN_ERROR'
      }
    });
  }
});

/**
 * Get skill prioritization
 * @route GET /api/matching/skills/:resumeId/:jobId
 */
router.get('/skills/:resumeId/:jobId', [
  validateResumeDataMiddleware,
  validateJobDetailsMiddleware
], async (req, res) => {
  try {
    const resumeData = await extractCompleteResumeData(req.resume);
    const jobDetails = {
      jobTitle: req.job.jobTitle,
      company: req.job.company,
      jobDescription: req.job.jobDescription
    };

    const relevanceData = await matchingService.getRelevantContent(resumeData, jobDetails);
    
    res.json({
      success: true,
      data: relevanceData.skills
    });
  } catch (error) {
    console.error('Error in skill prioritization:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error in skill analysis',
        code: error instanceof Error ? error.code : 'UNKNOWN_ERROR'
      }
    });
  }
});

/**
 * Get keyword optimization suggestions
 * @route GET /api/matching/keywords/:resumeId/:jobId
 */
router.get('/keywords/:resumeId/:jobId', [
  validateResumeDataMiddleware,
  validateJobDetailsMiddleware
], async (req, res) => {
  try {
    const resumeData = await extractCompleteResumeData(req.resume);
    const jobDetails = {
      jobTitle: req.job.jobTitle,
      company: req.job.company,
      jobDescription: req.job.jobDescription
    };

    const relevanceData = await matchingService.getRelevantContent(resumeData, jobDetails);
    
    res.json({
      success: true,
      data: relevanceData.keywords
    });
  } catch (error) {
    console.error('Error in keyword optimization:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error in keyword analysis',
        code: error instanceof Error ? error.code : 'UNKNOWN_ERROR'
      }
    });
  }
});

module.exports = router; 