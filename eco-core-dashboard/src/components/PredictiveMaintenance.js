import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, BatteryCharging, Droplets, Wind, Leaf, AlertCircle, AlertTriangle, TrendingUp, CalendarCheck, Wrench, Bell, Info, Activity, Cloud, LogOut } from 'lucide-react';
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

const PredictiveMaintenance = () => {
  const navigate = useNavigate();
  const [cardOrder, setCardOrder] = useState([
    'health-overview',
    'fault-detection',
    'predictive-forecasting',
    'maintenance-log',
    'diagnostics',
    'alerts-center',
    'performance-analytics',
    'edge-ai',
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
    { id: 1, level: 'critical', message: 'High vibration detected on Water Pump 1.', time: '2 min ago' },
    { id: 2, level: 'warning', message: 'Solar Inverter temperature spike.', time: '5 min ago' }
  ];

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

  useEffect(() => {
    const savedOrder = localStorage.getItem('predictiveCardOrder');
    if (savedOrder) {
      setCardOrder(JSON.parse(savedOrder));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('predictiveCardOrder', JSON.stringify(cardOrder));
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

  const renderCard = (cardId) => {
    switch (cardId) {
      case 'health-overview':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <HeartPulse className="eco-card-icon" />
              <span className="eco-card-title">Equipment Health Overview</span>
              <select className="eco-dropdown" style={{marginLeft: 'auto'}}>
                <option>All Components</option>
                <option>Pumps</option>
                <option>Batteries</option>
                <option>Filters</option>
              </select>
            </div>
            <div className="eco-card-list" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12}}>
              <div className="health-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                <BatteryCharging className="status--success" />
                <span className="health-label">Main Battery</span>
                <span className="health-status status--success">Excellent</span>
              </div>
              <div className="health-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                <Droplets className="status--warning" />
                <span className="health-label">Water Filter</span>
                <span className="health-status status--warning">Degraded</span>
              </div>
              <div className="health-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                <Wind className="status--info" />
                <span className="health-label">Wind Turbine</span>
                <span className="health-status status--info">Good</span>
              </div>
              <div className="health-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                <Leaf className="status--success" />
                <span className="health-label">Compost Digester</span>
                <span className="health-status status--success">Optimal</span>
              </div>
            </div>
          </div>
        );
      case 'fault-detection':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <AlertCircle className="eco-card-icon" />
              <span className="eco-card-title">Fault Detection & Anomalies</span>
            </div>
            <div className="eco-card-list">
              <div className="alert-item critical" style={{display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', borderRadius: 8, padding: 8, marginBottom: 8}}>
                <AlertTriangle style={{color: '#ef4444'}} />
                <div>
                  <div className="alert-message">High vibration detected on Water Pump 1.</div>
                  <div className="alert-timestamp">2024-06-27 14:30</div>
                </div>
                <button className="eco-btn-action">Acknowledge</button>
              </div>
              <div className="alert-item warning" style={{display: 'flex', alignItems: 'center', gap: 8, background: '#fffbe6', borderRadius: 8, padding: 8, marginBottom: 8}}>
                <AlertTriangle style={{color: '#fbbf24'}} />
                <div>
                  <div className="alert-message">Solar Inverter temperature spike.</div>
                  <div className="alert-timestamp">2024-06-27 10:15</div>
                </div>
                <button className="eco-btn-action">Acknowledge</button>
              </div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Alert Settings</button>
            </div>
          </div>
        );
      case 'predictive-forecasting':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <TrendingUp className="eco-card-icon" />
              <span className="eco-card-title">Predictive Forecasting</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Water Filter:</span> <span className="value status--warning">RUL: 30 days</span></li>
              <li><span className="label">Battery Bank:</span> <span className="value status--success">RUL: 5 years</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Forecast Report</button>
              <button className="eco-btn-action">Maintenance Recommendations</button>
            </div>
          </div>
        );
      case 'maintenance-log':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <CalendarCheck className="eco-card-icon" />
              <span className="eco-card-title">Maintenance Schedule & Log</span>
            </div>
            <ul className="eco-card-list">
              <li>Upcoming: Water Filter Change (July 15)</li>
              <li>Last: Battery Check (June 1)</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Schedule New Task</button>
              <button className="eco-btn-action">View Log</button>
            </div>
          </div>
        );
      case 'diagnostics':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Wrench className="eco-card-icon" />
              <span className="eco-card-title">Diagnostics & Troubleshooting</span>
            </div>
            <ul className="eco-card-list">
              <li>Run automated checks or find solutions.</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Run Diagnostics</button>
              <button className="eco-btn-action">Contact Support</button>
            </div>
          </div>
        );
      case 'alerts-center':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Bell className="eco-card-icon" />
              <span className="eco-card-title">Alerts & Notifications</span>
            </div>
            <div className="eco-card-list">
              <div className="alert-item info" style={{display: 'flex', alignItems: 'center', gap: 8, background: '#e0f2fe', borderRadius: 8, padding: 8, marginBottom: 8}}>
                <Info style={{color: '#38bdf8'}} />
                <div>
                  <div className="alert-message">Compost temperature is low.</div>
                  <div className="alert-timestamp">2024-06-26 08:00</div>
                </div>
              </div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Filter Alerts</button>
              <button className="eco-btn-action">Notification Settings</button>
            </div>
          </div>
        );
      case 'performance-analytics':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Activity className="eco-card-icon" />
              <span className="eco-card-title">Performance Analytics</span>
            </div>
            <ul className="eco-card-list">
              <li>View historical performance and trends.</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">View Dashboard</button>
              <button className="eco-btn-action">Export Data</button>
            </div>
          </div>
        );
      case 'edge-ai':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Cloud className="eco-card-icon" />
              <span className="eco-card-title">Edge AI & Cloud Analytics</span>
            </div>
            <ul className="eco-card-list">
              <li>Leveraging advanced analytics for predictions.</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Configure Integration</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header (modern style, aynı Energy/Water/Waste) */}
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
            <li><Link to="/water" className="menu-link">Water Management</Link></li>
            <li><Link to="/waste" className="menu-link">Waste Management</Link></li>
            <li><Link to="/predictive_maintenance" className="menu-link active">Predictive Maintenance</Link></li>
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

export default PredictiveMaintenance; 