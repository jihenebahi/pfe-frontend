// src/services/crm/relancesService.js
import api from '../api';

const BASE     = 'prospects/relances/';
const PROSPECT = (prospectId) => `prospects/${prospectId}/relances/`;

// ══════════════════════════════════════════════════════════════════════════════
//  MAPPING  statut_calcule (Django slug) → libellé + couleur CSS React
// ══════════════════════════════════════════════════════════════════════════════

export const STATUT_CONFIG = {
  en_retard:   { label: 'En retard',   badgeCls: 'badge-late',   cardCls: 'reminder-late',   color: '#ef4444' },
  aujourd_hui: { label: "Aujourd'hui", badgeCls: 'badge-today',  cardCls: 'reminder-today',  color: '#f59e0b' },
  a_venir:     { label: 'À venir',     badgeCls: 'badge-future', cardCls: 'reminder-future', color: '#10b981' },
  fait:        { label: 'Fait',        badgeCls: 'badge-done',   cardCls: 'reminder-done',   color: '#6b7280' },
};

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTISSEUR  réponse Django → objet React
// ══════════════════════════════════════════════════════════════════════════════

export const fromApiRelance = (r) => ({
  id:                r.id,
  prospectId:        r.prospect,
  prospectNom:       r.prospect_nom       || '',
  prospectPrenom:    r.prospect_prenom    || '',
  prospectTelephone: r.prospect_telephone || '',
  dateRelance:       r.date_relance,          // 'YYYY-MM-DD'
  commentaire:       r.commentaire       || '',
  statut:            r.statut,                // slug persisté
  statutCalc:        r.statut_calcule,        // slug calculé (affiché)
  dateAction:        r.date_action       || null,
  createdBy:         r.created_by_nom    || '',
  dateCreation:      r.date_creation     || '',
  formationId:       r.formation         || null,      // ← Ajouté
  formationNom:      r.formation_nom     || '', 
});

// ══════════════════════════════════════════════════════════════════════════════
//  APPELS API
// ══════════════════════════════════════════════════════════════════════════════

/** Toutes les relances — dashboard Home */
export const getAllRelances = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data.map(fromApiRelance);
};

/** Relances d'un prospect spécifique — page détail */
export const getProspectRelances = async (prospectId) => {
  const res = await api.get(PROSPECT(prospectId));
  return res.data.map(fromApiRelance);
};

/** Créer une relance pour un prospect */
export const createRelance = async (prospectId, { dateRelance, commentaire, formationId }) => {
  const res = await api.post(PROSPECT(prospectId), {
    date_relance: dateRelance,
    commentaire:  commentaire || '',
    formation:    formationId || null,   // ← envoi au backend
  });
  return fromApiRelance(res.data);
};

/** Modifier une relance (reprogrammation) */
export const updateRelance = async (id, { dateRelance, commentaire }) => {
  const res = await api.patch(`${BASE}${id}/`, {
    date_relance: dateRelance,
    commentaire:  commentaire || '',
  });
  return fromApiRelance(res.data);
};

/** Supprimer une relance */
export const deleteRelance = async (id) => {
  await api.delete(`${BASE}${id}/`);
};

/**
 * Action "OK" — appel effectué
 * Le backend :
 *   1. Marque la relance statut='fait'
 *   2. Crée automatiquement un HistoriqueEchange de type 'appel'
 *
 * @param {number} id     ID de la relance
 * @param {string} notes  Notes optionnelles sur l'échange
 * @returns {{ message, relance }}
 */
export const actionOk = async (id, notes = '') => {
  const res = await api.post(`${BASE}${id}/ok/`, { notes });
  return {
    message: res.data.message,
    relance: fromApiRelance(res.data.relance),
  };
};

/** Compteur relances du jour (navbar badge) */
export const getRelancesCountToday = async () => {
  const res = await api.get('prospects/relances/count-today/');
  return res.data.count; // nombre entier
};