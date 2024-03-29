const path = require("path");
const rootPath = require("../../rootPath");

const dynamicExecuteMethod = async (req, res, body) => {
  const method = body.methodName;
  const object = body.objectName;

  const params = body.params;

  const { default: getClass } = await import(
    path.join(rootPath, "src", "services", `${object}.js`)
  );
  const instance = new getClass();

  const executeMethod = await instance[method](params, req, res);
  return executeMethod;
};

module.exports = dynamicExecuteMethod;
