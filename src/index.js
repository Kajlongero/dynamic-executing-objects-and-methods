const Express = require("express");
const cors = require("cors");
const { executeData, MapInstance } = require("./utils/fetchPermissions");
const dynamicExecuteMethod = require("./utils/dynamicExecuteMethods");

(async () => {
  const app = Express();

  app.use(cors());
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: false }));

  await executeData();

  console.log(MapInstance.map);

  app.post("/process", async (req, res, next) => {
    try {
      const { tx, params } = req.body;
      const data = MapInstance.findNames(tx);

      const obj = { ...data, params };
      const results = await dynamicExecuteMethod(req, res, obj);

      res.json(results);
    } catch (e) {
      next(e);
    }
  });

  app.listen(8000, () => {
    console.log(`App running`);
  });
})();
