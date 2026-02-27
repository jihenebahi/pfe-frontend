import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import ChangePasswordService from "../../services/auth/ChangePasswordService";
import { validatePassword, validatePasswordConfirm } from "../../script/auth/addAccount";
import "../../styles/auth/changePassword.css";

function ChangePassword() {
  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) { setError(passwordValidation.message); return; }

    const confirmValidation = validatePasswordConfirm(newPassword, confirmPassword);
    if (!confirmValidation.isValid) { setError(confirmValidation.message); return; }

    setLoading(true);
    const result = await ChangePasswordService.changePassword(currentPassword, newPassword, confirmPassword);
    setLoading(false);

    if (result.success) {
      setSuccess("Mot de passe changé avec succès !");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => navigate("/mon-profil"), 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <Layout>
      <div className="cp-page">

        {/* ══ NAVBAR ══ */}
        <nav className="cp-navbar">
          <div className="cp-navbar-identity">
            <div className="cp-navbar-avatar">
              🔒
              <span className="cp-navbar-dot" />
            </div>
            <div>
              <div className="cp-navbar-name">Sécurité du compte</div>
              <div className="cp-navbar-role">Modifier le mot de passe</div>
            </div>
          </div>
          <div className="cp-navbar-brand">Mon Profil</div>
        </nav>

        {/* ══ CONTENU ══ */}
        <div className="cp-content">

          {/* Titre */}
          <div className="cp-header">
            <h1>Changer le mot de passe</h1>
            <p>Renseignez votre mot de passe actuel puis choisissez-en un nouveau</p>
          </div>

          {/* Alertes */}
          {error && (
            <div className="cp-alert error">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="cp-alert success">
              ✅ {success} Redirection en cours...
            </div>
          )}

          {/* Card formulaire */}
          <div className="cp-card">
            <div className="cp-card-header">
              <span className="cp-card-dot" />
              <h2>Informations de sécurité</h2>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="cp-field">
                <label htmlFor="currentPwd">Mot de passe actuel</label>
                <input
                  id="currentPwd"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  required
                  disabled={loading}
                />
              </div>

              <div className="cp-field">
                <label htmlFor="newPwd">Nouveau mot de passe</label>
                <input
                  id="newPwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 car. avec majuscules, minuscules et chiffres"
                  required
                  disabled={loading}
                />
              </div>

              <div className="cp-field">
                <label htmlFor="confirmPwd">Confirmer le mot de passe</label>
                <input
                  id="confirmPwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe"
                  required
                  disabled={loading}
                />
              </div>

              {/* Boutons */}
              <div className="cp-field cp-actions">
                <button
                  type="button"
                  className="cp-btn cp-btn-cancel"
                  onClick={() => navigate("/mon-profil")}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="cp-btn cp-btn-primary"
                  disabled={loading}
                >
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {loading ? "Enregistrement..." : "Changer le mot de passe"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default ChangePassword;