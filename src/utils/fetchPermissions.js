const { permissions } = require("../sql/querys.json");
const { DBComponent } = require("../components/DBComponent");
const { MapComponent } = require("../components/Map");
const DBInstance = new DBComponent();
const MapInstance = new MapComponent();

async function executeData() {
  const data = await DBInstance.query(permissions.fetchAllObjectsAndMethods);

  MapInstance.generate(data.rows);
}

module.exports = {
  executeData,
  MapInstance,
};
