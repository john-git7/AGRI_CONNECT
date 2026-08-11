const express = require("express");
const router = express.Router();
const ProcurementOrder = require("../models/ProcurementOrder");
const FarmProject = require("../models/FarmProject");
const Notification = require("../models/Notification");
const auth = require("../middleware/authh");

// POST /api/procurement - Create a procurement order (Buyer only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "buyer" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only buyers can create procurement orders" });
    }

    const { farmProjectId, quantity, quality, agreedPrice, totalValue, deliveryLocation } = req.body;

    const project = await FarmProject.findById(farmProjectId);
    if (!project) return res.status(404).json({ msg: "Farm project not found" });

    const order = new ProcurementOrder({
      buyer: req.user.id,
      farmer: project.farmer,
      farmProject: farmProjectId,
      quantity: Number(quantity),
      quality: quality || project.buyerRequirement.quality || "Grade A",
      agreedPrice: Number(agreedPrice),
      totalValue: Number(totalValue),
      deliveryLocation,
      status: "PENDING"
    });

    await order.save();

    // Notify Farmer
    const notif = new Notification({
      userId: project.farmer,
      title: "New Procurement Order Initiated",
      message: `Buyer has initiated procurement for ${project.crop}. Quantity: ${quantity} tonnes, Value: ₹${totalValue}.`
    });
    await notif.save();

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/procurement - Fetch orders (Filtered by role)
router.get("/", auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "farmer") {
      query.farmer = req.user.id;
    } else if (req.user.role === "buyer") {
      query.buyer = req.user.id;
    }

    const orders = await ProcurementOrder.find(query)
      .populate("buyer", "firstName lastName organizationName email phone location")
      .populate("farmer", "firstName lastName farmName email phone location city")
      .populate("farmProject")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/procurement/:id/status - Update order status (Buyer/Farmer/Admin)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body; // CONFIRMED, IN_TRANSIT, DELIVERED, COMPLETED
    const order = await ProcurementOrder.findById(req.params.id)
      .populate("farmProject");
    
    if (!order) return res.status(404).json({ msg: "Procurement order not found" });

    order.status = status;
    await order.save();

    // If order is completed, update the FarmProject status as well!
    if (status === "COMPLETED" || status === "DELIVERED") {
      const project = await FarmProject.findById(order.farmProject._id);
      if (project) {
        project.currentStage = "DELIVERED";
        project.progressPercentage = 100;
        project.status = "COMPLETED";
        await project.save();
      }
    }

    // Create notifications for both Buyer and Farmer
    const farmerNotif = new Notification({
      userId: order.farmer,
      title: "Procurement Order Status Update",
      message: `Your procurement order of ${order.quantity} tonnes of ${order.farmProject.crop} is now ${status}.`
    });
    await farmerNotif.save();

    const buyerNotif = new Notification({
      userId: order.buyer,
      title: "Procurement Order Status Update",
      message: `Your procurement order of ${order.quantity} tonnes of ${order.farmProject.crop} is now ${status}.`
    });
    await buyerNotif.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
