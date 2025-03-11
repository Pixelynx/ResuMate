const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');

router.post('/', resumeController.createResume);
router.get('/', resumeController.getAllResumes);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;