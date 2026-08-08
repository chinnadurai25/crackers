const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// ─── Get All Products (with optional category filter) ────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM products WHERE stock > 0';
    const params = [];
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    query += ' ORDER BY createdAt DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Distinct Categories ─────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category ASC');
    const categories = ['All', ...rows.map(r => r.category)];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Create Order ────────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, mobile, whatsapp, address, landmark, city, pincode, items, totalAmount } = req.body;

    if (!customerName || !mobile || !address || !city || !pincode || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate Order ID: CRK + year + 5-digit random
    const orderId = 'CRK' + new Date().getFullYear() + String(Math.floor(10000 + Math.random() * 90000));

    await pool.query(
      `INSERT INTO orders 
        (id, customerName, mobile, whatsapp, address, landmark, city, pincode, items, totalAmount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Received')`,
      [orderId, customerName, mobile, whatsapp || mobile, address, landmark || '', city, pincode, JSON.stringify(items), totalAmount]
    );

    res.json({ success: true, orderId, message: 'Order placed successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Order by ID ─────────────────────────────────────────────────────────
app.get('/api/orders/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = rows[0];
    order.items = JSON.parse(order.items || '[]');
    res.json(order);
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

// ─── Add Product (Admin) ─────────────────────────────────────────────────────
app.post('/api/admin/products', async (req, res) => {
  try {
    const { name, category, description, originalPrice, discountedPrice, discount, badge, imageUrl, stock } = req.body;
    
    if (!name || !originalPrice || !discountedPrice) {
      return res.status(400).json({ error: 'Name, original price, and discounted price are required' });
    }

    const calcDiscount = discount || Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

    const [result] = await pool.query(
      `INSERT INTO products (name, category, description, originalPrice, discountedPrice, discount, badge, imageUrl, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category || 'General',
        description || '',
        originalPrice,
        discountedPrice,
        calcDiscount,
        badge || null,
        imageUrl || '',
        stock || 100
      ]
    );

    res.json({ success: true, id: result.insertId, message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete Product (Admin) ──────────────────────────────────────────────────
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Orders (Admin) ──────────────────────────────────────────────────
app.get('/api/admin/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');
    const orders = rows.map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Order Status (Admin) ─────────────────────────────────────────────
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Order Received', 'Payment Verified', 'Packing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Init DB & Seed Data ─────────────────────────────────────────────────────
const initDbHandler = async (req, res) => {
  try {
    // Create products table
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
        stock INT DEFAULT 100,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
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

    // Seed products only if table is empty
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (countRows[0].count === 0) {
      const products = [
        ['Peacock Flower Pot', 'Flower Pots', 'Spectacular peacock-tail pattern with golden sparks', 850, 595, 30, 'Best Seller', 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&q=80'],
        ['Royal Sky Shot', 'Sky Shots', 'Multi-colour sky burst with trailing glitter', 1200, 900, 25, 'New', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'],
        ['Golden Chakra Wheel', 'Ground Chakras', 'Spinning golden chakra with 3-minute burn', 600, 480, 20, null, 'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=600&q=80'],
        ['Diamond Sparkler Set', 'Sparklers', 'Premium 12-inch sparklers, pack of 20', 450, 382, 15, null, 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=600&q=80'],
        ['Festival Mega Combo', 'Combo Packs', 'All-in-one festival pack with 50+ items', 2500, 1999, 20, 'Best Seller', 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=600&q=80'],
        ['Thunder Rocket', 'Rockets', 'High-altitude rocket with triple burst finale', 900, 750, 17, 'New', 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&q=80'],
        ['Crystal Fountain', 'Fountains', 'Silver and gold fountain with 90 seconds burn', 450, 350, 22, null, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'],
        ['Classic Crackers Box', 'Crackers', 'Traditional sound crackers, family pack of 100', 399, 299, 25, null, 'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=600&q=80'],
        ['Ground Novelty Set', 'Ground Novelties', 'Fun ground-level show with snakes and worms', 700, 550, 21, null, 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=600&q=80'],
        ['Sky Burst Combo', 'Combo Packs', 'Sky shots and rockets combo for night shows', 3000, 2399, 20, 'Best Seller', 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=600&q=80'],
        ['Star Sparkler Set', 'Sparklers', 'Star-shaped sparklers with colour effects', 350, 280, 20, 'New', 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=600&q=80'],
        ['Mega Fountain', 'Fountains', 'Giant fountain with 2-minute multicolor burst', 800, 650, 19, null, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'],
      ];

      for (const p of products) {
        await pool.query(
          `INSERT INTO products (name, category, description, originalPrice, discountedPrice, discount, badge, imageUrl) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          p
        );
      }
    }

    res.json({ message: 'Database initialized successfully', note: 'Tables created and products seeded.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.get('/api/init-db', initDbHandler);
app.post('/api/init-db', initDbHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CrackerKing server running on port ${PORT}`);
});
