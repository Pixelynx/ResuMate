// @ts-check

/**
 * Calculate total years of experience from work history
 * @param {Array<{startDate: string, endDate: string}>} workExperience - Array of work experiences
 * @returns {number} Total years of experience
 */
function calculateExperienceYears(workExperience) {
  if (!Array.isArray(workExperience)) {
    return 0;
  }

  const now = new Date();
  let totalMonths = 0;

  workExperience.forEach(experience => {
    const startDate = new Date(experience.startDate);
    const endDate = experience.endDate ? new Date(experience.endDate) : now;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return;
    }

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    // Only count if it's a valid positive duration
    if (months > 0) {
      totalMonths += months;
    }
  });

  // Convert months to years, rounded to 1 decimal place
  return Math.round((totalMonths / 12) * 10) / 10;
}

module.exports = {
  calculateExperienceYears
}; 