//app.js
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("./middlewares/passport");
const session = require("express-session");
const bodyParser = require('body-parser');
const cors = require("cors");



var indexRouter = require("./routes/index");

var app = express();
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200, // For legacy browser support
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const DB_URL = process.env.DB_URL_DEV;






// Configure express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Middleware pour autoriser les requêtes CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // Replace with the URL of your frontend application
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization','XMLHttpRequest');

  // Only parse request body for routes that need it
  if (req.method === 'POST' || req.method === 'PUT') {
    bodyParser.json()(req, res, next);
  } else {
    next();
  }
});


app.use("/api/v0", indexRouter);

mongoose
  .connect(DB_URL)
  .then(() => console.log("Bdd ok"))
  .catch((err) => console.log(err));

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;