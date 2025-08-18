"use strict";
const express = require("express");
const bodyParser = require("express");
const config = require("./config");
const metrics = require("./metrics");
const accountsRouter = require("./routes/accounts");

const app = express();
const port = config.port || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get("/health", (req, res) => {
  res.json({ status: "UP", env: config.nodeEnv });
});

// Metrics
app.get("/metrics", async (req, res) => {
  try {
    const metricsPayload = await metrics.getMetrics();
    res.set("Content-Type", metrics.metricsContentType);
    res.send(metricsPayload);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API routes
app.use("/accounts", accountsRouter);

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`railcards-accounts-ea service listening on port ${port}`);
});
