import { useState, useEffect, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Staff Management Module — White Editorial Design
// Team directory, availability, scheduling, performance tracking
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAF8", bgWarm: "#F5F1EC", card: "#FFFFFF", cardHover: "#FDFCFA",
  ink: "#18150F", inkSec: "#5C564E", inkMuted: "#9A948C",
  accent: "#7D5A1A", accentLight: "#B8922E", accentSubtle: "rgba(125,90,26,0.06)",
  border: "#E6E1D9", borderLight: "#F0ECE5",
  success: "#2B7A4B", successBg: "#F0F9F3",
  warn: "#956018", warnBg: "#FFF9F0",
  danger: "#9B3535", dangerBg: "#FDF2F2",
  info: "#2A6680", infoBg: "#F0F7FA",
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };

const LS_KEY = "hht_staff_v1";

const STATUS_META = {
  available: { label: "Available", color: C.success, bg: C.successBg },
  on_event: { label: "On Event", color: C.info, bg: C.infoBg },
  off: { label: "Off", color: C.inkMuted, bg: C.bgWarm },
  holiday: { label: "Holiday", color: C.warn, bg: C.warnBg },
};

const ROLES = [
  "Director & Founder", "Operations Manager", "Events Coordinator", "Head Bartender",
  "Senior Mixologist", "Brand Ambassador", "Junior Events", "Freelance Bartender",
  "Freelance Mixologist", "Freelance Bar Support", "Freelance Events",
];

