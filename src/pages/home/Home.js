// src/pages/home/Home.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout           from '../../components/Layout';
import RelanceModal     from '../../components/crm/RelanceModal';
import {
  getAllRelances,
  createRelance,
  deleteRelance,
  actionOk,
  STATUT_CONFIG as PROSPECT_STATUT_CONFIG,
} from '../../services/crm/relancesService';
import {
  getAllEtudiantRelances,
  createEtudiantRelance,
  deleteEtudiantRelance,
  actionOkEtudiant,
  STATUT_CONFIG as ETUDIANT_STATUT_CONFIG,
} from '../../services/crm/etudiantRelancesService';
import {
  getAllDiplomeRelances,
  createDiplomeRelance,
  deleteDiplomeRelance,
  actionOkDiplome,
} from '../../services/crm/diplomeRelancesService';
import '../../styles/home/home.css';

// Fusion des configurations
const STATUT_CONFIG = { ...PROSPECT_STATUT_CONFIG, ...ETUDIANT_STATUT_CONFIG };

export default function Home() {
  const navigate = useNavigate();

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Appeler client X', description: 'Vérifier son contrat de formation', urgent: true, done: false },
    { id: 2, title: 'Envoyer email', description: 'Proposition commerciale pour formation Java', urgent: false, done: false },
    { id: 3, title: 'Préparer réunion', description: "Réunion bilan Q2 avec l'équipe commerciale", urgent: true, done: true },
  ]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', urgent: false });

  // ── Relances (PROSPECTS + ÉTUDIANTS + DIPLÔMÉS) ─────────────────────────
  const [relances, setRelances] = useState([]);
  const [relLoading, setRelLoading] = useState(true);
  const [relError, setRelError] = useState('');
  const [reminderFilter, setReminderFilter] = useState('all');
  const [reminderSearch, setReminderSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [detailModal, setDetailModal] = useState(null);
  const [showOkPrompt, setShowOkPrompt] = useState(false);
  const [pendingOkId, setPendingOkId] = useState(null);
  const [pendingRelance, setPendingRelance] = useState(null);
  const [pendingType, setPendingType] = useState(null);
  const [okNotes, setOkNotes] = useState('');
  const [reprogModal, setReprogModal] = useState(false);
  const [reprogData, setReprogData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // ── Charger les relances (prospects + étudiants + diplômés) ───────────────
  const loadRelances = useCallback(async () => {
    try {
      setRelLoading(true);
      setRelError('');
      
      const [prospectsData, etudiantsData, diplomesData] = await Promise.all([
        getAllRelances(),
        getAllEtudiantRelances(),
        getAllDiplomeRelances()
      ]);
      
      const prospectsWithType = prospectsData.map(r => ({ ...r, type: 'prospect' }));
      const etudiantsWithType = etudiantsData.map(r => ({ ...r, type: 'etudiant' }));
      const diplomesWithType = diplomesData.map(r => ({ ...r, type: 'diplome' }));
      
      const allRelances = [...prospectsWithType, ...etudiantsWithType, ...diplomesWithType]
        .sort((a, b) => a.dateRelance.localeCompare(b.dateRelance));
      
      setRelances(allRelances);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setRelError('Impossible de charger les relances.');
    } finally {
      setRelLoading(false);
    }
  }, []);

  useEffect(() => { loadRelances(); }, [loadRelances]);

  // ── Fonction générique pour créer une relance selon le type ──────────────
  const handleCreateRelance = async (type, id, { dateRelance, commentaire, formationId }) => {
    if (type === 'prospect') {
      return await createRelance(id, { dateRelance, commentaire, formationId });
    } else if (type === 'etudiant') {
      return await createEtudiantRelance(id, { dateRelance, commentaire, formationId });
    } else {
      return await createDiplomeRelance(id, { dateRelance, commentaire, formationId });
    }
  };

  // ── Fonction générique pour supprimer une relance ────────────────────────
  const handleDeleteRelance = async (id, type) => {
    if (type === 'prospect') {
      await deleteRelance(id);
    } else if (type === 'etudiant') {
      await deleteEtudiantRelance(id);
    } else {
      await deleteDiplomeRelance(id);
    }
  };

  // ── Fonction générique pour l'action OK ──────────────────────────────────
  const handleActionOk = async (id, type, notes) => {
    if (type === 'prospect') {
      return await actionOk(id, notes);
    } else if (type === 'etudiant') {
      return await actionOkEtudiant(id, notes);
    } else {
      return await actionOkDiplome(id, notes);
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = (relance) => {
    setDeleteConfirmId(relance.id);
    setDeleteType(relance.type);
  };

  const confirmDelete = async () => {
    try {
      await handleDeleteRelance(deleteConfirmId, deleteType);
      setRelances((prev) => prev.filter((r) => r.id !== deleteConfirmId));
    } catch (err) { console.error(err); }
    finally { 
      setDeleteConfirmId(null);
      setDeleteType(null);
    }
  };

  // ── Ouvrir le prompt OK ───────────────────────────────────────────────────
  const openOkPrompt = (relance) => {
    setPendingOkId(relance.id);
    setPendingRelance(relance);
    setPendingType(relance.type);
    setOkNotes('');
    setShowOkPrompt(true);
  };

  // ── Confirmer l'appel ─────────────────────────────────────────────────────
  const confirmOk = async () => {
    if (!pendingOkId) return;
    try {
      setSavingId(pendingOkId);
      setShowOkPrompt(false);
      const { relance: updated } = await handleActionOk(pendingOkId, pendingType, okNotes);
      setRelances((prev) => prev.map((r) => (r.id === updated.id ? { ...updated, type: pendingType } : r)));
      
      // Stocker les infos pour reprogrammation
      let targetId = null;
      if (pendingType === 'prospect') targetId = updated.prospectId;
      else if (pendingType === 'etudiant') targetId = updated.etudiantId;
      else targetId = updated.diplomeId;
      
      setReprogData({
        id: targetId,
        type: pendingType,
      });
      setReprogModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
      setPendingOkId(null);
      setPendingRelance(null);
      setPendingType(null);
    }
  };

  // ── Reprogrammer ──────────────────────────────────────────────────────────
  const handleReprog = async ({ dateRelance, commentaire }) => {
    if (!reprogData) return;
    try {
      setModalLoading(true);
      const newR = await handleCreateRelance(reprogData.type, reprogData.id, { 
        dateRelance, 
        commentaire,
        formationId: null 
      });
      setRelances((prev) => [{ ...newR, type: reprogData.type }, ...prev]);
      setReprogModal(false);
      setReprogData(null);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  // ── Navigation vers la fiche appropriée ──────────────────────────────────
  const handleNavigate = (relance) => {
    if (relance.type === 'prospect') {
      navigate(`/prospects?id=${relance.prospectId}`);
    } else if (relance.type === 'etudiant') {
      navigate(`/etudiants?id=${relance.etudiantId}`);
    } else {
      navigate(`/diplomes?id=${relance.diplomeId}`);
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), done: false }]);
    setNewTask({ title: '', description: '', urgent: false });
    setShowTaskForm(false);
  };
  const toggleTask = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  // ── Filtrage + tri ────────────────────────────────────────────────────────
  const filteredRelances = relances
    .filter((r) => {
      if (reminderFilter === 'done')     return r.statutCalc === 'fait';
      if (reminderFilter === 'pending')  return ['en_retard', 'aujourd_hui'].includes(r.statutCalc);
      if (reminderFilter === 'upcoming') return r.statutCalc === 'a_venir';
      return true;
    })
    .filter((r) => {
      let nom, prenom, telephone;
      if (r.type === 'prospect') {
        nom = r.prospectNom;
        prenom = r.prospectPrenom;
        telephone = r.prospectTelephone;
      } else if (r.type === 'etudiant') {
        nom = r.etudiantNom;
        prenom = r.etudiantPrenom;
        telephone = r.etudiantTelephone;
      } else {
        nom = r.diplomeNom;
        prenom = r.diplomePrenom;
        telephone = r.diplomeTelephone;
      }
      return `${prenom} ${nom}`.toLowerCase().includes(reminderSearch.toLowerCase()) ||
             (telephone || '').includes(reminderSearch);
    })
    .sort((a, b) => {
      const ORDER = { en_retard: 0, aujourd_hui: 1, a_venir: 2, fait: 3 };
      const diff  = (ORDER[a.statutCalc] ?? 4) - (ORDER[b.statutCalc] ?? 4);
      if (diff !== 0) return diff;
      return a.dateRelance.localeCompare(b.dateRelance);
    });

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Layout>
      <div className="home-dashboard">
        {/* LEFT PANEL - TASKS */}
        <section className="tasks-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <i className="fa-solid fa-list-check"></i> Tâches
            </h2>
            <button className="btn-add" onClick={() => setShowTaskForm(!showTaskForm)}>
              <i className="fa-solid fa-plus"></i> Ajouter
            </button>
          </div>

          {showTaskForm && (
            <div className="task-form">
              <input
                className="form-input"
                placeholder="Titre de la tâche..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <textarea
                className="form-textarea"
                placeholder="Description..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="form-row">
                <label className="urgency-toggle">
                  <input
                    type="checkbox"
                    checked={newTask.urgent}
                    onChange={(e) => setNewTask({ ...newTask, urgent: e.target.checked })}
                  />
                  <span>Urgent</span>
                </label>
                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => setShowTaskForm(false)}>Annuler</button>
                  <button className="btn-save" onClick={addTask}>Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          <div className="tasks-table-wrap">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th>Tâche</th>
                  <th>Description</th>
                  <th style={{ width: 100 }}>Urgence</th>
                  <th style={{ width: 48 }}></th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={5} className="empty-row">Aucune tâche pour l'instant</td></tr>
                )}
                {tasks.map((task) => (
                  <tr key={task.id} className={task.done ? 'task-row done-row' : 'task-row'}>
                    <td>
                      <input type="checkbox" className="task-check"
                        checked={task.done} onChange={() => toggleTask(task.id)} />
                    </td>
                    <td className="task-title-cell">{task.title}</td>
                    <td className="task-desc-cell">{task.description}</td>
                    <td>
                      <span className={task.urgent ? 'badge-urgent' : 'badge-normal'}>
                        {task.urgent ? 'Urgent' : 'Normal'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-delete-task" onClick={() => deleteTask(task.id)}>
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT PANEL - RELANCES (PROSPECTS + ÉTUDIANTS + DIPLÔMÉS) */}
        <section className="reminders-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <i className="fa-solid fa-bell"></i> Rappels & Relances
            </h2>
            {!relLoading && (
              <span className="relances-total-badge">
                {filteredRelances.filter((r) => r.statutCalc !== 'fait').length} actives
              </span>
            )}
          </div>

          <div className="reminder-filters">
            <input
              className="reminder-search"
              placeholder="🔍 Rechercher nom ou tél..."
              value={reminderSearch}
              onChange={(e) => setReminderSearch(e.target.value)}
            />
            <div className="filter-tabs">
              {[
                { key: 'all',      label: 'Tous' },
                { key: 'pending',  label: 'En attente' },
                { key: 'upcoming', label: 'À venir' },
                { key: 'done',     label: 'Fait' },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`filter-tab ${reminderFilter === f.key ? 'active' : ''}`}
                  onClick={() => setReminderFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="reminder-legend">
            <span className="leg late">● En retard</span>
            <span className="leg today">● Aujourd'hui</span>
            <span className="leg future">● À venir</span>
            <span className="leg donec">● Fait</span>
          </div>

          {relLoading && (
            <div className="relances-loading-home">
              <i className="fa-solid fa-spinner fa-spin"></i> Chargement des relances…
            </div>
          )}
          {relError && (
            <div className="relances-error-home">
              <i className="fa-solid fa-triangle-exclamation"></i> {relError}
              <button onClick={loadRelances} className="btn-retry">Réessayer</button>
            </div>
          )}

          {!relLoading && !relError && (
            <div className="reminders-list">
              {filteredRelances.length === 0 && (
                <div className="empty-reminders">Aucun rappel trouvé</div>
              )}

              {filteredRelances.map((r) => {
                const cfg = STATUT_CONFIG[r.statutCalc] || STATUT_CONFIG.a_venir;
                const isDone = r.statutCalc === 'fait';
                const isBusy = savingId === r.id;
                let typeLabel, name, phone, formation;
                
                if (r.type === 'prospect') {
                  typeLabel = '🎯 Prospect';
                  name = `${r.prospectPrenom} ${r.prospectNom}`;
                  phone = r.prospectTelephone;
                  formation = r.formationNom;
                } else if (r.type === 'etudiant') {
                  typeLabel = '🎓 Étudiant';
                  name = `${r.etudiantPrenom} ${r.etudiantNom}`;
                  phone = r.etudiantTelephone;
                  formation = r.formationNom;
                } else {
                  typeLabel = '📜 Diplômé';
                  name = `${r.diplomePrenom} ${r.diplomeNom}`;
                  phone = r.diplomeTelephone;
                  formation = r.formationNom || r.diplomeFormation;
                }

                return (
                  <div key={`${r.type}-${r.id}`} className={`reminder-card ${cfg.cardCls}`}>
                    <div className="reminder-left">
                      {isDone ? (
                        <button type="button" className="reminder-ok-btn ok-done" title="Appel déjà effectué" disabled>
                          <i className="fa-solid fa-circle-check"></i>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="reminder-ok-btn"
                          title="Cliquer pour confirmer l'appel effectué"
                          disabled={isBusy}
                          onClick={() => openOkPrompt(r)}
                        >
                          {isBusy
                            ? <i className="fa-solid fa-spinner fa-spin"></i>
                            : <i className="fa-solid fa-phone-volume"></i>
                          }
                        </button>
                      )}

                      <div className="reminder-info">
                        <div className="reminder-name">
                          <span className="reminder-type-badge">{typeLabel}</span>
                          {name}
                        </div>
                        <div className="reminder-phone">
                          <i className="fa-solid fa-phone"></i> {phone}
                        </div>
                        <div className="reminder-date">
                          <i className="fa-regular fa-calendar"></i> {fmtDate(r.dateRelance)}
                        </div>
                        {formation && (
                          <div className="reminder-formation">
                            <i className="fa-solid fa-graduation-cap"></i> {formation}
                          </div>
                        )}
                        {r.commentaire && (
                          <div className="reminder-comment">
                            <i className="fa-regular fa-comment"></i> {r.commentaire}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="reminder-right">
                      <span className={`reminder-badge ${cfg.badgeCls}`}>{cfg.label}</span>
                      <div className="reminder-actions">
                        <button
                          type="button"
                          className="btn-detail"
                          title="Voir détails"
                          onClick={() => setDetailModal(r)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-delete-reminder"
                          title="Supprimer"
                          onClick={() => handleDelete(r)}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* MODAL DÉTAIL */}
      {detailModal && (
        <div className="modal-overlay show" onClick={() => setDetailModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de la relance</h3>
              <button type="button" className="modal-close" onClick={() => setDetailModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <span className="modal-label"><i className="fa-solid fa-user"></i> {detailModal.type === 'prospect' ? 'Prospect' : detailModal.type === 'etudiant' ? 'Étudiant' : 'Diplômé'}</span>
                <span className="modal-value">
                  {detailModal.type === 'prospect' 
                    ? `${detailModal.prospectPrenom} ${detailModal.prospectNom}`
                    : detailModal.type === 'etudiant'
                    ? `${detailModal.etudiantPrenom} ${detailModal.etudiantNom}`
                    : `${detailModal.diplomePrenom} ${detailModal.diplomeNom}`}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label"><i className="fa-solid fa-phone"></i> Téléphone</span>
                <span className="modal-value">
                  {detailModal.type === 'prospect' 
                    ? detailModal.prospectTelephone 
                    : detailModal.type === 'etudiant'
                    ? detailModal.etudiantTelephone
                    : detailModal.diplomeTelephone}
                </span>
              </div>
              {detailModal.formationNom && (
                <div className="modal-row">
                  <span className="modal-label"><i className="fa-solid fa-graduation-cap"></i> Formation</span>
                  <span className="modal-value">{detailModal.formationNom}</span>
                </div>
              )}
              <div className="modal-row">
                <span className="modal-label"><i className="fa-regular fa-calendar"></i> Date relance</span>
                <span className="modal-value">
                  {new Date(detailModal.dateRelance).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              {detailModal.commentaire && (
                <div className="modal-row">
                  <span className="modal-label"><i className="fa-regular fa-comment"></i> Commentaire</span>
                  <span className="modal-value">{detailModal.commentaire}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {detailModal.statutCalc !== 'fait' && (
                <button
                  type="button"
                  className="btn-ok-from-detail"
                  onClick={() => {
                    setDetailModal(null);
                    openOkPrompt(detailModal);
                  }}
                >
                  <i className="fa-solid fa-phone-volume"></i> Appel effectué
                </button>
              )}
              <button
                type="button"
                className="btn-goto-prospect"
                onClick={() => handleNavigate(detailModal)}
              >
                <i className="fa-solid fa-arrow-right"></i> Voir la fiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMPT OK */}
      {showOkPrompt && (
        <div className="modal-overlay show" onClick={() => setShowOkPrompt(false)}>
          <div className="relance-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="relance-modal-header">
              <div className="relance-modal-icon ok-icon">
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <h3 className="relance-modal-title">Appel effectué</h3>
              <button type="button" className="relance-modal-close" onClick={() => setShowOkPrompt(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="relance-modal-body">
              {pendingRelance && (
                <div className="ok-prompt-info">
                  <i className="fa-solid fa-circle-info" style={{ color: '#3b82f6' }}></i>{' '}
                  Vous confirmez l'appel pour{' '}
                  <strong>
                    {pendingRelance.type === 'prospect' 
                      ? `${pendingRelance.prospectPrenom} ${pendingRelance.prospectNom}`
                      : pendingRelance.type === 'etudiant'
                      ? `${pendingRelance.etudiantPrenom} ${pendingRelance.etudiantNom}`
                      : `${pendingRelance.diplomePrenom} ${pendingRelance.diplomeNom}`}
                  </strong>.
                </div>
              )}
              <div className="relance-field">
                <label className="relance-label">
                  <i className="fa-regular fa-comment"></i> Notes sur l'échange
                  <span className="optional-tag">optionnel</span>
                </label>
                <textarea
                  className="relance-textarea"
                  placeholder="Ex : Intéressé, souhaite rappeler la semaine prochaine…"
                  rows={3}
                  value={okNotes}
                  onChange={(e) => setOkNotes(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="relance-modal-footer">
              <button type="button" className="btn-relance-cancel" onClick={() => setShowOkPrompt(false)}>
                Annuler
              </button>
              <button type="button" className="btn-relance-save btn-ok" onClick={confirmOk} disabled={savingId !== null}>
                {savingId !== null
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
                  : <><i className="fa-solid fa-check-double"></i> Confirmer l'appel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REPROGRAMMATION */}
      <RelanceModal
        isOpen={reprogModal}
        onClose={() => {
          setReprogModal(false);
          setReprogData(null);
        }}
        onSave={handleReprog}
        loading={modalLoading}
        title="Programmer une autre relance ?"
      />

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {deleteConfirmId && (
        <div className="modal-overlay show" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-card delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ background:'#FEF2F2', color:'#EF4444', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                  <i className="fa-solid fa-trash"></i>
                </span>
                Supprimer la relance
              </h3>
              <button type="button" className="modal-close" onClick={() => setDeleteConfirmId(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding:'24px 24px 8px' }}>
              <p style={{ fontSize:14, color:'#475569', lineHeight:1.6 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color:'#F97316', marginRight:6 }}></i>
                Êtes-vous sûr de vouloir supprimer cette relance ?
              </p>
              <p style={{ fontSize:12, color:'#94A3B8', marginTop:6 }}>Cette action est irréversible.</p>
            </div>
            <div className="modal-footer" style={{ gap:10 }}>
              <button type="button" className="btn-cancel-delete" onClick={() => setDeleteConfirmId(null)}>
                Annuler
              </button>
              <button type="button" className="btn-confirm-delete" onClick={confirmDelete}>
                <i className="fa-solid fa-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}