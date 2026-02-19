// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour les cookies/sessions
});

export default api;