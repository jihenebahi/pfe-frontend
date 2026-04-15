// src/services/crm/diplomeService.js
import api from '../api';

const BASE = 'diplomes/';

// ══════════════════════════════════════════════════════════
//  CONVERTISSEUR  Django → React
// ══════════════════════════════════════════════════════════

/**
 * Transforme un enregistrement Diplome Django en objet React.
 * Aligné sur la structure attendue par le composant Diplomes.js.
 */
export const fromApiResponse = (d) => ({
  id:                 d.id,
  nom:                d.nom               || '',
  prenom:             d.prenom            || '',
  email:              d.email             || '',
  tel:                d.telephone         || '',
  ville:              d.ville             || '',
  pays:               d.pays              || '',
  notes:              d.notes             || '',

  // Formation certifiée
  formationCertifiee: d.formation         || null,   // ID (peut être null si formation supprimée)
  formationIntitule:  d.formation_intitule || '',
  formationDuree:     d.formation_duree   || '',

  dateAttestation:    d.date_attestation  || '',

  // Présences
  seancesTotal:       d.seances_total     ?? 0,
  absences:           d.absences          ?? 0,
  tauxPresence:       d.taux_presence     ?? 0,

  // Référence historique
  etudiantIdOrigine:  d.etudiant_id_origine || null,

  dateCreation:       d.date_creation
                        ? d.date_creation.slice(0, 10)
                        : '',
});

// ══════════════════════════════════════════════════════════
//  APPELS API — lecture
// ══════════════════════════════════════════════════════════

/**
 * Récupère la liste des diplômés.
 * @param {object} params  - Filtres optionnels : { search, formation }
 */
export const getDiplomes = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data.map(fromApiResponse);
};

/**
 * Récupère le détail d'un diplômé.
 */
export const getDiplome = async (id) => {
  const res = await api.get(`${BASE}${id}/`);
  return fromApiResponse(res.data);
};

// ══════════════════════════════════════════════════════════
//  APPELS API — écriture
// ══════════════════════════════════════════════════════════

/**
 * Supprime un diplômé.
 */
export const deleteDiplome = async (id) => {
  await api.delete(`${BASE}${id}/`);
};

/**
 * Envoie l'attestation par email au diplômé.
 * @param {number} id - ID du diplôme
 * @returns {Promise<{message: string}>}
 */
export const envoyerAttestation = async (id) => {
  const res = await api.post(`${BASE}${id}/envoyer-attestation/`);
  return res.data;
};

/**
 * Certifie un étudiant pour une formation donnée.
 *
 * Logique backend :
 *   • Crée un enregistrement Diplome (snapshot).
 *   • Si TOUTES les formations de l'étudiant sont certifiées
 *     → supprime l'étudiant définitivement.
 *   • Sinon → l'étudiant reste dans la table étudiants.
 *
 * @param {number} etudiantId       - ID de l'étudiant
 * @param {number} formationId      - ID de la formation à certifier
 * @param {string} dateAttestation  - "YYYY-MM-DD"
 *
 * @returns {Promise<{
 *   diplome         : object,   // Diplome converti (fromApiResponse)
 *   etudiantSupprime: boolean,  // true si l'étudiant a été supprimé
 *   certifiees      : number,   // nb de formations certifiées après cette action
 *   total           : number,   // nb total de formations de l'étudiant
 * }>}
 */
export const certifierVerseDiplome = async (etudiantId, formationId, dateAttestation) => {
  const res = await api.post(`${BASE}certifier/`, {
    etudiant_id:      etudiantId,
    formation_id:     formationId,
    date_attestation: dateAttestation,
  });

  return {
    diplome:          fromApiResponse(res.data.diplome),
    etudiantSupprime: res.data.etudiant_supprime,
    certifiees:       res.data.certifiees,
    total:            res.data.total,
  };
};

/**
 * Convertit un diplômé en étudiant pour commencer une nouvelle formation.
 * Crée un nouvel enregistrement étudiant avec les informations du diplômé.
 * 
 * @param {object} diplomeData - Données du diplômé
 * @param {array} formationIds - IDs des formations à associer
 * @param {string} notes       - Notes/observations
 * 
 * @returns {Promise<{etudiant: object, existant: boolean, message: string}>}
 */
export const convertirVersEtudiant = async (diplomeData, formationIds = [], notes = '') => {
  // Vérifier si un étudiant avec le même email existe déjà
  const etudiantsRes = await api.get('etudiants/', {
    params: { search: diplomeData.email }
  });
  
  const etudiants = etudiantsRes.data || [];
  const existant = etudiants.some(e => 
    e.email === diplomeData.email && 
    e.nom === diplomeData.nom && 
    e.prenom === diplomeData.prenom
  );
  
  if (existant) {
    return {
      etudiant: null,
      existant: true,
      message: `Un étudiant avec ces informations existe déjà.`
    };
  }
  
  // Créer le nouvel étudiant
  const payload = {
    nom: diplomeData.nom,
    prenom: diplomeData.prenom,
    email: diplomeData.email,
    telephone: diplomeData.tel,
    ville: diplomeData.ville,
    pays: diplomeData.pays,
    notes: notes,
    formations_suivies: formationIds,
    statut: 'actif',
    mode_paiement: 'espece',
  };
  
  const createRes = await api.post('etudiants/', payload);
  
  return {
    etudiant: createRes.data,
    existant: false,
    message: `Étudiant créé avec succès.`
  };
};