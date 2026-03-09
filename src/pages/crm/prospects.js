import React, { useState, useRef } from 'react';
import Layout from "../../components/Layout";
import '../../styles/crm/prospects.css';

/* ──────────────────────────────────────────────────────────
   FORMULAIRE PARTAGÉ — pas de useEffect, pas de callback loop
   On lit les données via un ref au moment du save
────────────────────────────────────────────────────────── */
const ProspectForm = ({ initial, formRef, PAYS_LIST, SOURCES, RESPONSABLES, FORMATIONS }) => {
  const defaults = {
    nom: '', prenom: '', email: '', tel: '', ville: '', pays: 'Tunisie',
    typeProspect: 'Particulier', serviceRecherche: 'Formation', formation: '',
    niveau: 'Débutant', modePreference: 'Présentiel', disponibilite: '',
    canalContact: 'WhatsApp', source: 'Site web', statut: 'Nouveau',
    responsable: 'Admin', commentaires: '', historique: '',
  };

  const [fd, setFd] = useState({ ...defaults, ...(initial || {}) });

  // Expose les données au parent via ref
  formRef.current = fd;

  const set = (field, value) => setFd(prev => ({ ...prev, [field]: value }));

  const F = ({ label, name, type = 'text', placeholder = '' }) => (
    <div className="pf-group">
      <label>{label}</label>
      <input type={type} value={fd[name] || ''} placeholder={placeholder} onChange={e => set(name, e.target.value)} />
    </div>
  );

  const S = ({ label, name, options }) => (
    <div className="pf-group">
      <label>{label}</label>
      <select value={fd[name] || ''} onChange={e => set(name, e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const T = ({ label, name, placeholder = '' }) => (
    <div className="pf-group pf-full">
      <label>{label}</label>
      <textarea rows={3} value={fd[name] || ''} placeholder={placeholder} onChange={e => set(name, e.target.value)} />
    </div>
  );

  return (
    <div className="pf-body">
      <div className="pf-section-title"><i className="fa-solid fa-user"></i> Informations personnelles</div>
      <div className="pf-grid">
        <F label="Nom *"      name="nom"    placeholder="Ben Ali" />
        <F label="Prénom *"   name="prenom" placeholder="Sami" />
        <F label="Email *"    name="email"  type="email" placeholder="email@exemple.com" />
        <F label="Téléphone"  name="tel"    placeholder="+216 XX XXX XXX" />
        <F label="Ville"      name="ville"  placeholder="Tunis" />
        <S label="Pays"       name="pays"   options={PAYS_LIST} />
      </div>

      <div className="pf-section-title" style={{ marginTop: '18px' }}><i className="fa-solid fa-briefcase"></i> Informations commerciales</div>
      <div className="pf-grid">
        <S label="Source — Comment avez-vous connu 4C Lab ?" name="source"           options={SOURCES} />
        <S label="Vous êtes"                                 name="typeProspect"      options={['Particulier', 'Entreprise']} />
        <S label="Service recherché"                         name="serviceRecherche"  options={['Formation', 'Consulting', 'Les deux']} />
        <div className="pf-group">
          <label>Formation / Service souhaité</label>
          <select value={fd.formation || ''} onChange={e => set('formation', e.target.value)}>
            <option value="">-- Sélectionner --</option>
            {FORMATIONS.map(f => <option key={f.id} value={f.label}>{f.label}</option>)}
          </select>
        </div>
        <S label="Niveau estimé"            name="niveau"         options={['Débutant', 'Intermédiaire', 'Avancé']} />
        <S label="Mode préféré"             name="modePreference" options={['Présentiel', 'En ligne', 'Hybride']} />
        <F label="Disponibilité"            name="disponibilite"  placeholder="Week-ends, Soirs…" />
        <S label="Canal de contact préféré" name="canalContact"   options={['Téléphone', 'Email', 'WhatsApp']} />
        <T label="Commentaires"             name="commentaires"   placeholder="Notes, observations..." />
      </div>

      <div className="pf-section-title" style={{ marginTop: '18px' }}><i className="fa-solid fa-chart-line"></i> Suivi du prospect</div>
      <div className="pf-grid">
        <S label="Statut"               name="statut"      options={['Nouveau', 'Contacté', 'Intéressé', 'Converti', 'Perdu']} />
        <S label="Responsable du suivi" name="responsable" options={RESPONSABLES} />
        <T label="Historique des échanges (appels, emails, RDV)" name="historique" placeholder="Appels, emails, RDV sur place..." />
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
────────────────────────────────────────────────────────── */
const Prospects = () => {
  const FORMATIONS = [
    { id: 1, label: 'React Avancé',        duree: '40h' },
    { id: 2, label: 'Python Data Science', duree: '60h' },
    { id: 3, label: 'UI/UX Design',        duree: '35h' },
    { id: 4, label: 'Angular Débutant',    duree: '30h' },
    { id: 5, label: 'DevOps CI/CD',        duree: '50h' },
    { id: 6, label: 'Node.js REST API',    duree: '45h' },
  ];

  const STATUT_COLORS = {
    'Nouveau':   { bg: 'rgba(51,204,255,.14)',  color: '#1A7A99', border: 'rgba(51,204,255,.35)' },
    'Contacté':  { bg: 'rgba(255,204,51,.18)',  color: '#8A6800', border: 'rgba(255,204,51,.45)' },
    'Intéressé': { bg: 'rgba(51,102,153,.13)',  color: '#1E3A5F', border: 'rgba(51,102,153,.30)' },
    'Converti':  { bg: 'rgba(26,107,74,.12)',   color: '#1A6B4A', border: 'rgba(26,107,74,.30)'  },
    'Perdu':     { bg: 'rgba(229,62,62,.10)',   color: '#c0392b', border: 'rgba(229,62,62,.30)'  },
  };

  const SOURCES      = ['Facebook','Instagram','TikTok','LinkedIn','Google','Site web','Recommandation','Autre'];
  const RESPONSABLES = ['Admin','Assistante','Commercial'];
  const PAYS_LIST    = ['Tunisie','France','Algérie','Maroc','Belgique','Canada','Autre'];

  const INIT_DATA = [
    { id:1,  nom:'Ben Ali',   prenom:'Sami',    email:'sami.benali@email.com',   tel:'+216 22 111 000', ville:'Tunis',    pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'React Avancé',       niveau:'Intermédiaire', modePreference:'Présentiel',  disponibilite:'Week-ends',       canalContact:'WhatsApp',  responsable:'Admin',      statut:'Nouveau',   date:'2025-01-10', source:'Site web',       commentaires:"Intéressé par la formation React.", historique:'' },
    { id:2,  nom:'Trabelsi',  prenom:'Ines',    email:'ines.trabelsi@email.com', tel:'+216 55 222 111', ville:'Sfax',     pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Les deux',   formation:'Python Data Science', niveau:'Débutant',      modePreference:'En ligne',    disponibilite:'Soirs',           canalContact:'Email',     responsable:'Admin',      statut:'Contacté',  date:'2025-01-12', source:'Recommandation', commentaires:'Cherche une reconversion professionnelle.', historique:'Appel le 13/01' },
    { id:3,  nom:'Meddeb',    prenom:'Karim',   email:'k.meddeb@email.com',      tel:'+216 99 333 222', ville:'Sousse',   pays:'Tunisie', typeProspect:'Entreprise',  serviceRecherche:'Consulting', formation:'UI/UX Design',        niveau:'Avancé',        modePreference:'Hybride',     disponibilite:'Jours ouvrables', canalContact:'Téléphone', responsable:'Admin',      statut:'Intéressé', date:'2025-01-15', source:'Recommandation', commentaires:"Envoyé par un ancien étudiant.", historique:'RDV le 16/01' },
    { id:4,  nom:'Chaabane',  prenom:'Leila',   email:'leila.ch@email.com',      tel:'+216 44 444 333', ville:'Tunis',    pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'Angular Débutant',    niveau:'Débutant',      modePreference:'Présentiel',  disponibilite:'Week-ends',       canalContact:'WhatsApp',  responsable:'Admin',      statut:'Converti',  date:'2025-01-18', source:'LinkedIn',       commentaires:'Profil junior, très motivée.', historique:'' },
    { id:5,  nom:'Romdhani',  prenom:'Nour',    email:'nour.r@email.com',        tel:'+216 77 555 444', ville:'Bizerte',  pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'React Avancé',        niveau:'Intermédiaire', modePreference:'En ligne',    disponibilite:'',                canalContact:'Email',     responsable:'Admin',      statut:'Perdu',     date:'2025-01-20', source:'Site web',       commentaires:"N'a pas donné suite.", historique:'' },
    { id:6,  nom:'Hamdi',     prenom:'Zied',    email:'zied.hamdi@email.com',    tel:'+216 22 666 555', ville:'Tunis',    pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'DevOps CI/CD',        niveau:'Avancé',        modePreference:'Présentiel',  disponibilite:'Matin',           canalContact:'Téléphone', responsable:'Admin',      statut:'Nouveau',   date:'2025-01-22', source:'Google',         commentaires:'Rempli formulaire en ligne.', historique:'' },
    { id:7,  nom:'Jebali',    prenom:'Amira',   email:'amira.j@email.com',       tel:'+216 55 777 666', ville:'Nabeul',   pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'Python Data Science', niveau:'Débutant',      modePreference:'Hybride',     disponibilite:'Après-midi',      canalContact:'WhatsApp',  responsable:'Assistante', statut:'Contacté',  date:'2025-01-25', source:'Facebook',       commentaires:'Contactée via pub Facebook.', historique:'Email le 26/01' },
    { id:8,  nom:'Boukadida', prenom:'Yassine', email:'y.boukadida@email.com',   tel:'+216 99 888 777', ville:'Monastir', pays:'Tunisie', typeProspect:'Entreprise',  serviceRecherche:'Les deux',   formation:'UI/UX Design',        niveau:'Intermédiaire', modePreference:'En ligne',    disponibilite:'Soirs',           canalContact:'Email',     responsable:'Commercial', statut:'Intéressé', date:'2025-01-28', source:'Recommandation', commentaires:'Demande devis personnalisé.', historique:'Devis envoyé le 29/01' },
    { id:9,  nom:'Gharbi',    prenom:'Rim',     email:'rim.gharbi@email.com',    tel:'+216 44 999 888', ville:'Tunis',    pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'Angular Débutant',    niveau:'Débutant',      modePreference:'Présentiel',  disponibilite:'Week-ends',       canalContact:'Téléphone', responsable:'Admin',      statut:'Converti',  date:'2025-02-01', source:'Instagram',      commentaires:'Dossier complet reçu.', historique:'' },
    { id:10, nom:'Zaabi',     prenom:'Mohamed', email:'med.zaabi@email.com',     tel:'+216 77 000 999', ville:'Tunis',    pays:'Tunisie', typeProspect:'Entreprise',  serviceRecherche:'Consulting', formation:'DevOps CI/CD',        niveau:'Avancé',        modePreference:'Hybride',     disponibilite:'Jours ouvrables', canalContact:'Email',     responsable:'Commercial', statut:'Nouveau',   date:'2025-02-03', source:'Recommandation', commentaires:'Recommandé par un partenaire.', historique:'' },
    { id:11, nom:'Sfaxi',     prenom:'Sara',    email:'sara.sfaxi@email.com',    tel:'+216 22 111 999', ville:'Sfax',     pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'React Avancé',        niveau:'Avancé',        modePreference:'En ligne',    disponibilite:'Soirs',           canalContact:'WhatsApp',  responsable:'Assistante', statut:'Contacté',  date:'2025-02-05', source:'LinkedIn',       commentaires:'Profil senior, cherche upgrade.', historique:'' },
    { id:12, nom:'Chebbi',    prenom:'Ali',     email:'ali.chebbi@email.com',    tel:'+216 55 222 888', ville:'Tunis',    pays:'Tunisie', typeProspect:'Particulier', serviceRecherche:'Formation',  formation:'Python Data Science', niveau:'Intermédiaire', modePreference:'Présentiel',  disponibilite:'Matin',           canalContact:'Téléphone', responsable:'Admin',      statut:'Intéressé', date:'2025-02-07', source:'Site web',       commentaires:"En attente du planning.", historique:'' },
  ];

  // ── State ──
  const [prospects,       setProspects]       = useState(INIT_DATA);
  const [search,          setSearch]          = useState('');
  const [filterStatut,    setFilterStatut]    = useState('Tous');
  const [sortAlpha,       setSortAlpha]       = useState(false);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [pageView,        setPageView]        = useState('list');
  const [detailTarget,    setDetailTarget]    = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [convertOpen,     setConvertOpen]     = useState(false);
  const [selectedForms,   setSelectedForms]   = useState([]);
  const [toast,           setToast]           = useState({ show: false, message: '', type: 'success' });

  // Drawer
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [drawerMode,   setDrawerMode]   = useState(null); // 'add' | 'edit'
  const [drawerTarget, setDrawerTarget] = useState(null);
  // Ref pour lire les données du formulaire au moment du save (évite toute boucle)
  const formRef = useRef(null);

  const PER_PAGE = 8;

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── Filtres ──
  const getFiltered = () => {
    let f = [...prospects];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(p =>
        p.nom.toLowerCase().includes(q) ||
        p.prenom.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.tel.includes(q)
      );
    }
    if (filterStatut !== 'Tous') f = f.filter(p => p.statut === filterStatut);
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };

  const filtered     = getFiltered();
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Drawer ──
  const openAdd = () => {
    setDrawerTarget(null);
    setDrawerMode('add');
    setDrawerOpen(true);
  };

  const openEdit = (id) => {
    const p = prospects.find(x => x.id === id);
    if (!p) return;
    setDrawerTarget(p);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setDrawerTarget(null);
    formRef.current = null;
  };

  const saveDrawer = () => {
    const data = formRef.current;
    if (!data) return;
    if (!data.nom?.trim() || !data.prenom?.trim() || !data.email?.trim()) {
      showToast('Veuillez remplir Nom, Prénom et Email.', 'error');
      return;
    }
    if (drawerMode === 'add') {
      const newP = { ...data, id: Date.now(), date: new Date().toISOString().slice(0, 10) };
      setProspects(prev => [newP, ...prev]);
      showToast('Prospect ajouté avec succès !');
    } else {
      const updated = { ...drawerTarget, ...data };
      setProspects(prev => prev.map(p => p.id === drawerTarget.id ? updated : p));
      if (detailTarget && detailTarget.id === drawerTarget.id) setDetailTarget(updated);
      showToast('Prospect modifié avec succès !');
    }
    closeDrawer();
  };

  // ── Détail ──
  const openDetail = (id) => {
    const p = prospects.find(x => x.id === id);
    if (!p) return;
    setDetailTarget(p);
    setConvertOpen(false);
    setSelectedForms([]);
    setPageView('detail');
  };
  const closeDetail = () => { setPageView('list'); setDetailTarget(null); };

  // ── Supprimer ──
  const openDelete = (id) => {
    const p = prospects.find(x => x.id === id);
    if (!p) return;
    setDeleteTarget(p);
    setShowDeleteModal(true);
  };
  const closeDelete   = () => { setShowDeleteModal(false); setDeleteTarget(null); };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProspects(prev => prev.filter(p => p.id !== deleteTarget.id));
    if (detailTarget && detailTarget.id === deleteTarget.id) { setPageView('list'); setDetailTarget(null); }
    closeDelete();
    showToast('Prospect supprimé.');
  };

  // ── Conversion ──
  const toggleConvert = () => { setConvertOpen(v => !v); setSelectedForms([]); };
  const toggleForm    = (id) => setSelectedForms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleConvert = () => {
    if (!selectedForms.length) { showToast('Sélectionnez au moins une formation.', 'error'); return; }
    showToast(`Prospect converti ! (${selectedForms.length} formation(s))`);
    setProspects(prev => prev.filter(p => p.id !== detailTarget.id));
    closeDetail();
  };

  // ══════════════════════════════════════════════════════════
  // DRAWER JSX
  // ══════════════════════════════════════════════════════════
  const DrawerPanel = () => {
    if (!drawerOpen) return null;
    const isEdit = drawerMode === 'edit';
    return (
      <>
        <div className="drawer-overlay" onClick={closeDrawer} />
        <div className="drawer-panel open">
          <div className={`drawer-header ${isEdit ? 'drawer-header-edit' : ''}`}>
            <div className="drawer-header-left">
              <i className={`fa-solid ${isEdit ? 'fa-pen' : 'fa-user-plus'}`}></i>
              <span>{isEdit ? 'Modifier le prospect' : 'Ajouter un prospect'}</span>
            </div>
            <button className="drawer-close" onClick={closeDrawer}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="drawer-body">
            <ProspectForm
              key={isEdit ? drawerTarget?.id : 'new'}
              initial={isEdit ? drawerTarget : null}
              formRef={formRef}
              PAYS_LIST={PAYS_LIST}
              SOURCES={SOURCES}
              RESPONSABLES={RESPONSABLES}
              FORMATIONS={FORMATIONS}
            />
          </div>
          <div className="drawer-footer">
            <button className="btn btn-cancel" onClick={closeDrawer}>Annuler</button>
            <button className={`btn ${isEdit ? 'btn-update' : 'btn-save'}`} onClick={saveDrawer}>
              <i className={`fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}`}></i>
              {isEdit ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </div>
      </>
    );
  };

  // ══════════════════════════════════════════════════════════
  // MODALE SUPPRESSION
  // ══════════════════════════════════════════════════════════
  const DeleteModal = () => {
    if (!showDeleteModal || !deleteTarget) return null;
    const sc = STATUT_COLORS[deleteTarget.statut] || {};
    return (
      <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) closeDelete(); }}>
        <div className="modal-suppr">
          <div style={{ display:'flex', justifyContent:'center', paddingTop:'28px' }}>
            <div className="suppr-icon-wrap">
              <i className="fa-solid fa-trash" style={{ fontSize:'26px', color:'#ef4444' }}></i>
            </div>
          </div>
          <div style={{ padding:'16px 24px', textAlign:'center' }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'14px', color:'#1e293b' }}>
              Supprimer le prospect
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', textAlign:'left' }}>
              <div style={{ background:'#336699', borderRadius:'8px', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'13px', flexShrink:'0' }}>
                {deleteTarget.prenom[0]}{deleteTarget.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight:'600', color:'#1e293b' }}>{deleteTarget.prenom} {deleteTarget.nom}</div>
                <div style={{ fontSize:'11.5px', color:'#94a3b8' }}>{deleteTarget.email}</div>
              </div>
              <span className="badge" style={{ marginLeft:'auto', background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{deleteTarget.statut}</span>
            </div>
            <div className="suppr-warning">
              <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink:'0' }}></i>
              <span>Cette action est <strong>irréversible</strong>. Le prospect sera définitivement supprimé.</span>
            </div>
          </div>
          <div style={{ padding:'12px 24px 20px', display:'flex', gap:'10px' }}>
            <button className="btn btn-cancel" style={{ flex:'1' }} onClick={closeDelete}>
              <i className="fa-solid fa-xmark"></i> Annuler
            </button>
            <button className="btn btn-suppr-confirm" style={{ flex:'1' }} onClick={confirmDelete}>
              <i className="fa-solid fa-trash"></i> Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // TOAST
  // ══════════════════════════════════════════════════════════
  const Toast = () => toast.show ? (
    <div className={`toast ${toast.type}`}>
      <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
      {toast.message}
    </div>
  ) : null;

  // ══════════════════════════════════════════════════════════
  // PAGE DÉTAIL — layout HubSpot (sidebar gauche + contenu droite)
  // ══════════════════════════════════════════════════════════
  if (pageView === 'detail' && detailTarget) {
    const p  = detailTarget;
    const sc = STATUT_COLORS[p.statut] || {};

    return (
      <Layout>
        <div className="det-page">

          {/* ── Breadcrumb top ── */}
          <div className="det-topbar">
            <button className="back-btn" onClick={closeDetail}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Prospects</span>
            </button>
            <i className="fa-solid fa-chevron-right det-bc-sep"></i>
            <span className="det-bc-name">{p.prenom} {p.nom}</span>
          </div>

          {/* ── Corps principal : sidebar gauche + droite ── */}
          <div className="det-body">

            {/* ════ SIDEBAR GAUCHE ════ */}
            <div className="det-sidebar">

              {/* Avatar + nom */}
              <div className="det-sid-hero">
                <div className="det-sid-avatar">{p.prenom[0]}{p.nom[0]}</div>
                <div className="det-sid-name">{p.prenom} {p.nom}</div>
                <span className="badge det-sid-badge" style={{ background:sc.bg, color:sc.color, border:`1.5px solid ${sc.border}` }}>
                  {p.statut}
                </span>
              </div>

              <div className="det-sid-divider" />

              {/* Infos clés */}
              <div className="det-sid-fields">
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-envelope"></i> E-mail</span>
                  <span className="det-sid-val">{p.email}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-phone"></i> Téléphone</span>
                  <span className="det-sid-val">{p.tel || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-location-dot"></i> Ville / Pays</span>
                  <span className="det-sid-val">{[p.ville, p.pays].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-share-nodes"></i> Source</span>
                  <span className="det-sid-val"><span className="src-tag">{p.source || '—'}</span></span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-users"></i> Type</span>
                  <span className="det-sid-val">{p.typeProspect || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-message"></i> Canal préféré</span>
                  <span className="det-sid-val">{p.canalContact || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-calendar"></i> Date création</span>
                  <span className="det-sid-val">{p.date}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-user-tie"></i> Responsable</span>
                  <span className="det-sid-val">{p.responsable || '—'}</span>
                </div>
              </div>

              <div className="det-sid-divider" />

              {/* ── 3 boutons actions en bas de la sidebar ── */}
              <div className="det-sid-actions">
                <button className="det-action-btn det-action-convert" onClick={toggleConvert}>
                  <i className="fa-solid fa-graduation-cap"></i>
                  Convertir en étudiant
                </button>
                <button className="det-action-btn det-action-edit" onClick={() => openEdit(p.id)}>
                  <i className="fa-solid fa-pen"></i>
                  Modifier
                </button>
                <button className="det-action-btn det-action-del" onClick={() => openDelete(p.id)}>
                  <i className="fa-solid fa-trash"></i>
                  Supprimer
                </button>
              </div>

            </div>

            {/* ════ CONTENU PRINCIPAL DROITE ════ */}
            <div className="det-main">

              {/* Bloc conversion — s'affiche en haut si ouvert */}
              {convertOpen && (
                <div className="convert-box det-convert-box">
                  <div className="convert-title">
                    <i className="fa-solid fa-graduation-cap"></i> Conversion en Étudiant
                    <button className="det-convert-close" onClick={toggleConvert}><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div className="conv-section-label"><i className="fa-solid fa-book-open"></i> Informations académiques</div>
                  <div className="conv-sub-label">Formation(s) suivie(s) <span style={{ color:'#e53e3e' }}>*</span></div>
                  <div className="det-form-checks">
                    {FORMATIONS.map(f => (
                      <div key={f.id} className="form-check" onClick={() => toggleForm(f.id)}>
                        <input type="checkbox" checked={selectedForms.includes(f.id)} readOnly />
                        <label>{f.label}</label>
                        <span className="dur-tag">{f.duree}</span>
                      </div>
                    ))}
                  </div>
                  <div className="form-grid2" style={{ marginTop:'10px' }}>
                    <div className="form-group"><label className="form-label">Mode de formation</label><select className="form-control"><option>Présentiel</option><option>En ligne</option><option>Hybride</option></select></div>
                    <div className="form-group"><label className="form-label">Date d'inscription</label><input className="form-control" type="date" defaultValue={new Date().toISOString().slice(0,10)} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Statut étudiant</label><select className="form-control"><option>Actif</option><option>Abandonné</option><option>Certifié</option></select></div>
                  <div className="conv-section-label" style={{ marginTop:'12px' }}><i className="fa-solid fa-folder-open"></i> Informations administratives</div>
                  <div className="form-group"><label className="form-label">Type de financement</label><select className="form-control"><option>Personnel</option><option>Entreprise</option></select></div>
                  <div className="form-group">
                    <label className="form-label">Documents fournis</label>
                    <div className="docs-checks">
                      {['CIN','CV','Contrat','Reçu','RNE','Autres'].map(d => (
                        <label key={d} className="doc-check-item"><input type="checkbox" /> {d}</label>
                      ))}
                    </div>
                  </div>
                  <div className="form-grid2">
                    <div className="form-group"><label className="form-label">Paiement</label><select className="form-control"><option>Payé</option><option>Par tranche</option><option>Non payé</option></select></div>
                    <div className="form-group"><label className="form-label">Mode de paiement</label><select className="form-control"><option>Espèce</option><option>Chèque</option><option>Virement</option></select></div>
                  </div>
                  <div className="det-convert-footer">
                    <button className="btn btn-cancel" onClick={toggleConvert}>Annuler</button>
                    <button className="btn-confirm" style={{ flex:1 }} onClick={handleConvert}>
                      <i className="fa-solid fa-check" style={{ marginRight:'5px' }}></i>Confirmer la conversion
                    </button>
                  </div>
                </div>
              )}

              {/* Section : Informations personnelles */}
              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-user"></i> Informations personnelles
                </div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Nom</span><span className="det-field-val">{p.nom}</span></div>
                  <div className="det-field"><span className="det-field-label">Prénom</span><span className="det-field-val">{p.prenom}</span></div>
                  <div className="det-field"><span className="det-field-label">Email</span><span className="det-field-val">{p.email}</span></div>
                  <div className="det-field"><span className="det-field-label">Téléphone</span><span className="det-field-val">{p.tel || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Ville</span><span className="det-field-val">{p.ville || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Pays</span><span className="det-field-val">{p.pays || '—'}</span></div>
                </div>
              </div>

              {/* Section : Informations commerciales */}
              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-briefcase"></i> Informations commerciales
                </div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Source</span><span className="det-field-val"><span className="src-tag">{p.source || '—'}</span></span></div>
                  <div className="det-field"><span className="det-field-label">Type de prospect</span><span className="det-field-val">{p.typeProspect || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Service recherché</span><span className="det-field-val">{p.serviceRecherche || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Formation souhaitée</span><span className="det-field-val">{p.formation || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Niveau estimé</span><span className="det-field-val">{p.niveau || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Mode préféré</span><span className="det-field-val">{p.modePreference || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Disponibilité</span><span className="det-field-val">{p.disponibilite || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Canal de contact</span><span className="det-field-val">{p.canalContact || '—'}</span></div>
                </div>
              </div>

              {/* Section : Suivi */}
              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-chart-line"></i> Suivi du prospect
                </div>
                <div className="det-fields-grid">
                  <div className="det-field">
                    <span className="det-field-label">Statut</span>
                    <span className="det-field-val">
                      <span className="badge" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{p.statut}</span>
                    </span>
                  </div>
                  <div className="det-field"><span className="det-field-label">Date de création</span><span className="det-field-val">{p.date}</span></div>
                  <div className="det-field"><span className="det-field-label">Responsable</span><span className="det-field-val">{p.responsable || '—'}</span></div>
                </div>
                {p.historique ? (
                  <div className="det-notes-row">
                    <span className="det-field-label">Historique des échanges</span>
                    <div className="notes-box">{p.historique}</div>
                  </div>
                ) : null}
              </div>

              {/* Section : Commentaires */}
              {p.commentaires ? (
                <div className="det-section-card">
                  <div className="det-section-header"><i className="fa-solid fa-note-sticky"></i> Commentaires</div>
                  <div className="notes-box">{p.commentaires}</div>
                </div>
              ) : null}

            </div>
          </div>
        </div>

        <DrawerPanel />
        <DeleteModal />
        <Toast />
      </Layout>
    );
  }

  // ══════════════════════════════════════════════════════════
  // PAGE LISTE
  // ══════════════════════════════════════════════════════════
  return (
    <Layout>
      <div className="prsp-header">
        <div className="prsp-title"><i className="fa-solid fa-user-plus"></i> Gestion des Prospects</div>
        <div className="prsp-sub">Gérez le cycle de vie de vos prospects et convertissez-les en étudiants</div>
      </div>

      <div className="toolbar">
        <div className="tb-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <select className="filter-sel" value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setCurrentPage(1); }}>
            <option>Tous</option><option>Nouveau</option><option>Contacté</option>
            <option>Intéressé</option><option>Converti</option><option>Perdu</option>
          </select>
          <button className={`btn btn-sort ${sortAlpha ? 'active' : ''}`} onClick={() => setSortAlpha(v => !v)}>
            <i className="fa-solid fa-arrow-down-a-z"></i> A → Z
          </button>
        </div>
        <div className="tb-right">
          <button className="btn btn-imp" onClick={() => showToast('Import CSV bientôt disponible.', 'error')}>
            <i className="fa-solid fa-file-import"></i> Importer
          </button>
          <button className="btn btn-add" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Ajouter un prospect
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-top">
          <strong>{filtered.length}</strong> prospect{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width:'32px' }}>#</th>
                <th>Nom & Prénom</th>
                <th>Contact</th>
                <th>Formation souhaitée</th>
                <th>Statut</th>
                <th>Source</th>
                <th>Date</th>
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSlice.map((p, i) => {
                const sc = STATUT_COLORS[p.statut] || {};
                return (
                  <tr key={p.id}>
                    <td className="td-num">{(currentPage - 1) * PER_PAGE + i + 1}</td>
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
                      <span className="badge" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{p.statut}</span>
                    </td>
                    <td><span className="src-tag">{p.source}</span></td>
                    <td className="td-sub">{p.date}</td>
                    <td className="td-actions">
                      <button className="act-btn act-detail" title="Voir le détail" onClick={() => openDetail(p.id)}><i className="fa-solid fa-eye"></i></button>
                      <button className="act-btn act-modif"  title="Modifier"       onClick={() => openEdit(p.id)}><i className="fa-solid fa-pen"></i></button>
                      <button className="act-btn act-suppr"  title="Supprimer"      onClick={() => openDelete(p.id)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {currentSlice.length === 0 && (
            <div className="empty-state"><i className="fa-solid fa-user-slash"></i><p>Aucun prospect trouvé.</p></div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="pg-btn" disabled={currentPage===1}          onClick={() => setCurrentPage(1)}><i className="fa-solid fa-angles-left"></i></button>
            <button className="pg-btn" disabled={currentPage===1}          onClick={() => setCurrentPage(p => p-1)}><i className="fa-solid fa-angle-left"></i></button>
            {Array.from({ length:totalPages }, (_,i) => i+1).map(page => (
              <button key={page} className={`pg-num ${currentPage===page?'active':''}`} onClick={() => setCurrentPage(page)}>{page}</button>
            ))}
            <button className="pg-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p => p+1)}><i className="fa-solid fa-angle-right"></i></button>
            <button className="pg-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(totalPages)}><i className="fa-solid fa-angles-right"></i></button>
          </div>
        )}
      </div>

      <DrawerPanel />
      <DeleteModal />
      <Toast />
    </Layout>
  );
};

export default Prospects;