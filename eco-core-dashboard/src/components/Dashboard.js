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
  Leaf,
  LogOut,
  Info
} from 'lucide-react';
import '../style.css';
import './Dashboard.css';
import QuickControls from './QuickControls';
import alertsService from '../services/alertsService';
import Tooltip from './Tooltip';

// Mock veri (API yoksa) - moved outside component to prevent recreation
const mockAlerts = [
  { id: 1, level: 'warning', message: 'Water tank level below 80%', time: '2 min ago' },
  { id: 2, level: 'info', message: 'Solar panel efficiency at 95%', time: '5 min ago' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const alertsDropdownRef = useRef(null);

  // Water System kartı için gerekli state ve değişkenler
  const tankLevel = 60;

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

  // Waste Management için sıcaklık ve progress state'i
  const [compostTemp] = useState(38);
  const [compostProgress, setCompostProgress] = useState(0);
  const compostPhase = 'Active Composting';

  // Battery calculation state
  const [batteryLevel] = useState(84);
  const [powerConsumption] = useState(2.1); // kW average consumption
  const [batteryCapacity] = useState(15); // kWh total capacity
  const remainingHours = Math.round((batteryLevel / 100) * batteryCapacity / powerConsumption * 10) / 10;

  // Interactive states
  const [expandedWidget, setExpandedWidget] = useState(null);

  // Alert Center için hem mock hem API destekli, acknowledge'lı state
  const [alerts, setAlerts] = useState([]);
  const [acknowledged, setAcknowledged] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };



  const handleAcknowledge = (alertId) => {
    setAlerts(prev => {
      const alert = prev.find(a => a.id === alertId);
      if (!alert) return prev;
      setAcknowledged(a => a.some(x => x.id === alertId) ? a : [...a, { ...alert, acknowledged: true }]);
      return prev.filter(a => a.id !== alertId);
    });
  };

  const handleWidgetClick = (widgetId) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  useEffect(() => {
    setAlertsLoading(true);
    setAlertsError(null);
    // API varsa buradan fetch et, yoksa mock kullan
    (async () => {
      try {
        // Eğer alertsService varsa kullan, yoksa mock
        let data = mockAlerts;
        if (typeof alertsService?.fetchCriticalAlerts === 'function') {
          data = await alertsService.fetchCriticalAlerts();
        }
        setAlerts(data);
      } catch (e) {
        setAlertsError('Failed to load critical alerts');
        setAlerts(mockAlerts);
      } finally {
        setAlertsLoading(false);
      }
    })();
  }, []);

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
            data: [100 - batteryLevel, batteryLevel],
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

    // Progress animasyonu
    setTimeout(() => setCompostProgress(58), 200);

    // Cleanup: destroy charts on unmount
    return () => {
      if (batteryChart.current) batteryChart.current.destroy();
      if (solarChart.current) solarChart.current.destroy();
      if (windChart.current) windChart.current.destroy();
      if (ecoScoreChart.current) ecoScoreChart.current.destroy();
    };
  }, [batteryLevel]);

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
                <span className="badge-count">{alerts.length}</span>
              </span>
              <span className="alerts-label">Critical Alerts</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="dropdown-arrow" style={{marginLeft: 6}}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
            </button>
            {alertsDropdownOpen && (
              <div className="alerts-dropdown-list">
                <div className="dropdown-title">Critical Alerts</div>
                {alertsLoading ? (
                  <div className="dropdown-empty">Loading...</div>
                ) : alertsError ? (
                  <div className="dropdown-empty">{alertsError}</div>
                ) : alerts.length === 0 ? (
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
          <Tooltip
            content={
              <div>
                <div className="tooltip-title">Battery Status</div>
                <div className="tooltip-details">
                  <div className="tooltip-detail">
                    <span className="label">Capacity:</span>
                    <span className="value">{batteryCapacity} kWh</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Current Level:</span>
                    <span className="value">{batteryLevel}%</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Power Consumption:</span>
                    <span className="value">{powerConsumption} kW</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Remaining Time:</span>
                    <span className="value">~{remainingHours} hours</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Charging Rate:</span>
                    <span className="value">2.5 kW</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Last Updated:</span>
                    <span className="value">2 minutes ago</span>
                  </div>
                </div>
              </div>
            }
            position="top"
          >
            <div 
              className={`dashboard-card dashboard-card-energy ${expandedWidget === 'battery' ? 'dashboard-card--expanded' : ''}`}
              onClick={() => handleWidgetClick('battery')}
            >
              <div className="dashboard-card-header">
                <Battery className="dashboard-card-icon" />
                <span className="dashboard-card-title">Battery Level</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
              </div>
              <div className="dashboard-card-section">
                <div className="dashboard-card-metric">
                  <div className="dashboard-chart-container">
                    <canvas ref={batteryChartRef}></canvas>
                  </div>
                  <div className="dashboard-metric-label">{batteryLevel}% Charged</div>
                  <div className="dashboard-battery-hours">~{remainingHours} hours remaining</div>
                </div>
              </div>
              {expandedWidget === 'battery' && (
                <div className="dashboard-expanded-content">
                  <div className="expanded-details">
                    <div className="detail-row">
                      <span className="detail-label">Battery Health:</span>
                      <span className="detail-value status--success">Excellent</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Temperature:</span>
                      <span className="detail-value">24°C</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Charging Status:</span>
                      <span className="detail-value status--active">Active</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Efficiency:</span>
                      <span className="detail-value">94%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
          <Tooltip
            content={
              <div>
                <div className="tooltip-title">Solar Generation</div>
                <div className="tooltip-details">
                  <div className="tooltip-detail">
                    <span className="label">Current Output:</span>
                    <span className="value">850W</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Peak Today:</span>
                    <span className="value">1.2kW</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Efficiency:</span>
                    <span className="value">95%</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Panel Temperature:</span>
                    <span className="value">42°C</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Sunlight Hours:</span>
                    <span className="value">6.2h</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Daily Total:</span>
                    <span className="value">4.8kWh</span>
                  </div>
                </div>
              </div>
            }
            position="top"
          >
            <div 
              className={`dashboard-card dashboard-card-solar ${expandedWidget === 'solar' ? 'dashboard-card--expanded' : ''}`}
              onClick={() => handleWidgetClick('solar')}
            >
              <div className="dashboard-card-header">
                <Sun className="dashboard-card-icon" />
                <span className="dashboard-card-title">Solar Input</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
              </div>
              <div className="dashboard-card-section">
                <div className="dashboard-card-metric">
                  <div className="dashboard-chart-container">
                    <canvas ref={solarChartRef}></canvas>
                  </div>
                  <div className="dashboard-metric-label">850W Current Generation</div>
                </div>
              </div>
              {expandedWidget === 'solar' && (
                <div className="dashboard-expanded-content">
                  <div className="expanded-details">
                    <div className="detail-row">
                      <span className="detail-label">Panel Efficiency:</span>
                      <span className="detail-value status--success">95%</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Temperature:</span>
                      <span className="detail-value">42°C</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Sunlight Hours:</span>
                      <span className="detail-value">6.2h</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Daily Total:</span>
                      <span className="detail-value">4.8kWh</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
          <Tooltip
            content={
              <div>
                <div className="tooltip-title">Wind Generation</div>
                <div className="tooltip-details">
                  <div className="tooltip-detail">
                    <span className="label">Current Output:</span>
                    <span className="value">310W</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Wind Speed:</span>
                    <span className="value">12 km/h</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Turbine RPM:</span>
                    <span className="value">180</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Efficiency:</span>
                    <span className="value">78%</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Daily Total:</span>
                    <span className="value">2.1kWh</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Peak Today:</span>
                    <span className="value">450W</span>
                  </div>
                </div>
              </div>
            }
            position="top"
          >
            <div 
              className={`dashboard-card dashboard-card-wind ${expandedWidget === 'wind' ? 'dashboard-card--expanded' : ''}`}
              onClick={() => handleWidgetClick('wind')}
            >
              <div className="dashboard-card-header">
                <Wind className="dashboard-card-icon" />
                <span className="dashboard-card-title">Wind Input</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
              </div>
              <div className="dashboard-card-section">
                <div className="dashboard-card-metric">
                  <div className="dashboard-chart-container">
                    <canvas ref={windChartRef}></canvas>
                  </div>
                  <div className="dashboard-metric-label">310W Current Generation</div>
                </div>
              </div>
              {expandedWidget === 'wind' && (
                <div className="dashboard-expanded-content">
                  <div className="expanded-details">
                    <div className="detail-row">
                      <span className="detail-label">Turbine RPM:</span>
                      <span className="detail-value">180</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Efficiency:</span>
                      <span className="detail-value">78%</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Daily Total:</span>
                      <span className="detail-value">2.1kWh</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Peak Today:</span>
                      <span className="detail-value">450W</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
          {/* Bottom Row: Water, Waste, Alert, Controls, Eco Score */}
          <Tooltip
            content={
              <div>
                <div className="tooltip-title">Water System Status</div>
                <div className="tooltip-details">
                  <div className="tooltip-detail">
                    <span className="label">Tank Level:</span>
                    <span className="value">{tankLevel}%</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Filter Status:</span>
                    <span className="value">OK</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Daily Usage:</span>
                    <span className="value">145L</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Water Quality:</span>
                    <span className="value">Excellent</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Last Filter Change:</span>
                    <span className="value">15 days ago</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">System Pressure:</span>
                    <span className="value">2.1 bar</span>
                  </div>
                </div>
              </div>
            }
            position="top"
          >
            <div className="dashboard-card dashboard-card-water">
              <div className="dashboard-card-header">
                <Droplets className="dashboard-card-icon" />
                <span className="dashboard-card-title">Water System</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
              </div>
              <div className="water-metrics">
                <div className="tank-level">
                  <div className="tank-container">
                    <div className="tank-fill" style={{ height: `${tankLevel}%` }}></div>
                    <span className="tank-percentage">{tankLevel}%</span>
                  </div>
                  <span className="tank-label">Tank Level</span>
                </div>
                <div className="water-info">
                  <div className="info-row">
                    <span className="label">Filter Status:</span>
                    <span className="status status--success">OK</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Daily Usage:</span>
                    <span className="value" style={{ fontWeight: 700, fontSize: '1.5rem' }}>145L</span>
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>
          <Tooltip
            content={
              <div>
                <div className="tooltip-title">Waste Management</div>
                <div className="tooltip-details">
                  <div className="tooltip-detail">
                    <span className="label">Compost Temperature:</span>
                    <span className="value">{compostTemp}°C</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Moisture Level:</span>
                    <span className="value">65%</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Compost Phase:</span>
                    <span className="value">{compostPhase}</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Progress:</span>
                    <span className="value">{compostProgress}%</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">pH Level:</span>
                    <span className="value">6.8</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Last Turned:</span>
                    <span className="value">2 days ago</span>
                  </div>
                </div>
              </div>
            }
            position="top"
          >
            <div className="dashboard-card dashboard-card-waste">
              <div className="dashboard-card-header">
                <Recycle className="dashboard-card-icon" />
                <span className="dashboard-card-title">Waste Management</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
              </div>
              <div className="dashboard-card-section">
                <div style={{display: 'flex', alignItems: 'center', gap: 20, width: '100%'}}>
                  {/* Left side - Thermometer */}
                  <div className="waste-thermometer-block" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: 90}}>
                    {/* Temperature label with icon */}
                    <div style={{display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, marginBottom: 8, color: compostTemp > 35 ? '#F59E0B' : '#27ae60', textShadow: compostTemp > 35 ? '0 0 8px #F59E0B88' : 'none'}}>
                      <span style={{fontSize: 22, marginRight: 6}}>🌡</span> {compostTemp}°C
                    </div>
                    {/* Thermometer visual */}
                    <div className="thermometer-outer" style={{
                      position: 'relative', width: 32, height: 120, background: 'rgba(255,255,255,0.5)', borderRadius: 20, border: '2px solid #27ae60', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', boxShadow: compostTemp > 35 ? '0 0 24px 6px #F59E0B55' : '0 2px 8px rgba(39,174,96,0.08)'}}>
                      {/* Fill (animated) */}
                      <div className="thermometer-fill" style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        height: `${compostProgress}%`,
                        background: 'linear-gradient(to top, #27ae60 60%, #F59E0B 100%)',
                        borderRadius: '0 0 20px 20px',
                        boxShadow: compostTemp > 35 ? '0 0 32px 8px #F59E0B88, 0 0 8px 2px #27ae60' : '0 0 16px 4px #27ae6055',
                        transition: 'height 1.2s cubic-bezier(.4,2,.6,1)',
                        filter: compostTemp > 35 ? 'drop-shadow(0 0 12px #F59E0B88)' : 'none',
                        animation: compostTemp > 35 ? 'thermoGlow 1.2s infinite alternate' : 'none',
                      }}>
                        {/* Dalga efekti için SVG overlay */}
                        <svg width="100%" height="18" style={{position: 'absolute', top: -18, left: 0}}>
                          <ellipse cx="16" cy="16" rx="16" ry="6" fill="#fff" fillOpacity="0.18">
                            <animate attributeName="cy" values="16;12;16" dur="1.2s" repeatCount="indefinite" />
                          </ellipse>
                        </svg>
                      </div>
                      {/* Cam parıltısı */}
                      <div style={{position: 'absolute', top: 8, left: 4, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(120deg, #fff8 60%, #fff2 100%)', opacity: 0.25, filter: 'blur(2px)'}}></div>
                      {/* Hafif shimmer/heat shimmer */}
                      {compostTemp > 35 && (
                        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'repeating-linear-gradient(120deg, #fff2 0 2px, transparent 2px 8px)', opacity: 0.18, animation: 'shimmerMove 2s linear infinite'}}></div>
                      )}
                    </div>
                    {/* Compost Temperature label */}
                    <div style={{marginTop: 10, fontWeight: 500, color: '#64748b', fontSize: 14}}>Compost Temperature</div>
                  </div>
                  
                  {/* Right side - Details */}
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    marginLeft: '1.5rem',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        width: '120px',
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '500'
                      }}>Compost Phase:</span>
                      <span style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        fontWeight: '600'
                      }}>{compostPhase}</span>
                    </div>
                    <div style={{
                      display: 'flex'
                    }}>
                      <span style={{
                        width: '120px',
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '500'
                      }}>Progress:</span>
                      <span style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        fontWeight: '600'
                      }}>58%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>
          {alertsLoading ? (
            <div className="dashboard-card dashboard-card-alerts">
              <div className="dashboard-card-header">
                <AlertTriangle className="dashboard-card-icon" />
                <span className="dashboard-card-title">Alert Center</span>
                <span className="dashboard-alert-count">{alerts.length} Active</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
              </div>
              <div className="dashboard-alerts-list">
                <div className="dropdown-empty">Loading...</div>
              </div>
            </div>
          ) : (
            <Tooltip
              content={
                <div>
                  <div className="tooltip-title">Alert Center</div>
                  <div className="tooltip-details">
                    <div className="tooltip-detail">
                      <span className="label">Active Alerts:</span>
                      <span className="value">{alerts.length}</span>
                    </div>
                    <div className="tooltip-detail">
                      <span className="label">Acknowledged:</span>
                      <span className="value">{acknowledged.length}</span>
                    </div>
                    <div className="tooltip-detail">
                      <span className="label">Last Updated:</span>
                      <span className="value">2 minutes ago</span>
                    </div>
                    <div className="tooltip-detail">
                      <span className="label">System Status:</span>
                      <span className="value">Monitoring</span>
                    </div>
                  </div>
                </div>
              }
              position="top"
            >
              <div className="dashboard-card dashboard-card-alerts">
                <div className="dashboard-card-header">
                  <AlertTriangle className="dashboard-card-icon" />
                  <span className="dashboard-card-title">Alert Center</span>
                  <span className="dashboard-alert-count">{alerts.length} Active</span>
                  <div className="dashboard-card-actions">
                    <Info size={16} className="dashboard-info-icon" />
                  </div>
                </div>
                <div className="dashboard-alerts-list">
                  {alertsError ? (
                    <div className="dropdown-empty">{alertsError}</div>
                  ) : alerts.length === 0 ? (
                    <div className="dropdown-empty">No critical alerts</div>
                  ) : (
                    alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`dashboard-alert dashboard-alert--${alert.level}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                          transition: 'opacity 0.4s ease-out',
                          opacity: 1,
                          padding: '1rem 1.5rem',
                          minHeight: 64,
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                          <span className="dashboard-alert-message" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{alert.message}</span>
                          <span className="dashboard-alert-time">{alert.time}</span>
                        </div>
                        <button
                          className="acknowledge-btn"
                          style={{ marginLeft: 16 }}
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </button>
                      </div>
                    ))
                  )}
                  {/* Acknowledged section */}
                  {acknowledged.length > 0 && (
                    <div className="acknowledged-section">
                      <div style={{fontSize: 13, color: '#22c55e', fontWeight: 600, marginBottom: 4}}>Acknowledged</div>
                      {acknowledged.map(alert => (
                        <div key={alert.id} className={`dashboard-alert dashboard-alert--${alert.level} acknowledged`}
                          style={{ display: 'flex', alignItems: 'center', opacity: 0.5, transition: 'opacity 0.4s ease-out', position: 'relative', background: 'rgba(0,0,0,0.03)', minHeight: 64, padding: '1rem 1.5rem' }}>
                          <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
                            <span className="dashboard-alert-message">{alert.message}</span>
                            <span className="dashboard-alert-time">{alert.time}</span>
                          </div>
                          <span style={{marginLeft: 16, color: '#22c55e', fontSize: 20}}>✅</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          )}
          {/* Quick Controls paneli */}
          <Tooltip
            content={
              <div>
                <div className="tooltip-title">Quick Controls</div>
                <div className="tooltip-details">
                  <div className="tooltip-detail">
                    <span className="label">Heater:</span>
                    <span className="value">Off</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Rainwater Roof:</span>
                    <span className="value">On</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Compost Fan:</span>
                    <span className="value">Off</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Energy Mode:</span>
                    <span className="value">Eco</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">System Status:</span>
                    <span className="value">Active</span>
                  </div>
                </div>
              </div>
            }
            position="top"
          >
            <div className="dashboard-card dashboard-card-controls">
              <div className="dashboard-card-header">
                <span style={{fontSize: '1.25rem', marginRight: 8}}>⚙️</span>
                <span className="dashboard-card-title">Quick Controls</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
              </div>
              <QuickControls />
            </div>
          </Tooltip>
          <Tooltip
            content={
              <div>
                <div className="tooltip-title">Eco Score Breakdown</div>
                <div className="tooltip-details">
                  <div className="tooltip-detail">
                    <span className="label">Current Score:</span>
                    <span className="value">85/100</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Weekly Energy Saved:</span>
                    <span className="value">42.5 kWh</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Carbon Offset:</span>
                    <span className="value">28.3 kg CO₂</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Water Conserved:</span>
                    <span className="value">120L</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Waste Diverted:</span>
                    <span className="value">15.2 kg</span>
                  </div>
                  <div className="tooltip-detail">
                    <span className="label">Rating:</span>
                    <span className="value">Excellent</span>
                  </div>
                </div>
              </div>
            }
            position="top"
          >
            <div className="dashboard-card dashboard-card-eco">
              <div className="dashboard-card-header">
                <Leaf className="dashboard-card-icon" />
                <span className="dashboard-card-title">Eco Score</span>
                <span className="dashboard-eco-rating">Excellent</span>
                <div className="dashboard-card-actions">
                  <Info size={16} className="dashboard-info-icon" />
                </div>
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
          </Tooltip>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 