// src/pages/auth/GestionComptes.js
import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import { getUsers, toggleUserStatus, deleteUser } from "../../services/auth/userService";
import "../../styles/auth/gestioncomptes.css";

// Mapping role -> badge
const ROLE_META = {
  super_admin:  { label: "Super Admin",  roleClass: "badge-admin",       roleIcon: "fa-shield-halved"    },
  responsable:  { label: "Responsable",  roleClass: "badge-gestionnaire", roleIcon: "fa-briefcase"        },
  assistante:   { label: "Assistante",   roleClass: "badge-user",         roleIcon: "fa-user"             },
  formateur:    { label: "Formateur",    roleClass: "badge-formateur",    roleIcon: "fa-chalkboard-user"  },
  etudiant:     { label: "Etudiant",     roleClass: "badge-user",         roleIcon: "fa-user-graduate"    },
};
const getRoleMeta = (role) =>
  ROLE_META[role] ?? { label: role, roleClass: "badge-user", roleIcon: "fa-user" };

const AVATAR_CLASSES = ["av1", "av2", "av3", "av4", "av5", "av6"];

function GestionComptes() {
  const [users, setUsers]         = useState([]);
  const [canManage, setCanManage] = useState(false);   // true si super_admin
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data.users || []);
      setCanManage(data.can_manage || false);
    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);
      setError("Impossible de charger les utilisateurs. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Filtrage local
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.nom.toLowerCase().includes(term)   ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)  ||
      user.code.toLowerCase().includes(term)
    );
  });

  // Stats
  const totalUsers    = users.length;
  const activeUsers   = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

  // Pagination
  const indexOfLastUser  = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers     = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages       = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Toggle statut (super_admin uniquement)
  const handleToggleStatus = async (userId) => {
    try {
      const result = await toggleUserStatus(userId);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => u.id === userId ? { ...u, is_active: result.is_active } : u)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Impossible de modifier le statut.");
    }
  };

  // Suppression (super_admin uniquement)
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Etes-vous sur de vouloir supprimer "${userName}" ?`)) return;
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Impossible de supprimer cet utilisateur.");
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1><i className="fa-solid fa-users-gear"></i> Gestion des Comptes</h1>
        <p>Gerez les utilisateurs, leurs roles et leurs acces a la plateforme.</p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher un utilisateur, e-mail, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canManage && (
          <a href="/ajouter-compte" className="btn-add">
            <i className="fa-solid fa-plus"></i> Ajouter un compte
          </a>
        )}
      </div>

      {/* Stats */}
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

        {loading && (
          <div className="table-feedback">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Chargement des utilisateurs...</span>
          </div>
        )}

        {!loading && error && (
          <div className="table-feedback error">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
            <button className="btn-retry" onClick={fetchUsers}>
              <i className="fa-solid fa-rotate-right"></i> Reessayer
            </button>
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className="table-feedback">
            <i className="fa-solid fa-users-slash"></i>
            <span>Aucun utilisateur trouve.</span>
          </div>
        )}

        {!loading && !error && filteredUsers.length > 0 && (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Utilisateur</th>
                    <th>E-mail</th>
                    <th>Role</th>
                    <th>Statut</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, idx) => {
                    const meta        = getRoleMeta(user.role);
                    const avatarClass = AVATAR_CLASSES[(user.id - 1) % AVATAR_CLASSES.length];
                    const globalIndex = indexOfFirstUser + idx + 1;

                    return (
                      <tr key={user.id}>
                        <td>{String(globalIndex).padStart(2, "0")}</td>
                        <td>
                          <div className="user-cell">
                            <div className={`user-avatar ${avatarClass}`}>{user.initiales}</div>
                            <div>
                              <div className="user-name">{user.nom}</div>
                              <div className="user-id">{user.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="email-cell">{user.email}</td>
                        <td>
                          <span className={`badge ${meta.roleClass}`}>
                            <i className={`fa-solid ${meta.roleIcon}`}></i> {meta.label}
                          </span>
                        </td>
                        <td>
                          <div className="status-toggle">
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={user.is_active}
                                onChange={() => canManage && handleToggleStatus(user.id)}
                                disabled={!canManage}
                              />
                              <div className="toggle-track"></div>
                              <div className="toggle-thumb"></div>
                            </label>
                            <span className={`status-label ${user.is_active ? "on" : "off"}`}>
                              {user.is_active ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </td>
                        {canManage && (
                          <td>
                            <div className="actions">
                              <a
                                href={`/details-compte?id=${user.id}`}
                                className="action-btn btn-detail"
                                title="Voir les details"
                              >
                                <i className="fa-solid fa-eye"></i>
                              </a>
                              <button
                                className="action-btn btn-delete"
                                title="Supprimer"
                                onClick={() => handleDelete(user.id, user.nom)}
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-row">
              <span>
                Affichage de {indexOfFirstUser + 1} a{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} sur{" "}
                {filteredUsers.length} entrees
              </span>
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default GestionComptes;