// Global data object, to be populated from the backend
let mockData = {};

// Chart instances
let batteryChart, solarChart, windChart, ecoScoreRingChart;

// Function to get CSS variable
const getCssVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

// Initialize application on DOM content load
document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    // If no token, redirect to login page
    window.location.href = 'login.html';
    return; // Stop execution
  }

  try {
    // Fetch initial data from the backend API with the token
    const response = await fetch('http://localhost:3000/api/dashboard/initial', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      // If token is invalid or expired, redirect to login
      localStorage.removeItem('jwtToken');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    mockData = await response.json();

    // Initialize all components with the fetched data only if mockData is available
    if (mockData) {
      lucide.createIcons();
      initializeCharts();
      initializeUI();
      initializeControls();
      initializeAlerts();
      
      // Connect to the backend for real-time updates
      initializeSocket();
    }

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('jwtToken');
      window.location.href = 'login.html';
    });
    
    console.log('ECO-CORE Dashboard initialized with data from backend');

  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.style.cssText = 'color: red; text-align: center; padding: 50px;';
    errorMessageDiv.innerHTML = `<h1>Error</h1><p>Could not connect to the ECO-CORE backend.</p><p>Please ensure the backend server is running and accessible.</p>`;
    document.body.prepend(errorMessageDiv); // Prepend to show at the top
  }
});

// --- WebSocket Connection ---
function initializeSocket() {
  const socket = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('Connected to backend via WebSocket');
  });

  socket.on('update-data', (data) => {
    console.log('Received data update:', data);
    // Update the global data object with the new data from the server
    mockData = data;
    
    // Re-render the UI components with the new data
    updateEnergyValues();
    updateWaterSystem();
    updateWasteSystem();
    updateEcoScore();
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket');
  });
}

// --- UI Initialization and Update Functions ---

function initializeCharts() {
  // Battery Chart (Doughnut)
  const batteryCtx = document.getElementById('batteryChart').getContext('2d');
  batteryChart = new Chart(batteryCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [mockData.energy.battery, 100 - mockData.energy.battery],
        backgroundColor: [getCssVariable('--current-primary-color'), getCssVariable('--color-chart-doughnut-bg')],
        borderWidth: 0,
        cutout: '70%'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
  });

  // Solar Chart (Bar)
  const solarCtx = document.getElementById('solarChart').getContext('2d');
  solarChart = new Chart(solarCtx, {
    type: 'bar',
    data: {
      labels: ['Solar'],
      datasets: [{ data: [mockData.energy.solar], backgroundColor: [getCssVariable('--current-primary-color')], borderRadius: 4, maxBarThickness: 40 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, max: 1000 } } }
  });

  // Wind Chart (Bar)
  const windCtx = document.getElementById('windChart').getContext('2d');
  windChart = new Chart(windCtx, {
    type: 'bar',
    data: {
      labels: ['Wind'],
      datasets: [{ data: [mockData.energy.wind], backgroundColor: [getCssVariable('--current-primary-color')], borderRadius: 4, maxBarThickness: 40 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, max: 500 } } }
  });

  // Eco Score Ring Gauge
  const ecoScoreCtx = document.getElementById('ecoScoreRingChart').getContext('2d');
  ecoScoreRingChart = new Chart(ecoScoreCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [mockData.ecoScore.score, 100 - mockData.ecoScore.score],
        backgroundColor: [getEcoScoreColor(mockData.ecoScore.score), getCssVariable('--current-secondary-color')],
        borderWidth: 0,
        cutout: '80%'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
  });
}

function initializeUI() {
  updateEnergyValues();
  updateWaterSystem();
  updateWasteSystem();
  updateEcoScore();
}

function updateEnergyValues() {
  if (!mockData || !mockData.energy) {
    console.warn('mockData or mockData.energy is not available. Cannot update energy values.');
    return;
  }

  const batteryValueElement = document.getElementById('batteryValue');
  if (batteryValueElement && typeof mockData.energy.battery !== 'undefined') {
    batteryValueElement.textContent = `${mockData.energy.battery}%`;
  } else if (batteryValueElement) {
    batteryValueElement.textContent = 'N/A';
  }

  const solarValueElement = document.getElementById('solarValue');
  if (solarValueElement && typeof mockData.energy.solar !== 'undefined') {
    solarValueElement.textContent = `${mockData.energy.solar}W`;
  } else if (solarValueElement) {
    solarValueElement.textContent = 'N/A';
  }

  const windValueElement = document.getElementById('windValue');
  if (windValueElement && typeof mockData.energy.wind !== 'undefined') {
    windValueElement.textContent = `${mockData.energy.wind}W`;
  } else if (windValueElement) {
    windValueElement.textContent = 'N/A';
  }
  
  if (batteryChart && typeof mockData.energy.battery !== 'undefined') {
    batteryChart.data.datasets[0].data = [mockData.energy.battery, 100 - mockData.energy.battery];
    batteryChart.data.datasets[0].backgroundColor[0] = getBatteryColor(mockData.energy.battery);
    batteryChart.update('none');
  }
  
  if (solarChart && typeof mockData.energy.solar !== 'undefined') {
    solarChart.data.datasets[0].data = [mockData.energy.solar];
    solarChart.update('none');
  }
  
  if (windChart && typeof mockData.energy.wind !== 'undefined') {
    windChart.data.datasets[0].data = [mockData.energy.wind];
    windChart.update('none');
  }
}

