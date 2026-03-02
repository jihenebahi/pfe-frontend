// src/services/infoCentre/categorieService.js
import api from '../api';

// Récupérer toutes les catégories
export const getCategories = () => api.get('categories/');

// Ajouter une catégorie
export const ajouterCategorie = (data) => api.post('categories/ajouter/', data);

