const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Resume = sequelize.define('Resume', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  linkedin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  github: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: true
  },
  workExperience: {
    type: DataTypes.JSON,
    allowNull: true
  },
  education: {
    type: DataTypes.JSON,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true
  },
  certifications: {
    type: DataTypes.JSON,
    allowNull: true
  },
  projects: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

module.exports = Resume;