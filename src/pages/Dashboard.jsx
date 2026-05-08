import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, IndianRupee, AlertTriangle, Clock, LogOut, LayoutGrid, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardApi, getProductsApi, getAllProductsSortedApi } from "../api";

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:border-orange-200 transition-all" : ""}`}
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
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    getDashboardApi()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLowStockClick = async () => {
    try {
      const { data: products } = await getProductsApi("");
      setLowStockProducts(products.filter((p) => p.lowStock));
      setShowLowStock(true);
    } catch {}
  };

  const handleTotalProductsClick = async () => {
    try {
      const { data: products } = await getAllProductsSortedApi();
      setAllProducts(products);
      setShowAllProducts(true);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const actionColors = {
    ADDED: "text-green-600 bg-green-50",
    EDITED: "text-orange-600 bg-orange-50",
    DELETED: "text-red-600 bg-red-50",
  };

  const allActivity = data?.recentActivity ?? [];
  const visibleActivity = allActivity.slice(0, activityPage * PAGE_SIZE);
  const hasMore = visibleActivity.length < allActivity.length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div>
          <h1 className="text-lg md:text-xl font-black text-orange-500 italic">StockManager</h1>
          <p className="text-xs text-slate-400">{user?.shopName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/inventory")}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs md:text-sm hover:bg-orange-100 transition-colors">
            <LayoutGrid size={15} />
            <span className="hidden sm:inline">Inventory</span>
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs md:text-sm hover:bg-slate-200 transition-colors">
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-5xl mx-auto w-full">
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-black text-slate-900">Dashboard</h2>
          <p className="text-slate-400 text-sm">Welcome back, {user?.fullName}</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <StatCard icon={Package} label="Total Products" value={data?.totalProducts ?? 0} color="bg-orange-500" onClick={handleTotalProductsClick} />
              <StatCard
                icon={IndianRupee}
                label="Inventory Value"
                value={`₹${Number(data?.totalInventoryValue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                color="bg-emerald-500"
              />
              <StatCard
                icon={AlertTriangle}
                label="Low Stock Items"
                value={data?.lowStockCount ?? 0}
                color="bg-rose-500"
                onClick={handleLowStockClick}
              />
            </div>

            {/* Activity Log */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Recent Activity</h3>
              </div>
              {allActivity.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">No activity yet</p>
              ) : (
                <>
                  <ul className="divide-y divide-slate-50">
                    {visibleActivity.map((log, i) => (
                      <li key={i} className="px-4 md:px-6 py-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`shrink-0 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${actionColors[log.action] ?? "text-slate-500 bg-slate-50"}`}>
                            {log.action}
                          </span>
                          <span className="text-sm font-bold text-slate-800 truncate">{log.productName}</span>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">
                          {new Date(log.timestamp).toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {hasMore && (
                    <div className="px-6 py-4 border-t border-slate-50">
                      <button
                        onClick={() => setActivityPage((p) => p + 1)}
                        className="w-full py-2.5 text-sm font-bold text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                        View More ({allActivity.length - visibleActivity.length} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* All Products Modal */}
      {showAllProducts && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/20 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900">All Products</h3>
                <p className="text-xs text-slate-400">Sorted A → Z</p>
              </div>
              <button onClick={() => setShowAllProducts(false)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            <ul className="overflow-y-auto divide-y divide-slate-50">
              {allProducts.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">No products found</p>
              ) : allProducts.map((p) => (
                <li key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">₹{p.price}</p>
                  </div>
                  <span className={`text-sm font-black ${p.lowStock ? "text-rose-500" : "text-slate-900"}`}>
                    {p.stockQty} units
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* Low Stock Modal */}
      {showLowStock && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/20 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900">Low Stock Items</h3>
              <button onClick={() => setShowLowStock(false)}
                className="p-2 bg-slate-50 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            <ul className="overflow-y-auto divide-y divide-slate-50">
              {lowStockProducts.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">No low stock items</p>
              ) : lowStockProducts.map((p) => (
                <li key={p.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">Alert at {p.lowStockThreshold} units</p>
                  </div>
                  <span className="text-lg font-black text-rose-500">{p.stockQty}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
