import { useState, useEffect, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Client CRM — Post-Conversion Relationship Management
// Contact history, meeting notes, follow-up reminders
// ═══════════════════════════════════════════════════════════════

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

// Style helpers
const cardStyle = (extra = {}) => ({
  background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
  padding: 20, marginBottom: 14, ...extra,
});
const btnStyle = (variant = "primary", extra = {}) => ({
  padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
  fontFamily: F.sans, fontSize: 13, fontWeight: 600, transition: "all .15s",
  ...(variant === "primary" ? { background: C.accent, color: "#fff" } :
    variant === "danger" ? { background: C.danger, color: "#fff" } :
    variant === "success" ? { background: C.success, color: "#fff" } :
    { background: C.bgWarm, color: C.ink, border: `1px solid ${C.border}` }),
  ...extra,
});
const pillStyle = (color, bg, extra = {}) => ({
  display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11,
  fontWeight: 600, fontFamily: F.sans, color, background: bg, ...extra,
});
const inputStyle = (extra = {}) => ({
  width: "100%", padding: "9px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
  fontFamily: F.sans, fontSize: 13, color: C.ink, background: "#fff",
  outline: "none", boxSizing: "border-box", ...extra,
});

const STATUS_CONFIG = {
  VIP: { color: C.accent, bg: "rgba(125,90,26,0.1)" },
  Active: { color: C.success, bg: C.successBg },
  New: { color: C.info, bg: C.infoBg },
  Dormant: { color: C.inkMuted, bg: C.bgWarm },
};

const PRIORITY_CONFIG = {
  high: { color: C.danger, bg: C.dangerBg, label: "High" },
  medium: { color: C.warn, bg: C.warnBg, label: "Medium" },
  low: { color: C.info, bg: C.infoBg, label: "Low" },
};

const CONTACT_ICONS = { call: "\u260E", email: "\u2709", meeting: "\u{1F91D}" };

const STORAGE_KEY = "hht_client_crm";

const TEAM = ["Joe Stokoe", "Matt Robertson", "Emily Blacklock", "Seb Davis"];

const DEFAULT_CLIENTS = [
  {
    id: "c1", company: "Diageo", status: "VIP", lifetimeValue: 45000,
    eventsCompleted: 4, upcomingEvents: 1, healthScore: 92,
    contact: { name: "Sarah Mitchell", role: "Events Director", email: "s.mitchell@diageo.com", phone: "+44 20 7927 5200" },
    accountManager: "Joe Stokoe",
    tags: ["spirits-brand", "VIP", "annual-contract"],
    contactHistory: [
      { id: "h1", type: "meeting", date: "2026-02-28", notes: "Q1 review — confirmed summer activation series. 3 events across June-Aug. Budget approved at £12K per event." },
      { id: "h2", type: "call", date: "2026-02-14", notes: "Discussed Johnnie Walker activation concept. Sarah keen on immersive cocktail experience format." },
      { id: "h3", type: "email", date: "2026-01-20", notes: "Sent proposal for World Class bartender showcase. Awaiting internal sign-off." },
    ],
    followUps: [
      { id: "f1", date: "2026-03-10", note: "Confirm summer activation dates and venue shortlist", priority: "high", snoozed: false },
      { id: "f2", date: "2026-03-18", note: "Send updated pricing for Johnnie Walker concept", priority: "medium", snoozed: false },
    ],
    meetingNotes: [
      { id: "m1", date: "2026-02-28", title: "Q1 Business Review", attendees: "Sarah Mitchell, Joe Stokoe", notes: "Reviewed 2025 events — all scored 9+ on client satisfaction. 2026 budget increased 15%. Exploring partnership for autumn portfolio tasting." },
    ],
  },
  {
    id: "c2", company: "Pernod Ricard", status: "Active", lifetimeValue: 28000,
    eventsCompleted: 1, upcomingEvents: 1, healthScore: 78,
    contact: { name: "Emma Laurent", role: "Brand Manager", email: "e.laurent@pernod-ricard.com", phone: "+44 20 8538 4484" },
    accountManager: "Emily Blacklock",
    tags: ["spirits-brand", "corporate"],
    contactHistory: [
      { id: "h4", type: "call", date: "2026-02-20", notes: "Discussed Jameson brand activation for St Patrick's Day pop-up. Emma confirmed £8K budget." },
      { id: "h5", type: "email", date: "2026-02-05", notes: "Follow-up on Absolut summer campaign. Waiting on creative team approvals." },
    ],
    followUps: [
      { id: "f3", date: "2026-03-07", note: "Send St Patrick's Day event run-sheet", priority: "high", snoozed: false },
    ],
    meetingNotes: [],
  },
  {
    id: "c3", company: "William Grant & Sons", status: "Active", lifetimeValue: 18500,
    eventsCompleted: 1, upcomingEvents: 0, healthScore: 65,
    contact: { name: "Tom Hendricks", role: "Marketing Lead", email: "t.hendricks@wgrant.com", phone: "+44 20 8965 3200" },
    accountManager: "Matt Robertson",
    tags: ["spirits-brand", "corporate"],
    contactHistory: [
      { id: "h6", type: "meeting", date: "2026-01-15", notes: "Hendrick's Gin garden party debrief. Very positive feedback. Tom interested in repeat for 2026 summer." },
    ],
    followUps: [
      { id: "f4", date: "2026-03-20", note: "Pitch 2026 summer garden party concept", priority: "medium", snoozed: false },
    ],
    meetingNotes: [
      { id: "m2", date: "2026-01-15", title: "Hendrick's Garden Party Debrief", attendees: "Tom Hendricks, Matt Robertson", notes: "Event scored 8.5/10. Guest engagement was excellent. Tom wants to explore adding a masterclass element for 2026. Budget likely similar at £18-20K." },
    ],
  },
  {
    id: "c4", company: "Campari Group", status: "New", lifetimeValue: 0,
    eventsCompleted: 0, upcomingEvents: 0, healthScore: 40,
    contact: { name: "Marco Rossi", role: "UK Events", email: "m.rossi@camparigroup.com", phone: "+44 20 7290 0790" },
    accountManager: "Seb Davis",
    tags: ["spirits-brand", "corporate"],
    contactHistory: [
      { id: "h7", type: "email", date: "2026-02-25", notes: "Initial outreach — introduced HH&T services and portfolio. Marco responded positively, requested capabilities deck." },
    ],
    followUps: [
      { id: "f5", date: "2026-03-08", note: "Schedule intro call with Marco", priority: "high", snoozed: false },
    ],
    meetingNotes: [],
  },
  {
    id: "c5", company: "LVMH", status: "VIP", lifetimeValue: 35000,
    eventsCompleted: 1, upcomingEvents: 1, healthScore: 85,
    contact: { name: "Charlotte DuPont", role: "Head of Events", email: "c.dupont@lvmh.com", phone: "+44 20 7318 4000" },
    accountManager: "Joe Stokoe",
    tags: ["VIP", "luxury", "corporate", "annual-contract"],
    contactHistory: [
      { id: "h8", type: "meeting", date: "2026-02-10", notes: "Discussed Moet & Chandon summer soiree. Charlotte wants premium champagne bar with bespoke cocktail menu. Budget £35K." },
      { id: "h9", type: "call", date: "2026-01-28", notes: "Quick catch-up on Hennessy tasting event logistics. All on track for April." },
    ],
    followUps: [
      { id: "f6", date: "2026-03-12", note: "Send Moet summer soiree proposal with venue options", priority: "high", snoozed: false },
    ],
    meetingNotes: [
      { id: "m3", date: "2026-02-10", title: "LVMH Summer Planning", attendees: "Charlotte DuPont, Joe Stokoe, Emily Blacklock", notes: "Charlotte outlined vision for an ultra-premium champagne experience. 200 guests, central London venue. Wants HH&T to handle full bar and staffing. Discussed Kensington Palace Orangery and Somerset House as venue options." },
    ],
  },
  {
    id: "c6", company: "BrewDog", status: "Active", lifetimeValue: 22000,
    eventsCompleted: 2, upcomingEvents: 0, healthScore: 70,
    contact: { name: "Kiera Walsh", role: "Events Coordinator", email: "k.walsh@brewdog.com", phone: "+44 1358 724924" },
    accountManager: "Matt Robertson",
    tags: ["craft-beer", "corporate"],
    contactHistory: [
      { id: "h10", type: "call", date: "2026-02-18", notes: "Kiera interested in a craft cocktail pop-up for BrewDog Waterloo launch. Discussed hybrid beer-cocktail menu concept." },
      { id: "h11", type: "email", date: "2026-01-30", notes: "Sent post-event report for January tasting event. NPS score: 72." },
    ],
    followUps: [
      { id: "f7", date: "2026-03-15", note: "Follow up on Waterloo pop-up proposal", priority: "medium", snoozed: false },
    ],
    meetingNotes: [],
  },
  {
    id: "c7", company: "Fever-Tree", status: "Active", lifetimeValue: 11000,
    eventsCompleted: 1, upcomingEvents: 0, healthScore: 58,
    contact: { name: "James Park", role: "Brand Activation", email: "j.park@fever-tree.com", phone: "+44 20 7349 4922" },
    accountManager: "Emily Blacklock",
    tags: ["mixers", "corporate"],
    contactHistory: [
      { id: "h12", type: "meeting", date: "2025-12-05", notes: "Year-end review. Fever-Tree happy with G&T festival activation. Exploring summer 2026 collaboration." },
    ],
    followUps: [
      { id: "f8", date: "2026-03-25", note: "Pitch summer 2026 G&T festival concept", priority: "low", snoozed: false },
    ],
    meetingNotes: [
      { id: "m4", date: "2025-12-05", title: "Year-End Review", attendees: "James Park, Emily Blacklock", notes: "2025 G&T festival was a success — 500+ attendees, strong social media reach. James wants to scale up for 2026 with multiple dates. Budget discussion deferred to Q1." },
    ],
  },
  {
    id: "c8", company: "Private Clients", status: "Active", lifetimeValue: 32000,
    eventsCompleted: 5, upcomingEvents: 2, healthScore: 88,
    contact: { name: "Various", role: "Private Events", email: "events@hht.co.uk", phone: "+44 20 7946 0958" },
    accountManager: "Joe Stokoe",
    tags: ["private", "weddings", "parties"],
    contactHistory: [
      { id: "h13", type: "call", date: "2026-03-01", notes: "Wedding booking confirmed for June 14th. 150 guests, full cocktail bar + champagne reception." },
      { id: "h14", type: "email", date: "2026-02-22", notes: "Birthday party enquiry for April — rooftop venue, 80 guests, cocktail masterclass included." },
    ],
    followUps: [
      { id: "f9", date: "2026-03-06", note: "Send wedding cocktail menu options", priority: "high", snoozed: false },
      { id: "f10", date: "2026-03-12", note: "Confirm birthday party venue availability", priority: "medium", snoozed: false },
    ],
    meetingNotes: [],
  },
];

function genId() { return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7); }

