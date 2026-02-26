// src/pages/auth/nouveauxMDP.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import passwordService from "../../services/auth/passwordService";
import { validatePassword, validatePasswordConfirm } from "../../script/auth/addAccount";
import "../../styles/auth/style-password.css";
import logo from "../../assets/4Clab.png";

function ResetPassword() {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const code  = location.state?.code;

  // ✅ Rediriger si on arrive sans email/code (accès direct interdit)
  useEffect(() => {
    if (!email || !code) navigate("/mot-de-passe-oublie");
  }, [email, code, navigate]);

  const validate = () => {
    const newErrors = {};
    
    // ✅ Utilisation de la fonction validatePassword de addAccount.js
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }
    
    // ✅ Utilisation de la fonction validatePasswordConfirm de addAccount.js
    if (passwordValidation.isValid) {
      const confirmValidation = validatePasswordConfirm(password, confirm);
      if (!confirmValidation.isValid) {
        newErrors.confirm = confirmValidation.message;
      }
    } else if (!confirm) {
      newErrors.confirm = "Confirmation requise";
    } else if (password !== confirm) {
      newErrors.confirm = "Les mots de passe ne correspondent pas";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await passwordService.resetPassword(email, code, password);

      if (res.data.success) {
        // ✅ Afficher la page de succès puis rediriger
        setSuccess(true);
        setTimeout(() => navigate("/"), 3000);
      } else {
        setErrors({ general: res.data.error || "Erreur lors de la réinitialisation" });
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.error || "Session expirée. Recommencez la procédure.",
      });
    }

    setLoading(false);
  };

  // ✅ Page de succès
  if (success) {
    return (
      <div className="login-container">
        <div className="login-box success-box">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Mot de passe modifié !</h2>
          <p className="success-text">
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <p className="success-redirect">
            Redirection vers la connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Logo 4CLab" />
        </div>

        {errors.general && (
          <div className="error-message error-general">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="Min. 8 car. avec majuscules, minuscules et chiffres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{errors.password}</span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="Répétez le nouveau mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              className={errors.confirm ? 'input-error' : ''}
            />
            {errors.confirm && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{errors.confirm}</span>
              </div>
            )}
          </div>

          <div className="btn-right">
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;