const InternalServerError = (err, req, res, next) => {
  res.status(500).json({
    statusCode: 500,
    message: err.message,
  });
};

module.exports = {
  InternalServerError,
};
