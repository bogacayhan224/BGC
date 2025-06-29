import axios from 'axios';

const API_URL = 'https://eco-core-backend.onrender.com/api/alerts/critical';

export const fetchCriticalAlerts = async () => {
  const response = await axios.get(API_URL);
  return response.data.alerts;
};

export default { fetchCriticalAlerts }; 