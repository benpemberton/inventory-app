let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let compression = require("compression");

let indexRouter = require("./routes/index");
let familyRouter = require("./routes/familyRouter");
let instrumentRouter = require("./routes/instrumentRouter");
let productRouter = require("./routes/productRouter");
let unitRouter = require("./routes/unitRouter");

let app = express();

// Import the mongoose module
const mongoose = require("mongoose");

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set("strictQuery", false);

// Define the database URL to connect to.
const mongoDB = process.env.MONGO_URI;

// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(compression()); // Compress all routes
app.use(logger("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/family", familyRouter);
app.use("/instrument", instrumentRouter);
app.use("/product", productRouter);
app.use(
  "/product/:id/unit",
  (req, res, next) => {
    req.productid = req.params.id;
    next();
  },
  unitRouter
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
