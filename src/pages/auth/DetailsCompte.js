// src/pages/auth/DetailsCompte.js
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { getUserDetail, toggleUserStatus, deleteUser } from "../../services/auth/userService";
import "../../styles/auth/detailscompte.css";

const ROLE_META = {
  super_admin: { label: "Super Administrateur", icon: "fa-shield-halved"   },
  responsable: { label: "Responsable",          icon: "fa-briefcase"       },
  assistante:  { label: "Assistante",           icon: "fa-user"            },
  formateur:   { label: "Formateur",            icon: "fa-chalkboard-user" },
  etudiant:    { label: "Étudiant",             icon: "fa-user-graduate"   },
  entreprise:  { label: "Entreprise Partenaire",icon: "fa-building"        },
};
const getRoleMeta = (role) =>
  ROLE_META[role] ?? { label: role, icon: "fa-user" };

const AVATAR_COLORS = ["av1", "av2", "av3", "av4", "av5", "av6"];

function DetailsCompte() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const userId         = searchParams.get("id");

  const [user,      setUser]      = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [flash,     setFlash]     = useState(null);    // { type, text }
  const [showModal, setShowModal] = useState(false);   // modale suppression
  const [deleting,  setDeleting]  = useState(false);   // spinner dans la modale

  // ── Chargement initial ───────────────────────────────
  useEffect(() => {
    if (!userId) {
      setError("Identifiant utilisateur manquant.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await getUserDetail(userId);
        if (data.success) {
          setUser(data.user);
          setCanManage(data.can_manage);
        } else {
          setError("Impossible de charger les informations de cet utilisateur.");
        }
      } catch {
        setError("Une erreur est survenue. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // ── Flash message ────────────────────────────────────
  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  };

  // ── Toggle statut ────────────────────────────────────
  const handleToggle = async () => {
    try {
      const res = await toggleUserStatus(user.id);
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          is_active: res.is_active,
          statut: res.is_active ? "Actif" : "Inactif",
        }));
        showFlash("success", `Compte ${res.is_active ? "activé" : "désactivé"} avec succès.`);
      }
    } catch (err) {
      showFlash("error", err.response?.data?.message || "Impossible de modifier le statut.");
    }
  };

  // ── Suppression confirmée depuis la modale ────────────
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await deleteUser(user.id);
      if (res.success) navigate("/gestion-comptes");
    } catch (err) {
      setShowModal(false);
      setDeleting(false);
      showFlash("error", err.response?.data?.message || "Impossible de supprimer ce compte.");
    }
  };

  // ── Rendu : chargement ───────────────────────────────
  if (loading)
    return (
      <Layout>
        <div className="dc-feedback">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Chargement du profil...</span>
        </div>
      </Layout>
    );

  // ── Rendu : erreur ───────────────────────────────────
  if (error)
    return (
      <Layout>
        <div className="dc-feedback dc-feedback--error">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
          <Link to="/gestion-comptes">
            <i className="fa-solid fa-arrow-left"></i> Retour à la liste
          </Link>
        </div>
      </Layout>
    );

  const meta        = getRoleMeta(user.role);
  const avatarClass = AVATAR_COLORS[(user.id - 1) % AVATAR_COLORS.length];

  return (
    <Layout>

      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb">
        <Link to="/gestion-comptes">
          <i className="fa-solid fa-users-gear"></i> Gestion des comptes
        </Link>
        <i className="fa-solid fa-chevron-right bc-sep"></i>
        <span>Détails du compte</span>
      </nav>

      {/* ── Page header ── */}
      <div className="page-header">
        <h1><i className="fa-solid fa-eye"></i> Détails du Compte</h1>
        <p>Consultez les informations complètes de cet utilisateur.</p>
      </div>

      {/* ── Flash ── */}
      {flash && (
        <div className={`dc-alert dc-alert--${flash.type}`}>
          <i className={`fa-solid ${flash.type === "success" ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
          {flash.text}
        </div>
      )}

      {/* ══════════════ GRILLE ══════════════ */}
      <div className="details-grid">

        {/* Carte profil */}
        <div className="detail-card profile-card">
          <div className="profile-top">
            <div className={`profile-avatar ${avatarClass}`}>{user.initiales}</div>
            <div className="profile-info">
              <h2>{user.nom}</h2>
              <span className="badge">
                <i className={`fa-solid ${meta.icon}`}></i> {meta.label}
              </span>
              <div className="profile-status">
                <span className={user.is_active ? "dot-on" : "dot-off"}></span>
                <span className={`status-label ${user.is_active ? "on" : "off"}`}>
                  {user.is_active ? "Compte actif" : "Compte inactif"}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-id-badge">
            <i className="fa-solid fa-hashtag"></i> {user.code}
          </div>
        </div>

        {/* Carte informations */}
        <div className="detail-card info-card">
          <div className="detail-card-header">
            <i className="fa-solid fa-circle-info"></i>
            <h3>Informations du compte</h3>
          </div>
          <div className="detail-fields">
            <div className="detail-field">
              <div className="field-icon"><i className="fa-solid fa-user"></i></div>
              <div className="field-body">
                <span className="field-label">Nom complet</span>
                <span className="field-value">{user.nom}</span>
              </div>
            </div>
            <div className="detail-field">
              <div className="field-icon"><i className="fa-solid fa-envelope"></i></div>
              <div className="field-body">
                <span className="field-label">Adresse e-mail</span>
                <span className="field-value">{user.email}</span>
              </div>
            </div>
            <div className="detail-field">
              <div className="field-icon"><i className="fa-solid fa-phone"></i></div>
              <div className="field-body">
                <span className="field-label">Téléphone</span>
                <span className={`field-value ${!user.telephone ? "empty" : ""}`}>
                  {user.telephone || "Non renseigné"}
                </span>
              </div>
            </div>
            <div className="detail-field">
              <div className="field-icon"><i className={`fa-solid ${meta.icon}`}></i></div>
              <div className="field-body">
                <span className="field-label">Rôle</span>
                <span className="field-value">{meta.label}</span>
              </div>
            </div>
            <div className="detail-field">
              <div className="field-icon"><i className="fa-solid fa-toggle-on"></i></div>
              <div className="field-body">
                <span className="field-label">Statut</span>
                <span className={`field-value status-label ${user.is_active ? "on" : "off"}`}>
                  <i className="fa-solid fa-circle" style={{ fontSize: "8px", marginRight: "5px" }}></i>
                  {user.statut}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carte activité */}
        <div className="detail-card activity-card">
          <div className="detail-card-header">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <h3>Activité</h3>
          </div>
          <div className="detail-fields">
            <div className="detail-field">
              <div className="field-icon"><i className="fa-solid fa-calendar-plus"></i></div>
              <div className="field-body">
                <span className="field-label">Date de création</span>
                <span className={`field-value ${!user.dateCreation ? "empty" : ""}`}>
                  {user.dateCreation || "—"}
                </span>
              </div>
            </div>
            <div className="detail-field">
              <div className="field-icon"><i className="fa-solid fa-right-to-bracket"></i></div>
              <div className="field-body">
                <span className="field-label">Dernière connexion</span>
                <span className={`field-value ${!user.derniereConnexion ? "empty" : ""}`}>
                  {user.derniereConnexion || "Jamais connecté"}
                </span>
              </div>
            </div>
            <div className="detail-field">
              <div className="field-icon"><i className="fa-solid fa-calendar-check"></i></div>
              <div className="field-body">
                <span className="field-label">Dernière modification</span>
                <span className={`field-value ${!user.derniereModification ? "empty" : ""}`}>
                  {user.derniereModification || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carte actions */}
        <div className="detail-card actions-card" style={{ gridColumn: "1 / -1" }}>
          <div className="detail-card-header">
            <i className="fa-solid fa-sliders"></i>
            <h3>Actions</h3>
          </div>
          <div className="actions-list">

            {/* Retour — toujours visible */}
            <Link to="/gestion-comptes" className="action-link back">
              <div className="action-link-icon"><i className="fa-solid fa-arrow-left"></i></div>
              <div className="action-link-text">
                <span>Retour à la liste</span>
                <small>Revenir à la gestion des comptes</small>
              </div>
              <i className="fa-solid fa-chevron-right action-link-arrow"></i>
            </Link>

            {/* Toggle statut — super_admin uniquement */}
            {canManage && (
              <button
                className={`action-link ${user.is_active ? "deactivate" : "activate"}`}
                onClick={handleToggle}
              >
                <div className="action-link-icon">
                  <i className={`fa-solid ${user.is_active ? "fa-ban" : "fa-circle-check"}`}></i>
                </div>
                <div className="action-link-text">
                  <span>{user.is_active ? "Désactiver le compte" : "Activer le compte"}</span>
                  <small>{user.is_active ? "Bloquer l'accès à cet utilisateur" : "Autoriser l'accès à cet utilisateur"}</small>
                </div>
                <i className="fa-solid fa-chevron-right action-link-arrow"></i>
              </button>
            )}

            {/* Suppression → ouvre la modale */}
            {canManage && (
              <button className="action-link delete" onClick={() => setShowModal(true)}>
                <div className="action-link-icon"><i className="fa-solid fa-trash-can"></i></div>
                <div className="action-link-text">
                  <span>Supprimer le compte</span>
                  <small>Cette action est irréversible</small>
                </div>
                <i className="fa-solid fa-chevron-right action-link-arrow"></i>
              </button>
            )}

          </div>
        </div>

      </div>{/* /details-grid */}


      {/* ══════════════ MODALE SUPPRESSION ══════════════ */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => !deleting && setShowModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            {/* Icône danger */}
            <div className="modal-icon-wrap">
              <i className="fa-solid fa-trash-can"></i>
            </div>

            {/* Titre */}
            <h2 className="modal-title">Supprimer le compte</h2>

            {/* Infos de l'utilisateur ciblé */}
            <div className="modal-user-preview">
              <div className={`modal-avatar ${avatarClass}`}>{user.initiales}</div>
              <div>
                <span className="modal-user-name">{user.nom}</span>
                <span className="modal-user-code">{user.code}</span>
              </div>
            </div>

            {/* Avertissement */}
            <p className="modal-warning">
              <i className="fa-solid fa-triangle-exclamation"></i>
              Cette action est <strong>irréversible</strong>. Toutes les données associées à ce compte seront définitivement supprimées.
            </p>

            {/* Boutons */}
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--cancel"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              <button
                className="modal-btn modal-btn--confirm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</>
                ) : (
                  <><i className="fa-solid fa-trash-can"></i> Confirmer la suppression</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
}

export default DetailsCompte;