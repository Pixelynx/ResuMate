const { Router } = require('express');
const { SkillMatcher } = require('../services/matching/core/SkillMatcher');
const { TechnologyMapper } = require('../services/matching/core/TechnologyMapper');
const { validateSkillMatchRequest, validateJobAnalysisRequest, validateRecommendationsRequest } = require('../middleware/validation');
const { requestLogger } = require('../middleware/logging');

const router = Router();
const skillMatcher = new SkillMatcher();

// Apply middleware
router.use(requestLogger);

/**
 * @route POST /api/matching/score
 * @desc Calculate job match score based on skills
 */
router.post('/score', validateSkillMatchRequest, async (req, res) => {
  try {
    const { jobSkills, candidateSkills, config } = req.body;
    const result = await skillMatcher.matchSkills(jobSkills, candidateSkills, config);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to calculate match score',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/matching/analyze
 * @desc Analyze job description and resume for compatibility
 */
router.post('/analyze', validateJobAnalysisRequest, async (req, res) => {
  try {
    const { jobDescription, resume, includeContext = false } = req.body;
    
    // Extract skills from job description and resume
    const jobSkills = await extractSkills(jobDescription);
    const candidateSkills = await extractSkills(resume);
    
    // Get match results
    const matchResult = await skillMatcher.matchSkills(jobSkills, candidateSkills);
    
    // Add context if requested
    const response = {
      status: 'success',
      data: {
        matchResult,
        jobSkills,
        candidateSkills
      }
    };

    if (includeContext) {
      response.data.context = {
        skillContexts: jobSkills.map(skill => ({
          skill,
          context: TechnologyMapper.getSkillContext(skill)
        }))
      };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze job compatibility',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/matching/recommendations
 * @desc Get skill recommendations based on current skills and target role
 */
router.post('/recommendations', validateRecommendationsRequest, async (req, res) => {
  try {
    const { currentSkills, targetRole, experienceLevel } = req.body;
    
    // Get related skills for the target role
    const relatedSkills = currentSkills.flatMap(skill => 
      TechnologyMapper.getRelatedSkills(skill)
    );
    
    // Filter out skills the candidate already has
    const recommendations = relatedSkills.filter(skill => 
      !currentSkills.includes(skill)
    );
    
    // Get context and compensation factors for recommendations
    const enhancedRecommendations = recommendations.map(skill => ({
      skill,
      context: TechnologyMapper.getSkillContext(skill),
      compensationFactor: TechnologyMapper.getCompensationFactor(skill)
    }));

    res.json({
      status: 'success',
      data: {
        recommendations: enhancedRecommendations,
        currentSkillCount: currentSkills.length,
        recommendationCount: recommendations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper function to extract skills from text
 * @param {string} text - Text to extract skills from
 * @returns {Promise<string[]>} Array of extracted skills
 */
async function extractSkills(text) {
  // This is a placeholder - implement actual skill extraction logic
  // Could use NLP, keyword matching, or integration with a skills API
  return text.toLowerCase()
    .split(/[,.\s]+/)
    .filter(word => TechnologyMapper.findGroupForSkill(word) !== null);
}

module.exports = router; 