import React, { useState, useRef, useEffect } from "react";
import Layout from "../../components/Layout";
import "../../styles/crm/MarketingMail.css";

const FORMATIONS = ["Data Science", "Web Development", "Marketing Digital", "Cybersécurité", "Cloud Computing", "Intelligence Artificielle", "UX/UI Design", "Gestion de Projet"];
const STATUTS_PROSPECT = ["Nouveau", "Contacté", "Intéressé", "Converti", "Perdu"];
const RESEAUX = ["LinkedIn", "Facebook", "Instagram", "Twitter", "TikTok"];

// Génération de 25 emails mockés
const generateMockEmails = () => {
  const groupes = ["Prospects", "Étudiants", "Diplômés"];
  const sujets = {
    "Prospects": ["Promotion Formation IA", "Offre spéciale été", "Nouvelle formation Cloud", "Découvrez nos programmes", "Inscription early bird", "Webinaire gratuit", "Réduction exceptionnelle", "Formation en alternance"],
    "Étudiants": ["Nouveaux cours disponibles", "Webinaire Data Science", "Certification Cybersecurity", "Stage en entreprise", "Bibliothèque mise à jour", "Challenge étudiant", "Hackathon 2025", "Workshop gratuit"],
    "Diplômés": ["Félicitations diplômés 2024", "Réunion alumni", "Job Day 2025", "Offres d'emploi exclusives", "Networking event", "Formation continue", "Club alumni", "Mentorat"]
  };
  
  const emails = [];
  let id = 1;
  const startDate = new Date(2025, 4, 1);
  
  for (let i = 0; i < 25; i++) {
    const groupe = groupes[i % 3];
    const sujetList = sujets[groupe];
    const sujet = sujetList[i % sujetList.length] + (Math.floor(i / sujetList.length) > 0 ? ` ${Math.floor(i / sujetList.length) + 1}` : "");
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - i);
    const dateStr = date.toLocaleDateString("fr-FR");
    const nombre = Math.floor(Math.random() * 2000) + 100;
    
    emails.push({
      id: id++,
      objet: sujet,
      envoyePar: i % 2 === 0 ? "admin@crm.com" : "rh@crm.com",
      groupe: groupe,
      nombre: nombre,
      date: dateStr
    });
  }
  return emails;
};

const MOCK_EMAILS = generateMockEmails();

// Composant Chip avec recherche UNIQUEMENT pour les formations
function ChipGroupWithSearch({ items, selected, onChange, title, showSearch = true }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredItems = showSearch && searchTerm 
    ? items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;
  
  const toggle = (item) => {
    onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item]);
  };
  
  return React.createElement("div", { className: "ce-sub-block" },
    React.createElement("label", { className: "ce-sub-lbl" }, title),
    showSearch && React.createElement("div", { style: { marginBottom: "8px", position: "relative" } },
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
      filteredItems.length === 0 && React.createElement("div", { style: { padding: "8px", textAlign: "center", color: "#94A3B8", fontSize: "11px" } }, "Aucun résultat"),
      filteredItems.map((item) =>
        React.createElement("label", { key: item, className: `ce-chip ${selected.includes(item) ? "ce-chip-on" : ""}` },
          React.createElement("input", { type: "checkbox", checked: selected.includes(item), onChange: () => toggle(item) }),
          item
        )
      )
    )
  );
}

// Composant Chip simple sans recherche
function ChipGroupSimple({ items, selected, onChange, title }) {
  const toggle = (item) => {
    onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item]);
  };
  
  return React.createElement("div", { className: "ce-sub-block" },
    React.createElement("label", { className: "ce-sub-lbl" }, title),
    React.createElement("div", { className: "ce-chips-scroll" },
      items.map((item) =>
        React.createElement("label", { key: item, className: `ce-chip ${selected.includes(item) ? "ce-chip-on" : ""}` },
          React.createElement("input", { type: "checkbox", checked: selected.includes(item), onChange: () => toggle(item) }),
          item
        )
      )
    )
  );
}

