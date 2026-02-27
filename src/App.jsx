import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import LeadEngineCRM from "./components/LeadEngine";
import { initializeStore } from "./lib/store";
import { RAW_LEADS } from "./lib/seedData";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADS, HEARTS & TAILS — OPERATIONS PLATFORM v4.0
// Design: High-End Editorial · CRM-Grade Lead Engine · Holistic Business OS
// Inspired by: Apollo.io · HubSpot · Monday.com · Xero · QuickBooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const C = {
  bg: "#FAFAF8", bgWarm: "#F5F1EC", card: "#FFFFFF", cardHover: "#FDFCFA",
  ink: "#18150F", inkSec: "#5C564E", inkMuted: "#9A948C",
  accent: "#7D5A1A", accentLight: "#B8922E", accentSubtle: "rgba(125,90,26,0.06)",
  border: "#E6E1D9", borderLight: "#F0ECE5",
  success: "#2B7A4B", successBg: "#F0F9F3", successBorder: "#C6E7D1",
  warn: "#956018", warnBg: "#FFF9F0", warnBorder: "#E8D4A8",
  danger: "#9B3535", dangerBg: "#FDF2F2", dangerBorder: "#E8C4C4",
  info: "#2A6680", infoBg: "#F0F7FA", infoBorder: "#B8D8E8",
  stages: { identified:"#2A6680", researched:"#5B6AAF", contacted:"#956018", responded:"#B8922E", qualified:"#2B7A4B", meeting:"#1A6B4A", won:"#18150F", lost:"#9A948C" },
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };

const HHTLogo = ({ s = 32 }) => (
  <svg width={s} height={s} viewBox="0 0 200 200" fill="none">
    <rect width="200" height="200" rx="12" fill={C.ink}/>
    <path d="M100 170C100 170 30 125 30 80C30 55 50 38 72 38C86 38 96 46 100 55C104 46 114 38 128 38C150 38 170 55 170 80C170 125 100 170 100 170Z" fill="white"/>
    <text x="100" y="108" textAnchor="middle" fontSize="52" fontWeight="bold" fill={C.ink} fontFamily={F.serif}>&amp;</text>
  </svg>
);

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
  return base;
};
const inputStyle = { padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%" };
const selectStyle = { ...inputStyle, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A948C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 30, cursor: "pointer" };

// ── Seeded RNG for consistent lead data ──
const sRng = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return () => { h = (h * 16807 + 0) % 2147483647; return (h & 0x7FFFFFFF) / 2147483647; }; };

// ── Lead Stages & Sources ──
const LEAD_STAGES = ["Identified", "Researched", "Contacted", "Responded", "Qualified", "Meeting Booked", "Won", "Lost"];
const LEAD_SOURCES = ["Web Research", "Referral", "LinkedIn", "Industry Event", "Cold Outreach", "Inbound", "Partner", "Directory"];
const SCORE_FACTORS = ["Venue capacity fit", "Event history", "Budget alignment", "Decision-maker access", "Location synergy", "Category match", "Response time", "Engagement level"];


// ── Enrich Leads ──
const LEADS = RAW_LEADS.map((r, i) => {
  const rng = sRng(r.n + i);
  const stageIdx = Math.floor(rng() * 6);
  const stage = LEAD_STAGES[stageIdx];
  const source = LEAD_SOURCES[Math.floor(rng() * LEAD_SOURCES.length)];
  const score = Math.round(30 + rng() * 70);
  const revenue = Math.round((r.cap * (8 + rng() * 25)) / 10) * 10;
  const days = Math.floor(rng() * 90);
  const date = new Date(2025, 0, 1 + days);
  const lastContact = stageIdx > 1 ? new Date(2025, 0, 20 + Math.floor(rng() * 60)) : null;
  const email = r.n.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) + "@" + r.l.toLowerCase().replace(/[^a-z]/g, "") + ".co.uk";
  const phone = "020 " + (7000 + Math.floor(rng() * 3000)) + " " + (1000 + Math.floor(rng() * 9000));
  const factors = SCORE_FACTORS.slice(0, 3 + Math.floor(rng() * 4)).map(f => ({ name: f, val: Math.round(40 + rng() * 60) }));
  const contactName = ["Alex Morgan","Sam Taylor","Jordan Lee","Chris Walker","Pat Quinn","Robin James","Casey Smith","Jamie Brown","Avery Jones","Drew Clark"][Math.floor(rng()*10)];
  const role = ["Events Manager","General Manager","Owner","Head of Events","Venue Director","Operations Manager","Bar Manager","Events Coordinator"][Math.floor(rng()*8)];
  const timeline = [];
  if (stageIdx >= 0) timeline.push({ date: date.toISOString().slice(0,10), action: "Lead identified via " + source, type: "system" });
  if (stageIdx >= 1) timeline.push({ date: new Date(date.getTime() + 86400000 * (2 + Math.floor(rng()*5))).toISOString().slice(0,10), action: "Research completed — capacity, events history reviewed", type: "system" });
  if (stageIdx >= 2) timeline.push({ date: new Date(date.getTime() + 86400000 * (7 + Math.floor(rng()*7))).toISOString().slice(0,10), action: "Initial outreach email sent to " + contactName, type: "email" });
  if (stageIdx >= 3) timeline.push({ date: new Date(date.getTime() + 86400000 * (14 + Math.floor(rng()*10))).toISOString().slice(0,10), action: contactName + " responded — interested in cocktail events", type: "email" });
  if (stageIdx >= 4) timeline.push({ date: new Date(date.getTime() + 86400000 * (20 + Math.floor(rng()*14))).toISOString().slice(0,10), action: "Qualified — budget confirmed, decision timeline set", type: "call" });
  if (stageIdx >= 5) timeline.push({ date: new Date(date.getTime() + 86400000 * (30 + Math.floor(rng()*14))).toISOString().slice(0,10), action: "Meeting booked — presentation scheduled", type: "meeting" });
  return { id: i + 1, name: r.n, location: r.l, city: r.co, category: r.cat, capacity: r.cap, notes: r.note, stage, source, score, revenue, date: date.toISOString().slice(0, 10), lastContact: lastContact ? lastContact.toISOString().slice(0, 10) : null, email, phone, factors, contactName, role, timeline };
});

