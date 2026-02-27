import { useState, useEffect, useMemo } from "react";
import { getLead, updateLead, deleteLead, getActivities, logActivity, calculateScore, getPriority, LEAD_STAGES } from "../lib/store";

// ── Theme ──
const C = {
  bg: "#FAFAF8", bgWarm: "#F5F1EC", card: "#FFFFFF", cardHover: "#FDFCFA",
  ink: "#18150F", inkSec: "#5C564E", inkMuted: "#9A948C",
  accent: "#7D5A1A", accentLight: "#B8922E", accentSubtle: "rgba(125,90,26,0.06)",
  border: "#E6E1D9", borderLight: "#F0ECE5",
  success: "#2B7A4B", successBg: "#F0F9F3",
  warn: "#956018", warnBg: "#FFF9F0",
  danger: "#9B3535", dangerBg: "#FDF2F2",
  info: "#2A6680", infoBg: "#F0F7FA",
  stages: { identified:"#2A6680", researched:"#5B6AAF", contacted:"#956018", responded:"#B8922E", qualified:"#2B7A4B", "meeting booked":"#1A6B4A", won:"#18150F", lost:"#9A948C" },
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };

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
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const TEAM = [
  { name: "Joe Stokoe", initials: "JS" },
  { name: "Matt Robertson", initials: "MR" },
  { name: "Emily Blacklock", initials: "EB" },
  { name: "Seb Davis", initials: "SD" },
  { name: "Jason Sales", initials: "JSa" },
  { name: "Anja Rubin", initials: "AR" },
  { name: "Katy Kedslie", initials: "KK" },
];

const ACTIVITY_ICONS = {
  note: "📝", call: "📞", email: "✉️", meeting: "🤝",
  stage_change: "→", created: "✦",
};

// ══════════════════════════════════════════════════════════════════════════════
// LEAD DETAIL — Full venue info, editable fields, activity timeline
// ══════════════════════════════════════════════════════════════════════════════

