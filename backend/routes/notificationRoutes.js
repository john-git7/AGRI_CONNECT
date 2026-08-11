const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/authh");

// GET /api/notifications - Get user notifications
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ msg: "Notification not found" });

    if (notif.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
