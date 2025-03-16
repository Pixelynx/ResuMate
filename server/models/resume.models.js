module.exports = (sequelize, Sequelize) => {
  const Resume = sequelize.define('Resume', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    // Personal Details
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false
    },
    linkedin: {
      type: Sequelize.STRING,
      allowNull: true
    },
    website: {
      type: Sequelize.STRING,
      allowNull: true
    },
    github: {
      type: Sequelize.STRING,
      allowNull: true
    },
    instagram: {
      type: Sequelize.STRING,
      allowNull: true
    },
    
    workExperience: {
      type: Sequelize.JSON,
      allowNull: true
    },
    education: {
      type: Sequelize.JSON,
      allowNull: true
    },
    skills: {
      type: Sequelize.JSON,
      allowNull: true
    },
    certifications: {
      type: Sequelize.JSON,
      allowNull: true
    },
    projects: {
      type: Sequelize.JSON,
      allowNull: true
    }
  }, {
    tableName: 'resumes',
    timestamps: true
  });

  return Resume;
};