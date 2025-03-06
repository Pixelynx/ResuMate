const Resume = require('../models/resumeModel');

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.getAll();
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createResume = async (req, res) => {
  try {
    const newResume = await Resume.create(req.body);
    res.status(201).json(newResume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};