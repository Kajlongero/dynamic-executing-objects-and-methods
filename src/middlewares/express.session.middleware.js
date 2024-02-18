require("dotenv").config();

const session = require("express-session");

module.exports = session({
  secret: process.env.SECRET_SESSION_EXPRESS,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000,
  },
  rolling: true,
});
