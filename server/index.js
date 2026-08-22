const path = require("path");
const express = require("express");
require("./db"); // ensures schema + seed run before routes are used

const lessonsRouter = require("./routes/lessons");
const reviewRouter = require("./routes/review");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/lessons", lessonsRouter);
app.use("/api/review", reviewRouter);
app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(PORT, () => {
  console.log(`Tigrinya-Teaching running at http://localhost:${PORT}`);
});
