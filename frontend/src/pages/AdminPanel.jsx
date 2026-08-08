import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, RefreshCw, Plus, Trash2, Lock, LogOut, ShoppingBag, Layers } from 'lucide-react';

const STATUSES = ['Order Received', 'Payment Verified', 'Packing', 'Shipped', 'Delivered'];
const CATEGORIES = ['Combo Packs', 'Sky Shots', 'Flower Pots', 'Fountains', 'Rockets', 'Sparklers', 'Crackers', 'Ground Chakras', 'Ground Novelties'];

const STATUS_COLORS = {
  'Order Received': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Payment Verified': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Packing': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Shipped': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Delivered': 'bg-festival-gold/20 text-festival-gold border-festival-gold/30',
};

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-festival-gold transition-colors";

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('crackerking_admin_token');
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin view tabs: 'orders' | 'products' | 'add-product'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Add product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Flower Pots',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    discount: '',
    badge: '',
    imageUrl: '',
    stock: '100'
  });
  const [addProductSuccess, setAddProductSuccess] = useState('');
  const [addProductError, setAddProductError] = useState('');
  const [addProductLoading, setAddProductLoading] = useState(false);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('crackerking_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Could not connect to server.');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('crackerking_admin_token');
    setIsAuthenticated(false);
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
    setOrdersLoading(false);
  };

  // Fetch Products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
    setProductsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchProducts();
    }
  }, [isAuthenticated]);

  // Update Status
  const updateStatus = async (orderId, status) => {
    setUpdatingStatus(orderId);
    try {
      await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch {}
    setUpdatingStatus(null);
  };

  // Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddProductLoading(true);
    setAddProductError('');
    setAddProductSuccess('');

    if (!newProduct.name || !newProduct.originalPrice || !newProduct.discountedPrice) {
      setAddProductError('Please fill in Name, Original Price, and Discounted Price.');
      setAddProductLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          originalPrice: Number(newProduct.originalPrice),
          discountedPrice: Number(newProduct.discountedPrice),
          discount: newProduct.discount ? Number(newProduct.discount) : undefined,
          stock: Number(newProduct.stock || 100)
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddProductSuccess(`Product "${newProduct.name}" added successfully! 🎉`);
        setNewProduct({
          name: '',
          category: 'Flower Pots',
          description: '',
          originalPrice: '',
          discountedPrice: '',
          discount: '',
          badge: '',
          imageUrl: '',
          stock: '100'
        });
        fetchProducts();
      } else {
        setAddProductError(data.error || 'Failed to add product');
      }
    } catch {
      setAddProductError('Could not connect to server.');
    }
    setAddProductLoading(false);
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingProductId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch {}
    setDeletingProductId(null);
  };

  const totalRevenue = orders.filter(o => o.status !== 'Order Received').reduce((s, o) => s + Number(o.totalAmount), 0);

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-24 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 md:p-10 w-full max-w-md border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-festival-gold to-festival-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,215,0,0.4)]">
              <Lock size={28} className="text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">Admin Portal</h2>
            <p className="text-gray-400 text-sm">Sign in to manage products & orders</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Email Address</label>
              <input
                id="admin-email-input"
                type="email"
                required
                className={inputClass}
                placeholder="admin@crackerking.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Password</label>
              <input
                id="admin-password-input"
                type="password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            {loginError && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 py-2 rounded-xl">
                {loginError}
              </p>
            )}

            <button
              id="admin-login-submit"
              type="submit"
              disabled={loginLoading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {loginLoading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-500 text-xs">
              Default Credentials: <code className="text-festival-gold">admin@crackerking.com</code> / <code className="text-festival-gold">admin123</code>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Admin Dashboard
            <span className="text-xs bg-festival-gold/20 text-festival-gold border border-festival-gold/30 px-2.5 py-1 rounded-full font-mono">
              Authenticated
            </span>
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Manage inventory, products, and customer orders</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchOrders(); fetchProducts(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-festival-gold hover:border-festival-gold/40 transition-all text-sm"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all text-sm"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 flex items-center gap-4">
          <span className="text-3xl">📦</span>
          <div>
            <p className="text-gray-500 text-xs">Total Orders</p>
            <p className="text-white font-bold text-2xl">{orders.length}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <span className="text-3xl">🎆</span>
          <div>
            <p className="text-gray-500 text-xs">Live Products</p>
            <p className="text-white font-bold text-2xl">{products.length}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <span className="text-3xl">💰</span>
          <div>
            <p className="text-gray-500 text-xs">Verified Revenue</p>
            <p className="text-white font-bold text-2xl">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-white/10 mb-8 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package size={16} /> Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'products'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag size={16} /> All Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('add-product')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'add-product'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="text-center py-20">
              <p className="text-3xl mb-2">⏳</p>
              <p className="text-gray-400">Loading customer orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <Package size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-semibold mb-1">No orders placed yet</p>
              <p className="text-gray-600 text-sm">Customer orders will appear here automatically.</p>
            </div>
          ) : (
            orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-5"
              >
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-festival-gold font-mono font-bold text-lg">{order.id}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[order.status] || 'bg-white/10 text-white border-white/20'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-white font-semibold">{order.customerName}</p>
                    <p className="text-gray-400 text-sm">{order.mobile} • {order.city}, {order.pincode}</p>
                    <p className="text-gray-500 text-xs mt-1">{order.address}</p>
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <p className="text-gray-400 text-xs mb-1 font-medium">Items Ordered</p>
                    {(order.items || []).map((item, j) => (
                      <p key={j} className="text-gray-300 text-sm">
                        {item.name} <span className="text-gray-500">×{item.quantity}</span>
                      </p>
                    ))}
                  </div>

                  <div className="text-right flex flex-col items-end gap-3">
                    <div>
                      <p className="text-gray-500 text-xs">Total Amount</p>
                      <p className="text-festival-gold font-bold text-xl">₹{Number(order.totalAmount).toLocaleString()}</p>
                    </div>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                      className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-festival-gold cursor-pointer"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Products List */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {productsLoading ? (
            <div className="text-center py-20">
              <p className="text-3xl mb-2">⏳</p>
              <p className="text-gray-400">Loading product inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <p className="text-4xl mb-4">🎆</p>
              <p className="text-gray-400 font-semibold mb-2">No products found</p>
              <button onClick={() => setActiveTab('add-product')} className="btn-primary mt-2">
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="glass-card p-4 flex gap-4 items-center relative group">
                  <div className="w-20 h-20 bg-black/50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🎆</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-festival-gold text-[10px] font-bold tracking-widest uppercase block">{p.category}</span>
                    <h4 className="text-white font-bold text-sm truncate">{p.name}</h4>
                    <p className="text-gray-400 text-xs line-clamp-1 mb-1">{p.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-festival-gold font-bold">₹{p.discountedPrice}</span>
                      <span className="text-gray-500 line-through text-xs">₹{p.originalPrice}</span>
                      <span className="text-festival-crimson text-xs font-bold">-{p.discount}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    disabled={deletingProductId === p.id}
                    className="p-2 text-gray-500 hover:text-festival-crimson hover:bg-white/5 rounded-lg transition-colors"
                    title="Delete product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Add New Product Form */}
      {activeTab === 'add-product' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="text-festival-gold" /> Add New Product to Store
          </h3>

          <form onSubmit={handleAddProduct} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="e.g. Deluxe Sky Lantern Set"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 text-sm font-medium">Category *</label>
                <select
                  className={inputClass}
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 text-sm font-medium">Badge (Optional)</label>
                <select
                  className={inputClass}
                  value={newProduct.badge}
                  onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                >
                  <option value="" className="bg-[#0d0d14]">None</option>
                  <option value="Best Seller" className="bg-[#0d0d14]">Best Seller</option>
                  <option value="New" className="bg-[#0d0d14]">New</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 text-sm font-medium">Original MRP Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className={inputClass}
                  placeholder="e.g. 1200"
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 text-sm font-medium">Discounted Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className={inputClass}
                  placeholder="e.g. 900"
                  value={newProduct.discountedPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, discountedPrice: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">Image URL (Optional)</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">Description</label>
                <textarea
                  rows="3"
                  className={inputClass}
                  placeholder="Write a brief description of the firework performance..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
            </div>

            {addProductSuccess && (
              <p className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 py-2.5 rounded-xl font-medium">
                {addProductSuccess}
              </p>
            )}

            {addProductError && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl font-medium">
                {addProductError}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={addProductLoading}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                {addProductLoading ? 'Adding Product...' : 'Publish Product to Store 🚀'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPanel;
