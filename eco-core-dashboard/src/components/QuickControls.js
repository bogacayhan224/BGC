import React, { useState } from 'react';
import './Dashboard.css';

const QuickControls = () => {
  const [heater, setHeater] = useState(false);
  const [rainwater, setRainwater] = useState(true);
  const [compostFan, setCompostFan] = useState(false);
  const [muteAlerts, setMuteAlerts] = useState(false);
  const [generatorMode, setGeneratorMode] = useState(false);
  const [energyMode, setEnergyMode] = useState('Eco');
  const [restartInProgress, setRestartInProgress] = useState(false);

  const handleRestart = () => {
    setRestartInProgress(true);
    setTimeout(() => {
      setRestartInProgress(false);
      window.alert('Restart complete!');
    }, 15000);
  };

  return (
    <div className="dashboard-card dashboard-card-controls" style={{padding: '2rem', borderRadius: 20}}>
      <div className="dashboard-card-header">
        <span style={{fontSize: '1.25rem', marginRight: 8}}>⚙️</span>
        <span className="dashboard-card-title">Quick Controls</span>
      </div>
      <div className="controls-list" style={{gap: 16}}>
        <ControlToggle
          icon="🔥"
          label="Heater"
          checked={heater}
          onChange={() => setHeater(v => !v)}
        />
        <ControlToggle
          icon="💧"
          label="Rainwater Roof"
          checked={rainwater}
          onChange={() => setRainwater(v => !v)}
        />
        <ControlToggle
          icon="🌬️"
          label="Compost Vent Fan"
          checked={compostFan}
          onChange={() => setCompostFan(v => !v)}
        />
        <ControlToggle
          icon="🔕"
          label="Mute Critical Alerts"
          checked={muteAlerts}
          onChange={() => setMuteAlerts(v => !v)}
        />
        <ControlToggle
          icon="🪫"
          label="Generator Mode"
          checked={generatorMode}
          onChange={() => setGeneratorMode(v => !v)}
        />
        <div className="control-item" style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15}}>
          <span style={{fontSize: '1.25rem', width: 32, textAlign: 'center'}}>🌱</span>
          <label style={{fontWeight: 500, fontSize: 15}}>Energy Mode</label>
          <select
            value={energyMode}
            onChange={e => setEnergyMode(e.target.value)}
            style={{marginLeft: 'auto', borderRadius: 8, padding: '4px 12px', fontSize: 15, height: 32}}
          >
            <option>Eco</option>
            <option>Max</option>
            <option>Critical</option>
          </select>
        </div>
        <button className="eco-btn-action" style={{
          background: '#FFC107', color: '#222', fontWeight: 600, fontSize: 15, borderRadius: 10, marginTop: 8, height: 40, minHeight: 40
        }}>
          <span style={{fontSize: '1.25rem', marginRight: 8}}>💧</span>
          Force Greywater Flush
        </button>
        <button
          className="eco-btn-action"
          style={{
            background: '#FFC107',
            color: '#222',
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 10,
            marginTop: 8,
            opacity: restartInProgress ? 0.7 : 1,
            cursor: restartInProgress ? 'not-allowed' : 'pointer',
            height: 40, minHeight: 40
          }}
          onClick={handleRestart}
          disabled={restartInProgress}
          title="Soft restart of network, dashboard, and relays (takes ~15 sec)"
        >
          <span style={{fontSize: '1.25rem', marginRight: 8}}>♻️</span>
          {restartInProgress ? 'Restarting...' : 'Restart System'}
        </button>
      </div>
    </div>
  );
};

const ControlToggle = ({ icon, label, checked, onChange }) => (
  <div className="control-item" style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '1rem'}}>
    <span style={{fontSize: '1.25rem', width: 32, textAlign: 'center'}}>{icon}</span>
    <label style={{fontWeight: 500, fontSize: 15, flex: 1}}>{label}</label>
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider"></span>
    </label>
  </div>
);

export default QuickControls; 