function updateWaterSystem() {
  if (!mockData || !mockData.water) {
    console.warn('mockData or mockData.water is not available. Cannot update water system.');
    return;
  }

  const tankFillElement = document.getElementById('tankFill');
  if (tankFillElement && typeof mockData.water.tankLevel !== 'undefined') {
    tankFillElement.style.height = `${mockData.water.tankLevel}%`;
  }

  const tankPercentageElement = document.getElementById('tankPercentage');
  if (tankPercentageElement && typeof mockData.water.tankLevel !== 'undefined') {
    tankPercentageElement.textContent = `${mockData.water.tankLevel}%`;
  }

  const filterStatusElement = document.getElementById('filterStatus');
  if (filterStatusElement && typeof mockData.water.filterStatus !== 'undefined') {
    filterStatusElement.textContent = mockData.water.filterStatus;
    filterStatusElement.className = `status ${mockData.water.filterStatus === 'OK' ? 'status--success' : 'status--warning'}`;
  }

  const dailyUsageElement = document.getElementById('dailyUsage');
  if (dailyUsageElement && typeof mockData.water.dailyUsage !== 'undefined') {
    dailyUsageElement.textContent = `${mockData.water.dailyUsage}L`;
  }
}

function updateWasteSystem() {
  if (!mockData || !mockData.waste) {
    console.warn('mockData or mockData.waste is not available. Cannot update waste system.');
    return;
  }

  const tempPercentage = Math.min(Math.max((mockData.waste.temperature - 20) / 30 * 100, 0), 100);
  const tempFillElement = document.getElementById('tempFill');
  if (tempFillElement && typeof mockData.waste.temperature !== 'undefined') {
    tempFillElement.style.height = `${tempPercentage}%`;
  }

  const tempValueElement = document.getElementById('tempValue');
  if (tempValueElement && typeof mockData.waste.temperature !== 'undefined') {
    tempValueElement.textContent = `${mockData.waste.temperature}°C`;
  }

  const compostStatusElement = document.getElementById('compostStatus');
  if (compostStatusElement && typeof mockData.waste.status !== 'undefined') {
    compostStatusElement.textContent = mockData.waste.status;
  }

  const compostProgressElement = document.getElementById('compostProgress');
  if (compostProgressElement && typeof mockData.waste.compostProgress !== 'undefined') {
    compostProgressElement.style.width = `${mockData.waste.compostProgress}%`;
  }
}

function updateEcoScore() {
  if (!mockData || !mockData.ecoScore) {
    console.warn('mockData or mockData.ecoScore is not available. Cannot update eco score.');
    return;
  }

  const ecoRatingElement = document.getElementById('ecoRating');
  if (ecoRatingElement && typeof mockData.ecoScore.ecoRating !== 'undefined') {
    ecoRatingElement.textContent = mockData.ecoScore.ecoRating;
  }

  const energySavedElement = document.getElementById('energySaved');
  if (energySavedElement && typeof mockData.ecoScore.weeklyEnergySaved !== 'undefined') {
    energySavedElement.textContent = `${mockData.ecoScore.weeklyEnergySaved} kWh`;
  }

  const carbonOffsetElement = document.getElementById('carbonOffset');
  if (carbonOffsetElement && typeof mockData.ecoScore.carbonOffset !== 'undefined') {
    carbonOffsetElement.textContent = `${mockData.ecoScore.carbonOffset} kg CO₂`;
  }
  
  if (ecoScoreRingChart && typeof mockData.ecoScore.score !== 'undefined') {
    ecoScoreRingChart.data.datasets[0].data = [mockData.ecoScore.score, 100 - mockData.ecoScore.score];
    ecoScoreRingChart.data.datasets[0].backgroundColor[0] = getEcoScoreColor(mockData.ecoScore.score);
    ecoScoreRingChart.update('none');
    const ecoScoreValueElement = document.querySelector('.eco-score-value');
    if (ecoScoreValueElement) {
      ecoScoreValueElement.textContent = mockData.ecoScore.score;
    }
  }

  const achievementsContainer = document.getElementById('achievements');
  if (achievementsContainer && mockData.ecoScore.achievements) {
    achievementsContainer.innerHTML = '';
    mockData.ecoScore.achievements.forEach(achievement => {
      const badge = document.createElement('div');
      badge.className = 'achievement-badge';
      badge.innerHTML = `<i data-lucide="award"></i><span>${achievement}</span>`;
      achievementsContainer.appendChild(badge);
    });
    lucide.createIcons();
  }
}

