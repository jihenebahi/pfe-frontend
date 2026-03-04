// src/services/infoCentre/formateurService.js
import api from '../api';

const BASE = 'formateurs/';

/**
 * Construit un FormData à partir des données du formulaire.
 * Nécessaire pour envoyer les fichiers PDF avec multipart/form-data.
 */
function buildFormData(data) {
  const formData = new FormData();

  const fields = [
    'nom', 'prenom', 'email', 'telephone', 'adresse',
    'specialites', 'niveau_intervention', 'type_contrat',
    'disponibilites', 'heures_realisees', 'est_actif',
  ];

  fields.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  // Fichiers PDF — uniquement si c'est un vrai File
  if (data.contrat_pdf instanceof File)  formData.append('contrat_pdf',  data.contrat_pdf);
  if (data.cv_pdf       instanceof File) formData.append('cv_pdf',       data.cv_pdf);
  if (data.diplomes_pdf instanceof File) formData.append('diplomes_pdf', data.diplomes_pdf);

  return formData;
}


// ── GET /api/formateurs/ ─────────────────────────────────────────────────────
export const getFormateurs = async () => {
  const response = await api.get(BASE);
  return response.data;
};


// ── POST /api/formateurs/ ────────────────────────────────────────────────────
export const createFormateur = async (data) => {
  const formData = buildFormData(data);
  const response = await api.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};


// ── PUT /api/formateurs/:id/ ─────────────────────────────────────────────────
export const updateFormateur = async (id, data) => {
  const formData = buildFormData(data);
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