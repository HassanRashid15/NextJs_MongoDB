const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Please check your MONGO_URI environment variable");
    // Don't exit immediately, let the app start and show the error
    setTimeout(() => {
      console.error("Database connection failed, but server will continue running");
    }, 1000);
  }
};

module.exports = connectDB;
