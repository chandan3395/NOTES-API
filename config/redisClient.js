const { createClient } = require("redis");

const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

client.on("error", (err) => console.error("Redis error:", err));
client.on("connect", () => console.log("Redis Connected"));

// connect() is async — we call it once here
client.connect();

module.exports = client;
