const express = require("express");
const router = express.Router();
const FarmProject = require("../models/FarmProject");
const Notification = require("../models/Notification");
const auth = require("../middleware/authh");

// Stage mapping to progress percentage for smooth UX
const STAGE_PROGRESS_MAP = {
  PLANNING: 10,
  PLANTED: 20,
  GERMINATION: 30,
  VEGETATIVE: 50,
  FLOWERING: 70,
  FRUITING: 85,
  HARVEST_READY: 95,
  HARVESTED: 100,
  DELIVERED: 100
};

// POST /api/farm-projects - Create manually (or falls back to commitment trigger)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "farmer" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only farmers can create farm projects" });
    }

    const {
      crop,
      variety,
      acreage,
      location,
      expectedYield,
      committedQuantity,
      cultivationCost,
      supportRequired,
      expectedHarvestDate,
      buyerId,
      buyerRequirementId,
      farmerId
    } = req.body;

    const project = new FarmProject({
      farmer: req.user.role === "admin" ? (farmerId || req.user.id) : req.user.id,
      crop,
      variety: variety || "Hybrid Standard",
      acreage: Number(acreage),
      location,
      expectedYield: Number(expectedYield),
      committedQuantity: Number(committedQuantity),
      cultivationCost: Number(cultivationCost),
      supportRequired: Number(supportRequired || 0),
      expectedHarvestDate: new Date(expectedHarvestDate),
      buyer: buyerId,
      buyerRequirement: buyerRequirementId,
      currentStage: "PLANNING",
      progressPercentage: 10,
      riskLevel: "LOW",
      status: "ACTIVE"
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/farm-projects - List projects (Role filtered)
router.get("/", auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "farmer") {
      query.farmer = req.user.id;
    } else if (req.user.role === "buyer") {
      query.buyer = req.user.id;
    }

    const projects = await FarmProject.find(query)
      .populate("farmer", "firstName lastName farmName email phone location city")
      .populate("buyer", "firstName lastName organizationName email phone location")
      .populate("buyerRequirement")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/farm-projects/:id - Single project details
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await FarmProject.findById(req.params.id)
      .populate("farmer", "firstName lastName farmName email phone location city")
      .populate("buyer", "firstName lastName organizationName email phone location")
      .populate("buyerRequirement");

    if (!project) return res.status(404).json({ msg: "Farm project not found" });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/farm-projects/:id - Update stage/risk/yield etc.
router.put("/:id", auth, async (req, res) => {
  try {
    let project = await FarmProject.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Farm project not found" });

    // Authorization: Only the owner farmer or admin or the buyer
    if (project.farmer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const {
      currentStage,
      riskLevel,
      expectedHarvestDate,
      actualHarvestDate,
      estimatedYield,
      progressPercentage,
      status,
      crop,
      variety,
      acreage,
      location,
      committedQuantity,
      cultivationCost,
      supportRequired,
      buyerId,
      buyerRequirementId,
      farmerId
    } = req.body;

    if (currentStage) {
      project.currentStage = currentStage;
      // Auto update progress percentage based on stage map
      if (STAGE_PROGRESS_MAP[currentStage]) {
        project.progressPercentage = STAGE_PROGRESS_MAP[currentStage];
      }
    }
    if (progressPercentage !== undefined) {
      project.progressPercentage = Number(progressPercentage);
    }
    if (riskLevel) project.riskLevel = riskLevel;
    if (expectedHarvestDate) project.expectedHarvestDate = new Date(expectedHarvestDate);
    if (actualHarvestDate) project.actualHarvestDate = new Date(actualHarvestDate);
    if (estimatedYield !== undefined) project.expectedYield = Number(estimatedYield);
    if (status) project.status = status;

    // Admin updates
    if (req.user.role === "admin") {
      if (crop) project.crop = crop;
      if (variety) project.variety = variety;
      if (acreage !== undefined) project.acreage = Number(acreage);
      if (location) project.location = location;
      if (committedQuantity !== undefined) project.committedQuantity = Number(committedQuantity);
      if (cultivationCost !== undefined) project.cultivationCost = Number(cultivationCost);
      if (supportRequired !== undefined) project.supportRequired = Number(supportRequired);
      if (buyerId) project.buyer = buyerId;
      if (buyerRequirementId) project.buyerRequirement = buyerRequirementId;
      if (farmerId) project.farmer = farmerId;
    }

    await project.save();

    // Create Notification for the Bulk Buyer about the updates
    const updateNotif = new Notification({
      userId: project.buyer,
      title: "Farm Project Updated",
      message: `Farm Project for ${project.crop} is now in the ${project.currentStage} stage (${project.progressPercentage}% progress). Risk: ${project.riskLevel}.`
    });
    await updateNotif.save();

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/farm-projects/:id
// @access Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admins can delete farm projects" });
    }
    const project = await FarmProject.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Farm project not found" });

    await FarmProject.findByIdAndDelete(req.params.id);
    res.json({ msg: "Farm project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