// ── Events Data ──
const EVENT_STAGES = ["Discovery", "Proposal", "Confirmed", "Planning", "Execution", "Complete", "Cancelled"];
const EVENTS = [
  { id: 1, name: "Diageo Whisky Masterclass", client: "Diageo", venue: "The Connaught Bar", date: "2025-03-15", endDate: "2025-03-15", stage: "Confirmed", revenue: 12000, cost: 5500, guests: 40, staff: ["Joe Stokoe","Alex M"], health: 92, probability: 95, type: "Brand Activation", notes: "Premium whisky tasting with brand ambassador" },
  { id: 2, name: "Pernod Ricard Summer Party", client: "Pernod Ricard", venue: "Skylight Tobacco Dock", date: "2025-06-20", endDate: "2025-06-20", stage: "Planning", revenue: 28000, cost: 14000, guests: 200, staff: ["Joe Stokoe","Sam T","Jordan L","Chris W"], health: 78, probability: 90, type: "Corporate Event", notes: "Summer rooftop party with cocktail stations" },
  { id: 3, name: "Hendrick's Gin Garden Pop-up", client: "William Grant & Sons", venue: "Pergola Paddington", date: "2025-04-10", endDate: "2025-04-12", stage: "Proposal", revenue: 18500, cost: 9200, guests: 150, staff: ["Joe Stokoe","Pat Q"], health: 65, probability: 70, type: "Pop-up Experience", notes: "3-day botanical gin garden activation" },
  { id: 4, name: "Campari Aperitivo Week Launch", client: "Campari Group", venue: "100 Wardour Street", date: "2025-05-05", endDate: "2025-05-05", stage: "Discovery", revenue: 15000, cost: 7500, guests: 100, staff: ["Joe Stokoe","Robin J"], health: 45, probability: 40, type: "Launch Event", notes: "Aperitivo week press launch and influencer event" },
  { id: 5, name: "Private Birthday — Chelsea Penthouse", client: "Private Client", venue: "Mr Fogg's Residence", date: "2025-03-28", endDate: "2025-03-28", stage: "Confirmed", revenue: 8500, cost: 3800, guests: 60, staff: ["Casey S","Jamie B"], health: 95, probability: 100, type: "Private Party", notes: "50th birthday celebration with cocktail bar" },
  { id: 6, name: "BrewDog Tap Takeover Series", client: "BrewDog", venue: "BrewDog Tower Hill", date: "2025-04-01", endDate: "2025-06-30", stage: "Planning", revenue: 22000, cost: 10000, guests: 800, staff: ["Alex M","Drew C","Avery J"], health: 82, probability: 85, type: "Recurring Series", notes: "Monthly tap takeover events Q2 2025" },
  { id: 7, name: "Moët & Chandon VIP Dinner", client: "LVMH", venue: "Sketch", date: "2025-05-18", endDate: "2025-05-18", stage: "Proposal", revenue: 35000, cost: 18000, guests: 80, staff: ["Joe Stokoe","Sam T","Pat Q","Robin J"], health: 58, probability: 55, type: "VIP Dinner", notes: "Black-tie dinner with champagne pairing" },
  { id: 8, name: "Fever-Tree Mixology Competition", client: "Fever-Tree", venue: "The Cocktail Club", date: "2025-04-22", endDate: "2025-04-22", stage: "Confirmed", revenue: 11000, cost: 5000, guests: 50, staff: ["Joe Stokoe","Jordan L"], health: 88, probability: 95, type: "Brand Activation", notes: "Bartender competition with brand content" },
  { id: 9, name: "Soho House Summer Members Event", client: "Soho House", venue: "Shoreditch House", date: "2025-07-10", endDate: "2025-07-10", stage: "Discovery", revenue: 20000, cost: 9500, guests: 120, staff: ["Joe Stokoe","Chris W","Casey S"], health: 35, probability: 30, type: "Members Event", notes: "Exclusive rooftop summer party for members" },
  { id: 10, name: "Jägermeister Ice Cold Event", client: "Jägermeister", venue: "Printworks", date: "2025-05-30", endDate: "2025-05-31", stage: "Planning", revenue: 42000, cost: 22000, guests: 500, staff: ["Joe Stokoe","Sam T","Alex M","Jordan L","Chris W","Pat Q"], health: 70, probability: 80, type: "Festival Activation", notes: "Two-day immersive brand experience" },
];

