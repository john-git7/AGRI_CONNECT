const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Ignore DNS config warnings in non-local environments
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Models
const User = require("./models/user");
const BuyerRequirement = require("./models/BuyerRequirement");
const CropCommitment = require("./models/CropCommitment");
const FarmProject = require("./models/FarmProject");
const SupportRequest = require("./models/SupportRequest");
const ProductionUpdate = require("./models/ProductionUpdate");
const ProcurementOrder = require("./models/ProcurementOrder");
const Notification = require("./models/Notification");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/agri_connect";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    try {
      await mongoose.connect(MONGO_URI);
    } catch (err) {
      if (MONGO_URI !== "mongodb://localhost:27017/agri_connect") {
        console.warn("MongoDB Atlas connection failed. Falling back to local MongoDB on port 27017...");
        await mongoose.connect("mongodb://localhost:27017/agri_connect");
      } else {
        throw err;
      }
    }
    console.log("Connected. Clearing old data...");

    await User.deleteMany({});
    await BuyerRequirement.deleteMany({});
    await CropCommitment.deleteMany({});
    await FarmProject.deleteMany({});
    await SupportRequest.deleteMany({});
    await ProductionUpdate.deleteMany({});
    await ProcurementOrder.deleteMany({});
    await Notification.deleteMany({});

    console.log("Hashing passwords...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    console.log("Creating users...");
    // 1. Admin
    const admin = new User({
      firstName: "Ecosystem",
      lastName: "Admin",
      email: "admin@agriconnect.com",
      phone: "+919999999999",
      password: passwordHash,
      role: "admin",
      city: "Chennai",
      location: "Tamil Nadu",
      verificationStatus: "VERIFIED"
    });
    await admin.save();

    // 2. Farmers
    const farmerKumar = new User({
      firstName: "Kumar",
      lastName: "Ramasamy",
      email: "kumar@gmail.com",
      phone: "+919876543210",
      password: passwordHash,
      role: "farmer",
      city: "Salem",
      location: "Tamil Nadu",
      farmName: "Kumar's Agritech Farms",
      farmAddress: "12, Omalur Main Rd, Salem, TN",
      acreage: 8,
      crops: ["Tomato", "Paddy"],
      verificationStatus: "VERIFIED"
    });
    await farmerKumar.save();

    const farmerReddy = new User({
      firstName: "Venkata",
      lastName: "Reddy",
      email: "reddy@gmail.com",
      phone: "+919865432109",
      password: passwordHash,
      role: "farmer",
      city: "Kurnool",
      location: "Andhra Pradesh",
      farmName: "Reddy Royal Farms",
      farmAddress: "45, Gooty Road, Kurnool, AP",
      acreage: 15,
      crops: ["Onion", "Chilli"],
      verificationStatus: "VERIFIED"
    });
    await farmerReddy.save();

    const farmerGowda = new User({
      firstName: "Karthik",
      lastName: "Gowda",
      email: "gowda@gmail.com",
      phone: "+919854321098",
      password: passwordHash,
      role: "farmer",
      city: "Mandya",
      location: "Karnataka",
      farmName: "Gowda Organic Farms",
      farmAddress: "88, Maddur Taluk, Mandya, KA",
      acreage: 12,
      crops: ["Potato", "Banana", "Onion"],
      verificationStatus: "PENDING"
    });
    await farmerGowda.save();

    // 3. Buyers
    const buyerFresh = new User({
      firstName: "Siddharth",
      lastName: "Mehta",
      email: "buyer@gmail.com", // Main demo buyer
      phone: "+919123456789",
      password: passwordHash,
      role: "buyer",
      city: "Bengaluru",
      location: "Karnataka",
      organizationName: "FreshHarvest Foods Processing",
      organizationType: "Food processor",
      procurementCategories: ["Tomato", "Onion", "Potato"],
      verificationStatus: "VERIFIED"
    });
    await buyerFresh.save();

    const buyerRetail = new User({
      firstName: "Neha",
      lastName: "Sharma",
      email: "retailgiant@gmail.com",
      phone: "+919234567890",
      password: passwordHash,
      role: "buyer",
      city: "Mumbai",
      location: "Maharashtra",
      organizationName: "SuperMart Retail Chains",
      organizationType: "Retail chain",
      procurementCategories: ["Tomato", "Banana", "Potato"],
      verificationStatus: "VERIFIED"
    });
    await buyerRetail.save();

    console.log("Creating Buyer Requirements...");
    // Requirements
    const reqTomato = new BuyerRequirement({
      buyerId: buyerFresh._id,
      crop: "Tomato",
      quantity: 100, // tonnes
      quality: "Grade A",
      location: "Tamil Nadu",
      expectedDelivery: "June 20–30",
      targetPrice: "₹28–32/kg",
      status: "open"
    });
    await reqTomato.save();

    const reqOnion = new BuyerRequirement({
      buyerId: buyerFresh._id,
      crop: "Onion",
      quantity: 60,
      quality: "Grade A",
      location: "Andhra Pradesh",
      expectedDelivery: "July 10–20",
      targetPrice: "₹20–24/kg",
      status: "open"
    });
    await reqOnion.save();

    const reqBanana = new BuyerRequirement({
      buyerId: buyerRetail._id,
      crop: "Banana",
      quantity: 40,
      quality: "Premium",
      location: "Karnataka",
      expectedDelivery: "June 15–25",
      targetPrice: "₹35–40/kg",
      status: "open"
    });
    await reqBanana.save();

    const reqPotato = new BuyerRequirement({
      buyerId: buyerRetail._id,
      crop: "Potato",
      quantity: 80,
      quality: "Grade A",
      location: "Karnataka",
      expectedDelivery: "June 25–July 5",
      targetPrice: "₹18–22/kg",
      status: "open"
    });
    await reqPotato.save();

    console.log("Creating Commitments & Farm Projects...");
    
    // 1. Accepted Tomato Commitment & Project
    const commitTomato = new CropCommitment({
      buyerRequirement: reqTomato._id,
      farmer: farmerKumar._id,
      buyer: buyerFresh._id,
      expectedYield: 25,
      committedQuantity: 20,
      status: "ACCEPTED"
    });
    await commitTomato.save();

    const harvestDateKumar = new Date();
    harvestDateKumar.setDate(harvestDateKumar.getDate() + 45); // expected harvest in 45 days

    const projTomato = new FarmProject({
      farmer: farmerKumar._id,
      crop: "Tomato",
      variety: "Arka Abha Hybrid",
      acreage: 4,
      location: "Tamil Nadu",
      expectedYield: 25,
      committedQuantity: 20,
      cultivationCost: 160000,
      supportRequired: 80000,
      expectedHarvestDate: harvestDateKumar,
      buyer: buyerFresh._id,
      buyerRequirement: reqTomato._id,
      currentStage: "VEGETATIVE",
      progressPercentage: 50,
      riskLevel: "MEDIUM",
      status: "ACTIVE"
    });
    await projTomato.save();

    // Support Request for Tomato Project
    const supportTomato = new SupportRequest({
      farmProject: projTomato._id,
      farmer: farmerKumar._id,
      cultivationCost: 160000,
      farmerContribution: 80000,
      supportRequired: 80000,
      status: "APPROVED" // Approved support request
    });
    await supportTomato.save();

    // Production Updates (timeline) for Tomato Project
    const update1 = new ProductionUpdate({
      farmProject: projTomato._id,
      stage: "PLANTED",
      progressPercentage: 20,
      notes: "Sowing completed successfully using high-yield seeds. Soil bed prepared with organic compost.",
      expenses: 45000,
      weatherObservation: "Moderate rain, temperature around 32°C. Excellent for initial growth.",
      expectedHarvestDate: harvestDateKumar,
      estimatedYield: 25
    });
    await update1.save();

    const update2 = new ProductionUpdate({
      farmProject: projTomato._id,
      stage: "GERMINATION",
      progressPercentage: 30,
      notes: "Germination successfully verified across 95% of rows. First stage fertilizer dose administered.",
      expenses: 15000,
      weatherObservation: "Sunny conditions. Irrigation scheduled every alternate morning.",
      expectedHarvestDate: harvestDateKumar,
      estimatedYield: 25
    });
    await update2.save();

    const update3 = new ProductionUpdate({
      farmProject: projTomato._id,
      stage: "VEGETATIVE",
      progressPercentage: 50,
      notes: "Vegetative stems showing robust health. Staking process has started for vertical support.",
      expenses: 25000,
      weatherObservation: "Slight humidity. Region has warning for light showers, drainage channels cleared.",
      expectedHarvestDate: harvestDateKumar,
      estimatedYield: 24.5
    });
    await update3.save();

    // 2. Pending Potato Commitment
    const commitPotato = new CropCommitment({
      buyerRequirement: reqPotato._id,
      farmer: farmerGowda._id,
      buyer: buyerRetail._id,
      expectedYield: 35,
      committedQuantity: 30,
      status: "PENDING"
    });
    await commitPotato.save();

    // 3. Historical completed procurement record (Paddy) to fill history
    const oldReqPaddy = new BuyerRequirement({
      buyerId: buyerFresh._id,
      crop: "Paddy",
      quantity: 50,
      quality: "Basmati",
      location: "Tamil Nadu",
      expectedDelivery: "April 1-10",
      targetPrice: "₹45/kg",
      status: "fulfilled"
    });
    await oldReqPaddy.save();

    const oldProjPaddy = new FarmProject({
      farmer: farmerKumar._id,
      crop: "Paddy",
      variety: "Pusa Basmati 1121",
      acreage: 5,
      location: "Tamil Nadu",
      expectedYield: 15,
      committedQuantity: 15,
      cultivationCost: 120000,
      supportRequired: 0,
      expectedHarvestDate: new Date("2026-04-05"),
      actualHarvestDate: new Date("2026-04-04"),
      buyer: buyerFresh._id,
      buyerRequirement: oldReqPaddy._id,
      currentStage: "DELIVERED",
      progressPercentage: 100,
      riskLevel: "LOW",
      status: "COMPLETED"
    });
    await oldProjPaddy.save();

    const procurementPaddy = new ProcurementOrder({
      buyer: buyerFresh._id,
      farmer: farmerKumar._id,
      farmProject: oldProjPaddy._id,
      quantity: 15,
      quality: "Basmati Grade 1",
      agreedPrice: 45,
      totalValue: 675000, // 15 tonnes * 1000 * 45 = 6,75,000
      deliveryLocation: "FreshHarvest Depot, Chennai",
      procurementDate: new Date("2026-04-06"),
      status: "COMPLETED"
    });
    await procurementPaddy.save();

    console.log("Creating Notification alerts...");
    
    // Notifications
    const n1 = new Notification({
      userId: buyerFresh._id,
      title: "Tomato pre-adoption commitment",
      message: "Farmer Kumar Ramasamy submitted a 20-tonne tomato commitment for your open requirement."
    });
    await n1.save();

    const n2 = new Notification({
      userId: farmerKumar._id,
      title: "Pre-Harvest Support Approved",
      message: "Your financial support request of ₹80,000 for your Tomato Project has been approved."
    });
    await n2.save();

    const n3 = new Notification({
      userId: admin._id,
      title: "New Farmer Verification Pending",
      message: "Farmer Karthik Gowda is awaiting profile verification."
    });
    await n3.save();

    console.log("Database seeded successfully!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
