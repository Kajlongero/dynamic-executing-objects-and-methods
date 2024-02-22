const BoomErrorHandler = (err, req, res, next) => {
  if (!err.isBoom) next(err);

  const { output } = err;
  res.status(output.statusCode).json(output.payload);
};

module.exports = {
  BoomErrorHandler,
};
