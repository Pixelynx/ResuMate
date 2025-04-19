// test-seed.js
const { Sequelize } = require('sequelize');
const db = require('../models');
const { v4: uuidv4 } = require('uuid');

const testSeed = async () => {
  try {
    console.log('Starting test seed...');
    
    // Create a simple test resume
    const testResume = {
      id: uuidv4(),
      firstname: 'Test',
      lastname: 'User',
      title: 'Test Resume',
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'Test City',
      linkedin: 'https://linkedin.com/test',
      website: 'https://test.com',
      github: 'https://github.com/test',
      instagram: 'https://instagram.com/test',
      workExperience: JSON.stringify([
        {
          companyName: 'Test Company',
          jobtitle: 'Test Position',
          location: 'Test Location',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-12-31'),
          description: 'Test description'
        }
      ]),
      education: JSON.stringify([
        {
          institution: 'Test University',
          degree: 'Test Degree',
          field: 'Test Field',
          startDate: new Date('2018-01-01'),
          endDate: new Date('2022-01-01')
        }
      ]),
      skills: JSON.stringify(['Test Skill 1', 'Test Skill 2']),
      certifications: JSON.stringify([]),
      projects: JSON.stringify([]),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating test resume...');
    const result = await db.resumes.create(testResume);
    console.log('Resume created:', result.id);
    
    // Get count to verify
    const count = await db.resumes.count();
    console.log('Resume count:', count);
    
    console.log('Test seed completed successfully');
  } catch (error) {
    console.error('Error in test seed:', error);
  } finally {
    process.exit(0);
  }
};

testSeed();