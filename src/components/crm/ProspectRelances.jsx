// src/components/crm/ProspectRelances.jsx
//
// Section "Relances" intégrée dans la page détail d'un prospect.
// Affiche l'historique des relances + bouton "Ajouter une relance".
//
// Usage :
//   <ProspectRelances
//       prospectId={prospect.id}
//       prospectNom={prospect.nom}
//       onHistoriqueUpdated={reloadHistoriques}   ← callback optionnel
//   />
//
import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/crm/relances.css';
import RelanceModal from './RelanceModal';
import {
  getProspectRelances,
  createRelance,
  deleteRelance,
  actionOk,
  STATUT_CONFIG,
} from '../../services/crm/relancesService';

export default function ProspectRelances({ prospectId, prospectNom, formations_ids = [], onHistoriqueUpdated }) {
  const [relances,     setRelances]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [savingId,     setSavingId]     = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // ── popup "appel effectué" (notes + confirm) ────────────────────────────
  const [showOkPrompt, setShowOkPrompt] = useState(false);
  const [okNotes,      setOkNotes]      = useState('');
  const [pendingOkId,  setPendingOkId]  = useState(null);

  // ── popup "reprogrammer ?" après action OK ──────────────────────────────
  const [reprogModal,  setReprogModal]  = useState(false);

  // ── popup confirmation suppression ────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── chargement initial ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProspectRelances(prospectId);
      setRelances(data);
    } catch (err) {
      console.error('Erreur chargement relances :', err);
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => { load(); }, [load]);

  // ── Créer une relance ───────────────────────────────────────────────────
