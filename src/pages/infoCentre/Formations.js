// src/pages/infoCentre/Formations.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getFormations,
  getFormationsArchivees,
  ajouterFormation,
  modifierFormation,
  supprimerFormation,
  getFormateursDisponibles,
  archiverFormation,
  reactiverFormation,
} from "../../services/infoCentre/formationService";
import { getCategories } from "../../services/infoCentre/categorieService";
import {
  validateFormationForm,
  cleanFormData,
  getFormationStatus,
  ErrMsg,
  SuccesMsg,
  styleInputErreur,
} from "../../script/infoCentre/formationValidation";
import "../../styles/infoCentre/formations.css";

const NIVEAU_CLASS = {
  "Débutant": "bdg-deb",
  "Intermédiaire": "bdg-int",
  "Avancé": "bdg-adv",
};
const NIVEAU_MAPPING = {
  "Débutant": "debutant",
  "Intermédiaire": "intermediaire",
  "Avancé": "avance",
};
const FORMAT_MAPPING = {
  "Présentiel": "presentiel",
  "En ligne": "en_ligne",
  "Hybride": "hybride",
};
const EMPTY_FORM = {
  intitule: "", categorie: "", formateurs: [], description: "",
  objectifs_pedagogiques: "", prerequis: "", niveau: "", duree: "",
  format: "", date_debut: "", date_fin: "", prix_ht: "", prix_ttc: "",
  nb_tranches_paiement: "1", est_active: true,
};

