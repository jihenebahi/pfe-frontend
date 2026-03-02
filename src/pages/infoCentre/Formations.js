// src/pages/infoCentre/Formations.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { 
  getFormations, 
  ajouterFormation, 
  modifierFormation, 
  supprimerFormation 
} from "../../services/infoCentre/formationService";
import { getCategories } from "../../services/infoCentre/categorieService";
import "../../styles/infoCentre/formations.css";

const NIVEAU_CLASS = { 
  "Débutant": "bdg-deb", 
  "Intermédiaire": "bdg-int", 
  "Avancé": "bdg-adv" 
};

const NIVEAU_MAPPING = {
  "Débutant": "debutant",
  "Intermédiaire": "intermediaire",
  "Avancé": "avance"
};

const FORMAT_MAPPING = {
  "Présentiel": "presentiel",
  "En ligne": "en_ligne",
  "Hybride": "hybride"
};

const EMPTY_FORM = {
  intitule: "",
  categorie: "",
  description: "",
  objectifs_pedagogiques: "",
  prerequis: "",
  niveau: "",
  duree: "",
  format: "",
  date_debut: "",
  date_fin: "",
  prix_ht: "",
  prix_ttc: "",
  est_active: true,
};

function Formations() {
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalDetail, setModalDetail] = useState(null);
  const [modalModif, setModalModif] = useState(null);
  const [modalAjout, setModalAjout] = useState(false);
  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);

  const navigate = useNavigate();
  const itemsPerPage = 7;

  // Charger les formations et catégories au montage
  useEffect(() => {
    fetchFormations();
    fetchCategories();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const response = await getFormations();
      setFormations(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des formations:", err);
      setError("Impossible de charger les formations");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
    }
  };

  // Formater les données pour l'affichage
  // Modifier la fonction formatFormationPourAffichage
const formatFormationPourAffichage = (f) => {
  const dureeEnJours = Math.ceil(f.duree / 8); // Approximation 8h = 1 jour
  return {
    ...f,
    num: f.id.toString().padStart(2, '0'),
    duree: `${f.duree}h / ${dureeEnJours}j`,
    prixTTC: `${f.prix_ttc} DT`,
    prixHT: `${f.prix_ht} DT`,
    categorie: f.categorie_nom || "Non catégorisé",
    categorie_id: f.categorie, // ✅ Conserver l'ID de la catégorie
    niveau: Object.keys(NIVEAU_MAPPING).find(key => NIVEAU_MAPPING[key] === f.niveau) || f.niveau,
    format: Object.keys(FORMAT_MAPPING).find(key => FORMAT_MAPPING[key] === f.format) || f.format,
    date_debut: f.date_debut, // Garder le format original pour la modification
    date_fin: f.date_fin,
    dateDebut: new Date(f.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    dateFin: new Date(f.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

  // ---- Filtrage ----
  const filtered = formations
    .map(formatFormationPourAffichage)
    .filter((f) => {
      const q = search.toLowerCase();
      return (
        (f.intitule?.toLowerCase().includes(q) || f.categorie?.toLowerCase().includes(q)) &&
        (filterNiveau === "" || f.niveau === filterNiveau) &&
        (filterCat === "" || f.categorie === filterCat)
      );
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Ajouter une formation
  const handleAjout = async () => {
    try {
      // Validation de base
      if (!formAjout.intitule || !formAjout.categorie || !formAjout.niveau || !formAjout.format || !formAjout.prix_ttc || !formAjout.prix_ht) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const formationData = {
        ...formAjout,
        niveau: NIVEAU_MAPPING[formAjout.niveau] || formAjout.niveau,
        format: FORMAT_MAPPING[formAjout.format] || formAjout.format,
        duree: parseInt(formAjout.duree) || 0,
      };

      await ajouterFormation(formationData);
      await fetchFormations(); // Recharger la liste
      setModalAjout(false);
      setFormAjout(EMPTY_FORM);
      alert("Formation ajoutée avec succès !");
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      alert("Erreur lors de l'ajout de la formation");
    }
  };

  // Modifier une formation
  const handleModif = async () => {
    try {
      if (!modalModif?.id) return;

      const formationData = {
        ...formModif,
        niveau: NIVEAU_MAPPING[formModif.niveau] || formModif.niveau,
        format: FORMAT_MAPPING[formModif.format] || formModif.format,
        duree: parseInt(formModif.duree) || 0,
      };

      await modifierFormation(modalModif.id, formationData);
      await fetchFormations();
      setModalModif(null);
      setFormModif(EMPTY_FORM);
      alert("Formation modifiée avec succès !");
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      alert("Erreur lors de la modification de la formation");
    }
  };

  // Supprimer une formation
  const handleSupprimer = async (id, intitule) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la formation "${intitule}" ?`)) {
      try {
        await supprimerFormation(id);
        await fetchFormations();
        alert("Formation supprimée avec succès !");
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Erreur lors de la suppression de la formation");
      }
    }
  };

 // Remplacer la fonction openModif existante par celle-ci
const openModif = (f) => {
  // Récupérer l'ID de la catégorie à partir de la liste des catégories
  const categorieId = categories.find(cat => cat.nom === f.categorie)?.id || f.categorie_id || '';
  
  setFormModif({
    intitule: f.intitule,
    categorie: categorieId, // Utiliser l'ID de la catégorie, pas le nom
    description: f.description || "",
    objectifs_pedagogiques: f.objectifs_pedagogiques || "",
    prerequis: f.prerequis || "",
    duree: f.duree?.split('h')[0]?.trim() || "",
    niveau: f.niveau,
    format: f.format,
    date_debut: f.date_debut?.split('T')[0] || "", // Format YYYY-MM-DD pour l'input date
    date_fin: f.date_fin?.split('T')[0] || "",
    prix_ht: f.prix_ht || "",
    prix_ttc: f.prix_ttc || "",
    est_active: f.est_active !== undefined ? f.est_active : true,
  });
  setModalModif(f);
};

  const handleOverlay = (e, closeFn) => {
    if (e.target === e.currentTarget) closeFn();
  };

  if (loading && formations.length === 0) {
    return (
      <Layout>
        <div className="loading-container">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Chargement des formations...</p>
        </div>
      </Layout>
    );
  }

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
            {categories.map(cat => (
              <option key={cat.id} value={cat.nom}>{cat.nom}</option>
            ))}
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
                  <td className="td-title">{f.intitule}</td>
                  <td><span className="cat-tag">{f.categorie}</span></td>
                  <td><span className={`badge ${NIVEAU_CLASS[f.niveau]}`}>{f.niveau}</span></td>
                  <td className="td-pre">{f.prerequis || "-"}</td>
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
                    <button className="act-btn act-suppr" title="Supprimer" onClick={() => handleSupprimer(f.id, f.intitule)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
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
                  <h2>{modalDetail.intitule}</h2>
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
                    {modalDetail.objectifs_pedagogiques?.split('\n').filter(o => o.trim()).map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-circle-exclamation"></i> Prérequis</div>
                  <p className="detail-sec-text">{modalDetail.prerequis || "Aucun prérequis spécifique"}</p>
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
                  <input 
                    type="text" 
                    placeholder="Ex : Développement Web Full Stack"
                    value={formAjout.intitule} 
                    onChange={(e) => setFormAjout({...formAjout, intitule: e.target.value})} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <select 
                    value={formAjout.categorie} 
                    onChange={(e) => setFormAjout({...formAjout, categorie: e.target.value})}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Niveau <span className="req">*</span></label>
                  <select 
                    value={formAjout.niveau} 
                    onChange={(e) => setFormAjout({...formAjout, niveau: e.target.value})}
                  >
                    <option value="">Sélectionner le niveau</option>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                  </select>
                </div>

                <div className="form-group full">
                  <label>Description détaillée</label>
                  <textarea 
                    rows="3" 
                    placeholder="Décrivez le contenu et le déroulement de la formation…"
                    value={formAjout.description} 
                    onChange={(e) => setFormAjout({...formAjout, description: e.target.value})}
                  />
                </div>

                <div className="form-group full">
                  <label>Objectifs pédagogiques <span className="req">*</span></label>
                  <textarea 
                    rows="3" 
                    placeholder="Listez les compétences acquises (une par ligne)…"
                    value={formAjout.objectifs_pedagogiques} 
                    onChange={(e) => setFormAjout({...formAjout, objectifs_pedagogiques: e.target.value})}
                  />
                </div>

                <div className="form-group full">
                  <label>Prérequis</label>
                  <input 
                    type="text" 
                    placeholder="Ex : Notions de base en informatique…"
                    value={formAjout.prerequis} 
                    onChange={(e) => setFormAjout({...formAjout, prerequis: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Durée (Heures) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="Ex : 40"
                    value={formAjout.duree} 
                    onChange={(e) => setFormAjout({...formAjout, duree: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Format <span className="req">*</span></label>
                  <select 
                    value={formAjout.format} 
                    onChange={(e) => setFormAjout({...formAjout, format: e.target.value})}
                  >
                    <option value="">Sélectionner le format</option>
                    <option>Présentiel</option>
                    <option>En ligne</option>
                    <option>Hybride</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date de début <span className="req">*</span></label>
                  <input 
                    type="date" 
                    value={formAjout.date_debut} 
                    onChange={(e) => setFormAjout({...formAjout, date_debut: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Date de fin <span className="req">*</span></label>
                  <input 
                    type="date" 
                    value={formAjout.date_fin} 
                    onChange={(e) => setFormAjout({...formAjout, date_fin: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="Ex : 1000"
                    value={formAjout.prix_ht} 
                    onChange={(e) => setFormAjout({...formAjout, prix_ht: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="Ex : 1200"
                    value={formAjout.prix_ttc} 
                    onChange={(e) => setFormAjout({...formAjout, prix_ttc: e.target.value})}
                  />
                </div>

                <div className="form-group full">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formAjout.est_active} 
                      onChange={(e) => setFormAjout({...formAjout, est_active: e.target.checked})}
                    /> Formation active
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)}>Annuler</button>
              <button className="btn btn-save" onClick={handleAjout}>
                <i className="fa-solid fa-floppy-disk"></i> Enregistrer
              </button>
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
                  <input 
                    type="text" 
                    value={formModif.intitule} 
                    onChange={(e) => setFormModif({...formModif, intitule: e.target.value})} 
                  />
                </div>

                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <select 
                    value={formModif.categorie} 
                    onChange={(e) => setFormModif({...formModif, categorie: e.target.value})}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Niveau <span className="req">*</span></label>
                  <select 
                    value={formModif.niveau} 
                    onChange={(e) => setFormModif({...formModif, niveau: e.target.value})}
                  >
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                  </select>
                </div>

                <div className="form-group full">
                  <label>Description détaillée</label>
                  <textarea 
                    rows="3" 
                    value={formModif.description} 
                    onChange={(e) => setFormModif({...formModif, description: e.target.value})}
                  />
                </div>

                <div className="form-group full">
                  <label>Objectifs pédagogiques <span className="req">*</span></label>
                  <textarea 
                    rows="3" 
                    value={formModif.objectifs_pedagogiques} 
                    onChange={(e) => setFormModif({...formModif, objectifs_pedagogiques: e.target.value})}
                  />
                </div>

                <div className="form-group full">
                  <label>Prérequis</label>
                  <input 
                    type="text" 
                    value={formModif.prerequis} 
                    onChange={(e) => setFormModif({...formModif, prerequis: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Durée (Heures)</label>
                  <input 
                    type="number" 
                    value={formModif.duree} 
                    onChange={(e) => setFormModif({...formModif, duree: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Format <span className="req">*</span></label>
                  <select 
                    value={formModif.format} 
                    onChange={(e) => setFormModif({...formModif, format: e.target.value})}
                  >
                    <option>Présentiel</option>
                    <option>En ligne</option>
                    <option>Hybride</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date de début</label>
                  <input 
                    type="date" 
                    value={formModif.date_debut} 
                    onChange={(e) => setFormModif({...formModif, date_debut: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Date de fin</label>
                  <input 
                    type="date" 
                    value={formModif.date_fin} 
                    onChange={(e) => setFormModif({...formModif, date_fin: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formModif.prix_ht} 
                    onChange={(e) => setFormModif({...formModif, prix_ht: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formModif.prix_ttc} 
                    onChange={(e) => setFormModif({...formModif, prix_ttc: e.target.value})}
                  />
                </div>

                <div className="form-group full">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formModif.est_active} 
                      onChange={(e) => setFormModif({...formModif, est_active: e.target.checked})}
                    /> Formation active
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)}>Annuler</button>
              <button className="btn btn-update" onClick={handleModif}>
                <i className="fa-solid fa-rotate"></i> Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Formations;