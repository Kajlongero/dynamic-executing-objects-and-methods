require("dotenv").config();

const postgresConfig = {
  DATABASE_QUERY_URL: process.env.POSTGRES_URL_QUERY,
};

module.exports = { postgresConfig };
