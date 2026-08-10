const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fireworks_db',
    });

    console.log("Checking columns in orders table...");
    const [columns] = await pool.query('SHOW COLUMNS FROM orders');
    console.log(columns);

    console.log("Attempting to add items column...");
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN items JSON');
      console.log("Successfully added items column.");
    } catch (e) {
      console.log("Failed to add items column:", e.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}
run();
