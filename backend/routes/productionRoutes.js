const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ProductionUpdate = require("../models/ProductionUpdate");
const FarmProject = require("../models/FarmProject");
const Notification = require("../models/Notification");
const auth = require("../middleware/authh");

const uploadPath = path.join(process.cwd(), "uploads/production");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// POST /api/farm-projects/:id/updates - Add cultivation progress update (Farmer)
router.post("/:id/updates", auth, upload.array("photos", 5), async (req, res) => {
  try {
    const project = await FarmProject.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Farm project not found" });

    if (project.farmer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const {
      stage,
      progressPercentage,
      notes,
      expenses,
      weatherObservation,
      expectedHarvestDate,
      estimatedYield
    } = req.body;

    const photoPaths = req.files ? req.files.map((f) => `/uploads/production/${f.filename}`) : [];

    const newUpdate = new ProductionUpdate({
      farmProject: req.params.id,
      stage,
      progressPercentage: Number(progressPercentage),
      photos: photoPaths,
      notes,
      expenses: expenses ? Number(expenses) : 0,
      weatherObservation,
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : undefined,
      estimatedYield: estimatedYield ? Number(estimatedYield) : undefined
    });

    await newUpdate.save();

    // Sync project details with this update
    project.currentStage = stage;
    project.progressPercentage = Number(progressPercentage);
    if (expectedHarvestDate) project.expectedHarvestDate = new Date(expectedHarvestDate);
    if (estimatedYield) project.expectedYield = Number(estimatedYield);
    await project.save();

    // Notify Buyer
    const notif = new Notification({
      userId: project.buyer,
      title: "New Cultivation Progress Update",
      message: `Project ${project.crop} is now ${progressPercentage}% progress (Stage: ${stage}). Notes: "${notes || 'No description provided'}"`
    });
    await notif.save();

    res.status(201).json(newUpdate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/farm-projects/:id/updates - Fetch timeline updates
router.get("/:id/updates", auth, async (req, res) => {
  try {
    const updates = await ProductionUpdate.find({ farmProject: req.params.id })
      .sort({ createdAt: 1 });
    res.json(updates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