const LeadDetail = ({ leadId, onBack, onUpdate }) => {
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [noteText, setNoteText] = useState('');
  const [activityType, setActivityType] = useState('note');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const l = getLead(leadId);
    if (l) {
      setLead(l);
      setForm({
        contactName: l.contactName || '',
        contactEmail: l.contactEmail || '',
        contactPhone: l.contactPhone || '',
        website: l.website || '',
        notes: l.notes || '',
        estimatedValue: l.estimatedValue || '',
        assignedTo: l.assignedTo || '',
        capacity: l.capacity || '',
        category: l.category || '',
      });
    }
    setActivities(getActivities(leadId));
  }, [leadId, refreshKey]);

  if (!lead) return <div style={{ padding: 24 }}><button onClick={onBack} style={btnStyle("ghost")}>← Back</button><p>Lead not found.</p></div>;

  const allActivities = getActivities();
  const score = calculateScore(lead, allActivities);
  const priority = getPriority(score);
  const stageColor = C.stages[lead.stage.toLowerCase()] || C.inkSec;

  const handleSave = () => {
    updateLead(leadId, {
      ...form,
      capacity: parseInt(form.capacity) || lead.capacity,
      estimatedValue: parseFloat(form.estimatedValue) || null,
    });
    setEditing(false);
    setRefreshKey(k => k + 1);
    onUpdate?.();
  };

  const handleStageChange = (newStage) => {
    updateLead(leadId, { stage: newStage });
    setRefreshKey(k => k + 1);
    onUpdate?.();
  };

  const handleAddActivity = () => {
    if (!noteText.trim()) return;
    logActivity(leadId, activityType, noteText.trim());
    setNoteText('');
    setRefreshKey(k => k + 1);
    onUpdate?.();
  };

  const handleDelete = () => {
    deleteLead(leadId);
    onBack();
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <button onClick={onBack} style={btnStyle("ghost")}>← Back to Leads</button>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        {/* ── Left Column: Lead Info ── */}
        <div>
          {/* Header Card */}
          <div style={cardStyle({ marginBottom: 16 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: F.serif, fontSize: 24, margin: 0 }}>{lead.name}</h2>
                <div style={{ color: C.inkSec, fontSize: 13, marginTop: 4 }}>
                  {lead.location}{lead.city && lead.city !== lead.location ? `, ${lead.city}` : ''} · {lead.category}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={pillStyle(stageColor + "15", stageColor)}>{lead.stage}</span>
                <span style={pillStyle(
                  score >= 75 ? C.successBg : score >= 55 ? C.warnBg : C.dangerBg,
                  score >= 75 ? C.success : score >= 55 ? C.warn : C.danger
                )}>Score: {score}</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div style={{ background: C.bgWarm, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Score Breakdown</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 12 }}>
                <div>
                  <div style={{ color: C.inkMuted, fontSize: 10 }}>Capacity Fit</div>
                  <div style={{ fontWeight: 600 }}>{lead.capacity >= 50 && lead.capacity <= 300 ? '20/20' : lead.capacity >= 30 && lead.capacity <= 500 ? '12/20' : lead.capacity > 0 ? '5/20' : '0/20'}</div>
                </div>
                <div>
                  <div style={{ color: C.inkMuted, fontSize: 10 }}>Activity</div>
                  <div style={{ fontWeight: 600 }}>{activities.length > 0 ? 'Active' : 'None'}</div>
                </div>
                <div>
                  <div style={{ color: C.inkMuted, fontSize: 10 }}>Venue Type</div>
                  <div style={{ fontWeight: 600 }}>{lead.category?.toLowerCase().includes('event') || lead.category?.toLowerCase().includes('wedding') ? 'Ideal' : 'Mixed'}</div>
                </div>
                <div>
                  <div style={{ color: C.inkMuted, fontSize: 10 }}>Pipeline Stage</div>
                  <div style={{ fontWeight: 600 }}>{lead.stage}</div>
                </div>
              </div>
            </div>

            {/* Stage Pipeline */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Pipeline Stage — Click to change</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {LEAD_STAGES.map(s => {
                  const isActive = s === lead.stage;
                  const isPast = LEAD_STAGES.indexOf(s) < LEAD_STAGES.indexOf(lead.stage);
                  const sColor = C.stages[s.toLowerCase()] || C.inkSec;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStageChange(s)}
                      style={{
                        padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: isActive ? 700 : 400,
                        border: `1px solid ${isActive ? sColor : C.border}`,
                        background: isActive ? sColor + "20" : isPast ? C.bgWarm : "transparent",
                        color: isActive ? sColor : isPast ? C.inkSec : C.inkMuted,
                        cursor: "pointer", fontFamily: F.sans,
                      }}
                    >
                      {isPast && "✓ "}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div style={{ padding: 12, background: C.bgWarm, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.inkMuted, marginBottom: 2 }}>Capacity</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif }}>{lead.capacity ? `${lead.capacity} pax` : '—'}</div>
              </div>
              <div style={{ padding: 12, background: C.bgWarm, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.inkMuted, marginBottom: 2 }}>Est. Value</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif }}>{lead.estimatedValue ? fmt(lead.estimatedValue) : '—'}</div>
              </div>
              <div style={{ padding: 12, background: C.bgWarm, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.inkMuted, marginBottom: 2 }}>Priority</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif, color: priority === 'High' ? C.success : priority === 'Medium' ? C.warn : C.danger }}>{priority}</div>
              </div>
            </div>
          </div>

          {/* Editable Details Card */}
          <div style={cardStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif }}>Details</div>
              {editing ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={handleSave} style={btnStyle("accent")}>Save</button>
                  <button onClick={() => setEditing(false)} style={btnStyle("outline")}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} style={btnStyle("outline")}>✎ Edit</button>
              )}
            </div>

            {editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                {[
                  { label: "Contact Name", key: "contactName" },
                  { label: "Contact Email", key: "contactEmail" },
                  { label: "Contact Phone", key: "contactPhone" },
                  { label: "Website", key: "website" },
                  { label: "Capacity", key: "capacity", type: "number" },
                  { label: "Category", key: "category" },
                  { label: "Estimated Value (£)", key: "estimatedValue", type: "number" },
                  { label: "Assigned To", key: "assignedTo", type: "select" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: C.inkMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={selectStyle}>
                        <option value="">Unassigned</option>
                        {TEAM.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type || "text"}
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={inputStyle}
                      />
                    )}
                  </div>
                ))}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: C.inkMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", fontSize: 13 }}>
                {[
                  { label: "Contact", value: lead.contactName || "—" },
                  { label: "Email", value: lead.contactEmail || "—" },
                  { label: "Phone", value: lead.contactPhone || "—" },
                  { label: "Website", value: lead.website ? <a href={lead.website} target="_blank" rel="noopener" style={{ color: C.accent }}>{lead.website.replace(/^https?:\/\//, '').slice(0, 30)}</a> : "—" },
                  { label: "Capacity", value: lead.capacity ? `${lead.capacity} pax` : "—" },
                  { label: "Category", value: lead.category || "—" },
                  { label: "Est. Value", value: lead.estimatedValue ? fmt(lead.estimatedValue) : "—" },
                  { label: "Assigned", value: lead.assignedTo || "Unassigned" },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, color: C.inkMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
                    <div style={{ marginTop: 2 }}>{f.value}</div>
                  </div>
                ))}
                {lead.notes && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 10, color: C.inkMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Notes</div>
                    <div style={{ marginTop: 2, lineHeight: 1.5 }}>{lead.notes}</div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkMuted }}>
              <span>Added {fmtDate(lead.createdAt)} · Source: {lead.source}</span>
              <span>Last updated {fmtDate(lead.updatedAt)}</span>
            </div>

            {/* Delete */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}>
              {showDeleteConfirm ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.danger }}>Are you sure? This cannot be undone.</span>
                  <button onClick={handleDelete} style={btnStyle("danger")}>Delete</button>
                  <button onClick={() => setShowDeleteConfirm(false)} style={btnStyle("outline")}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} style={{ ...btnStyle("ghost"), color: C.danger, fontSize: 11 }}>Delete this lead</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Activity Timeline ── */}
        <div>
          <div style={cardStyle({ marginBottom: 16 })}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>Log Activity</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {['note', 'call', 'email', 'meeting'].map(t => (
                <button
                  key={t}
                  onClick={() => setActivityType(t)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: activityType === t ? 600 : 400,
                    border: `1px solid ${activityType === t ? C.accent : C.border}`,
                    background: activityType === t ? C.accentSubtle : "transparent",
                    color: activityType === t ? C.accent : C.inkSec,
                    cursor: "pointer", fontFamily: F.sans, textTransform: "capitalize",
                  }}
                >
                  {ACTIVITY_ICONS[t]} {t}
                </button>
              ))}
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder={`Add a ${activityType}...`}
              style={{ ...inputStyle, minHeight: 70, resize: "vertical", marginBottom: 8 }}
            />
            <button
              onClick={handleAddActivity}
              disabled={!noteText.trim()}
              style={{ ...btnStyle("accent"), opacity: noteText.trim() ? 1 : 0.4, width: "100%" }}
            >
              Log {activityType}
            </button>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>
              Activity Timeline
              <span style={{ fontSize: 11, fontWeight: 400, color: C.inkMuted, marginLeft: 8 }}>{activities.length} entries</span>
            </div>
            {activities.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: C.inkMuted, fontSize: 13 }}>
                No activity yet. Log a note, call, email, or meeting to start tracking.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {activities.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < activities.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                      background: a.type === 'stage_change' ? C.accentSubtle :
                                  a.type === 'created' ? C.infoBg : C.bgWarm,
                    }}>
                      {ACTIVITY_ICONS[a.type] || "•"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, lineHeight: 1.4 }}>{a.description}</div>
                      <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 2 }}>
                        {a.userName || 'System'} · {fmtDate(a.createdAt)} {fmtTime(a.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
