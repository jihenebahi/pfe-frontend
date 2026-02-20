// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Envoie les cookies de session à chaque requête
});


// ✅ Fonction pour récupérer le cookie CSRF depuis le navigateur
function getCsrfToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name + '=')) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
}


// ✅ Intercepteur de requêtes :
// Ajoute automatiquement le token CSRF dans le header de chaque requête POST/PUT/PATCH/DELETE
api.interceptors.request.use(
  (config) => {
    const methodsRequiringCsrf = ['post', 'put', 'patch', 'delete'];
    if (methodsRequiringCsrf.includes(config.method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ✅ Intercepteur de réponses :
// Redirige vers la page de login si la session expire (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expirée ou utilisateur non connecté
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);


export default api;