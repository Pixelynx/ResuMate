const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

let sequelize;
  
if (env === 'production') {
  console.log("PROD")
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    {
      dialect: 'postgres',
      dialectOptions: config.dialectoptions,
    }
  );
} else {
  console.log("NOT PROD")
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      dialect: config.dialect,
      port: config.port,
      pool: config.pool
    }
  ); // TODO: Test env
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.resumes = require('./resume.models.js')(sequelize, Sequelize);
db.coverletters = require('./coverLetter.models.js')(sequelize, Sequelize);

// Define relationships
db.resumes.hasMany(db.coverletters, { 
  foreignKey: 'resumeid',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
db.coverletters.belongsTo(db.resumes, { 
  foreignKey: 'resumeid'
});

module.exports = db; 