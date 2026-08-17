import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, RefreshCw, Plus, Trash2, Lock, LogOut, ShoppingBag, Layers, Upload, Images, Pencil, X, Eye, Calendar, Clock, CheckCircle2, Printer, Settings, FileText, Users, Truck, CreditCard, Filter } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import BillPreviewModal from '../components/BillPreviewModal';

const STATUSES = ['Order Received', 'Payment Verified', 'Packing', 'Shipped', 'Delivered'];

const STATUS_COLORS = {
  'Order Received': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Payment Verified': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Packing': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Shipped': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Delivered': 'bg-festival-gold/20 text-festival-gold border-festival-gold/30',
};

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-festival-gold transition-colors";

const formatStatusDate = (dateStr) => {
  if (!dateStr) return 'Pending';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
};

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('crackerking_admin_token');
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin view tabs: 'orders' | 'products' | 'categories' | 'add-product'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showOrderStats, setShowOrderStats] = useState(false);
  const [selectedStatusOrder, setSelectedStatusOrder] = useState(null);
  const [selectedBillOrder, setSelectedBillOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [shippingModal, setShippingModal] = useState({ open: false, orderId: null, transportName: '', llrNo: '', contactNumber: '' });

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);

  // Add product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Flower Pots',
    customCategory: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    badge: '',
    stock: '100'
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [addProductSuccess, setAddProductSuccess] = useState('');
  const [addProductError, setAddProductError] = useState('');
  const [addProductLoading, setAddProductLoading] = useState(false);

  // Settings state
  const [deliveryFee, setDeliveryFee] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
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
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`);
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
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
    setProductsLoading(false);
  };

  // Fetch Categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
    setCategoriesLoading(false);
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
        setDeliveryFee(data.settings.deliveryFee || '0');
      }
    } catch { }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchProducts();
      fetchCategories();
      fetchSettings();
    }
  }, [isAuthenticated]);

  // Update Status
  const updateStatus = async (orderId, status, transportDetails = null) => {
    setUpdatingStatus(orderId);
    try {
      const body = { status };
      if (transportDetails) body.transportDetails = transportDetails;
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updatedHistory = data.statusHistory || o.statusHistory || [];
          return { ...o, status, statusHistory: updatedHistory, transportDetails: data.transportDetails || o.transportDetails };
        }
        return o;
      }));
      if (selectedStatusOrder && selectedStatusOrder.id === orderId) {
        setSelectedStatusOrder(prev => ({
          ...prev,
          status,
          statusHistory: data.statusHistory || prev.statusHistory
        }));
      }
    } catch { }
    setUpdatingStatus(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}? This cannot be undone.`)) return;
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    } catch { }
    setUpdatingStatus(null);
  };

  const printAddressSlip = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Slip - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; margin: 0; }
            .slip { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 8px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0 0 5px 0; font-size: 24px; text-transform: uppercase; }
            .content p { margin: 8px 0; font-size: 16px; line-height: 1.5; }
            .label { font-weight: bold; width: 100px; display: inline-block; }
            .items { margin-top: 20px; border-top: 1px dashed #000; padding-top: 15px; }
            .items table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items th { text-align: left; padding: 8px; background-color: #f5f5f5; border-bottom: 2px solid #ddd; }
            .items td { padding: 8px; border-bottom: 1px solid #eee; }
            @media print {
              body { padding: 0; }
              .slip { border: none; max-width: 100%; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="header">
              <h2>MAGICAL CRACKERS</h2>
              <p><strong>Order ID:</strong> ${order.id}</p>
            </div>
            <div class="content">
              <h3>Shipping Address:</h3>
              <p><span class="label">Name:</span> ${order.customerName}</p>
              <p><span class="label">Mobile:</span> ${order.mobile}</p>
              ${order.whatsapp && order.whatsapp !== order.mobile ? `<p><span class="label">WhatsApp:</span> ${order.whatsapp}</p>` : ''}
              <p><span class="label">Address:</span> ${order.address}</p>
              ${order.landmark ? `<p><span class="label">Landmark:</span> ${order.landmark}</p>` : ''}
              <p><span class="label">City:</span> ${order.city} - ${order.pincode}</p>
            </div>
            <div class="items">
              <h3>Order Details:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center; width: 80px;">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <h3 style="text-align: right; margin-top: 15px;">Total: ₹${Number(order.totalAmount).toLocaleString()}</h3>
            </div>
          </div>
          <script>
            window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 250); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Category CRUD Handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategoryActionLoading(true);
    setCategoryError('');
    setCategorySuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategorySuccess(`Category "${newCategoryName}" added successfully! 🎉`);
        setNewCategoryName('');
        fetchCategories();
      } else {
        setCategoryError(data.error || 'Failed to add category');
      }
    } catch {
      setCategoryError('Could not connect to server.');
    }
    setCategoryActionLoading(false);
  };

  const handleUpdateCategory = async (id, newName) => {
    if (!newName.trim()) return;
    setCategoryActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) {
        setEditingCategory(null);
        fetchCategories();
        fetchProducts();
      }
    } catch { }
    setCategoryActionLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in it will become Uncategorized.')) return;
    setCategoryActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
        fetchProducts();
      }
    } catch { }
    setCategoryActionLoading(false);
  };

  // Handle File Selection with instant thumbnail previews for Add Product
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddProductLoading(true);
    setAddProductError('');
    setAddProductSuccess('');

    const targetCategory = newProduct.category === '__NEW__'
      ? newProduct.customCategory.trim()
      : newProduct.category.trim();

    if (!newProduct.name || !newProduct.discountedPrice) {
      setAddProductError('Please fill in Product Name and Selling Price.');
      setAddProductLoading(false);
      return;
    }

    if (!targetCategory) {
      setAddProductError('Please select or specify a category.');
      setAddProductLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', targetCategory);
      formData.append('description', newProduct.description || '');
      formData.append('discountedPrice', Number(newProduct.discountedPrice));
      if (newProduct.originalPrice) {
        formData.append('originalPrice', Number(newProduct.originalPrice));
      }
      formData.append('badge', newProduct.badge || '');
      formData.append('stock', Number(newProduct.stock || 100));

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append('productImages', file));
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setAddProductSuccess(`Product "${newProduct.name}" added successfully! 🎉`);
        setNewProduct({
          name: '',
          category: categories.length > 0 ? categories[0].name : 'Flower Pots',
          customCategory: '',
          description: '',
          originalPrice: '',
          discountedPrice: '',
          badge: '',
          stock: '100'
        });
        setImageFiles([]);
        setImagePreviews([]);
        const fileInput = document.getElementById('productImagesInput');
        if (fileInput) fileInput.value = '';
        fetchProducts();
        fetchCategories();
      } else {
        setAddProductError(data.error || 'Failed to add product');
      }
    } catch {
      setAddProductError('Could not connect to server.');
    }
    setAddProductLoading(false);
  };

  // Open Edit Product Modal
  const openEditModal = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category || 'General',
      description: product.description || '',
      discountedPrice: product.discountedPrice || '',
      originalPrice: (product.originalPrice && Number(product.originalPrice) > Number(product.discountedPrice)) ? product.originalPrice : '',
      badge: product.badge || '',
      stock: product.stock || 100,
      existingImages: product.images || (product.imageUrl ? [product.imageUrl] : [])
    });
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditError('');
  };

  // Handle Edit Submit
  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);
    setEditError('');

    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('category', editingProduct.category);
      formData.append('description', editingProduct.description);
      formData.append('discountedPrice', Number(editingProduct.discountedPrice));
      if (editingProduct.originalPrice) {
        formData.append('originalPrice', Number(editingProduct.originalPrice));
      }
      formData.append('badge', editingProduct.badge || '');
      formData.append('stock', Number(editingProduct.stock || 100));
      formData.append('existingImages', JSON.stringify(editingProduct.existingImages || []));

      if (editImageFiles && editImageFiles.length > 0) {
        editImageFiles.forEach(file => formData.append('productImages', file));
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setEditingProduct(null);
        fetchProducts();
        fetchCategories();
      } else {
        setEditError(data.error || 'Failed to update product');
      }
    } catch {
      setEditError('Could not connect to server.');
    }
    setEditLoading(false);
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingProductId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch { }
    setDeletingProductId(null);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { deliveryFee } })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess('Settings updated successfully!');
      } else {
        setSettingsError(data.error || 'Failed to update settings');
      }
    } catch {
      setSettingsError('Could not connect to server.');
    }
    setSettingsLoading(false);
  };

  const totalRevenue = orders.filter(o => o.status !== 'Order Received').reduce((s, o) => s + Number(o.totalAmount), 0);

  // Status & Customer Breakdown Stats
  const orderReceivedCount = orders.filter(o => o.status === 'Order Received').length;
  const paymentVerifiedCount = orders.filter(o => o.status === 'Payment Verified').length;
  const packingCount = orders.filter(o => o.status === 'Packing').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const uniqueCustomersCount = new Set(orders.map(o => (o.mobile || o.customerName || '').trim().toLowerCase()).filter(Boolean)).size;

  const filteredOrders = orderStatusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === orderStatusFilter);

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
          <p className="text-gray-400 text-sm mt-0.5">Manage inventory, categories, products, and customer orders</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchOrders(); fetchProducts(); fetchCategories(); }}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div
          onClick={() => setShowOrderStats(true)}
          className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-festival-gold/30"
          title="Click to view order status breakdown"
        >
          <span className="text-3xl">📦</span>
          <div>
            <p className="text-gray-400 text-xs group-hover:text-gray-300 font-medium">Total Orders</p>
            <p className="text-white font-bold text-2xl">{orders.length}</p>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('orders'); setOrderStatusFilter('Shipped'); }}
          className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-purple-500/30"
          title="Click to view shipped orders"
        >
          <span className="text-3xl">🚚</span>
          <div>
            <p className="text-gray-400 text-xs font-medium">Shipped</p>
            <p className="text-purple-400 font-bold text-2xl">{shippedCount}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <span className="text-3xl">👥</span>
          <div>
            <p className="text-gray-400 text-xs font-medium">Total Customers</p>
            <p className="text-festival-gold font-bold text-2xl">{uniqueCustomersCount}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <span className="text-3xl">🎆</span>
          <div>
            <p className="text-gray-400 text-xs font-medium">Live Products</p>
            <p className="text-white font-bold text-2xl">{products.length}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <span className="text-3xl">💰</span>
          <div>
            <p className="text-gray-400 text-xs font-medium">Verified Revenue</p>
            <p className="text-emerald-400 font-bold text-2xl">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-white/10 mb-8 pb-3 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'orders'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Package size={16} /> Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'products'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <ShoppingBag size={16} /> All Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'categories'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Layers size={16} /> Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('add-product')}
          className={`flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'add-product'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Plus size={16} /> Add Product
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'settings'
              ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Settings size={16} /> Settings
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Status & Customer Summary Filter Bar */}
          <div className="glass-card p-4 border-white/10 mb-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-festival-gold" />
                <h3 className="text-white font-bold text-sm">Filter Orders by Status</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Users size={14} className="text-festival-gold" />
                <span>Total Customers: <strong className="text-white font-bold">{uniqueCustomersCount}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                id="filter-all-orders"
                onClick={() => setOrderStatusFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${orderStatusFilter === 'ALL'
                    ? 'bg-festival-gold text-black shadow-md font-bold'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
              >
                <span>All Orders</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${orderStatusFilter === 'ALL' ? 'bg-black/20 text-black' : 'bg-white/10 text-white'}`}>
                  {orders.length}
                </span>
              </button>

              <button
                id="filter-order-received"
                onClick={() => setOrderStatusFilter('Order Received')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${orderStatusFilter === 'Order Received'
                    ? 'bg-blue-500 text-white shadow-md font-bold'
                    : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30'
                  }`}
              >
                <span>📥 Order Received</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/30 text-white">
                  {orderReceivedCount}
                </span>
              </button>

              <button
                id="filter-payment-verified"
                onClick={() => setOrderStatusFilter('Payment Verified')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${orderStatusFilter === 'Payment Verified'
                    ? 'bg-green-500 text-black shadow-md font-bold'
                    : 'bg-green-500/10 text-green-300 hover:bg-green-500/20 border border-green-500/30'
                  }`}
              >
                <span>💳 Payment Verified</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-green-500/30 text-white">
                  {paymentVerifiedCount}
                </span>
              </button>

              <button
                id="filter-packing"
                onClick={() => setOrderStatusFilter('Packing')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${orderStatusFilter === 'Packing'
                    ? 'bg-yellow-500 text-black shadow-md font-bold'
                    : 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 border border-yellow-500/30'
                  }`}
              >
                <span>📦 Packing</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-yellow-500/30 text-white">
                  {packingCount}
                </span>
              </button>

              <button
                id="filter-shipped"
                onClick={() => setOrderStatusFilter('Shipped')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${orderStatusFilter === 'Shipped'
                    ? 'bg-purple-500 text-white shadow-md font-bold'
                    : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                  }`}
              >
                <span>🚚 Shipped</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-500/30 text-white">
                  {shippedCount}
                </span>
              </button>

              <button
                id="filter-delivered"
                onClick={() => setOrderStatusFilter('Delivered')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${orderStatusFilter === 'Delivered'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'bg-festival-gold/10 text-festival-gold hover:bg-festival-gold/20 border border-festival-gold/30'
                  }`}
              >
                <span>✅ Delivered</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/30 text-white">
                  {deliveredCount}
                </span>
              </button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="text-center py-20">
              <p className="text-3xl mb-2">⏳</p>
              <p className="text-gray-400">Loading customer orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <Package size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-semibold mb-1">
                {orderStatusFilter === 'ALL' ? 'No orders placed yet' : `No orders with status "${orderStatusFilter}"`}
              </p>
              <p className="text-gray-600 text-sm">Customer orders will appear here automatically.</p>
            </div>
          ) : (
            filteredOrders.map((order, i) => (
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
                    <p className="text-gray-400 text-sm">
                      {order.mobile} {order.whatsapp && order.whatsapp !== order.mobile ? `(WhatsApp: ${order.whatsapp})` : ''} • {order.city}, {order.pincode}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{order.address}</p>
                    {order.landmark && <p className="text-gray-500 text-xs mt-0.5">Landmark: {order.landmark}</p>}

                    {order.transportDetails && (
                      <div className="mt-3 bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-lg">
                        <p className="text-purple-300 text-xs font-bold mb-1 uppercase tracking-wider">Shipping Details</p>
                        <p className="text-gray-300 text-xs"><span className="text-gray-500">Transport:</span> {order.transportDetails.transportName}</p>
                        <p className="text-gray-300 text-xs"><span className="text-gray-500">LLR No:</span> {order.transportDetails.llrNo}</p>
                        <p className="text-gray-300 text-xs"><span className="text-gray-500">Contact:</span> {order.transportDetails.contactNumber}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <p className="text-gray-400 text-xs mb-1 font-medium">Items Ordered</p>
                    {(order.items || []).map((item, j) => (
                      <p key={j} className="text-gray-300 text-sm">
                        {item.name} <span className="text-gray-500">×{item.quantity}</span>
                      </p>
                    ))}
                  </div>

                  <div className="text-right flex flex-col items-end gap-2.5">
                    <div>
                      <p className="text-gray-500 text-xs">Total Amount</p>
                      <p className="text-festival-gold font-bold text-xl">₹{Number(order.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap justify-end items-center gap-2">
                      {order.paymentProofUrl && (
                        <a
                          href={order.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-festival-gold hover:text-white text-xs font-semibold px-3 py-1.5 border border-festival-gold/30 bg-festival-gold/10 hover:bg-festival-gold/20 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          title="View Payment Proof"
                        >
                          <Images size={14} /> View Proof
                        </a>
                      )}
                      <button
                        id={`view-bill-${order.id}`}
                        onClick={() => setSelectedBillOrder(order)}
                        className="text-amber-400 hover:text-amber-300 text-xs font-semibold px-3 py-1.5 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        title="View Bill / Invoice PDF"
                      >
                        <FileText size={14} /> View Bill
                      </button>
                      <button
                        onClick={() => printAddressSlip(order)}
                        className="text-green-400 hover:text-green-300 text-xs font-semibold px-3 py-1.5 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        title="Print Courier Slip"
                      >
                        <Printer size={14} /> Print Slip
                      </button>
                      <button
                        id={`view-dates-${order.id}`}
                        onClick={() => setSelectedStatusOrder(order)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-semibold px-3 py-1.5 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        title="View status dates timeline"
                      >
                        <Eye size={14} /> View Status Dates
                      </button>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === 'Shipped') {
                            setShippingModal({ open: true, orderId: order.id, transportName: '', llrNo: '', contactNumber: '' });
                          } else {
                            updateStatus(order.id, newStatus);
                          }
                        }}
                        disabled={updatingStatus === order.id}
                        className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-festival-gold cursor-pointer"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>
                        ))}
                      </select>
                    </div>
                    {order.status === 'Delivered' && (
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={updatingStatus === order.id}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold px-3 py-1.5 border border-red-500/30 bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete Order
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Products List (with Edit & Delete buttons) */}
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
                  <div className="w-20 h-20 bg-black/50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🎆</span>
                    )}
                    {p.images && p.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-festival-gold text-[10px] px-1.5 py-0.5 rounded font-bold">
                        +{p.images.length - 1} photos
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-festival-gold text-[10px] font-bold tracking-widest uppercase block">{p.category}</span>
                    <h4 className="text-white font-bold text-sm truncate">{p.name}</h4>
                    <p className="text-gray-400 text-xs line-clamp-1 mb-1">{p.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-festival-gold font-bold">₹{p.discountedPrice}</span>
                      {p.originalPrice && Number(p.originalPrice) > Number(p.discountedPrice) && (
                        <>
                          <span className="text-gray-500 line-through text-xs">₹{p.originalPrice}</span>
                          <span className="text-festival-crimson text-xs font-bold">-{p.discount}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 text-gray-400 hover:text-festival-gold hover:bg-white/5 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      disabled={deletingProductId === p.id}
                      className="p-2 text-gray-500 hover:text-festival-crimson hover:bg-white/5 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                required
                className={inputClass}
                placeholder="Enter new category name (e.g. Premium Sky Shots)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button
                type="submit"
                disabled={categoryActionLoading}
                className="btn-primary shrink-0 px-6"
              >
                {categoryActionLoading ? 'Adding...' : 'Add Category'}
              </button>
            </form>
            {categorySuccess && (
              <p className="text-green-400 text-sm mt-3 font-medium bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                {categorySuccess}
              </p>
            )}
            {categoryError && (
              <p className="text-red-400 text-sm mt-3 font-medium bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                {categoryError}
              </p>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Manage Existing Categories</h3>
            {categoriesLoading ? (
              <p className="text-gray-400">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-400">No categories found in database.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
                    {editingCategory?.id === c.id ? (
                      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:mr-4">
                        <input
                          type="text"
                          autoFocus
                          className={inputClass}
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateCategory(c.id, editingCategory.name)}
                            disabled={categoryActionLoading}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-white font-medium break-words pr-0 sm:pr-4">{c.name}</span>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => setEditingCategory({ id: c.id, name: c.name })}
                            className="flex-1 sm:flex-none px-4 py-1.5 text-gray-400 hover:text-festival-gold hover:bg-white/5 rounded-lg transition-colors text-sm font-semibold border border-transparent hover:border-festival-gold/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            disabled={categoryActionLoading}
                            className="p-2 text-gray-400 hover:text-festival-crimson hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Add New Product Form */}
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

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-gray-300 text-sm font-medium">Category *</label>
                <select
                  className={inputClass}
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c.id || c.name} value={c.name} className="bg-[#0d0d14]">{c.name}</option>
                  ))}
                  <option value="__NEW__" className="bg-[#0d0d14] text-festival-gold font-bold">+ Create Custom Category...</option>
                </select>
              </div>

              {newProduct.category === '__NEW__' ? (
                <div className="space-y-1.5">
                  <label className="text-gray-300 text-sm font-medium">New Category Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="e.g. Special Sky Shots"
                    value={newProduct.customCategory}
                    onChange={(e) => setNewProduct({ ...newProduct, customCategory: e.target.value })}
                  />
                </div>
              ) : (
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
              )}

              {newProduct.category === '__NEW__' && (
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
              )}

              <div className="space-y-1.5">
                <label className="text-gray-300 text-sm font-medium">Selling Price (₹) *</label>
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

              <div className="space-y-1.5">
                <label className="text-gray-300 text-sm font-medium">Original MRP Price (₹) <span className="text-gray-500 text-xs font-normal">(Optional)</span></label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  placeholder="e.g. 1200 (Leave empty if no discount)"
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                />
              </div>

              {/* Direct Multiple File Selection */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium block">
                  Select Product Images (Select One or Multiple Photos)
                </label>

                <div className="border-2 border-dashed border-white/20 hover:border-festival-gold/50 rounded-2xl p-6 text-center transition-all bg-white/5 group relative cursor-pointer">
                  <input
                    type="file"
                    id="productImagesInput"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 bg-festival-gold/20 text-festival-gold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {imageFiles.length > 0 ? `${imageFiles.length} Image(s) Selected` : 'Click or Drag to Select Product Photos'}
                    </p>
                    <p className="text-gray-500 text-xs">You can select multiple photo files from your computer or phone at once.</p>
                  </div>
                </div>

                {/* Instant Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-xs mb-2 font-medium">Selected Photos Preview ({imagePreviews.length}):</p>
                    <div className="flex flex-wrap gap-3">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="w-20 h-20 bg-black/60 rounded-xl overflow-hidden border border-white/20 relative group">
                          <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = imageFiles.filter((_, i) => i !== idx);
                              const newPreviews = imagePreviews.filter((_, i) => i !== idx);
                              setImageFiles(newFiles);
                              setImagePreviews(newPreviews);
                            }}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 text-xs transition-colors shadow"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">Description (Optional)</label>
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
                {addProductLoading ? 'Publishing Product...' : 'Publish Product to Store 🚀'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 md:p-8 w-full max-w-2xl bg-[#0d0d14] border-white/20 shadow-2xl relative my-8"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Pencil className="text-festival-gold" size={22} /> Edit Product
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditProductSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-gray-300 text-sm font-medium">Product Name *</label>
                    <input
                      type="text"
                      required
                      className={inputClass}
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 text-sm font-medium">Category *</label>
                    <select
                      className={inputClass}
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    >
                      {categories.map(c => (
                        <option key={c.id || c.name} value={c.name} className="bg-[#0d0d14]">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 text-sm font-medium">Badge (Optional)</label>
                    <select
                      className={inputClass}
                      value={editingProduct.badge || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    >
                      <option value="" className="bg-[#0d0d14]">None</option>
                      <option value="Best Seller" className="bg-[#0d0d14]">Best Seller</option>
                      <option value="New" className="bg-[#0d0d14]">New</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 text-sm font-medium">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className={inputClass}
                      value={editingProduct.discountedPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discountedPrice: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 text-sm font-medium">Original MRP Price (₹) <span className="text-gray-500 text-xs font-normal">(Optional)</span></label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      placeholder="Leave empty if no discount"
                      value={editingProduct.originalPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                    />
                  </div>

                  {/* Existing Photos */}
                  {editingProduct.existingImages && editingProduct.existingImages.length > 0 && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-gray-300 text-sm font-medium block">Current Product Photos:</label>
                      <div className="flex flex-wrap gap-3">
                        {editingProduct.existingImages.map((src, idx) => (
                          <div key={idx} className="w-20 h-20 bg-black/60 rounded-xl overflow-hidden border border-white/20 relative">
                            <img src={src} alt={`existing-${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const newExist = editingProduct.existingImages.filter((_, i) => i !== idx);
                                setEditingProduct({ ...editingProduct, existingImages: newExist });
                              }}
                              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 text-xs transition-colors"
                              title="Delete photo"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Photos input for edit */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-gray-300 text-sm font-medium block">Add Additional Photos (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className={inputClass}
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setEditImageFiles(files);
                        setEditImagePreviews(files.map(f => URL.createObjectURL(f)));
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-gray-300 text-sm font-medium">Description (Optional)</label>
                    <textarea
                      rows="3"
                      className={inputClass}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                  </div>
                </div>

                {editError && (
                  <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 py-2 rounded-xl">
                    {editError}
                  </p>
                )}

                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-3 border border-white/20 rounded-xl text-gray-300 hover:text-white hover:border-white/50 transition-all font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    {editLoading ? 'Saving Changes...' : 'Save Product Changes 💾'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Stats Modal */}
      <AnimatePresence>
        {showOrderStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-6 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowOrderStats(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Package size={24} className="text-festival-gold" />
                Order Breakdown
              </h3>

              <div className="space-y-3">
                {STATUSES.map(status => {
                  const count = orders.filter(o => o.status === status).length;
                  return (
                    <div key={status} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className={`text-sm font-semibold px-2 py-1 rounded-md border ${STATUS_COLORS[status] || 'bg-white/10 text-white'}`}>
                        {status}
                      </span>
                      <span className="text-white font-bold text-lg">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Orders</span>
                <span className="text-festival-gold font-bold text-xl">{orders.length}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATUS DATES TIMELINE MODAL */}
      <AnimatePresence>
        {selectedStatusOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 md:p-8 w-full max-w-lg bg-[#0d0d14] border-white/20 shadow-2xl relative my-8"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="text-festival-gold" size={20} /> Order Status Timeline
                  </h3>
                  <p className="text-xs text-festival-gold font-mono font-semibold mt-1">
                    Order ID: {selectedStatusOrder.id} • {selectedStatusOrder.customerName}
                  </p>
                </div>
                <button
                  id="close-status-timeline-btn"
                  onClick={() => setSelectedStatusOrder(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 relative">
                <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-white/10" />
                {STATUSES.map((statusName, idx) => {
                  const historyObj = (selectedStatusOrder.statusHistory || []).find(h => h.status === statusName);
                  const isCurrent = selectedStatusOrder.status === statusName;
                  const isCompleted = !!historyObj;

                  return (
                    <div key={statusName} className="flex items-start gap-4 relative z-10 pl-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition-all ${isCurrent
                          ? 'bg-festival-gold text-black border-festival-gold shadow-[0_0_12px_rgba(255,215,0,0.5)] scale-110'
                          : isCompleted
                            ? 'bg-green-500/20 text-green-400 border-green-500/40'
                            : 'bg-white/5 text-gray-500 border-white/10'
                        }`}>
                        {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold text-sm ${isCurrent ? 'text-festival-gold' : isCompleted ? 'text-white' : 'text-gray-500'}`}>
                            {statusName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-festival-gold/20 text-festival-gold border border-festival-gold/30 px-2 py-0.5 rounded-full font-bold uppercase">
                              Current Status
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={13} className={isCompleted ? "text-green-400" : "text-gray-600"} />
                          <span>{isCompleted ? formatStatusDate(historyObj.date) : 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-right">
                <button
                  id="close-timeline-modal-btn"
                  onClick={() => setSelectedStatusOrder(null)}
                  className="btn-primary text-xs px-5 py-2"
                >
                  Close Timeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shipping Details Modal */}
      <AnimatePresence>
        {shippingModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 md:p-8 w-full max-w-md bg-[#0d0d14] border-white/20 shadow-2xl relative"
            >
              <h3 className="text-xl font-bold text-white mb-4">Shipping Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-1.5 block">Transport Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={shippingModal.transportName}
                    onChange={(e) => setShippingModal({ ...shippingModal, transportName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-1.5 block">LLR No *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={shippingModal.llrNo}
                    onChange={(e) => setShippingModal({ ...shippingModal, llrNo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-1.5 block">Contact Number *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={shippingModal.contactNumber}
                    onChange={(e) => setShippingModal({ ...shippingModal, contactNumber: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShippingModal({ open: false, orderId: null, transportName: '', llrNo: '', contactNumber: '' })}
                    className="flex-1 py-2 border border-white/20 rounded-xl text-gray-300 hover:text-white transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!shippingModal.transportName || !shippingModal.llrNo || !shippingModal.contactNumber) {
                        alert('Please fill all transport details');
                        return;
                      }
                      updateStatus(shippingModal.orderId, 'Shipped', {
                        transportName: shippingModal.transportName,
                        llrNo: shippingModal.llrNo,
                        contactNumber: shippingModal.contactNumber
                      });
                      setShippingModal({ open: false, orderId: null, transportName: '', llrNo: '', contactNumber: '' });
                    }}
                    className="flex-1 btn-primary py-2 text-sm"
                  >
                    Save & Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="glass-card p-8 border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings size={20} className="text-festival-gold" /> Global Settings
            </h3>

            {settingsSuccess && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm">{settingsSuccess}</div>}
            {settingsError && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{settingsError}</div>}

            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Delivery Fee (₹)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className={inputClass}
                    placeholder="Enter delivery amount e.g. 250"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">This fee will be automatically applied to all new orders during checkout.</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Bill Preview Modal for Admin */}
      <BillPreviewModal
        isOpen={!!selectedBillOrder}
        onClose={() => setSelectedBillOrder(null)}
        order={selectedBillOrder}
      />

    </div>
  );
};

export default AdminPanel;
