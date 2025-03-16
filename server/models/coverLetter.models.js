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
      references: {
        model: 'resumes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    jobTitle: {
      type: Sequelize.STRING
    },
    company: {
      type: Sequelize.STRING
    }
  }, {
    tableName: 'coverLetters',
    timestamps: true
  });

  return CoverLetter;
}; 