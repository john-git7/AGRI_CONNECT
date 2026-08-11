const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["farmer", "buyer", "admin"], required: true },
    city: { type: String, required: true },

    // Farmer-specific fields
    farmName: { type: String },
    location: { type: String }, // e.g. state like Tamil Nadu, Karnataka
    acreage: { type: Number, default: 0 },
    crops: [{ type: String }],
    verificationStatus: { type: String, enum: ["PENDING", "VERIFIED"], default: "PENDING" },

    // Buyer-specific fields
    organizationName: { type: String },
    organizationType: { type: String }, // e.g. Restaurant, Retail chain, Exporter, Agribusiness, Food processor
    procurementCategories: [{ type: String }],

    // Backwards compatibility / old fields
    farmAddress: { type: String },
    deliveryAddress: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
