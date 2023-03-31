const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...".blue);
    mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected".blue);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
