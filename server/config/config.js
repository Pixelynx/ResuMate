require('dotenv').config();

module.exports = {
  development: {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USERNAME || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "postgres",
    DB: process.env.DB_NAME || "resumatedb",
    DIALECT: "postgres",
    PORT: process.env.DB_PORT || 5432,
    POOL: {
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
  //   DIALECT: "postgres"
  // },
  production: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIALECT: "postgres",
    DIALECT_OPTIONS: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 