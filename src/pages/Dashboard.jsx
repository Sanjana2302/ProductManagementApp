import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, AlertTriangle, Clock, LogOut, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardApi } from "../api";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardApi()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const actionColors = { ADDED: "text-green-600 bg-green-50", EDITED: "text-orange-600 bg-orange-50", DELETED: "text-red-600 bg-red-50" };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-black text-orange-500 italic">StockManager</h1>
          <p className="text-xs text-slate-400">{user?.shopName}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/inventory")}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-100 transition-colors">
            <LayoutGrid size={16} /> Inventory
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">Dashboard</h2>
          <p className="text-slate-400 text-sm">Welcome back, {user?.fullName}</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Package} label="Total Products" value={data?.totalProducts ?? 0} color="bg-orange-500" />
              <StatCard icon={DollarSign} label="Inventory Value" value={`$${Number(data?.totalInventoryValue ?? 0).toFixed(2)}`} color="bg-emerald-500" />
              <StatCard icon={AlertTriangle} label="Low Stock Items" value={data?.lowStockCount ?? 0} color="bg-rose-500" />
            </div>

            {/* Activity Log */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Recent Activity</h3>
              </div>
              {data?.recentActivity?.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">No activity yet</p>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {data?.recentActivity?.map((log, i) => (
                    <li key={i} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${actionColors[log.action] ?? "text-slate-500 bg-slate-50"}`}>
                          {log.action}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{log.productName}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
