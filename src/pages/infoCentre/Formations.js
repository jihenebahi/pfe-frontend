import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getFormations,
  getFormationsArchivees,
  ajouterFormation,
  modifierFormation,
  supprimerFormation,
  archiverFormation,
  reactiverFormation,
  desactiverFormation,
  activerFormation,
  getCategoriesDisponibles,
  canDesactiverFormation,
} from "../../services/infoCentre/formationService";
import "../../styles/infoCentre/formations.css";

const EMPTY_FORM = {
  intitule: "",
  categorie: "",
  description: "",
  objectifs_pedagogiques: "",
  prerequis: "",
  duree_totale_heures: "",
  status: "active",
};

/* ── Dropdown Catégorie pour filtres ── */
function CategorieFilterDropdown({ categories, selectedValue, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = categories.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="formation-filter-dropdown" ref={ref}>
      <button type="button" className="filter-dropdown-btn" onClick={() => setOpen(!open)}>
        <i className="fa-solid fa-tags"></i>
        <span className="filter-dropdown-text">{selectedValue || "Toutes les catégories"}</span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} filter-dropdown-chevron`}></i>
      </button>
      {open && (
        <div className="filter-dropdown-panel">
          <div className="filter-dropdown-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Rechercher une catégorie..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
          <div className="filter-dropdown-list" style={{ maxHeight: "240px" }}>
            <div className={`filter-dropdown-item ${!selectedValue ? "active" : ""}`} onClick={() => { onSelect(""); setOpen(false); setSearch(""); }}>
              <i className="fa-solid fa-arrow-rotate-left"></i><span>Toutes les catégories</span>
            </div>
            {filtered.length === 0
              ? <div className="filter-dropdown-empty">Aucune catégorie trouvée</div>
              : filtered.map(cat => (
                <div key={cat.id} className={`filter-dropdown-item ${selectedValue === cat.nom ? "active" : ""}`} onClick={() => { onSelect(cat.nom); setOpen(false); setSearch(""); }}>
                  <i className="fa-solid fa-tag"></i><span>{cat.nom}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sélecteur Catégorie pour formulaire ── */
function CategorieFormSelect({ categories, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const selectedCat = categories.find(c => c.id === value);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = categories.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="categorie-form-select" ref={ref} style={{ width: "100%" }}>
      <button type="button" className="categorie-select-btn" onClick={() => setOpen(!open)}>
        <span className={`categorie-select-text ${!value ? "categorie-select-placeholder" : ""}`}>
          {selectedCat?.nom || "Sélectionner une catégorie"}
        </span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} categorie-select-chevron`}></i>
      </button>
      {open && (
        <div className="categorie-dropdown-panel">
          <div className="categorie-dropdown-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Rechercher une catégorie..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            {search && (
              <button type="button" className="fmt-search-clear" onClick={() => setSearch("")}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <div className="categorie-dropdown-list">
            {filtered.length === 0 ? (
              <div className="categorie-dropdown-empty">Aucune catégorie trouvée</div>
            ) : (
              filtered.map(cat => (
                <div key={cat.id} className={`categorie-dropdown-item ${value === cat.id ? "active" : ""}`} onClick={() => { onChange(cat.id); setOpen(false); setSearch(""); }}>
                  <i className="fa-solid fa-tag"></i>
                  <span>{cat.nom}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <small className="error-msg">{error}</small>}
    </div>
  );
}

/* ── Toggle Switch avec prop disabled et title ── */
function ToggleSwitch({ checked, onChange, disabled, title }) {
  return (
    <label className={`toggle-switch ${disabled ? "toggle-disabled" : ""}`} title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-slider"></span>
    </label>
  );
}

function Formations() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("actives");
  const [formations, setFormations] = useState([]);
  const [formationsArchivees, setFormationsArchivees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  
  // État pour stocker les formations qui peuvent être désactivées
  const [canDesactiverMap, setCanDesactiverMap] = useState({});

  // Filtres
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchArch, setSearchArch] = useState("");
  const [filterCatArch, setFilterCatArch] = useState("");
  const [currentPageArch, setCurrentPageArch] = useState(1);

  // Sélections groupées
  const [selectedActives, setSelectedActives] = useState([]);
  const [selectedArchivees, setSelectedArchivees] = useState([]);
  const [bulkArchiving, setBulkArchiving] = useState(false);
  const [bulkReactivating, setBulkReactivating] = useState(false);

  // Modales
  const [modalDetail, setModalDetail] = useState(null);
  const [modalModif, setModalModif] = useState(null);
  const [modalAjout, setModalAjout] = useState(false);
  const [modalSuppr, setModalSuppr] = useState(null);
  const [modalSessionDetail, setModalSessionDetail] = useState(null);

  // Filtres des sessions
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionDateDebut, setSessionDateDebut] = useState("");
  const [sessionDateFin, setSessionDateFin] = useState("");

  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);
  const [erreursAjout, setErreursAjout] = useState({});
  const [erreursModif, setErreursModif] = useState({});
  const [errServeurAjout, setErrServeurAjout] = useState("");
  const [errServeurModif, setErrServeurModif] = useState("");
  const [errServeurSuppression, setErrServeurSuppression] = useState(null);
  const [succesGlobal, setSuccesGlobal] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const itemsPerPage = 7;

  useEffect(() => {
    fetchFormations();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "archivees" && formationsArchivees.length === 0) {
      fetchFormationsArchivees();
    }
    setSelectedActives([]);
    setSelectedArchivees([]);
  }, [activeTab]);

  useEffect(() => {
    if (!modalDetail) {
      setSessionSearch("");
      setSessionDateDebut("");
      setSessionDateFin("");
    }
  }, [modalDetail]);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const r = await getFormations();
      const formationsData = r.data;
      setFormations(formationsData);
      setCurrentPage(1);
      
      // Vérifier pour chaque formation active si elle peut être désactivée
      const activeFormations = formationsData.filter(f => f.status === "active");
      const checks = await Promise.all(
        activeFormations.map(async (f) => {
          try {
            const response = await canDesactiverFormation(f.id);
            return { id: f.id, canDesactiver: response.data.can_desactiver };
          } catch {
            return { id: f.id, canDesactiver: true };
          }
        })
      );
      
      const newMap = {};
      checks.forEach(check => {
        newMap[check.id] = check.canDesactiver;
      });
      setCanDesactiverMap(newMap);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormationsArchivees = async () => {
    try {
      const r = await getFormationsArchivees();
      setFormationsArchivees(r.data);
      setCurrentPageArch(1);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const r = await getCategoriesDisponibles();
      setCategories(r.data);
    } catch (err) {
      console.error(err);
    }
  };

  const afficherSucces = (msg) => {
    setSuccesGlobal(msg);
    setTimeout(() => setSuccesGlobal(""), 4000);
  };

  const filteredActives = formations
    .filter((f) => f.status !== "archivee")
    .filter((f) => {
      const q = search.toLowerCase();
      return (
        f.intitule?.toLowerCase().includes(q) ||
        f.categorie_nom?.toLowerCase().includes(q)
      ) && (!filterCat || f.categorie_nom === filterCat);
    })
    .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

  const totalPages = Math.max(1, Math.ceil(filteredActives.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActives = filteredActives.slice(startIndex, endIndex);

  const filteredArchivees = formationsArchivees.filter((f) => {
    const q = searchArch.toLowerCase();
    return (
      f.intitule?.toLowerCase().includes(q) ||
      f.categorie_nom?.toLowerCase().includes(q)
    ) && (!filterCatArch || f.categorie_nom === filterCatArch);
  });

  const totalPagesArch = Math.max(1, Math.ceil(filteredArchivees.length / itemsPerPage));
  const safePageArch = Math.min(currentPageArch, totalPagesArch);
  const startIndexArch = (safePageArch - 1) * itemsPerPage;
  const endIndexArch = startIndexArch + itemsPerPage;
  const paginatedArchivees = filteredArchivees.slice(startIndexArch, endIndexArch);

  // Filtrage des sessions
  const filteredSessions = (modalDetail?.sessions_list || []).filter((session) => {
    const searchMatch = !sessionSearch || 
      session.intitule_session?.toLowerCase().includes(sessionSearch.toLowerCase());
    
    let dateMatch = true;
    if (sessionDateDebut || sessionDateFin) {
      const sessionDebut = new Date(session.date_debut);
      const sessionFin = new Date(session.date_fin);
      const filterDebut = sessionDateDebut ? new Date(sessionDateDebut) : null;
      const filterFin = sessionDateFin ? new Date(sessionDateFin) : null;
      
      if (filterDebut && filterFin) {
        dateMatch = (sessionDebut <= filterFin && sessionFin >= filterDebut);
      } else if (filterDebut) {
        dateMatch = sessionFin >= filterDebut;
      } else if (filterFin) {
        dateMatch = sessionDebut <= filterFin;
      }
    }
    
    return searchMatch && dateMatch;
  });

  const toggleSelectFormation = (id) =>
    setSelectedActives((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const toggleSelectAll = () => {
    setSelectedActives(
      selectedActives.length === paginatedActives.length && paginatedActives.length > 0
        ? []
        : paginatedActives.map((f) => f.id)
    );
  };

  const allChecked =
    paginatedActives.length > 0 && selectedActives.length === paginatedActives.length;
  const someChecked =
    selectedActives.length > 0 && selectedActives.length < paginatedActives.length;

  const toggleSelectArchivee = (id) =>
    setSelectedArchivees((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const toggleSelectAllArchivees = () => {
    setSelectedArchivees(
      selectedArchivees.length === paginatedArchivees.length && paginatedArchivees.length > 0
        ? []
        : paginatedArchivees.map((f) => f.id)
    );
  };

  const allArchiveesChecked =
    paginatedArchivees.length > 0 && selectedArchivees.length === paginatedArchivees.length;
  const someArchiveesChecked =
    selectedArchivees.length > 0 && selectedArchivees.length < paginatedArchivees.length;

  const handleToggleStatus = async (formation) => {
    // Vérifier si la désactivation est autorisée
    if (formation.status === "active" && !canDesactiverMap[formation.id]) {
      afficherSucces(`⚠️ Impossible de désactiver "${formation.intitule}" car elle possède des sessions en cours ou planifiées.`);
      return;
    }
    
    setTogglingId(formation.id);
    try {
      if (formation.status === "active") {
        await desactiverFormation(formation.id);
        afficherSucces(`"${formation.intitule}" a été désactivée`);
        // Mettre à jour la map après désactivation
        setCanDesactiverMap(prev => ({ ...prev, [formation.id]: false }));
      } else if (formation.status === "desactivee") {
        await activerFormation(formation.id);
        afficherSucces(`"${formation.intitule}" a été activée`);
        // Re-vérifier si la formation peut être désactivée après activation
        try {
          const response = await canDesactiverFormation(formation.id);
          setCanDesactiverMap(prev => ({ ...prev, [formation.id]: response.data.can_desactiver }));
        } catch {
          setCanDesactiverMap(prev => ({ ...prev, [formation.id]: true }));
        }
      }
      await fetchFormations();
    } catch (err) {
      console.error(err);
      afficherSucces("Erreur lors du changement de statut");
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkArchiver = async () => {
    if (!selectedActives.length) return;
    try {
      setBulkArchiving(true);
      await Promise.all(selectedActives.map((id) => archiverFormation(id)));
      await fetchFormations();
      setFormationsArchivees([]);
      afficherSucces(`${selectedActives.length} formation(s) archivée(s)`);
      setSelectedActives([]);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkArchiving(false);
    }
  };

  const handleBulkReactiver = async () => {
    if (!selectedArchivees.length) return;
    try {
      setBulkReactivating(true);
      await Promise.all(selectedArchivees.map((id) => reactiverFormation(id)));
      await fetchFormationsArchivees();
      await fetchFormations();
      afficherSucces(`${selectedArchivees.length} formation(s) réactivée(s)`);
      setSelectedArchivees([]);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkReactivating(false);
    }
  };

  const handleAjout = async () => {
    if (!formAjout.intitule.trim()) {
      setErreursAjout({ intitule: "L'intitulé est requis" });
      return;
    }
    if (!formAjout.categorie) {
      setErreursAjout({ categorie: "La catégorie est requise" });
      return;
    }
    if (!formAjout.duree_totale_heures || formAjout.duree_totale_heures <= 0) {
      setErreursAjout({ duree_totale_heures: "La durée est requise et doit être supérieure à 0" });
      return;
    }

    try {
      setSubmitLoading(true);
      setErreursAjout({});
      setErrServeurAjout("");
      await ajouterFormation({
        ...formAjout,
        categorie: parseInt(formAjout.categorie),
        duree_totale_heures: parseInt(formAjout.duree_totale_heures),
        status: "active",
      });
      await fetchFormations();
      setModalAjout(false);
      setFormAjout(EMPTY_FORM);
      afficherSucces("Formation ajoutée avec succès !");
    } catch (err) {
      setErrServeurAjout(err.response?.data ? Object.values(err.response.data).flat().join("\n") : "Erreur");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleModif = async () => {
    if (!modalModif) return;
    try {
      setSubmitLoading(true);
      setErreursModif({});
      setErrServeurModif("");
      await modifierFormation(modalModif.id, {
        ...formModif,
        categorie: parseInt(formModif.categorie),
        duree_totale_heures: parseInt(formModif.duree_totale_heures),
      });
      modalModif.status === "archivee" ? await fetchFormationsArchivees() : await fetchFormations();
      setModalModif(null);
      afficherSucces("Formation modifiée avec succès !");
    } catch (err) {
      setErrServeurModif(err.response?.data ? Object.values(err.response.data).flat().join("\n") : "Erreur");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSupprimer = async () => {
    if (!modalSuppr) return;

    try {
      setSubmitLoading(true);
      setErrServeurSuppression(null);

      await supprimerFormation(modalSuppr.id);

      if (modalSuppr.status === "archivee") {
        await fetchFormationsArchivees();
      } else {
        await fetchFormations();
      }

      setModalSuppr(null);
      afficherSucces("Formation supprimée avec succès !");
    } catch (err) {
      console.error("Erreur suppression:", err);

      if (err.response?.data?.error === 'formation_has_sessions') {
        const sessionsCount = err.response.data.sessions_count;
        setErrServeurSuppression({
          type: 'has_sessions',
          message: `⚠️ Cette formation possède ${sessionsCount} session(s) de formation associée(s).`,
          formationId: modalSuppr.id,
          formationName: modalSuppr.intitule,
          sessionsCount: sessionsCount
        });
      } else {
        setErrServeurSuppression({
          type: 'error',
          message: "Erreur lors de la suppression",
          details: err.response?.data?.message || "Une erreur est survenue"
        });
      }

      setSubmitLoading(false);
      return;
    } finally {
      setSubmitLoading(false);
    }
  };

  const openModif = (f) => {
    setFormModif({
      intitule: f.intitule,
      categorie: f.categorie,
      description: f.description || "",
      objectifs_pedagogiques: f.objectifs_pedagogiques || "",
      prerequis: f.prerequis || "",
      duree_totale_heures: f.duree_totale_heures,
      status: f.status,
    });
    setModalModif(f);
  };

  const handleOverlay = (e, fn) => {
    if (e.target === e.currentTarget) fn();
  };

  const getStatusBadge = (status) => {
    if (status === "active") return <span className="status-badge status-active"><i className="fa-solid fa-check-circle"></i> Actif</span>;
    if (status === "archivee") return <span className="status-badge status-archived"><i className="fa-solid fa-box-archive"></i> Archivée</span>;
    return <span className="status-badge status-inactive"><i className="fa-solid fa-ban"></i> Désactivé</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  if (loading && !formations.length) {
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
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-book-open"></i> Gestion des Formations
        </h1>
        <p className="page-sub">Catalogue des formations du centre</p>
      </div>

      {succesGlobal && (
        <div className="success-message">{succesGlobal}</div>
      )}

      <div className="formations-tabs">
        <button
          className={`tab-btn ${activeTab === "actives" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("actives")}
        >
          <i className="fa-solid fa-check-circle"></i>
          Toutes les formations
          <span className="tab-count">
            {formations.filter((f) => f.status !== "archivee").length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === "archivees" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("archivees")}
        >
          <i className="fa-solid fa-box-archive"></i>
          Formations archivées
          <span className="tab-count">
            {formationsArchivees.length}
          </span>
        </button>
      </div>

      {activeTab === "actives" && (
        <>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <CategorieFilterDropdown
                categories={categories}
                selectedValue={filterCat}
                onSelect={(v) => { setFilterCat(v); setCurrentPage(1); }}
              />
            </div>
            <div className="toolbar-right">
              <button className="btn btn-cat" onClick={() => navigate("/categories")}>
                <i className="fa-solid fa-tags"></i> Catégories
              </button>
              <button
                className="btn btn-add"
                onClick={() => {
                  setFormAjout(EMPTY_FORM);
                  setErreursAjout({});
                  setErrServeurAjout("");
                  setModalAjout(true);
                }}
              >
                <i className="fa-solid fa-plus"></i> Nouvelle Formation
              </button>
            </div>
          </div>

          {selectedActives.length > 0 && (
            <div className="bulk-action-bar bulk-bar-archive">
              <div className="bulk-action-info">
                <div className="bulk-count-badge">
                  <i className="fa-solid fa-check"></i>
                  <span>{selectedActives.length}</span>
                </div>
                <span className="bulk-label">formation(s) sélectionnée(s)</span>
              </div>
              <div className="bulk-action-btns">
                <button className="bulk-btn bulk-btn-archive" onClick={handleBulkArchiver} disabled={bulkArchiving}>
                  {bulkArchiving ? <><i className="fa-solid fa-spinner fa-spin"></i> Archivage...</> : <><i className="fa-solid fa-box-archive"></i> Archiver</>}
                </button>
                <button className="bulk-btn bulk-btn-cancel" onClick={() => setSelectedActives([])}>
                  <i className="fa-solid fa-xmark"></i> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="table-card">
            <div className="table-top">
              Affichage de <strong>{paginatedActives.length}</strong> sur <strong>{filteredActives.length}</strong> formations
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "48px", textAlign: "center", paddingLeft: "16px" }}>
                      <label className="cb-wrap">
                        <input type="checkbox" className="cb-input" checked={allChecked}
                          ref={el => { if (el) el.indeterminate = someChecked; }}
                          onChange={toggleSelectAll} />
                        <span className="cb-box"></span>
                      </label>
                    </th>
                    <th>#</th>
                    <th>Intitulé</th>
                    <th>Catégorie</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActives.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan="7" className="empty-cell">
                        <i className="fa-solid fa-inbox"></i>
                        <p>Aucune formation trouvée</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedActives.map((f, index) => {
                      // Déterminer si le toggle doit être désactivé
                      const isToggleDisabled = f.status === "active" && !canDesactiverMap[f.id];
                      const toggleTitle = isToggleDisabled 
                        ? "Impossible de désactiver : cette formation a des sessions en cours ou planifiées" 
                        : (f.status === "active" ? "Désactiver la formation" : "Activer la formation");
                      
                      return (
                        <tr key={f.id} className={f.status === "desactivee" ? "row-desactive" : ""}>
                          <td style={{ textAlign: "center", paddingLeft: "16px" }}>
                            <label className="cb-wrap">
                              <input type="checkbox" className="cb-input" checked={selectedActives.includes(f.id)} onChange={() => toggleSelectFormation(f.id)} />
                              <span className="cb-box"></span>
                            </label>
                          </td>
                          <td className="td-num">{startIndex + index + 1}</td>
                          <td className="td-title">{f.intitule}</td>
                          <td><span className="cat-tag">{f.categorie_nom}</span></td>
                          <td className="td-dur">{f.duree_totale_heures}h</td>
                          <td className="td-status">
                            <div className="status-container">
                              {getStatusBadge(f.status)}
                              <ToggleSwitch
                                checked={f.status === "active"}
                                onChange={() => handleToggleStatus(f)}
                                disabled={togglingId === f.id || isToggleDisabled}
                                title={toggleTitle}
                              />
                            </div>
                          </td>
                          <td className="td-actions">
                            <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(f)}><i className="fa-solid fa-eye"></i></button>
                            <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(f)}><i className="fa-solid fa-pen"></i></button>
                            <button className="act-btn act-suppr" title="Supprimer" onClick={() => { setErrServeurSuppression(null); setModalSuppr(f); }}><i className="fa-solid fa-trash"></i></button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                <i className="fa-solid fa-angle-left"></i>
              </button>
              <span className="pg-info">Page <strong>{safePage}</strong> sur <strong>{totalPages}</strong></span>
              <button className="pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === "archivees" && (
        <>
          <div className="archive-info-banner">
            <i className="fa-solid fa-circle-info"></i>
            <span>Les formations archivées ne sont plus visibles dans la liste principale. Vous pouvez les <strong>réactiver</strong> à tout moment.</span>
          </div>

          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Rechercher dans les archives..."
                  value={searchArch}
                  onChange={(e) => { setSearchArch(e.target.value); setCurrentPageArch(1); }}
                />
              </div>
              <CategorieFilterDropdown
                categories={categories}
                selectedValue={filterCatArch}
                onSelect={(v) => { setFilterCatArch(v); setCurrentPageArch(1); }}
              />
            </div>
          </div>

          {selectedArchivees.length > 0 && (
            <div className="bulk-action-bar bulk-bar-reactiver">
              <div className="bulk-action-info">
                <div className="bulk-count-badge bulk-count-green">
                  <i className="fa-solid fa-check"></i>
                  <span>{selectedArchivees.length}</span>
                </div>
                <span className="bulk-label">formation(s) sélectionnée(s)</span>
              </div>
              <div className="bulk-action-btns">
                <button className="bulk-btn bulk-btn-reactiver" onClick={handleBulkReactiver} disabled={bulkReactivating}>
                  {bulkReactivating ? <><i className="fa-solid fa-spinner fa-spin"></i> Réactivation...</> : <><i className="fa-solid fa-rotate-left"></i> Réactiver</>}
                </button>
                <button className="bulk-btn bulk-btn-cancel" onClick={() => setSelectedArchivees([])}>
                  <i className="fa-solid fa-xmark"></i> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="table-card table-card-archive">
            <div className="table-top">
              Affichage de <strong>{paginatedArchivees.length}</strong> sur <strong>{filteredArchivees.length}</strong> formations archivées
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "48px", textAlign: "center", paddingLeft: "16px" }}>
                      <label className="cb-wrap">
                        <input type="checkbox" className="cb-input cb-input-arch" checked={allArchiveesChecked}
                          ref={el => { if (el) el.indeterminate = someArchiveesChecked; }}
                          onChange={toggleSelectAllArchivees} />
                        <span className="cb-box cb-box-arch"></span>
                      </label>
                    </th>
                    <th>#</th>
                    <th>Intitulé</th>
                    <th>Catégorie</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArchivees.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan="7" className="empty-cell">
                        <i className="fa-solid fa-box-archive"></i>
                        <p>Aucune formation archivée</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedArchivees.map((f, index) => (
                      <tr key={f.id}>
                        <td style={{ textAlign: "center", paddingLeft: "16px" }}>
                          <label className="cb-wrap">
                            <input type="checkbox" className="cb-input" checked={selectedArchivees.includes(f.id)} onChange={() => toggleSelectArchivee(f.id)} />
                            <span className="cb-box cb-box-arch"></span>
                          </label>
                        </td>
                        <td className="td-num">{startIndexArch + index + 1}</td>
                        <td className="td-title" style={{ opacity: 0.72 }}>{f.intitule}</td>
                        <td><span className="cat-tag">{f.categorie_nom}</span></td>
                        <td className="td-dur">{f.duree_totale_heures}h</td>
                        <td>{getStatusBadge(f.status)}</td>
                        <td className="td-actions">
                          <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(f)}><i className="fa-solid fa-eye"></i></button>
                          <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(f)}><i className="fa-solid fa-pen"></i></button>
                          <button className="act-btn act-suppr" title="Supprimer définitivement" onClick={() => { setErrServeurSuppression(null); setModalSuppr(f); }}><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPagesArch > 1 && (
            <div className="pagination">
              <button className="pg-btn" onClick={() => setCurrentPageArch(p => Math.max(1, p - 1))} disabled={safePageArch === 1}>
                <i className="fa-solid fa-angle-left"></i>
              </button>
              <span className="pg-info">Page <strong>{safePageArch}</strong> sur <strong>{totalPagesArch}</strong></span>
              <button className="pg-btn" onClick={() => setCurrentPageArch(p => Math.min(totalPagesArch, p + 1))} disabled={safePageArch === totalPagesArch}>
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* MODALE DÉTAIL FORMATION AVEC FILTRES */}
      {modalDetail && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => setModalDetail(null))}>
          <div className="modal modal-wide modal-detail-formation">
            <div className="modal-header detail-header">
              <div className="detail-header-left">
                <div className="detail-icon-wrap"><i className="fa-solid fa-book-open"></i></div>
                <div className="detail-header-info">
                  <h2>{modalDetail.intitule}</h2>
                  <div className="detail-badges">
                    <span className="cat-tag">{modalDetail.categorie_nom}</span>
                    <span className="fmt-tag"><i className="fa-solid fa-clock"></i> {modalDetail.duree_totale_heures} heures</span>
                    {modalDetail.sessions_count !== undefined && (
                      <span className="fmt-tag" style={{ background: "rgba(51,204,255,0.15)" }}>
                        <i className="fa-solid fa-calendar-days"></i> {modalDetail.sessions_count} session(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalDetail(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="modal-body">
              <div className="detail-sections" style={{ marginTop: "14px" }}>

                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-align-left"></i> Description</div>
                  <p className="detail-sec-text">{modalDetail.description || "Aucune description"}</p>
                </div>

                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-bullseye"></i> Objectifs pédagogiques</div>
                  <ul className="detail-list">
                    {modalDetail.objectifs_pedagogiques?.split("\n").filter(o => o.trim()).map((o, i) => <li key={i}>{o}</li>)}
                    {(!modalDetail.objectifs_pedagogiques || modalDetail.objectifs_pedagogiques.trim() === "") && <li>Aucun objectif défini</li>}
                  </ul>
                </div>

                <div className="detail-sec">
                  <div className="detail-sec-title"><i className="fa-solid fa-clipboard-list"></i> Prérequis</div>
                  <p className="detail-sec-text">{modalDetail.prerequis || "Aucun prérequis"}</p>
                </div>

                {/* SECTION SESSIONS AVEC FILTRES */}
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-calendar-days"></i>
                    Sessions ({modalDetail.sessions_count || 0})
                  </div>

                  {modalDetail.sessions_list && modalDetail.sessions_list.length > 0 ? (
                    <>
                      <div className="sessions-filters-row">
                        <div className="session-filter-search">
                          <i className="fa-solid fa-magnifying-glass"></i>
                          <input
                            type="text"
                            placeholder="Rechercher une session..."
                            value={sessionSearch}
                            onChange={e => setSessionSearch(e.target.value)}
                          />
                          {sessionSearch && (
                            <button type="button" className="filter-clear-btn" onClick={() => setSessionSearch("")}>
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>

                        <div className="session-date-filter-row">
                          <i className="fa-regular fa-calendar"></i>
                          <input
                            type="date"
                            className="date-input"
                            value={sessionDateDebut}
                            onChange={e => setSessionDateDebut(e.target.value)}
                          />
                          <span className="date-separator">→</span>
                          <input
                            type="date"
                            className="date-input"
                            value={sessionDateFin}
                            onChange={e => setSessionDateFin(e.target.value)}
                          />
                          {(sessionDateDebut || sessionDateFin) && (
                            <button type="button" className="filter-clear-btn" onClick={() => { setSessionDateDebut(""); setSessionDateFin(""); }}>
                              <i className="fa-solid fa-rotate-left"></i>
                            </button>
                          )}
                        </div>

                        {(sessionSearch || sessionDateDebut || sessionDateFin) && (
                          <button className="reset-filters-btn" onClick={() => {
                            setSessionSearch("");
                            setSessionDateDebut("");
                            setSessionDateFin("");
                          }}>
                            <i className="fa-solid fa-eraser"></i>
                          </button>
                        )}
                      </div>

                      <div className="sessions-table-wrapper">
                        <table className="sessions-table">
                          <thead>
                            <tr>
                              <th>Intitulé</th>
                              <th>Dates</th>
                              <th>Niveau</th>
                              <th>Statut</th>
                              <th style={{ width: "60px" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSessions.length === 0 ? (
                              <tr className="empty-row">
                                <td colSpan="5" className="empty-cell">
                                  <i className="fa-solid fa-filter-circle-xmark"></i>
                                  <span>Aucune session trouvée</span>
                                </td>
                              </tr>
                            ) : (
                              filteredSessions.map((session) => (
                                <tr key={session.id} className="session-row" onClick={() => setModalSessionDetail(session)}>
                                  <td className="session-title-cell">{session.intitule_session}</td>
                                  <td className="session-dates-cell">
                                    {formatDate(session.date_debut)} → {formatDate(session.date_fin)}
                                  </td>
                                  <td className="session-niveau-cell">
                                    {session.niveau ? (
                                      <span className={`niveau-badge ${session.niveau}`}>
                                        {session.niveau_display || session.niveau}
                                      </span>
                                    ) : (
                                      <span className="niveau-empty">—</span>
                                    )}
                                  </td>
                                  <td className="session-statut-cell">
                                    <span className={`session-statut-badge ${session.statut_session}`}>
                                      <span className="status-dot"></span>
                                      {session.statut_display}
                                    </span>
                                  </td>
                                  <td className="session-action-cell">
                                    <button className="session-view-btn">
                                      <i className="fa-solid fa-eye"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="sessions-filter-count">
                        {filteredSessions.length} / {modalDetail.sessions_list.length} session(s) affichée(s)
                      </div>
                    </>
                  ) : (
                    <div className="no-sessions-message">
                      <i className="fa-solid fa-calendar-xmark"></i>
                      <p>Aucune session associée</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalDetail(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DÉTAIL SESSION */}
      {modalSessionDetail && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => setModalSessionDetail(null))}>
          <div className="modal modal-session-detail">
            <div className="session-detail-header">
              <div className="session-detail-title-section">
                <div className="session-detail-icon">
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div className="session-detail-title-info">
                  <h3>{modalSessionDetail.intitule_session}</h3>
                  <div className="session-detail-meta">
                    <span className={`session-status-badge-detail ${modalSessionDetail.statut_session}`}>
                      <span className="status-dot"></span>
                      {modalSessionDetail.statut_display}
                    </span>
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setModalSessionDetail(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="session-detail-body">
              
              <div className="detail-info-block">
                <div className="block-header">
                  <i className="fa-regular fa-calendar"></i>
                  <span>Période</span>
                </div>
                <div className="block-content dates-content">
                  <div className="date-box">
                    <span className="date-label">Du</span>
                    <span className="date-value">{formatDate(modalSessionDetail.date_debut)}</span>
                  </div>
                  <div className="date-arrow-icon">
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                  <div className="date-box">
                    <span className="date-label">Au</span>
                    <span className="date-value">{formatDate(modalSessionDetail.date_fin)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-info-block">
                <div className="block-header">
                  <i className="fa-solid fa-users"></i>
                  <span>Formateurs</span>
                </div>
                <div className="block-content">
                  {modalSessionDetail.formateurs_list && modalSessionDetail.formateurs_list.length > 0 ? (
                    <div className="formateurs-list-detail">
                      {modalSessionDetail.formateurs_list.map((formateur, idx) => (
                        <div key={idx} className="formateur-card">
                          <div className="formateur-avatar">
                            {formateur.prenom?.[0]}{formateur.nom?.[0]}
                          </div>
                          <div className="formateur-info">
                            <div className="formateur-name">{formateur.nom_complet}</div>
                            <div className="formateur-specialite">{formateur.specialites || "Formateur"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-block">Aucun formateur assigné</div>
                  )}
                </div>
              </div>

              <div className="detail-info-block">
                <div className="block-header">
                  <i className="fa-solid fa-euro-sign"></i>
                  <span>Tarifs</span>
                </div>
                <div className="block-content tariffs-content">
                  <div className="tariff-card">
                    <div className="tariff-label">Prix HT</div>
                    <div className="tariff-value">{formatPrice(modalSessionDetail.prix_ht)}</div>
                  </div>
                  <div className="tariff-card">
                    <div className="tariff-label">Prix TTC</div>
                    <div className="tariff-value">{formatPrice(modalSessionDetail.prix_ttc)}</div>
                  </div>
                  {modalSessionDetail.tranche && (
                    <div className="tariff-card tranche-card">
                      <div className="tariff-label">Tranche</div>
                      <div className="tranche-value">
                        <i className="fa-solid fa-layer-group"></i>
                        {modalSessionDetail.tranche}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-info-block">
                <div className="block-header">
                  <i className="fa-solid fa-chart-simple"></i>
                  <span>Informations</span>
                </div>
                <div className="block-content info-grid-content">
                  <div className="info-item">
                    <div className="info-label">Niveau</div>
                    <div className={`niveau-badge-detail ${modalSessionDetail.niveau}`}>
                      {modalSessionDetail.niveau_display || "Non défini"}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Mode</div>
                    <div className="mode-badge-detail">
                      <i className={`fa-solid ${
                        modalSessionDetail.mode === 'presentiel' ? 'fa-chalkboard-user' :
                        modalSessionDetail.mode === 'ligne' ? 'fa-wifi' : 'fa-code-branch'
                      }`}></i>
                      {modalSessionDetail.mode_display}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="session-detail-footer">
              <button className="btn-close-detail" onClick={() => setModalSessionDetail(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Ajout */}
      {modalAjout && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => { if (!submitLoading) setModalAjout(false); })}>
          <div className="modal">
            <div className="modal-header"><h2><i className="fa-solid fa-plus"></i> Nouvelle Formation</h2><button className="modal-close" onClick={() => setModalAjout(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              {errServeurAjout && <div className="error-server">{errServeurAjout}</div>}
              <div className="form-grid">
                <div className="form-group full"><label>Intitulé <span className="req">*</span></label><input type="text" value={formAjout.intitule} onChange={e => { setFormAjout({ ...formAjout, intitule: e.target.value }); setErreursAjout({ ...erreursAjout, intitule: "" }); }} placeholder="Nom de la formation" /><small className="error-msg">{erreursAjout.intitule}</small></div>
                <div className="form-group full">
                  <label>Catégorie <span className="req">*</span></label>
                  <CategorieFormSelect
                    categories={categories}
                    value={formAjout.categorie}
                    onChange={val => { setFormAjout({ ...formAjout, categorie: val }); setErreursAjout({ ...erreursAjout, categorie: "" }); }}
                    error={erreursAjout.categorie}
                  />
                </div>
                <div className="form-group full"><label>Description</label><textarea value={formAjout.description} rows={3} onChange={e => setFormAjout({ ...formAjout, description: e.target.value })} placeholder="Description de la formation…" /></div>
                <div className="form-group full"><label>Objectifs pédagogiques</label><textarea value={formAjout.objectifs_pedagogiques} rows={3} onChange={e => setFormAjout({ ...formAjout, objectifs_pedagogiques: e.target.value })} placeholder="Un objectif par ligne…" /></div>
                <div className="form-group full"><label>Prérequis</label><textarea value={formAjout.prerequis} rows={2} onChange={e => setFormAjout({ ...formAjout, prerequis: e.target.value })} placeholder="Prérequis nécessaires…" /></div>
                <div className="form-group"><label>Durée (heures) <span className="req">*</span></label><input type="number" value={formAjout.duree_totale_heures} onChange={e => { setFormAjout({ ...formAjout, duree_totale_heures: e.target.value }); setErreursAjout({ ...erreursAjout, duree_totale_heures: "" }); }} /><small className="error-msg">{erreursAjout.duree_totale_heures}</small></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)}>Annuler</button>
              <button className="btn btn-save" onClick={handleAjout} disabled={submitLoading}>{submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-plus"></i> Ajouter</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Modification */}
      {modalModif && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => { if (!submitLoading) setModalModif(null); })}>
          <div className="modal">
            <div className="modal-header modif-header"><h2><i className="fa-solid fa-pen"></i> Modifier la Formation</h2><button className="modal-close" onClick={() => setModalModif(null)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              {errServeurModif && <div className="error-server">{errServeurModif}</div>}
              <div className="form-grid">
                <div className="form-group full"><label>Intitulé <span className="req">*</span></label><input type="text" value={formModif.intitule} onChange={e => { setFormModif({ ...formModif, intitule: e.target.value }); setErreursModif({ ...erreursModif, intitule: "" }); }} /><small className="error-msg">{erreursModif.intitule}</small></div>
                <div className="form-group full">
                  <label>Catégorie <span className="req">*</span></label>
                  <CategorieFormSelect
                    categories={categories}
                    value={formModif.categorie}
                    onChange={val => { setFormModif({ ...formModif, categorie: val }); setErreursModif({ ...erreursModif, categorie: "" }); }}
                    error={erreursModif.categorie}
                  />
                </div>
                <div className="form-group full"><label>Description</label><textarea value={formModif.description} rows={3} onChange={e => setFormModif({ ...formModif, description: e.target.value })} /></div>
                <div className="form-group full"><label>Objectifs pédagogiques</label><textarea value={formModif.objectifs_pedagogiques} rows={3} onChange={e => setFormModif({ ...formModif, objectifs_pedagogiques: e.target.value })} /></div>
                <div className="form-group full"><label>Prérequis</label><textarea value={formModif.prerequis} rows={2} onChange={e => setFormModif({ ...formModif, prerequis: e.target.value })} /></div>
                <div className="form-group"><label>Durée (heures) <span className="req">*</span></label><input type="number" value={formModif.duree_totale_heures} onChange={e => { setFormModif({ ...formModif, duree_totale_heures: e.target.value }); setErreursModif({ ...erreursModif, duree_totale_heures: "" }); }} /><small className="error-msg">{erreursModif.duree_totale_heures}</small></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)}>Annuler</button>
              <button className="btn btn-update" onClick={handleModif} disabled={submitLoading}>{submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-rotate"></i> Mettre à jour</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Suppression */}
      {modalSuppr && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => { if (!submitLoading) { setModalSuppr(null); setErrServeurSuppression(null); } })}>
          <div className="modal modal-suppr">
            {/* Icône corbeille */}
            <div className="modal-suppr-icon-wrap">
              <div className="modal-suppr-icon-circle">
                <i className="fa-solid fa-trash-can"></i>
              </div>
            </div>

            <div className="modal-body" style={{ textAlign: "center", paddingTop: "0" }}>
              <h2 className="modal-suppr-title-main">
                {errServeurSuppression?.type === 'has_sessions' ? "Impossible de supprimer" : "Supprimer la formation"}
              </h2>

              {/* Carte formation */}
              <div className="modal-suppr-card">
                <div className="modal-suppr-avatar">
                  {modalSuppr.intitule?.slice(0, 2).toUpperCase() || "F"}
                </div>
                <div className="modal-suppr-card-info">
                  <div className="modal-suppr-name">{modalSuppr.intitule}</div>
                  <div className="modal-suppr-sub">#{String(modalSuppr.id).padStart(3, "0")}</div>
                </div>
              </div>

              {/* Message d'alerte */}
              {errServeurSuppression?.type === 'has_sessions' ? (
                <div className="modal-suppr-warning modal-suppr-warning--error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>
                    Cette formation possède <strong>{errServeurSuppression.sessionsCount} session(s)</strong> associée(s). Veuillez d'abord supprimer ces sessions avant de supprimer la formation.
                  </span>
                </div>
              ) : (
                <div className="modal-suppr-warning">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>Cette action est <strong>irréversible</strong>. Toutes les données associées seront définitivement supprimées.</span>
                </div>
              )}
            </div>

            <div className="modal-footer modal-suppr-footer">
              <button className="btn btn-cancel btn-suppr-annuler" onClick={() => { setModalSuppr(null); setErrServeurSuppression(null); }} disabled={submitLoading}>
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              {errServeurSuppression?.type !== 'has_sessions' && (
                <button className="btn btn-danger btn-suppr-confirmer" onClick={handleSupprimer} disabled={submitLoading}>
                  {submitLoading
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</>
                    : <><i className="fa-solid fa-trash-can"></i> Confirmer</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Formations;