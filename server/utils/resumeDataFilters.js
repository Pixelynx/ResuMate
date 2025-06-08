/**
 * @typedef {Object} WorkExperience
 * @property {string} companyName - Company name
 * @property {string} jobtitle - Job title
 * @property {string} description - Job description
 * @property {string} location - Job location
 * @property {string|null} startDate - Start date
 * @property {string|null} endDate - End date
 */

/**
 * @typedef {Object} Education
 * @property {string} institutionName - Institution name
 * @property {string} degree - Degree name
 * @property {string} fieldOfStudy - Field of study
 * @property {string} location - Institution location
 * @property {string|null} graduationDate - Graduation date
 */

/**
 * @typedef {Object} Certification
 * @property {string} name - Certification name
 * @property {string} organization - Issuing organization
 * @property {string|null} dateObtained - Date obtained
 * @property {string|null} expirationDate - Expiration date
 * @property {string} credentialUrl - Credential URL
 */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} role - Project role
 * @property {string} duration - Project duration
 * @property {string} technologies - Technologies used
 * @property {string} projectUrl - Project URL
 */

/**
 * @typedef {Object} Skills
 * @property {string} skills_ - Technical skills
 * @property {string} languages - Language skills
 */

/**
 * Checks if a string value is empty or contains only whitespace
 * @param {string|null|undefined} value - The value to check
 * @returns {boolean} True if the value is empty or whitespace
 */
const isEmptyString = (value) => {
  return !value || value.trim().length === 0;
};

/**
 * Checks if a section has meaningful content based on its type
 * @param {Object} section - The section to check
 * @param {string} sectionType - Type of the section (workExperience, education, etc.)
 * @returns {boolean} True if the section is empty
 */
const isSectionEmpty = (section, sectionType) => {
  if (!section) return true;

  switch (sectionType) {
    case 'workExperience':
      return isEmptyString(section.companyName) &&
             isEmptyString(section.jobtitle) &&
             isEmptyString(section.description);

    case 'education':
      return isEmptyString(section.institutionName) &&
             isEmptyString(section.degree) &&
             isEmptyString(section.fieldOfStudy);

    case 'certification':
      return isEmptyString(section.name) &&
             isEmptyString(section.organization);

    case 'project':
      return isEmptyString(section.title) &&
             isEmptyString(section.description);

    case 'skills':
      return isEmptyString(section.skills_) &&
             isEmptyString(section.languages);

    default:
      return true;
  }
};

/**
 * Filters out empty items from an array of section items
 * @param {Array} array - Array of section items
 * @param {string} sectionType - Type of the section
 * @returns {Array|null} Filtered array or null if all items are empty
 */
const filterEmptyArrayItems = (array, sectionType) => {
  if (!Array.isArray(array)) return null;
  
  const filteredArray = array.filter(item => !isSectionEmpty(item, sectionType));
  return filteredArray.length > 0 ? filteredArray : null;
};

/**
 * Cleans resume data by removing empty sections and filtering array items
 * @param {Object} resumeData - The resume data to clean
 * @returns {Object} Cleaned resume data with empty sections removed
 */
const cleanResumeData = (resumeData) => {
  if (!resumeData) return {};

  const cleanedData = { ...resumeData };

  // Clean array sections
  const arraySections = {
    workExperience: 'workExperience',
    education: 'education',
    certifications: 'certification',
    projects: 'project'
  };

  Object.entries(arraySections).forEach(([key, sectionType]) => {
    if (cleanedData[key]) {
      cleanedData[key] = filterEmptyArrayItems(cleanedData[key], sectionType);
    }
  });

  // Clean skills section
  if (cleanedData.skills && isSectionEmpty(cleanedData.skills, 'skills')) {
    cleanedData.skills = null;
  }

  return cleanedData;
};

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

module.exports = {
  isSectionEmpty,
  filterEmptyArrayItems,
  cleanResumeData,
  validateRequiredFields
}; 