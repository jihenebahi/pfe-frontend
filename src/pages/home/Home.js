import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/home/home.css";

const initialTasks = [
  { id: 1, title: "Appeler client X", description: "Vérifier son contrat de formation", urgent: true, done: false },
  { id: 2, title: "Envoyer email", description: "Proposition commerciale pour formation Java", urgent: false, done: false },
  { id: 3, title: "Préparer réunion", description: "Réunion bilan Q2 avec l'équipe commerciale", urgent: true, done: true },
];

const initialReminders = [
  { id: 1, name: "Ahmed Ben Ali", phone: "0612345678", date: "2025-07-10", done: false },
  { id: 2, name: "Sara Mansouri", phone: "0698765432", date: "2025-07-08", done: false },
  { id: 3, name: "Karim Trabelsi", phone: "0654321987", date: "2025-07-09", done: true },
  { id: 4, name: "Nour El Hedi", phone: "0623456789", date: "2025-07-11", done: false },
  { id: 5, name: "Ines Gharbi", phone: "0645678901", date: "2025-07-07", done: false },
];

// Get today's date as YYYY-MM-DD
function today() {
  return new Date().toISOString().split("T")[0];
}

function getReminderColor(date, done) {
  if (done) return "reminder-done";
  const t = today();
  if (date < t) return "reminder-late";
  if (date === t) return "reminder-today";
  return "reminder-future";
}

function getReminderLabel(date, done) {
  if (done) return { label: "Fait", cls: "badge-done" };
  const t = today();
  if (date < t) return { label: "En retard", cls: "badge-late" };
  if (date === t) return { label: "Aujourd'hui", cls: "badge-today" };
  return { label: "À venir", cls: "badge-future" };
}

export default function Home() {
  // ── TASKS ──
  const [tasks, setTasks] = useState(initialTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", urgent: false });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), done: false }]);
    setNewTask({ title: "", description: "", urgent: false });
    setShowTaskForm(false);
  };

  const toggleTask = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  // ── REMINDERS ──
  const [reminders, setReminders] = useState(initialReminders);
  const [reminderFilter, setReminderFilter] = useState("all"); // all | done | pending
  const [reminderSearch, setReminderSearch] = useState("");
  const [detailModal, setDetailModal] = useState(null);

  const toggleReminder = (id) =>
    setReminders(reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));

  const deleteReminder = (id) => setReminders(reminders.filter((r) => r.id !== id));

  const filteredReminders = reminders
    .filter((r) => {
      const t = today();
      if (reminderFilter === "done") return r.done;
      if (reminderFilter === "pending") return !r.done && r.date <= t;
      if (reminderFilter === "upcoming") return !r.done && r.date > t;
      return true;
    })
    .filter(
      (r) =>
        r.name.toLowerCase().includes(reminderSearch.toLowerCase()) ||
        r.phone.includes(reminderSearch)
    )
    .sort((a, b) => {
      // Sort: late first, then today, then future, done last
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.date.localeCompare(b.date);
    });

  return (
    <Layout>
      <div className="home-dashboard">
        {/* ══════════════════ LEFT : TASKS ══════════════════ */}
        <section className="tasks-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <i className="fa-solid fa-list-check"></i> Tâches
            </h2>
            <button className="btn-add" onClick={() => setShowTaskForm(!showTaskForm)}>
              <i className="fa-solid fa-plus"></i> Ajouter
            </button>
          </div>

          {/* Add Task Form */}
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

          {/* Task Table */}
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
                  <tr>
                    <td colSpan={5} className="empty-row">Aucune tâche pour l'instant</td>
                  </tr>
                )}
                {tasks.map((task) => (
                  <tr key={task.id} className={task.done ? "task-row done-row" : "task-row"}>
                    <td>
                      <input
                        type="checkbox"
                        className="task-check"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                      />
                    </td>
                    <td className="task-title-cell">{task.title}</td>
                    <td className="task-desc-cell">{task.description}</td>
                    <td>
                      <span className={task.urgent ? "badge-urgent" : "badge-normal"}>
                        {task.urgent ? "Urgent" : "Normal"}
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

        {/* ══════════════════ RIGHT : REMINDERS ══════════════════ */}
        <section className="reminders-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <i className="fa-solid fa-bell"></i> Rappels & Relances
            </h2>
          </div>

          {/* Filters */}
          <div className="reminder-filters">
            <input
              className="reminder-search"
              placeholder="🔍 Rechercher nom ou tél..."
              value={reminderSearch}
              onChange={(e) => setReminderSearch(e.target.value)}
            />
            <div className="filter-tabs">
              {[
                { key: "all", label: "Tous" },
                { key: "pending", label: "En attente" },
                { key: "upcoming", label: "À venir" },
                { key: "done", label: "Fait" },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`filter-tab ${reminderFilter === f.key ? "active" : ""}`}
                  onClick={() => setReminderFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="reminder-legend">
            <span className="leg late">● En retard</span>
            <span className="leg today">● Aujourd'hui</span>
            <span className="leg future">● À venir</span>
            <span className="leg donec">● Fait</span>
          </div>

          {/* Tickets */}
          <div className="reminders-list">
            {filteredReminders.length === 0 && (
              <div className="empty-reminders">Aucun rappel trouvé</div>
            )}
            {filteredReminders.map((r) => {
              const colorCls = getReminderColor(r.date, r.done);
              const { label, cls } = getReminderLabel(r.date, r.done);
              return (
                <div key={r.id} className={`reminder-card ${colorCls}`}>
                  <div className="reminder-left">
                    <input
                      type="checkbox"
                      className="reminder-check"
                      checked={r.done}
                      onChange={() => toggleReminder(r.id)}
                      title="Marquer comme fait"
                    />
                    <div className="reminder-info">
                      <div className="reminder-name">{r.name}</div>
                      <div className="reminder-phone">
                        <i className="fa-solid fa-phone"></i> {r.phone}
                      </div>
                      <div className="reminder-date">
                        <i className="fa-regular fa-calendar"></i>{" "}
                        {new Date(r.date).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="reminder-right">
                    <span className={`reminder-badge ${cls}`}>{label}</span>
                    <div className="reminder-actions">
                      <button
                        className="btn-detail"
                        onClick={() => setDetailModal(r)}
                        title="Voir détails"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        className="btn-delete-reminder"
                        onClick={() => deleteReminder(r.id)}
                        title="Supprimer"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ══════════════════ DETAIL MODAL ══════════════════ */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails du Prospect</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <span className="modal-label"><i className="fa-solid fa-user"></i> Nom</span>
                <span className="modal-value">{detailModal.name}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label"><i className="fa-solid fa-phone"></i> Téléphone</span>
                <span className="modal-value">{detailModal.phone}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label"><i className="fa-regular fa-calendar"></i> Date relance</span>
                <span className="modal-value">
                  {new Date(detailModal.date).toLocaleDateString("fr-FR", {
                    weekday: "long", day: "2-digit", month: "long", year: "numeric",
                  })}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label"><i className="fa-solid fa-circle-info"></i> Statut</span>
                <span className={`modal-value ${detailModal.done ? "status-done" : "status-pending"}`}>
                  {detailModal.done ? "✅ Fait" : "⏳ En attente"}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <a href="/prospects" className="btn-goto-prospect">
                <i className="fa-solid fa-arrow-right"></i> Voir fiche prospect
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}