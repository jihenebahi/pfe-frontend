// src/services/infoCentre/formationService.js
import api from '../api';

export const getFormations = () => api.get('formations/');

// ✅ NOUVEAU : formations archivées
export const getFormationsArchivees = () => api.get('formations/archivees/');

export const getFormation = (id) => api.get(`formations/${id}/`);

export const ajouterFormation = (data) => api.post('formations/ajouter/', data);

export const modifierFormation = (id, data) => api.put(`formations/modifier/${id}/`, data);

export const supprimerFormation = (id) => api.delete(`formations/supprimer/${id}/`);

export const getFormateursDisponibles = () => api.get("formations/formateurs-disponibles/");

// ✅ NOUVEAU : Archiver une formation (la passer en est_active=False)
export const archiverFormation = (id) => api.patch(`formations/archiver/${id}/`);

// ✅ NOUVEAU : Réactiver une formation archivée (la passer en est_active=True)
export const reactiverFormation = (id) => api.patch(`formations/reactiver/${id}/`);