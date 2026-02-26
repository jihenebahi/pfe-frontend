// src/services/auth/authService.js
import api from '../api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('login/', {
        email: email,
        password: password
      });
      
      if (response.data.success && response.data.user) {
        this.setUser(response.data.user);
        return { 
          success: true, 
          user: response.data.user 
        };
      }
      
      return { 
        success: false, 
        error: 'Réponse inattendue du serveur',
        field: 'general'
      };
      
    } catch (err) {
      return this.handleError(err);
    }
  }
  
  async logout() {
    try {
      await api.post('logout/');
    } catch (err) {
      console.error("Erreur lors du logout:", err);
    } finally {
      localStorage.removeItem('user');
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
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
  
  isAuthenticated() {
    return !!this.getCurrentUser();
  }
  
  handleError(err) {
    // Si le backend renvoie une erreur structurée
    if (err.response?.data) {
      const data = err.response.data;
      
      // Erreur avec champ spécifique
      if (data.field) {
        return {
          success: false,
          error: data.error,
          field: data.field,
          errorType: data.error_type
        };
      }
      
      // Gestion des erreurs HTTP standards
      switch (err.response.status) {
        case 400:
          return { 
            success: false, 
            error: data.error || 'Données invalides',
            field: 'general'
          };
        case 401:
          return { 
            success: false, 
            error: data.error || 'Email ou mot de passe incorrect',
            field: 'general'
          };
        case 403:
          return { 
            success: false, 
            error: 'Accès interdit',
            field: 'general'
          };
        case 404:
          return { 
            success: false, 
            error: data.error || 'Ressource non trouvée',
            field: 'general'
          };
        case 500:
          return { 
            success: false, 
            error: 'Erreur serveur. Réessayez plus tard.',
            field: 'general'
          };
        default:
          return { 
            success: false, 
            error: data.error || 'Erreur de connexion',
            field: 'general'
          };
      }
    }
    
    // Erreur réseau
    if (err.code === 'ERR_NETWORK') {
      return { 
        success: false, 
        error: 'Serveur non accessible. Vérifiez que Django est lancé.',
        field: 'general'
      };
    }
    
    // Erreur inconnue
    return { 
      success: false, 
      error: err.message || 'Erreur inconnue',
      field: 'general'
    };
  }
}

export default new AuthService();