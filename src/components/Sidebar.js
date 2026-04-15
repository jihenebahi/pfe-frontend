import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/layout.css";
import authService from "../services/auth/authService";

function Sidebar() {
  const isSuperAdmin = authService.isSuperAdmin();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">

      {/* HOME */}
      <Link
        to="/home"
        className={`sidebar-home-link ${isActive("/home") ? "active" : ""}`}
      >
        <i className="fa-solid fa-house"></i>
        <span>Home</span>
      </Link>

      {/* AIDE À LA DÉCISION */}
      <div className="sidebar-title">AIDE À LA DÉCISION</div>
      <Link to="/dashboard" className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}>
        <i className="fa-solid fa-chart-line"></i> Tableau de bord
      </Link>
      <Link to="/rapports" className={`sidebar-link ${isActive("/rapports") ? "active" : ""}`}>
        <i className="fa-solid fa-file-lines"></i> Rapports
      </Link>

      {/* GESTION RELATION CLIENT */}
      <div className="sidebar-title">GESTION RELATION CLIENT</div>
      <Link to="/prospects" className={`sidebar-link ${isActive("/prospects") ? "active" : ""}`}>
        <i className="fa-solid fa-user-plus"></i> Prospects
      </Link>
      <Link to="/etudiants" className={`sidebar-link ${isActive("/etudiants") ? "active" : ""}`}>
        <i className="fa-solid fa-user-graduate"></i> Étudiants
      </Link>
      <Link to="/diplomes" className={`sidebar-link ${isActive("/diplomes") ? "active" : ""}`}>
        <i className="fa-solid fa-award"></i> Diplômés
      </Link>
      <Link to="/marketing-mail" className={`sidebar-link ${isActive("/marketing-mail") ? "active" : ""}`}>
        <i className="fa-solid fa-envelope"></i> Marketing Mail
      </Link>

      {/* INFORMATIONS DU CENTRE */}
      <div className="sidebar-title">INFORMATIONS DU CENTRE</div>
      <Link to="/formateurs" className={`sidebar-link ${isActive("/formateurs") ? "active" : ""}`}>
        <i className="fa-solid fa-chalkboard-user"></i> Formateurs
      </Link>
      <Link to="/formations" className={`sidebar-link ${isActive("/formations") ? "active" : ""}`}>
        <i className="fa-solid fa-book-open"></i> Formations
      </Link>

      {/* SYSTÈME */}
      <div className="sidebar-title">SYSTÈME</div>
      <Link to="/mon-profil" className={`sidebar-link ${isActive("/mon-profil") ? "active" : ""}`}>
        <i className="fa-solid fa-id-badge"></i> Mon profil
      </Link>

      {isSuperAdmin && (
        <Link to="/gestion-comptes" className={`sidebar-link ${isActive("/gestion-comptes") ? "active" : ""}`}>
          <i className="fa-solid fa-users"></i> Gestion des comptes
        </Link>
      )}
    </aside>
  );
}

export default Sidebar;