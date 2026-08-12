const express = require("express");
const router = express.Router();
const SupportRequest = require("../models/SupportRequest");
const FarmProject = require("../models/FarmProject");
const Notification = require("../models/Notification");
const auth = require("../middleware/authh");

// POST /api/support-requests - Request financial support (Farmer only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "farmer" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only farmers can submit support requests" });
    }

    const { farmProjectId, cultivationCost, farmerContribution, supportRequired, farmerId, supportType, requestReason } = req.body;

    let project = null;
    if (farmProjectId) {
      project = await FarmProject.findById(farmProjectId);
      if (!project) {
        return res.status(404).json({ msg: "Farm project not found" });
      }
    }

    const newRequest = new SupportRequest({
      farmProject: farmProjectId || undefined,
      farmer: req.user.role === "admin" ? (farmerId || req.user.id) : req.user.id,
      cultivationCost: Number(cultivationCost),
      farmerContribution: Number(farmerContribution),
      supportRequired: Number(supportRequired),
      status: "REQUESTED"
    });

    await newRequest.save();

    if (project) {
      // Also update project's supportRequired value
      project.supportRequired = Number(supportRequired);
      await project.save();

      // Notify Buyer (the committed buyer)
      const notif = new Notification({
        userId: project.buyer,
        title: "Pre-Harvest Support Requested",
        message: `Farmer has requested pre-harvest support of ₹${supportRequired} for the ${project.crop} project.`
      });
      await notif.save();
    }

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/support-requests - View support requests
router.get("/", auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "farmer") {
      query.farmer = req.user.id;
    }

    const requests = await SupportRequest.find(query)
      .populate("farmProject")
      .populate("farmer", "firstName lastName farmName email phone location city")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/support-requests/:id/status - Approve, Reject, Disburse (Admin or Buyer)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body; // UNDER_REVIEW, APPROVED, REJECTED, DISBURSED
    const request = await SupportRequest.findById(req.params.id)
      .populate("farmProject");

    if (!request) {
      return res.status(404).json({ msg: "Support request not found" });
    }

    request.status = status;
    await request.save();

    // Notify Farmer
    const farmerNotif = new Notification({
      userId: request.farmer,
      title: `Pre-Harvest Support Update`,
      message: `Your pre-harvest support request of ₹${request.supportRequired} for ${request.farmProject?.crop || ""} is now ${status.toUpperCase()}.`
    });
    await farmerNotif.save();

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/support-requests/:id - Edit generic support request details (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admins can edit support request details" });
    }
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Support request not found" });
    }

    const { farmProjectId, cultivationCost, farmerContribution, supportRequired, status, farmerId } = req.body;

    if (farmProjectId) request.farmProject = farmProjectId;
    if (cultivationCost !== undefined) request.cultivationCost = Number(cultivationCost);
    if (farmerContribution !== undefined) request.farmerContribution = Number(farmerContribution);
    if (supportRequired !== undefined) request.supportRequired = Number(supportRequired);
    if (status) request.status = status;
    if (farmerId) request.farmer = farmerId;

    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/support-requests/:id - Delete a support request (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admins can delete support requests" });
    }
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Support request not found" });
    }

    await SupportRequest.findByIdAndDelete(req.params.id);
    res.json({ msg: "Support request deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
