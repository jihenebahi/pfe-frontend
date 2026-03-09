import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import "../../styles/infoCentre/Formateurs.css";
import {
  getFormateurs,
  createFormateur,
  updateFormateur,
  deleteFormateur,
} from "../../services/infoCentre/Formateurservice";

// ─── Valeur initiale du formulaire ───────────────────────────────────────────
const FORM_VIDE = {
  nom: "", prenom: "", email: "", telephone: "", adresse: "",
  specialites: "", niveau_intervention: "", type_contrat: "",
  disponibilites: "", heures_realisees: "",
  contrat_pdf: null, cv_pdf: null, diplomes_pdf: null,
};

const ERRORS_VIDE = {
  nom: "", prenom: "", email: "", telephone: "",
  specialites: "", niveau_intervention: "", type_contrat: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const levelClass = (n) =>
  n === "expert" ? "level-expert" : n === "universitaire" ? "level-universitaire" : "level-junior";

const contractClass = (c) =>
  c === "interne" ? "contract-interne" : "contract-vacation";

const niveauLabel = { junior: "Junior", universitaire: "Universitaire", expert: "Expert" };
const contratLabel = { interne: "Interne", vacation: "Vacation" };

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

// Retourne les formations d'un formateur sous forme de tableau d'objets
const toFormations = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [];
};

// ─── Validation ───────────────────────────────────────────────────────────────
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
    if (fieldMap[key]) {
      fieldErrs[fieldMap[key]] = msg;
    } else if (key !== "error" && key !== "formations") {
      globalMsg = globalMsg ? globalMsg + " " + msg : msg;
    }
  }
  return { fieldErrs, globalMsg };
};

