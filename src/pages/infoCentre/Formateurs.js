import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import "../../styles/infoCentre/Formateurs.css";
import { getFormation } from "../../services/infoCentre/formationService";
import {
  getFormateurs,
  createFormateur,
  updateFormateur,
  deleteFormateur,
} from "../../services/infoCentre/Formateurservice";

const FORM_VIDE = {
  nom: "", prenom: "", email: "", telephone: "", adresse: "",
  specialites: "", niveau_intervention: "", type_contrat: "",
  contrat_pdf: [],
  cv_pdf: null,
  diplomes_pdf: [],
};

const ERRORS_VIDE = {
  nom: "", prenom: "", email: "", telephone: "",
  specialites: "", niveau_intervention: "", type_contrat: "",
};

const pad = (n) => String(n).padStart(2, "0");
const levelClass = (n) =>
  n === "expert" ? "level-expert" : n === "universitaire" ? "level-universitaire" : "level-junior";
const contractClass = (c) =>
  c === "interne" ? "contract-interne" : "contract-vacation";

const niveauLabel          = { junior: "Junior", universitaire: "Universitaire", expert: "Expert" };
const contratLabel         = { interne: "Interne", vacation: "Vacation" };
const formatLabel          = { presentiel: "Présentiel", en_ligne: "En ligne", hybride: "Hybride" };
const niveauFormationLabel = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

const toFormations = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [];
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telRegex   = /^(\+216|00216)?[2-9]\d{7}$/;

const validateForm = (form) => {
  const errs = { ...ERRORS_VIDE };
  if (!form.nom.trim())          errs.nom = "Le nom est obligatoire.";
  if (!form.prenom.trim())       errs.prenom = "Le prénom est obligatoire.";
  if (!form.email.trim())        errs.email = "L'email est obligatoire.";
  else if (!emailRegex.test(form.email.trim())) errs.email = "Format d'email invalide.";
  if (form.telephone.trim() && !telRegex.test(form.telephone.trim().replace(/\s/g, "")))
    errs.telephone = "Numéro tunisien invalide (ex : +21655123456 ou 55123456).";
  if (!form.specialites.trim())  errs.specialites = "Les spécialités sont obligatoires.";
  if (!form.niveau_intervention) errs.niveau_intervention = "Le niveau d'intervention est obligatoire.";
  if (!form.type_contrat)        errs.type_contrat = "Le type de contrat est obligatoire.";
  return errs;
};

const hasErrors = (errs) => Object.values(errs).some((v) => v !== "");

const parseBackendErrors = (data) => {
  const fieldErrs = { ...ERRORS_VIDE };
  let globalMsg = "";
  if (!data) return { fieldErrs, globalMsg };
  const fieldMap = { email: "email", telephone: "telephone" };
  for (const [key, msgs] of Object.entries(data)) {
    const msg = Array.isArray(msgs) ? msgs[0] : msgs;
    if (fieldMap[key]) fieldErrs[fieldMap[key]] = msg;
    else if (key !== "error" && key !== "formations")
      globalMsg = globalMsg ? globalMsg + " " + msg : msg;
  }
  return { fieldErrs, globalMsg };
};

