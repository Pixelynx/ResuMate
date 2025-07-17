// @ts-check
const db = require('../models');
const { Op } = require('sequelize');

const Resume = db.resumes;
const CoverLetter = db.coverletters;

/**
 * Cleanup endpoint for auto-deletion of non-test data
 * Deletes resumes and cover letters created by non-test emails after 2 hours
 */
exports.cleanup = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log(`[${new Date().toISOString()}] Starting cleanup process...`);
    
    // Check if auto-delete is enabled
    const autoDeleteEnabled = process.env.ENABLE_AUTO_DELETE === 'true';
    if (!autoDeleteEnabled) {
      console.log('Auto-delete is disabled via ENABLE_AUTO_DELETE environment variable');
      return res.json({
        success: true,
        message: 'Auto-delete is disabled',
        enabled: false,
        executionTime: Date.now() - startTime
      });
    }
    
    // Get test email from environment
    const testEmail = process.env.TEST_EMAIL;
    if (!testEmail) {
      console.error('TEST_EMAIL environment variable not configured');
      return res.status(500).json({
        success: false,
        message: 'TEST_EMAIL not configured',
        code: 'CONFIG_ERROR'
      });
    }
    
    // Calculate cutoff time (2 hours ago)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 2);
    
    console.log(`Cleanup cutoff time: ${cutoffTime.toISOString()}`);
    console.log(`Test email to preserve: ${testEmail}`);
    
    // Start a database transaction
    const transaction = await db.sequelize.transaction();
    
    try {
      // Find resumes to delete (created more than 2 hours ago by non-test emails)
      const resumesToDelete = await Resume.findAll({
        where: {
          createdAt: {
            [Op.lt]: cutoffTime
          },
          email: {
            [Op.ne]: testEmail
          }
        },
        attributes: ['id', 'email', 'firstname', 'lastname', 'createdAt'],
        transaction
      });
      
      console.log(`Found ${resumesToDelete.length} resumes to delete`);
      
      // Find cover letters to delete (created more than 2 hours ago by non-test emails)
      const coverLettersToDelete = await CoverLetter.findAll({
        where: {
          createdAt: {
            [Op.lt]: cutoffTime
          },
          email: {
            [Op.ne]: testEmail
          }
        },
        attributes: ['id', 'email', 'firstname', 'lastname', 'createdAt'],
        transaction
      });
      
      console.log(`Found ${coverLettersToDelete.length} cover letters to delete`);
      
      let deletedResumes = 0;
      let deletedCoverLetters = 0;
      
      // Delete resumes (this will cascade delete related cover letters)
      if (resumesToDelete.length > 0) {
        const resumeIds = resumesToDelete.map(resume => resume.id);
        deletedResumes = await Resume.destroy({
          where: {
            id: {
              [Op.in]: resumeIds
            }
          },
          transaction
        });
        
        console.log(`Deleted ${deletedResumes} resumes`);
      }
      
      // Delete standalone cover letters (not associated with resumes)
      if (coverLettersToDelete.length > 0) {
        const coverLetterIds = coverLettersToDelete.map(cl => cl.id);
        deletedCoverLetters = await CoverLetter.destroy({
          where: {
            id: {
              [Op.in]: coverLetterIds
            }
          },
          transaction
        });
        
        console.log(`Deleted ${deletedCoverLetters} cover letters`);
      }
      
      // Commit the transaction
      await transaction.commit();
      
      const executionTime = Date.now() - startTime;
      
      // Log cleanup results
      console.log(`[${new Date().toISOString()}] Cleanup completed successfully:`);
      console.log(`- Resumes deleted: ${deletedResumes}`);
      console.log(`- Cover letters deleted: ${deletedCoverLetters}`);
      console.log(`- Execution time: ${executionTime}ms`);
      console.log(`- Cutoff time: ${cutoffTime.toISOString()}`);
      console.log(`- Test email preserved: ${testEmail}`);
      
      res.json({
        success: true,
        message: 'Cleanup completed successfully',
        results: {
          resumesDeleted: deletedResumes,
          coverLettersDeleted: deletedCoverLetters,
          cutoffTime: cutoffTime.toISOString(),
          testEmailPreserved: testEmail
        },
        executionTime,
        enabled: true
      });
      
    } catch (dbError) {
      // Rollback transaction on error
      await transaction.rollback();
      throw dbError;
    }
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cleanup process failed:`, error);
    
    const executionTime = Date.now() - startTime;
    
    res.status(500).json({
      success: false,
      message: 'Cleanup process failed',
      error: error.message,
      executionTime,
      code: 'CLEANUP_ERROR'
    });
  }
};

/**
 * Health check endpoint for monitoring
 */
exports.health = async (req, res) => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    
    // Get basic stats
    const resumeCount = await Resume.count();
    const coverLetterCount = await CoverLetter.count();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        totalResumes: resumeCount,
        totalCoverLetters: coverLetterCount
      },
      config: {
        autoDeleteEnabled: process.env.ENABLE_AUTO_DELETE === 'true',
        testEmailConfigured: !!process.env.TEST_EMAIL
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}; 