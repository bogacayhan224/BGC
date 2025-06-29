import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Leaf, ClipboardCheck, AlertTriangle, AlertCircle, Info, Wrench, Settings, Share2, TrendingUp, Download } from 'lucide-react';
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

const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const [cardOrder, setCardOrder] = useState([
    'resource-usage',
    'carbon-footprint',
    'compliance',
    'anomaly-logs',
    'maintenance-history',
    'custom-report',
    'share-collaborate',
    'benchmarking',
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
    { id: 1, level: 'info', message: 'Monthly report generated.', time: '5 min ago' },
    { id: 2, level: 'warning', message: 'Compliance check required.', time: '1 hour ago' }
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
    const savedOrder = localStorage.getItem('reportsCardOrder');
    if (savedOrder) {
      setCardOrder(JSON.parse(savedOrder));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reportsCardOrder', JSON.stringify(cardOrder));
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
      case 'resource-usage':
        return (
          <div className="eco-card">
            <div className="eco-card-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, width: '100%'}}>
                <Activity className="eco-card-icon" />
                <span className="eco-card-title">Resource Usage Dashboard</span>
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12, width: '100%'}}>
                <select className="eco-dropdown">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Custom</option>
                </select>
                <div className="btn-group" style={{display: 'flex', gap: 4}}>
                  <button className="eco-btn-action active">Energy</button>
                  <button className="eco-btn-action">Water</button>
                  <button className="eco-btn-action">Waste</button>
                </div>
                <button className="eco-btn-action" style={{display: 'flex', alignItems: 'center', gap: 4}}><Download size={16} />Export Chart</button>
              </div>
            </div>
            <div className="eco-card-list" style={{padding: 12}}>
              <div style={{height: 180, background: '#f3f4f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3a3a3', fontSize: 18}}>
                [Resource Usage Chart Placeholder]
              </div>
            </div>
          </div>
        );
      case 'carbon-footprint':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Leaf className="eco-card-icon" />
              <span className="eco-card-title">Carbon Footprint</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Total CO₂ Offset:</span> <span className="value">2.5 tons</span></li>
              <li><span className="label">Water Saved:</span> <span className="value">5,000 L</span></li>
              <li><span className="label">Waste Diverted:</span> <span className="value">150 kg</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Footprint Breakdown</button>
              <button className="eco-btn-action">Export Report</button>
            </div>
          </div>
        );
      case 'compliance':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <ClipboardCheck className="eco-card-icon" />
              <span className="eco-card-title">Regulatory Compliance</span>
            </div>
            <div className="eco-card-list">
              <div>Generate reports for local regulations.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Generate Report</button>
              <button className="eco-btn-action">Compliance Checklist</button>
            </div>
          </div>
        );
      case 'anomaly-logs':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <AlertTriangle className="eco-card-icon" />
              <span className="eco-card-title">Anomaly & Event Logs</span>
            </div>
            <div className="eco-card-list">
              <div className="log-item warning" style={{display: 'flex', alignItems: 'center', gap: 8, background: '#fffbe6', borderRadius: 8, padding: 8, marginBottom: 8}}>
                <AlertCircle style={{color: '#fbbf24'}} />
                <span>Water pump unusual vibration.</span>
                <span className="log-timestamp">2024-06-26 14:30</span>
              </div>
              <div className="log-item info" style={{display: 'flex', alignItems: 'center', gap: 8, background: '#e0f2fe', borderRadius: 8, padding: 8, marginBottom: 8}}>
                <Info style={{color: '#38bdf8'}} />
                <span>Compost temperature low.</span>
                <span className="log-timestamp">2024-06-25 08:00</span>
              </div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Filter Events</button>
              <button className="eco-btn-action">Export Log</button>
            </div>
          </div>
        );
      case 'maintenance-history':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Wrench className="eco-card-icon" />
              <span className="eco-card-title">Maintenance History</span>
            </div>
            <div className="eco-card-list">
              <div>View past service records and schedules.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">View Maintenance Log</button>
              <button className="eco-btn-action">Schedule Maintenance</button>
            </div>
          </div>
        );
      case 'custom-report':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Settings className="eco-card-icon" />
              <span className="eco-card-title">Custom Report Builder</span>
            </div>
            <div className="eco-card-list">
              <div>Create personalized reports with specific metrics.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">New Report</button>
              <button className="eco-btn-action">Saved Templates</button>
            </div>
          </div>
        );
      case 'share-collaborate':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Share2 className="eco-card-icon" />
              <span className="eco-card-title">Share & Collaborate</span>
            </div>
            <div className="eco-card-list">
              <div>Share reports with others or invite collaborators.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Share Report</button>
              <button className="eco-btn-action">Collaborate</button>
            </div>
          </div>
        );
      case 'benchmarking':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <TrendingUp className="eco-card-icon" />
              <span className="eco-card-title">Performance Benchmarking</span>
            </div>
            <div className="eco-card-list">
              <div>Compare your system performance to benchmarks.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">View Analysis</button>
              <button className="eco-btn-action">Select Benchmark</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header (modern style, aynı Energy/Water/Waste/Predictive/Automation) */}
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
            <li><Link to="/predictive_maintenance" className="menu-link">Predictive Maintenance</Link></li>
            <li><Link to="/automation_settings" className="menu-link">Automation & Settings</Link></li>
            <li><Link to="/reports_analytics" className="menu-link active">Reports & Analytics</Link></li>
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
            <span className="sr-only">Logout</span>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
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

export default ReportsAnalytics; 