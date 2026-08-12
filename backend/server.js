if (process.env.NODE_ENV !== "production") {
  const dns = require("dns");
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (err) {
    console.warn("Could not set custom DNS servers:", err.message);
  }
}


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Upload Folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import Routes
const authRoutes = require("./routes/auth");
const requirementRoutes = require("./routes/requirementRoutes");
const commitmentRoutes = require("./routes/commitmentRoutes");
const farmProjectRoutes = require("./routes/farmProjectRoutes");
const supportRoutes = require("./routes/supportRoutes");
const productionRoutes = require("./routes/productionRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Wire Routes
app.use("/api/auth", authRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/commitments", commitmentRoutes);
app.use("/api/farm-projects", farmProjectRoutes);
app.use("/api/farm-projects", productionRoutes); // handles /:id/updates
app.use("/api/support-requests", supportRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB Atlas connected successfully"))
  .catch((err) => {
    console.error("MongoDB Atlas connection failed:");
    console.error(err.message || err);
    process.exit(1);
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
