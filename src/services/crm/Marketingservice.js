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
  if (params.date_debut) query.set('date_debut', params.date_debut);
  if (params.date_fin)   query.set('date_fin',   params.date_fin);

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
  // Si formData est déjà un FormData, l'utiliser directement
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
      
      // Convertir en nombres
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
 * POST /api/marketing-mail/estimer/
 */
export const estimerDestinataires = async (segment) => {
  try {
    // S'assurer que les IDs sont des nombres
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