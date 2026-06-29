const db = require('../db');

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      `SELECT ci.cart_item_id, ci.cart_id, ci.product_id, ci.quantity,
              p.product_name, p.price, p.image_url
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.cart_id
       JOIN products p ON ci.product_id = p.product_id
       WHERE c.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { product_id, quantity } = req.body;

    const cartResult = await db.query(
      'SELECT cart_id FROM carts WHERE user_id = $1',
      [userId]
    );

    let cartId;

    if (cartResult.rows.length === 0) {
      const newCart = await db.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id',
        [userId]
      );
      cartId = newCart.rows[0].cart_id;
    } else {
      cartId = cartResult.rows[0].cart_id;
    }

    const existingItem = await db.query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );

    if (existingItem.rows.length > 0) {
      const updated = await db.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_item_id = $2 RETURNING *',
        [quantity, existingItem.rows[0].cart_item_id]
      );
      return res.json({ message: 'Cart item updated', item: updated.rows[0] });
    }

    const addedItem = await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [cartId, product_id, quantity || 1]
    );

    res.status(201).json({ message: 'Item added to cart', item: addedItem.rows[0] });
  } catch (error) {
    console.error('Error adding cart item:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const result = await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated', item: result.rows[0] });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM cart_items WHERE cart_item_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: error.message });
  }
};
