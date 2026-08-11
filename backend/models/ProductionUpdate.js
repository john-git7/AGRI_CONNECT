const mongoose = require("mongoose");

const productionUpdateSchema = new mongoose.Schema(
  {
    farmProject: { type: mongoose.Schema.Types.ObjectId, ref: "FarmProject", required: true },
    stage: { type: String, required: true },
    progressPercentage: { type: Number, required: true },
    photos: [{ type: String }],
    notes: { type: String },
    expenses: { type: Number, default: 0 },
    weatherObservation: { type: String },
    expectedHarvestDate: { type: Date },
    estimatedYield: { type: Number } // tonnes
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductionUpdate", productionUpdateSchema);
