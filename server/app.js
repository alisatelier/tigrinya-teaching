const path = require("path");
const express = require("express");
const { ready } = require("./db");

const lessonsRouter = require("./routes/lessons");
const reviewRouter = require("./routes/review");

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  ready.then(() => next(), next);
});
app.use("/api/lessons", lessonsRouter);
app.use("/api/review", reviewRouter);
app.use(express.static(path.join(__dirname, "..", "public")));

module.exports = app;
