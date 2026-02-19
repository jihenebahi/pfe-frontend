import React, { useState } from "react";
import "../../styles/home/home.css";
import logo from "../../assets/4Clab.png";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth/authService";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await authService.logout(); // Appelle l'API Django et supprime localStorage
      navigate("/"); // Redirige vers la page de connexion
    } catch (err) {
      console.error("Erreur lors du logout:", err);
    }
  };

  return (
    <>
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
                <a href="#">
                  <i className="fa-regular fa-user"></i> Mon Profil
                </a>

                {/* Déconnexion avec appel de la fonction */}
                <a
                  href="#"
                  className="logout"
                  onClick={(e) => {
                    e.preventDefault(); // Empêche le # de remonter la page
                    handleLogout();
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container">
        <aside className="sidebar">
          <div className="sidebar-title">AIDE À LA DÉCISION</div>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-chart-line"></i> Tableau de bord
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-file-lines"></i> Rapports
          </a>

          <div className="sidebar-title">GESTION RELATION CLIENT</div>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-user-plus"></i> Prospects
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-user-graduate"></i> Étudiants
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-award"></i> Diplômés
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-building"></i> Entreprises
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-envelope"></i> Marketing Mail
          </a>

          <div className="sidebar-title">INFORMATIONS DU CENTRE</div>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-chalkboard-user"></i> Formateurs
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-book-open"></i> Formations
          </a>

          <div className="sidebar-title">DOCUMENTS ADMINISTRATIFS</div>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-file-invoice"></i> Factures
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-credit-card"></i> Paiements
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-certificate"></i> Attestations
          </a>

          <div className="sidebar-title">SYSTÈME</div>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-id-badge"></i> Mon profil
          </a>
          <a href="#" className="sidebar-link">
            <i className="fa-solid fa-users"></i> Gestion des comptes
          </a>
        </aside>

        <main className="content">
          <h1>Bienvenue sur la plateforme</h1>
        </main>
      </div>
    </>
  );
}

export default Home;
