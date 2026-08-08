const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fireworks_db',
    });

    await conn.query('DROP TABLE IF EXISTS products');
    await conn.query(`
      CREATE TABLE products (
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
      ['Mega Fountain', 'Fountains', 'Giant fountain with 2-minute multicolor burst', 800, 650, 19, null, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80']
    ];

    for (const p of products) {
      await conn.query(
        'INSERT INTO products (name, category, description, originalPrice, discountedPrice, discount, badge, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        p
      );
    }

    console.log(`Successfully seeded ${products.length} products into DB!`);
    await conn.end();
  } catch (err) {
    console.error('Seed error:', err);
  }
})();
