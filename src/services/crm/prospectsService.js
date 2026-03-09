// src/services/prospectsService.js
import api from '../api';

const BASE = 'prospects/';

// ══════════════════════════════════════════════════════════
//  MAPPING : valeurs françaises (React) ↔ valeurs Django
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

const SOURCE_MAP = {
  'Facebook':       'facebook',
  'Instagram':      'instagram',
  'TikTok':         'tiktok',
  'LinkedIn':       'linkedin',
  'Google':         'google',
  'Site web':       'site_web',
  'Recommandation': 'recommandation',
  'Appel entrant':  'appel_entrant',
  'Autre':          'autre',
};

const TYPE_PROSPECT_MAP = {
  'Particulier': 'particulier',
  'Entreprise':  'entreprise',
};

const SERVICE_MAP = {
  'Formation':  'formation',
  'Consulting': 'consulting',
  'Les deux':   'les_deux',
};

const NIVEAU_MAP = {
  'Débutant':      'debutant',
  'Intermédiaire': 'intermediaire',
  'Avancé':        'avance',
};

const MODE_MAP = {
  'Présentiel': 'presentiel',
  'En ligne':   'en_ligne',
  'Hybride':    'hybride',
};

const CANAL_MAP = {
  'Téléphone': 'telephone',
  'Email':     'email',
  'WhatsApp':  'whatsapp',
};

const STATUT_MAP = {
  'Nouveau':   'nouveau',
  'Contacté':  'contacte',
  'En cours':  'en_cours',
  'Qualifié':  'qualifie',
  'Converti':  'converti',
  'Perdu':     'perdu',
};

// Inverse maps (Django → React)
const invertMap = (map) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

const PAYS_MAP_INV        = invertMap(PAYS_MAP);
const SOURCE_MAP_INV      = invertMap(SOURCE_MAP);
const TYPE_PROSPECT_INV   = invertMap(TYPE_PROSPECT_MAP);
const SERVICE_MAP_INV     = invertMap(SERVICE_MAP);
const NIVEAU_MAP_INV      = invertMap(NIVEAU_MAP);
const MODE_MAP_INV        = invertMap(MODE_MAP);
const CANAL_MAP_INV       = invertMap(CANAL_MAP);
const STATUT_MAP_INV      = invertMap(STATUT_MAP);

// ══════════════════════════════════════════════════════════
//  CONVERTISSEURS
// ══════════════════════════════════════════════════════════

/**
 * Convertit un objet du formulaire React → payload Django
 * @param {Object} fd  - données du formulaire (champs en français)
 * @param {Array}  formationIds - IDs des formations sélectionnées
 */
export const toApiPayload = (fd, formationIds = []) => ({
  nom:                   fd.nom?.trim()      || '',
  prenom:                fd.prenom?.trim()   || '',
  email:                 fd.email?.trim()    || '',
  telephone:             fd.tel?.trim()      || '',
  ville:                 fd.ville?.trim()    || '',
  pays:                  PAYS_MAP[fd.pays]          || 'tunisie',
  source:                SOURCE_MAP[fd.source]       || 'site_web',
  type_prospect:         TYPE_PROSPECT_MAP[fd.typeProspect] || 'particulier',
  service_recherche:     SERVICE_MAP[fd.serviceRecherche]   || 'formation',
  formations_souhaitees: formationIds,
  niveau_estime:         NIVEAU_MAP[fd.niveau]          || 'debutant',
  mode_prefere:          MODE_MAP[fd.modePreference]    || 'presentiel',
  disponibilite:         fd.disponibilite   || '',
  canal_contact_prefere: CANAL_MAP[fd.canalContact]    || 'whatsapp',
  commentaires:          fd.commentaires    || '',
  statut:                STATUT_MAP[fd.statut]         || 'nouveau',
  // responsable est optionnel : à envoyer si disponible (ID utilisateur)
  // responsable: fd.responsableId || null,
});

/**
 * Convertit une réponse Django → objet React (pour l'affichage)
 * @param {Object} p - prospect retourné par l'API
 */
export const fromApiResponse = (p) => ({
  id:               p.id,
  nom:              p.nom,
  prenom:           p.prenom,
  email:            p.email,
  tel:              p.telephone,
  ville:            p.ville       || '',
  pays:             PAYS_MAP_INV[p.pays]               || p.pays,
  source:           SOURCE_MAP_INV[p.source]            || p.source,
  typeProspect:     TYPE_PROSPECT_INV[p.type_prospect]  || p.type_prospect,
  serviceRecherche: SERVICE_MAP_INV[p.service_recherche]|| p.service_recherche,
  // formations : on garde la liste des noms pour l'affichage
  formation:        p.formations_noms || '',
  formations_ids:   p.formations_souhaitees || [],
  niveau:           NIVEAU_MAP_INV[p.niveau_estime]     || p.niveau_estime,
  modePreference:   MODE_MAP_INV[p.mode_prefere]        || p.mode_prefere,
  disponibilite:    p.disponibilite  || '',
  canalContact:     CANAL_MAP_INV[p.canal_contact_prefere] || p.canal_contact_prefere,
  commentaires:     p.commentaires   || '',
  statut:           STATUT_MAP_INV[p.statut]            || p.statut,
  responsable:      p.responsable_nom || 'Admin',
  // date : on formate "2025-01-10T..." → "2025-01-10"
  date:             p.date_creation ? p.date_creation.slice(0, 10) : '',
  historique:       '',   // les historiques sont dans p.historiques (array)
  historiques:      p.historiques || [],
});

// ══════════════════════════════════════════════════════════
//  APPELS API
// ══════════════════════════════════════════════════════════

/** Récupère tous les prospects (avec filtres optionnels) */
export const getProspects = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data.map(fromApiResponse);
};

/** Récupère un seul prospect par ID */
export const getProspect = async (id) => {
  const res = await api.get(`${BASE}${id}/`);
  return fromApiResponse(res.data);
};

/**
 * Crée un nouveau prospect
 * @param {Object} fd          - données du formulaire React
 * @param {Array}  formationIds - IDs formations sélectionnées
 */
export const createProspect = async (fd, formationIds = []) => {
  const payload = toApiPayload(fd, formationIds);
  const res = await api.post(BASE, payload);
  return fromApiResponse(res.data);
};

/**
 * Met à jour un prospect existant
 * @param {number} id          - ID du prospect
 * @param {Object} fd          - données du formulaire React
 * @param {Array}  formationIds - IDs formations sélectionnées
 */
export const updateProspect = async (id, fd, formationIds = []) => {
  const payload = toApiPayload(fd, formationIds);
  const res = await api.patch(`${BASE}${id}/`, payload);
  return fromApiResponse(res.data);
};

/** Supprime un prospect */
export const deleteProspect = async (id) => {
  await api.delete(`${BASE}${id}/`);
};

/** Récupère les statistiques */
export const getProspectStats = async () => {
  const res = await api.get(`${BASE}stats/`);
  return res.data;
};

/** Ajoute un historique d'échange */
export const addHistorique = async (prospectId, data) => {
  const res = await api.post(`${BASE}${prospectId}/historiques/`, data);
  return res.data;
};