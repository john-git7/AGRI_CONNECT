const express = require("express");
const router = express.Router();
const BuyerRequirement = require("../models/BuyerRequirement");
const auth = require("../middleware/authh");

// POST /api/requirements - Create requirement (Buyer only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "buyer" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only buyers can create requirements" });
    }
    const { crop, quantity, quality, location, expectedDelivery, targetPrice, buyerId } = req.body;

    const newReq = new BuyerRequirement({
      buyerId: req.user.role === "admin" ? (buyerId || req.user.id) : req.user.id,
      crop,
      quantity,
      quality,
      location,
      expectedDelivery,
      targetPrice
    });

    await newReq.save();
    res.status(201).json(newReq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/requirements - Fetch all
router.get("/", async (req, res) => {
  try {
    const requirements = await BuyerRequirement.find()
      .populate("buyerId", "firstName lastName organizationName email phone location")
      .sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/requirements/:id - Get single
router.get("/:id", async (req, res) => {
  try {
    const requirement = await BuyerRequirement.findById(req.params.id)
      .populate("buyerId", "firstName lastName organizationName email phone location");
    if (!requirement) return res.status(404).json({ msg: "Requirement not found" });
    res.json(requirement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/requirements/:id - Edit (Buyer only)
router.put("/:id", auth, async (req, res) => {
  try {
    let reqObj = await BuyerRequirement.findById(req.params.id);
    if (!reqObj) return res.status(404).json({ msg: "Requirement not found" });

    if (reqObj.buyerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const { crop, quantity, quality, location, expectedDelivery, targetPrice, status } = req.body;
    if (crop) reqObj.crop = crop;
    if (quantity !== undefined) reqObj.quantity = quantity;
    if (quality) reqObj.quality = quality;
    if (location) reqObj.location = location;
    if (expectedDelivery) reqObj.expectedDelivery = expectedDelivery;
    if (targetPrice) reqObj.targetPrice = targetPrice;
    if (status) reqObj.status = status;

    await reqObj.save();
    res.json(reqObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/requirements/:id - Delete (Buyer only)
router.delete("/:id", auth, async (req, res) => {
  try {
    let reqObj = await BuyerRequirement.findById(req.params.id);
    if (!reqObj) return res.status(404).json({ msg: "Requirement not found" });

    if (reqObj.buyerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await BuyerRequirement.findByIdAndDelete(req.params.id);
    res.json({ msg: "Requirement deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
