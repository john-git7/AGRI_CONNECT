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
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  FileDown,
  Activity,
  Info,
  X,
  Clock,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

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
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Vasant Kunj"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab control
  const [activeTab, setActiveTab] = useState("users"); // users, projects, commitments, procurements, support, requirements, reports
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD & Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'user', 'project', 'commitment', 'procurement', 'support', 'requirement'
  const [editingItem, setEditingItem] = useState(null); // Item currently being edited (null for creating new)
  const [formData, setFormData] = useState({});

  // Reports state
  const [reportType, setReportType] = useState("all");
  const [reportFormat, setReportFormat] = useState("csv");
  const [generatedReport, setGeneratedReport] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [userRes, projRes, commitRes, procRes, supportRes, reqRes] = await Promise.all([
        axios.get("/auth/users"),
        axios.get("/farm-projects"),
        axios.get("/commitments"),
        axios.get("/procurement"),
        axios.get("/support-requests"),
        axios.get("/requirements")
      ]);

      setUsers(userRes.data || []);
      setProjects(projRes.data || []);
      setCommitments(commitRes.data || []);
      setProcurements(procRes.data || []);
      setSupportRequests(supportRes.data || []);
      setRequirements(reqRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load command center ecosystem data");
    } finally {
      setLoading(false);
    }
  };

  // Delete Handlers
  const handleDeleteItem = async (entity, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${entity}? This action cannot be undone.`)) return;

    try {
      let endpoint = "";
      if (entity === "user") endpoint = `/auth/users/${id}`;
      else if (entity === "project") endpoint = `/farm-projects/${id}`;
      else if (entity === "commitment") endpoint = `/commitments/${id}`;
      else if (entity === "procurement") endpoint = `/procurement/${id}`;
      else if (entity === "support") endpoint = `/support-requests/${id}`;
      else if (entity === "requirement") endpoint = `/requirements/${id}`;

      await axios.delete(endpoint);
      toast.success(`${entity.toUpperCase()} successfully deleted.`);
      
      // Update state locally
      if (entity === "user") setUsers(prev => prev.filter(u => u._id !== id));
      else if (entity === "project") setProjects(prev => prev.filter(p => p._id !== id));
      else if (entity === "commitment") setCommitments(prev => prev.filter(c => c._id !== id));
      else if (entity === "procurement") setProcurements(prev => prev.filter(p => p._id !== id));
      else if (entity === "support") setSupportRequests(prev => prev.filter(s => s._id !== id));
      else if (entity === "requirement") setRequirements(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete this ${entity}`);
    }
  };

  // User Verification Handler
  const handleVerifyUser = async (userId) => {
    try {
      await axios.put(`/auth/users/${userId}/verify`);
      toast.success("User profile successfully verified!");
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, verificationStatus: "VERIFIED" } : u));
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify user profile");
    }
  };

  // Setup form data for creating
  const handleCreateOpen = (type) => {
    setModalType(type);
    setEditingItem(null);
    let defaultData = {};
    if (type === "user") {
      defaultData = { role: "farmer", verificationStatus: "PENDING", location: "Tamil Nadu", city: "Chennai" };
    } else if (type === "project") {
      defaultData = { currentStage: "PLANNING", riskLevel: "LOW", status: "ACTIVE", acreage: 5, crop: "Wheat", variety: "Hybrid Super" };
    } else if (type === "commitment") {
      defaultData = { status: "PENDING" };
    } else if (type === "procurement") {
      defaultData = { status: "PENDING", quality: "Grade A" };
    } else if (type === "support") {
      defaultData = { status: "REQUESTED" };
    } else if (type === "requirement") {
      defaultData = { status: "open", quality: "Grade A", location: "Tamil Nadu" };
    }
    setFormData(defaultData);
    setIsModalOpen(true);
  };

  // Setup form data for editing
  const handleEditOpen = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    
    // Normalize data representation for form inputs
    let prefilledData = { ...item };
    if (type === "user") {
      prefilledData.crops = item.crops ? item.crops.join(", ") : "";
      prefilledData.procurementCategories = item.procurementCategories ? item.procurementCategories.join(", ") : "";
      prefilledData.password = ""; // Do not show hashed password
    } else if (type === "project") {
      prefilledData.farmerId = item.farmer?._id || item.farmer;
      prefilledData.buyerId = item.buyer?._id || item.buyer;
      prefilledData.buyerRequirementId = item.buyerRequirement?._id || item.buyerRequirement;
      if (item.expectedHarvestDate) {
        prefilledData.expectedHarvestDate = new Date(item.expectedHarvestDate).toISOString().split('T')[0];
      }
    } else if (type === "commitment") {
      prefilledData.buyerRequirementId = item.buyerRequirement?._id || item.buyerRequirement;
      prefilledData.farmerId = item.farmer?._id || item.farmer;
      prefilledData.buyerId = item.buyer?._id || item.buyer;
    } else if (type === "procurement") {
      prefilledData.buyerId = item.buyer?._id || item.buyer;
      prefilledData.farmerId = item.farmer?._id || item.farmer;
      prefilledData.farmProjectId = item.farmProject?._id || item.farmProject;
    } else if (type === "support") {
      prefilledData.farmProjectId = item.farmProject?._id || item.farmProject;
      prefilledData.farmerId = item.farmer?._id || item.farmer;
    } else if (type === "requirement") {
      prefilledData.buyerId = item.buyerId?._id || item.buyerId;
    }

    setFormData(prefilledData);
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingItem) {
        // UPDATE Mode
        let endpoint = "";
        if (modalType === "user") endpoint = `/auth/users/${editingItem._id}`;
        else if (modalType === "project") endpoint = `/farm-projects/${editingItem._id}`;
        else if (modalType === "commitment") endpoint = `/commitments/${editingItem._id}`;
        else if (modalType === "procurement") endpoint = `/procurement/${editingItem._id}`;
        else if (modalType === "support") endpoint = `/support-requests/${editingItem._id}`;
        else if (modalType === "requirement") endpoint = `/requirements/${editingItem._id}`;

        response = await axios.put(endpoint, formData);
        toast.success(`${modalType.toUpperCase()} successfully updated.`);
      } else {
        // CREATE Mode
        let endpoint = "";
        if (modalType === "user") endpoint = "/auth/users";
        else if (modalType === "project") endpoint = "/farm-projects";
        else if (modalType === "commitment") endpoint = "/commitments";
        else if (modalType === "procurement") endpoint = "/procurement";
        else if (modalType === "support") endpoint = "/support-requests";
        else if (modalType === "requirement") endpoint = "/requirements";

        response = await axios.post(endpoint, formData);
        toast.success(`New ${modalType.toUpperCase()} successfully created.`);
      }
      setIsModalOpen(false);
      fetchAdminData(); // Refresh tables
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || `Failed to save ${modalType}`);
    }
  };

  // Reports Generation Logic
  const handleGenerateReport = () => {
    let reportData = [];
    let headers = [];
    let title = "";

    if (reportType === "users") {
      title = "USERS REGISTERED DIRECTORY";
      headers = ["ID", "Name", "Email", "Phone", "Role", "City", "Location (State)", "Verification Status", "Farm/Org Details"];
      reportData = users.map(u => [
        u._id,
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.phone,
        u.role,
        u.city,
        u.location,
        u.verificationStatus,
        u.role === "farmer" ? `${u.farmName || ""} (${u.acreage} Acres)` : `${u.organizationName || ""} (${u.organizationType || ""})`
      ]);
    } else if (reportType === "projects") {
      title = "CULTIVATION PROJECTS REGISTRY";
      headers = ["ID", "Crop", "Variety", "Acreage", "Location", "Estimated Yield (T)", "Committed Qty (T)", "Cost (₹)", "Expected Harvest", "Farmer", "Buyer", "Stage", "Progress %", "Risk Level", "Status"];
      reportData = projects.map(p => [
        p._id,
        p.crop,
        p.variety,
        p.acreage,
        p.location,
        p.expectedYield,
        p.committedQuantity,
        p.cultivationCost,
        new Date(p.expectedHarvestDate).toLocaleDateString(),
        p.farmer ? `${p.farmer.firstName} ${p.farmer.lastName} (${p.farmer.farmName})` : "",
        p.buyer ? p.buyer.organizationName : "Direct Marketplace",
        p.currentStage,
        p.progressPercentage,
        p.riskLevel,
        p.status
      ]);
    } else if (reportType === "commitments") {
      title = "PRE-HARVEST SUPPLY AGREEMENTS (COMMITMENTS)";
      headers = ["ID", "Crop", "Committed Quantity (T)", "Expected Yield (T)", "Farmer", "Buyer Organization", "Status", "Created At"];
      reportData = commitments.map(c => [
        c._id,
        c.buyerRequirement?.crop || "",
        c.committedQuantity,
        c.expectedYield,
        c.farmer ? `${c.farmer.firstName} ${c.farmer.lastName} (${c.farmer.farmName})` : "",
        c.buyer ? c.buyer.organizationName : "",
        c.status,
        new Date(c.createdAt).toLocaleDateString()
      ]);
    } else if (reportType === "settlements") {
      title = "PROCUREMENTS & FINANCIAL SETTLEMENTS LEDGER";
      headers = ["ID", "Crop", "Buyer Entity", "Farmer Seller", "Procured Qty (T)", "Agreed Rate (₹/kg)", "Total Transaction Value", "Delivery Location", "Status", "Date"];
      reportData = procurements.map(pr => [
        pr._id,
        pr.farmProject?.crop || "Direct Crop",
        pr.buyer ? pr.buyer.organizationName : "",
        pr.farmer ? `${pr.farmer.firstName} ${pr.farmer.lastName} (${pr.farmer.farmName})` : "",
        pr.quantity,
        pr.agreedPrice,
        pr.totalValue,
        pr.deliveryLocation,
        pr.status,
        new Date(pr.procurementDate || pr.createdAt).toLocaleDateString()
      ]);
    } else if (reportType === "support") {
      title = "PRE-HARVEST SUPPORT SCHEMES LEDGER";
      headers = ["ID", "Farm Crop", "Farmer Name", "Cultivation Cost (₹)", "Farmer Contribution (₹)", "Requested Payout (₹)", "Status", "Requested Date"];
      reportData = supportRequests.map(sr => [
        sr._id,
        sr.farmProject?.crop || "",
        sr.farmer ? `${sr.farmer.firstName} ${sr.farmer.lastName}` : "",
        sr.cultivationCost,
        sr.farmerContribution,
        sr.supportRequired,
        sr.status,
        new Date(sr.createdAt).toLocaleDateString()
      ]);
    } else {
      // General full status
      title = "AGRICONNECT ECOSYSTEM COMPREHENSIVE STATUS SUMMARY REPORT";
      headers = ["Metric Parameter", "Current Count / Value", "Operational Context Details"];
      reportData = [
        ["Total Registered Users", users.length, `Farmers: ${users.filter(u => u.role==='farmer').length} | Buyers: ${users.filter(u => u.role==='buyer').length} | Admins: ${users.filter(u => u.role==='admin').length}`],
        ["Active Growing Projects", projects.filter(p => p.status==='ACTIVE').length, `Total Acreage: ${projects.reduce((acc, c)=> acc + (c.acreage || 0), 0)} Acres`],
        ["Accepted Commitments Volume", `${commitments.filter(c => c.status === "ACCEPTED").reduce((acc, c) => acc + (c.committedQuantity || 0), 0)} Tonnes`, "Agreements sealed between farmers & corporate clients"],
        ["Financial Settlements Volume", `₹${procurements.reduce((acc, c) => acc + (c.totalValue || 0), 0).toLocaleString("en-IN")}`, `${procurements.length} logged procurement invoices`],
        ["Financial Support Requested", `₹${supportRequests.reduce((acc, c) => acc + (c.supportRequired || 0), 0).toLocaleString("en-IN")}`, `${supportRequests.filter(s => s.status === 'APPROVED').length} Approved, ${supportRequests.filter(s => s.status === 'DISBURSED').length} Disbursed`],
        ["Open Buyer Postings", requirements.filter(r => r.status==='open').length, "Tenders currently open for farmers to commit to"]
      ];
    }

    if (reportFormat === "csv") {
      const csvRows = [];
      csvRows.push([`# ${title}`]);
      csvRows.push([`# Generated at: ${new Date().toLocaleString()}`]);
      csvRows.push([]);
      csvRows.push(headers);
      reportData.forEach(row => {
        csvRows.push(row.map(cell => {
          let str = String(cell === undefined || cell === null ? "" : cell);
          str = str.replace(/"/g, '""');
          return `"${str}"`;
        }));
      });
      setGeneratedReport(csvRows.map(r => r.join(",")).join("\n"));
    } else if (reportFormat === "json") {
      const jsonObj = {
        reportTitle: title,
        generatedAt: new Date().toISOString(),
        columns: headers,
        records: reportData.map(row => {
          let record = {};
          headers.forEach((h, idx) => {
            record[h.toLowerCase().replace(/[^a-z0-9]/g, "_")] = row[idx];
          });
          return record;
        })
      };
      setGeneratedReport(JSON.stringify(jsonObj, null, 2));
    } else {
      // Printable markdown / Text
      let txt = `========================================================\n`;
      txt += `  ${title}\n`;
      txt += `  Generated: ${new Date().toLocaleString()}\n`;
      txt += `========================================================\n\n`;
      
      // Calculate widths
      const colWidths = headers.map((h, colIdx) => {
        let max = h.length;
        reportData.forEach(row => {
          const valStr = String(row[colIdx] || "");
          if (valStr.length > max) max = valStr.length;
        });
        return Math.min(max + 2, 40); // Cap column width at 40 chars
      });

      // Headers
      headers.forEach((h, colIdx) => {
        txt += h.padEnd(colWidths[colIdx]).substring(0, colWidths[colIdx]);
      });
      txt += "\n" + colWidths.map(w => "-".repeat(w)).join("") + "\n";

      // Rows
      reportData.forEach(row => {
        row.forEach((cell, colIdx) => {
          const cellStr = String(cell || "");
          txt += cellStr.padEnd(colWidths[colIdx]).substring(0, colWidths[colIdx]);
        });
        txt += "\n";
      });

      setGeneratedReport(txt);
    }
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport], { type: reportFormat === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agriconnect_report_${reportType}_${Date.now()}.${reportFormat === "csv" ? "csv" : reportFormat === "json" ? "json" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter calculations
  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.farmName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.organizationName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.farmer?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.farmer?.farmName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.currentStage || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.riskLevel || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommitments = commitments.filter(c => 
    (c.buyerRequirement?.crop || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.farmer?.farmName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.buyer?.organizationName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProcurements = procurements.filter(pr => 
    (pr.farmProject?.crop || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pr.farmer?.farmName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pr.buyer?.organizationName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSupportRequests = supportRequests.filter(sr => 
    (sr.farmProject?.crop || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sr.farmer?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sr.farmer?.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    sr.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequirements = requirements.filter(r => 
    r.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.buyerId?.organizationName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.quality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculation for metrics
  const totalFarmers = users.filter(u => u.role === "farmer").length;
  const totalBuyers = users.filter(u => u.role === "buyer").length;
  const activeProjectsCount = projects.filter(p => p.status === "ACTIVE").length;
  const totalCommitmentsVal = commitments.filter(c => c.status === "ACCEPTED").reduce((acc, cur) => acc + (cur.committedQuantity || 0), 0);
  const totalProcurementVal = procurements.reduce((acc, cur) => acc + (cur.totalValue || 0), 0);
  
  // Extra detailed analytics
  const approvedPayouts = supportRequests.filter(s => ["APPROVED", "DISBURSED"].includes(s.status)).reduce((acc, cur) => acc + (cur.supportRequired || 0), 0);
  const highRiskProjects = projects.filter(p => p.riskLevel === "HIGH" && p.status === "ACTIVE").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Loader className="animate-spin text-emerald-850" size={32} />
        <span className="text-sm font-semibold">Loading Command Center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-900 to-teal-900 p-6 md:p-8 rounded-3xl text-white shadow-lg">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Admin Command Center</h2>
          <p className="text-xs text-emerald-200/90 font-medium">Monitor performance metrics, verify users, manage system records, and download ledger exports.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="bg-emerald-850/60 hover:bg-emerald-950/80 border border-emerald-700/50 text-emerald-100 text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={12} className="animate-hover-spin" /> Synchronize Ecosystem
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { title: "Registered Growers", val: totalFarmers, desc: `${users.filter(u=>u.verificationStatus==='VERIFIED' && u.role==='farmer').length} Verified Profiles`, icon: <Users size={16} />, bg: "bg-emerald-50 text-emerald-800" },
          { title: "Enterprise Buyers", val: totalBuyers, desc: `${users.filter(u=>u.verificationStatus==='VERIFIED' && u.role==='buyer').length} Verified Clients`, icon: <Users size={16} />, bg: "bg-teal-50 text-teal-800" },
          { title: "Active Crops", val: activeProjectsCount, desc: `${highRiskProjects} Flagged High Risk`, icon: <Layers size={16} />, bg: highRiskProjects > 0 ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800" },
          { title: "Supply Commitments", val: `${totalCommitmentsVal} T`, desc: "Pre-harvest agreements", icon: <TrendingUp size={16} />, bg: "bg-cyan-50 text-cyan-800" },
          { title: "Payout Disbursements", val: `₹${approvedPayouts.toLocaleString("en-IN")}`, desc: "Farmer financial aid", icon: <CheckSquare size={16} />, bg: "bg-amber-50 text-amber-800" },
          { title: "Total Procurement", val: `₹${totalProcurementVal.toLocaleString("en-IN")}`, desc: "Direct payout turnover", icon: <DollarSign size={16} />, bg: "bg-emerald-50 text-emerald-800" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">{stat.title}</span>
              <div className={`${stat.bg} p-1.5 rounded-lg`}>{stat.icon}</div>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-none py-1">{stat.val}</p>
            <p className="text-[9px] text-slate-400 font-semibold">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: "users", label: "Users" },
          { id: "projects", label: "Projects" },
          { id: "commitments", label: "Commitments" },
          { id: "procurements", label: "Settlements" },
          { id: "support", label: "Financial Support" },
          { id: "requirements", label: "Buyer Requirements" },
          { id: "reports", label: "Analytics & Reports" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition relative whitespace-nowrap ${
              activeTab === tab.id 
                ? "text-emerald-850" 
                : "text-slate-400 hover:text-slate-655"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-850" />
            )}
          </button>
        ))}
      </div>

      {/* SEARCH AND ADD CONTROLS (Hide in Reports Tab) */}
      {activeTab !== "reports" && (
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="relative max-w-md w-full">
            <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeTab}...`}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
            />
          </div>
          <button
            onClick={() => handleCreateOpen(activeTab.replace(/s$/, ""))}
            className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ml-auto shadow-sm"
          >
            <Plus size={14} /> Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/s$/, "")}
          </button>
        </div>
      )}

      {/* Tab Workspaces */}
      
      {/* 1. USERS DIRECTORY */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">State/City</th>
                  <th className="py-3 px-4">Farm / Organization Details</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">{user.firstName} {user.lastName}</td>
                    <td className="py-4 px-4 font-medium text-slate-500">{user.email}</td>
                    <td className="py-4 px-4 font-semibold">{user.phone}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        user.role === "farmer" ? "bg-emerald-100 text-emerald-850" : user.role === "buyer" ? "bg-sky-100 text-sky-850" : "bg-purple-100 text-purple-855"
                      }`}>{user.role}</span>
                    </td>
                    <td className="py-4 px-4 font-medium">{user.location || user.city} ({user.city})</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {user.role === "farmer" ? (
                        <span>{user.farmName || "Unnamed Farm"} ({user.acreage} Ac)</span>
                      ) : user.role === "buyer" ? (
                        <span>{user.organizationName} ({user.organizationType})</span>
                      ) : (
                        <span className="text-slate-400 italic">System Administrator</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        user.verificationStatus === "VERIFIED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>{user.verificationStatus}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.verificationStatus !== "VERIFIED" && user.role !== "admin" && (
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="bg-emerald-800 hover:bg-emerald-950 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                            title="Verify Profile"
                          >
                            <UserCheck size={10} /> Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleEditOpen("user", user)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("user", user._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. FARM PROJECTS */}
      {activeTab === "projects" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop Type</th>
                  <th className="py-3 px-4">Variety</th>
                  <th className="py-3 px-4">Grower / Farm Address</th>
                  <th className="py-3 px-4">Ecosystem Partner</th>
                  <th className="py-3 px-4">Acreage & Yield</th>
                  <th className="py-3 px-4">Expected Harvest</th>
                  <th className="py-3 px-4">Cultivation Cost</th>
                  <th className="py-3 px-4">Stage & Progress</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj) => (
                  <tr key={proj._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{proj.crop}</td>
                    <td className="py-4 px-4 font-medium">{proj.variety}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {proj.farmer ? `${proj.farmer.firstName} ${proj.farmer.lastName}` : "Deleted Farmer"}
                      <span className="block text-[10px] text-slate-400 font-medium">{proj.farmer?.farmName} ({proj.location})</span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-500">
                      {proj.buyer?.organizationName || <span className="italic text-slate-400">Direct Market</span>}
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {proj.acreage} Acres
                      <span className="block text-[10px] text-emerald-800 font-bold">Est: {proj.expectedYield} Tonnes</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{new Date(proj.expectedHarvestDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">₹{proj.cultivationCost?.toLocaleString()}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-block bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[9px] mb-1">
                        {proj.currentStage}
                      </span>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${proj.progressPercentage}%` }}></div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">{proj.progressPercentage}% Progress</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        proj.riskLevel === "HIGH" ? "bg-red-100 text-red-800" : proj.riskLevel === "MEDIUM" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>{proj.riskLevel}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        proj.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : proj.status === "COMPLETED" ? "bg-slate-100 text-slate-655" : "bg-red-100 text-red-800"
                      }`}>{proj.status}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditOpen("project", proj)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("project", proj._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-655 p-1.5 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ECOSYSTEM COMMITMENTS */}
      {activeTab === "commitments" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Buyer Entity</th>
                  <th className="py-3 px-4">Committed Volume</th>
                  <th className="py-3 px-4">Expected Yield</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Agreement Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommitments.map((com) => (
                  <tr key={com._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{com.buyerRequirement?.crop || "Direct Crop"}</td>
                    <td className="py-4 px-4 font-semibold text-slate-750">
                      {com.farmer ? `${com.farmer.firstName} ${com.farmer.lastName}` : "Deleted Farmer"}
                      <span className="block text-[10px] text-slate-400 font-semibold">{com.farmer?.farmName}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500">{com.buyer?.organizationName || "Deleted Buyer"}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{com.committedQuantity} tonnes</td>
                    <td className="py-4 px-4 font-medium">{com.expectedYield} tonnes</td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        com.status === "ACCEPTED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : com.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-805"
                      }`}>{com.status}</span>
                    </td>
                    <td className="py-4 px-4 font-medium">{new Date(com.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditOpen("commitment", com)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("commitment", com._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-655 p-1.5 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SETTLEMENTS LEDGER */}
      {activeTab === "procurements" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Farmer Seller</th>
                  <th className="py-3 px-4">Buyer Entity</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Agreed Rate</th>
                  <th className="py-3 px-4">Total Payout</th>
                  <th className="py-3 px-4">Delivery Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcurements.map((proc) => (
                  <tr key={proc._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{proc.farmProject?.crop || "Direct Crop"}</td>
                    <td className="py-4 px-4 font-semibold text-slate-750">
                      {proc.farmer ? `${proc.farmer.firstName} ${proc.farmer.lastName}` : "Deleted Farmer"}
                      <span className="block text-[10px] text-slate-400 font-medium">{proc.farmer?.farmName}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-550">{proc.buyer?.organizationName || "Deleted Buyer"}</td>
                    <td className="py-4 px-4 font-bold">{proc.quantity} tonnes</td>
                    <td className="py-4 px-4 font-bold text-slate-700">₹{proc.agreedPrice}/kg</td>
                    <td className="py-4 px-4 font-bold text-emerald-800">₹{proc.totalValue.toLocaleString()}</td>
                    <td className="py-4 px-4 font-medium text-slate-500">{proc.deliveryLocation}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded-full ${
                        proc.status === "COMPLETED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : proc.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>{proc.status}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditOpen("procurement", proc)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("procurement", proc._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-655 p-1.5 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PRE-HARVEST FINANCIAL AID */}
      {activeTab === "support" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Farm Crop</th>
                  <th className="py-3 px-4">Grower Name</th>
                  <th className="py-3 px-4">Cultivation Cost</th>
                  <th className="py-3 px-4">Farmer Contribution</th>
                  <th className="py-3 px-4">Requested Support</th>
                  <th className="py-3 px-4">Support Status</th>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupportRequests.map((req) => (
                  <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{req.farmProject?.crop || "N/A"}</td>
                    <td className="py-4 px-4 font-semibold text-slate-750">
                      {req.farmer ? `${req.farmer.firstName} ${req.farmer.lastName}` : "Deleted Farmer"}
                      <span className="block text-[10px] text-slate-400 font-medium">{req.farmer?.farmName}</span>
                    </td>
                    <td className="py-4 px-4 font-bold">₹{req.cultivationCost?.toLocaleString()}</td>
                    <td className="py-4 px-4 font-medium text-slate-500">₹{req.farmerContribution?.toLocaleString()}</td>
                    <td className="py-4 px-4 font-bold text-emerald-850">₹{req.supportRequired?.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        req.status === "DISBURSED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : req.status === "APPROVED"
                          ? "bg-teal-100 text-teal-800"
                          : req.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>{req.status}</span>
                    </td>
                    <td className="py-4 px-4 font-medium">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditOpen("support", req)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("support", req._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-655 p-1.5 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. BUYER REQUIREMENTS */}
      {activeTab === "requirements" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Crop Type</th>
                  <th className="py-3 px-4">Target Volume</th>
                  <th className="py-3 px-4">Quality Standard</th>
                  <th className="py-3 px-4">Delivery Location</th>
                  <th className="py-3 px-4">Expected Window</th>
                  <th className="py-3 px-4">Target Budget</th>
                  <th className="py-3 px-4">Buyer Organization</th>
                  <th className="py-3 px-4">Posting Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((req) => (
                  <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{req.crop}</td>
                    <td className="py-4 px-4 font-bold">{req.quantity} tonnes</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{req.quality}</td>
                    <td className="py-4 px-4 font-medium">{req.location}</td>
                    <td className="py-4 px-4 font-medium">{req.expectedDelivery}</td>
                    <td className="py-4 px-4 font-bold text-emerald-800">{req.targetPrice}</td>
                    <td className="py-4 px-4 font-semibold text-slate-550">
                      {req.buyerId ? req.buyerId.organizationName : "Deleted Buyer"}
                      <span className="block text-[10px] text-slate-400 font-medium">{req.buyerId?.firstName} {req.buyerId?.lastName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        req.status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}>{req.status}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditOpen("requirement", req)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("requirement", req._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-655 p-1.5 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ANALYTICS & REPORTS GENERATOR */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Reports Panel Selector */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <FileDown size={16} className="text-emerald-850" /> Command Exports
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Select reporting entities and formats to generate downloadable spreadsheets and JSON databases.</p>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Reporting Group</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-bold"
                >
                  <option value="all">Full Ecosystem Summary</option>
                  <option value="users">Users Database Directory</option>
                  <option value="projects">Growing Projects Ledger</option>
                  <option value="commitments">Supply Agreements Ledger</option>
                  <option value="settlements">Financial Procurements Ledger</option>
                  <option value="support">Financial Support Requests</option>
                </select>
              </div>

              {/* Format */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {["csv", "json", "txt"].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setReportFormat(fmt)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-xl border text-center transition ${
                        reportFormat === fmt 
                          ? "bg-emerald-850 border-emerald-850 text-white shadow-sm" 
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerateReport}
                className="w-full bg-emerald-800 hover:bg-emerald-950 text-white text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Activity size={14} /> Generate Dataset Report
              </button>
            </div>
            
            {/* Visual breakdown graphics */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ecosystem Share Analysis</h4>
              
              {/* Role Share representation */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Farmer Growers</span>
                  <span>{users.length ? Math.round((totalFarmers / users.length)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-emerald-700 h-2" style={{ width: `${users.length ? (totalFarmers/users.length)*100 : 0}%` }}></div>
                  <div className="bg-sky-400 h-2" style={{ width: `${users.length ? (totalBuyers/users.length)*100 : 0}%` }}></div>
                  <div className="bg-purple-500 h-2" style={{ width: `${users.length ? ((users.length - totalFarmers - totalBuyers)/users.length)*100 : 0}%` }}></div>
                </div>
                <div className="flex gap-3 text-[9px] text-slate-400 font-bold justify-between">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>Farmers: {totalFarmers}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>Buyers: {totalBuyers}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>Admins</span>
                </div>
              </div>

              {/* Project Risk Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Project Risk Incidents</span>
                  <span>{projects.length ? Math.round((highRiskProjects / projects.length)*100) : 0}% High</span>
                </div>
                <div className="w-full bg-slate-105 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-emerald-600 h-2" style={{ width: `${projects.length ? (projects.filter(p=>p.riskLevel==='LOW').length/projects.length)*100 : 100}%` }}></div>
                  <div className="bg-amber-400 h-2" style={{ width: `${projects.length ? (projects.filter(p=>p.riskLevel==='MEDIUM').length/projects.length)*100 : 0}%` }}></div>
                  <div className="bg-rose-500 h-2" style={{ width: `${projects.length ? (highRiskProjects/projects.length)*100 : 0}%` }}></div>
                </div>
                <div className="flex gap-2 text-[9px] text-slate-400 font-bold justify-between">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Low Risk</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Med Risk</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>High Risk</span>
                </div>
              </div>

            </div>

          </div>

          {/* Generated Report Output View */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-950 rounded-3xl p-6 shadow-xl flex flex-col min-h-[500px] text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={16} className="text-emerald-500" /> Export Console Preview
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Visual output stream representing generated dataset. Download immediately to compile spreadsheets.</p>
              </div>
              {generatedReport && (
                <button
                  onClick={handleDownloadReport}
                  className="bg-emerald-600 hover:bg-emerald-550 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow"
                >
                  <Download size={12} /> Download File
                </button>
              )}
            </div>

            {generatedReport ? (
              <textarea
                value={generatedReport}
                readOnly
                className="w-full flex-grow p-4 bg-slate-950 text-emerald-400 font-mono text-[10px] leading-relaxed rounded-xl border border-slate-800 focus:outline-none select-all overflow-auto"
                style={{ resize: "none" }}
              />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-500 space-y-2">
                <FileText size={48} className="text-slate-700 animate-pulse" />
                <span className="text-xs font-semibold">Console Stream is Empty</span>
                <span className="text-[10px] font-medium text-slate-600">Click "Generate Dataset Report" to process active database nodes.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-sm uppercase tracking-wider">
                {editingItem ? `Edit ${modalType?.toUpperCase()} details` : `Register new ${modalType?.toUpperCase()}`}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Scrollable Wrapper */}
            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              
              {/* --- USER FORM FIELDS --- */}
              {modalType === "user" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">First Name</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName || ""}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Last Name</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName || ""}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Phone Number</label>
                      <input
                        type="text"
                        required
                        placeholder="+919876543210"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Password {editingItem && "(Optional)"}</label>
                      <input
                        type="password"
                        required={!editingItem}
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Verification Status</label>
                      <select
                        value={formData.verificationStatus || "PENDING"}
                        onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="VERIFIED">VERIFIED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">State Location</label>
                      <select
                        value={formData.location || "Tamil Nadu"}
                        onChange={(e) => {
                          const state = e.target.value;
                          const cities = INDIAN_STATES_AND_CITIES[state] || [];
                          setFormData({ ...formData, location: state, city: cities[0] || "" });
                        }}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      >
                        {Object.keys(INDIAN_STATES_AND_CITIES).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">City</label>
                      <select
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      >
                        {(INDIAN_STATES_AND_CITIES[formData.location || "Tamil Nadu"] || []).map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Ecosystem Role</label>
                    <select
                      value={formData.role || "farmer"}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      <option value="farmer">Farmer Grower</option>
                      <option value="buyer">Enterprise Buyer</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>

                  {/* Role Specific Forms */}
                  {formData.role === "farmer" && (
                    <div className="border border-emerald-100 bg-emerald-50/20 p-4 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Farmer Scope Parameters</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Farm Brand Name</label>
                          <input
                            type="text"
                            required
                            value={formData.farmName || ""}
                            onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Cultivable Acreage</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={formData.acreage || ""}
                            onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Crops Cultivated (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="Wheat, Tomato, Potatoes"
                          value={formData.crops || ""}
                          onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {formData.role === "buyer" && (
                    <div className="border border-sky-100 bg-sky-50/20 p-4 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-bold text-sky-850 uppercase tracking-wider">Enterprise Buyer Parameters</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Organization Corporate Name</label>
                          <input
                            type="text"
                            required
                            value={formData.organizationName || ""}
                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Industry Category</label>
                          <select
                            value={formData.organizationType || "Restaurant"}
                            onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-sky-655 bg-white"
                          >
                            <option value="Restaurant">Restaurant Chain</option>
                            <option value="Retail chain">Supermarket/Retail Chain</option>
                            <option value="Exporter">Import/Export House</option>
                            <option value="Agribusiness">Agribusiness Processor</option>
                            <option value="Food processor">Food Processing Plant</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Procured Categories (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="Vegetables, Grains, Fruits"
                          value={formData.procurementCategories || ""}
                          onChange={(e) => setFormData({ ...formData, procurementCategories: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* --- FARM PROJECT FORM FIELDS --- */}
              {modalType === "project" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Farmer Grower</label>
                      <select
                        required
                        value={formData.farmerId || ""}
                        onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      >
                        <option value="">Select Farmer</option>
                        {users.filter(u => u.role==='farmer').map(f => (
                          <option key={f._id} value={f._id}>{f.firstName} {f.lastName} ({f.farmName})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Ecosystem Buyer (Optional)</label>
                      <select
                        value={formData.buyerId || ""}
                        onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      >
                        <option value="">Direct Marketplace</option>
                        {users.filter(u => u.role==='buyer').map(b => (
                          <option key={b._id} value={b._id}>{b.organizationName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Crop Commodity</label>
                      <input
                        type="text"
                        required
                        placeholder="Wheat, Rice, Tomato"
                        value={formData.crop || ""}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Crop Variety</label>
                      <input
                        type="text"
                        required
                        placeholder="Sonalika, Basmati"
                        value={formData.variety || ""}
                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Growing Acreage</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.acreage || ""}
                        onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Est Yield (Tonnes)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.expectedYield || ""}
                        onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Committed Qty (Tonnes)</label>
                      <input
                        type="number"
                        required
                        value={formData.committedQuantity || 0}
                        onChange={(e) => setFormData({ ...formData, committedQuantity: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Total Cultivation Cost (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.cultivationCost || ""}
                        onChange={(e) => setFormData({ ...formData, cultivationCost: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Required Support Funding (₹)</label>
                      <input
                        type="number"
                        value={formData.supportRequired || 0}
                        onChange={(e) => setFormData({ ...formData, supportRequired: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Expected Harvest Date</label>
                      <input
                        type="date"
                        required
                        value={formData.expectedHarvestDate || ""}
                        onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">State Location</label>
                      <select
                        required
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="">Select State</option>
                        {Object.keys(INDIAN_STATES_AND_CITIES).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Growing Stage</label>
                      <select
                        value={formData.currentStage || "PLANNING"}
                        onChange={(e) => setFormData({ ...formData, currentStage: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        {["PLANNING", "PLANTED", "GERMINATION", "VEGETATIVE", "FLOWERING", "FRUITING", "HARVEST_READY", "HARVESTED", "DELIVERED"].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Progress %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progressPercentage || 10}
                        onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Risk Evaluation</label>
                      <select
                        value={formData.riskLevel || "LOW"}
                        onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="LOW">LOW RISK</option>
                        <option value="MEDIUM">MEDIUM RISK</option>
                        <option value="HIGH">HIGH RISK</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Project Status</label>
                      <select
                        value={formData.status || "ACTIVE"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Buyer Requirement Reference</label>
                      <select
                        value={formData.buyerRequirementId || ""}
                        onChange={(e) => setFormData({ ...formData, buyerRequirementId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="">No Reference</option>
                        {requirements.map(r => (
                          <option key={r._id} value={r._id}>{r.crop} for {r.buyerId?.organizationName} ({r.quantity} T)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* --- CROP COMMITMENT FORM FIELDS --- */}
              {modalType === "commitment" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Buyer Requirement Reference</label>
                    <select
                      required
                      value={formData.buyerRequirementId || ""}
                      onChange={(e) => {
                        const req = requirements.find(r => r._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          buyerRequirementId: e.target.value,
                          buyerId: req?.buyerId?._id || ""
                        });
                      }}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      <option value="">Select Posting</option>
                      {requirements.map(r => (
                        <option key={r._id} value={r._id}>{r.crop} requested by {r.buyerId?.organizationName} ({r.quantity} T)</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Farmer Grower</label>
                      <select
                        required
                        value={formData.farmerId || ""}
                        onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      >
                        <option value="">Select Farmer</option>
                        {users.filter(u => u.role==='farmer').map(f => (
                          <option key={f._id} value={f._id}>{f.firstName} {f.lastName} ({f.farmName})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Client Buyer</label>
                      <select
                        required
                        value={formData.buyerId || ""}
                        onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="">Select Buyer</option>
                        {users.filter(u => u.role==='buyer').map(b => (
                          <option key={b._id} value={b._id}>{b.organizationName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Committed Quantity (Tonnes)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.committedQuantity || ""}
                        onChange={(e) => setFormData({ ...formData, committedQuantity: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Expected Harvest Yield (Tonnes)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.expectedYield || ""}
                        onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Agreement Status</label>
                    <select
                      value={formData.status || "PENDING"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      {["PENDING", "ACCEPTED", "REJECTED", "IN_PROGRESS", "HARVEST_READY", "FULFILLED", "CANCELLED"].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* --- PROCUREMENT SETTLEMENT FORM FIELDS --- */}
              {modalType === "procurement" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Source Growing Project</label>
                    <select
                      required
                      value={formData.farmProjectId || ""}
                      onChange={(e) => {
                        const proj = projects.find(p => p._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          farmProjectId: e.target.value,
                          farmerId: proj?.farmer?._id || "",
                          buyerId: proj?.buyer?._id || "",
                          quantity: proj?.committedQuantity || 0
                        });
                      }}
                      className="w-full border border-slate-205 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.crop} by {p.farmer?.firstName} for {p.buyer?.organizationName || "Direct"}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Farmer Seller</label>
                      <select
                        required
                        value={formData.farmerId || ""}
                        onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="">Select Farmer</option>
                        {users.filter(u => u.role==='farmer').map(f => (
                          <option key={f._id} value={f._id}>{f.firstName} {f.lastName} ({f.farmName})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Buyer Entity</label>
                      <select
                        required
                        value={formData.buyerId || ""}
                        onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="">Select Buyer</option>
                        {users.filter(u => u.role==='buyer').map(b => (
                          <option key={b._id} value={b._id}>{b.organizationName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Procured Qty (T)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.quantity || ""}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          const rate = Number(formData.agreedPrice || 0);
                          setFormData({ ...formData, quantity: qty, totalValue: qty * 1000 * rate });
                        }}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Rate (₹/kg)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.agreedPrice || ""}
                        onChange={(e) => {
                          const rate = Number(e.target.value);
                          const qty = Number(formData.quantity || 0);
                          setFormData({ ...formData, agreedPrice: rate, totalValue: qty * 1000 * rate });
                        }}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Quality Grade</label>
                      <input
                        type="text"
                        required
                        placeholder="Grade A, Premium"
                        value={formData.quality || "Grade A"}
                        onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Calculated Value (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.totalValue || 0}
                        onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Delivery Location</label>
                      <input
                        type="text"
                        required
                        placeholder="Warehouse 4, Chennai"
                        value={formData.deliveryLocation || ""}
                        onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Status</label>
                    <select
                      value={formData.status || "PENDING"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      {["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* --- PRE-HARVEST FINANCIAL AID FORM FIELDS --- */}
              {modalType === "support" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Source Growing Project</label>
                    <select
                      required
                      value={formData.farmProjectId || ""}
                      onChange={(e) => {
                        const proj = projects.find(p => p._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          farmProjectId: e.target.value,
                          farmerId: proj?.farmer?._id || "",
                          cultivationCost: proj?.cultivationCost || 0
                        });
                      }}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.crop} by {p.farmer?.firstName} ({p.location})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Farmer Grower</label>
                    <select
                      required
                      value={formData.farmerId || ""}
                      onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      <option value="">Select Farmer</option>
                      {users.filter(u => u.role==='farmer').map(f => (
                        <option key={f._id} value={f._id}>{f.firstName} {f.lastName} ({f.farmName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Total cost (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.cultivationCost || ""}
                        onChange={(e) => setFormData({ ...formData, cultivationCost: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Farmer Share (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.farmerContribution || ""}
                        onChange={(e) => setFormData({ ...formData, farmerContribution: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Payout Aid (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.supportRequired || ""}
                        onChange={(e) => setFormData({ ...formData, supportRequired: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Status</label>
                    <select
                      value={formData.status || "REQUESTED"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      {["REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* --- BUYER REQUIREMENT FORM FIELDS --- */}
              {modalType === "requirement" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Buyer Organization</label>
                    <select
                      required
                      value={formData.buyerId || ""}
                      onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                    >
                      <option value="">Select Corporate Buyer</option>
                      {users.filter(u => u.role==='buyer').map(b => (
                        <option key={b._id} value={b._id}>{b.organizationName} ({b.firstName} {b.lastName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Required Crop</label>
                      <input
                        type="text"
                        required
                        placeholder="Wheat, Soybeans"
                        value={formData.crop || ""}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Volume (Tonnes)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.quantity || ""}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Quality specifications</label>
                      <input
                        type="text"
                        required
                        placeholder="Grade A, Moisture < 12%"
                        value={formData.quality || "Grade A"}
                        onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Delivery Location (State)</label>
                      <select
                        required
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        <option value="">Select State</option>
                        {Object.keys(INDIAN_STATES_AND_CITIES).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Expected Delivery Date Window</label>
                      <input
                        type="text"
                        required
                        placeholder="June 20-30"
                        value={formData.expectedDelivery || ""}
                        onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Target Price Range</label>
                      <input
                        type="text"
                        required
                        placeholder="₹28–32/kg"
                        value={formData.targetPrice || ""}
                        onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Posting Status</label>
                    <select
                      value={formData.status || "open"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-slate-205 p-2 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50"
                    >
                      <option value="open">OPEN (Accepting commitments)</option>
                      <option value="closed">CLOSED</option>
                      <option value="fulfilled">FULFILLED</option>
                    </select>
                  </div>
                </>
              )}

              {/* Modal Footer Controls */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs px-5 py-2 rounded-xl font-bold transition shadow-sm"
                >
                  {editingItem ? "Save Changes" : "Register Item"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
