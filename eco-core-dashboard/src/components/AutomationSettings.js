import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Plus, Settings, Users, PlugZap, Activity, Save, RotateCcw, HelpCircle, Edit, Trash2 } from 'lucide-react';
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

const AutomationSettings = () => {
  const navigate = useNavigate();
  const [cardOrder, setCardOrder] = useState([
    'automation-rules',
    'system-preferences',
    'user-roles',
    'integration-devices',
    'system-health',
    'backup-restore',
    'system-reset',
    'help-support',
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
    { id: 1, level: 'info', message: 'System backup completed.', time: '10 min ago' },
    { id: 2, level: 'warning', message: 'Device integration pending.', time: '1 hour ago' }
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
    const savedOrder = localStorage.getItem('automationCardOrder');
    if (savedOrder) {
      setCardOrder(JSON.parse(savedOrder));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('automationCardOrder', JSON.stringify(cardOrder));
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
      case 'automation-rules':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Zap className="eco-card-icon" />
              <span className="eco-card-title">Automation Rules Management</span>
              <button className="eco-btn-action" style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4}}><Plus size={16} />Add New Rule</button>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div className="rule-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', borderRadius: 8, padding: 12}}>
                <div className="rule-summary">
                  <h4 style={{margin: 0}}>Nightly Power Save</h4>
                  <p style={{margin: 0}}>WHEN Time is 11:00 PM, IF Battery Level &gt; 40%, THEN Turn Heater Off.</p>
                </div>
                <div className="rule-actions" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 relative transition-all">
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                  <button className="eco-btn-action"><Edit size={16} /></button>
                  <button className="eco-btn-action"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'system-preferences':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Settings className="eco-card-icon" />
              <span className="eco-card-title">System Preferences</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div className="form-group">
                <label htmlFor="languageSelect" className="form-label">Language</label>
                <select id="languageSelect" className="eco-dropdown">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="unitsSelect" className="form-label">Units</label>
                <select id="unitsSelect" className="eco-dropdown">
                  <option>Metric</option>
                  <option>Imperial</option>
                </select>
              </div>
              <div className="eco-card-actions">
                <button className="eco-btn-action">Notification Settings</button>
              </div>
            </div>
          </div>
        );
      case 'user-roles':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Users className="eco-card-icon" />
              <span className="eco-card-title">User Roles & Permissions</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div className="user-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span>John Doe (Homeowner)</span>
                <button className="eco-btn-action">Edit</button>
              </div>
              <div className="user-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span>Guest User</span>
                <button className="eco-btn-action">Edit</button>
              </div>
              <div className="eco-card-actions">
                <button className="eco-btn-action">Add User</button>
              </div>
            </div>
          </div>
        );
      case 'integration-devices':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <PlugZap className="eco-card-icon" />
              <span className="eco-card-title">Integration & Devices</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div className="device-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span>Smart Plug 1 (Active)</span>
                <button className="eco-btn-action">Manage</button>
              </div>
              <div className="device-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span>Weather Station (Active)</span>
                <button className="eco-btn-action">Manage</button>
              </div>
              <div className="eco-card-actions">
                <button className="eco-btn-action">Add Device</button>
                <button className="eco-btn-action">Integration Settings</button>
              </div>
            </div>
          </div>
        );
      case 'system-health':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Activity className="eco-card-icon" />
              <span className="eco-card-title">System Health & Diagnostics</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div>Run a full system health check.</div>
              <div className="eco-card-actions">
                <button className="eco-btn-action">Run Diagnostics</button>
                <button className="eco-btn-action">View Reports</button>
              </div>
            </div>
          </div>
        );
      case 'backup-restore':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Save className="eco-card-icon" />
              <span className="eco-card-title">Backup & Restore</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div>Last backup: 2024-06-26 10:00 AM</div>
              <div className="eco-card-actions">
                <button className="eco-btn-action">Backup Now</button>
                <button className="eco-btn-action">Manage Backups</button>
              </div>
            </div>
          </div>
        );
      case 'system-reset':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <RotateCcw className="eco-card-icon" />
              <span className="eco-card-title">System Reset</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div>Restart or reset your system.</div>
              <div className="eco-card-actions">
                <button className="eco-btn-action">Soft Reset</button>
                <button className="eco-btn-action" style={{color: '#d32f2f'}}>Factory Reset</button>
              </div>
            </div>
          </div>
        );
      case 'help-support':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <HelpCircle className="eco-card-icon" />
              <span className="eco-card-title">Help & Support</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div>Find answers or contact support.</div>
              <div className="eco-card-actions">
                <button className="eco-btn-action">Help Center</button>
                <button className="eco-btn-action">Contact Support</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header (modern style, aynı Energy/Water/Waste/Predictive) */}
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
            <li><Link to="/automation_settings" className="menu-link active">Automation & Settings</Link></li>
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

export default AutomationSettings; 