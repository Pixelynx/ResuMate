require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "resumatedb",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres"
  },
  // test: {
  //   username: process.env.DB_USERNAME || "postgres",
  //   password: process.env.DB_PASSWORD || "your_password",
  //   database: process.env.DB_TEST_NAME || "resumate_test",
  //   host: process.env.DB_HOST || "127.0.0.1",
  //   dialect: "postgres"
  // },
  production: {
    databaseurl: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 