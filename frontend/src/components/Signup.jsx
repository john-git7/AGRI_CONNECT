import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Leaf,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Home,
  MapPin,
  Eye,
  EyeOff,
  Briefcase,
  Layers
} from "lucide-react";
import axios from "../axiosConfig";
import { toast } from "react-toastify";

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

const Signup = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null });
  const animationFrameRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState("role");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
    role: "", // farmer or buyer
    // Farmer fields
    farmName: "",
    location: "", // State
    acreage: "",
    crops: "", // Comma-separated
    // Buyer fields
    organizationName: "",
    organizationType: "Food processor", // Default
    procurementCategories: "" // Comma-separated
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      error = "This field is required";
    } else {
      if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
      }
      if (name === "phone") {
        const phoneRegex = /^\+91[5-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
          error = "Please enter a valid 10-digit Indian phone number";
        }
      }
      if (name === "password" && value.length < 6) {
        error = "Password must be at least 6 characters";
      }
      if (name === "confirmPassword" && value !== formData.password) {
        error = "Passwords do not match";
      }
      if (name === "acreage") {
        const valNum = Number(value);
        if (isNaN(valNum) || valNum <= 0) {
          error = "Acreage must be a positive number";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleStateChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, location: val, city: "" }));
    validateField("location", val);
    setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      const fullPhone = val ? `+91${val}` : "";
      setFormData((prev) => ({ ...prev, phone: fullPhone }));
      validateField("phone", fullPhone);
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setStep("form");
  };

  const validateForm = () => {
    const newErrors = {};

    const commonFields = ["firstName", "lastName", "email", "phone", "city", "location", "password", "confirmPassword"];
    commonFields.forEach((field) => {
      const val = formData[field];
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
        newErrors[field] = "This field is required";
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^\+91[5-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "farmer") {
      if (!formData.farmName || formData.farmName.trim() === "") {
        newErrors.farmName = "Farm Name is required";
      }
      if (!formData.acreage || Number(formData.acreage) <= 0) {
        newErrors.acreage = "Acreage must be a positive number";
      }
      if (!formData.crops || formData.crops.trim() === "") {
        newErrors.crops = "Crops are required";
      }
    } else if (formData.role === "buyer") {
      if (!formData.organizationName || formData.organizationName.trim() === "") {
        newErrors.organizationName = "Organization Name is required";
      }
      if (!formData.procurementCategories || formData.procurementCategories.trim() === "") {
        newErrors.procurementCategories = "Procurement Categories are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getInputClass = (fieldName, extraClasses = "") => {
    const baseClass = "w-full py-3 border rounded-xl text-sm focus:outline-none transition-all duration-300";
    const stateClass = errors[fieldName]
      ? "border-red-500 bg-red-50/10 focus:border-red-650 focus:ring-4 focus:ring-red-100 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
      : "border-slate-200 focus:border-emerald-600 bg-slate-50/50 focus:ring-4 focus:ring-emerald-100";
    return `${baseClass} ${stateClass} ${extraClasses}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the highlighted errors in the form.");
      return;
    }

    try {
      const res = await axios.post("/auth/signup", formData);
      toast.success("Account created successfully!");
      
      const loginRes = await axios.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = loginRes.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", `${user.firstName} ${user.lastName}`);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Signup failed");
    }
  };

  // Particle Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const particleCount = 70;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
    }));

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] flex items-center justify-center overflow-hidden py-12 px-4">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-2xl w-full"
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {step === "role" && (
            <motion.div
              key="role-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-emerald-100 rounded-3xl shadow-xl p-8 text-center space-y-6"
            >
              <h2 className="text-3xl font-extrabold text-emerald-950">Join AgriConnect</h2>
              <p className="text-slate-500 max-w-sm mx-auto text-sm">
                Select your primary account type to participate in B2B pre-harvest agricultural supply contracts.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleRoleSelect("farmer")}
                  className="flex flex-col items-center gap-4 bg-emerald-800 text-white p-6 rounded-2xl hover:bg-emerald-900 transition shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="bg-emerald-700/60 p-3 rounded-full text-emerald-100 group-hover:scale-105 transition-transform">
                    <Leaf size={28} />
                  </div>
                  <div>
                    <span className="font-bold text-lg block">Farmer</span>
                    <span className="text-xs text-emerald-200 mt-1 block">Cultivate against secure bulk commitments.</span>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("buyer")}
                  className="flex flex-col items-center gap-4 bg-white border border-emerald-200 text-emerald-950 p-6 rounded-2xl hover:bg-emerald-50/50 transition shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-800 group-hover:scale-105 transition-transform">
                    <ShoppingCart size={28} />
                  </div>
                  <div>
                    <span className="font-bold text-lg block text-emerald-900">Bulk Buyer</span>
                    <span className="text-xs text-slate-500 mt-1 block">Contract crop supply before seeding starts.</span>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-800 transition"
                >
                  <ArrowLeft size={16} />
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-emerald-100 rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-emerald-950 text-center mb-6">
                Register as {formData.role === "farmer" ? "Farmer" : "Bulk Buyer"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      FIRST NAME <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={getInputClass("firstName", "pl-10 pr-4")}
                        placeholder="John"
                        required
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      LAST NAME <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={getInputClass("lastName", "pl-10 pr-4")}
                        placeholder="Doe"
                        required
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      EMAIL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={getInputClass("email", "pl-10 pr-4")}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      PHONE NUMBER <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 text-slate-500 border-r pr-2 border-slate-200">
                        <Phone size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone ? formData.phone.replace("+91", "") : ""}
                        onChange={handlePhoneChange}
                        className={getInputClass("phone", "pl-20 pr-4")}
                        placeholder="98765 43210"
                        maxLength="10"
                        required
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      STATE <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleStateChange}
                        className={getInputClass("location", "pl-10 pr-10 appearance-none cursor-pointer")}
                        required
                      >
                        <option value="">Select State</option>
                        {Object.keys(INDIAN_STATES_AND_CITIES).map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                    {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      CITY / TOWN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={getInputClass("city", "pl-10 pr-10 appearance-none cursor-pointer disabled:opacity-50")}
                        required
                        disabled={!formData.location}
                      >
                        <option value="">{formData.location ? "Select City" : "Select State First"}</option>
                        {formData.location && INDIAN_STATES_AND_CITIES[formData.location]?.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                    {errors.city && <p className="text-red-500 text-xs mt-1 font-medium">{errors.city}</p>}
                  </div>
                </div>

                {/* Farmer Profile Fields */}
                {formData.role === "farmer" && (
                  <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-4">
                    <span className="block text-xs font-bold text-emerald-800">FARM PROFILE INFORMATION</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          FARM NAME <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="farmName"
                          value={formData.farmName}
                          onChange={handleInputChange}
                          className={getInputClass("farmName", "px-4")}
                          placeholder="Kumar Ramasamy Farms"
                          required
                        />
                        {errors.farmName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.farmName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          TOTAL ACREAGE (ACRES) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="acreage"
                          value={formData.acreage}
                          onChange={handleInputChange}
                          className={getInputClass("acreage", "px-4")}
                          placeholder="8"
                          required
                        />
                        {errors.acreage && <p className="text-red-500 text-xs mt-1 font-medium">{errors.acreage}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        CROPS CULTIVATED (COMMA SEPARATED) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="crops"
                        value={formData.crops}
                        onChange={handleInputChange}
                        className={getInputClass("crops", "px-4")}
                        placeholder="Tomato, Onion, Paddy"
                        required
                      />
                      {errors.crops && <p className="text-red-500 text-xs mt-1 font-medium">{errors.crops}</p>}
                    </div>
                  </div>
                )}

                {/* Buyer Profile Fields */}
                {formData.role === "buyer" && (
                  <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-4">
                    <span className="block text-xs font-bold text-emerald-800">BUYER ORGANIZATION DETAILS</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          ORGANIZATION NAME <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          className={getInputClass("organizationName", "px-4")}
                          placeholder="FreshHarvest Processing Ltd"
                          required
                        />
                        {errors.organizationName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.organizationName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">ORGANIZATION TYPE</label>
                        <div className="relative">
                          <select
                            name="organizationType"
                            value={formData.organizationType}
                            onChange={handleInputChange}
                            className={getInputClass("organizationType", "px-4 appearance-none cursor-pointer")}
                          >
                            <option value="Restaurant">Restaurant</option>
                            <option value="Food processor">Food processor</option>
                            <option value="Retail chain">Retail chain</option>
                            <option value="Agribusiness">Agribusiness</option>
                            <option value="Exporter">Exporter</option>
                            <option value="Institutional buyer">Institutional buyer</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        PROCUREMENT CATEGORIES (COMMA SEPARATED) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="procurementCategories"
                        value={formData.procurementCategories}
                        onChange={handleInputChange}
                        className={getInputClass("procurementCategories", "px-4")}
                        placeholder="Tomato, Potato, Onion"
                        required
                      />
                      {errors.procurementCategories && <p className="text-red-500 text-xs mt-1 font-medium">{errors.procurementCategories}</p>}
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      PASSWORD <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={getInputClass("password", "pl-10 pr-10")}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-emerald-700"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      CONFIRM PASSWORD <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={getInputClass("confirmPassword", "pl-10 pr-10")}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-emerald-700"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                  >
                    Create Account
                  </button>
                </div>
              </form>

              <div className="w-full mt-6 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="text-emerald-700 font-bold hover:underline">
                    Login here
                  </Link>
                </p>
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-800 transition"
                >
                  <ArrowLeft size={14} /> Back to Role Selection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;
