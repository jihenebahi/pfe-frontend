import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/auth/profile.css";
import ProfileService from "../../services/auth/ProfileService";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const result = await ProfileService.getProfile();
      if (result.success) {
        setUser(result.data);
      } else {
        console.error(result.error);
      }
    }

    fetchProfile();
  }, []);

  if (!user) {
    return <Layout><p>Chargement du profil...</p></Layout>;
  }

  return (
    <Layout>
      <div className="profile-container">
        <h1 className="profile-title">Mon profil</h1>

        <div className="profile-card">
          <div className="profile-row">
            <span className="label">Username</span>
            <span className="value">{user.username}</span>
          </div>

          <div className="profile-row">
            <span className="label">Prénom</span>
            <span className="value">{user.first_name}</span>
          </div>

          <div className="profile-row">
            <span className="label">Nom</span>
            <span className="value">{user.last_name}</span>
          </div>

          <div className="profile-row">
            <span className="label">Email</span>
            <span className="value">{user.email}</span>
          </div>

          <div className="profile-row">
            <span className="label">Téléphone</span>
            <span className="value">{user.phone}</span>
          </div>

          <div className="profile-row">
            <span className="label">Rôle</span>
            <span className="value role">{user.role}</span>
          </div>
        </div>

        <div className="password-link">
       <Link to="/change-password">Changer le mot de passe</Link>
       </div>
      </div>
    </Layout>
  );
}

export default Profile;