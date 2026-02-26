// src/components/Navbar.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ← IMPORTANT : ajouter cet import
import logo from "../assets/4Clab.png";
import "../styles/layout.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // ← Récupérer user et logout du contexte
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // ← Utiliser logout du contexte
    navigate("/");
  };

  // Formater le prénom (première lettre en majuscule)
  const getDisplayName = () => {
    if (!user) return "Utilisateur";
    
    // Si first_name est disponible, l'utiliser
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase();
    }
    
    // Sinon, essayer d'extraire du username
    if (user.username) {
      return user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase();
    }
    
    // Sinon, utiliser l'email
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "Utilisateur";
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = () => {
    if (!user) return "U";
    
    if (user.first_name && user.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }
    
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    
    return "U";
  };

  return (
    <header className="navbar">
      <div className="logo-section">
        <img src={logo} alt="Logo" />
        <span className="brand-title">
          Centre de Formation et de Consulting
        </span>
      </div>

      <div className="nav-right">
        <div className="notification">
          <i className="fa-regular fa-bell"></i>
        </div>

        <div className="admin-dropdown">
          <div
            className="admin-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="avatar">
              {/* Afficher les initiales au lieu de l'icône */}
              <span className="avatar-initials">{getInitials()}</span>
            </div>
            <span className="admin-name">{getDisplayName()}</span>
          </div>

          {menuOpen && (
            <div className="admin-menu show">
              {/* Lien Mon Profil */}
              <Link to="/mon-profil">
                <i className="fa-regular fa-user"></i> Mon Profil
              </Link>

              {/* Bouton Déconnexion */}
              <button className="logout" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;