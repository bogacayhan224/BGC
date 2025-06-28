import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { 
  Battery, 
  Sun, 
  Wind, 
  Droplets, 
  Recycle, 
  AlertTriangle, 
  Settings, 
  Leaf,
  LogOut
} from 'lucide-react';
import '../style.css';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [alerts] = useState([
    { id: 1, level: 'warning', message: 'Water tank level below 80%', time: '2 min ago' },
    { id: 2, level: 'info', message: 'Solar panel efficiency at 95%', time: '5 min ago' }
  ]);
  const [controls, setControls] = useState({
    heater: false,
    rainwater: true,
    greywater: false
  });
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const alertsDropdownRef = useRef(null);

  // Chart refs
  const batteryChartRef = useRef(null);
  const solarChartRef = useRef(null);
  const windChartRef = useRef(null);
  const ecoScoreChartRef = useRef(null);

  // Chart instances
  const batteryChart = useRef(null);
  const solarChart = useRef(null);
  const windChart = useRef(null);
  const ecoScoreChart = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleControlToggle = (control) => {
    setControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };

  useEffect(() => {
    // Destroy previous chart instances if they exist
    if (batteryChart.current) batteryChart.current.destroy();
    if (solarChart.current) solarChart.current.destroy();
    if (windChart.current) windChart.current.destroy();
    if (ecoScoreChart.current) ecoScoreChart.current.destroy();

    // Battery Chart
    if (batteryChartRef.current) {
      batteryChart.current = new Chart(batteryChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Used', 'Available'],
          datasets: [{
            data: [16, 84],
            backgroundColor: ['#e5e7eb', '#22c55e'],
            borderWidth: 0,
          }],
        },
        options: {
          cutout: '80%',
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false
        },
      });
    }

    // Solar Chart
    if (solarChartRef.current) {
      solarChart.current = new Chart(solarChartRef.current, {
        type: 'line',
        data: {
          labels: ['6AM', '9AM', '12PM', '3PM', '6PM'],
          datasets: [{
            label: 'Solar Generation',
            data: [0, 400, 850, 600, 200],
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251,191,36,0.1)',
            fill: true,
            tension: 0.4
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, display: false },
            x: { display: false }
          }
        },
      });
    }

    // Wind Chart
    if (windChartRef.current) {
      windChart.current = new Chart(windChartRef.current, {
        type: 'line',
        data: {
          labels: ['6AM', '9AM', '12PM', '3PM', '6PM'],
          datasets: [{
            label: 'Wind Generation',
            data: [150, 200, 310, 280, 180],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.4
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, display: false },
            x: { display: false }
          }
        },
      });
    }

    // Eco Score Chart
    if (ecoScoreChartRef.current) {
      ecoScoreChart.current = new Chart(ecoScoreChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Score', 'Remaining'],
          datasets: [{
            data: [85, 15],
            backgroundColor: ['#10b981', '#e5e7eb'],
            borderWidth: 0,
          }],
        },
        options: {
          cutout: '75%',
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false
        },
      });
    }

    // Cleanup: destroy charts on unmount
    return () => {
      if (batteryChart.current) batteryChart.current.destroy();
      if (solarChart.current) solarChart.current.destroy();
      if (windChart.current) windChart.current.destroy();
      if (ecoScoreChart.current) ecoScoreChart.current.destroy();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (alertsDropdownRef.current && !alertsDropdownRef.current.contains(event.target)) {
        setAlertsDropdownOpen(false);
      }
    }
    if (alertsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [alertsDropdownOpen]);

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header */}
      <header className="header-modern w-full flex items-center justify-between gap-0 px-8 min-h-[68px] divide-x divide-[#F5F0E1]">
        {/* Left group: Logo + Title */}
        <div className="flex items-center gap-4 pr-6 min-w-0">
          <img src="/EcoGHouse_Logo.png" alt="Eco-G Logo" className="logo-modern" />
          <span className="header-title whitespace-nowrap">Smart Off-Grid Living</span>
        </div>
        {/* Middle group: Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-6 px-4 min-w-0">
          <ul className="flex flex-row gap-6 items-center whitespace-nowrap overflow-x-auto">
            <li><Link to="/dashboard" className="menu-link active">Dashboard</Link></li>
            <li><Link to="/energy" className="menu-link">Energy Management</Link></li>
            <li><Link to="/water" className="menu-link">Water Management</Link></li>
            <li><Link to="/waste" className="menu-link">Waste Management</Link></li>
            <li><Link to="/predictive_maintenance" className="menu-link">Predictive Maintenance</Link></li>
            <li><Link to="/automation_settings" className="menu-link">Automation & Settings</Link></li>
            <li><Link to="/reports_analytics" className="menu-link">Reports & Analytics</Link></li>
            <li><Link to="/user_profile_support" className="menu-link">User Profile & Support</Link></li>
          </ul>
        </nav>
        {/* Right group: Alerts + Logout */}
        <div className="flex items-center gap-4 pl-6 min-w-0">
          <div className="alerts-dropdown-wrapper" ref={alertsDropdownRef}>
            <button
              className="alerts-btn-modern"
              onClick={() => setAlertsDropdownOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={alertsDropdownOpen}
            >
              <span className="icon-badge">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="alert-icon"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="#fee2e2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" stroke="#ef4444" /></svg>
                <span className="badge-count">2</span>
              </span>
              <span className="alerts-label">Critical Alerts</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="dropdown-arrow" style={{marginLeft: 6}}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
            </button>
            {alertsDropdownOpen && (
              <div className="alerts-dropdown-list">
                <div className="dropdown-title">Critical Alerts</div>
                {alerts.length === 0 ? (
                  <div className="dropdown-empty">No critical alerts</div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className={`dropdown-alert dropdown-alert--${alert.level}`}>
                      <span className="dropdown-alert-message">{alert.message}</span>
                      <span className="dropdown-alert-time">{alert.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-btn-modern" aria-label="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main-content">
        <div className="dashboard-grid">
          {/* Top Row: Battery, Solar, Wind */}
          <div className="dashboard-card dashboard-card-energy">
            <div className="dashboard-card-header">
              <Battery className="dashboard-card-icon" />
              <span className="dashboard-card-title">Battery Level</span>
            </div>
            <div className="dashboard-card-metric"><canvas ref={batteryChartRef}></canvas></div>
            <div className="dashboard-metric-label">84% Charged</div>
          </div>
          <div className="dashboard-card dashboard-card-solar">
            <div className="dashboard-card-header">
              <Sun className="dashboard-card-icon" />
              <span className="dashboard-card-title">Solar Input</span>
            </div>
            <div className="dashboard-card-metric"><canvas ref={solarChartRef}></canvas></div>
            <div className="dashboard-metric-label">850W Current Generation</div>
          </div>
          <div className="dashboard-card dashboard-card-wind">
            <div className="dashboard-card-header">
              <Wind className="dashboard-card-icon" />
              <span className="dashboard-card-title">Wind Input</span>
            </div>
            <div className="dashboard-card-metric"><canvas ref={windChartRef}></canvas></div>
            <div className="dashboard-metric-label">310W Current Generation</div>
          </div>
          {/* Bottom Row: Water, Waste, Alert, Controls, Eco Score */}
          <div className="dashboard-card dashboard-card-water">
            <div className="dashboard-card-header">
              <Droplets className="dashboard-card-icon" />
              <span className="dashboard-card-title">Water System</span>
            </div>
            <div className="dashboard-card-section">
              <div className="dashboard-tank-level">
                <div className="dashboard-tank-container">
                  <div className="dashboard-tank-fill" style={{ height: '60%' }}></div>
                  <span className="dashboard-tank-percentage">60%</span>
                </div>
                <span className="dashboard-tank-label">Tank Level</span>
              </div>
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Filter Status:</span>
                <span className="dashboard-status dashboard-status--success">OK</span>
              </div>
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Daily Usage:</span>
                <span className="dashboard-info-value">145L</span>
              </div>
            </div>
          </div>
          <div className="dashboard-card dashboard-card-waste">
            <div className="dashboard-card-header">
              <Recycle className="dashboard-card-icon" />
              <span className="dashboard-card-title">Waste Management</span>
            </div>
            <div className="dashboard-card-section">
              <div className="dashboard-temperature-gauge">
                <div className="dashboard-thermometer">
                  <div className="dashboard-temp-fill" style={{ height: '38%' }}></div>
                </div>
                <span className="dashboard-temp-label">38°C Compost Temp</span>
              </div>
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Status:</span>
                <span className="dashboard-status dashboard-status--success">Active Composting</span>
              </div>
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Progress:</span>
                <div className="dashboard-progress-bar">
                  <div className="dashboard-progress-fill" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card dashboard-card-alerts">
            <div className="dashboard-card-header">
              <AlertTriangle className="dashboard-card-icon" />
              <span className="dashboard-card-title">Alert Center</span>
              <span className="dashboard-alert-count">{alerts.length} Active</span>
            </div>
            <div className="dashboard-alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`dashboard-alert dashboard-alert--${alert.level}`}>
                  <span className="dashboard-alert-message">{alert.message}</span>
                  <span className="dashboard-alert-time">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card dashboard-card-controls">
            <div className="dashboard-card-header">
              <Settings className="dashboard-card-icon" />
              <span className="dashboard-card-title">Quick Controls</span>
            </div>
            <div className="dashboard-controls-grid">
              <div className="dashboard-control-item">
                <label className="dashboard-switch-label">
                  <input type="checkbox" className="dashboard-switch-input" checked={controls.heater} onChange={() => handleControlToggle('heater')} />
                  <span className="dashboard-switch-slider"></span>
                  <span className="dashboard-switch-text">Heater</span>
                </label>
              </div>
              <div className="dashboard-control-item">
                <label className="dashboard-switch-label">
                  <input type="checkbox" className="dashboard-switch-input" checked={controls.rainwater} onChange={() => handleControlToggle('rainwater')} />
                  <span className="dashboard-switch-slider"></span>
                  <span className="dashboard-switch-text">Rainwater Roof</span>
                </label>
              </div>
              <div className="dashboard-control-item">
                <button className="dashboard-btn-flush" onClick={() => handleControlToggle('greywater')}>
                  <Droplets size={16} />
                  Force Greywater Flush
                </button>
              </div>
            </div>
          </div>
          <div className="dashboard-card dashboard-card-eco">
            <div className="dashboard-card-header">
              <Leaf className="dashboard-card-icon" />
              <span className="dashboard-card-title">Eco Score</span>
              <span className="dashboard-eco-rating">Excellent</span>
            </div>
            <div className="dashboard-eco-metrics">
              <div className="dashboard-eco-score-chart-container">
                <canvas ref={ecoScoreChartRef}></canvas>
                <div className="dashboard-eco-score-value">85</div>
              </div>
              <div className="dashboard-eco-stat">
                <span className="dashboard-eco-value">42.5 kWh</span>
                <span className="dashboard-eco-label">Weekly Energy Saved</span>
              </div>
              <div className="dashboard-eco-stat">
                <span className="dashboard-eco-value">28.3 kg CO₂</span>
                <span className="dashboard-eco-label">Carbon Offset</span>
              </div>
              <div className="dashboard-achievements">
                <div className="dashboard-achievement-badge">🌱 Green Pioneer</div>
                <div className="dashboard-achievement-badge">⚡ Energy Saver</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 