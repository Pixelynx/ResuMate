const Resume = require('../models/resume.models');

exports.createResume = async (req, res) => {
  try {
    const { personalDetails, workExperience, education, skills, certifications, projects } = req.body;
    
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
      
      workExperience,
      education,
      skills,
      certifications,
      projects
    });
    
    res.status(201).json(resume);
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll();
    res.json(resumes);
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
    const { personalDetails, workExperience, education, skills, certifications, projects } = req.body;
    
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
      
      workExperience,
      education,
      skills,
      certifications,
      projects
    }, {
      where: { id: req.params.id }
    });
    
    if (updated) {
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
      
      res.json(formattedResume);
    } else {
      res.status(404).json({ error: 'Resume not found' });
    }
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const deleted = await Resume.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Resume not found' });
    }
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: error.message });
  }
};