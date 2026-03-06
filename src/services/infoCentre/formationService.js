// src/services/infoCentre/formationService.js
import api from '../api';

export const getFormations = () => api.get('formations/');

export const getFormation = (id) => api.get(`formations/${id}/`);

export const ajouterFormation = (data) => api.post('formations/ajouter/', data);

export const modifierFormation = (id, data) => api.put(`formations/modifier/${id}/`, data);

export const supprimerFormation = (id) => api.delete(`formations/supprimer/${id}/`);

export const getFormateursDisponibles = () =>api.get("formations/formateurs-disponibles/");