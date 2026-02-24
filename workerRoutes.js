const express = require("express");
const router = express.Router();
const Worker = require("../Models/Worker");

// Add worker
router.post("/add", async (req, res) => {
   try {

      const {
         name,
         age,
         temperature,
         heartRate,
         location,
         riskLevel
      } = req.body;

      const newWorker = new Worker({
         name,
         age,
         temperature,
         heartRate,
         location,
         riskLevel
      });

      await newWorker.save();

      res.status(201).json({
         message: "Worker data saved successfully",
         riskLevel
      });

   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});
// Get all workers
router.get("/all", async (req, res) => {
  try {
    const workers = await Worker.find();
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Delete worker
router.delete("/delete/:id", async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ message: "Worker deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});