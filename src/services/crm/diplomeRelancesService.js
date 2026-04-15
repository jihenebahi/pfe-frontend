// src/services/crm/diplomeRelancesService.js
import api from '../api';

const BASE = 'diplomes/';

export const STATUT_CONFIG = {
  en_retard:   { label: 'En retard',   badgeCls: 'badge-late',   cardCls: 'reminder-late',   color: '#ef4444' },
  aujourd_hui: { label: "Aujourd'hui", badgeCls: 'badge-today',  cardCls: 'reminder-today',  color: '#f59e0b' },
  a_venir:     { label: 'À venir',     badgeCls: 'badge-future', cardCls: 'reminder-future', color: '#10b981' },
  fait:        { label: 'Fait',        badgeCls: 'badge-done',   cardCls: 'reminder-done',   color: '#6b7280' },
};

export const fromApiRelance = (r) => ({
  id:               r.id,
  diplomeId:        r.diplome,
  diplomeNom:       r.diplome_nom       || '',
  diplomePrenom:    r.diplome_prenom    || '',
  diplomeTelephone: r.diplome_telephone || '',
  diplomeEmail:     r.diplome_email     || '',
  diplomeFormation: r.diplome_formation || '',
  dateRelance:      r.date_relance,
  commentaire:      r.commentaire       || '',
  notesAction:      r.notes_action      || '',  // ← NOUVEAU
  statut:           r.statut,
  statutCalc:       r.statut_calcule,
  dateAction:       r.date_action       || null,
  createdBy:        r.created_by_nom    || '',
  dateCreation:     r.date_creation     || '',
  formationId:      r.formation         || null,
  formationNom:     r.formation_nom     || '',
});

// Relances d'un diplômé spécifique — page détail
export const getDiplomeRelances = async (diplomeId) => {
  const res = await api.get(`${BASE}${diplomeId}/relances/`);
  return res.data.map(fromApiRelance);
};

// Toutes les relances diplômés — dashboard Home
export const getAllDiplomeRelances = async () => {
  const res = await api.get(`${BASE}relances/all/`);
  return res.data.map(fromApiRelance);
};

// Créer une relance pour un diplômé
export const createDiplomeRelance = async (diplomeId, { dateRelance, commentaire, formationId }) => {
  const res = await api.post(`${BASE}${diplomeId}/relances/`, {
    date_relance: dateRelance,
    commentaire:  commentaire || '',
    formation:    formationId || null,
  });
  return fromApiRelance(res.data);
};

// Modifier une relance
export const updateDiplomeRelance = async (id, { dateRelance, commentaire }) => {
  const res = await api.patch(`${BASE}relances/${id}/`, {
    date_relance: dateRelance,
    commentaire:  commentaire || '',
  });
  return fromApiRelance(res.data);
};

// Supprimer une relance
export const deleteDiplomeRelance = async (id) => {
  await api.delete(`${BASE}relances/${id}/`);
};

// Action OK — relance effectuée
export const actionOkDiplome = async (id, notes = '') => {
  const res = await api.post(`${BASE}relances/${id}/ok/`, { notes });
  return {
    message: res.data.message,
    relance: fromApiRelance(res.data.relance),
  };
};

// Compteur relances du jour (badge navbar)
export const getDiplomeRelancesCountToday = async () => {
  const res = await api.get(`${BASE}relances/count-today/`);
  return res.data.count;
};