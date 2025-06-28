
// Using the same mock data structure from the frontend for now.
// In the future, this will be fetched from the database.
const mockData = {
  energy: {
    battery: 84,
    solar: 850,
    wind: 310,
    dailyProduction: 18.5,
    weeklyProduction: 125.8
  },
  water: {
    tankLevel: 60,
    filterStatus: "OK",
    dailyUsage: 145,
    weeklyUsage: 987
  },
  waste: {
    temperature: 38,
    status: "Active Composting",
    lastEmptied: "2025-06-20",
    compostProgress: 75
  },
  alerts: [
    {
      id: 1,
      level: "warning",
      message: "Greywater tank low – check filter system",
      timestamp: "2025-06-26T21:30:00",
      acknowledged: false,
      muted: false
    },
    {
      id: 2,
      level: "critical",
      message: "Compost fan needs restart – temperature rising",
      timestamp: "2025-06-26T20:15:00",
      acknowledged: false,
      muted: false
    },
    {
      id: 3,
      level: "info",
      message: "Solar panel cleaning recommended for optimal efficiency",
      timestamp: "2025-06-26T18:45:00",
      acknowledged: true,
      muted: false
    }
  ],
  controls: {
    heater: false,
    greywater: false
  },
  ecoScore: {
    weeklyEnergySaved: 42.5,
    carbonOffset: 28.3,
    ecoRating: "Excellent",
    achievements: ["Solar Warrior", "Water Saver", "Green Guardian"]
  }
};

const getInitialData = (req, res) => {
  res.status(200).json(mockData);
};

module.exports = {
  getInitialData,
};
