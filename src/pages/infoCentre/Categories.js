// src/pages/infoCentre/Categories.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
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

const INITIAL_DATA = [
  {
    id: 1,
    num: "01",
    nom: "Marketing digital",
    description:
      "Ensemble des techniques de promotion et de communication utilisant les canaux numériques : SEO, SEA, réseaux sociaux, email marketing et analytics.",
    dateCreation: "12/01/2024",
    actif: true,
  },
  {
    id: 2,
    num: "02",
    nom: "Informatique",
    description:
      "Formations couvrant la programmation, les architectures logicielles, les bases de données, les réseaux et l'administration des systèmes d'information.",
    dateCreation: "15/01/2024",
    actif: true,
  },
  {
    id: 3,
    num: "03",
    nom: "IA",
    description:
      "Parcours autour du machine learning, du deep learning, du traitement du langage naturel et des applications concrètes de l'IA dans les entreprises.",
    dateCreation: "20/01/2024",
    actif: true,
  },
  {
    id: 4,
    num: "04",
    nom: "Design",
    description:
      "Formations en design graphique, UI/UX, motion design, identité visuelle et outils de création (Figma, Adobe Suite) pour concevoir des interfaces attractives.",
    dateCreation: "22/01/2024",
    actif: true,
  },
  {
    id: 5,
    num: "05",
    nom: "Langues",
    description:
      "Programmes de langues orientés milieu professionnel : anglais, français, espagnol et arabe des affaires, avec certification internationale reconnue.",
    dateCreation: "25/01/2024",
    actif: true,
  },
  {
    id: 6,
    num: "06",
    nom: "Data",
    description:
      "Formations en data analyse, data engineering, business intelligence, visualisation de données et modélisation statistique pour la prise de décision.",
    dateCreation: "28/01/2024",
    actif: false,
  },
  {
    id: 7,
    num: "07",
    nom: "Soft skills",
    description:
      "Développement des compétences non techniques : leadership, communication, gestion du stress, travail en équipe, résolution de conflits et intelligence émotionnelle.",
    dateCreation: "01/02/2024",
    actif: true,
  },
];

const EMPTY_FORM = { nom: "", description: "", actif: true };
const ITEMS_PER_PAGE = 7;

function Categories() {
  const navigate = useNavigate();
  const [data, setData] = useState(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [modalDetail, setModalDetail] = useState(null);
  const [modalModif, setModalModif] = useState(null);
  const [modalAjout, setModalAjout] = useState(false);

  // Formulaires
  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);

  // ---- Filtrage ----
  const filtered = data.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ---- Toggle actif/inactif depuis tableau ----
  const toggleActif = (id) => {
    setData((prev) =>
      prev.map((c) => (c.id === id ? { ...c, actif: !c.actif } : c))
    );
  };

  // ---- Ouvrir modale modifier ----
  const openModif = (cat) => {
    setFormModif({ nom: cat.nom, description: cat.description, actif: cat.actif });
    setModalModif(cat);
  };

  // ---- Fermer overlay en cliquant dehors ----
  const handleOverlay = (e, closeFn) => {
    if (e.target === e.currentTarget) closeFn();
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
              {paginated.map((cat) => (
                <tr key={cat.id}>
                  <td className="td-num">{cat.num}</td>
                  <td className="td-name">
                    <div className="cat-name-cell">
                      <div
                        className="cat-dot"
                        style={{ background: CAT_COLORS[cat.nom] || "#94A3B8" }}
                      ></div>
                      {cat.nom}
                    </div>
                  </td>
                  <td className="td-date">{cat.dateCreation}</td>
                  <td>
                    <div className="toggle-wrap">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={cat.actif}
                          onChange={() => toggleActif(cat.id)}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>

      {/* ══════════════ MODALES RESTANTES (inchangées) ══════════════ */}
      {/* ...le code des modales Detail, Ajout et Modifier reste identique */}
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
                  <p className="detail-sub">Créée le {modalDetail.dateCreation}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalDetail(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* 4 cartes stat */}
              <div className="detail-stat-row">
                <div className="dsr-card">
                  <div className="dsr-icon"><i className="fa-solid fa-hashtag"></i></div>
                  <div className="dsr-info">
                    <span className="dsr-val">{modalDetail.num}</span>
                    <span className="dsr-lbl">ID catégorie</span>
                  </div>
                </div>
                <div className="dsr-card">
                  <div className="dsr-icon"><i className="fa-solid fa-book-open"></i></div>
                  <div className="dsr-info">
                    <span className="dsr-val">5 formations</span>
                    <span className="dsr-lbl">Formations liées</span>
                  </div>
                </div>
                <div className="dsr-card">
                  <div className="dsr-icon"><i className="fa-regular fa-calendar"></i></div>
                  <div className="dsr-info">
                    <span className="dsr-val">{modalDetail.dateCreation}</span>
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

              {/* Section description */}
              <div className="detail-sections">
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-align-left"></i> Description
                  </div>
                  <p className="detail-sec-text">{modalDetail.description}</p>
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
              <div className="form-grid">

                <div className="form-group full">
                  <label>Nom de la catégorie <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex : Intelligence Artificielle"
                    value={formAjout.nom}
                    onChange={(e) => setFormAjout({ ...formAjout, nom: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>Description <span className="req">*</span></label>
                  <textarea
                    rows="5"
                    placeholder="Décrivez cette catégorie, son public cible et ses objectifs généraux…"
                    value={formAjout.description}
                    onChange={(e) => setFormAjout({ ...formAjout, description: e.target.value })}
                  />
                </div>

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
              <button className="btn btn-save"><i className="fa-solid fa-floppy-disk"></i> Enregistrer</button>
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
                  <label>Description <span className="req">*</span></label>
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