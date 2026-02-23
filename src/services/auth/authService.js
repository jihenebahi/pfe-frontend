import api from '../api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('login/', {
        email: email,
        password: password
      });
      
      if (response.data.user) {
        this.setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Réponse inattendue du serveur' };
      
    } catch (err) {
      return this.handleError(err);
    }
  }
  
  async logout() {
    try {
      await api.post('logout/');
    } catch (err) {
      console.error("Erreur lors du logout:", err);
    }
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
  
  // ===== NOUVELLES MÉTHODES À AJOUTER =====
  // Récupère le rôle de l'utilisateur connecté
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
  
  // Vérifie si l'utilisateur est super admin
  isSuperAdmin() {
    return this.getUserRole() === 'super_admin';
  }
  
  // Vérifie si l'utilisateur est responsable
  isResponsable() {
    return this.getUserRole() === 'responsable';
  }
  // ===== FIN DES NOUVELLES MÉTHODES =====
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  isAuthenticated() {
    return !!this.getCurrentUser();
  }
  
  handleError(err) {
    if (err.response?.status === 401) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    } else if (err.response?.status === 404) {
      return { success: false, error: 'Utilisateur non trouvé' };
    } else if (err.code === 'ERR_NETWORK') {
      return { success: false, error: 'Serveur non accessible. Vérifiez que Django est lancé.' };
    } else {
      return { success: false, error: err.response?.data?.message || 'Erreur de connexion' };
    }
  }
}

export default new AuthService();