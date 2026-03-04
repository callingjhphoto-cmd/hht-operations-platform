import { useState, useMemo, useCallback, useEffect } from "react";

/* ── Design Tokens ── */
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

/* ── Constants ── */
const EVENT_TYPES = ["Cocktail Bar Hire", "Masterclass", "Brand Activation", "Wedding Bar", "Corporate Event", "Festival Bar", "Pop-up Bar", "Private Party"];
const STATUSES = ["Enquiry", "Confirmed", "In Planning", "Setup", "Live", "Complete", "Cancelled"];
const STAFF = ["Joe Stokoe", "Matt Robertson", "Emily Blacklock", "Seb Davis", "Jason Sales", "Anja Rubin", "Katy Kedslie"];
const CHECKLIST_ITEMS = [
  "Venue confirmed", "Menu finalized", "Staff assigned", "Equipment ordered",
  "Client briefed", "Transport arranged", "Bar setup plan", "Risk assessment",
  "Spirits ordered", "Ice delivery confirmed",
];

const STATUS_COLORS = {
  Enquiry: { bg: C.infoBg, fg: C.info },
  Confirmed: { bg: C.successBg, fg: C.success },
  "In Planning": { bg: C.warnBg, fg: C.warn },
  Setup: { bg: "#F5F0FA", fg: "#6B3FA0" },
  Live: { bg: "#E8F8E8", fg: "#1A7A1A" },
  Complete: { bg: C.bgWarm, fg: C.inkSec },
  Cancelled: { bg: C.dangerBg, fg: C.danger },
};

const TYPE_DOT_COLORS = {
  "Cocktail Bar Hire": "#7D5A1A",
  Masterclass: "#2A6680",
  "Brand Activation": "#6B3FA0",
  "Wedding Bar": "#C77D9A",
  "Corporate Event": "#2B7A4B",
  "Festival Bar": "#D4881A",
  "Pop-up Bar": "#9B3535",
  "Private Party": "#5C564E",
};

const STORAGE_KEY = "hht_events_v1";

