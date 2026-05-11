// src/services/infoCentre/session_formation_service.js
import api from '../api';

const BASE = 'sessions/';

/**
 * Récupère toutes les sessions actives (non terminées)
 * GET /api/sessions/
 */
export const getSessions = async () => {
  const response = await api.get(BASE);
  return response.data;
};

/**
 * Récupère toutes les sessions terminées (archivées automatiquement)
 * GET /api/sessions/terminees/
 */
export const getSessionsTerminees = async () => {
  const response = await api.get(`${BASE}terminees/`);
  return response.data;
};

/**
 * Crée une nouvelle session de formation
 * POST /api/sessions/
 * @param {Object} data - données de la session
 */
export const ajouterSession = async (data) => {
  const response = await api.post(BASE, data);
  return response.data;
};

/**
 * Modifie une session existante
 * PUT /api/sessions/:id/
 * @param {number} id
 * @param {Object} data
 */
export const modifierSession = async (id, data) => {
  const response = await api.put(`${BASE}${id}/`, data);
  return response.data;
};

/**
 * Supprime une session
 * DELETE /api/sessions/:id/
 * @param {number} id
 */
export const supprimerSession = async (id) => {
  const response = await api.delete(`${BASE}${id}/`);
  return response.data;
};

/**
 * Récupère une session par son ID
 * GET /api/sessions/:id/
 * @param {number} id
 */
export const getSessionById = async (id) => {
  const response = await api.get(`${BASE}${id}/`);
  return response.data;
};