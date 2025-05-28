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
    resumeid: {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: 'resumes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    jobtitle: {
      type: Sequelize.STRING,
      allowNull: false
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false
    },
    jobdescription: {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: ""
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ""
    },
    lastname: {
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
    createdAt: {
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
    tableName: 'coverletters',
    timestamps: true
  });

  CoverLetter.associate = (models) => {
    CoverLetter.belongsTo(models.Resume, {
      foreignKey: 'resumeid',
      as: 'resume'
    });
  };

  return CoverLetter;
}; 