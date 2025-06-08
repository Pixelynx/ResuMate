// @ts-check

/**
 * Work experience entry
 * @typedef {Object} WorkExperience
 * @property {string} title - Job title
 * @property {string} company - Company name
 * @property {string} startDate - Start date
 * @property {string} [endDate] - End date
 * @property {string} description - Job description
 * @property {string[]} skills - Skills used
 * @property {string[]} achievements - Achievements
 */

/**
 * Education entry
 * @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} institution - Institution name
 * @property {string} startDate - Start date
 * @property {string} [endDate] - End date
 * @property {number} [gpa] - GPA
 * @property {string[]} achievements - Academic achievements
 */

/**
 * Project entry
 * @typedef {Object} Project
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string[]} skills - Skills used
 * @property {string} [url] - Project URL
 * @property {string} [startDate] - Start date
 * @property {string} [endDate] - End date
 */

/**
 * Resume model
 * @typedef {Object} Resume
 * @property {string} id - Resume ID
 * @property {string} title - Resume title
 * @property {string} fullName - Full name
 * @property {string} email - Email address
 * @property {string} [phone] - Phone number
 * @property {string} [location] - Location
 * @property {string} summary - Professional summary
 * @property {string[]} skills - Skills list
 * @property {WorkExperience[]} workExperience - Work experience entries
 * @property {Education[]} education - Education entries
 * @property {Project[]} [projects] - Project entries
 * @property {string[]} [certifications] - Certifications
 * @property {string[]} [languages] - Languages
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

module.exports = {}; // Empty export to make the file a module 