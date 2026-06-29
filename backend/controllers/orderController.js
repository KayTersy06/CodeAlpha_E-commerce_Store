const db = require('../db');

exports.getOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.order_id, o.user_id, u.full_name, o.total_amount, o.order_status, o.payment_status, o.delivery_address, o.order_date
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       ORDER BY o.order_date DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await db.query(
      `SELECT o.order_id, o.user_id, u.full_name, o.total_amount, o.order_status, o.payment_status, o.delivery_address, o.order_date
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemResult = await db.query(
      `SELECT oi.order_item_id, oi.product_id, oi.quantity, oi.price,
              p.product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemResult.rows,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { user_id, delivery_address, payment_status, order_items } = req.body;

    if (!Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one item' });
    }

    const totalAmount = order_items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderResult = await db.query(
      `INSERT INTO orders (user_id, total_amount, payment_status, delivery_address)
       VALUES ($1, $2, $3, $4)
       RETURNING order_id, user_id, total_amount, order_status, payment_status, delivery_address, order_date`,
      [user_id, totalAmount, payment_status || 'Pending', delivery_address]
    );

    const orderId = orderResult.rows[0].order_id;

    const itemsInsertPromises = order_items.map((item) =>
      db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      )
    );

    await Promise.all(itemsInsertPromises);

    res.status(201).json({ message: 'Order created successfully', order: orderResult.rows[0] });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const result = await db.query(
      `UPDATE orders
       SET order_status = $1,
           payment_status = $2
       WHERE order_id = $3
       RETURNING order_id, user_id, total_amount, order_status, payment_status, delivery_address, order_date`,
      [order_status, payment_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully', order: result.rows[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    const result = await db.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: error.message });
  }
};
