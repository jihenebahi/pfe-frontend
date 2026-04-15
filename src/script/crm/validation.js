// src/script/crm/validation.js

const ALPHA_REGEX  = /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s'-]+$/;
const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ✅ Bonne regex pour 8 chiffres commençant par 2,4,5,7,9
const TEL_TN_REGEX = /^[24579]\d{7}$/;

// Fonction de nettoyage
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^\d]/g, '');
  
  if (cleaned.startsWith('216') && cleaned.length === 11) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('00216') && cleaned.length === 13) cleaned = cleaned.slice(5);
  else if (cleaned.startsWith('0') && cleaned.length === 9) cleaned = cleaned.slice(1);
  
  return cleaned;
};

const VALID_PAYS   = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Belgique', 'Canada', 'Autre'];
const VALID_SOURCE = [
  'Facebook', 'Instagram', 'TikTok', 'LinkedIn',
  'Google', 'Site web', 'Recommandation', 'Appel entrant', 'Autre',
];
const VALID_NIV    = ['Débutant', 'Intermédiaire', 'Avancé'];
const VALID_MODE   = ['Présentiel', 'En ligne', 'Hybride'];
const VALID_STATUT = ['Nouveau', 'Contacté', 'Intéressé', 'Converti', 'Perdu'];

const VALID_GENRE         = ['Homme', 'Femme', 'Autre'];
const VALID_NIVEAU_ETUDES = ['Primaire', 'Préparatoire', 'Secondaire', 'Universitaire'];
const VALID_DIPLOME       = ['Bac', 'Licence', 'Master', 'Autre'];

// ══════════════════════════════════════════════════════════
//  NOUVELLE VALIDATION : niveau d'études / diplôme
// ══════════════════════════════════════════════════════════
export const validateNiveauEtudesDiplome = (niveauEtudes, diplomeObtenu) => {
  // Si aucun niveau n'est sélectionné, pas d'erreur
  if (!niveauEtudes) return '';

  // Primaire ou Préparatoire : aucun diplôme autorisé
  if (niveauEtudes === 'Primaire' && diplomeObtenu && diplomeObtenu !== '') {
    return 'Pour le niveau Primaire, aucun diplôme ne peut être sélectionné.';
  }
  
  if (niveauEtudes === 'Préparatoire' && diplomeObtenu && diplomeObtenu !== '') {
    return 'Pour le niveau Préparatoire, aucun diplôme ne peut être sélectionné.';
  }

  // Secondaire : si un diplôme est sélectionné, il doit être "Bac"
  // Mais le diplôme n'est PAS obligatoire (l'élève peut être en cours)
  if (niveauEtudes === 'Secondaire') {
    if (diplomeObtenu && diplomeObtenu !== 'Bac') {
      return 'Pour le niveau Secondaire, seul le diplôme "Bac" est accepté.';
    }
  }

  // Universitaire : diplôme obligatoire, tous les diplômes sont acceptés
  if (niveauEtudes === 'Universitaire') {
    if (!diplomeObtenu || diplomeObtenu === '') {
      return 'Pour le niveau Universitaire, un diplôme doit être sélectionné.';
    }
  }

  return '';
};

