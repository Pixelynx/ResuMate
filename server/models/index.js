const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

let sequelize;
  
if (env === 'production') {
  console.log("PROD")
  sequelize = new Sequelize(
    config.DATABASE_URL,
    {
      dialect: config.DIALECT,
      dialectOptions: config.DIALECT_OPTIONS,
    }
  );
} else {
  console.log("NOT PROD")
  sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
      host: config.HOST,
      dialect: config.DIALECT,
      port: config.PORT,
      pool: config.POOL
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