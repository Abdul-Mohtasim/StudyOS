
const mongoose = require("mongoose");

let connectionPromise = null;

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.set("strictQuery", true);

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      // Each worker keeps its own pool. 2 workers x 20 = 40 connections (Atlas free tier allows 500).
      maxPoolSize: Number(process.env.MONGO_POOL_SIZE) || 20,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      // Fail fast instead of hanging when a query or the pool is stuck.
      socketTimeoutMS: 45000,
      waitQueueTimeoutMS: 10000,
      retryReads: true,
      retryWrites: true,
      autoIndex: process.env.NODE_ENV !== "production",
    })
    .then(() => {
      console.log("MongoDB is ready.");
      return mongoose.connection;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

async function closeDatabase() {
  connectionPromise = null;
  await mongoose.disconnect();
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  closeDatabase,
  isDatabaseConnected,
};