export const validateField = (field, value, allValues = {}) => {
  const v = (value || '').trim();

  switch (field) {

    case 'nom':
      if (!v)                   return 'Le nom est obligatoire.';
      if (v.length < 2)         return 'Le nom doit contenir au moins 2 caractères.';
      if (v.length > 50)        return 'Le nom ne peut pas dépasser 50 caractères.';
      if (!ALPHA_REGEX.test(v)) return 'Le nom ne doit contenir que des lettres, espaces ou tirets.';
      return '';

    case 'prenom':
      if (!v)                   return 'Le prénom est obligatoire.';
      if (v.length < 2)         return 'Le prénom doit contenir au moins 2 caractères.';
      if (v.length > 50)        return 'Le prénom ne peut pas dépasser 50 caractères.';
      if (!ALPHA_REGEX.test(v)) return 'Le prénom ne doit contenir que des lettres, espaces ou tirets.';
      return '';

    case 'email':
      if (!v) return '';
      if (!EMAIL_REGEX.test(v)) return "Format d'email invalide (ex : nom@domaine.com).";
      if (v.length > 150)       return "L'email ne peut pas dépasser 150 caractères.";
      return '';

    case 'tel': {
      if (!v) return 'Le téléphone est obligatoire.';
      const cleaned = cleanPhoneNumber(v);
      if (!TEL_TN_REGEX.test(cleaned)) {
        return 'Numéro tunisien invalide. Format attendu : 8 chiffres commençant par 2, 4, 5, 7 ou 9 (ex: 55123456)';
      }
      return '';
    }

    case 'ville':
      if (!v)                   return 'La ville est obligatoire.';
      if (!ALPHA_REGEX.test(v)) return 'La ville ne doit contenir que des lettres.';
      return '';

    case 'pays':
      if (!v || !VALID_PAYS.includes(v)) return 'Veuillez sélectionner un pays.';
      return '';

    case 'dateNaissance': {
      if (!v) return '';
      const d = new Date(v);
      if (isNaN(d.getTime())) return 'Date de naissance invalide.';
      const ageAns = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (ageAns < 6)   return "L'âge minimum est 6 ans.";
      if (ageAns > 100) return 'Date de naissance invalide.';
      return '';
    }

    case 'genre':
      if (v && !VALID_GENRE.includes(v)) return 'Veuillez sélectionner un genre valide.';
      return '';

    case 'niveauEtudes':
      if (v && !VALID_NIVEAU_ETUDES.includes(v)) return "Veuillez sélectionner un niveau d'études valide.";
      return '';

    case 'diplomeObtenu':
      // Validation seulement si un niveau est sélectionné
      if (allValues.niveauEtudes) {
        const crossError = validateNiveauEtudesDiplome(allValues.niveauEtudes, v);
        if (crossError) return crossError;
      }
      // Validation du format du diplôme si présent
      if (v && !VALID_DIPLOME.includes(v)) return 'Veuillez sélectionner un diplôme valide.';
      return '';

    case 'source':
      if (!v || !VALID_SOURCE.includes(v)) return 'Veuillez sélectionner une source.';
      return '';

    case 'formation':
      if (!v) return 'Veuillez sélectionner une formation souhaitée.';
      return '';

    case 'niveau':
      if (!v || !VALID_NIV.includes(v)) return 'Veuillez sélectionner un niveau.';
      return '';

    case 'modePreference':
      if (!v || !VALID_MODE.includes(v)) return 'Veuillez sélectionner un mode.';
      return '';

    case 'statut':
      if (!v || !VALID_STATUT.includes(v)) return 'Veuillez sélectionner un statut.';
      return '';

    case 'canalContact':
      return '';

    case 'commentaires':
      if (v && v.length > 500) return 'Les commentaires ne peuvent pas dépasser 500 caractères.';
      return '';

    default:
      return '';
  }
};

export const validateAll = (fd) => {
  const allFields = [
    'nom', 'prenom', 'email', 'tel', 'ville', 'pays',
    'dateNaissance', 'genre', 'niveauEtudes', 'diplomeObtenu',
    'source', 'formation', 'niveau', 'modePreference',
    'statut',
    'commentaires',
  ];

  const errors = {};

  allFields.forEach((field) => {
    const msg = validateField(field, fd[field], fd);
    if (msg) errors[field] = msg;
  });

  // Validation croisée supplémentaire
  if (fd.niveauEtudes) {
    const crossError = validateNiveauEtudesDiplome(fd.niveauEtudes, fd.diplomeObtenu);
    if (crossError) {
      if (crossError.includes('Primaire') || crossError.includes('Préparatoire')) {
        errors.diplomeObtenu = crossError;
      } else if (crossError.includes('Secondaire')) {
        errors.diplomeObtenu = crossError;
      } else if (crossError.includes('Universitaire')) {
        errors.diplomeObtenu = crossError;
      }
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};