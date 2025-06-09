/**
 * Custom error class for resume data processing
 * @extends Error
 */
class ResumeDataError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} [details] - Additional error details
   */
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ResumeDataError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Custom error class for data validation failures
 * @extends ResumeDataError
 */
class ValidationError extends ResumeDataError {
  /**
   * @param {string} field - Field that failed validation
   * @param {string} message - Error message
   * @param {string[]} [suggestions] - Suggestions for fixing the error
   */
  constructor(field, message, suggestions = []) {
    super(`Validation failed for ${field}: ${message}`, 'VALIDATION_ERROR');
    this.field = field;
    this.suggestions = suggestions;
  }
}

/**
 * @typedef {Object} StandardizedResumeData
 * @property {Object} personalDetails - Personal information
 * @property {string} personalDetails.fullName - Full name
 * @property {string} [personalDetails.email] - Email address
 * @property {string} [personalDetails.phone] - Phone number
 * @property {Object} [personalDetails.location] - Location information
 * @property {string} [personalDetails.linkedIn] - LinkedIn profile
 * @property {string} [personalDetails.portfolio] - Portfolio URL
 * @property {Array<WorkExperience>} workExperience - Work experience entries
 * @property {Object} skills - Skills information
 * @property {string[]} skills.technical - Technical skills
 * @property {string[]} skills.soft - Soft skills
 * @property {string[]} [skills.certifications] - Certifications
 * @property {Array<Education>} education - Education entries
 * @property {Array<Project>} projects - Project entries
 * @property {Object} [metadata] - Additional metadata
 * @property {number} [metadata.completenessScore] - Data completeness score
 * @property {Date} [metadata.lastUpdated] - Last update timestamp
 * @property {Object} [metadata.dataQuality] - Data quality metrics
 */

/**
 * @typedef {Object} WorkExperience
 * @property {string} company - Company name
 * @property {string} position - Job position
 * @property {Date} startDate - Start date
 * @property {Date} [endDate] - End date
 * @property {string} description - Job description
 * @property {string[]} achievements - Key achievements
 * @property {string[]} technologies - Technologies used
 */

/**
 * @typedef {Object} Education
 * @property {string} institution - Institution name
 * @property {string} degree - Degree name
 * @property {Date} graduationDate - Graduation date
 * @property {number} [gpa] - GPA if available
 */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string[]} technologies - Technologies used
 * @property {string} [url] - Project URL if available
 */

/**
 * Extracts and normalizes complete resume data
 * @param {Object} resume - Raw resume data from database
 * @returns {Promise<StandardizedResumeData>} Standardized resume data
 * @throws {ResumeDataError} If data extraction fails
 */
