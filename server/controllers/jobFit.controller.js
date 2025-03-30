const db = require('../models');
const Resume = db.resumes;
const CoverLetter = db.coverLetters;
const { calculateJobFitScore } = require('../services/jobFitService');

exports.getJobFitScore = async (req, res) => {
  try {
    const { coverLetterId } = req.params;
    
    // Validate request
    if (!coverLetterId) {
      return res.status(400).json({
        success: false,
        message: "Cover letter ID is required"
      });
    }
    
    // Find the cover letter
    const coverLetter = await CoverLetter.findByPk(coverLetterId);
    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: `Cover letter with id=${coverLetterId} was not found`
      });
    }
    
    // Get the associated resume
    const resume = await Resume.findByPk(coverLetter.resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: `Associated resume was not found`
      });
    }
    
    // Check if job description exists
    if (!coverLetter.jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Job description is required for scoring"
      });
    }
    
    // Format resume data
    const formattedResume = {
      id: resume.id,
      personalDetails: {
        firstName: resume.firstName,
        lastName: resume.lastName,
        title: resume.title,
        email: resume.email,
        phone: resume.phone,
        location: resume.location,
        linkedin: resume.linkedin,
        website: resume.website,
        github: resume.github,
        instagram: resume.instagram,
      },
      workExperience: resume.workExperience,
      education: resume.education,
      skills: resume.skills,
      certifications: resume.certifications,
      projects: resume.projects
    };
    
    // Calculate job fit score
    const result = await calculateJobFitScore(formattedResume, coverLetter);
    
    // Return the score and explanation
    res.status(200).json({
      success: true,
      data: {
        score: result.score,
        explanation: result.explanation
      }
    });
  } catch (error) {
    console.error("Error calculating job fit score:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while calculating job fit score"
    });
  }
}; 