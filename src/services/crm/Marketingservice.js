// services/crm/MarketingService.js

import api from '../api';

/**
 * GET /api/marketing-mail/
 */
export const fetchEmails = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.archive !== undefined) query.set('archive', params.archive);
  if (params.groupe)     query.set('groupe',     params.groupe);
  if (params.search)     query.set('search',     params.search);
  if (params.date_unique) query.set('date_unique', params.date_unique);  // CHANGÉ: un seul paramètre
  if (params.direct)     query.set('direct',     params.direct);

  try {
    const response = await api.get(`marketing-mail/?${query.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Erreur fetchEmails:", error);
    throw error;
  }
};

/**
 * GET /api/marketing-mail/<id>/
 */
export const fetchEmailDetail = async (id) => {
  try {
    const response = await api.get(`marketing-mail/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erreur fetchEmailDetail:", error);
    throw error;
  }
};

/**
 * POST /api/marketing-mail/envoyer/
 */
export const envoyerEmail = async (formData) => {
  let body;
  
  if (formData instanceof FormData) {
    body = formData;
  } else {
    body = new FormData();
    
    body.append('send_mode', formData.send_mode);
    body.append('objet', formData.objet);
    body.append('apercu', formData.apercu || '');
    body.append('message', formData.message);
    
    if (formData.send_mode === 'direct') {
      body.append('email_direct', formData.email_direct);
    } else {
      body.append('groupe', formData.groupe);
      
      const formationsIds = (formData.formations_cibles || []).map(id => Number(id));
      body.append('formations_cibles', JSON.stringify(formationsIds));
      body.append('statuts_prospects', JSON.stringify(formData.statuts_prospects || []));
      body.append('sources_prospects', JSON.stringify(formData.sources_prospects || []));
    }
    
    if (formData.fichier) {
      body.append('fichier', formData.fichier);
    }
  }
  
  try {
    const response = await api.post('marketing-mail/envoyer/', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur envoyerEmail:", error);
    throw error;
  }
};

/**
 * POST /api/marketing-mail/archiver/
 */
export const archiverEmails = async (ids) => {
  try {
    const response = await api.post('marketing-mail/archiver/', { ids });
    return response.data;
  } catch (error) {
    console.error("Erreur archiverEmails:", error);
    throw error;
  }
};

/**
 * POST /api/marketing-mail/supprimer/
 */
export const supprimerEmails = async (ids) => {
  try {
    const response = await api.post('marketing-mail/supprimer/', { ids });
    return response.data;
  } catch (error) {
    console.error("Erreur supprimerEmails:", error);
    throw error;
  }
};

/**
 * POST /api/marketing-mail/estimer/
 * Retourne le nombre ET la liste des destinataires
 */
export const estimerDestinataires = async (segment) => {
  try {
    const payload = {
      groupe: segment.groupe,
      formations_cibles: (segment.formations_cibles || []).map(id => Number(id)),
      statuts_prospects: segment.statuts_prospects || [],
      sources_prospects: segment.sources_prospects || [],
    };
    
    const response = await api.post('marketing-mail/estimer/', payload);
    return response.data;
  } catch (error) {
    console.error("Erreur estimerDestinataires:", error);
    throw error;
  }
};

/**
 * GET /api/marketing-mail/formations/<type_groupe>/
 * Retourne les formations disponibles pour un type avec comptage
 */
export const fetchFormationsParType = async (typeGroupe) => {
  try {
    const response = await api.get(`marketing-mail/formations/${typeGroupe}/`);
    return response.data;
  } catch (error) {
    console.error("Erreur fetchFormationsParType:", error);
    throw error;
  }
};

/**
 * GET /api/marketing-mail/statuts/
 * Retourne les statuts disponibles pour les prospects
 */
export const fetchStatutsDisponibles = async (typeGroupe, formationsIds = []) => {
  try {
    const params = new URLSearchParams();
    params.set('type_groupe', typeGroupe);
    if (formationsIds.length > 0) {
      params.set('formations_ids', formationsIds.join(','));
    }
    const response = await api.get(`marketing-mail/statuts/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Erreur fetchStatutsDisponibles:", error);
    throw error;
  }
};

/**
 * GET /api/marketing-mail/formations/
 */
export const fetchFormations = async () => {
  try {
    const response = await api.get('marketing-mail/formations/');
    return response.data;
  } catch (error) {
    console.error("Erreur fetchFormations:", error);
    throw error;
  }
};