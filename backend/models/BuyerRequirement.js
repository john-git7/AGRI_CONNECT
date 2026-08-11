const mongoose = require("mongoose");

const buyerRequirementSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crop: { type: String, required: true },
    quantity: { type: Number, required: true }, // in tonnes
    quality: { type: String, required: true }, // e.g. Grade A
    location: { type: String, required: true }, // e.g. Tamil Nadu
    expectedDelivery: { type: String, required: true }, // e.g. June 20-30
    targetPrice: { type: String, required: true }, // e.g. ₹28–32/kg
    status: {
      type: String,
      enum: ["open", "closed", "fulfilled"],
      default: "open"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuyerRequirement", buyerRequirementSchema);
