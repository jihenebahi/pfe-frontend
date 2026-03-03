// src/pages/infoCentre/Categories.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getCategories,
  ajouterCategorie,
  modifierCategorie,
  supprimerCategorie,
} from "../../services/infoCentre/categorieService";
import "../../styles/infoCentre/categories.css";

const CAT_COLORS = {
  "Marketing digital": "#33CCFF",
  "Informatique": "#336699",
  "IA": "#7C3AED",
  "Design": "#EC4899",
  "Langues": "#059669",
  "Data": "#FFCC33",
  "Soft skills": "#CCCC99",
};

const EMPTY_FORM = { nom: "", description: "", actif: true };
const ITEMS_PER_PAGE = 7;

const styleErreurBox = {
  border: "1.5px solid #ef4444",
  borderRadius: "8px",
  padding: "10px 14px",
  backgroundColor: "#fff5f5",
  color: "#dc2626",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "6px",
};

const styleSuccesBox = {
  border: "1.5px solid #22c55e",
  borderRadius: "10px",
  padding: "14px 18px",
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px",
  fontWeight: "500",
  boxShadow: "0 2px 8px rgba(34,197,94,0.10)",
  animation: "fadeInDown 0.3s ease",
};

const styleInputErreur = { border: "1.5px solid #ef4444" };

function ErrMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={styleErreurBox}>
      <i className="fa-solid fa-triangle-exclamation"></i> {msg}
    </div>
  );
}

function SuccesMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={styleSuccesBox}>
      <i className="fa-solid fa-circle-check" style={{ fontSize: "18px" }}></i>
      {msg}
    </div>
  );
}

