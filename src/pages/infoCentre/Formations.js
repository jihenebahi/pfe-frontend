// src/pages/infoCentre/Formations.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/infoCentre/formations.css";

const FORMATIONS_DATA = [
  {
    id: 1, num: "01",
    titre: "Développement Web Full Stack",
    categorie: "Informatique", niveau: "Intermédiaire",
    prerequis: "Bases informatique", duree: "120h / 15j",
    prixTTC: "2 400 DT", prixHT: "2 000 DT", format: "Présentiel",
    dateDebut: "01 Mars 2025", dateFin: "30 Mai 2025",
    description: "Formation complète couvrant le développement front-end et back-end avec les technologies les plus demandées du marché.",
    objectifs: [
      "Maîtriser HTML5, CSS3 et JavaScript ES6+",
      "Développer des interfaces dynamiques avec React.js",
      "Construire des API REST avec Node.js et Express",
      "Gérer des bases de données relationnelles (MySQL/PostgreSQL)",
      "Déployer des applications sur des serveurs cloud",
    ],
  },
  {
    id: 2, num: "02",
    titre: "Management de Projet Agile",
    categorie: "Soft skills", niveau: "Avancé",
    prerequis: "Expérience gestion projet", duree: "40h / 5j",
    prixTTC: "1 800 DT", prixHT: "1 500 DT", format: "Présentiel",
    dateDebut: "10 Avril 2025", dateFin: "15 Avril 2025",
    description: "Formation sur les méthodes agiles (Scrum, Kanban) pour la gestion de projets complexes.",
    objectifs: ["Comprendre le manifeste Agile", "Maîtriser Scrum et Kanban", "Animer des rétrospectives", "Utiliser des outils de suivi de projet"],
  },
  {
    id: 3, num: "03",
    titre: "Anglais des Affaires",
    categorie: "Langues", niveau: "Débutant",
    prerequis: "Niveau A2 minimum", duree: "80h / 10j",
    prixTTC: "960 DT", prixHT: "800 DT", format: "Hybride",
    dateDebut: "01 Février 2025", dateFin: "15 Mars 2025",
    description: "Formation axée sur la communication professionnelle en anglais dans un contexte business.",
    objectifs: ["Rédiger des emails professionnels", "Conduire des réunions en anglais", "Maîtriser le vocabulaire du commerce international"],
  },
  {
    id: 4, num: "04",
    titre: "Python pour Data Science",
    categorie: "Data", niveau: "Intermédiaire",
    prerequis: "Notions de programmation", duree: "96h / 12j",
    prixTTC: "2 160 DT", prixHT: "1 800 DT", format: "Présentiel",
    dateDebut: "01 Juin 2025", dateFin: "30 Juin 2025",
    description: "Maîtrisez Python et les bibliothèques essentielles pour l'analyse et la visualisation de données.",
    objectifs: ["Maîtriser Python", "Utiliser NumPy et Pandas", "Visualiser avec Matplotlib", "Introduire le Machine Learning"],
  },
  {
    id: 5, num: "05",
    titre: "Intelligence Artificielle Appliquée",
    categorie: "IA", niveau: "Avancé",
    prerequis: "Python, Maths Bac+2", duree: "80h / 10j",
    prixTTC: "3 000 DT", prixHT: "2 500 DT", format: "Présentiel",
    dateDebut: "01 Juillet 2025", dateFin: "15 Juillet 2025",
    description: "Formation intensive sur les algorithmes d'intelligence artificielle et leur application dans des cas réels.",
    objectifs: ["Comprendre le Deep Learning", "Utiliser TensorFlow et Keras", "Déployer des modèles ML en production"],
  },
  {
    id: 6, num: "06",
    titre: "UI/UX Design & Figma",
    categorie: "Design", niveau: "Débutant",
    prerequis: "Aucun", duree: "64h / 8j",
    prixTTC: "1 440 DT", prixHT: "1 200 DT", format: "En ligne",
    dateDebut: "01 Mai 2025", dateFin: "20 Mai 2025",
    description: "Apprenez à concevoir des interfaces utilisateur modernes et ergonomiques avec Figma.",
    objectifs: ["Maîtriser Figma", "Appliquer les principes UX", "Créer des prototypes interactifs", "Conduire des tests utilisateurs"],
  },
  {
    id: 7, num: "07",
    titre: "Marketing Digital & Réseaux Sociaux",
    categorie: "Marketing digital", niveau: "Débutant",
    prerequis: "Aucun", duree: "48h / 6j",
    prixTTC: "1 200 DT", prixHT: "1 000 DT", format: "Hybride",
    dateDebut: "15 Mars 2025", dateFin: "30 Mars 2025",
    description: "Développez une stratégie marketing digitale efficace et gérez les réseaux sociaux professionnellement.",
    objectifs: ["Créer une stratégie digitale", "Gérer les réseaux sociaux", "Analyser les KPIs", "Maîtriser le SEO/SEA"],
  },
];

