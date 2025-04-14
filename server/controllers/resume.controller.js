const db = require('../models');
const Resume = db.resumes;

// Validation helper functions
/* 
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  console.log('Validating phone format:', phone);
  
  // Handle common formatting patterns
  // Accept both standard US formats and international formats with +1 prefix
  // Including formats like: +1 123-456-7890, (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^(\+1\s?)?((\(\d{3}\))|\d{3})[-\s]?\d{3}[-\s]?\d{4}$/;
  
  const isValid = phoneRegex.test(phone);
  console.log('Phone validation result:', isValid ? 'Valid' : 'Invalid');
  return isValid;
};
*/

// Simplified validation - only check if required fields exist
const validateRequiredFields = (data) => {
  console.log('Starting basic resume validation...');
  const errors = [];
  
  // Validate personal details
  if (!data.personalDetails) {
    errors.push('Personal details are required');
    console.log('Validation failed: Personal details missing');
    return errors;
  }
  
  const { firstname, lastname, email, phone, location } = data.personalDetails;
  
  if (!firstname || firstname.trim() === '') {
    errors.push('First name is required');
    console.log('Validation failed: First name missing');
  }
  
  if (!lastname || lastname.trim() === '') {
    errors.push('Last name is required');
    console.log('Validation failed: Last name missing');
  }
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
    console.log('Validation failed: Email missing');
  }
  
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
    console.log('Validation failed: Phone number missing');
  }
  
  if (!location || location.trim() === '') {
    errors.push('Location is required');
    console.log('Validation failed: Location missing');
  }
  
  // Log validation result
  if (errors.length > 0) {
    console.log('Validation errors:', errors);
  } else {
    console.log('Resume validation passed');
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
      firstname: personalDetails.firstname,
      lastname: personalDetails.lastname,
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
        firstname: resume.firstname,
        lastname: resume.lastname,
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
        firstname: resume.firstname,
        lastname: resume.lastname,
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
          firstname: resume.firstname,
          lastname: resume.lastname,
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
      firstname: personalDetails.firstname,
      lastname: personalDetails.lastname,
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
          firstname: updatedResume.firstname,
          lastname: updatedResume.lastname,
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
    const CoverLetter = db.coverletters;
    const relatedCoverLetters = await CoverLetter.findAll({
      where: { resumeid: req.params.id }
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