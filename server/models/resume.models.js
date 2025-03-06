const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Resume = sequelize.define('Resume', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  certifications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  projects: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Resume;