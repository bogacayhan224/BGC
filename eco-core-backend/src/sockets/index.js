
let mockData = {}; // This will be initialized with the base data

// This function will be called from server.js with the io instance
const initializeSocket = (io) => {

  // Initialize with the same base data as the API
  // In a real app, you might fetch this from a database or a service
  mockData = {
    energy: { battery: 84, solar: 850, wind: 310, dailyProduction: 18.5, weeklyProduction: 125.8 },
    water: { tankLevel: 60, filterStatus: "OK", dailyUsage: 145, weeklyUsage: 987 },
    waste: { temperature: 38, status: "Active Composting", lastEmptied: "2025-06-20", compostProgress: 75 },
    alerts: [
      { id: 1, level: "warning", message: "Greywater tank low – check filter system", timestamp: "2025-06-26T21:30:00", acknowledged: false, muted: false },
      { id: 2, level: "critical", message: "Compost fan needs restart – temperature rising", timestamp: "2025-06-26T20:15:00", acknowledged: false, muted: false },
      { id: 3, level: "info", message: "Solar panel cleaning recommended for optimal efficiency", timestamp: "2025-06-26T18:45:00", acknowledged: true, muted: false }
    ],
    controls: { heater: false, greywater: false },
    ecoScore: { weeklyEnergySaved: 42.5, carbonOffset: 28.3, ecoRating: "Excellent", achievements: ["Solar Warrior", "Water Saver", "Green Guardian"] }
  };

  io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');

    // Send the initial data immediately upon connection
    socket.emit('initial-data', mockData);

    socket.on('disconnect', () => {
      console.log('User disconnected from WebSocket');
    });
  });

  // Start broadcasting data updates every 5 seconds
  setInterval(() => {
    simulateDataChanges();
    io.emit('update-data', mockData);
    console.log('Broadcasted data update');
  }, 5000);
};

// --- Data Simulation Logic (moved from frontend) ---

function simulateDataChanges() {
  simulateEnergyData();
  simulateWaterData();
  simulateWasteData();
  simulateEcoScore();
}

function simulateEnergyData() {
  mockData.energy.battery = Math.max(80, Math.min(90, mockData.energy.battery + (Math.random() - 0.5) * 2));
  mockData.energy.solar = Math.max(800, Math.min(900, mockData.energy.solar + (Math.random() - 0.5) * 100));
  mockData.energy.wind = Math.max(300, Math.min(350, mockData.energy.wind + (Math.random() - 0.5) * 50));
  mockData.energy.battery = Math.round(mockData.energy.battery);
  mockData.energy.solar = Math.round(mockData.energy.solar);
  mockData.energy.wind = Math.round(mockData.energy.wind);
}

function simulateWaterData() {
  mockData.water.tankLevel = Math.max(55, Math.min(65, mockData.water.tankLevel + (Math.random() - 0.5) * 1));
  mockData.water.dailyUsage = Math.max(140, Math.min(150, mockData.water.dailyUsage + (Math.random() - 0.5) * 2));
  mockData.water.tankLevel = Math.round(mockData.water.tankLevel);
  mockData.water.dailyUsage = Math.round(mockData.water.dailyUsage);
}

function simulateWasteData() {
  mockData.waste.temperature = Math.max(35, Math.min(40, mockData.waste.temperature + (Math.random() - 0.5) * 1));
  if (mockData.waste.compostProgress < 100) {
    mockData.waste.compostProgress = Math.min(100, mockData.waste.compostProgress + Math.random() * 0.5);
  }
  mockData.waste.temperature = Math.round(mockData.waste.temperature);
  mockData.waste.compostProgress = Math.round(mockData.waste.compostProgress);
}

function simulateEcoScore() {
  mockData.ecoScore.weeklyEnergySaved += Math.random() * 0.1;
  mockData.ecoScore.carbonOffset += Math.random() * 0.05;
  mockData.ecoScore.weeklyEnergySaved = Math.round(mockData.ecoScore.weeklyEnergySaved * 10) / 10;
  mockData.ecoScore.carbonOffset = Math.round(mockData.ecoScore.carbonOffset * 10) / 10;
}

module.exports = initializeSocket;
