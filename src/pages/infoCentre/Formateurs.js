import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/infoCentre/Formateurs.css";

// ─── Données fictives ────────────────────────────────────────────────────────
const FORMATEURS_INIT = [
  {
    id: 1,
    nom: "Ben Ali",
    prenom: "Mohamed",
    email: "m.benali@centre.tn",
    telephone: "+216 55 123 456",
    adresse: "12 Rue de la Liberté, Tunis 1001",
    specialites: ["Informatique", "Data"],
    niveau: "Expert",
    contrat: "Interne",
    disponibilites: "Lundi - Vendredi, 08h00 - 17h00",
    formations: ["Développement Web Full Stack", "Intelligence Artificielle Appliquée", "Python pour Data Science"],
    heures: 240,
    docs: { contrat: "contrat_benali.pdf", cv: "cv_benali.pdf", diplome: "diplomes_benali.pdf" },
  },
  {
    id: 2,
    nom: "Trabelsi",
    prenom: "Sonia",
    email: "s.trabelsi@centre.tn",
    telephone: "+216 98 234 567",
    adresse: "45 Avenue Habib Bourguiba, Sfax 3000",
    specialites: ["IA", "Data"],
    niveau: "Expert",
    contrat: "Vacation",
    disponibilites: "Mardi - Jeudi, 09h00 - 16h00",
    formations: ["Intelligence Artificielle Appliquée", "Python pour Data Science"],
    heures: 180,
    docs: { contrat: "contrat_trabelsi.pdf", cv: "cv_trabelsi.pdf", diplome: "diplomes_trabelsi.pdf" },
  },
  {
    id: 3,
    nom: "Hamdi",
    prenom: "Karim",
    email: "k.hamdi@centre.tn",
    telephone: "+216 22 345 678",
    adresse: "78 Rue Ibn Khaldoun, Sousse 4000",
    specialites: ["Marketing", "Soft skills"],
    niveau: "Universitaire",
    contrat: "Interne",
    disponibilites: "Lundi - Mercredi, 08h00 - 14h00",
    formations: ["Marketing Digital et Réseaux Sociaux", "Management de Projet Agile"],
    heures: 120,
    docs: { contrat: "contrat_hamdi.pdf", cv: "cv_hamdi.pdf", diplome: "diplomes_hamdi.pdf" },
  },
  {
    id: 4,
    nom: "Mejri",
    prenom: "Ines",
    email: "i.mejri@centre.tn",
    telephone: "+216 50 456 789",
    adresse: "23 Rue du Printemps, Monastir 5000",
    specialites: ["Design"],
    niveau: "Junior",
    contrat: "Vacation",
    disponibilites: "Mercredi - Vendredi, 10h00 - 17h00",
    formations: ["UI/UX Design et Figma"],
    heures: 80,
    docs: { contrat: "contrat_mejri.pdf", cv: "cv_mejri.pdf", diplome: "diplomes_mejri.pdf" },
  },
  {
    id: 5,
    nom: "Gharbi",
    prenom: "Nabil",
    email: "n.gharbi@centre.tn",
    telephone: "+216 27 567 890",
    adresse: "10 Rue des Roses, Nabeul 8000",
    specialites: ["Langues"],
    niveau: "Expert",
    contrat: "Interne",
    disponibilites: "Lundi - Vendredi, 08h00 - 17h00",
    formations: ["Anglais des Affaires"],
    heures: 300,
    docs: { contrat: "contrat_gharbi.pdf", cv: "cv_gharbi.pdf", diplome: "diplomes_gharbi.pdf" },
  },
];

const FORM_VIDE = {
  nom: "", prenom: "", email: "", telephone: "", adresse: "",
  specialites: "", niveau: "", contrat: "", disponibilites: "",
  heures: "",
};

