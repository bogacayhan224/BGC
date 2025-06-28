import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Sun, Battery, LineChart, LogOut, AlertTriangle } from 'lucide-react';
import '../style.css';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const Energy = () => {
  const navigate = useNavigate();
  const [alerts] = useState([
    { id: 1, level: 'warning', message: 'Water tank level below 80%', time: '2 min ago' },
    { id: 2, level: 'info', message: 'Solar panel efficiency at 95%', time: '5 min ago' }
  ]);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const alertsDropdownRef = useRef(null);

  // Chart refs
  const generationRef = useRef(null);
  const batteryRef = useRef(null);
  const consumptionRef = useRef(null);

  // Chart instances
  const generationChart = useRef(null);
  const batteryChart = useRef(null);
  const consumptionChart = useRef(null);

  const [cardOrder, setCardOrder] = useState([
    'current-generation',
    'consumption-trends',
    'battery-storage',
    'grid-interaction',
    'appliance-scheduling',
    'backup-generator',
    'energy-modes',
    'weather-forecast',
    'energy-sharing'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('energyCardOrder');
    if (savedOrder) {
      setCardOrder(JSON.parse(savedOrder));
    }
  }, []);

  // Save order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('energyCardOrder', JSON.stringify(cardOrder));
  }, [cardOrder]);

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

  useEffect(() => {
    // Destroy previous chart instances if they exist
    if (generationChart.current) generationChart.current.destroy();
    if (batteryChart.current) batteryChart.current.destroy();
    if (consumptionChart.current) consumptionChart.current.destroy();

    // Generation Chart (line, like Dashboard)
    if (generationRef.current) {
      generationChart.current = new Chart(generationRef.current, {
        type: 'line',
        data: {
          labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
          datasets: [{
            label: 'Solar Generation (kWh)',
            data: [10, 30, 50, 40, 20],
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251,191,36,0.1)',
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
    // Battery Chart (doughnut, like Dashboard)
    if (batteryRef.current) {
      batteryChart.current = new Chart(batteryRef.current, {
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
    // Consumption Chart (bar, styled like Dashboard)
    if (consumptionRef.current) {
      consumptionChart.current = new Chart(consumptionRef.current, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Consumption (kWh)',
            data: [12, 19, 14, 17, 22, 18, 15],
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            barPercentage: 0.7,
            categoryPercentage: 0.6,
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
    // Cleanup: destroy charts on unmount
    return () => {
      if (generationChart.current) generationChart.current.destroy();
      if (batteryChart.current) batteryChart.current.destroy();
      if (consumptionChart.current) consumptionChart.current.destroy();
    };
  }, []);

  // Dropdown close on outside click
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

  const renderCard = (cardId) => {
    switch (cardId) {
      case 'current-generation':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="sun">🌞</span>
              <span className="eco-card-title">Current Generation</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="solar">🔆</span> Solar: <b>2.4 kW</b></li>
              <li><span role="img" aria-label="wind">💨</span> Wind: <b>1.8 kW</b></li>
              <li><span role="img" aria-label="total">⚡</span> Total: <b>4.2 kW</b></li>
            </ul>
          </div>
        );
      case 'consumption-trends':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="consumption">📉</span>
              <span className="eco-card-title">Consumption Trends</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="today">🔵</span> Today: <b>12.5 kWh</b></li>
              <li><span role="img" aria-label="week">📅</span> This Week: <b>84 kWh</b></li>
              <li><span role="img" aria-label="avg">📊</span> Avg/Day: <b>12 kWh</b></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action"><span role="img" aria-label="details">📈</span> View Details</button>
            </div>
          </div>
        );
      case 'battery-storage':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="battery">🔋</span>
              <span className="eco-card-title">Battery Storage</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="level">🔋</span> Level: <b>78%</b></li>
              <li><span role="img" aria-label="energy">🔌</span> Energy: <b>15.6 kWh</b></li>
              <li><span role="img" aria-label="status">🔄</span> Status: <b>Charging</b></li>
            </ul>
          </div>
        );
      case 'grid-interaction':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="grid">🔲</span>
              <span className="eco-card-title">Grid Interaction</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="import">⬇️</span> Import: <b>0.5 kW</b></li>
              <li><span role="img" aria-label="export">⬆️</span> Export: <b>1.2 kW</b></li>
              <li><span role="img" aria-label="net">🔁</span> Net: <b>Exporting</b></li>
            </ul>
          </div>
        );
      case 'appliance-scheduling':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="clock">⏰</span>
              <span className="eco-card-title">Appliance Scheduling</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="next">🕑</span> Next: <b>Dishwasher 2:00 PM</b></li>
              <li><span role="img" aria-label="budget">💡</span> Budget: <b>8.5 kWh</b></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action"><span role="img" aria-label="view">📅</span> View Schedule</button>
              <button className="eco-btn-action"><span role="img" aria-label="add">➕</span> Add Device</button>
            </div>
          </div>
        );
      case 'backup-generator':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="generator">⚡</span>
              <span className="eco-card-title">Backup Generator</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="status">🟢</span> Standby</li>
              <li><span role="img" aria-label="fuel">⛽</span> Fuel: <b>85%</b></li>
              <li><span role="img" aria-label="last">🕒</span> Last: <b>3 days ago</b></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action"><span role="img" aria-label="test">🧪</span> Run Test</button>
              <button className="eco-btn-action"><span role="img" aria-label="emergency">🚨</span> Simulate Emergency</button>
            </div>
          </div>
        );
      case 'energy-modes':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="modes">🧠</span>
              <span className="eco-card-title">Energy Modes & Automation</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="eco">🌱</span> Eco: Essentials only</li>
              <li><span role="img" aria-label="max">☀️</span> Max: Use peak solar</li>
              <li><span role="img" aria-label="critical">🚨</span> Critical: Gen &lt;10%</li>
              <li><span role="img" aria-label="custom">🎯</span> Custom: Your logic</li>
            </ul>
            <div className="eco-card-actions">
              <select className="eco-dropdown">
                <option>Eco Mode</option>
                <option>Max Mode</option>
                <option>Critical Mode</option>
                <option>Custom</option>
              </select>
              <button className="eco-btn-action"><span role="img" aria-label="rule">🔧</span> New Rule</button>
              <button className="eco-btn-action"><span role="img" aria-label="test">🧪</span> Run Test</button>
            </div>
          </div>
        );
      case 'weather-forecast':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="weather">🌤</span>
              <span className="eco-card-title">Weather Forecast & Prediction</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="cloud">☁️</span> 80% cloudy → -35%</li>
              <li><span role="img" aria-label="wind">💨</span> 24 km/h → 80% output</li>
              <li><span role="img" aria-label="laundry">🧺</span> Laundry @ 2PM</li>
              <li><span role="img" aria-label="alert">⚠️</span> Low solar forecast</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action"><span role="img" aria-label="plan">⚡</span> Generate Plan</button>
              <button className="eco-btn-action"><span role="img" aria-label="notif">🔔</span> Notifications ✓</button>
            </div>
          </div>
        );
      case 'energy-sharing':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <span className="eco-card-icon" role="img" aria-label="sharing">⚡</span>
              <span className="eco-card-title">Energy Sharing & Connectivity</span>
            </div>
            <ul className="eco-card-list">
              <li><span role="img" aria-label="grid">🔄</span> Grid: +3.2 kWh sold</li>
              <li><span role="img" aria-label="neighbor">🏘</span> Neighbor: Ali needs 10%</li>
              <li><span role="img" aria-label="cert">🪙</span> Certificate: 180 kg CO₂ → NFT</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action"><span role="img" aria-label="grid">✅</span> Grid Active</button>
              <button className="eco-btn-action"><span role="img" aria-label="share">⚡</span> Share</button>
              <button className="eco-btn-action"><span role="img" aria-label="wallet">🔗</span> Connect Wallet</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header (identical to Dashboard) */}
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
            <li><Link to="/energy" className="menu-link active">Energy Management</Link></li>
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
      {/* Main Content (Dashboard grid/cards style) */}
      <main className="eco-dashboard-main">
        <div className="eco-dashboard-grid">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cardOrder}
              strategy={rectSortingStrategy}
            >
              <div className="eco-dashboard-grid">
                {cardOrder.map((cardId) => (
                  <SortableCard key={cardId} id={cardId}>
                    {renderCard(cardId)}
                  </SortableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </main>
    </div>
  );
};

export default Energy; 