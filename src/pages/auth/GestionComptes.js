import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/auth/gestioncomptes.css";

function GestionComptes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([
    {
      id: 1,
      numero: "01",
      code: "#USR-001",
      nom: "Karima Benali",
      initiales: "KB",
      email: "k.benali@centre.dz",
      role: "Administrateur",
      roleClass: "badge-admin",
      roleIcon: "fa-shield-halved",
      statut: true,
      avatarClass: "av1"
    },
    {
      id: 2,
      numero: "02",
      code: "#USR-002",
      nom: "Yacine Meziane",
      initiales: "YM",
      email: "y.meziane@centre.dz",
      role: "Formateur",
      roleClass: "badge-formateur",
      roleIcon: "fa-chalkboard-user",
      statut: true,
      avatarClass: "av2"
    },
    {
      id: 3,
      numero: "03",
      code: "#USR-003",
      nom: "Amina Zerrouk",
      initiales: "AZ",
      email: "a.zerrouk@centre.dz",
      role: "Gestionnaire",
      roleClass: "badge-gestionnaire",
      roleIcon: "fa-briefcase",
      statut: false,
      avatarClass: "av3"
    },
    {
      id: 4,
      numero: "04",
      code: "#USR-004",
      nom: "Sofiane Hadj",
      initiales: "SH",
      email: "s.hadj@centre.dz",
      role: "Formateur",
      roleClass: "badge-formateur",
      roleIcon: "fa-chalkboard-user",
      statut: true,
      avatarClass: "av4"
    },
    {
      id: 5,
      numero: "05",
      code: "#USR-005",
      nom: "Nadia Chabane",
      initiales: "NC",
      email: "n.chabane@centre.dz",
      role: "Utilisateur",
      roleClass: "badge-user",
      roleIcon: "fa-user",
      statut: false,
      avatarClass: "av5"
    },
    {
      id: 6,
      numero: "06",
      code: "#USR-006",
      nom: "Omar Bousaid",
      initiales: "OB",
      email: "o.bousaid@centre.dz",
      role: "Administrateur",
      roleClass: "badge-admin",
      roleIcon: "fa-shield-halved",
      statut: true,
      avatarClass: "av6"
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers = users.filter(user =>
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.statut).length;
  const inactiveUsers = users.filter(user => !user.statut).length;

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Changer le statut d'un utilisateur
  const toggleStatut = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, statut: !user.statut } : user
    ));
  };

  // Supprimer un utilisateur
  const handleDelete = (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>
          <i className="fa-solid fa-users-gear"></i> Gestion des Comptes
        </h1>
        <p>Gérez les utilisateurs, leurs rôles et leurs accès à la plateforme.</p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher un utilisateur, e-mail, rôle…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <a href="/ajouter-compte" className="btn-add">
          <i className="fa-solid fa-plus"></i>
          Ajouter un compte
        </a>
      </div>

      {/* Stats chips */}
      <div className="stats-row">
        <div className="stat-chip total">
          <i className="fa-solid fa-users" style={{ color: "var(--navy)" }}></i>
          Total : <span>{totalUsers}</span>
        </div>
        <div className="stat-chip active">
          <i className="fa-solid fa-circle-check" style={{ color: "#22c55e" }}></i>
          Actifs : <span>{activeUsers}</span>
        </div>
        <div className="stat-chip inactive">
          <i className="fa-solid fa-circle-xmark" style={{ color: "#ef4444" }}></i>
          Inactifs : <span>{inactiveUsers}</span>
        </div>
      </div>

      {/* Table card */}
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Utilisateur</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.numero}</td>
                  <td>
                    <div className="user-cell">
                      <div className={`user-avatar ${user.avatarClass}`}>
                        {user.initiales}
                      </div>
                      <div>
                        <div className="user-name">{user.nom}</div>
                        <div className="user-id">{user.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td>
                    <span className={`badge ${user.roleClass}`}>
                      <i className={`fa-solid fa-${user.roleIcon}`}></i> {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="status-toggle">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={user.statut}
                          onChange={() => toggleStatut(user.id)}
                        />
                        <div className="toggle-track"></div>
                        <div className="toggle-thumb"></div>
                      </label>
                      <span className={`status-label ${user.statut ? 'on' : 'off'}`}>
                        {user.statut ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <a
                        href={`/details-compte?id=${user.id}`}
                        className="action-btn btn-detail"
                        title="Voir les détails"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </a>
                      <button
                        className="action-btn btn-delete"
                        title="Supprimer"
                        onClick={() => handleDelete(user.id)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-row">
          <span>
            Affichage de {indexOfFirstUser + 1} à {Math.min(indexOfLastUser, filteredUsers.length)} sur {filteredUsers.length} entrées
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default GestionComptes;