require("dotenv").config();
const express = require("express");
const path = require("path");
const { handleWebhook, verifyWebhook } = require("./handlers/webhookHandler");
const { getLogger } = require("./utils/logger");

const logger = getLogger("server");
const app = express();

// Error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught exception: ${err.stack || err}`);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files (optional demo UI)
app.use(express.static(path.join(__dirname, "public")));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// WhatsApp webhook endpoints
app.get("/webhook", verifyWebhook);
app.post("/webhook", handleWebhook);

// Root page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack || err}`);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Church Bot server listening on port ${PORT}`);
});
