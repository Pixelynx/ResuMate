require('dotenv').config();

const express = require('express');
const cors = require('cors');
const resumeRoutes = require('./routes/index');
const sequelize = require('./config/db.config');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/resumes', resumeRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync the database models
    await sequelize.sync();
    console.log('Database models synchronized successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
  }
};

startServer();