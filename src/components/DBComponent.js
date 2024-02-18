const { pgConnection } = require("../connections/pg.pool");

class DBComponent {
  constructor(connection = pgConnection) {
    this.connection = connection;
  }

  connect() {
    this.connection
      .connect()
      .then(() => console.log("DB Connected Sucessfully"))
      .catch(() => console.error("Error trying to connect"));
  }

  close() {
    this.connection.end().then(() => console.log("DB Connection closed"));
  }

  async query(query, params) {
    const data = await this.connection.query(query, params ? params : []);

    return data;
  }
}

module.exports = { DBComponent };
