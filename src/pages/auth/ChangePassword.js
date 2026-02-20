import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/auth/changePassword.css"; // tu peux créer ce fichier basé sur ton CSS

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    // Ici tu appelles ton service pour changer le mot de passe
    console.log({ currentPassword, newPassword });
  };

  return (
    <Layout>
      <div className="profile-container">
        <h1 className="profile-title">Changer le mot de passe</h1>
        <div className="profile-card">
          <form onSubmit={handleSubmit}>
            <div className="profile-row">
              <span className="label">Mot de passe actuel</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="profile-row">
              <span className="label">Nouveau mot de passe</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="profile-row">
              <span className="label">Confirmer le mot de passe</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button type="submit" className="password-link">
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ChangePassword;