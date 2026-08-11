import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Leaf, User, ShieldCheck, Briefcase, FileText } from "lucide-react";
import axios from "../axiosConfig";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'commitments', 'procurements'
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const profileRes = await axios.get("/auth/profile");
        setUser(profileRes.data);

        // Fetch user commitments and procurements
        const [commitRes, procRes] = await Promise.all([
          axios.get("/commitments"),
          axios.get("/procurement")
        ]);

        setCommitments(commitRes.data);
        setProcurements(procRes.data);
      } catch (err) {
        setError("Failed to load profile details.");
        localStorage.clear();
        navigate("/login");
      }
    };
    fetchProfileData();
  }, [navigate]);

  if (error) return <p className="text-red-500 text-center mt-10 font-bold">{error}</p>;
  if (!user) return <p className="text-center mt-10 text-gray-500 font-semibold">Loading profile details...</p>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-6">
      <motion.div
        className="w-full max-w-4xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden text-left"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="bg-emerald-800 p-8 text-white relative">
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute top-6 left-6 bg-emerald-700/60 text-white font-semibold px-4 py-1.5 rounded-xl hover:bg-emerald-950 transition text-xs"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-6 mt-12">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-white font-extrabold text-3xl shadow-inner border border-white/20">
              {user.firstName?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-extrabold">{user.firstName} {user.lastName}</h2>
                {user.verificationStatus === "VERIFIED" && (
                  <span className="bg-emerald-100 text-emerald-850 p-1 rounded-full shadow-sm text-xs flex items-center justify-center font-bold" title="Verified Profile">
                    <ShieldCheck size={14} />
                  </span>
                )}
              </div>
              <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mt-1">{user.role} workspace credentials</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200">
          {[
            { id: "info", label: "Credentials & Identity" },
            { id: "commitments", label: "Active Commitments Log" },
            { id: "procurements", label: "Procurements Ledger" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-4 font-bold text-xs uppercase tracking-wider transition ${
                activeTab === tab.id 
                  ? "border-b-4 border-emerald-800 text-emerald-850 bg-slate-50/50" 
                  : "text-slate-400 hover:text-slate-650"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-8">
          {activeTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal details */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User size={16} className="text-emerald-700" /> Account Owner Profile
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-3 text-slate-600 font-medium">
                    <Mail size={16} className="text-emerald-600" /> 
                    <span>{user.email}</span>
                  </p>
                  <p className="flex items-center gap-3 text-slate-600 font-medium">
                    <Phone size={16} className="text-emerald-600" /> 
                    <span>{user.phone}</span>
                  </p>
                  <p className="flex items-center gap-3 text-slate-600 font-medium">
                    <MapPin size={16} className="text-emerald-600" /> 
                    <span>{user.city}, {user.location || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* B2B details */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-emerald-700" /> Commercial Credentials
                </h3>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  {user.role === "farmer" && (
                    <>
                      <p className="flex justify-between border-b pb-2">
                        <span className="text-slate-400 uppercase">Farm Name:</span>
                        <span className="text-slate-800">{user.farmName || "N/A"}</span>
                      </p>
                      <p className="flex justify-between border-b pb-2">
                        <span className="text-slate-400 uppercase">Farm Capacity:</span>
                        <span className="text-slate-800">{user.acreage || 0} Acres</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 uppercase">Crops Profile:</span>
                        <span className="text-slate-800 text-right">{user.crops?.join(", ") || "N/A"}</span>
                      </p>
                    </>
                  )}
                  {user.role === "buyer" && (
                    <>
                      <p className="flex justify-between border-b pb-2">
                        <span className="text-slate-400 uppercase">Organization:</span>
                        <span className="text-slate-800">{user.organizationName || "N/A"}</span>
                      </p>
                      <p className="flex justify-between border-b pb-2">
                        <span className="text-slate-400 uppercase">Entity Classification:</span>
                        <span className="text-slate-800">{user.organizationType || "N/A"}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 uppercase">Procurement Categories:</span>
                        <span className="text-slate-800 text-right">{user.procurementCategories?.join(", ") || "N/A"}</span>
                      </p>
                    </>
                  )}
                  {user.role === "admin" && (
                    <p className="text-sm font-bold text-emerald-800">
                      System Administrator permissions enabled. Fully verified system keys.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "commitments" && (
            <div>
              {commitments.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm border border-dashed rounded-2xl">
                  No pre-harvest supply commitments logged.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {commitments.map((com) => (
                    <div key={com._id} className="border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 bg-white hover:shadow transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-emerald-950 text-base flex items-center gap-1.5">
                            <Leaf size={16} className="text-emerald-700" /> {com.buyerRequirement?.crop}
                          </h4>
                          <span className="text-xs text-slate-400 font-semibold">Buyer: {com.buyer?.organizationName}</span>
                        </div>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                          com.status === "ACCEPTED" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : com.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>{com.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t font-semibold text-slate-600">
                        <div>
                          <span className="block text-slate-400 uppercase text-[9px]">Committed Volume</span>
                          <span>{com.committedQuantity} tonnes</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 uppercase text-[9px]">Submission Date</span>
                          <span>{new Date(com.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "procurements" && (
            <div>
              {procurements.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm border border-dashed rounded-2xl">
                  No completed or pending procurement logs recorded in ledger history.
                </div>
              ) : (
                <div className="space-y-4">
                  {procurements.map((proc) => (
                    <div key={proc._id} className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                          <FileText size={16} className="text-emerald-700" /> {proc.farmProject?.crop || "Agri Procurement"} Shipment
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 font-semibold">
                          Contracting entities: {proc.farmer?.farmName} ↔ {proc.buyer?.organizationName}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-xs font-semibold text-slate-600">
                        <div>
                          <span className="block text-slate-400 uppercase text-[9px]">Quantity</span>
                          <span>{proc.quantity} tonnes</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 uppercase text-[9px]">Unit Rate</span>
                          <span>₹{proc.agreedPrice}/kg</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 uppercase text-[9px]">Settlement</span>
                          <span className="text-emerald-700">₹{proc.totalValue.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="inline-block bg-emerald-850 text-white font-bold text-[9px] uppercase px-3 py-1 rounded-full">
                        {proc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
