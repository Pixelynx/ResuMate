const db = require('../models');
const resumeSeeds = require('./2025-03-29-create-resumes');
const coverLetterSeeds = require('./2025-03-31-create-cover-letters');
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data (optional)
    await db.sequelize.query('SET session_replication_role = replica;');
    await db.resumes.destroy({ truncate: true, cascade: true });
    await db.coverletters.destroy({ truncate: true, cascade: true });
    await db.sequelize.query('SET session_replication_role = DEFAULT;');
    
    // Using the Sequelize queryInterface for seeding
    const queryInterface = db.sequelize.getQueryInterface();
    
    console.log('Creating resume seed data...');
    await resumeSeeds.up(queryInterface, db.Sequelize);
    
    console.log('Creating cover letter seed data...');
    await coverLetterSeeds.up(queryInterface, db.Sequelize);

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