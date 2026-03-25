import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../../components/Layout";
import '../../styles/crm/etudiants.css';

/* ──────────────────────────────────────────────────────────
   LISTES STATIQUES
────────────────────────────────────────────────────────── */
const FORMATIONS_LIST = [
  { id: 1,  label: 'React Avancé',            duree: '40h' },
  { id: 2,  label: 'Python Data Science',     duree: '60h' },
  { id: 3,  label: 'UI/UX Design',            duree: '35h' },
  { id: 4,  label: 'Angular Débutant',        duree: '30h' },
  { id: 5,  label: 'DevOps CI/CD',            duree: '50h' },
  { id: 6,  label: 'Node.js REST API',        duree: '45h' },
  { id: 7,  label: 'Flutter Mobile',          duree: '55h' },
  { id: 8,  label: 'Cybersécurité',           duree: '70h' },
  { id: 9,  label: 'Machine Learning',        duree: '80h' },
  { id: 10, label: 'Gestion de projet Agile', duree: '25h' },
];

const PAYS_LIST = ['Tunisie','France','Algérie','Maroc','Belgique','Canada','Autre'];
const DOCS_LIST = ['CIN','CV','Contrat','Reçu','RNE','Autres'];

const STATUT_COLORS = {
  'Actif':     { bg: 'rgba(26,107,74,.12)',  color: '#1A6B4A', border: 'rgba(26,107,74,.30)'  },
  'Abandonné': { bg: 'rgba(229,62,62,.10)',  color: '#c0392b', border: 'rgba(229,62,62,.28)'  },
  'Certifié':  { bg: 'rgba(255,204,51,.18)', color: '#8A6200', border: 'rgba(255,204,51,.40)' },
};

/* ──────────────────────────────────────────────────────────
   HELPER
────────────────────────────────────────────────────────── */
const calcPct = (seancesTotal, absences) => {
  const total = parseInt(seancesTotal) || 0;
  const abs   = parseInt(absences)     || 0;
  if (total <= 0) return 0;
  return Math.round(((total - abs) / total) * 100);
};

