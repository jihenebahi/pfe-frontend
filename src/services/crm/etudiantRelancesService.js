// src/services/crm/etudiantRelancesService.js
import api from '../api';

const BASE = 'etudiants/';

export const STATUT_CONFIG = {
  en_retard:   { label: 'En retard',   badgeCls: 'badge-late',   cardCls: 'reminder-late',   color: '#ef4444' },
  aujourd_hui: { label: "Aujourd'hui", badgeCls: 'badge-today',  cardCls: 'reminder-today',  color: '#f59e0b' },
  a_venir:     { label: 'À venir',     badgeCls: 'badge-future', cardCls: 'reminder-future', color: '#10b981' },
  fait:        { label: 'Fait',        badgeCls: 'badge-done',   cardCls: 'reminder-done',   color: '#6b7280' },
};

// src/services/crm/etudiantRelancesService.js

export const fromApiRelance = (r) => ({
  id:                r.id,
  etudiantId:        r.etudiant,
  etudiantNom:       r.etudiant_nom       || '',
  etudiantPrenom:    r.etudiant_prenom    || '',
  etudiantTelephone: r.etudiant_telephone || '',
  etudiantEmail:     r.etudiant_email     || '',
  dateRelance:       r.date_relance,
  commentaire:       r.commentaire       || '',
  notesAction:       r.notes_action      || '',  // ← NOUVEAU
  statut:            r.statut,
  statutCalc:        r.statut_calcule,
  dateAction:        r.date_action       || null,
  createdBy:         r.created_by_nom    || '',
  dateCreation:      r.date_creation     || '',
  formationId:       r.formation         || null,
  formationNom:      r.formation_nom     || '', 
});


export const getEtudiantRelances = async (etudiantId) => {
  const res = await api.get(`${BASE}${etudiantId}/relances/`);
  console.log('📥 Réponse API relances étudiant:', res.data); // Debug
  return res.data.map(fromApiRelance);
};

// ✅ AJOUTEZ CETTE FONCTION
export const getAllEtudiantRelances = async () => {
  const res = await api.get(`${BASE}relances/all/`);
  return res.data.map(fromApiRelance);
};

export const createEtudiantRelance = async (etudiantId, { dateRelance, commentaire, formationId }) => {
  const payload = {
    date_relance: dateRelance,
    commentaire: commentaire || '',
    formation: formationId || null,
  };
  
  console.log('📤 Envoi requête création relance étudiant:', {
    url: `${BASE}${etudiantId}/relances/`,
    payload: payload
  });
  
  const res = await api.post(`${BASE}${etudiantId}/relances/`, payload);
  return fromApiRelance(res.data);
};

export const updateEtudiantRelance = async (id, { dateRelance, commentaire }) => {
  const res = await api.patch(`${BASE}relances/${id}/`, {
    date_relance: dateRelance,
    commentaire: commentaire || '',
  });
  return fromApiRelance(res.data);
};

export const deleteEtudiantRelance = async (id) => {
  await api.delete(`${BASE}relances/${id}/`);
};

export const actionOkEtudiant = async (id, notes = '') => {
  const res = await api.post(`${BASE}relances/${id}/ok/`, { notes });
  return {
    message: res.data.message,
    relance: fromApiRelance(res.data.relance),
  };
};

export const getEtudiantRelancesCountToday = async () => {
  const res = await api.get(`${BASE}relances/count-today/`);
  return res.data.count;
};