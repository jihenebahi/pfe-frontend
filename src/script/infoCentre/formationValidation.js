// src/scripts/infoCentre/formationValidation.js
// src/scripts/infoCentre/formationValidation.js

// Styles pour les messages (à ajouter à la fin du fichier)
export const styleErreurBox = {
  border: "1.5px solid #ef4444",
  borderRadius: "8px",
  padding: "10px 14px",
  backgroundColor: "#fff5f5",
  color: "#dc2626",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "6px",
  marginBottom: "6px",
  animation: "fadeInDown 0.3s ease"
};

export const styleSuccesBox = {
  border: "1.5px solid #22c55e",
  borderRadius: "10px",
  padding: "14px 18px",
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px",
  fontWeight: "500",
  boxShadow: "0 2px 8px rgba(34,197,94,0.10)",
  animation: "fadeInDown 0.3s ease"
};

export const styleInputErreur = { border: "1.5px solid #ef4444" };

// Composant message d'erreur
export const ErrMsg = ({ msg }) => {
  if (!msg) return null;
  return (
    <div style={styleErreurBox}>
      <i className="fa-solid fa-triangle-exclamation"></i> {msg}
    </div>
  );
};

// Composant message de succès
export const SuccesMsg = ({ msg }) => {
  if (!msg) return null;
  return (
    <div style={styleSuccesBox}>
      <i className="fa-solid fa-circle-check" style={{ fontSize: "18px" }}></i>
      {msg}
    </div>
  );
};

// ... (reste du code existant) ...

/**
 * Valide le formulaire d'ajout/modification d'une formation
 * @param {Object} formData - Les données du formulaire
 * @param {string} mode - 'ajout' ou 'modif'
 * @param {Object} options - Options de validation
 * @param {boolean} options.allowPastDates - Autoriser les dates passées (défaut: true)
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateFormationForm = (formData, mode = 'ajout', options = { allowPastDates: true }) => {
  const errors = [];
  let coherenceError = null;

  // Vérification des champs obligatoires
  if (!formData.intitule || formData.intitule.trim() === '') {
    errors.push("L'intitulé de la formation est obligatoire");
  }

  if (!formData.categorie) {
    errors.push("La catégorie est obligatoire");
  }

  if (!formData.niveau) {
    errors.push("Le niveau est obligatoire");
  }

  if (!formData.format) {
    errors.push("Le format est obligatoire");
  }

  if (!formData.objectifs_pedagogiques || formData.objectifs_pedagogiques.trim() === '') {
    errors.push("Les objectifs pédagogiques sont obligatoires");
  }

  // Validation de la durée
  if (!formData.duree) {
    errors.push("La durée est obligatoire");
  } else if (isNaN(formData.duree) || parseInt(formData.duree) <= 0) {
    errors.push("La durée doit être un nombre positif");
  }

  // Validation des dates
  const dateDebutError = validateDate(formData.date_debut, 'de début', options.allowPastDates);
  if (dateDebutError) errors.push(dateDebutError);

  const dateFinError = validateDate(formData.date_fin, 'de fin', options.allowPastDates);
  if (dateFinError) errors.push(dateFinError);

  // Validation de la cohérence des dates
  if (formData.date_debut && formData.date_fin) {
    const dateDebut = new Date(formData.date_debut);
    const dateFin = new Date(formData.date_fin);
    
    if (dateFin < dateDebut) {
      errors.push("La date de fin doit être postérieure à la date de début");
    } else if (formData.duree && !isNaN(parseInt(formData.duree)) && parseInt(formData.duree) > 0) {
      // Validation cohérence durée / plage de dates (max 4h par séance)
      const MAX_HEURES_PAR_JOUR = 4;
      const dureeHeures = parseInt(formData.duree);
      const nbJoursDisponibles = Math.round((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;
      const nbJoursMinRequis = Math.ceil(dureeHeures / MAX_HEURES_PAR_JOUR);

      if (nbJoursDisponibles < nbJoursMinRequis) {
        coherenceError =
          `La durée de ${dureeHeures}h nécessite au moins ${nbJoursMinRequis} jour(s) de formation ` +
          `(max 4h/séance), mais la plage sélectionnée ne couvre que ${nbJoursDisponibles} jour(s)`;
      }
    }
  }

  // Validation des prix
  const prixHtError = validatePrice(formData.prix_ht, 'HT');
  if (prixHtError) errors.push(prixHtError);

  const prixTtcError = validatePrice(formData.prix_ttc, 'TTC');
  if (prixTtcError) errors.push(prixTtcError);

  // Validation de la cohérence des prix (TTC >= HT)
  if (formData.prix_ht && formData.prix_ttc) {
    const ht = parseFloat(formData.prix_ht);
    const ttc = parseFloat(formData.prix_ttc);
    
    if (!isNaN(ht) && !isNaN(ttc) && ttc < ht) {
      errors.push("Le prix TTC doit être supérieur ou égal au prix HT");
    }
  }

  // Validation du nombre de tranches
  if (formData.nb_tranches_paiement && formData.nb_tranches_paiement !== '') {
    const nbTranches = parseInt(formData.nb_tranches_paiement);
    if (isNaN(nbTranches) || nbTranches < 1 || nbTranches > 12) {
      errors.push("Le nombre de tranches doit être compris entre 1 et 12");
    }
  }

  return {
    isValid: errors.length === 0 && !coherenceError,
    errors,
    coherenceError
  };
};

/**
 * Valide une date
 * @param {string} dateStr - La date au format YYYY-MM-DD
 * @param {string} fieldName - Le nom du champ pour le message d'erreur
 * @param {boolean} allowPast - Autoriser les dates passées
 * @returns {string|null} - Message d'erreur ou null si valide
 */
