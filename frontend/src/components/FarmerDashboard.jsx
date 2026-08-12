import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { toast } from "react-toastify";
import Timeline from "./Timeline";
import { 
  Plus, 
  Leaf, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  Cpu, 
  AlertTriangle,
  Send,
  Loader,
  Layers,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

const FarmerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [procurements, setProcurements] = useState([]);
  
  // Selection states
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTimeline, setProjectTimeline] = useState([]);
  
  // AI Prediction Cache/States for selected project
  const [aiYield, setAiYield] = useState(null);
  const [aiRisk, setAiRisk] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Form states
  const [activeTab, setActiveTab] = useState("projects"); // projects, requirements, commitments, support, procurements
  const [commitmentQuantity, setCommitmentQuantity] = useState("");
  const [expectedYieldInput, setExpectedYieldInput] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  // Support request form
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [cultivationCost, setCultivationCost] = useState("");
  const [farmerContribution, setFarmerContribution] = useState("");

  // Timeline update form
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateStage, setUpdateStage] = useState("PLANNING");
  const [updateProgress, setUpdateProgress] = useState(10);
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateExpenses, setUpdateExpenses] = useState("");
  const [updateWeather, setUpdateWeather] = useState("Clear skies, sunny");
  const [updatePhotos, setUpdatePhotos] = useState([]);

  // Harvest Completion form
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [actualHarvestQty, setActualHarvestQty] = useState("");
  const [harvestQuality, setHarvestQuality] = useState("Grade A");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projRes, reqRes, commitRes, supportRes, procRes] = await Promise.all([
        axios.get("/farm-projects"),
        axios.get("/requirements"),
        axios.get("/commitments"),
        axios.get("/support-requests"),
        axios.get("/procurement")
      ]);

      setProjects(projRes.data);
      setRequirements(reqRes.data);
      setCommitments(commitRes.data);
      setSupportRequests(supportRes.data);
      setProcurements(procRes.data);

      // Auto-select first project if available
      if (projRes.data.length > 0 && !selectedProject) {
        handleSelectProject(projRes.data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setAiYield(null);
    setAiRisk(null);
    setAiLoading(true);

    try {
      // Fetch Timeline
      const timelineRes = await axios.get(`/farm-projects/${project._id}/updates`);
      setProjectTimeline(timelineRes.data);

      // Fetch AI Yield predictions
      const yieldRes = await axios.post("/ai/yield-prediction", {
        crop: project.crop,
        acreage: project.acreage,
        stage: project.currentStage
      });
      setAiYield(yieldRes.data);

      // Fetch AI Risk analysis
      const riskRes = await axios.post("/ai/risk-analysis", {
        crop: project.crop,
        stage: project.currentStage,
        location: project.location,
        weather: "Light showers" // default demo weather
      });
      setAiRisk(riskRes.data);
    } catch (err) {
      console.error("AI Insights fetch failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  const submitCommitment = async (e) => {
    e.preventDefault();
    if (!selectedRequirement) return;

    try {
      await axios.post("/commitments", {
        buyerRequirementId: selectedRequirement._id,
        expectedYield: expectedYieldInput,
        committedQuantity: commitmentQuantity
      });

      toast.success("Pre-harvest commitment submitted successfully!");
      setCommitmentQuantity("");
      setExpectedYieldInput("");
      setSelectedRequirement(null);
      fetchDashboardData();
      setActiveTab("commitments");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to submit commitment");
    }
  };

  const submitSupportRequest = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const supportVal = Number(cultivationCost) - Number(farmerContribution);
    if (supportVal <= 0) {
      toast.error("Farmer contribution must be less than total cultivation cost");
      return;
    }

    try {
      await axios.post("/support-requests", {
        farmProjectId: selectedProject._id,
        cultivationCost,
        farmerContribution,
        supportRequired: supportVal
      });

      toast.success("Financial support request logged!");
      setShowSupportForm(false);
      setCultivationCost("");
      setFarmerContribution("");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit support request");
    }
  };

  const handlePhotoChange = (e) => {
    setUpdatePhotos(Array.from(e.target.files));
  };

  const submitTimelineUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const formData = new FormData();
    formData.append("stage", updateStage);
    formData.append("progressPercentage", updateProgress);
    formData.append("notes", updateNotes);
    formData.append("expenses", updateExpenses);
    formData.append("weatherObservation", updateWeather);
    updatePhotos.forEach((img) => formData.append("photos", img));

    try {
      await axios.post(`/farm-projects/${selectedProject._id}/updates`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Progress update logged!");
      setShowUpdateForm(false);
      setUpdateNotes("");
      setUpdateExpenses("");
      setUpdatePhotos([]);
      
      // Refresh current project view
      const updatedProj = projects.find(p => p._id === selectedProject._id);
      if (updatedProj) {
        const fetchUpdated = await axios.get(`/farm-projects/${selectedProject._id}`);
        handleSelectProject(fetchUpdated.data);
      }
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post progress log");
    }
  };

  const submitHarvestCompletion = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      // 1. Log update stating harvest complete
      const formData = new FormData();
      formData.append("stage", "HARVESTED");
      formData.append("progressPercentage", 100);
      formData.append("notes", `Harvest complete. Actual quantity yield harvested: ${actualHarvestQty} tonnes. Quality checked: ${harvestQuality}.`);
      formData.append("estimatedYield", actualHarvestQty);
      
      await axios.post(`/farm-projects/${selectedProject._id}/updates`, formData);

      // 2. Put project to HARVESTED stage
      await axios.put(`/farm-projects/${selectedProject._id}`, {
        currentStage: "HARVESTED",
        progressPercentage: 100,
        actualHarvestDate: new Date()
      });

      // 3. Auto initiate a pending procurement transaction for the buyer
      await axios.post("/procurement", {
        farmProjectId: selectedProject._id,
        quantity: actualHarvestQty,
        quality: harvestQuality,
        agreedPrice: 30, // Default baseline price logic
        totalValue: Number(actualHarvestQty) * 1000 * 30, // tonnes * 1000 * Rs.30/kg
        deliveryLocation: selectedProject.location
      });

      toast.success("Harvest complete! Procurement order generated for Buyer confirmation.");
      setShowHarvestForm(false);
      setActualHarvestQty("");
      
      // Refresh
      const fetchUpdated = await axios.get(`/farm-projects/${selectedProject._id}`);
      handleSelectProject(fetchUpdated.data);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete harvest");
    }
  };

  // KPIs
  const activeProjectsCount = projects.filter(p => p.status === "ACTIVE").length;
  const committedTonnes = projects.reduce((acc, cur) => acc + cur.committedQuantity, 0);
  const supportRequestedVal = supportRequests.reduce((acc, cur) => acc + cur.supportRequired, 0);

  return (
    <div className="space-y-8">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Farm Projects", val: activeProjectsCount, desc: "Under cultivation", icon: <Leaf size={18} /> },
          { title: "Committed Quantity", val: `${committedTonnes} Tonnes`, desc: "Assured pre-harvest volume", icon: <TrendingUp size={18} /> },
          { title: "Buyer Commitments", val: commitments.length, desc: "Active agreements", icon: <CheckCircle size={18} /> },
          { title: "Support Requested", val: `₹${supportRequestedVal.toLocaleString("en-IN")}`, desc: "Ecosystem financing", icon: <DollarSign size={18} /> }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-1 hover:shadow transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">{stat.title}</span>
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg">{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
            <p className="text-[11px] text-slate-400 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto scrollbar-none whitespace-nowrap">
        {[
          { id: "projects", label: "My Crop Projects" },
          { id: "requirements", label: "Available Buyer Demand" },
          { id: "commitments", label: "Active Commitments" },
          { id: "support", label: "Financial Support Logs" },
          { id: "procurements", label: "Procurement History" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-semibold text-sm transition relative ${
              activeTab === tab.id 
                ? "text-emerald-850" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800" 
                layoutId="activeTabUnderline"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List (Left Column) */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Projects List</h3>
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
                No active projects found. Submit a commitment against buyer demand to get started!
              </div>
            ) : (
              projects.map((project) => {
                const isSelected = selectedProject?._id === project._id;
                return (
                  <div
                    key={project._id}
                    onClick={() => handleSelectProject(project)}
                    className={`p-5 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected 
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-md" 
                        : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base">{project.crop}</h4>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {project.currentStage}
                        </span>
                      </div>
                      <span className="text-xs font-bold">{project.progressPercentage}%</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs opacity-90 border-t pt-3 border-emerald-700/20">
                      <div>
                        <span className="block opacity-65">Acreage</span>
                        <span className="font-semibold">{project.acreage} Acres</span>
                      </div>
                      <div>
                        <span className="block opacity-65">Committed Qty</span>
                        <span className="font-semibold">{project.committedQuantity} Tonnes</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Project Workspace (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProject ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Project Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedProject.crop}</h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <MapPin size={14} className="text-emerald-700" /> {selectedProject.location} • Variety: {selectedProject.variety}
                    </p>
                  </div>
                  
                  {/* Actions Row */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowUpdateForm(true)}
                      className="bg-emerald-850 hover:bg-emerald-950 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition"
                    >
                      <Plus size={14} /> Log Progress
                    </button>
                    
                    {!supportRequests.some(s => s.farmProject?._id === selectedProject._id) && (
                      <button
                        onClick={() => setShowSupportForm(true)}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition"
                      >
                        <DollarSign size={14} className="text-emerald-700" /> Request Support
                      </button>
                    )}

                    {selectedProject.currentStage !== "DELIVERED" && selectedProject.currentStage !== "HARVESTED" && (
                      <button
                        onClick={() => setShowHarvestForm(true)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition"
                      >
                        <CheckCircle size={14} /> Complete Harvest
                      </button>
                    )}
                  </div>
                </div>

                {/* Analytical Intelligence Workspace Card */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Cpu size={18} className="text-emerald-750" />
                    <span>Project Analytics (Analytical Insights Engine)</span>
                  </div>
                  
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
                      <Loader className="animate-spin" size={16} /> Computing predictions...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Yield Card */}
                      {aiYield && (
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Yield Target</span>
                          <p className="text-lg font-extrabold text-slate-800">
                            {aiYield.minYield} – {aiYield.maxYield} Tonnes
                          </p>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                            <span>Confidence Matrix</span>
                            <span className="text-emerald-700 font-bold">{aiYield.confidence}% match</span>
                          </div>
                        </div>
                      )}

                      {/* Risk Card */}
                      {aiRisk && (
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Environmental Risk Index</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              aiRisk.riskLevel === "HIGH" 
                                ? "bg-red-100 text-red-800" 
                                : aiRisk.riskLevel === "MEDIUM" 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {aiRisk.riskLevel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {aiRisk.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pre-Harvest Support request panel */}
                {supportRequests.some(s => s.farmProject?._id === selectedProject._id) && (
                  (() => {
                    const reqObj = supportRequests.find(s => s.farmProject?._id === selectedProject._id);
                    return (
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">PRE-HARVEST SUPPORT VALUE</span>
                          <span className="text-slate-800 text-sm font-bold">₹{reqObj.supportRequired.toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block text-right">STATUS</span>
                          <span className={`inline-block px-2 py-1 rounded ${
                            reqObj.status === "APPROVED" || reqObj.status === "DISBURSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>{reqObj.status}</span>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Timeline Log Feed */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Cultivation Timeline</h4>
                  <Timeline updates={projectTimeline} />
                </div>

                {/* Support Request Form Modal */}
                {showSupportForm && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                      className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 space-y-6"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <h4 className="text-lg font-bold text-emerald-950">Submit Support Request</h4>
                      <p className="text-xs text-slate-400">
                        Ask our agricultural banking partners or committed buyer for pre-harvest capital assistance based on this project.
                      </p>
                      <form onSubmit={submitSupportRequest} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">TOTAL CULTIVATION COST (₹)</label>
                          <input 
                            type="number"
                            value={cultivationCost}
                            onChange={(e) => setCultivationCost(e.target.value)}
                            className="w-full border p-2.5 rounded-xl text-sm outline-none"
                            placeholder="e.g. 200000"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">FARMER CONTRIBUTION (₹)</label>
                          <input 
                            type="number"
                            value={farmerContribution}
                            onChange={(e) => setFarmerContribution(e.target.value)}
                            className="w-full border p-2.5 rounded-xl text-sm outline-none"
                            placeholder="e.g. 120000"
                            required
                          />
                        </div>
                        <div className="pt-2 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowSupportForm(false)}
                            className="px-4 py-2 border rounded-xl text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                          >
                            Submit Application
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}

                {/* Progress Log Form Modal */}
                {showUpdateForm && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                      className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 max-h-[85vh] overflow-y-auto space-y-6"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <h4 className="text-lg font-bold text-emerald-950">Log Cultivation Progress</h4>
                      <form onSubmit={submitTimelineUpdate} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">CROP STAGE</label>
                          <select 
                            value={updateStage} 
                            onChange={(e) => setUpdateStage(e.target.value)}
                            className="w-full border p-2.5 rounded-xl text-sm bg-white"
                          >
                            <option value="PLANNING">Planning</option>
                            <option value="PLANTED">Planted</option>
                            <option value="GERMINATION">Germination</option>
                            <option value="VEGETATIVE">Vegetative</option>
                            <option value="FLOWERING">Flowering</option>
                            <option value="FRUITING">Fruiting</option>
                            <option value="HARVEST_READY">Harvest Ready</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">PROGRESS PERCENTAGE ({updateProgress}%)</label>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={updateProgress}
                            onChange={(e) => setUpdateProgress(Number(e.target.value))}
                            className="w-full h-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">WEATHER CONDITION</label>
                          <input 
                            type="text"
                            value={updateWeather}
                            onChange={(e) => setUpdateWeather(e.target.value)}
                            className="w-full border p-2.5 rounded-xl text-sm"
                            placeholder="e.g. Light rains, sunny morning"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">ADDITIONAL NOTES / MILESTONES</label>
                          <textarea 
                            value={updateNotes}
                            onChange={(e) => setUpdateNotes(e.target.value)}
                            className="w-full border p-2.5 rounded-xl text-sm"
                            rows="2"
                            placeholder="Describe leaf health, fertilizers added, soil moisture..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">EXPENSES (₹)</label>
                            <input 
                              type="number"
                              value={updateExpenses}
                              onChange={(e) => setUpdateExpenses(e.target.value)}
                              className="w-full border p-2.5 rounded-xl text-sm"
                              placeholder="12000"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">CROP PHOTOS</label>
                            <input 
                              type="file"
                              onChange={handlePhotoChange}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                              multiple
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowUpdateForm(false)}
                            className="px-4 py-2 border rounded-xl text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                          >
                            Log Entry
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}

                {/* Harvest Form Modal */}
                {showHarvestForm && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                      className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 space-y-6"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <h4 className="text-lg font-bold text-emerald-950">Complete Harvest</h4>
                      <p className="text-xs text-slate-400">
                        Mark this project as harvested. This will generate a procurement notification for the buyer.
                      </p>
                      <form onSubmit={submitHarvestCompletion} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">ACTUAL HARVEST QUANTITY (TONNES)</label>
                          <input 
                            type="number"
                            value={actualHarvestQty}
                            onChange={(e) => setActualHarvestQty(e.target.value)}
                            className="w-full border p-2.5 rounded-xl text-sm outline-none"
                            placeholder="e.g. 24.5"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">CROP QUALITY GRADE</label>
                          <select 
                            value={harvestQuality}
                            onChange={(e) => setHarvestQuality(e.target.value)}
                            className="w-full border p-2.5 rounded-xl text-sm bg-white"
                          >
                            <option value="Grade A">Grade A (Premium quality)</option>
                            <option value="Grade B">Grade B (Standard quality)</option>
                            <option value="Grade C">Grade C (Processing grade)</option>
                          </select>
                        </div>
                        <div className="pt-2 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowHarvestForm(false)}
                            className="px-4 py-2 border rounded-xl text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                          >
                            Confirm Harvest Completed
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
                Select a project on the left to manage.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Requirements Tab */}
      {activeTab === "requirements" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Available Buyer Requirements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Quantity Spec</th>
                  <th className="py-3 px-4">Buyer Entity</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Delivery Window</th>
                  <th className="py-3 px-4">Target Rate</th>
                  <th className="py-3 px-4">Rule-Based Match</th>
                  <th className="py-3 px-4 text-right">Commit</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((req) => (
                  <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-emerald-950">{req.crop}</td>
                    <td className="py-4 px-4 font-semibold">{req.quantity} tonnes</td>
                    <td className="py-4 px-4 text-xs font-medium">
                      {req.buyerId?.organizationName || `${req.buyerId?.firstName} ${req.buyerId?.lastName}`}
                    </td>
                    <td className="py-4 px-4">{req.location}</td>
                    <td className="py-4 px-4 text-xs font-medium">{req.expectedDelivery}</td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-900">{req.targetPrice}</td>
                    <td className="py-4 px-4">
                      {/* Live matching simulation badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        <Cpu size={10} /> 94% Match
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedRequirement(req)}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Commit Crop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commitment modal */}
          {selectedRequirement && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 space-y-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h4 className="text-lg font-bold text-emerald-950">Pre-Harvest Crop Commitment</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit a commitment to supply {selectedRequirement.crop} crops for <strong>{selectedRequirement.buyerId?.organizationName}</strong>. 
                  This will generate a formal B2B proposal for the buyer's review.
                </p>

                <form onSubmit={submitCommitment} className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">EXPECTED TOTAL YIELD (TONNES)</label>
                      <input 
                        type="number"
                        value={expectedYieldInput}
                        onChange={(e) => setExpectedYieldInput(e.target.value)}
                        className="w-full border p-2.5 rounded-xl text-sm outline-none"
                        placeholder="e.g. 25"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">COMMITTED QUANTITY (TONNES)</label>
                      <input 
                        type="number"
                        value={commitmentQuantity}
                        onChange={(e) => setCommitmentQuantity(e.target.value)}
                        className="w-full border p-2.5 rounded-xl text-sm outline-none"
                        placeholder="e.g. 20"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedRequirement(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                    >
                      Submit Commitment
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Active Commitments Tab */}
      {activeTab === "commitments" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">My Pre-Harvest Commitments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commitments.map((com) => (
              <div key={com._id} className="border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-base">{com.buyerRequirement?.crop}</h4>
                    <span className="text-xs text-slate-400 font-semibold">{com.buyer?.organizationName}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
                    com.status === "ACCEPTED" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : com.status === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {com.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-50 font-medium">
                  <div>
                    <span className="text-slate-400 block">Committed Quantity</span>
                    <span className="text-slate-700">{com.committedQuantity} tonnes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Expected Yield</span>
                    <span className="text-slate-700">{com.expectedYield} tonnes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Logs Tab */}
      {activeTab === "support" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Pre-Harvest Support Logs</h3>
          <div className="space-y-4">
            {supportRequests.map((req) => (
              <div key={req._id} className="border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-left">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{req.farmProject?.crop} Support request</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Requested Funding: ₹{req.supportRequired.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                  <div className="text-xs text-slate-400 font-medium text-left sm:text-right">
                    <span>Cultivation Cost: ₹{req.cultivationCost.toLocaleString()}</span>
                    <span className="block">Farmer contribution: ₹{req.farmerContribution.toLocaleString()}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
                    req.status === "APPROVED" || req.status === "DISBURSED"
                      ? "bg-emerald-100 text-emerald-800" 
                      : req.status === "REQUESTED"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Procurements Tab */}
      {activeTab === "procurements" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Procurements History</h3>
          <div className="space-y-4">
            {procurements.map((proc) => (
              <div key={proc._id} className="border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">{proc.farmProject?.crop} shipment</h4>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{proc.buyer?.organizationName}</p>
                  </div>
                  <span className="inline-block bg-emerald-850 text-white font-bold text-[9px] uppercase px-2.5 py-1 rounded-full">
                    {proc.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold border-t border-slate-50 pt-3">
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Procured Quantity</span>
                    <span>{proc.quantity} tonnes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Unit Price</span>
                    <span>₹{proc.agreedPrice}/kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Total Payout</span>
                    <span className="text-emerald-700">₹{proc.totalValue.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Date</span>
                    <span>{new Date(proc.procurementDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerDashboard;
