import axios from 'axios';

// Base URLs
export const AUTH_URL = 'http://localhost:8001';
export const APP_URL = 'http://localhost:8002';
export const PREDICTION_URL = 'http://localhost:8003';
export const ADMIN_URL = 'http://localhost:8004';

// Create base instance
const client = axios.create();

// Add interceptor to inject Authorization header
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