/* ── Dropdown Niveau ── */
function NiveauFilterDropdown({ selectedValue, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const niveaux = ["Débutant", "Intermédiaire", "Avancé"];
  const icons = { "Débutant": "fa-seedling", "Intermédiaire": "fa-chart-line", "Avancé": "fa-star" };
  return (
    <div className="formation-filter-dropdown" ref={ref}>
      <button type="button" className="filter-dropdown-btn" onClick={() => setOpen(!open)}>
        <i className="fa-solid fa-layer-group"></i>
        <span className="filter-dropdown-text">{selectedValue || "Tous les niveaux"}</span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} filter-dropdown-chevron`}></i>
      </button>
      {open && (
        <div className="filter-dropdown-panel">
          <div className="filter-dropdown-list">
            <div className={`filter-dropdown-item ${!selectedValue ? "active" : ""}`} onClick={() => { onSelect(""); setOpen(false); }}>
              <i className="fa-solid fa-arrow-rotate-left"></i><span>Tous les niveaux</span>
            </div>
            {niveaux.map(n => (
              <div key={n} className={`filter-dropdown-item ${selectedValue === n ? "active" : ""}`} onClick={() => { onSelect(n); setOpen(false); }}>
                <i className={`fa-solid ${icons[n]}`}></i><span>{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

/* ── Sélecteur Catégorie pour formulaire (avec recherche et scroll) ── */
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
      <button 
        type="button" 
        className="categorie-select-btn" 
        onClick={() => setOpen(!open)}
      >
        <span className={`categorie-select-text ${!value ? "categorie-select-placeholder" : ""}`}>
          {selectedCat?.nom || "Sélectionner une catégorie"}
        </span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} categorie-select-chevron`}></i>
      </button>
      {open && (
        <div className="categorie-dropdown-panel">
          <div className="categorie-dropdown-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Rechercher une catégorie..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              autoFocus 
            />
            {search && (
              <button 
                type="button" 
                className="fmt-search-clear" 
                onClick={() => setSearch("")}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <div className="categorie-dropdown-list">
            {filtered.length === 0 ? (
              <div className="categorie-dropdown-empty">Aucune catégorie trouvée</div>
            ) : (
              filtered.map(cat => (
                <div 
                  key={cat.id} 
                  className={`categorie-dropdown-item ${value === cat.id ? "active" : ""}`} 
                  onClick={() => { 
                    onChange(cat.id); 
                    setOpen(false); 
                    setSearch(""); 
                  }}
                >
                  <i className="fa-solid fa-tag"></i>
                  <span>{cat.nom}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <ErrMsg msg={error} />}
    </div>
  );
}

/* ── FormateurMultiSelect (3 lignes visibles + scrollbar + recherche) ── */
function FormateurMultiSelect({ formateurs, selected, onChange }) {
  const [search, setSearch] = useState("");
  const filtered = formateurs.filter(f => `${f.prenom} ${f.nom}`.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(x => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="fmt-multiselect-wrap">
      <div className="fmt-multiselect-search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input 
          type="text" 
          placeholder="Rechercher un formateur..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        {search && (
          <button type="button" className="fmt-search-clear" onClick={() => setSearch("")}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
      <div className="fmt-multiselect-list" style={{ maxHeight: "132px", overflowY: "auto" }}>
        {formateurs.length === 0 ? (
          <div className="fmt-multiselect-empty">Aucun formateur disponible</div>
        ) : filtered.length === 0 ? (
          <div className="fmt-multiselect-empty">Aucun résultat pour « {search} »</div>
        ) : (
          <div>
            {filtered.map(f => {
              const isChecked = selected.includes(f.id);
              return (
                <div
                  key={f.id}
                  className={`fmt-multiselect-item${isChecked ? " checked" : ""}`}
                  onClick={() => toggle(f.id)}
                >
                  <span className={`fmt-checkbox${isChecked ? " checked" : ""}`}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className="fmt-name">{f.prenom} {f.nom}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FormateurDetailSection (4 lignes visibles + scrollbar + recherche) ── */
function FormateurDetailSection({ formateurs }) {
  const [search, setSearch] = useState("");
  const filtered = formateurs.filter(f => f.nom_complet.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="fmt-detail-sec-wrap">
      {/* Titre — même style que detail-sec-title */}
      <div className="fmt-detail-sec-header">
        <i className="fa-solid fa-chalkboard-user"></i>
        <span>Formateurs</span>
        <span className="fmt-detail-count-badge">{formateurs.length}</span>
      </div>

      {/* Barre de recherche */}
      {formateurs.length > 0 && (
        <div className="fmt-detail-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Rechercher un formateur..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search && (
            <button type="button" className="fmt-search-clear" onClick={() => setSearch("")}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      )}

      {/* Liste scrollable — pas de overflow:hidden ici */}
      <div className="fmt-detail-list-scrollable">
        {filtered.length === 0 ? (
          <div className="fmt-detail-empty">Aucun résultat</div>
        ) : (
          filtered.map((f, i) => (
            <div key={f.id || i} className="fmt-detail-item">
              <div className="fmt-detail-avatar">
                {f.nom_complet.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <span className="fmt-detail-name">{f.nom_complet}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── FormateurBadges ── */
function FormateurBadges({ noms }) {
  if (!noms || noms.length === 0) return <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
      {noms.map(f => (
        <span key={f.id} title={f.nom_complet} style={{ background: "#e8f0fe", color: "#336699", borderRadius: "20px", padding: "2px 8px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>
          {f.nom_complet}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════ */
function Formations() {
  const [activeTab, setActiveTab] = useState("actives");
  const [formations, setFormations] = useState([]);
  const [formationsArchivees, setFormationsArchivees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingArchivees, setLoadingArchivees] = useState(false);

  // Filtres actives
  const [search, setSearch] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtres archivées
  const [searchArch, setSearchArch] = useState("");
  const [filterNiveauArch, setFilterNiveauArch] = useState("");
  const [filterCatArch, setFilterCatArch] = useState("");
  const [currentPageArch, setCurrentPageArch] = useState(1);

  // ── Sélection groupée actives
  const [selectedActives, setSelectedActives] = useState([]);
  const [bulkArchiving, setBulkArchiving] = useState(false);

  // ── Sélection groupée archivées
  const [selectedArchivees, setSelectedArchivees] = useState([]);
  const [bulkReactivating, setBulkReactivating] = useState(false);

  const [modalDetail, setModalDetail] = useState(null);
  const [modalModif, setModalModif] = useState(null);
  const [modalAjout, setModalAjout] = useState(false);
  const [modalSuppr, setModalSuppr] = useState(null);

  const [formAjout, setFormAjout] = useState(EMPTY_FORM);
  const [formModif, setFormModif] = useState(EMPTY_FORM);
  const [erreursAjout, setErreursAjout] = useState({});
  const [errServeurAjout, setErrServeurAjout] = useState("");
  const [erreursModif, setErreursModif] = useState({});
  const [errServeurModif, setErrServeurModif] = useState("");
  const [errSuppr, setErrSuppr] = useState("");
  const [succesGlobal, setSuccesGlobal] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 7;

  const afficherSucces = (msg) => { setSuccesGlobal(msg); setTimeout(() => setSuccesGlobal(""), 4000); };

  useEffect(() => { fetchFormations(); fetchCategories(); fetchFormateurs(); }, []);

  useEffect(() => {
    if (activeTab === "archivees" && formationsArchivees.length === 0) fetchFormationsArchivees();
    setSelectedActives([]);
    setSelectedArchivees([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchFormations = async () => {
    try { setLoading(true); const r = await getFormations(); setFormations(r.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  const fetchFormationsArchivees = async () => {
    try { setLoadingArchivees(true); const r = await getFormationsArchivees(); setFormationsArchivees(r.data); }
    catch (err) { console.error(err); }
    finally { setLoadingArchivees(false); }
  };
  const fetchCategories = async () => { try { const r = await getCategories(); setCategories(r.data); } catch (err) { console.error(err); } };
  const fetchFormateurs = async () => { try { const r = await getFormateursDisponibles(); setFormateurs(r.data); } catch (err) { console.error(err); } };

  const categoriesActives = categories.filter(c => c.actif);

  const fmt = (f) => {
    const j = Math.round((new Date(f.date_fin) - new Date(f.date_debut)) / 86400000) + 1;
    return {
      ...f,
      duree: `${f.duree}h / ${j}j`,
      prixTTC: `${f.prix_ttc} DT`,
      prixHT: `${f.prix_ht} DT`,
      nb_tranches: f.nb_tranches_paiement || 1,
      categorie: f.categorie_nom || "Non catégorisé",
      categorie_id: f.categorie,
      niveau: Object.keys(NIVEAU_MAPPING).find(k => NIVEAU_MAPPING[k] === f.niveau) || f.niveau,
      format: Object.keys(FORMAT_MAPPING).find(k => FORMAT_MAPPING[k] === f.format) || f.format,
      dateDebut: new Date(f.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      dateFin: new Date(f.date_fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      status: getFormationStatus(f),
      formateurs_noms: f.formateurs_noms || [],
      formateurs_ids: f.formateurs || [],
    };
  };

  // Actives filtrées
  const filtered = formations.map(fmt).filter(f => {
    const q = search.toLowerCase();
    return (f.intitule?.toLowerCase().includes(q) || f.categorie?.toLowerCase().includes(q))
      && (!filterNiveau || f.niveau === filterNiveau)
      && (!filterCat || f.categorie === filterCat);
  }).sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Archivées filtrées
  const filteredArch = formationsArchivees.map(fmt).filter(f => {
    const q = searchArch.toLowerCase();
    return (f.intitule?.toLowerCase().includes(q) || f.categorie?.toLowerCase().includes(q))
      && (!filterNiveauArch || f.niveau === filterNiveauArch)
      && (!filterCatArch || f.categorie === filterCatArch);
  });

  const totalPagesArch = Math.ceil(filteredArch.length / itemsPerPage);
  const paginatedArch = filteredArch.slice((currentPageArch - 1) * itemsPerPage, currentPageArch * itemsPerPage);

  /* ── Sélection actives ── */
  const toggleSelectActive = (id) => setSelectedActives(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleSelectAllActives = () => {
    setSelectedActives(selectedActives.length === paginated.length && paginated.length > 0 ? [] : paginated.map(f => f.id));
  };
  const allActivesChecked = paginated.length > 0 && selectedActives.length === paginated.length;
  const someActivesChecked = selectedActives.length > 0 && selectedActives.length < paginated.length;

  /* ── Sélection archivées ── */
  const toggleSelectArchivee = (id) => setSelectedArchivees(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleSelectAllArchivees = () => {
    setSelectedArchivees(selectedArchivees.length === paginatedArch.length && paginatedArch.length > 0 ? [] : paginatedArch.map(f => f.id));
  };
  const allArchiveesChecked = paginatedArch.length > 0 && selectedArchivees.length === paginatedArch.length;
  const someArchiveesChecked = selectedArchivees.length > 0 && selectedArchivees.length < paginatedArch.length;

  /* ── Archivage en lot ── */
  const handleBulkArchiver = async () => {
    if (!selectedActives.length) return;
    try {
      setBulkArchiving(true);
      await Promise.all(selectedActives.map(id => archiverFormation(id)));
      await fetchFormations();
      setFormationsArchivees([]);
      const nb = selectedActives.length;
      setSelectedActives([]);
      afficherSucces(`${nb} formation${nb > 1 ? "s" : ""} archivée${nb > 1 ? "s" : ""} avec succès !`);
    } catch (err) { console.error(err); }
    finally { setBulkArchiving(false); }
  };

  /* ── Réactivation en lot ── */
  const handleBulkReactiver = async () => {
    if (!selectedArchivees.length) return;
    try {
      setBulkReactivating(true);
      await Promise.all(selectedArchivees.map(id => reactiverFormation(id)));
      await fetchFormationsArchivees();
      await fetchFormations();
      const nb = selectedArchivees.length;
      setSelectedArchivees([]);
      afficherSucces(`${nb} formation${nb > 1 ? "s" : ""} réactivée${nb > 1 ? "s" : ""} avec succès !`);
    } catch (err) { console.error(err); }
    finally { setBulkReactivating(false); }
  };

  /* ── Ajouter ── */
  const handleAjout = async () => {
    const val = validateFormationForm(formAjout, "ajout", { allowPastDates: false });
    const errsAjout = (val.errors || []).filter(err => !err.includes("niveau"));
    if (errsAjout.length > 0 || val.coherenceError) {
      const e = {};
      errsAjout.forEach(err => {
        if (err.includes("intitulé")) e.intitule = err;
        else if (err.includes("catégorie")) e.categorie = err;
        else if (err.includes("format")) e.format = err;
        else if (err.includes("objectifs")) e.objectifs_pedagogiques = err;
        else if (err.includes("durée")) e.duree = err;
        else if (err.includes("début")) e.date_debut = err;
        else if (err.includes("fin")) e.date_fin = err;
        else if (err.includes("HT")) e.prix_ht = err;
        else if (err.includes("TTC")) e.prix_ttc = err;
        else setErrServeurAjout(err);
      });
      if (val.coherenceError) e.duree_coherence = val.coherenceError;
      if (Object.keys(e).length) setErreursAjout(e);
      return;
    }
    try {
      setSubmitLoading(true); setErreursAjout({}); setErrServeurAjout("");
      await ajouterFormation(cleanFormData({ ...formAjout, niveau: formAjout.niveau ? (NIVEAU_MAPPING[formAjout.niveau] || formAjout.niveau) : null, format: FORMAT_MAPPING[formAjout.format] || formAjout.format }));
      await fetchFormations();
      setModalAjout(false); setFormAjout(EMPTY_FORM);
      afficherSucces("Formation ajoutée avec succès !");
    } catch (err) {
      setErrServeurAjout(err.response?.data ? Object.values(err.response.data).flat().join("\n") : "Erreur lors de l'ajout");
    } finally { setSubmitLoading(false); }
  };

  /* ── Modifier ── */
  const handleModif = async () => {
    if (!modalModif?.id) return;
    const val = validateFormationForm(formModif, "modif", { allowPastDates: true });
    if (!val.isValid) {
      const errsModif = (val.errors || []).filter(err => !err.includes("niveau"));
      const e = {};
      errsModif.forEach(err => {
        if (err.includes("intitulé")) e.intitule = err;
        else if (err.includes("catégorie")) e.categorie = err;
        else if (err.includes("format")) e.format = err;
        else if (err.includes("objectifs")) e.objectifs_pedagogiques = err;
        else if (err.includes("durée")) e.duree = err;
        else if (err.includes("début")) e.date_debut = err;
        else if (err.includes("fin")) e.date_fin = err;
        else if (err.includes("HT")) e.prix_ht = err;
        else if (err.includes("TTC")) e.prix_ttc = err;
        else setErrServeurModif(err);
      });
      if (val.coherenceError) e.duree_coherence = val.coherenceError;
      if (errsModif.length > 0 || val.coherenceError) setErreursModif(e);
      if (errsModif.length > 0 || val.coherenceError) return;
    }
    try {
      setSubmitLoading(true); setErreursModif({}); setErrServeurModif("");
      await modifierFormation(modalModif.id, cleanFormData({ ...formModif, niveau: formModif.niveau ? (NIVEAU_MAPPING[formModif.niveau] || formModif.niveau) : null, format: FORMAT_MAPPING[formModif.format] || formModif.format }));
      modalModif.est_active ? await fetchFormations() : await fetchFormationsArchivees();
      setModalModif(null); setFormModif(EMPTY_FORM);
      afficherSucces("Formation modifiée avec succès !");
    } catch (err) {
      setErrServeurModif(err.response?.data ? Object.values(err.response.data).flat().join("\n") : "Erreur lors de la modification");
    } finally { setSubmitLoading(false); }
  };

  /* ── Supprimer ── */
  const openSuppr = (f) => { setErrSuppr(""); setModalSuppr(f); };
  const handleSupprimer = async () => {
    if (!modalSuppr) return;
    try {
      setSubmitLoading(true); setErrSuppr("");
      await supprimerFormation(modalSuppr.id);
      modalSuppr.est_active ? await fetchFormations() : await fetchFormationsArchivees();
      setModalSuppr(null);
      afficherSucces("Formation supprimée avec succès !");
    } catch { setErrSuppr("Erreur lors de la suppression"); }
    finally { setSubmitLoading(false); }
  };

  /* ── Ouvrir modifier ── */
  const openModif = (f) => {
    const catId = categories.find(c => c.nom === f.categorie)?.id || f.categorie_id || "";
    setFormModif({
      intitule: f.intitule, categorie: catId, formateurs: f.formateurs_ids || [],
      description: f.description || "", objectifs_pedagogiques: f.objectifs_pedagogiques || "",
      prerequis: f.prerequis || "", duree: f.duree?.split("h")[0]?.trim() || "",
      niveau: f.niveau, format: f.format,
      date_debut: f.date_debut?.split("T")[0] || "", date_fin: f.date_fin?.split("T")[0] || "",
      prix_ht: f.prix_ht || "", prix_ttc: f.prix_ttc || "",
      nb_tranches_paiement: f.nb_tranches_paiement || "1",
      est_active: f.est_active !== undefined ? f.est_active : true,
    });
    setErreursModif({}); setErrServeurModif(""); setModalModif(f);
  };

  const handleOverlay = (e, fn) => { if (e.target === e.currentTarget) fn(); };

  const rowClass = (f) => ({ past: "row-past", ongoing: "row-ongoing", upcoming: "row-upcoming" }[f.status] || "");

  const initiales = (n) => n ? n.slice(0, 2).toUpperCase() : "??";
  const catColor = (n) => ({ "Marketing digital": "#33CCFF", "Informatique": "#336699", "IA": "#7C3AED", "Design": "#EC4899", "Langues": "#059669", "Data": "#FFCC33", "Soft skills": "#CCCC99" }[n] || "#94A3B8");

  if (loading && !formations.length) {
    return <Layout><div className="loading-container"><i className="fa-solid fa-spinner fa-spin"></i><p>Chargement des formations...</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title"><i className="fa-solid fa-book-open"></i> Gestion des Formations</h1>
        <p className="page-sub">Liste et gestion de toutes les formations du centre</p>
      </div>

      {succesGlobal && <SuccesMsg msg={succesGlobal} />}

      {/* ══ ONGLETS ══ */}
      <div className="formations-tabs">
        <button className={`tab-btn${activeTab === "actives" ? " tab-active" : ""}`} onClick={() => setActiveTab("actives")}>
          <i className="fa-solid fa-check-circle"></i>
          Formations actives
          <span className="tab-count tab-count-active">{formations.length}</span>
        </button>
        <button className={`tab-btn${activeTab === "archivees" ? " tab-active tab-archive-active" : ""}`} onClick={() => setActiveTab("archivees")}>
          <i className="fa-solid fa-box-archive"></i>
          Formations archivées
          {formationsArchivees.length > 0 && <span className="tab-count tab-count-archive">{formationsArchivees.length}</span>}
        </button>
      </div>

      {/* ══════════════════════════════════════
          ONGLET ACTIVES
      ══════════════════════════════════════ */}
      {activeTab === "actives" && (
        <>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Rechercher une formation…" value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
              </div>
              <NiveauFilterDropdown selectedValue={filterNiveau} onSelect={v => { setFilterNiveau(v); setCurrentPage(1); }} />
              <CategorieFilterDropdown categories={categoriesActives} selectedValue={filterCat} onSelect={v => { setFilterCat(v); setCurrentPage(1); }} />
            </div>
            <div className="toolbar-right">
              <button className="btn btn-cat" onClick={() => navigate("/categories")}><i className="fa-solid fa-tags"></i> Catégories</button>
              <button className="btn btn-add" onClick={() => { setFormAjout(EMPTY_FORM); setErreursAjout({}); setErrServeurAjout(""); setModalAjout(true); }}>
                <i className="fa-solid fa-plus"></i> Nouvelle Formation
              </button>
            </div>
          </div>

          {/* ── Barre d'actions groupées — Archive ── */}
          {selectedActives.length > 0 && (
            <div className="bulk-action-bar bulk-bar-archive">
              <div className="bulk-action-info">
                <div className="bulk-count-badge">
                  <i className="fa-solid fa-check"></i>
                  <span>{selectedActives.length}</span>
                </div>
                <span className="bulk-label">
                  formation{selectedActives.length > 1 ? "s" : ""} sélectionnée{selectedActives.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="bulk-action-btns">
                <button className="bulk-btn bulk-btn-archive" onClick={handleBulkArchiver} disabled={bulkArchiving}>
                  {bulkArchiving
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Archivage en cours…</>
                    : <><i className="fa-solid fa-box-archive"></i> Archiver la sélection ({selectedActives.length})</>}
                </button>
                <button className="bulk-btn bulk-btn-cancel" onClick={() => setSelectedActives([])}>
                  <i className="fa-solid fa-xmark"></i> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="table-card">
            <div className="table-top">
              Affichage de <strong>{paginated.length}</strong> sur <strong>{filtered.length}</strong> formations
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "48px", textAlign: "center", paddingLeft: "16px" }}>
                      <label className="cb-wrap">
                        <input type="checkbox" className="cb-input" checked={allActivesChecked}
                          ref={el => { if (el) el.indeterminate = someActivesChecked; }}
                          onChange={toggleSelectAllActives} />
                        <span className="cb-box"></span>
                      </label>
                    </th>
                    <th>#</th>
                    <th>Intitulé</th>
                    <th>Catégorie</th>
                    <th>Formateurs</th>
                    <th>Niveau</th>
                    <th>Durée</th>
                    <th>Prix TTC</th>
                    <th>Prix HT</th>
                    <th>Tranches</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan="12" style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                      <i className="fa-solid fa-inbox" style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}></i>
                      Aucune formation active trouvée
                    </td></tr>
                  ) : paginated.map((f, i) => {
                    const sel = selectedActives.includes(f.id);
                    return (
                      <tr key={f.id} className={`${rowClass(f)}${sel ? " row-selected" : ""}`}>
                        <td style={{ textAlign: "center", paddingLeft: "16px" }}>
                          <label className="cb-wrap">
                            <input type="checkbox" className="cb-input" checked={sel} onChange={() => toggleSelectActive(f.id)} />
                            <span className="cb-box"></span>
                          </label>
                        </td>
                        <td className="td-num">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                        <td className="td-title">{f.intitule}</td>
                        <td><span className="cat-tag">{f.categorie}</span></td>
                        <td><FormateurBadges noms={f.formateurs_noms} /></td>
                        <td>{f.niveau ? <span className={`badge ${NIVEAU_CLASS[f.niveau]}`}>{f.niveau}</span> : <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>}</td>
                        <td className="td-dur">{f.duree}</td>
                        <td className="td-ttc">{f.prixTTC}</td>
                        <td className="td-ht">{f.prixHT}</td>
                        <td className="td-tranches"><span className="tranche-badge">{f.nb_tranches || 1} tranche{f.nb_tranches > 1 ? "s" : ""}</span></td>
                        <td><span className="status-badge active"><i className="fa-solid fa-check-circle"></i> Active</span></td>
                        <td className="td-actions">
                          <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(f)}><i className="fa-solid fa-eye"></i></button>
                          <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(f)}><i className="fa-solid fa-pen"></i></button>
                          <button className="act-btn act-suppr" title="Supprimer" onClick={() => openSuppr(f)}><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="pg-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><i className="fa-solid fa-chevron-left"></i></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pg-num${p === currentPage ? " active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
                ))}
                <button className="pg-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><i className="fa-solid fa-chevron-right"></i></button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          ONGLET ARCHIVÉES
      ══════════════════════════════════════ */}
      {activeTab === "archivees" && (
        <>
          <div className="archive-info-banner">
            <i className="fa-solid fa-circle-info"></i>
            <span>Les formations archivées ne sont plus visibles dans la liste active. Vous pouvez les <strong>réactiver</strong> à tout moment.</span>
          </div>

          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Rechercher dans les archives…" value={searchArch}
                  onChange={e => { setSearchArch(e.target.value); setCurrentPageArch(1); }} />
              </div>
              <NiveauFilterDropdown selectedValue={filterNiveauArch} onSelect={v => { setFilterNiveauArch(v); setCurrentPageArch(1); }} />
              <CategorieFilterDropdown categories={categoriesActives} selectedValue={filterCatArch} onSelect={v => { setFilterCatArch(v); setCurrentPageArch(1); }} />
            </div>
          </div>

          {/* ── Barre d'actions groupées — Réactiver ── */}
          {selectedArchivees.length > 0 && (
            <div className="bulk-action-bar bulk-bar-reactiver">
              <div className="bulk-action-info">
                <div className="bulk-count-badge bulk-count-green">
                  <i className="fa-solid fa-check"></i>
                  <span>{selectedArchivees.length}</span>
                </div>
                <span className="bulk-label">
                  formation{selectedArchivees.length > 1 ? "s" : ""} sélectionnée{selectedArchivees.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="bulk-action-btns">
                <button className="bulk-btn bulk-btn-reactiver" onClick={handleBulkReactiver} disabled={bulkReactivating}>
                  {bulkReactivating
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Réactivation en cours…</>
                    : <><i className="fa-solid fa-rotate-left"></i> Réactiver la sélection ({selectedArchivees.length})</>}
                </button>
                <button className="bulk-btn bulk-btn-cancel" onClick={() => setSelectedArchivees([])}>
                  <i className="fa-solid fa-xmark"></i> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="table-card table-card-archive">
            <div className="table-top">
              {loadingArchivees
                ? <span><i className="fa-solid fa-spinner fa-spin"></i> Chargement…</span>
                : <>Affichage de <strong>{paginatedArch.length}</strong> sur <strong>{filteredArch.length}</strong> formations archivées</>}
            </div>
            <div className="table-wrap">
              <table>
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
                    <th>Formateurs</th>
                    <th>Niveau</th>
                    <th>Durée</th>
                    <th>Prix TTC</th>
                    <th>Prix HT</th>
                    <th>Tranches</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingArchivees ? (
                    <tr><td colSpan="12" style={{ textAlign: "center", padding: "48px" }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", color: "#94a3b8" }}></i></td></tr>
                  ) : paginatedArch.length === 0 ? (
                    <tr><td colSpan="12" style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                      <i className="fa-solid fa-box-archive" style={{ fontSize: "32px", display: "block", marginBottom: "8px", color: "#f59e0b" }}></i>
                      Aucune formation archivée
                    </td></tr>
                  ) : paginatedArch.map((f, i) => {
                    const sel = selectedArchivees.includes(f.id);
                    return (
                      <tr key={f.id} className={`row-archived${sel ? " row-selected-arch" : ""}`}>
                        <td style={{ textAlign: "center", paddingLeft: "16px" }}>
                          <label className="cb-wrap">
                            <input type="checkbox" className="cb-input" checked={sel} onChange={() => toggleSelectArchivee(f.id)} />
                            <span className="cb-box cb-box-arch"></span>
                          </label>
                        </td>
                        <td className="td-num">{(currentPageArch - 1) * itemsPerPage + i + 1}</td>
                        <td className="td-title" style={{ opacity: 0.72 }}>{f.intitule}</td>
                        <td><span className="cat-tag">{f.categorie}</span></td>
                        <td><FormateurBadges noms={f.formateurs_noms} /></td>
                        <td>{f.niveau ? <span className={`badge ${NIVEAU_CLASS[f.niveau]}`}>{f.niveau}</span> : <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>}</td>
                        <td className="td-dur">{f.duree}</td>
                        <td className="td-ttc">{f.prixTTC}</td>
                        <td className="td-ht">{f.prixHT}</td>
                        <td className="td-tranches"><span className="tranche-badge">{f.nb_tranches || 1} tranche{f.nb_tranches > 1 ? "s" : ""}</span></td>
                        <td><span className="status-badge inactive"><i className="fa-solid fa-box-archive"></i> Archivée</span></td>
                        <td className="td-actions">
                          <button className="act-btn act-detail" title="Détail" onClick={() => setModalDetail(f)}><i className="fa-solid fa-eye"></i></button>
                          <button className="act-btn act-modif" title="Modifier" onClick={() => openModif(f)}><i className="fa-solid fa-pen"></i></button>
                          <button className="act-btn act-suppr" title="Supprimer définitivement" onClick={() => openSuppr(f)}><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPagesArch > 1 && (
              <div className="pagination">
                <button className="pg-btn" onClick={() => setCurrentPageArch(p => p - 1)} disabled={currentPageArch === 1}><i className="fa-solid fa-chevron-left"></i></button>
                {Array.from({ length: totalPagesArch }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pg-num${p === currentPageArch ? " active" : ""}`} onClick={() => setCurrentPageArch(p)}>{p}</button>
                ))}
                <button className="pg-btn" onClick={() => setCurrentPageArch(p => p + 1)} disabled={currentPageArch === totalPagesArch}><i className="fa-solid fa-chevron-right"></i></button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ MODALE DÉTAIL ══ */}
      {modalDetail && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => setModalDetail(null))}>
          <div className="modal modal-wide">
            <div className="modal-header detail-header">
              <div className="detail-header-left">
                <div className="detail-icon-wrap"><i className="fa-solid fa-book-open"></i></div>
                <div className="detail-header-info">
                  <h2>{modalDetail.intitule}</h2>
                  <div className="detail-badges">
                    <span className="cat-tag">{modalDetail.categorie}</span>
                    {modalDetail.niveau && <span className={`badge ${NIVEAU_CLASS[modalDetail.niveau]}`}>{modalDetail.niveau}</span>}
                    <span className="fmt-tag"><i className="fa-solid fa-location-dot"></i> {modalDetail.format}</span>
                    {!modalDetail.est_active && <span className="status-badge inactive" style={{ fontSize: "11px", padding: "2px 8px" }}><i className="fa-solid fa-box-archive"></i> Archivée</span>}
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalDetail(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="detail-stats">
                <div className="stat-card sc-blue"><div className="sc-icon"><i className="fa-solid fa-clock"></i></div><div className="sc-info"><span className="sc-val">{modalDetail.duree.split("/")[0].trim()}</span><span className="sc-lbl">Durée totale</span></div></div>
                <div className="stat-card sc-navy"><div className="sc-icon"><i className="fa-solid fa-calendar-days"></i></div><div className="sc-info"><span className="sc-val">{Math.round((new Date(modalDetail.date_fin) - new Date(modalDetail.date_debut)) / 86400000) + 1}j</span><span className="sc-lbl">En jours</span></div></div>
                <div className="stat-card sc-green"><div className="sc-icon"><i className="fa-solid fa-tag"></i></div><div className="sc-info"><span className="sc-val">{modalDetail.prixTTC}</span><span className="sc-lbl">Prix TTC</span></div></div>
                <div className="stat-card sc-sand"><div className="sc-icon"><i className="fa-solid fa-receipt"></i></div><div className="sc-info"><span className="sc-val">{modalDetail.prixHT}</span><span className="sc-lbl">Prix HT</span></div></div>
              </div>
              <div className="detail-dates">
                <div className="date-block"><i className="fa-regular fa-calendar-check"></i><div><span className="date-lbl">Date de début</span><span className="date-val">{modalDetail.dateDebut}</span></div></div>
                <div className="date-arrow"><i className="fa-solid fa-arrow-right-long"></i></div>
                <div className="date-block"><i className="fa-regular fa-calendar-xmark"></i><div><span className="date-lbl">Date de fin</span><span className="date-val">{modalDetail.dateFin}</span></div></div>
              </div>
              {modalDetail.formateurs_noms?.length > 0 && <FormateurDetailSection formateurs={modalDetail.formateurs_noms} />}
              <div className="detail-sections" style={{ marginTop: "14px" }}>
                <div className="detail-sec"><div className="detail-sec-title"><i className="fa-solid fa-align-left"></i> Description détaillée</div><p className="detail-sec-text">{modalDetail.description}</p></div>
                <div className="detail-sec"><div className="detail-sec-title"><i className="fa-solid fa-bullseye"></i> Objectifs pédagogiques</div>
                  <ul className="detail-list">{modalDetail.objectifs_pedagogiques?.split("\n").filter(o => o.trim()).map((o, i) => <li key={i}>{o}</li>)}</ul>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalDetail(null)}>Fermer</button>
              <button className="btn btn-update" onClick={() => { setModalDetail(null); openModif(modalDetail); }}><i className="fa-solid fa-pen"></i> Modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODALE AJOUTER ══ */}
      {modalAjout && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => { if (!submitLoading) setModalAjout(false); })}>
          <div className="modal">
            <div className="modal-header"><h2><i className="fa-solid fa-plus"></i> Nouvelle Formation</h2><button className="modal-close" onClick={() => setModalAjout(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              {errServeurAjout && <div style={{ background: "#fff5f5", border: "1.5px solid #ef4444", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", marginBottom: "16px", display: "flex", gap: "8px" }}><i className="fa-solid fa-circle-xmark" style={{ marginTop: "2px" }}></i><span>{errServeurAjout}</span></div>}
              <div className="form-grid">
                <div className="form-group full"><label>Intitulé <span className="req">*</span></label><input type="text" value={formAjout.intitule} style={erreursAjout.intitule ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, intitule: e.target.value }); setErreursAjout({ ...erreursAjout, intitule: "" }); }} placeholder="Nom de la formation" /><ErrMsg msg={erreursAjout.intitule} /></div>
                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <CategorieFormSelect 
                    categories={categoriesActives} 
                    value={formAjout.categorie} 
                    onChange={val => { setFormAjout({ ...formAjout, categorie: val }); setErreursAjout({ ...erreursAjout, categorie: "" }); }}
                    error={erreursAjout.categorie}
                  />
                </div>
                <div className="form-group"><label>Niveau</label><select value={formAjout.niveau} onChange={e => setFormAjout({ ...formAjout, niveau: e.target.value })}><option value="">-- Aucun --</option><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option></select></div>
                <div className="form-group full"><label>Formateurs</label><FormateurMultiSelect formateurs={formateurs} selected={formAjout.formateurs} onChange={ids => setFormAjout({ ...formAjout, formateurs: ids })} /></div>
                <div className="form-group full"><label>Description</label><textarea value={formAjout.description} rows={3} onChange={e => setFormAjout({ ...formAjout, description: e.target.value })} placeholder="Description de la formation…" /></div>
                <div className="form-group full"><label>Objectifs pédagogiques <span className="req">*</span></label><textarea value={formAjout.objectifs_pedagogiques} rows={3} style={erreursAjout.objectifs_pedagogiques ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, objectifs_pedagogiques: e.target.value }); setErreursAjout({ ...erreursAjout, objectifs_pedagogiques: "" }); }} placeholder="Un objectif par ligne…" /><ErrMsg msg={erreursAjout.objectifs_pedagogiques} /></div>
                <div className="form-group full"><label>Prérequis</label><textarea value={formAjout.prerequis} rows={2} onChange={e => setFormAjout({ ...formAjout, prerequis: e.target.value })} placeholder="Prérequis nécessaires…" /></div>
                <div className="form-group"><label>Durée (heures) <span className="req">*</span></label><input type="number" value={formAjout.duree} style={erreursAjout.duree ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, duree: e.target.value }); setErreursAjout({ ...erreursAjout, duree: "", duree_coherence: "" }); }} /><ErrMsg msg={erreursAjout.duree} /></div>
                <div className="form-group"><label>Format <span className="req">*</span></label><select value={formAjout.format} style={erreursAjout.format ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, format: e.target.value }); setErreursAjout({ ...erreursAjout, format: "" }); }}><option value="">-- Choisir --</option><option>Présentiel</option><option>En ligne</option><option>Hybride</option></select><ErrMsg msg={erreursAjout.format} /></div>
                {erreursAjout.duree_coherence && <div style={{ gridColumn: "1/-1" }}><ErrMsg msg={erreursAjout.duree_coherence} /></div>}
                <div className="form-group"><label>Date de début</label><input type="date" value={formAjout.date_debut} style={erreursAjout.date_debut ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, date_debut: e.target.value }); setErreursAjout({ ...erreursAjout, date_debut: "", duree_coherence: "" }); }} /><ErrMsg msg={erreursAjout.date_debut} /></div>
                <div className="form-group"><label>Date de fin</label><input type="date" value={formAjout.date_fin} style={erreursAjout.date_fin ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, date_fin: e.target.value }); setErreursAjout({ ...erreursAjout, date_fin: "", duree_coherence: "" }); }} /><ErrMsg msg={erreursAjout.date_fin} /></div>
                <div className="form-group"><label>Prix HT (DT) <span className="req">*</span></label><input type="number" step="0.01" value={formAjout.prix_ht} style={erreursAjout.prix_ht ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, prix_ht: e.target.value }); setErreursAjout({ ...erreursAjout, prix_ht: "" }); }} /><ErrMsg msg={erreursAjout.prix_ht} /></div>
                <div className="form-group"><label>Prix TTC (DT) <span className="req">*</span></label><input type="number" step="0.01" value={formAjout.prix_ttc} style={erreursAjout.prix_ttc ? styleInputErreur : {}} onChange={e => { setFormAjout({ ...formAjout, prix_ttc: e.target.value }); setErreursAjout({ ...erreursAjout, prix_ttc: "" }); }} /><ErrMsg msg={erreursAjout.prix_ttc} /></div>
                <div className="form-group"><label>Tranches de paiement</label><input type="number" min="1" max="12" value={formAjout.nb_tranches_paiement} onChange={e => setFormAjout({ ...formAjout, nb_tranches_paiement: e.target.value })} /><small className="field-hint">1 = paiement unique</small></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)}>Annuler</button>
              <button className="btn btn-save" onClick={handleAjout} disabled={submitLoading}>{submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-plus"></i> Ajouter</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODALE MODIFIER ══ */}
      {modalModif && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => { if (!submitLoading) setModalModif(null); })}>
          <div className="modal">
            <div className="modal-header modif-header"><h2><i className="fa-solid fa-pen"></i> Modifier la Formation</h2><button className="modal-close" onClick={() => setModalModif(null)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              {errServeurModif && <div style={{ background: "#fff5f5", border: "1.5px solid #ef4444", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", marginBottom: "16px", display: "flex", gap: "8px" }}><i className="fa-solid fa-circle-xmark" style={{ marginTop: "2px" }}></i><span>{errServeurModif}</span></div>}
              <div className="form-grid">
                <div className="form-group full"><label>Intitulé <span className="req">*</span></label><input type="text" value={formModif.intitule} style={erreursModif.intitule ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, intitule: e.target.value }); setErreursModif({ ...erreursModif, intitule: "" }); }} /><ErrMsg msg={erreursModif.intitule} /></div>
                <div className="form-group">
                  <label>Catégorie <span className="req">*</span></label>
                  <CategorieFormSelect 
                    categories={categoriesActives} 
                    value={formModif.categorie} 
                    onChange={val => { setFormModif({ ...formModif, categorie: val }); setErreursModif({ ...erreursModif, categorie: "" }); }}
                    error={erreursModif.categorie}
                  />
                </div>
                <div className="form-group"><label>Niveau</label><select value={formModif.niveau} onChange={e => setFormModif({ ...formModif, niveau: e.target.value })}><option value="">-- Aucun --</option><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option></select></div>
                <div className="form-group full"><label>Formateurs</label><FormateurMultiSelect formateurs={formateurs} selected={formModif.formateurs} onChange={ids => setFormModif({ ...formModif, formateurs: ids })} /></div>
                <div className="form-group full"><label>Description</label><textarea value={formModif.description} rows={3} onChange={e => setFormModif({ ...formModif, description: e.target.value })} /></div>
                <div className="form-group full"><label>Objectifs pédagogiques <span className="req">*</span></label><textarea value={formModif.objectifs_pedagogiques} rows={3} style={erreursModif.objectifs_pedagogiques ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, objectifs_pedagogiques: e.target.value }); setErreursModif({ ...erreursModif, objectifs_pedagogiques: "" }); }} /><ErrMsg msg={erreursModif.objectifs_pedagogiques} /></div>
                <div className="form-group full"><label>Prérequis</label><textarea value={formModif.prerequis} rows={2} onChange={e => setFormModif({ ...formModif, prerequis: e.target.value })} /></div>
                <div className="form-group"><label>Durée (heures) <span className="req">*</span></label><input type="number" value={formModif.duree} style={erreursModif.duree ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, duree: e.target.value }); setErreursModif({ ...erreursModif, duree: "", duree_coherence: "" }); }} /><ErrMsg msg={erreursModif.duree} /></div>
                <div className="form-group"><label>Format <span className="req">*</span></label><select value={formModif.format} style={erreursModif.format ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, format: e.target.value }); setErreursModif({ ...erreursModif, format: "" }); }}><option>Présentiel</option><option>En ligne</option><option>Hybride</option></select><ErrMsg msg={erreursModif.format} /></div>
                {erreursModif.duree_coherence && <div style={{ gridColumn: "1/-1" }}><ErrMsg msg={erreursModif.duree_coherence} /></div>}
                <div className="form-group"><label>Date de début</label><input type="date" value={formModif.date_debut} style={erreursModif.date_debut ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, date_debut: e.target.value }); setErreursModif({ ...erreursModif, date_debut: "", duree_coherence: "" }); }} /><ErrMsg msg={erreursModif.date_debut} /></div>
                <div className="form-group"><label>Date de fin</label><input type="date" value={formModif.date_fin} style={erreursModif.date_fin ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, date_fin: e.target.value }); setErreursModif({ ...erreursModif, date_fin: "", duree_coherence: "" }); }} /><ErrMsg msg={erreursModif.date_fin} /></div>
                <div className="form-group"><label>Prix HT (DT) <span className="req">*</span></label><input type="number" step="0.01" value={formModif.prix_ht} style={erreursModif.prix_ht ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, prix_ht: e.target.value }); setErreursModif({ ...erreursModif, prix_ht: "" }); }} /><ErrMsg msg={erreursModif.prix_ht} /></div>
                <div className="form-group"><label>Prix TTC (DT) <span className="req">*</span></label><input type="number" step="0.01" value={formModif.prix_ttc} style={erreursModif.prix_ttc ? styleInputErreur : {}} onChange={e => { setFormModif({ ...formModif, prix_ttc: e.target.value }); setErreursModif({ ...erreursModif, prix_ttc: "" }); }} /><ErrMsg msg={erreursModif.prix_ttc} /></div>
                <div className="form-group"><label>Tranches de paiement</label><input type="number" min="1" max="12" value={formModif.nb_tranches_paiement} onChange={e => setFormModif({ ...formModif, nb_tranches_paiement: e.target.value })} /><small className="field-hint">1 = paiement unique</small></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)}>Annuler</button>
              <button className="btn btn-update" onClick={handleModif} disabled={submitLoading}>{submitLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> En cours…</> : <><i className="fa-solid fa-rotate"></i> Mettre à jour</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODALE SUPPRESSION ══ */}
      {modalSuppr && (
        <div className="modal-overlay show" onClick={e => handleOverlay(e, () => { if (!submitLoading) setModalSuppr(null); })}>
          <div className="modal modal-suppr">
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "32px" }}>
              <div style={{ background: "#fff0f0", borderRadius: "16px", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-trash" style={{ fontSize: "28px", color: "#ef4444" }}></i>
              </div>
            </div>
            <div className="modal-body" style={{ textAlign: "center", paddingTop: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" }}>Supprimer la formation</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
                <div style={{ background: catColor(modalSuppr.categorie), borderRadius: "8px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>{initiales(modalSuppr.intitule)}</div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{modalSuppr.intitule}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>#{String(modalSuppr.id).padStart(3, "0")}</div>
                </div>
              </div>
              <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "8px", textAlign: "left", marginBottom: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: "2px", flexShrink: 0 }}></i>
                <span>Cette action est <strong>irréversible</strong>. Toutes les données associées seront définitivement supprimées.</span>
              </div>
              {errSuppr && <div style={{ background: "#fff5f5", border: "1.5px solid #ef4444", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", display: "flex", gap: "8px", textAlign: "left", marginTop: "8px" }}><i className="fa-solid fa-circle-xmark" style={{ marginTop: "2px" }}></i><span>{errSuppr}</span></div>}
            </div>
            <div className="modal-footer" style={{ justifyContent: "center", gap: "12px" }}>
              <button className="btn btn-cancel" style={{ flex: 1 }} onClick={() => setModalSuppr(null)}><i className="fa-solid fa-xmark"></i> Annuler</button>
              <button style={{ flex: 1, background: errSuppr ? "#fca5a5" : "#ef4444", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: "600", cursor: (submitLoading || errSuppr) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "Poppins, sans-serif" }}
                onClick={handleSupprimer} disabled={submitLoading || !!errSuppr}>
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