// src/pages/infoCentre/SessionFormation.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getSessions,
  getSessionsTerminees,
  ajouterSession,
  modifierSession,
  supprimerSession,
} from "../../services/infoCentre/session_formation_service";
import { getFormateurs } from "../../services/infoCentre/Formateurservice";
import api from "../../services/api";
import "../../styles/infoCentre/sessionformation.css";

/* ── Constantes ── */
const MODE_LABELS = { presentiel: "Présentiel", ligne: "En ligne", hybride: "Hybride" };
const NIVEAU_LABELS = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };

const EMPTY_FORM = {
  intitule_session: "",
  formation: "",
  formateurs: [],
  date_debut: "",
  date_fin: "",
  mode: "presentiel",
  niveau: "",
  prix_ht: "",
  prix_ttc: "",
  tranche: "",
};

/* ── Helper: format date ── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

/* ── Helper: obtenir la date minimale (aujourd'hui) au format YYYY-MM-DD ── */
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/* ── Fonction pour récupérer les formations (uniquement les actives) ── */
const getFormations = async () => {
  try {
    const response = await api.get('formations/');
    const d = response.data;
    let formationsList = [];
    
    if (Array.isArray(d)) formationsList = d;
    else if (d?.results && Array.isArray(d.results)) formationsList = d.results;
    else if (d?.data && Array.isArray(d.data)) formationsList = d.data;
    else formationsList = [];
    
    // ⚠️ FILTRE IMPORTANT : Ne garder que les formations avec status = 'active'
    return formationsList.filter(formation => formation.status === 'active');
  } catch (error) {
    console.error("Erreur chargement formations:", error.response?.status, error.message);
    return [];
  }
};

/* ── Niveau badge - MODIFIÉ : affiche "-" au lieu de "Non défini" ── */
function NiveauBadge({ niveau }) {
  const map = { debutant: "bdg-deb", intermediaire: "bdg-int", avance: "bdg-adv" };
  
  if (!niveau) {
    return <span className="badge bdg-none">-</span>;
  }
  
  return <span className={`badge ${map[niveau] || ""}`}>{NIVEAU_LABELS[niveau] || niveau}</span>;
}

/* ── Mode badge ── */
function ModeBadge({ mode }) {
  const map = { presentiel: "mode-presentiel", ligne: "mode-ligne", hybride: "mode-hybride" };
  const icons = { presentiel: "fa-chalkboard-teacher", ligne: "fa-wifi", hybride: "fa-code-branch" };
  return (
    <span className={`mode-badge ${map[mode] || ""}`}>
      <i className={`fa-solid ${icons[mode] || "fa-circle"}`}></i>
      {MODE_LABELS[mode] || mode}
    </span>
  );
}

/* ── Statut badge avec couleurs ── */
function StatutBadge({ statut }) {
  const icons = { 
    planifiee: "fa-calendar-day", 
    en_cours: "fa-play-circle", 
    terminee: "fa-check-circle" 
  };
  const labels = { 
    planifiee: "Planifiée", 
    en_cours: "En cours", 
    terminee: "Terminée" 
  };
  
  let statusClass = "status-badge";
  if (statut === 'planifiee') statusClass += " status-planifiee";
  else if (statut === 'en_cours') statusClass += " status-en-cours";
  else if (statut === 'terminee') statusClass += " status-terminee";
  
  return (
    <span className={statusClass}>
      <i className={`fa-solid ${icons[statut] || "fa-circle"}`}></i>
      {labels[statut] || statut}
    </span>
  );
}