// Dans formationValidation.js - modifier la fonction validateDate

const validateDate = (dateStr, fieldName, allowPast = true) => {
  if (!dateStr) {
    return `La date ${fieldName} est obligatoire`;
  }

  // Vérifier le format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return `Le format de la date ${fieldName} est invalide (utilisez AAAA-MM-JJ)`;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return `La date ${fieldName} n'est pas valide`;
  }

  // Vérifier que la date n'est pas trop ancienne
  const minDate = new Date('2000-01-01');
  if (date < minDate) {
    return `La date ${fieldName} ne peut pas être antérieure à l'an 2000`;
  }

  // Si on n'autorise PAS les dates passées
  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliser à minuit
    
    if (date < today) {
      return `La date ${fieldName} doit être dans le futur (aujourd'hui ou plus tard)`;
    }
  }

  return null;
};

/**
 * Valide un prix
 * @param {string|number} price - Le prix à valider
 * @param {string} type - 'HT' ou 'TTC'
 * @returns {string|null} - Message d'erreur ou null si valide
 */
const validatePrice = (price, type) => {
  if (!price && price !== 0) {
    return `Le prix ${type} est obligatoire`;
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) {
    return `Le prix ${type} doit être un nombre valide`;
  }

  if (priceNum < 0) {
    return `Le prix ${type} ne peut pas être négatif`;
  }

  // Vérifier qu'il n'y a pas plus de 2 décimales
  const priceStr = price.toString();
  if (priceStr.includes('.') && priceStr.split('.')[1].length > 2) {
    return `Le prix ${type} ne peut pas avoir plus de 2 décimales`;
  }

  // Limite raisonnable pour un prix
  if (priceNum > 1000000) {
    return `Le prix ${type} semble trop élevé (maximum 1 000 000 DT)`;
  }

  return null;
};

/**
 * Formate un message d'erreur pour l'affichage
 * @param {Array} errors - Liste des erreurs
 * @returns {string} - Message formaté
 */
export const formatErrorMessage = (errors) => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return `Veuillez corriger les erreurs suivantes :\n- ${errors.join('\n- ')}`;
};

/**
 * Nettoie les données du formulaire avant envoi
 * @param {Object} formData - Les données du formulaire
 * @returns {Object} - Données nettoyées
 */
export const cleanFormData = (formData) => {
  const cleaned = { ...formData };

  // Convertir les chaînes vides en null pour les champs optionnels
  if (cleaned.description === '') cleaned.description = null;
  if (cleaned.prerequis === '') cleaned.prerequis = null;

  // S'assurer que les nombres sont bien des nombres
  if (cleaned.duree) cleaned.duree = parseInt(cleaned.duree);
  if (cleaned.nb_tranches_paiement) {
    cleaned.nb_tranches_paiement = parseInt(cleaned.nb_tranches_paiement);
  }

  // Convertir les prix en nombres flottants
  if (cleaned.prix_ht) cleaned.prix_ht = parseFloat(cleaned.prix_ht);
  if (cleaned.prix_ttc) cleaned.prix_ttc = parseFloat(cleaned.prix_ttc);

  return cleaned;
};

/**
 * Vérifie si une formation est à venir, en cours ou passée
 * @param {Object} formation - La formation
 * @returns {string} - 'upcoming', 'ongoing', 'past'
 */
export const getFormationStatus = (formation) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateDebut = new Date(formation.date_debut);
  const dateFin = new Date(formation.date_fin);
  
  if (today > dateFin) {
    return 'past';
  } else if (today >= dateDebut && today <= dateFin) {
    return 'ongoing';
  } else {
    return 'upcoming';
  }
};