const db = require('../db');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      `INSERT INTO users
       (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, phone, role, created_at`,
      [full_name, email, phone, hashedPassword, role || 'customer']
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const userData = await db.query(
      'SELECT user_id, full_name, email, phone, role, created_at FROM users'
    );
    res.json(userData.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.query(
      'SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE user_id = $1',
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone } = req.body;

    const updatedUser = await db.query(
      `UPDATE users
       SET full_name = $1,
           email = $2,
           phone = $3
       WHERE user_id = $4
       RETURNING user_id, full_name, email, phone`,
      [full_name, email, phone, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message});
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await db.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING *',
      [id]
    );

    if (deletedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};
