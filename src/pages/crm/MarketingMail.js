import React, { useState, useRef, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import "../../styles/crm/MarketingMail.css";
import authService from "../../services/auth/authService";
import api from "../../services/api";
import {
  fetchEmails,
  envoyerEmail,
  archiverEmails,
  estimerDestinataires,
} from "../../services/crm/Marketingservice";

// Statuts et sources (valeurs backend)
const STATUTS_PROSPECT = [
  { label: "Nouveau",       value: "nouveau" },
  { label: "Contacté",      value: "contacte" },
  { label: "Intéressé",     value: "interesse" },
  { label: "Converti",      value: "converti" },
  { label: "Perdu",         value: "perdu" },
];

const SOURCES_PROSPECT = [
  { label: "Facebook",       value: "facebook" },
  { label: "Instagram",      value: "instagram" },
  { label: "TikTok",         value: "tiktok" },
  { label: "LinkedIn",       value: "linkedin" },
  { label: "Google",         value: "google" },
  { label: "Site web",       value: "site_web" },
  { label: "Recommandation", value: "recommandation" },
  { label: "Appel entrant",  value: "appel_entrant" },
  { label: "Autre",          value: "autre" },
];

const TABS = [
  { id: "tous",      label: "Tous les e-mails" },
  { id: "Prospects", label: "Prospects" },
  { id: "Étudiants", label: "Étudiants" },
  { id: "Diplômés",  label: "Diplômés" },
  { id: "archive",   label: "Archivé" },
];

// ─── Chip avec recherche (CORRIGÉ) ─────────────────────────────────────────
function ChipGroupWithSearch({ items, selected, onChange, title, labelKey = "label", valueKey = "value" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = searchTerm
    ? items.filter((i) => i[labelKey].toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  const toggle = (val) => {
    // S'assurer que la valeur est un nombre
    const numericVal = typeof val === 'string' ? Number(val) : val;
    if (selected.includes(numericVal)) {
      onChange(selected.filter((x) => x !== numericVal));
    } else {
      onChange([...selected, numericVal]);
    }
  };

  return React.createElement("div", { className: "ce-sub-block" },
    React.createElement("label", { className: "ce-sub-lbl" }, title),
    React.createElement("div", { style: { marginBottom: "8px", position: "relative" } },
      React.createElement("i", { className: "fa-solid fa-magnifying-glass", style: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#94A3B8" } }),
      React.createElement("input", {
        type: "text",
        placeholder: `Rechercher ${title.toLowerCase()}...`,
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value),
        style: { width: "100%", padding: "6px 10px 6px 28px", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "11px", outline: "none" }
      })
    ),
    React.createElement("div", { className: "ce-chips-scroll" },
      items.length === 0
        ? React.createElement("div", { style: { padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" } }, "Chargement...")
        : filtered.length === 0
          ? React.createElement("div", { style: { padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" } }, "Aucun résultat")
          : filtered.map((item) => {
              const itemValue = typeof item[valueKey] === 'string' ? Number(item[valueKey]) : item[valueKey];
              return React.createElement("label", { key: itemValue, className: `ce-chip ${selected.includes(itemValue) ? "ce-chip-on" : ""}` },
                React.createElement("input", { type: "checkbox", checked: selected.includes(itemValue), onChange: () => toggle(itemValue) }),
                item[labelKey]
              );
            })
    )
  );
}

// ─── Chip simple ─────────────────────────────────────────────────────────────
function ChipGroupSimple({ items, selected, onChange, title, labelKey = "label", valueKey = "value" }) {
  const toggle = (val) => {
    const numericVal = typeof val === 'string' ? Number(val) : val;
    onChange(selected.includes(numericVal) ? selected.filter((x) => x !== numericVal) : [...selected, numericVal]);
  };

  return React.createElement("div", { className: "ce-sub-block" },
    React.createElement("label", { className: "ce-sub-lbl" }, title),
    React.createElement("div", { className: "ce-chips-scroll" },
      items.map((item) => {
        const itemValue = typeof item[valueKey] === 'string' ? item[valueKey] : item[valueKey];
        return React.createElement("label", { key: itemValue, className: `ce-chip ${selected.includes(itemValue) ? "ce-chip-on" : ""}` },
          React.createElement("input", { type: "checkbox", checked: selected.includes(itemValue), onChange: () => toggle(itemValue) }),
          item[labelKey]
        );
      })
    )
  );
}

// ─── Dropdown avec recherche ──────────────────────────────────────────────────
function FilterDropdown({ label, items, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = items.filter((i) => i.toLowerCase().includes(search.toLowerCase()));
  const toggle = (item) => onChange(selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item]);

  return React.createElement("div", { className: "fd-wrap", ref },
    React.createElement("button", { className: `fd-trigger ${selected.length ? "fd-active" : ""}`, onClick: () => setOpen(!open) },
      React.createElement("i", { className: `fa-solid fa-chevron-down fd-arrow ${open ? "up" : ""}` }),
      React.createElement("span", null, label),
      selected.length > 0 && React.createElement("span", { className: "fd-count" }, selected.length),
      selected.length > 0 && React.createElement("span", { className: "fd-x", onClick: (e) => { e.stopPropagation(); onChange([]); } },
        React.createElement("i", { className: "fa-solid fa-xmark" })
      )
    ),
    open && React.createElement("div", { className: "fd-dropdown" },
      React.createElement("div", { className: "fd-search-row" },
        React.createElement("i", { className: "fa-solid fa-magnifying-glass" }),
        React.createElement("input", { className: "fd-search-input", autoFocus: true, placeholder: "Rechercher...", value: search, onChange: (e) => setSearch(e.target.value) })
      ),
      React.createElement("div", { className: "fd-list" },
        filtered.length === 0
          ? React.createElement("div", { className: "fd-no-result" }, "Aucun résultat")
          : filtered.map((item) =>
              React.createElement("label", { key: item, className: `fd-item ${selected.includes(item) ? "fd-item-on" : ""}`, onClick: () => toggle(item) },
                React.createElement("span", { className: `fd-cb ${selected.includes(item) ? "fd-cb-on" : ""}` },
                  selected.includes(item) && React.createElement("i", { className: "fa-solid fa-check" })
                ),
                item
              )
            )
      ),
      selected.length > 0 && React.createElement("div", { className: "fd-foot" },
        React.createElement("button", { className: "fd-reset-btn", onClick: () => onChange([]) }, "Réinitialiser"),
        React.createElement("button", { className: "fd-apply-btn", onClick: () => setOpen(false) }, "Appliquer")
      )
    )
  );
}

// ─── Filtre Date ──────────────────────────────────────────────────────────────
function DateFilter({ dateDebut, dateFin, setDateDebut, setDateFin }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const hasFilter = dateDebut || dateFin;
  const reset = () => { setDateDebut(""); setDateFin(""); setOpen(false); };

  return React.createElement("div", { className: "fd-wrap", ref },
    React.createElement("button", { className: `fd-trigger ${hasFilter ? "fd-active" : ""}`, onClick: () => setOpen(!open) },
      React.createElement("i", { className: "fa-regular fa-calendar" }),
      React.createElement("span", null, "Date"),
      hasFilter && React.createElement("span", { className: "fd-count" }, "1"),
      hasFilter && React.createElement("span", { className: "fd-x", onClick: (e) => { e.stopPropagation(); reset(); } },
        React.createElement("i", { className: "fa-solid fa-xmark" })
      )
    ),
    open && React.createElement("div", { className: "fd-dropdown", style: { width: "260px" } },
      React.createElement("div", { style: { padding: "12px" } },
        React.createElement("div", { style: { marginBottom: "10px" } },
          React.createElement("label", { style: { fontSize: "11px", color: "#64748B", display: "block", marginBottom: "4px" } }, "Date de début"),
          React.createElement("input", { type: "date", className: "fd-search-input", value: dateDebut, onChange: (e) => setDateDebut(e.target.value), style: { width: "100%" } })
        ),
        React.createElement("div", { style: { marginBottom: "12px" } },
          React.createElement("label", { style: { fontSize: "11px", color: "#64748B", display: "block", marginBottom: "4px" } }, "Date de fin"),
          React.createElement("input", { type: "date", className: "fd-search-input", value: dateFin, onChange: (e) => setDateFin(e.target.value), style: { width: "100%" } })
        ),
        React.createElement("div", { className: "fd-foot", style: { padding: "8px 0 0 0" } },
          React.createElement("button", { className: "fd-reset-btn", onClick: reset }, "Réinitialiser"),
          React.createElement("button", { className: "fd-apply-btn", onClick: () => setOpen(false) }, "Appliquer")
        )
      )
    )
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function MarketingMail() {

  // ── Utilisateur connecté ──────────────────────────────────────────────────
  const currentUser = authService.getCurrentUser();
  const userNom     = currentUser
    ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() || currentUser.username || "Utilisateur"
    : "Utilisateur";
  const userEmail   = currentUser?.email || "";
  const userInitial = userNom.charAt(0).toUpperCase();

  // ── États ─────────────────────────────────────────────────────────────────
  const [view, setView]               = useState("liste");
  const [activeTab, setActiveTab]     = useState("tous");
  const [emails, setEmails]           = useState([]);
  const [formations, setFormations]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState("");

  const [selected, setSelected]       = useState([]);
  const [showModal, setShowModal]     = useState(false);

  const [searchText, setSearchText]   = useState("");
  const [fFormation, setFFormation]   = useState([]);
  const [fStatut, setFStatut]         = useState([]);
  const [fReseau, setFReseau]         = useState([]);
  const [dateDebut, setDateDebut]     = useState("");
  const [dateFin, setDateFin]         = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [form, setForm] = useState({
    send_mode:         "segment",
    email_direct:      "",
    groupe:            "",
    formations_cibles: [],
    statuts_prospects: [],
    sources_prospects: [],
    objet:             "",
    apercu:            "",
    message:           "",
    fichier:           null,
  });
  const [compteur, setCompteur]               = useState(null);
  const [loadingCompteur, setLoadingCompteur] = useState(false);

  // ── Chargement des formations selon le type de groupe ─────────────────────
  const fetchFormationsByType = useCallback(async (groupe) => {
    if (!groupe) return;
    
    setLoading(true);
    try {
      let type = '';
      if (groupe === 'Prospects') type = 'prospects';
      else if (groupe === 'Étudiants') type = 'etudiants';
      else if (groupe === 'Diplômés') type = 'diplomes';
      else return;
      
      const response = await api.get(`marketing-mail/formations/${type}/`);
      setFormations(response.data);
    } catch (error) {
      console.error('Erreur chargement formations:', error);
      setFormations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Chargement des emails ─────────────────────────────────────────────────
  const chargerEmails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const isArchive = activeTab === "archive";
      const groupe = ["Prospects", "Étudiants", "Diplômés"].includes(activeTab) ? activeTab : "";
      
      const data = await fetchEmails({
        archive: isArchive,
        groupe,
        search: searchText,
        date_debut: dateDebut,
        date_fin: dateFin,
      });
      
      setEmails(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Erreur chargement emails:", error);
      setError("Impossible de charger les emails.");
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchText, dateDebut, dateFin]);

  useEffect(() => { chargerEmails(); }, [chargerEmails]);

  // Charger les formations quand le groupe change
  useEffect(() => {
    if (form.groupe) {
      fetchFormationsByType(form.groupe);
    } else {
      setFormations([]);
    }
  }, [form.groupe, fetchFormationsByType]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages      = Math.ceil(emails.length / itemsPerPage);
  const paginatedEmails = emails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const allSelected     = paginatedEmails.length > 0 && paginatedEmails.every((e) => selected.includes(e.id));

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setSelected([]);
    setCurrentPage(1);
    setSearchText("");
    setFFormation([]);
    setFStatut([]);
    setFReseau([]);
    setDateDebut("");
    setDateFin("");
  };

  // ── Archivage ─────────────────────────────────────────────────────────────
  const handleArchive = async () => {
    try {
      await archiverEmails(selected);
      setSelected([]);
      setShowModal(false);
      chargerEmails();
    } catch {
      setError("Erreur lors de l'archivage.");
    }
  };

  // ── Estimation (CORRIGÉE) ─────────────────────────────────────────────────
  const calculerCompteur = async () => {
    if (!form.groupe) {
      setError("Veuillez d'abord sélectionner un public.");
      return;
    }
    
    setLoadingCompteur(true);
    setCompteur(null);
    setError("");
    
    try {
      // S'assurer que les IDs sont des nombres
      const formationsIds = form.formations_cibles.map(id => Number(id));
      
      const payload = {
        groupe: form.groupe,
        formations_cibles: formationsIds,
        statuts_prospects: form.statuts_prospects || [],
        sources_prospects: form.sources_prospects || [],
      };
      
      console.log("Payload pour estimation:", payload);
      
      const res = await estimerDestinataires(payload);
      
      if (res && typeof res.nombre !== 'undefined') {
        setCompteur(res.nombre);
        if (res.nombre === 0) {
          setError("Aucun destinataire trouvé avec ces critères.");
        }
      } else {
        setCompteur(0);
        setError("Impossible d'estimer le nombre de destinataires.");
      }
    } catch (error) {
      console.error("Erreur estimation:", error);
      setCompteur(0);
      if (error?.response?.data) {
        setError(JSON.stringify(error.response.data));
      } else {
        setError("Erreur lors de l'estimation.");
      }
    } finally {
      setLoadingCompteur(false);
    }
  };

  // ── Envoi (CORRIGÉ) ───────────────────────────────────────────────────────
  const handleEnvoyer = async () => {
    if (!form.objet.trim())   { setError("L'objet est obligatoire.");   return; }
    if (!form.message.trim()) { setError("Le message est obligatoire."); return; }
    if (form.send_mode === "direct" && !form.email_direct.trim()) {
      setError("L'adresse email est obligatoire."); return;
    }
    if (form.send_mode === "segment" && !form.groupe) {
      setError("Veuillez choisir un groupe cible."); return;
    }

    setSending(true);
    setError("");
    
    try {
      // Préparer les données correctement
      const formDataToSend = new FormData();
      
      formDataToSend.append('send_mode', form.send_mode);
      formDataToSend.append('objet', form.objet);
      formDataToSend.append('apercu', form.apercu || '');
      formDataToSend.append('message', form.message);
      
      if (form.send_mode === 'direct') {
        formDataToSend.append('email_direct', form.email_direct);
      } else {
        formDataToSend.append('groupe', form.groupe);
        
        // S'assurer que formations_cibles est une liste d'IDs (entiers)
        const formationsIds = form.formations_cibles.map(id => Number(id));
        formDataToSend.append('formations_cibles', JSON.stringify(formationsIds));
        
        formDataToSend.append('statuts_prospects', JSON.stringify(form.statuts_prospects || []));
        formDataToSend.append('sources_prospects', JSON.stringify(form.sources_prospects || []));
      }
      
      if (form.fichier) {
        formDataToSend.append('fichier', form.fichier);
      }
      
      console.log("Envoi du formulaire avec:", Object.fromEntries(formDataToSend));
      
      const res = await envoyerEmail(formDataToSend);
      alert(res.message || "Email envoyé avec succès !");
      
      // Reset du formulaire
      setForm({
        send_mode: "segment", 
        email_direct: "", 
        groupe: "",
        formations_cibles: [], 
        statuts_prospects: [], 
        sources_prospects: [],
        objet: "", 
        apercu: "", 
        message: "", 
        fichier: null,
      });
      setCompteur(null);
      setView("liste");
      await chargerEmails();
    } catch (err) {
      console.error("Erreur complète:", err);
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const firstError = Object.values(data)[0];
          setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          setError(String(data));
        }
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'envoi. Vérifiez la console.");
      }
    } finally {
      setSending(false);
    }
  };

  // Formations pour les chips
  const formationsChips = formations.map((f) => ({ label: f.intitule, value: f.id }));
  const formationLabels = formations.map((f) => f.intitule);

  // ════════════════════════════════════════════════════════════════════════════
  //  VUE CRÉER
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "creer") {
    return React.createElement(Layout, null,
      React.createElement("div", { className: "ce-page" },

        React.createElement("div", { className: "ce-topbar" },
          React.createElement("button", { className: "ce-back-btn", onClick: () => { setView("liste"); setError(""); } },
            React.createElement("i", { className: "fa-solid fa-arrow-left" }), " Retour"
          ),
          React.createElement("h2", { className: "ce-topbar-title" }, "Nouvel e-mail")
        ),

        error && React.createElement("div", { style: { margin: "0 24px 12px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "#DC2626", fontSize: "13px" } },
          React.createElement("i", { className: "fa-solid fa-circle-exclamation", style: { marginRight: "8px" } }), error
        ),

        React.createElement("div", { className: "ce-body" },

          React.createElement("div", { className: "ce-panel" },

            React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "De"),
              React.createElement("div", { className: "ce-from-box" },
                React.createElement("div", { className: "ce-avatar-sm" }, userInitial),
                React.createElement("div", null,
                  React.createElement("div", { className: "ce-from-name" }, userNom),
                  React.createElement("div", { className: "ce-from-mail" }, userEmail)
                )
              )
            ),

            React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "Méthode d'envoi ", React.createElement("span", { className: "ce-req" }, "*")),
              React.createElement("select", {
                className: "ce-select",
                value: form.send_mode,
                onChange: (e) => setForm({ ...form, send_mode: e.target.value, email_direct: "", groupe: "", formations_cibles: [], statuts_prospects: [], sources_prospects: [] })
              },
                React.createElement("option", { value: "segment" }, "À un segment de contacts"),
                React.createElement("option", { value: "direct" },  "À une adresse e-mail directe")
              )
            ),

            form.send_mode === "direct" && React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "Adresse e-mail ", React.createElement("span", { className: "ce-req" }, "*")),
              React.createElement("input", {
                className: "ce-input", type: "email", placeholder: "exemple@email.com",
                value: form.email_direct,
                onChange: (e) => setForm({ ...form, email_direct: e.target.value })
              })
            ),

            form.send_mode === "segment" && React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "Public ", React.createElement("span", { className: "ce-req" }, "*")),
              React.createElement("div", { className: "ce-public-grid" },
                ["Prospects", "Étudiants", "Diplômés"].map((g) =>
                  React.createElement("label", { key: g, className: `ce-public-card ${form.groupe === g ? "ce-public-on" : ""}` },
                    React.createElement("input", { type: "radio", name: "pub", checked: form.groupe === g, onChange: () => setForm({ ...form, groupe: g, formations_cibles: [], statuts_prospects: [], sources_prospects: [] }) }),
                    React.createElement("i", { className: `fa-solid ${g === "Prospects" ? "fa-user-plus" : g === "Étudiants" ? "fa-user-graduate" : "fa-award"} ce-pub-icon` }),
                    React.createElement("span", null, g)
                  )
                )
              ),

              form.groupe && React.createElement("div", { className: "ce-subfilters" },
                React.createElement("p", { className: "ce-sub-title" },
                  React.createElement("i", { className: "fa-solid fa-sliders" }), " Affiner le public"
                ),

                React.createElement(ChipGroupWithSearch, {
                  items:    formationsChips,
                  selected: form.formations_cibles,
                  onChange: (v) => setForm({ ...form, formations_cibles: v }),
                  title:    "Formation",
                  labelKey: "label",
                  valueKey: "value",
                }),

                form.groupe === "Prospects" && React.createElement(React.Fragment, null,
                  React.createElement(ChipGroupSimple, {
                    items:    STATUTS_PROSPECT,
                    selected: form.statuts_prospects,
                    onChange: (v) => setForm({ ...form, statuts_prospects: v }),
                    title:    "Statut prospect",
                  }),
                  React.createElement(ChipGroupSimple, {
                    items:    SOURCES_PROSPECT,
                    selected: form.sources_prospects,
                    onChange: (v) => setForm({ ...form, sources_prospects: v }),
                    title:    "Source / Réseau social",
                  })
                ),

                React.createElement("button", { className: "ce-calc-btn", onClick: calculerCompteur, disabled: loadingCompteur },
                  loadingCompteur
                    ? React.createElement(React.Fragment, null, React.createElement("i", { className: "fa-solid fa-spinner fa-spin" }), " Calcul en cours...")
                    : React.createElement(React.Fragment, null, React.createElement("i", { className: "fa-solid fa-calculator" }), " Estimer les destinataires")
                ),

                compteur !== null && React.createElement("div", { 
                  className: `ce-compteur-box`,
                  style: { 
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: compteur === 0 ? "#FEF2F2" : "#F0FDF4",
                    border: `1px solid ${compteur === 0 ? "#FECACA" : "#BBF7D0"}`,
                    color: compteur === 0 ? "#DC2626" : "#166534"
                  }
                },
                  React.createElement("i", { 
                    className: compteur === 0 ? "fa-solid fa-circle-exclamation" : "fa-solid fa-inbox",
                    style: { marginRight: "8px" }
                  }),
                  React.createElement("span", null, 
                    "Destinataires estimés : ",
                    React.createElement("strong", null, compteur.toLocaleString()),
                    " contact" + (compteur > 1 ? "s" : ""),
                    compteur === 0 && React.createElement("span", { style: { display: "block", fontSize: "12px", marginTop: "4px" } },
                      " Aucun contact ne correspond à ces critères."
                    )
                  )
                )
              )
            )
          ),

          React.createElement("div", { className: "ce-preview" },
            React.createElement("div", { className: "ce-preview-header" },
              React.createElement("span", { className: "ce-preview-title" }, "Aperçu de l'e-mail")
            ),

            React.createElement("div", { className: "ce-preview-meta-box" },
              [
                ["Envoyer à",      form.send_mode === "direct" ? (form.email_direct || "—") : (form.groupe || "—")],
                ["Ne pas envoyer à", "—"],
                ["De",             `${userNom} (${userEmail})`],
              ].map(([k, v]) =>
                React.createElement("div", { key: k, className: "ce-meta-row" },
                  React.createElement("span", { className: "ce-meta-key" }, k, " :"),
                  React.createElement("span", { className: "ce-meta-val" }, v)
                )
              )
            ),

            React.createElement("div", { className: "ce-email-card", style: { marginTop: "16px" } },
              React.createElement("div", { className: "ce-email-top" },
                React.createElement("div", { className: "ce-email-brand" }, "CRM")
              ),
              React.createElement("div", { style: { padding: "16px 24px 0 24px", borderBottom: "1px solid #F1F5F9" } },
                React.createElement("div", { style: { fontSize: "11px", color: "#94A3B8", marginBottom: "4px" } }, "Objet :"),
                React.createElement("div", { style: { fontSize: "16px", fontWeight: "600", color: "#1E293B", marginBottom: "8px" } }, form.objet || "—"),
                form.apercu && React.createElement("div", { style: { fontSize: "12px", color: "#64748B", marginBottom: "12px" } }, "📎 Aperçu : ", form.apercu)
              ),
              form.message
                ? React.createElement("div", { className: "ce-email-body", style: { whiteSpace: "pre-wrap" } }, form.message)
                : React.createElement("div", { className: "ce-email-drop" },
                    React.createElement("i", { className: "fa-regular fa-envelope" }),
                    React.createElement("p", null, "Écrivez votre message ici")
                  ),
              form.fichier && React.createElement("div", { className: "ce-attach-preview" },
                React.createElement("i", { className: "fa-solid fa-paperclip" }), " ", form.fichier.name
              ),
              React.createElement("div", { className: "ce-email-footer" },
                React.createElement("a", { href: "#" }, "Se désabonner"), "  ·  ",
                React.createElement("a", { href: "#" }, "Gérer les préférences")
              )
            ),

            React.createElement("div", { style: { margin: "16px 24px", display: "flex", flexDirection: "column", gap: "16px" } },
              React.createElement("div", null,
                React.createElement("label", { className: "ce-lbl" }, "Ligne d'objet ", React.createElement("span", { className: "ce-req" }, "*")),
                React.createElement("input", { className: "ce-input", placeholder: "Objet de votre e-mail...", value: form.objet, onChange: (e) => setForm({ ...form, objet: e.target.value }) })
              ),
              React.createElement("div", null,
                React.createElement("label", { className: "ce-lbl" }, "Texte d'aperçu"),
                React.createElement("input", { className: "ce-input", placeholder: "Court texte visible dans la boîte de réception...", value: form.apercu, onChange: (e) => setForm({ ...form, apercu: e.target.value }) })
              ),
              React.createElement("div", null,
                React.createElement("label", { className: "ce-lbl" }, "Corps du message ", React.createElement("span", { className: "ce-req" }, "*")),
                React.createElement("textarea", { className: "ce-textarea", rows: 6, placeholder: "Bonjour,\n\nNous vous informons de...", value: form.message, onChange: (e) => setForm({ ...form, message: e.target.value }) })
              ),
              React.createElement("div", null,
                React.createElement("label", { className: "ce-lbl" }, "Pièce jointe"),
                React.createElement("label", { className: "ce-file-lbl", style: { display: "inline-flex", width: "auto" } },
                  React.createElement("input", { type: "file", style: { display: "none" }, onChange: (e) => setForm({ ...form, fichier: e.target.files[0] || null }) }),
                  React.createElement("i", { className: "fa-solid fa-paperclip" }), " ",
                  form.fichier ? form.fichier.name : "Joindre un fichier"
                )
              )
            ),

            React.createElement("div", { style: { margin: "0 24px 24px 24px", display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid #E2E8F0", paddingTop: "20px" } },
              React.createElement("button", { className: "ce-btn-ghost", onClick: () => { setView("liste"); setError(""); } }, "Annuler"),
              React.createElement("button", { className: "ce-btn-send", onClick: handleEnvoyer, disabled: sending },
                sending
                  ? React.createElement(React.Fragment, null, React.createElement("i", { className: "fa-solid fa-spinner fa-spin" }), " Envoi en cours...")
                  : React.createElement(React.Fragment, null, React.createElement("i", { className: "fa-solid fa-paper-plane" }), " Envoyer")
              )
            )
          )
        )
      )
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  VUE LISTE
  // ════════════════════════════════════════════════════════════════════════════
  return React.createElement(Layout, null,
    React.createElement("div", { className: "mm-page" },

      React.createElement("div", { className: "mm-header" },
        React.createElement("div", null,
          React.createElement("h1", { className: "mm-title" },
            React.createElement("i", { className: "fa-solid fa-envelope mm-icon" }), " Marketing Mail"
          ),
          React.createElement("p", { className: "mm-sub" }, "Gérez et envoyez vos campagnes email")
        ),
        React.createElement("button", { className: "mm-create-btn", onClick: () => { setView("creer"); setError(""); } },
          React.createElement("i", { className: "fa-solid fa-plus" }), " Créer un e-mail"
        )
      ),

      error && React.createElement("div", { style: { marginBottom: "12px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "#DC2626", fontSize: "13px" } }, error),

      React.createElement("div", { className: "mm-card" },

        React.createElement("div", { className: "mm-tabs" },
          TABS.map((tab) =>
            React.createElement("button", { key: tab.id, className: `mm-tab ${activeTab === tab.id ? "mm-tab-on" : ""}`, onClick: () => switchTab(tab.id) },
              tab.id !== "tous" && tab.id !== "archive" && React.createElement("span", { className: "mm-tab-dot", style: { background: tab.id === "Prospects" ? "#f59e0b" : tab.id === "Étudiants" ? "#22c55e" : "#6366f1" } }),
              tab.id === "archive" && React.createElement("i", { className: "fa-regular fa-circle", style: { fontSize: 9, color: "#94A3B8" } }),
              " ", tab.label
            )
          )
        ),

        React.createElement("div", { className: "mm-toolbar" },
          React.createElement("div", { className: "mm-toolbar-l" },
            React.createElement("div", { className: "mm-search" },
              React.createElement("i", { className: "fa-solid fa-magnifying-glass mm-search-ic" }),
              React.createElement("input", { className: "mm-search-input", placeholder: "Recherche de la ligne d'objet ou du nom de l'expéditeur...", value: searchText, onChange: (e) => setSearchText(e.target.value) })
            ),
            React.createElement(DateFilter, { dateDebut, dateFin, setDateDebut, setDateFin }),
            activeTab === "Prospects" && React.createElement(React.Fragment, null,
              React.createElement(FilterDropdown, { label: "Formation", items: formationLabels, selected: fFormation, onChange: setFFormation }),
              React.createElement(FilterDropdown, { label: "Statut",    items: STATUTS_PROSPECT.map((s) => s.label), selected: fStatut, onChange: setFStatut }),
              React.createElement(FilterDropdown, { label: "Source",    items: SOURCES_PROSPECT.map((s) => s.label), selected: fReseau, onChange: setFReseau })
            ),
            (activeTab === "Étudiants" || activeTab === "Diplômés") &&
              React.createElement(FilterDropdown, { label: "Formation", items: formationLabels, selected: fFormation, onChange: setFFormation })
          ),
          selected.length > 0 && activeTab !== "archive" && React.createElement("button", { className: "mm-archive-btn", onClick: () => setShowModal(true) },
            React.createElement("i", { className: "fa-solid fa-box-archive" }), " Archiver (", selected.length, ")"
          )
        ),

        React.createElement("div", { className: "mm-table-wrap" },
          loading
            ? React.createElement("div", { style: { padding: "40px", textAlign: "center", color: "#94A3B8" } },
                React.createElement("i", { className: "fa-solid fa-spinner fa-spin", style: { fontSize: "24px" } })
              )
            : React.createElement("table", { className: "mm-table" },
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    activeTab !== "archive" && React.createElement("th", { className: "mm-th-cb" },
                      React.createElement("span", { className: `mm-cb ${allSelected ? "mm-cb-on" : ""}`, onClick: () => setSelected(allSelected ? [] : paginatedEmails.map((e) => e.id)) },
                        allSelected && React.createElement("i", { className: "fa-solid fa-check" })
                      )
                    ),
                    React.createElement("th", null, "Nom de l'e-mail"),
                    React.createElement("th", null, "Envoyé par"),
                    React.createElement("th", null, "Groupe cible"),
                    React.createElement("th", null, "Destinataires"),
                    React.createElement("th", null, "Date")
                  )
                ),
                React.createElement("tbody", null,
                  paginatedEmails.length === 0
                    ? React.createElement("tr", null,
                        React.createElement("td", { colSpan: 6, className: "mm-empty" },
                          React.createElement("i", { className: "fa-regular fa-folder-open" }),
                          React.createElement("p", null, "Aucun e-mail trouvé")
                        )
                      )
                    : paginatedEmails.map((email) =>
                        React.createElement("tr", { key: email.id, className: selected.includes(email.id) ? "mm-tr-sel" : "" },
                          activeTab !== "archive" && React.createElement("td", { className: "mm-td-cb" },
                            React.createElement("span", { className: `mm-cb ${selected.includes(email.id) ? "mm-cb-on" : ""}`, onClick: () => toggleSelect(email.id) },
                              selected.includes(email.id) && React.createElement("i", { className: "fa-solid fa-check" })
                            )
                          ),
                          React.createElement("td", null, React.createElement("span", { className: "mm-email-name" }, React.createElement("span", { className: "mm-email-dot" }), email.objet)),
                          React.createElement("td", { className: "mm-td-gray" }, email.envoye_par_email),
                          React.createElement("td", null, React.createElement("span", { className: "mm-badge", "data-g": email.groupe }, email.groupe_display)),
                          React.createElement("td", { className: "mm-td-num" }, (email.nombre_destinataires || 0).toLocaleString()),
                          React.createElement("td", { className: "mm-td-gray" }, email.date)
                        )
                      )
                )
              )
        ),

        totalPages > 1 && React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "16px 20px", borderTop: "1px solid #F1F5F9" } },
          React.createElement("button", { onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, style: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1, color: "#64748B" } },
            React.createElement("i", { className: "fa-solid fa-chevron-left" })
          ),
          React.createElement("span", { style: { fontSize: "13px", color: "#64748B" } }, "Page ", currentPage, " sur ", totalPages),
          React.createElement("button", { onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, style: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", background: "white", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1, color: "#64748B" } },
            React.createElement("i", { className: "fa-solid fa-chevron-right" })
          )
        )
      ),

      showModal && React.createElement("div", { className: "mm-overlay" },
        React.createElement("div", { className: "mm-modal" },
          React.createElement("div", { className: "mm-modal-ico" }, React.createElement("i", { className: "fa-solid fa-box-archive" })),
          React.createElement("h3", null, "Archiver ", selected.length, " e-mail(s) ?"),
          React.createElement("p", null, "Ces e-mails seront déplacés dans l'onglet Archivé."),
          React.createElement("div", { className: "mm-modal-btns" },
            React.createElement("button", { className: "mm-btn-cancel", onClick: () => setShowModal(false) }, "Annuler"),
            React.createElement("button", { className: "mm-btn-ok", onClick: handleArchive }, "Confirmer")
          )
        )
      )
    )
  );
}