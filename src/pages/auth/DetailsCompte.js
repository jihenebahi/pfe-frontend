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
const getRoleMeta   = (role) => ROLE_META[role] ?? { label: role, icon: "fa-user" };
const AVATAR_COLORS = ["av1", "av2", "av3", "av4", "av5", "av6"];

function DetailsCompte() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const userId         = searchParams.get("id");

  const [user,       setUser]       = useState(null);
  const [canManage,  setCanManage]  = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [flash,      setFlash]      = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);

  useEffect(() => {
    if (!userId) { setError("Identifiant utilisateur manquant."); setLoading(false); return; }
    (async () => {
      try {
        const data = await getUserDetail(userId);
        if (data.success) { setUser(data.user); setCanManage(data.can_manage); }
        else setError("Impossible de charger les informations de cet utilisateur.");
      } catch { setError("Une erreur est survenue. Veuillez réessayer."); }
      finally { setLoading(false); }
    })();
  }, [userId]);

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  };

  const handleToggle = async () => {
    try {
      const res = await toggleUserStatus(user.id);
      if (res.success) {
        setUser(prev => ({ ...prev, is_active: res.is_active, statut: res.is_active ? "Actif" : "Inactif" }));
        showFlash("success", `Compte ${res.is_active ? "activé" : "désactivé"} avec succès.`);
      }
    } catch (err) {
      showFlash("error", err.response?.data?.message || "Impossible de modifier le statut.");
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await deleteUser(user.id);
      if (res.success) navigate("/gestion-comptes");
    } catch (err) {
      setShowModal(false); setDeleting(false);
      showFlash("error", err.response?.data?.message || "Impossible de supprimer ce compte.");
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <Layout>
      <div className="dc-feedback">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Chargement du profil...</span>
      </div>
    </Layout>
  );

  /* ── Error ── */
  if (error) return (
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
      <nav className="dc-breadcrumb">
        <Link to="/gestion-comptes">
          <i className="fa-solid fa-users-gear"></i> Gestion des comptes
        </Link>
        <i className="fa-solid fa-chevron-right dc-bc-sep"></i>
        <span>Détails du compte</span>
      </nav>

      {/* ── Page header ── */}
      <div className="dc-page-header">
        <div className="dc-header-icon">
          <i className="fa-solid fa-eye"></i>
        </div>
        <div>
          <h1>Détails du Compte</h1>
          <p>Consultez les informations complètes de cet utilisateur.</p>
        </div>
      </div>

      {/* ── Flash ── */}
      {flash && (
        <div className={`dc-alert dc-alert--${flash.type}`}>
          <i className={`fa-solid ${flash.type === "success" ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
          {flash.text}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          STACK PRINCIPAL
          1. Profile   → pleine largeur (header)
          2. Info + Activité → côte à côte
          3. Actions   → pleine largeur (footer)
      ══════════════════════════════════════════════ */}
      <div className="dc-stack">

        {/* ── BLOC 1 : Profil header ── */}
        <div className="dc-card dc-profile-card">
          <div className="dc-deco-ring"></div>

          <div className="dc-profile-left">
            <div className={`dc-profile-avatar ${avatarClass}`}>{user.initiales}</div>
            <div className="dc-profile-meta">
              <span className="dc-profile-name">{user.nom}</span>
              <div className="dc-profile-badges">
                <span className="dc-badge">
                  <i className={`fa-solid ${meta.icon}`}></i> {meta.label}
                </span>
              </div>
              <div className="dc-profile-status">
                <span className={user.is_active ? "dc-dot-on" : "dc-dot-off"}></span>
                <span className={`dc-status-label ${user.is_active ? "on" : "off"}`}>
                  {user.is_active ? "Compte actif" : "Compte inactif"}
                </span>
              </div>
            </div>
          </div>

          <div className="dc-profile-right">
            <div className="dc-profile-code">
              <i className="fa-solid fa-hashtag"></i>
              <span>{user.code}</span>
            </div>
          </div>
        </div>

        {/* ── BLOC 2 : Informations + Activité côte à côte ── */}
        <div className="dc-middle-row">

          {/* Informations générales */}
          <div className="dc-card">
            <div className="dc-card-header">
              <div className="dc-hdr-icon"><i className="fa-solid fa-circle-info"></i></div>
              <h3>Informations générales</h3>
            </div>
            <div className="dc-fields">

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-user"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Nom complet</span>
                  <span className="dc-field-value">{user.nom}</span>
                </div>
              </div>

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-envelope"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Adresse e-mail</span>
                  <span className="dc-field-value">{user.email}</span>
                </div>
              </div>

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-phone"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Téléphone</span>
                  <span className={`dc-field-value ${!user.telephone ? "empty" : ""}`}>
                    {user.telephone || "Non renseigné"}
                  </span>
                </div>
              </div>

              <div className="dc-field">
                <div className="dc-field-icon"><i className={`fa-solid ${meta.icon}`}></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Rôle</span>
                  <span className="dc-field-value">{meta.label}</span>
                </div>
              </div>

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-toggle-on"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Statut</span>
                  <span className={`dc-field-value dc-status-label ${user.is_active ? "on" : "off"}`}>
                    <i className="fa-solid fa-circle" style={{ fontSize: "7px", marginRight: "5px" }}></i>
                    {user.statut}
                  </span>
                </div>
              </div>

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-lock"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Mot de passe</span>
                  <div className="dc-pwd-row">
                    <span className={pwdVisible ? "dc-field-value dc-pwd-real" : "dc-field-value dc-pwd-dots"}>
                      {pwdVisible ? (user.password_display || "••••••••••") : "••••••••••"}
                    </span>
                    <button
                      className="dc-pwd-toggle"
                      onClick={() => setPwdVisible(v => !v)}
                      title={pwdVisible ? "Masquer" : "Afficher"}
                    >
                      <i className={`fa-solid ${pwdVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Activité */}
          <div className="dc-card">
            <div className="dc-card-header">
              <div className="dc-hdr-icon"><i className="fa-solid fa-clock-rotate-left"></i></div>
              <h3>Activité</h3>
            </div>
            <div className="dc-fields">

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-calendar-plus"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Date de création</span>
                  <span className={`dc-field-value ${!user.dateCreation ? "empty" : ""}`}>
                    {user.dateCreation || "—"}
                  </span>
                </div>
              </div>

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-right-to-bracket"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Dernière connexion</span>
                  <span className={`dc-field-value ${!user.derniereConnexion ? "empty" : ""}`}>
                    {user.derniereConnexion || "Jamais connecté"}
                  </span>
                </div>
              </div>

              <div className="dc-field">
                <div className="dc-field-icon"><i className="fa-solid fa-calendar-check"></i></div>
                <div className="dc-field-body">
                  <span className="dc-field-label">Dernière modification</span>
                  <span className={`dc-field-value ${!user.derniereModification ? "empty" : ""}`}>
                    {user.derniereModification || "—"}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>{/* /dc-middle-row */}

        {/* ── BLOC 3 : Actions footer ── */}
        <div className="dc-card dc-actions-card">
          <div className="dc-card-header">
            <div className="dc-hdr-icon"><i className="fa-solid fa-sliders"></i></div>
            <h3>Actions</h3>
          </div>
          <div className="dc-actions-row">

            <Link to="/gestion-comptes" className="dc-action-btn back">
              <div className="dc-action-icon"><i className="fa-solid fa-arrow-left"></i></div>
              <div className="dc-action-body">
                <span>Retour à la liste</span>
                <small>Revenir à la gestion des comptes</small>
              </div>
              <i className="fa-solid fa-chevron-right dc-action-arrow"></i>
            </Link>

            {canManage && (
              <button
                className={`dc-action-btn ${user.is_active ? "deactivate" : "activate"}`}
                onClick={handleToggle}
              >
                <div className="dc-action-icon">
                  <i className={`fa-solid ${user.is_active ? "fa-ban" : "fa-circle-check"}`}></i>
                </div>
                <div className="dc-action-body">
                  <span>{user.is_active ? "Désactiver le compte" : "Activer le compte"}</span>
                  <small>{user.is_active ? "Bloquer l'accès à cet utilisateur" : "Autoriser l'accès"}</small>
                </div>
                <i className="fa-solid fa-chevron-right dc-action-arrow"></i>
              </button>
            )}

            {canManage && (
              <button className="dc-action-btn delete" onClick={() => setShowModal(true)}>
                <div className="dc-action-icon"><i className="fa-solid fa-trash-can"></i></div>
                <div className="dc-action-body">
                  <span>Supprimer le compte</span>
                  <small>Cette action est irréversible</small>
                </div>
                <i className="fa-solid fa-chevron-right dc-action-arrow"></i>
              </button>
            )}

          </div>
        </div>

      </div>{/* /dc-stack */}


      {/* ══ MODALE ══ */}
      {showModal && (
        <div className="dc-modal-overlay" onClick={() => !deleting && setShowModal(false)}>
          <div className="dc-modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="dc-modal-icon">
              <i className="fa-solid fa-trash-can"></i>
            </div>
            <h2 className="dc-modal-title">Supprimer le compte</h2>

            <div className="dc-modal-preview">
              <div className={`dc-modal-avatar ${avatarClass}`}>{user.initiales}</div>
              <div>
                <span className="dc-modal-name">{user.nom}</span>
                <span className="dc-modal-code">{user.code}</span>
              </div>
            </div>

            <p className="dc-modal-warning">
              <i className="fa-solid fa-triangle-exclamation"></i>
              Cette action est <strong>irréversible</strong>. Toutes les données associées seront définitivement supprimées.
            </p>

            <div className="dc-modal-actions">
              <button
                className="dc-modal-btn dc-modal-btn--cancel"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              <button
                className="dc-modal-btn dc-modal-btn--confirm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</>
                  : <><i className="fa-solid fa-trash-can"></i> Confirmer</>
                }
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
}

export default DetailsCompte;