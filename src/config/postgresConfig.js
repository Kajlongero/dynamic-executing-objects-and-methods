require("dotenv").config();

const postgresConfig = {
  DATABASE_QUERY_URL: process.env.POSTGRES_URL_QUERY,
};

const nodemailerConfig = {
  APP_PASSWORD: process.env.APP_PASSWORD,
  MAIL: process.env.MAIL,
};

module.exports = { postgresConfig, nodemailerConfig };
