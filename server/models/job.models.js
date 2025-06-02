module.exports = (sequelize, Sequelize) => {
  const Job = sequelize.define("job", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    requirements: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    type: {
      type: Sequelize.STRING, // full-time, part-time, contract, etc.
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return Job;
}; 