/* ──────────────────────────────────────────────────────────
   FORMULAIRE ÉTUDIANT
────────────────────────────────────────────────────────── */
const EtudiantForm = ({ initial, formRef }) => {
  const defaults = {
    nom: '', prenom: '', email: '', tel: '', ville: '', pays: 'Tunisie',
    formations: [],
    modeFormation: 'Présentiel',
    dateInscription: new Date().toISOString().slice(0, 10),
    statut: 'Actif',
    attestation: 'Non',
    dateAttestation: '',
    documents: [],
  };

  const [fd, setFd] = useState({ ...defaults, ...(initial || {}) });
  formRef.current = fd;

  const set = (field, value) => setFd(prev => ({ ...prev, [field]: value }));

  const toggleFormation = (id) => {
    setFd(prev => {
      const arr = prev.formations.includes(id)
        ? prev.formations.filter(x => x !== id)
        : [...prev.formations, id];
      return { ...prev, formations: arr };
    });
  };

  const toggleDoc = (doc) => {
    setFd(prev => {
      const arr = prev.documents.includes(doc)
        ? prev.documents.filter(x => x !== doc)
        : [...prev.documents, doc];
      return { ...prev, documents: arr };
    });
  };

  const F = ({ label, name, type = 'text', placeholder = '' }) => (
    <div className="pf-group">
      <label>{label}</label>
      <input type={type} value={fd[name] || ''} placeholder={placeholder}
        onChange={e => set(name, e.target.value)} />
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
      <textarea rows={3} value={fd[name] || ''} placeholder={placeholder}
        onChange={e => set(name, e.target.value)} />
    </div>
  );

  return (
    <div className="pf-body">

      {/* ── Section 1 : Informations générales ── */}
      <div className="pf-section-title"><i className="fa-solid fa-user"></i> Informations générales</div>
      <div className="pf-grid">
        <F label="Nom *"     name="nom"    placeholder="Ben Ali" />
        <F label="Prénom *"  name="prenom" placeholder="Sami" />
        <F label="Email *"   name="email"  type="email" placeholder="email@exemple.com" />
        <F label="Téléphone" name="tel"    placeholder="+216 XX XXX XXX" />
        <F label="Ville"     name="ville"  placeholder="Tunis" />
        <S label="Pays"      name="pays"   options={PAYS_LIST} />
      </div>

      {/* ── Section 2 : Informations académiques ── */}
      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-graduation-cap"></i> Informations académiques
      </div>
      <div className="pf-grid">
        <div className="pf-group pf-full">
          <label>Formation(s) suivie(s) *</label>
          <div className="form-multi-checks">
            {FORMATIONS_LIST.map(f => (
              <label key={f.id} className="form-check-inline">
                <input type="checkbox"
                  checked={fd.formations.includes(f.id)}
                  onChange={() => toggleFormation(f.id)} />
                {f.label}
                <span style={{ fontSize:'11px', color:'#94A3B8', marginLeft:'4px' }}>({f.duree})</span>
              </label>
            ))}
          </div>
        </div>
        <S label="Mode de formation"  name="modeFormation"   options={['Présentiel','En ligne','Hybride']} />
        <F label="Date d'inscription" name="dateInscription" type="date" />
        <S label="Statut"             name="statut"          options={['Actif','Abandonné','Certifié']} />
      </div>

      {/* ── Section 3 : Suivi pédagogique ── */}
      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-chart-line"></i> Suivi pédagogique
      </div>
      <div className="pf-grid">
        <S label="Attestation" name="attestation" options={['Non','Oui']} />
        {fd.attestation === 'Oui' && (
          <F label="Date de délivrance" name="dateAttestation" type="date" />
        )}
        <T label="Notes / Observations" name="notes" placeholder="Résultats, observations pédagogiques..." />
      </div>

      {/* ── Section 4 : Informations administratives ── */}
      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-folder-open"></i> Informations administratives
      </div>
      <div className="pf-grid">
        <div className="pf-group pf-full">
          <label>Documents fournis</label>
          <div className="docs-checks">
            {DOCS_LIST.map(d => (
              <label key={d} className="doc-check-item">
                <input type="checkbox"
                  checked={fd.documents.includes(d)}
                  onChange={() => toggleDoc(d)} />
                {d}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   DONNÉES INITIALES (sans champs supprimés)
────────────────────────────────────────────────────────── */
const INIT_DATA = [
  {
    id:1, nom:'Ben Ali', prenom:'Sami', email:'sami.benali@email.com', tel:'+216 22 111 000',
    ville:'Tunis', pays:'Tunisie',
    formations:[1,2], modeFormation:'Présentiel', dateInscription:'2025-01-10', statut:'Actif',
    notes:'Très assidu, bons résultats.', attestation:'Non', dateAttestation:'',
    documents:['CIN','CV','Contrat'],
  },
  {
    id:2, nom:'Trabelsi', prenom:'Ines', email:'ines.trabelsi@email.com', tel:'+216 55 222 111',
    ville:'Sfax', pays:'Tunisie',
    formations:[2], modeFormation:'En ligne', dateInscription:'2025-01-12', statut:'Actif',
    notes:'Quelques absences en début de mois.', attestation:'Non', dateAttestation:'',
    documents:['CIN','RNE','Contrat'],
  },
  {
    id:3, nom:'Meddeb', prenom:'Karim', email:'k.meddeb@email.com', tel:'+216 99 333 222',
    ville:'Sousse', pays:'Tunisie',
    formations:[3,5], modeFormation:'Hybride', dateInscription:'2024-09-15', statut:'Certifié',
    notes:'Excellent étudiant.', attestation:'Oui', dateAttestation:'2025-03-01',
    documents:['CIN','CV','Reçu'],
  },
  {
    id:4, nom:'Chaabane', prenom:'Leila', email:'leila.ch@email.com', tel:'+216 44 444 333',
    ville:'Tunis', pays:'Tunisie',
    formations:[4], modeFormation:'Présentiel', dateInscription:'2025-02-01', statut:'Abandonné',
    notes:'A abandonné après 3 semaines.', attestation:'Non', dateAttestation:'',
    documents:['CIN'],
  },
  {
    id:5, nom:'Hamdi', prenom:'Zied', email:'zied.hamdi@email.com', tel:'+216 22 666 555',
    ville:'Tunis', pays:'Tunisie',
    formations:[5,6], modeFormation:'Présentiel', dateInscription:'2025-01-20', statut:'Actif',
    notes:'Profil DevOps confirmé.', attestation:'Non', dateAttestation:'',
    documents:['CIN','CV','RNE','Contrat'],
  },
  {
    id:6, nom:'Jebali', prenom:'Amira', email:'amira.j@email.com', tel:'+216 55 777 666',
    ville:'Nabeul', pays:'Tunisie',
    formations:[2,9], modeFormation:'En ligne', dateInscription:'2025-02-10', statut:'Actif',
    notes:'Intéressée par le ML appliqué.', attestation:'Non', dateAttestation:'',
    documents:['CIN','CV'],
  },
  {
    id:7, nom:'Boukadida', prenom:'Yassine', email:'y.boukadida@email.com', tel:'+216 99 888 777',
    ville:'Monastir', pays:'Tunisie',
    formations:[3], modeFormation:'En ligne', dateInscription:'2024-10-05', statut:'Certifié',
    notes:'Major de promotion.', attestation:'Oui', dateAttestation:'2025-01-15',
    documents:['CIN','CV','Contrat','Reçu','RNE'],
  },
  {
    id:8, nom:'Gharbi', prenom:'Rim', email:'rim.gharbi@email.com', tel:'+216 44 999 888',
    ville:'Tunis', pays:'Tunisie',
    formations:[1,7], modeFormation:'Hybride', dateInscription:'2025-01-28', statut:'Actif',
    notes:'Suit React et Flutter en parallèle.', attestation:'Non', dateAttestation:'',
    documents:['CIN','CV','Reçu'],
  },
];

/* ──────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
────────────────────────────────────────────────────────── */
const Etudiants = () => {
  const navigate = useNavigate();

  const [etudiants,        setEtudiants]        = useState(INIT_DATA);
  const [search,           setSearch]           = useState('');
  const [filterStatut,     setFilterStatut]     = useState('Tous');
  const [filterFormation,  setFilterFormation]  = useState('Toutes');
  const [sortAlpha,        setSortAlpha]        = useState(false);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [pageView,         setPageView]         = useState('list');
  const [detailTarget,     setDetailTarget]     = useState(null);
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [showDiplomeModal, setShowDiplomeModal] = useState(false);

  /* ── État de la modale de conversion ── */
  const [diplomeData, setDiplomeData] = useState({
    formationCertifiee: '',   // ID de la formation choisie
    dateAttestation: new Date().toISOString().slice(0,10),
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [drawerTarget, setDrawerTarget] = useState(null);
  const formRef = useRef(null);

  const PER_PAGE = 8;

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getFormationLabels = (ids = []) =>
    ids.map(id => FORMATIONS_LIST.find(f => f.id === id)?.label).filter(Boolean);

  // ── Filtres ──
  const getFiltered = () => {
    let f = [...etudiants];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(e =>
        e.nom.toLowerCase().includes(q) ||
        e.prenom.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.tel.includes(q)
      );
    }
    if (filterStatut !== 'Tous') f = f.filter(e => e.statut === filterStatut);
    if (filterFormation !== 'Toutes') {
      const fid = parseInt(filterFormation);
      f = f.filter(e => e.formations.includes(fid));
    }
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };

  const filtered     = getFiltered();
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Drawer (modifier seulement) ──
  const openEdit = (id) => {
    const e = etudiants.find(x => x.id === id);
    if (!e) return;
    setDrawerTarget(e); setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setDrawerTarget(null); formRef.current = null; };

  const saveDrawer = () => {
    const data = formRef.current;
    if (!data) return;
    if (!data.nom?.trim() || !data.prenom?.trim() || !data.email?.trim()) {
      showToast('Veuillez remplir Nom, Prénom et Email.', 'error'); return;
    }
    if (!data.formations?.length) {
      showToast('Veuillez sélectionner au moins une formation.', 'error'); return;
    }
    const updated = { ...drawerTarget, ...data };
    setEtudiants(prev => prev.map(e => e.id === drawerTarget.id ? updated : e));
    if (detailTarget?.id === drawerTarget.id) setDetailTarget(updated);
    showToast('Étudiant modifié avec succès !');
    closeDrawer();
  };

  // ── Détail ──
  const openDetail = (id) => {
    const e = etudiants.find(x => x.id === id);
    if (!e) return;
    setDetailTarget(e); setPageView('detail');
  };
  const closeDetail = () => { setPageView('list'); setDetailTarget(null); };

  // ── Supprimer ──
  const openDelete = (id) => {
    const e = etudiants.find(x => x.id === id);
    if (!e) return;
    setDeleteTarget(e); setShowDeleteModal(true);
  };
  const closeDelete   = () => { setShowDeleteModal(false); setDeleteTarget(null); };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setEtudiants(prev => prev.filter(e => e.id !== deleteTarget.id));
    if (detailTarget?.id === deleteTarget.id) { setPageView('list'); setDetailTarget(null); }
    closeDelete();
    showToast('Étudiant supprimé.');
  };

  // ── Modale Convertir en diplômé ──
  const openDiplome = () => {
    const formations = detailTarget?.formations || [];
    setDiplomeData({
      formationCertifiee: formations.length === 1 ? formations[0] : '',
      dateAttestation: new Date().toISOString().slice(0,10),
    });
    setShowDiplomeModal(true);
  };
  const closeDiplome = () => setShowDiplomeModal(false);

  const confirmDiplome = () => {
    if (!diplomeData.formationCertifiee) {
      showToast('Veuillez choisir la formation terminée.', 'error'); return;
    }
    if (!diplomeData.dateAttestation) {
      showToast('Veuillez saisir la date de l\'attestation.', 'error'); return;
    }
    const updated = {
      ...detailTarget,
      statut: 'Certifié',
      attestation: 'Oui',
      dateAttestation: diplomeData.dateAttestation,
      formationCertifiee: parseInt(diplomeData.formationCertifiee),
    };
    setEtudiants(prev => prev.map(e => e.id === detailTarget.id ? updated : e));
    setDetailTarget(updated);
    closeDiplome();
    const formLabel = FORMATIONS_LIST.find(f => f.id === parseInt(diplomeData.formationCertifiee))?.label || '';
    showToast(`🎓 ${detailTarget.prenom} ${detailTarget.nom} — attestation délivrée pour « ${formLabel} » !`);
  };

  // ══════════════════════════════════════════════════════════
  // DRAWER JSX
  // ══════════════════════════════════════════════════════════
  const DrawerPanel = () => {
    if (!drawerOpen) return null;
    return (
      <>
        <div className="drawer-overlay" onClick={closeDrawer} />
        <div className="drawer-panel open">
          <div className="drawer-header drawer-header-edit">
            <div className="drawer-header-left">
              <i className="fa-solid fa-pen"></i>
              <span>Modifier l'étudiant</span>
            </div>
            <button className="drawer-close" onClick={closeDrawer}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="drawer-body">
            <EtudiantForm key={drawerTarget?.id} initial={drawerTarget} formRef={formRef} />
          </div>
          <div className="drawer-footer">
            <button className="btn btn-cancel" onClick={closeDrawer}>Annuler</button>
            <button className="btn btn-update" onClick={saveDrawer}>
              <i className="fa-solid fa-floppy-disk"></i> Enregistrer
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
      <div className="modal-overlay show" onClick={ev => { if (ev.target === ev.currentTarget) closeDelete(); }}>
        <div className="modal-suppr">
          <div style={{ display:'flex', justifyContent:'center', paddingTop:'28px' }}>
            <div className="suppr-icon-wrap">
              <i className="fa-solid fa-trash" style={{ fontSize:'26px', color:'#ef4444' }}></i>
            </div>
          </div>
          <div style={{ padding:'16px 24px', textAlign:'center' }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'14px', color:'#1e293b' }}>
              Supprimer l'étudiant
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', textAlign:'left' }}>
              <div style={{ background:'#336699', borderRadius:'8px', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'13px', flexShrink:0 }}>
                {deleteTarget.prenom[0]}{deleteTarget.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight:'600', color:'#1e293b' }}>{deleteTarget.prenom} {deleteTarget.nom}</div>
                <div style={{ fontSize:'11.5px', color:'#94a3b8' }}>{deleteTarget.email}</div>
              </div>
              <span className="badge" style={{ marginLeft:'auto', background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{deleteTarget.statut}</span>
            </div>
            <div className="suppr-warning">
              <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink:0 }}></i>
              <span>Cette action est <strong>irréversible</strong>. L'étudiant sera définitivement supprimé.</span>
            </div>
          </div>
          <div style={{ padding:'12px 24px 20px', display:'flex', gap:'10px' }}>
            <button className="btn btn-cancel" style={{ flex:1 }} onClick={closeDelete}>
              <i className="fa-solid fa-xmark"></i> Annuler
            </button>
            <button className="btn btn-suppr-confirm" style={{ flex:1 }} onClick={confirmDelete}>
              <i className="fa-solid fa-trash"></i> Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // MODALE CONVERTIR EN DIPLÔMÉ
  // ══════════════════════════════════════════════════════════
  const DiplomeModal = () => {
    if (!showDiplomeModal || !detailTarget) return null;

    const formationsEtudiant = detailTarget.formations || [];
    const aPlusieursForms    = formationsEtudiant.length > 1;

    return (
      <div className="modal-overlay show" onClick={ev => { if (ev.target === ev.currentTarget) closeDiplome(); }}>
        <div className="modal-diplome">

          {/* Header gradient */}
          <div className="diplome-header">
            <div className="diplome-header-left">
              <i className="fa-solid fa-certificate"></i>
              <span>Délivrer une attestation</span>
            </div>
            <button className="diplome-close" onClick={closeDiplome}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="diplome-body">

            {/* Card étudiant */}
            <div className="diplome-student-card">
              <div className="diplome-avatar">{detailTarget.prenom[0]}{detailTarget.nom[0]}</div>
              <div>
                <div style={{ fontWeight:'700', color:'#1E3A5F' }}>{detailTarget.prenom} {detailTarget.nom}</div>
                <div style={{ fontSize:'12px', color:'#94A3B8' }}>{detailTarget.email}</div>
              </div>
            </div>

            {/* Choix de la formation terminée */}
            <div className="diplome-form-group">
              <label>
                Formation terminée *
                {aPlusieursForms && (
                  <span style={{ marginLeft:'6px', fontSize:'11px', color:'#e67e22', fontWeight:'600' }}>
                    ⚠ Cet étudiant a plusieurs formations — choisissez celle certifiée
                  </span>
                )}
              </label>

              {/* Si une seule formation : affichage en lecture seule */}
              {!aPlusieursForms ? (
                <div style={{
                  padding: '10px 14px', background: 'rgba(51,204,255,.08)',
                  border: '1.5px solid rgba(51,204,255,.30)', borderRadius: '9px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <i className="fa-solid fa-book-open" style={{ color:'#1A7A99', fontSize:'14px' }}></i>
                  <span style={{ fontWeight:'600', color:'#1E3A5F', fontSize:'14px' }}>
                    {FORMATIONS_LIST.find(f => f.id === formationsEtudiant[0])?.label}
                  </span>
                  <span style={{ marginLeft:'auto', fontSize:'11px', color:'#94A3B8' }}>
                    {FORMATIONS_LIST.find(f => f.id === formationsEtudiant[0])?.duree}
                  </span>
                </div>
              ) : (
                /* Si plusieurs formations : cards cliquables */
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'4px' }}>
                  {formationsEtudiant.map(fid => {
                    const formation = FORMATIONS_LIST.find(f => f.id === fid);
                    const selected  = parseInt(diplomeData.formationCertifiee) === fid;
                    return (
                      <div
                        key={fid}
                        onClick={() => setDiplomeData(p => ({ ...p, formationCertifiee: fid }))}
                        style={{
                          padding: '11px 14px', borderRadius: '9px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '12px',
                          border: selected
                            ? '2px solid #33CCFF'
                            : '1.5px solid #E2E8F0',
                          background: selected
                            ? 'rgba(51,204,255,.10)'
                            : '#FAFAFA',
                          transition: 'all .18s ease',
                        }}
                      >
                        {/* Radio visuel */}
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                          border: selected ? '5px solid #33CCFF' : '2px solid #CBD5E1',
                          background: selected ? '#fff' : '#fff',
                          transition: 'all .18s ease',
                        }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight: selected ? '700' : '500', color: selected ? '#1E3A5F' : '#475569', fontSize:'13.5px' }}>
                            {formation?.label}
                          </div>
                        </div>
                        <span style={{ fontSize:'11px', color:'#94A3B8', fontWeight:'600' }}>
                          {formation?.duree}
                        </span>
                        {selected && (
                          <i className="fa-solid fa-circle-check" style={{ color:'#33CCFF', fontSize:'16px' }}></i>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date de l'attestation */}
            <div className="diplome-form-group">
              <label>Date de délivrance de l'attestation *</label>
              <input
                type="date"
                value={diplomeData.dateAttestation}
                onChange={ev => setDiplomeData(p => ({ ...p, dateAttestation: ev.target.value }))}
              />
            </div>

            {/* Info box */}
            <div style={{
              background:'rgba(255,204,51,.10)', border:'1px solid rgba(255,204,51,.35)',
              borderRadius:'9px', padding:'10px 14px', fontSize:'12.5px', color:'#8A6200',
              display:'flex', alignItems:'flex-start', gap:'8px', marginTop:'4px',
            }}>
              <i className="fa-solid fa-circle-info" style={{ marginTop:'1px', flexShrink:0 }}></i>
              <span>
                Le statut de l'étudiant passera à <strong>Certifié</strong> et une attestation
                sera enregistrée pour la formation sélectionnée.
              </span>
            </div>

          </div>

          <div className="diplome-footer">
            <button className="btn btn-cancel" onClick={closeDiplome}>Annuler</button>
            <button className="btn btn-diplome" onClick={confirmDiplome}>
              <i className="fa-solid fa-certificate"></i> Confirmer l'attestation
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
  // PAGE DÉTAIL
  // ══════════════════════════════════════════════════════════
  if (pageView === 'detail' && detailTarget) {
    const e          = detailTarget;
    const sc         = STATUT_COLORS[e.statut] || {};
    const formLabels = getFormationLabels(e.formations);

    return (
      <Layout>
        <div className="det-page">

          <div className="det-topbar">
            <button className="back-btn" onClick={closeDetail}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Étudiants</span>
            </button>
            <i className="fa-solid fa-chevron-right det-bc-sep"></i>
            <span className="det-bc-name">{e.prenom} {e.nom}</span>
          </div>

          <div className="det-body">

            {/* ════ SIDEBAR ════ */}
            <div className="det-sidebar">
              <div className="det-sid-hero">
                <div className="det-sid-avatar">{e.prenom[0]}{e.nom[0]}</div>
                <div className="det-sid-name">{e.prenom} {e.nom}</div>
                <span className="badge det-sid-badge" style={{ background:sc.bg, color:sc.color, border:`1.5px solid ${sc.border}` }}>
                  {e.statut}
                </span>
              </div>

              <div className="det-sid-divider" />

              <div className="det-sid-fields">
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-envelope"></i> E-mail</span>
                  <span className="det-sid-val">{e.email}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-phone"></i> Téléphone</span>
                  <span className="det-sid-val">{e.tel || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-location-dot"></i> Ville / Pays</span>
                  <span className="det-sid-val">{[e.ville, e.pays].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-chalkboard-user"></i> Mode</span>
                  <span className="det-sid-val">{e.modeFormation || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-calendar"></i> Date inscription</span>
                  <span className="det-sid-val">{e.dateInscription}</span>
                </div>
              </div>

              <div className="det-sid-divider" />

              <div className="det-sid-actions">
                <button className="det-action-btn det-action-diplome" onClick={openDiplome}>
                  <i className="fa-solid fa-certificate"></i>
                  Convertir en Diplômé
                </button>
                <button className="det-action-btn det-action-edit" onClick={() => openEdit(e.id)}>
                  <i className="fa-solid fa-pen"></i>
                  Modifier
                </button>
              </div>
            </div>

            {/* ════ CONTENU DROITE ════ */}
            <div className="det-main">

              {/* Section : Informations générales */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-user"></i> Informations générales</div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Nom</span><span className="det-field-val">{e.nom}</span></div>
                  <div className="det-field"><span className="det-field-label">Prénom</span><span className="det-field-val">{e.prenom}</span></div>
                  <div className="det-field"><span className="det-field-label">Email</span><span className="det-field-val">{e.email}</span></div>
                  <div className="det-field"><span className="det-field-label">Téléphone</span><span className="det-field-val">{e.tel || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Ville</span><span className="det-field-val">{e.ville || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Pays</span><span className="det-field-val">{e.pays || '—'}</span></div>
                </div>
              </div>

              {/* Section : Informations académiques */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-graduation-cap"></i> Informations académiques</div>
                <div className="det-fields-grid">
                  <div className="det-field" style={{ gridColumn:'1 / -1' }}>
                    <span className="det-field-label">Formation(s) suivie(s)</span>
                    <div className="formations-list" style={{ marginTop:'6px' }}>
                      {formLabels.length ? formLabels.map(l => (
                        <span key={l} className="formation-pill"><i className="fa-solid fa-book-open"></i>{l}</span>
                      )) : <span style={{ color:'#94A3B8', fontSize:'13px' }}>—</span>}
                    </div>
                  </div>
                  <div className="det-field"><span className="det-field-label">Mode de formation</span><span className="det-field-val">{e.modeFormation || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Date d'inscription</span><span className="det-field-val">{e.dateInscription || '—'}</span></div>
                  <div className="det-field">
                    <span className="det-field-label">Statut</span>
                    <span className="det-field-val">
                      <span className="badge" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{e.statut}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Section : Suivi pédagogique */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-chart-line"></i> Suivi pédagogique</div>
                <div className="det-fields-grid">
                  <div className="det-field">
                    <span className="det-field-label">Attestation</span>
                    <span className="det-field-val">
                      <span className="badge" style={{
                        background: e.attestation === 'Oui' ? 'rgba(26,107,74,.12)' : 'rgba(148,163,184,.12)',
                        color: e.attestation === 'Oui' ? '#1A6B4A' : '#94A3B8',
                        border: `1px solid ${e.attestation === 'Oui' ? 'rgba(26,107,74,.28)' : '#E2E8F0'}`,
                      }}>
                        {e.attestation === 'Oui' ? '✓ Oui' : 'Non'}
                      </span>
                    </span>
                  </div>
                  {e.attestation === 'Oui' && e.dateAttestation && (
                    <div className="det-field">
                      <span className="det-field-label">Date de délivrance</span>
                      <span className="det-field-val">{e.dateAttestation}</span>
                    </div>
                  )}
                </div>
                {e.notes && (
                  <div className="det-notes-row">
                    <span className="det-field-label">Notes / Observations</span>
                    <div className="notes-box">{e.notes}</div>
                  </div>
                )}
              </div>

              {/* Section : Informations administratives */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-folder-open"></i> Informations administratives</div>
                <div className="det-fields-grid">
                  <div className="det-field" style={{ gridColumn:'1 / -1' }}>
                    <span className="det-field-label">Documents fournis</span>
                    <div className="docs-list" style={{ marginTop:'6px' }}>
                      {e.documents?.length ? e.documents.map(d => (
                        <span key={d} className="doc-pill"><i className="fa-solid fa-check"></i>{d}</span>
                      )) : <span style={{ color:'#94A3B8', fontSize:'13px' }}>Aucun document</span>}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <DrawerPanel />
        <DeleteModal />
        <DiplomeModal />
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
        <div className="prsp-title"><i className="fa-solid fa-user-graduate"></i> Gestion des Étudiants</div>
        <div className="prsp-sub">Suivez le parcours de vos étudiants et leur certification</div>
      </div>

      <div className="toolbar">
        <div className="tb-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input placeholder="Rechercher..." value={search}
              onChange={ev => { setSearch(ev.target.value); setCurrentPage(1); }} />
          </div>
          <select className="filter-sel" value={filterStatut}
            onChange={ev => { setFilterStatut(ev.target.value); setCurrentPage(1); }}>
            <option value="Tous">Tous les statuts</option>
            <option>Actif</option><option>Abandonné</option><option>Certifié</option>
          </select>
          <select className="filter-sel" value={filterFormation}
            onChange={ev => { setFilterFormation(ev.target.value); setCurrentPage(1); }}>
            <option value="Toutes">Toutes les formations</option>
            {FORMATIONS_LIST.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
          <button className={`btn btn-sort ${sortAlpha ? 'active' : ''}`} onClick={() => setSortAlpha(v => !v)}>
            <i className="fa-solid fa-arrow-down-a-z"></i> A → Z
          </button>
        </div>
        <div className="tb-right">
          <button className="btn btn-imp" onClick={() => showToast('Export CSV bientôt disponible.', 'error')}>
            <i className="fa-solid fa-file-export"></i> Exporter
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-top">
          <strong>{filtered.length}</strong> étudiant{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width:'32px' }}>#</th>
                <th>Nom & Prénom</th>
                <th>Contact</th>
                <th>Formations inscrites</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSlice.map((e, i) => {
                const sc     = STATUT_COLORS[e.statut] || {};
                const labels = getFormationLabels(e.formations);
                return (
                  <tr key={e.id}>
                    <td className="td-num">{(currentPage - 1) * PER_PAGE + i + 1}</td>
                    <td>
                      <div className="td-name">{e.nom} {e.prenom}</div>
                      <div className="td-sub">{e.email}</div>
                    </td>
                    <td>
                      <div className="td-sub">{e.email}</div>
                      <div className="td-sub">{e.tel}</div>
                    </td>
                    <td>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'3px' }}>
                        {labels.slice(0,2).map(l => <span key={l} className="form-tag">{l}</span>)}
                        {labels.length > 2 && (
                          <span className="form-tag" style={{ background:'rgba(148,163,184,.12)', color:'#64748B' }}>+{labels.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{e.statut}</span>
                    </td>
                    <td className="td-sub">{e.dateInscription}</td>
                    <td className="td-actions">
                      <button className="act-btn act-detail" title="Voir le détail" onClick={() => openDetail(e.id)}><i className="fa-solid fa-eye"></i></button>
                      <button className="act-btn act-modif"  title="Modifier"       onClick={() => openEdit(e.id)}><i className="fa-solid fa-pen"></i></button>
                      <button className="act-btn act-suppr"  title="Supprimer"      onClick={() => openDelete(e.id)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {currentSlice.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-user-graduate"></i>
              <p>Aucun étudiant trouvé.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="pg-btn" disabled={currentPage===1} onClick={() => setCurrentPage(1)}><i className="fa-solid fa-angles-left"></i></button>
          <button className="pg-btn" disabled={currentPage===1} onClick={() => setCurrentPage(p => p-1)}><i className="fa-solid fa-angle-left"></i></button>
          {Array.from({ length:totalPages }, (_,idx) => idx+1).map(page => (
            <button key={page} className={`pg-num ${currentPage===page?'active':''}`} onClick={() => setCurrentPage(page)}>{page}</button>
          ))}
          <button className="pg-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p => p+1)}><i className="fa-solid fa-angle-right"></i></button>
          <button className="pg-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(totalPages)}><i className="fa-solid fa-angles-right"></i></button>
        </div>
      </div>

      <DrawerPanel />
      <DeleteModal />
      <Toast />
    </Layout>
  );
};

export default Etudiants;