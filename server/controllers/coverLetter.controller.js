const db = require('../models');
const CoverLetter = db.coverLetters;
const Resume = db.resumes;
const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/ai.service');

exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.title || !req.body.content) {
      return res.status(400).send({
        message: "Title and content cannot be empty!"
      });
    }

    const resumeId = req.body.resumeId;
    let firstName = req.body.firstName || '';
    let lastName = req.body.lastName || '';
    let email = req.body.email || '';
    let phoneNumber = req.body.phoneNumber || '';
    let prevEmployed = req.body.prevEmployed || [];

    // If a resumeId is provided, fetch the resume data to populate fields
    if (resumeId) {
      try {
        const resume = await Resume.findByPk(resumeId);
        if (resume) {
          // Use resume data if not explicitly provided in the request
          firstName = req.body.firstName || resume.firstName || '';
          lastName = req.body.lastName || resume.lastName || '';
          email = req.body.email || resume.email || '';
          phoneNumber = req.body.phoneNumber || resume.phone || '';
          
          // Extract previous employment from work experience
          if (!req.body.prevEmployed && resume.workExperience) {
            try {
              const workExp = typeof resume.workExperience === 'string' 
                ? JSON.parse(resume.workExperience) 
                : resume.workExperience;
                
              prevEmployed = workExp && Array.isArray(workExp)
                ? workExp.map(job => job.companyName || '').filter(Boolean)
                : [];
            } catch (error) {
              console.error('Error parsing work experience:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    }

    const coverLetter = {
      id: uuidv4(),
      title: req.body.title,
      content: req.body.content,
      resumeId: resumeId,
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      jobDescription: req.body.jobDescription || '',
      firstName,
      lastName,
      email,
      phoneNumber,
      prevEmployed,
      createDate: new Date(),
      generationOptions: req.body.generationOptions || null
    };

    const data = await CoverLetter.create(coverLetter);
    
    // Log the created cover letter for debugging
    console.log('Created cover letter:', JSON.stringify(data, null, 2));
    
    res.status(201).send(data);
  } catch (err) {
    console.error('Error in create cover letter:', err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Cover Letter."
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await CoverLetter.findAll({
      order: [['updatedAt', 'DESC']]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving cover letters."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await CoverLetter.findByPk(id);
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cover Letter with id=${id} was not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Cover Letter with id=${id}`
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    // If we're updating the resumeId, fetch resume data to populate fields
    if (req.body.resumeId) {
      try {
        const resume = await Resume.findByPk(req.body.resumeId);
        if (resume) {
          // Only update fields from resume if they're not explicitly provided in the request
          if (!req.body.firstName) req.body.firstName = resume.firstName || '';
          if (!req.body.lastName) req.body.lastName = resume.lastName || '';
          if (!req.body.email) req.body.email = resume.email || '';
          if (!req.body.phoneNumber) req.body.phoneNumber = resume.phone || '';
          
          // Extract previous employment from work experience if not provided
          if (!req.body.prevEmployed && resume.workExperience) {
            try {
              const workExp = typeof resume.workExperience === 'string' 
                ? JSON.parse(resume.workExperience) 
                : resume.workExperience;
                
              req.body.prevEmployed = workExp && Array.isArray(workExp)
                ? workExp.map(job => job.companyName || '').filter(Boolean)
                : [];
            } catch (error) {
              console.error('Error parsing work experience:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    }

    // Make sure jobDescription is empty string not null for consistency
    if (req.body.jobDescription === null) {
      req.body.jobDescription = '';
    }

    const [num, updatedRows] = await CoverLetter.update(req.body, {
      where: { id: id },
      returning: true
    });

    if (num == 1) {
      const updatedCoverLetter = await CoverLetter.findByPk(id);
      res.send(updatedCoverLetter);
    } else {
      res.send({
        message: `Cannot update Cover Letter with id=${id}. Maybe Cover Letter was not found or req.body is empty!`
      });
    }
  } catch (err) {
    console.error('Error updating cover letter:', err);
    res.status(500).send({
      message: `Error updating Cover Letter with id=${id}`
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await CoverLetter.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "Cover Letter was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Cover Letter with id=${id}. Maybe Cover Letter was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Cover Letter with id=${id}`
    });
  }
};

// Generate a Cover Letter using AI
exports.generate = async (req, res) => {
  try {
    // Validate request
    if (!req.body.resumeId || !req.body.jobTitle || !req.body.company) {
      return res.status(400).send({
        success: false,
        message: "Resume ID, job title, and company are required!"
      });
    }

    const resumeId = req.body.resumeId;
    const jobDetails = {
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      jobDescription: req.body.jobDescription || ''
    };

    const options = {
      tone: req.body.options?.tone || 'professional',
      length: req.body.options?.length || 'medium',
      emphasis: req.body.options?.emphasis || [],
      customInstructions: req.body.options?.customInstructions,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: req.body.options?.temperature || 0.7,
      maxTokens: req.body.options?.maxTokens || 1000,
      topP: req.body.options?.topP || 1
    };
    
    // Fetch the resume data
    const resume = await Resume.findByPk(resumeId);
    if (!resume) {
      return res.status(404).send({
        success: false,
        message: `Resume with id=${resumeId} was not found.`
      });
    }

    // Generate cover letter using AI service
    const content = await aiService.generateCoverLetter(resume, jobDetails, options);

    // Extract previous employment from work experience
    let prevEmployed = [];
    if (resume.workExperience) {
      try {
        const workExp = typeof resume.workExperience === 'string' 
          ? JSON.parse(resume.workExperience) 
          : resume.workExperience;
          
        prevEmployed = workExp && Array.isArray(workExp)
          ? workExp.map(job => job.companyName || '').filter(Boolean)
          : [];
      } catch (error) {
        console.error('Error parsing work experience:', error);
      }
    }

    // Create a new cover letter in the database
    const coverLetter = {
      id: uuidv4(),
      title: `${jobDetails.jobTitle} at ${jobDetails.company}`,
      content: content,
      resumeId: resumeId,
      jobTitle: jobDetails.jobTitle,
      company: jobDetails.company,
      jobDescription: jobDetails.jobDescription || '',
      firstName: resume.firstName || '',
      lastName: resume.lastName || '',
      email: resume.email || '',
      phoneNumber: resume.phone || '',
      prevEmployed,
      createDate: new Date(),
      generationOptions: options // Store the options used for reference
    };

    const savedCoverLetter = await CoverLetter.create(coverLetter);
    
    // Send response with success flag and data
    res.status(201).send({
      success: true,
      data: savedCoverLetter,
      message: "Cover letter generated successfully"
    });
  } catch (err) {
    console.error('Error generating cover letter:', err);
    res.status(500).send({
      success: false,
      message: err.message || "Failed to generate cover letter."
    });
  }
};

// Helper function to generate cover letter content
function generateCoverLetterContent(
  fullName,
  title,
  skills,
  recentExperience,
  jobTitle,
  company,
  jobDescription
) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const skillsText = skills.length > 0 
    ? `My expertise includes ${skills.join(', ')}.` 
    : '';

  const experienceText = recentExperience 
    ? `In my recent role as ${recentExperience.jobTitle || 'professional'} at ${recentExperience.company || 'my previous company'}, ${
      recentExperience.description 
        ? `I ${recentExperience.description.substring(0, 100)}...`
        : 'I gained valuable experience in the field.'
    }` 
    : '';

  return `${currentDate}

Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at ${company}. As a ${title} with a strong background in the field, I am excited about the opportunity to contribute my skills and experience to your team.

${skillsText}

${experienceText}

${jobDescription ? `I was particularly drawn to this position because the job description aligns well with my background and career goals. ${jobDescription.length > 100 ? 'Your emphasis on ' + jobDescription.substring(0, 100) + '... resonates with my professional experience.' : ''}` : ''}

I am confident that my skills and experience make me a strong candidate for this position. I am excited about the opportunity to contribute to ${company}'s success and would welcome the chance to discuss how my background, skills, and experience would be an asset to your team.

Thank you for considering my application. I look forward to the possibility of discussing this opportunity with you further.

Sincerely,
${fullName}`;
} 