const db = require('../models');
const Resume = db.resumes;

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{3}[-.]?\d{3}[-.]?\d{4}$/;
  return phoneRegex.test(phone);
};

// Simplified validation - only check if required fields exist
const validateRequiredFields = (data) => {
  const errors = [];
  
  // Validate personal details
  if (!data.personalDetails) {
    errors.push('Personal details are required');
  } else {
    const { firstName, lastName, email, phone, location } = data.personalDetails;
    
    if (!firstName || firstName.trim() === '') {
      errors.push('First name is required');
    }
    
    if (!lastName || lastName.trim() === '') {
      errors.push('Last name is required');
    }
    
    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Invalid email format');
    }
    
    if (!phone || phone.trim() === '') {
      errors.push('Phone number is required');
    } else if (!validatePhone(phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (!location || location.trim() === '') {
      errors.push('Location is required');
    }
  }
  
  return errors;
};

exports.createResume = async (req, res) => {
  try {
    console.log('Creating resume with data:', JSON.stringify(req.body, null, 2));
    
    // Log dates for debugging
    if (req.body.workExperience && req.body.workExperience.length > 0) {
      console.log('Work Experience dates:');
      req.body.workExperience.forEach((exp, i) => {
        console.log(`- Entry ${i+1}:`);
        console.log(`  startDate: ${exp.startDate}`);
        console.log(`  endDate: ${exp.endDate}`);
        console.log(`  Types: startDate (${typeof exp.startDate}), endDate (${typeof exp.endDate})`);
      });
    }
    
    // Validate request body - only basic existence checks
    const validationErrors = validateRequiredFields(req.body);
    if (validationErrors.length > 0) {
      console.log('Resume creation failed due to validation errors');
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const { personalDetails, workExperience, education, skills, certifications, projects } = req.body;
    
    /* 
    // Clean date fields to ensure proper format before saving
    const cleanWorkExperience = workExperience && workExperience.map(exp => ({
      ...exp,
      startDate: exp.startDate, // Keep as is, PostgreSQL/Sequelize will handle the conversion
      endDate: exp.endDate  // Keep as is, PostgreSQL/Sequelize will handle the conversion
    }));
    */
    
    console.log('Creating resume in database...');
    const resume = await Resume.create({
      // Personal details
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      title: personalDetails.title,
      email: personalDetails.email,
      phone: personalDetails.phone,
      location: personalDetails.location,
      linkedin: personalDetails.linkedin,
      website: personalDetails.website,
      github: personalDetails.github,
      instagram: personalDetails.instagram,
      
      workExperience: workExperience,
      education,
      skills,
      certifications,
      projects
    });
    console.log('Resume created successfully with ID:', resume.id);
    
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
      projects: resume.projects,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    };
    
    console.log('Sending formatted resume response');
    res.status(201).json(formattedResume);
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll();
    const formattedResumes = resumes.map(resume => ({
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
      projects: resume.projects,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }));
    res.json(formattedResumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findByPk(req.params.id);
    if (resume) {
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
        projects: resume.projects,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      };
      
      res.json(formattedResume);
    } else {
      res.status(404).json({ error: 'Resume not found' });
    }
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    console.log(`Updating resume with ID ${req.params.id}`);
    console.log('Update data:', JSON.stringify(req.body, null, 2));
    
    // Log dates for debugging
    if (req.body.workExperience && req.body.workExperience.length > 0) {
      console.log('Work Experience dates:');
      req.body.workExperience.forEach((exp, i) => {
        console.log(`- Entry ${i+1}:`);
        console.log(`  startDate: ${exp.startDate}`);
        console.log(`  endDate: ${exp.endDate}`);
        console.log(`  Types: startDate (${typeof exp.startDate}), endDate (${typeof exp.endDate})`);
      });
    }
    
    // Basic validation - only check required fields
    const validationErrors = validateRequiredFields(req.body);
    if (validationErrors.length > 0) {
      console.log('Resume update failed due to validation errors');
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }
    
    const { personalDetails, workExperience, education, skills, certifications, projects } = req.body;
    
    console.log('Updating resume in database...');
    const [updated] = await Resume.update({
      // Personal details
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      title: personalDetails.title,
      email: personalDetails.email,
      phone: personalDetails.phone,
      location: personalDetails.location,
      linkedin: personalDetails.linkedin,
      website: personalDetails.website,
      github: personalDetails.github,
      instagram: personalDetails.instagram,
      
      workExperience: workExperience,
      education,
      skills,
      certifications,
      projects
    }, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      console.log('Resume updated successfully');
      const updatedResume = await Resume.findByPk(req.params.id);
      
      const formattedResume = {
        id: updatedResume.id,
        personalDetails: {
          firstName: updatedResume.firstName,
          lastName: updatedResume.lastName,
          title: updatedResume.title,
          email: updatedResume.email,
          phone: updatedResume.phone,
          location: updatedResume.location,
          linkedin: updatedResume.linkedin,
          website: updatedResume.website,
          github: updatedResume.github,
          instagram: updatedResume.instagram,
        },
        workExperience: updatedResume.workExperience,
        education: updatedResume.education,
        skills: updatedResume.skills,
        certifications: updatedResume.certifications,
        projects: updatedResume.projects,
        createdAt: updatedResume.createdAt,
        updatedAt: updatedResume.updatedAt
      };
      
      console.log('Sending formatted resume response');
      res.json(formattedResume);
    } else {
      console.log(`Resume with ID ${req.params.id} not found`);
      res.status(404).json({ error: 'Resume not found' });
    }
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    // Find related cover letters before deleting the resume
    const CoverLetter = db.coverLetters;
    const relatedCoverLetters = await CoverLetter.findAll({
      where: { resumeId: req.params.id }
    });
    
    // Delete the resume - this will cascade delete all related cover letters
    // due to the onDelete: 'CASCADE' configuration in the model associations
    const deleted = await Resume.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      res.status(200).json({
        success: true,
        message: `Resume with id=${req.params.id} was deleted successfully`,
        relatedCoverLettersDeleted: relatedCoverLetters.length
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: 'Resume not found' 
      });
    }
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};