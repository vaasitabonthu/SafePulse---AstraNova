const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  temperature: Number,
  heartRate: Number,
  location: String,
  riskLevel: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Worker", workerSchema);