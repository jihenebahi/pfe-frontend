// src/pages/crm/Etudiants.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import '../../styles/crm/etudiants.css';
import api from '../../services/api';
import {
  getEtudiants,
  getEtudiant,
  updateEtudiant,
  deleteEtudiant,
  certifierEtudiant,
} from '../../services/crm/etudiantService';

/* ──────────────────────────────────────────────────────────
   CONSTANTES UI
────────────────────────────────────────────────────────── */
const PAYS_LIST  = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Belgique', 'Canada', 'Autre'];
const DOCS_LIST  = ['CIN', 'CV', 'Contrat', 'Reçu', 'RNE', 'Autres'];

const STATUT_COLORS = {
  'Actif':     { bg: 'rgba(26,107,74,.12)',  color: '#1A6B4A', border: 'rgba(26,107,74,.30)'  },
  'Abandonné': { bg: 'rgba(229,62,62,.10)',  color: '#c0392b', border: 'rgba(229,62,62,.28)'  },
  'Certifié':  { bg: 'rgba(255,204,51,.18)', color: '#8A6200', border: 'rgba(255,204,51,.40)' },
};

/* ──────────────────────────────────────────────────────────
   FORMULAIRE ÉTUDIANT  (drawer de modification)
────────────────────────────────────────────────────────── */
const EtudiantForm = ({ initial, formRef, FORMATIONS }) => {
  const defaults = {
    nom: '', prenom: '', email: '', tel: '', ville: '', pays: 'Tunisie',
    formations:      [],
    modeFormation:   'Présentiel',
    dateInscription: new Date().toISOString().slice(0, 10),
    statut:          'Actif',
    attestation:     'Non',
    dateAttestation: '',
    notes:           '',
    documents:       [],
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
            {FORMATIONS.map(f => (
              <label key={f.id} className="form-check-inline">
                <input type="checkbox"
                  checked={fd.formations.includes(f.id)}
                  onChange={() => toggleFormation(f.id)} />
                {f.label}
                <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '4px' }}>({f.duree})</span>
              </label>
            ))}
          </div>
        </div>
        <S label="Mode de formation"  name="modeFormation"   options={['Présentiel', 'En ligne', 'Hybride']} />
        <F label="Date d'inscription" name="dateInscription" type="date" />
        <S label="Statut"             name="statut"          options={['Actif', 'Abandonné', 'Certifié']} />
      </div>

      {/* ── Section 3 : Suivi pédagogique ── */}
      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-chart-line"></i> Suivi pédagogique
      </div>
      <div className="pf-grid">
        <S label="Attestation" name="attestation" options={['Non', 'Oui']} />
        {fd.attestation === 'Oui' && (
          <F label="Date de délivrance" name="dateAttestation" type="date" />
        )}
        <T label="Notes / Observations" name="notes" placeholder="Résultats, observations pédagogiques..." />
      </div>

      {/* ── Section 4 : Documents ── */}
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
   COMPOSANT PRINCIPAL
