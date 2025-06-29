import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Trash2, Leaf, Recycle, Flame, Bell, CalendarCheck, Award, Lightbulb, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
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

const Waste = () => {
  const navigate = useNavigate();
  const compostChartRef = useRef(null);
  const compostChartInstance = useRef(null);
  const [cardOrder, setCardOrder] = useState([
    'waste-stream',
    'organic-processing',
    'recycling-status',
    'thermal-valorization',
    'collection-alerts',
    'maintenance',
    'resource-recovery',
    'tips-education',
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
    { id: 1, level: 'warning', message: 'Organic bin is 75% full.', time: '2 min ago' },
    { id: 2, level: 'info', message: 'Recyclable bin ready for collection.', time: '5 min ago' }
  ];

  useEffect(() => {
    // Compost Chart
    if (compostChartRef.current) {
      compostChartInstance.current = new Chart(compostChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Composted', 'Remaining'],
          datasets: [{
            data: [62, 38],
            backgroundColor: ['#22c55e', '#e5e7eb'],
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
      if (compostChartInstance.current) compostChartInstance.current.destroy();
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

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('wasteCardOrder');
    if (savedOrder) {
      setCardOrder(JSON.parse(savedOrder));
    }
  }, []);

  // Save order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wasteCardOrder', JSON.stringify(cardOrder));
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
      case 'waste-stream':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Trash2 className="eco-card-icon" />
              <span className="eco-card-title">Waste Stream Overview</span>
              <button className="eco-btn-action" style={{marginLeft: 'auto'}}><RefreshCw size={16} style={{marginRight: 4}} />Refresh</button>
            </div>
            <ul className="eco-card-list">
              <li><Leaf size={16} style={{marginRight: 4}} /> Organic: <b>75%</b> <span className="status status--info">Processing</span></li>
              <li><Recycle size={16} style={{marginRight: 4}} /> Recyclable: <b>40%</b> <span className="status status--success">Ready</span></li>
              <li><Flame size={16} style={{marginRight: 4}} /> Residual: <b>20%</b> <span className="status status--warning">Standby</span></li>
            </ul>
          </div>
        );
      case 'organic-processing':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Leaf className="eco-card-icon" />
              <span className="eco-card-title">Organic Processing</span>
            </div>
            <div className="eco-card-chart-small">
              <canvas ref={compostChartRef}></canvas>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Temperature:</span> <span className="value">62°C</span></li>
              <li><span className="label">Humidity:</span> <span className="value">55%</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Pause Processing</button>
              <button className="eco-btn-action">Log Feedstock</button>
            </div>
          </div>
        );
      case 'recycling-status':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Recycle className="eco-card-icon" />
              <span className="eco-card-title">Recycling Status</span>
            </div>
            <ul className="eco-card-list">
              <li>Paper: <b>60%</b></li>
              <li>Plastic: <b>30%</b></li>
              <li>Glass: <b>50%</b></li>
              <li>Metal: <b>25%</b></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Sorting Guide</button>
              <button className="eco-btn-action">Schedule Collection</button>
            </div>
          </div>
        );
      case 'thermal-valorization':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Flame className="eco-card-icon" />
              <span className="eco-card-title">Thermal Valorization</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Status:</span> <span className="status status--info">Inactive</span></li>
              <li><span className="label">Energy Recovered:</span> <span className="value">12.5 kWh</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Activate</button>
              <button className="eco-btn-action">Energy Dashboard</button>
            </div>
          </div>
        );
      case 'collection-alerts':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Bell className="eco-card-icon" />
              <span className="eco-card-title">Collection Alerts</span>
            </div>
            <div className="eco-card-list">
              <div className="alert-item warning" style={{display: 'flex', alignItems: 'center', gap: 8, background: '#fffbe6', borderRadius: 8, padding: 8, marginBottom: 8}}>
                <AlertTriangle size={18} style={{color: '#fbbf24'}} />
                <span>Organic bin is 75% full.</span>
                <button className="eco-btn-action">Request Collection</button>
              </div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Configure Alerts</button>
            </div>
          </div>
        );
      case 'maintenance':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <CalendarCheck className="eco-card-icon" />
              <span className="eco-card-title">Maintenance</span>
            </div>
            <ul className="eco-card-list">
              <li>Next task: Turn compost in 2 days.</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">View Schedule</button>
              <button className="eco-btn-action">Log Task</button>
            </div>
          </div>
        );
      case 'resource-recovery':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Award className="eco-card-icon" />
              <span className="eco-card-title">Resource Recovery</span>
            </div>
            <ul className="eco-card-list">
              <li>Compost Produced: <b>25 kg</b></li>
              <li>Energy Recovered: <b>12.5 kWh</b></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Export Data</button>
            </div>
          </div>
        );
      case 'tips-education':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Lightbulb className="eco-card-icon" />
              <span className="eco-card-title">Tips & Education</span>
            </div>
            <ul className="eco-card-list">
              <li>Learn how to reduce waste and improve your sustainability practices.</li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Browse Tips</button>
              <button className="eco-btn-action">Quick Guide</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header (modern style, same as Energy/Water) */}
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
            <li><Link to="/waste" className="menu-link active">Waste Management</Link></li>
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

export default Waste; 