// ── Team Data ──
const TEAM = [
  { name: "Joe Stokoe", role: "Director & Founder", rate: 150, capacity: 40, hoursThisWeek: 38, hoursThisMonth: 155, utilisation: 97, avatar: "JS" },
  { name: "Alex Morgan", role: "Events Manager", rate: 85, capacity: 40, hoursThisWeek: 36, hoursThisMonth: 142, utilisation: 89, avatar: "AM" },
  { name: "Sam Taylor", role: "Senior Coordinator", rate: 75, capacity: 40, hoursThisWeek: 42, hoursThisMonth: 168, utilisation: 105, avatar: "ST" },
  { name: "Jordan Lee", role: "Bar Manager", rate: 70, capacity: 40, hoursThisWeek: 34, hoursThisMonth: 132, utilisation: 83, avatar: "JL" },
  { name: "Chris Walker", role: "Logistics Lead", rate: 65, capacity: 40, hoursThisWeek: 30, hoursThisMonth: 120, utilisation: 75, avatar: "CW" },
  { name: "Pat Quinn", role: "Creative Director", rate: 90, capacity: 40, hoursThisWeek: 28, hoursThisMonth: 112, utilisation: 70, avatar: "PQ" },
  { name: "Robin James", role: "Account Manager", rate: 70, capacity: 40, hoursThisWeek: 32, hoursThisMonth: 128, utilisation: 80, avatar: "RJ" },
  { name: "Casey Smith", role: "Event Coordinator", rate: 55, capacity: 40, hoursThisWeek: 40, hoursThisMonth: 160, utilisation: 100, avatar: "CS" },
];

// ── Financial Data ──
const INVOICES = [
  { id: "INV-001", event: "Diageo Whisky Masterclass", client: "Diageo", amount: 12000, paid: 6000, status: "Partial", due: "2025-03-01", issued: "2025-02-15" },
  { id: "INV-002", event: "Private Birthday", client: "Private Client", amount: 8500, paid: 8500, status: "Paid", due: "2025-03-20", issued: "2025-02-28" },
  { id: "INV-003", event: "Fever-Tree Mixology", client: "Fever-Tree", amount: 11000, paid: 0, status: "Sent", due: "2025-04-15", issued: "2025-03-10" },
  { id: "INV-004", event: "BrewDog Tap Takeover", client: "BrewDog", amount: 7500, paid: 7500, status: "Paid", due: "2025-04-01", issued: "2025-03-15" },
  { id: "INV-005", event: "Hendrick's Gin Garden", client: "William Grant", amount: 18500, paid: 0, status: "Draft", due: "2025-04-30", issued: null },
  { id: "INV-006", event: "Jägermeister Ice Cold", client: "Jägermeister", amount: 21000, paid: 0, status: "Draft", due: "2025-05-15", issued: null },
];

const EXPENSES = [
  { id: 1, category: "Spirits & Ingredients", amount: 4200, event: "Diageo Masterclass", date: "2025-02-20", billable: true },
  { id: 2, category: "Venue Hire", amount: 3500, event: "Pernod Summer Party", date: "2025-03-01", billable: true },
  { id: 3, category: "Equipment Rental", amount: 1800, event: "BrewDog Tap Takeover", date: "2025-03-05", billable: true },
  { id: 4, category: "Staff Travel", amount: 650, event: "Various", date: "2025-03-08", billable: false },
  { id: 5, category: "Marketing & Design", amount: 2200, event: "Hendrick's Gin Garden", date: "2025-03-10", billable: true },
  { id: 6, category: "Insurance", amount: 1500, event: "All Events Q1", date: "2025-01-15", billable: false },
  { id: 7, category: "Glassware & Props", amount: 1100, event: "Campari Launch", date: "2025-03-12", billable: true },
  { id: 8, category: "Software & Tools", amount: 450, event: "Operations", date: "2025-03-01", billable: false },
];

const cashFlowData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 2, 1 + i);
  const inflow = (i === 5 ? 6000 : i === 12 ? 8500 : i === 20 ? 7500 : i === 25 ? 11000 : Math.round(Math.random() * 1500));
  const outflow = Math.round(800 + Math.random() * 2500);
  return { day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), inflow, outflow, net: inflow - outflow };
});

// ── Activity Feed ──
const ACTIVITY = [
  { time: "2 min ago", icon: "📧", text: "Email opened by Alex Morgan at The Connaught Bar", type: "lead" },
  { time: "15 min ago", icon: "📞", text: "Call completed with Fever-Tree — confirmed Q2 activation", type: "event" },
  { time: "1 hr ago", icon: "💰", text: "Invoice INV-002 marked as paid — £8,500 from Private Client", type: "finance" },
  { time: "2 hrs ago", icon: "📋", text: "Proposal sent to Moët & Chandon for VIP Dinner — £35,000", type: "event" },
  { time: "3 hrs ago", icon: "🎯", text: "New lead scored 87/100 — Sketch, Mayfair (AI recommendation)", type: "lead" },
  { time: "5 hrs ago", icon: "👤", text: "Sam Taylor logged 8 hrs — Pernod Ricard Summer Party planning", type: "time" },
  { time: "Yesterday", icon: "✅", text: "BrewDog Tap Takeover April — all logistics confirmed", type: "event" },
  { time: "Yesterday", icon: "⚠️", text: "Campari Launch health score dropped to 45 — needs attention", type: "alert" },
];

