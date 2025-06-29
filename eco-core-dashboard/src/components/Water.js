import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Droplets, CloudRain, Wind, ShieldCheck, PieChart, Recycle, AlertTriangle, CalendarCheck, LogOut } from 'lucide-react';
import '../style.css';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import alertsService from '../services/alertsService';

const SortableCard = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const Water = () => {
  const navigate = useNavigate();
  // Chart refs
  const waterSourceRef = useRef(null);
  const waterUsageRef = useRef(null);

  // Chart instances
  const waterSourceChart = useRef(null);
  const waterUsageChart = useRef(null);

  const [cardOrder, setCardOrder] = useState([
    'water-source',
    'rainwater',
    'atmospheric',
    'filtration',
    'usage',
    'greywater',
    'leak',
    'maintenance',
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const alertsDropdownRef = useRef(null);
  const mockAlerts = [
    { id: 1, level: 'warning', message: 'Water tank level below 80%', time: '2 min ago' },
    { id: 2, level: 'info', message: 'Solar panel efficiency at 95%', time: '5 min ago' }
  ];

  useEffect(() => {
    // Water Source Overview Chart
    if (waterSourceRef.current) {
      waterSourceChart.current = new Chart(waterSourceRef.current, {
        type: 'line',
        data: {
          labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
          datasets: [{
            label: 'Input (L)',
            data: [120, 180, 220, 160, 140],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
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
    // Water Usage Chart
    if (waterUsageRef.current) {
      waterUsageChart.current = new Chart(waterUsageRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Showers', 'Irrigation', 'Drinking', 'Other'],
          datasets: [{
            data: [35, 25, 20, 20],
            backgroundColor: ['#38bdf8', '#22c55e', '#fbbf24', '#a3a3a3'],
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
    return () => {
      if (waterSourceChart.current) waterSourceChart.current.destroy();
      if (waterUsageChart.current) waterUsageChart.current.destroy();
    };
  }, []);

  useEffect(() => {
    setAlertsLoading(true);
    setAlertsError(null);
    (async () => {
      try {
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderCard = (cardId) => {
    switch (cardId) {
      case 'water-source':
        return (
          <div className="eco-card eco-card--full">
            <div className="eco-card-header">
              <Droplets className="eco-card-icon" />
              <span className="eco-card-title">Water Source Overview</span>
              <select className="eco-dropdown" style={{marginLeft: 'auto'}}>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="eco-card-chart-large">
              <canvas ref={waterSourceRef}></canvas>
            </div>
          </div>
        );
      case 'rainwater':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <CloudRain className="eco-card-icon" />
              <span className="eco-card-title">Rainwater Harvesting</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Collection:</span> <span className="status status--success">Active</span></li>
              <li><span className="label">Tank Level:</span> <span className="value">85%</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Filtration Report</button>
            </div>
          </div>
        );
      case 'atmospheric':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Wind className="eco-card-icon" />
              <span className="eco-card-title">Atmospheric Water</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Production:</span> <span className="value">2.1 L/hr</span></li>
              <li><span className="label">System Health:</span> <span className="status status--success">Optimal</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Maintenance Alert</button>
            </div>
          </div>
        );
      case 'filtration':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <ShieldCheck className="eco-card-icon" />
              <span className="eco-card-title">Filtration & Purification</span>
            </div>
            <ul className="eco-card-list">
              <li><span>Clay-UV:</span> <span className="status status--success">OK</span></li>
              <li><span>Carbon:</span> <span className="status status--warning">Needs Change</span></li>
              <li><span className="label">Water Quality:</span> <span className="value">99.8% Pure</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Disable UV Stage</button>
            </div>
          </div>
        );
      case 'usage':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <PieChart className="eco-card-icon" />
              <span className="eco-card-title">Water Usage</span>
            </div>
            <div className="eco-card-chart-small">
              <canvas ref={waterUsageRef}></canvas>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Allocation Settings</button>
            </div>
          </div>
        );
      case 'greywater':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Recycle className="eco-card-icon" />
              <span className="eco-card-title">Greywater Recycling</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Status:</span> <span className="status status--success">Active</span></li>
              <li><span className="label">Quality:</span> <span className="value">Safe for Irrigation</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Treatment Report</button>
            </div>
          </div>
        );
      case 'leak':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <AlertTriangle className="eco-card-icon" />
              <span className="eco-card-title">Leak Detection</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">System Status:</span> <span className="status status--success">No Leaks Detected</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Initiate Scan</button>
              <button className="eco-btn-action">Settings</button>
            </div>
          </div>
        );
      case 'maintenance':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <CalendarCheck className="eco-card-icon" />
              <span className="eco-card-title">Maintenance Schedule</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Next:</span> <span className="value">Filter Change - 3 days</span></li>
              <li><span className="label">Last:</span> <span className="value">UV Service - 2 weeks ago</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">View Full Schedule</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header (identical to Dashboard/Energy) */}
      <header className="header-modern w-full flex items-center justify-between gap-0 px-8 min-h-[68px] divide-x divide-[#F5F0E1]">
        {/* Left group: Logo + Title */}
        <div className="flex items-center gap-4 pr-6 min-w-0">
          <img src="/EcoGHouse_Logo.png" alt="Eco-G Logo" className="logo-modern" />
          <span className="header-title whitespace-nowrap">Smart Off-Grid Living</span>
        </div>
        {/* Middle group: Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-6 px-4 min-w-0">
          <ul className="flex flex-row gap-6 items-center whitespace-nowrap overflow-x-auto">
            <li><Link to="/dashboard" className="menu-link">Dashboard</Link></li>
            <li><Link to="/energy" className="menu-link">Energy Management</Link></li>
            <li><Link to="/water" className="menu-link active">Water Management</Link></li>
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
      {/* Main Content (Dashboard grid/cards style) */}
      <main className="eco-dashboard-main">
        <div className="eco-dashboard-grid">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
              {cardOrder.map((cardId) => (
                <SortableCard key={cardId} id={cardId}>
                  {renderCard(cardId)}
                </SortableCard>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </main>
    </div>
  );
};

export default Water; 