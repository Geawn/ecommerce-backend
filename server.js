const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { startEmailConsumer } = require('./kafka');

const app = express();
app.use(cors());
app.use(express.json());
const { sendOrderConfirmationEmail } = require('./mailer'); // Import hàm gửi email
require('dotenv').config(); // Đảm bảo load biến môi trường từ .env
// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'geekup',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// API Endpoints

// i) Get all product categories
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM category');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ii) Get products by category
app.get('/api/categories/:categoryId/products', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM product WHERE categoryid = $1',
      [categoryId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// iii) Search products with filters
app.get('/api/products/search', async (req, res) => {
  const { keyword, minPrice, maxPrice, color, size } = req.query;
  
  let query = 'SELECT * FROM product WHERE 1=1';
  const params = [];
  let paramCount = 1;

  if (keyword) {
    query += ` AND name ILIKE $${paramCount}`;
    params.push(`%${keyword}%`);
    paramCount++;
  }

  if (minPrice) {
    query += ` AND price >= $${paramCount}`;
    params.push(minPrice);
    paramCount++;
  }

  if (maxPrice) {
    query += ` AND price <= $${paramCount}`;
    params.push(maxPrice);
    paramCount++;
  }

  if (color) {
    query += ` AND color ILIKE $${paramCount}`;
    params.push(`%${color}%`);
    paramCount++;
  }

  if (size) {
    query += ` AND size ILIKE $${paramCount}`;
    params.push(`%${size}%`);
  }

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Create new user
app.post('/api/users', async (req, res) => {
    const { name, email, phone, province, district, comune, address, housing_type } = req.body;
    
    try {
      const { rows } = await pool.query(
        `INSERT INTO "user" (name, email, phone, province, district, comune, address, housing_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING userid`,
        [name, email, phone, province, district, comune, address, housing_type]
      );
      
      res.status(201).json({
        message: "User created successfully",
        userId: rows[0].userid
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Create new product
  app.post('/api/products', async (req, res) => {
    const { name, price, size, quantity, color, categoryid } = req.body;
    
    try {
      const { rows } = await pool.query(
        `INSERT INTO product (name, price, size, quantity, color, categoryid)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING productid`,
        [name, price, size, quantity, color, categoryid]
      );
      
      res.status(201).json({
        message: "Product created successfully",
        productId: rows[0].productid
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


  const { sendEmailMessage } = require('./kafka');

  app.post('/api/orders', async (req, res) => {
    const { userId, items, paymentOnline } = req.body;
  
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Calculate total price
      let totalPrice = 0;
      for (const item of items) {
        const productQuery = await client.query(
          'SELECT price FROM product WHERE productid = $1',
          [item.productId]
        );
        if (productQuery.rows.length === 0) {
          throw new Error(`Product ${item.productId} not found`);
        }
        totalPrice += productQuery.rows[0].price * item.quantity;
      }
  
      // Create order
      const orderQuery = await client.query(
        'INSERT INTO "order" (userid, orderdate, totalprice, payment_online) VALUES ($1, CURRENT_DATE, $2, $3) RETURNING orderid',
        [userId, totalPrice, paymentOnline || false]
      );
      const orderId = orderQuery.rows[0].orderid;
  
      // Add order items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_item (orderid, productid, quantity, unitprice) VALUES ($1, $2, $3, (SELECT price FROM product WHERE productid = $2))',
          [orderId, item.productId, item.quantity]
        );
  
        // Update product quantity
        await client.query(
          'UPDATE product SET quantity = quantity - $1 WHERE productid = $2',
          [item.quantity, item.productId]
        );
      }
  
      // Add shipping fee
      await client.query(
        'INSERT INTO order_fee (orderid, feeid, amount) VALUES ($1, 1, 20.00)',
        [orderId]
      );
  
      // Lấy email người dùng từ bảng User
      const userQuery = await client.query(
        'SELECT email FROM "user" WHERE userid = $1',
        [userId]
      );
      if (userQuery.rows.length === 0) {
        throw new Error('User not found');
      }
      const userEmail = userQuery.rows[0].email;
  
      await client.query('COMMIT');
  
      // Gửi thông điệp đến Kafka (bất đồng bộ)
      sendEmailMessage({
        userEmail,
        orderId,
        totalPrice,
        items,
      }).catch((error) => {
        console.error('Failed to send email message to Kafka:', error);
      });
  
      // Trả về phản hồi ngay lập tức
      res.status(201).json({
        message: 'Order created successfully',
        orderId,
        totalPrice,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: err.message });
    } finally {
      client.release();
    }
  });
startEmailConsumer().catch(console.error);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});