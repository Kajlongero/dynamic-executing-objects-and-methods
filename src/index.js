const Express = require("express");
const cors = require("cors");
const session = require("./middlewares/express.session.middleware");
const dynamicExecuteMethod = require("./utils/dynamicExecuteMethods");
const { executeData, MapInstance } = require("./utils/fetchPermissions");
const { BoomErrorHandler } = require("./middlewares/boom.error.handler");
const { InternalServerError } = require("./middlewares/internal.error.handler");

(async () => {
  const app = Express();

  app.use(session);

  app.use(cors());
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: false }));

  await executeData();

  app.post("/process", async (req, res, next) => {
    try {
      const { tx, params } = req.body;
      const data = MapInstance.findNames(tx);

      const obj = { ...data, params };
      const results = await dynamicExecuteMethod(req, res, obj);

      res.status(200).json(results);
    } catch (e) {
      next(e);
    }
  });

  app.use(BoomErrorHandler);
  app.use(InternalServerError);

  app.listen(8000, () => {
    console.log(`App running`);
  });
})();