/* ── Seed Data ── */
function buildSeedEvents() {
  return [
    {
      id: "evt-001", name: "Diageo Summer Showcase", client: "Diageo UK", venue: "The Shard, London",
      date: "2025-07-18", time: "18:00", guestCount: 200, type: "Brand Activation", status: "Complete",
      revenue: 12500, budget: { estimated: 4800, actual: 5100 }, healthScore: 92,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map(c => [c, true])),
      staff: ["Joe Stokoe", "Matt Robertson", "Emily Blacklock", "Seb Davis"],
      timeline: [
        { ts: "2025-05-10T09:00:00Z", text: "Enquiry received from Diageo events team" },
        { ts: "2025-05-15T14:30:00Z", text: "Proposal sent — 200-guest cocktail activation" },
        { ts: "2025-05-22T11:00:00Z", text: "Contract signed, deposit received" },
        { ts: "2025-07-18T22:00:00Z", text: "Event completed — client very happy" },
      ],
    },
    {
      id: "evt-002", name: "Hendrick's Gin Garden Party", client: "Hendrick's Gin / William Grant", venue: "Alnwick Garden, Northumberland",
      date: "2025-08-22", time: "14:00", guestCount: 150, type: "Cocktail Bar Hire", status: "Complete",
      revenue: 9800, budget: { estimated: 3600, actual: 3450 }, healthScore: 95,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map(c => [c, true])),
      staff: ["Matt Robertson", "Anja Rubin", "Katy Kedslie"],
      timeline: [
        { ts: "2025-06-05T10:00:00Z", text: "Brief received from Hendrick's brand team" },
        { ts: "2025-08-22T20:00:00Z", text: "Garden party delivered — botanical theme a hit" },
      ],
    },
    {
      id: "evt-003", name: "Pernod Ricard Trade Launch", client: "Pernod Ricard UK", venue: "Baltic Centre, Gateshead",
      date: "2025-11-14", time: "19:00", guestCount: 120, type: "Brand Activation", status: "Complete",
      revenue: 8200, budget: { estimated: 3200, actual: 3100 }, healthScore: 88,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map(c => [c, true])),
      staff: ["Joe Stokoe", "Emily Blacklock", "Jason Sales"],
      timeline: [
        { ts: "2025-09-20T09:00:00Z", text: "Initial meeting with Pernod Ricard" },
        { ts: "2025-11-14T23:00:00Z", text: "Event wrapped — 120 trade guests served" },
      ],
    },
    {
      id: "evt-004", name: "Thompson-Clarke Wedding", client: "Sarah Thompson & James Clarke", venue: "Matfen Hall, Northumberland",
      date: "2026-03-28", time: "15:00", guestCount: 180, type: "Wedding Bar", status: "In Planning",
      revenue: 7500, budget: { estimated: 2800, actual: 0 }, healthScore: 74,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 5])),
      staff: ["Matt Robertson", "Anja Rubin", "Katy Kedslie", "Seb Davis"],
      timeline: [
        { ts: "2025-10-02T10:30:00Z", text: "Wedding enquiry via website" },
        { ts: "2025-10-15T14:00:00Z", text: "Tasting session completed — couple loved espresso martini" },
        { ts: "2026-01-20T09:00:00Z", text: "Final menu confirmed — 8 signature cocktails" },
      ],
    },
    {
      id: "evt-005", name: "Northern Powerhouse Awards", client: "Northern Powerhouse Partnership", venue: "Royal Armouries, Leeds",
      date: "2026-04-10", time: "18:30", guestCount: 300, type: "Corporate Event", status: "Confirmed",
      revenue: 15000, budget: { estimated: 6200, actual: 0 }, healthScore: 82,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 3])),
      staff: ["Joe Stokoe", "Matt Robertson", "Emily Blacklock"],
      timeline: [
        { ts: "2026-01-08T11:00:00Z", text: "RFP received for 300-guest awards ceremony" },
        { ts: "2026-01-22T16:00:00Z", text: "Proposal accepted — premium package confirmed" },
      ],
    },
    {
      id: "evt-006", name: "Diageo Whisky Masterclass Series", client: "Diageo UK", venue: "Fenwick Newcastle",
      date: "2026-03-07", time: "19:00", guestCount: 30, type: "Masterclass", status: "Setup",
      revenue: 3200, budget: { estimated: 1100, actual: 950 }, healthScore: 90,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 8])),
      staff: ["Joe Stokoe", "Seb Davis"],
      timeline: [
        { ts: "2026-01-15T10:00:00Z", text: "Masterclass series agreed — 6 sessions" },
        { ts: "2026-02-28T14:00:00Z", text: "Session 3 materials prepped — Talisker focus" },
      ],
    },
    {
      id: "evt-007", name: "Jesmond Food Market Pop-Up", client: "Jesmond Community Market", venue: "Jesmond Dene, Newcastle",
      date: "2026-04-25", time: "11:00", guestCount: 500, type: "Pop-up Bar", status: "In Planning",
      revenue: 4500, budget: { estimated: 1800, actual: 0 }, healthScore: 65,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 2])),
      staff: ["Emily Blacklock", "Jason Sales"],
      timeline: [
        { ts: "2026-02-10T09:00:00Z", text: "Approached by market organisers for outdoor cocktail bar" },
      ],
    },
    {
      id: "evt-008", name: "Ramside Hall Corporate Away Day", client: "Sage Group", venue: "Ramside Hall, Durham",
      date: "2026-05-15", time: "14:00", guestCount: 80, type: "Corporate Event", status: "Enquiry",
      revenue: 5800, budget: { estimated: 2200, actual: 0 }, healthScore: 50,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map(() => [, false])),
      staff: [],
      timeline: [
        { ts: "2026-02-28T16:00:00Z", text: "Enquiry from Sage Group HR — team building cocktail making" },
      ],
    },
    {
      id: "evt-009", name: "This is Tomorrow Festival Bar", client: "SSD Concerts", venue: "Exhibition Park, Newcastle",
      date: "2026-06-06", time: "12:00", guestCount: 2000, type: "Festival Bar", status: "Confirmed",
      revenue: 28000, budget: { estimated: 12000, actual: 0 }, healthScore: 78,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 4])),
      staff: ["Joe Stokoe", "Matt Robertson", "Emily Blacklock", "Seb Davis", "Jason Sales", "Anja Rubin", "Katy Kedslie"],
      timeline: [
        { ts: "2025-12-01T10:00:00Z", text: "Festival bar contract received for 2026" },
        { ts: "2026-01-15T14:00:00Z", text: "Contract signed — 3 bar stations agreed" },
        { ts: "2026-02-20T11:00:00Z", text: "Spirits order placed with Diageo & Pernod Ricard" },
      ],
    },
    {
      id: "evt-010", name: "Patel-Richards Engagement Party", client: "Anika Patel & Tom Richards", venue: "As You Like It, Jesmond",
      date: "2026-03-14", time: "19:30", guestCount: 60, type: "Private Party", status: "In Planning",
      revenue: 2800, budget: { estimated: 1000, actual: 200 }, healthScore: 80,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 6])),
      staff: ["Anja Rubin", "Katy Kedslie"],
      timeline: [
        { ts: "2026-01-25T12:00:00Z", text: "Engagement party enquiry — 60 guests, cocktail & prosecco" },
        { ts: "2026-02-14T10:00:00Z", text: "Menu finalised — couple want a negroni station" },
      ],
    },
    {
      id: "evt-011", name: "Fenwick Christmas Cocktail Lounge", client: "Fenwick Ltd", venue: "Fenwick Newcastle, Rooftop",
      date: "2025-12-12", time: "17:00", guestCount: 100, type: "Pop-up Bar", status: "Complete",
      revenue: 6500, budget: { estimated: 2400, actual: 2350 }, healthScore: 94,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map(c => [c, true])),
      staff: ["Joe Stokoe", "Emily Blacklock", "Anja Rubin"],
      timeline: [
        { ts: "2025-10-01T09:00:00Z", text: "Fenwick Christmas activation brief received" },
        { ts: "2025-12-12T22:00:00Z", text: "Pop-up complete — Fenwick want to rebook for 2026" },
      ],
    },
    {
      id: "evt-012", name: "Hendrick's Cucumber Glasshouse", client: "Hendrick's Gin / William Grant", venue: "Grey Street Hotel, Newcastle",
      date: "2026-05-30", time: "18:00", guestCount: 45, type: "Brand Activation", status: "Enquiry",
      revenue: 7200, budget: { estimated: 2800, actual: 0 }, healthScore: 45,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map(() => [, false])),
      staff: [],
      timeline: [
        { ts: "2026-03-01T11:00:00Z", text: "Brief from William Grant — immersive Hendrick's experience" },
      ],
    },
    {
      id: "evt-013", name: "Ouseburn Studios Open Evening", client: "Ouseburn Trust", venue: "36 Lime Street, Ouseburn",
      date: "2026-03-21", time: "18:00", guestCount: 75, type: "Cocktail Bar Hire", status: "Confirmed",
      revenue: 3500, budget: { estimated: 1300, actual: 0 }, healthScore: 85,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 5])),
      staff: ["Seb Davis", "Jason Sales", "Katy Kedslie"],
      timeline: [
        { ts: "2026-02-05T09:30:00Z", text: "Ouseburn Trust enquiry for art studios open evening bar" },
        { ts: "2026-02-18T14:00:00Z", text: "Booking confirmed — craft cocktail focus" },
      ],
    },
    {
      id: "evt-014", name: "Metro Radio Arena VIP Bar", client: "ASM Global", venue: "Utilita Arena, Newcastle",
      date: "2026-04-18", time: "17:00", guestCount: 250, type: "Corporate Event", status: "In Planning",
      revenue: 11000, budget: { estimated: 4500, actual: 0 }, healthScore: 70,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map((c, i) => [c, i < 3])),
      staff: ["Joe Stokoe", "Matt Robertson", "Seb Davis", "Jason Sales"],
      timeline: [
        { ts: "2026-02-12T10:00:00Z", text: "ASM Global VIP bar enquiry for arena concert night" },
        { ts: "2026-02-25T15:00:00Z", text: "Confirmed for Sam Fender homecoming show VIP area" },
      ],
    },
  ];
}

