// src/services/infoCentre/formateurService.js
import api from '../api';

const BASE = 'formateurs/';

// ── GET /api/formateurs/ ─────────────────────────────────────────────────────
export const getFormateurs = async () => {
  const response = await api.get(BASE);
  return response.data;
};

// ── POST /api/formateurs/ ────────────────────────────────────────────────────
// data est déjà un FormData construit dans Formateurs.js
export const createFormateur = async (formData) => {
  const response = await api.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── PUT /api/formateurs/:id/ ─────────────────────────────────────────────────
// data est déjà un FormData construit dans Formateurs.js
export const updateFormateur = async (id, formData) => {
  const response = await api.put(`${BASE}${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── DELETE /api/formateurs/:id/ ──────────────────────────────────────────────
export const deleteFormateur = async (id) => {
  const response = await api.delete(`${BASE}${id}/`);
  return response.data;
};

// ── GET /api/formateurs/:id/ ─────────────────────────────────────────────────
export const getFormateurById = async (id) => {
  const response = await api.get(`${BASE}${id}/`);
  return response.data;
};