const mongoose = require("mongoose");

let connectionPromise = null;

function connectDB() {
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((conn) => {
        console.log("MongoDB connected");
        return conn;
      })
      .catch((err) => {
        connectionPromise = null;
        console.error("MongoDB connection error:", err.message);
        throw err;
      });
  }
  return connectionPromise;
}

module.exports = connectDB;
