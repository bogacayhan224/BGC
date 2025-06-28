import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await authService.register(formData.username, formData.password);
        setError('Registration successful! Please login.');
        setIsRegistering(false);
      } else {
        await authService.login(formData.username, formData.password);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setFormData({ username: '', password: '' });
  };

  // Test function for development
  const handleTestLogin = () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      username: 'testuser',
      role: 'admin' 
    }));
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Eco Core Dashboard</h1>
          <p>{isRegistering ? 'Create Account' : 'Welcome Back'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>

        {/* Test button for development */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={handleTestLogin}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🧪 Test Login (Development)
          </button>
        </div>

        <div className="login-footer">
          <button 
            type="button" 
            className="toggle-mode-button"
            onClick={toggleMode}
          >
            {isRegistering 
              ? 'Already have an account? Login' 
              : "Don't have an account? Register"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 