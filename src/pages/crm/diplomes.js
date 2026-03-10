import React, { useState } from 'react';
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

const PAY_STYLES = {
  'Payé':        'pay-tag-paid',
  'Par tranche': 'pay-tag-tranche',
  'Non payé':    'pay-tag-unpaid',
};

/* ──────────────────────────────────────────────────────────
   DONNÉES INITIALES
   formationCertifiee = ID de la formation pour laquelle
   l'attestation a été délivrée (une seule par enregistrement)
────────────────────────────────────────────────────────── */
const INIT_DATA = [
  {
    id:1, nom:'Meddeb', prenom:'Karim', email:'k.meddeb@email.com', tel:'+216 99 333 222',
    ville:'Sousse', pays:'Tunisie',
    formations:[3,5], formationCertifiee:3,
    modeFormation:'Hybride', dateInscription:'2024-09-15', dateAttestation:'2025-03-01',
    seancesTotal:40, absences:2,
    typeFinancement:'Personnel', documents:['CIN','CV','Reçu'], paiement:'Payé', modePaiement:'Espèce',
  },
  {
    id:2, nom:'Boukadida', prenom:'Yassine', email:'y.boukadida@email.com', tel:'+216 99 888 777',
    ville:'Monastir', pays:'Tunisie',
    formations:[3], formationCertifiee:3,
    modeFormation:'En ligne', dateInscription:'2024-10-05', dateAttestation:'2025-01-15',
    seancesTotal:35, absences:1,
    typeFinancement:'Entreprise', documents:['CIN','CV','Contrat','Reçu','RNE'], paiement:'Payé', modePaiement:'Chèque',
  },
  {
    id:3, nom:'Sfaxi', prenom:'Sara', email:'sara.sfaxi@email.com', tel:'+216 22 111 999',
    ville:'Sfax', pays:'Tunisie',
    formations:[1], formationCertifiee:1,
    modeFormation:'En ligne', dateInscription:'2024-08-20', dateAttestation:'2025-02-10',
    seancesTotal:30, absences:3,
    typeFinancement:'Personnel', documents:['CIN','CV','Contrat'], paiement:'Par tranche', modePaiement:'Chèque',
  },
  {
    id:4, nom:'Khelifi', prenom:'Amine', email:'amine.khelifi@email.com', tel:'+216 55 432 111',
    ville:'Tunis', pays:'Tunisie',
    formations:[2,9], formationCertifiee:2,
    modeFormation:'Présentiel', dateInscription:'2024-07-01', dateAttestation:'2025-01-20',
    seancesTotal:50, absences:8,
    typeFinancement:'Entreprise', documents:['CIN','RNE','Contrat'], paiement:'Payé', modePaiement:'Virement',
  },
  {
    id:5, nom:'Dridi', prenom:'Fatma', email:'fatma.dridi@email.com', tel:'+216 77 654 321',
    ville:'Tunis', pays:'Tunisie',
    formations:[8], formationCertifiee:8,
    modeFormation:'Présentiel', dateInscription:'2024-06-15', dateAttestation:'2024-12-20',
    seancesTotal:60, absences:0,
    typeFinancement:'Personnel', documents:['CIN','CV'], paiement:'Payé', modePaiement:'Espèce',
  },
  {
    id:6, nom:'Belhadj', prenom:'Omar', email:'omar.bh@email.com', tel:'+216 22 987 654',
    ville:'Nabeul', pays:'Tunisie',
    formations:[6,7], formationCertifiee:6,
    modeFormation:'Hybride', dateInscription:'2024-05-10', dateAttestation:'2024-11-30',
    seancesTotal:45, absences:4,
    typeFinancement:'Personnel', documents:['CIN','CV','Reçu'], paiement:'Non payé', modePaiement:'Espèce',
  },
  {
    id:7, nom:'Mansouri', prenom:'Nadia', email:'nadia.mansouri@email.com', tel:'+216 55 111 222',
    ville:'Bizerte', pays:'Tunisie',
    formations:[4,10], formationCertifiee:4,
    modeFormation:'En ligne', dateInscription:'2024-09-01', dateAttestation:'2025-02-28',
    seancesTotal:28, absences:2,
    typeFinancement:'Entreprise', documents:['CIN','CV','Contrat','RNE'], paiement:'Payé', modePaiement:'Virement',
  },
  {
    id:8, nom:'Chouchane', prenom:'Bilel', email:'bilel.ch@email.com', tel:'+216 99 333 444',
    ville:'Sousse', pays:'Tunisie',
    formations:[5], formationCertifiee:5,
    modeFormation:'Présentiel', dateInscription:'2024-04-15', dateAttestation:'2024-10-15',
    seancesTotal:50, absences:12,
    typeFinancement:'Personnel', documents:['CIN'], paiement:'Par tranche', modePaiement:'Chèque',
  },
];

