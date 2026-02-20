import React from "react";
import { Link } from "react-router-dom";
import "../styles/layout.css"; // chemin relatif vers ton fichier


function Sidebar() {
  return (
    <aside className="sidebar">
      {/* AIDE À LA DÉCISION */}
      <div className="sidebar-title">AIDE À LA DÉCISION</div>
      <Link to="/dashboard" className="sidebar-link">
        <i className="fa-solid fa-chart-line"></i> Tableau de bord
      </Link>
      <Link to="/rapports" className="sidebar-link">
        <i className="fa-solid fa-file-lines"></i> Rapports
      </Link>

      {/* GESTION RELATION CLIENT */}
      <div className="sidebar-title">GESTION RELATION CLIENT</div>
      <Link to="/prospects" className="sidebar-link">
        <i className="fa-solid fa-user-plus"></i> Prospects
      </Link>
      <Link to="/etudiants" className="sidebar-link">
        <i className="fa-solid fa-user-graduate"></i> Étudiants
      </Link>
      <Link to="/diplomes" className="sidebar-link">
        <i className="fa-solid fa-award"></i> Diplômés
      </Link>
      <Link to="/entreprises" className="sidebar-link">
        <i className="fa-solid fa-building"></i> Entreprises
      </Link>
      <Link to="/marketing-mail" className="sidebar-link">
        <i className="fa-solid fa-envelope"></i> Marketing Mail
      </Link>

      {/* INFORMATIONS DU CENTRE */}
      <div className="sidebar-title">INFORMATIONS DU CENTRE</div>
      <Link to="/formateurs" className="sidebar-link">
        <i className="fa-solid fa-chalkboard-user"></i> Formateurs
      </Link>
      <Link to="/formations" className="sidebar-link">
        <i className="fa-solid fa-book-open"></i> Formations
      </Link>

      {/* DOCUMENTS ADMINISTRATIFS */}
      <div className="sidebar-title">DOCUMENTS ADMINISTRATIFS</div>
      <Link to="/factures" className="sidebar-link">
        <i className="fa-solid fa-file-invoice"></i> Factures
      </Link>
      <Link to="/paiements" className="sidebar-link">
        <i className="fa-solid fa-credit-card"></i> Paiements
      </Link>
      <Link to="/attestations" className="sidebar-link">
        <i className="fa-solid fa-certificate"></i> Attestations
      </Link>

      {/* SYSTÈME */}
      <div className="sidebar-title">SYSTÈME</div>
      <Link to="/mon-profil" className="sidebar-link">
        <i className="fa-solid fa-id-badge"></i> Mon profil
      </Link>
      <Link to="/gestion-comptes" className="sidebar-link">
        <i className="fa-solid fa-users"></i> Gestion des comptes
      </Link>
    </aside>
  );
}

export default Sidebar;