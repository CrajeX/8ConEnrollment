import axios from 'axios';

// Read base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

export default api;
