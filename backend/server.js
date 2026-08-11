const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

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

// Connect to MongoDB with local fallback
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/agri_connect";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    if (mongoURI !== "mongodb://localhost:27017/agri_connect") {
      console.warn("MongoDB Atlas connection failed. Falling back to local MongoDB on port 27017...");
      mongoose.connect("mongodb://localhost:27017/agri_connect")
        .then(() => console.log("MongoDB connected successfully to local database"))
        .catch((localErr) => {
          console.error("Local MongoDB fallback connection error:", localErr);
          process.exit(1);
        });
    } else {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