const handleCreate = async ({ dateRelance, commentaire }) => {
  try {
    setModalLoading(true);
    const created = await createRelance(prospectId, { 
      dateRelance, 
      commentaire,
      formationId: formations_ids[0] || null,   // ← première formation du prospect
    });
    setRelances((prev) => [created, ...prev]);
    setShowModal(false);
  } catch (err) {
    console.error('Erreur création relance :', err);
  } finally {
    setModalLoading(false);
  }
};
  // ── Supprimer ───────────────────────────────────────────────────────────
  const handleDelete = (id) => setDeleteConfirmId(id);

  const confirmDelete = async () => {
    try {
      await deleteRelance(deleteConfirmId);
      setRelances((prev) => prev.filter((r) => r.id !== deleteConfirmId));
    } catch (err) {
      console.error('Erreur suppression relance :', err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // ── Ouvrir le prompt "appel effectué" ───────────────────────────────────
  const openOkPrompt = (id) => {
    setPendingOkId(id);
    setOkNotes('');
    setShowOkPrompt(true);
  };

  // ── Confirmer l'appel ───────────────────────────────────────────────────
  const confirmOk = async () => {
    if (!pendingOkId) return;
    try {
      setSavingId(pendingOkId);
      setShowOkPrompt(false);

      // Le backend marque la relance "fait" ET crée un HistoriqueEchange
      const { relance: updated } = await actionOk(pendingOkId, okNotes);

      // Mettre à jour la relance dans la liste locale
      setRelances((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );

      // ✅ Notifier le parent de recharger les historiques
      if (onHistoriqueUpdated) {
        onHistoriqueUpdated();
      }

      // Proposer une reprogrammation
      setReprogModal(true);
    } catch (err) {
      console.error('Erreur action OK :', err);
    } finally {
      setSavingId(null);
      setPendingOkId(null);
    }
  };

  // ── Reprogrammer ────────────────────────────────────────────────────────
  const handleReprog = async ({ dateRelance, commentaire }) => {
    try {
      setModalLoading(true);
      const created = await createRelance(prospectId, {
        dateRelance,
        commentaire,
        formationId: formations_ids[0] || null,   // ← même formation
      });
      setRelances((prev) => [created, ...prev]);
      setReprogModal(false);
    } catch (err) {
      console.error('Erreur reprogrammation :', err);
    } finally {
      setModalLoading(false);
    }
  };

  // ── Helpers d'affichage ─────────────────────────────────────────────────
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : '—';

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="prospect-relances-section">

      {/* ── En-tête ── */}
      <div className="relances-section-header">
        <h4 className="relances-section-title">
          <i className="fa-solid fa-bell"></i> Historique des relances
        </h4>
        <button className="btn-add-relance" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-plus"></i> Ajouter une relance
        </button>
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="relances-loading">
          <i className="fa-solid fa-spinner fa-spin"></i> Chargement…
        </div>
      ) : relances.length === 0 ? (
        <div className="relances-empty">
          Aucune relance programmée pour ce prospect.
        </div>
      ) : (
        <div className="relances-history-table-wrap">
          <table className="relances-history-table">
            <thead>
              <tr>
                <th>Date prévue</th>
                <th>Formation</th> 
                <th>Commentaire</th>
                <th>Statut</th>
                <th>Date action</th>
                <th style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {relances.map((r) => {
                const cfg = STATUT_CONFIG[r.statutCalc] || STATUT_CONFIG.a_venir;
                return (
                  <tr key={r.id} className={r.statutCalc === 'fait' ? 'row-fait' : ''}>
                    <td>{fmtDate(r.dateRelance)}</td>
                            {/* Nouvelle cellule Formation */}
                    <td>
                      {r.formationNom ? (
                        <span className="relance-formation">
                          <i className="fa-solid fa-tag"></i> {r.formationNom}
                        </span>
                      ) : (
                        <span className="no-formation">—</span>
                      )}
                    </td>
                    <td className="relance-comment-cell">
                      {r.commentaire || <span className="no-comment">—</span>}
                    </td>
                    <td>
                      <span className={`relance-badge ${cfg.badgeCls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td>{r.dateAction ? fmtDate(r.dateAction) : '—'}</td>
                    <td>
                      <div className="relance-row-actions">
                        {r.statutCalc !== 'fait' && (
                          <button
                            className="btn-ok-relance"
                            title="Marquer appel effectué"
                            disabled={savingId === r.id}
                            onClick={() => openOkPrompt(r.id)}
                          >
                            {savingId === r.id
                              ? <i className="fa-solid fa-spinner fa-spin"></i>
                              : <><i className="fa-solid fa-check"></i> OK</>
                            }
                          </button>
                        )}
                        <button
                          className="btn-delete-relance"
                          title="Supprimer"
                          onClick={() => handleDelete(r.id)}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal : créer relance ── */}
      <RelanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreate}
        loading={modalLoading}
        title="Programmer une relance"
      />

      {/* ── Prompt OK : notes + confirmation ── */}
      {showOkPrompt && (
        <div className="relance-modal-overlay" onClick={() => setShowOkPrompt(false)}>
          <div className="relance-modal-card" onClick={(e) => e.stopPropagation()}>

            <div className="relance-modal-header">
              <div className="relance-modal-icon ok-icon">
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <h3 className="relance-modal-title">Appel effectué</h3>
              <button
                className="relance-modal-close"
                onClick={() => setShowOkPrompt(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="relance-modal-body">
              <p className="ok-prompt-info">
                <i className="fa-solid fa-circle-info" style={{ color: '#3b82f6' }}></i>{' '}
                L'appel sera enregistré dans l'historique de <strong>{prospectNom}</strong>.
              </p>
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
                />
              </div>
            </div>

            <div className="relance-modal-footer">
              <button
                className="btn-relance-cancel"
                onClick={() => setShowOkPrompt(false)}
              >
                Annuler
              </button>
              <button
                className="btn-relance-save btn-ok"
                onClick={confirmOk}
                disabled={savingId !== null}
              >
                {savingId !== null
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
                  : <><i className="fa-solid fa-check-double"></i> Confirmer l'appel</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup reprogrammation ── */}
      {reprogModal && (
        <div className="relance-modal-overlay" onClick={() => setReprogModal(false)}>
          <div className="relance-modal-card reprog-card" onClick={(e) => e.stopPropagation()}>

            <div className="relance-modal-header reprog-header">
              <div className="relance-modal-icon reprog-icon">
                <i className="fa-solid fa-rotate-right"></i>
              </div>
              <h3 className="relance-modal-title">Programmer une autre relance ?</h3>
              <button
                className="relance-modal-close"
                onClick={() => setReprogModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="relance-modal-body">
              <p className="reprog-prompt-text">
                <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>{' '}
                L'appel a bien été enregistré dans l'historique.
                <br />
                Voulez-vous programmer une nouvelle relance pour{' '}
                <strong>{prospectNom}</strong> ?
              </p>
            </div>

            <div className="relance-modal-footer reprog-footer">
              <button
                className="btn-relance-cancel"
                onClick={() => setReprogModal(false)}
              >
                Non, merci
              </button>
              <button
                className="btn-relance-save"
                onClick={() => {
                  setReprogModal(false);
                  setShowModal(true);
                }}
              >
                <i className="fa-solid fa-calendar-plus"></i> Oui, programmer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal confirmation suppression ── */}
      {deleteConfirmId && (
        <div className="relance-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="relance-modal-card delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="relance-modal-header delete-header">
              <div className="relance-modal-icon delete-icon">
                <i className="fa-solid fa-trash"></i>
              </div>
              <h3 className="relance-modal-title">Supprimer la relance</h3>
              <button className="relance-modal-close" onClick={() => setDeleteConfirmId(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="relance-modal-body">
              <p className="delete-confirm-text">
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>{' '}
                Êtes-vous sûr de vouloir supprimer cette relance ?<br />
                <span className="delete-confirm-sub">Cette action est irréversible.</span>
              </p>
            </div>
            <div className="relance-modal-footer">
              <button className="btn-relance-cancel" onClick={() => setDeleteConfirmId(null)}>
                Annuler
              </button>
              <button className="btn-relance-delete" onClick={confirmDelete}>
                <i className="fa-solid fa-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}