// src/script/crm/validation.js
// ══════════════════════════════════════════════════════════
//  VALIDATION DES CHAMPS — FORMULAIRE PROSPECT
//  • Validation au fur et à mesure (onChange)
//  • Validation globale au submit (validateAll)
//  • Logique conditionnelle Particulier / Entreprise
// ══════════════════════════════════════════════════════════

const ALPHA_REGEX = /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s'-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEL_TN_REGEX = /^(\+216|00216)?[\s-]?[24578-9]\d[\s-]?\d{3}[\s-]?\d{3}$/;

const VALID_PAYS   = ['Tunisie','France','Algérie','Maroc','Belgique','Canada','Autre'];
const VALID_SOURCE = ['Facebook','Instagram','TikTok','LinkedIn','Google','Site web','Recommandation','Appel entrant','Autre'];
const VALID_TYPE   = ['Particulier','Entreprise'];
const VALID_SERV   = ['Formation','Consulting','Les deux'];
const VALID_NIV    = ['Débutant','Intermédiaire','Avancé'];
const VALID_MODE   = ['Présentiel','En ligne','Hybride'];
const VALID_STATUT = ['Nouveau','Contacté','Intéressé','Converti','Perdu'];
const VALID_RESP   = ['Admin','Assistante'];

export const validateField = (field, value, context = {}) => {
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
      if (!v)                    return 'La ville est obligatoire.';
      if (!ALPHA_REGEX.test(v))  return 'La ville ne doit contenir que des lettres.';
      return '';

    case 'pays':
      if (!v || !VALID_PAYS.includes(v)) return 'Veuillez sélectionner un pays.';
      return '';

    case 'source':
      if (!v || !VALID_SOURCE.includes(v)) return 'Veuillez sélectionner une source.';
      return '';

    case 'typeProspect':
      if (!v || !VALID_TYPE.includes(v)) return 'Veuillez sélectionner le type de prospect.';
      return '';

    case 'serviceRecherche':
      if (!v || !VALID_SERV.includes(v)) return 'Veuillez sélectionner un service.';
      return '';

    case 'formation':
      // Formation non requise uniquement si le service choisi est "Consulting"
      if (context.serviceRecherche === 'Consulting') return '';
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

    case 'responsable':
      if (!v || !VALID_RESP.includes(v)) return 'Veuillez sélectionner un responsable.';
      return '';

    case 'disponibilite':
      if (v && v.length > 100) return 'La disponibilité ne peut pas dépasser 100 caractères.';
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
  const context = { typeProspect: fd.typeProspect, serviceRecherche: fd.serviceRecherche };
  const allFields = [
    'nom', 'prenom', 'email', 'tel', 'ville',
    'pays', 'source', 'typeProspect', 'serviceRecherche',
    'formation', 'niveau', 'modePreference',
    'statut', 'responsable',
    'disponibilite', 'commentaires',
  ];

  const errors = {};
  allFields.forEach(field => {
    const msg = validateField(field, fd[field], context);
    if (msg) errors[field] = msg;
  });

  return { errors, isValid: Object.keys(errors).length === 0 };
};