/* ── Dropdown avec recherche + scroll ── */
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

  return React.createElement("div", { className: "fd-wrap", ref: ref },
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
        filtered.length === 0 && React.createElement("div", { className: "fd-no-result" }, "Aucun résultat"),
        filtered.map((item) =>
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

/* ── Filtre Date ── */
function DateFilter({ dateDebut, dateFin, setDateDebut, setDateFin }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const hasFilter = dateDebut || dateFin;

  const reset = () => {
    setDateDebut("");
    setDateFin("");
    setOpen(false);
  };

  return React.createElement("div", { className: "fd-wrap", ref: ref },
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

/* ══════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════ */
export default function MarketingMail() {
  const [view, setView] = useState("liste");
  const [activeTab, setActiveTab] = useState("tous");
  const [emails, setEmails] = useState(MOCK_EMAILS);
  const [archived, setArchived] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [fFormation, setFFormation] = useState([]);
  const [fStatut, setFStatut] = useState([]);
  const [fReseau, setFReseau] = useState([]);
  
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [form, setForm] = useState({
    objet: "", apercu: "", message: "", sendMode: "segment",
    emailDirect: "", groupes: [], statuts: [], formations: [], reseaux: [], fichier: null
  });
  const [compteur, setCompteur] = useState(null);

  const TABS = [
    { id: "tous", label: "Tous les e-mails" },
    { id: "Prospects", label: "Prospects" },
    { id: "Étudiants", label: "Étudiants" },
    { id: "Diplômés", label: "Diplômés" },
    { id: "archivé", label: "Archivé" },
  ];

  const toggleArr = (arr, v) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const parseFrenchDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const filterByDate = (list) => {
    if (!dateDebut && !dateFin) return list;
    return list.filter((email) => {
      const emailDate = parseFrenchDate(email.date);
      if (dateDebut && parseFrenchDate(dateDebut) > emailDate) return false;
      if (dateFin && parseFrenchDate(dateFin) < emailDate) return false;
      return true;
    });
  };

  const getFilteredEmails = () => {
    let list = activeTab === "archivé" ? archived : activeTab === "tous" ? emails : emails.filter((e) => e.groupe === activeTab);
    if (searchText) list = list.filter((e) => e.objet.toLowerCase().includes(searchText.toLowerCase()) || e.envoyePar.toLowerCase().includes(searchText.toLowerCase()));
    if (fFormation.length) list = list.filter((e) => fFormation.some((f) => e.objet.toLowerCase().includes(f.toLowerCase())));
    if (fStatut.length && activeTab === "Prospects") list = list.filter((e) => fStatut.some((s) => e.objet.toLowerCase().includes(s.toLowerCase())));
    list = filterByDate(list);
    return list;
  };

  const visibleEmails = getFilteredEmails();
  
  const totalPages = Math.ceil(visibleEmails.length / itemsPerPage);
  const paginatedEmails = visibleEmails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText, fFormation, fStatut, fReseau, dateDebut, dateFin]);

  const switchTab = (tab) => { 
    setActiveTab(tab); 
    setSelected([]); 
    setFFormation([]); 
    setFStatut([]); 
    setFReseau([]); 
    setSearchText("");
    setDateDebut("");
    setDateFin("");
  };

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const allSelected = paginatedEmails.length > 0 && selected.length === paginatedEmails.length;

  const handleArchive = () => {
    setArchived((p) => [...p, ...emails.filter((e) => selected.includes(e.id))]);
    setEmails((p) => p.filter((e) => !selected.includes(e.id)));
    setSelected([]);
    setShowModal(false);
  };

  const calculerCompteur = () => {
    const base = form.groupes.reduce((a, g) => a + (g === "Prospects" ? 1200 : g === "Étudiants" ? 800 : 340), 0);
    setCompteur(Math.round(base * (form.formations.length ? 0.6 : 1) * (form.statuts.length ? 0.75 : 1)));
  };

  const handleEnvoyer = () => {
    if (!form.objet || !form.message) return;
    setEmails((p) => [{
      id: Date.now(), objet: form.objet, envoyePar: "admin@crm.com",
      groupe: form.sendMode === "direct" ? "Direct" : (form.groupes.join(", ") || "Tous"),
      nombre: compteur || 1, date: new Date().toLocaleDateString("fr-FR")
    }, ...p]);
    setView("liste");
    setForm({ objet: "", apercu: "", message: "", sendMode: "segment", emailDirect: "", groupes: [], statuts: [], formations: [], reseaux: [], fichier: null });
    setCompteur(null);
  };

  /* ── Vue Créer ── */
  if (view === "creer") {
    return React.createElement(Layout, null,
      React.createElement("div", { className: "ce-page" },
        React.createElement("div", { className: "ce-topbar" },
          React.createElement("button", { className: "ce-back-btn", onClick: () => setView("liste") },
            React.createElement("i", { className: "fa-solid fa-arrow-left" }),
            " Retour"
          ),
          React.createElement("h2", { className: "ce-topbar-title" }, "Nouvel e-mail")
        ),
        React.createElement("div", { className: "ce-body" },
          /* Panneau gauche */
          React.createElement("div", { className: "ce-panel" },
            React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "De"),
              React.createElement("div", { className: "ce-from-box" },
                React.createElement("div", { className: "ce-avatar-sm" }, "A"),
                React.createElement("div", null,
                  React.createElement("div", { className: "ce-from-name" }, "Admin CRM"),
                  React.createElement("div", { className: "ce-from-mail" }, "admin@crm.com")
                )
              )
            ),
            React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "Méthode d'envoi ", React.createElement("span", { className: "ce-req" }, "*")),
              React.createElement("select", { className: "ce-select", value: form.sendMode, onChange: (e) => setForm({ ...form, sendMode: e.target.value, emailDirect: "", groupes: [] }) },
                React.createElement("option", { value: "segment" }, "À un segment de contacts"),
                React.createElement("option", { value: "direct" }, "À une adresse e-mail directe")
              )
            ),
            form.sendMode === "direct" && React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "Adresse e-mail ", React.createElement("span", { className: "ce-req" }, "*")),
              React.createElement("input", { className: "ce-input", type: "email", placeholder: "exemple@email.com", value: form.emailDirect, onChange: (e) => setForm({ ...form, emailDirect: e.target.value }) })
            ),
            form.sendMode === "segment" && React.createElement("div", { className: "ce-field" },
              React.createElement("label", { className: "ce-lbl" }, "Public ", React.createElement("span", { className: "ce-req" }, "*")),
              React.createElement("div", { className: "ce-public-grid" },
                ["Prospects", "Étudiants", "Diplômés"].map((g) =>
                  React.createElement("label", { key: g, className: `ce-public-card ${form.groupes.includes(g) ? "ce-public-on" : ""}` },
                    React.createElement("input", { type: "radio", name: "pub", checked: form.groupes.includes(g), onChange: () => setForm({ ...form, groupes: [g], statuts: [], formations: [], reseaux: [] }) }),
                    React.createElement("i", { className: `fa-solid ${g === "Prospects" ? "fa-user-plus" : g === "Étudiants" ? "fa-user-graduate" : "fa-award"} ce-pub-icon` }),
                    React.createElement("span", null, g)
                  )
                )
              ),
              form.groupes.length > 0 && React.createElement("div", { className: "ce-subfilters" },
                React.createElement("p", { className: "ce-sub-title" }, React.createElement("i", { className: "fa-solid fa-sliders" }), " Affiner le public"),
                // Formation avec barre de recherche
                React.createElement(ChipGroupWithSearch, { items: FORMATIONS, selected: form.formations, onChange: (v) => setForm({ ...form, formations: v }), title: "Formation", showSearch: true }),
                form.groupes.includes("Prospects") && React.createElement(React.Fragment, null,
                  // Statut prospect SANS barre de recherche
                  React.createElement(ChipGroupSimple, { items: STATUTS_PROSPECT, selected: form.statuts, onChange: (v) => setForm({ ...form, statuts: v }), title: "Statut prospect" }),
                  // Réseau social SANS barre de recherche
                  React.createElement(ChipGroupSimple, { items: RESEAUX, selected: form.reseaux, onChange: (v) => setForm({ ...form, reseaux: v }), title: "Réseau social" })
                ),
                React.createElement("button", { className: "ce-calc-btn", onClick: calculerCompteur },
                  React.createElement("i", { className: "fa-solid fa-calculator" }),
                  " Estimer les destinataires"
                ),
                compteur !== null && React.createElement("div", { className: "ce-compteur-box" },
                  React.createElement("i", { className: "fa-solid fa-inbox" }),
                  React.createElement("span", null, "Destinataires estimés : ", React.createElement("strong", null, compteur.toLocaleString()), " contacts")
                )
              )
            )
          ),
          /* Preview droite */
          React.createElement("div", { className: "ce-preview" },
            React.createElement("div", { className: "ce-preview-header" },
              React.createElement("span", { className: "ce-preview-title" }, "Aperçu de l'e-mail")
            ),
            React.createElement("div", { className: "ce-preview-meta-box" },
              [
                ["Envoyer à", form.sendMode === "direct" ? (form.emailDirect || "—") : (form.groupes.join(", ") || "—")],
                ["Ne pas envoyer à", "—"],
                ["De", "Admin CRM (admin@crm.com)"],
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
              form.message ? React.createElement("div", { className: "ce-email-body" }, form.message) : React.createElement("div", { className: "ce-email-drop" },
                React.createElement("i", { className: "fa-regular fa-envelope" }),
                React.createElement("p", null, "Écrivez votre message ici")
              ),
              form.fichier && React.createElement("div", { className: "ce-attach-preview" },
                React.createElement("i", { className: "fa-solid fa-paperclip" }),
                " ",
                form.fichier.name
              ),
              React.createElement("div", { className: "ce-email-footer" },
                React.createElement("a", { href: "#" }, "Se désabonner"),
                "  ·  ",
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
                  React.createElement("input", { type: "file", style: { display: "none" }, onChange: (e) => setForm({ ...form, fichier: e.target.files[0] }) }),
                  React.createElement("i", { className: "fa-solid fa-paperclip" }),
                  form.fichier ? form.fichier.name : "Joindre un fichier"
                )
              )
            ),
            React.createElement("div", { style: { margin: "0 24px 24px 24px", display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid #E2E8F0", paddingTop: "20px" } },
              React.createElement("button", { className: "ce-btn-ghost", onClick: () => setView("liste") }, "Annuler"),
              React.createElement("button", { className: "ce-btn-send", onClick: handleEnvoyer },
                React.createElement("i", { className: "fa-solid fa-paper-plane" }),
                " Envoyer"
              )
            )
          )
        )
      )
    );
  }

  /* ── Vue Liste ── */
  return React.createElement(Layout, null,
    React.createElement("div", { className: "mm-page" },
      React.createElement("div", { className: "mm-header" },
        React.createElement("div", null,
          React.createElement("h1", { className: "mm-title" },
            React.createElement("i", { className: "fa-solid fa-envelope mm-icon" }),
            " Marketing Mail"
          ),
          React.createElement("p", { className: "mm-sub" }, "Gérez et envoyez vos campagnes email")
        ),
        React.createElement("button", { className: "mm-create-btn", onClick: () => setView("creer") },
          React.createElement("i", { className: "fa-solid fa-plus" }),
          " Créer un e-mail"
        )
      ),
      React.createElement("div", { className: "mm-card" },
        React.createElement("div", { className: "mm-tabs" },
          TABS.map((tab) => {
            const cnt = tab.id === "archivé" ? archived.length : tab.id === "tous" ? emails.length : emails.filter((e) => e.groupe === tab.id).length;
            return React.createElement("button", { key: tab.id, className: `mm-tab ${activeTab === tab.id ? "mm-tab-on" : ""}`, onClick: () => switchTab(tab.id) },
              tab.id !== "tous" && tab.id !== "archivé" && React.createElement("span", { className: "mm-tab-dot", style: { background: tab.id === "Prospects" ? "#f59e0b" : tab.id === "Étudiants" ? "#22c55e" : "#6366f1" } }),
              tab.id === "archivé" && React.createElement("i", { className: "fa-regular fa-circle", style: { fontSize: 9, color: "#94A3B8" } }),
              tab.label,
              React.createElement("span", { style: { marginLeft: "6px", fontSize: "11px", color: "#94A3B8" } }, "(", cnt, ")")
            );
          })
        ),
        React.createElement("div", { className: "mm-toolbar" },
          React.createElement("div", { className: "mm-toolbar-l" },
            React.createElement("div", { className: "mm-search" },
              React.createElement("i", { className: "fa-solid fa-magnifying-glass mm-search-ic" }),
              React.createElement("input", { className: "mm-search-input", placeholder: "Recherche de la ligne d'objet ou du nom de l'expéditeur...", value: searchText, onChange: (e) => setSearchText(e.target.value) })
            ),
            React.createElement(DateFilter, { dateDebut: dateDebut, dateFin: dateFin, setDateDebut: setDateDebut, setDateFin: setDateFin }),
            activeTab === "Prospects" && React.createElement(React.Fragment, null,
              React.createElement(FilterDropdown, { label: "Formation", items: FORMATIONS, selected: fFormation, onChange: setFFormation }),
              React.createElement(FilterDropdown, { label: "Statut", items: STATUTS_PROSPECT, selected: fStatut, onChange: setFStatut }),
              React.createElement(FilterDropdown, { label: "Réseau social", items: RESEAUX, selected: fReseau, onChange: setFReseau })
            ),
            (activeTab === "Étudiants" || activeTab === "Diplômés") && React.createElement(FilterDropdown, { label: "Formation", items: FORMATIONS, selected: fFormation, onChange: setFFormation })
          ),
          selected.length > 0 && activeTab !== "archivé" && React.createElement("button", { className: "mm-archive-btn", onClick: () => setShowModal(true) },
            React.createElement("i", { className: "fa-solid fa-box-archive" }),
            " Archiver (", selected.length, ")"
          )
        ),
        React.createElement("div", { className: "mm-table-wrap" },
          React.createElement("table", { className: "mm-table" },
            React.createElement("thead", null,
              React.createElement("tr", null,
                activeTab !== "archivé" && React.createElement("th", { className: "mm-th-cb" },
                  React.createElement("span", { className: `mm-cb ${allSelected ? "mm-cb-on" : ""}`, onClick: () => setSelected(allSelected ? [] : paginatedEmails.map((e) => e.id)) },
                    allSelected && React.createElement("i", { className: "fa-solid fa-check" })
                  )
                ),
                React.createElement("th", null, "Nom de l'e-mail ", React.createElement("i", { className: "fa-solid fa-circle-info mm-th-info" })),
                React.createElement("th", null, "Envoyé par"),
                React.createElement("th", null, "Groupe cible"),
                React.createElement("th", null, "Remis ", React.createElement("i", { className: "fa-solid fa-circle-info mm-th-info" })),
                React.createElement("th", null, "Date")
              )
            ),
            React.createElement("tbody", null,
              paginatedEmails.length === 0 ? React.createElement("tr", null,
                React.createElement("td", { colSpan: activeTab !== "archivé" ? 6 : 5, className: "mm-empty" },
                  React.createElement("i", { className: "fa-regular fa-folder-open" }),
                  React.createElement("p", null, "Aucun e-mail trouvé")
                )
              ) : paginatedEmails.map((email) =>
                React.createElement("tr", { key: email.id, className: selected.includes(email.id) ? "mm-tr-sel" : "" },
                  activeTab !== "archivé" && React.createElement("td", { className: "mm-td-cb" },
                    React.createElement("span", { className: `mm-cb ${selected.includes(email.id) ? "mm-cb-on" : ""}`, onClick: () => toggleSelect(email.id) },
                      selected.includes(email.id) && React.createElement("i", { className: "fa-solid fa-check" })
                    )
                  ),
                  React.createElement("td", null, React.createElement("span", { className: "mm-email-name" }, React.createElement("span", { className: "mm-email-dot" }), email.objet)),
                  React.createElement("td", { className: "mm-td-gray" }, email.envoyePar),
                  React.createElement("td", null, React.createElement("span", { className: "mm-badge", "data-g": email.groupe }, email.groupe)),
                  React.createElement("td", { className: "mm-td-num" }, email.nombre.toLocaleString()),
                  React.createElement("td", { className: "mm-td-gray" }, email.date)
                )
              )
            )
          )
        ),
        totalPages > 1 && React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "16px 20px", borderTop: "1px solid #F1F5F9" } },
          React.createElement("button", {
            onClick: () => setCurrentPage(p => Math.max(1, p - 1)),
            disabled: currentPage === 1,
            style: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1, color: "#64748B" }
          }, React.createElement("i", { className: "fa-solid fa-chevron-left" })),
          React.createElement("span", { style: { fontSize: "13px", color: "#64748B" } }, "Page ", currentPage, " sur ", totalPages),
          React.createElement("button", {
            onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
            disabled: currentPage === totalPages,
            style: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", background: "white", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1, color: "#64748B" }
          }, React.createElement("i", { className: "fa-solid fa-chevron-right" }))
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