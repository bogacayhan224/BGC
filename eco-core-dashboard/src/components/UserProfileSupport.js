import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Bell, Book, LifeBuoy, MessageSquare, GraduationCap, Users, Lock } from 'lucide-react';
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

const UserProfileSupport = () => {
  const navigate = useNavigate();
  const [cardOrder, setCardOrder] = useState([
    'user-profile',
    'notification-preferences',
    'help-center',
    'contact-support',
    'feedback',
    'education',
    'community',
    'privacy',
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
    { id: 1, level: 'info', message: 'Profile updated successfully.', time: '2 min ago' },
    { id: 2, level: 'warning', message: 'Unusual login detected.', time: '1 hour ago' }
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
    const savedOrder = localStorage.getItem('profileCardOrder');
    if (savedOrder) {
      setCardOrder(JSON.parse(savedOrder));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('profileCardOrder', JSON.stringify(cardOrder));
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
      case 'user-profile':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <User className="eco-card-icon" />
              <span className="eco-card-title">User Profile</span>
            </div>
            <ul className="eco-card-list">
              <li><span className="label">Name:</span> <span className="value">John Doe</span></li>
              <li><span className="label">Email:</span> <span className="value">john.doe@example.com</span></li>
              <li><span className="label">Role:</span> <span className="value">Homeowner</span></li>
            </ul>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Edit Profile</button>
              <button className="eco-btn-action">Change Password</button>
            </div>
          </div>
        );
      case 'notification-preferences':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Bell className="eco-card-icon" />
              <span className="eco-card-title">Notification Preferences</span>
            </div>
            <div className="eco-card-list" style={{gap: 12}}>
              <div className="control-item" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 relative transition-all">
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                  <span className="ml-2 text-sm">Critical Alerts (Push)</span>
                </label>
              </div>
              <div className="control-item" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 relative transition-all">
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                  <span className="ml-2 text-sm">Weekly Reports (Email)</span>
                </label>
              </div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Alert History</button>
            </div>
          </div>
        );
      case 'help-center':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Book className="eco-card-icon" />
              <span className="eco-card-title">Help Center</span>
            </div>
            <div className="eco-card-list">
              <div>Browse user guides, FAQs, and tutorials.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Browse Help Center</button>
              <button className="eco-btn-action">Quick Start Guide</button>
            </div>
          </div>
        );
      case 'contact-support':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <LifeBuoy className="eco-card-icon" />
              <span className="eco-card-title">Contact Support</span>
            </div>
            <div className="eco-card-list">
              <div>Get in touch with our support team.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Submit Ticket</button>
              <button className="eco-btn-action">Live Chat</button>
            </div>
          </div>
        );
      case 'feedback':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <MessageSquare className="eco-card-icon" />
              <span className="eco-card-title">Feedback & Suggestions</span>
            </div>
            <div className="eco-card-list">
              <div>Share your ideas or report issues.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Submit Feedback</button>
              <button className="eco-btn-action">Vote on Features</button>
            </div>
          </div>
        );
      case 'education':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <GraduationCap className="eco-card-icon" />
              <span className="eco-card-title">Educational Resources</span>
            </div>
            <div className="eco-card-list">
              <div>Learn more about sustainable living.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Browse Articles</button>
              <button className="eco-btn-action">Watch Tutorials</button>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Users className="eco-card-icon" />
              <span className="eco-card-title">Community & Forums</span>
            </div>
            <div className="eco-card-list">
              <div>Connect with other Eco-Core users.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Join Community</button>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="eco-card">
            <div className="eco-card-header">
              <Lock className="eco-card-icon" />
              <span className="eco-card-title">Privacy & Security</span>
            </div>
            <div className="eco-card-list">
              <div>Manage your data and privacy settings.</div>
            </div>
            <div className="eco-card-actions">
              <button className="eco-btn-action">Privacy Policy</button>
              <button className="eco-btn-action">Data Export/Delete</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-screen">
      {/* Header (modern style, aynı Energy/Water/Waste/Predictive/Automation/Reports) */}
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
            <li><Link to="/reports_analytics" className="menu-link">Reports & Analytics</Link></li>
            <li><Link to="/user_profile_support" className="menu-link active">User Profile & Support</Link></li>
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

export default UserProfileSupport; 