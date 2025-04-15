require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();

// Middleware
const allowedOrigins = [
  'https://resumate-ai.netlify.app',
  process.env.NODE_ENV === 'production'
    ? 'https://resumate-ai-70da7c41ee80.herokuapp.com/resumes'
    : 'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// Routes
require('./routes/resume.routes')(app);
require('./routes/coverLetter.routes')(app);

// Consolidated job fit score routes
require('./routes/jobFit.routes')(app);

const PORT = process.env.PORT || 5000;

const checkSeedDatabase = async () => {
  const seedDatabase = require('./seeders/index');
  if (process.env.SEED_DB === 'true') {
    console.log('Seeding database in progress...');
    await seedDatabase();
  } else {
    console.log('Bypassing database seeding...')
  }
}

const startServer = async () => {
  try {
    // Test the database connection
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await checkSeedDatabase();

    // Force sync the database models (this will drop and recreate tables)
    // NOTE: To be removed in prod
    await db.sequelize.sync();
    console.log('Database models synchronized successfully. Tables have been recreated.');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    if (error.name === 'SequelizeConnectionError') {
      console.error('Failed to connect to the database:', error.message);
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error occurred:', error.message);
    } else {
      console.error('Unable to start server:', error);
    }
    process.exit(1); // Exit if we can't start properly
  }
};

startServer();