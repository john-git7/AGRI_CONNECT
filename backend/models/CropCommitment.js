const mongoose = require("mongoose");

const cropCommitmentSchema = new mongoose.Schema(
  {
    buyerRequirement: { type: mongoose.Schema.Types.ObjectId, ref: "BuyerRequirement", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expectedYield: { type: Number, required: true }, // tonnes
    committedQuantity: { type: Number, required: true }, // tonnes
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "IN_PROGRESS",
        "HARVEST_READY",
        "FULFILLED",
        "CANCELLED"
      ],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CropCommitment", cropCommitmentSchema);