function Categories() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalDetail, setModalDetail] = useState(null);
  const [modalModif, setModalModif]   = useState(null);
  const [modalAjout, setModalAjout]   = useState(false);
  const [modalSuppr, setModalSuppr]   = useState(null);

  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);

  const [erreursAjout, setErreursAjout]       = useState({});
  const [errServeurAjout, setErrServeurAjout] = useState("");
  const [erreursModif, setErreursModif]       = useState({});
  const [errServeurModif, setErrServeurModif] = useState("");
  const [errSuppr, setErrSuppr]               = useState("");
  const [errToggle, setErrToggle]             = useState("");
  const [submitLoading, setSubmitLoading]     = useState(false);

  // ── MESSAGES DE SUCCÈS ──
  const [succesGlobal, setSuccesGlobal] = useState("");

  const afficherSucces = (msg) => {
    setSuccesGlobal(msg);
    setTimeout(() => setSuccesGlobal(""), 4000);
  };

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Recherche en temps réel par nom uniquement + tri par date décroissante (plus récente en premier)
  const filtered = data
    .filter((c) => c.nom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "-";
  const getNum     = (i) => String(i + 1).padStart(2, "0");
  const initiales  = (nom) => nom ? nom.slice(0, 2).toUpperCase() : "??";

  const valider = (form) => {
    const e = {};
    if (!form.nom.trim())         e.nom         = "Le nom est obligatoire.";
    if (!form.description.trim()) e.description = "La description est obligatoire.";
    return e;
  };

  // ── AJOUTER ──
  const handleAjouter = async () => {
    const e = valider(formAjout);
    if (Object.keys(e).length) { setErreursAjout(e); return; }
    try {
      setSubmitLoading(true);
      setErreursAjout({});
      setErrServeurAjout("");
      await ajouterCategorie({ 
        nom: formAjout.nom.trim(), 
        description: formAjout.description.trim(), 
        actif: formAjout.actif 
      });
      setModalAjout(false);
      setFormAjout(EMPTY_FORM);
      await fetchCategories();
      afficherSucces("Catégorie ajoutée avec succès !");
    } catch (err) {
      if (err.response?.data?.nom) {
        setErreursAjout({ nom: "Une catégorie avec ce nom existe déjà." });
      } else {
        setErrServeurAjout("Erreur serveur. Veuillez réessayer.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── MODIFIER ──
  const openModif = (cat) => {
    setFormModif({ 
      nom: cat.nom, 
      description: cat.description || "", 
      actif: cat.actif,
      formations_count: cat.formations_count || 0 
    });
    setErreursModif({});
    setErrServeurModif("");
    setErrToggle("");
    setModalModif(cat);
  };

  const handleModifier = async () => {
    const e = valider(formModif);
    if (Object.keys(e).length) { setErreursModif(e); return; }
    
    // Vérifier si on essaie de désactiver une catégorie qui a des formations
    if (!formModif.actif && modalModif.formations_count > 0) {
      setErrServeurModif("Impossible de désactiver : cette catégorie est liée à " + modalModif.formations_count + " formation(s).");
      return;
    }
    
    try {
      setSubmitLoading(true);
      setErreursModif({});
      setErrServeurModif("");
      await modifierCategorie(modalModif.id, {
        nom: formModif.nom.trim(),
        description: formModif.description.trim(),
        actif: formModif.actif,
      });
      setModalModif(null);
      await fetchCategories();
      afficherSucces("Modification faite avec succès !");
    } catch (err) {
      if (err.response?.data?.nom) {
        setErreursModif({ nom: "Une catégorie avec ce nom existe déjà." });
      } else if (err.response?.data?.detail) {
        setErrServeurModif(err.response.data.detail);
      } else {
        setErrServeurModif("Erreur serveur. Veuillez réessayer.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── TOGGLE DIRECT DEPUIS LA LISTE ──
  const handleToggleActif = async (cat) => {
    // Si la catégorie a des formations et qu'on veut la désactiver
    if (cat.actif && cat.formations_count > 0) {
      setErrToggle("Impossible de désactiver : cette catégorie est liée à " + cat.formations_count + " formation(s).");
      setTimeout(() => setErrToggle(""), 5000);
      return;
    }
    
    try {
      setSubmitLoading(true);
      await modifierCategorie(cat.id, {
        nom: cat.nom,
        description: cat.description,
        actif: !cat.actif,
      });
      await fetchCategories();
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
      if (err.response?.data?.detail) {
        setErrToggle(err.response.data.detail);
        setTimeout(() => setErrToggle(""), 5000);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── SUPPRIMER ──
  const openSuppr = (cat) => { 
    if (cat.formations_count > 0) {
      setErrSuppr("Impossible de supprimer : cette catégorie est liée à " + cat.formations_count + " formation(s).");
      return;
    }
    setErrSuppr(""); 
    setModalSuppr(cat); 
  };

  const handleSupprimer = async () => {
    try {
      setSubmitLoading(true);
      setErrSuppr("");
      await supprimerCategorie(modalSuppr.id);
      setModalSuppr(null);
      await fetchCategories();
    } catch (err) {
      if (err.response?.status === 400) {
        setErrSuppr("Impossible de supprimer : cette catégorie est liée à une ou plusieurs formations.");
      } else {
        setErrSuppr("Erreur serveur. Veuillez réessayer.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOverlay = (e, fn) => { if (e.target === e.currentTarget) fn(); };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title"><i className="fa-solid fa-tags"></i> Gestion des Catégories</h1>
        <p className="page-sub">Gérez les catégories associées aux formations du centre</p>
      </div>

      {/* ══════════ MESSAGE DE SUCCÈS GLOBAL ══════════ */}
      {succesGlobal && (
        <SuccesMsg msg={succesGlobal} />
      )}

      {/* Message d'erreur global pour les toggles */}
      {errToggle && (
        <div style={{ ...styleErreurBox, marginBottom: "16px" }}>
          <i className="fa-solid fa-triangle-exclamation"></i> {errToggle}
        </div>
      )}

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Rechercher par nom…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-back" onClick={() => navigate("/formations")}>
            <i className="fa-solid fa-arrow-left"></i> Formations
          </button>
          <button className="btn btn-add" onClick={() => {
            setFormAjout(EMPTY_FORM);
            setErreursAjout({});
            setErrServeurAjout("");
            setModalAjout(true);
          }}>
            <i className="fa-solid fa-plus"></i> Nouvelle Catégorie
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-top">
          Affichage de <strong>{paginated.length}</strong> catégories sur <strong>{filtered.length}</strong>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Chargement…
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom de la catégorie</th>
                  <th>Formations liées</th>
                  <th>Date de création</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#94A3B8" }}>Aucune catégorie trouvée.</td></tr>
                ) : (
                  paginated.map((cat, index) => (
                    <tr key={cat.id}>
                      <td className="td-num">{getNum((currentPage - 1) * ITEMS_PER_PAGE + index)}</td>
                      <td className="td-name">
                        <div className="cat-name-cell">
                          <div className="cat-dot" style={{ background: CAT_COLORS[cat.nom] || "#94A3B8" }}></div>
                          {cat.nom}
                        </div>
                      </td>
                      <td className="td-count">
                        <span className={`formations-count ${cat.formations_count > 0 ? 'has-formations' : ''}`}>
                          {cat.formations_count || 0} formation{cat.formations_count > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="td-date">{formatDate(cat.date_creation)}</td>
                      <td>
                        <div className="toggle-wrap">
                          <label className="toggle">
                            <input 
                              type="checkbox" 
                              checked={cat.actif} 
                              onChange={() => handleToggleActif(cat)}
                              disabled={submitLoading || (cat.actif && cat.formations_count > 0)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <span className={`toggle-lbl ${cat.actif ? "on" : "off"}`}>
                            {cat.actif ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      </td>
                      <td className="td-actions">
                        <button 
                          className="act-btn act-detail" 
                          title="Détail"   
                          onClick={() => setModalDetail(cat)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button 
                          className="act-btn act-modif"  
                          title="Modifier"  
                          onClick={() => openModif(cat)}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          className={`act-btn act-suppr ${cat.formations_count > 0 ? 'disabled' : ''}`}  
                          title={cat.formations_count > 0 ? "Impossible de supprimer (formations liées)" : "Supprimer"}
                          onClick={() => openSuppr(cat)}
                          disabled={cat.formations_count > 0}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="pg-btn" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`pg-num${p === currentPage ? " active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
            ))}
            <button className="pg-btn" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* ══════════ MODALE DÉTAIL ══════════ */}
      {modalDetail && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalDetail(null))}>
          <div className="modal">
            <div className="modal-header detail-header">
              <div className="detail-header-left">
                <div className="detail-icon-wrap"><i className="fa-solid fa-tags"></i></div>
                <div className="detail-header-info">
                  <h2>{modalDetail.nom}</h2>
                  <p className="detail-sub">Créée le {formatDate(modalDetail.date_creation)}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalDetail(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="detail-stat-row">
                <div className="dsr-card">
                  <div className="dsr-icon"><i className="fa-solid fa-hashtag"></i></div>
                  <div className="dsr-info">
                    <span className="dsr-val">#{modalDetail.id}</span>
                    <span className="dsr-lbl">ID catégorie</span>
                  </div>
                </div>
                <div className="dsr-card">
                  <div className="dsr-icon"><i className="fa-solid fa-book-open"></i></div>
                  <div className="dsr-info">
                    <span className="dsr-val">{modalDetail.formations_count || 0}</span>
                    <span className="dsr-lbl">Formation{modalDetail.formations_count > 1 ? 's' : ''} liée{modalDetail.formations_count > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="dsr-card">
                  <div className="dsr-icon"><i className="fa-regular fa-calendar"></i></div>
                  <div className="dsr-info">
                    <span className="dsr-val">{formatDate(modalDetail.date_creation)}</span>
                    <span className="dsr-lbl">Date de création</span>
                  </div>
                </div>
                <div className="dsr-card">
                  <div className="dsr-icon"><i className="fa-solid fa-circle-check"></i></div>
                  <div className="dsr-info">
                    <span className={`dsr-val ${modalDetail.actif ? "dsr-active" : "dsr-inactive"}`}>
                      {modalDetail.actif ? "Active" : "Inactive"}
                    </span>
                    <span className="dsr-lbl">Statut</span>
                  </div>
                </div>
              </div>
              <div className="detail-sections">
                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-align-left"></i> Description</div>
                  <p className="detail-sec-text">{modalDetail.description || "Aucune description."}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalDetail(null)}>Fermer</button>
              <button 
                className="btn btn-update" 
                onClick={() => { setModalDetail(null); openModif(modalDetail); }}
                disabled={modalDetail.formations_count > 0 && !modalDetail.actif}
              >
                <i className="fa-solid fa-pen"></i> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODALE AJOUTER ══════════ */}
      {modalAjout && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalAjout(false))}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="fa-solid fa-plus-circle"></i> Ajouter une Catégorie</h2>
              <button className="modal-close" onClick={() => setModalAjout(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              {errServeurAjout && <ErrMsg msg={errServeurAjout} />}
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nom de la catégorie <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex : Intelligence Artificielle"
                    value={formAjout.nom}
                    style={erreursAjout.nom ? styleInputErreur : {}}
                    onChange={(e) => { setFormAjout({ ...formAjout, nom: e.target.value }); setErreursAjout({ ...erreursAjout, nom: "" }); }}
                  />
                  <ErrMsg msg={erreursAjout.nom} />
                </div>
                <div className="form-group full">
                  <label>Description <span className="req">*</span></label>
                  <textarea
                    rows="5"
                    placeholder="Décrivez cette catégorie…"
                    value={formAjout.description}
                    style={erreursAjout.description ? styleInputErreur : {}}
                    onChange={(e) => { setFormAjout({ ...formAjout, description: e.target.value }); setErreursAjout({ ...erreursAjout, description: "" }); }}
                  />
                  <ErrMsg msg={erreursAjout.description} />
                </div>
                <div className="form-group full">
                  <div className="form-toggle-row">
                    <label>Statut</label>
                    <label className="toggle">
                      <input type="checkbox" checked={formAjout.actif} onChange={(e) => setFormAjout({ ...formAjout, actif: e.target.checked })} />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-lbl ${formAjout.actif ? "on" : "off"}`}>{formAjout.actif ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)}>Annuler</button>
              <button className="btn btn-save" onClick={handleAjouter} disabled={submitLoading}>
                {submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODALE MODIFIER ══════════ */}
      {modalModif && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalModif(null))}>
          <div className="modal">
            <div className="modal-header modif-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier la Catégorie</h2>
              <button className="modal-close" onClick={() => setModalModif(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              {errServeurModif && <ErrMsg msg={errServeurModif} />}
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nom de la catégorie <span className="req">*</span></label>
                  <input
                    type="text"
                    value={formModif.nom}
                    style={erreursModif.nom ? styleInputErreur : {}}
                    onChange={(e) => { setFormModif({ ...formModif, nom: e.target.value }); setErreursModif({ ...erreursModif, nom: "" }); }}
                  />
                  <ErrMsg msg={erreursModif.nom} />
                </div>
                <div className="form-group full">
                  <label>Description <span className="req">*</span></label>
                  <textarea
                    rows="5"
                    value={formModif.description}
                    style={erreursModif.description ? styleInputErreur : {}}
                    onChange={(e) => { setFormModif({ ...formModif, description: e.target.value }); setErreursModif({ ...erreursModif, description: "" }); }}
                  />
                  <ErrMsg msg={erreursModif.description} />
                </div>
                <div className="form-group full">
                  <div className="form-toggle-row">
                    <label>Statut</label>
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={formModif.actif} 
                        onChange={(e) => setFormModif({ ...formModif, actif: e.target.checked })}
                        disabled={!formModif.actif && modalModif.formations_count > 0}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-lbl ${formModif.actif ? "on" : "off"}`}>
                      {formModif.actif ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {!formModif.actif && modalModif.formations_count > 0 && (
                    <small style={{ color: "#ef4444", marginTop: "4px", display: "block" }}>
                      <i className="fa-solid fa-info-circle"></i> Cette catégorie a {modalModif.formations_count} formation(s) liée(s). Vous ne pouvez pas la désactiver.
                    </small>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)}>Annuler</button>
              <button className="btn btn-update" onClick={handleModifier} disabled={submitLoading}>
                {submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-rotate"></i> Mettre à jour</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODALE SUPPRIMER ══════════ */}
      {modalSuppr && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => { if (!submitLoading) setModalSuppr(null); })}>
          <div className="modal modal-suppr">
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "32px" }}>
              <div style={{ background: "#fff0f0", borderRadius: "16px", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-trash" style={{ fontSize: "28px", color: "#ef4444" }}></i>
              </div>
            </div>
            <div className="modal-body" style={{ textAlign: "center", paddingTop: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" }}>
                Supprimer la catégorie
              </h2>
              {/* Card nom */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
                <div style={{ background: CAT_COLORS[modalSuppr.nom] || "#94A3B8", borderRadius: "8px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                  {initiales(modalSuppr.nom)}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{modalSuppr.nom}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>#{String(modalSuppr.id).padStart(3, "0")}</div>
                </div>
              </div>
              {/* Avertissement */}
              <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "8px", textAlign: "left", marginBottom: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: "2px", flexShrink: 0 }}></i>
                <span>Cette action est <strong>irréversible</strong>. Toutes les données associées seront définitivement supprimées.</span>
              </div>
              {/* Erreur suppression liée */}
              {errSuppr && (
                <div style={{ background: "#fff5f5", border: "1.5px solid #ef4444", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "8px", textAlign: "left", marginTop: "8px" }}>
                  <i className="fa-solid fa-circle-xmark" style={{ marginTop: "2px", flexShrink: 0 }}></i>
                  <span>{errSuppr}</span>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ justifyContent: "center", gap: "12px" }}>
              <button className="btn btn-cancel" style={{ flex: 1 }} onClick={() => setModalSuppr(null)}>
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              <button
                style={{ flex: 1, background: errSuppr ? "#fca5a5" : "#ef4444", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: "600", cursor: (submitLoading || errSuppr) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}
                onClick={handleSupprimer}
                disabled={submitLoading || !!errSuppr}
              >
                {submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-trash"></i> Confirmer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Categories;