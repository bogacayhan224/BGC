const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

console.log('Database config - Environment variables:');
console.log('DB_USER:', process.env.DB_USER ? 'Set' : 'Not set');
console.log('DB_HOST:', process.env.DB_HOST ? 'Set' : 'Not set');
console.log('DB_DATABASE:', process.env.DB_DATABASE ? 'Set' : 'Not set');
console.log('DB_PORT:', process.env.DB_PORT ? 'Set' : 'Not set');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Database error:', err.message, err.stack);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err.message);
  } else {
    console.log('Database connection test successful:', res.rows[0]);
  }
});

module.exports = pool;
