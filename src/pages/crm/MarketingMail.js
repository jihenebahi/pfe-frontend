import React, { useState, useRef, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import "../../styles/crm/MarketingMail.css";
import authService from "../../services/auth/authService";
import api from "../../services/api";
import {
  fetchEmails,
  fetchEmailDetail,
  envoyerEmail,
  archiverEmails,
  supprimerEmails,
  estimerDestinataires,
  fetchFormationsParType,
  fetchStatutsDisponibles,
} from "../../services/crm/Marketingservice";

// ─── Constantes ───────────────────────────────────────────────────────────────
const STATUTS_PROSPECT = [
  { label: "Nouveau",   value: "nouveau" },
  { label: "Contacté",  value: "contacte" },
  { label: "Intéressé", value: "interesse" },
  { label: "Converti",  value: "converti" },
  { label: "Perdu",     value: "perdu" },
];

const TABS = [
  { id: "tous",      label: "Tous les e-mails" },
  { id: "Prospects", label: "Prospects" },
  { id: "Étudiants", label: "Étudiants" },
  { id: "Diplômés",  label: "Diplômés" },
  { id: "direct",    label: "Une seule adresse" },
  { id: "archive",   label: "Archivé" },
];

// ─── Templates email ──────────────────────────────────────────────────────────
const EMAIL_TEMPLATES = [
  {
    id: "vide",
    icon: "fa-solid fa-pen-to-square",
    color: "#64748B",
    bgColor: "#F8FAFC",
    title: "Email vide",
    description: "Commencez avec un modèle vierge",
    objet: "",
    apercu: "",
    message: "",
    groupeFiltre: null,
    isProspectOnly: false,
  },
  {
    id: "promo",
    icon: "fa-solid fa-tag",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    title: "Promotion formation",
    description: "Annoncez une offre spéciale sur vos formations",
    objet: "🎓 Offre spéciale : -20% sur nos formations",
    apercu: "Ne manquez pas cette opportunité limitée dans le temps",
    message: `Bonjour,

Nous avons une excellente nouvelle pour vous ! 🎉

Dans le cadre de notre promotion exceptionnelle, bénéficiez de **20% de réduction** sur l'ensemble de nos formations pendant une durée limitée.

C'est l'occasion idéale pour :
✅ Développer vos compétences professionnelles
✅ Obtenir une certification reconnue
✅ Booster votre carrière

👉 Utilisez le code PROMO20 lors de votre inscription.

N'attendez plus, les places sont limitées !

Cordialement,
L'équipe de formation`,
    groupeFiltre: null,
    isProspectOnly: false,
  },
  {
    id: "nouvelle_formation",
    icon: "fa-solid fa-graduation-cap",
    color: "#22c55e",
    bgColor: "#f0fdf4",
    title: "Nouvelle formation",
    description: "Présentez une nouvelle formation disponible",
    objet: "🆕 Nouvelle formation disponible : [Nom de la formation]",
    apercu: "Découvrez notre toute nouvelle formation et inscrivez-vous dès maintenant",
    message: `Bonjour,

Nous sommes ravis de vous annoncer le lancement de notre nouvelle formation : **[Nom de la formation]** 🎓

Cette formation a été spécialement conçue pour vous permettre de :
• Acquérir des compétences recherchées sur le marché
• Progresser à votre rythme avec un accompagnement personnalisé
• Obtenir une certification reconnue par les employeurs

📅 Début des cours : [Date]
⏱️ Durée : [Durée]
📍 Format : [Présentiel / En ligne]

Les inscriptions sont ouvertes ! Rejoignez la première promotion et bénéficiez d'un tarif préférentiel.

Cordialement,
L'équipe pédagogique`,
    groupeFiltre: null,
    isProspectOnly: false,
  },
  {
    id: "evenement",
    icon: "fa-solid fa-calendar-star",
    color: "#6366f1",
    bgColor: "#eef2ff",
    title: "Invitation événement",
    description: "Invitez vos contacts à un événement",
    objet: "📅 Vous êtes invité(e) à [Nom de l'événement]",
    apercu: "Une invitation exclusive rien que pour vous",
    message: `Bonjour,

Nous avons le plaisir de vous inviter à notre prochain événement : **[Nom de l'événement]** 🎉

📅 Date : [Date]
🕐 Heure : [Heure]
📍 Lieu : [Adresse / Lien]

Au programme :
• [Point 1]
• [Point 2]
• [Point 3]

Cet événement est l'occasion de rencontrer nos formateurs, d'échanger avec d'autres professionnels et de découvrir nos nouvelles offres de formation.

🔖 Inscription gratuite mais obligatoire — les places sont limitées.

Nous espérons vous y voir nombreux !

Cordialement,
L'équipe organisatrice`,
    groupeFiltre: null,
    isProspectOnly: false,
  },
  {
    id: "relance",
    icon: "fa-solid fa-rotate-right",
    color: "#ef4444",
    bgColor: "#fef2f2",
    title: "Relance prospect",
    description: "Recontactez des prospects inactifs",
    objet: "Avez-vous eu le temps de réfléchir à votre formation ? 🤔",
    apercu: "Nous pensons encore à vous — votre projet nous tient à cœur",
    message: `Bonjour,

Je me permets de vous recontacter suite à votre précédent intérêt pour nos formations.

Nous pensons à vous et souhaitons savoir si vous avez eu l'occasion de réfléchir à votre projet de formation.

Si vous avez des questions ou si vous souhaitez en savoir plus, n'hésitez pas à nous contacter. Nous sommes disponibles pour vous accompagner dans votre démarche.

🎁 En guise de geste commercial, nous vous offrons une **session de conseil gratuite** de 30 minutes avec l'un de nos conseillers pédagogiques.

Pour en profiter, répondez simplement à cet email ou appelez-nous au [Numéro].

Cordialement,
L'équipe commerciale`,
    groupeFiltre: "Prospects",
    isProspectOnly: true,
  },
  {
    id: "nouvelle_session",
    icon: "fa-solid fa-layer-group",
    color: "#4aa3c7",
    bgColor: "#e8f5fb",
    title: "Nouvelle session formation",
    description: "Annoncez l'ouverture d'une nouvelle session",
    objet: "🗓️ Nouvelle session ouverte — Inscrivez-vous avant le [Date limite]",
    apercu: "Une nouvelle session démarre bientôt, réservez votre place",
    message: `Bonjour,

Bonne nouvelle ! Une nouvelle session de formation est désormais disponible. 📚

**Formation :** [Nom de la formation]
**Dates :** Du [Date début] au [Date fin]
**Horaires :** [Horaires]
**Format :** [Présentiel / Distanciel / Hybride]

⚠️ Les places sont limitées — les inscriptions seront clôturées le **[Date limite]**.

Pourquoi choisir cette session ?
✓ Formateurs expérimentés et certifiés
✓ Programme mis à jour selon les dernières tendances
✓ Support pédagogique complet fourni
✓ Certificat délivré à l'issue de la formation

Pour vous inscrire ou obtenir plus d'informations, répondez à cet email ou contactez-nous directement.

À très bientôt,
L'équipe de formation`,
    groupeFiltre: null,
    isProspectOnly: false,
  },
];

// ─── Composant Chip avec recherche ──────────────────────────────────────────
function ChipGroupWithSearch({ items, selected, onChange, title, labelKey = "label", valueKey = "value" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = searchTerm
    ? items.filter((i) => i[labelKey].toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  const toggle = (val) => {
    const numericVal = typeof val === "string" ? Number(val) : val;
    onChange(selected.includes(numericVal) ? selected.filter((x) => x !== numericVal) : [...selected, numericVal]);
  };

  return (
    <div className="ce-sub-block">
      <label className="ce-sub-lbl">{title}</label>
      <div style={{ marginBottom: "8px", position: "relative" }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#94A3B8" }} />
        <input
          type="text"
          placeholder={`Rechercher ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "6px 10px 6px 28px", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "11px", outline: "none", fontFamily: "inherit" }}
        />
      </div>
      <div className="ce-chips-scroll">
        {items.length === 0 ? (
          <div style={{ padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" }}>Aucun résultat</div>
        ) : filtered.map((item) => {
          const itemValue = typeof item[valueKey] === "string" ? Number(item[valueKey]) : item[valueKey];
          return (
            <label key={itemValue} className={`ce-chip ${selected.includes(itemValue) ? "ce-chip-on" : ""}`}>
              <input type="checkbox" checked={selected.includes(itemValue)} onChange={() => toggle(itemValue)} />
              {item[labelKey]}
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Composant Chip pour formations (sans nombre) ──────────────────────────
function ChipGroupFormations({ items, selected, onChange, title }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = searchTerm
    ? items.filter((i) => i.intitule?.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className="ce-sub-block">
      <label className="ce-sub-lbl">{title}</label>
      <div style={{ marginBottom: "8px", position: "relative" }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#94A3B8" }} />
        <input
          type="text"
          placeholder={`Rechercher ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "6px 10px 6px 28px", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "11px", outline: "none", fontFamily: "inherit" }}
        />
      </div>
      <div className="ce-chips-scroll">
        {items.length === 0 ? (
          <div style={{ padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" }}>Aucune formation disponible</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" }}>Aucun résultat</div>
        ) : filtered.map((item) => (
          <label key={item.id} className={`ce-chip ${selected.includes(item.id) ? "ce-chip-on" : ""}`}>
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
            {item.intitule}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Composant Chip pour statuts (sans nombre, sans doublons, sans 0) ──────────────────────────────────
function ChipGroupStatuts({ items, selected, onChange, title }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  };

  const uniqueItems = [];
  const seenValues = new Set();
  
  for (const item of items) {
    if (!seenValues.has(item.value) && item.nombre > 0) {
      seenValues.add(item.value);
      uniqueItems.push(item);
    }
  }

  return (
    <div className="ce-sub-block">
      <label className="ce-sub-lbl">{title}</label>
      <div className="ce-chips-scroll">
        {uniqueItems.length === 0 ? (
          <div style={{ padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" }}>
            Aucun statut disponible pour cette formation
          </div>
        ) : uniqueItems.map((item) => (
          <label key={item.value} className={`ce-chip ${selected.includes(item.value) ? "ce-chip-on" : ""}`}>
            <input type="checkbox" checked={selected.includes(item.value)} onChange={() => toggle(item.value)} />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Composant Chip simple ──────────────────────────────────────────────────
function ChipGroupSimple({ items, selected, onChange, title, labelKey = "label", valueKey = "value" }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  };

  return (
    <div className="ce-sub-block">
      <label className="ce-sub-lbl">{title}</label>
      <div className="ce-chips-scroll">
        {items.map((item) => {
          const itemValue = item[valueKey];
          return (
            <label key={itemValue} className={`ce-chip ${selected.includes(itemValue) ? "ce-chip-on" : ""}`}>
              <input type="checkbox" checked={selected.includes(itemValue)} onChange={() => toggle(itemValue)} />
              {item[labelKey]}
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Filtre date unique (CORRIGÉ - Application immédiate) ────────────────────
function DateFilter({ dateValue, setDateValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDateValue(newDate);
    setOpen(false); // Fermer le dropdown après sélection
  };

  const handleReset = () => {
    setDateValue("");
    setOpen(false);
  };

  return (
    <div className="fd-wrap" ref={ref}>
      <button className={`fd-trigger ${dateValue ? "fd-active" : ""}`} onClick={() => setOpen(!open)}>
        <i className="fa-regular fa-calendar" />
        <span>Date</span>
        {dateValue && <span className="fd-count">1</span>}
        {dateValue && (
          <span className="fd-x" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
            <i className="fa-solid fa-xmark" />
          </span>
        )}
      </button>
      {open && (
        <div className="fd-dropdown" style={{ width: "220px" }}>
          <div style={{ padding: "12px" }}>
            <label style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "6px" }}>Filtrer par date</label>
            <input
              ref={inputRef}
              type="date"
              className="fd-search-input"
              value={dateValue}
              onChange={handleDateChange}
              style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "7px 9px", fontFamily: "inherit", fontSize: "12.5px" }}
            />
            <div className="fd-foot" style={{ padding: "10px 0 0 0" }}>
              <button className="fd-reset-btn" onClick={handleReset}>Réinitialiser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filtre date unique pour la modal destinataires ───────────────────────────
function DateSimpleFilter({ dateValue, setDateValue, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleDateChange = (e) => {
    setDateValue(e.target.value);
    setOpen(false);
  };

  return (
    <div className="fd-wrap" ref={ref}>
      <button className={`fd-trigger ${dateValue ? "fd-active" : ""}`} onClick={() => setOpen(!open)}>
        <i className="fa-regular fa-calendar" />
        <span>{label || "Date inscription"}</span>
        {dateValue && <span className="fd-count">1</span>}
        {dateValue && (
          <span className="fd-x" onClick={(e) => { e.stopPropagation(); setDateValue(""); }}>
            <i className="fa-solid fa-xmark" />
          </span>
        )}
      </button>
      {open && (
        <div className="fd-dropdown" style={{ width: "220px" }}>
          <div style={{ padding: "12px" }}>
            <label style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "6px" }}>{label || "Filtrer par date"}</label>
            <input
              type="date"
              className="fd-search-input"
              value={dateValue}
              onChange={handleDateChange}
              style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "7px 9px", fontFamily: "inherit", fontSize: "12.5px" }}
            />
            <div className="fd-foot" style={{ padding: "10px 0 0 0" }}>
              <button className="fd-reset-btn" onClick={() => { setDateValue(""); setOpen(false); }}>Réinitialiser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal Détail email ───────────────────────────────────────────────────────
function EmailDetailModal({ emailId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!emailId) return;
    setLoading(true);
    fetchEmailDetail(emailId)
      .then((data) => { setDetail(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [emailId]);

  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-modal mm-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#e8f5fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-envelope" style={{ color: "#4aa3c7", fontSize: "16px" }} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B" }}>Détail de l'e-mail</div>
              <div style={{ fontSize: "12px", color: "#94A3B8" }}>Informations complètes de la campagne</div>
            </div>
          </div>
          <button className="mm-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="mm-modal-body">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#94A3B8" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px" }} />
            </div>
          ) : !detail ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>Impossible de charger les détails.</div>
          ) : (
            <>
              <div className="mm-detail-meta-grid">
                {[
                  ["Objet", detail.objet],
                  ["Envoyé par", detail.envoye_par_email],
                  ["Groupe cible", detail.groupe_display || detail.email_direct || "—"],
                  ["Destinataires", (detail.nombre_destinataires || 0).toLocaleString() + " contact(s)"],
                  ["Date d'envoi", detail.date_envoi ? new Date(detail.date_envoi).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"],
                  ["Statut", detail.est_archive ? "Archivé" : "Actif"],
                ].map(([k, v]) => (
                  <div key={k} className="mm-detail-meta-item">
                    <div className="mm-detail-meta-key">{k}</div>
                    <div className="mm-detail-meta-val">{v}</div>
                  </div>
                ))}
              </div>

              {detail.apercu && (
                <div className="mm-detail-section">
                  <div className="mm-detail-section-title"><i className="fa-solid fa-eye" /> Texte d'aperçu</div>
                  <div className="mm-detail-apercu">{detail.apercu}</div>
                </div>
              )}

              <div className="mm-detail-section">
                <div className="mm-detail-section-title"><i className="fa-solid fa-align-left" /> Corps du message</div>
                <div className="mm-detail-body">{detail.message}</div>
              </div>

              {detail.fichier && (
                <div className="mm-detail-section">
                  <div className="mm-detail-section-title"><i className="fa-solid fa-paperclip" /> Pièce jointe</div>
                  <a href={detail.fichier} target="_blank" rel="noopener noreferrer" className="mm-detail-file">
                    <i className="fa-solid fa-file-arrow-down" />
                    <span>Télécharger la pièce jointe</span>
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal de confirmation pour suppression ───────────────────────────────────
function ConfirmActionModal({ title, message, onConfirm, onClose }) {
  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px", textAlign: "center" }}>
        <div className="mm-modal-header" style={{ justifyContent: "center", borderBottom: "none", paddingBottom: "0" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "24px" }}>
            <i className="fa-solid fa-trash-can" style={{ color: "#EF4444", fontSize: "28px" }} />
          </div>
        </div>
        <div className="mm-modal-body" style={{ textAlign: "center", padding: "0 24px 24px 24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1E293B", marginBottom: "8px" }}>{title}</h3>
          <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "24px" }}>{message}</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="ce-btn-ghost" onClick={onClose} style={{ padding: "8px 16px" }}>Annuler</button>
            <button className="mm-btn-ok" onClick={onConfirm} style={{ background: "#EF4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
              <i className="fa-solid fa-trash-can" /> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table destinataires SANS bouton Envoyer ─────────────────
function RecipientsModal({ destinataires, onClose, onSave, savedSelections }) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const [selected, setSelected] = useState(() => {
    if (savedSelections && savedSelections.length > 0) {
      return destinataires.map((_, i) => i).filter(idx => 
        savedSelections.some(s => s.email === destinataires[idx].email)
      );
    }
    return destinataires.map((_, i) => i);
  });

  const filtered = destinataires.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      (d.nom || "").toLowerCase().includes(q) || 
      (d.email || "").toLowerCase().includes(q) || 
      (d.ville || "").toLowerCase().includes(q) ||
      (d.formation || "").toLowerCase().includes(q);
    
    let matchDate = true;
    if (dateFilter) {
      const dateInscription = d.date_inscription;
      if (dateInscription && dateInscription !== "—") {
        const filterDate = dateFilter;
        const itemDate = dateInscription.split('/').reverse().join('-');
        matchDate = filterDate === itemDate;
      } else {
        matchDate = false;
      }
    }
    
    return matchSearch && matchDate;
  });

  const allChecked = filtered.length > 0 && filtered.every((d) => selected.includes(destinataires.indexOf(d)));
  
  const toggleAll = () => {
    if (allChecked) {
      setSelected(selected.filter((i) => !filtered.map((d) => destinataires.indexOf(d)).includes(i)));
    } else {
      const filteredIdxs = filtered.map((d) => destinataires.indexOf(d));
      setSelected([...new Set([...selected, ...filteredIdxs])]);
    }
  };
  
  const toggle = (idx) => setSelected((prev) => prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]);

  const handleSave = () => {
    const selectedContacts = selected.map((i) => destinataires[i]);
    onSave(selectedContacts);
    onClose();
  };

  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-modal mm-recipients-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#e8f5fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-users" style={{ color: "#4aa3c7", fontSize: "16px" }} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B" }}>Liste des destinataires</div>
              <div className="mm-recipients-counter">
                <i className="fa-solid fa-circle-check" style={{ color: "#4aa3c7" }} />
                Nombre de destinataires : <strong>{selected.length}</strong> / {destinataires.length}
              </div>
            </div>
          </div>
          <button className="mm-modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div style={{ padding: "12px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="mm-search" style={{ flex: 2, minWidth: "200px" }}>
            <i className="fa-solid fa-magnifying-glass mm-search-ic" />
            <input 
              className="mm-search-input" 
              placeholder="Rechercher par nom, email, ville ou formation..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <DateSimpleFilter dateValue={dateFilter} setDateValue={setDateFilter} label="Date inscription" />
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
              <i className="fa-regular fa-folder-open" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }} />
              Aucun contact trouvé
              {search && <div style={{ fontSize: "12px", marginTop: "8px" }}>Essayez d'autres critères de recherche</div>}
            </div>
          ) : (
            <table className="mm-table">
              <thead>
                <tr>
                  <th className="mm-th-cb">
                    <span className={`mm-cb ${allChecked ? "mm-cb-on" : ""}`} onClick={toggleAll}>
                      {allChecked && <i className="fa-solid fa-check" />}
                    </span>
                  </th>
                  <th>Nom</th>
                  <th>Ville</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Formation(s)</th>
                  <th>Statut</th>
                  <th>Date inscription</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const idx = destinataires.indexOf(d);
                  return (
                    <tr key={idx} className={selected.includes(idx) ? "mm-tr-sel" : ""}>
                      <td className="mm-td-cb">
                        <span className={`mm-cb ${selected.includes(idx) ? "mm-cb-on" : ""}`} onClick={() => toggle(idx)}>
                          {selected.includes(idx) && <i className="fa-solid fa-check" />}
                        </span>
                      </td>
                      <td style={{ fontWeight: "500", color: "#1E293B" }}>{d.nom || "—"}</td>
                      <td className="mm-td-gray">{d.ville || "—"}</td>
                      <td className="mm-td-gray" style={{ fontSize: "12px" }}>{d.email}</td>
                      <td className="mm-td-gray">{d.telephone || "—"}</td>
                      <td className="mm-td-gray" style={{ fontSize: "12px", maxWidth: "200px" }}>{d.formation || "—"}</td>
                      <td>
                        {d.statut && d.statut !== "—" && (
                          <span className="mm-badge" style={{ 
                            background: d.statut === "Intéressé" ? "#FEF3C7" : d.statut === "Converti" ? "#D1FAE5" : "#F0FDF4", 
                            color: d.statut === "Intéressé" ? "#D97706" : d.statut === "Converti" ? "#059669" : "#16a34a",
                            border: "1px solid #bbf7d0" 
                          }}>
                            {d.statut}
                          </span>
                        )}
                      </td>
                      <td className="mm-td-gray">{d.date_inscription || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#64748B" }}>{selected.length} contact(s) sélectionné(s) sur {destinataires.length}</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="ce-btn-ghost" onClick={onClose}>Fermer</button>
            <button className="ce-btn-save" onClick={handleSave} style={{ background: "#4aa3c7", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
              <i className="fa-solid fa-save" /> Enregistrer la sélection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════
export default function MarketingMail() {
  const currentUser  = authService.getCurrentUser();
  const userNom      = currentUser ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() || currentUser.username || "Utilisateur" : "Utilisateur";
  const userEmail    = currentUser?.email || "";
  const userInitial  = userNom.charAt(0).toUpperCase();

  // ── Vues : "liste" | "templates" | "creer" ───────────────────────────────
  const [view, setView]             = useState("liste");
  const [activeTab, setActiveTab]   = useState("tous");
  const [emails, setEmails]         = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [error, setError]           = useState("");

  // Sélection & archivage & suppression
  const [selected, setSelected]     = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filtres liste
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Détail email
  const [detailEmailId, setDetailEmailId] = useState(null);

  // Formulaire
  const [form, setForm] = useState({
    send_mode: "segment",
    email_direct: "",
    groupe: "",
    formations_cibles: [],
    statuts_prospects: [],
    objet: "",
    apercu: "",
    message: "",
    fichier: null,
  });

  // Flag pour savoir si on est en mode "Prospect Only"
  const [isProspectOnly, setIsProspectOnly] = useState(false);
  
  // États pour les formations dynamiques et statuts
  const [formationsDisponibles, setFormationsDisponibles] = useState([]);
  const [statutsDisponibles, setStatutsDisponibles] = useState([]);
  const [loadingFormations, setLoadingFormations] = useState(false);

  // Destinataires (liste voir)
  const [showRecipients, setShowRecipients] = useState(false);
  const [recipientsList, setRecipientsList] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [savedSelectedRecipients, setSavedSelectedRecipients] = useState([]);

  // ── Chargement des formations par type ───────────────────────────────────────
  const fetchFormationsByType = useCallback(async (groupe) => {
    if (!groupe) {
      setFormationsDisponibles([]);
      return;
    }
    
    setLoadingFormations(true);
    try {
      let type = "";
      if (groupe === "Prospects") type = "prospects";
      else if (groupe === "Étudiants") type = "etudiants";
      else if (groupe === "Diplômés") type = "diplomes";
      
      if (type) {
        const formationsData = await fetchFormationsParType(type);
        setFormationsDisponibles(formationsData);
        
        const existingIds = formationsData.map(f => f.id);
        const newFormationsCibles = form.formations_cibles.filter(id => existingIds.includes(id));
        if (newFormationsCibles.length !== form.formations_cibles.length) {
          setForm(prev => ({ ...prev, formations_cibles: newFormationsCibles }));
        }
      } else {
        setFormationsDisponibles([]);
      }
    } catch (err) {
      console.error("Erreur chargement formations:", err);
      setFormationsDisponibles([]);
    } finally {
      setLoadingFormations(false);
    }
  }, [form.formations_cibles]);

  // ── Chargement des statuts disponibles ───────────────────────────────────
  const fetchStatutsDisponiblesByFormations = useCallback(async (groupe, formationsIds) => {
    if (groupe !== "Prospects") {
      setStatutsDisponibles([]);
      return;
    }
    
    try {
      const type = "prospects";
      const statutsData = await fetchStatutsDisponibles(type, formationsIds);
      setStatutsDisponibles(statutsData);
      
      const availableValues = statutsData.filter(s => s.nombre > 0).map(s => s.value);
      const newStatuts = form.statuts_prospects.filter(s => availableValues.includes(s));
      if (newStatuts.length !== form.statuts_prospects.length) {
        setForm(prev => ({ ...prev, statuts_prospects: newStatuts }));
      }
    } catch (err) {
      console.error("Erreur chargement statuts:", err);
      setStatutsDisponibles([]);
    }
  }, [form.statuts_prospects]);

  // ── Chargement emails (CORRIGÉ AVEC DATE UNIQUE) ─────────────────────────────
  const chargerEmails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const isArchive = activeTab === "archive";
      const isDirect = activeTab === "direct";
      let groupe = "";
      if (["Prospects", "Étudiants", "Diplômés"].includes(activeTab)) {
        groupe = activeTab;
      }
      const params = { archive: isArchive, groupe, search: searchText, direct: isDirect };
      
      // Envoyer une seule date si elle est valide
      if (dateFilter && dateFilter.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
        params.date_unique = dateFilter;
      }
      
      const data = await fetchEmails(params);
      setEmails(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Erreur chargement emails:", err);
      setError("Impossible de charger les emails.");
      setEmails([]);
    } finally { setLoading(false); }
  }, [activeTab, searchText, dateFilter]);

  useEffect(() => { chargerEmails(); }, [chargerEmails]);

  // Charger les formations quand le groupe change
  useEffect(() => {
    if (form.groupe && !isProspectOnly) {
      fetchFormationsByType(form.groupe);
    } else if (isProspectOnly) {
      fetchFormationsByType("Prospects");
    } else {
      setFormationsDisponibles([]);
    }
  }, [form.groupe, isProspectOnly, fetchFormationsByType]);

  // Charger les statuts quand les formations changent
  useEffect(() => {
    const groupeActuel = isProspectOnly ? "Prospects" : form.groupe;
    if (groupeActuel === "Prospects") {
      fetchStatutsDisponiblesByFormations(groupeActuel, form.formations_cibles);
    } else {
      setStatutsDisponibles([]);
    }
  }, [form.formations_cibles, form.groupe, isProspectOnly, fetchStatutsDisponiblesByFormations]);

  // ── Pagination ──
  const totalPages      = Math.ceil(emails.length / itemsPerPage);
  const paginatedEmails = emails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const allSelected     = paginatedEmails.length > 0 && paginatedEmails.every((e) => selected.includes(e.id));

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const switchTab = (tabId) => {
    setActiveTab(tabId); 
    setSelected([]); 
    setCurrentPage(1);
    setSearchText(""); 
    setDateFilter("");
  };

  // ── Archivage ──
  const handleArchive = async () => {
    try {
      await archiverEmails(selected);
      setSelected([]); 
      setShowArchiveModal(false); 
      chargerEmails();
    } catch { 
      setError("Erreur lors de l'archivage."); 
    }
  };

  // ── Suppression ──
  const handleDelete = async () => {
    try {
      await supprimerEmails(selected);
      setSelected([]); 
      setShowDeleteModal(false); 
      chargerEmails();
    } catch { 
      setError("Erreur lors de la suppression."); 
    }
  };

  // ── Voir la liste des destinataires ──────────────────────────────────────
  const voirDestinataires = async () => {
    const groupeActuel = isProspectOnly ? "Prospects" : form.groupe;
    
    if (!groupeActuel) { 
      setError("Veuillez d'abord sélectionner un public."); 
      return; 
    }
    
    setLoadingRecipients(true);
    setError("");
    try {
      const formationsIds = form.formations_cibles.map((id) => Number(id));
      const payload = {
        groupe: groupeActuel,
        formations_cibles: formationsIds,
        statuts_prospects: form.statuts_prospects || [],
        sources_prospects: [],
      };
      
      const res = await estimerDestinataires(payload);
      
      if (res && res.destinataires) {
        setRecipientsList(res.destinataires);
      } else {
        setRecipientsList([]);
        setError("Aucun destinataire trouvé pour ces critères.");
      }
      setShowRecipients(true);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des destinataires. Vérifiez vos critères.");
      setRecipientsList([]);
    } finally { 
      setLoadingRecipients(false); 
    }
  };

  // ── Envoi (sans modal de confirmation) ──
  const handleEnvoyer = async () => {
    if (!form.objet.trim())   { setError("L'objet est obligatoire."); return; }
    if (!form.message.trim()) { setError("Le message est obligatoire."); return; }
    if (form.send_mode === "direct" && !form.email_direct.trim()) { setError("L'adresse email est obligatoire."); return; }
    
    if (form.send_mode === "segment" && savedSelectedRecipients.length === 0) {
      setError("Veuillez sélectionner au moins un destinataire dans la liste.");
      return;
    }

    setSending(true); 
    setError("");
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("send_mode", form.send_mode);
      formDataToSend.append("objet", form.objet);
      formDataToSend.append("apercu", form.apercu || "");
      formDataToSend.append("message", form.message);
      
      if (form.send_mode === "direct") {
        formDataToSend.append("email_direct", form.email_direct);
      } else {
        const groupeActuel = isProspectOnly ? "Prospects" : form.groupe;
        formDataToSend.append("groupe", groupeActuel);
        
        const selectedEmails = savedSelectedRecipients.map(r => r.email);
        formDataToSend.append("emails_selected", JSON.stringify(selectedEmails));
        
        formDataToSend.append("formations_cibles", JSON.stringify(form.formations_cibles.map((id) => Number(id))));
        formDataToSend.append("statuts_prospects", JSON.stringify(form.statuts_prospects || []));
        formDataToSend.append("sources_prospects", JSON.stringify([]));
      }
      if (form.fichier) formDataToSend.append("fichier", form.fichier);

      await envoyerEmail(formDataToSend);
      
      // Réinitialiser le formulaire
      setForm({ send_mode: "segment", email_direct: "", groupe: "", formations_cibles: [], statuts_prospects: [], objet: "", apercu: "", message: "", fichier: null });
      setIsProspectOnly(false);
      setSavedSelectedRecipients([]);
      setShowRecipients(false);
      
      // Recharger la liste et revenir à la vue liste
      await chargerEmails();
      setView("liste");
    } catch (err) {
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          const firstError = Object.values(data)[0];
          setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else setError(String(data));
      } else setError(err?.message || "Erreur lors de l'envoi.");
    } finally { setSending(false); }
  };

  const handleSaveRecipientsSelection = (selectedContacts) => {
    setSavedSelectedRecipients(selectedContacts);
    setError("");
  };

  const groupeColor = (g) => {
    if (g === "Prospects") return "#f59e0b";
    if (g === "Étudiants") return "#22c55e";
    if (g === "Diplômés")  return "#6366f1";
    return "#94A3B8";
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  VUE TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "templates") {
    return (
      <Layout>
        <div className="mm-page">
          <div className="mm-header">
            <div>
              <button className="ce-back-btn" onClick={() => { setView("liste"); setError(""); }}>
                <i className="fa-solid fa-arrow-left" /> Retour
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1E293B", marginBottom: "6px" }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#4aa3c7", marginRight: "10px" }} />
              Choisir un modèle
            </h2>
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>Sélectionnez un point de départ pour votre campagne email</p>
          </div>

          <div className="mm-templates-grid">
            {EMAIL_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="mm-template-card"
                onClick={() => {
                  const newFormState = { 
                    ...form, 
                    objet: tpl.objet, 
                    apercu: tpl.apercu, 
                    message: tpl.message 
                  };
                  
                  if (tpl.groupeFiltre) {
                    newFormState.groupe = tpl.groupeFiltre;
                    newFormState.send_mode = "segment";
                    newFormState.formations_cibles = [];
                    newFormState.statuts_prospects = [];
                  }
                  
                  setIsProspectOnly(tpl.isProspectOnly || false);
                  
                  setForm(newFormState);
                  setView("creer");
                  setError("");
                }}
              >
                <div className="mm-template-icon" style={{ background: tpl.bgColor, color: tpl.color }}>
                  <i className={tpl.icon} />
                </div>
                <div className="mm-template-title">{tpl.title}</div>
                <div className="mm-template-desc">{tpl.description}</div>
                {tpl.groupeFiltre && (
                  <div className="mm-template-cta" style={{ fontSize: "10px", color: "#f59e0b" }}>
                    <i className="fa-solid fa-bullseye" /> Cible: {tpl.groupeFiltre}
                  </div>
                )}
                <div className="mm-template-cta">
                  Utiliser ce modèle <i className="fa-solid fa-arrow-right" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  VUE CRÉER
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "creer") {
    return (
      <Layout>
        <div className="ce-page">
          <div className="ce-topbar">
            <button className="ce-back-btn" onClick={() => { setView("templates"); setError(""); setIsProspectOnly(false); setSavedSelectedRecipients([]); }}>
              <i className="fa-solid fa-arrow-left" /> Changer de modèle
            </button>
            <h2 className="ce-topbar-title">Nouvel e-mail</h2>
          </div>

          {error && (
            <div className="mm-error-banner">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          {form.send_mode === "segment" && savedSelectedRecipients.length > 0 && (
            <div className="mm-info-banner" style={{ marginBottom: "12px", padding: "10px 16px", background: "#e8f5fb", borderRadius: "8px", fontSize: "13px", color: "#4aa3c7" }}>
              <i className="fa-solid fa-users" /> {savedSelectedRecipients.length} destinataire(s) sélectionné(s)
            </div>
          )}

          <div className="ce-body">
            <div className="ce-panel">
              <div className="ce-field">
                <label className="ce-lbl">De</label>
                <div className="ce-from-box">
                  <div className="ce-avatar-sm">{userInitial}</div>
                  <div>
                    <div className="ce-from-name">{userNom}</div>
                    <div className="ce-from-mail">{userEmail}</div>
                  </div>
                </div>
              </div>

              <div className="ce-field">
                <label className="ce-lbl">Méthode d'envoi <span className="ce-req">*</span></label>
                <select
                  className="ce-select"
                  value={form.send_mode}
                  onChange={(e) => { 
                    setForm({ ...form, send_mode: e.target.value, email_direct: "", groupe: "", formations_cibles: [], statuts_prospects: [] });
                    setSavedSelectedRecipients([]);
                  }}
                >
                  <option value="segment">À un segment de contacts</option>
                  <option value="direct">À une adresse e-mail directe</option>
                </select>
              </div>

              {form.send_mode === "direct" && (
                <div className="ce-field">
                  <label className="ce-lbl">Adresse e-mail <span className="ce-req">*</span></label>
                  <input className="ce-input" type="email" placeholder="exemple@email.com" value={form.email_direct} onChange={(e) => setForm({ ...form, email_direct: e.target.value })} />
                </div>
              )}

              {form.send_mode === "segment" && (
                <div className="ce-field">
                  <label className="ce-lbl">Type de contact <span className="ce-req">*</span></label>
                  
                  {isProspectOnly ? (
                    <div className="ce-public-grid">
                      <label className="ce-public-card ce-public-on" style={{ borderColor: "#f59e0b", background: "#fffbeb" }}>
                        <input type="radio" name="pub" checked={true} readOnly />
                        <i className="fa-solid fa-user-plus ce-pub-icon" style={{ color: "#f59e0b" }} />
                        <span>Prospects</span>
                      </label>
                    </div>
                  ) : (
                    <div className="ce-public-grid">
                      {["Prospects", "Étudiants", "Diplômés"].map((g) => (
                        <label key={g} className={`ce-public-card ${form.groupe === g ? "ce-public-on" : ""}`}>
                          <input 
                            type="radio" 
                            name="pub" 
                            checked={form.groupe === g} 
                            onChange={() => { 
                              setForm({ ...form, groupe: g, formations_cibles: [], statuts_prospects: [] });
                              setSavedSelectedRecipients([]);
                            }} 
                          />
                          <i className={`fa-solid ${g === "Prospects" ? "fa-user-plus" : g === "Étudiants" ? "fa-user-graduate" : "fa-award"} ce-pub-icon`} style={{ color: groupeColor(g) }} />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {(form.groupe || isProspectOnly) && (
                    <div className="ce-subfilters">
                      <p className="ce-sub-title">
                        <i className="fa-solid fa-sliders" /> Affiner le public
                      </p>

                      {loadingFormations ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#94A3B8" }}>
                          <i className="fa-solid fa-spinner fa-spin" /> Chargement des formations...
                        </div>
                      ) : (
                        <ChipGroupFormations
                          items={formationsDisponibles}
                          selected={form.formations_cibles}
                          onChange={(v) => { 
                            setForm({ ...form, formations_cibles: v });
                            setSavedSelectedRecipients([]);
                          }}
                          title={
                            isProspectOnly ? "Formation souhaitée" :
                            form.groupe === "Prospects" ? "Formation souhaitée" : 
                            form.groupe === "Étudiants" ? "Formation suivie" : 
                            "Diplôme obtenu"
                          }
                        />
                      )}

                      {(form.groupe === "Prospects" || isProspectOnly) && (
                        statutsDisponibles.filter(s => s.nombre > 0).length > 0 ? (
                          <ChipGroupStatuts
                            items={statutsDisponibles}
                            selected={form.statuts_prospects}
                            onChange={(v) => { 
                              setForm({ ...form, statuts_prospects: v });
                              setSavedSelectedRecipients([]);
                            }}
                            title="Statut prospect"
                          />
                        ) : (
                          <div className="ce-sub-block">
                            <label className="ce-sub-lbl">Statut prospect</label>
                            <div style={{ padding: "12px", background: "#FEF2F2", borderRadius: "8px", color: "#EF4444", fontSize: "12px", textAlign: "center" }}>
                              <i className="fa-solid fa-info-circle" /> Aucun statut disponible pour cette formation
                            </div>
                          </div>
                        )
                      )}

                      <button className="ce-voir-liste-btn" onClick={voirDestinataires} disabled={loadingRecipients}>
                        {loadingRecipients
                          ? <><i className="fa-solid fa-spinner fa-spin" /> Chargement...</>
                          : <><i className="fa-solid fa-users" /> Voir la liste des destinataires</>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ce-preview">
              <div className="ce-preview-header">
                <span className="ce-preview-title">Aperçu de l'e-mail</span>
              </div>

              <div className="ce-preview-meta-box">
                {[
                  ["Envoyer à",    form.send_mode === "direct" ? (form.email_direct || "—") : (savedSelectedRecipients.length > 0 ? `${savedSelectedRecipients.length} contact(s) sélectionné(s)` : (isProspectOnly ? "Prospects" : (form.groupe || "—")))],
                  ["De",           `${userNom} (${userEmail})`],
                ].map(([k, v]) => (
                  <div key={k} className="ce-meta-row">
                    <span className="ce-meta-key">{k} :</span>
                    <span className="ce-meta-val">{v}</span>
                  </div>
                ))}
              </div>

              <div className="ce-email-card" style={{ marginTop: "16px" }}>
                <div className="ce-email-top">
                  <div className="ce-email-brand">CRM</div>
                </div>
                <div style={{ padding: "16px 24px 0 24px", borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px" }}>Objet :</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#1E293B", marginBottom: "8px" }}>{form.objet || "—"}</div>
                  {form.apercu && <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "12px" }}>Aperçu : {form.apercu}</div>}
                </div>
                {form.message
                  ? <div className="ce-email-body" style={{ whiteSpace: "pre-wrap" }}>{form.message}</div>
                  : <div className="ce-email-drop"><i className="fa-regular fa-envelope" /><p>Écrivez votre message ici</p></div>}
                {form.fichier && (
                  <div className="ce-attach-preview">
                    <i className="fa-solid fa-paperclip" /> {form.fichier.name}
                  </div>
                )}
                <div className="ce-email-footer">
                  <a href="#">Se désabonner</a> · <a href="#">Gérer les préférences</a>
                </div>
              </div>

              <div style={{ margin: "16px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="ce-lbl">Ligne d'objet <span className="ce-req">*</span></label>
                  <input className="ce-input" placeholder="Objet de votre e-mail..." value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} />
                </div>
                <div>
                  <label className="ce-lbl">Texte d'aperçu</label>
                  <input className="ce-input" placeholder="Court texte visible dans la boîte de réception..." value={form.apercu} onChange={(e) => setForm({ ...form, apercu: e.target.value })} />
                </div>
                <div>
                  <label className="ce-lbl">Corps du message <span className="ce-req">*</span></label>
                  <textarea className="ce-textarea" rows={8} placeholder={"Bonjour,\n\nVotre message ici..."} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <div>
                  <label className="ce-lbl">Pièce jointe</label>
                  <label className="ce-file-lbl" style={{ display: "inline-flex", width: "auto" }}>
                    <input type="file" style={{ display: "none" }} onChange={(e) => setForm({ ...form, fichier: e.target.files[0] || null })} />
                    <i className="fa-solid fa-paperclip" /> {form.fichier ? form.fichier.name : "Joindre un fichier"}
                  </label>
                  {form.fichier && (
                    <button onClick={() => setForm({ ...form, fichier: null })} style={{ marginLeft: "10px", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "12px" }}>
                      <i className="fa-solid fa-xmark" /> Retirer
                    </button>
                  )}
                </div>
              </div>

              <div style={{ margin: "0 24px 24px 24px", display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid #E2E8F0", paddingTop: "20px" }}>
                <button className="ce-btn-ghost" onClick={() => { setView("liste"); setError(""); setIsProspectOnly(false); setSavedSelectedRecipients([]); }}>Annuler</button>
                <button className="ce-btn-send" onClick={handleEnvoyer} disabled={sending || (form.send_mode === "segment" && savedSelectedRecipients.length === 0)}>
                  {sending
                    ? <><i className="fa-solid fa-spinner fa-spin" /> Envoi en cours...</>
                    : <><i className="fa-solid fa-paper-plane" /> Envoyer {form.send_mode === "segment" && savedSelectedRecipients.length > 0 ? `(${savedSelectedRecipients.length})` : ""}</>}
                </button>
              </div>
            </div>
          </div>

          {showRecipients && (
            <RecipientsModal
              destinataires={recipientsList}
              onClose={() => setShowRecipients(false)}
              onSave={handleSaveRecipientsSelection}
              savedSelections={savedSelectedRecipients}
            />
          )}
        </div>
      </Layout>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  VUE LISTE
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Layout>
      <div className="mm-page">

        <div className="mm-header">
          <div>
            <h1 className="mm-title">
              <i className="fa-solid fa-envelope mm-icon" /> Marketing Mail
            </h1>
            <p className="mm-sub">Gérez et envoyez vos campagnes email</p>
          </div>
          <button className="mm-create-btn" onClick={() => { setView("templates"); setError(""); }}>
            <i className="fa-solid fa-plus" /> Créer un e-mail
          </button>
        </div>

        {error && (
          <div className="mm-error-banner" style={{ marginBottom: "12px" }}>
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        <div className="mm-card">

          <div className="mm-tabs">
            {TABS.map((tab) => (
              <button key={tab.id} className={`mm-tab ${activeTab === tab.id ? "mm-tab-on" : ""}`} onClick={() => switchTab(tab.id)}>
                {tab.id !== "tous" && tab.id !== "archive" && tab.id !== "direct" && <span className="mm-tab-dot" style={{ background: groupeColor(tab.id) }} />}
                {tab.id === "direct" && <i className="fa-solid fa-at" style={{ fontSize: 9, color: "#4aa3c7", marginRight: "4px" }} />}
                {tab.id === "archive" && <i className="fa-regular fa-circle" style={{ fontSize: 9, color: "#94A3B8" }} />}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mm-toolbar">
            <div className="mm-toolbar-l">
              <div className="mm-search">
                <i className="fa-solid fa-magnifying-glass mm-search-ic" />
                <input className="mm-search-input" placeholder="Rechercher par objet ou expéditeur..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              </div>
              <DateFilter dateValue={dateFilter} setDateValue={setDateFilter} />
            </div>
            {/* Bouton Supprimer uniquement pour l'onglet Archivé */}
            {selected.length > 0 && activeTab === "archive" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="mm-delete-btn" onClick={() => setShowDeleteModal(true)} style={{ background: "#EF4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
                  <i className="fa-solid fa-trash-can" /> Supprimer ({selected.length})
                </button>
              </div>
            )}
            {/* Boutons Archiver et Supprimer pour les autres onglets */}
            {selected.length > 0 && activeTab !== "archive" && activeTab !== "direct" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="mm-archive-btn" onClick={() => setShowArchiveModal(true)}>
                  <i className="fa-solid fa-box-archive" /> Archiver ({selected.length})
                </button>
                <button className="mm-delete-btn" onClick={() => setShowDeleteModal(true)} style={{ background: "#EF4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
                  <i className="fa-solid fa-trash-can" /> Supprimer ({selected.length})
                </button>
              </div>
            )}
            {/* Bouton Supprimer pour l'onglet "Une seule adresse" */}
            {selected.length > 0 && activeTab === "direct" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="mm-delete-btn" onClick={() => setShowDeleteModal(true)} style={{ background: "#EF4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
                  <i className="fa-solid fa-trash-can" /> Supprimer ({selected.length})
                </button>
              </div>
            )}
          </div>

          <div className="mm-table-wrap">
            {loading ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "28px" }} />
              </div>
            ) : (
              <table className="mm-table">
                <thead>
                  <tr>
                  {/* Checkbox toujours visible pour tous les onglets */}
                  <th className="mm-th-cb">
                    <span className={`mm-cb ${allSelected ? "mm-cb-on" : ""}`} onClick={() => setSelected(allSelected ? [] : paginatedEmails.map((e) => e.id))}>
                      {allSelected && <i className="fa-solid fa-check" />}
                    </span>
                  </th>
                  <th>Nom de l'e-mail</th>
                  <th>Envoyé par</th>
                  <th>Groupe cible</th>
                  <th>Destinataires</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmails.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="mm-empty">
                      <i className="fa-regular fa-folder-open" />
                      <p>Aucun e-mail trouvé</p>
                    </td>
                  </tr>
                ) : paginatedEmails.map((email) => (
                  <tr key={email.id} className={selected.includes(email.id) ? "mm-tr-sel" : ""}>
                    <td className="mm-td-cb">
                      <span className={`mm-cb ${selected.includes(email.id) ? "mm-cb-on" : ""}`} onClick={() => toggleSelect(email.id)}>
                        {selected.includes(email.id) && <i className="fa-solid fa-check" />}
                      </span>
                    </td>
                    <td>
                      <span className="mm-email-name">
                        <span className="mm-email-dot" />
                        {email.objet}
                      </span>
                    </td>
                    <td className="mm-td-gray">{email.envoye_par_email}</td>
                    <td>
                      {email.email_direct ? (
                        <span className="mm-badge" style={{ background: "#e8f5fb", color: "#4aa3c7", borderColor: "#4aa3c7" }}>
                          <i className="fa-solid fa-at" style={{ marginRight: "4px" }} /> Envoi direct
                        </span>
                      ) : (
                        <span className="mm-badge" data-g={email.groupe}>{email.groupe_display}</span>
                      )}
                    </td>
                    <td className="mm-td-num">{(email.nombre_destinataires || 0).toLocaleString()}</td>
                    <td className="mm-td-gray">{email.date}</td>
                    <td>
                      <button className="mm-voir-btn" onClick={() => setDetailEmailId(email.id)}>
                        <i className="fa-solid fa-eye" /> Voir détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "16px 20px", borderTop: "1px solid #F1F5F9" }}>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="mm-page-btn" style={{ opacity: currentPage === 1 ? 0.4 : 1 }}>
              <i className="fa-solid fa-chevron-left" />
            </button>
            <span style={{ fontSize: "13px", color: "#64748B" }}>Page {currentPage} sur {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="mm-page-btn" style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}>
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        )}
      </div>

      {/* Modal archivage */}
      {showArchiveModal && (
        <div className="mm-overlay">
          <div className="mm-modal">
            <div className="mm-modal-ico"><i className="fa-solid fa-box-archive" /></div>
            <h3>Archiver {selected.length} e-mail(s) ?</h3>
            <p>Ces e-mails seront déplacés dans l'onglet Archivé.</p>
            <div className="mm-modal-btns">
              <button className="mm-btn-cancel" onClick={() => setShowArchiveModal(false)}>Annuler</button>
              <button className="mm-btn-ok" onClick={handleArchive}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <ConfirmActionModal
          title="Supprimer définitivement"
          message={`Êtes-vous sûr de vouloir supprimer ${selected.length} e-mail(s) ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {/* Modal détail */}
      {detailEmailId && (
        <EmailDetailModal emailId={detailEmailId} onClose={() => setDetailEmailId(null)} />
      )}
    </div>
  </Layout>
);
}