// ─── Composant principal ──────────────────────────────────────────────────────
function Formateurs() {
  const [formateurs, setFormateurs] = useState(FORMATEURS_INIT);
  const [search, setSearch] = useState("");

  // Modales
  const [modalDetail, setModalDetail] = useState(null);
  const [modalAjout, setModalAjout] = useState(false);
  const [modalModif, setModalModif] = useState(null);

  // Formulaire ajout
  const [formAjout, setFormAjout] = useState(FORM_VIDE);
  const [fileNamesAjout, setFileNamesAjout] = useState({ contrat: "", cv: "", diplome: "" });

  // Formulaire modif
  const [formModif, setFormModif] = useState(FORM_VIDE);
  const [fileNamesModif, setFileNamesModif] = useState({ contrat: "", cv: "", diplome: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const filtered = formateurs.filter((f) => {
    const q = search.toLowerCase();
    return (
      !q ||
      f.nom.toLowerCase().includes(q) ||
      f.prenom.toLowerCase().includes(q) ||
      f.specialites.some((s) => s.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const pad = (n) => String(n).padStart(2, "0");

  const handleFileChange = (e, field, setter) => {
    const file = e.target.files[0];
    setter((prev) => ({ ...prev, [field]: file ? file.name : "" }));
  };

  // ── Ajout ────────────────────────────────────────────────────────────────────
  const handleAjoutChange = (e) => {
    const { name, value } = e.target;
    setFormAjout((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAjout = () => {
    if (!formAjout.nom || !formAjout.prenom || !formAjout.email) return;
    const newF = {
      id: Date.now(),
      ...formAjout,
      specialites: formAjout.specialites.split(",").map((s) => s.trim()).filter(Boolean),
      heures: Number(formAjout.heures) || 0,
      formations: [],
      docs: {
        contrat: fileNamesAjout.contrat || "—",
        cv: fileNamesAjout.cv || "—",
        diplome: fileNamesAjout.diplome || "—",
      },
    };
    setFormateurs((prev) => [...prev, newF]);
    setModalAjout(false);
    setFormAjout(FORM_VIDE);
    setFileNamesAjout({ contrat: "", cv: "", diplome: "" });
    setPage(1);
  };

  // ── Modification ──────────────────────────────────────────────────────────────
  const openModif = (f) => {
    setFormModif({
      nom: f.nom,
      prenom: f.prenom,
      email: f.email,
      telephone: f.telephone,
      adresse: f.adresse,
      specialites: f.specialites.join(", "),
      niveau: f.niveau,
      contrat: f.contrat,
      disponibilites: f.disponibilites,
      heures: f.heures,
    });
    setFileNamesModif({ contrat: "", cv: "", diplome: "" });
    setModalModif(f);
  };

  const handleModifChange = (e) => {
    const { name, value } = e.target;
    setFormModif((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveModif = () => {
    setFormateurs((prev) =>
      prev.map((f) =>
        f.id === modalModif.id
          ? {
              ...f,
              ...formModif,
              specialites: formModif.specialites.split(",").map((s) => s.trim()).filter(Boolean),
              heures: Number(formModif.heures) || 0,
              formations: f.formations, // on garde les formations existantes
              docs: {
                contrat: fileNamesModif.contrat || f.docs.contrat,
                cv: fileNamesModif.cv || f.docs.cv,
                diplome: fileNamesModif.diplome || f.docs.diplome,
              },
            }
          : f
      )
    );
    setModalModif(null);
  };

  // ── Suppression ───────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (window.confirm("Confirmer la suppression de ce formateur ?")) {
      setFormateurs((prev) => prev.filter((f) => f.id !== id));
      setPage(1);
    }
  };

  // ── Niveau / Contrat helpers ───────────────────────────────────────────────────
  const levelClass = (n) =>
    n === "Expert" ? "level-expert" : n === "Universitaire" ? "level-universitaire" : "level-junior";

  const contractClass = (c) =>
    c === "Interne" ? "contract-interne" : "contract-vacation";

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <Layout>
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
          Affichage de <strong>{paginated.length}</strong> formateurs sur{" "}
          <strong>{filtered.length}</strong>
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
              {paginated.map((f, idx) => (
                <tr key={f.id}>
                  <td className="td-num">{pad((page - 1) * PER_PAGE + idx + 1)}</td>
                  <td className="td-name">{f.nom}</td>
                  <td className="td-firstname">{f.prenom}</td>
                  <td className="td-email">
                    <a href={`mailto:${f.email}`}>{f.email}</a>
                  </td>
                  <td className="td-phone">{f.telephone}</td>
                  <td>
                    {f.specialites.map((s) => (
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
                    <button className="act-btn act-suppr" title="Supprimer" onClick={() => handleDelete(f.id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94A3B8" }}>
                    Aucun formateur trouvé.
                  </td>
                </tr>
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
              <button
                key={n}
                className={`pg-num${page === n ? " active" : ""}`}
                onClick={() => setPage(n)}
              >
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
                    {modalDetail.specialites.map((s) => (
                      <span key={s} className="spec-tag">{s}</span>
                    ))}
                    <span className={`contract-tag ${contractClass(modalDetail.contrat)}`}>
                      <i className="fa-solid fa-id-card"></i> {modalDetail.contrat}
                    </span>
                    <span className={`level-tag ${levelClass(modalDetail.niveau)}`}>
                      <i className="fa-solid fa-star"></i> {modalDetail.niveau}
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
                    <span className="sc-val">{modalDetail.heures}h</span>
                    <span className="sc-lbl">Heures réalisées</span>
                  </div>
                </div>
                <div className="stat-card sc-sand">
                  <div className="sc-icon"><i className="fa-solid fa-book-open"></i></div>
                  <div className="sc-info">
                    <span className="sc-val">{modalDetail.formations.length} formations</span>
                    <span className="sc-lbl">Formations assurées</span>
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
                      <span className="info-lbl">Spécialités / Domaines</span>
                      <span className="info-val">
                        {modalDetail.specialites.map((s) => <span key={s} className="spec-tag">{s}</span>)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-lbl">Niveau d'intervention</span>
                      <span className="info-val">
                        <span className={`level-tag ${levelClass(modalDetail.niveau)}`}>{modalDetail.niveau}</span>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-lbl">Type de contrat</span>
                      <span className="info-val">
                        <span className={`contract-tag ${contractClass(modalDetail.contrat)}`}>{modalDetail.contrat}</span>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-lbl">Disponibilités</span>
                      <span className="info-val">{modalDetail.disponibilites}</span>
                    </div>
                  </div>
                </div>

                {/* Suivi — visible uniquement dans le détail */}
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-chart-bar"></i> Suivi
                  </div>
                  <div className="detail-info-grid">
                    <div className="info-item full-info">
                      <span className="info-lbl">Formations assurées</span>
                      <span className="info-val">
                        {modalDetail.formations.length > 0
                          ? modalDetail.formations.map((f) => <span key={f} className="fmt-badge">{f}</span>)
                          : <span style={{ color: "#94A3B8", fontSize: "13px" }}>Aucune formation renseignée</span>
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-lbl">Heures réalisées</span>
                      <span className="info-val info-val-accent">{modalDetail.heures} heures</span>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="detail-sec">
                  <div className="detail-sec-title">
                    <i className="fa-solid fa-folder-open"></i> Documents administratifs
                  </div>
                  <div className="docs-grid">
                    <div className="doc-card doc-contrat">
                      <div className="doc-icon"><i className="fa-solid fa-file-contract"></i></div>
                      <div className="doc-info">
                        <span className="doc-name">Contrat</span>
                        <span className="doc-file">{modalDetail.docs.contrat}</span>
                      </div>
                      <a href="#" className="doc-download" title="Télécharger"><i className="fa-solid fa-download"></i></a>
                    </div>
                    <div className="doc-card doc-cv">
                      <div className="doc-icon"><i className="fa-solid fa-file-lines"></i></div>
                      <div className="doc-info">
                        <span className="doc-name">CV</span>
                        <span className="doc-file">{modalDetail.docs.cv}</span>
                      </div>
                      <a href="#" className="doc-download" title="Télécharger"><i className="fa-solid fa-download"></i></a>
                    </div>
                    <div className="doc-card doc-diplome">
                      <div className="doc-icon"><i className="fa-solid fa-graduation-cap"></i></div>
                      <div className="doc-info">
                        <span className="doc-name">Diplômes</span>
                        <span className="doc-file">{modalDetail.docs.diplome}</span>
                      </div>
                      <a href="#" className="doc-download" title="Télécharger"><i className="fa-solid fa-download"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalDetail(null)}>Fermer</button>
              <button
                className="btn btn-update"
                onClick={() => { setModalDetail(null); openModif(modalDetail); }}
              >
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
        <div className="modal-overlay show" onClick={() => setModalAjout(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fa-solid fa-plus-circle"></i> Ajouter un Formateur</h2>
              <button className="modal-close" onClick={() => setModalAjout(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">

              {/* Informations personnelles */}
              <div className="form-section-title"><i className="fa-solid fa-user"></i> Informations personnelles</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom <span className="req">*</span></label>
                  <input type="text" name="nom" value={formAjout.nom} onChange={handleAjoutChange} placeholder="Ex : Ben Ali" />
                </div>
                <div className="form-group">
                  <label>Prénom <span className="req">*</span></label>
                  <input type="text" name="prenom" value={formAjout.prenom} onChange={handleAjoutChange} placeholder="Ex : Mohamed" />
                </div>
                <div className="form-group">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" name="email" value={formAjout.email} onChange={handleAjoutChange} placeholder="Ex : m.benali@centre.tn" />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" name="telephone" value={formAjout.telephone} onChange={handleAjoutChange} placeholder="Ex : +216 55 123 456" />
                </div>
                <div className="form-group full">
                  <label>Adresse</label>
                  <input type="text" name="adresse" value={formAjout.adresse} onChange={handleAjoutChange} placeholder="Ex : 12 Rue de la Liberté, Tunis 1001" />
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="form-section-title"><i className="fa-solid fa-briefcase"></i> Informations professionnelles</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Spécialités / Domaines <span className="req">*</span></label>
                  <input type="text" name="specialites" value={formAjout.specialites} onChange={handleAjoutChange} placeholder="Ex : Informatique, Data Science, IA..." />
                </div>
                <div className="form-group">
                  <label>Niveau d'intervention <span className="req">*</span></label>
                  <select name="niveau" value={formAjout.niveau} onChange={handleAjoutChange}>
                    <option value="" disabled>Sélectionner...</option>
                    <option>Junior</option>
                    <option>Universitaire</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type de contrat <span className="req">*</span></label>
                  <select name="contrat" value={formAjout.contrat} onChange={handleAjoutChange}>
                    <option value="" disabled>Sélectionner...</option>
                    <option>Interne</option>
                    <option>Vacation</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Disponibilités</label>
                  <input type="text" name="disponibilites" value={formAjout.disponibilites} onChange={handleAjoutChange} placeholder="Ex : Lundi - Vendredi, 08h00 - 17h00" />
                </div>
                <div className="form-group">
                  <label>Heures réalisées</label>
                  <input type="number" name="heures" min="0" value={formAjout.heures} onChange={handleAjoutChange} placeholder="Ex : 120" />
                </div>
              </div>

              {/* Documents administratifs */}
              <div className="form-section-title"><i className="fa-solid fa-folder-open"></i> Documents administratifs</div>
              <div className="form-grid">
                {[
                  { field: "contrat", label: "Contrat", icon: "fa-file-contract", id: "fileContrat" },
                  { field: "cv", label: "CV", icon: "fa-file-lines", id: "fileCv" },
                  { field: "diplome", label: "Diplômes", icon: "fa-graduation-cap", id: "fileDiplome" },
                ].map(({ field, label, icon, id }) => (
                  <div className="form-group" key={field}>
                    <label><i className={`fa-solid ${icon} doc-lbl-icon`}></i> {label}</label>
                    <div className="file-upload-wrap">
                      <label className="file-upload-label" htmlFor={id}>
                        <i className="fa-solid fa-upload"></i> Choisir un fichier
                      </label>
                      <input
                        type="file"
                        id={id}
                        accept=".pdf,.doc,.docx,.zip"
                        onChange={(e) => handleFileChange(e, field, setFileNamesAjout)}
                      />
                      <span className="file-name">{fileNamesAjout[field] || "Aucun fichier choisi"}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalAjout(false)}>Annuler</button>
              <button className="btn btn-save" onClick={handleSaveAjout}>
                <i className="fa-solid fa-floppy-disk"></i> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALE — MODIFIER
      ══════════════════════════════════════════════════════════════ */}
      {modalModif && (
        <div className="modal-overlay show" onClick={() => setModalModif(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modif-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier le Formateur</h2>
              <button className="modal-close" onClick={() => setModalModif(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">

              {/* Informations personnelles */}
              <div className="form-section-title"><i className="fa-solid fa-user"></i> Informations personnelles</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom <span className="req">*</span></label>
                  <input type="text" name="nom" value={formModif.nom} onChange={handleModifChange} />
                </div>
                <div className="form-group">
                  <label>Prénom <span className="req">*</span></label>
                  <input type="text" name="prenom" value={formModif.prenom} onChange={handleModifChange} />
                </div>
                <div className="form-group">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" name="email" value={formModif.email} onChange={handleModifChange} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" name="telephone" value={formModif.telephone} onChange={handleModifChange} />
                </div>
                <div className="form-group full">
                  <label>Adresse</label>
                  <input type="text" name="adresse" value={formModif.adresse} onChange={handleModifChange} />
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="form-section-title"><i className="fa-solid fa-briefcase"></i> Informations professionnelles</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Spécialités / Domaines <span className="req">*</span></label>
                  <input type="text" name="specialites" value={formModif.specialites} onChange={handleModifChange} />
                </div>
                <div className="form-group">
                  <label>Niveau d'intervention <span className="req">*</span></label>
                  <select name="niveau" value={formModif.niveau} onChange={handleModifChange}>
                    <option>Junior</option>
                    <option>Universitaire</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type de contrat <span className="req">*</span></label>
                  <select name="contrat" value={formModif.contrat} onChange={handleModifChange}>
                    <option>Interne</option>
                    <option>Vacation</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Disponibilités</label>
                  <input type="text" name="disponibilites" value={formModif.disponibilites} onChange={handleModifChange} />
                </div>
                <div className="form-group">
                  <label>Heures réalisées</label>
                  <input type="number" name="heures" min="0" value={formModif.heures} onChange={handleModifChange} />
                </div>
              </div>

              {/* Documents administratifs */}
              <div className="form-section-title"><i className="fa-solid fa-folder-open"></i> Documents administratifs</div>
              <div className="form-grid">
                {[
                  { field: "contrat", label: "Contrat", icon: "fa-file-contract", id: "modifContrat" },
                  { field: "cv", label: "CV", icon: "fa-file-lines", id: "modifCv" },
                  { field: "diplome", label: "Diplômes", icon: "fa-graduation-cap", id: "modifDiplome" },
                ].map(({ field, label, icon, id }) => (
                  <div className="form-group" key={field}>
                    <label><i className={`fa-solid ${icon} doc-lbl-icon`}></i> {label}</label>
                    <div className="file-existing">
                      <i className="fa-solid fa-file-pdf"></i>
                      <span>{modalModif.docs[field]}</span>
                      <a href="#" className="file-view-link" title="Voir"><i className="fa-solid fa-eye"></i></a>
                    </div>
                    <div className="file-upload-wrap" style={{ marginTop: "6px" }}>
                      <label className="file-upload-label file-replace" htmlFor={id}>
                        <i className="fa-solid fa-rotate"></i> Remplacer
                      </label>
                      <input
                        type="file"
                        id={id}
                        accept=".pdf,.doc,.docx,.zip"
                        onChange={(e) => handleFileChange(e, field, setFileNamesModif)}
                      />
                      <span className="file-name">{fileNamesModif[field]}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModalModif(null)}>Annuler</button>
              <button className="btn btn-update" onClick={handleSaveModif}>
                <i className="fa-solid fa-rotate"></i> Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Formateurs;