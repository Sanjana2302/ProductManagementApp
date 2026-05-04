import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Mic,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  Save,
} from "lucide-react";

const StockControl = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Premium Widget", price: 29.99, stock: 10, threshold: 5 },
    { id: 2, name: "Elite Sensor", price: 89.0, stock: 3, threshold: 10 },
    { id: 3, name: "Smart Hub", price: 150.0, stock: 25, threshold: 8 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false); // To show mic status
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    threshold: "",
  });

  // --- REAL VOICE RECOGNITION (Web Speech API) ---
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser doesn't support Voice Recognition. Try Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // You can change to 'mr-IN' for Marathi recognition

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript.toLowerCase());
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("Error recognizing voice. Try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- CRUD FUNCTIONS ---
  const handleAddProduct = (e) => {
    e.preventDefault();
    const productToAdd = {
      ...newProduct,
      id: Date.now(),
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      threshold: parseInt(newProduct.threshold),
    };
    setProducts([...products, productToAdd]);
    setIsAddModalOpen(false);
    setNewProduct({ name: "", price: "", stock: "", threshold: "" });
  };

  const handleDelete = () => {
    setProducts(products.filter((p) => p.id !== productToDelete.id));
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setProducts(
      products.map((p) => {
        if (p.id === editingProduct.id) {
          const addedQty = parseInt(editingProduct.addStock || 0);
          return { ...editingProduct, stock: p.stock + addedQty, addStock: 0 };
        }
        return p;
      }),
    );
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans w-full">
      {/* HEADER */}
      <header className="border-b border-slate-100 px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="w-full md:w-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-black text-orange-500 italic">
            Stock Managment
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="md:hidden bg-orange-500 text-white p-2.5 rounded-xl shadow-lg active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={16}
            />
            <input
              type="text"
              placeholder={isListening ? "Listening..." : "Search products..."}
              value={searchTerm}
              className={`w-full pl-10 pr-12 py-2.5 rounded-xl outline-none text-sm font-medium transition-all border ${isListening ? "bg-orange-50 border-orange-300 ring-4 ring-orange-100" : "bg-slate-50 border-slate-100 focus:bg-white focus:border-orange-500"}`}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? "bg-orange-500 text-white animate-pulse" : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"}`}
            >
              <Mic size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden md:flex bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm items-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-100"
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </header>

      {/* TABLE */}
      <main className="p-4 md:p-8 w-full max-w-full">
        <div className="w-full border border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Price
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {products
                    .filter((p) => p.name.toLowerCase().includes(searchTerm))
                    .map((product) => (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={product.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-5 text-sm font-bold text-slate-800">
                          {product.name}
                        </td>
                        <td className="px-6 py-5 text-center text-sm font-medium text-slate-500">
                          ${product.price}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`text-base font-black ${product.stock <= product.threshold ? "text-rose-500 underline decoration-2" : "text-slate-900"}`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setProductToDelete(product);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                            >
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
      </main>

      {/* MODALS (Reusable) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal close={() => setIsAddModalOpen(false)} title="Add Product">
            <form onSubmit={handleAddProduct} className="space-y-4">
              <Input
                label="Product Name"
                placeholder="e.g. Wireless Mouse"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Stock"
                  type="number"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  required
                />
                <Input
                  label="Alert"
                  type="number"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, threshold: e.target.value })
                  }
                  required
                />
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all">
                <Save size={18} /> Save Product
              </button>
            </form>
          </Modal>
        )}

        {isEditModalOpen && editingProduct && (
          <Modal close={() => setIsEditModalOpen(false)} title="Edit Product">
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <Input
                label="Product Name"
                defaultValue={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label="Add Qty"
                  type="number"
                  placeholder="Qty to add..."
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      addStock: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-between px-4 py-3 bg-slate-50 rounded-xl items-center border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Current Stock
                </span>
                <span className="text-xl font-black text-slate-900">
                  {editingProduct.stock}
                </span>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 active:scale-95 transition-all">
                Confirm Update
              </button>
            </form>
          </Modal>
        )}

        {isDeleteModalOpen && productToDelete && (
          <Modal
            close={() => setIsDeleteModalOpen(false)}
            title="Delete Product?"
          >
            <p className="text-sm text-slate-500 mb-6">
              Do you want to delete{" "}
              <span className="font-bold text-slate-900">
                {productToDelete.name}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable UI Components
const Modal = ({ children, close, title }) => (
  <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/10 backdrop-blur-sm">
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="bg-white w-full max-w-sm rounded-t-[2.5rem] md:rounded-[2rem] p-8 shadow-2xl relative"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <button
          onClick={close}
          className="p-2 bg-slate-50 rounded-full text-slate-400"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </motion.div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-orange-500 outline-none font-bold text-slate-800"
    />
  </div>
);

export default StockControl;
