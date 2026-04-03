// src/services/crm/prospectsService.js
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
  'Intéressé': 'interesse',
  'Converti':  'converti',
  'Perdu':     'perdu',
};

const GENRE_MAP = {
  'Homme': 'homme',
  'Femme': 'femme',
  'Autre': 'autre',
};

const NIVEAU_ETUDES_MAP = {
  'Primaire':      'primaire',
  'Préparatoire':  'preparatoire',
  'Secondaire':    'secondaire',
  'Universitaire': 'universitaire',
};

const DIPLOME_MAP = {
  'Bac':     'bac',
  'Licence': 'licence',
  'Master':  'master',
  'Autre':   'autre',
};

// ══════════════════════════════════════════════════════════
//  MAPS INVERSES  (Django → React)
// ══════════════════════════════════════════════════════════

const invertMap = (map) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

const PAYS_MAP_INV          = invertMap(PAYS_MAP);
const SOURCE_MAP_INV        = invertMap(SOURCE_MAP);
const NIVEAU_MAP_INV        = invertMap(NIVEAU_MAP);
const MODE_MAP_INV          = invertMap(MODE_MAP);
const CANAL_MAP_INV         = invertMap(CANAL_MAP);
const STATUT_MAP_INV        = invertMap(STATUT_MAP);
const GENRE_MAP_INV         = invertMap(GENRE_MAP);
const NIVEAU_ETUDES_MAP_INV = invertMap(NIVEAU_ETUDES_MAP);
const DIPLOME_MAP_INV       = invertMap(DIPLOME_MAP);

// ══════════════════════════════════════════════════════════
//  CONVERTISSEURS
// ══════════════════════════════════════════════════════════

/**
 * Convertit un objet du formulaire React → payload Django
 */
export const toApiPayload = (fd, formationIds = []) => ({
  nom:       fd.nom?.trim()    || '',
  prenom:    fd.prenom?.trim() || '',
  email:     fd.email?.trim()  || '',
  telephone: fd.tel?.trim()    || '',
  ville:     fd.ville?.trim()  || '',
  pays:      PAYS_MAP[fd.pays] || 'tunisie',

  date_naissance: fd.dateNaissance                    || null,
  genre:          GENRE_MAP[fd.genre]                 || '',
  niveau_etudes:  NIVEAU_ETUDES_MAP[fd.niveauEtudes]  || '',
  diplome_obtenu: DIPLOME_MAP[fd.diplomeObtenu]        || '',

  source:                SOURCE_MAP[fd.source]       || 'site_web',
  formations_souhaitees: formationIds,
  niveau_estime:         NIVEAU_MAP[fd.niveau]       || 'debutant',
  mode_prefere:          MODE_MAP[fd.modePreference] || 'presentiel',
  canal_contact_prefere: CANAL_MAP[fd.canalContact]  || '',
  commentaires:          fd.commentaires             || '',

  statut: STATUT_MAP[fd.statut] || 'nouveau',
});

/**
 * Convertit une réponse Django → objet React
 */
export const fromApiResponse = (p) => ({
  id:     p.id,
  nom:    p.nom,
  prenom: p.prenom,
  email:  p.email,
  tel:    p.telephone,
  ville:  p.ville || '',
  pays:   PAYS_MAP_INV[p.pays] || p.pays,

  dateNaissance: p.date_naissance                               || '',
  genre:         GENRE_MAP_INV[p.genre]                        || p.genre         || '',
  niveauEtudes:  NIVEAU_ETUDES_MAP_INV[p.niveau_etudes]        || p.niveau_etudes  || '',
  diplomeObtenu: DIPLOME_MAP_INV[p.diplome_obtenu]             || p.diplome_obtenu || '',

  source:         SOURCE_MAP_INV[p.source]               || p.source,
  formation:      p.formations_souhaitees && p.formations_souhaitees.length > 0
                    ? String(p.formations_souhaitees[0])
                    : '',
  formationLabel: p.formations_noms                      || '',
  formations_ids: p.formations_souhaitees                || [],
  niveau:         NIVEAU_MAP_INV[p.niveau_estime]        || p.niveau_estime,
  modePreference: MODE_MAP_INV[p.mode_prefere]           || p.mode_prefere,
  canalContact:   CANAL_MAP_INV[p.canal_contact_prefere] || p.canal_contact_prefere || '',
  commentaires:   p.commentaires                         || '',

  statut:        STATUT_MAP_INV[p.statut] || p.statut,
  responsableId: p.responsable     ? String(p.responsable) : '',
  responsable:   p.responsable_nom || '',

  date:        p.date_creation ? p.date_creation.slice(0, 10) : '',
  historique:  '',
  historiques: p.historiques || [],
});

// ══════════════════════════════════════════════════════════
//  APPELS API
// ══════════════════════════════════════════════════════════

export const getProspects = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data.map(fromApiResponse);
};

export const getProspect = async (id) => {
  const res = await api.get(`${BASE}${id}/`);
  return fromApiResponse(res.data);
};

export const createProspect = async (fd, formationIds = []) => {
  const payload = toApiPayload(fd, formationIds);
  const res     = await api.post(BASE, payload);
  return fromApiResponse(res.data);
};

export const updateProspect = async (id, fd, formationIds = []) => {
  const payload = toApiPayload(fd, formationIds);
  const res     = await api.patch(`${BASE}${id}/`, payload);
  return fromApiResponse(res.data);
};

export const deleteProspect = async (id) => {
  await api.delete(`${BASE}${id}/`);
};

/**
 * Supprime plusieurs prospects en parallèle.
 * @param {number[]} ids  Liste des IDs à supprimer
 * @returns {{ deleted: number[], errors: number[] }}
 */
export const deleteMultipleProspects = async (ids) => {
  const results = await Promise.allSettled(
    ids.map((id) => api.delete(`${BASE}${id}/`))
  );
  const deleted = [];
  const errors  = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') deleted.push(ids[index]);
    else                               errors.push(ids[index]);
  });
  return { deleted, errors };
};

export const getProspectStats = async () => {
  const res = await api.get(`${BASE}stats/`);
  return res.data;
};

export const addHistorique = async (prospectId, data) => {
  const res = await api.post(`${BASE}${prospectId}/historiques/`, data);
  return res.data;
};

/**
 * Convertit un prospect en étudiant.
 * @param {number} prospectId
 * @param {object} data  { formations_ids, statut_etudiant, notes }
 */
export const convertToEtudiant = async (prospectId, data) => {
  const res = await api.post(`${BASE}${prospectId}/convert/`, data);
  return res.data;
};

/**
 * Importe des prospects depuis un fichier Excel.
 * @param {File} file
 * @returns {{ created, errors, total }}
 */
export const importProspectsExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('prospects/import/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};