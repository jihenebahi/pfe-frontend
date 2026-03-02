// src/services/infoCentre/categorieService.js
import api from '../api';

export const getCategories = () => api.get('categories/');
export const ajouterCategorie = (data) => api.post('categories/ajouter/', data);