function calcHealthColor(score) {
  if (score >= 80) return C.success;
  if (score >= 60) return C.warn;
  return C.danger;
}

export default function ClientCRM() {
  const [clients, setClients] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CLIENTS;
    } catch { return DEFAULT_CLIENTS; }
  });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [contactForm, setContactForm] = useState({ type: "call", date: "", notes: "" });
  const [followUpForm, setFollowUpForm] = useState({ date: "", note: "", priority: "medium" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  const filtered = useMemo(() => {
    let list = clients;
    if (filterStatus !== "All") list = list.filter(c => c.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.company.toLowerCase().includes(q) ||
        c.contact.name.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [clients, search, filterStatus]);

  const selected = useMemo(() => clients.find(c => c.id === selectedId), [clients, selectedId]);

  const updateClient = useCallback((id, updater) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updater(c) } : c));
  }, []);

  const addContactEntry = () => {
    if (!contactForm.notes.trim() || !contactForm.date) return;
    updateClient(selectedId, c => ({
      contactHistory: [{ id: genId(), ...contactForm }, ...c.contactHistory],
    }));
    setContactForm({ type: "call", date: "", notes: "" });
    setShowContactForm(false);
  };

  const addFollowUp = () => {
    if (!followUpForm.note.trim() || !followUpForm.date) return;
    updateClient(selectedId, c => ({
      followUps: [...c.followUps, { id: genId(), ...followUpForm, snoozed: false }],
    }));
    setFollowUpForm({ date: "", note: "", priority: "medium" });
    setShowFollowUpForm(false);
  };

  const snoozeFollowUp = (clientId, fId) => {
    updateClient(clientId, c => ({
      followUps: c.followUps.map(f => {
        if (f.id !== fId) return f;
        const d = new Date(f.date);
        d.setDate(d.getDate() + 3);
        return { ...f, date: d.toISOString().split("T")[0], snoozed: true };
      }),
    }));
  };

  const completeFollowUp = (clientId, fId) => {
    updateClient(clientId, c => ({
      followUps: c.followUps.filter(f => f.id !== fId),
    }));
  };

  const removeTag = (clientId, tag) => {
    updateClient(clientId, c => ({ tags: c.tags.filter(t => t !== tag) }));
  };

  const [newTag, setNewTag] = useState("");
  const addTag = (clientId) => {
    if (!newTag.trim()) return;
    updateClient(clientId, c => ({ tags: [...new Set([...c.tags, newTag.trim().toLowerCase()])] }));
    setNewTag("");
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = clients.length;
    const vip = clients.filter(c => c.status === "VIP").length;
    const totalValue = clients.reduce((s, c) => s + c.lifetimeValue, 0);
    const upcoming = clients.reduce((s, c) => s + c.upcomingEvents, 0);
    const overdue = clients.reduce((s, c) => s + c.followUps.filter(f => f.date < "2026-03-05").length, 0);
    return { total, vip, totalValue, upcoming, overdue };
  }, [clients]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.sans, color: C.ink }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, margin: 0, color: C.ink }}>Client Relationships</h1>
          <p style={{ fontSize: 13, color: C.inkMuted, margin: "2px 0 0" }}>Post-conversion CRM &mdash; contacts, follow-ups, meeting notes</p>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {[
            { label: "Clients", value: stats.total },
            { label: "VIP", value: stats.vip },
            { label: "Lifetime Value", value: `£${(stats.totalValue / 1000).toFixed(0)}K` },
            { label: "Upcoming", value: stats.upcoming },
            { label: "Overdue Follow-ups", value: stats.overdue, color: stats.overdue > 0 ? C.danger : C.inkMuted },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color || C.accent, fontFamily: F.serif }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 80px)" }}>
        {/* Sidebar — Client List */}
        <div style={{ width: 320, borderRight: `1px solid ${C.border}`, background: C.card, overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: 14 }}>
            <input style={inputStyle({ marginBottom: 10 })} placeholder="Search clients or tags..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["All", "VIP", "Active", "New", "Dormant"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ ...btnStyle("ghost", { padding: "4px 12px", fontSize: 11 }),
                    ...(filterStatus === s ? { background: C.accent, color: "#fff" } : {}) }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {filtered.map(c => (
            <div key={c.id} onClick={() => { setSelectedId(c.id); setActiveTab("overview"); }}
              style={{ padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${C.borderLight}`,
                background: selectedId === c.id ? C.accentSubtle : "transparent",
                borderLeft: selectedId === c.id ? `3px solid ${C.accent}` : "3px solid transparent",
                transition: "all .12s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.company}</span>
                <span style={pillStyle(STATUS_CONFIG[c.status].color, STATUS_CONFIG[c.status].bg)}>{c.status}</span>
              </div>
              <div style={{ fontSize: 12, color: C.inkSec, marginTop: 3 }}>{c.contact.name} &middot; {c.contact.role}</div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>
                £{(c.lifetimeValue / 1000).toFixed(1)}K &middot; {c.eventsCompleted} events &middot; Health: {c.healthScore}%
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: C.inkMuted, fontSize: 13 }}>No clients match your search.</div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!selected ? (
            <div style={{ ...cardStyle({ textAlign: "center", padding: 60 }) }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>&#x1F465;</div>
              <h2 style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 600, margin: "0 0 6px" }}>Select a Client</h2>
              <p style={{ color: C.inkMuted, fontSize: 14 }}>Choose a client from the list to view their relationship details, contact history, and follow-ups.</p>
            </div>
          ) : (
            <>
              {/* Client Header Card */}
              <div style={cardStyle({ display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h2 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, margin: 0 }}>{selected.company}</h2>
                    <span style={pillStyle(STATUS_CONFIG[selected.status].color, STATUS_CONFIG[selected.status].bg, { fontSize: 12 })}>{selected.status}</span>
                  </div>
                  <div style={{ fontSize: 14, color: C.inkSec }}>
                    {selected.contact.name} &mdash; {selected.contact.role}
                  </div>
                  <div style={{ fontSize: 13, color: C.inkMuted, marginTop: 4 }}>
                    {selected.contact.email} &middot; {selected.contact.phone}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {selected.tags.map(t => (
                      <span key={t} style={pillStyle(C.accent, C.accentSubtle, { cursor: "pointer" })} onClick={() => removeTag(selected.id, t)}>
                        {t} &times;
                      </span>
                    ))}
                    <span style={{ display: "inline-flex", gap: 4 }}>
                      <input style={inputStyle({ width: 100, padding: "2px 8px", fontSize: 11 })} placeholder="+ tag" value={newTag}
                        onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag(selected.id)} />
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Lifetime Value</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.serif, color: C.accent }}>£{selected.lifetimeValue.toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", marginTop: 8 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.eventsCompleted}</div>
                      <div style={{ fontSize: 10, color: C.inkMuted }}>Completed</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.success }}>{selected.upcomingEvents}</div>
                      <div style={{ fontSize: 10, color: C.inkMuted }}>Upcoming</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", marginBottom: 3 }}>Health Score</div>
                    <div style={{ background: C.bgWarm, borderRadius: 99, height: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${selected.healthScore}%`, background: calcHealthColor(selected.healthScore), borderRadius: 99, transition: "width .3s" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: calcHealthColor(selected.healthScore), marginTop: 2 }}>{selected.healthScore}%</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 6 }}>Manager: <strong style={{ color: C.ink }}>{selected.accountManager}</strong></div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                {[
                  { key: "overview", label: "Contact History" },
                  { key: "followups", label: "Follow-ups" },
                  { key: "meetings", label: "Meeting Notes" },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: F.sans,
                      border: "none", background: "transparent", cursor: "pointer",
                      color: activeTab === t.key ? C.accent : C.inkMuted,
                      borderBottom: activeTab === t.key ? `2px solid ${C.accent}` : "2px solid transparent",
                      transition: "all .15s" }}>
                    {t.label}
                    {t.key === "followups" && selected.followUps.length > 0 && (
                      <span style={pillStyle("#fff", C.danger, { marginLeft: 6, fontSize: 10 })}>{selected.followUps.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Contact History Tab */}
              {activeTab === "overview" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: 0 }}>Contact History</h3>
                    <button style={btnStyle("primary", { fontSize: 12 })} onClick={() => setShowContactForm(!showContactForm)}>
                      {showContactForm ? "Cancel" : "+ Log Contact"}
                    </button>
                  </div>

                  {showContactForm && (
                    <div style={cardStyle({ background: C.accentSubtle, border: `1px solid ${C.accentLight}` })}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <select style={inputStyle({ width: "auto" })} value={contactForm.type} onChange={e => setContactForm(p => ({ ...p, type: e.target.value }))}>
                          <option value="call">Call</option>
                          <option value="email">Email</option>
                          <option value="meeting">Meeting</option>
                        </select>
                        <input type="date" style={inputStyle({ width: "auto" })} value={contactForm.date} onChange={e => setContactForm(p => ({ ...p, date: e.target.value }))} />
                      </div>
                      <textarea style={inputStyle({ height: 70, resize: "vertical" })} placeholder="Notes about the interaction..." value={contactForm.notes}
                        onChange={e => setContactForm(p => ({ ...p, notes: e.target.value }))} />
                      <button style={btnStyle("primary", { marginTop: 10 })} onClick={addContactEntry}>Save Entry</button>
                    </div>
                  )}

                  <div style={{ position: "relative", paddingLeft: 28 }}>
                    <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: C.borderLight }} />
                    {selected.contactHistory.map(h => (
                      <div key={h.id} style={{ position: "relative", marginBottom: 16 }}>
                        <div style={{ position: "absolute", left: -22, top: 4, width: 22, height: 22, borderRadius: "50%",
                          background: C.card, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                          {CONTACT_ICONS[h.type]}
                        </div>
                        <div style={cardStyle({ marginLeft: 10, marginBottom: 0 })}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={pillStyle(
                              h.type === "call" ? C.info : h.type === "email" ? C.warn : C.success,
                              h.type === "call" ? C.infoBg : h.type === "email" ? C.warnBg : C.successBg
                            )}>
                              {h.type.charAt(0).toUpperCase() + h.type.slice(1)}
                            </span>
                            <span style={{ fontSize: 12, color: C.inkMuted }}>{h.date}</span>
                          </div>
                          <p style={{ fontSize: 13, color: C.inkSec, margin: 0, lineHeight: 1.5 }}>{h.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selected.contactHistory.length === 0 && (
                    <p style={{ color: C.inkMuted, fontSize: 13, textAlign: "center", padding: 20 }}>No contact history yet. Log your first interaction above.</p>
                  )}
                </div>
              )}

              {/* Follow-ups Tab */}
              {activeTab === "followups" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: 0 }}>Follow-up Reminders</h3>
                    <button style={btnStyle("primary", { fontSize: 12 })} onClick={() => setShowFollowUpForm(!showFollowUpForm)}>
                      {showFollowUpForm ? "Cancel" : "+ Add Reminder"}
                    </button>
                  </div>

                  {showFollowUpForm && (
                    <div style={cardStyle({ background: C.accentSubtle, border: `1px solid ${C.accentLight}` })}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input type="date" style={inputStyle({ flex: 1 })} value={followUpForm.date} onChange={e => setFollowUpForm(p => ({ ...p, date: e.target.value }))} />
                        <select style={inputStyle({ width: "auto" })} value={followUpForm.priority} onChange={e => setFollowUpForm(p => ({ ...p, priority: e.target.value }))}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <input style={inputStyle()} placeholder="Follow-up note..." value={followUpForm.note} onChange={e => setFollowUpForm(p => ({ ...p, note: e.target.value }))} />
                      <button style={btnStyle("primary", { marginTop: 10 })} onClick={addFollowUp}>Add Reminder</button>
                    </div>
                  )}

                  {selected.followUps.sort((a, b) => a.date.localeCompare(b.date)).map(f => {
                    const overdue = f.date < "2026-03-05";
                    const pc = PRIORITY_CONFIG[f.priority];
                    return (
                      <div key={f.id} style={cardStyle({ display: "flex", justifyContent: "space-between", alignItems: "center",
                        borderLeft: `3px solid ${overdue ? C.danger : pc.color}`,
                        background: overdue ? C.dangerBg : C.card })}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                            <span style={pillStyle(pc.color, pc.bg)}>{pc.label}</span>
                            <span style={{ fontSize: 12, color: overdue ? C.danger : C.inkMuted, fontWeight: overdue ? 700 : 400 }}>
                              {overdue ? "OVERDUE — " : ""}{f.date}
                            </span>
                            {f.snoozed && <span style={pillStyle(C.inkMuted, C.bgWarm)}>Snoozed</span>}
                          </div>
                          <p style={{ fontSize: 13, color: C.inkSec, margin: 0 }}>{f.note}</p>
                        </div>
                        <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                          <button style={btnStyle("ghost", { padding: "5px 10px", fontSize: 11 })} onClick={() => snoozeFollowUp(selected.id, f.id)}>Snooze +3d</button>
                          <button style={btnStyle("success", { padding: "5px 10px", fontSize: 11 })} onClick={() => completeFollowUp(selected.id, f.id)}>Done</button>
                        </div>
                      </div>
                    );
                  })}
                  {selected.followUps.length === 0 && (
                    <p style={{ color: C.inkMuted, fontSize: 13, textAlign: "center", padding: 20 }}>No follow-ups scheduled. Add a reminder above.</p>
                  )}
                </div>
              )}

              {/* Meeting Notes Tab */}
              {activeTab === "meetings" && (
                <div>
                  <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 14px" }}>Meeting Notes</h3>
                  {selected.meetingNotes.length === 0 ? (
                    <p style={{ color: C.inkMuted, fontSize: 13, textAlign: "center", padding: 20 }}>
                      No meeting notes recorded. Meeting entries from the Contact History will appear here when logged as meetings.
                    </p>
                  ) : (
                    selected.meetingNotes.map(m => (
                      <div key={m.id} style={cardStyle()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <h4 style={{ fontFamily: F.serif, fontSize: 15, fontWeight: 600, margin: 0 }}>{m.title}</h4>
                          <span style={{ fontSize: 12, color: C.inkMuted }}>{m.date}</span>
                        </div>
                        <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 8 }}>
                          Attendees: {m.attendees}
                        </div>
                        <p style={{ fontSize: 13, color: C.inkSec, margin: 0, lineHeight: 1.6 }}>{m.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
