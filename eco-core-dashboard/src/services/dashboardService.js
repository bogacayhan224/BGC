import api from './api';

// Mock data for development/testing
const mockDashboardData = {
  energy: {
    battery: 85,
    solar: 1200,
    wind: 800,
    dailyProduction: 45.2
  },
  water: {
    tankLevel: 72,
    filterStatus: 'OK',
    dailyUsage: 180
  },
  waste: {
    temperature: 42,
    status: 'Active',
    compostProgress: 65
  },
  ecoScore: {
    weeklyEnergySaved: 28.5,
    carbonOffset: 12.3,
    ecoRating: 'A+'
  },
  alerts: [
    {
      id: 1,
      level: 'info',
      message: 'Solar panel efficiency at 95%',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      level: 'warning',
      message: 'Water tank level below 80%',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  controls: {
    heater: true,
    greywater: false
  }
};

const dashboardService = {
  // Get initial dashboard data
  async getInitialData() {
    try {
      // For development, return mock data if backend is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock dashboard data for development');
        return mockDashboardData;
      }
      
      const response = await api.get('/api/dashboard/initial');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return mock data if backend fails
      console.log('Backend unavailable, using mock data');
      return mockDashboardData;
    }
  },

  // Get energy data
  async getEnergyData() {
    try {
      const response = await api.get('/api/dashboard/initial');
      return response.data.energy;
    } catch (error) {
      console.error('Error fetching energy data:', error);
      return mockDashboardData.energy;
    }
  },

  // Get water data
  async getWaterData() {
    try {
      const response = await api.get('/api/dashboard/initial');
      return response.data.water;
    } catch (error) {
      console.error('Error fetching water data:', error);
      return mockDashboardData.water;
    }
  },

  // Get waste data
  async getWasteData() {
    try {
      const response = await api.get('/api/dashboard/initial');
      return response.data.waste;
    } catch (error) {
      console.error('Error fetching waste data:', error);
      return mockDashboardData.waste;
    }
  },

  // Get alerts
  async getAlerts() {
    try {
      const response = await api.get('/api/dashboard/initial');
      return response.data.alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return mockDashboardData.alerts;
    }
  },

  // Get eco score
  async getEcoScore() {
    try {
      const response = await api.get('/api/dashboard/initial');
      return response.data.ecoScore;
    } catch (error) {
      console.error('Error fetching eco score:', error);
      return mockDashboardData.ecoScore;
    }
  },
};

export default dashboardService; 