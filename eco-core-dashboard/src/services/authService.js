import api from './api';

const authService = {
  // Login user
  async login(username, password) {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });
      
      const { user, token } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register user
  async register(username, password) {
    try {
      const response = await api.post('/api/auth/register', {
        username,
        password,
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },
};

export default authService; 