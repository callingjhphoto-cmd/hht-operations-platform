import { useState, useMemo, useCallback, useEffect } from "react";
import { getLeads, updateLead, createLead, deleteLead, getActivities, logActivity, calculateScore, getPriority, getLeadStats, LEAD_STAGES } from "../lib/store";
import LeadDetail from "./LeadDetail";
import CSVImport from "./CSVImport";

// ── Theme (imported from parent — passed as props or re-declared) ──
const C = {
  bg: "#FAFAF8", bgWarm: "#F5F1EC", card: "#FFFFFF", cardHover: "#FDFCFA",
  ink: "#18150F", inkSec: "#5C564E", inkMuted: "#9A948C",
  accent: "#7D5A1A", accentLight: "#B8922E", accentSubtle: "rgba(125,90,26,0.06)",
  border: "#E6E1D9", borderLight: "#F0ECE5",
  success: "#2B7A4B", successBg: "#F0F9F3", successBorder: "#C6E7D1",
  warn: "#956018", warnBg: "#FFF9F0", warnBorder: "#E8D4A8",
  danger: "#9B3535", dangerBg: "#FDF2F2", dangerBorder: "#E8C4C4",
  info: "#2A6680", infoBg: "#F0F7FA", infoBorder: "#B8D8E8",
  stages: { identified:"#2A6680", researched:"#5B6AAF", contacted:"#956018", responded:"#B8922E", qualified:"#2B7A4B", "meeting booked":"#1A6B4A", won:"#18150F", lost:"#9A948C" },
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };

// ── Style Utilities ──
const cardStyle = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...extra });
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });
const btnStyle = (variant = "primary") => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", border: "none", transition: "all 0.15s" };
  if (variant === "primary") return { ...base, background: C.ink, color: "#fff" };
  if (variant === "outline") return { ...base, background: "transparent", color: C.ink, border: `1px solid ${C.border}` };
  if (variant === "accent") return { ...base, background: C.accent, color: "#fff" };
  if (variant === "ghost") return { ...base, background: "transparent", color: C.inkSec, padding: "6px 10px" };
  if (variant === "danger") return { ...base, background: C.danger, color: "#fff" };
  if (variant === "success") return { ...base, background: C.success, color: "#fff" };
  return base;
};
const inputStyle = { padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%", boxSizing: "border-box" };
const selectStyle = { ...inputStyle, cursor: "pointer" };

const fmt = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return fmtShort(d);
};

const ScoreBadge = ({ score }) => {
  const bg = score >= 75 ? C.successBg : score >= 55 ? C.warnBg : C.dangerBg;
  const color = score >= 75 ? C.success : score >= 55 ? C.warn : C.danger;
  return <span style={pillStyle(bg, color)}>{score}</span>;
};

const StagePill = ({ stage, onClick, editable = false }) => {
  const key = stage.toLowerCase();
  const color = C.stages[key] || C.inkSec;
  return (
    <span
      onClick={onClick}
      style={{
        ...pillStyle(color + "15", color),
        cursor: editable ? "pointer" : "default",
        position: "relative",
      }}
    >
      {stage} {editable && <span style={{ fontSize: 9, marginLeft: 2 }}>▾</span>}
    </span>
  );
};

// ── Team members for assignment ──
const TEAM = [
  { name: "Joe Stokoe", initials: "JS" },
  { name: "Matt Robertson", initials: "MR" },
  { name: "Emily Blacklock", initials: "EB" },
  { name: "Seb Davis", initials: "SD" },
  { name: "Jason Sales", initials: "JSa" },
  { name: "Anja Rubin", initials: "AR" },
  { name: "Katy Kedslie", initials: "KK" },
];

// ══════════════════════════════════════════════════════════════════════════════
// LEAD ENGINE — Real CRM with CRUD, Editable Stages, Activity Logging
// ══════════════════════════════════════════════════════════════════════════════

