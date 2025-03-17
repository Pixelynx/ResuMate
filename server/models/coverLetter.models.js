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
      onDelete: 'SET NULL'
    },
    jobTitle: {
      type: Sequelize.STRING,
      allowNull: false
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false
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