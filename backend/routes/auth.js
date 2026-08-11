const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // Note: user.js is lowercase
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authh");

const INDIAN_STATES_AND_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Namsai", "Tawang"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Ara", "Begusarai", "Katihar"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Morbi"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Nahan", "Baddi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere", "Ballari", "Vijayapura", "Kalaburagi", "Shivamogga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Amravati", "Kolhapur"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Tuensang"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Bharatpur"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Tirunelveli", "Nagercoil", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani-cum-Kathgodam", "Rudrapur", "Kashipur"],
  "West Bengal": ["Kolkata", "Howrah", "Navi Mumbai", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Vasant Kunj"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

// @route   POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      password,
      role,
      farmName,
      location,
      acreage,
      crops,
      organizationName,
      organizationType,
      procurementCategories
    } = req.body;

    // Validate inputs
    if (!firstName || !lastName || !email || !phone || !city || !location || !password || !role) {
      return res.status(400).json({ msg: "Please fill in all required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Please enter a valid email address" });
    }

    const phoneRegex = /^\+91[5-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ msg: "Please enter a valid 10-digit Indian phone number starting with +91" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // Validate state (location)
    if (!INDIAN_STATES_AND_CITIES[location]) {
      return res.status(400).json({ msg: `Please select a valid Indian State. '${location}' is invalid.` });
    }

    // Validate city
    const stateCities = INDIAN_STATES_AND_CITIES[location];
    if (!stateCities.includes(city)) {
      return res.status(400).json({ msg: `Please select a valid City in ${location}. '${city}' is invalid.` });
    }

    if (role === "farmer") {
      if (!farmName || farmName.trim() === "") {
        return res.status(400).json({ msg: "Farm Name is required for Farmers" });
      }
      if (acreage === undefined || acreage === null || Number(acreage) <= 0) {
        return res.status(400).json({ msg: "Acreage must be a positive number for Farmers" });
      }
      if (!crops || (typeof crops === "string" && crops.trim() === "")) {
        return res.status(400).json({ msg: "Please enter at least one crop for Farmers" });
      }
    } else if (role === "buyer" || role === "consumer") {
      if (!organizationName || organizationName.trim() === "") {
        return res.status(400).json({ msg: "Organization Name is required for Buyers" });
      }
      if (!procurementCategories || (typeof procurementCategories === "string" && procurementCategories.trim() === "")) {
        return res.status(400).json({ msg: "Please enter at least one procurement category for Buyers" });
      }
    } else {
      return res.status(400).json({ msg: "Invalid user role specified" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Map legacy consumer role to buyer
    const mappedRole = role === "consumer" ? "buyer" : role;

    user = new User({
      firstName,
      lastName,
      email,
      phone,
      city,
      role: mappedRole,
      password: hashedPassword,
      farmName,
      location: location || city,
      acreage: acreage ? Number(acreage) : 0,
      crops: Array.isArray(crops) ? crops : (crops ? crops.split(",").map(c => c.trim()) : []),
      organizationName,
      organizationType,
      procurementCategories: Array.isArray(procurementCategories)
        ? procurementCategories
        : (procurementCategories ? procurementCategories.split(",").map(c => c.trim()) : []),
      verificationStatus: "PENDING"
    });

    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/auth/me
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/me", auth, getUserProfile);
router.get("/profile", auth, getUserProfile);

// @route   GET /api/auth/users
// @access  Private (Admin only)
router.get("/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admins can view users list" });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   PUT /api/auth/users/:id/verify
// @access  Private (Admin only)
router.put("/users/:id/verify", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admins can verify profiles" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.verificationStatus = "VERIFIED";
    await user.save();
    res.json({ msg: "User verified successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