const NIVEAU_CLASS = { Débutant: "bdg-deb", Intermédiaire: "bdg-int", Avancé: "bdg-adv" };

const EMPTY_FORM = {
  titre: "", categorie: "", niveau: "", description: "",
  objectifs: "", prerequis: "", dureeH: "", dureeJ: "",
  format: "", dateDebut: "", dateFin: "", prixTTC: "", prixHT: "",
};

function Formations() {
  const [search, setSearch]               = useState("");
  const [filterNiveau, setFilterNiveau]   = useState("");
  const [filterCat, setFilterCat]         = useState("");
  const [currentPage, setCurrentPage]     = useState(1);

  const [modalDetail, setModalDetail]     = useState(null);
  const [modalModif, setModalModif]       = useState(null);
  const [modalAjout, setModalAjout]       = useState(false);
  const [formAjout, setFormAjout]         = useState(EMPTY_FORM);
  const [formModif, setFormModif]         = useState(EMPTY_FORM);

  const navigate = useNavigate();
  const itemsPerPage = 7;

  // ---- Filtrage ----
  const filtered = FORMATIONS_DATA.filter((f) => {
    const q = search.toLowerCase();
    return (
      (f.titre.toLowerCase().includes(q) || f.categorie.toLowerCase().includes(q)) &&
      (filterNiveau === "" || f.niveau === filterNiveau) &&
      (filterCat === "" || f.categorie === filterCat)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openModif = (f) => {
    setFormModif({
      titre: f.titre, categorie: f.categorie, niveau: f.niveau,
      description: f.description,
      objectifs: Array.isArray(f.objectifs) ? f.objectifs.join("\n") : f.objectifs,
      prerequis: f.prerequis,
      dureeH: f.duree.split("/")[0]?.trim().replace("h", ""),
      dureeJ: f.duree.split("/")[1]?.trim().replace("j", "") || "",
      format: f.format, dateDebut: "", dateFin: "",
      prixTTC: f.prixTTC.replace(" DT", "").replace(" ", ""),
      prixHT:  f.prixHT.replace(" DT", "").replace(" ", ""),
    });
    setModalModif(f);
  };

  const handleOverlay = (e, closeFn) => { if (e.target === e.currentTarget) closeFn(); };

  return (
    <Layout>

      {/* ── En-tête ── */}
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-book-open"></i> Gestion des Formations
        </h1>
        <p className="page-sub">Liste et gestion de toutes les formations du centre</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Rechercher une formation…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select className="filter-sel" value={filterNiveau}
            onChange={(e) => { setFilterNiveau(e.target.value); setCurrentPage(1); }}>
            <option value="">Tous les niveaux</option>
            <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
          </select>
          <select className="filter-sel" value={filterCat}
            onChange={(e) => { setFilterCat(e.target.value); setCurrentPage(1); }}>
            <option value="">Toutes les catégories</option>
            <option>Marketing digital</option><option>Informatique</option>
            <option>IA</option><option>Design</option>
            <option>Langues</option><option>Data</option><option>Soft skills</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-cat" onClick={() => navigate("/categories")}>
            <i className="fa-solid fa-tags"></i> Catégories
          </button>
          <button className="btn btn-add" onClick={() => { setFormAjout(EMPTY_FORM); setModalAjout(true); }}>
            <i className="fa-solid fa-plus"></i> Nouvelle Formation
          </button>
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="table-card">
        <div className="table-top">
          Affichage de <strong>{paginated.length}</strong> formations sur <strong>{filtered.length}</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Intitulé de la formation</th>
                <th>Catégorie</th>
                <th>Niveau</th>
                <th>Prérequis</th>
                <th>Durée</th>
                <th>Prix TTC</th>
                <th>Prix HT</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((f) => (
                <tr key={f.id}>
                  <td className="td-num">{f.num}</td>
                  <td className="td-title">{f.titre}</td>
                  <td><span className="cat-tag">{f.categorie}</span></td>
                  <td><span className={`badge ${NIVEAU_CLASS[f.niveau]}`}>{f.niveau}</span></td>
                  <td className="td-pre">{f.prerequis}</td>
                  <td className="td-dur">{f.duree}</td>
                  <td className="td-ttc">{f.prixTTC}</td>
                  <td className="td-ht">{f.prixHT}</td>
                  <td className="td-actions">
                    <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(f)}>
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(f)}>
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
          <button className="pg-btn" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`pg-num${p === currentPage ? " active" : ""}`} onClick={() => setCurrentPage(p)}>
              {p}
            </button>
          ))}
          <button className="pg-btn" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>


      {/* ══════════════ MODALE DÉTAIL ══════════════ */}
      {modalDetail && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalDetail(null))}>
          <div className="modal modal-wide">
            <div className="modal-header detail-header">
              <div className="detail-header-left">
                <div className="detail-icon-wrap">
                  <i className="fa-solid fa-book-open"></i>
                </div>
                <div className="detail-header-info">
                  <h2>{modalDetail.titre}</h2>
                  <div className="detail-badges">
                    <span className="cat-tag">{modalDetail.categorie}</span>
                    <span className={`badge ${NIVEAU_CLASS[modalDetail.niveau]}`}>{modalDetail.niveau}</span>
                    <span className="fmt-tag"><i className="fa-solid fa-location-dot"></i> {modalDetail.format}</span>
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalDetail(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-stats">
                <div className="stat-card sc-blue">
                  <div className="sc-icon"><i className="fa-solid fa-clock"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.duree.split("/")[0].trim()}</span>
                    <span className="sc-lbl">Durée totale</span>
                  </div>
                </div>
                <div className="stat-card sc-navy">
                  <div className="sc-icon"><i className="fa-solid fa-calendar-days"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.duree.split("/")[1]?.trim()}</span>
                    <span className="sc-lbl">En jours</span>
                  </div>
                </div>
                <div className="stat-card sc-green">
                  <div className="sc-icon"><i className="fa-solid fa-tag"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.prixTTC}</span>
                    <span className="sc-lbl">Prix TTC</span>
                  </div>
                </div>
                <div className="stat-card sc-sand">
                  <div className="sc-icon"><i className="fa-solid fa-receipt"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.prixHT}</span>
                    <span className="sc-lbl">Prix HT</span>
                  </div>
                </div>
              </div>

              <div className="detail-dates">
                <div className="date-block">
                  <i className="fa-regular fa-calendar-check"></i>
                  <div>
                    <span className="date-lbl">Date de début</span>
                    <span className="date-val">{modalDetail.dateDebut}</span>
                  </div>
                </div>
                <div className="date-arrow"><i className="fa-solid fa-arrow-right-long"></i></div>
                <div className="date-block">
                  <i className="fa-regular fa-calendar-xmark"></i>
                  <div>
                    <span className="date-lbl">Date de fin</span>
                    <span className="date-val">{modalDetail.dateFin}</span>
                  </div>
                </div>
              </div>

              <div className="detail-sections">
                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-align-left"></i> Description détaillée</div>
                  <p className="detail-sec-text">{modalDetail.description}</p>
                </div>
                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-bullseye"></i> Objectifs pédagogiques</div>
                  <ul className="detail-list">
                    {modalDetail.objectifs.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-circle-exclamation"></i> Prérequis</div>
                  <p className="detail-sec-text">{modalDetail.prerequis}</p>
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
          <div className="modal modal-wide">
            <div className="modal-header">
              <h2><i className="fa-solid fa-plus-circle"></i> Ajouter une Formation</h2>
              <button className="modal-close" onClick={() => setModalAjout(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Intitulé de la formation <span className="req">*</span></label>
                  <input type="text" placeholder="Ex : Développement Web Full Stack"
                    value={formAjout.titre} onChange={(e) => setFormAjout({...formAjout, titre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <select value={formAjout.categorie} onChange={(e) => setFormAjout({...formAjout, categorie: e.target.value})}>
                    <option value="" disabled>Sélectionner…</option>
                    <option>Marketing digital</option><option>Informatique</option><option>IA</option>
                    <option>Design</option><option>Langues</option><option>Data</option><option>Soft skills</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Niveau <span className="req">*</span></label>
                  <select value={formAjout.niveau} onChange={(e) => setFormAjout({...formAjout, niveau: e.target.value})}>
                    <option value="" disabled>Sélectionner…</option>
                    <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Description détaillée</label>
                  <textarea rows="3" placeholder="Décrivez le contenu et le déroulement de la formation…"
                    value={formAjout.description} onChange={(e) => setFormAjout({...formAjout, description: e.target.value})} />
                </div>
                <div className="form-group full">
                  <label>Objectifs pédagogiques <span className="req">*</span></label>
                  <textarea rows="3" placeholder="Listez les compétences acquises…"
                    value={formAjout.objectifs} onChange={(e) => setFormAjout({...formAjout, objectifs: e.target.value})} />
                </div>
                <div className="form-group full">
                  <label>Prérequis</label>
                  <input type="text" placeholder="Ex : Notions de base en informatique…"
                    value={formAjout.prerequis} onChange={(e) => setFormAjout({...formAjout, prerequis: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Durée (Heures)</label>
                  <input type="number" min="0" placeholder="Ex : 40"
                    value={formAjout.dureeH} onChange={(e) => setFormAjout({...formAjout, dureeH: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Durée (Jours)</label>
                  <input type="number" min="0" placeholder="Ex : 5"
                    value={formAjout.dureeJ} onChange={(e) => setFormAjout({...formAjout, dureeJ: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Format <span className="req">*</span></label>
                  <select value={formAjout.format} onChange={(e) => setFormAjout({...formAjout, format: e.target.value})}>
                    <option value="" disabled>Sélectionner…</option>
                    <option>Présentiel</option><option>En ligne</option><option>Hybride</option>
                  </select>
                </div>
                <div className="form-group"></div>
                <div className="form-group">
                  <label>Date de début</label>
                  <input type="date" value={formAjout.dateDebut} onChange={(e) => setFormAjout({...formAjout, dateDebut: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input type="date" value={formAjout.dateFin} onChange={(e) => setFormAjout({...formAjout, dateFin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input type="number" min="0" placeholder="Ex : 1 200"
                    value={formAjout.prixTTC} onChange={(e) => setFormAjout({...formAjout, prixTTC: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input type="number" min="0" placeholder="Ex : 1 000"
                    value={formAjout.prixHT} onChange={(e) => setFormAjout({...formAjout, prixHT: e.target.value})} />
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
          <div className="modal modal-wide">
            <div className="modal-header modif-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier la Formation</h2>
              <button className="modal-close" onClick={() => setModalModif(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Intitulé de la formation <span className="req">*</span></label>
                  <input type="text" value={formModif.titre} onChange={(e) => setFormModif({...formModif, titre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <select value={formModif.categorie} onChange={(e) => setFormModif({...formModif, categorie: e.target.value})}>
                    <option>Marketing digital</option><option>Informatique</option><option>IA</option>
                    <option>Design</option><option>Langues</option><option>Data</option><option>Soft skills</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Niveau <span className="req">*</span></label>
                  <select value={formModif.niveau} onChange={(e) => setFormModif({...formModif, niveau: e.target.value})}>
                    <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Description détaillée</label>
                  <textarea rows="3" value={formModif.description} onChange={(e) => setFormModif({...formModif, description: e.target.value})} />
                </div>
                <div className="form-group full">
                  <label>Objectifs pédagogiques <span className="req">*</span></label>
                  <textarea rows="3" value={formModif.objectifs} onChange={(e) => setFormModif({...formModif, objectifs: e.target.value})} />
                </div>
                <div className="form-group full">
                  <label>Prérequis</label>
                  <input type="text" value={formModif.prerequis} onChange={(e) => setFormModif({...formModif, prerequis: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Durée (Heures)</label>
                  <input type="number" value={formModif.dureeH} onChange={(e) => setFormModif({...formModif, dureeH: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Durée (Jours)</label>
                  <input type="number" value={formModif.dureeJ} onChange={(e) => setFormModif({...formModif, dureeJ: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Format <span className="req">*</span></label>
                  <select value={formModif.format} onChange={(e) => setFormModif({...formModif, format: e.target.value})}>
                    <option>Présentiel</option><option>En ligne</option><option>Hybride</option>
                  </select>
                </div>
                <div className="form-group"></div>
                <div className="form-group">
                  <label>Date de début</label>
                  <input type="date" value={formModif.dateDebut} onChange={(e) => setFormModif({...formModif, dateDebut: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input type="date" value={formModif.dateFin} onChange={(e) => setFormModif({...formModif, dateFin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input type="number" value={formModif.prixTTC} onChange={(e) => setFormModif({...formModif, prixTTC: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input type="number" value={formModif.prixHT} onChange={(e) => setFormModif({...formModif, prixHT: e.target.value})} />
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

export default Formations;