const express = require("express");
const router = express.Router();
const CropCommitment = require("../models/CropCommitment");
const BuyerRequirement = require("../models/BuyerRequirement");
const FarmProject = require("../models/FarmProject");
const Notification = require("../models/Notification");
const auth = require("../middleware/authh");

// POST /api/commitments - Submit a pre-harvest commitment (Farmer only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "farmer" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only farmers can submit crop commitments" });
    }

    const { buyerRequirementId, expectedYield, committedQuantity, farmerId, buyerId } = req.body;

    const requirement = await BuyerRequirement.findById(buyerRequirementId);
    if (!requirement) {
      return res.status(404).json({ msg: "Buyer requirement not found" });
    }

    const targetFarmer = req.user.role === "admin" ? (farmerId || req.user.id) : req.user.id;

    // Check if farmer already committed to this requirement
    const existing = await CropCommitment.findOne({
      buyerRequirement: buyerRequirementId,
      farmer: targetFarmer
    });
    if (existing) {
      return res.status(400).json({ msg: "A commitment has already been submitted for this requirement and farmer" });
    }

    const commitment = new CropCommitment({
      buyerRequirement: buyerRequirementId,
      farmer: targetFarmer,
      buyer: buyerId || requirement.buyerId,
      expectedYield: Number(expectedYield),
      committedQuantity: Number(committedQuantity),
      status: "PENDING"
    });

    await commitment.save();

    // Create Notification for the Buyer
    const notif = new Notification({
      userId: commitment.buyer,
      title: "New Crop Commitment",
      message: `A farmer has submitted a pre-harvest commitment of ${committedQuantity} tonnes for your ${requirement.crop} requirement.`
    });
    await notif.save();

    res.status(201).json(commitment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/commitments - Fetch commitments (Role filtered)
router.get("/", auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "farmer") {
      query.farmer = req.user.id;
    } else if (req.user.role === "buyer") {
      query.buyer = req.user.id;
    }

    const commitments = await CropCommitment.find(query)
      .populate("buyerRequirement")
      .populate("farmer", "firstName lastName farmName email phone location city acreage crops")
      .populate("buyer", "firstName lastName organizationName email phone location")
      .sort({ createdAt: -1 });

    res.json(commitments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/commitments/:id/status - Update commitment status (Buyer/Admin accepts or rejects)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body; // ACCEPTED, REJECTED, CANCELLED
    const commitment = await CropCommitment.findById(req.params.id)
      .populate("buyerRequirement");
    
    if (!commitment) {
      return res.status(404).json({ msg: "Commitment not found" });
    }

    // Authorization: Buyers can accept/reject commitments for their own requirements
    if (commitment.buyer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    commitment.status = status;
    await commitment.save();

    // Notify the Farmer
    const farmerNotif = new Notification({
      userId: commitment.farmer,
      title: `Commitment ${status.toLowerCase()}`,
      message: `Your pre-harvest commitment of ${commitment.committedQuantity} tonnes of ${commitment.buyerRequirement.crop} has been ${status.toLowerCase()} by the buyer.`
    });
    await farmerNotif.save();

    // If accepted, automatically instantiate a FarmProject
    if (status === "ACCEPTED") {
      // Create project
      const estimatedAcreage = Math.max(1, Math.round(commitment.committedQuantity / 5));
      const cultivationCost = estimatedAcreage * 40000;
      const supportRequired = Math.round(cultivationCost * 0.4);

      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() + 90);

      const project = new FarmProject({
        farmer: commitment.farmer,
        crop: commitment.buyerRequirement.crop,
        variety: "Hybrid Standard",
        acreage: estimatedAcreage,
        location: commitment.buyerRequirement.location,
        expectedYield: commitment.expectedYield,
        committedQuantity: commitment.committedQuantity,
        cultivationCost,
        supportRequired,
        expectedHarvestDate: harvestDate,
        buyer: commitment.buyer,
        buyerRequirement: commitment.buyerRequirement._id,
        currentStage: "PLANNING",
        progressPercentage: 10,
        riskLevel: "LOW",
        status: "ACTIVE"
      });

      await project.save();

      // Create notification for Farmer about project setup
      const projectNotif = new Notification({
        userId: commitment.farmer,
        title: "Farm Project Instantiated",
        message: `Your new Farm Project for ${commitment.buyerRequirement.crop} is now live! Stage: PLANNING.`
      });
      await projectNotif.save();
    }

    res.json(commitment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/commitments/:id - Update generic commitment details (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admins can edit commitment details" });
    }
    const commitment = await CropCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ msg: "Commitment not found" });
    }

    const { expectedYield, committedQuantity, status, farmerId, buyerId, buyerRequirementId } = req.body;

    if (expectedYield !== undefined) commitment.expectedYield = Number(expectedYield);
    if (committedQuantity !== undefined) commitment.committedQuantity = Number(committedQuantity);
    if (status) commitment.status = status;
    if (farmerId) commitment.farmer = farmerId;
    if (buyerId) commitment.buyer = buyerId;
    if (buyerRequirementId) commitment.buyerRequirement = buyerRequirementId;

    await commitment.save();
    res.json(commitment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/commitments/:id - Delete a commitment (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admins can delete commitments" });
    }
    const commitment = await CropCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ msg: "Commitment not found" });
    }

    await CropCommitment.findByIdAndDelete(req.params.id);
    res.json({ msg: "Commitment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
