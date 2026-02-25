const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

console.log("Starting SafePulse Backend...");

const app = express();

app.use(cors());
app.use(express.json());

// Database connection (single, centralized)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("Database Error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("SafePulse Backend Running 🚀");
});

const workerRoutes = require("./Routes/workerRoutes");
app.use("/api/workers", workerRoutes);

// Nearby hospitals using Google Places (location-based)
app.get("/api/nearby-hospitals", async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat or lng query parameters." });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Server is missing Google API key. Set GOOGLE_API_KEY in your .env file." });
  }

  const searchRadius = radius || 5000; // default 5km

  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${encodeURIComponent(lat)},${encodeURIComponent(lng)}` +
    `&radius=${encodeURIComponent(searchRadius)}` +
    `&type=hospital` +
    `&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return res.status(500).json({
        error: "Google Places API returned an error.",
        details: data,
      });
    }

    const results = (data.results || []).map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address,
      rating: place.rating,
      totalRatings: place.user_ratings_total,
      openNow: place.opening_hours ? place.opening_hours.open_now : undefined,
      location: place.geometry && place.geometry.location,
    }));

    res.json({ results });
  } catch (err) {
    console.error("Error calling Google Places API:", err);
    res.status(500).json({ error: "Failed to fetch data from Google Places API." });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