const SKILLS = [
  "Classic Cocktails", "Molecular Mixology", "Flair Bartending", "Wine Service",
  "Event Management", "Client Relations", "Brand Activation", "Speed Service",
  "Coffee Cocktails", "Spirit Education", "Bar Setup & Breakdown", "Stock Management",
  "Health & Safety", "HACCP Certified", "Personal Licence Holder", "First Aid Certified",
  "SIA Certified", "Team Leadership",
];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function initialsColor(name) {
  const colors = ["#7D5A1A", "#2A6680", "#2B7A4B", "#956018", "#9B3535", "#6B5B95", "#5B7553"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getWeekDates(offset = 0) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtDate(d) {
  return d.toISOString().split("T")[0];
}

function fmtShort(d) {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const SEED_STAFF = [
  { id: "s1", name: "Joe Stokoe", role: "Director & Founder", email: "joe@hht.co.uk", phone: "07700 900001", dayRate: 350, type: "core", status: "available", skills: ["Team Leadership", "Client Relations", "Event Management", "Spirit Education"], certifications: ["Personal Licence Holder"], eventsWorked: 142, hoursLogged: 1136, clientRating: 4.9, notes: "Company founder. Oversees all premium events personally." },
  { id: "s2", name: "Matt Robertson", role: "Operations Manager", email: "matt@hht.co.uk", phone: "07700 900002", dayRate: 250, type: "core", status: "available", skills: ["Event Management", "Stock Management", "Bar Setup & Breakdown", "Team Leadership"], certifications: ["Personal Licence Holder", "First Aid Certified", "HACCP Certified"], eventsWorked: 118, hoursLogged: 944, clientRating: 4.8, notes: "Manages logistics and operations. Key contact for venue partnerships." },
  { id: "s3", name: "Emily Blacklock", role: "Events Coordinator", email: "emily@hht.co.uk", phone: "07700 900003", dayRate: 200, type: "core", status: "on_event", skills: ["Event Management", "Client Relations", "Brand Activation"], certifications: ["First Aid Certified"], eventsWorked: 95, hoursLogged: 760, clientRating: 4.9, notes: "Exceptional at client management. Handles all wedding enquiries." },
  { id: "s4", name: "Seb Davis", role: "Head Bartender", email: "seb@hht.co.uk", phone: "07700 900004", dayRate: 220, type: "core", status: "available", skills: ["Classic Cocktails", "Molecular Mixology", "Flair Bartending", "Speed Service", "Spirit Education"], certifications: ["Personal Licence Holder", "HACCP Certified"], eventsWorked: 108, hoursLogged: 864, clientRating: 4.7, notes: "Lead bartender for flagship events. Cocktail menu development." },
  { id: "s5", name: "Jason Sales", role: "Senior Mixologist", email: "jason@hht.co.uk", phone: "07700 900005", dayRate: 200, type: "core", status: "available", skills: ["Classic Cocktails", "Molecular Mixology", "Coffee Cocktails", "Speed Service"], certifications: ["Personal Licence Holder"], eventsWorked: 87, hoursLogged: 696, clientRating: 4.8, notes: "Specialist in molecular mixology. Creates bespoke menus." },
  { id: "s6", name: "Anja Rubin", role: "Brand Ambassador", email: "anja@hht.co.uk", phone: "07700 900006", dayRate: 180, type: "core", status: "holiday", skills: ["Brand Activation", "Client Relations", "Wine Service", "Spirit Education"], certifications: [], eventsWorked: 64, hoursLogged: 512, clientRating: 4.9, notes: "Front-of-house for corporate activations. Excellent presenter." },
  { id: "s7", name: "Katy Kedslie", role: "Junior Events", email: "katy@hht.co.uk", phone: "07700 900007", dayRate: 150, type: "core", status: "available", skills: ["Event Management", "Bar Setup & Breakdown", "Client Relations"], certifications: ["First Aid Certified"], eventsWorked: 32, hoursLogged: 256, clientRating: 4.6, notes: "Keen learner. Growing into coordinator role." },
  { id: "f1", name: "Tom Wilson", role: "Freelance Bartender", email: "tom.w@freelance.co.uk", phone: "07700 900010", dayRate: 180, type: "freelance", status: "available", skills: ["Classic Cocktails", "Speed Service", "Bar Setup & Breakdown"], certifications: ["Personal Licence Holder"], eventsWorked: 24, hoursLogged: 192, clientRating: 4.5, notes: "Reliable freelancer. Good for large-scale events." },
  { id: "f2", name: "Lucy Chen", role: "Freelance Mixologist", email: "lucy.c@freelance.co.uk", phone: "07700 900011", dayRate: 180, type: "freelance", status: "on_event", skills: ["Classic Cocktails", "Molecular Mixology", "Coffee Cocktails"], certifications: ["HACCP Certified"], eventsWorked: 18, hoursLogged: 144, clientRating: 4.7, notes: "Creative mixologist. Great for cocktail masterclasses." },
  { id: "f3", name: "Marcus Brown", role: "Freelance Bar Support", email: "marcus.b@freelance.co.uk", phone: "07700 900012", dayRate: 140, type: "freelance", status: "available", skills: ["Bar Setup & Breakdown", "Speed Service", "Stock Management"], certifications: [], eventsWorked: 15, hoursLogged: 120, clientRating: 4.3, notes: "Strong on physical setup. Available at short notice." },
  { id: "f4", name: "Sophie Green", role: "Freelance Events", email: "sophie.g@freelance.co.uk", phone: "07700 900013", dayRate: 160, type: "freelance", status: "off", skills: ["Event Management", "Client Relations", "Brand Activation"], certifications: ["First Aid Certified"], eventsWorked: 20, hoursLogged: 160, clientRating: 4.6, notes: "Good events support. Can run smaller events independently." },
  { id: "f5", name: "Raj Patel", role: "Freelance Bartender", email: "raj.p@freelance.co.uk", phone: "07700 900014", dayRate: 170, type: "freelance", status: "available", skills: ["Classic Cocktails", "Flair Bartending", "Speed Service"], certifications: ["Personal Licence Holder"], eventsWorked: 22, hoursLogged: 176, clientRating: 4.5, notes: "Flair specialist. Perfect for entertainment-focused events." },
];

const SEED_EVENTS = [
  { id: "e1", name: "Henderson Wedding", date: "2026-03-07", location: "Alnwick Garden", staffNeeded: 4, assignedStaff: ["s1", "s3", "s4", "f1"] },
  { id: "e2", name: "TechNorth Gala", date: "2026-03-08", location: "Civic Centre Newcastle", staffNeeded: 5, assignedStaff: ["s2", "s4", "s5", "f2", "f5"] },
  { id: "e3", name: "Fenwick Spring Launch", date: "2026-03-10", location: "Fenwick Newcastle", staffNeeded: 3, assignedStaff: ["s3", "s6", "f4"] },
  { id: "e4", name: "Ramside Hall Corporate", date: "2026-03-12", location: "Ramside Hall", staffNeeded: 4, assignedStaff: ["s1", "s2", "s5", "f3"] },
  { id: "e5", name: "Private Cocktail Masterclass", date: "2026-03-14", location: "Client Home, Jesmond", staffNeeded: 2, assignedStaff: ["s4", "f2"] },
  { id: "e6", name: "Sage Music Awards After-Party", date: "2026-03-15", location: "Sage Gateshead", staffNeeded: 6, assignedStaff: ["s1", "s2", "s3", "s5", "f1", "f5"] },
  { id: "e7", name: "Wylam Brewery Tasting", date: "2026-03-18", location: "Wylam Brewery", staffNeeded: 3, assignedStaff: ["s4", "s7", "f3"] },
];

function buildSeedAvailability(staff) {
  const avail = {};
  const week = getWeekDates(0);
  const nextWeek = getWeekDates(1);
  const allDays = [...week, ...nextWeek];
  staff.forEach(s => {
    avail[s.id] = {};
    allDays.forEach(d => {
      const key = fmtDate(d);
      const day = d.getDay();
      if (day === 0) { avail[s.id][key] = "off"; return; }
      if (s.status === "holiday") { avail[s.id][key] = "holiday"; return; }
      if (s.type === "freelance") {
        avail[s.id][key] = Math.random() > 0.3 ? "available" : "off";
      } else {
        avail[s.id][key] = day === 6 ? (Math.random() > 0.5 ? "available" : "off") : "available";
      }
    });
  });
  return avail;
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const availability = buildSeedAvailability(SEED_STAFF);
  return { staff: SEED_STAFF, events: SEED_EVENTS, availability };
}

function saveState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

// ─── Reusable Style Helpers ────────────────────────────────────
const btnBase = {
  fontFamily: F.sans, fontSize: 13, fontWeight: 600, border: "none", borderRadius: 6,
  cursor: "pointer", transition: "all 0.15s ease", display: "inline-flex",
  alignItems: "center", gap: 6,
};
const btnPrimary = { ...btnBase, background: C.accent, color: "#fff", padding: "8px 18px" };
const btnSecondary = { ...btnBase, background: C.bgWarm, color: C.ink, padding: "8px 16px", border: `1px solid ${C.border}` };
const btnDanger = { ...btnBase, background: C.dangerBg, color: C.danger, padding: "8px 16px", border: `1px solid ${C.danger}33` };
const btnSmall = { ...btnBase, fontSize: 12, padding: "5px 12px", background: C.accentSubtle, color: C.accent };
const inputStyle = {
  fontFamily: F.sans, fontSize: 14, padding: "9px 12px", border: `1px solid ${C.border}`,
  borderRadius: 6, outline: "none", width: "100%", boxSizing: "border-box",
  background: C.card, color: C.ink, transition: "border 0.15s",
};
const labelStyle = { fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4, display: "block", letterSpacing: "0.03em", textTransform: "uppercase" };
const cardStyle = {
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
  padding: 20, transition: "all 0.15s ease",
};

// ─── Sub-Components ────────────────────────────────────────────

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.off;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, fontFamily: F.sans, color: m.color, background: m.bg, padding: "3px 10px", borderRadius: 20, border: `1px solid ${m.color}22` }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.color }} />
      {m.label}
    </span>
  );
}

