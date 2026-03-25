// src/services/crm/etudiantService.js
import api from '../api';

const BASE = 'etudiants/';

// ══════════════════════════════════════════════════════════
//  MAPPINGS : valeurs françaises (React) ↔ valeurs Django
// ══════════════════════════════════════════════════════════

const PAYS_MAP = {
  'Tunisie':  'tunisie',
  'France':   'france',
  'Algérie':  'algerie',
  'Maroc':    'maroc',
  'Belgique': 'belgique',
  'Canada':   'canada',
  'Autre':    'autre',
};

const STATUT_MAP = {
  'Actif':     'actif',
  'Abandonné': 'abandonne',
  'Certifié':  'certifie',
};

const GENRE_MAP = {
  'Homme': 'homme',
  'Femme': 'femme',
  'Autre': 'autre',
};

const NIVEAU_ETUDES_MAP = {
  'Lycée':    'lycee',
  'Bac':      'bac',
  'Licence':  'licence',
  'Master':   'master',
  'Doctorat': 'doctorat',
  'Autre':    'autre',
};

const DIPLOME_MAP = {
  'Baccalauréat': 'baccalaureat',
  'Licence':      'licence',
  'Master':       'master',
  'Aucun':        'aucun',
  'Autre':        'autre',
};

// ── Maps inverses (Django → React) ──
const invertMap = (map) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

const PAYS_MAP_INV          = invertMap(PAYS_MAP);
const STATUT_MAP_INV        = invertMap(STATUT_MAP);
const GENRE_MAP_INV         = invertMap(GENRE_MAP);
const NIVEAU_ETUDES_MAP_INV = invertMap(NIVEAU_ETUDES_MAP);
const DIPLOME_MAP_INV       = invertMap(DIPLOME_MAP);

// ══════════════════════════════════════════════════════════
//  CONVERTISSEURS
// ══════════════════════════════════════════════════════════

/**
 * Formulaire React → payload Django (pour create / update)
 */
export const toApiPayload = (fd, formationIds = []) => ({
  nom:              fd.nom?.trim()    || '',
  prenom:           fd.prenom?.trim() || '',
  email:            fd.email?.trim()  || '',
  telephone:        fd.tel?.trim()    || '',
  ville:            fd.ville?.trim()  || '',
  pays:             PAYS_MAP[fd.pays] || 'tunisie',
  statut:           STATUT_MAP[fd.statut] || 'actif',
  notes:            fd.notes          || '',
  mode_paiement:    'espece',           // valeur par défaut
  formations_suivies: formationIds,
});

/**
 * Réponse Django → objet React
 * - formations      : tableau d'IDs  (pour les filtres / formulaire)
 * - formationsDetail: tableau {id, label, duree}  (pour l'affichage)
 * - attestation     : dérivé de statut ('certifie' → 'Oui')
 */
export const fromApiResponse = (e) => {
  const statutFr = STATUT_MAP_INV[e.statut] || e.statut;

  return {
    id:     e.id,
    nom:    e.nom,
    prenom: e.prenom,
    email:  e.email,
    tel:    e.telephone,
    ville:  e.ville || '',
    pays:   PAYS_MAP_INV[e.pays] || e.pays || '',

    dateNaissance: e.date_naissance  || '',
    genre:         GENRE_MAP_INV[e.genre]                        || e.genre         || '',
    niveauEtudes:  NIVEAU_ETUDES_MAP_INV[e.niveau_etudes]        || e.niveau_etudes  || '',
    diplomeObtenu: DIPLOME_MAP_INV[e.diplome_obtenu]             || e.diplome_obtenu || '',

    // Formations : IDs pour le formulaire, objets pour l'affichage
    formations:       e.formations_suivies || [],
    formationsDetail: (e.formations_suivies_detail || []).map(f => ({
      id:    f.id,
      label: f.intitule,
      duree: f.duree ? `${f.duree}h` : '',
    })),
    formationsNoms: e.formations_noms || '',

    dateInscription: e.date_inscription || '',
    statut:          statutFr,

    // attestation dérivée du statut Django
    attestation:     e.statut === 'certifie' ? 'Oui' : 'Non',
    dateAttestation: '',       // non stocké en base → UI only
    modeFormation:   'Présentiel', // non stocké en base → UI only

    notes:     e.notes || '',
    documents: (e.documents || []).map(d => d.type_document), // ex: ['cin','cv']

    responsableId: e.responsable ? String(e.responsable) : '',
    responsable:   e.responsable_nom || '',
    dateCreation:  e.date_creation ? e.date_creation.slice(0, 10) : '',
  };
};

// ══════════════════════════════════════════════════════════
//  APPELS API
// ══════════════════════════════════════════════════════════

export const getEtudiants = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data.map(fromApiResponse);
};

export const getEtudiant = async (id) => {
  const res = await api.get(`${BASE}${id}/`);
  return fromApiResponse(res.data);
};

export const createEtudiant = async (fd, formationIds = []) => {
  const payload = toApiPayload(fd, formationIds);
  const res     = await api.post(BASE, payload);
  return fromApiResponse(res.data);
};

export const updateEtudiant = async (id, fd, formationIds = []) => {
  const payload = toApiPayload(fd, formationIds);
  const res     = await api.patch(`${BASE}${id}/`, payload);
  return fromApiResponse(res.data);
};

export const deleteEtudiant = async (id) => {
  await api.delete(`${BASE}${id}/`);
};

/**
 * Passe le statut d'un étudiant à 'certifie' (Diplômé)
 */
export const certifierEtudiant = async (id) => {
  const res = await api.patch(`${BASE}${id}/`, { statut: 'certifie' });
  return fromApiResponse(res.data);
};