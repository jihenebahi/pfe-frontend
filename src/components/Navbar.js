import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/4Clab.png";
import authService from "../services/auth/authService";
import "../styles/layout.css"; // chemin vers ton fichier CSS

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (err) {
      console.error("Erreur logout:", err);
    }
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
              <i className="fa-solid fa-user"></i>
            </div>
            <span className="admin-name">Administrateur</span>
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