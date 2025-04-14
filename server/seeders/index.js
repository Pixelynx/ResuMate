const db = require('../models');
const resumeSeeds = require('./2025-03-29-create-resumes');
const coverLetterSeeds = require('./2025-03-31-create-cover-letters');
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    // Clear existing data (optional)
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await db.resumes.destroy({ truncate: true, cascade: true });
    await db.coverLetters.destroy({ truncate: true, cascade: true });
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    console.log('Creating resume seed data...');
    await db.resumes.bulkCreate(resumeSeeds);
    console.log('Creating cover letter seed data...');
    await db.coverLetters.bulkCreate(coverLetterSeeds);
    console.log('Database seeding completed successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
// If this file is run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Unhandled error during seeding:', error);
      process.exit(1);
    });
}
module.exports = seedDatabase;