import React from "react";
import Layout from "../../components/Layout";
import "../../styles/auth/profile.css";

function Profile() {
  return (
    <Layout>
      <div className="profile-container">

        <h1 className="profile-title">Mon profil</h1>

        <div className="profile-card">

          <div className="profile-row">
            <span className="label">Username</span>
            <span className="value">admin123</span>
          </div>

          <div className="profile-row">
            <span className="label">Prénom</span>
            <span className="value">Jihene</span>
          </div>

          <div className="profile-row">
            <span className="label">Nom</span>
            <span className="value">Bahi</span>
          </div>

          <div className="profile-row">
            <span className="label">Email</span>
            <span className="value">jihene@email.com</span>
          </div>

          <div className="profile-row">
            <span className="label">Téléphone</span>
            <span className="value">+216 12 345 678</span>
          </div>

          <div className="profile-row">
            <span className="label">Rôle</span>
            <span className="value role">Administrateur</span>
          </div>

        </div>

        <div className="password-link">
          <a href="#">Changer le mot de passe</a>
        </div>

      </div>
    </Layout>
  );
}

export default Profile;