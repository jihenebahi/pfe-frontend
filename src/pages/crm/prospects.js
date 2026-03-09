import React, { useState, useEffect } from 'react';
import Layout from "../../components/Layout";
import '../../styles/crm/prospects.css';

const Prospects = () => {
  // Data constants
  const FORMATIONS = [
    { id: 1, label: "React Avancé", duree: "40h" },
    { id: 2, label: "Python Data Science", duree: "60h" },
    { id: 3, label: "UI/UX Design", duree: "35h" },
    { id: 4, label: "Angular Débutant", duree: "30h" },
    { id: 5, label: "DevOps CI/CD", duree: "50h" },
    { id: 6, label: "Node.js REST API", duree: "45h" },
  ];

  const STATUT_COLORS = {
    "Nouveau": { bg: "rgba(51,204,255,.14)", color: "#1A7A99", border: "rgba(51,204,255,.35)" },
    "Contacté": { bg: "rgba(255,204,51,.18)", color: "#8A6800", border: "rgba(255,204,51,.45)" },
    "En cours": { bg: "rgba(51,102,153,.13)", color: "#1E3A5F", border: "rgba(51,102,153,.30)" },
    "Qualifié": { bg: "rgba(26,107,74,.12)", color: "#1A6B4A", border: "rgba(26,107,74,.30)" },
    "Perdu": { bg: "rgba(229,62,62,.10)", color: "#c0392b", border: "rgba(229,62,62,.30)" },
  };

  const SOURCES = ["Facebook", "Instagram", "TikTok", "LinkedIn", "Google", "Site web", "Recommandation", "Appel entrant", "Autre"];
  const RESPONSABLES = ["Admin", "Assistante", "Commercial"];
  const PAYS_LIST = ["Tunisie", "France", "Algérie", "Maroc", "Belgique", "Canada", "Autre"];

  // Initial prospects data
  const PROSPECTS_DATA = [
    { id: 1, nom: "Ben Ali", prenom: "Sami", email: "sami.benali@email.com", tel: "+216 22 111 000", ville: "Tunis", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "React Avancé", niveau: "Intermédiaire", modePreference: "Présentiel", disponibilite: "Week-ends", canalContact: "WhatsApp", responsable: "Admin", statut: "Nouveau", date: "2025-01-10", source: "Site web", notes: "Intéressé par la formation React. A déjà des bases en JavaScript." },
    { id: 2, nom: "Trabelsi", prenom: "Ines", email: "ines.trabelsi@email.com", tel: "+216 55 222 111", ville: "Sfax", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Les deux", formation: "Python Data Science", niveau: "Débutant", modePreference: "En ligne", disponibilite: "Soirs", canalContact: "Email", responsable: "Admin", statut: "Contacté", date: "2025-01-12", source: "Appel entrant", notes: "Cherche une reconversion professionnelle." },
    { id: 3, nom: "Meddeb", prenom: "Karim", email: "k.meddeb@email.com", tel: "+216 99 333 222", ville: "Sousse", pays: "Tunisie", typeProspect: "Entreprise", serviceRecherche: "Consulting", formation: "UI/UX Design", niveau: "Avancé", modePreference: "Hybride", disponibilite: "Jours ouvrables", canalContact: "Téléphone", responsable: "Admin", statut: "En cours", date: "2025-01-15", source: "Recommandation", notes: "Envoyé par un ancien étudiant." },
    { id: 4, nom: "Chaabane", prenom: "Leila", email: "leila.ch@email.com", tel: "+216 44 444 333", ville: "Tunis", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "Angular Débutant", niveau: "Débutant", modePreference: "Présentiel", disponibilite: "Week-ends", canalContact: "WhatsApp", responsable: "Admin", statut: "Qualifié", date: "2025-01-18", source: "LinkedIn", notes: "Profil junior, très motivée." },
    { id: 5, nom: "Romdhani", prenom: "Nour", email: "nour.r@email.com", tel: "+216 77 555 444", ville: "Bizerte", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "React Avancé", niveau: "Intermédiaire", modePreference: "En ligne", disponibilite: "", canalContact: "Email", responsable: "Admin", statut: "Perdu", date: "2025-01-20", source: "Site web", notes: "N'a pas donné suite." },
    { id: 6, nom: "Hamdi", prenom: "Zied", email: "zied.hamdi@email.com", tel: "+216 22 666 555", ville: "Tunis", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "DevOps CI/CD", niveau: "Avancé", modePreference: "Présentiel", disponibilite: "Matin", canalContact: "Téléphone", responsable: "Admin", statut: "Nouveau", date: "2025-01-22", source: "Google", notes: "Rempli formulaire en ligne." },
    { id: 7, nom: "Jebali", prenom: "Amira", email: "amira.j@email.com", tel: "+216 55 777 666", ville: "Nabeul", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "Python Data Science", niveau: "Débutant", modePreference: "Hybride", disponibilite: "Après-midi", canalContact: "WhatsApp", responsable: "Assistante", statut: "Contacté", date: "2025-01-25", source: "Facebook", notes: "Contactée via pub Facebook." },
    { id: 8, nom: "Boukadida", prenom: "Yassine", email: "y.boukadida@email.com", tel: "+216 99 888 777", ville: "Monastir", pays: "Tunisie", typeProspect: "Entreprise", serviceRecherche: "Les deux", formation: "UI/UX Design", niveau: "Intermédiaire", modePreference: "En ligne", disponibilite: "Soirs", canalContact: "Email", responsable: "Commercial", statut: "En cours", date: "2025-01-28", source: "Appel entrant", notes: "Demande devis personnalisé." },
    { id: 9, nom: "Gharbi", prenom: "Rim", email: "rim.gharbi@email.com", tel: "+216 44 999 888", ville: "Tunis", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "Angular Débutant", niveau: "Débutant", modePreference: "Présentiel", disponibilite: "Week-ends", canalContact: "Téléphone", responsable: "Admin", statut: "Qualifié", date: "2025-02-01", source: "Instagram", notes: "Dossier complet reçu." },
    { id: 10, nom: "Zaabi", prenom: "Mohamed", email: "med.zaabi@email.com", tel: "+216 77 000 999", ville: "Tunis", pays: "Tunisie", typeProspect: "Entreprise", serviceRecherche: "Consulting", formation: "DevOps CI/CD", niveau: "Avancé", modePreference: "Hybride", disponibilite: "Jours ouvrables", canalContact: "Email", responsable: "Commercial", statut: "Nouveau", date: "2025-02-03", source: "Recommandation", notes: "Recommandé par un partenaire." },
    { id: 11, nom: "Sfaxi", prenom: "Sara", email: "sara.sfaxi@email.com", tel: "+216 22 111 999", ville: "Sfax", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "React Avancé", niveau: "Avancé", modePreference: "En ligne", disponibilite: "Soirs", canalContact: "WhatsApp", responsable: "Assistante", statut: "Contacté", date: "2025-02-05", source: "LinkedIn", notes: "Profil senior, cherche upgrade." },
    { id: 12, nom: "Chebbi", prenom: "Ali", email: "ali.chebbi@email.com", tel: "+216 55 222 888", ville: "Tunis", pays: "Tunisie", typeProspect: "Particulier", serviceRecherche: "Formation", formation: "Python Data Science", niveau: "Intermédiaire", modePreference: "Présentiel", disponibilite: "Matin", canalContact: "Téléphone", responsable: "Admin", statut: "En cours", date: "2025-02-07", source: "Site web", notes: "En attente du planning." },
  ];

  // State
  const [prospects, setProspects] = useState(PROSPECTS_DATA);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [sortAlpha, setSortAlpha] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [selectedForms, setSelectedForms] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModifModal, setShowModifModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form data states for modals with buttons in footer
  const [addFormData, setAddFormData] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const PER_PAGE = 8;

  // Toast timer
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter and sort prospects
  const getFilteredProspects = () => {
    let filtered = [...prospects];
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(q) || 
        p.prenom.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) || 
        p.tel.includes(q)
      );
    }
    
    if (filterStatut !== "Tous") {
      filtered = filtered.filter(p => p.statut === filterStatut);
    }
    
    if (sortAlpha) {
      filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }
    
    return filtered;
  };

  const filteredProspects = getFilteredProspects();
  const totalPages = Math.max(1, Math.ceil(filteredProspects.length / PER_PAGE));
  const currentProspects = filteredProspects.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  // Handlers
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilter = (value) => {
    setFilterStatut(value);
    setCurrentPage(1);
  };

  const toggleSort = () => {
    setSortAlpha(!sortAlpha);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Add prospect
  const openAdd = () => {
    setAddFormData(null);
    setShowAddModal(true);
  };

  const closeAdd = () => {
    setShowAddModal(false);
    setAddFormData(null);
  };

  const handleAdd = () => {
    if (!addFormData) return;
    
    const { nom, prenom, email } = addFormData;
    if (!nom || !prenom || !email) {
      showToast("Veuillez remplir les champs obligatoires (Nom, Prénom, Email).", "error");
      return;
    }
    
    const newProspect = {
      ...addFormData,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10)
    };
    
    setProspects([newProspect, ...prospects]);
    closeAdd();
    showToast("Prospect ajouté avec succès !");
  };

  // Edit prospect
  const openEdit = (id) => {
    const prospect = prospects.find(p => p.id === id);
    if (prospect) {
      setEditTarget(prospect);
      setEditFormData({ ...prospect });
      setShowModifModal(true);
      setShowDetailModal(false);
    }
  };

  const closeModif = () => {
    setShowModifModal(false);
    setEditTarget(null);
    setEditFormData(null);
  };

  const handleModif = () => {
    if (!editTarget || !editFormData) return;
    
    const { nom, prenom, email } = editFormData;
    if (!nom || !prenom || !email) {
      showToast("Veuillez remplir les champs obligatoires.", "error");
      return;
    }
    
    setProspects(prospects.map(p => 
      p.id === editTarget.id ? { ...editTarget, ...editFormData } : p
    ));
    
    closeModif();
    showToast("Prospect modifié avec succès !");
  };

  // Detail prospect
  const openDetail = (id) => {
    const prospect = prospects.find(p => p.id === id);
    if (prospect) {
      setDetailTarget(prospect);
      setConvertOpen(false);
      setSelectedForms([]);
      setShowDetailModal(true);
    }
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setDetailTarget(null);
    setConvertOpen(false);
    setSelectedForms([]);
  };

  const switchToEdit = () => {
    if (detailTarget) {
      openEdit(detailTarget.id);
    }
  };

  const deleteFromDetail = () => {
    if (detailTarget) {
      const id = detailTarget.id;
      closeDetail();
      openDelete(id);
    }
  };

  const toggleConvert = () => {
    setConvertOpen(!convertOpen);
    setSelectedForms([]);
  };

  const toggleForm = (id) => {
    setSelectedForms(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConvert = () => {
    if (selectedForms.length === 0) {
      showToast("Sélectionnez au moins une formation.", "error");
      return;
    }
    
    showToast(`Prospect converti en étudiant ! (${selectedForms.length} formation(s))`);
    setProspects(prospects.filter(p => p.id !== detailTarget.id));
    closeDetail();
  };

  // Delete prospect
  const openDelete = (id) => {
    const prospect = prospects.find(p => p.id === id);
    if (prospect) {
      setDeleteTarget(prospect);
      setShowDeleteModal(true);
    }
  };

  const closeDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProspects(prospects.filter(p => p.id !== deleteTarget.id));
    closeDelete();
    showToast("Prospect supprimé.");
  };

  // Helper to handle modal overlay click
  const handleOverlay = (e, closeFn) => {
    if (e.target === e.currentTarget) closeFn();
  };

  return (
    <Layout>
      {/* Page header */}
      <div className="prsp-header">
        <div className="prsp-title">
          <i className="fa-solid fa-user-plus"></i>
          Gestion des Prospects
        </div>
        <div className="prsp-sub">
          Gérez le cycle de vie de vos prospects et convertissez-les en étudiants
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="tb-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              placeholder="Rechercher..." 
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select 
            className="filter-sel"
            value={filterStatut}
            onChange={(e) => handleFilter(e.target.value)}
          >
            <option>Tous</option>
            <option>Nouveau</option>
            <option>Contacté</option>
            <option>En cours</option>
            <option>Qualifié</option>
            <option>Perdu</option>
          </select>
          <button 
            className={`btn btn-sort ${sortAlpha ? 'active' : ''}`}
            onClick={toggleSort}
          >
            <i className="fa-solid fa-arrow-down-a-z"></i> A → Z
          </button>
        </div>
        <div className="tb-right">
          <button 
            className="btn btn-imp"
            onClick={() => showToast('Import CSV bientôt disponible.', 'error')}
          >
            <i className="fa-solid fa-file-import"></i> Importer
          </button>
          <button className="btn btn-add" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Ajouter un prospect
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-top">
          <strong>{filteredProspects.length}</strong> prospect
          {filteredProspects.length !== 1 ? 's' : ''} trouvé
          {filteredProspects.length !== 1 ? 's' : ''}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: "32px" }}>#</th>
                <th>Nom & Prénom</th>
                <th>Contact</th>
                <th>Formation souhaitée</th>
                <th>Statut</th>
                <th>Source</th>
                <th>Date</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProspects.map((p, i) => {
                const sc = STATUT_COLORS[p.statut] || {};
                return (
                  <tr key={p.id}>
                    <td className="td-num">
                      {(currentPage - 1) * PER_PAGE + i + 1}
                    </td>
                    <td>
                      <div className="td-name">{p.nom} {p.prenom}</div>
                      <div className="td-sub">{p.email}</div>
                    </td>
                    <td>
                      <div className="td-sub">{p.email}</div>
                      <div className="td-sub">{p.tel}</div>
                    </td>
                    <td className="td-sub">{p.formation || '—'}</td>
                    <td>
                      <span 
                        className="badge" 
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`
                        }}
                      >
                        {p.statut}
                      </span>
                    </td>
                    <td>
                      <span className="src-tag">{p.source}</span>
                    </td>
                    <td className="td-sub">{p.date}</td>
                    <td className="td-actions">
                      <button 
                        className="act-btn act-detail" 
                        title="Détail"
                        onClick={() => openDetail(p.id)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button 
                        className="act-btn act-modif" 
                        title="Modifier"
                        onClick={() => openEdit(p.id)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button 
                        className="act-btn act-suppr" 
                        title="Supprimer"
                        onClick={() => openDelete(p.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {currentProspects.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-user-slash"></i>
              <p>Aucun prospect trouvé.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pg-btn" 
              disabled={currentPage === 1}
              onClick={() => goToPage(1)}
            >
              <i className="fa-solid fa-angles-left"></i>
            </button>
            <button 
              className="pg-btn" 
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <i className="fa-solid fa-angle-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pg-num ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="pg-btn" 
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <i className="fa-solid fa-angle-right"></i>
            </button>
            <button 
              className="pg-btn" 
              disabled={currentPage === totalPages}
              onClick={() => goToPage(totalPages)}
            >
              <i className="fa-solid fa-angles-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Add Modal - CORRIGÉ avec footer à l'extérieur */}
      {showAddModal && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, closeAdd)}>
          <div className="modal modal-wide">
            <div className="modal-header">
              <h2><i className="fa-solid fa-user-plus"></i> Ajouter un prospect</h2>
              <button className="modal-close" onClick={closeAdd}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <AddProspectModalContent 
                onFormChange={setAddFormData}
                PAYS_LIST={PAYS_LIST}
                SOURCES={SOURCES}
                RESPONSABLES={RESPONSABLES}
                FORMATIONS={FORMATIONS}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeAdd}>Annuler</button>
              <button className="btn btn-save" onClick={handleAdd}>
                <i className="fa-solid fa-plus"></i> Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - CORRIGÉ avec footer à l'extérieur */}
      {showModifModal && editTarget && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, closeModif)}>
          <div className="modal modal-wide">
            <div className="modal-header modif-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier le prospect</h2>
              <button className="modal-close" onClick={closeModif}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <EditProspectModalContent
                prospect={editTarget}
                onFormChange={setEditFormData}
                PAYS_LIST={PAYS_LIST}
                SOURCES={SOURCES}
                RESPONSABLES={RESPONSABLES}
                FORMATIONS={FORMATIONS}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeModif}>Annuler</button>
              <button className="btn btn-update" onClick={handleModif}>
                <i className="fa-solid fa-floppy-disk"></i> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - déjà correct avec footer à l'extérieur */}
      {showDetailModal && detailTarget && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, closeDetail)}>
          <div className="modal modal-detail">
            <div className="modal-header detail-modal-header">
              <h2><i className="fa-solid fa-id-card"></i> Fiche Prospect</h2>
              <button className="modal-close" onClick={closeDetail}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <DetailProspectModalContent
                prospect={detailTarget}
                onClose={closeDetail}
                onEdit={switchToEdit}
                onDelete={deleteFromDetail}
                onConvert={toggleConvert}
                convertOpen={convertOpen}
                selectedForms={selectedForms}
                onToggleForm={toggleForm}
                onConfirmConvert={handleConvert}
                STATUT_COLORS={STATUT_COLORS}
                FORMATIONS={FORMATIONS}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeDetail}>Fermer</button>
              <button className="btn btn-det-edit-modal" onClick={switchToEdit}>
                <i className="fa-solid fa-pen"></i> Modifier
              </button>
              <button className="btn btn-det-del-modal" onClick={deleteFromDetail}>
                <i className="fa-solid fa-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal - déjà correct */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay show" onClick={(e) => handleOverlay(e, closeDelete)}>
          <div className="modal modal-suppr">
            <DeleteProspectModalContent
              prospect={deleteTarget}
              onClose={closeDelete}
              onConfirm={confirmDelete}
              STATUT_COLORS={STATUT_COLORS}
            />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          {toast.message}
        </div>
      )}
    </Layout>
  );
};

// Add Prospect Modal Content Component - SANS AUCUN FOOTER
const AddProspectModalContent = ({ onFormChange, PAYS_LIST, SOURCES, RESPONSABLES, FORMATIONS }) => {
  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", tel: "", ville: "", pays: "Tunisie",
    typeProspect: "Particulier", serviceRecherche: "Formation", formation: "",
    niveau: "Débutant", modePreference: "Présentiel", disponibilite: "",
    canalContact: "WhatsApp", source: "Site web", statut: "Nouveau",
    responsable: "Admin", notes: ""
  });

  // Notifier le parent des changements
  useEffect(() => {
    onFormChange(formData);
  }, [formData, onFormChange]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('a', '').toLowerCase()]: value }));
  };

  return (
    <>
      <div className="form-section-title">
        <i className="fa-solid fa-user"></i> Informations personnelles
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Nom <span className="req">*</span></label>
          <input type="text" id="aNom" placeholder="Ben Ali" value={formData.nom} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Prénom <span className="req">*</span></label>
          <input type="text" id="aPrenom" placeholder="Sami" value={formData.prenom} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email <span className="req">*</span></label>
          <input type="email" id="aEmail" placeholder="email@exemple.com" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input type="text" id="aTel" placeholder="+216 XX XXX XXX" value={formData.tel} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Ville</label>
          <input type="text" id="aVille" placeholder="Tunis" value={formData.ville} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Pays</label>
          <select id="aPays" value={formData.pays} onChange={handleChange}>
            {PAYS_LIST.map(pays => <option key={pays}>{pays}</option>)}
          </select>
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: "16px" }}>
        <i className="fa-solid fa-briefcase"></i> Informations commerciales
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Vous êtes</label>
          <select id="aTypeProspect" value={formData.typeProspect} onChange={handleChange}>
            <option>Particulier</option>
            <option>Entreprise</option>
          </select>
        </div>
        <div className="form-group">
          <label>Service recherché</label>
          <select id="aServiceRecherche" value={formData.serviceRecherche} onChange={handleChange}>
            <option>Formation</option>
            <option>Consulting</option>
            <option>Les deux</option>
          </select>
        </div>
        <div className="form-group full">
          <label>Formation / Service souhaité</label>
          <select id="aFormation" value={formData.formation} onChange={handleChange}>
            <option value="">-- Sélectionner --</option>
            {FORMATIONS.map(f => <option key={f.id} value={f.label}>{f.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Niveau estimé</label>
          <select id="aNiveau" value={formData.niveau} onChange={handleChange}>
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Avancé</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mode préféré</label>
          <select id="aModePreference" value={formData.modePreference} onChange={handleChange}>
            <option>Présentiel</option>
            <option>En ligne</option>
            <option>Hybride</option>
          </select>
        </div>
        <div className="form-group">
          <label>Disponibilité</label>
          <input type="text" id="aDisponibilite" placeholder="ex: Week-ends, Soirs…" value={formData.disponibilite} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Canal de contact préféré</label>
          <select id="aCanalContact" value={formData.canalContact} onChange={handleChange}>
            <option>Téléphone</option>
            <option>Email</option>
            <option>WhatsApp</option>
          </select>
        </div>
        <div className="form-group">
          <label>Source</label>
          <select id="aSource" value={formData.source} onChange={handleChange}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: "16px" }}>
        <i className="fa-solid fa-chart-line"></i> Suivi du prospect
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Statut</label>
          <select id="aStatut" value={formData.statut} onChange={handleChange}>
            <option>Nouveau</option>
            <option>Contacté</option>
            <option>En cours</option>
            <option>Qualifié</option>
            <option>Perdu</option>
          </select>
        </div>
        <div className="form-group">
          <label>Responsable du suivi</label>
          <select id="aResponsable" value={formData.responsable} onChange={handleChange}>
            {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group full">
          <label>Commentaires / Historique des échanges</label>
          <textarea id="aNotes" rows="3" placeholder="Appels, emails, RDV, observations..." value={formData.notes} onChange={handleChange}></textarea>
        </div>
      </div>
    </>
  );
};

// Edit Prospect Modal Content Component - SANS AUCUN FOOTER
const EditProspectModalContent = ({ prospect, onFormChange, PAYS_LIST, SOURCES, RESPONSABLES, FORMATIONS }) => {
  const [formData, setFormData] = useState({ ...prospect });

  // Notifier le parent des changements
  useEffect(() => {
    onFormChange(formData);
  }, [formData, onFormChange]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('m', '').toLowerCase()]: value }));
  };

  return (
    <>
      <div className="form-section-title">
        <i className="fa-solid fa-user"></i> Informations personnelles
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Nom <span className="req">*</span></label>
          <input type="text" id="mNom" value={formData.nom} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Prénom <span className="req">*</span></label>
          <input type="text" id="mPrenom" value={formData.prenom} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email <span className="req">*</span></label>
          <input type="email" id="mEmail" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input type="text" id="mTel" value={formData.tel} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Ville</label>
          <input type="text" id="mVille" value={formData.ville} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Pays</label>
          <select id="mPays" value={formData.pays} onChange={handleChange}>
            {PAYS_LIST.map(pays => <option key={pays}>{pays}</option>)}
          </select>
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: "16px" }}>
        <i className="fa-solid fa-briefcase"></i> Informations commerciales
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Vous êtes</label>
          <select id="mTypeProspect" value={formData.typeProspect} onChange={handleChange}>
            <option>Particulier</option>
            <option>Entreprise</option>
          </select>
        </div>
        <div className="form-group">
          <label>Service recherché</label>
          <select id="mServiceRecherche" value={formData.serviceRecherche} onChange={handleChange}>
            <option>Formation</option>
            <option>Consulting</option>
            <option>Les deux</option>
          </select>
        </div>
        <div className="form-group full">
          <label>Formation / Service souhaité</label>
          <select id="mFormation" value={formData.formation} onChange={handleChange}>
            <option value="">-- Sélectionner --</option>
            {FORMATIONS.map(f => <option key={f.id} value={f.label}>{f.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Niveau estimé</label>
          <select id="mNiveau" value={formData.niveau} onChange={handleChange}>
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Avancé</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mode préféré</label>
          <select id="mModePreference" value={formData.modePreference} onChange={handleChange}>
            <option>Présentiel</option>
            <option>En ligne</option>
            <option>Hybride</option>
          </select>
        </div>
        <div className="form-group">
          <label>Disponibilité</label>
          <input type="text" id="mDisponibilite" value={formData.disponibilite} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Canal de contact préféré</label>
          <select id="mCanalContact" value={formData.canalContact} onChange={handleChange}>
            <option>Téléphone</option>
            <option>Email</option>
            <option>WhatsApp</option>
          </select>
        </div>
        <div className="form-group">
          <label>Source</label>
          <select id="mSource" value={formData.source} onChange={handleChange}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: "16px" }}>
        <i className="fa-solid fa-chart-line"></i> Suivi du prospect
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Statut</label>
          <select id="mStatut" value={formData.statut} onChange={handleChange}>
            <option>Nouveau</option>
            <option>Contacté</option>
            <option>En cours</option>
            <option>Qualifié</option>
            <option>Perdu</option>
          </select>
        </div>
        <div className="form-group">
          <label>Responsable du suivi</label>
          <select id="mResponsable" value={formData.responsable} onChange={handleChange}>
            {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group full">
          <label>Commentaires / Historique des échanges</label>
          <textarea id="mNotes" rows="3" value={formData.notes} onChange={handleChange}></textarea>
        </div>
      </div>
    </>
  );
};

// Detail Prospect Modal Content Component
const DetailProspectModalContent = ({ 
  prospect, onClose, onEdit, onDelete, onConvert, convertOpen, 
  selectedForms, onToggleForm, onConfirmConvert, STATUT_COLORS, FORMATIONS 
}) => {
  const sc = STATUT_COLORS[prospect.statut] || {};
  
  return (
    <>
      <div className="detail-hero">
        <div className="detail-avatar">{prospect.prenom[0]}{prospect.nom[0]}</div>
        <div>
          <div className="detail-name">{prospect.prenom} {prospect.nom}</div>
          <div className="detail-email">
            <i className="fa-regular fa-envelope" style={{ marginRight: "5px", color: "#33CCFF" }}></i>
            {prospect.email}
          </div>
          <div className="detail-email">
            <i className="fa-solid fa-phone" style={{ marginRight: "5px", color: "#33CCFF" }}></i>
            {prospect.tel}
          </div>
        </div>
      </div>
      
      <div className="det-actions">
        <button className="btn-convert" onClick={onConvert}>
          <i className="fa-solid fa-graduation-cap"></i>
          {convertOpen ? 'Annuler la conversion' : 'Convertir en étudiant'}
        </button>
      </div>
      
      {convertOpen && (
        <div className="convert-box">
          <div className="convert-title">
            <i className="fa-solid fa-graduation-cap"></i> Conversion en Étudiant
          </div>
          <div className="conv-section-label">
            <i className="fa-solid fa-book-open"></i> Informations académiques
          </div>
          <div className="conv-sub-label">
            Formation(s) suivie(s) <span style={{ color: "#e53e3e" }}>*</span>
          </div>
          {FORMATIONS.map(f => (
            <div key={f.id} className="form-check" onClick={() => onToggleForm(f.id)}>
              <input type="checkbox" checked={selectedForms.includes(f.id)} readOnly />
              <label>{f.label}</label>
              <span className="dur-tag">{f.duree}</span>
            </div>
          ))}
          
          <div className="form-grid2" style={{ marginTop: "10px" }}>
            <div className="form-group">
              <label className="form-label">Mode de formation</label>
              <select className="form-control">
                <option>Présentiel</option>
                <option>En ligne</option>
                <option>Hybride</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date d'inscription</label>
              <input className="form-control" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Statut étudiant</label>
            <select className="form-control">
              <option>Actif</option>
              <option>Abandonné</option>
              <option>Certifié</option>
            </select>
          </div>
          
          <div className="conv-section-label" style={{ marginTop: "12px" }}>
            <i className="fa-solid fa-folder-open"></i> Informations administratives
          </div>
          
          <div className="form-group">
            <label className="form-label">Type de financement</label>
            <select className="form-control">
              <option>Personnel</option>
              <option>Entreprise</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Documents fournis</label>
            <div className="docs-checks">
              {["CIN", "CV", "Contrat", "Reçu", "RNE", "Autres"].map(d => (
                <label key={d} className="doc-check-item">
                  <input type="checkbox" /> {d}
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-grid2">
            <div className="form-group">
              <label className="form-label">Paiement</label>
              <select className="form-control">
                <option>Payé</option>
                <option>Par tranche</option>
                <option>Non payé</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mode de paiement</label>
              <select className="form-control">
                <option>Espèce</option>
                <option>Chèque</option>
                <option>Virement</option>
              </select>
            </div>
          </div>
          
          <button className="btn-confirm" onClick={onConfirmConvert}>
            <i className="fa-solid fa-check" style={{ marginRight: "5px" }}></i>
            Confirmer la conversion
          </button>
          <button className="btn-cc" onClick={onConvert}>Annuler</button>
        </div>
      )}
      
      <div className="det-section">
        <div className="det-sec-title">
          <i className="fa-solid fa-circle-info"></i> Informations
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-graduation-cap"></i>
          <div>
            <div className="info-key">Formation souhaitée</div>
            <div className="info-val">{prospect.formation || '—'}</div>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-users"></i>
          <div>
            <div className="info-key">Type / Service</div>
            <div className="info-val">{prospect.typeProspect || '—'} · {prospect.serviceRecherche || '—'}</div>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-signal"></i>
          <div>
            <div className="info-key">Niveau · Mode préféré</div>
            <div className="info-val">{prospect.niveau || '—'} · {prospect.modePreference || '—'}</div>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-location-dot"></i>
          <div>
            <div className="info-key">Ville / Pays</div>
            <div className="info-val">{prospect.ville || '—'}, {prospect.pays || '—'}</div>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-tag"></i>
          <div>
            <div className="info-key">Statut</div>
            <span 
              className="badge" 
              style={{
                background: sc.bg,
                color: sc.color,
                border: `1px solid ${sc.border}`
              }}
            >
              {prospect.statut}
            </span>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-share-nodes"></i>
          <div>
            <div className="info-key">Source · Canal préféré</div>
            <div className="info-val">
              <span className="src-tag">{prospect.source}</span> · {prospect.canalContact || '—'}
            </div>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-clock"></i>
          <div>
            <div className="info-key">Disponibilité</div>
            <div className="info-val">{prospect.disponibilite || '—'}</div>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-solid fa-user-tie"></i>
          <div>
            <div className="info-key">Responsable</div>
            <div className="info-val">{prospect.responsable || '—'}</div>
          </div>
        </div>
        
        <div className="info-row">
          <i className="fa-regular fa-calendar"></i>
          <div>
            <div className="info-key">Date d'ajout</div>
            <div className="info-val">{prospect.date}</div>
          </div>
        </div>
      </div>
      
      {prospect.notes && (
        <div className="det-section">
          <div className="det-sec-title">
            <i className="fa-solid fa-note-sticky"></i> Notes
          </div>
          <div className="notes-box">{prospect.notes}</div>
        </div>
      )}
    </>
  );
};

// Delete Prospect Modal Content Component
const DeleteProspectModalContent = ({ prospect, onClose, onConfirm, STATUT_COLORS }) => {
  const sc = STATUT_COLORS[prospect.statut] || {};
  
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "28px" }}>
        <div className="suppr-icon-wrap">
          <i className="fa-solid fa-trash" style={{ fontSize: "26px", color: "#ef4444" }}></i>
        </div>
      </div>
      <div className="modal-body" style={{ textAlign: "center", paddingTop: "12px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
          Supprimer le prospect
        </h2>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          background: "#f8fafc", 
          border: "1px solid #e2e8f0", 
          borderRadius: "10px", 
          padding: "10px 14px", 
          marginBottom: "12px", 
          textAlign: "left" 
        }}>
          <div style={{ 
            background: "#336699", 
            borderRadius: "8px", 
            width: "38px", 
            height: "38px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#fff", 
            fontWeight: "700", 
            fontSize: "13px", 
            flexShrink: "0" 
          }}>
            {prospect.prenom[0]}{prospect.nom[0]}
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "#1e293b" }}>
              {prospect.prenom} {prospect.nom}
            </div>
            <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>{prospect.email}</div>
          </div>
          <span 
            className="badge" 
            style={{ 
              marginLeft: "auto", 
              background: sc.bg, 
              color: sc.color, 
              border: `1px solid ${sc.border}` 
            }}
          >
            {prospect.statut}
          </span>
        </div>
        
        <div className="suppr-warning">
          <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: "0" }}></i>
          <span>Cette action est <strong>irréversible</strong>. Le prospect sera définitivement supprimé.</span>
        </div>
      </div>
      <div className="modal-footer" style={{ justifyContent: "center", gap: "10px" }}>
        <button className="btn btn-cancel" style={{ flex: "1" }} onClick={onClose}>
          <i className="fa-solid fa-xmark"></i> Annuler
        </button>
        <button className="btn btn-suppr-confirm" style={{ flex: "1" }} onClick={onConfirm}>
          <i className="fa-solid fa-trash"></i> Confirmer
        </button>
      </div>
    </>
  );
};

export default Prospects;