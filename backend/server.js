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
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fireworks_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB Connection
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'success', message: 'Connected to MySQL Database' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// Get Products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database schema (for development)
app.post('/api/init-db', async (req, res) => {
  try {
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        originalPrice DECIMAL(10, 2) NOT NULL,
        discountedPrice DECIMAL(10, 2) NOT NULL,
        discount INT NOT NULL,
        stock INT DEFAULT 100,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(20) PRIMARY KEY,
        customerName VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        whatsapp VARCHAR(20),
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        totalAmount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Payment Pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createProductsTable);
    await pool.query(createOrdersTable);
    
    // Insert some dummy data if products table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      const insertData = `
        INSERT INTO products (name, originalPrice, discountedPrice, discount) VALUES
        ('Premium Sky Lanterns', 1200, 900, 25),
        ('Golden Sparklers (100 pcs)', 800, 650, 18),
        ('Festival Mega Box', 5000, 3999, 20)
      `;
      await pool.query(insertData);
    }

    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