function InitialsAvatar({ name, size = 48 }) {
  const bg = initialsColor(name);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: F.serif, fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, letterSpacing: 1 }}>
      {getInitials(name)}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ ...cardStyle, textAlign: "center", flex: "1 1 160px", minWidth: 140 }}>
      <div style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 700, color: color || C.accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.inkSec, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontFamily: F.sans, fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Modal({ open, onClose, title, width, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 40, background: "rgba(24,21,15,0.45)", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, width: width || 640, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${C.borderLight}` }}>
          <h2 style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: C.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ ...btnBase, background: "none", color: C.inkMuted, fontSize: 20, padding: 4, width: 32, height: 32, justifyContent: "center" }}>&times;</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Tabs({ tabs, active, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.borderLight}`, marginBottom: 20 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{ ...btnBase, background: "none", color: active === t.id ? C.accent : C.inkMuted, padding: "10px 18px", borderRadius: 0, borderBottom: active === t.id ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -2, fontWeight: active === t.id ? 700 : 500, fontSize: 13 }}>{t.label}</button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function StaffManager() {
  const [state, setState] = useState(loadState);
  const [view, setView] = useState("directory"); // directory | availability | scheduler
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | core | freelance
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [detailTab, setDetailTab] = useState("info");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Persist
  useEffect(() => { saveState(state); }, [state]);

  const { staff, events, availability } = state;

  const updateState = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  // ─── Filtered Staff ──────────────────────────────────────────
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      if (filterType !== "all" && s.type !== filterType) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || (s.skills || []).some(sk => sk.toLowerCase().includes(q));
      }
      return true;
    });
  }, [staff, filterType, filterStatus, search]);

  // ─── Stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const eventsThisWeek = events.filter(e => {
      const d = new Date(e.date);
      return d >= weekStart && d < weekEnd;
    }).length;
    const availNow = staff.filter(s => s.status === "available").length;
    const totalEvents = staff.reduce((sum, s) => sum + (s.eventsWorked || 0), 0);
    const totalPossible = staff.length * 52 * 5; // rough annual capacity
    const utilPct = totalPossible > 0 ? Math.round((totalEvents / totalPossible * 100) * 10) / 10 : 0;
    return { total: staff.length, availNow, eventsThisWeek, utilPct };
  }, [staff, events]);

  // ─── Week dates for availability ─────────────────────────────
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // ─── Staff Form ──────────────────────────────────────────────
  const openAddForm = useCallback(() => {
    setEditingStaff(null);
    setShowForm(true);
  }, []);

  const openEditForm = useCallback((s) => {
    setEditingStaff(s);
    setShowForm(true);
  }, []);

  const handleSaveStaff = useCallback((formData) => {
    setState(prev => {
      if (formData.id) {
        return { ...prev, staff: prev.staff.map(s => s.id === formData.id ? { ...s, ...formData } : s) };
      } else {
        const newStaff = { ...formData, id: uid(), eventsWorked: 0, hoursLogged: 0, clientRating: 0, notes: "" };
        const newAvail = { ...prev.availability };
        newAvail[newStaff.id] = {};
        return { ...prev, staff: [...prev.staff, newStaff], availability: newAvail };
      }
    });
    setShowForm(false);
    setEditingStaff(null);
  }, []);

  const handleDeleteStaff = useCallback((id) => {
    if (!window.confirm("Remove this team member?")) return;
    setState(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== id),
      events: prev.events.map(e => ({ ...e, assignedStaff: e.assignedStaff.filter(sid => sid !== id) })),
    }));
    setSelectedStaff(null);
  }, []);

  // ─── Availability Toggle ─────────────────────────────────────
  const toggleAvailability = useCallback((staffId, dateKey) => {
    const cycle = ["available", "on_event", "off", "holiday"];
    setState(prev => {
      const current = (prev.availability[staffId] || {})[dateKey] || "available";
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [staffId]: { ...(prev.availability[staffId] || {}), [dateKey]: next },
        },
      };
    });
  }, []);

  // ─── Event Staff Toggle ──────────────────────────────────────
  const toggleEventStaff = useCallback((eventId, staffId) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => {
        if (e.id !== eventId) return e;
        const has = e.assignedStaff.includes(staffId);
        return { ...e, assignedStaff: has ? e.assignedStaff.filter(x => x !== staffId) : [...e.assignedStaff, staffId] };
      }),
    }));
  }, []);

  // ─── Update Staff Status ─────────────────────────────────────
  const updateStaffStatus = useCallback((staffId, newStatus) => {
    setState(prev => ({
      ...prev,
      staff: prev.staff.map(s => s.id === staffId ? { ...s, status: newStatus } : s),
    }));
  }, []);

  // ─── Update Staff Notes ──────────────────────────────────────
  const updateStaffNotes = useCallback((staffId, notes) => {
    setState(prev => ({
      ...prev,
      staff: prev.staff.map(s => s.id === staffId ? { ...s, notes } : s),
    }));
  }, []);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: F.sans, color: C.ink, background: C.bg, minHeight: "100vh", padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, color: C.ink, margin: 0, lineHeight: 1.2 }}>Staff Management</h1>
          <p style={{ fontFamily: F.sans, fontSize: 14, color: C.inkMuted, margin: "4px 0 0" }}>HH&T Team &amp; Freelancer Directory</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnPrimary} onClick={openAddForm}>+ Add Staff</button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Total Staff" value={stats.total} sub={`${staff.filter(s => s.type === "core").length} core, ${staff.filter(s => s.type === "freelance").length} freelance`} />
        <StatCard label="Available Now" value={stats.availNow} color={C.success} sub={`of ${stats.total} team`} />
        <StatCard label="Events This Week" value={stats.eventsThisWeek} color={C.info} />
        <StatCard label="Avg Utilisation" value={`${stats.utilPct}%`} color={C.warn} sub="based on events worked" />
      </div>

      {/* View Tabs */}
      <Tabs
        tabs={[
          { id: "directory", label: "Team Directory" },
          { id: "availability", label: "Availability Overview" },
          { id: "scheduler", label: "Shift Scheduler" },
        ]}
        active={view}
        onSelect={setView}
      />

      {/* ─── Directory View ─────────────────────────────────────── */}
      {view === "directory" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search name, role, or skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: 280 }}
            />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, maxWidth: 160, cursor: "pointer" }}>
              <option value="all">All Types</option>
              <option value="core">Core Team</option>
              <option value="freelance">Freelancers</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: 160, cursor: "pointer" }}>
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="on_event">On Event</option>
              <option value="off">Off</option>
              <option value="holiday">Holiday</option>
            </select>
            <span style={{ fontFamily: F.sans, fontSize: 13, color: C.inkMuted }}>{filteredStaff.length} result{filteredStaff.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Staff Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filteredStaff.map(s => (
              <div
                key={s.id}
                onClick={() => { setSelectedStaff(s); setDetailTab("info"); }}
                style={{ ...cardStyle, cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + "44"; e.currentTarget.style.background = C.cardHover; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
              >
                <InitialsAvatar name={s.name} size={50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: C.ink }}>{s.name}</span>
                    {s.type === "freelance" && (
                      <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F.sans, color: C.info, background: C.infoBg, padding: "1px 7px", borderRadius: 10 }}>FREELANCE</span>
                    )}
                  </div>
                  <div style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, marginTop: 2 }}>{s.role}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: C.inkMuted, marginTop: 3 }}>{s.email}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <StatusBadge status={s.status} />
                    <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.accent }}>£{s.dayRate}/day</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Availability View ──────────────────────────────────── */}
      {view === "availability" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button style={btnSecondary} onClick={() => setWeekOffset(o => o - 1)}>&larr; Prev</button>
            <button style={btnSmall} onClick={() => setWeekOffset(0)}>This Week</button>
            <button style={btnSecondary} onClick={() => setWeekOffset(o => o + 1)}>Next &rarr;</button>
            <span style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, marginLeft: 8 }}>
              {weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} &ndash; {weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.sans, fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: `2px solid ${C.border}`, fontWeight: 700, color: C.inkSec, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 180 }}>Staff Member</th>
                  {weekDates.map(d => (
                    <th key={fmtDate(d)} style={{ textAlign: "center", padding: "10px 8px", borderBottom: `2px solid ${C.border}`, fontWeight: 600, color: d.getDay() === 0 || d.getDay() === 6 ? C.inkMuted : C.inkSec, fontSize: 12, minWidth: 80 }}>
                      {fmtShort(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 8 }}>
                      <InitialsAvatar name={s.name} size={28} />
                      <div>
                        <div style={{ fontWeight: 600, color: C.ink, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.inkMuted }}>{s.role}</div>
                      </div>
                    </td>
                    {weekDates.map(d => {
                      const key = fmtDate(d);
                      const st = (availability[s.id] || {})[key] || "available";
                      const m = STATUS_META[st];
                      return (
                        <td
                          key={key}
                          onClick={() => toggleAvailability(s.id, key)}
                          style={{ textAlign: "center", padding: "6px 4px", borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", background: m.bg, transition: "all 0.1s" }}
                          title={`Click to change — currently: ${m.label}`}
                        >
                          <span style={{ fontSize: 11, fontWeight: 600, color: m.color }}>{m.label}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {Object.entries(STATUS_META).map(([k, m]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: F.sans, color: C.inkSec }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: m.bg, border: `1px solid ${m.color}33` }} />
                {m.label}
              </div>
            ))}
            <span style={{ fontSize: 11, color: C.inkMuted, fontStyle: "italic" }}>Click a cell to cycle status</span>
          </div>
        </div>
      )}

      {/* ─── Scheduler View ─────────────────────────────────────── */}
      {view === "scheduler" && (
        <div>
          <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, marginBottom: 16 }}>Toggle staff assignments for upcoming events. Click a name to assign or unassign.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {events
              .filter(e => new Date(e.date) >= new Date(new Date().toISOString().split("T")[0]))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(ev => {
                const assigned = ev.assignedStaff || [];
                const evDate = new Date(ev.date);
                return (
                  <div key={ev.id} style={{ ...cardStyle }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: C.ink }}>{ev.name}</span>
                        <span style={{ fontFamily: F.sans, fontSize: 12, color: C.inkMuted, marginLeft: 12 }}>{ev.location}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: F.mono, fontSize: 13, color: C.accent, fontWeight: 600 }}>
                          {evDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, fontFamily: F.sans,
                          color: assigned.length >= ev.staffNeeded ? C.success : C.danger,
                          background: assigned.length >= ev.staffNeeded ? C.successBg : C.dangerBg,
                          padding: "2px 10px", borderRadius: 10,
                        }}>
                          {assigned.length}/{ev.staffNeeded} staff
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {staff.map(s => {
                        const isAssigned = assigned.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleEventStaff(ev.id, s.id)}
                            style={{
                              ...btnBase,
                              fontSize: 12,
                              padding: "5px 12px",
                              borderRadius: 20,
                              background: isAssigned ? C.accent : C.bgWarm,
                              color: isAssigned ? "#fff" : C.inkSec,
                              border: isAssigned ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                              fontWeight: isAssigned ? 700 : 500,
                            }}
                            title={isAssigned ? "Click to unassign" : "Click to assign"}
                          >
                            {s.name}
                            {isAssigned && <span style={{ marginLeft: 4 }}>&check;</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ─── Staff Detail Modal ─────────────────────────────────── */}
      <Modal open={!!selectedStaff} onClose={() => setSelectedStaff(null)} title="Staff Detail" width={720}>
        {selectedStaff && (() => {
          const s = staff.find(x => x.id === selectedStaff.id) || selectedStaff;
          const staffEvents = events.filter(e => (e.assignedStaff || []).includes(s.id) && new Date(e.date) >= new Date(new Date().toISOString().split("T")[0]));
          const detailWeek = getWeekDates(0);
          return (
            <div>
              {/* Header */}
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                <InitialsAvatar name={s.name} size={64} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h3 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: C.ink, margin: 0 }}>{s.name}</h3>
                    <StatusBadge status={s.status} />
                    {s.type === "freelance" && <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F.sans, color: C.info, background: C.infoBg, padding: "2px 8px", borderRadius: 10 }}>FREELANCE</span>}
                  </div>
                  <div style={{ fontFamily: F.sans, fontSize: 14, color: C.inkSec, marginTop: 2 }}>{s.role}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={btnSmall} onClick={() => { setSelectedStaff(null); openEditForm(s); }}>Edit</button>
                  <button style={btnDanger} onClick={() => handleDeleteStaff(s.id)}>Delete</button>
                </div>
              </div>

              {/* Status Quick Change */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSec, fontFamily: F.sans, marginRight: 4 }}>Set Status:</span>
                {Object.entries(STATUS_META).map(([key, m]) => (
                  <button key={key} onClick={() => { updateStaffStatus(s.id, key); setSelectedStaff({ ...s, status: key }); }}
                    style={{ ...btnBase, fontSize: 11, padding: "3px 10px", borderRadius: 14, background: s.status === key ? m.color : m.bg, color: s.status === key ? "#fff" : m.color, border: `1px solid ${m.color}33` }}>
                    {m.label}
                  </button>
                ))}
              </div>

              <Tabs
                tabs={[
                  { id: "info", label: "Info" },
                  { id: "events", label: "Events" },
                  { id: "availability", label: "Availability" },
                  { id: "performance", label: "Performance" },
                  { id: "notes", label: "Notes" },
                ]}
                active={detailTab}
                onSelect={setDetailTab}
              />

              {/* Info Tab */}
              {detailTab === "info" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <div style={{ fontFamily: F.mono, fontSize: 13, color: C.ink }}>{s.email}</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <div style={{ fontFamily: F.mono, fontSize: 13, color: C.ink }}>{s.phone}</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Day Rate</label>
                    <div style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 700, color: C.accent }}>£{s.dayRate}</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <div style={{ fontFamily: F.sans, fontSize: 13, color: C.ink, textTransform: "capitalize" }}>{s.type} Team</div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Skills</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {(s.skills || []).map(sk => (
                        <span key={sk} style={{ fontSize: 12, fontFamily: F.sans, background: C.accentSubtle, color: C.accent, padding: "3px 10px", borderRadius: 14, fontWeight: 500 }}>{sk}</span>
                      ))}
                      {(!s.skills || s.skills.length === 0) && <span style={{ fontSize: 12, color: C.inkMuted, fontStyle: "italic" }}>No skills listed</span>}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Certifications</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {(s.certifications || []).map(cert => (
                        <span key={cert} style={{ fontSize: 12, fontFamily: F.sans, background: C.successBg, color: C.success, padding: "3px 10px", borderRadius: 14, fontWeight: 600 }}>{cert}</span>
                      ))}
                      {(!s.certifications || s.certifications.length === 0) && <span style={{ fontSize: 12, color: C.inkMuted, fontStyle: "italic" }}>None</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {detailTab === "events" && (
                <div>
                  {staffEvents.length === 0 && <p style={{ fontSize: 13, color: C.inkMuted, fontStyle: "italic" }}>No upcoming events assigned.</p>}
                  {staffEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).map(ev => (
                    <div key={ev.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>{ev.name}</div>
                        <div style={{ fontSize: 12, color: C.inkMuted }}>{ev.location}</div>
                      </div>
                      <span style={{ fontFamily: F.mono, fontSize: 13, color: C.accent, fontWeight: 600 }}>
                        {new Date(ev.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Availability Tab */}
              {detailTab === "availability" && (
                <div>
                  <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 10 }}>This week — click to toggle status</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                    {detailWeek.map(d => {
                      const key = fmtDate(d);
                      const st = (availability[s.id] || {})[key] || "available";
                      const m = STATUS_META[st];
                      return (
                        <div
                          key={key}
                          onClick={() => toggleAvailability(s.id, key)}
                          style={{ textAlign: "center", padding: "12px 6px", borderRadius: 8, background: m.bg, border: `1px solid ${m.color}33`, cursor: "pointer", transition: "all 0.15s" }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 600, color: C.inkSec }}>{d.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2 }}>{d.getDate()}</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: m.color, marginTop: 4 }}>{m.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {detailTab === "performance" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ ...cardStyle, background: C.accentSubtle, textAlign: "center" }}>
                    <div style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, color: C.accent }}>{s.eventsWorked || 0}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSec }}>Events Worked</div>
                  </div>
                  <div style={{ ...cardStyle, background: C.infoBg, textAlign: "center" }}>
                    <div style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, color: C.info }}>{s.hoursLogged || 0}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSec }}>Hours Logged</div>
                  </div>
                  <div style={{ ...cardStyle, background: C.successBg, textAlign: "center" }}>
                    <div style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, color: C.success }}>{s.clientRating || "N/A"}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSec }}>Client Rating</div>
                    {s.clientRating > 0 && (
                      <div style={{ marginTop: 4 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <span key={n} style={{ fontSize: 16, color: n <= Math.round(s.clientRating) ? "#D4A843" : C.borderLight }}>&#9733;</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ ...cardStyle, background: C.warnBg, textAlign: "center" }}>
                    <div style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, color: C.warn }}>
                      £{((s.eventsWorked || 0) * s.dayRate).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSec }}>Total Earnings (est.)</div>
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {detailTab === "notes" && (
                <div>
                  <textarea
                    value={s.notes || ""}
                    onChange={e => {
                      const val = e.target.value;
                      updateStaffNotes(s.id, val);
                      setSelectedStaff({ ...s, notes: val });
                    }}
                    placeholder="Add notes about this team member..."
                    style={{ ...inputStyle, minHeight: 140, resize: "vertical", fontFamily: F.sans, fontSize: 14, lineHeight: 1.6 }}
                  />
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* ─── Add/Edit Staff Form Modal ──────────────────────────── */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingStaff(null); }} title={editingStaff ? "Edit Staff Member" : "Add Staff Member"} width={600}>
        <StaffForm
          initial={editingStaff}
          onSave={handleSaveStaff}
          onCancel={() => { setShowForm(false); setEditingStaff(null); }}
        />
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Staff Form Component
// ═══════════════════════════════════════════════════════════════

function StaffForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: "", role: ROLES[0], email: "", phone: "", dayRate: 150,
    type: "core", status: "available", skills: [], certifications: [],
    ...(initial || {}),
  }));

  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), []);

  const toggleSkill = useCallback((skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave(initial ? { ...form, id: initial.id } : form);
  }, [form, initial, onSave]);

  const fieldWrap = { marginBottom: 16 };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Full Name *</label>
          <input type="text" value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} required />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Role</label>
          <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Email *</label>
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} required />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Phone</label>
          <input type="text" value={form.phone} onChange={e => set("phone", e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Day Rate (£)</label>
          <input type="number" value={form.dayRate} onChange={e => set("dayRate", Number(e.target.value))} style={inputStyle} min={0} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Team Type</label>
          <select value={form.type} onChange={e => set("type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="core">Core Team</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Skills</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {SKILLS.map(sk => {
            const active = form.skills.includes(sk);
            return (
              <button
                key={sk}
                type="button"
                onClick={() => toggleSkill(sk)}
                style={{
                  ...btnBase, fontSize: 11, padding: "4px 10px", borderRadius: 14,
                  background: active ? C.accent : C.bgWarm,
                  color: active ? "#fff" : C.inkSec,
                  border: active ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                  fontWeight: active ? 700 : 400,
                }}
              >
                {sk}{active ? " \u2713" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button type="button" onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button type="submit" style={btnPrimary}>{initial ? "Save Changes" : "Add Staff Member"}</button>
      </div>
    </form>
  );
}