/* ── Helpers ── */
function uid() { return "evt-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }

function fmt(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtCurrency(n) {
  return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 0 });
}

function daysFromNow(dateStr) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { startDay, daysInMonth };
}

/* ── Sub-components ── */

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: C.bgWarm, fg: C.inkSec };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 99,
      fontSize: 12, fontWeight: 600, fontFamily: F.sans,
      background: c.bg, color: c.fg, whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

function HealthDot({ score }) {
  const color = score >= 80 ? C.success : score >= 60 ? C.warn : C.danger;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: F.mono, fontSize: 13, color }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {score}
    </span>
  );
}

/* ── Quick Stats Bar ── */
function StatsBar({ events }) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const active = events.filter(e => e.status !== "Cancelled");
    const upcoming = active.filter(e => {
      const d = new Date(e.date);
      return d >= monthStart && d <= monthEnd && e.status !== "Complete";
    });
    const confirmedRev = active.filter(e => e.status !== "Enquiry").reduce((s, e) => s + (e.revenue || 0), 0);
    const avgHealth = active.length ? Math.round(active.reduce((s, e) => s + (e.healthScore || 0), 0) / active.length) : 0;
    return { total: events.length, upcoming: upcoming.length, confirmedRev, avgHealth };
  }, [events]);

  const cards = [
    { label: "Total Events", value: stats.total, icon: "📋" },
    { label: "Upcoming This Month", value: stats.upcoming, icon: "📅" },
    { label: "Revenue Confirmed", value: fmtCurrency(stats.confirmedRev), icon: "💰" },
    { label: "Avg Health Score", value: stats.avgHealth, icon: "❤️" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: C.card, borderRadius: 10, padding: "16px 20px",
          border: `1px solid ${C.borderLight}`,
        }}>
          <div style={{ fontSize: 12, color: C.inkMuted, fontFamily: F.sans, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {c.icon} {c.label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.serif, color: C.ink }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Calendar View ── */
function CalendarView({ events, year, month, onChangeMonth, onSelectDate, selectedDate }) {
  const { startDay, daysInMonth } = useMemo(() => getMonthDays(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const d = e.date;
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [events]);

  const monthName = new Date(year, month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => onChangeMonth(-1)} style={navBtnStyle}>← Prev</button>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, color: C.ink, margin: 0 }}>{monthName}</h3>
        <button onClick={() => onChangeMonth(1)} style={navBtnStyle}>Next →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, background: C.borderLight, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {dayNames.map(dn => (
          <div key={dn} style={{ padding: "8px 4px", textAlign: "center", fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.inkMuted, background: C.bgWarm, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {dn}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={"e" + i} style={{ background: C.bg, minHeight: 80 }} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <div key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              style={{
                background: isSelected ? C.accentSubtle : C.card, minHeight: 80, padding: 6,
                cursor: "pointer", position: "relative",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = C.cardHover; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = C.card; }}
            >
              <div style={{
                fontSize: 13, fontWeight: isToday ? 800 : 500, fontFamily: F.sans,
                color: isToday ? C.accent : C.ink,
                width: 24, height: 24, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isToday ? C.accentSubtle : "transparent",
              }}>
                {day}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>
                {dayEvents.slice(0, 4).map(ev => (
                  <span key={ev.id} title={ev.name} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: TYPE_DOT_COLORS[ev.type] || C.accent,
                    display: "inline-block",
                  }} />
                ))}
                {dayEvents.length > 4 && (
                  <span style={{ fontSize: 9, color: C.inkMuted, fontFamily: F.sans }}>+{dayEvents.length - 4}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {selectedDate && eventsByDate[selectedDate] && (
        <div style={{ marginTop: 16, background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16 }}>
          <h4 style={{ fontFamily: F.serif, fontSize: 16, color: C.ink, margin: "0 0 12px" }}>Events on {fmt(selectedDate)}</h4>
          {eventsByDate[selectedDate].map(ev => (
            <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_DOT_COLORS[ev.type] || C.accent, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.ink }}>{ev.name}</div>
                <div style={{ fontFamily: F.sans, fontSize: 12, color: C.inkMuted }}>{ev.client} — {ev.venue}</div>
              </div>
              <StatusBadge status={ev.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
  padding: "6px 14px", fontSize: 13, fontFamily: F.sans, color: C.ink,
  cursor: "pointer", fontWeight: 500,
};

/* ── Event List View ── */
function EventListView({ events, onSelectEvent, sortField, sortDir, onSort }) {
  const cols = [
    { key: "name", label: "Event Name", flex: 2 },
    { key: "client", label: "Client", flex: 1.5 },
    { key: "venue", label: "Venue", flex: 1.5 },
    { key: "date", label: "Date", flex: 1 },
    { key: "guestCount", label: "Guests", flex: 0.6 },
    { key: "status", label: "Status", flex: 1 },
    { key: "revenue", label: "Revenue", flex: 0.8 },
    { key: "healthScore", label: "Health", flex: 0.6 },
  ];

  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", background: C.bgWarm, padding: "10px 16px", borderBottom: `1px solid ${C.border}` }}>
        {cols.map(col => (
          <div key={col.key}
            onClick={() => onSort(col.key)}
            style={{
              flex: col.flex, fontSize: 11, fontWeight: 700, fontFamily: F.sans,
              color: sortField === col.key ? C.accent : C.inkMuted,
              textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer",
              userSelect: "none", display: "flex", alignItems: "center", gap: 3,
            }}
          >
            {col.label}
            {sortField === col.key && <span style={{ fontSize: 10 }}>{sortDir === "asc" ? "▲" : "▼"}</span>}
          </div>
        ))}
      </div>
      {/* Rows */}
      {events.map(ev => (
        <div key={ev.id}
          onClick={() => onSelectEvent(ev)}
          style={{
            display: "flex", padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}`,
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
          onMouseLeave={e => e.currentTarget.style.background = C.card}
        >
          <div style={{ flex: 2, fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</div>
          <div style={{ flex: 1.5, fontFamily: F.sans, fontSize: 13, color: C.inkSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.client}</div>
          <div style={{ flex: 1.5, fontFamily: F.sans, fontSize: 13, color: C.inkSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.venue}</div>
          <div style={{ flex: 1, fontFamily: F.mono, fontSize: 13, color: C.inkSec }}>{fmt(ev.date)}</div>
          <div style={{ flex: 0.6, fontFamily: F.mono, fontSize: 13, color: C.inkSec, textAlign: "center" }}>{ev.guestCount}</div>
          <div style={{ flex: 1 }}><StatusBadge status={ev.status} /></div>
          <div style={{ flex: 0.8, fontFamily: F.mono, fontSize: 13, color: C.ink, fontWeight: 600 }}>{fmtCurrency(ev.revenue)}</div>
          <div style={{ flex: 0.6 }}><HealthDot score={ev.healthScore} /></div>
        </div>
      ))}
      {events.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: C.inkMuted, fontFamily: F.sans, fontSize: 14 }}>
          No events match your filters.
        </div>
      )}
    </div>
  );
}

/* ── Event Detail Modal ── */
function EventDetailModal({ event, onClose, onUpdate }) {
  const [tab, setTab] = useState("overview");
  const [localEvent, setLocalEvent] = useState({ ...event });

  useEffect(() => { setLocalEvent({ ...event }); setTab("overview"); }, [event]);

  const save = useCallback((patch) => {
    const updated = { ...localEvent, ...patch };
    setLocalEvent(updated);
    onUpdate(updated);
  }, [localEvent, onUpdate]);

  const toggleCheck = useCallback((item) => {
    const newChecklist = { ...localEvent.checklist, [item]: !localEvent.checklist[item] };
    save({ checklist: newChecklist });
  }, [localEvent, save]);

  const toggleStaff = useCallback((name) => {
    const list = [...(localEvent.staff || [])];
    const idx = list.indexOf(name);
    if (idx >= 0) list.splice(idx, 1); else list.push(name);
    save({ staff: list });
  }, [localEvent, save]);

  const addTimelineEntry = useCallback((text) => {
    if (!text.trim()) return;
    const entry = { ts: new Date().toISOString(), text: text.trim() };
    save({ timeline: [...(localEvent.timeline || []), entry] });
  }, [localEvent, save]);

  const updateBudget = useCallback((field, value) => {
    const num = parseFloat(value) || 0;
    save({ budget: { ...localEvent.budget, [field]: num } });
  }, [localEvent, save]);

  const updateField = useCallback((field, value) => {
    save({ [field]: value });
  }, [save]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "checklist", label: "Checklist" },
    { key: "staff", label: "Staff" },
    { key: "timeline", label: "Timeline" },
    { key: "budget", label: "Budget" },
  ];

  const checklistComplete = useMemo(() => {
    const items = Object.values(localEvent.checklist || {});
    const done = items.filter(Boolean).length;
    return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
  }, [localEvent.checklist]);

  const budgetVariance = useMemo(() => {
    const est = localEvent.budget?.estimated || 0;
    const act = localEvent.budget?.actual || 0;
    return { est, act, diff: est - act, pct: est ? Math.round(((est - act) / est) * 100) : 0 };
  }, [localEvent.budget]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(24,21,15,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}
      onClick={onClose}
    >
      <div style={{
        background: C.card, borderRadius: 14, width: "90%", maxWidth: 780, maxHeight: "90vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, margin: "0 0 4px" }}>{localEvent.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <StatusBadge status={localEvent.status} />
              <span style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec }}>{localEvent.type}</span>
              <HealthDot score={localEvent.healthScore} />
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 22, color: C.inkMuted, cursor: "pointer",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 6,
          }}
            onMouseEnter={e => e.currentTarget.style.background = C.bgWarm}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 24px", background: C.bg }}>
          {tabs.map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 16px", fontFamily: F.sans, fontSize: 13, fontWeight: 600,
                color: tab === t.key ? C.accent : C.inkMuted,
                background: "transparent", border: "none", cursor: "pointer",
                borderBottom: tab === t.key ? `2px solid ${C.accent}` : "2px solid transparent",
                marginBottom: -1, transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Client", field: "client" },
                { label: "Venue", field: "venue" },
                { label: "Date", field: "date", type: "date" },
                { label: "Time", field: "time", type: "time" },
                { label: "Guest Count", field: "guestCount", type: "number" },
                { label: "Revenue (£)", field: "revenue", type: "number" },
                { label: "Health Score", field: "healthScore", type: "number" },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type || "text"}
                    value={localEvent[f.field] || ""}
                    onChange={e => updateField(f.field, f.type === "number" ? (parseFloat(e.target.value) || 0) : e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  Event Type
                </label>
                <select
                  value={localEvent.type}
                  onChange={e => updateField("type", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={localEvent.status}
                  onChange={e => updateField("status", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  Budget (est.)
                </label>
                <input
                  type="number"
                  value={localEvent.budget?.estimated || 0}
                  onChange={e => updateBudget("estimated", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* CHECKLIST TAB */}
          {tab === "checklist" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.borderLight, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${checklistComplete.pct}%`, borderRadius: 4, background: checklistComplete.pct === 100 ? C.success : C.accent, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 13, color: C.inkSec, whiteSpace: "nowrap" }}>
                  {checklistComplete.done}/{checklistComplete.total} ({checklistComplete.pct}%)
                </span>
              </div>
              {CHECKLIST_ITEMS.map(item => (
                <label key={item}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 8, cursor: "pointer", marginBottom: 2,
                    background: localEvent.checklist?.[item] ? C.successBg : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!localEvent.checklist?.[item]) e.currentTarget.style.background = C.accentSubtle; }}
                  onMouseLeave={e => { if (!localEvent.checklist?.[item]) e.currentTarget.style.background = "transparent"; }}
                >
                  <input
                    type="checkbox"
                    checked={!!localEvent.checklist?.[item]}
                    onChange={() => toggleCheck(item)}
                    style={{ width: 18, height: 18, accentColor: C.accent, cursor: "pointer" }}
                  />
                  <span style={{
                    fontFamily: F.sans, fontSize: 14, color: C.ink,
                    textDecoration: localEvent.checklist?.[item] ? "line-through" : "none",
                    opacity: localEvent.checklist?.[item] ? 0.6 : 1,
                  }}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* STAFF TAB */}
          {tab === "staff" && (
            <div>
              <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkMuted, marginTop: 0, marginBottom: 16 }}>
                {localEvent.staff?.length || 0} of {STAFF.length} team members assigned
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {STAFF.map(name => {
                  const assigned = localEvent.staff?.includes(name);
                  return (
                    <div key={name}
                      onClick={() => toggleStaff(name)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${assigned ? C.accent : C.border}`,
                        background: assigned ? C.accentSubtle : C.card,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { if (!assigned) e.currentTarget.style.borderColor = C.accentLight; }}
                      onMouseLeave={e => { if (!assigned) e.currentTarget.style.borderColor = C.border; }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: assigned ? C.accent : C.bgWarm,
                        color: assigned ? "#fff" : C.inkMuted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: F.sans, fontSize: 13, fontWeight: 700,
                      }}>
                        {name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.ink }}>{name}</div>
                        <div style={{ fontFamily: F.sans, fontSize: 11, color: assigned ? C.accent : C.inkMuted }}>
                          {assigned ? "Assigned" : "Available"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {tab === "timeline" && (
            <div>
              <TimelineInput onAdd={addTimelineEntry} />
              <div style={{ marginTop: 16 }}>
                {[...(localEvent.timeline || [])].sort((a, b) => new Date(b.ts) - new Date(a.ts)).map((entry, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", background: C.accent,
                      marginTop: 5, flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontFamily: F.sans, fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{entry.text}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 11, color: C.inkMuted, marginTop: 2 }}>
                        {new Date(entry.ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                {(!localEvent.timeline || localEvent.timeline.length === 0) && (
                  <div style={{ padding: 24, textAlign: "center", color: C.inkMuted, fontFamily: F.sans, fontSize: 14 }}>
                    No activity logged yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BUDGET TAB */}
          {tab === "budget" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: C.infoBg, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.info, textTransform: "uppercase", marginBottom: 4 }}>Estimated Cost</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: C.info }}>{fmtCurrency(budgetVariance.est)}</div>
                </div>
                <div style={{ background: budgetVariance.act > budgetVariance.est ? C.dangerBg : C.successBg, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: budgetVariance.act > budgetVariance.est ? C.danger : C.success, textTransform: "uppercase", marginBottom: 4 }}>Actual Cost</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: budgetVariance.act > budgetVariance.est ? C.danger : C.success }}>{fmtCurrency(budgetVariance.act)}</div>
                </div>
                <div style={{ background: budgetVariance.diff >= 0 ? C.successBg : C.dangerBg, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: budgetVariance.diff >= 0 ? C.success : C.danger, textTransform: "uppercase", marginBottom: 4 }}>Variance</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: budgetVariance.diff >= 0 ? C.success : C.danger }}>
                    {budgetVariance.diff >= 0 ? "+" : ""}{fmtCurrency(budgetVariance.diff)}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={fieldLabelStyle}>Estimated Cost (£)</label>
                  <input type="number" value={budgetVariance.est} onChange={e => updateBudget("estimated", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Actual Cost (£)</label>
                  <input type="number" value={budgetVariance.act} onChange={e => updateBudget("actual", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 20, padding: 16, background: C.bgWarm, borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.inkMuted, textTransform: "uppercase", marginBottom: 4 }}>Revenue</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: C.accent }}>{fmtCurrency(localEvent.revenue)}</div>
                {budgetVariance.act > 0 && (
                  <div style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, marginTop: 4 }}>
                    Profit margin: {fmtCurrency(localEvent.revenue - budgetVariance.act)} ({Math.round(((localEvent.revenue - budgetVariance.act) / localEvent.revenue) * 100)}%)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineInput({ onAdd }) {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { onAdd(text); setText(""); } }}
        placeholder="Add a timeline entry..."
        style={{ ...inputStyle, flex: 1 }}
      />
      <button
        onClick={() => { onAdd(text); setText(""); }}
        style={{
          background: C.accent, color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 16px", fontFamily: F.sans, fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Add
      </button>
    </div>
  );
}

/* ── Shared styles ── */
const inputStyle = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
  fontFamily: F.sans, fontSize: 14, color: C.ink, background: C.card,
  outline: "none", boxSizing: "border-box",
};
const fieldLabelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, fontFamily: F.sans,
  color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function EventManager() {
  /* ── State ── */
  const [events, setEvents] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) { const parsed = JSON.parse(stored); if (Array.isArray(parsed) && parsed.length > 0) return parsed; }
    } catch {}
    return buildSeedEvents();
  });

  const [view, setView] = useState("list"); // "list" | "calendar"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  /* ── Persist ── */
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch {}
  }, [events]);

  /* ── Sort / Filter ── */
  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (filterStatus !== "All") list = list.filter(e => e.status === filterStatus);
    if (filterType !== "All") list = list.filter(e => e.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.client.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [events, filterStatus, filterType, search, sortField, sortDir]);

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === "asc" ? "desc" : "asc"); return field; }
      setSortDir("asc");
      return field;
    });
  }, []);

  const handleChangeMonth = useCallback((delta) => {
    setCalMonth(prev => {
      let m = prev + delta;
      let y = calYear;
      if (m < 0) { m = 11; setCalYear(y - 1); }
      else if (m > 11) { m = 0; setCalYear(y + 1); }
      return m;
    });
    setSelectedDate(null);
  }, [calYear]);

  const handleUpdateEvent = useCallback((updated) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedEvent(updated);
  }, []);

  const handleAddEvent = useCallback(() => {
    const newEvent = {
      id: uid(),
      name: "New Event",
      client: "",
      venue: "",
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
      guestCount: 50,
      type: "Cocktail Bar Hire",
      status: "Enquiry",
      revenue: 0,
      budget: { estimated: 0, actual: 0 },
      healthScore: 50,
      checklist: Object.fromEntries(CHECKLIST_ITEMS.map(c => [c, false])),
      staff: [],
      timeline: [{ ts: new Date().toISOString(), text: "Event created" }],
    };
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEvent(newEvent);
  }, []);

  const handleDeleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  }, []);

  const handleResetData = useCallback(() => {
    const seed = buildSeedEvents();
    setEvents(seed);
    setSelectedEvent(null);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: F.sans }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, color: C.ink, margin: 0 }}>
                Event Manager
              </h1>
              <p style={{ fontFamily: F.sans, fontSize: 14, color: C.inkMuted, margin: "4px 0 0" }}>
                HH&T Operations — Manage cocktail events, staffing, and budgets
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleResetData} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "8px 14px", fontSize: 13, fontFamily: F.sans, color: C.inkMuted,
                cursor: "pointer",
              }}>
                Reset Data
              </button>
              <button onClick={handleAddEvent} style={{
                background: C.accent, color: "#fff", border: "none", borderRadius: 8,
                padding: "8px 18px", fontSize: 13, fontWeight: 600, fontFamily: F.sans,
                cursor: "pointer",
              }}>
                + New Event
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <StatsBar events={events} />

        {/* ── Toolbar ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap",
        }}>
          {/* View toggle */}
          <div style={{ display: "flex", borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {[{ key: "list", label: "List" }, { key: "calendar", label: "Calendar" }].map(v => (
              <button key={v.key}
                onClick={() => setView(v.key)}
                style={{
                  padding: "7px 16px", fontSize: 13, fontFamily: F.sans, fontWeight: 600,
                  border: "none", cursor: "pointer",
                  background: view === v.key ? C.accent : C.card,
                  color: view === v.key ? "#fff" : C.inkSec,
                  transition: "all 0.15s",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            style={{ ...inputStyle, width: 220, flex: "none" }}
          />

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, width: "auto", flex: "none", cursor: "pointer" }}
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ ...inputStyle, width: "auto", flex: "none", cursor: "pointer" }}
          >
            <option value="All">All Types</option>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F.sans, fontSize: 12, color: C.inkMuted }}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Views ── */}
        {view === "list" && (
          <EventListView
            events={filteredEvents}
            onSelectEvent={setSelectedEvent}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
          />
        )}
        {view === "calendar" && (
          <CalendarView
            events={filteredEvents}
            year={calYear}
            month={calMonth}
            onChangeMonth={handleChangeMonth}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        )}

        {/* ── Type Legend ── */}
        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 14, padding: "12px 16px", background: C.card, borderRadius: 10, border: `1px solid ${C.borderLight}` }}>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: F.sans, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 4, display: "flex", alignItems: "center" }}>
            Event Types:
          </span>
          {EVENT_TYPES.map(t => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: F.sans, color: C.inkSec }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_DOT_COLORS[t], display: "inline-block" }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleUpdateEvent}
        />
      )}
    </div>
  );
}
