const mongoose = require("mongoose");

const connectDB = async () => {
  // 1. Validate the Environment Variable
  const connURI = process.env.MONGO_URI;
  if (!connURI) {
    console.error(
      "[Database] Error: MONGO_URI is not defined in environment variables.",
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(connURI);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// 2. Monitor the connection after the initial connection xxxd

mongoose.connection.on("disconnected", () => {
  console.warn("[Database] MongoDB disconnected! Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error(`[Database] MongoDB runtime error: ${err.message}`);
});

module.exports = connectDB;
