const mongoose = require("mongoose");

const supportRequestSchema = new mongoose.Schema(
  {
    farmProject: { type: mongoose.Schema.Types.ObjectId, ref: "FarmProject", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cultivationCost: { type: Number, required: true },
    farmerContribution: { type: Number, required: true },
    supportRequired: { type: Number, required: true },
    status: {
      type: String,
      enum: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"],
      default: "REQUESTED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportRequest", supportRequestSchema);
