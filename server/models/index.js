const { Sequelize } = require('sequelize');
const config = require('../config/db.config.js');

let sequelize;
  
if (process.env.NODE_ENV === 'production') {
  console.log("PROD")
  sequelize = new Sequelize(
    config.DATABASE_URL,
    {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        }
      }
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