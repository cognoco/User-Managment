import axios from 'axios';
import { getCSRFToken, generateCSRFToken, storeCSRFToken } from '../utils/csrf';
import { apiConfig } from '../config';

console.log('API URL:', apiConfig.baseUrl);

// Create axios instance with default config
export const api = axios.create({
  baseURL: apiConfig.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with cross-origin requests
  withCredentials: true,
  // Timeout from configuration
  timeout: apiConfig.timeout,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Log all errors for debugging
    console.error('API error:', error.response?.status, error.response?.data);
    
    // Pass through the error for handling in components
    return Promise.reject(error);
  }
);

export default api;