const Resume = require('../models/resume.models');

exports.createResume = async (req, res) => {
  try {
    const resume = await Resume.create(req.body);
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll();
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findByPk(req.params.id);
    if (resume) {
      res.json(resume);
    } else {
      res.status(404).json({ error: 'Resume not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const [updated] = await Resume.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedResume = await Resume.findByPk(req.params.id);
      res.json(updatedResume);
    } else {
      res.status(404).json({ error: 'Resume not found' });
    }
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
};