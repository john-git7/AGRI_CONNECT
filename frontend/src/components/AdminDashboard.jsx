import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { toast } from "react-toastify";
import { 
  Users, 
  Layers, 
  CheckSquare, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  UserCheck, 
  Loader,
  Search,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users"); // users, projects, commitments, procurements
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [userRes, projRes, commitRes, procRes] = await Promise.all([
        axios.get("/auth/users"),
        axios.get("/farm-projects"),
        axios.get("/commitments"),
        axios.get("/procurement")
      ]);

      setUsers(userRes.data);
      setProjects(projRes.data);
      setCommitments(commitRes.data);
      setProcurements(procRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ecosystem data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await axios.put(`/auth/users/${userId}/verify`);
      toast.success("User profile successfully verified!");
      
      // Update local state
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, verificationStatus: "VERIFIED" } : u));
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify user profile");
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.farmName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.organizationName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalFarmers = users.filter(u => u.role === "farmer").length;
  const totalBuyers = users.filter(u => u.role === "buyer").length;
  const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
  const totalCommitmentsVal = commitments.filter(c => c.status === "ACCEPTED").reduce((acc, cur) => acc + cur.committedQuantity, 0);
  const totalProcurementVal = procurements.reduce((acc, cur) => acc + cur.totalValue, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Loader className="animate-spin text-emerald-850" size={32} />
        <span className="text-sm font-semibold">Loading Admin Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: "Total Farmers", val: totalFarmers, desc: "Registered growers", icon: <Users size={16} /> },
          { title: "Total Buyers", val: totalBuyers, desc: "Bulk enterprise entities", icon: <Users size={16} /> },
          { title: "Active Projects", val: activeProjects, desc: "Crops under tracking", icon: <Layers size={16} /> },
          { title: "Total Commitments", val: `${totalCommitmentsVal} Tonnes`, desc: "Pre-harvest supply agreements", icon: <TrendingUp size={16} /> },
          { title: "Procurement Volume", val: `₹${totalProcurementVal.toLocaleString("en-IN")}`, desc: "Direct payout transaction volume", icon: <DollarSign size={16} /> }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-1 hover:shadow transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">{stat.title}</span>
              <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg">{stat.icon}</div>
            </div>
            <p className="text-xl font-bold text-slate-900">{stat.val}</p>
            <p className="text-[10px] text-slate-400 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: "users", label: "Users Directory" },
          { id: "projects", label: "Farm Projects" },
          { id: "commitments", label: "Ecosystem Commitments" },
          { id: "procurements", label: "Procurements & Settlements" }
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
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-850" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Workspaces */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">User Registrations Directory</h3>
            
            <div className="relative max-w-xs w-full">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, farm name..."
                className="w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Farm / Org Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{user.firstName} {user.lastName}</td>
                    <td className="py-4 px-4 font-medium text-xs text-slate-500">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        user.role === "farmer" ? "bg-emerald-100 text-emerald-850" : "bg-sky-100 text-sky-850"
                      }`}>{user.role}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold">
                      {user.role === "farmer" ? (
                        <span>{user.farmName || "Unnamed Farm"} ({user.acreage} Acres)</span>
                      ) : (
                        <span>{user.organizationName} ({user.organizationType})</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs">{user.city || user.location}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        user.verificationStatus === "VERIFIED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>{user.verificationStatus}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {user.verificationStatus !== "VERIFIED" ? (
                        <button
                          onClick={() => handleVerifyUser(user._id)}
                          className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <UserCheck size={12} /> Verify User
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold italic">Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Active Cultivation Projects</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop Type</th>
                  <th className="py-3 px-4">Grower Farm</th>
                  <th className="py-3 px-4">Committed Buyer</th>
                  <th className="py-3 px-4">Acreage</th>
                  <th className="py-3 px-4">Harvest Window</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{proj.crop}</td>
                    <td className="py-4 px-4 text-xs font-semibold">{proj.farmer?.farmName}</td>
                    <td className="py-4 px-4 text-xs font-medium">{proj.buyer?.organizationName || "Direct"}</td>
                    <td className="py-4 px-4 font-medium">{proj.acreage} Acres</td>
                    <td className="py-4 px-4 text-xs font-semibold">{new Date(proj.expectedHarvestDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {proj.currentStage}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-900">{proj.progressPercentage}%</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        proj.riskLevel === "HIGH" 
                          ? "bg-red-100 text-red-800" 
                          : proj.riskLevel === "MEDIUM" 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-emerald-100 text-emerald-800"
                      }`}>{proj.riskLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "commitments" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Ecosystem Crop Commitments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Buyer Requirement</th>
                  <th className="py-3 px-4">Committed Volume</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Agreement Date</th>
                </tr>
              </thead>
              <tbody>
                {commitments.map((com) => (
                  <tr key={com._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{com.buyerRequirement?.crop}</td>
                    <td className="py-4 px-4 text-xs font-semibold">{com.farmer?.farmName}</td>
                    <td className="py-4 px-4 text-xs">For {com.buyer?.organizationName}</td>
                    <td className="py-4 px-4 font-bold">{com.committedQuantity} tonnes</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        com.status === "ACCEPTED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : com.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}>{com.status}</span>
                    </td>
                    <td className="py-4 px-4 text-xs">{new Date(com.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "procurements" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Settlements Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Farmer Seller</th>
                  <th className="py-3 px-4">Buyer Entity</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Agreed Rate</th>
                  <th className="py-3 px-4">Total Payout</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {procurements.map((proc) => (
                  <tr key={proc._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{proc.farmProject?.crop}</td>
                    <td className="py-4 px-4 text-xs font-semibold">{proc.farmer?.farmName}</td>
                    <td className="py-4 px-4 text-xs font-medium">{proc.buyer?.organizationName}</td>
                    <td className="py-4 px-4 font-semibold">{proc.quantity} tonnes</td>
                    <td className="py-4 px-4 text-xs font-bold">₹{proc.agreedPrice}/kg</td>
                    <td className="py-4 px-4 text-xs font-bold text-emerald-800">₹{proc.totalValue.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px] px-2.5 py-1 rounded-full">
                        {proc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
