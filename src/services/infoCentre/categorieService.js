// src/services/infoCentre/categorieService.js
import api from '../api';

export const getCategories      = ()           => api.get(`categories/`);
export const ajouterCategorie   = (data)       => api.post(`categories/ajouter/`, data);
export const modifierCategorie  = (id, data)   => api.put(`categories/${id}/modifier/`, data);
export const supprimerCategorie = (id)         => api.delete(`categories/${id}/supprimer/`);