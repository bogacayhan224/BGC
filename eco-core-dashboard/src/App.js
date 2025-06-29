import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';
import Energy from './components/Energy';
import Water from './components/Water';
import Waste from './components/Waste';
import PredictiveMaintenance from './components/PredictiveMaintenance';
import AutomationSettings from './components/AutomationSettings';
import ReportsAnalytics from './components/ReportsAnalytics';
import UserProfileSupport from './components/UserProfileSupport';
import './App.css';

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/energy" 
            element={
              <ProtectedRoute>
                <Energy />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/water" 
            element={
              <ProtectedRoute>
                <Water />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/waste" 
            element={
              <ProtectedRoute>
                <Waste />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/predictive_maintenance" 
            element={
              <ProtectedRoute>
                <PredictiveMaintenance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/automation_settings" 
            element={
              <ProtectedRoute>
                <AutomationSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports_analytics" 
            element={
              <ProtectedRoute>
                <ReportsAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user_profile_support" 
            element={
              <ProtectedRoute>
                <UserProfileSupport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 