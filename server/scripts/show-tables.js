const db = require('../models');

// Script to show representation of how database looks
async function showTables() {
  const coverletters = await db.coverletters.findAll();
  console.log('CoverLetters:', JSON.stringify(coverletters, null, 2));
  
  const resumes = await db.resumes.findAll();
  console.log('Resumes:', JSON.stringify(resumes, null, 2));
  
  process.exit(0);
}

showTables().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});