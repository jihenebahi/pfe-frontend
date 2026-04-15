// src/pages/crm/Diplomes.js
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import '../../styles/crm/etudiants.css';
import { getDiplomes, deleteDiplome, envoyerAttestation, convertirVersEtudiant, getDiplome } from '../../services/crm/diplomeService';
import { createDiplomeRelance } from '../../services/crm/diplomeRelancesService';
import DiplomeRelances from '../../components/crm/DiplomeRelances';
import api from '../../services/api';
import '../../styles/crm/diplomes.css';

/* ──────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────── */
const calcPct = (seancesTotal, absences) => {
  const total = parseInt(seancesTotal) || 0;
  const abs   = parseInt(absences)     || 0;
  if (total <= 0) return 0;
  return Math.round(((total - abs) / total) * 100);
};

/* ──────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
────────────────────────────────────────────────────────── */
const Diplomes = () => {
  // ── State ────────────────────────────────────────────────────────
  const [diplomes,        setDiplomes]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [apiError,        setApiError]        = useState(null);
  const [search,          setSearch]          = useState('');
  const [sortAlpha,       setSortAlpha]       = useState(false);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [pageView,        setPageView]        = useState('list');
  const [detailTarget,    setDetailTarget]    = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast,           setToast]           = useState({ show: false, message: '', type: 'success' });

  // ── Sélection groupée ──
  const [selectedIds,    setSelectedIds]    = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting,   setBulkDeleting]   = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState(null);

  // ── Conversion vers étudiant ──
  const [formations,          setFormations]          = useState([]);
  const [conversionLoading,   setConversionLoading]   = useState(false);
  const [conversionForm,      setConversionForm]      = useState({ formations: [], notes: '' });
  const [convertOpen,         setConvertOpen]         = useState(false);
  const [formationSearch,     setFormationSearch]     = useState('');
  const [documents,           setDocuments]           = useState({
    cin: false,
    cv: false,
    contrat: false,
    recu: false,
    rne: false,
    autres: false,
  });
  const [docOtherValue,       setDocOtherValue]       = useState('');

  // ── États relance inline ──
  const [relanceOpen, setRelanceOpen] = useState(false);
  const [relanceDate, setRelanceDate] = useState('');
  const [relanceCommentaire, setRelanceCommentaire] = useState('');
  const [relanceError, setRelanceError] = useState('');
  const [relanceSaving, setRelanceSaving] = useState(false);

  const PER_PAGE = 8;

  // ── Chargement depuis l'API ───────────────────────────────────────
  const loadDiplomes = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await getDiplomes();
      setDiplomes(data);
    } catch {
      setApiError('Impossible de charger les certifiés. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les formations
  useEffect(() => {
    api.get('formations/')
      .then(res => setFormations(
        res.data.map(f => ({ id: f.id, label: f.intitule, duree: `${f.duree}h` }))
      ))
      .catch(() => setFormations([]));
  }, []);

  useEffect(() => { loadDiplomes(); }, [loadDiplomes]);

  // ── Toast ─────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Filtres ───────────────────────────────────────────────────────
  const getFiltered = () => {
    let f = [...diplomes];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(d =>
        d.nom.toLowerCase().includes(q) ||
        d.prenom.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.tel || '').includes(q)
      );
    }
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };

  const filtered     = getFiltered();
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Sélection groupée ──
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (selectedIds.length === currentSlice.length && currentSlice.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentSlice.map(d => d.id));
    }
  };
  const allChecked  = currentSlice.length > 0 && selectedIds.length === currentSlice.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < currentSlice.length;

  // ── Suppression groupée ──
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deleteDiplome(id)));
      const nb = selectedIds.length;
      setDiplomes(prev => prev.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
      setShowBulkDelete(false);
      showToast(`${nb} certifié${nb > 1 ? 's' : ''} supprimé${nb > 1 ? 's' : ''}.`);
      if (detailTarget && selectedIds.includes(detailTarget.id)) {
        setPageView('list');
        setDetailTarget(null);
      }
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Détail ────────────────────────────────────────────────────────
  const openDetail = async (id) => {
    try {
      const d = await getDiplome(id);
      setDetailTarget(d);
      setConvertOpen(false);
      setRelanceOpen(false);
      setPageView('detail');
    } catch {
      showToast('Impossible de charger les détails.', 'error');
    }
  };
  const closeDetail = () => { setPageView('list'); setDetailTarget(null); setConvertOpen(false); setRelanceOpen(false); };

  // ── Supprimer (individuel) ────────────────────────────────────────
  const openDelete = (id) => {
    const d = diplomes.find(x => x.id === id);
    if (!d) return;
    setDeleteTarget(d);
    setShowDeleteModal(true);
  };
  const closeDelete = () => { setShowDeleteModal(false); setDeleteTarget(null); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDiplome(deleteTarget.id);
      setDiplomes(prev => prev.filter(d => d.id !== deleteTarget.id));
      if (detailTarget?.id === deleteTarget.id) { setPageView('list'); setDetailTarget(null); }
      closeDelete();
      showToast('Certifié supprimé.');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
      closeDelete();
    }
  };

  // ── Filtrage des formations ──
  const getFilteredFormations = () => {
    if (!formationSearch) return formations;
    const searchLower = formationSearch.toLowerCase();
    return formations.filter(f => f.label.toLowerCase().includes(searchLower));
  };

  // ── Gestion des documents ──
  const toggleDocument = (docKey) => {
    setDocuments(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  // ══════════════════════════════════════════════════════════════════
  //  ENVOYER ATTESTATION PAR EMAIL
  // ══════════════════════════════════════════════════════════════════
  const handleEnvoyerAttestation = async (id) => {
    setSendingEmailId(id);
    try {
      const result = await envoyerAttestation(id);
      showToast(result.message, 'success');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'envoi de l\'attestation.';
      showToast(errorMsg, 'error');
    } finally {
      setSendingEmailId(null);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  //  CONVERSION VERS ÉTUDIANT
  // ══════════════════════════════════════════════════════════════════
  const toggleConvert = () => {
    setConvertOpen(v => !v);
    setConversionForm({ formations: [], notes: '' });
    setFormationSearch('');
    setDocuments({
      cin: false,
      cv: false,
      contrat: false,
      recu: false,
      rne: false,
      autres: false,
    });
    setDocOtherValue('');
  };

  const toggleFormationSelection = (formationId) => {
    setConversionForm(prev => ({
      ...prev,
      formations: prev.formations.includes(formationId)
        ? prev.formations.filter(id => id !== formationId)
        : [...prev.formations, formationId]
    }));
  };

  const handleConvertirVersEtudiant = async () => {
    if (!detailTarget) return;
    if (conversionForm.formations.length === 0) {
      showToast('Veuillez sélectionner au moins une formation.', 'error');
      return;
    }

    setConversionLoading(true);
    try {
      const documentsList = [];
      if (documents.cin) documentsList.push('CIN');
      if (documents.cv) documentsList.push('CV');
      if (documents.contrat) documentsList.push('Contrat');
      if (documents.recu) documentsList.push('Reçu');
      if (documents.rne) documentsList.push('RNE');
      if (documents.autres && docOtherValue) documentsList.push(docOtherValue);
      else if (documents.autres) documentsList.push('Autres');

      const result = await convertirVersEtudiant(
        detailTarget,
        conversionForm.formations,
        conversionForm.notes,
        documentsList
      );

      if (result.existant) {
        showToast(result.message, 'error');
      } else {
        showToast(`${detailTarget.prenom} ${detailTarget.nom} a été ajouté en tant qu'étudiant.`, 'success');
        setConvertOpen(false);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la conversion.';
      showToast(errorMsg, 'error');
    } finally {
      setConversionLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  //  RELANCE INLINE
  // ══════════════════════════════════════════════════════════════════
  const toggleRelance = () => {
    setRelanceOpen(v => !v);
    setRelanceDate('');
    setRelanceCommentaire('');
    setRelanceError('');
  };

  const handleCreateRelanceInline = async () => {
    if (!relanceDate) {
      setRelanceError('La date de relance est obligatoire.');
      return;
    }
    setRelanceError('');
    try {
      setRelanceSaving(true);
      await createDiplomeRelance(detailTarget.id, {
        dateRelance: relanceDate,
        commentaire: relanceCommentaire,
        formationId: detailTarget.formationCertifiee || null,
      });
      showToast('✅ Relance programmée avec succès !');
      setRelanceOpen(false);
      const refreshed = await getDiplome(detailTarget.id);
      setDetailTarget(refreshed);
      setDiplomes((prev) => prev.map((d) => (d.id === detailTarget.id ? refreshed : d)));
    } catch (err) {
      let errorMsg = 'Erreur lors de la création de la relance.';
      if (err.response?.data) {
        if (typeof err.response.data === 'object')
          errorMsg = Object.values(err.response.data).flat().join(', ');
        else errorMsg = err.response.data;
      } else if (err.message) {
        errorMsg = err.message;
      }
      showToast(errorMsg, 'error');
    } finally {
      setRelanceSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  //  IMPRESSION ATTESTATION
  // ══════════════════════════════════════════════════════════════════
  const printAttestation = (d) => {
    const win = window.open('', '_blank', 'width=794,height=1123');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Attestation — ${d.prenom} ${d.nom}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body {
            font-family: 'Georgia', serif;
            background: #fff;
            color: #1e293b;
            padding: 60px 80px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #1A6B4A;
            padding-bottom: 20px;
            margin-bottom: 40px;
          }
          .org { font-size: 13px; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
          .title { font-size: 32px; font-weight: bold; color: #1A6B4A; margin-bottom: 6px; }
          .subtitle { font-size: 14px; color: #475569; }
          .seal {
            width: 80px; height: 80px; border-radius: 50%;
            background: linear-gradient(135deg,#1A6B4A,#33CCFF);
            display: flex; align-items: center; justify-content: center;
            margin: 20px auto;
            font-size: 32px; color: #fff;
          }
          .body-text { font-size: 15px; line-height: 2; text-align: center; margin: 30px 0; color: #334155; }
          .name { font-size: 28px; color: #1E3A5F; font-weight: bold; margin: 10px 0; border-bottom: 2px dotted #94a3b8; display: inline-block; padding-bottom: 4px; }
          .formation-box {
            background: #f0fdf4; border: 1px solid #bbf7d0;
            border-radius: 12px; padding: 20px 30px; margin: 30px 0;
            text-align: center;
          }
          .formation-label { font-size: 11px; color: #6b7280; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
          .formation-name { font-size: 20px; font-weight: bold; color: #1A6B4A; }
          .formation-duree { font-size: 13px; color: #475569; margin-top: 4px; }
          .footer {
            margin-top: 60px; display: flex;
            justify-content: space-between; align-items: flex-end;
          }
          .date-block { font-size: 13px; color: #64748b; }
          .sign-block { text-align: center; }
          .sign-line { border-top: 1px solid #1e293b; width: 200px; margin: 0 auto 6px; padding-top: 6px; }
          .sign-title { font-size: 12px; color: #64748b; }
          .watermark {
            position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
            font-size: 11px; color: #cbd5e1; text-align: center; letter-spacing: 1px;
          }
          @media print {
            body { padding: 40px 60px; }
            .watermark { position: fixed; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="org">Centre de Formation Professionnelle</div>
          <div class="title">Attestation de Réussite</div>
          <div class="subtitle">Ce document certifie l'achèvement d'une formation</div>
        </div>
        <div class="seal">🎓</div>
        <div class="body-text">
          Nous soussignés certifions que
          <br/>
          <span class="name">${d.prenom} ${d.nom}</span>
          <br/>
          a suivi avec succès et obtenu son attestation pour la formation :
        </div>
        <div class="formation-box">
          <div class="formation-label">Formation certifiée</div>
          <div class="formation-name">${d.formationIntitule || '—'}</div>
          ${d.formationDuree ? `<div class="formation-duree">Durée : ${d.formationDuree}</div>` : ''}
        </div>
        ${d.seancesTotal > 0 ? `
          <div style="text-align:center; font-size:13px; color:#475569; margin-bottom:20px;">
            Taux de présence : <strong>${calcPct(d.seancesTotal, d.absences)}%</strong>
            (${d.seancesTotal - d.absences} séances sur ${d.seancesTotal})
          </div>
        ` : ''}
        <div class="footer">
          <div class="date-block">
            Délivrée le : <strong>${d.dateAttestation || new Date().toLocaleDateString('fr-FR')}</strong>
          </div>
          <div class="sign-block">
            <div class="sign-line">Signature & Cachet</div>
            <div class="sign-title">Le Directeur de Formation</div>
          </div>
        </div>
        <div class="watermark">Document officiel — Confidentiel</div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  // ══════════════════════════════════════════════════════════════════
  //  TÉLÉCHARGEMENT ATTESTATION (PDF)
  // ══════════════════════════════════════════════════════════════════
  const downloadAttestation = async (d) => {
    if (!window.html2pdf) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const pct = calcPct(d.seancesTotal, d.absences);
    const dateStr = d.dateAttestation || new Date().toLocaleDateString('fr-FR');

    const container = document.createElement('div');
    container.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'width:794px',
      'background:#fff', 'z-index:-1', 'opacity:0', 'pointer-events:none',
    ].join(';');

    container.innerHTML = `
      <div style="font-family:Georgia,serif;color:#1e293b;padding:60px 80px;width:794px;background:#fff;">
        <div style="text-align:center;border-bottom:3px solid #1A6B4A;padding-bottom:20px;margin-bottom:40px;">
          <div style="font-size:13px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
            Centre de Formation Professionnelle
          </div>
          <div style="font-size:32px;font-weight:bold;color:#1A6B4A;margin-bottom:6px;">Attestation de Réussite</div>
          <div style="font-size:14px;color:#475569;">Ce document certifie l'achèvement d'une formation</div>
        </div>
        <div style="width:80px;height:80px;border-radius:50%;background:#1A6B4A;
          margin:20px auto;font-size:36px;text-align:center;line-height:80px;">🎓</div>
        <div style="font-size:15px;line-height:2;text-align:center;margin:30px 0;color:#334155;">
          Nous soussignés certifions que<br/>
          <span style="font-size:26px;color:#1E3A5F;font-weight:bold;
            border-bottom:2px dotted #94a3b8;display:inline-block;padding-bottom:4px;">
            ${d.prenom} ${d.nom}
          </span><br/>
          a suivi avec succès et obtenu son attestation pour la formation :
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;
          padding:20px 30px;margin:30px 0;text-align:center;">
          <div style="font-size:11px;color:#6b7280;letter-spacing:2px;
            text-transform:uppercase;margin-bottom:8px;">Formation certifiée</div>
          <div style="font-size:20px;font-weight:bold;color:#1A6B4A;">
            ${d.formationIntitule || '—'}
          </div>
          ${d.formationDuree
            ? `<div style="font-size:13px;color:#475569;margin-top:4px;">Durée : ${d.formationDuree}</div>`
            : ''}
        </div>
        ${d.seancesTotal > 0 ? `
          <div style="text-align:center;font-size:13px;color:#475569;margin-bottom:20px;">
            Taux de présence : <strong>${pct}%</strong>
            &nbsp;(${d.seancesTotal - d.absences} séances sur ${d.seancesTotal})
          </div>` : ''}
        <div style="margin-top:60px;display:table;width:100%;">
          <div style="display:table-cell;font-size:13px;color:#64748b;vertical-align:bottom;">
            Délivrée le : <strong>${dateStr}</strong>
          </div>
          <div style="display:table-cell;text-align:center;vertical-align:bottom;">
            <div style="border-top:1px solid #1e293b;width:200px;margin:0 auto 6px;
              padding-top:6px;font-size:13px;">Signature &amp; Cachet</div>
            <div style="font-size:12px;color:#64748b;">Le Directeur de Formation</div>
          </div>
        </div>
        <div style="margin-top:40px;text-align:center;font-size:11px;
          color:#cbd5e1;letter-spacing:1px;">Document officiel — Confidentiel</div>
      </div>
    `;

    document.body.appendChild(container);
    await new Promise(r => setTimeout(r, 100));

    const opt = {
      margin:      0,
      filename:    `attestation_${d.prenom}_${d.nom}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    try {
      await window.html2pdf().set(opt).from(container.firstElementChild).save();
    } finally {
      document.body.removeChild(container);
    }
  };

  // ══════════════════════════════════════════════════════════
  //  SUB-COMPOSANTS
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
              Supprimer le certifié
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', textAlign:'left' }}>
              <div style={{ background:'linear-gradient(135deg,#FFCC33,#e6b800)', borderRadius:'8px', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4000', fontWeight:'700', fontSize:'13px', flexShrink:0 }}>
                {deleteTarget.prenom[0]}{deleteTarget.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight:'600', color:'#1e293b' }}>{deleteTarget.prenom} {deleteTarget.nom}</div>
                <div style={{ fontSize:'11.5px', color:'#94a3b8' }}>{deleteTarget.formationIntitule || '—'}</div>
              </div>
              <span className="badge" style={{ marginLeft:'auto', background:'rgba(255,204,51,.18)', color:'#8A6200', border:'1px solid rgba(255,204,51,.40)' }}>
                🎓 Certifié
              </span>
            </div>
            <div className="suppr-warning">
              <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink:0 }}></i>
              <span>Cette action est <strong>irréversible</strong>. Le certifié sera définitivement supprimé.</span>
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

  const Toast = () => toast.show ? (
    <div className={`toast ${toast.type}`}>
      <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
      {toast.message}
    </div>
  ) : null;

  // ══════════════════════════════════════════════════════════
  //  PAGE DÉTAIL
  // ══════════════════════════════════════════════════════════
  if (pageView === 'detail' && detailTarget) {
    const d = detailTarget;

    return (
      <Layout>
        <div className="det-page">
          <div className="det-topbar">
            <button className="back-btn" onClick={closeDetail}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Certifiés</span>
            </button>
            <i className="fa-solid fa-chevron-right det-bc-sep"></i>
            <span className="det-bc-name">{d.prenom} {d.nom}</span>
          </div>

          <div className="det-body">
            {/* SIDEBAR GAUCHE */}
            <div className="det-sidebar">
              <div className="det-sid-hero">
                <div className="det-sid-avatar" style={{ background: 'linear-gradient(135deg, #1E3A5F, #336699)' }}>
                  {d.prenom[0]}{d.nom[0]}
                </div>
                <div className="det-sid-name">{d.prenom} {d.nom}</div>
                <span className="badge det-sid-badge" style={{ background: 'rgba(255,204,51,.18)', color: '#8A6200', border: '1px solid rgba(255,204,51,.40)' }}>
                  🎓 Certifié
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {d.formationIntitule && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'#EBF4FF', color:'#336699', border:'1px solid rgba(51,102,153,.22)', borderRadius:'20px', padding:'3px 10px', fontSize:'11.5px', fontWeight:'500' }}>
                    <i className="fa-solid fa-graduation-cap" style={{ fontSize:'10px' }}></i>
                    Formation : {d.formationIntitule}
                  </span>
                )}
                {d.formationDuree && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'#F0F9FF', color:'#0369a1', border:'1px solid rgba(3,105,161,.18)', borderRadius:'20px', padding:'3px 10px', fontSize:'11.5px', fontWeight:'500' }}>
                    <i className="fa-solid fa-layer-group" style={{ fontSize:'10px' }}></i>
                    Durée : {d.formationDuree}
                  </span>
                )}
              </div>

              <div className="det-sid-divider" />

              <div className="det-sid-fields">
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-envelope"></i> E-mail</span>
                  <span className="det-sid-val">{d.email || '—'}</span>
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
                  <span className="det-sid-label"><i className="fa-solid fa-calendar-check"></i> Date attestation</span>
                  <span className="det-sid-val">{d.dateAttestation || '—'}</span>
                </div>
              </div>

              {/* BOUTONS D'ACTION SIDEBAR */}
              <div className="det-sid-actions">
                <button 
                  className="det-action-btn det-action-relance" 
                  onClick={toggleRelance}
                >
                  <i className="fa-solid fa-bell"></i>
                  {relanceOpen ? 'Fermer la relance' : 'Ajouter une relance'}
                </button>
                <button 
                  className="det-action-btn det-action-convert"
                  onClick={toggleConvert}
                >
                  <i className="fa-solid fa-user-plus"></i>
                  {convertOpen ? 'Fermer la conversion' : 'Convertir en Étudiant'}
                </button>
                <button 
                  className="det-action-btn det-action-edit" 
                  onClick={() => downloadAttestation(d)}
                >
                  <i className="fa-solid fa-download"></i> Télécharger
                </button>
                <button 
                  className="det-action-btn det-action-edit" 
                  onClick={() => handleEnvoyerAttestation(d.id)}
                  disabled={sendingEmailId === d.id}
                >
                  {sendingEmailId === d.id 
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Envoi en cours...</>
                    : <><i className="fa-regular fa-envelope"></i> Envoyer attestation</>
                  }
                </button>
              </div>
            </div>

            {/* CONTENU PRINCIPAL DROITE */}
            <div className="det-main">
              {/* FORMULAIRE RELANCE INLINE */}
              {relanceOpen && (
                <div className="relance-box det-convert-box">
                  <div className="relance-box-title">
                    <i className="fa-solid fa-bell"></i> Programmer une relance
                    <button className="relance-box-close" onClick={toggleRelance}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  {relanceError && (
                    <div className="relance-error-banner">
                      <i className="fa-solid fa-triangle-exclamation"></i> {relanceError}
                    </div>
                  )}
                  <div className="relance-field">
                    <label className="relance-label">
                      <i className="fa-regular fa-calendar"></i> Date de relance
                      <span className="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      className="relance-input"
                      value={relanceDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => { setRelanceDate(e.target.value); setRelanceError(''); }}
                    />
                  </div>
                  <div className="relance-field">
                    <label className="relance-label">
                      <i className="fa-regular fa-comment"></i> Commentaire
                      <span className="optional-tag">optionnel</span>
                    </label>
                    <textarea
                      className="relance-textarea"
                      placeholder="Ex : Rappeler pour confirmer son intérêt…"
                      rows={3}
                      value={relanceCommentaire}
                      onChange={(e) => setRelanceCommentaire(e.target.value)}
                    />
                  </div>
                  <div className="relance-box-footer">
                    <button className="btn-relance-cancel" onClick={toggleRelance} disabled={relanceSaving}>
                      Annuler
                    </button>
                    <button className="btn-relance-save" onClick={handleCreateRelanceInline} disabled={relanceSaving}>
                      {relanceSaving ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
                      ) : (
                        <><i className="fa-solid fa-check"></i> Enregistrer</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* CONVERSION BOX INLINE */}
              {convertOpen && (
                <div className="convert-box det-convert-box">
                  <div className="convert-title">
                    <i className="fa-solid fa-graduation-cap"></i> Conversion en Étudiant
                    <button className="det-convert-close" onClick={toggleConvert}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  
                  <div className="conv-section-label">
                    <i className="fa-solid fa-book-open"></i> FORMATION(s) SUIVIE(s)
                    <span style={{ color: '#e53e3e', marginLeft: '4px' }}>*</span>
                  </div>
                  
                  <div className="conv-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      placeholder="Rechercher une formation..."
                      value={formationSearch}
                      onChange={(e) => setFormationSearch(e.target.value)}
                      className="conv-search-input"
                    />
                  </div>
                  
                  <div className="cfp-wrap">
                    <div className="cfp-list">
                      {getFilteredFormations().map(f => {
                        const checked = conversionForm.formations.includes(f.id);
                        return (
                          <div 
                            key={f.id} 
                            className={`cfp-item${checked ? ' cfp-item--checked' : ''}`} 
                            onClick={() => toggleFormationSelection(f.id)}
                          >
                            <div className={`cfp-checkbox${checked ? ' cfp-checkbox--checked' : ''}`}>
                              {checked && <i className="fa-solid fa-check cfp-check-icon"></i>}
                            </div>
                            <span className="cfp-label">{f.label}</span>
                            <span className="dur-tag">{f.duree}</span>
                          </div>
                        );
                      })}
                      {getFilteredFormations().length === 0 && (
                        <div className="conv-no-results">
                          <i className="fa-solid fa-folder-open"></i>
                          <span>Aucune formation trouvée</span>
                        </div>
                      )}
                    </div>
                    {conversionForm.formations.length > 0 && (
                      <div className="cfp-counter">
                        <i className="fa-solid fa-circle-check"></i> {conversionForm.formations.length} formation(s) sélectionnée(s)
                      </div>
                    )}
                  </div>
                  
                  <div className="conv-section-label" style={{ marginTop: '20px' }}>
                    <i className="fa-solid fa-folder"></i> Documents fournis
                  </div>
                  
                  <div className="documents-grid">
                    <label className={`doc-item ${documents.cin ? 'doc-item--checked' : ''}`}>
                      <input type="checkbox" checked={documents.cin} onChange={() => toggleDocument('cin')} />
                      <span className="doc-checkbox">{documents.cin && <i className="fa-solid fa-check"></i>}</span>
                      <span className="doc-label">CIN</span>
                    </label>
                    <label className={`doc-item ${documents.cv ? 'doc-item--checked' : ''}`}>
                      <input type="checkbox" checked={documents.cv} onChange={() => toggleDocument('cv')} />
                      <span className="doc-checkbox">{documents.cv && <i className="fa-solid fa-check"></i>}</span>
                      <span className="doc-label">CV</span>
                    </label>
                    <label className={`doc-item ${documents.contrat ? 'doc-item--checked' : ''}`}>
                      <input type="checkbox" checked={documents.contrat} onChange={() => toggleDocument('contrat')} />
                      <span className="doc-checkbox">{documents.contrat && <i className="fa-solid fa-check"></i>}</span>
                      <span className="doc-label">Contrat</span>
                    </label>
                    <label className={`doc-item ${documents.recu ? 'doc-item--checked' : ''}`}>
                      <input type="checkbox" checked={documents.recu} onChange={() => toggleDocument('recu')} />
                      <span className="doc-checkbox">{documents.recu && <i className="fa-solid fa-check"></i>}</span>
                      <span className="doc-label">Reçu</span>
                    </label>
                    <label className={`doc-item ${documents.rne ? 'doc-item--checked' : ''}`}>
                      <input type="checkbox" checked={documents.rne} onChange={() => toggleDocument('rne')} />
                      <span className="doc-checkbox">{documents.rne && <i className="fa-solid fa-check"></i>}</span>
                      <span className="doc-label">RNE</span>
                    </label>
                    <label className={`doc-item ${documents.autres ? 'doc-item--checked' : ''}`}>
                      <input type="checkbox" checked={documents.autres} onChange={() => toggleDocument('autres')} />
                      <span className="doc-checkbox">{documents.autres && <i className="fa-solid fa-check"></i>}</span>
                      <span className="doc-label">Autres</span>
                    </label>
                  </div>
                  
                  {documents.autres && (
                    <div className="doc-other-input">
                      <input
                        type="text"
                        placeholder="Précisez les autres documents..."
                        value={docOtherValue}
                        onChange={(e) => setDocOtherValue(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  )}
                  
                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label">Notes / Observations</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="Observations, remarques sur l'étudiant..." 
                      value={conversionForm.notes} 
                      onChange={e => setConversionForm(prev => ({ ...prev, notes: e.target.value }))} 
                      disabled={conversionLoading} 
                    />
                  </div>
                  
                  <div className="det-convert-footer">
                    <button className="btn btn-cancel" onClick={toggleConvert}>
                      Annuler
                    </button>
                    <button 
                      className="btn-confirm" 
                      style={{ flex: 1 }} 
                      onClick={handleConvertirVersEtudiant} 
                      disabled={conversionLoading || conversionForm.formations.length === 0}
                    >
                      {conversionLoading ? 
                        <><i className="fa-solid fa-spinner fa-spin"></i> Conversion…</> : 
                        <><i className="fa-solid fa-check"></i> Confirmer la conversion</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* CARTE NOTES */}
              <div className="det-section-card" style={{ padding: '18px 22px' }}>
                <div className="det-section-header" style={{ marginBottom: '14px' }}>
                  <i className="fa-solid fa-note-sticky"></i> Notes
                </div>
                {d.notes ? (
                  <div style={{
                    background: 'rgba(255,204,51,.10)', border: '1.5px solid rgba(255,204,51,.30)',
                    borderRadius: '10px', padding: '14px 16px',
                    fontSize: '13.5px', color: '#475569', lineHeight: '1.7',
                  }}>
                    {d.notes}
                  </div>
                ) : (
                  <p style={{ fontSize: '13.5px', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>Aucune note.</p>
                )}
              </div>

              {/* ACTIVITÉS / TIMELINE - DÉPLACÉ AVANT L'HISTORIQUE DES RELANCES */}
              <div className="det-section-card" style={{ padding: '18px 22px' }}>
                <div className="det-section-header" style={{ marginBottom: '14px' }}>
                  <i className="fa-solid fa-list-check"></i> Activités
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#F8FAFC', border: '1px solid #E8EDF3', borderRadius: '10px', padding: '12px 16px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-calendar-check" style={{ fontSize: '14px', color: '#336699' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E3A5F' }}>Attestation délivrée</div>
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>{d.dateAttestation || '—'}</div>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#CBD5E1' }}></i>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#F8FAFC', border: '1px solid #E8EDF3', borderRadius: '10px', padding: '12px 16px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-circle-check" style={{ fontSize: '14px', color: '#1A6B4A' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E3A5F' }}>Fin de la formation</div>
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>{d.dateAttestation || '—'}</div>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#CBD5E1' }}></i>
                  </div>
                </div>
              </div>

              {/* HISTORIQUE DES RELANCES - DÉPLACÉ APRÈS LES ACTIVITÉS */}
              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-bell"></i> Historique des relances
                </div>
                <DiplomeRelances 
                  diplomeId={d.id} 
                  diplomeNom={`${d.prenom} ${d.nom}`}
                  formationId={d.formationCertifiee}
                />
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
  //  PAGE LISTE
  // ══════════════════════════════════════════════════════════
  return (
    <Layout>
      <div className="prsp-header">
        <div className="prsp-title"><i className="fa-solid fa-award"></i> Gestion des Certifiés</div>
        <div className="prsp-sub">Consultez les certifiés et leurs attestations</div>
      </div>

      <div className="toolbar">
        <div className="tb-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              placeholder="Rechercher un certifié..."
              value={search}
              onChange={ev => { setSearch(ev.target.value); setCurrentPage(1); }}
            />
          </div>
          <button
            className={`btn btn-sort ${sortAlpha ? 'active' : ''}`}
            onClick={() => setSortAlpha(v => !v)}
          >
            <i className="fa-solid fa-arrow-down-a-z"></i> A → Z
          </button>
        </div>
      </div>

      {/* Barre actions groupées */}
      {selectedIds.length > 0 && (
        <div className="bulk-action-bar bulk-bar-etud">
          <div className="bulk-action-info">
            <div className="bulk-count-badge">
              <i className="fa-solid fa-check"></i>
              <span>{selectedIds.length}</span>
            </div>
            <span className="bulk-label">
              certifié{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="bulk-action-btns">
            <button className="bulk-btn bulk-btn-suppr" onClick={() => setShowBulkDelete(true)}>
              <i className="fa-solid fa-trash"></i> Supprimer ({selectedIds.length})
            </button>
            <button className="bulk-btn-close" title="Annuler la sélection" onClick={() => setSelectedIds([])}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="empty-state" style={{ paddingTop: '60px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#1A6B4A' }}></i>
          <p style={{ marginTop: '12px', color: '#64748b' }}>Chargement des certifiés…</p>
        </div>
      )}

      {apiError && !loading && (
        <div className="empty-state">
          <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>
          <p>{apiError}</p>
          <button className="btn btn-add" onClick={loadDiplomes} style={{ marginTop: '12px' }}>
            <i className="fa-solid fa-rotate-right"></i> Réessayer
          </button>
        </div>
      )}

      {!loading && !apiError && (
        <div className="table-card">
          <div className="table-top">
            <strong>{filtered.length}</strong> certifié{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '44px', textAlign: 'center', paddingLeft: '14px' }}>
                    <label className="cb-wrap">
                      <input
                        type="checkbox"
                        className="cb-input"
                        checked={allChecked}
                        ref={el => { if (el) el.indeterminate = someChecked; }}
                        onChange={toggleSelectAll}
                        disabled={currentSlice.length === 0}
                      />
                      <span className="cb-box"></span>
                    </label>
                  </th>
                  <th style={{ width: '32px' }}>#</th>
                  <th>Nom & Prénom</th>
                  <th>Contact</th>
                  <th>Formation certifiée</th>
                  <th>Date attestation</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSlice.map((d, i) => {
                  const sel = selectedIds.includes(d.id);
                  return (
                    <tr key={d.id} className={sel ? 'row-selected' : ''}>
                      <td style={{ textAlign: 'center', paddingLeft: '14px' }}>
                        <label className="cb-wrap">
                          <input
                            type="checkbox"
                            className="cb-input"
                            checked={sel}
                            onChange={() => toggleSelect(d.id)}
                          />
                          <span className="cb-box"></span>
                        </label>
                      </td>
                      <td className="td-num">{(currentPage - 1) * PER_PAGE + i + 1}</td>
                      <td>
                        <div className="td-name">{d.nom} {d.prenom}</div>
                      </td>
                      <td>
                        <div className="td-sub">{d.email}</div>
                        <div className="td-sub">{d.tel}</div>
                      </td>
                      <td>
                        <span className="form-tag" style={{ background: 'rgba(255,204,51,.15)', color: '#8A6200', border: '1px solid rgba(255,204,51,.35)' }}>
                          <i className="fa-solid fa-certificate" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                          {d.formationIntitule || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="td-sub" style={{ fontWeight: '600', color: '#8A6200' }}>
                          {d.dateAttestation}
                        </div>
                      </td>
                      <td className="td-actions">
                        <button className="act-btn act-detail" title="Voir le détail" onClick={() => openDetail(d.id)}>
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="act-btn"
                          title="Imprimer l'attestation"
                          onClick={() => printAttestation(d)}
                          style={{ background: 'rgba(26,107,74,.10)', color: '#1A6B4A' }}
                        >
                          <i className="fa-solid fa-print"></i>
                        </button>
                        <button className="act-btn act-suppr" title="Supprimer" onClick={() => openDelete(d.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {currentSlice.length === 0 && (
              <div className="empty-state">
                <i className="fa-solid fa-award"></i>
                <p>Aucun certifié trouvé. Les certifiés apparaîtront ici après leur certification depuis la liste des étudiants.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="pg-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                <i className="fa-solid fa-angles-left"></i>
              </button>
              <button className="pg-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <i className="fa-solid fa-angle-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                <button
                  key={page}
                  className={`pg-num ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button className="pg-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <i className="fa-solid fa-angle-right"></i>
              </button>
              <button className="pg-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                <i className="fa-solid fa-angles-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODALE SUPPRESSION GROUPÉE */}
      {showBulkDelete && (
        <div className="modal-overlay show" onClick={ev => { if (ev.target === ev.currentTarget && !bulkDeleting) setShowBulkDelete(false); }}>
          <div className="modal-suppr">
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '28px' }}>
              <div className="suppr-icon-wrap">
                <i className="fa-solid fa-trash" style={{ fontSize: '26px', color: '#ef4444' }}></i>
              </div>
            </div>
            <div style={{ padding: '16px 24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>
                Supprimer {selectedIds.length} certifié{selectedIds.length > 1 ? 's' : ''}
              </h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '14px' }}>
                Vous êtes sur le point de supprimer <strong>{selectedIds.length} certifié{selectedIds.length > 1 ? 's' : ''}</strong> sélectionné{selectedIds.length > 1 ? 's' : ''}.
              </p>
              <div className="suppr-warning">
                <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: 0 }}></i>
                <span>Cette action est <strong>irréversible</strong>. Toutes les données seront définitivement supprimées.</span>
              </div>
            </div>
            <div style={{ padding: '12px 24px 20px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-cancel" style={{ flex: 1 }} onClick={() => setShowBulkDelete(false)} disabled={bulkDeleting}>
                <i className="fa-solid fa-xmark"></i> Annuler
              </button>
              <button className="btn btn-suppr-confirm" style={{ flex: 1 }} onClick={handleBulkDelete} disabled={bulkDeleting}>
                {bulkDeleting
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression…</>
                  : <><i className="fa-solid fa-trash"></i> Confirmer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal />
      <Toast />
    </Layout>
  );
};

export default Diplomes;