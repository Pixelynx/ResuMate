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

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});