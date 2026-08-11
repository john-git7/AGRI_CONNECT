const mongoose = require("mongoose");

const procurementOrderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmProject: { type: mongoose.Schema.Types.ObjectId, ref: "FarmProject", required: true },
    quantity: { type: Number, required: true }, // in tonnes
    quality: { type: String, required: true }, // e.g. Grade A
    agreedPrice: { type: Number, required: true }, // ₹ per kg
    totalValue: { type: Number, required: true }, // total value in ₹
    deliveryLocation: { type: String, required: true },
    procurementDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "COMPLETED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProcurementOrder", procurementOrderSchema);
