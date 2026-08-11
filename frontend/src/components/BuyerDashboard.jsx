import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { toast } from "react-toastify";
import Timeline from "./Timeline";
import { 
  Plus, 
  ShoppingCart, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Cpu, 
  AlertTriangle,
  Loader,
  Layers,
  ArrowUpRight,
  TrendingUp,
  User,
  ExternalLink
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const BuyerDashboard = () => {
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [demandInsights, setDemandInsights] = useState([]);

  // Selected states
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [matchedFarmers, setMatchedFarmers] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTimeline, setProjectTimeline] = useState([]);
  const [aiRisk, setAiRisk] = useState(null);
  const [aiYield, setAiYield] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Form states
  const [activeTab, setActiveTab] = useState("requirements"); // requirements, create_demand, tracking, procurements, forecasts
  const [newDemand, setNewDemand] = useState({
    crop: "Tomato",
    quantity: "",
    quality: "Grade A",
    location: "Tamil Nadu",
    expectedDelivery: "",
    targetPrice: ""
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reqRes, projRes, commitRes, procRes, insightsRes] = await Promise.all([
        axios.get("/requirements"),
        axios.get("/farm-projects"),
        axios.get("/commitments"),
        axios.get("/procurement"),
        axios.get("/ai/demand-insights")
      ]);

      const myId = localStorage.getItem("userId");
      
      // Filter for this buyer
      setRequirements(reqRes.data);
      setProjects(projRes.data);
      setCommitments(commitRes.data);
      setProcurements(procRes.data);
      setDemandInsights(insightsRes.data);

      if (reqRes.data.length > 0 && !selectedRequirement) {
        handleSelectRequirement(reqRes.data[0]);
      }
      if (projRes.data.length > 0 && !selectedProject) {
        handleSelectProject(projRes.data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load buyer dashboard data");
    }
  };

  const handleSelectRequirement = async (reqItem) => {
    setSelectedRequirement(reqItem);
    setMatchedFarmers([]);
    setMatchingLoading(true);
    try {
      const matchRes = await axios.post("/ai/match-farmers", { requirementId: reqItem._id });
      setMatchedFarmers(matchRes.data);
    } catch (err) {
      console.error("Matching engine error", err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setAiRisk(null);
    setAiYield(null);
    setAiLoading(true);
    try {
      const timelineRes = await axios.get(`/farm-projects/${project._id}/updates`);
      setProjectTimeline(timelineRes.data);

      // AI Risk prediction
      const riskRes = await axios.post("/ai/risk-analysis", {
        crop: project.crop,
        stage: project.currentStage,
        location: project.location
      });
      setAiRisk(riskRes.data);

      // AI Yield forecast
      const yieldRes = await axios.post("/ai/yield-prediction", {
        crop: project.crop,
        acreage: project.acreage,
        stage: project.currentStage
      });
      setAiYield(yieldRes.data);
    } catch (err) {
      console.error("AI Insights fetch failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  const submitDemand = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/requirements", newDemand);
      toast.success("Procurement requirement published successfully!");
      setNewDemand({
        crop: "Tomato",
        quantity: "",
        quality: "Grade A",
        location: "Tamil Nadu",
        expectedDelivery: "",
        targetPrice: ""
      });
      fetchDashboardData();
      setActiveTab("requirements");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish requirement");
    }
  };

  const handleCommitmentAction = async (commitmentId, action) => {
    try {
      await axios.put(`/commitments/${commitmentId}/status`, { status: action });
      toast.success(`Commitment successfully ${action.toLowerCase()}`);
      fetchDashboardData();
      if (selectedRequirement) {
        handleSelectRequirement(selectedRequirement);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update commitment");
    }
  };

  const confirmProcurement = async (procId) => {
    try {
      await axios.put(`/procurement/${procId}/status`, { status: "COMPLETED" });
      toast.success("Procurement transaction confirmed!");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete procurement");
    }
  };

  // KPIs
  const openRequirementsCount = requirements.filter(r => r.status === "open").length;
  const committedTonnesVal = commitments.filter(c => c.status === "ACCEPTED").reduce((acc, cur) => acc + cur.committedQuantity, 0);
  const upcomingHarvestsCount = projects.filter(p => p.currentStage === "HARVEST_READY").length;

  return (
    <div className="space-y-8 text-left">
      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Open Requirements", val: openRequirementsCount, desc: "Pending commitments", icon: <ShoppingCart size={18} /> },
          { title: "Committed Quantity", val: `${committedTonnesVal} Tonnes`, desc: "Contracted supply", icon: <TrendingUp size={18} /> },
          { title: "Active Projects", val: projects.length, desc: "Farms under contract", icon: <Layers size={18} /> },
          { title: "Upcoming Harvests", val: upcomingHarvestsCount, desc: "Harvests ready for delivery", icon: <Calendar size={18} /> }
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto scrollbar-none whitespace-nowrap">
        {[
          { id: "requirements", label: "My Requirements & Matching" },
          { id: "create_demand", label: "Create Demand" },
          { id: "tracking", label: "Production Tracking" },
          { id: "procurements", label: "Procurements & Payouts" },
          { id: "forecasts", label: "Supply Gaps Forecast" }
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
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800" />
            )}
          </button>
        ))}
      </div>

      {/* Requirement List and Match Sheet Tab */}
      {activeTab === "requirements" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of requirements */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">My Requirements</h3>
            {requirements.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
                No active requirements listed. Publish demand to start matching.
              </div>
            ) : (
              requirements.map((req) => {
                const isSelected = selectedRequirement?._id === req._id;
                // Calculate total accepted commitments
                const acceptedCommits = commitments
                  .filter(c => c.buyerRequirement?._id === req._id && c.status === "ACCEPTED")
                  .reduce((acc, cur) => acc + cur.committedQuantity, 0);

                return (
                  <div
                    key={req._id}
                    onClick={() => handleSelectRequirement(req)}
                    className={`p-5 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected 
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-md" 
                        : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    <h4 className="font-bold text-base">{req.crop}</h4>
                    <p className="text-xs opacity-80 mt-1">Delivery: {req.expectedDelivery}</p>
                    <div className="mt-4 border-t pt-3 border-emerald-700/20 text-xs flex justify-between">
                      <div>
                        <span className="opacity-60 block">Target Qty</span>
                        <span className="font-bold">{req.quantity} Tonnes</span>
                      </div>
                      <div>
                        <span className="opacity-60 block">Committed</span>
                        <span className="font-bold">{acceptedCommits} Tonnes</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Matches / Pending Commitments Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedRequirement ? (
              <div className="space-y-6">
                
                {/* Pending Commitments from Farmers */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Commitment Requests for {selectedRequirement.crop}
                  </h4>
                  {commitments.filter(c => c.buyerRequirement?._id === selectedRequirement._id && c.status === "PENDING").length === 0 ? (
                    <p className="text-xs text-slate-400">No pending farmer commitments for this requirement currently.</p>
                  ) : (
                    <div className="space-y-3">
                      {commitments.filter(c => c.buyerRequirement?._id === selectedRequirement._id && c.status === "PENDING").map((com) => (
                        <div key={com._id} className="border border-slate-100 p-4 rounded-xl flex items-center justify-between gap-4">
                          <div>
                            <span className="text-sm font-bold text-slate-800">{com.farmer?.farmName || `${com.farmer?.firstName} ${com.farmer?.lastName}`}</span>
                            <span className="block text-xs text-slate-400">{com.farmer?.location}</span>
                          </div>
                          <div className="text-xs font-semibold">
                            Committed: {com.committedQuantity} tonnes / Est. Yield: {com.expectedYield} tonnes
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCommitmentAction(com._id, "ACCEPTED")}
                              className="bg-emerald-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-950 transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleCommitmentAction(com._id, "REJECTED")}
                              className="border text-red-650 hover:bg-red-50 text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Farmer Matching Sheet */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu size={16} className="text-emerald-700 animate-pulse" /> Matched Farms (Rule-Based Analysis)
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">Recommending qualified regional capacity</span>
                  </div>

                  {matchingLoading ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs">
                      <Loader className="animate-spin" size={16} /> Scanning agritech registers...
                    </div>
                  ) : matchedFarmers.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No matching farmers found in database.</p>
                  ) : (
                    <div className="space-y-4">
                      {matchedFarmers.map((match, mIdx) => (
                        <div key={mIdx} className="border border-emerald-100/50 p-5 rounded-2xl hover:border-emerald-500/30 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 bg-emerald-50/20">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-950 text-base">{match.farmName || `${match.firstName} ${match.lastName}`}</span>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                {match.matchScore}% Match
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                              <MapPin size={12} /> {match.city}, {match.location} ({match.acreage} Acres total)
                            </span>
                            <div className="flex flex-wrap gap-2 pt-3 text-[10px] font-semibold text-slate-600">
                              {match.reasons.map((reason, rIdx) => (
                                <span key={rIdx} className="bg-white border px-2 py-0.5 rounded shadow-sm">{reason}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <a
                              href={`mailto:${match.email || 'info@agriconnect.com'}`}
                              className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold hover:bg-slate-50 transition"
                            >
                              Contact Farmer <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
                Select a requirement on the left to see matches and commitments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Demand Tab */}
      {activeTab === "create_demand" && (
        <div className="max-w-2xl bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-emerald-950">Publish Procurement Requirement</h3>
            <p className="text-xs text-slate-500 mt-1">Specify your future commodity needs to start contract negotiations with regional farmers before sowing.</p>
          </div>

          <form onSubmit={submitDemand} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">CROP TYPE</label>
                <select
                  value={newDemand.crop}
                  onChange={(e) => setNewDemand({ ...newDemand, crop: e.target.value })}
                  className="w-full border p-3 rounded-xl text-sm bg-white outline-none"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Paddy">Paddy</option>
                  <option value="Banana">Banana</option>
                  <option value="Potato">Potato</option>
                  <option value="Chilli">Chilli</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">REQUIRED QUANTITY (TONNES)</label>
                <input
                  type="number"
                  value={newDemand.quantity}
                  onChange={(e) => setNewDemand({ ...newDemand, quantity: e.target.value })}
                  className="w-full border p-3 rounded-xl text-sm outline-none"
                  placeholder="e.g. 100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">QUALITY GRADE</label>
                <select
                  value={newDemand.quality}
                  onChange={(e) => setNewDemand({ ...newDemand, quality: e.target.value })}
                  className="w-full border p-3 rounded-xl text-sm bg-white outline-none"
                >
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Premium">Premium Grade</option>
                  <option value="Processing Grade">Processing Grade</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">REGION / STATE</label>
                <div className="relative">
                  <select
                    value={newDemand.location}
                    onChange={(e) => setNewDemand({ ...newDemand, location: e.target.value })}
                    className="w-full border p-3 rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer pr-10"
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">EXPECTED DELIVERY PERIOD</label>
                <input
                  type="text"
                  value={newDemand.expectedDelivery}
                  onChange={(e) => setNewDemand({ ...newDemand, expectedDelivery: e.target.value })}
                  className="w-full border p-3 rounded-xl text-sm outline-none"
                  placeholder="e.g. June 20-30"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">TARGET PRICE RANGE</label>
                <input
                  type="text"
                  value={newDemand.targetPrice}
                  onChange={(e) => setNewDemand({ ...newDemand, targetPrice: e.target.value })}
                  className="w-full border p-3 rounded-xl text-sm outline-none"
                  placeholder="e.g. ₹28–32/kg"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-800 text-white font-bold p-3.5 rounded-xl hover:bg-emerald-900 transition shadow-md"
              >
                Publish Requirement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Production Tracking Tab */}
      {activeTab === "tracking" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contracts list */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Contracted Farms</h3>
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
                No active projects found. Accept a farmer's commitment to establish a contract.
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
                    <h4 className="font-bold text-base">{project.crop}</h4>
                    <p className="text-xs opacity-80 mt-1">{project.farmer?.farmName || "Farmer"}</p>
                    <div className="mt-4 border-t pt-3 border-emerald-700/20 flex justify-between items-center text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        isSelected ? "bg-emerald-750 text-white" : "bg-emerald-100 text-emerald-800"
                      }`}>{project.currentStage}</span>
                      <span className="font-bold">{project.progressPercentage}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive timeline tracking and AI Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProject ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Header */}
                <div className="border-b pb-5 flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedProject.crop} Cultivation Contract</h3>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      Grower: {selectedProject.farmer?.farmName || `${selectedProject.farmer?.firstName} ${selectedProject.farmer?.lastName}`}
                    </p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Stage: {selectedProject.currentStage}
                  </div>
                </div>

                {/* AI weather and yield forecasts */}
                <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                    <Cpu size={18} className="text-emerald-700" />
                    <span>AI Production Insights</span>
                  </div>

                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
                      <Loader size={16} className="animate-spin" /> Fetching forecast indexes...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiYield && (
                        <div className="bg-white p-4 border border-emerald-100 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Yield prediction</span>
                          <span className="block font-bold text-slate-800">{aiYield.minYield} - {aiYield.maxYield} tonnes</span>
                        </div>
                      )}
                      {aiRisk && (
                        <div className="bg-white p-4 border border-emerald-100 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Production Risk</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              aiRisk.riskLevel === "HIGH" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                            }`}>{aiRisk.riskLevel}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-1">{aiRisk.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Farm Timeline Logs</h4>
                  <Timeline updates={projectTimeline} />
                </div>

              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
                Select a contracted farm project to inspect cultivation tracking logs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Procurements Tab */}
      {activeTab === "procurements" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Direct Procurement Settlements</h3>
          
          <div className="space-y-4">
            {procurements.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No pending or completed procurement orders found.</p>
            ) : (
              procurements.map((proc) => (
                <div key={proc._id} className="border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-left">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-base">{proc.farmProject?.crop} Procurement</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      Grower: {proc.farmer?.farmName} • Location: {proc.deliveryLocation}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                    <div className="text-xs font-semibold text-left sm:text-right">
                      <span className="block text-slate-500">Procured: {proc.quantity} tonnes @ ₹{proc.agreedPrice}/kg</span>
                      <span className="block text-emerald-700 font-bold text-sm">Value: ₹{proc.totalValue.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      {proc.status === "PENDING" ? (
                        <button
                          onClick={() => confirmProcurement(proc._id)}
                          className="bg-emerald-800 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-emerald-950 transition"
                        >
                          Approve Payout
                        </button>
                      ) : (
                        <span className="inline-block bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px] px-3 py-1.5 rounded-full">
                          {proc.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Forecasts and AI Gaps Analysis */}
      {activeTab === "forecasts" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Supply Gaps Forecast</h3>
            <p className="text-xs text-slate-400">AI analysis of current contracted commitments against published requirements.</p>
          </div>

          <div className="space-y-4">
            {demandInsights.map((insight, idx) => (
              <div key={idx} className="border border-slate-100 rounded-2xl p-6 space-y-4 bg-emerald-50/10">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-emerald-950 text-lg">{insight.crop} Requirements</h4>
                  <span className="text-xs text-emerald-700 font-bold">{insight.committedPercentage}% Contracted</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-emerald-700 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, insight.committedPercentage)}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold pt-2">
                  <div>
                    <span className="text-slate-400 block text-[9px]">REQUIRED VOLUME</span>
                    <span>{insight.requiredQuantity} tonnes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">SECURED VOLUME</span>
                    <span>{insight.committedQuantity} tonnes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">SUPPLY DEFICIT</span>
                    <span className="text-red-650 font-bold">{insight.supplyGap} tonnes</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-55 text-emerald-850 rounded-xl flex items-start gap-2 text-xs border border-emerald-200/50">
                  <Cpu size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-semibold">{insight.aiFeedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default BuyerDashboard;