/* ── Filter Dropdown (Formation / Niveau) ── */
function FilterDropdown({ icon, placeholder, items, selectedValue, onSelect, getLabel }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = items.filter((it) =>
    getLabel(it).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sf-filter-dropdown" ref={ref}>
      <button type="button" className="filter-dropdown-btn" onClick={() => setOpen(!open)}>
        <i className={`fa-solid ${icon}`}></i>
        <span className="filter-dropdown-text">{selectedValue ? getLabel(selectedValue) : placeholder}</span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} filter-dropdown-chevron`}></i>
      </button>
      {open && (
        <div className="filter-dropdown-panel">
          <div className="filter-dropdown-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="filter-dropdown-list">
            <div
              className={`filter-dropdown-item ${!selectedValue ? "active" : ""}`}
              onClick={() => { onSelect(""); setOpen(false); setSearch(""); }}
            >
              <i className="fa-solid fa-arrow-rotate-left"></i>
              <span>{placeholder}</span>
            </div>
            {filtered.length === 0 ? (
              <div className="filter-dropdown-empty">Aucun résultat</div>
            ) : (
              filtered.map((it, idx) => (
                <div
                  key={idx}
                  className={`filter-dropdown-item ${selectedValue === it ? "active" : ""}`}
                  onClick={() => { onSelect(it); setOpen(false); setSearch(""); }}
                >
                  <i className="fa-solid fa-circle-dot"></i>
                  <span>{getLabel(it)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Formation Form Select (with search, scrollable) ── */
function FormationFormSelect({ formations, value, onChange, hasError }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const selected = formations.find((f) => f.id === value);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = formations.filter((f) =>
    (f.intitule || f.intitule_formation || f.nom || "")?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sf-form-select" ref={ref}>
      <button
        type="button"
        className={`sf-select-btn ${hasError ? "error-border" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className={`sf-select-text ${!value ? "sf-select-placeholder" : ""}`}>
          {selected ? (selected.intitule || selected.intitule_formation || selected.nom) : "Sélectionner une formation"}
        </span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} sf-select-chevron`}></i>
      </button>
      {open && (
        <div className="sf-dropdown-panel">
          <div className="sf-dropdown-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button type="button" className="sf-search-clear" onClick={() => setSearch("")}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <div className="sf-dropdown-list">
            {filtered.length === 0 ? (
              <div className="sf-dropdown-empty">Aucune formation trouvée</div>
            ) : (
              filtered.map((f) => (
                <div
                  key={f.id}
                  className={`sf-dropdown-item ${value === f.id ? "active" : ""}`}
                  onClick={() => { onChange(f.id); setOpen(false); setSearch(""); }}
                >
                  <i className="fa-solid fa-book-open"></i>
                  <span>{f.intitule || f.intitule_formation || f.nom}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Formateurs Multiselect (scrollable, with search) avec spécialité ── */
function FormateursMultiSelect({ formateurs, value, onChange }) {
  const [search, setSearch] = useState("");
  
  const filtered = (formateurs || []).filter((f) =>
    `${f.prenom || ''} ${f.nom || ''} ${f.specialites || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    const newValue = value.includes(id) ? value.filter((x) => x !== id) : [...value, id];
    onChange(newValue);
  };

  if (!formateurs || formateurs.length === 0) {
    return (
      <div className="fmt-multiselect-wrap">
        <div className="fmt-multiselect-empty" style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
          <i className="fa-solid fa-spinner fa-spin"></i> Chargement des formateurs...
        </div>
      </div>
    );
  }

  return (
    <div className="fmt-multiselect-wrap">
      <div className="fmt-multiselect-search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="Rechercher un formateur (nom, prénom, spécialité)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="fmt-search-clear" onClick={() => setSearch("")}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
      <div className="fmt-multiselect-list">
        {filtered.length === 0 ? (
          <div className="fmt-multiselect-empty">Aucun formateur trouvé</div>
        ) : (
          filtered.map((f) => {
            const checked = value.includes(f.id);
            const nomComplet = `${f.prenom || ''} ${f.nom || ''}`.trim();
            const specialites = f.specialites || '';
            const specialiteDisplay = specialites.length > 35 ? specialites.substring(0, 35) + '...' : specialites;
            
            return (
              <div
                key={f.id}
                className={`fmt-multiselect-item ${checked ? "checked" : ""}`}
                onClick={() => toggle(f.id)}
              >
                <span className={`fmt-checkbox ${checked ? "checked" : ""}`}>
                  {checked && <i className="fa-solid fa-check" style={{ fontSize: "10px", color: "#fff" }}></i>}
                </span>
                <span className="fmt-name">
                  {nomComplet}
                  {specialites && (
                    <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "5px" }}>
                      ({specialiteDisplay})
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
function SessionFormation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("actives");
  const [sessions, setSessions] = useState([]);
  const [sessionsTerminees, setSessionsTerminees] = useState([]);
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const modalAjoutRef = useRef(null);
  const modalModifRef = useRef(null);

  // Filtres tab actives
  const [search, setSearch] = useState("");
  const [filterFormation, setFilterFormation] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtre par ID de formation (depuis l'URL)
  const [filterFormationById, setFilterFormationById] = useState(null);
  const [filterFormationByName, setFilterFormationByName] = useState("");

  // Filtres tab terminées
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormationTerm, setFilterFormationTerm] = useState("");
  const [filterNiveauTerm, setFilterNiveauTerm] = useState("");
  const [currentPageTerm, setCurrentPageTerm] = useState(1);

  // Sélections bulk
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Modales
  const [modalDetail, setModalDetail] = useState(null);
  const [modalAjout, setModalAjout] = useState(false);
  const [modalModif, setModalModif] = useState(null);
  const [modalSuppr, setModalSuppr] = useState(null);

  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);
  const [erreursAjout, setErreursAjout] = useState({});
  const [erreursModif, setErreursModif] = useState({});
  const [errServeurAjout, setErrServeurAjout] = useState("");
  const [errServeurModif, setErrServeurModif] = useState("");
  const [succesGlobal, setSuccesGlobal] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const itemsPerPage = 7;

  // Récupérer le paramètre formation_id de l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const formationId = params.get('formation_id');
    const formationName = params.get('formation_name');
    
    if (formationId) {
      setFilterFormationById(parseInt(formationId));
      setFilterFormationByName(formationName ? decodeURIComponent(formationName) : "");
      setActiveTab('actives');
      setCurrentPage(1);
    }
  }, [location.search]);

  const scrollToTopAjout = () => {
    setTimeout(() => {
      if (modalAjoutRef.current) {
        const modalBody = modalAjoutRef.current.querySelector('.modal-body');
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
      }
    }, 50);
  };

  const scrollToTopModif = () => {
    setTimeout(() => {
      if (modalModifRef.current) {
        const modalBody = modalModifRef.current.querySelector('.modal-body');
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
      }
    }, 50);
  };

  /* ── Fetch ── */
  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab === "terminees" && sessionsTerminees.length === 0) {
      fetchTerminees();
    }
    setSelectedIds([]);
  }, [activeTab]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [sessionsData, formationsData, formateursData] = await Promise.all([
        getSessions(),
        getFormations(),
        getFormateurs(),
      ]);

      let normalizedSessions = sessionsData;
      if (!Array.isArray(sessionsData)) {
        if (sessionsData?.results && Array.isArray(sessionsData.results)) {
          normalizedSessions = sessionsData.results;
        } else if (sessionsData?.data && Array.isArray(sessionsData.data)) {
          normalizedSessions = sessionsData.data;
        } else {
          normalizedSessions = [];
        }
      }

      setSessions(normalizedSessions);
      setFormations(Array.isArray(formationsData) ? formationsData : []);
      setFormateurs(Array.isArray(formateursData) ? formateursData : []);

      setCurrentPage(1);
    } catch (err) {
      console.error("Erreur fetchAll:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTerminees = async () => {
    try {
      const data = await getSessionsTerminees();
      let normalizedData = data;
      if (!Array.isArray(data)) {
        if (data?.results && Array.isArray(data.results)) {
          normalizedData = data.results;
        } else if (data?.data && Array.isArray(data.data)) {
          normalizedData = data.data;
        } else {
          normalizedData = [];
        }
      }
      setSessionsTerminees(normalizedData);
      setCurrentPageTerm(1);
    } catch (err) {
      console.error("Erreur fetchTerminees:", err);
    }
  };

  const afficherSucces = (msg) => {
    setSuccesGlobal(msg);
    setTimeout(() => setSuccesGlobal(""), 4000);
  };

  /* ── Filtres & Pagination (actives) ── */
  const filteredActives = sessions.filter((s) => {
    if (filterFormationById) {
      if (s.formation !== filterFormationById) return false;
    }
    
    const q = search.toLowerCase();
    const matchQ = s.intitule_session?.toLowerCase().includes(q) || s.formation_nom?.toLowerCase().includes(q);
    const matchFormation = !filterFormation || s.formation_nom === filterFormation;
    const matchNiveau = !filterNiveau || s.niveau === filterNiveau;
    return matchQ && matchFormation && matchNiveau;
  }).sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

  const totalPages = Math.max(1, Math.ceil(filteredActives.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const paginated = filteredActives.slice(startIdx, startIdx + itemsPerPage);

  /* ── Filtres & Pagination (terminées) ── */
  const filteredTerminees = sessionsTerminees.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchQ = s.intitule_session?.toLowerCase().includes(q) || s.formation_nom?.toLowerCase().includes(q);
    const matchFormation = !filterFormationTerm || s.formation_nom === filterFormationTerm;
    const matchNiveau = !filterNiveauTerm || s.niveau === filterNiveauTerm;
    return matchQ && matchFormation && matchNiveau;
  }).sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

  const totalPagesTerm = Math.max(1, Math.ceil(filteredTerminees.length / itemsPerPage));
  const safePageTerm = Math.min(currentPageTerm, totalPagesTerm);
  const startIdxTerm = (safePageTerm - 1) * itemsPerPage;
  const paginatedTerm = filteredTerminees.slice(startIdxTerm, startIdxTerm + itemsPerPage);

  /* ── Sélections bulk ── */
  const toggleSelect = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === paginated.length && paginated.length > 0 ? [] : paginated.map((s) => s.id));
  };
  const allChecked = paginated.length > 0 && selectedIds.length === paginated.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < paginated.length;

  const resetFilterById = () => {
    setFilterFormationById(null);
    setFilterFormationByName("");
    navigate('/sessions-formation', { replace: true });
  };

  /* ── Validation ── */
  const valider = (form) => {
    const errs = {};
    if (!form.intitule_session?.trim()) errs.intitule_session = "L'intitulé est requis";
    if (!form.formation) errs.formation = "La formation est requise";
    if (!form.date_debut) errs.date_debut = "La date de début est requise";
    if (!form.date_fin) errs.date_fin = "La date de fin est requise";
    if (form.date_debut && form.date_fin && form.date_debut >= form.date_fin)
      errs.date_fin = "La date de fin doit être postérieure à la date de début";
    if (!form.prix_ht || parseFloat(form.prix_ht) < 0) errs.prix_ht = "Le prix HT est requis";
    if (!form.prix_ttc || parseFloat(form.prix_ttc) < 0) errs.prix_ttc = "Le prix TTC est requis";
    if (form.prix_ht && form.prix_ttc && parseFloat(form.prix_ht) > parseFloat(form.prix_ttc))
      errs.prix_ttc = "Le prix TTC doit être ≥ au prix HT";
    if (!form.tranche || parseInt(form.tranche) < 1) errs.tranche = "Le nombre de tranches est requis (≥ 1)";
    return errs;
  };

  /* ── Ajouter ── */
  const handleAjout = async () => {
    const errs = valider(formAjout);
    if (Object.keys(errs).length > 0) { 
      setErreursAjout(errs);
      scrollToTopAjout();
      return; 
    }
    try {
      setSubmitLoading(true);
      setErreursAjout({});
      setErrServeurAjout("");
      await ajouterSession({
        ...formAjout,
        formation: parseInt(formAjout.formation),
        prix_ht: parseFloat(formAjout.prix_ht),
        prix_ttc: parseFloat(formAjout.prix_ttc),
        tranche: parseInt(formAjout.tranche),
        niveau: formAjout.niveau === "" ? null : formAjout.niveau,
      });
      await fetchAll();
      setModalAjout(false);
      setFormAjout(EMPTY_FORM);
      afficherSucces("Session ajoutée avec succès !");
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.dates) {
          setErreursAjout({ dates: errorData.dates });
          scrollToTopAjout();
        } else {
          setErrServeurAjout(Object.values(errorData).flat().join("\n"));
          scrollToTopAjout();
        }
      } else {
        setErrServeurAjout("Erreur serveur");
        scrollToTopAjout();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ── Modifier ── */
  const handleModif = async () => {
    if (!modalModif) return;
    const errs = valider(formModif);
    if (Object.keys(errs).length > 0) { 
      setErreursModif(errs);
      scrollToTopModif();
      return; 
    }
    try {
      setSubmitLoading(true);
      setErreursModif({});
      setErrServeurModif("");
      await modifierSession(modalModif.id, {
        ...formModif,
        formation: parseInt(formModif.formation),
        prix_ht: parseFloat(formModif.prix_ht),
        prix_ttc: parseFloat(formModif.prix_ttc),
        tranche: parseInt(formModif.tranche),
        niveau: formModif.niveau === "" ? null : formModif.niveau,
      });
      await fetchAll();
      if (modalModif.statut_session === "terminee") await fetchTerminees();
      setModalModif(null);
      afficherSucces("Session modifiée avec succès !");
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.dates) {
          setErreursModif({ dates: errorData.dates });
          scrollToTopModif();
        } else {
          setErrServeurModif(Object.values(errorData).flat().join("\n"));
          scrollToTopModif();
        }
      } else {
        setErrServeurModif("Erreur serveur");
        scrollToTopModif();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ── Supprimer ── */
  const handleSupprimer = async () => {
    if (!modalSuppr) return;
    try {
      setSubmitLoading(true);
      await supprimerSession(modalSuppr.id);
      await fetchAll();
      if (activeTab === "terminees") await fetchTerminees();
      setModalSuppr(null);
      afficherSucces("Session supprimée avec succès !");
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ── Open Modif ── */
  const openModif = (s) => {
    setFormModif({
      intitule_session: s.intitule_session || "",
      formation: s.formation || "",
      formateurs: Array.isArray(s.formateurs) ? s.formateurs : [],
      date_debut: s.date_debut || "",
      date_fin: s.date_fin || "",
      mode: s.mode || "presentiel",
      niveau: s.niveau || "",
      prix_ht: s.prix_ht || "",
      prix_ttc: s.prix_ttc || "",
      tranche: s.tranche || "",
    });
    setModalModif(s);
  };

  const handleOverlay = (e, fn) => { if (e.target === e.currentTarget) fn(); };

  const formationNoms = [...new Set(sessions.map((s) => s.formation_nom).filter(Boolean))];
  const formationNomsTerminees = [...new Set(sessionsTerminees.map((s) => s.formation_nom).filter(Boolean))];
  const niveaux = ["debutant", "intermediaire", "avance"];

  if (loading && !sessions.length) {
    return (
      <Layout>
        <div className="loading-container">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Chargement des sessions...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-calendar-days"></i> Gestion des Sessions de Formation
        </h1>
        <p className="page-sub">Suivi et planification des sessions du centre</p>
      </div>

      {succesGlobal && (
        <div className="success-message">
          <i className="fa-solid fa-check-circle"></i> {succesGlobal}
        </div>
      )}

      <div className="sessions-tabs">
        <button
          className={`tab-btn ${activeTab === "actives" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("actives")}
        >
          <i className="fa-solid fa-play-circle"></i>
          Sessions actives
          <span className="tab-count">{sessions.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "terminees" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("terminees")}
        >
          <i className="fa-solid fa-box-archive"></i>
          Sessions terminées
          <span className="tab-count">{sessionsTerminees.length}</span>
        </button>
      </div>

      {filterFormationById && (
        <div style={{
          background: "#E8F0FE",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderLeft: `4px solid #336699`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fa-solid fa-filter" style={{ color: "#336699", fontSize: "16px" }}></i>
            <span>
              <strong style={{ color: "#336699" }}>Filtre actif :</strong> Sessions de la formation 
              <strong style={{ color: "#1e293b", marginLeft: "5px" }}>"{filterFormationByName || `ID: ${filterFormationById}`}"</strong>
            </span>
          </div>
          <button
            onClick={resetFilterById}
            style={{
              background: "none",
              border: "none",
              color: "#336699",
              cursor: "pointer",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px"
            }}
          >
            <i className="fa-solid fa-times"></i>
            Réinitialiser
          </button>
        </div>
      )}

      {/* ═══════════════ ONGLET ACTIVES ═══════════════ */}
      {activeTab === "actives" && (
        <>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Rechercher une session..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <FilterDropdown
                icon="fa-book-open"
                placeholder="Toutes les formations"
                items={formationNoms}
                selectedValue={filterFormation}
                onSelect={(v) => { setFilterFormation(v); setCurrentPage(1); }}
                getLabel={(v) => v}
              />
              <FilterDropdown
                icon="fa-layer-group"
                placeholder="Tous les niveaux"
                items={niveaux}
                selectedValue={filterNiveau}
                onSelect={(v) => { setFilterNiveau(v); setCurrentPage(1); }}
                getLabel={(v) => NIVEAU_LABELS[v] || v}
              />
            </div>
            <div className="toolbar-right">
              <button
                className="btn btn-add"
                onClick={() => {
                  setFormAjout(EMPTY_FORM);
                  setErreursAjout({});
                  setErrServeurAjout("");
                  setModalAjout(true);
                }}
              >
                <i className="fa-solid fa-plus"></i> Nouvelle Session
              </button>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="bulk-action-bar bulk-bar-archive">
              <div className="bulk-action-info">
                <div className="bulk-count-badge">
                  <i className="fa-solid fa-check"></i>
                  <span>{selectedIds.length}</span>
                </div>
                <span className="bulk-label">session(s) sélectionnée(s)</span>
              </div>
              <div className="bulk-action-btns">
                <button
                  className="bulk-btn bulk-btn-suppr"
                  disabled={bulkDeleting}
                  onClick={async () => {
                    if (!window.confirm(`Supprimer ${selectedIds.length} session(s) ?`)) return;
                    setBulkDeleting(true);
                    await Promise.all(selectedIds.map((id) => supprimerSession(id)));
                    await fetchAll();
                    setSelectedIds([]);
                    afficherSucces(`${selectedIds.length} session(s) supprimée(s)`);
                    setBulkDeleting(false);
                  }}
                >
                  {bulkDeleting ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</> : <><i className="fa-solid fa-trash"></i> Supprimer</>}
                </button>
                <button className="bulk-btn bulk-btn-cancel" onClick={() => setSelectedIds([])}>
                  <i className="fa-solid fa-xmark"></i> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="table-card">
            <div className="table-top">
              Affichage de <strong>{paginated.length}</strong> sur <strong>{filteredActives.length}</strong> sessions
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "48px", textAlign: "center", paddingLeft: "16px" }}>
                      <label className="cb-wrap">
                        <input type="checkbox" className="cb-input" checked={allChecked}
                          ref={(el) => { if (el) el.indeterminate = someChecked; }}
                          onChange={toggleSelectAll} />
                        <span className="cb-box"></span>
                      </label>
                    </th>
                    <th>#</th>
                    <th>Intitulé</th>
                    <th>Formation</th>
                    <th>Niveau</th>
                    <th>Dates</th>
                    <th>Formateurs</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan="9" className="empty-cell">
                        <i className="fa-solid fa-inbox"></i>
                        <p>Aucune session trouvée</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((s, idx) => (
                      <tr key={s.id}>
                        <td style={{ textAlign: "center", paddingLeft: "16px" }}>
                          <label className="cb-wrap">
                            <input type="checkbox" className="cb-input"
                              checked={selectedIds.includes(s.id)}
                              onChange={() => toggleSelect(s.id)} />
                            <span className="cb-box"></span>
                          </label>
                        </td>
                        <td className="td-num">{startIdx + idx + 1}</td>
                        <td className="td-title">{s.intitule_session}</td>
                        <td><span className="cat-tag">{s.formation_nom}</span></td>
                        <td><NiveauBadge niveau={s.niveau} /></td>
                        <td style={{ fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>
                          {fmtDate(s.date_debut)} → {fmtDate(s.date_fin)}
                        </td>
                        <td>
                          {s.formateurs_detail && s.formateurs_detail.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {s.formateurs_detail.slice(0, 2).map((f) => (
                                <span key={f.id} style={{ fontSize: "12px", color: "#475569" }}>
                                  <i className="fa-solid fa-user" style={{ color: "#33CCFF", marginRight: "4px", fontSize: "10px" }}></i>
                                  {f.nom_complet || `${f.prenom || ''} ${f.nom || ''}`}
                                </span>
                              ))}
                              {s.formateurs_detail.length > 2 && (
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  +{s.formateurs_detail.length - 2} autre(s)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>
                          )}
                        </td>
                        <td><StatutBadge statut={s.statut_session} /></td>
                        <td className="td-actions">
                          <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(s)}>
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(s)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="act-btn act-suppr" title="Supprimer" onClick={() => setModalSuppr(s)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="pg-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                <i className="fa-solid fa-angle-left"></i>
              </button>
              <span className="pg-info">Page <strong>{safePage}</strong> sur <strong>{totalPages}</strong></span>
              <button className="pg-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ ONGLET TERMINÉES ═══════════════ */}
      {activeTab === "terminees" && (
        <>
          <div className="archive-info-banner">
            <i className="fa-solid fa-circle-info"></i>
            <span>
              Les sessions dont la date de fin est dépassée sont automatiquement archivées ici.
            </span>
          </div>

          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Rechercher dans les archives..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPageTerm(1); }}
                />
              </div>
              <FilterDropdown
                icon="fa-book-open"
                placeholder="Toutes les formations"
                items={formationNomsTerminees}
                selectedValue={filterFormationTerm}
                onSelect={(v) => { setFilterFormationTerm(v); setCurrentPageTerm(1); }}
                getLabel={(v) => v}
              />
              <FilterDropdown
                icon="fa-layer-group"
                placeholder="Tous les niveaux"
                items={niveaux}
                selectedValue={filterNiveauTerm}
                onSelect={(v) => { setFilterNiveauTerm(v); setCurrentPageTerm(1); }}
                getLabel={(v) => NIVEAU_LABELS[v] || v}
              />
            </div>
          </div>

          <div className="table-card table-card-archive">
            <div className="table-top">
              Affichage de <strong>{paginatedTerm.length}</strong> sur <strong>{filteredTerminees.length}</strong> sessions terminées
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Intitulé</th>
                    <th>Formation</th>
                    <th>Niveau</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Formateurs</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTerm.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan="9" className="empty-cell">
                        <i className="fa-solid fa-box-archive"></i>
                        <p>Aucune session terminée</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTerm.map((s, idx) => (
                      <tr key={s.id}>
                        <td className="td-num">{startIdxTerm + idx + 1}</td>
                        <td className="td-title" style={{ opacity: 0.75 }}>{s.intitule_session}</td>
                        <td><span className="cat-tag">{s.formation_nom}</span></td>
                        <td><NiveauBadge niveau={s.niveau} /></td>
                        <td style={{ fontSize: "12px", color: "#475569" }}>{fmtDate(s.date_debut)}</td>
                        <td style={{ fontSize: "12px", color: "#475569" }}>{fmtDate(s.date_fin)}</td>
                        <td>
                          {s.formateurs_detail && s.formateurs_detail.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {s.formateurs_detail.slice(0, 2).map((f) => (
                                <span key={f.id} style={{ fontSize: "12px", color: "#475569" }}>
                                  <i className="fa-solid fa-user" style={{ color: "#33CCFF", marginRight: "4px", fontSize: "10px" }}></i>
                                  {f.nom_complet || `${f.prenom || ''} ${f.nom || ''}`}
                                </span>
                              ))}
                              {s.formateurs_detail.length > 2 && (
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  +{s.formateurs_detail.length - 2} autre(s)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>
                          )}
                        </td>
                        <td><StatutBadge statut={s.statut_session} /></td>
                        <td className="td-actions">
                          <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(s)}>
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(s)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="act-btn act-suppr" title="Supprimer" onClick={() => setModalSuppr(s)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPagesTerm > 1 && (
            <div className="pagination">
              <button className="pg-btn" onClick={() => setCurrentPageTerm((p) => Math.max(1, p - 1))} disabled={safePageTerm === 1}>
                <i className="fa-solid fa-angle-left"></i>
              </button>
              <span className="pg-info">Page <strong>{safePageTerm}</strong> sur <strong>{totalPagesTerm}</strong></span>
              <button className="pg-btn" onClick={() => setCurrentPageTerm((p) => Math.min(totalPagesTerm, p + 1))} disabled={safePageTerm === totalPagesTerm}>
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ MODAL DÉTAIL ═══════════════ */}
      {modalDetail && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => setModalDetail(null))}>
          <div className="modal modal-wide modal-detail">
            <div className="modal-header detail-header">
              <div className="detail-header-left">
                <div className="detail-icon-wrap"><i className="fa-solid fa-calendar-days"></i></div>
                <div className="detail-header-info">
                  <h2>{modalDetail.intitule_session}</h2>
                  <div className="detail-badges">
                    <NiveauBadge niveau={modalDetail.niveau} />
                    <ModeBadge mode={modalDetail.mode} />
                    <StatutBadge statut={modalDetail.statut_session} />
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalDetail(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Formation info card */}
              <div className="formation-info-card">
                <div className="formation-info-card-title">
                  <i className="fa-solid fa-book-open"></i> Formation associée
                </div>
                <div className="formation-info-name">{modalDetail.formation_nom}</div>
                <div className="formation-info-meta">
                  {modalDetail.formation_categorie && (
                    <span className="cat-tag">{modalDetail.formation_categorie}</span>
                  )}
                  {modalDetail.formation_duree && (
                    <span className="fmt-tag"><i className="fa-solid fa-clock"></i> {modalDetail.formation_duree} heures</span>
                  )}
                </div>
                
                {modalDetail.formation_description && modalDetail.formation_description !== "" && (
                  <div className="formation-info-section">
                    <div className="section-title">
                      <i className="fa-solid fa-align-left"></i> Description
                    </div>
                    <div className="section-content">
                      {modalDetail.formation_description}
                    </div>
                  </div>
                )}
                
                {modalDetail.formation_objectifs && modalDetail.formation_objectifs !== "" && (
                  <div className="formation-info-section">
                    <div className="section-title">
                      <i className="fa-solid fa-bullseye"></i> Objectifs pédagogiques
                    </div>
                    <div className="section-content">
                      {modalDetail.formation_objectifs}
                    </div>
                  </div>
                )}
                
                {modalDetail.formation_prerequis && modalDetail.formation_prerequis !== "" && (
                  <div className="formation-info-section">
                    <div className="section-title">
                      <i className="fa-solid fa-circle-check"></i> Prérequis
                    </div>
                    <div className="section-content">
                      {modalDetail.formation_prerequis}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats financières */}
              <div className="detail-stats">
                <div className="stat-card sc-green">
                  <div className="sc-icon"><i className="fa-solid fa-money-bill-wave"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{parseFloat(modalDetail.prix_ht).toFixed(2)} DT</span>
                    <span className="sc-lbl">Prix HT</span>
                  </div>
                </div>
                <div className="stat-card sc-navy">
                  <div className="sc-icon"><i className="fa-solid fa-receipt"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{parseFloat(modalDetail.prix_ttc).toFixed(2)} DT</span>
                    <span className="sc-lbl">Prix TTC</span>
                  </div>
                </div>
                <div className="stat-card sc-blue">
                  <div className="sc-icon"><i className="fa-solid fa-layer-group"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.tranche}</span>
                    <span className="sc-lbl">Tranches</span>
                  </div>
                </div>
                <div className="stat-card sc-sand">
                  <div className="sc-icon"><i className="fa-solid fa-users"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.formateurs_detail?.length || 0}</span>
                    <span className="sc-lbl">Formateurs</span>
                  </div>
                </div>
              </div>

              {/* Dates de la session */}
              <div className="detail-dates">
                <div className="date-block">
                  <i className="fa-solid fa-calendar-plus"></i>
                  <div>
                    <span className="date-lbl">Date de début</span>
                    <span className="date-val">{fmtDate(modalDetail.date_debut)}</span>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-right date-arrow"></i>
                <div className="date-block">
                  <i className="fa-solid fa-calendar-check"></i>
                  <div>
                    <span className="date-lbl">Date de fin</span>
                    <span className="date-val">{fmtDate(modalDetail.date_fin)}</span>
                  </div>
                </div>
              </div>

              {/* SECTION FORMATEURS AVEC SCROLLBAR */}
              <div className="detail-sec">
                <div className="detail-sec-title">
                  <i className="fa-solid fa-chalkboard-user"></i> Formateurs assignés ({modalDetail.formateurs_detail?.length || 0})
                </div>
                <div className="fmt-detail-list">
                  {modalDetail.formateurs_detail && modalDetail.formateurs_detail.length > 0 ? (
                    modalDetail.formateurs_detail.map((f) => (
                      <div key={f.id} className="fmt-detail-item">
                        <div className="fmt-avatar">
                          {((f.prenom && f.prenom[0]) || (f.nom && f.nom[0]) || "?")}
                        </div>
                        <div className="fmt-detail-info">
                          <span className="fmt-name-detail">
                            {f.nom_complet || `${f.prenom || ''} ${f.nom || ''}`.trim() || "Sans nom"}
                          </span>
                          {f.specialites && f.specialites !== "" && (
                            <span className="fmt-specialite">{f.specialites}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="fmt-empty-message">
                      <i className="fa-solid fa-user-slash"></i>
                      <p>Aucun formateur assigné à cette session</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalDetail(null)}>Fermer</button>
              <button className="btn btn-update" onClick={() => {
                const session = modalDetail;
                setModalDetail(null);
                openModif(session);
              }}>
                <i className="fa-solid fa-pen"></i> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT - garder le reste inchangé */}
      {modalAjout && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => { if (!submitLoading) setModalAjout(false); })}>
          <div className="modal" ref={modalAjoutRef}>
            <div className="modal-header">
              <h2><i className="fa-solid fa-plus"></i> Nouvelle Session de Formation</h2>
              <button className="modal-close" onClick={() => setModalAjout(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              {errServeurAjout && (
                <div className="error-server">
                  <i className="fa-solid fa-circle-exclamation"></i> {errServeurAjout}
                </div>
              )}
              {erreursAjout.dates && (
                <div className="error-duration">
                  <i className="fa-solid fa-clock"></i>
                  <span>{erreursAjout.dates}</span>
                </div>
              )}
              <div className="form-grid">
                <div className="form-group full">
                  <label>Intitulé de la session <span className="req">*</span></label>
                  <input
                    type="text"
                    className={erreursAjout.intitule_session ? "input-error" : ""}
                    value={formAjout.intitule_session}
                    onChange={(e) => { setFormAjout({ ...formAjout, intitule_session: e.target.value }); setErreursAjout({ ...erreursAjout, intitule_session: "" }); }}
                    placeholder="Nom de la session"
                  />
                  <small className="error-msg">{erreursAjout.intitule_session}</small>
                </div>
                <div className="form-group full">
                  <label>Formation <span className="req">*</span></label>
                  <FormationFormSelect
                    formations={formations}
                    value={formAjout.formation}
                    onChange={(val) => { setFormAjout({ ...formAjout, formation: val }); setErreursAjout({ ...erreursAjout, formation: "" }); }}
                    hasError={!!erreursAjout.formation}
                  />
                  <small className="error-msg">{erreursAjout.formation}</small>
                </div>
                <div className="form-group full">
                  <label>Formateurs</label>
                  <FormateursMultiSelect
                    formateurs={formateurs}
                    value={formAjout.formateurs}
                    onChange={(val) => setFormAjout({ ...formAjout, formateurs: val })}
                  />
                </div>
                <div className="form-group">
                  <label>Date de début <span className="req">*</span></label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    className={erreursAjout.date_debut ? "input-error" : ""}
                    value={formAjout.date_debut}
                    onChange={(e) => { 
                      setFormAjout({ ...formAjout, date_debut: e.target.value });
                      setErreursAjout({ ...erreursAjout, date_debut: "", date_fin: "" });
                    }}
                  />
                  <small className="error-msg">{erreursAjout.date_debut}</small>
                </div>
                <div className="form-group">
                  <label>Date de fin <span className="req">*</span></label>
                  <input
                    type="date"
                    min={formAjout.date_debut || getTodayDate()}
                    className={erreursAjout.date_fin ? "input-error" : ""}
                    value={formAjout.date_fin}
                    onChange={(e) => { 
                      setFormAjout({ ...formAjout, date_fin: e.target.value });
                      setErreursAjout({ ...erreursAjout, date_fin: "" });
                    }}
                  />
                  <small className="error-msg">{erreursAjout.date_fin}</small>
                </div>
                <div className="form-group">
                  <label>Mode</label>
                  <select value={formAjout.mode} onChange={(e) => setFormAjout({ ...formAjout, mode: e.target.value })}>
                    <option value="presentiel">Présentiel</option>
                    <option value="ligne">En ligne</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Niveau (optionnel)</label>
                  <select value={formAjout.niveau || ""} onChange={(e) => setFormAjout({ ...formAjout, niveau: e.target.value })}>
                    <option value="">-- Aucun --</option>
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input
                    type="number" step="0.01" min="0"
                    className={erreursAjout.prix_ht ? "input-error" : ""}
                    value={formAjout.prix_ht}
                    onChange={(e) => { setFormAjout({ ...formAjout, prix_ht: e.target.value }); setErreursAjout({ ...erreursAjout, prix_ht: "", prix_ttc: "" }); }}
                  />
                  <small className="error-msg">{erreursAjout.prix_ht}</small>
                </div>
                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input
                    type="number" step="0.01" min="0"
                    className={erreursAjout.prix_ttc ? "input-error" : ""}
                    value={formAjout.prix_ttc}
                    onChange={(e) => { setFormAjout({ ...formAjout, prix_ttc: e.target.value }); setErreursAjout({ ...erreursAjout, prix_ttc: "" }); }}
                  />
                  <small className="error-msg">{erreursAjout.prix_ttc}</small>
                </div>
                <div className="form-group">
                  <label>Nombre de tranches <span className="req">*</span></label>
                  <input
                    type="number" min="1"
                    className={erreursAjout.tranche ? "input-error" : ""}
                    value={formAjout.tranche}
                    onChange={(e) => { setFormAjout({ ...formAjout, tranche: e.target.value }); setErreursAjout({ ...erreursAjout, tranche: "" }); }}
                  />
                  <small className="error-msg">{erreursAjout.tranche}</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)} disabled={submitLoading}>Annuler</button>
              <button className="btn btn-add" onClick={handleAjout} disabled={submitLoading}>
                {submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-plus"></i> Ajouter</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFICATION */}
      {modalModif && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => { if (!submitLoading) setModalModif(null); })}>
          <div className="modal" ref={modalModifRef}>
            <div className="modal-header modif-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier la Session</h2>
              <button className="modal-close" onClick={() => setModalModif(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              {errServeurModif && (
                <div className="error-server">
                  <i className="fa-solid fa-circle-exclamation"></i> {errServeurModif}
                </div>
              )}
              {erreursModif.dates && (
                <div className="error-duration">
                  <i className="fa-solid fa-clock"></i>
                  <span>{erreursModif.dates}</span>
                </div>
              )}
              <div className="form-grid">
                <div className="form-group full">
                  <label>Intitulé de la session <span className="req">*</span></label>
                  <input
                    type="text"
                    className={erreursModif.intitule_session ? "input-error" : ""}
                    value={formModif.intitule_session}
                    onChange={(e) => { setFormModif({ ...formModif, intitule_session: e.target.value }); setErreursModif({ ...erreursModif, intitule_session: "" }); }}
                  />
                  <small className="error-msg">{erreursModif.intitule_session}</small>
                </div>
                <div className="form-group full">
                  <label>Formation <span className="req">*</span></label>
                  <FormationFormSelect
                    formations={formations}
                    value={formModif.formation}
                    onChange={(val) => { setFormModif({ ...formModif, formation: val }); setErreursModif({ ...erreursModif, formation: "" }); }}
                    hasError={!!erreursModif.formation}
                  />
                  <small className="error-msg">{erreursModif.formation}</small>
                </div>
                <div className="form-group full">
                  <label>Formateurs</label>
                  <FormateursMultiSelect
                    formateurs={formateurs}
                    value={formModif.formateurs}
                    onChange={(val) => setFormModif({ ...formModif, formateurs: val })}
                  />
                </div>
                <div className="form-group">
                  <label>Date de début <span className="req">*</span></label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    className={erreursModif.date_debut ? "input-error" : ""}
                    value={formModif.date_debut}
                    onChange={(e) => { 
                      setFormModif({ ...formModif, date_debut: e.target.value });
                      setErreursModif({ ...erreursModif, date_debut: "", date_fin: "" });
                    }}
                  />
                  <small className="error-msg">{erreursModif.date_debut}</small>
                </div>
                <div className="form-group">
                  <label>Date de fin <span className="req">*</span></label>
                  <input
                    type="date"
                    min={formModif.date_debut || getTodayDate()}
                    className={erreursModif.date_fin ? "input-error" : ""}
                    value={formModif.date_fin}
                    onChange={(e) => { 
                      setFormModif({ ...formModif, date_fin: e.target.value });
                      setErreursModif({ ...erreursModif, date_fin: "" });
                    }}
                  />
                  <small className="error-msg">{erreursModif.date_fin}</small>
                </div>
                <div className="form-group">
                  <label>Mode</label>
                  <select value={formModif.mode} onChange={(e) => setFormModif({ ...formModif, mode: e.target.value })}>
                    <option value="presentiel">Présentiel</option>
                    <option value="ligne">En ligne</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Niveau (optionnel)</label>
                  <select value={formModif.niveau || ""} onChange={(e) => setFormModif({ ...formModif, niveau: e.target.value })}>
                    <option value="">-- Aucun --</option>
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prix HT (DT) <span className="req">*</span></label>
                  <input
                    type="number" step="0.01" min="0"
                    className={erreursModif.prix_ht ? "input-error" : ""}
                    value={formModif.prix_ht}
                    onChange={(e) => { setFormModif({ ...formModif, prix_ht: e.target.value }); setErreursModif({ ...erreursModif, prix_ht: "", prix_ttc: "" }); }}
                  />
                  <small className="error-msg">{erreursModif.prix_ht}</small>
                </div>
                <div className="form-group">
                  <label>Prix TTC (DT) <span className="req">*</span></label>
                  <input
                    type="number" step="0.01" min="0"
                    className={erreursModif.prix_ttc ? "input-error" : ""}
                    value={formModif.prix_ttc}
                    onChange={(e) => { setFormModif({ ...formModif, prix_ttc: e.target.value }); setErreursModif({ ...erreursModif, prix_ttc: "" }); }}
                  />
                  <small className="error-msg">{erreursModif.prix_ttc}</small>
                </div>
                <div className="form-group">
                  <label>Nombre de tranches <span className="req">*</span></label>
                  <input
                    type="number" min="1"
                    className={erreursModif.tranche ? "input-error" : ""}
                    value={formModif.tranche}
                    onChange={(e) => { setFormModif({ ...formModif, tranche: e.target.value }); setErreursModif({ ...erreursModif, tranche: "" }); }}
                  />
                  <small className="error-msg">{erreursModif.tranche}</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)} disabled={submitLoading}>Annuler</button>
              <button className="btn btn-update" onClick={handleModif} disabled={submitLoading}>
                {submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-rotate"></i> Mettre à jour</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {modalSuppr && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, () => { if (!submitLoading) setModalSuppr(null); })}>
          <div className="modal modal-suppr">
            {/* Icône corbeille */}
            <div className="modal-suppr-icon-wrap">
              <div className="modal-suppr-icon-circle">
                <i className="fa-solid fa-trash-can"></i>
              </div>
            </div>

            <div className="modal-body" style={{ textAlign: "center", paddingTop: "0" }}>
              <h2 className="modal-suppr-title-main">Supprimer la session</h2>

              {/* Carte session */}
              <div className="modal-suppr-card">
                <div className="modal-suppr-avatar">
                  {modalSuppr.intitule_session?.slice(0, 2).toUpperCase() || "SF"}
                </div>
                <div className="modal-suppr-card-info">
                  <div className="modal-suppr-name">{modalSuppr.intitule_session}</div>
                  <div className="modal-suppr-sub">#{String(modalSuppr.id).padStart(3, "0")}</div>
                </div>
              </div>

              {/* Avertissement */}
              <div className="modal-suppr-warning">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Cette action est <strong>irréversible</strong>. Toutes les données associées seront définitivement supprimées.</span>
              </div>
            </div>

            <div className="modal-footer modal-suppr-footer">
              <button className="btn btn-cancel btn-suppr-annuler" onClick={() => setModalSuppr(null)} disabled={submitLoading}>
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              <button className="btn btn-danger btn-suppr-confirmer" onClick={handleSupprimer} disabled={submitLoading}>
                {submitLoading
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</>
                  : <><i className="fa-solid fa-trash-can"></i> Confirmer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default SessionFormation;