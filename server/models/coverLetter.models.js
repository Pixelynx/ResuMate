module.exports = (sequelize, Sequelize) => {
  const CoverLetter = sequelize.define("CoverLetter", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    resumeId: {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: 'resumes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    jobTitle: {
      type: Sequelize.STRING,
      allowNull: false
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false
    },
    jobDescription: {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: ""
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ""
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ""
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ""
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    prevEmployed: {
      type: Sequelize.JSON,
      allowNull: true
    },
    createDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    generationOptions: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'coverLetters',
    timestamps: true
  });

  CoverLetter.associate = (models) => {
    CoverLetter.belongsTo(models.Resume, {
      foreignKey: 'resumeId',
      as: 'resume'
    });
  };

  return CoverLetter;
}; 