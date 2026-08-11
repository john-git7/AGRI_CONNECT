import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Bell, LogOut, User, Check, Loader } from "lucide-react";
import axios from "../axiosConfig";
import FarmerDashboard from "./FarmerDashboard";
import BuyerDashboard from "./BuyerDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfileAndNotifications();
  }, [token, navigate]);

  const fetchProfileAndNotifications = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get("/auth/profile");
      setUser(profileRes.data);
      
      // Store user ID for tracking
      localStorage.setItem("userId", profileRes.data._id);
      localStorage.setItem("username", `${profileRes.data.firstName} ${profileRes.data.lastName}`);

      const notifRes = await axios.get("/notifications");
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Dashboard mount fetch error", err);
      // If token expired, clear and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.put(`/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-slate-500 bg-[#FAF9F6]">
        <Loader className="animate-spin text-emerald-850" size={32} />
        <span className="text-sm font-semibold">Validating credentials...</span>
      </div>
    );
  }

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 antialiased flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 border-b border-emerald-100 px-4 md:px-6 py-4 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-emerald-800 p-2 rounded-xl text-white">
              <Leaf size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-emerald-950">
              AgriConnect <span className="hidden sm:inline-block text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded ml-2 font-medium tracking-wide">B2B PLATFORM</span>
            </span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-6">
            
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Ecosystem Alerts</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{unreadCount} Unread</span>
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 p-6 text-center">No alerts logged.</p>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              className={`p-4 space-y-1 hover:bg-slate-50 transition cursor-pointer text-left ${
                                !notif.read ? "bg-emerald-50/25" : ""
                              }`}
                              onClick={() => handleMarkAsRead(notif._id)}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-xs text-emerald-950">{notif.title}</span>
                                {!notif.read && (
                                  <button className="text-emerald-700 hover:text-emerald-900">
                                    <Check size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                                {notif.message}
                              </p>
                              <span className="text-[9px] text-slate-400 block font-medium">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Navigation */}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate("/profile")}
            >
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-850">
                <User size={18} />
              </div>
              <div className="hidden md:block text-left text-xs font-semibold">
                <span className="block text-slate-800 font-bold">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="block text-slate-400 uppercase text-[9px] tracking-wider font-bold">
                  {user?.organizationName || user?.role}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-red-650 hover:bg-red-50 px-3.5 py-2 rounded-xl transition"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Sign Out</span>
            </button>

          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 w-full flex-grow">
        {user?.role === "farmer" && <FarmerDashboard />}
        {user?.role === "buyer" && <BuyerDashboard />}
        {user?.role === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
