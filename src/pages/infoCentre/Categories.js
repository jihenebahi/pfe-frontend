// src/pages/infoCentre/Categories.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getCategories, ajouterCategorie } from "../../services/infoCentre/categorieService";
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

function Categories() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [modalDetail, setModalDetail] = useState(null);
  const [modalModif, setModalModif] = useState(null);
  const [modalAjout, setModalAjout] = useState(false);

  // Formulaires
  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);

  // Erreurs champ par champ
  const [erreursAjout, setErreursAjout] = useState({});
  const [erreurServeur, setErreurServeur] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // ---- Charger les catégories depuis l'API ----
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setData(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories :", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Filtrage ----
  const filtered = data.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ---- Formater la date ----
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
  };

  // ---- Numérotation ----
  const getNum = (index) => String(index + 1).padStart(2, "0");

  // ---- Validation formulaire ----
  const validerFormulaire = (form) => {
    const erreurs = {};
    if (!form.nom.trim()) {
      erreurs.nom = "Le nom de la catégorie est obligatoire.";
    }
    if (!form.description.trim()) {
      erreurs.description = "La description est obligatoire.";
    }
    return erreurs;
  };

  // ---- Ajouter une catégorie ----
  const handleAjouter = async () => {
    const erreurs = validerFormulaire(formAjout);
    if (Object.keys(erreurs).length > 0) {
      setErreursAjout(erreurs);
      return;
    }

    try {
      setSubmitLoading(true);
      setErreursAjout({});
      setErreurServeur("");
      await ajouterCategorie({
        nom: formAjout.nom.trim(),
        description: formAjout.description.trim(),
        actif: formAjout.actif,
      });
      setModalAjout(false);
      setFormAjout(EMPTY_FORM);
      await fetchCategories();
    } catch (err) {
      if (err.response?.data?.nom) {
        setErreursAjout({ nom: "Une catégorie avec ce nom existe déjà." });
      } else {
        setErreurServeur("Erreur serveur. Veuillez réessayer.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ---- Ouvrir modale modifier ----
  const openModif = (cat) => {
    setFormModif({ nom: cat.nom, description: cat.description || "", actif: cat.actif });
    setModalModif(cat);
  };

  // ---- Fermer overlay en cliquant dehors ----
  const handleOverlay = (e, closeFn) => {
    if (e.target === e.currentTarget) closeFn();
  };

  // ---- Styles inline pour les erreurs ----
  const styleErreur = {
    border: "1.5px solid #ef4444",
    borderRadius: "8px",
    padding: "10px 14px",
    backgroundColor: "#fff5f5",
    color: "#dc2626",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  };

  const styleInputErreur = {
    border: "1.5px solid #ef4444",
    outline: "none",
  };

  return (
    <Layout>
      {/* ── En-tête ── */}
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-tags"></i> Gestion des Catégories
        </h1>
        <p className="page-sub">Gérez les catégories associées aux formations du centre</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Rechercher une catégorie…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-back" onClick={() => navigate("/formations")}>
            <i className="fa-solid fa-arrow-left"></i> Formations
          </button>
          <button
            className="btn btn-add"
            onClick={() => {
              setFormAjout(EMPTY_FORM);
              setErreursAjout({});
              setErreurServeur("");
              setModalAjout(true);
            }}
          >
            <i className="fa-solid fa-plus"></i> Nouvelle Catégorie
          </button>
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="table-card">
        <div className="table-top">
          Affichage de <strong>{paginated.length}</strong> catégories sur{" "}
          <strong>{filtered.length}</strong>
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
                  <th>Date de création</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94A3B8" }}>
                      Aucune catégorie trouvée.
                    </td>
                  </tr>
                ) : (
                  paginated.map((cat, index) => (
                    <tr key={cat.id}>
                      <td className="td-num">{getNum((currentPage - 1) * ITEMS_PER_PAGE + index)}</td>
                      <td className="td-name">
                        <div className="cat-name-cell">
                          <div
                            className="cat-dot"
                            style={{ background: CAT_COLORS[cat.nom] || "#94A3B8" }}
                          ></div>
                          {cat.nom}
                        </div>
                      </td>
                      <td className="td-date">{formatDate(cat.date_creation)}</td>
                      <td>
                        <div className="toggle-wrap">
                          <label className="toggle">
                            <input
                              type="checkbox"
                              checked={cat.actif}
                              readOnly
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
                        <button className="act-btn act-suppr" title="Supprimer">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pg-btn"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pg-num${p === currentPage ? " active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="pg-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* ══════════════ MODALE DÉTAIL ══════════════ */}
      {modalDetail && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalDetail(null))}>
          <div className="modal">
            <div className="modal-header detail-header">
              <div className="detail-header-left">
                <div className="detail-icon-wrap">
                  <i className="fa-solid fa-tags"></i>
                </div>
                <div className="detail-header-info">
                  <h2>{modalDetail.nom}</h2>
                  <p className="detail-sub">Créée le {formatDate(modalDetail.date_creation)}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalDetail(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
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
                    <span className="dsr-val">— formations</span>
                    <span className="dsr-lbl">Formations liées</span>
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
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-align-left"></i> Description
                  </div>
                  <p className="detail-sec-text">{modalDetail.description || "Aucune description."}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalDetail(null)}>Fermer</button>
              <button className="btn btn-update" onClick={() => { setModalDetail(null); openModif(modalDetail); }}>
                <i className="fa-solid fa-pen"></i> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODALE AJOUTER ══════════════ */}
      {modalAjout && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalAjout(false))}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="fa-solid fa-plus-circle"></i> Ajouter une Catégorie</h2>
              <button className="modal-close" onClick={() => setModalAjout(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">

              {/* ── Erreur serveur globale ── */}
              {erreurServeur && (
                <div style={styleErreur}>
                  <i className="fa-solid fa-circle-xmark"></i>
                  {erreurServeur}
                </div>
              )}

              <div className="form-grid">

                {/* ── Champ Nom ── */}
                <div className="form-group full">
                  <label>Nom de la catégorie <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex : Intelligence Artificielle"
                    value={formAjout.nom}
                    style={erreursAjout.nom ? styleInputErreur : {}}
                    onChange={(e) => {
                      setFormAjout({ ...formAjout, nom: e.target.value });
                      if (erreursAjout.nom) setErreursAjout({ ...erreursAjout, nom: "" });
                    }}
                  />
                  {erreursAjout.nom && (
                    <div style={styleErreur}>
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      {erreursAjout.nom}
                    </div>
                  )}
                </div>

                {/* ── Champ Description ── */}
                <div className="form-group full">
                  <label>Description <span className="req">*</span></label>
                  <textarea
                    rows="5"
                    placeholder="Décrivez cette catégorie, son public cible et ses objectifs généraux…"
                    value={formAjout.description}
                    style={erreursAjout.description ? styleInputErreur : {}}
                    onChange={(e) => {
                      setFormAjout({ ...formAjout, description: e.target.value });
                      if (erreursAjout.description) setErreursAjout({ ...erreursAjout, description: "" });
                    }}
                  />
                  {erreursAjout.description && (
                    <div style={styleErreur}>
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      {erreursAjout.description}
                    </div>
                  )}
                </div>

                {/* ── Toggle Statut ── */}
                <div className="form-group full">
                  <div className="form-toggle-row">
                    <label>Statut</label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={formAjout.actif}
                        onChange={(e) => setFormAjout({ ...formAjout, actif: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-lbl ${formAjout.actif ? "on" : "off"}`}>
                      {formAjout.actif ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)}>Annuler</button>
              <button className="btn btn-save" onClick={handleAjouter} disabled={submitLoading}>
                {submitLoading
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</>
                  : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODALE MODIFIER ══════════════ */}
      {modalModif && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalModif(null))}>
          <div className="modal">
            <div className="modal-header modif-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier la Catégorie</h2>
              <button className="modal-close" onClick={() => setModalModif(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nom de la catégorie <span className="req">*</span></label>
                  <input
                    type="text"
                    value={formModif.nom}
                    onChange={(e) => setFormModif({ ...formModif, nom: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea
                    rows="5"
                    value={formModif.description}
                    onChange={(e) => setFormModif({ ...formModif, description: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <div className="form-toggle-row">
                    <label>Statut</label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={formModif.actif}
                        onChange={(e) => setFormModif({ ...formModif, actif: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-lbl ${formModif.actif ? "on" : "off"}`}>
                      {formModif.actif ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)}>Annuler</button>
              <button className="btn btn-update"><i className="fa-solid fa-rotate"></i> Mettre à jour</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Categories;