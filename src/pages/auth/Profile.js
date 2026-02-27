import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/auth/profile.css";
import ProfileService from "../../services/auth/ProfileService";

/* ── Initiales ── */
function getInitials(user) {
  const f = user?.first_name?.[0] ?? "";
  const l = user?.last_name?.[0]  ?? "";
  return (f + l).toUpperCase() || (user?.username?.[0]?.toUpperCase() ?? "?");
}

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const result = await ProfileService.getProfile();
      if (result.success) setUser(result.data);
      else console.error(result.error);
    }
    fetchProfile();
  }, []);

  if (!user) {
    return (
      <Layout>
        <div className="profile-loading">
          <span className="ld" /><span className="ld" /><span className="ld" />
          Chargement du profil…
        </div>
      </Layout>
    );
  }

  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username;

  return (
    <Layout>
      <div className="profile-page">

        {/* ══ NAVBAR ══ */}
        <nav className="profile-navbar">
          <div className="navbar-identity">
            <div className="navbar-avatar">
              {getInitials(user)}
              <span className="navbar-avatar-dot" />
            </div>
            <div>
              <div className="navbar-name">{fullName}</div>
              <div className="navbar-role">{user.role}</div>
            </div>
          </div>
          <div className="navbar-brand">Mon Profil</div>
        </nav>

        {/* ══ CONTENU ══ */}
        <div className="profile-content">

          {/* Titre */}
          <div className="content-header">
            <h1>Mon Profil</h1>
            <p>Consultez et gérez vos informations personnelles</p>
          </div>

          {/* Card infos */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-header-dot" />
              <h2>Informations personnelles</h2>
            </div>
            <div className="info-grid">

              <div className="info-field">
                <div className="field-label">Nom d'utilisateur</div>
                <div className="field-value">{user.username}</div>
              </div>

              <div className="info-field">
                <div className="field-label">Rôle</div>
                <div className="field-value">
                  <span className="role-pill">{user.role}</span>
                </div>
              </div>

              <div className="info-field">
                <div className="field-label">Prénom</div>
                <div className="field-value">{user.first_name || "—"}</div>
              </div>

              <div className="info-field">
                <div className="field-label">Nom</div>
                <div className="field-value">{user.last_name || "—"}</div>
              </div>

              <div className="info-field">
                <div className="field-label">Email</div>
                <div className="field-value">{user.email}</div>
              </div>

              <div className="info-field">
                <div className="field-label">Téléphone</div>
                <div className="field-value">{user.phone || "—"}</div>
              </div>

            </div>
          </div>

          {/* Card mot de passe — bouton toujours visible */}
          <div className="action-card">
            <div className="action-card-left">
              <h3>Mot de passe</h3>
              <p>Modifiez votre mot de passe pour sécuriser votre compte</p>
            </div>
            <Link to="/change-password" className="profile-action-btn">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Changer le mot de passe
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default Profile;