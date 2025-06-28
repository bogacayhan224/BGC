const pool = require('../config/database');

const User = {
  async create({ username, password }) {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, password]
    );
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query(
      'SELECT id, username, password, created_at FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = User;