// ─── FormationFilterDropdown : dropdown personnalisé pour le filtre formations ──
function FormationFilterDropdown({ formations, selectedValue, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedFormation = formations.find(f => String(f.id) === selectedValue);
  const displayText = selectedFormation ? selectedFormation.intitule : "Toutes les formations";

  const filteredFormations = formations.filter(f =>
    f.intitule.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="formation-filter-dropdown" ref={ref}>
      <button
        type="button"
        className="filter-dropdown-btn"
        onClick={() => setOpen(!open)}
      >
        <i className="fa-solid fa-graduation-cap"></i>
        <span className="filter-dropdown-text">{displayText}</span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} filter-dropdown-chevron`}></i>
      </button>

      {open && (
        <div className="filter-dropdown-panel">
          <div className="filter-dropdown-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="filter-dropdown-list">
            <div
              className={`filter-dropdown-item ${selectedValue === "" ? "active" : ""}`}
              onClick={() => {
                onSelect("");
                setOpen(false);
                setSearch("");
              }}
            >
              <i className="fa-solid fa-arrow-rotate-left"></i>
              <span>Toutes les formations</span>
            </div>
            {filteredFormations.length === 0 ? (
              <div className="filter-dropdown-empty">Aucune formation trouvée</div>
            ) : (
              filteredFormations.map((fm) => (
                <div
                  key={fm.id}
                  className={`filter-dropdown-item ${String(fm.id) === selectedValue ? "active" : ""}`}
                  onClick={() => {
                    onSelect(String(fm.id));
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <i className="fa-solid fa-book-open"></i>
                  <span className="filter-item-name">{fm.intitule}</span>
                  {fm.categorie_nom && (
                    <span className="filter-item-cat">{fm.categorie_nom}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FileDropdown : multi-fichiers (Contrat / Diplômes) ───────────────────────
function FileDropdown({ label, icon, colorClass, files, onAdd, onRemove, onRemoveExisting, inputId, existingUrls = [] }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const validExisting = existingUrls.filter(Boolean);
  const totalCount    = files.length + validExisting.length;

  const filteredExisting = validExisting.filter(u => {
    const name = u.split("/").pop() || "";
    return !search || name.toLowerCase().includes(search.toLowerCase());
  });
  const filteredNew = files.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="form-group file-dd-group" ref={ref}>
      <label><i className={`fa-solid ${icon} doc-lbl-icon`}></i> {label}</label>

      <button type="button" className="file-upload-label file-dd-btn" onClick={() => setOpen((o) => !o)}>
        <i className="fa-solid fa-folder-open"></i>
        <span className="file-dd-text">
          {totalCount > 0 ? `${totalCount} fichier(s)` : "Choisir un PDF"}
        </span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} file-dd-chevron`}></i>
      </button>

      {open && (
        <div className="file-dropdown-panel">
          {totalCount > 1 && (
            <div className="file-dropdown-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          )}
          <div className="file-dropdown-list">
            {filteredExisting.map((url, i) => {
              const name = url.split("/").pop() || `Fichier ${i + 1}`;
              const realIndex = validExisting.indexOf(url);
              return (
                <div className={`file-dropdown-item ${colorClass}`} key={`ex-${i}`}>
                  <i className="fa-solid fa-file-pdf file-pdf-icon"></i>
                  <span className="file-item-name" title={name}>{name}</span>
                  <a href={url} target="_blank" rel="noreferrer" className="file-item-view" title="Voir">
                    <i className="fa-solid fa-eye"></i>
                  </a>
                  {onRemoveExisting && (
                    <button type="button" className="file-item-remove" onClick={() => onRemoveExisting(realIndex)} title="Supprimer">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              );
            })}
            {filteredNew.map((file, i) => (
              <div className={`file-dropdown-item ${colorClass}`} key={`new-${i}`}>
                <i className="fa-solid fa-file-pdf file-pdf-icon"></i>
                <span className="file-item-name" title={file.name}>{file.name}</span>
                <button type="button" className="file-item-remove" onClick={() => onRemove(i)} title="Retirer">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
            {filteredExisting.length === 0 && filteredNew.length === 0 && (
              <div className="file-dropdown-empty">Aucun fichier</div>
            )}
          </div>
          <label className="file-dropdown-add" htmlFor={inputId}>
            <i className="fa-solid fa-plus"></i> Ajouter un PDF
          </label>
          <input type="file" id={inputId} accept=".pdf" multiple style={{ display: "none" }}
            onChange={(e) => { onAdd(Array.from(e.target.files)); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );
}

// ─── CvDropdown : fichier unique, même style que FileDropdown ─────────────────
function CvDropdown({ inputId, cvFile, existingUrl, onChange, onRemoveExisting }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const totalCount = (cvFile ? 1 : 0) + (existingUrl ? 1 : 0);

  return (
    <div className="form-group file-dd-group" ref={ref}>
      <label><i className="fa-solid fa-file-lines doc-lbl-icon"></i> CV</label>

      <button type="button" className="file-upload-label file-dd-btn" onClick={() => setOpen((o) => !o)}>
        <i className="fa-solid fa-folder-open"></i>
        <span className="file-dd-text">
          {totalCount > 0 ? `${totalCount} fichier(s)` : "Choisir un PDF"}
        </span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} file-dd-chevron`}></i>
      </button>

      {open && (
        <div className="file-dropdown-panel">
          <div className="file-dropdown-list" style={{ maxHeight: "none" }}>
            {existingUrl && (
              <div className="file-dropdown-item file-item-contrat">
                <i className="fa-solid fa-file-pdf file-pdf-icon"></i>
                <span className="file-item-name" title={existingUrl.split("/").pop()}>
                  {existingUrl.split("/").pop()}
                </span>
                <a href={existingUrl} target="_blank" rel="noreferrer" className="file-item-view" title="Voir">
                  <i className="fa-solid fa-eye"></i>
                </a>
                <button type="button" className="file-item-remove" title="Supprimer" onClick={onRemoveExisting}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
            {cvFile && (
              <div className="file-dropdown-item file-item-contrat">
                <i className="fa-solid fa-file-pdf file-pdf-icon"></i>
                <span className="file-item-name" title={cvFile.name}>{cvFile.name}</span>
                <button type="button" className="file-item-remove" title="Retirer" onClick={() => onChange(null)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
            {!existingUrl && !cvFile && (
              <div className="file-dropdown-empty">Aucun fichier</div>
            )}
          </div>
          <label className="file-dropdown-add" htmlFor={inputId}>
            <i className="fa-solid fa-plus"></i> {cvFile || existingUrl ? "Remplacer le CV" : "Ajouter un PDF"}
          </label>
          <input type="file" id={inputId} accept=".pdf" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) onChange(e.target.files[0]); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );
}

// ─── FormationsSection ────────────────────────────────────────────────────────
function FormationsSection({ formations, onSelectFormation }) {
  const [search, setSearch] = useState("");
  const list     = toFormations(formations);
  const filtered = list.filter(f => f.intitule.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="detail-sec formations-sec-wrap">
      <div className="formations-header-bar">
        <i className="fa-solid fa-graduation-cap formations-hdr-icon"></i>
        <span className="formations-hdr-label">Formations associées</span>
        <span className="formations-hdr-count">{list.length}</span>
      </div>

      {list.length > 0 && (
        <div className="formations-search-under">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {list.length === 0 ? (
        <div className="no-formations-msg">
          <i className="fa-solid fa-circle-info"></i> Aucune formation associée à ce formateur.
        </div>
      ) : (
        <div className="formations-scroll-body">
          {filtered.length === 0 ? (
            <div className="no-formations-msg">Aucune formation trouvée.</div>
          ) : (
            filtered.map((fm, i) => (
              <button key={fm.id || i} className="formation-item formation-item-clickable"
                onClick={() => onSelectFormation(fm)} title="Voir les détails de la formation">
                <div className="formation-item-icon"><i className="fa-solid fa-book-open"></i></div>
                <div className="formation-item-info">
                  <span className="formation-item-title">{fm.intitule}</span>
                  {fm.categorie_nom && <span className="formation-item-cat">{fm.categorie_nom}</span>}
                </div>
                {fm.niveau && (
                  <span className={`formation-item-niveau niveau-${fm.niveau}`}>
                    {niveauFormationLabel[fm.niveau] || fm.niveau}
                  </span>
                )}
                <i className="fa-solid fa-chevron-right formation-item-arrow"></i>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── DocsSearchSection : colonne document avec recherche ─────────────────────
function DocsSearchSection({ header, headerClass, items, emptyMsg, getUrl, getName }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item => getName(item).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="docs-multi-section">
      <div className={`docs-multi-header ${headerClass}`}>
        {header}
      </div>
      {items.length > 0 && (
        <div className="doc-search-bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}
      {items.length === 0 ? (
        <div className="doc-empty">{emptyMsg}</div>
      ) : (
        <div className="doc-files-scroll">
          {filtered.length === 0 ? (
            <div className="doc-empty">Aucun résultat</div>
          ) : (
            filtered.map((item, i) => (
              <a key={item.id || i} href={getUrl(item)} target="_blank" rel="noreferrer" className="doc-file-row">
                <i className="fa-solid fa-file-pdf doc-pdf-ico"></i>
                <span className="doc-file-name">{getName(item)}</span>
                <i className="fa-solid fa-download doc-dl-ico"></i>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
function Formateurs() {
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filterFormation, setFilterFormation] = useState("");

  const [modalDetail, setModalDetail] = useState(null);
  const [modalAjout,  setModalAjout]  = useState(false);
  const [modalModif,  setModalModif]  = useState(null);
  const [modalSuppr,  setModalSuppr]  = useState(null);

  const [modalFormationDetail, setModalFormationDetail] = useState(null);
  const [loadingFD, setLoadingFD] = useState(false);
  const [errorFD,   setErrorFD]   = useState("");

  const [formAjout, setFormAjout]     = useState(FORM_VIDE);
  const [formModif, setFormModif]     = useState(FORM_VIDE);
  const [errorsAjout, setErrorsAjout] = useState(ERRORS_VIDE);
  const [errorsModif, setErrorsModif] = useState(ERRORS_VIDE);
  const [globalErrAjout, setGlobalErrAjout] = useState("");
  const [globalErrModif, setGlobalErrModif] = useState("");

  const [supprErrMsg,        setSupprErrMsg]       = useState("");
  const [supprErrFormations, setSupprErrFormations] = useState([]);

  const [deletedContrats,    setDeletedContrats]    = useState([]);
  const [deletedDiplomes,    setDeletedDiplomes]    = useState([]);
  const [cvExistantSupprime, setCvExistantSupprime] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const PER_PAGE = 7;

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 3500);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => { fetchFormateurs(); }, []);

  const fetchFormateurs = async () => {
    try {
      setLoading(true); setError(null);
      const data = await getFormateurs();
      setFormateurs(data);
    } catch { setError("Impossible de charger les formateurs."); }
    finally  { setLoading(false); }
  };

  const allFormations = Array.from(
    new Map(
      formateurs.flatMap((f) => toFormations(f.formations).map((fm) => [fm.id, fm]))
    ).values()
  ).sort((a, b) => a.intitule.localeCompare(b.intitule));

  const filtered = formateurs.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || f.nom.toLowerCase().includes(q) || f.prenom.toLowerCase().includes(q) ||
      toArray(f.specialites).some((s) => s.toLowerCase().includes(q));
    const matchFormation =
      !filterFormation || toFormations(f.formations).some((fm) => String(fm.id) === filterFormation);
    return matchSearch && matchFormation;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openFormationDetail = async (fm) => {
    setModalFormationDetail({ intitule: fm.intitule, id: fm.id });
    setLoadingFD(true); setErrorFD("");
    try {
      const response = await getFormation(fm.id);
      setModalFormationDetail(response.data);
    } catch { setErrorFD("Impossible de charger les détails de cette formation."); }
    finally  { setLoadingFD(false); }
  };

  const closeFormationDetail = () => { setModalFormationDetail(null); setErrorFD(""); };

  const handleAddFiles = (files, field, setForm) =>
    setForm((prev) => ({ ...prev, [field]: [...(prev[field] || []), ...files] }));

  const handleRemoveFile = (index, field, setForm) =>
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const buildFormDataMulti = (data, isModif = false) => {
    const fd = new FormData();
    ['nom','prenom','email','telephone','adresse','specialites','niveau_intervention','type_contrat'].forEach((k) => {
      if (data[k] !== undefined && data[k] !== null) fd.append(k, data[k]);
    });
    if (data.cv_pdf instanceof File) fd.append('cv_pdf', data.cv_pdf);
    (data.contrat_pdf  || []).forEach(f => { if (f instanceof File) fd.append('contrat_pdf',  f); });
    (data.diplomes_pdf || []).forEach(f => { if (f instanceof File) fd.append('diplomes_pdf', f); });
    if (isModif) {
      deletedContrats.forEach(id => fd.append('delete_contrats', id));
      deletedDiplomes.forEach(id => fd.append('delete_diplomes', id));
      if (cvExistantSupprime) fd.append('delete_cv', 'true');
    }
    return fd;
  };

  const handleAjoutChange = (e) => {
    const { name, value } = e.target;
    setFormAjout((prev) => ({ ...prev, [name]: value }));
    if (errorsAjout[name]) setErrorsAjout((prev) => ({ ...prev, [name]: "" }));
    if (globalErrAjout) setGlobalErrAjout("");
  };

  const handleSaveAjout = async () => {
    const errs = validateForm(formAjout);
    if (hasErrors(errs)) { setErrorsAjout(errs); return; }
    try {
      setSaving(true);
      const newF = await createFormateur(buildFormDataMulti(formAjout));
      setFormateurs((prev) => [newF, ...prev]);
      setModalAjout(false); setFormAjout(FORM_VIDE);
      setErrorsAjout(ERRORS_VIDE); setGlobalErrAjout(""); setPage(1);
      setSuccessMsg("Formateur ajouté avec succès !");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const { fieldErrs, globalMsg } = parseBackendErrors(data);
        setErrorsAjout((prev) => ({ ...prev, ...fieldErrs }));
        setGlobalErrAjout(globalMsg || "");
      } else setGlobalErrAjout("Une erreur est survenue. Veuillez réessayer.");
    } finally { setSaving(false); }
  };

  const closeModalAjout = () => {
    setModalAjout(false); setFormAjout(FORM_VIDE);
    setErrorsAjout(ERRORS_VIDE); setGlobalErrAjout("");
  };

  const openModif = (f) => {
    setFormModif({
      nom: f.nom, prenom: f.prenom, email: f.email,
      telephone: f.telephone || "", adresse: f.adresse || "",
      specialites: toArray(f.specialites).join(", "),
      niveau_intervention: f.niveau_intervention || "",
      type_contrat: f.type_contrat || "",
      contrat_pdf: [], cv_pdf: null, diplomes_pdf: [],
    });
    setErrorsModif(ERRORS_VIDE); setGlobalErrModif(""); setModalModif(f);
    setDeletedContrats([]); setDeletedDiplomes([]); setCvExistantSupprime(false);
  };

  const handleModifChange = (e) => {
    const { name, value } = e.target;
    setFormModif((prev) => ({ ...prev, [name]: value }));
    if (errorsModif[name]) setErrorsModif((prev) => ({ ...prev, [name]: "" }));
    if (globalErrModif) setGlobalErrModif("");
  };

  const handleSaveModif = async () => {
    const errs = validateForm(formModif);
    if (hasErrors(errs)) { setErrorsModif(errs); return; }
    try {
      setSaving(true);
      const updated = await updateFormateur(modalModif.id, buildFormDataMulti(formModif, true));
      setFormateurs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setModalModif(null); setSuccessMsg("Formateur modifié avec succès !");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const { fieldErrs, globalMsg } = parseBackendErrors(data);
        setErrorsModif((prev) => ({ ...prev, ...fieldErrs }));
        setGlobalErrModif(globalMsg || "");
      } else setGlobalErrModif("Une erreur est survenue. Veuillez réessayer.");
    } finally { setSaving(false); }
  };

  const closeModalModif = () => {
    setModalModif(null); setErrorsModif(ERRORS_VIDE); setGlobalErrModif("");
    setDeletedContrats([]); setDeletedDiplomes([]); setCvExistantSupprime(false);
  };

  const openSuppr = (f) => { setSupprErrMsg(""); setSupprErrFormations([]); setModalSuppr(f); };

  const confirmDelete = async () => {
    if (!modalSuppr) return;
    setSupprErrMsg(""); setSupprErrFormations([]);
    try {
      setDeleting(true);
      await deleteFormateur(modalSuppr.id);
      setFormateurs((prev) => prev.filter((f) => f.id !== modalSuppr.id));
      setModalSuppr(null); setPage(1);
      setSuccessMsg("Formateur supprimé avec succès !");
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data?.error === "suppression_bloquee") {
        setSupprErrMsg(data.message); setSupprErrFormations(data.formations || []);
      } else setSupprErrMsg("Une erreur est survenue lors de la suppression.");
    } finally { setDeleting(false); }
  };

  const fieldClass = (err) => (err ? "input-error" : "");

  const renderDocSection = (form, setForm, prefix) => (
    <div className="form-grid docs-compact-grid">
      <FileDropdown
        label="Contrat(s)"
        icon="fa-file-contract"
        colorClass="file-item-contrat"
        files={form.contrat_pdf || []}
        existingUrls={prefix === "modif" && modalModif?.contrats?.length > 0
          ? modalModif.contrats.map(c => c.fichier_url).filter(Boolean).filter((_, i) => !deletedContrats.includes(i))
          : []}
        onAdd={(files) => handleAddFiles(files, "contrat_pdf", setForm)}
        onRemove={(i) => handleRemoveFile(i, "contrat_pdf", setForm)}
        onRemoveExisting={prefix === "modif" ? (i) => {
          const id = modalModif.contrats[i]?.id;
          if (id) setDeletedContrats(prev => [...prev, id]);
        } : undefined}
        inputId={`${prefix}-contrat-input`}
      />

      <CvDropdown
        key={`cv-${prefix}-${modalModif?.id ?? "new"}-${cvExistantSupprime}`}
        inputId={`${prefix}-cv-input`}
        cvFile={form.cv_pdf}
        existingUrl={prefix === "modif" && modalModif?.cv_pdf && !cvExistantSupprime ? modalModif.cv_pdf : null}
        onChange={(file) => setForm((prev) => ({ ...prev, cv_pdf: file }))}
        onRemoveExisting={() => setCvExistantSupprime(true)}
      />

      <FileDropdown
        label="Diplôme(s)"
        icon="fa-graduation-cap"
        colorClass="file-item-diplome"
        files={form.diplomes_pdf || []}
        existingUrls={prefix === "modif" && modalModif?.diplomes?.length > 0
          ? modalModif.diplomes.map(d => d.fichier_url).filter(Boolean).filter((_, i) => !deletedDiplomes.includes(i))
          : []}
        onAdd={(files) => handleAddFiles(files, "diplomes_pdf", setForm)}
        onRemove={(i) => handleRemoveFile(i, "diplomes_pdf", setForm)}
        onRemoveExisting={prefix === "modif" ? (i) => {
          const id = modalModif.diplomes[i]?.id;
          if (id) setDeletedDiplomes(prev => [...prev, id]);
        } : undefined}
        inputId={`${prefix}-diplome-input`}
      />
    </div>
  );

  return (
    <Layout>
      {successMsg && (
        <div className="success-toast">
          <i className="fa-solid fa-circle-check"></i> {successMsg}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-chalkboard-user"></i> Gestion des Formateurs
        </h1>
        <p className="page-sub">Liste et gestion de tous les formateurs du centre</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou spécialité..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <FormationFilterDropdown
            formations={allFormations}
            selectedValue={filterFormation}
            onSelect={setFilterFormation}
          />
        </div>
        <div className="toolbar-right">
          <button className="btn btn-add" onClick={() => setModalAjout(true)}>
            <i className="fa-solid fa-plus"></i> Nouveau Formateur
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-top">
          {loading ? <span>Chargement...</span>
          : error   ? <span style={{ color: "red" }}>{error}</span>
          : (
            <>
              Affichage de <strong>{paginated.length}</strong> formateurs sur{" "}
              <strong>{filtered.length}</strong>
              {filterFormation && (
                <span className="filter-active-badge">
                  <i className="fa-solid fa-filter"></i>{" "}
                  {allFormations.find((f) => String(f.id) === filterFormation)?.intitule}
                  <button onClick={() => { setFilterFormation(""); setPage(1); }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </span>
              )}
            </>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Spécialités / Domaines</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94A3B8" }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Chargement...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94A3B8" }}>
                    Aucun formateur trouvé.
                  </td>
                </tr>
              ) : (
                paginated.map((f, idx) => {
                  const fms = toFormations(f.formations);
                  return (
                    <tr key={f.id}>
                      <td className="td-num">{pad((page - 1) * PER_PAGE + idx + 1)}</td>
                      <td className="td-name">{f.nom}</td>
                      <td className="td-firstname">{f.prenom}</td>
                      <td className="td-email"><a href={`mailto:${f.email}`}>{f.email}</a></td>
                      <td className="td-phone">{f.telephone}</td>
                      <td>
                        {toArray(f.specialites).map((s) => (
                          <span key={s} className="spec-tag">{s}</span>
                        ))}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="pg-btn" onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`pg-num${page === n ? " active" : ""}`} onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
            <button className="pg-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {modalFormationDetail && (
        <div className="modal-overlay show" style={{ zIndex: 3000 }} onClick={closeFormationDetail}>
          <div className="modal modal-formation-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottomColor: "#33CCFF" }}>
              <h2><i className="fa-solid fa-book-open"></i> {modalFormationDetail.intitule}</h2>
              <button className="modal-close" onClick={closeFormationDetail}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingFD && (
                <div className="fd-loading">
                  <i className="fa-solid fa-spinner fa-spin"></i> Chargement des détails...
                </div>
              )}
              {errorFD && !loadingFD && (
                <div className="global-error-banner">
                  <i className="fa-solid fa-circle-xmark"></i><span>{errorFD}</span>
                </div>
              )}
              {!loadingFD && !errorFD && (
                <div className="fd-pro-layout">
                  <div className="fd-chips-row">
                    {modalFormationDetail.categorie_nom && (
                      <span className="fd-chip fd-chip-cat">
                        <i className="fa-solid fa-tag"></i> {modalFormationDetail.categorie_nom}
                      </span>
                    )}
                    {modalFormationDetail.niveau && (
                      <span className={`formation-item-niveau niveau-${modalFormationDetail.niveau}`}>
                        <i className="fa-solid fa-layer-group"></i> {niveauFormationLabel[modalFormationDetail.niveau] || modalFormationDetail.niveau}
                      </span>
                    )}
                    {modalFormationDetail.format && (
                      <span className="fd-chip fd-chip-format">
                        <i className="fa-solid fa-display"></i> {formatLabel[modalFormationDetail.format] || modalFormationDetail.format}
                      </span>
                    )}
                    {modalFormationDetail.duree && (
                      <span className="fd-chip fd-chip-duree">
                        <i className="fa-solid fa-clock"></i> {modalFormationDetail.duree}h
                      </span>
                    )}
                  </div>
                  {(modalFormationDetail.date_debut || modalFormationDetail.date_fin || modalFormationDetail.prix_ht || modalFormationDetail.prix_ttc) && (
                    <div className="fd-meta-row">
                      {modalFormationDetail.date_debut && (
                        <div className="fd-meta-item">
                          <span className="fd-meta-lbl"><i className="fa-solid fa-calendar-day"></i> Début</span>
                          <span className="fd-meta-val">{modalFormationDetail.date_debut}</span>
                        </div>
                      )}
                      {modalFormationDetail.date_fin && (
                        <div className="fd-meta-item">
                          <span className="fd-meta-lbl"><i className="fa-solid fa-calendar-check"></i> Fin</span>
                          <span className="fd-meta-val">{modalFormationDetail.date_fin}</span>
                        </div>
                      )}
                      {modalFormationDetail.prix_ht && (
                        <div className="fd-meta-item">
                          <span className="fd-meta-lbl"><i className="fa-solid fa-money-bill"></i> Prix HT</span>
                          <span className="fd-meta-val">{modalFormationDetail.prix_ht} TND</span>
                        </div>
                      )}
                      {modalFormationDetail.prix_ttc && (
                        <div className="fd-meta-item fd-meta-item-accent">
                          <span className="fd-meta-lbl"><i className="fa-solid fa-receipt"></i> Prix TTC</span>
                          <span className="fd-meta-val">{modalFormationDetail.prix_ttc} TND</span>
                        </div>
                      )}
                    </div>
                  )}
                  {modalFormationDetail.description && (
                    <div className="fd-text-block">
                      <div className="fd-text-label"><i className="fa-solid fa-align-left"></i> Description</div>
                      <p className="fd-text-content">{modalFormationDetail.description}</p>
                    </div>
                  )}
                  {modalFormationDetail.objectifs_pedagogiques && (
                    <div className="fd-text-block fd-text-block-alt">
                      <div className="fd-text-label"><i className="fa-solid fa-bullseye"></i> Objectifs pédagogiques</div>
                      <p className="fd-text-content">{modalFormationDetail.objectifs_pedagogiques}</p>
                    </div>
                  )}
                  {modalFormationDetail.prerequis && (
                    <div className="fd-text-block">
                      <div className="fd-text-label"><i className="fa-solid fa-list-check"></i> Prérequis</div>
                      <p className="fd-text-content">{modalFormationDetail.prerequis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeFormationDetail}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {modalDetail && (
        <div className="modal-overlay show" onClick={() => setModalDetail(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header detail-header">
              <div className="detail-header-left">
                <div className="detail-icon-wrap">
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div className="detail-header-info">
                  <h2>{modalDetail.prenom} {modalDetail.nom}</h2>
                  <div className="detail-badges">
                    {toArray(modalDetail.specialites).map((s) => (
                      <span key={s} className="spec-tag">{s}</span>
                    ))}
                    <span className={`contract-tag ${contractClass(modalDetail.type_contrat)}`}>
                      <i className="fa-solid fa-id-card"></i> {contratLabel[modalDetail.type_contrat] || modalDetail.type_contrat}
                    </span>
                    <span className={`level-tag ${levelClass(modalDetail.niveau_intervention)}`}>
                      <i className="fa-solid fa-star"></i> {niveauLabel[modalDetail.niveau_intervention] || modalDetail.niveau_intervention}
                    </span>
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
                  <div className="sc-icon"><i className="fa-solid fa-envelope"></i></div>
                  <div className="sc-info">
                    <span className="sc-val sc-val-sm">{modalDetail.email}</span>
                    <span className="sc-lbl">Email</span>
                  </div>
                </div>
                <div className="stat-card sc-navy">
                  <div className="sc-icon"><i className="fa-solid fa-phone"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.telephone}</span>
                    <span className="sc-lbl">Téléphone</span>
                  </div>
                </div>
                <div className="stat-card sc-sand">
                  <div className="sc-icon"><i className="fa-solid fa-graduation-cap"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{toFormations(modalDetail.formations).length}</span>
                    <span className="sc-lbl">Formation(s)</span>
                  </div>
                </div>
                <div className="stat-card sc-green">
                  <div className="sc-icon"><i className="fa-solid fa-file-pdf"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">
                      {(modalDetail.contrats?.length || 0)
                        + (modalDetail.cv_pdf ? 1 : 0)
                        + (modalDetail.diplomes?.length || 0)}
                    </span>
                    <span className="sc-lbl">Document(s)</span>
                  </div>
                </div>
              </div>
              <div className="detail-sections">
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-user"></i> Informations personnelles
                  </div>
                  <div className="detail-info-grid">
                    <div className="info-item"><span className="info-lbl">Nom</span><span className="info-val">{modalDetail.nom}</span></div>
                    <div className="info-item"><span className="info-lbl">Prénom</span><span className="info-val">{modalDetail.prenom}</span></div>
                    <div className="info-item"><span className="info-lbl">Email</span><span className="info-val">{modalDetail.email}</span></div>
                    <div className="info-item"><span className="info-lbl">Téléphone</span><span className="info-val">{modalDetail.telephone}</span></div>
                    <div className="info-item full-info"><span className="info-lbl">Adresse</span><span className="info-val">{modalDetail.adresse}</span></div>
                  </div>
                </div>
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-briefcase"></i> Informations professionnelles
                  </div>
                  <div className="detail-info-grid">
                    <div className="info-item">
                      <span className="info-lbl">Spécialités</span>
                      <span className="info-val">
                        {toArray(modalDetail.specialites).map((s) => <span key={s} className="spec-tag">{s}</span>)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-lbl">Niveau d'intervention</span>
                      <span className="info-val">
                        <span className={`level-tag ${levelClass(modalDetail.niveau_intervention)}`}>
                          {niveauLabel[modalDetail.niveau_intervention]}
                        </span>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-lbl">Type de contrat</span>
                      <span className="info-val">
                        <span className={`contract-tag ${contractClass(modalDetail.type_contrat)}`}>
                          {contratLabel[modalDetail.type_contrat]}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <FormationsSection
                  formations={modalDetail.formations}
                  onSelectFormation={openFormationDetail}
                />
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-folder-open"></i> Documents administratifs
                  </div>
                  <div className="docs-multi-wrap">
                    <div className="docs-multi-section">
                      <div className="docs-multi-header doc-cv">
                        <i className="fa-solid fa-file-lines"></i> CV
                      </div>
                      {modalDetail.cv_pdf ? (
                        <a href={modalDetail.cv_pdf} target="_blank" rel="noreferrer" className="doc-file-row">
                          <i className="fa-solid fa-file-pdf doc-pdf-ico"></i>
                          <span className="doc-file-name">CV.pdf</span>
                          <i className="fa-solid fa-download doc-dl-ico"></i>
                        </a>
                      ) : (
                        <div className="doc-empty">Non fourni</div>
                      )}
                    </div>
                    <DocsSearchSection
                      header={<><i className="fa-solid fa-file-contract"></i> Contrat(s)<span className="docs-count">{modalDetail.contrats?.length || 0}</span></>}
                      headerClass="doc-contrat"
                      items={modalDetail.contrats || []}
                      emptyMsg="Aucun contrat"
                      getUrl={c => c.fichier_url}
                      getName={c => c.fichier_url?.split("/").pop() || "contrat.pdf"}
                    />
                    <DocsSearchSection
                      header={<><i className="fa-solid fa-graduation-cap"></i> Diplôme(s)<span className="docs-count">{modalDetail.diplomes?.length || 0}</span></>}
                      headerClass="doc-diplome"
                      items={modalDetail.diplomes || []}
                      emptyMsg="Aucun diplôme"
                      getUrl={d => d.fichier_url}
                      getName={d => d.fichier_url?.split("/").pop() || "diplome.pdf"}
                    />
                  </div>
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

      {modalAjout && (
        <div className="modal-overlay show" onClick={closeModalAjout}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fa-solid fa-plus-circle"></i> Ajouter un Formateur</h2>
              <button className="modal-close" onClick={closeModalAjout}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              {globalErrAjout && (
                <div className="global-error-banner">
                  <i className="fa-solid fa-circle-xmark"></i><span>{globalErrAjout}</span>
                </div>
              )}
              <div className="form-section-title"><i className="fa-solid fa-user"></i> Informations personnelles</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom <span className="req">*</span></label>
                  <input type="text" name="nom" value={formAjout.nom} onChange={handleAjoutChange}
                    placeholder="Ex : Ben Ali" className={fieldClass(errorsAjout.nom)} />
                  {errorsAjout.nom && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.nom}</span>}
                </div>
                <div className="form-group">
                  <label>Prénom <span className="req">*</span></label>
                  <input type="text" name="prenom" value={formAjout.prenom} onChange={handleAjoutChange}
                    placeholder="Ex : Mohamed" className={fieldClass(errorsAjout.prenom)} />
                  {errorsAjout.prenom && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.prenom}</span>}
                </div>
                <div className="form-group">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" name="email" value={formAjout.email} onChange={handleAjoutChange}
                    placeholder="Ex : m.benali@centre.tn" className={fieldClass(errorsAjout.email)} />
                  {errorsAjout.email && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.email}</span>}
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" name="telephone" value={formAjout.telephone} onChange={handleAjoutChange}
                    placeholder="Ex : +21655123456" className={fieldClass(errorsAjout.telephone)} />
                  {errorsAjout.telephone && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.telephone}</span>}
                </div>
                <div className="form-group full">
                  <label>Adresse</label>
                  <input type="text" name="adresse" value={formAjout.adresse} onChange={handleAjoutChange}
                    placeholder="Ex : 12 Rue de la Liberté, Tunis 1001" />
                </div>
              </div>
              <div className="form-section-title"><i className="fa-solid fa-briefcase"></i> Informations professionnelles</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Spécialités / Domaines <span className="req">*</span></label>
                  <input type="text" name="specialites" value={formAjout.specialites} onChange={handleAjoutChange}
                    placeholder="Ex : Django, IA, Marketing Digital" className={fieldClass(errorsAjout.specialites)} />
                  {errorsAjout.specialites && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.specialites}</span>}
                </div>
                <div className="form-group">
                  <label>Niveau d'intervention <span className="req">*</span></label>
                  <select name="niveau_intervention" value={formAjout.niveau_intervention} onChange={handleAjoutChange}
                    className={fieldClass(errorsAjout.niveau_intervention)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="junior">Junior</option>
                    <option value="universitaire">Universitaire</option>
                    <option value="expert">Expert</option>
                  </select>
                  {errorsAjout.niveau_intervention && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.niveau_intervention}</span>}
                </div>
                <div className="form-group">
                  <label>Type de contrat <span className="req">*</span></label>
                  <select name="type_contrat" value={formAjout.type_contrat} onChange={handleAjoutChange}
                    className={fieldClass(errorsAjout.type_contrat)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="interne">Interne</option>
                    <option value="vacation">Vacation</option>
                  </select>
                  {errorsAjout.type_contrat && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.type_contrat}</span>}
                </div>
              </div>
              <div className="form-section-title"><i className="fa-solid fa-folder-open"></i> Documents administratifs (PDF)</div>
              {renderDocSection(formAjout, setFormAjout, "ajout")}
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeModalAjout}>Annuler</button>
              <button className="btn btn-save" onClick={handleSaveAjout} disabled={saving}>
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...</>
                  : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalModif && (
        <div className="modal-overlay show" onClick={closeModalModif}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modif-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier le Formateur</h2>
              <button className="modal-close" onClick={closeModalModif}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              {globalErrModif && (
                <div className="global-error-banner">
                  <i className="fa-solid fa-circle-xmark"></i><span>{globalErrModif}</span>
                </div>
              )}
              <div className="form-section-title"><i className="fa-solid fa-user"></i> Informations personnelles</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom <span className="req">*</span></label>
                  <input type="text" name="nom" value={formModif.nom} onChange={handleModifChange} className={fieldClass(errorsModif.nom)} />
                  {errorsModif.nom && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.nom}</span>}
                </div>
                <div className="form-group">
                  <label>Prénom <span className="req">*</span></label>
                  <input type="text" name="prenom" value={formModif.prenom} onChange={handleModifChange} className={fieldClass(errorsModif.prenom)} />
                  {errorsModif.prenom && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.prenom}</span>}
                </div>
                <div className="form-group">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" name="email" value={formModif.email} onChange={handleModifChange} className={fieldClass(errorsModif.email)} />
                  {errorsModif.email && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.email}</span>}
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" name="telephone" value={formModif.telephone} onChange={handleModifChange} className={fieldClass(errorsModif.telephone)} />
                  {errorsModif.telephone && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.telephone}</span>}
                </div>
                <div className="form-group full">
                  <label>Adresse</label>
                  <input type="text" name="adresse" value={formModif.adresse} onChange={handleModifChange} />
                </div>
              </div>
              <div className="form-section-title"><i className="fa-solid fa-briefcase"></i> Informations professionnelles</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Spécialités / Domaines <span className="req">*</span></label>
                  <input type="text" name="specialites" value={formModif.specialites} onChange={handleModifChange} className={fieldClass(errorsModif.specialites)} />
                  {errorsModif.specialites && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.specialites}</span>}
                </div>
                <div className="form-group">
                  <label>Niveau d'intervention <span className="req">*</span></label>
                  <select name="niveau_intervention" value={formModif.niveau_intervention} onChange={handleModifChange}
                    className={fieldClass(errorsModif.niveau_intervention)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="junior">Junior</option>
                    <option value="universitaire">Universitaire</option>
                    <option value="expert">Expert</option>
                  </select>
                  {errorsModif.niveau_intervention && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.niveau_intervention}</span>}
                </div>
                <div className="form-group">
                  <label>Type de contrat <span className="req">*</span></label>
                  <select name="type_contrat" value={formModif.type_contrat} onChange={handleModifChange}
                    className={fieldClass(errorsModif.type_contrat)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="interne">Interne</option>
                    <option value="vacation">Vacation</option>
                  </select>
                  {errorsModif.type_contrat && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.type_contrat}</span>}
                </div>
              </div>
              <div className="form-section-title"><i className="fa-solid fa-folder-open"></i> Documents administratifs (PDF)</div>
              {renderDocSection(formModif, setFormModif, "modif")}
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeModalModif}>Annuler</button>
              <button className="btn btn-update" onClick={handleSaveModif} disabled={saving}>
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Mise à jour...</>
                  : <><i className="fa-solid fa-rotate"></i> Mettre à jour</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalSuppr && (
        <div className="modal-overlay show" onClick={() => { setModalSuppr(null); setSupprErrMsg(""); setSupprErrFormations([]); }}>
          <div className="modal modal-suppr" onClick={(e) => e.stopPropagation()}>
            <div className="suppr-body">
              <div className="suppr-icon-wrap"><i className="fa-solid fa-trash-can"></i></div>
              <p className="suppr-title">Supprimer le formateur</p>
              <div className="suppr-card">
                <div className="suppr-card-avatar">
                  {modalSuppr.prenom.charAt(0).toUpperCase()}{modalSuppr.nom.charAt(0).toUpperCase()}
                </div>
                <div className="suppr-card-info">
                  <span className="suppr-card-name">{modalSuppr.prenom} {modalSuppr.nom}</span>
                  <span className="suppr-card-email">{modalSuppr.email}</span>
                </div>
              </div>
              {supprErrMsg && (
                <div className="suppr-blocked-error">
                  <div className="suppr-blocked-header">
                    <i className="fa-solid fa-ban"></i><span>{supprErrMsg}</span>
                  </div>
                  {supprErrFormations.length > 0 && (
                    <ul className="suppr-blocked-list">
                      {supprErrFormations.map((nom, i) => (
                        <li key={i}><i className="fa-solid fa-book-open"></i> {nom}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {!supprErrMsg && (
                <div className="suppr-warning">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>Cette action est <strong>irréversible</strong>. Toutes les données associées seront définitivement supprimées.</span>
                </div>
              )}
            </div>
            <div className="suppr-footer">
              <button className="btn-suppr-cancel" onClick={() => { setModalSuppr(null); setSupprErrMsg(""); setSupprErrFormations([]); }}>
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              {!supprErrMsg && (
                <button className="btn-suppr-confirm" onClick={confirmDelete} disabled={deleting}>
                  {deleting
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</>
                    : <><i className="fa-solid fa-trash"></i> Confirmer</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Formateurs;