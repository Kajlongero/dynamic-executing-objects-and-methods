const { Pool } = require("pg");
const {
  postgresConfig: { DATABASE_QUERY_URL },
} = require("../config/postgresConfig");

const pgConnection = new Pool({
  connectionString: DATABASE_QUERY_URL,
});

module.exports = { pgConnection };
