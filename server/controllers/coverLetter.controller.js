const db = require('../models');
const CoverLetter = db.coverletters;
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

    const resumeid = req.body.resumeid;
    let firstname = req.body.firstname || '';
    let lastname = req.body.lastname || '';
    let email = req.body.email || '';
    let phoneNumber = req.body.phoneNumber || '';
    let prevEmployed = req.body.prevEmployed || [];

    // If a resumeid is provided, fetch the resume data to populate fields
    if (resumeid) {
      try {
        const resume = await Resume.findByPk(resumeid);
        if (resume) {
          // Use resume data if not explicitly provided in the request
          firstname = req.body.firstname || resume.firstname || '';
          lastname = req.body.lastname || resume.lastname || '';
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
      resumeid: resumeid,
      jobtitle: req.body.jobtitle,
      company: req.body.company,
      jobdescription: req.body.jobdescription || '',
      firstname,
      lastname,
      email,
      phoneNumber,
      prevEmployed,
      createdAt: new Date(),
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
    // If we're updating the resumeid, fetch resume data to populate fields
    if (req.body.resumeid) {
      try {
        const resume = await Resume.findByPk(req.body.resumeid);
        if (resume) {
          // Only update fields from resume if they're not explicitly provided in the request
          if (!req.body.firstname) req.body.firstname = resume.firstname || '';
          if (!req.body.lastname) req.body.lastname = resume.lastname || '';
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

    // Make sure jobdescription is empty string not null for consistency
    if (req.body.jobdescription === null) {
      req.body.jobdescription = '';
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
    // Extract and normalize the resume ID
    const resumeId = req.body.resumeId || req.body.resumeid;
    
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required'
      });
    }

    // Get resume data
    const resume = await Resume.findByPk(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const jobDetails = {
      company: req.body.company,
      jobTitle: req.body.jobtitle || req.body.jobTitle,
      jobDescription: req.body.jobdescription || req.body.jobDescription
    };

    // Validate job details
    if (!jobDetails.company || !jobDetails.jobTitle || !jobDetails.jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job details are incomplete'
      });
    }

    // Generate cover letter
    const result = await aiService.generateCoverLetter(resume, jobDetails);

    // If incompatible, return the assessment results without creating a DB record
    if (!result.isCompatible) {
      return res.status(200).json({
        success: true,
        isCompatible: false,
        blockers: result.blockers,
        compatibilityScore: result.compatibilityScore,
        metadata: result.metadata
      });
    }

    // Only create DB record if compatible and generation was successful
    const coverLetter = await CoverLetter.create({
      id: uuidv4(),
      resumeid: resumeId,
      jobtitle: jobDetails.jobTitle,
      company: jobDetails.company,
      jobdescription: jobDetails.jobDescription,
      content: result.content,
      title: `${jobDetails.jobTitle} at ${jobDetails.company}`,
      firstname: req.body.firstname || resume.firstname || '',
      lastname: req.body.lastname || resume.lastname || '',
      email: req.body.email || resume.email || '',
      phoneNumber: req.body.phoneNumber || resume.phone || '',
      generationOptions: req.body.options || null
    });

    return res.status(201).json({
      success: true,
      message: 'Cover letter generated successfully',
      data: {
        id: coverLetter.id,
        content: coverLetter.content,
        title: coverLetter.title,
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('Error in cover letter generation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter',
      error: error.message
    });
  }
};