// ── Format Helpers ──
const fmt = (n) => "£" + (n || 0).toLocaleString("en-GB");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
const pct = (n) => Math.round(n) + "%";

// ══════════════════════════════════════════════════════════════════════════════
// LEAD ENGINE — Now using real CRM with persistent storage
// ══════════════════════════════════════════════════════════════════════════════
const LeadEngine = LeadEngineCRM;

// ══════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
// EVENT PIPELINE — Monday.com-Grade Kanban + Forecasting
// ══════════════════════════════════════════════════════════════════════════════

const EventPipeline = () => {
  const [view, setView] = useState("kanban"); // kanban | list | forecast
  const [selectedEvent, setSelectedEvent] = useState(null);

  const stageColors = { Discovery: C.info, Proposal: C.warn, Confirmed: C.success, Planning: C.accent, Execution: "#6B46C1", Complete: C.ink, Cancelled: C.danger };

  const totalRevenue = EVENTS.reduce((s, e) => s + e.revenue, 0);
  const weightedRevenue = EVENTS.reduce((s, e) => s + (e.revenue * e.probability / 100), 0);
  const confirmedRevenue = EVENTS.filter(e => ["Confirmed", "Planning", "Execution", "Complete"].includes(e.stage)).reduce((s, e) => s + e.revenue, 0);
  const avgHealth = Math.round(EVENTS.reduce((s, e) => s + e.health, 0) / EVENTS.length);

  // Event Detail
  if (selectedEvent) {
    const ev = EVENTS.find(e => e.id === selectedEvent);
    if (!ev) { setSelectedEvent(null); return null; }
    const profit = ev.revenue - ev.cost;
    const margin = Math.round((profit / ev.revenue) * 100);
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <button onClick={() => setSelectedEvent(null)} style={btnStyle("ghost")}>← Back to Pipeline</button>
        <div style={cardStyle({ marginTop: 16 })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: F.serif, fontSize: 22, margin: 0 }}>{ev.name}</h2>
              <div style={{ color: C.inkSec, fontSize: 13, marginTop: 4 }}>{ev.client} · {ev.venue} · {ev.type}</div>
            </div>
            <span style={pillStyle(stageColors[ev.stage] + "20", stageColors[ev.stage])}>{ev.stage}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            {[{ label: "Revenue", value: fmt(ev.revenue) }, { label: "Cost", value: fmt(ev.cost) }, { label: "Profit", value: fmt(profit), color: profit > 0 ? C.success : C.danger }, { label: "Margin", value: pct(margin) }].map((m, i) => (
              <div key={i} style={{ padding: 12, background: C.bgWarm, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif, color: m.color || C.ink }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
            <div><span style={{ color: C.inkMuted }}>Date:</span> {fmtDate(ev.date)}{ev.endDate !== ev.date ? ` — ${fmtDate(ev.endDate)}` : ""}</div>
            <div><span style={{ color: C.inkMuted }}>Guests:</span> {ev.guests}</div>
            <div><span style={{ color: C.inkMuted }}>Staff:</span> {ev.staff.join(", ")}</div>
            <div><span style={{ color: C.inkMuted }}>Probability:</span> {ev.probability}%</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ color: C.inkMuted, fontSize: 13 }}>Health Score:</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ flex: 1, height: 8, background: C.borderLight, borderRadius: 4 }}>
                <div style={{ width: ev.health + "%", height: "100%", borderRadius: 4, background: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger }}>{ev.health}</span>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: 12, background: C.bgWarm, borderRadius: 8, fontSize: 12, color: C.inkSec }}>{ev.notes}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Event Pipeline</h1>
          <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>{EVENTS.length} events · {fmt(weightedRevenue)} weighted revenue</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["kanban", "list", "forecast"].map(v => (
            <button key={v} onClick={() => setView(v)} style={btnStyle(view === v ? "primary" : "outline")}>{v === "kanban" ? "▤ Kanban" : v === "list" ? "☰ List" : "📊 Forecast"}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Pipeline", value: fmt(totalRevenue), sub: `${EVENTS.length} events` },
          { label: "Weighted Revenue", value: fmt(weightedRevenue), sub: "Probability-adjusted" },
          { label: "Confirmed", value: fmt(confirmedRevenue), sub: `${EVENTS.filter(e => ["Confirmed","Planning","Execution"].includes(e.stage)).length} events` },
          { label: "Avg Health", value: avgHealth + "/100", sub: avgHealth >= 70 ? "Good shape" : "Needs attention", color: avgHealth >= 70 ? C.success : C.warn },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center" })}>
            <div style={{ fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.serif, color: kpi.color || C.ink }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {EVENT_STAGES.filter(s => s !== "Complete" && s !== "Cancelled").map(stage => {
            const stageEvents = EVENTS.filter(e => e.stage === stage);
            const stageRev = stageEvents.reduce((s, e) => s + e.revenue, 0);
            return (
              <div key={stage} style={{ minWidth: 260, maxWidth: 260, background: C.bgWarm, borderRadius: 10, padding: 12, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: stageColors[stage], textTransform: "uppercase", letterSpacing: 0.5 }}>{stage}</div>
                  <span style={pillStyle(C.card, C.inkSec)}>{fmt(stageRev)}</span>
                </div>
                {stageEvents.map(ev => (
                  <div key={ev.id} onClick={() => setSelectedEvent(ev.id)} style={{ ...cardStyle({ padding: 14, marginBottom: 8, cursor: "pointer" }), borderLeft: `3px solid ${stageColors[stage]}` }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{ev.name}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 6 }}>{ev.client} · {fmtShort(ev.date)}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{fmt(ev.revenue)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 40, height: 4, background: C.borderLight, borderRadius: 2 }}>
                          <div style={{ width: ev.health + "%", height: "100%", borderRadius: 2, background: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger }} />
                        </div>
                        <span style={{ fontSize: 10, color: C.inkMuted }}>{ev.health}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {stageEvents.length === 0 && <div style={{ fontSize: 12, color: C.inkMuted, textAlign: "center", padding: 20 }}>No events</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
                {["Event", "Client", "Stage", "Date", "Revenue", "Health", "Probability"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EVENTS.map(ev => (
                <tr key={ev.id} onClick={() => setSelectedEvent(ev.id)} style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = C.cardHover} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "10px 12px" }}><div style={{ fontWeight: 600 }}>{ev.name}</div><div style={{ fontSize: 11, color: C.inkMuted }}>{ev.venue}</div></td>
                  <td style={{ padding: "10px 12px" }}>{ev.client}</td>
                  <td style={{ padding: "10px 12px" }}><span style={pillStyle(stageColors[ev.stage] + "20", stageColors[ev.stage])}>{ev.stage}</span></td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>{fmtShort(ev.date)}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{fmt(ev.revenue)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 4, background: C.borderLight, borderRadius: 2 }}><div style={{ width: ev.health + "%", height: "100%", borderRadius: 2, background: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger }} /></div>
                      <span style={{ fontSize: 11 }}>{ev.health}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>{ev.probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Forecast View */}
      {view === "forecast" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>Revenue by Event Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(() => { const types = {}; EVENTS.forEach(e => { types[e.type] = (types[e.type] || 0) + e.revenue; }); return Object.entries(types).map(([type, rev]) => ({ type: type.length > 15 ? type.slice(0,15)+"…" : type, revenue: rev })).sort((a,b) => b.revenue - a.revenue); })()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: C.inkMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£" + (v/1000) + "k"} />
                <Tooltip formatter={(v) => [fmt(v), "Revenue"]} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
                <Bar dataKey="revenue" fill={C.accent} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>Revenue by Stage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={(() => { const stages = {}; EVENTS.forEach(e => { stages[e.stage] = (stages[e.stage] || 0) + e.revenue; }); return Object.entries(stages).map(([stage, rev]) => ({ name: stage, value: rev })); })()} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                  {Object.keys(stageColors).map((s, i) => <Cell key={i} fill={stageColors[s] || C.inkMuted} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle({ gridColumn: "1 / -1" })}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>Monthly Revenue Forecast</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={(() => { const months = {}; EVENTS.forEach(e => { const m = new Date(e.date).toLocaleDateString("en-GB", { month: "short" }); months[m] = (months[m] || { total: 0, weighted: 0 }); months[m].total += e.revenue; months[m].weighted += Math.round(e.revenue * e.probability / 100); }); return Object.entries(months).map(([month, d]) => ({ month, ...d })); })()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.inkMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£" + (v/1000) + "k"} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
                <Area type="monotone" dataKey="total" stroke={C.accent} fill={C.accent + "20"} name="Total" />
                <Area type="monotone" dataKey="weighted" stroke={C.success} fill={C.success + "20"} name="Weighted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND CENTRE — Dashboard with KPIs, Charts, Activity Feed
// ══════════════════════════════════════════════════════════════════════════════

const CommandCentre = () => {
  const totalPipeline = EVENTS.reduce((s, e) => s + e.revenue, 0);
  const confirmedRev = EVENTS.filter(e => ["Confirmed","Planning","Execution","Complete"].includes(e.stage)).reduce((s, e) => s + e.revenue, 0);
  const leadConversion = Math.round((LEADS.filter(l => l.stage === "Won").length / LEADS.length) * 100);
  const avgUtil = Math.round(TEAM.reduce((s, t) => s + t.utilisation, 0) / TEAM.length);
  const atRisk = EVENTS.filter(e => e.health < 60);
  const unpaidInvoices = INVOICES.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount - i.paid, 0);

  const revenueByMonth = (() => { const m = {}; EVENTS.forEach(e => { const mo = new Date(e.date).toLocaleDateString("en-GB",{month:"short"}); m[mo] = (m[mo]||0) + e.revenue; }); return Object.entries(m).map(([month,rev]) => ({month,rev})); })();
  const leadsByStage = LEAD_STAGES.map(s => ({ stage: s.length > 8 ? s.slice(0,8) : s, count: LEADS.filter(l => l.stage === s).length }));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Command Centre</h1>
        <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Business overview · Real-time metrics</div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Pipeline Value", value: fmt(totalPipeline), color: C.ink },
          { label: "Confirmed Revenue", value: fmt(confirmedRev), color: C.success },
          { label: "Total Leads", value: LEADS.length.toString(), color: C.info },
          { label: "Lead Conversion", value: pct(leadConversion), color: C.accent },
          { label: "Team Utilisation", value: pct(avgUtil), color: avgUtil >= 80 ? C.success : C.warn },
          { label: "Outstanding", value: fmt(unpaidInvoices), color: unpaidInvoices > 20000 ? C.danger : C.warn },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center", padding: 16 })}>
            <div style={{ fontSize: 10, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.inkMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£"+(v/1000)+"k"} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              <Bar dataKey="rev" fill={C.accent} radius={[4,4,0,0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Activity Feed</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACTIVITY.slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Lead Pipeline */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Lead Pipeline Stages</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={leadsByStage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis type="number" tick={{ fontSize: 10, fill: C.inkMuted }} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: C.inkMuted }} width={75} />
              <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              <Bar dataKey="count" fill={C.info} radius={[0,4,4,0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* At-Risk Events */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 12px" }}>At-Risk Events</h3>
          {atRisk.length === 0 ? <div style={{ color: C.success, fontSize: 13 }}>All events in good health</div> :
            atRisk.map(ev => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.name}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted }}>{ev.client} · {fmtShort(ev.date)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 50, height: 6, background: C.borderLight, borderRadius: 3 }}>
                    <div style={{ width: ev.health + "%", height: "100%", borderRadius: 3, background: ev.health < 50 ? C.danger : C.warn }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ev.health < 50 ? C.danger : C.warn }}>{ev.health}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TIME & UTILISATION — Capacity Planning
// ══════════════════════════════════════════════════════════════════════════════

const TimeUtilisation = () => {
  const avgUtil = Math.round(TEAM.reduce((s, t) => s + t.utilisation, 0) / TEAM.length);
  const totalCapacity = TEAM.reduce((s, t) => s + t.capacity, 0);
  const totalHours = TEAM.reduce((s, t) => s + t.hoursThisWeek, 0);
  const overloaded = TEAM.filter(t => t.utilisation > 100);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Time & Utilisation</h1>
        <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Team capacity · Workload planning</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Avg Utilisation", value: pct(avgUtil), color: avgUtil >= 80 ? C.success : C.warn },
          { label: "Weekly Hours", value: totalHours + " / " + totalCapacity, color: C.ink },
          { label: "Team Size", value: TEAM.length.toString(), color: C.info },
          { label: "Overloaded", value: overloaded.length.toString(), color: overloaded.length > 0 ? C.danger : C.success },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center" })}>
            <div style={{ fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.serif, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Team Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
        {TEAM.map((t, i) => (
          <div key={i} style={cardStyle({ display: "flex", gap: 16, alignItems: "center" })}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div><strong style={{ fontSize: 14 }}>{t.name}</strong><div style={{ fontSize: 11, color: C.inkMuted }}>{t.role} · {fmt(t.rate)}/hr</div></div>
                <span style={pillStyle(t.utilisation > 100 ? C.dangerBg : t.utilisation >= 80 ? C.successBg : C.warnBg, t.utilisation > 100 ? C.danger : t.utilisation >= 80 ? C.success : C.warn)}>{pct(t.utilisation)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: C.borderLight, borderRadius: 3 }}>
                  <div style={{ width: Math.min(t.utilisation, 120) + "%", maxWidth: "100%", height: "100%", borderRadius: 3, background: t.utilisation > 100 ? C.danger : t.utilisation >= 80 ? C.success : C.warn }} />
                </div>
                <span style={{ fontSize: 11, color: C.inkMuted, whiteSpace: "nowrap" }}>{t.hoursThisWeek}h / {t.capacity}h</span>
              </div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>This month: {t.hoursThisMonth}h</div>
            </div>
          </div>
        ))}
      </div>

      {/* Utilisation Chart */}
      <div style={cardStyle()}>
        <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Team Utilisation Overview</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={TEAM.map(t => ({ name: t.name.split(" ")[0], util: t.utilisation, capacity: 100 }))}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.inkMuted }} />
            <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} domain={[0, 120]} tickFormatter={v => v + "%"} />
            <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
            <Bar dataKey="capacity" fill={C.borderLight} radius={[4,4,0,0]} name="Capacity" />
            <Bar dataKey="util" fill={C.accent} radius={[4,4,0,0]} name="Utilisation" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FINANCIAL HUB — Xero/QuickBooks-Inspired
// ══════════════════════════════════════════════════════════════════════════════

const FinancialHub = () => {
  const [tab, setTab] = useState("overview"); // overview | invoices | expenses | cashflow

  const totalInvoiced = INVOICES.reduce((s, i) => s + i.amount, 0);
  const totalPaid = INVOICES.reduce((s, i) => s + i.paid, 0);
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const billableExpenses = EXPENSES.filter(e => e.billable).reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalPaid - totalExpenses;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Financial Hub</h1>
          <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Invoicing · Expenses · Cash Flow</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{id:"overview",l:"Overview"},{id:"invoices",l:"Invoices"},{id:"expenses",l:"Expenses"},{id:"cashflow",l:"Cash Flow"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={btnStyle(tab === t.id ? "primary" : "outline")}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Invoiced", value: fmt(totalInvoiced) },
          { label: "Collected", value: fmt(totalPaid), color: C.success },
          { label: "Outstanding", value: fmt(totalInvoiced - totalPaid), color: C.warn },
          { label: "Expenses", value: fmt(totalExpenses), color: C.danger },
          { label: "Gross Profit", value: fmt(grossProfit), color: grossProfit > 0 ? C.success : C.danger },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center", padding: 14 })}>
            <div style={{ fontSize: 10, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.serif, color: kpi.color || C.ink }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Invoice Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[{ name: "Paid", value: INVOICES.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0) }, { name: "Partial", value: INVOICES.filter(i=>i.status==="Partial").reduce((s,i)=>s+i.amount-i.paid,0) }, { name: "Sent", value: INVOICES.filter(i=>i.status==="Sent").reduce((s,i)=>s+i.amount,0) }, { name: "Draft", value: INVOICES.filter(i=>i.status==="Draft").reduce((s,i)=>s+i.amount,0) }]} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                  <Cell fill={C.success} /><Cell fill={C.warn} /><Cell fill={C.info} /><Cell fill={C.inkMuted} />
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(() => { const cats = {}; EXPENSES.forEach(e => { cats[e.category] = (cats[e.category]||0) + e.amount; }); return Object.entries(cats).map(([cat,amt]) => ({ cat: cat.length > 12 ? cat.slice(0,12)+"…" : cat, amount: amt })).sort((a,b)=>b.amount-a.amount); })()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                <XAxis dataKey="cat" tick={{ fontSize: 9, fill: C.inkMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£"+v} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
                <Bar dataKey="amount" fill={C.danger} radius={[4,4,0,0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Invoices */}
      {tab === "invoices" && (
        <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
                {["Invoice", "Event", "Client", "Amount", "Paid", "Status", "Due"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map(inv => {
                const statusColors = { Paid: C.success, Partial: C.warn, Sent: C.info, Draft: C.inkMuted };
                return (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, fontFamily: F.mono, fontSize: 12 }}>{inv.id}</td>
                    <td style={{ padding: "10px 12px" }}>{inv.event}</td>
                    <td style={{ padding: "10px 12px", color: C.inkSec }}>{inv.client}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{fmt(inv.amount)}</td>
                    <td style={{ padding: "10px 12px", color: C.success }}>{fmt(inv.paid)}</td>
                    <td style={{ padding: "10px 12px" }}><span style={pillStyle(statusColors[inv.status] + "20", statusColors[inv.status])}>{inv.status}</span></td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: C.inkMuted }}>{fmtShort(inv.due)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses */}
      {tab === "expenses" && (
        <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
                {["Category", "Event", "Amount", "Date", "Billable"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXPENSES.map(exp => (
                <tr key={exp.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{exp.category}</td>
                  <td style={{ padding: "10px 12px", color: C.inkSec }}>{exp.event}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{fmt(exp.amount)}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: C.inkMuted }}>{fmtShort(exp.date)}</td>
                  <td style={{ padding: "10px 12px" }}><span style={pillStyle(exp.billable ? C.successBg : C.bgWarm, exp.billable ? C.success : C.inkMuted)}>{exp.billable ? "Billable" : "Non-billable"}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: C.bgWarm, borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>Total</td>
                <td></td>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>{fmt(totalExpenses)}</td>
                <td></td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: C.inkMuted }}>Billable: {fmt(billableExpenses)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Cash Flow */}
      {tab === "cashflow" && (
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>30-Day Cash Flow Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: C.inkMuted }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£"+(v/1000)+"k"} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              <Area type="monotone" dataKey="inflow" stroke={C.success} fill={C.success+"20"} name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke={C.danger} fill={C.danger+"20"} name="Outflow" />
              <Line type="monotone" dataKey="net" stroke={C.accent} strokeWidth={2} dot={false} name="Net" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// AI ASSISTANT — Smart Recommendations
// ══════════════════════════════════════════════════════════════════════════════

const AIAssistant = () => {
  const [query, setQuery] = useState("");

  const topLeads = [...LEADS].sort((a, b) => b.score - a.score).slice(0, 5);
  const atRiskEvents = EVENTS.filter(e => e.health < 60);
  const overloadedTeam = TEAM.filter(t => t.utilisation > 95);
  const overdueInvoices = INVOICES.filter(i => i.status !== "Paid" && new Date(i.due) < new Date());

  const insights = [
    { icon: "🎯", title: "Top Lead Opportunity", text: `${topLeads[0]?.name} scores ${topLeads[0]?.score}/100 with ${fmt(topLeads[0]?.revenue)} potential. Contact ${topLeads[0]?.contactName} (${topLeads[0]?.role}) to progress.`, priority: "high" },
    ...(atRiskEvents.length > 0 ? [{ icon: "⚠️", title: "At-Risk Events", text: `${atRiskEvents.length} event(s) have health below 60: ${atRiskEvents.map(e => e.name).join(", ")}. Immediate attention needed.`, priority: "high" }] : []),
    ...(overloadedTeam.length > 0 ? [{ icon: "👤", title: "Team Capacity Alert", text: `${overloadedTeam.map(t => t.name).join(", ")} ${overloadedTeam.length > 1 ? "are" : "is"} at ${overloadedTeam.map(t => pct(t.utilisation)).join(", ")} utilisation. Consider redistributing workload.`, priority: "medium" }] : []),
    ...(overdueInvoices.length > 0 ? [{ icon: "💰", title: "Overdue Invoices", text: `${overdueInvoices.length} invoice(s) overdue: ${overdueInvoices.map(i => i.id).join(", ")}. Follow up with clients.`, priority: "medium" }] : []),
    { icon: "📊", title: "Pipeline Health", text: `${EVENTS.filter(e=>e.health>=80).length} of ${EVENTS.length} events are healthy. Weighted pipeline value: ${fmt(EVENTS.reduce((s,e)=>s+e.revenue*e.probability/100,0))}.`, priority: "low" },
    { icon: "📈", title: "Lead Source Performance", text: `Top sources: ${(() => { const src={}; LEADS.forEach(l=>{src[l.source]=(src[l.source]||0)+1}); return Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([s,c])=>`${s} (${c})`).join(", "); })()}. Focus outreach on high-performing channels.`, priority: "low" },
    { icon: "🔮", title: "Revenue Forecast", text: `Confirmed revenue: ${fmt(EVENTS.filter(e=>["Confirmed","Planning","Execution"].includes(e.stage)).reduce((s,e)=>s+e.revenue,0))}. With proposals converting at 60%, expect additional ${fmt(Math.round(EVENTS.filter(e=>e.stage==="Proposal").reduce((s,e)=>s+e.revenue,0)*0.6))}.`, priority: "low" },
  ];

  const priorityColors = { high: { bg: C.dangerBg, border: C.dangerBorder, color: C.danger }, medium: { bg: C.warnBg, border: C.warnBorder, color: C.warn }, low: { bg: C.infoBg, border: C.infoBorder, color: C.info } };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>AI Assistant</h1>
        <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Smart insights · Recommendations · Natural language search</div>
      </div>

      {/* Search */}
      <div style={cardStyle({ marginBottom: 24, display: "flex", gap: 10 })}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask anything... e.g. 'Show me high-value leads in Mayfair' or 'Which events need attention?'" style={{ ...inputStyle, flex: 1 }} />
        <button style={btnStyle("primary")}>Ask AI</button>
      </div>

      {/* Insights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {insights.map((ins, i) => {
          const pc = priorityColors[ins.priority];
          return (
            <div key={i} style={{ ...cardStyle({ padding: 16 }), borderLeft: `3px solid ${pc.color}`, background: pc.bg }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{ins.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: C.ink }}>{ins.title}</div>
                  <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.5 }}>{ins.text}</div>
                </div>
                <span style={pillStyle(pc.color + "20", pc.color)}>{ins.priority}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Leads */}
      <div style={cardStyle({ marginTop: 24 })}>
        <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Top 5 Leads by AI Score</h3>
        {topLeads.map((l, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.borderLight}` : "none" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{l.name}</div>
              <div style={{ fontSize: 11, color: C.inkMuted }}>{l.contactName} · {l.location} · {l.stage}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(l.revenue)}</span>
              <span style={pillStyle(l.score >= 80 ? C.successBg : C.warnBg, l.score >= 80 ? C.success : C.warn)}>{l.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════════════════

const NAV = [
  { id: "command", label: "Command Centre", icon: "◎" },
  { id: "leads", label: "Lead Engine", icon: "◉" },
  { id: "pipeline", label: "Event Pipeline", icon: "▤" },
  { id: "time", label: "Time & Utilisation", icon: "◔" },
  { id: "finance", label: "Financial Hub", icon: "◈" },
  { id: "ai", label: "AI Assistant", icon: "◇" },
];

export default function App() {
  const [page, setPage] = useState("command");
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  // Initialize CRM data store with seed data on first load
  useEffect(() => { initializeStore(RAW_LEADS); }, []);

  const pages = { command: CommandCentre, leads: LeadEngine, pipeline: EventPipeline, time: TimeUtilisation, finance: FinancialHub, ai: AIAssistant };
  const Page = pages[page] || CommandCentre;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: F.sans, color: C.ink }}>
      {/* Sidebar */}
      <nav style={{ width: 200, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 10 }}>
          <HHTLogo s={28} />
          <div>
            <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>HH&T</div>
            <div style={{ fontSize: 10, color: C.inkMuted, letterSpacing: 0.3 }}>Operations</div>
          </div>
        </div>
        <div style={{ padding: "12px 8px", flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px", marginBottom: 2, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontFamily: F.sans, fontWeight: page === n.id ? 600 : 400, background: page === n.id ? C.accentSubtle : "transparent", color: page === n.id ? C.accent : C.inkSec, transition: "all 0.15s" }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>JS</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Joe Stokoe</div>
              <div style={{ fontSize: 10, color: C.inkMuted }}>Director & Founder</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "14px 24px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.card, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: C.inkMuted }}>{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={pillStyle(C.successBg, C.success)}>● 3 APIs Connected</span>
            <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.mono }}>Ghost Operator v4.0</span>
          </div>
        </header>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Page />
        </div>
      </main>
    </div>
  );
}
