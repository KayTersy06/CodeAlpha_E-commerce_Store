const db = require('../db');

exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `SELECT product_id, category_id, product_name, description, benefits, price, stock_quantity, image_url, is_active, created_at FROM products`;
    const params = [];

    if (category) {
      query += ' WHERE category_id = $1';
      params.push(category);
    }

    query += ' ORDER BY product_name';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT product_id, category_id, product_name, description, benefits, price, stock_quantity, image_url, is_active, created_at
       FROM products WHERE product_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { category_id, product_name, description, benefits, price, stock_quantity, image_url, is_active } = req.body;
    const result = await db.query(
      `INSERT INTO products (category_id, product_name, description, benefits, price, stock_quantity, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING product_id, category_id, product_name, description, benefits, price, stock_quantity, image_url, is_active, created_at`,
      [category_id || null, product_name, description, benefits, price, stock_quantity || 0, image_url, is_active !== undefined ? is_active : true]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, product_name, description, benefits, price, stock_quantity, image_url, is_active } = req.body;

    const result = await db.query(
      `UPDATE products
       SET category_id = $1,
           product_name = $2,
           description = $3,
           benefits = $4,
           price = $5,
           stock_quantity = $6,
           image_url = $7,
           is_active = $8
       WHERE product_id = $9
       RETURNING product_id, category_id, product_name, description, benefits, price, stock_quantity, image_url, is_active, created_at`,
      [category_id || null, product_name, description, benefits, price, stock_quantity, image_url, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM products WHERE product_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};
