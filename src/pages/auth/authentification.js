// src/pages/auth/authentification.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // ← IMPORTANT : ajouter cet import
import "../../styles/auth/authentification.css";
import logo from "../../assets/4Clab.png";

function Authentification() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false
  });
  const navigate = useNavigate();
  const { login } = useAuth(); // ← Récupérer la fonction login du contexte

  // Utiliser useRef pour les timeouts
  const timeoutsRef = useRef({
    general: null,
    email: null,
    password: null
  });

  // Nettoyer tous les timeouts quand le composant est démonté
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Fonction pour définir une erreur avec timeout
  const setErrorWithTimeout = (field, message, duration = 4000) => {
    // Annuler le timeout précédent pour ce champ s'il existe
    if (timeoutsRef.current[field]) {
      clearTimeout(timeoutsRef.current[field]);
      timeoutsRef.current[field] = null;
    }

    // Forcer le reset de l'erreur d'abord pour déclencher un re-render
    setErrors(prev => ({ ...prev, [field]: message }));

    // Créer un nouveau timeout pour effacer cette erreur après la durée spécifiée
    timeoutsRef.current[field] = setTimeout(() => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      timeoutsRef.current[field] = null;
    }, duration);
  };

  // Validation côté client
  const validateForm = () => {
    let isValid = true;
    
    // Validation email
    if (!email.trim()) {
      setErrorWithTimeout('email', "L'email est requis");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorWithTimeout('email', "Format d'email invalide");
      isValid = false;
    }
    
    // Validation mot de passe
    if (!password) {
      setErrorWithTimeout('password', "Le mot de passe est requis");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    setTouchedFields({
      email: true,
      password: true
    });
    
    // Validation côté client
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    // Utiliser la fonction login du contexte
    const result = await login(email, password);
    
    if (result.success) {
      navigate("/home");
    } else {
      // Si l'erreur est spécifique à un champ
      if (result.field) {
        // Afficher l'erreur avec timeout de 4 secondes
        setErrorWithTimeout(result.field, result.error, 4000);
        
        // Mettre le focus sur le champ en erreur
        if (result.field === 'email') {
          document.getElementById('email')?.focus();
        } else if (result.field === 'password') {
          document.getElementById('password')?.focus();
        }
      } else {
        // Erreur générale
        setErrorWithTimeout('general', result.error, 4000);
      }
    }
    
    setLoading(false);
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
  };

  // Fonction pour obtenir la classe CSS d'un champ
  const getFieldClass = (fieldName) => {
    if (touchedFields[fieldName] && errors[fieldName]) {
      return 'input-error';
    }
    return '';
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Logo 4CLab" />
        </div>

        {/* Message d'erreur général */}
        {errors.general && (
          <div className="error-message error-general">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{errors.general}</span>
            <div className="error-timer"></div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="exemple@email.com"
              required
              disabled={loading}
              className={getFieldClass('email')}
              autoComplete="email"
              autoFocus
            />
            {errors.email && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{errors.email}</span>
                <div className="error-timer"></div>
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password">
              Mot de passe <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              required
              disabled={loading}
              className={getFieldClass('password')}
              autoComplete="current-password"
            />
            {errors.password && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{errors.password}</span>
                <div className="error-timer"></div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>

          <div className="forgot-password">
            <a href="/mot-de-passe-oublie">Mot de passe oublié ?</a>
          </div>
        </form>

        <div className="login-footer">
          <p></p>
        </div>
      </div>
    </div>
  );
}

export default Authentification;