────────────────────────────────────────────────────────── */
const Etudiants = () => {

  // ── Formations chargées depuis l'API ──
  const [FORMATIONS, setFORMATIONS] = useState([]);

  useEffect(() => {
    api.get('formations/')
      .then(res => setFORMATIONS(
        res.data.map(f => ({ id: f.id, label: f.intitule, duree: `${f.duree}h` }))
      ))
      .catch(() => setFORMATIONS([]));
  }, []);

  // ── States principaux ──
  const [etudiants,        setEtudiants]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [apiError,         setApiError]         = useState(null);
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
  const [saving,           setSaving]           = useState(false);

  const [diplomeData, setDiplomeData] = useState({
    formationCertifiee: '',
    dateAttestation:    new Date().toISOString().slice(0, 10),
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [drawerTarget, setDrawerTarget] = useState(null);
  const formRef = useRef(null);

  const PER_PAGE = 8;

  // ── Chargement ──
  const loadEtudiants = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await getEtudiants();
      setEtudiants(data);
    } catch {
      setApiError('Impossible de charger les étudiants. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEtudiants(); }, [loadEtudiants]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Filtres ──
  const getFiltered = () => {
    let f = [...etudiants];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(e =>
        e.nom.toLowerCase().includes(q)    ||
        e.prenom.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)  ||
        (e.tel || '').includes(q)
      );
    }
    if (filterStatut !== 'Tous') f = f.filter(e => e.statut === filterStatut);
    if (filterFormation !== 'Toutes') {
      const fid = parseInt(filterFormation);
      f = f.filter(e => (e.formations || []).includes(fid));
    }
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };

  const filtered     = getFiltered();
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Drawer (modifier) ──
  const openEdit = (id) => {
    const e = etudiants.find(x => x.id === id);
    if (!e) return;
    setDrawerTarget(e);
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setDrawerTarget(null); formRef.current = null; };

  const saveDrawer = async () => {
    const data = formRef.current;
    if (!data) return;
    if (!data.nom?.trim() || !data.prenom?.trim() || !data.email?.trim()) {
      showToast('Veuillez remplir Nom, Prénom et Email.', 'error'); return;
    }
    if (!data.formations?.length) {
      showToast('Veuillez sélectionner au moins une formation.', 'error'); return;
    }
    setSaving(true);
    try {
      const updated = await updateEtudiant(drawerTarget.id, data, data.formations);
      setEtudiants(prev => prev.map(e => e.id === drawerTarget.id ? updated : e));
      if (detailTarget?.id === drawerTarget.id) setDetailTarget(updated);
      showToast('Étudiant modifié avec succès !');
      closeDrawer();
    } catch {
      showToast('Erreur lors de la modification.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Détail ──
  const openDetail = async (id) => {
    try {
      const e = await getEtudiant(id);
      setDetailTarget(e);
      setPageView('detail');
    } catch {
      showToast('Impossible de charger les détails.', 'error');
    }
  };
  const closeDetail = () => { setPageView('list'); setDetailTarget(null); };

  // ── Supprimer ──
  const openDelete = (id) => {
    const e = etudiants.find(x => x.id === id);
    if (!e) return;
    setDeleteTarget(e);
    setShowDeleteModal(true);
  };
  const closeDelete   = () => { setShowDeleteModal(false); setDeleteTarget(null); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEtudiant(deleteTarget.id);
      setEtudiants(prev => prev.filter(e => e.id !== deleteTarget.id));
      if (detailTarget?.id === deleteTarget.id) { setPageView('list'); setDetailTarget(null); }
      closeDelete();
      showToast('Étudiant supprimé.');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
      closeDelete();
    }
  };

  // ── Modale Convertir en diplômé ──
  const openDiplome = () => {
    const formations = detailTarget?.formations || [];
    setDiplomeData({
      formationCertifiee: formations.length === 1 ? formations[0] : '',
      dateAttestation:    new Date().toISOString().slice(0, 10),
    });
    setShowDiplomeModal(true);
  };
  const closeDiplome = () => setShowDiplomeModal(false);

  const confirmDiplome = async () => {
    if (!diplomeData.formationCertifiee) {
      showToast('Veuillez choisir la formation terminée.', 'error'); return;
    }
    if (!diplomeData.dateAttestation) {
      showToast("Veuillez saisir la date de l'attestation.", 'error'); return;
    }
    setSaving(true);
    try {
      const updated = await certifierEtudiant(detailTarget.id);
      // mise à jour locale avec la réponse API + données UI
      const withUI = {
        ...updated,
        attestation:     'Oui',
        dateAttestation: diplomeData.dateAttestation,
        formationCertifiee: parseInt(diplomeData.formationCertifiee),
      };
      setEtudiants(prev => prev.map(e => e.id === detailTarget.id ? withUI : e));
      setDetailTarget(withUI);
      closeDiplome();
      const formLabel = detailTarget.formationsDetail?.find(
        f => f.id === parseInt(diplomeData.formationCertifiee)
      )?.label || '';
      showToast(`🎓 ${detailTarget.prenom} ${detailTarget.nom} — attestation délivrée${formLabel ? ` pour « ${formLabel} »` : ''} !`);
    } catch {
      showToast("Erreur lors de la certification.", 'error');
    } finally {
      setSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // SUB-COMPOSANTS JSX
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
            <EtudiantForm
              key={drawerTarget?.id}
              initial={drawerTarget}
              formRef={formRef}
              FORMATIONS={FORMATIONS}
            />
          </div>
          <div className="drawer-footer">
            <button className="btn btn-cancel" onClick={closeDrawer} disabled={saving}>Annuler</button>
            <button className="btn btn-update" onClick={saveDrawer} disabled={saving}>
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
                : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer</>}
            </button>
          </div>
        </div>
      </>
    );
  };

  const DeleteModal = () => {
    if (!showDeleteModal || !deleteTarget) return null;
    const sc = STATUT_COLORS[deleteTarget.statut] || {};
    return (
      <div className="modal-overlay show" onClick={ev => { if (ev.target === ev.currentTarget) closeDelete(); }}>
        <div className="modal-suppr">
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '28px' }}>
            <div className="suppr-icon-wrap">
              <i className="fa-solid fa-trash" style={{ fontSize: '26px', color: '#ef4444' }}></i>
            </div>
          </div>
          <div style={{ padding: '16px 24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', color: '#1e293b' }}>
              Supprimer l'étudiant
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', textAlign: 'left' }}>
              <div style={{ background: '#336699', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                {deleteTarget.prenom[0]}{deleteTarget.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{deleteTarget.prenom} {deleteTarget.nom}</div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{deleteTarget.email}</div>
              </div>
              <span className="badge" style={{ marginLeft: 'auto', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{deleteTarget.statut}</span>
            </div>
            <div className="suppr-warning">
              <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: 0 }}></i>
              <span>Cette action est <strong>irréversible</strong>. L'étudiant sera définitivement supprimé.</span>
            </div>
          </div>
          <div style={{ padding: '12px 24px 20px', display: 'flex', gap: '10px' }}>
            <button className="btn btn-cancel" style={{ flex: 1 }} onClick={closeDelete}>
              <i className="fa-solid fa-xmark"></i> Annuler
            </button>
            <button className="btn btn-suppr-confirm" style={{ flex: 1 }} onClick={confirmDelete}>
              <i className="fa-solid fa-trash"></i> Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DiplomeModal = () => {
    if (!showDiplomeModal || !detailTarget) return null;
    const formationsEtudiant = detailTarget.formationsDetail || [];
    const aPlusieursForms    = formationsEtudiant.length > 1;

    return (
      <div className="modal-overlay show" onClick={ev => { if (ev.target === ev.currentTarget) closeDiplome(); }}>
        <div className="modal-diplome">

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

            <div className="diplome-student-card">
              <div className="diplome-avatar">{detailTarget.prenom[0]}{detailTarget.nom[0]}</div>
              <div>
                <div style={{ fontWeight: '700', color: '#1E3A5F' }}>{detailTarget.prenom} {detailTarget.nom}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>{detailTarget.email}</div>
              </div>
            </div>

            <div className="diplome-form-group">
              <label>
                Formation terminée *
                {aPlusieursForms && (
                  <span style={{ marginLeft: '6px', fontSize: '11px', color: '#e67e22', fontWeight: '600' }}>
                    ⚠ Plusieurs formations — choisissez celle certifiée
                  </span>
                )}
              </label>

              {!aPlusieursForms ? (
                <div style={{ padding: '10px 14px', background: 'rgba(51,204,255,.08)', border: '1.5px solid rgba(51,204,255,.30)', borderRadius: '9px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-book-open" style={{ color: '#1A7A99', fontSize: '14px' }}></i>
                  <span style={{ fontWeight: '600', color: '#1E3A5F', fontSize: '14px' }}>
                    {formationsEtudiant[0]?.label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94A3B8' }}>
                    {formationsEtudiant[0]?.duree}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {formationsEtudiant.map(f => {
                    const selected = parseInt(diplomeData.formationCertifiee) === f.id;
                    return (
                      <div key={f.id}
                        onClick={() => setDiplomeData(p => ({ ...p, formationCertifiee: f.id }))}
                        style={{ padding: '11px 14px', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', border: selected ? '2px solid #33CCFF' : '1.5px solid #E2E8F0', background: selected ? 'rgba(51,204,255,.10)' : '#FAFAFA', transition: 'all .18s ease' }}
                      >
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: selected ? '5px solid #33CCFF' : '2px solid #CBD5E1', background: '#fff', transition: 'all .18s ease' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: selected ? '700' : '500', color: selected ? '#1E3A5F' : '#475569', fontSize: '13.5px' }}>
                            {f.label}
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{f.duree}</span>
                        {selected && <i className="fa-solid fa-circle-check" style={{ color: '#33CCFF', fontSize: '16px' }}></i>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="diplome-form-group">
              <label>Date de délivrance de l'attestation *</label>
              <input
                type="date"
                value={diplomeData.dateAttestation}
                onChange={ev => setDiplomeData(p => ({ ...p, dateAttestation: ev.target.value }))}
              />
            </div>

            <div style={{ background: 'rgba(255,204,51,.10)', border: '1px solid rgba(255,204,51,.35)', borderRadius: '9px', padding: '10px 14px', fontSize: '12.5px', color: '#8A6200', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
              <i className="fa-solid fa-circle-info" style={{ marginTop: '1px', flexShrink: 0 }}></i>
              <span>Le statut passera à <strong>Certifié</strong> et une attestation sera enregistrée.</span>
            </div>
          </div>

          <div className="diplome-footer">
            <button className="btn btn-cancel" onClick={closeDiplome} disabled={saving}>Annuler</button>
            <button className="btn btn-diplome" onClick={confirmDiplome} disabled={saving}>
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
                : <><i className="fa-solid fa-certificate"></i> Confirmer l'attestation</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
    const formLabels = e.formationsDetail || [];

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
                <span className="badge det-sid-badge" style={{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}` }}>
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
                  <span className="det-sid-label"><i className="fa-regular fa-calendar"></i> Inscription</span>
                  <span className="det-sid-val">{e.dateInscription}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-user-tie"></i> Responsable</span>
                  <span className="det-sid-val">{e.responsable || '—'}</span>
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

              {/* Informations générales */}
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

              {/* Informations académiques */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-graduation-cap"></i> Informations académiques</div>
                <div className="det-fields-grid">
                  <div className="det-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="det-field-label">Formation(s) suivie(s)</span>
                    <div className="formations-list" style={{ marginTop: '6px' }}>
                      {formLabels.length ? formLabels.map(f => (
                        <span key={f.id} className="formation-pill">
                          <i className="fa-solid fa-book-open"></i>{f.label}
                        </span>
                      )) : <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>}
                    </div>
                  </div>
                  <div className="det-field"><span className="det-field-label">Mode de formation</span><span className="det-field-val">{e.modeFormation || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Date d'inscription</span><span className="det-field-val">{e.dateInscription || '—'}</span></div>
                  <div className="det-field">
                    <span className="det-field-label">Statut</span>
                    <span className="det-field-val">
                      <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{e.statut}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Suivi pédagogique */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-chart-line"></i> Suivi pédagogique</div>
                <div className="det-fields-grid">
                  <div className="det-field">
                    <span className="det-field-label">Attestation</span>
                    <span className="det-field-val">
                      <span className="badge" style={{
                        background: e.attestation === 'Oui' ? 'rgba(26,107,74,.12)' : 'rgba(148,163,184,.12)',
                        color:      e.attestation === 'Oui' ? '#1A6B4A' : '#94A3B8',
                        border:     `1px solid ${e.attestation === 'Oui' ? 'rgba(26,107,74,.28)' : '#E2E8F0'}`,
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

              {/* Informations administratives */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-folder-open"></i> Informations administratives</div>
                <div className="det-fields-grid">
                  <div className="det-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="det-field-label">Documents fournis</span>
                    <div className="docs-list" style={{ marginTop: '6px' }}>
                      {e.documents?.length ? e.documents.map(d => (
                        <span key={d} className="doc-pill"><i className="fa-solid fa-check"></i>{d}</span>
                      )) : <span style={{ color: '#94A3B8', fontSize: '13px' }}>Aucun document</span>}
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
            <option>Actif</option>
            <option>Abandonné</option>
            <option>Certifié</option>
          </select>
          <select className="filter-sel" value={filterFormation}
            onChange={ev => { setFilterFormation(ev.target.value); setCurrentPage(1); }}>
            <option value="Toutes">Toutes les formations</option>
            {FORMATIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
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

        {loading ? (
          <div className="empty-state">
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#336699' }}></i>
            <p>Chargement des étudiants…</p>
          </div>
        ) : apiError ? (
          <div className="empty-state">
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>
            <p>{apiError}</p>
            <button className="btn btn-add" style={{ marginTop: '12px' }} onClick={loadEtudiants}>
              <i className="fa-solid fa-rotate-right"></i> Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '32px' }}>#</th>
                    <th>Nom & Prénom</th>
                    <th>Contact</th>
                    <th>Formations inscrites</th>
                    <th>Statut</th>
                    <th>Inscription</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSlice.map((e, i) => {
                    const sc     = STATUT_COLORS[e.statut] || {};
                    const labels = e.formationsDetail || [];
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
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {labels.slice(0, 2).map(f => <span key={f.id} className="form-tag">{f.label}</span>)}
                            {labels.length > 2 && (
                              <span className="form-tag" style={{ background: 'rgba(148,163,184,.12)', color: '#64748B' }}>+{labels.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{e.statut}</span>
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

            {totalPages > 1 && (
              <div className="pagination">
                <button className="pg-btn" disabled={currentPage === 1}           onClick={() => setCurrentPage(1)}><i className="fa-solid fa-angles-left"></i></button>
                <button className="pg-btn" disabled={currentPage === 1}           onClick={() => setCurrentPage(p => p - 1)}><i className="fa-solid fa-angle-left"></i></button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                  <button key={page} className={`pg-num ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                <button className="pg-btn" disabled={currentPage === totalPages}  onClick={() => setCurrentPage(p => p + 1)}><i className="fa-solid fa-angle-right"></i></button>
                <button className="pg-btn" disabled={currentPage === totalPages}  onClick={() => setCurrentPage(totalPages)}><i className="fa-solid fa-angles-right"></i></button>
              </div>
            )}
          </>
        )}
      </div>

      <DrawerPanel />
      <DeleteModal />
      <Toast />
    </Layout>
  );
};

export default Etudiants;