const LeadEngine = () => {
  // ── State ──
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [pg, setPg] = useState(1);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("table");
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [stageDropdown, setStageDropdown] = useState(null);
  const perPage = 20;

  // ── Load data from store ──
  useEffect(() => {
    setLeads(getLeads());
    setActivities(getActivities());
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  // ── Enrich leads with computed scores ──
  const enrichedLeads = useMemo(() => {
    return leads.map(l => ({
      ...l,
      score: calculateScore(l, activities),
      priority: getPriority(calculateScore(l, activities)),
    }));
  }, [leads, activities]);

  // ── Categories & filters ──
  const categories = useMemo(() => ["All", ...new Set(enrichedLeads.map(l => l.category).filter(Boolean))], [enrichedLeads]);

  const filtered = useMemo(() => {
    let f = enrichedLeads;
    if (search) {
      const s = search.toLowerCase();
      f = f.filter(l =>
        l.name.toLowerCase().includes(s) ||
        l.location.toLowerCase().includes(s) ||
        l.category.toLowerCase().includes(s) ||
        (l.contactName || '').toLowerCase().includes(s) ||
        (l.city || '').toLowerCase().includes(s) ||
        (l.notes || '').toLowerCase().includes(s)
      );
    }
    if (stageFilter !== "All") f = f.filter(l => l.stage === stageFilter);
    if (catFilter !== "All") f = f.filter(l => l.category === catFilter);
    f.sort((a, b) => {
      const m = sortDir === "asc" ? 1 : -1;
      if (sortBy === "score") return (a.score - b.score) * m;
      if (sortBy === "name") return a.name.localeCompare(b.name) * m;
      if (sortBy === "capacity") return ((a.capacity||0) - (b.capacity||0)) * m;
      if (sortBy === "revenue") return ((a.estimatedValue||0) - (b.estimatedValue||0)) * m;
      if (sortBy === "date") return (new Date(a.updatedAt) - new Date(b.updatedAt)) * m;
      if (sortBy === "stage") return (LEAD_STAGES.indexOf(a.stage) - LEAD_STAGES.indexOf(b.stage)) * m;
      return 0;
    });
    return f;
  }, [enrichedLeads, search, stageFilter, catFilter, sortBy, sortDir]);

  const paged = filtered.slice((pg - 1) * perPage, pg * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const stageCounts = useMemo(() => {
    const c = {};
    LEAD_STAGES.forEach(s => c[s] = 0);
    enrichedLeads.forEach(l => { if (c[l.stage] !== undefined) c[l.stage]++; });
    return c;
  }, [enrichedLeads]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  // ── Handlers ──
  const handleStageChange = (leadId, newStage) => {
    updateLead(leadId, { stage: newStage });
    setStageDropdown(null);
    refresh();
  };

  const handleCSVImported = (count) => {
    setShowCSVImport(false);
    refresh();
  };

  const handleLeadUpdated = () => {
    refresh();
  };

  // ── Stats ──
  const stats = useMemo(() => getLeadStats(), [refreshKey]);
  const activeLeads = enrichedLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
  const pipelineValue = activeLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0);
  const avgScore = activeLeads.length > 0
    ? Math.round(activeLeads.reduce((s, l) => s + l.score, 0) / activeLeads.length)
    : 0;

  // ── Lead Detail View ──
  if (selected) {
    return (
      <LeadDetail
        leadId={selected}
        onBack={() => { setSelected(null); refresh(); }}
        onUpdate={handleLeadUpdated}
      />
    );
  }

  // ── CSV Import Modal ──
  if (showCSVImport) {
    return <CSVImport onClose={() => setShowCSVImport(false)} onImported={handleCSVImported} />;
  }

  // ── Add Lead Modal ──
  if (showAddLead) {
    return <AddLeadForm onClose={() => setShowAddLead(false)} onCreated={() => { setShowAddLead(false); refresh(); }} />;
  }

  // ══════════════════════════════════════════════════════════════════
  // KANBAN VIEW
  // ══════════════════════════════════════════════════════════════════
  if (view === "kanban") {
    const kanbanStages = LEAD_STAGES.filter(s => s !== "Won" && s !== "Lost");
    return (
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Lead Engine</h1>
            <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>
              {enrichedLeads.length} leads · {activeLeads.length} active · Avg score {avgScore}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowAddLead(true)} style={btnStyle("accent")}>+ Add Lead</button>
            <button onClick={() => setShowCSVImport(true)} style={btnStyle("outline")}>⬆ Import CSV</button>
            <button onClick={() => setView("table")} style={btnStyle("outline")}>☰ Table</button>
            <button onClick={() => setView("kanban")} style={btnStyle("primary")}>▤ Kanban</button>
          </div>
        </div>

        {/* Kanban Columns */}
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {kanbanStages.map(stage => {
            const stageLeads = enrichedLeads.filter(l => l.stage === stage).slice(0, 12);
            const stageColor = C.stages[stage.toLowerCase()] || C.inkSec;
            return (
              <div key={stage} style={{ minWidth: 250, maxWidth: 250, background: C.bgWarm, borderRadius: 10, padding: 12, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: stageColor, textTransform: "uppercase", letterSpacing: 0.5 }}>{stage}</div>
                  <span style={pillStyle(C.card, C.inkSec)}>{stageCounts[stage]}</span>
                </div>
                {stageLeads.map(l => (
                  <div key={l.id} onClick={() => setSelected(l.id)} style={{ ...cardStyle({ padding: 12, marginBottom: 8, cursor: "pointer" }), borderLeft: `3px solid ${stageColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted }}>{l.location} · {l.capacity} pax</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <ScoreBadge score={l.score} />
                      {l.estimatedValue ? (
                        <span style={{ fontSize: 11, color: C.inkSec, fontWeight: 600 }}>{fmt(l.estimatedValue)}</span>
                      ) : (
                        <span style={{ fontSize: 10, color: C.inkMuted, fontStyle: "italic" }}>No value set</span>
                      )}
                    </div>
                    {l.assignedTo && (
                      <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 4 }}>
                        Assigned: {l.assignedTo}
                      </div>
                    )}
                  </div>
                ))}
                {stageCounts[stage] > 12 && (
                  <div style={{ fontSize: 11, textAlign: "center", color: C.inkMuted, padding: 8 }}>
                    +{stageCounts[stage] - 12} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TABLE VIEW (default)
  // ══════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Lead Engine</h1>
          <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>
            {filtered.length} of {enrichedLeads.length} leads · {stageCounts["Won"] || 0} won · {pipelineValue > 0 ? `${fmt(pipelineValue)} pipeline` : "No values set yet"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAddLead(true)} style={btnStyle("accent")}>+ Add Lead</button>
          <button onClick={() => setShowCSVImport(true)} style={btnStyle("outline")}>⬆ Import CSV</button>
          <button onClick={() => setView("table")} style={btnStyle("primary")}>☰ Table</button>
          <button onClick={() => setView("kanban")} style={btnStyle("outline")}>▤ Kanban</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Leads", value: enrichedLeads.length, sub: `${activeLeads.length} active` },
          { label: "Avg Score", value: avgScore, sub: avgScore >= 70 ? "Healthy" : avgScore >= 50 ? "Moderate" : "Needs work" },
          { label: "Pipeline Value", value: pipelineValue > 0 ? fmt(pipelineValue) : "—", sub: pipelineValue > 0 ? `${activeLeads.filter(l => l.estimatedValue).length} valued` : "Set values on leads" },
          { label: "Won / Lost", value: `${stageCounts["Won"] || 0} / ${stageCounts["Lost"] || 0}`, sub: "All time" },
        ].map((s, i) => (
          <div key={i} style={cardStyle({ padding: 16, textAlign: "center" })}>
            <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: C.ink }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Funnel */}
      <div style={cardStyle({ marginBottom: 20, padding: 16 })}>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 48 }}>
          {LEAD_STAGES.map((s) => {
            const count = stageCounts[s];
            const maxCount = Math.max(...Object.values(stageCounts));
            const h = maxCount > 0 ? Math.max(12, (count / maxCount) * 48) : 12;
            const stageKey = s.toLowerCase();
            return (
              <div key={s} onClick={() => { setStageFilter(stageFilter === s ? "All" : s); setPg(1); }} style={{ flex: 1, cursor: "pointer", textAlign: "center" }}>
                <div style={{ height: h, background: stageFilter === s ? C.stages[stageKey] || C.accent : (C.stages[stageKey] || C.accent) + "33", borderRadius: "4px 4px 0 0", transition: "all 0.2s", marginBottom: 6, opacity: stageFilter !== "All" && stageFilter !== s ? 0.3 : 1 }} />
                <div style={{ fontSize: 10, fontWeight: 600, color: stageFilter === s ? C.ink : C.inkMuted, letterSpacing: 0.3 }}>{count}</div>
                <div style={{ fontSize: 9, color: C.inkMuted, marginTop: 1 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPg(1); }} placeholder="Search leads, contacts, locations..." style={{ ...inputStyle, maxWidth: 280 }} />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPg(1); }} style={{ ...selectStyle, maxWidth: 220 }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={stageFilter} onChange={e => { setStageFilter(e.target.value); setPg(1); }} style={{ ...selectStyle, maxWidth: 180 }}>
          <option>All</option>
          {LEAD_STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(stageFilter !== "All" || catFilter !== "All" || search) && (
          <button onClick={() => { setStageFilter("All"); setCatFilter("All"); setSearch(""); setPg(1); }} style={btnStyle("ghost")}>✕ Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
              {[
                { key: "name", label: "Venue" },
                { key: "score", label: "Score" },
                { key: "stage", label: "Stage" },
                { key: "capacity", label: "Capacity" },
                { key: "revenue", label: "Est. Value" },
                { key: "date", label: "Updated" },
              ].map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                  {col.label} {sortBy === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(l => (
              <tr key={l.id} style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", transition: "background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = C.cardHover} onMouseLeave={e => e.currentTarget.style.background = ""}>
                <td style={{ padding: "10px 12px" }} onClick={() => setSelected(l.id)}>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted }}>
                    {l.contactName ? `${l.contactName} · ` : ''}{l.location}{l.city && l.city !== l.location ? `, ${l.city}` : ''}
                  </div>
                </td>
                <td style={{ padding: "10px 12px" }} onClick={() => setSelected(l.id)}><ScoreBadge score={l.score} /></td>
                <td style={{ padding: "10px 12px", position: "relative" }}>
                  <StagePill
                    stage={l.stage}
                    editable
                    onClick={(e) => { e.stopPropagation(); setStageDropdown(stageDropdown === l.id ? null : l.id); }}
                  />
                  {stageDropdown === l.id && (
                    <div style={{ position: "absolute", top: "100%", left: 12, zIndex: 100, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 160 }}>
                      {LEAD_STAGES.map(s => (
                        <div
                          key={s}
                          onClick={(e) => { e.stopPropagation(); handleStageChange(l.id, s); }}
                          style={{
                            padding: "6px 12px", fontSize: 12, cursor: "pointer", borderRadius: 4,
                            background: l.stage === s ? C.accentSubtle : "transparent",
                            fontWeight: l.stage === s ? 600 : 400,
                            color: l.stage === s ? C.accent : C.ink,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = C.bgWarm}
                          onMouseLeave={e => e.currentTarget.style.background = l.stage === s ? C.accentSubtle : "transparent"}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ padding: "10px 12px", fontSize: 12 }} onClick={() => setSelected(l.id)}>{l.capacity ? `${l.capacity} pax` : '—'}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }} onClick={() => setSelected(l.id)}>
                  {l.estimatedValue ? fmt(l.estimatedValue) : <span style={{ color: C.inkMuted, fontWeight: 400, fontStyle: "italic", fontSize: 11 }}>Not set</span>}
                </td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: C.inkMuted }} onClick={() => setSelected(l.id)}>{timeAgo(l.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: C.inkMuted }}>
            No leads match your filters. Try adjusting your search or filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13 }}>
          <span style={{ color: C.inkMuted }}>Showing {(pg - 1) * perPage + 1}–{Math.min(pg * perPage, filtered.length)} of {filtered.length}</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPg(p => Math.max(1, p - 1))} disabled={pg === 1} style={{ ...btnStyle("outline"), opacity: pg === 1 ? 0.4 : 1 }}>←</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) pageNum = i + 1;
              else if (pg <= 4) pageNum = i + 1;
              else if (pg >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = pg - 3 + i;
              return <button key={pageNum} onClick={() => setPg(pageNum)} style={{ ...btnStyle(pageNum === pg ? "primary" : "outline"), minWidth: 34 }}>{pageNum}</button>;
            })}
            <button onClick={() => setPg(p => Math.min(totalPages, p + 1))} disabled={pg === totalPages} style={{ ...btnStyle("outline"), opacity: pg === totalPages ? 0.4 : 1 }}>→</button>
          </div>
        </div>
      )}

      {/* Click outside to close stage dropdown */}
      {stageDropdown && (
        <div onClick={() => setStageDropdown(null)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ADD LEAD FORM
// ══════════════════════════════════════════════════════════════════════════════

const AddLeadForm = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '', location: '', city: '', category: '', capacity: '',
    contactName: '', contactEmail: '', contactPhone: '', website: '', notes: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Venue name is required'); return; }
    createLead({ ...form, capacity: parseInt(form.capacity) || 0, source: 'Manual' });
    onCreated();
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <button onClick={onClose} style={btnStyle("ghost")}>← Back to Leads</button>
      <div style={cardStyle({ marginTop: 16 })}>
        <h2 style={{ fontFamily: F.serif, fontSize: 22, margin: "0 0 20px 0" }}>Add New Lead</h2>
        {error && <div style={{ ...pillStyle(C.dangerBg, C.danger), marginBottom: 12, padding: "8px 12px" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          {field("Venue Name *", "name", "text", "e.g. The Grand Hall")}
          {field("Location", "location", "text", "e.g. Shoreditch")}
          {field("City", "city", "text", "e.g. London")}
          {field("Category", "category", "text", "e.g. Wedding Venue")}
          {field("Capacity (pax)", "capacity", "number", "e.g. 200")}
          {field("Website", "website", "url", "e.g. https://...")}
          {field("Contact Name", "contactName", "text", "e.g. John Smith")}
          {field("Contact Email", "contactEmail", "email", "")}
          {field("Contact Phone", "contactPhone", "tel", "")}
        </div>
        {field("Notes", "notes", "textarea", "Any additional information about this venue...")}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={handleSubmit} style={btnStyle("accent")}>Create Lead</button>
          <button onClick={onClose} style={btnStyle("outline")}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default LeadEngine;
