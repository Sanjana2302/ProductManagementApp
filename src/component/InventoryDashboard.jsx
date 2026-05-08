import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Edit3, X, Save, LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProductsApi, addProductApi, editProductApi, deleteProductApi } from "../api";

const InventoryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stockQty: "", lowStockThreshold: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async (search = "") => {
    try {
      const { data } = await getProductsApi(search);
      setProducts(data);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchProducts]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await addProductApi({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stockQty: parseInt(newProduct.stockQty),
        lowStockThreshold: parseInt(newProduct.lowStockThreshold),
      });
      setIsAddModalOpen(false);
      setNewProduct({ name: "", price: "", stockQty: "", lowStockThreshold: "" });
      fetchProducts(searchTerm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const qty = parseInt(editingProduct.addStock || 0);
      const finalQty = editingProduct.stockMode === "sell" ? -qty : qty;
      await editProductApi(editingProduct.id, {
        name: editingProduct.name,
        price: editingProduct.price,
        addStockQty: finalQty,
      });
      setIsEditModalOpen(false);
      fetchProducts(searchTerm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteProductApi(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts(searchTerm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans w-full">
      {/* HEADER */}
      <header className="border-b border-slate-100 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="w-full md:w-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-orange-500 italic">Stock Manager</h1>
            <p className="text-xs text-slate-400">{user?.shopName}</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)}
            className="md:hidden bg-orange-500 text-white p-2.5 rounded-xl shadow-lg active:scale-95">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm font-medium border bg-slate-50 border-slate-100 focus:bg-white focus:border-orange-500 transition-all" />
          </div>
          <button onClick={() => navigate("/dashboard")}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
            <LayoutDashboard size={16} />
          </button>
          <button onClick={() => setIsAddModalOpen(true)}
            className="hidden md:flex bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm items-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-100">
            <Plus size={18} /> Add New
          </button>
          <button onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-4 md:mx-8 mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
          {error}
          <button onClick={() => setError("")} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* TABLE */}
      <main className="p-4 md:p-8 w-full">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading products...</div>
        ) : (
          <div className="w-full border border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-slate-400 text-sm">No products found</td>
                      </tr>
                    ) : products.map((product) => (
                      <motion.tr key={product.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                        className={`hover:bg-slate-50/50 transition-colors ${product.lowStock ? "bg-rose-50/30" : ""}`}>
                        <td className="px-6 py-5 text-sm font-bold text-slate-800">
                          {product.name}
                          {product.lowStock && (
                            <span className="ml-2 text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Low Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center text-sm font-medium text-slate-500">${product.price}</td>
                        <td className="px-6 py-5 text-center">
                          <span className={`text-base font-black ${product.lowStock ? "text-rose-500" : "text-slate-900"}`}>
                            {product.stockQty}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingProduct({ ...product, addStock: 0, stockMode: "restock" }); setIsEditModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => { setProductToDelete(product); setIsDeleteModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal close={() => setIsAddModalOpen(false)} title="Add Product">
            <form onSubmit={handleAddProduct} className="space-y-4">
              <Input label="Product Name" placeholder="e.g. Wireless Mouse"
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
              <Input label="Price ($)" type="number" step="0.01"
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Stock Qty" type="number"
                  onChange={(e) => setNewProduct({ ...newProduct, stockQty: e.target.value })} required />
                <Input label="Low Alert" type="number"
                  onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: e.target.value })} required />
              </div>
              <button disabled={actionLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all">
                <Save size={18} /> {actionLoading ? "Saving..." : "Save Product"}
              </button>
            </form>
          </Modal>
        )}

        {isEditModalOpen && editingProduct && (
          <Modal close={() => setIsEditModalOpen(false)} title="Edit Product">
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <Input label="Product Name" defaultValue={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              <Input label="Price ($)" type="number" step="0.01" defaultValue={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} />

              {/* Restock / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button"
                  onClick={() => setEditingProduct({ ...editingProduct, stockMode: "restock" })}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                    editingProduct.stockMode === "restock"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                  + Restock
                </button>
                <button type="button"
                  onClick={() => setEditingProduct({ ...editingProduct, stockMode: "sell" })}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                    editingProduct.stockMode === "sell"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                  − Sell
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <Input
                  label={editingProduct.stockMode === "sell" ? "Qty Sold" : "Qty to Add"}
                  type="number" placeholder="Enter qty..."
                  onChange={(e) => setEditingProduct({ ...editingProduct, addStock: e.target.value })} />
                <div className="flex justify-between px-4 py-3 bg-slate-50 rounded-xl items-center border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</span>
                  <span className="text-xl font-black text-slate-900">{editingProduct.stockQty}</span>
                </div>
              </div>

              <button disabled={actionLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 active:scale-95 transition-all">
                {actionLoading ? "Updating..." : "Confirm Update"}
              </button>
            </form>
          </Modal>
        )}

        {isDeleteModalOpen && productToDelete && (
          <Modal close={() => setIsDeleteModalOpen(false)} title="Delete Product?">
            <p className="text-sm text-slate-500 mb-6">
              Delete <span className="font-bold text-slate-900">{productToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={actionLoading}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all">
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ children, close, title }) => (
  <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/10 backdrop-blur-sm">
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      className="bg-white w-full max-w-sm rounded-t-[2.5rem] md:rounded-[2rem] p-8 shadow-2xl relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <button onClick={close} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={18} /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input {...props} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-orange-500 outline-none font-bold text-slate-800" />
  </div>
);

export default InventoryDashboard;