// ─── Composant principal ──────────────────────────────────────────────────────
function Formateurs() {
  const [formateurs, setFormateurs]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [filterFormation, setFilterFormation] = useState(""); // filtre par formation

  // Modales
  const [modalDetail, setModalDetail] = useState(null);
  const [modalAjout,  setModalAjout]  = useState(false);
  const [modalModif,  setModalModif]  = useState(null);
  const [modalSuppr,  setModalSuppr]  = useState(null);

  // Formulaires
  const [formAjout, setFormAjout] = useState(FORM_VIDE);
  const [formModif, setFormModif] = useState(FORM_VIDE);

  // Erreurs champs
  const [errorsAjout, setErrorsAjout] = useState(ERRORS_VIDE);
  const [errorsModif, setErrorsModif] = useState(ERRORS_VIDE);

  // Erreurs globales backend
  const [globalErrAjout, setGlobalErrAjout] = useState("");
  const [globalErrModif, setGlobalErrModif] = useState("");

  // Erreur suppression bloquée
  const [supprErrMsg,        setSupprErrMsg]        = useState("");
  const [supprErrFormations, setSupprErrFormations]  = useState([]);

  // Messages succès
  const [successMsg, setSuccessMsg] = useState("");

  // Fichiers
  const [fileNamesAjout, setFileNamesAjout] = useState({ contrat_pdf: "", cv_pdf: "", diplomes_pdf: "" });
  const [fileNamesModif, setFileNamesModif] = useState({ contrat_pdf: "", cv_pdf: "", diplomes_pdf: "" });

  // Soumission
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  // ── Message succès auto-disparaît ───────────────────────────────────────────
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 3500);
    return () => clearTimeout(t);
  }, [successMsg]);

  // ── Chargement initial ───────────────────────────────────────────────────────
  useEffect(() => { fetchFormateurs(); }, []);

  const fetchFormateurs = async () => {
    try {
      setLoading(true); setError(null);
      const data = await getFormateurs();
      setFormateurs(data);
    } catch {
      setError("Impossible de charger les formateurs.");
    } finally {
      setLoading(false);
    }
  };

  // ── Liste unique de toutes les formations pour le filtre ─────────────────────
  const allFormations = Array.from(
    new Map(
      formateurs.flatMap((f) =>
        toFormations(f.formations).map((fm) => [fm.id, fm])
      )
    ).values()
  ).sort((a, b) => a.intitule.localeCompare(b.intitule));

  // ── Filtrage & pagination ────────────────────────────────────────────────────
  const filtered = formateurs.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      f.nom.toLowerCase().includes(q) ||
      f.prenom.toLowerCase().includes(q) ||
      toArray(f.specialites).some((s) => s.toLowerCase().includes(q));

    const matchFormation =
      !filterFormation ||
      toFormations(f.formations).some((fm) => String(fm.id) === filterFormation);

    return matchSearch && matchFormation;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Handlers fichiers ────────────────────────────────────────────────────────
  const handleFileChange = (e, field, setForm, setFileNames) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, [field]: file || null }));
    setFileNames((prev) => ({ ...prev, [field]: file ? file.name : "" }));
  };

  // ── Ajout ─────────────────────────────────────────────────────────────────────
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
      const newF = await createFormateur(formAjout);
      setFormateurs((prev) => [newF, ...prev]);
      setModalAjout(false);
      setFormAjout(FORM_VIDE);
      setErrorsAjout(ERRORS_VIDE);
      setGlobalErrAjout("");
      setFileNamesAjout({ contrat_pdf: "", cv_pdf: "", diplomes_pdf: "" });
      setPage(1);
      setSuccessMsg("Formateur ajouté avec succès !");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const { fieldErrs, globalMsg } = parseBackendErrors(data);
        setErrorsAjout((prev) => ({ ...prev, ...fieldErrs }));
        setGlobalErrAjout(globalMsg || "");
      } else {
        setGlobalErrAjout("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally { setSaving(false); }
  };

  const closeModalAjout = () => {
    setModalAjout(false);
    setFormAjout(FORM_VIDE);
    setErrorsAjout(ERRORS_VIDE);
    setGlobalErrAjout("");
    setFileNamesAjout({ contrat_pdf: "", cv_pdf: "", diplomes_pdf: "" });
  };

  // ── Modification ──────────────────────────────────────────────────────────────
  const openModif = (f) => {
    setFormModif({
      nom: f.nom, prenom: f.prenom, email: f.email,
      telephone: f.telephone || "", adresse: f.adresse || "",
      specialites: toArray(f.specialites).join(", "),
      niveau_intervention: f.niveau_intervention || "",
      type_contrat: f.type_contrat || "",
      disponibilites: f.disponibilites || "",
      heures_realisees: f.heures_realisees || 0,
      contrat_pdf: null, cv_pdf: null, diplomes_pdf: null,
    });
    setErrorsModif(ERRORS_VIDE);
    setGlobalErrModif("");
    setFileNamesModif({ contrat_pdf: "", cv_pdf: "", diplomes_pdf: "" });
    setModalModif(f);
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
      const updated = await updateFormateur(modalModif.id, formModif);
      setFormateurs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setModalModif(null);
      setSuccessMsg("Formateur modifié avec succès !");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const { fieldErrs, globalMsg } = parseBackendErrors(data);
        setErrorsModif((prev) => ({ ...prev, ...fieldErrs }));
        setGlobalErrModif(globalMsg || "");
      } else {
        setGlobalErrModif("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally { setSaving(false); }
  };

  const closeModalModif = () => {
    setModalModif(null);
    setErrorsModif(ERRORS_VIDE);
    setGlobalErrModif("");
  };

  // ── Suppression ───────────────────────────────────────────────────────────────
  const openSuppr = (f) => {
    setSupprErrMsg("");
    setSupprErrFormations([]);
    setModalSuppr(f);
  };

  const confirmDelete = async () => {
    if (!modalSuppr) return;
    setSupprErrMsg("");
    setSupprErrFormations([]);
    try {
      setDeleting(true);
      await deleteFormateur(modalSuppr.id);
      setFormateurs((prev) => prev.filter((f) => f.id !== modalSuppr.id));
      setModalSuppr(null);
      setPage(1);
      setSuccessMsg("Formateur supprimé avec succès !");
    } catch (err) {
      const data = err.response?.data;
      // HTTP 409 → suppression bloquée par formations associées
      if (err.response?.status === 409 && data?.error === "suppression_bloquee") {
        setSupprErrMsg(data.message);
        setSupprErrFormations(data.formations || []);
      } else {
        setSupprErrMsg("Une erreur est survenue lors de la suppression.");
      }
    } finally { setDeleting(false); }
  };

  // ── Helper classe erreur ─────────────────────────────────────────────────────
  const fieldClass = (err) => (err ? "input-error" : "");

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <Layout>

      {/* ── Message de succès ── */}
      {successMsg && (
        <div className="success-toast">
          <i className="fa-solid fa-circle-check"></i> {successMsg}
        </div>
      )}

      {/* ── En-tête ── */}
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-chalkboard-user"></i> Gestion des Formateurs
        </h1>
        <p className="page-sub">Liste et gestion de tous les formateurs du centre</p>
      </div>

      {/* ── Toolbar ── */}
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

          {/* Filtre par formation */}
          <select
            className="filter-sel"
            value={filterFormation}
            onChange={(e) => { setFilterFormation(e.target.value); setPage(1); }}
          >
            <option value="">Toutes les formations</option>
            {allFormations.map((fm) => (
              <option key={fm.id} value={String(fm.id)}>{fm.intitule}</option>
            ))}
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-add" onClick={() => setModalAjout(true)}>
            <i className="fa-solid fa-plus"></i> Nouveau Formateur
          </button>
        </div>
      </div>

      {/* ── Tableau ── */}
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
                <th>Formations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign:"center", padding:"30px", color:"#94A3B8" }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Chargement...
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign:"center", padding:"30px", color:"#94A3B8" }}>
                  Aucun formateur trouvé.
                </td></tr>
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
                      <td className="td-formations">
                        {fms.length > 0 ? (
                          fms.map((fm) => (
                            <span key={fm.id} className="formation-count-badge">
                              <i className="fa-solid fa-graduation-cap"></i> {fm.intitule}
                            </span>
                          ))
                        ) : (
                          <span className="no-formation">—</span>
                        )}
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

        {/* Pagination */}
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

      {/* ══════════════════════════════════════════════════════════════
          MODALE — DÉTAIL
      ══════════════════════════════════════════════════════════════ */}
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
              {/* Stat cards */}
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
                <div className="stat-card sc-green">
                  <div className="sc-icon"><i className="fa-solid fa-clock"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.heures_realisees}h</span>
                    <span className="sc-lbl">Heures réalisées</span>
                  </div>
                </div>
                <div className="stat-card sc-sand">
                  <div className="sc-icon"><i className="fa-solid fa-graduation-cap"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{toFormations(modalDetail.formations).length}</span>
                    <span className="sc-lbl">Formation(s)</span>
                  </div>
                </div>
              </div>

              <div className="detail-sections">
                {/* Infos perso */}
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

                {/* Infos pro */}
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
                    <div className="info-item">
                      <span className="info-lbl">Disponibilités</span>
                      <span className="info-val">{modalDetail.disponibilites}</span>
                    </div>
                  </div>
                </div>

                {/* Formations associées */}
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-graduation-cap"></i> Formations associées
                    <span className="detail-sec-count">{toFormations(modalDetail.formations).length}</span>
                  </div>
                  {toFormations(modalDetail.formations).length === 0 ? (
                    <div className="no-formations-msg">
                      <i className="fa-solid fa-circle-info"></i> Aucune formation associée à ce formateur.
                    </div>
                  ) : (
                    <div className="formations-list">
                      {toFormations(modalDetail.formations).map((fm, i) => (
                        <div className="formation-item" key={fm.id || i}>
                          <div className="formation-item-icon">
                            <i className="fa-solid fa-book-open"></i>
                          </div>
                          <div className="formation-item-info">
                            <span className="formation-item-title">{fm.intitule}</span>
                            {fm.categorie_nom && (
                              <span className="formation-item-cat">{fm.categorie_nom}</span>
                            )}
                          </div>
                          {fm.niveau && (
                            <span className={`formation-item-niveau niveau-${fm.niveau}`}>
                              {fm.niveau}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents PDF */}
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-folder-open"></i> Documents administratifs
                  </div>
                  <div className="docs-grid">
                    {[
                      { key: "contrat_pdf",  label: "Contrat",  icon: "fa-file-contract",  cls: "doc-contrat" },
                      { key: "cv_pdf",       label: "CV",       icon: "fa-file-lines",     cls: "doc-cv"      },
                      { key: "diplomes_pdf", label: "Diplômes", icon: "fa-graduation-cap", cls: "doc-diplome" },
                    ].map(({ key, label, icon, cls }) => (
                      <div className={`doc-card ${cls}`} key={key}>
                        <div className="doc-icon"><i className={`fa-solid ${icon}`}></i></div>
                        <div className="doc-info">
                          <span className="doc-name">{label}</span>
                          <span className="doc-file">{modalDetail[key] ? "PDF disponible" : "Non fourni"}</span>
                        </div>
                        {modalDetail[key] && (
                          <a href={modalDetail[key]} target="_blank" rel="noreferrer" className="doc-download" title="Télécharger">
                            <i className="fa-solid fa-download"></i>
                          </a>
                        )}
                      </div>
                    ))}
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

      {/* ══════════════════════════════════════════════════════════════
          MODALE — AJOUTER
      ══════════════════════════════════════════════════════════════ */}
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
                  <input type="text" name="nom" value={formAjout.nom} onChange={handleAjoutChange} placeholder="Ex : Ben Ali" className={fieldClass(errorsAjout.nom)} />
                  {errorsAjout.nom && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.nom}</span>}
                </div>
                <div className="form-group">
                  <label>Prénom <span className="req">*</span></label>
                  <input type="text" name="prenom" value={formAjout.prenom} onChange={handleAjoutChange} placeholder="Ex : Mohamed" className={fieldClass(errorsAjout.prenom)} />
                  {errorsAjout.prenom && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.prenom}</span>}
                </div>
                <div className="form-group">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" name="email" value={formAjout.email} onChange={handleAjoutChange} placeholder="Ex : m.benali@centre.tn" className={fieldClass(errorsAjout.email)} />
                  {errorsAjout.email && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.email}</span>}
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" name="telephone" value={formAjout.telephone} onChange={handleAjoutChange} placeholder="Ex : +21655123456" className={fieldClass(errorsAjout.telephone)} />
                  {errorsAjout.telephone && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.telephone}</span>}
                </div>
                <div className="form-group full">
                  <label>Adresse</label>
                  <input type="text" name="adresse" value={formAjout.adresse} onChange={handleAjoutChange} placeholder="Ex : 12 Rue de la Liberté, Tunis 1001" />
                </div>
              </div>

              <div className="form-section-title"><i className="fa-solid fa-briefcase"></i> Informations professionnelles</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Spécialités / Domaines <span className="req">*</span></label>
                  <input type="text" name="specialites" value={formAjout.specialites} onChange={handleAjoutChange} placeholder="Ex : Django, IA, Marketing Digital" className={fieldClass(errorsAjout.specialites)} />
                  {errorsAjout.specialites && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.specialites}</span>}
                </div>
                <div className="form-group">
                  <label>Niveau d'intervention <span className="req">*</span></label>
                  <select name="niveau_intervention" value={formAjout.niveau_intervention} onChange={handleAjoutChange} className={fieldClass(errorsAjout.niveau_intervention)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="junior">Junior</option>
                    <option value="universitaire">Universitaire</option>
                    <option value="expert">Expert</option>
                  </select>
                  {errorsAjout.niveau_intervention && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.niveau_intervention}</span>}
                </div>
                <div className="form-group">
                  <label>Type de contrat <span className="req">*</span></label>
                  <select name="type_contrat" value={formAjout.type_contrat} onChange={handleAjoutChange} className={fieldClass(errorsAjout.type_contrat)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="interne">Interne</option>
                    <option value="vacation">Vacation</option>
                  </select>
                  {errorsAjout.type_contrat && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsAjout.type_contrat}</span>}
                </div>
                <div className="form-group full">
                  <label>Disponibilités</label>
                  <input type="text" name="disponibilites" value={formAjout.disponibilites} onChange={handleAjoutChange} placeholder="Ex : Lundi - Vendredi, 08h00 - 17h00" />
                </div>
                <div className="form-group">
                  <label>Heures réalisées</label>
                  <input type="number" name="heures_realisees" min="0" value={formAjout.heures_realisees} onChange={handleAjoutChange} placeholder="Ex : 120" />
                </div>
              </div>

              <div className="form-section-title"><i className="fa-solid fa-folder-open"></i> Documents administratifs (PDF)</div>
              <div className="form-grid">
                {[
                  { field: "contrat_pdf",  label: "Contrat",  icon: "fa-file-contract",  id: "fileContrat"  },
                  { field: "cv_pdf",       label: "CV",       icon: "fa-file-lines",     id: "fileCv"       },
                  { field: "diplomes_pdf", label: "Diplômes", icon: "fa-graduation-cap", id: "fileDiplome"  },
                ].map(({ field, label, icon, id }) => (
                  <div className="form-group" key={field}>
                    <label><i className={`fa-solid ${icon} doc-lbl-icon`}></i> {label}</label>
                    <div className="file-upload-wrap">
                      <label className="file-upload-label" htmlFor={id}>
                        <i className="fa-solid fa-upload"></i> Choisir un PDF
                      </label>
                      <input type="file" id={id} accept=".pdf" onChange={(e) => handleFileChange(e, field, setFormAjout, setFileNamesAjout)} />
                      <span className="file-name">{fileNamesAjout[field] || "Aucun fichier choisi"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeModalAjout}>Annuler</button>
              <button className="btn btn-save" onClick={handleSaveAjout} disabled={saving}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...</> : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALE — MODIFIER
      ══════════════════════════════════════════════════════════════ */}
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
                  <select name="niveau_intervention" value={formModif.niveau_intervention} onChange={handleModifChange} className={fieldClass(errorsModif.niveau_intervention)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="junior">Junior</option>
                    <option value="universitaire">Universitaire</option>
                    <option value="expert">Expert</option>
                  </select>
                  {errorsModif.niveau_intervention && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.niveau_intervention}</span>}
                </div>
                <div className="form-group">
                  <label>Type de contrat <span className="req">*</span></label>
                  <select name="type_contrat" value={formModif.type_contrat} onChange={handleModifChange} className={fieldClass(errorsModif.type_contrat)}>
                    <option value="" disabled>Sélectionner...</option>
                    <option value="interne">Interne</option>
                    <option value="vacation">Vacation</option>
                  </select>
                  {errorsModif.type_contrat && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errorsModif.type_contrat}</span>}
                </div>
                <div className="form-group full">
                  <label>Disponibilités</label>
                  <input type="text" name="disponibilites" value={formModif.disponibilites} onChange={handleModifChange} />
                </div>
                <div className="form-group">
                  <label>Heures réalisées</label>
                  <input type="number" name="heures_realisees" min="0" value={formModif.heures_realisees} onChange={handleModifChange} />
                </div>
              </div>

              <div className="form-section-title"><i className="fa-solid fa-folder-open"></i> Documents administratifs (PDF)</div>
              <div className="form-grid">
                {[
                  { field: "contrat_pdf",  label: "Contrat",  icon: "fa-file-contract",  id: "modifContrat"  },
                  { field: "cv_pdf",       label: "CV",       icon: "fa-file-lines",     id: "modifCv"       },
                  { field: "diplomes_pdf", label: "Diplômes", icon: "fa-graduation-cap", id: "modifDiplome"  },
                ].map(({ field, label, icon, id }) => (
                  <div className="form-group" key={field}>
                    <label><i className={`fa-solid ${icon} doc-lbl-icon`}></i> {label}</label>
                    {modalModif[field] && (
                      <div className="file-existing">
                        <i className="fa-solid fa-file-pdf"></i>
                        <span>PDF existant</span>
                        <a href={modalModif[field]} target="_blank" rel="noreferrer" className="file-view-link" title="Voir">
                          <i className="fa-solid fa-eye"></i>
                        </a>
                      </div>
                    )}
                    <div className="file-upload-wrap" style={{ marginTop: "6px" }}>
                      <label className="file-upload-label file-replace" htmlFor={id}>
                        <i className="fa-solid fa-rotate"></i> {modalModif[field] ? "Remplacer" : "Choisir un PDF"}
                      </label>
                      <input type="file" id={id} accept=".pdf" onChange={(e) => handleFileChange(e, field, setFormModif, setFileNamesModif)} />
                      <span className="file-name">{fileNamesModif[field]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeModalModif}>Annuler</button>
              <button className="btn btn-update" onClick={handleSaveModif} disabled={saving}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Mise à jour...</> : <><i className="fa-solid fa-rotate"></i> Mettre à jour</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALE — CONFIRMER SUPPRESSION
      ══════════════════════════════════════════════════════════════ */}
      {modalSuppr && (
        <div className="modal-overlay show" onClick={() => { setModalSuppr(null); setSupprErrMsg(""); setSupprErrFormations([]); }}>
          <div className="modal modal-suppr" onClick={(e) => e.stopPropagation()}>

            <div className="suppr-body">
              <div className="suppr-icon-wrap">
                <i className="fa-solid fa-trash-can"></i>
              </div>
              <p className="suppr-title">Supprimer le formateur</p>

              {/* Carte identité */}
              <div className="suppr-card">
                <div className="suppr-card-avatar">
                  {modalSuppr.prenom.charAt(0).toUpperCase()}{modalSuppr.nom.charAt(0).toUpperCase()}
                </div>
                <div className="suppr-card-info">
                  <span className="suppr-card-name">{modalSuppr.prenom} {modalSuppr.nom}</span>
                  <span className="suppr-card-email">{modalSuppr.email}</span>
                </div>
              </div>

              {/* Erreur : suppression bloquée */}
              {supprErrMsg && (
                <div className="suppr-blocked-error">
                  <div className="suppr-blocked-header">
                    <i className="fa-solid fa-ban"></i>
                    <span>{supprErrMsg}</span>
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

              {/* Avertissement standard (seulement si pas d'erreur bloquée) */}
              {!supprErrMsg && (
                <div className="suppr-warning">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>
                    Cette action est <strong>irréversible</strong>. Toutes les données
                    associées seront définitivement supprimées.
                  </span>
                </div>
              )}
            </div>

            <div className="suppr-footer">
              <button className="btn-suppr-cancel" onClick={() => { setModalSuppr(null); setSupprErrMsg(""); setSupprErrFormations([]); }}>
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              {/* Bouton confirmer masqué si suppression bloquée */}
              {!supprErrMsg && (
                <button className="btn-suppr-confirm" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</> : <><i className="fa-solid fa-trash"></i> Confirmer</>}
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