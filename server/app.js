require('dotenv').config();

const express = require('express');
const cors = require('cors');
const resumeRoutes = require('./routes/index');
const db = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/resumes', resumeRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test the database connection
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Force sync the database models (this will drop and recreate tables)
    // NOTE: To be removed in prod
    await db.sequelize.sync({ force: true });
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