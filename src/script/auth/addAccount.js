// src/utils/validation.js

/**
 * Validation du numéro de téléphone tunisien
 * Formats acceptés :
 * - +216 XX XXX XXX
 * - 00216 XX XXX XXX
 * - XX XXX XXX (les 8 chiffres)
 * Tous les opérateurs : 2, 4, 5, 9, etc.
 */
export const validateTunisianPhone = (phone) => {
  if (!phone) return { isValid: false, message: 'Le téléphone est requis' };
  
  // Supprimer tous les espaces, tirets, etc.
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Regex pour les numéros tunisiens
  // Commence par +216, 00216 ou directement 2/4/5/9 suivi de 8 chiffres
  const tunisianPhoneRegex = /^(?:(?:\+216|00216)?[2-9]\d{7})$/;
  
  // Vérifier aussi le format avec indicatif
  const withIndicator = cleaned.replace(/^(?:\+216|00216)/, '');
  
  if (!tunisianPhoneRegex.test(cleaned) && !tunisianPhoneRegex.test(`+216${withIndicator}`)) {
    return { 
      isValid: false, 
      message: 'Format invalide. Utilisez: +216 XX XXX XXX ou 2X XXX XXX' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validation de l'email
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'L\'email est requis' };
  
  // Regex standard pour email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: 'Format d\'email invalide. Exemple: nom@domaine.com' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validation du nom/prénom (alphabétique uniquement)
 */
export const validateName = (name, fieldName = 'Nom') => {
  if (!name) return { isValid: false, message: `${fieldName} est requis` };
  
  // Vérifier que c'est alphabétique (lettres, espaces, tirets, apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  
  if (!nameRegex.test(name)) {
    return { 
      isValid: false, 
      message: `${fieldName} ne doit contenir que des lettres` 
    };
  }
  
  if (name.length < 2) {
    return { 
      isValid: false, 
      message: `${fieldName} doit contenir au moins 2 caractères` 
    };
  }
  
  if (name.length > 50) {
    return { 
      isValid: false, 
      message: `${fieldName} ne doit pas dépasser 50 caractères` 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validation du mot de passe
 */
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Le mot de passe est requis' };
  
  if (password.length < 8) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins 8 caractères' 
    };
  }
  
  // Optionnel : vérifier la complexité
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir majuscules, minuscules et chiffres' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validation de la confirmation du mot de passe
 */
export const validatePasswordConfirm = (password, confirm) => {
  if (!confirm) return { isValid: false, message: 'Confirmation requise' };
  
  if (password !== confirm) {
    return { 
      isValid: false, 
      message: 'Les mots de passe ne correspondent pas' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validation du rôle
 */
export const validateRole = (role) => {
  if (!role) return { isValid: false, message: 'Le rôle est requis' };
  
  const validRoles = ['super_admin', 'responsable'];
  if (!validRoles.includes(role)) {
    return { 
      isValid: false, 
      message: 'Rôle invalide' 
    };
  }
  
  return { isValid: true, message: '' };
};