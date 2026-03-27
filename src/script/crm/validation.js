// src/script/crm/validation.js

const ALPHA_REGEX  = /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s'-]+$/;
const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEL_TN_REGEX = /^(\+216|00216)?[\s-]?[24578-9]\d[\s-]?\d{3}[\s-]?\d{3}$/;

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
//  NOUVELLE FONCTION : Validation combinée niveau d'études / diplôme
// ══════════════════════════════════════════════════════════
export const validateNiveauEtudesDiplome = (niveauEtudes, diplomeObtenu) => {
  // Si niveau d'études n'est pas renseigné, on ne valide pas le diplôme
  if (!niveauEtudes) return '';
  
  // Cas 1 : Primaire - ne doit pas avoir de diplôme
  if (niveauEtudes === 'Primaire' && diplomeObtenu && diplomeObtenu !== '') {
    return 'Pour le niveau Primaire, aucun diplôme ne peut être sélectionné.';
  }
  
  // Cas 2 : Préparatoire - ne doit pas avoir de diplôme
  if (niveauEtudes === 'Préparatoire' && diplomeObtenu && diplomeObtenu !== '') {
    return 'Pour le niveau Préparatoire, aucun diplôme ne peut être sélectionné.';
  }
  
  // Cas 3 : Secondaire - doit avoir Bac (ou peut être vide)
  if (niveauEtudes === 'Secondaire' && diplomeObtenu && diplomeObtenu !== 'Bac') {
    return 'Pour le niveau Secondaire, seul le diplôme "Bac" est accepté.';
  }
  
  // Cas 4 : Universitaire - diplôme obligatoire (sauf si vide)
  if (niveauEtudes === 'Universitaire' && (!diplomeObtenu || diplomeObtenu === '')) {
    return 'Pour le niveau Universitaire, un diplôme doit être sélectionné.';
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
      if (!v)                   return "L'email est obligatoire.";
      if (!EMAIL_REGEX.test(v)) return "Format d'email invalide (ex : nom@domaine.com).";
      if (v.length > 150)       return "L'email ne peut pas dépasser 150 caractères.";
      return '';

    case 'tel':
      if (!v)                    return 'Le téléphone est obligatoire.';
      if (!TEL_TN_REGEX.test(v)) return 'Numéro tunisien invalide (ex : 55 123 456 ou +216 55 123 456).';
      return '';

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
      // Validation croisée avec diplomeObtenu
      if (v && allValues.diplomeObtenu !== undefined) {
        const crossError = validateNiveauEtudesDiplome(v, allValues.diplomeObtenu);
        if (crossError) return crossError;
      }
      return '';

    case 'diplomeObtenu':
      if (v && !VALID_DIPLOME.includes(v)) return 'Veuillez sélectionner un diplôme valide.';
      // Validation croisée avec niveauEtudes
      if (v && allValues.niveauEtudes) {
        const crossError = validateNiveauEtudesDiplome(allValues.niveauEtudes, v);
        if (crossError) return crossError;
      }
      // Si niveauEtudes est Universitaire et diplomeObtenu vide
      if (allValues.niveauEtudes === 'Universitaire' && (!v || v === '')) {
        return 'Pour le niveau Universitaire, un diplôme doit être sélectionné.';
      }
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
  
  // Valider chaque champ en passant toutes les valeurs pour les validations croisées
  allFields.forEach((field) => {
    const msg = validateField(field, fd[field], fd);
    if (msg) errors[field] = msg;
  });

  // Validation supplémentaire pour s'assurer que les erreurs croisées sont bien capturées
  const crossError = validateNiveauEtudesDiplome(fd.niveauEtudes, fd.diplomeObtenu);
  if (crossError) {
    // Si l'erreur concerne le niveau d'études
    if (crossError.includes('Primaire') || crossError.includes('Préparatoire') || crossError.includes('Secondaire')) {
      errors.niveauEtudes = crossError;
    }
    // Si l'erreur concerne le diplôme
    if (crossError.includes('diplôme') || crossError.includes('Bac')) {
      errors.diplomeObtenu = crossError;
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};