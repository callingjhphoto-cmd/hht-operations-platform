import React, { useState, useEffect, useMemo, useCallback } from "react";

/* ─── Design Tokens ─── */
const C = {
  bg: "#FAFAF8", bgWarm: "#F5F1EC", card: "#FFFFFF",
  ink: "#18150F", inkSec: "#5C564E", inkMuted: "#9A948C",
  accent: "#7D5A1A", accentLight: "#B8922E", accentSubtle: "rgba(125,90,26,0.06)",
  border: "#E6E1D9", borderLight: "#F0ECE5",
  success: "#2B7A4B", successBg: "#F0F9F3",
  warn: "#956018", warnBg: "#FFF9F0",
  danger: "#9B3535", dangerBg: "#FDF2F2",
  info: "#2A6680", infoBg: "#F0F7FA",
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif" };

/* ─── Style Helpers ─── */
const cardStyle = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...extra });
const btnStyle = (variant = "primary") => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", border: "none", transition: "all 0.15s" };
  if (variant === "primary") return { ...base, background: C.ink, color: "#fff" };
  if (variant === "outline") return { ...base, background: "transparent", color: C.ink, border: `1px solid ${C.border}` };
  if (variant === "accent") return { ...base, background: C.accent, color: "#fff" };
  if (variant === "ghost") return { ...base, background: "transparent", color: C.inkSec, padding: "6px 10px" };
  return base;
};
const inputStyle = { padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%" };
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });

/* ─── Constants ─── */
const COLUMNS = ["To Do", "In Progress", "Review", "Done"];
const PRIORITIES = ["urgent", "high", "normal", "low"];
const TEAM = [
  { id: "JS", name: "Joe Stokoe" },
  { id: "AM", name: "Alex Morgan" },
  { id: "ST", name: "Sam Taylor" },
  { id: "JL", name: "Jordan Lee" },
  { id: "PQ", name: "Pat Quinn" },
  { id: "RJ", name: "Robin James" },
];
const EVENTS = ["Diageo Event", "Pernod Ricard Event", "Campari Pitch", "Hendrick's Gin Garden", "Moët Event", "Fever-Tree Competition", "BrewDog Monthly", "Easter Weekend"];

const PRIORITY_MAP = {
  urgent: { bg: C.dangerBg, color: C.danger, label: "Urgent" },
  high: { bg: C.warnBg, color: C.warn, label: "High" },
  normal: { bg: C.infoBg, color: C.info, label: "Normal" },
  low: { bg: C.accentSubtle, color: C.inkMuted, label: "Low" },
};

const COLUMN_COLORS = {
  "To Do": { dot: C.inkMuted, bg: C.bg },
  "In Progress": { dot: C.info, bg: C.infoBg },
  "Review": { dot: C.warn, bg: C.warnBg },
  "Done": { dot: C.success, bg: C.successBg },
};

const STORAGE_KEY = "hht_tasks_v1";

