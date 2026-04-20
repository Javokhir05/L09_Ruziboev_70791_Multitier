const express = require("express");
const redis = require("redis");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 5000;

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.connect().catch(console.error);

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = randomUUID();

  res.on("finish", () => {
    const log = {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      latency: Date.now() - start
    };
    console.log(JSON.stringify(log));
  });

  next();
});

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Readiness endpoint
app.get("/ready", async (req, res) => {
  try {
    await client.ping();
    res.status(200).json({ status: "ready" });
  } catch (err) {
    res.status(503).json({ status: "not ready" });
  }
});

// Demo endpoint
app.get("/", (req, res) => {
  res.send("Hello from API 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});