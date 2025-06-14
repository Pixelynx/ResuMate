require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');
const matchingRoutes = require('./routes/matching.routes');
const { errorLogger } = require('./middleware/logging');

const app = express();

// Middleware
const allowedOrigins = [
  'https://resumate-ai.netlify.app',
  'https://resumate-ai-70da7c41ee80.herokuapp.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
require('./routes/resume.routes')(app);
require('./routes/coverLetter.routes')(app);
require('./routes/jobFit.routes')(app);

// Apply routes
app.use('/api/matching', matchingRoutes);

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

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

    // Force sync the database models (this will drop and recreate tables)
    await db.sequelize.sync();
    console.log('Database models synchronized successfully. Tables have been recreated.');
    
    await checkSeedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'SequelizeConnectionError') {
        console.error('Failed to connect to the database:', error.message);
      } else if (error.name === 'SequelizeDatabaseError') {
        console.error('Database error occurred:', error.message);
      } else {
        console.error('Unable to start server:', error);
      }
    }
    process.exit(1); // Exit if we can't start properly
  }
};

startServer();