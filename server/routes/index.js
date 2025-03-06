const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');

router.get('/', resumeController.getAllResumes);
router.post('/', resumeController.createResume);

module.exports = router;