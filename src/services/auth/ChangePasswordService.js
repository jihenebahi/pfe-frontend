import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import ChangePasswordService from "../../services/auth/ChangePasswordService";
import "../../styles/auth/changePassword.css";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Vérification côté client avant d'envoyer
    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);

    const result = await ChangePasswordService.changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    setLoading(false);

    if (result.success) {
      setSuccess("Mot de passe changé avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Rediriger vers le profil après 2 secondes
      setTimeout(() => navigate("/mon-profil"), 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <Layout>
      <div className="profile-container">
        <h1 className="profile-title">Changer le mot de passe</h1>

        {/* Message d'erreur */}
        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div style={{
            backgroundColor: "#dcfce7",
            color: "#16a34a",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}>
            ✅ {success} Redirection en cours...
          </div>
        )}

        <div className="profile-card">
          <form onSubmit={handleSubmit}>

            <div className="profile-row">
              <span className="label">Mot de passe actuel</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                required
                disabled={loading}
              />
            </div>

            <div className="profile-row">
              <span className="label">Nouveau mot de passe</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                disabled={loading}
              />
            </div>

            <div className="profile-row">
              <span className="label">Confirmer le mot de passe</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le nouveau mot de passe"
                required
                disabled={loading}
              />
            </div>

            <div style={{ textAlign: "center", marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/mon-profil")}
                disabled={loading}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="password-link"
                disabled={loading}
              >
                {loading ? "Enregistrement..." : "Changer le mot de passe"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ChangePassword;