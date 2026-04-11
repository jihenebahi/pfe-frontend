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

const DOCUMENT_TYPE_MAP_INV = {
  'cin':     'CIN',
  'cv':      'CV',
  'contrat': 'Contrat',
  'recu':    'Reçu',
  'rne':     'RNE',
  'autre':   'Autres',
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
 *
 * CORRECTION : on envoie uniquement les champs définis pour éviter
 * d'écraser des valeurs existantes avec des chaînes vides ou des
 * valeurs par défaut incorrectes lors d'un PATCH partiel.
 */
export const toApiPayload = (fd, formationIds = []) => {
  const payload = {
    nom:                fd.nom?.trim()    || '',
    prenom:             fd.prenom?.trim() || '',
    email:              fd.email?.trim()  || '',
    telephone:          fd.tel?.trim()    || '',
    ville:              fd.ville?.trim()  || '',
    pays:               PAYS_MAP[fd.pays] || 'tunisie',
    notes:              fd.notes          || '',
    mode_paiement:      'espece',
    formations_suivies: formationIds,
  };

  // CORRECTION : n'envoyer le statut que s'il est défini et mappable,
  // pour éviter d'écraser le statut réel avec une valeur par défaut.
  if (fd.statut && STATUT_MAP[fd.statut]) {
    payload.statut = STATUT_MAP[fd.statut];
  }

  return payload;
};

/**
 * Réponse Django → objet React
 *
 * formations_suivies_detail provient désormais du through model
 * EtudiantFormation et contient, par formation :
 *   - dateInscription  (date d'ajout à cette formation spécifique)
 *   - attestation      'Oui' | 'Non'
 *   - dateAttestation  string | ''
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
    genre:         GENRE_MAP_INV[e.genre]                     || e.genre         || '',
    niveauEtudes:  NIVEAU_ETUDES_MAP_INV[e.niveau_etudes]     || e.niveau_etudes  || '',
    diplomeObtenu: DIPLOME_MAP_INV[e.diplome_obtenu]          || e.diplome_obtenu || '',

    // IDs bruts pour les filtres et le formulaire
    formations: e.formations_suivies || [],

    // Données enrichies par formation (via EtudiantFormation through model)
    formationsDetail: (e.formations_suivies_detail || []).map(f => ({
      id:              f.id,
      label:           f.intitule,
      duree:           f.duree ? `${f.duree}h` : '',
      dateInscription: f.date_inscription_formation || '',
      attestation:     f.attestation ? 'Oui' : 'Non',
      dateAttestation: f.date_attestation || '',
    })),

    formationsNoms: e.formations_noms || '',

    // Date d'inscription globale de l'étudiant (conversion prospect → étudiant)
    dateInscription: e.date_inscription || '',
    statut:          statutFr,

    modeFormation: 'Présentiel',
    notes:         e.notes || '',

    documents: (e.documents || []).map(
      d => DOCUMENT_TYPE_MAP_INV[d.type_document] || d.type_document
    ),

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
 * Marque une formation comme "Attestée" pour un étudiant donné.
 * Retourne l'étudiant mis à jour (avec toutes ses formations).
 */
export const attesterFormation = async (etudiantId, formationId, dateAttestation) => {
  const res = await api.post(
    `${BASE}${etudiantId}/formations/${formationId}/attester/`,
    { date_attestation: dateAttestation || null }
  );
  return fromApiResponse(res.data);
};