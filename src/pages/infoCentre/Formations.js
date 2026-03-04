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
import { 
  validateFormationForm, 
  formatErrorMessage, 
  cleanFormData, 
  getFormationStatus,
  ErrMsg,
  SuccesMsg,
  styleInputErreur
} from "../../script/infoCentre/formationValidation";
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
  nb_tranches_paiement: "1",
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
  const [modalSuppr, setModalSuppr] = useState(null); // Nouvel état pour la modale de suppression
  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);

  // États pour les messages d'erreur et de succès
  const [erreursAjout, setErreursAjout] = useState({});
  const [errServeurAjout, setErrServeurAjout] = useState("");
  const [erreursModif, setErreursModif] = useState({});
  const [errServeurModif, setErrServeurModif] = useState("");
  const [errSuppr, setErrSuppr] = useState("");
  const [succesGlobal, setSuccesGlobal] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 7;

  // Afficher un message de succès temporaire
  const afficherSucces = (msg) => {
    setSuccesGlobal(msg);
    setTimeout(() => setSuccesGlobal(""), 4000);
  };

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
  const formatFormationPourAffichage = (f) => {
    const dureeEnJours = Math.ceil(f.duree / 8);
    return {
      ...f,
      num: f.id.toString().padStart(2, '0'),
      duree: `${f.duree}h / ${dureeEnJours}j`,
      prixTTC: `${f.prix_ttc} DT`,
      prixHT: `${f.prix_ht} DT`,
      nb_tranches: f.nb_tranches_paiement || 1,
      categorie: f.categorie_nom || "Non catégorisé",
      categorie_id: f.categorie,
      niveau: Object.keys(NIVEAU_MAPPING).find(key => NIVEAU_MAPPING[key] === f.niveau) || f.niveau,
      format: Object.keys(FORMAT_MAPPING).find(key => FORMAT_MAPPING[key] === f.format) || f.format,
      date_debut: f.date_debut,
      date_fin: f.date_fin,
      dateDebut: new Date(f.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      dateFin: new Date(f.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: getFormationStatus(f)
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



  const handleAjout = async () => {
  // Utiliser la validation complète au lieu de validerFormulaire
  const validation = validateFormationForm(formAjout, 'ajout', { allowPastDates: false });
  
  if (!validation.isValid) {
    // Transformer les erreurs en objet pour l'affichage par champ
    const erreurs = {};
    validation.errors.forEach(err => {
      if (err.includes("intitulé")) erreurs.intitule = err;
      else if (err.includes("catégorie")) erreurs.categorie = err;
      else if (err.includes("niveau")) erreurs.niveau = err;
      else if (err.includes("format")) erreurs.format = err;
      else if (err.includes("objectifs")) erreurs.objectifs_pedagogiques = err;
      else if (err.includes("durée")) erreurs.duree = err;
      else if (err.includes("début")) erreurs.date_debut = err;
      else if (err.includes("fin")) erreurs.date_fin = err;
      else if (err.includes("HT")) erreurs.prix_ht = err;
      else if (err.includes("TTC")) erreurs.prix_ttc = err;
      else if (err.includes("tranches")) erreurs.nb_tranches_paiement = err;
      else {
        // Erreur générale
        setErrServeurAjout(err);
      }
    });
    if (validation.coherenceError) {
      erreurs.duree_coherence = validation.coherenceError;
    }
    
    if (Object.keys(erreurs).length > 0) {
      setErreursAjout(erreurs);
    }
    return;
  }

  try {
    setSubmitLoading(true);
    setErreursAjout({});
    setErrServeurAjout("");

    const formationData = {
      ...formAjout,
      niveau: NIVEAU_MAPPING[formAjout.niveau] || formAjout.niveau,
      format: FORMAT_MAPPING[formAjout.format] || formAjout.format,
    };

    const cleanedData = cleanFormData(formationData);
    await ajouterFormation(cleanedData);
    await fetchFormations();
    setModalAjout(false);
    setFormAjout(EMPTY_FORM);
    afficherSucces("Formation ajoutée avec succès !");
  } catch (err) {
    console.error("Erreur lors de l'ajout:", err);
    if (err.response?.data) {
      const messages = Object.values(err.response.data).flat();
      setErrServeurAjout(messages.join('\n'));
    } else {
      setErrServeurAjout("Erreur lors de l'ajout de la formation");
    }
  } finally {
    setSubmitLoading(false);
  }
};
// Modifier une formation
const handleModif = async () => {
  if (!modalModif?.id) return;

  // Utiliser la validation complète
  const validation = validateFormationForm(formModif, 'modif', { allowPastDates: false });
  
  if (!validation.isValid) {
    // Transformer les erreurs en objet pour l'affichage par champ
    const erreurs = {};
    validation.errors.forEach(err => {
      if (err.includes("intitulé")) erreurs.intitule = err;
      else if (err.includes("catégorie")) erreurs.categorie = err;
      else if (err.includes("niveau")) erreurs.niveau = err;
      else if (err.includes("format")) erreurs.format = err;
      else if (err.includes("objectifs")) erreurs.objectifs_pedagogiques = err;
      else if (err.includes("durée")) erreurs.duree = err;
      else if (err.includes("début")) erreurs.date_debut = err;
      else if (err.includes("fin")) erreurs.date_fin = err;
      else if (err.includes("HT")) erreurs.prix_ht = err;
      else if (err.includes("TTC")) erreurs.prix_ttc = err;
      else if (err.includes("tranches")) erreurs.nb_tranches_paiement = err;
      else {
        setErrServeurModif(err);
      }
    });
    if (validation.coherenceError) {
      erreurs.duree_coherence = validation.coherenceError;
    }
    
    if (Object.keys(erreurs).length > 0) {
      setErreursModif(erreurs);
    }
    return;
  }

  try {
    setSubmitLoading(true);
    setErreursModif({});
    setErrServeurModif("");

    const formationData = {
      ...formModif,
      niveau: NIVEAU_MAPPING[formModif.niveau] || formModif.niveau,
      format: FORMAT_MAPPING[formModif.format] || formModif.format,
    };

    const cleanedData = cleanFormData(formationData);
    await modifierFormation(modalModif.id, cleanedData);
    await fetchFormations();
    setModalModif(null);
    setFormModif(EMPTY_FORM);
    afficherSucces("Formation modifiée avec succès !");
  } catch (err) {
    console.error("Erreur lors de la modification:", err);
    if (err.response?.data) {
      const messages = Object.values(err.response.data).flat();
      setErrServeurModif(messages.join('\n'));
    } else {
      setErrServeurModif("Erreur lors de la modification de la formation");
    }
  } finally {
    setSubmitLoading(false);
  }
};
  // Ouvrir la modale de suppression
  const openSuppr = (formation) => {
    setErrSuppr("");
    setModalSuppr(formation);
  };

  // Supprimer une formation
  const handleSupprimer = async () => {
    if (!modalSuppr) return;
    
    try {
      setSubmitLoading(true);
      setErrSuppr("");
      await supprimerFormation(modalSuppr.id);
      await fetchFormations();
      setModalSuppr(null);
      afficherSucces("Formation supprimée avec succès !");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setErrSuppr("Erreur lors de la suppression de la formation");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openModif = (f) => {
    const categorieId = categories.find(cat => cat.nom === f.categorie)?.id || f.categorie_id || '';
    
    setFormModif({
      intitule: f.intitule,
      categorie: categorieId,
      description: f.description || "",
      objectifs_pedagogiques: f.objectifs_pedagogiques || "",
      prerequis: f.prerequis || "",
      duree: f.duree?.split('h')[0]?.trim() || "",
      niveau: f.niveau,
      format: f.format,
      date_debut: f.date_debut?.split('T')[0] || "",
      date_fin: f.date_fin?.split('T')[0] || "",
      prix_ht: f.prix_ht || "",
      prix_ttc: f.prix_ttc || "",
      nb_tranches_paiement: f.nb_tranches_paiement || "1", 
      est_active: f.est_active !== undefined ? f.est_active : true,
    });
    setErreursModif({});
    setErrServeurModif("");
    setModalModif(f);
  };

  const handleOverlay = (e, closeFn) => {
    if (e.target === e.currentTarget) closeFn();
  };

  const getRowClassName = (formation) => {
    switch(formation.status) {
      case 'past': return 'row-past';
      case 'ongoing': return 'row-ongoing';
      case 'upcoming': return 'row-upcoming';
      default: return '';
    }
  };

  const initiales = (nom) => nom ? nom.slice(0, 2).toUpperCase() : "??";

  const getCategorieColor = (nom) => {
    const colors = {
      "Marketing digital": "#33CCFF",
      "Informatique": "#336699",
      "IA": "#7C3AED",
      "Design": "#EC4899",
      "Langues": "#059669",
      "Data": "#FFCC33",
      "Soft skills": "#CCCC99",
    };
    return colors[nom] || "#94A3B8";
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

      {/* Message de succès global */}
      {succesGlobal && <SuccesMsg msg={succesGlobal} />}

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
          <button className="btn btn-add" onClick={() => { 
            setFormAjout(EMPTY_FORM);
            setErreursAjout({});
            setErrServeurAjout("");
            setModalAjout(true); 
          }}>
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
                <th>Tranches</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((f) => (
                <tr key={f.id} className={getRowClassName(f)}>
                  <td className="td-num">{f.num}</td>
                  <td className="td-title">{f.intitule}</td>
                  <td><span className="cat-tag">{f.categorie}</span></td>
                  <td><span className={`badge ${NIVEAU_CLASS[f.niveau]}`}>{f.niveau}</span></td>
                  <td className="td-pre">{f.prerequis || "-"}</td>
                  <td className="td-dur">{f.duree}</td>
                  <td className="td-ttc">{f.prixTTC}</td>
                  <td className="td-ht">{f.prixHT}</td>
                  <td className="td-tranches">
                    <span className="tranche-badge">
                      {f.nb_tranches || 1} tranche{f.nb_tranches > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="td-status">
                    <span className={`status-badge ${f.est_active ? 'active' : 'inactive'}`}>
                      <i className={`fa-solid ${f.est_active ? 'fa-check-circle' : 'fa-ban'}`}></i>
                      {f.est_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(f)}>
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(f)}>
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className="act-btn act-suppr" title="Supprimer" onClick={() => openSuppr(f)}>
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
              {errServeurAjout && <ErrMsg msg={errServeurAjout} />}
              <div className="form-grid">
                <div className="form-group full">
                  <label>Intitulé de la formation <span className="req">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Ex : Développement Web Full Stack"
                    value={formAjout.intitule} 
                    style={erreursAjout.intitule ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, intitule: e.target.value});
                      setErreursAjout({...erreursAjout, intitule: ""});
                    }} 
                  />
                  <ErrMsg msg={erreursAjout.intitule} />
                </div>
                
                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <select 
                    value={formAjout.categorie} 
                    style={erreursAjout.categorie ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, categorie: e.target.value});
                      setErreursAjout({...erreursAjout, categorie: ""});
                    }}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                  <ErrMsg msg={erreursAjout.categorie} />
                </div>

                <div className="form-group">
                  <label>Niveau <span className="req">*</span></label>
                  <select 
                    value={formAjout.niveau} 
                    style={erreursAjout.niveau ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, niveau: e.target.value});
                      setErreursAjout({...erreursAjout, niveau: ""});
                    }}
                  >
                    <option value="">Sélectionner le niveau</option>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                  </select>
                  <ErrMsg msg={erreursAjout.niveau} />
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
                    style={erreursAjout.objectifs_pedagogiques ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, objectifs_pedagogiques: e.target.value});
                      setErreursAjout({...erreursAjout, objectifs_pedagogiques: ""});
                    }}
                  />
                  <ErrMsg msg={erreursAjout.objectifs_pedagogiques} />
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
                    style={erreursAjout.duree ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, duree: e.target.value});
                      setErreursAjout({...erreursAjout, duree: "", duree_coherence: ""});
                    }}
                  />
                  <ErrMsg msg={erreursAjout.duree} />
                </div>

                <div className="form-group">
                  <label>Format <span className="req">*</span></label>
                  <select 
                    value={formAjout.format} 
                    style={erreursAjout.format ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, format: e.target.value});
                      setErreursAjout({...erreursAjout, format: ""});
                    }}
                  >
                    <option value="">Sélectionner le format</option>
                    <option>Présentiel</option>
                    <option>En ligne</option>
                    <option>Hybride</option>
                  </select>
                  <ErrMsg msg={erreursAjout.format} />
                </div>

                {erreursAjout.duree_coherence && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <ErrMsg msg={erreursAjout.duree_coherence} />
                  </div>
                )}

                <div className="form-group">
                  <label>Date de début <span className="req">*</span></label>
                  <input 
                    type="date" 
                    value={formAjout.date_debut} 
                    style={erreursAjout.date_debut ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, date_debut: e.target.value});
                      setErreursAjout({...erreursAjout, date_debut: "", duree: "", duree_coherence: ""});
                    }}
                  />
                  <ErrMsg msg={erreursAjout.date_debut} />
                </div>

                <div className="form-group">
                  <label>Date de fin <span className="req">*</span></label>
                  <input 
                    type="date" 
                    value={formAjout.date_fin} 
                    style={erreursAjout.date_fin ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, date_fin: e.target.value});
                      setErreursAjout({...erreursAjout, date_fin: "", duree: "", duree_coherence: ""});
                    }}
                  />
                  <ErrMsg msg={erreursAjout.date_fin} />
                </div>

                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="Ex : 1000"
                    value={formAjout.prix_ht} 
                    style={erreursAjout.prix_ht ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, prix_ht: e.target.value});
                      setErreursAjout({...erreursAjout, prix_ht: ""});
                    }}
                  />
                  <ErrMsg msg={erreursAjout.prix_ht} />
                </div>

                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="Ex : 1200"
                    value={formAjout.prix_ttc} 
                    style={erreursAjout.prix_ttc ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormAjout({...formAjout, prix_ttc: e.target.value});
                      setErreursAjout({...erreursAjout, prix_ttc: ""});
                    }}
                  />
                  <ErrMsg msg={erreursAjout.prix_ttc} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tranches de paiement</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      placeholder="Nombre de tranches (1-12)"
                      value={formAjout.nb_tranches_paiement} 
                      onChange={(e) => setFormAjout({...formAjout, nb_tranches_paiement: e.target.value})}
                    />
                    <small className="field-hint">1 = paiement unique</small>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>Formation active</label>
                    <div className="checkbox-wrapper">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={formAjout.est_active} 
                          onChange={(e) => setFormAjout({...formAjout, est_active: e.target.checked})}
                        />
                        <span>Oui, cette formation est active</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)}>Annuler</button>
              <button className="btn btn-save" onClick={handleAjout} disabled={submitLoading}>
                {submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer</>}
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
              {errServeurModif && <ErrMsg msg={errServeurModif} />}
              <div className="form-grid">
                <div className="form-group full">
                  <label>Intitulé de la formation <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={formModif.intitule} 
                    style={erreursModif.intitule ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, intitule: e.target.value});
                      setErreursModif({...erreursModif, intitule: ""});
                    }} 
                  />
                  <ErrMsg msg={erreursModif.intitule} />
                </div>

                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <select 
                    value={formModif.categorie} 
                    style={erreursModif.categorie ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, categorie: e.target.value});
                      setErreursModif({...erreursModif, categorie: ""});
                    }}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                  <ErrMsg msg={erreursModif.categorie} />
                </div>

                <div className="form-group">
                  <label>Niveau <span className="req">*</span></label>
                  <select 
                    value={formModif.niveau} 
                    style={erreursModif.niveau ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, niveau: e.target.value});
                      setErreursModif({...erreursModif, niveau: ""});
                    }}
                  >
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                  </select>
                  <ErrMsg msg={erreursModif.niveau} />
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
                    style={erreursModif.objectifs_pedagogiques ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, objectifs_pedagogiques: e.target.value});
                      setErreursModif({...erreursModif, objectifs_pedagogiques: ""});
                    }}
                  />
                  <ErrMsg msg={erreursModif.objectifs_pedagogiques} />
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
                    style={erreursModif.duree ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, duree: e.target.value});
                      setErreursModif({...erreursModif, duree: "", duree_coherence: ""});
                    }}
                  />
                  <ErrMsg msg={erreursModif.duree} />
                </div>

                <div className="form-group">
                  <label>Format <span className="req">*</span></label>
                  <select 
                    value={formModif.format} 
                    style={erreursModif.format ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, format: e.target.value});
                      setErreursModif({...erreursModif, format: ""});
                    }}
                  >
                    <option>Présentiel</option>
                    <option>En ligne</option>
                    <option>Hybride</option>
                  </select>
                  <ErrMsg msg={erreursModif.format} />
                </div>

                {erreursModif.duree_coherence && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <ErrMsg msg={erreursModif.duree_coherence} />
                  </div>
                )}

                <div className="form-group">
                  <label>Date de début</label>
                  <input 
                    type="date" 
                    value={formModif.date_debut} 
                    style={erreursModif.date_debut ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, date_debut: e.target.value});
                      setErreursModif({...erreursModif, date_debut: "", duree: "", duree_coherence: ""});
                    }}
                  />
                  <ErrMsg msg={erreursModif.date_debut} />
                </div>

                <div className="form-group">
                  <label>Date de fin</label>
                  <input 
                    type="date" 
                    value={formModif.date_fin} 
                    style={erreursModif.date_fin ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, date_fin: e.target.value});
                      setErreursModif({...erreursModif, date_fin: "", duree: "", duree_coherence: ""});
                    }}
                  />
                  <ErrMsg msg={erreursModif.date_fin} />
                </div>

                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formModif.prix_ht} 
                    style={erreursModif.prix_ht ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, prix_ht: e.target.value});
                      setErreursModif({...erreursModif, prix_ht: ""});
                    }}
                  />
                  <ErrMsg msg={erreursModif.prix_ht} />
                </div>

                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formModif.prix_ttc} 
                    style={erreursModif.prix_ttc ? styleInputErreur : {}}
                    onChange={(e) => { 
                      setFormModif({...formModif, prix_ttc: e.target.value});
                      setErreursModif({...erreursModif, prix_ttc: ""});
                    }}
                  />
                  <ErrMsg msg={erreursModif.prix_ttc} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tranches de paiement</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      value={formModif.nb_tranches_paiement} 
                      onChange={(e) => setFormModif({...formModif, nb_tranches_paiement: e.target.value})}
                    />
                    <small className="field-hint">1 = paiement unique</small>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>Formation active</label>
                    <div className="checkbox-wrapper">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={formModif.est_active} 
                          onChange={(e) => setFormModif({...formModif, est_active: e.target.checked})}
                        />
                        <span>Oui, cette formation est active</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)}>Annuler</button>
              <button className="btn btn-update" onClick={handleModif} disabled={submitLoading}>
                {submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-rotate"></i> Mettre à jour</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODALE SUPPRESSION ══════════════ */}
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
                Supprimer la formation
              </h2>
              
              {/* Card formation */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
                <div style={{ 
                  background: getCategorieColor(modalSuppr.categorie), 
                  borderRadius: "8px", 
                  width: "40px", 
                  height: "40px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "#fff", 
                  fontWeight: "700", 
                  fontSize: "14px", 
                  flexShrink: 0 
                }}>
                  {initiales(modalSuppr.intitule)}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{modalSuppr.intitule}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>#{String(modalSuppr.id).padStart(3, "0")}</div>
                </div>
              </div>

              {/* Avertissement */}
              <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "8px", textAlign: "left", marginBottom: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: "2px", flexShrink: 0 }}></i>
                <span>Cette action est <strong>irréversible</strong>. Toutes les données associées seront définitivement supprimées.</span>
              </div>

              {/* Erreur suppression */}
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
                style={{ 
                  flex: 1, 
                  background: errSuppr ? "#fca5a5" : "#ef4444", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "10px", 
                  padding: "10px 20px", 
                  fontWeight: "600", 
                  cursor: (submitLoading || errSuppr) ? "not-allowed" : "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  transition: "background 0.2s" 
                }}
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

export default Formations;