/* ──────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────── */
const calcPct = (seancesTotal, absences) => {
  const total = parseInt(seancesTotal) || 0;
  const abs   = parseInt(absences)     || 0;
  if (total <= 0) return 0;
  return Math.round(((total - abs) / total) * 100);
};

const getFormationLabel  = (id)    => FORMATIONS_LIST.find(f => f.id === id)?.label || '—';
const getFormationLabels = (ids=[])=> ids.map(id => FORMATIONS_LIST.find(f=>f.id===id)?.label).filter(Boolean);

/* ──────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
────────────────────────────────────────────────────────── */
const Diplomes = () => {
  const navigate = useNavigate();

  const [diplomes,        setDiplomes]        = useState(INIT_DATA);
  const [search,          setSearch]          = useState('');
  const [filterFormation, setFilterFormation] = useState('Toutes');
  const [filterPaiement,  setFilterPaiement]  = useState('Tous');
  const [sortAlpha,       setSortAlpha]       = useState(false);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [pageView,        setPageView]        = useState('list');
  const [detailTarget,    setDetailTarget]    = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast,           setToast]           = useState({ show: false, message: '', type: 'success' });

  const PER_PAGE = 8;

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── Filtres ──
  const getFiltered = () => {
    let f = [...diplomes];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(d =>
        d.nom.toLowerCase().includes(q) ||
        d.prenom.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.tel.includes(q)
      );
    }
    if (filterFormation !== 'Toutes') {
      const fid = parseInt(filterFormation);
      f = f.filter(d => d.formationCertifiee === fid);
    }
    if (filterPaiement !== 'Tous') f = f.filter(d => d.paiement === filterPaiement);
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };

  const filtered     = getFiltered();
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Détail ──
  const openDetail = (id) => {
    const d = diplomes.find(x => x.id === id);
    if (!d) return;
    setDetailTarget(d); setPageView('detail');
  };
  const closeDetail = () => { setPageView('list'); setDetailTarget(null); };

  // ── Supprimer ──
  const openDelete = (id) => {
    const d = diplomes.find(x => x.id === id);
    if (!d) return;
    setDeleteTarget(d); setShowDeleteModal(true);
  };
  const closeDelete   = () => { setShowDeleteModal(false); setDeleteTarget(null); };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDiplomes(prev => prev.filter(d => d.id !== deleteTarget.id));
    if (detailTarget?.id === deleteTarget.id) { setPageView('list'); setDetailTarget(null); }
    closeDelete();
    showToast('Diplômé supprimé.');
  };

  // ══════════════════════════════════════════════════════════
  // MODALE SUPPRESSION
  // ══════════════════════════════════════════════════════════
  const DeleteModal = () => {
    if (!showDeleteModal || !deleteTarget) return null;
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
              Supprimer le diplômé
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', textAlign:'left' }}>
              <div style={{ background:'linear-gradient(135deg,#FFCC33,#e6b800)', borderRadius:'8px', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4000', fontWeight:'700', fontSize:'13px', flexShrink:0 }}>
                {deleteTarget.prenom[0]}{deleteTarget.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight:'600', color:'#1e293b' }}>{deleteTarget.prenom} {deleteTarget.nom}</div>
                <div style={{ fontSize:'11.5px', color:'#94a3b8' }}>{getFormationLabel(deleteTarget.formationCertifiee)}</div>
              </div>
              <span className="badge" style={{ marginLeft:'auto', background:'rgba(255,204,51,.18)', color:'#8A6200', border:'1px solid rgba(255,204,51,.40)' }}>
                🎓 Diplômé
              </span>
            </div>
            <div className="suppr-warning">
              <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink:0 }}></i>
              <span>Cette action est <strong>irréversible</strong>. Le diplômé sera définitivement supprimé.</span>
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
    const d          = detailTarget;
    const formLabels = getFormationLabels(d.formations);
    const certLabel  = getFormationLabel(d.formationCertifiee);
    const pct        = calcPct(d.seancesTotal, d.absences);
    const presences  = Math.max(0, (parseInt(d.seancesTotal)||0) - (parseInt(d.absences)||0));

    return (
      <Layout>
        <div className="det-page">

          {/* ── Breadcrumb ── */}
          <div className="det-topbar">
            <button className="back-btn" onClick={closeDetail}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Diplômés</span>
            </button>
            <i className="fa-solid fa-chevron-right det-bc-sep"></i>
            <span className="det-bc-name">{d.prenom} {d.nom}</span>
          </div>

          <div className="det-body">

            {/* ════ SIDEBAR ════ */}
            <div className="det-sidebar">
              <div className="det-sid-hero">
                <div style={{ position:'relative', display:'inline-block' }}>
                  <div className="det-sid-avatar" style={{ background:'linear-gradient(135deg,#FFCC33,#e6b800)', color:'#5A4000' }}>
                    {d.prenom[0]}{d.nom[0]}
                  </div>
                  <div style={{ position:'absolute', top:'-10px', right:'-6px', fontSize:'18px' }}>🎓</div>
                </div>
                <div className="det-sid-name">{d.prenom} {d.nom}</div>
                <span className="badge det-sid-badge" style={{ background:'rgba(255,204,51,.18)', color:'#8A6200', border:'1.5px solid rgba(255,204,51,.40)' }}>
                  Diplômé(e)
                </span>
              </div>

              <div className="det-sid-divider" />

              <div className="det-sid-fields">
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-envelope"></i> E-mail</span>
                  <span className="det-sid-val">{d.email}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-phone"></i> Téléphone</span>
                  <span className="det-sid-val">{d.tel || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-location-dot"></i> Ville / Pays</span>
                  <span className="det-sid-val">{[d.ville, d.pays].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-certificate"></i> Formation certifiée</span>
                  <span className="det-sid-val" style={{ color:'#1E3A5F', fontWeight:'600' }}>{certLabel}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-award"></i> Date attestation</span>
                  <span className="det-sid-val" style={{ fontWeight:'700', color:'#8A6200' }}>{d.dateAttestation || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-chalkboard-user"></i> Mode</span>
                  <span className="det-sid-val">{d.modeFormation || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-calendar"></i> Date inscription</span>
                  <span className="det-sid-val">{d.dateInscription}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-wallet"></i> Paiement</span>
                  <span className="det-sid-val">
                    <span className={`badge ${PAY_STYLES[d.paiement] || ''}`}>{d.paiement}</span>
                  </span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-coins"></i> Mode paiement</span>
                  <span className="det-sid-val">{d.modePaiement || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-building"></i> Financement</span>
                  <span className="det-sid-val">{d.typeFinancement || '—'}</span>
                </div>
              </div>

              <div className="det-sid-divider" />

              {/* ── Boutons (pas de conversion) ── */}
              <div className="det-sid-actions">
                <button
                  className="det-action-btn"
                  style={{ background:'linear-gradient(135deg,rgba(51,204,255,.15),rgba(51,204,255,.08))', color:'#1A7A99', border:'1.5px solid rgba(51,204,255,.35)' }}
                  onClick={() => navigate('/attestations')}
                >
                  <i className="fa-solid fa-certificate"></i>
                  Voir liste attestations
                </button>
                <button
                  className="det-action-btn"
                  style={{ background:'linear-gradient(135deg,rgba(26,107,74,.12),rgba(26,107,74,.06))', color:'#1A6B4A', border:'1.5px solid rgba(26,107,74,.28)' }}
                  onClick={() => navigate('/paiements')}
                >
                  <i className="fa-solid fa-credit-card"></i>
                  Voir liste paiements
                </button>
                <button className="det-action-btn det-action-del" onClick={() => openDelete(d.id)}>
                  <i className="fa-solid fa-trash"></i>
                  Supprimer
                </button>
              </div>
            </div>

            {/* ════ CONTENU DROITE ════ */}
            <div className="det-main">

              {/* Bannière */}
              <div style={{
                background:'linear-gradient(135deg,#1E3A5F 0%,#336699 60%,#1A7A99 100%)',
                borderRadius:'12px', padding:'18px 22px',
                display:'flex', alignItems:'center', gap:'16px',
                boxShadow:'0 4px 20px rgba(30,58,95,.20)',
              }}>
                <div style={{ fontSize:'36px' }}>🎓</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'16px', fontWeight:'800', color:'#fff' }}>
                    {d.prenom} {d.nom}
                  </div>
                  <div style={{ fontSize:'12.5px', color:'rgba(255,255,255,.75)', marginTop:'3px' }}>
                    Attestation délivrée le {d.dateAttestation} · {certLabel}
                  </div>
                </div>
                <span className="badge" style={{ background:'rgba(255,204,51,.25)', color:'#FFCC33', border:'1.5px solid rgba(255,204,51,.50)', fontSize:'13px', fontWeight:'700', padding:'5px 14px' }}>
                  Certifié(e)
                </span>
              </div>

              {/* Section : Informations générales */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-user"></i> Informations générales</div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Nom</span><span className="det-field-val">{d.nom}</span></div>
                  <div className="det-field"><span className="det-field-label">Prénom</span><span className="det-field-val">{d.prenom}</span></div>
                  <div className="det-field"><span className="det-field-label">Email</span><span className="det-field-val">{d.email}</span></div>
                  <div className="det-field"><span className="det-field-label">Téléphone</span><span className="det-field-val">{d.tel || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Ville</span><span className="det-field-val">{d.ville || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Pays</span><span className="det-field-val">{d.pays || '—'}</span></div>
                </div>
              </div>

              {/* Section : Informations académiques — SANS mention ni notes */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-graduation-cap"></i> Informations académiques</div>
                <div className="det-fields-grid">

                  {/* Toutes les formations suivies, celle certifiée mise en valeur */}
                  <div className="det-field" style={{ gridColumn:'1 / -1' }}>
                    <span className="det-field-label">Formation(s) suivie(s)</span>
                    <div className="formations-list" style={{ marginTop:'6px' }}>
                      {formLabels.map(l => (
                        <span key={l} className="formation-pill"
                          style={ l === certLabel
                            ? { background:'rgba(255,204,51,.20)', color:'#8A6200', border:'1px solid rgba(255,204,51,.45)' }
                            : {} }>
                          <i className={`fa-solid ${l === certLabel ? 'fa-certificate' : 'fa-book-open'}`}></i>
                          {l}
                          {l === certLabel && (
                            <span style={{ fontSize:'10px', marginLeft:'4px', fontWeight:'700' }}>✓ certifiée</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="det-field"><span className="det-field-label">Mode de formation</span><span className="det-field-val">{d.modeFormation || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Date d'inscription</span><span className="det-field-val">{d.dateInscription || '—'}</span></div>
                  <div className="det-field">
                    <span className="det-field-label">Date attestation</span>
                    <span className="det-field-val" style={{ fontWeight:'700', color:'#8A6200' }}>{d.dateAttestation || '—'}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Attestation</span>
                    <span className="det-field-val">
                      <span className="badge" style={{ background:'rgba(26,107,74,.12)', color:'#1A6B4A', border:'1px solid rgba(26,107,74,.28)' }}>
                        ✓ Délivrée
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Section : Suivi pédagogique — SANS notes */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-chart-line"></i> Suivi pédagogique</div>
                <div className="det-fields-grid">
                  <div className="det-field">
                    <span className="det-field-label">Séances total</span>
                    <span className="det-field-val">{d.seancesTotal || '—'}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Absences</span>
                    <span className="det-field-val" style={{ color: parseInt(d.absences) > 0 ? '#c0392b' : '#1A6B4A', fontWeight:'700' }}>
                      {d.absences || '0'}
                    </span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Présences</span>
                    <span className="det-field-val" style={{ color:'#1A6B4A', fontWeight:'700' }}>{presences}</span>
                  </div>
                  <div className="det-field" style={{ gridColumn:'1 / -1' }}>
                    <span className="det-field-label">Taux de présence</span>
                    <div className="presence-bar-wrap" style={{ marginTop:'6px' }}>
                      <div className="presence-bar">
                        <div className="presence-bar-fill" style={{
                          width:`${Math.min(pct,100)}%`,
                          background: pct>=80 ? 'linear-gradient(90deg,#1A6B4A,#33CCFF)' : pct>=60 ? 'linear-gradient(90deg,#FFCC33,#e6b800)' : 'linear-gradient(90deg,#e53e3e,#c0392b)',
                        }}></div>
                      </div>
                      <span className="presence-pct" style={{ color: pct>=80?'#1A6B4A':pct>=60?'#8A6200':'#c0392b' }}>
                        {parseInt(d.seancesTotal) > 0 ? `${pct}%` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section : Informations administratives */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-folder-open"></i> Informations administratives</div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Type de financement</span><span className="det-field-val">{d.typeFinancement || '—'}</span></div>
                  <div className="det-field">
                    <span className="det-field-label">Paiement</span>
                    <span className="det-field-val"><span className={`badge ${PAY_STYLES[d.paiement] || ''}`}>{d.paiement}</span></span>
                  </div>
                  <div className="det-field"><span className="det-field-label">Mode de paiement</span><span className="det-field-val">{d.modePaiement || '—'}</span></div>
                  <div className="det-field" style={{ gridColumn:'1 / -1' }}>
                    <span className="det-field-label">Documents fournis</span>
                    <div className="docs-list" style={{ marginTop:'6px' }}>
                      {d.documents?.length ? d.documents.map(doc => (
                        <span key={doc} className="doc-pill"><i className="fa-solid fa-check"></i>{doc}</span>
                      )) : <span style={{ color:'#94A3B8', fontSize:'13px' }}>Aucun document</span>}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

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
        <div className="prsp-title"><i className="fa-solid fa-award"></i> Gestion des Diplômés</div>
        <div className="prsp-sub">Consultez les diplômés, leurs attestations et leurs paiements</div>
      </div>

      <div className="toolbar">
        <div className="tb-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input placeholder="Rechercher..." value={search}
              onChange={ev => { setSearch(ev.target.value); setCurrentPage(1); }} />
          </div>
          <select className="filter-sel" value={filterFormation}
            onChange={ev => { setFilterFormation(ev.target.value); setCurrentPage(1); }}>
            <option value="Toutes">Toutes les formations</option>
            {FORMATIONS_LIST.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
          <select className="filter-sel" value={filterPaiement}
            onChange={ev => { setFilterPaiement(ev.target.value); setCurrentPage(1); }}>
            <option value="Tous">Tous les paiements</option>
            <option>Payé</option><option>Par tranche</option><option>Non payé</option>
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
          <strong>{filtered.length}</strong> diplômé{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width:'32px' }}>#</th>
                <th>Nom & Prénom</th>
                <th>Contact</th>
                <th>Formation certifiée</th>
                <th>Date attestation</th>
                <th>Paiement</th>
                <th>Présence</th>
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSlice.map((d, i) => {
                const pct       = calcPct(d.seancesTotal, d.absences);
                const certLabel = getFormationLabel(d.formationCertifiee);
                return (
                  <tr key={d.id}>
                    <td className="td-num">{(currentPage - 1) * PER_PAGE + i + 1}</td>
                    <td>
                      <div className="td-name">🎓 {d.nom} {d.prenom}</div>
                      <div className="td-sub">{d.email}</div>
                    </td>
                    <td>
                      <div className="td-sub">{d.email}</div>
                      <div className="td-sub">{d.tel}</div>
                    </td>
                    <td>
                      <span className="form-tag" style={{ background:'rgba(255,204,51,.15)', color:'#8A6200', border:'1px solid rgba(255,204,51,.35)' }}>
                        <i className="fa-solid fa-certificate" style={{ marginRight:'4px', fontSize:'10px' }}></i>
                        {certLabel}
                      </span>
                    </td>
                    <td>
                      <div className="td-sub" style={{ fontWeight:'600', color:'#8A6200' }}>{d.dateAttestation}</div>
                    </td>
                    <td>
                      <span className={`badge ${PAY_STYLES[d.paiement] || ''}`}>{d.paiement}</span>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                        <div style={{ width:'55px', height:'6px', background:'#E8EDF3', borderRadius:'3px', overflow:'hidden' }}>
                          <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', borderRadius:'3px', background: pct>=80?'#1A6B4A':pct>=60?'#FFCC33':'#e53e3e' }}></div>
                        </div>
                        <span style={{ fontSize:'12px', color:'#475569', fontWeight:'600' }}>
                          {parseInt(d.seancesTotal) > 0 ? `${pct}%` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="td-actions">
                      <button className="act-btn act-detail" title="Voir le détail" onClick={() => openDetail(d.id)}><i className="fa-solid fa-eye"></i></button>
                      <button className="act-btn act-suppr"  title="Supprimer"      onClick={() => openDelete(d.id)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {currentSlice.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-award"></i>
              <p>Aucun diplômé trouvé.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="pg-btn" disabled={currentPage===1} onClick={() => setCurrentPage(1)}><i className="fa-solid fa-angles-left"></i></button>
          <button className="pg-btn" disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}><i className="fa-solid fa-angle-left"></i></button>
          {Array.from({ length:totalPages }, (_,idx) => idx+1).map(page => (
            <button key={page} className={`pg-num ${currentPage===page?'active':''}`} onClick={() => setCurrentPage(page)}>{page}</button>
          ))}
          <button className="pg-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}><i className="fa-solid fa-angle-right"></i></button>
          <button className="pg-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(totalPages)}><i className="fa-solid fa-angles-right"></i></button>
        </div>
      </div>

      <DeleteModal />
      <Toast />
    </Layout>
  );
};

export default Diplomes;