const DEFAULT_TASKS = [
  { id: 1, title: "Prep Diageo cocktail spec", description: "Finalize cocktail specifications and ingredient list for the upcoming Diageo activation event. Include garnish details and glassware requirements.", assignee: "AM", priority: "urgent", due: "2026-03-12", event: "Diageo Event", column: "In Progress", comments: [{ author: "JS", text: "Make sure we include the new Tanqueray serve.", ts: "2026-03-04T10:30:00" }] },
  { id: 2, title: "Order replacement Boston shakers", description: "Three Boston shakers were damaged at last weekend's event. Order replacements from usual supplier.", assignee: "RJ", priority: "high", due: "2026-03-10", event: "", column: "To Do", comments: [] },
  { id: 3, title: "Submit Pernod Ricard floor plan", description: "Create and submit the floor plan layout for the Pernod Ricard brand activation. Must include bar placement, guest flow, and emergency exits.", assignee: "ST", priority: "high", due: "2026-03-25", event: "Pernod Ricard Event", column: "To Do", comments: [] },
  { id: 4, title: "Campari pitch deck review", description: "Review and provide feedback on the pitch deck for the Campari spring campaign proposal.", assignee: "PQ", priority: "normal", due: "2026-03-18", event: "Campari Pitch", column: "Review", comments: [{ author: "AM", text: "Slides 4-6 need updated photography.", ts: "2026-03-03T14:15:00" }] },
  { id: 5, title: "Stock check — Diageo spirits", description: "Full inventory count of all Diageo spirits in storage. Cross-reference with upcoming event requirements.", assignee: "RJ", priority: "urgent", due: "2026-03-13", event: "Diageo Event", column: "To Do", comments: [] },
  { id: 6, title: "Hendrick's gin garden mood board", description: "Create a visual mood board for the Hendrick's Gin Garden pop-up concept. Focus on botanical, whimsical aesthetic.", assignee: "PQ", priority: "normal", due: "2026-04-01", event: "Hendrick's Gin Garden", column: "In Progress", comments: [] },
  { id: 7, title: "Update spring cocktail menu", description: "Refresh the seasonal cocktail menu with spring-inspired serves. Include costing per drink and suggested pricing.", assignee: "JS", priority: "high", due: "2026-03-20", event: "", column: "In Progress", comments: [{ author: "PQ", text: "Can we include a non-alcoholic option this time?", ts: "2026-03-02T09:00:00" }] },
  { id: 8, title: "Train Casey on smoking kit", description: "Conduct a training session with Casey on the cocktail smoking kit — safety, technique, and showmanship.", assignee: "AM", priority: "normal", due: "2026-03-14", event: "", column: "To Do", comments: [] },
  { id: 9, title: "Send Moët proposal", description: "Draft and send the event proposal for the Moët champagne dinner series. Include pricing tiers and package options.", assignee: "JS", priority: "high", due: "2026-03-22", event: "Moët Event", column: "To Do", comments: [] },
  { id: 10, title: "Book freelancers for Easter", description: "Source and confirm at least 6 freelance bartenders for the Easter weekend events. Check availability and rates.", assignee: "ST", priority: "urgent", due: "2026-03-08", event: "Easter Weekend", column: "To Do", comments: [] },
  { id: 11, title: "Fever-Tree competition rules doc", description: "Write up the official rules and T&Cs for the Fever-Tree cocktail competition entry.", assignee: "JL", priority: "normal", due: "2026-04-15", event: "Fever-Tree Competition", column: "Review", comments: [] },
  { id: 12, title: "BrewDog monthly menu rotation", description: "Plan the next monthly cocktail rotation for BrewDog venues. Coordinate with their brand team on featured ingredients.", assignee: "AM", priority: "normal", due: "2026-03-30", event: "BrewDog Monthly", column: "Done", comments: [{ author: "JS", text: "Great work, menu is approved.", ts: "2026-03-01T16:45:00" }] },
];

/* ─── Utility ─── */
const initials = (id) => id;
const teamName = (id) => TEAM.find((t) => t.id === id)?.name || id;
const avatarStyle = (id) => {
  const colors = { JS: "#7D5A1A", AM: "#2A6680", ST: "#2B7A4B", JL: "#956018", PQ: "#9B3535", RJ: "#5C564E" };
  return { width: 28, height: 28, borderRadius: "50%", background: colors[id] || C.inkMuted, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: F.sans, flexShrink: 0 };
};
const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
const isOverdue = (d, col) => {
  if (!d || col === "Done") return false;
  return new Date(d + "T23:59:59") < new Date();
};
const nextId = (tasks) => Math.max(0, ...tasks.map((t) => t.id)) + 1;

