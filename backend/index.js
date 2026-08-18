const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Multer config for multiple files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Create database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fireworks_db',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to ensure database tables exist
const ensureTablesExist = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Uncategorized',
        description TEXT,
        originalPrice DECIMAL(10, 2) NOT NULL,
        discountedPrice DECIMAL(10, 2) NOT NULL,
        discount INT NOT NULL,
        badge VARCHAR(50) DEFAULT NULL,
        imageUrl TEXT,
        images JSON,
        stock INT DEFAULT 100,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(20) PRIMARY KEY,
        customerName VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        whatsapp VARCHAR(20),
        address TEXT NOT NULL,
        landmark VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        items JSON,
        totalAmount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Order Received',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
      )
    `);

    await pool.query(`
      INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('deliveryFee', '0')
    `);

    // Ensure images column exists in products table
    try {
      await pool.query('ALTER TABLE products ADD COLUMN images JSON');
    } catch (e) {
      // Column already exists
    }

    // Ensure landmark column exists in orders table
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN landmark VARCHAR(255)');
    } catch (e) {
      // Column already exists
    }

    // Ensure items column exists in orders table
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN items JSON');
    } catch (e) {
      // Column already exists
    }

    // Ensure statusHistory column exists in orders table
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN statusHistory JSON');
    } catch (e) {
      // Column already exists
    }

    // Ensure paymentProofUrl column exists in orders table
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN paymentProofUrl TEXT');
    } catch (e) {
      // Column already exists
    }

    // Ensure transportDetails column exists in orders table
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN transportDetails JSON');
    } catch (e) {
      // Column already exists
    }
  } catch (err) {
    console.error('Table check error:', err.message);
  }
};

ensureTablesExist();

// ─── Settings API ────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    await ensureTablesExist();
    const [rows] = await pool.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/settings', async (req, res) => {
  try {
    await ensureTablesExist();
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }
    
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, String(value), String(value)]
      );
    }
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'success', message: 'Connected to MySQL Database' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// ─── Get All Products (with optional category and search filter) ────────────
app.get('/api/products', async (req, res) => {
  try {
    await ensureTablesExist();
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE stock > 0';
    const params = [];
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }
    query += ' ORDER BY createdAt DESC';
    const [rows] = await pool.query(query, params);
    const products = rows.map(p => {
      let parsedImages = [];
      try {
        parsedImages = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
      } catch {
        parsedImages = p.imageUrl ? [p.imageUrl] : [];
      }
      if (p.imageUrl && !parsedImages.includes(p.imageUrl)) {
        parsedImages.unshift(p.imageUrl);
      }
      return {
        ...p,
        images: parsedImages.length > 0 ? parsedImages : (p.imageUrl ? [p.imageUrl] : [])
      };
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Distinct Categories ─────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    await ensureTablesExist();
    const [rows] = await pool.query('SELECT name FROM categories ORDER BY name ASC');
    let categoryList = rows.map(r => r.name);
    
    // Also include any distinct product categories not yet in categories table
    const [prodCatRows] = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
    prodCatRows.forEach(r => {
      if (r.category && !categoryList.includes(r.category)) {
        categoryList.push(r.category);
      }
    });

    const categories = ['All', ...categoryList];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin Categories ─────────────────────────────────────────────────────────
app.get('/api/admin/categories', async (req, res) => {
  try {
    await ensureTablesExist();
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/categories', async (req, res) => {
  try {
    await ensureTablesExist();
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' });
    
    const catName = name.trim();
    await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [catName]);
    const [rows] = await pool.query('SELECT * FROM categories WHERE name = ?', [catName]);
    res.json({ success: true, category: rows[0], message: 'Category added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    await ensureTablesExist();
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    
    const newName = name.trim();
    const [oldRows] = await pool.query('SELECT name FROM categories WHERE id = ?', [req.params.id]);
    if (oldRows.length === 0) return res.status(404).json({ error: 'Category not found' });
    const oldName = oldRows[0].name;

    await pool.query('UPDATE categories SET name = ? WHERE id = ?', [newName, req.params.id]);
    await pool.query('UPDATE products SET category = ? WHERE category = ?', [newName, oldName]);
    
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    await ensureTablesExist();
    const [oldRows] = await pool.query('SELECT name FROM categories WHERE id = ?', [req.params.id]);
    if (oldRows.length > 0) {
      const oldName = oldRows[0].name;
      await pool.query('UPDATE products SET category = ? WHERE category = ?', ['Uncategorized', oldName]);
    }
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to safely parse order status history
const parseOrderStatusHistory = (order) => {
  let parsedHistory = [];
  if (typeof order.statusHistory === 'string') {
    try { parsedHistory = JSON.parse(order.statusHistory); } catch (e) {}
  } else if (Array.isArray(order.statusHistory)) {
    parsedHistory = order.statusHistory;
  }

  // Ensure parsedHistory is always an array
  if (!Array.isArray(parsedHistory)) parsedHistory = [];

  // Build the fallback "Order Received" date from createdAt
  const orderReceivedDate = order.createdAt
    ? (order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt))
    : new Date().toISOString();

  // Always ensure "Order Received" entry exists with real createdAt date
  const hasOrderReceived = parsedHistory.some(h => h.status === 'Order Received');
  if (!hasOrderReceived) {
    parsedHistory = [{ status: 'Order Received', date: orderReceivedDate }, ...parsedHistory];
  }

  return parsedHistory;
};

// ─── Create Order ────────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    await ensureTablesExist();
    const { customerName, mobile, whatsapp, address, landmark, city, pincode, items, totalAmount } = req.body;

    if (!customerName || !mobile || !address || !city || !pincode || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = 'CRK' + new Date().getFullYear() + String(Math.floor(10000 + Math.random() * 90000));
    const initialHistory = [{ status: 'Order Received', date: new Date().toISOString() }];

    await pool.query(
      `INSERT INTO orders 
        (id, customerName, mobile, whatsapp, address, landmark, city, pincode, items, totalAmount, status, statusHistory) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Received', ?)`,
      [orderId, customerName, mobile, whatsapp || mobile, address, landmark || '', city, pincode, JSON.stringify(items), totalAmount, JSON.stringify(initialHistory)]
    );

    res.json({ success: true, orderId, message: 'Order placed successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Order by ID ─────────────────────────────────────────────────────────
app.get('/api/orders/:id', async (req, res) => {
  try {
    await ensureTablesExist();
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = rows[0];
    let parsedItems = [];
    if (typeof order.items === 'string') {
      try { parsedItems = JSON.parse(order.items); } catch(e) {}
    } else if (order.items) {
      parsedItems = order.items;
    }
    order.items = parsedItems;
    
    let parsedTransport = null;
    if (typeof order.transportDetails === 'string') {
      try { parsedTransport = JSON.parse(order.transportDetails); } catch(e) {}
    } else if (order.transportDetails) {
      parsedTransport = order.transportDetails;
    }
    order.transportDetails = parsedTransport;
    
    order.statusHistory = parseOrderStatusHistory(order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Upload Payment Proof ────────────────────────────────────────────────────
app.post('/api/orders/:id/payment-proof', upload.single('paymentProof'), async (req, res) => {
  try {
    await ensureTablesExist();
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    await pool.query('UPDATE orders SET paymentProofUrl = ? WHERE id = ?', [fileUrl, req.params.id]);
    
    res.json({ success: true, paymentProofUrl: fileUrl, message: 'Payment proof uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin Login ─────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@crackerking.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === adminEmail && password === adminPassword) {
    return res.json({ success: true, token: 'crackerking_admin_token_2026', email });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
});

// ─── Add Product (Admin) with Multiple Images Support ───────────────────────
app.post('/api/admin/products', upload.any(), async (req, res) => {
  try {
    await ensureTablesExist();
    const { name, category, description, originalPrice, discountedPrice, discount, badge, stock, imageUrls } = req.body;
    
    let allImages = [];

    // Process uploaded file images (accepts any field name)
    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      req.files.forEach(file => {
        allImages.push(`${baseUrl}/uploads/${file.filename}`);
      });
    }

    // Process additional image URLs passed as text or array
    if (imageUrls) {
      let urls = [];
      if (typeof imageUrls === 'string') {
        try {
          const parsed = JSON.parse(imageUrls);
          urls = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          urls = imageUrls.split(/[\n,]/).map(u => u.trim()).filter(Boolean);
        }
      } else if (Array.isArray(imageUrls)) {
        urls = imageUrls;
      }
      urls.forEach(u => {
        if (u && u.startsWith('http') && !allImages.includes(u)) allImages.push(u);
      });
    }

    // Fallback single imageUrl field if passed
    if (req.body.imageUrl && !allImages.includes(req.body.imageUrl)) {
      allImages.unshift(req.body.imageUrl);
    }
    
    if (!name || !discountedPrice) {
      return res.status(400).json({ error: 'Product name and selling price are required' });
    }

    const sellingPrice = Number(discountedPrice);
    const mrpPrice = originalPrice ? Number(originalPrice) : sellingPrice;

    let calcDiscount = 0;
    if (discount !== undefined && discount !== null && discount !== '') {
      calcDiscount = Number(discount);
    } else if (mrpPrice > sellingPrice) {
      calcDiscount = Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100);
    }

    const mainCategory = (category || 'General').trim();
    if (mainCategory) {
      await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [mainCategory]);
    }

    const mainImageUrl = allImages.length > 0 ? allImages[0] : '';

    const [result] = await pool.query(
      `INSERT INTO products (name, category, description, originalPrice, discountedPrice, discount, badge, imageUrl, images, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        mainCategory,
        description || '',
        mrpPrice,
        sellingPrice,
        calcDiscount,
        badge || null,
        mainImageUrl,
        JSON.stringify(allImages),
        stock || 100
      ]
    );

    res.json({ success: true, id: result.insertId, message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Edit Product (Admin) ───────────────────────────────────────────────────
app.put('/api/admin/products/:id', upload.any(), async (req, res) => {
  try {
    await ensureTablesExist();
    const productId = req.params.id;
    const { name, category, description, originalPrice, discountedPrice, discount, badge, stock, existingImages } = req.body;

    // Check if product exists
    const [existingRows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const oldProduct = existingRows[0];

    let allImages = [];

    // Keep existing images if provided or from old product
    if (existingImages) {
      try {
        allImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch {
        allImages = existingImages.split(/[\n,]/).map(u => u.trim()).filter(Boolean);
      }
    } else if (oldProduct.images) {
      try {
        allImages = typeof oldProduct.images === 'string' ? JSON.parse(oldProduct.images) : oldProduct.images;
      } catch {
        allImages = oldProduct.imageUrl ? [oldProduct.imageUrl] : [];
      }
    } else if (oldProduct.imageUrl) {
      allImages = [oldProduct.imageUrl];
    }

    // Append newly uploaded image files
    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      req.files.forEach(file => {
        allImages.push(`${baseUrl}/uploads/${file.filename}`);
      });
    }

    const updatedName = name ? name.trim() : oldProduct.name;
    const sellingPrice = discountedPrice ? Number(discountedPrice) : Number(oldProduct.discountedPrice);
    const mrpPrice = originalPrice !== undefined && originalPrice !== '' ? Number(originalPrice) : sellingPrice;

    let calcDiscount = 0;
    if (discount !== undefined && discount !== null && discount !== '') {
      calcDiscount = Number(discount);
    } else if (mrpPrice > sellingPrice) {
      calcDiscount = Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100);
    }

    const mainCategory = (category || oldProduct.category || 'General').trim();
    if (mainCategory) {
      await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [mainCategory]);
    }

    const mainImageUrl = allImages.length > 0 ? allImages[0] : '';

    await pool.query(
      `UPDATE products SET 
        name = ?, category = ?, description = ?, originalPrice = ?, 
        discountedPrice = ?, discount = ?, badge = ?, imageUrl = ?, images = ?, stock = ?
       WHERE id = ?`,
      [
        updatedName,
        mainCategory,
        description !== undefined ? description : oldProduct.description,
        mrpPrice,
        sellingPrice,
        calcDiscount,
        badge !== undefined ? (badge || null) : oldProduct.badge,
        mainImageUrl,
        JSON.stringify(allImages),
        stock ? Number(stock) : oldProduct.stock,
        productId
      ]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete Product (Admin) ──────────────────────────────────────────────────
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await ensureTablesExist();
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Orders (Admin) ──────────────────────────────────────────────────
app.get('/api/admin/orders', async (req, res) => {
  try {
    await ensureTablesExist();
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');
    const orders = rows.map(o => {
      let parsedItems = [];
      if (typeof o.items === 'string') {
        try { parsedItems = JSON.parse(o.items); } catch(e) {}
      } else if (o.items) {
        parsedItems = o.items;
      }
      
      let parsedTransport = null;
      if (typeof o.transportDetails === 'string') {
        try { parsedTransport = JSON.parse(o.transportDetails); } catch(e) {}
      } else if (o.transportDetails) {
        parsedTransport = o.transportDetails;
      }

      return { 
        ...o, 
        items: parsedItems,
        statusHistory: parseOrderStatusHistory(o),
        transportDetails: parsedTransport
      };
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Order Status (Admin) ─────────────────────────────────────────────
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  try {
    await ensureTablesExist();
    const { status, transportDetails } = req.body;
    const validStatuses = ['Order Received', 'Payment Verified', 'Packing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = rows[0];
    let history = parseOrderStatusHistory(order);

    const existingIndex = history.findIndex(h => h.status === status);
    const nowIso = new Date().toISOString();
    if (existingIndex >= 0) {
      history[existingIndex].date = nowIso;
    } else {
      history.push({ status, date: nowIso });
    }

    if (transportDetails) {
      await pool.query('UPDATE orders SET status = ?, statusHistory = ?, transportDetails = ? WHERE id = ?', [status, JSON.stringify(history), JSON.stringify(transportDetails), req.params.id]);
    } else {
      await pool.query('UPDATE orders SET status = ?, statusHistory = ? WHERE id = ?', [status, JSON.stringify(history), req.params.id]);
    }

    res.json({ success: true, message: 'Order status updated', statusHistory: history, transportDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete Order (Admin) ────────────────────────────────────────────────────
app.delete('/api/admin/orders/:id', async (req, res) => {
  try {
    await ensureTablesExist();
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Init DB ─────────────────────────────────────────────────────────────────
const initDbHandler = async (req, res) => {
  try {
    await ensureTablesExist();
    res.json({ message: 'Database initialized successfully', note: 'Tables ready for admin entries.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.get('/api/init-db', initDbHandler);
app.post('/api/init-db', initDbHandler);

// ─── Serve React Frontend ─────────────────────────────────────────────────────
// Serve static files from the React dist folder (for production on GoDaddy)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // For any non-API route, return React's index.html (React Router handles it)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CrackerKing server running on port ${PORT}`);
});

process.on('uncaughtException', err => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err));
