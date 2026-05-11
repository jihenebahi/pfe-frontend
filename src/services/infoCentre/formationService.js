// services/infoCentre/formationService.js
import api from '../api';

export const getFormations = () => api.get('formations/');
export const getFormationsArchivees = () => api.get('formations/archivees/');
export const getFormation = (id) => api.get(`formations/${id}/`);
export const ajouterFormation = (data) => api.post('formations/ajouter/', data);
export const modifierFormation = (id, data) => api.put(`formations/modifier/${id}/`, data);
export const supprimerFormation = (id) => api.delete(`formations/supprimer/${id}/`);
export const archiverFormation = (id) => api.patch(`formations/archiver/${id}/`);
export const reactiverFormation = (id) => api.patch(`formations/reactiver/${id}/`);
export const desactiverFormation = (id) => api.patch(`formations/desactiver/${id}/`);
export const activerFormation = (id) => api.patch(`formations/activer/${id}/`);
export const getCategoriesDisponibles = () => api.get('formations/categories-disponibles/');
export const getFormationSessionsCount = (id) => api.get(`formations/${id}/sessions-count/`);
export const canDesactiverFormation = (id) => api.get(`formations/${id}/can-desactiver/`);