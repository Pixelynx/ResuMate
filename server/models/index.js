const { Sequelize } = require('sequelize');
const config = require('../config/db.config.js');

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    port: config.port,
    pool: config.pool
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.resumes = require('./resume.models.js')(sequelize, Sequelize);
db.coverLetters = require('./coverLetter.models.js')(sequelize, Sequelize);

// Define relationships
db.resumes.hasMany(db.coverLetters, { 
  foreignKey: 'resumeId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
db.coverLetters.belongsTo(db.resumes, { 
  foreignKey: 'resumeId'
});

module.exports = db; 