const extractCompleteResumeData = async (resume, updatedPersonalDetails = null) => {
  try {
    // Extract and normalize personal details
    const personalDetails = updatedPersonalDetails || extractPersonalDetails(resume);
    
    // Add null checks for arrays before processing
    const workExperience = processWorkExperience(resume.workExperience || []);
    const skills = processSkills(resume.skills || []);
    const education = processEducation(resume.education || []);
    const projects = processProjects(resume.projects || []);
    
    // Calculate completeness score and metadata
    const metadata = await calculateMetadata({
      personalDetails,
      workExperience,
      skills,
      education,
      projects
    });

    return {
      personalDetails,
      workExperience,
      skills,
      education,
      projects,
      metadata
    };
  } catch (error) {
    throw new ResumeDataError(
      'Failed to extract resume data',
      'EXTRACTION_ERROR',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

/**
 * Extracts and validates personal details
 * @param {Object} resume - Resume data
 * @returns {Object} Normalized personal details
 * @throws {ValidationError} If required fields are missing
 */
const extractPersonalDetails = (resume) => {
  const missingFields = [];
  
  if (!resume.firstname) missingFields.push('firstname');
  if (!resume.lastname) missingFields.push('lastname');
  
  if (missingFields.length > 0) {
    throw new ValidationError('personalDetails', 'Missing required fields', [
      'Please provide your full name',
      'First and last name are required for the cover letter'
    ]);
  }

  return {
    fullName: `${resume.firstname} ${resume.lastname}`,
    email: resume.email || '',
    phone: resume.phone || '',
    location: resume.location || {},
    linkedIn: resume.linkedin || '',
    portfolio: resume.website || ''
  };
};

/**
 * Processes and normalizes work experience entries
 * @param {Array<Object>} experiences - Raw work experience data
 * @returns {Array<WorkExperience>} Normalized work experience entries
 */
const processWorkExperience = (experiences = []) => {
  return experiences.map(exp => ({
    company: exp.companyName || '',
    position: exp.jobtitle || '',
    startDate: new Date(exp.startDate || Date.now()),
    endDate: exp.endDate ? new Date(exp.endDate) : undefined,
    description: exp.description || '',
    achievements: extractAchievements(exp.description),
    technologies: extractTechnologies(exp.description)
  })).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
};

/**
 * Processes and categorizes skills
 * @param {Object} skillsData - Raw skills data
 * @returns {Object} Categorized skills
 */
const processSkills = (skillsData) => {
  const skills = {
    technical: [],
    soft: [],
    certifications: []
  };

  if (skillsData?.skills_) {
    const allSkills = skillsData.skills_.split(',').map(s => s.trim());
    
    // Categorize skills (simplified version - could be enhanced with ML/AI)
    skills.technical = allSkills.filter(s => 
      /^(programming|software|database|framework|tool|technology)/i.test(s)
    );
    skills.soft = allSkills.filter(s => 
      /^(communication|leadership|management|teamwork|problem solving)/i.test(s)
    );
  }

  return skills;
};

/**
 * Processes education entries
 * @param {Array<Object>} educationData - Raw education data
 * @returns {Array<Education>} Normalized education entries
 */
const processEducation = (educationData = []) => {
  return educationData.map(edu => ({
    institution: edu.institutionName || '',
    degree: edu.degree || '',
    graduationDate: new Date(edu.endDate || Date.now()),
    gpa: edu.gpa ? parseFloat(edu.gpa) : undefined
  }));
};

/**
 * Processes project entries
 * @param {Array<Object>} projectsData - Raw project data
 * @returns {Array<Project>} Normalized project entries
 */
const processProjects = (projectsData = []) => {
  return projectsData.map(proj => ({
    title: proj.title || '',
    description: proj.description || '',
    technologies: (proj.technologies || '').split(',').map(t => t.trim()),
    url: proj.url || undefined
  }));
};

/**
 * Extracts achievements from description text
 * @param {string} description - Experience description
 * @returns {string[]} Extracted achievements
 */
const extractAchievements = (description = '') => {
  return description
    .split(/[.;\n]/)
    .filter(sentence => 
      /increased|decreased|improved|achieved|led|managed|created|developed|implemented/i.test(sentence)
    )
    .map(achievement => achievement.trim())
    .filter(Boolean);
};

/**
 * Extracts technologies from description text
 * @param {string} description - Experience description
 * @returns {string[]} Extracted technologies
 */
const extractTechnologies = (description = '') => {
  // This is a simplified version - could be enhanced with a comprehensive tech keyword database
  const techPattern = /\b(JavaScript|Python|Java|React|Node\.js|AWS|SQL|Git|Docker)\b/g;
  return [...new Set(description.match(techPattern) || [])];
};

/**
 * Calculates metadata including completeness score
 * @param {StandardizedResumeData} data - Processed resume data
 * @returns {Promise<Object>} Metadata object
 */
const calculateMetadata = async (data) => {
  const completenessScore = calculateCompletenessScore(data);
  const dataQuality = assessDataQuality(data);

  return {
    completenessScore,
    lastUpdated: new Date(),
    dataQuality
  };
};

/**
 * Calculates completeness score for resume data
 * @param {StandardizedResumeData} data - Resume data
 * @returns {number} Completeness score (0-100)
 */
const calculateCompletenessScore = (data) => {
  const weights = {
    personalDetails: 0.2,
    workExperience: 0.3,
    skills: 0.2,
    education: 0.15,
    projects: 0.15
  };

  let score = 0;

  // Personal details score
  const personalScore = Object.values(data.personalDetails).filter(Boolean).length / 6;
  score += personalScore * weights.personalDetails;

  // Work experience score
  const expScore = Math.min(data.workExperience.length / 3, 1);
  score += expScore * weights.workExperience;

  // Skills score
  const skillsScore = (data.skills.technical.length + data.skills.soft.length) > 0 ? 1 : 0;
  score += skillsScore * weights.skills;

  // Education score
  const eduScore = data.education.length > 0 ? 1 : 0;
  score += eduScore * weights.education;

  // Projects score
  const projScore = Math.min(data.projects.length / 2, 1);
  score += projScore * weights.projects;

  return Math.round(score * 100);
};

/**
 * Assesses quality of resume data
 * @param {StandardizedResumeData} data - Resume data
 * @returns {Object} Quality assessment metrics
 */
const assessDataQuality = (data) => {
  return {
    hasDetailedExperience: data.workExperience.every(exp => 
      exp.description.length > 100 && exp.achievements.length > 0
    ),
    hasQuantifiableAchievements: data.workExperience.some(exp =>
      exp.achievements.some(a => /\d+%|\d+ (users|customers|clients|projects|teams)/i.test(a))
    ),
    hasRelevantSkills: data.skills.technical.length > 0,
    hasEducationDetails: data.education.every(edu => 
      edu.institution && edu.degree && edu.graduationDate
    ),
    hasProjectDetails: data.projects.every(proj =>
      proj.description.length > 50 && proj.technologies.length > 0
    )
  };
};

module.exports = {
  extractCompleteResumeData,
  ResumeDataError,
  ValidationError
}; 