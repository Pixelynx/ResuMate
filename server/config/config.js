require('dotenv').config();

module.exports = {
  development: {
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    db: process.env.DB_NAME || "resumatedb",
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  // test: {
  //   username: process.env.DB_USERNAME || "postgres",
  //   password: process.env.DB_PASSWORD || "your_password",
  //   database: process.env.DB_TEST_NAME || "resumate_test",
  //   host: process.env.DB_HOST || "127.0.0.1",
  //   dialect: "postgres"
  // },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectoptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 