function initializeControls() {
  const heaterToggle = document.getElementById('heaterToggle');
  heaterToggle.checked = mockData.controls.heater;
  heaterToggle.addEventListener('change', function() {
    mockData.controls.heater = this.checked;
    console.log(`Heater ${this.checked ? 'ON' : 'OFF'}`);
  });

  const rainwaterToggle = document.getElementById('rainwaterToggle');
  rainwaterToggle.checked = mockData.controls.rainwater;
  rainwaterToggle.addEventListener('change', function() {
    mockData.controls.rainwater = this.checked;
    console.log(`Rainwater Collection ${this.checked ? 'ON' : 'OFF'}`);
  });
  
  const greywaterBtn = document.getElementById('greywaterBtn');
  greywaterBtn.addEventListener('click', function() {
    this.textContent = 'Flushing...';
    this.disabled = true;
    setTimeout(() => {
      this.innerHTML = '<i data-lucide="droplets"></i>Force Greywater Flush';
      this.disabled = false;
      lucide.createIcons();
    }, 3000);
  });
}

function initializeAlerts() {
  updateAlerts();
}

function updateAlerts() {
  const alertsList = document.getElementById('alertsList');
  const alertCount = document.getElementById('alertCount');
  const activeAlerts = mockData.alerts.filter(alert => !alert.acknowledged && !alert.muted);
  alertCount.textContent = `${activeAlerts.length} Active`;
  alertsList.innerHTML = '';
  
  mockData.alerts.forEach(alert => {
    const alertItem = document.createElement('div');
    alertItem.className = `alert-item ${alert.level}`;
    if (alert.acknowledged) alertItem.classList.add('acknowledged');
    if (alert.muted) alertItem.classList.add('muted');
    
    alertItem.innerHTML = `
      <div class="alert-content">
        <div class="alert-message">${alert.message}</div>
        <div class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
      </div>
      <div class="alert-actions">
        ${!alert.acknowledged ? `<button class="btn btn--sm btn--secondary acknowledge" onclick="acknowledgeAlert(${alert.id})">Acknowledge</button>` : ''}
        ${!alert.muted ? `<button class="btn btn--sm btn--secondary mute" onclick="muteAlert(${alert.id})">Mute</button>` : `<button class="btn btn--sm btn--secondary mute" onclick="unmuteAlert(${alert.id})">Unmute</button>`}
      </div>
    `;
    alertsList.appendChild(alertItem);
  });
}

function acknowledgeAlert(alertId) {
  const alert = mockData.alerts.find(a => a.id === alertId); 
  if (alert) {
    alert.acknowledged = true; 
    const alertItem = document.querySelector(`.alert-item.${alert.level} .alert-actions button[onclick="acknowledgeAlert(${alert.id})"]`).closest('.alert-item');
    if (alertItem) {
      alertItem.style.opacity = '0';
      setTimeout(() => {
        updateAlerts();
      }, 300);
    }
  }
}

function muteAlert(alertId) {
  const alert = mockData.alerts.find(a => a.id === alertId); if (alert) { alert.muted = true; updateAlerts(); }
}

function unmuteAlert(alertId) {
  const alert = mockData.alerts.find(a => a.id === alertId); if (alert) { alert.muted = false; updateAlerts(); }
}

function getBatteryColor(percentage) {
  if (percentage >= 80) return getCssVariable('--current-success-color');
  if (percentage >= 50) return getCssVariable('--current-warning-color');
  return getCssVariable('--current-error-color');
}

function getEcoScoreColor(score) {
  if (score >= 80) return getCssVariable('--current-success-color');
  if (score >= 50) return getCssVariable('--current-warning-color');
  return getCssVariable('--current-error-color');
}

// Make functions globally available for onclick handlers
    window.acknowledgeAlert = acknowledgeAlert;
    window.muteAlert = muteAlert;
    window.unmuteAlert = unmuteAlert;

    // Global error handler for debugging
    window.onerror = function(message, source, lineno, colno, error) {
        console.log("Global Error:", message, "at", source + ":" + lineno);
    };