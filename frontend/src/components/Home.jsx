const message = {
  source: 'TASK_COMPLETE',
  task_id: 'e9971baf-f0fb-42d7-8cdf-f0e272e48ade/task-123',
  status: 'DONE',
  content: 'Database seeded successfully!\n'
};
// This handles the background seeder completion state
import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  Cpu, 
  Layers, 
  FileText, 
  Calendar,
  LineChart,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="bg-[#FAF9F6] min-h-screen text-slate-800 selection:bg-emerald-800 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 px-3 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-emerald-800 p-1.5 sm:p-2 rounded-xl text-white">
              <Leaf size={18} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tight text-emerald-900">
              Agri<span className="text-emerald-600 font-medium">Connect</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link 
              to="/login" 
              className="text-emerald-950 font-semibold hover:text-emerald-700 transition text-xs sm:text-base whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition text-xs sm:text-base whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-emerald-50/50 to-[#FAF9F6]">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
          >
            <Cpu size={14} /> AI-Powered Pre-Harvest Supply & Procurement
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-emerald-950 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Create the market <br />
            <span className="text-emerald-700 font-semibold italic">before</span> the crop is grown
          </motion.h1>

          <motion.p 
            className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Connect future agricultural demand with future agricultural supply. We enable bulk buyers to commit to crop purchases before cultivation, helping farmers secure guaranteed demand and pre-harvest support, while delivering real-time cultivation tracking and AI predictions.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link
              to="/signup"
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2 group w-full sm:w-auto justify-center animate-pulse"
            >
              Find Agricultural Supply
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/signup"
              className="bg-white border-2 border-emerald-800 text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold transition w-full sm:w-auto text-center"
            >
              List Your Farm
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Ecosystem Visualizer Section */}
      <section className="py-16 px-4 sm:px-6 bg-white border-y border-emerald-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-emerald-950 mb-12">
            The Pre-Harvest Supply Chain Workflow
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { title: "Buyer Demand", desc: "Procurement targets published", step: "01" },
              { title: "Crop Matching", desc: "AI connects regional capacity", step: "02" },
              { title: "Commitment", desc: "B2B pre-harvest pre-adoption", step: "03" },
              { title: "Cultivation Tracking", desc: "Real-time logs & updates", step: "04" },
              { title: "AI Predictions", desc: "Yield and risk intelligence", step: "05" },
              { title: "Direct Procurement", desc: "Harvest shipment & fulfillment", step: "06" }
            ].map((item, idx) => (
              <div key={idx} className="relative p-5 sm:p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col justify-between min-h-[140px]">
                <span className="text-xs font-bold text-emerald-600 tracking-widest block mb-4">STEP {item.step}</span>
                <div>
                  <h3 className="font-bold text-emerald-950 mb-1 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-emerald-300">
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-emerald-700 font-bold uppercase tracking-wider text-sm">AgriConnect Shift</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">A Structural Rewrite of Agri-Commerce</h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Standard marketplaces match buyers with crops that are already harvested, forcing farmers to bear 100% of price volatility, climate risks, and waste. AgriConnect flips the sequence.
          </p>
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <span className="block font-bold text-red-950 text-sm">TRADITIONAL MARKETPLACE (REACTIVE)</span>
              <p className="text-xs text-red-800 mt-1">Grow Crop → Suffer Weather Risks → Harvest → Search desperately for local buyers</p>
            </div>
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl">
              <span className="block font-bold text-emerald-950 text-sm">AGRICONNECT FLOW (PROACTIVE)</span>
              <p className="text-xs text-emerald-800 mt-1">Buyer Demand → Secure Commitment → Cultivation tracking with AI → Assured direct procurement</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/40 rounded-full blur-2xl -mr-20 -mt-20"></div>
          <h3 className="text-2xl font-bold">Why B2B/B2F Focus?</h3>
          <p className="text-emerald-100 text-sm leading-relaxed">
            By shifting transactions away from retail consumers to institutional buyers (e.g. food processors, exporter giants, restaurant chains), we stabilize supply chains and unlock institutional financing partner integrations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-800 text-xs">
            <div>
              <span className="block text-emerald-300 font-bold">Farmers Gain</span>
              <p className="text-emerald-100 mt-1">Visible price sheets & upfront purchase agreements.</p>
            </div>
            <div>
              <span className="block text-emerald-300 font-bold">Buyers Gain</span>
              <p className="text-emerald-100 mt-1">Direct source traceability & predictable volume flows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Key Features */}
      <section className="py-16 sm:py-20 bg-emerald-900 text-white px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Ecosystem Core Capabilities</h2>
            <p className="text-emerald-100/80 text-sm sm:text-base">Everything needed to establish contract-backed cultivation and monitor growth securely.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-emerald-950/60 p-6 sm:p-8 rounded-2xl border border-emerald-800/40 space-y-4">
              <div className="bg-emerald-800 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-300">
                <FileText size={22} />
              </div>
              <h3 className="text-xl font-bold">Procurement Demand</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed">
                Bulk buyers publish exact volume specs, quality grades (Grade A, Premium), targeted delivery dates, and price margins.
              </p>
            </div>

            <div className="bg-emerald-950/60 p-6 sm:p-8 rounded-2xl border border-emerald-800/40 space-y-4">
              <div className="bg-emerald-800 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-300">
                <Calendar size={22} />
              </div>
              <h3 className="text-xl font-bold">Cultivation Timeline</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed">
                Farmers update stages (Vegetative, Fruiting) and capture photo proofs. Buyers inspect real-time logs remotely.
              </p>
            </div>

            <div className="bg-emerald-950/60 p-6 sm:p-8 rounded-2xl border border-emerald-800/40 space-y-4">
              <div className="bg-emerald-800 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-300">
                <Cpu size={22} />
              </div>
              <h3 className="text-xl font-bold">AI Yield & Risk Prediction</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed">
                Calculates yields per acre using crop agronomics and evaluates environmental risk indexes based on regional climates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Support Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 order-2 md:order-1">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100 space-y-4">
            <span className="inline-block text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              Future Fintech Integration
            </span>
            <h4 className="text-lg font-bold text-emerald-950">Pre-Harvest Support Request Form</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
              <div>
                <span className="text-slate-400">Total Cultivation Cost:</span>
                <span className="block font-bold text-slate-800">₹1,60,000</span>
              </div>
              <div>
                <span className="text-slate-400">Pre-Harvest Support:</span>
                <span className="block font-bold text-emerald-700">₹80,000</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides data-backed audit logs of crop commitment agreements to external financing partners (NBFCs, Banks, Buyer advance programs) for streamlined verification.
            </p>
          </div>
        </div>
        <div className="space-y-6 order-1 md:order-2">
          <span className="text-emerald-700 font-bold uppercase tracking-wider text-sm">Pre-Harvest Support</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">Unlock Capital via Verified Commitments</h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Financing has historically been blocked by a lack of collateral. By logging commitments from verified buyers on AgriConnect, farmers can refer pre-harvest project plans to certified lending partners.
          </p>
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <UserCheck size={18} className="text-emerald-600" />
            <span>Clearly marked prototype partner referral model</span>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-16 sm:py-20 bg-emerald-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <span className="text-emerald-800 font-bold uppercase tracking-wider text-sm">Monetization</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">Built for Enterprise B2B Supply Chains</h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              AgriConnect does not charge retail consumer commissions. The platform monetizes directly on institutional supply chain volume:
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-700"></div>
                <strong>Transaction Fee:</strong> Flat volume fee assessed per fulfilled procurement order.
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-700"></div>
                <strong>Buyer SaaS Suite:</strong> Premium crop tracking API, risk alerts, and custom dashboard reporting.
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold text-emerald-950">Monetization Roadmap</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-800 text-xs font-bold">1</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Procurement Brokerage (Live)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Matching supply contracts directly with verified buyers.</p>
                </div>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-800 text-xs font-bold">2</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Financing Referrals (Beta)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Providing verified contracts to third-party bank partners.</p>
                </div>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-800 text-xs font-bold">3</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Supply Intelligence (Planned)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Multi-region supply deficit forecasts & predictive modeling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-100 py-12 px-4 sm:px-6 border-t border-emerald-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-emerald-400" />
            <span className="font-bold text-white">AgriConnect Ecosystem</span>
          </div>
          <div className="text-emerald-300/60 text-xs">
            © {new Date().getFullYear()} AgriConnect. All Rights Reserved. Hackathon MVP Version.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
