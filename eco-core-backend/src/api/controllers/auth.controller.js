const AuthService = require('../../services/auth.service');

const AuthController = {
  async register(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await AuthService.register(username, password);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle potential database errors, e.g., unique constraint for username
      if (error.code === '23505') { // PostgreSQL unique violation
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      // Handle database connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(500).json({ message: 'Database connection error', error: error.message });
      }
      
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const { user, token } = await AuthService.login(username, password);
      res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Handle database connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(500).json({ message: 'Database connection error', error: error.message });
      }
      
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  },

  // Test endpoint
  async test(req, res) {
    try {
      res.status(200).json({ message: 'Auth controller is working' });
    } catch (error) {
      console.error('Test error:', error);
      res.status(500).json({ message: 'Test failed', error: error.message });
    }
  },
};

module.exports = AuthController;
