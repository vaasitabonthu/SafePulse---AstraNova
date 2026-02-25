const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({

    name: String,
    age: Number,
    gender: String,
    temperature: Number,
    heartRate: Number,
    location: String,

    riskScore: {
        type: Number,
        required: true
    },

    riskLevel: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Worker", workerSchema);