/* ─── Component ─── */
export default function TaskManager() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TASKS;
  });
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [form, setForm] = useState({ title: "", description: "", assignee: "", due: "", priority: "normal", event: "", column: "To Do" });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  /* Keyboard shortcut: Escape closes modals */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (detail) setDetail(null);
        else if (showForm) setShowForm(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [detail, showForm]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter((t) => {
      if (filterAssignee && t.assignee !== filterAssignee) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterEvent && t.event !== filterEvent) return false;
      if (q && !t.title.toLowerCase().includes(q) && !(t.description || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, filterAssignee, filterPriority, filterEvent, searchQuery]);

  const sortedFiltered = useMemo(() => {
    if (sortBy === "default") return filtered;
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const sorted = [...filtered];
    if (sortBy === "priority") sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    if (sortBy === "due") sorted.sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });
    if (sortBy === "assignee") sorted.sort((a, b) => teamName(a.assignee).localeCompare(teamName(b.assignee)));
    return sorted;
  }, [filtered, sortBy]);

  const colTasks = useCallback((col) => sortedFiltered.filter((t) => t.column === col), [sortedFiltered]);
  const counts = COLUMNS.reduce((a, c) => ({ ...a, [c]: colTasks(c).length }), {});

  const moveTask = (id, newCol) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, column: newCol } : t));
  const deleteTask = (id) => { setTasks((prev) => prev.filter((t) => t.id !== id)); setDetail(null); };

  const handleCreate = () => {
    if (!form.title.trim()) return;
    setTasks((prev) => [...prev, { ...form, id: nextId(prev), title: form.title.trim(), description: form.description.trim(), comments: [] }]);
    setForm({ title: "", description: "", assignee: "", due: "", priority: "normal", event: "", column: "To Do" });
    setShowForm(false);
  };

  const addComment = () => {
    if (!newComment.trim() || !detail) return;
    setTasks((prev) => prev.map((t) => t.id === detail.id ? { ...t, comments: [...(t.comments || []), { author: "JS", text: newComment.trim(), ts: new Date().toISOString() }] } : t));
    setDetail((d) => ({ ...d, comments: [...(d.comments || []), { author: "JS", text: newComment.trim(), ts: new Date().toISOString() }] }));
    setNewComment("");
  };

  const activeFilters = [filterAssignee, filterPriority, filterEvent, searchQuery].filter(Boolean).length;

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const overdueCount = tasks.filter((t) => isOverdue(t.due, t.column)).length;
    const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.column !== "Done").length;
    const dueThisWeek = tasks.filter((t) => {
      if (!t.due || t.column === "Done") return false;
      const d = new Date(t.due + "T23:59:59");
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return d >= now && d <= weekEnd;
    }).length;
    const completionRate = tasks.length > 0 ? Math.round((tasks.filter((t) => t.column === "Done").length / tasks.length) * 100) : 0;
    return { overdueCount, urgentCount, dueThisWeek, completionRate };
  }, [tasks]);

  /* ─── Render: Task Detail Overlay ─── */
  const renderDetail = () => {
    if (!detail) return null;
    const task = tasks.find((t) => t.id === detail.id) || detail;
    const pri = PRIORITY_MAP[task.priority];
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setDetail(null)}>
        <div style={cardStyle({ width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" })} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontFamily: F.serif, color: C.ink }}>{task.title}</h2>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={pillStyle(pri.bg, pri.color)}>{pri.label}</span>
                <span style={pillStyle(COLUMN_COLORS[task.column].bg, COLUMN_COLORS[task.column].dot)}>{task.column}</span>
                {task.event && <span style={pillStyle(C.accentSubtle, C.accent)}>{task.event}</span>}
              </div>
            </div>
            <button style={btnStyle("ghost")} onClick={() => setDetail(null)}>✕</button>
          </div>

          {task.description && <p style={{ fontSize: 13, lineHeight: 1.6, color: C.inkSec, fontFamily: F.sans, margin: "12px 0 20px" }}>{task.description}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Assignee</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={avatarStyle(task.assignee)}>{initials(task.assignee)}</div>
                <select style={{ ...inputStyle, width: "auto", padding: "4px 8px", fontSize: 12, background: "transparent", border: "none" }} value={task.assignee} onChange={(e) => { setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, assignee: e.target.value } : t)); setDetail({ ...task, assignee: e.target.value }); }}>
                  {TEAM.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: 12, background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Due Date</div>
              <span style={{ fontSize: 13, fontFamily: F.sans, color: isOverdue(task.due, task.column) ? C.danger : C.ink, fontWeight: isOverdue(task.due, task.column) ? 600 : 400 }}>
                {isOverdue(task.due, task.column) ? "OVERDUE — " : ""}{task.due ? formatDate(task.due) : "No date set"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Priority</div>
              <select style={{ ...inputStyle, width: "auto", padding: "4px 8px", fontSize: 12, background: "transparent", border: "none" }} value={task.priority} onChange={(e) => { setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, priority: e.target.value } : t)); setDetail({ ...task, priority: e.target.value }); }}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ padding: 12, background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Created</div>
              <span style={{ fontSize: 13, fontFamily: F.sans, color: C.ink }}>Task #{task.id}</span>
            </div>
          </div>

          {/* Move task */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontFamily: F.sans, color: C.inkMuted }}>Move to:</span>
            {COLUMNS.filter((c) => c !== task.column).map((c) => (
              <button key={c} style={btnStyle("outline")} onClick={() => { moveTask(task.id, c); setDetail({ ...task, column: c }); }}>{c}</button>
            ))}
          </div>

          {/* Comments */}
          <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 16 }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 13, fontFamily: F.sans, color: C.ink }}>Activity &amp; Comments ({(task.comments || []).length})</h4>
            {(task.comments || []).length === 0 && <p style={{ fontSize: 12, color: C.inkMuted, fontFamily: F.sans }}>No comments yet.</p>}
            {(task.comments || []).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={avatarStyle(c.author)}>{initials(c.author)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.ink }}>{teamName(c.author)}</span>
                    <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>{new Date(c.ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: C.inkSec, fontFamily: F.sans, lineHeight: 1.5 }}>{c.text}</p>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input style={inputStyle} placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} />
              <button style={btnStyle("primary")} onClick={addComment}>Post</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.borderLight}` }}>
            <button style={{ ...btnStyle("ghost"), color: C.danger }} onClick={() => deleteTask(task.id)}>Delete Task</button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Render: Create Task Form ─── */
  const renderForm = () => {
    if (!showForm) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowForm(false)}>
        <div style={cardStyle({ width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" })} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontFamily: F.serif, color: C.ink }}>Create New Task</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.inkSec, marginBottom: 4 }}>Title *</label>
              <input style={inputStyle} placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.inkSec, marginBottom: 4 }}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="Details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.inkSec, marginBottom: 4 }}>Assignee</label>
                <select style={inputStyle} value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {TEAM.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.inkSec, marginBottom: 4 }}>Due Date</label>
                <input style={inputStyle} type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.inkSec, marginBottom: 4 }}>Priority</label>
                <select style={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.inkSec, marginBottom: 4 }}>Related Event</label>
                <select style={inputStyle} value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}>
                  <option value="">None</option>
                  {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
            <button style={btnStyle("outline")} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={btnStyle("accent")} onClick={handleCreate}>Create Task</button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Render: Task Card ─── */
  const renderCard = (task) => {
    const pri = PRIORITY_MAP[task.priority];
    const overdue = isOverdue(task.due, task.column);
    return (
      <div key={task.id} style={cardStyle({ padding: 14, marginBottom: 8, cursor: "pointer", transition: "box-shadow 0.15s" })} onClick={() => setDetail(task)} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={pillStyle(pri.bg, pri.color)}>{pri.label}</span>
          {/* Move dropdown */}
          <select
            style={{ fontSize: 11, fontFamily: F.sans, background: "transparent", border: "none", color: C.inkMuted, cursor: "pointer", padding: 0 }}
            value={task.column}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { e.stopPropagation(); moveTask(task.id, e.target.value); }}
          >
            {COLUMNS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <h4 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, fontFamily: F.sans, color: C.ink, lineHeight: 1.4 }}>{task.title}</h4>
        {task.description && (
          <p style={{ margin: "0 0 4px", fontSize: 11, color: C.inkMuted, fontFamily: F.sans, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {task.description}
          </p>
        )}
        {task.event && <div style={{ fontSize: 11, color: C.accent, fontFamily: F.sans, marginBottom: 4 }}>{task.event}</div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {task.assignee && <div style={avatarStyle(task.assignee)}>{initials(task.assignee)}</div>}
            {task.assignee && <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>{teamName(task.assignee).split(" ")[0]}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(task.comments || []).length > 0 && (
              <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>
                {(task.comments || []).length} {(task.comments || []).length === 1 ? "comment" : "comments"}
              </span>
            )}
            {task.due && (
              <span style={{ fontSize: 11, fontFamily: F.sans, color: overdue ? C.danger : C.inkMuted, fontWeight: overdue ? 600 : 400 }}>
                {overdue ? "Overdue \u00B7 " : ""}{formatDate(task.due)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─── Main Render ─── */
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: F.sans }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1400, margin: "0 auto" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontFamily: F.serif, color: C.ink }}>Task Manager</h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: C.inkMuted }}>{tasks.length} tasks &middot; {tasks.filter((t) => t.column === "Done").length} completed</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={btnStyle("outline")} onClick={() => { if (window.confirm("Reset all tasks to defaults?")) { setTasks(DEFAULT_TASKS); } }}>Reset</button>
            <button style={btnStyle("accent")} onClick={() => setShowForm(true)}>+ New Task</button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <div style={cardStyle({ padding: 14 })}>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Completion</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: F.sans, color: C.success }}>{stats.completionRate}%</span>
              <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>{tasks.filter((t) => t.column === "Done").length} of {tasks.length}</span>
            </div>
            <div style={{ marginTop: 8, height: 4, background: C.borderLight, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stats.completionRate}%`, background: C.success, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
          </div>
          <div style={cardStyle({ padding: 14 })}>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Overdue</div>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: F.sans, color: stats.overdueCount > 0 ? C.danger : C.success }}>{stats.overdueCount}</span>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginTop: 2 }}>{stats.overdueCount === 0 ? "All on track" : "Needs attention"}</div>
          </div>
          <div style={cardStyle({ padding: 14 })}>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Urgent Tasks</div>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: F.sans, color: stats.urgentCount > 0 ? C.warn : C.inkMuted }}>{stats.urgentCount}</span>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginTop: 2 }}>Active urgent items</div>
          </div>
          <div style={cardStyle({ padding: 14 })}>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Due This Week</div>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: F.sans, color: C.info }}>{stats.dueThisWeek}</span>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginTop: 2 }}>Within next 7 days</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 24px 0" }}>
        <div style={cardStyle({ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", flexWrap: "wrap" })}>
          <input
            style={{ ...inputStyle, width: "auto", minWidth: 180, maxWidth: 220, background: C.bg }}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ width: 1, height: 24, background: C.borderLight }} />
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.inkSec }}>Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}:</span>
          <select style={{ ...inputStyle, width: "auto", minWidth: 130 }} value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
            <option value="">All Assignees</option>
            {TEAM.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select style={{ ...inputStyle, width: "auto", minWidth: 120 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select style={{ ...inputStyle, width: "auto", minWidth: 140 }} value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option value="">All Events</option>
            {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
          </select>
          <div style={{ width: 1, height: 24, background: C.borderLight }} />
          <select style={{ ...inputStyle, width: "auto", minWidth: 110 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default Sort</option>
            <option value="priority">By Priority</option>
            <option value="due">By Due Date</option>
            <option value="assignee">By Assignee</option>
          </select>
          {activeFilters > 0 && (
            <button style={btnStyle("ghost")} onClick={() => { setFilterAssignee(""); setFilterPriority(""); setFilterEvent(""); setSearchQuery(""); }}>Clear all</button>
          )}
        </div>
      </div>

      {/* Board */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "flex-start" }}>
          {COLUMNS.map((col) => {
            const cc = COLUMN_COLORS[col];
            const items = colTasks(col);
            return (
              <div key={col}>
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc.dot }} />
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: F.sans, color: C.ink }}>{col}</span>
                  </div>
                  <span style={pillStyle(cc.bg, cc.dot)}>{counts[col]}</span>
                </div>
                {/* Column body */}
                <div style={{ minHeight: 100, background: C.accentSubtle, borderRadius: 10, padding: 8 }}>
                  {items.length === 0 && (
                    <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: C.inkMuted, fontFamily: F.sans }}>No tasks</div>
                  )}
                  {items.map(renderCard)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={cardStyle({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" })}>
          <div style={{ display: "flex", gap: 24 }}>
            {TEAM.map((m) => {
              const count = tasks.filter((t) => t.assignee === m.id && t.column !== "Done").length;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", opacity: filterAssignee === m.id ? 1 : 0.7 }} onClick={() => setFilterAssignee(filterAssignee === m.id ? "" : m.id)}>
                  <div style={avatarStyle(m.id)}>{initials(m.id)}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: C.ink }}>{m.name.split(" ")[0]}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>{count} active</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: C.inkMuted, fontFamily: F.sans }}>
            {tasks.filter((t) => isOverdue(t.due, t.column)).length} overdue
          </div>
        </div>
      </div>

      {renderForm()}
      {renderDetail()}
    </div>
  );
}
