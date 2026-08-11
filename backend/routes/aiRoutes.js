const express = require("express");
const router = express.Router();
const BuyerRequirement = require("../models/BuyerRequirement");
const CropCommitment = require("../models/CropCommitment");
const FarmProject = require("../models/FarmProject");
const User = require("../models/user");
const auth = require("../middleware/authh");

// Baseline yields per acre in tonnes
const CROP_BASELINES = {
  tomato: 15,
  onion: 10,
  paddy: 3,
  potato: 12,
  banana: 18,
  chilli: 4,
  default: 6
};

// POST /api/ai/yield-prediction - Estimate yield dynamically
router.post("/yield-prediction", async (req, res) => {
  try {
    const { crop, acreage, stage } = req.body;
    if (!crop || !acreage) {
      return res.status(400).json({ msg: "Crop and acreage are required" });
    }

    const cropKey = crop.toLowerCase().trim();
    const baseline = CROP_BASELINES[cropKey] || CROP_BASELINES.default;

    const baseYield = Number(acreage) * baseline;
    const minYield = Number((baseYield * 0.92).toFixed(1));
    const maxYield = Number((baseYield * 1.08).toFixed(1));

    // Confidence grows as crop stage advances
    let confidence = 75;
    if (stage === "GERMINATION" || stage === "VEGETATIVE") confidence = 82;
    if (stage === "FLOWERING" || stage === "FRUITING") confidence = 90;
    if (stage === "HARVEST_READY") confidence = 96;

    res.json({
      estimatedYield: Number(baseYield.toFixed(1)),
      minYield,
      maxYield,
      confidence,
      disclaimer: "Yield estimate is model-assisted, calculated from crop baseline agronomy data and subject to local weather conditions."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/ai/risk-analysis - Risk levels
router.post("/risk-analysis", async (req, res) => {
  try {
    const { crop, stage, location, weather } = req.body;

    let riskLevel = "LOW";
    let explanation = "Optimal growing conditions. Crop health is on track.";

    const locLower = (location || "").toLowerCase();
    const weatherLower = (weather || "").toLowerCase();

    if (weatherLower.includes("rain") || weatherLower.includes("flood") || locLower.includes("tamil nadu")) {
      riskLevel = "MEDIUM";
      explanation = "Heavy rainfall forecast in this coastal region may cause mild water logging. Monitor drainage.";
    }

    if (weatherLower.includes("drought") || weatherLower.includes("dry") || weatherLower.includes("heat")) {
      riskLevel = "HIGH";
      explanation = "High temperatures and below-average moisture detected. Supplemental irrigation required immediately to avoid flower dropping.";
    }

    if (stage === "FRUITING" && riskLevel === "MEDIUM") {
      riskLevel = "HIGH";
      explanation = "Excess rain during fruiting phase increases risk of fungal blight. Preventive organic fungicide spraying is recommended.";
    }

    res.json({
      riskLevel,
      explanation,
      lastChecked: new Date()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/ai/match-farmers - Match farmers to buyer requirements
router.post("/match-farmers", async (req, res) => {
  try {
    const { requirementId } = req.body;
    const requirement = await BuyerRequirement.findById(requirementId);
    if (!requirement) return res.status(404).json({ msg: "Requirement not found" });

    // Fetch all active farmers
    const farmers = await User.find({ role: "farmer" });

    const matches = farmers.map((farmer) => {
      let score = 50; // base score
      let reasons = [];

      const cropMatch = farmer.crops.some(
        (c) => c.toLowerCase() === requirement.crop.toLowerCase()
      );
      if (cropMatch) {
        score += 25;
        reasons.push("✓ Specializes in " + requirement.crop);
      } else {
        reasons.push("✗ Different primary crops");
      }

      const locMatch = farmer.location?.toLowerCase() === requirement.location.toLowerCase();
      if (locMatch) {
        score += 15;
        reasons.push("✓ Located in same state/region (" + requirement.location + ")");
      } else {
        reasons.push("! Cross-state logistics will apply");
      }

      // Check if farm acreage can theoretically handle expected demand
      const baseline = CROP_BASELINES[requirement.crop.toLowerCase()] || 5;
      const farmCapacity = (farmer.acreage || 1) * baseline;
      if (farmCapacity >= requirement.quantity) {
        score += 10;
        reasons.push("✓ Sufficient acreage capacity to support quantity (" + farmer.acreage + " acres)");
      } else {
        reasons.push("! Farm capacity is " + farmCapacity.toFixed(0) + " tonnes; partial commitment recommended");
      }

      if (farmer.verificationStatus === "VERIFIED") {
        score += 5;
        reasons.push("✓ Verified seller credential");
      }

      // cap score at 100, min 30
      score = Math.min(100, Math.max(30, score));

      return {
        farmerId: farmer._id,
        firstName: farmer.firstName,
        lastName: farmer.lastName,
        farmName: farmer.farmName,
        city: farmer.city,
        location: farmer.location,
        acreage: farmer.acreage,
        matchScore: score,
        reasons
      };
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/ai/demand-insights - Buyer dashboard aggregate data
router.get("/demand-insights", auth, async (req, res) => {
  try {
    const requirements = await BuyerRequirement.find({ buyerId: req.user.id });
    const insights = await Promise.all(
      requirements.map(async (reqItem) => {
        const commitments = await CropCommitment.find({
          buyerRequirement: reqItem._id,
          status: "ACCEPTED"
        });

        const totalCommitted = commitments.reduce((acc, cur) => acc + cur.committedQuantity, 0);
        const committedPercentage = reqItem.quantity > 0
          ? Math.round((totalCommitted / reqItem.quantity) * 100)
          : 0;
        const supplyGap = Math.max(0, reqItem.quantity - totalCommitted);

        let aiFeedback = `Current committed supply covers ${committedPercentage}% of your requirement.`;
        if (committedPercentage < 50) {
          aiFeedback += " Supply levels are critically low. Consider connecting with matched farmers in Tamil Nadu.";
        } else if (committedPercentage < 100) {
          aiFeedback += ` You need ${supplyGap} more tonnes to bridge the gap. Recommend engaging secondary commitments.`;
        } else {
          aiFeedback += " Procurement commitments are fully met. Ensure tracking logs are regularly updated.";
        }

        return {
          requirementId: reqItem._id,
          crop: reqItem.crop,
          requiredQuantity: reqItem.quantity,
          committedQuantity: totalCommitted,
          supplyGap,
          committedPercentage,
          aiFeedback
        };
      })
    );

    res.json(insights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
