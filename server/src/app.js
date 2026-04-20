const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const healthRoutes = require("./routes/health.routes");
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/health", healthRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "AquaSync backend is running",
    status: "ok"
  });
});
module.exports = app;
