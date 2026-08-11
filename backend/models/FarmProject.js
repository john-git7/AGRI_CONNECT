const mongoose = require("mongoose");

const farmProjectSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crop: { type: String, required: true },
    variety: { type: String, default: "Standard" },
    acreage: { type: Number, required: true },
    location: { type: String, required: true },
    expectedYield: { type: Number, required: true }, // tonnes
    committedQuantity: { type: Number, required: true }, // tonnes
    cultivationCost: { type: Number, required: true },
    supportRequired: { type: Number, default: 0 },
    expectedHarvestDate: { type: Date, required: true },
    actualHarvestDate: { type: Date },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerRequirement: { type: mongoose.Schema.Types.ObjectId, ref: "BuyerRequirement", required: true },
    currentStage: {
      type: String,
      enum: [
        "PLANNING",
        "PLANTED",
        "GERMINATION",
        "VEGETATIVE",
        "FLOWERING",
        "FRUITING",
        "HARVEST_READY",
        "HARVESTED",
        "DELIVERED"
      ],
      default: "PLANNING"
    },
    progressPercentage: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW"
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FarmProject", farmProjectSchema);
