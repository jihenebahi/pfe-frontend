// src/services/auth/ProfileService.js
import api from '../api';

class ProfileService {
  // Récupérer les infos de l'utilisateur connecté
  async getProfile() {
    try {
      const response = await api.get('me/');
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Erreur fetch profile:', err);
      return { success: false, error: err.response?.data || 'Erreur serveur' };
    }
  }
}

export default new ProfileService();