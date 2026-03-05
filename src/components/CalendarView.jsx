import { useState, useMemo, useCallback } from "react";
import { LONDON_BEVERAGE_EVENTS } from "../lib/agents/londonEventsAgent.js";

/* ── Design Tokens ── */
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

/* ── Status colour map ── */
const STATUS = {
  confirmed: { bg: C.successBg, fg: C.success, label: "Confirmed" },
  planning:  { bg: C.infoBg, fg: C.info, label: "Planning" },
  proposal:  { bg: C.warnBg, fg: C.warn, label: "Proposal" },
  discovery: { bg: "#F3F2EF", fg: C.inkMuted, label: "Discovery" },
};

/* ── Category colours for London events ── */
const CAT_COLORS = {
  "Cocktails": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🍸" },
  "Cocktails / Heritage": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🍸" },
  "Cocktails / Education": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🍸" },
  "Cocktails / Fine Dining": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🍸" },
  "Cocktails / Competition": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🏆" },
  "Cocktails / Immersive": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🎭" },
  "Cocktails / Christmas": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🎄" },
  "Wine": { bg: "#F5E6F5", fg: "#8B3A8B", icon: "🍷" },
  "Wine & Spirits": { bg: "#F5E6F5", fg: "#8B3A8B", icon: "🍷" },
  "Champagne / Wine": { bg: "#FFF8E1", fg: "#A67C00", icon: "🥂" },
  "Gin / Spirits": { bg: "#E8F5E9", fg: "#2E7D32", icon: "🫒" },
  "Gin / Distillery": { bg: "#E8F5E9", fg: "#2E7D32", icon: "🫒" },
  "Whisky": { bg: "#FFF3E0", fg: "#8D5524", icon: "🥃" },
  "Whisky / Spirits": { bg: "#FFF3E0", fg: "#8D5524", icon: "🥃" },
  "Rum / Spirits": { bg: "#FCE4EC", fg: "#AD1457", icon: "🍹" },
  "Caribbean / Rum": { bg: "#FCE4EC", fg: "#AD1457", icon: "🍹" },
  "Spirits": { bg: "#EDE7F6", fg: "#5E35B1", icon: "🧊" },
  "Spirits / Christmas Market": { bg: "#EDE7F6", fg: "#5E35B1", icon: "🎁" },
  "Beer / Craft Brewing": { bg: "#FFF8E1", fg: "#F57F17", icon: "🍺" },
  "Food & Drink Festival": { bg: "#E0F7FA", fg: "#00838F", icon: "🍽" },
  "Premium Hospitality": { bg: "#FFF9C4", fg: "#9E6A00", icon: "👑" },
  "Non-Alcoholic / Spirits": { bg: "#E0F2F1", fg: "#00695C", icon: "🌿" },
  "Mezcal / Spirits": { bg: "#FBE9E7", fg: "#BF360C", icon: "🌵" },
  "Tequila / Mezcal": { bg: "#FBE9E7", fg: "#BF360C", icon: "🌵" },
  "Aperitivo / Italian Spirits": { bg: "#FFECB3", fg: "#E65100", icon: "🇮🇹" },
  "Christmas / Cocktails": { bg: "#E8EAF6", fg: "#283593", icon: "🎄" },
  "Christmas Market / Cocktails": { bg: "#E8EAF6", fg: "#283593", icon: "🎄" },
  "Cocktails / Bartending": { bg: "#FFF0E6", fg: "#C26A1A", icon: "🍸" },
};
const getCC = (cat) => CAT_COLORS[cat] || { bg: "#F3F2EF", fg: C.inkSec, icon: "🍸" };

/* ── Demo HH&T Business Events ── */
const BUSINESS_EVENTS = [
  { id: "b1", title: "Diageo Whisky Masterclass", start: "2026-03-15", end: "2026-03-15", status: "confirmed", revenue: 12000, client: "Diageo" },
  { id: "b2", title: "Pernod Ricard Summer Party", start: "2026-06-20", end: "2026-06-20", status: "planning", revenue: 28000, client: "Pernod Ricard" },
  { id: "b3", title: "Hendrick's Gin Garden Pop-up", start: "2026-04-10", end: "2026-04-12", status: "proposal", revenue: 18500, client: "Hendrick's" },
  { id: "b4", title: "Campari Aperitivo Week", start: "2026-05-05", end: "2026-05-05", status: "discovery", revenue: 15000, client: "Campari" },
  { id: "b5", title: "Private Birthday Chelsea", start: "2026-03-28", end: "2026-03-28", status: "confirmed", revenue: 8500, client: "Private" },
  { id: "b6", title: "BrewDog Tap Takeover", start: "2026-04-01", end: "2026-06-30", status: "planning", revenue: 22000, client: "BrewDog" },
  { id: "b7", title: "Moet VIP Dinner", start: "2026-05-18", end: "2026-05-18", status: "proposal", revenue: 35000, client: "Moet" },
  { id: "b8", title: "Fever-Tree Mixology", start: "2026-04-22", end: "2026-04-22", status: "confirmed", revenue: 11000, client: "Fever-Tree" },
];

const STAFF = [
  { name: "Joe Stokoe", role: "Lead Bartender" },
  { name: "Matt Robertson", role: "Bar Manager" },
  { name: "Emily Blacklock", role: "Mixologist" },
  { name: "Seb Davis", role: "Bartender" },
  { name: "Anja Rubin", role: "Event Coordinator" },
];

const SHIFTS = [
  { staff: "Joe Stokoe", date: "2026-03-15", hours: 8, event: "b1" },
  { staff: "Matt Robertson", date: "2026-03-15", hours: 8, event: "b1" },
  { staff: "Emily Blacklock", date: "2026-03-28", hours: 10, event: "b5" },
  { staff: "Seb Davis", date: "2026-03-28", hours: 10, event: "b5" },
  { staff: "Joe Stokoe", date: "2026-04-10", hours: 8, event: "b3" },
  { staff: "Emily Blacklock", date: "2026-04-11", hours: 8, event: "b3" },
  { staff: "Matt Robertson", date: "2026-04-12", hours: 8, event: "b3" },
  { staff: "Joe Stokoe", date: "2026-04-22", hours: 6, event: "b8" },
  { staff: "Anja Rubin", date: "2026-05-05", hours: 8, event: "b4" },
  { staff: "Seb Davis", date: "2026-05-18", hours: 10, event: "b7" },
  { staff: "Matt Robertson", date: "2026-05-18", hours: 10, event: "b7" },
  { staff: "Emily Blacklock", date: "2026-06-20", hours: 12, event: "b2" },
  { staff: "Joe Stokoe", date: "2026-06-20", hours: 12, event: "b2" },
  { staff: "Seb Davis", date: "2026-06-20", hours: 12, event: "b2" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Helpers ── */
const d = (s) => new Date(s + "T00:00:00");
const fmt = (n) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (y, m, day) => `${y}-${pad(m + 1)}-${pad(day)}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isToday = (ds) => sameDay(d(ds), new Date());

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const days = [];
  for (let i = startDay - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), outside: true });
  for (let i = 1; i <= last.getDate(); i++) days.push({ date: new Date(year, month, i), outside: false });
  while (days.length % 7 !== 0 || days.length < 35) {
    const dt = new Date(year, month + 1, days.length - (startDay + last.getDate()) + 1);
    days.push({ date: dt, outside: true });
  }
  return days;
}

function londonEventsOnDate(dateStr) {
  const dt = d(dateStr);
  return LONDON_BEVERAGE_EVENTS.filter((e) => dt >= d(e.date) && dt <= d(e.endDate));
}

function businessEventsOnDate(dateStr) {
  const dt = d(dateStr);
  return BUSINESS_EVENTS.filter((e) => dt >= d(e.start) && dt <= d(e.end));
}

/* ── Component ── */
export default function CalendarView() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // March 2026
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(null);
  const [showLondonEvents, setShowLondonEvents] = useState(true);
  const [showBusinessEvents, setShowBusinessEvents] = useState(true);
  const [showShifts, setShowShifts] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  const monthBusinessEvents = useMemo(() => BUSINESS_EVENTS.filter((e) => {
    const s = d(e.start), en = d(e.end);
    const mStart = new Date(year, month, 1), mEnd = new Date(year, month + 1, 0);
    return s <= mEnd && en >= mStart;
  }), [year, month]);

  const monthLondonEvents = useMemo(() => LONDON_BEVERAGE_EVENTS.filter((e) => {
    const s = d(e.date), en = d(e.endDate);
    const mStart = new Date(year, month, 1), mEnd = new Date(year, month + 1, 0);
    return s <= mEnd && en >= mStart;
  }), [year, month]);

  const monthRevenue = useMemo(() => monthBusinessEvents.reduce((a, e) => a + e.revenue, 0), [monthBusinessEvents]);
  const monthShiftHours = useMemo(() => SHIFTS.filter((s) => {
    const dt = d(s.date);
    return dt.getMonth() === month && dt.getFullYear() === year;
  }).reduce((a, s) => a + s.hours, 0), [year, month]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(LONDON_BEVERAGE_EVENTS.map(e => e.category));
    return ["all", ...Array.from(cats).sort()];
  }, []);

  const nav = useCallback((dir) => {
    let m = month + dir, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y); setSelected(null);
  }, [month, year]);

  const goToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null);
  }, []);

  const dk = (dt) => dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate());

  const selectedLondonEvents = selected ? londonEventsOnDate(selected).filter(e =>
    categoryFilter === "all" || e.category === categoryFilter
  ) : [];
  const selectedBusinessEvents = selected ? businessEventsOnDate(selected) : [];
  const selectedShifts = selected ? SHIFTS.filter((s) => s.date === selected) : [];

  /* ── Upcoming events sidebar data ── */
  const upcomingLondonEvents = useMemo(() => {
    const now = new Date(year, month, 1);
    return LONDON_BEVERAGE_EVENTS
      .filter(e => d(e.endDate) >= now)
      .sort((a, b) => d(a.date) - d(b.date))
      .slice(0, 8);
  }, [year, month]);

  /* ── Render ── */
  return (
    <div style={{ fontFamily: F.sans, background: C.bg, minHeight: "100vh", color: C.ink, padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 700, color: C.ink, margin: 0 }}>
          Events Calendar
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 10px", borderRadius: 4, background: C.accentSubtle, color: C.accent }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.accent }} />HH&T Events
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 10px", borderRadius: 4, background: "#FFF0E6", color: "#C26A1A" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#C26A1A" }} />London Beverage Events
          </span>
          {Object.entries(STATUS).map(([k, v]) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 10px", borderRadius: 4, background: v.bg, color: v.fg }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.fg }} />{v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: 16, padding: "12px 18px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{monthBusinessEvents.length}</span>
          <span style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>HH&T Events</span>
        </div>
        <div style={{ width: 1, background: C.borderLight, alignSelf: "stretch" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#C26A1A" }}>{monthLondonEvents.length}</span>
          <span style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>London Events</span>
        </div>
        <div style={{ width: 1, background: C.borderLight, alignSelf: "stretch" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.success }}>{fmt(monthRevenue)}</span>
          <span style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Revenue Pipeline</span>
        </div>
        <div style={{ width: 1, background: C.borderLight, alignSelf: "stretch" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.info }}>{monthShiftHours}h</span>
          <span style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Staff Hours</span>
        </div>
        <div style={{ width: 1, background: C.borderLight, alignSelf: "stretch" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#8B3A8B" }}>{monthLondonEvents.reduce((a, e) => a + e.estimatedAttendance, 0).toLocaleString()}</span>
          <span style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Attendance</span>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button style={btnStyle(false)} onClick={() => nav(-1)}>&lsaquo;</button>
        <span style={{ fontSize: 18, fontWeight: 600, fontFamily: F.serif, minWidth: 180, textAlign: "center" }}>{MONTHS[month]} {year}</span>
        <button style={btnStyle(false)} onClick={() => nav(1)}>&rsaquo;</button>
        <button style={btnStyle(false)} onClick={goToday}>Today</button>
        <div style={{ width: 1, height: 24, background: C.borderLight }} />
        <button style={btnStyle(showLondonEvents)} onClick={() => setShowLondonEvents(!showLondonEvents)}>London Events</button>
        <button style={btnStyle(showBusinessEvents)} onClick={() => setShowBusinessEvents(!showBusinessEvents)}>HH&T Events</button>
        <button style={btnStyle(showShifts)} onClick={() => setShowShifts(!showShifts)}>Shifts</button>
        <div style={{ width: 1, height: 24, background: C.borderLight }} />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.inkSec, fontFamily: F.sans, fontSize: 12 }}
        >
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Calendar Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: C.card }}>
            {DAYS.map((day) => (
              <div key={day} style={{ padding: "8px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, background: C.bgWarm }}>
                {day}
              </div>
            ))}
            {days.map(({ date: dt, outside }, i) => {
              const dateStr = dk(dt);
              const londonEvs = showLondonEvents ? londonEventsOnDate(dateStr).filter(e =>
                categoryFilter === "all" || e.category === categoryFilter
              ) : [];
              const bizEvs = showBusinessEvents ? businessEventsOnDate(dateStr) : [];
              const shifts = showShifts ? SHIFTS.filter((s) => s.date === dateStr) : [];
              const isTodayCell = isToday(dateStr);
              const isSelected = selected === dateStr;
              const hasEvents = londonEvs.length > 0 || bizEvs.length > 0;

              return (
                <div key={i} style={{
                  minHeight: 110, padding: 4, borderRight: `1px solid ${C.borderLight}`,
                  borderBottom: `1px solid ${C.borderLight}`,
                  background: isSelected ? C.accentSubtle : isTodayCell ? "#FFFDF5" : outside ? C.bgWarm : C.card,
                  cursor: "pointer", position: "relative", overflow: "hidden",
                  outline: isSelected ? `2px solid ${C.accent}` : "none", outlineOffset: -2,
                }} onClick={() => setSelected(dateStr)}>
                  <div style={{ fontSize: 12, fontWeight: isTodayCell ? 700 : 500, color: isTodayCell ? C.accent : outside ? C.inkMuted : C.inkSec, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    {isTodayCell && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />}
                    {dt.getDate()}
                    {hasEvents && <span style={{ width: 5, height: 5, borderRadius: "50%", background: londonEvs.length > 0 ? "#C26A1A" : C.accent, marginLeft: "auto" }} />}
                  </div>
                  {/* Business events */}
                  {bizEvs.slice(0, 2).map((ev) => {
                    const st = STATUS[ev.status] || STATUS.discovery;
                    return (
                      <div key={ev.id} style={{
                        background: st.bg, color: st.fg, borderLeft: `3px solid ${st.fg}`,
                        padding: "1px 5px", borderRadius: 4, fontSize: 10, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2, lineHeight: 1.4,
                      }}>{ev.title}</div>
                    );
                  })}
                  {/* London events */}
                  {londonEvs.slice(0, 2 - bizEvs.length).map((ev) => {
                    const cc = getCC(ev.category);
                    return (
                      <div key={ev.id} style={{
                        background: cc.bg, color: cc.fg, borderLeft: `3px solid ${cc.fg}`,
                        padding: "1px 5px", borderRadius: 4, fontSize: 10, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2, lineHeight: 1.4,
                      }}>{cc.icon} {ev.title}</div>
                    );
                  })}
                  {(bizEvs.length + londonEvs.length) > 2 && (
                    <div style={{ fontSize: 9, color: C.inkMuted, paddingLeft: 4 }}>+{bizEvs.length + londonEvs.length - 2} more</div>
                  )}
                  {shifts.length > 0 && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
                      {shifts.map((sh, j) => (
                        <span key={j} title={`${sh.staff} (${sh.hours}h)`} style={{ width: 14, height: 14, borderRadius: "50%", background: C.infoBg, border: `1px solid ${C.info}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: C.info, fontWeight: 700 }}>
                          {sh.staff.charAt(0)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar — Upcoming London Events */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: C.ink }}>Upcoming London Events</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcomingLondonEvents.map((ev) => {
                const cc = getCC(ev.category);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{
                      padding: 12, borderRadius: 8, border: `1px solid ${C.border}`,
                      borderLeft: `4px solid ${cc.fg}`, cursor: "pointer",
                      background: selectedEvent?.id === ev.id ? cc.bg : C.card,
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{cc.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 3 }}>
                      {d(ev.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {ev.date !== ev.endDate && ` - ${d(ev.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: cc.bg, color: cc.fg }}>{ev.category}</span>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: ev.ticketTier === "high" ? C.warnBg : "#F3F2EF", color: ev.ticketTier === "high" ? C.warn : C.inkMuted }}>
                        {ev.ticketTier === "high" ? "High Ticket" : "Mid Ticket"}
                      </span>
                      <span style={{ fontSize: 10, color: C.inkMuted }}>{ev.priceRange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Date Detail Sidebar */}
      {selected && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", zIndex: 99 }} onClick={() => setSelected(null)} />
          <div style={{ position: "fixed", top: 0, right: 0, width: 400, height: "100vh", background: C.card, borderLeft: `1px solid ${C.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)", padding: 24, overflowY: "auto", zIndex: 100 }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.inkMuted }}>&times;</button>
            <div style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {d(selected).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 16 }}>
              {selectedBusinessEvents.length} HH&T event{selectedBusinessEvents.length !== 1 ? "s" : ""} &middot; {selectedLondonEvents.length} London event{selectedLondonEvents.length !== 1 ? "s" : ""}
            </div>

            {/* London Events */}
            {selectedLondonEvents.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#C26A1A", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>London Beverage Events</div>
                {selectedLondonEvents.map((ev) => {
                  const cc = getCC(ev.category);
                  return (
                    <div key={ev.id} style={{ padding: 14, border: `1px solid ${C.border}`, borderLeft: `4px solid ${cc.fg}`, borderRadius: 8, marginBottom: 10, background: cc.bg + "33" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 20 }}>{cc.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{ev.title}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.inkSec, marginBottom: 6 }}>{ev.venue}</div>
                      <div style={{ fontSize: 12, color: C.inkSec, marginBottom: 8, lineHeight: 1.5 }}>{ev.description}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: cc.bg, color: cc.fg, fontWeight: 600 }}>{ev.category}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: ev.ticketTier === "high" ? C.warnBg : "#F3F2EF", color: ev.ticketTier === "high" ? C.warn : C.inkMuted }}>
                          {ev.ticketTier === "high" ? "High Ticket" : "Mid Ticket"} &middot; {ev.priceRange}
                        </span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.infoBg, color: C.info }}>
                          {ev.estimatedAttendance.toLocaleString()} attendees
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 6, borderTop: `1px solid ${C.borderLight}`, paddingTop: 8 }}>
                        HH&T Opportunity
                      </div>
                      <div style={{ fontSize: 12, color: C.inkSec, marginBottom: 8 }}>{ev.relevanceToHHT}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ev.contactEmail && (
                          <a href={`mailto:${ev.contactEmail}`} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, background: C.accent, color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                            Email: {ev.contactEmail}
                          </a>
                        )}
                        {ev.website && (
                          <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, background: C.bgWarm, color: C.inkSec }}>
                            {ev.website}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Business Events */}
            {selectedBusinessEvents.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>HH&T Events</div>
                {selectedBusinessEvents.map((ev) => {
                  const st = STATUS[ev.status];
                  return (
                    <div key={ev.id} style={{ padding: 12, border: `1px solid ${C.border}`, borderLeft: `4px solid ${st.fg}`, borderRadius: 8, marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: C.inkSec, marginBottom: 4 }}>{ev.client}</div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                        <span style={{ color: st.fg, fontWeight: 600 }}>{st.label}</span>
                        <span style={{ color: C.inkMuted }}>{fmt(ev.revenue)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shifts */}
            {selectedShifts.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Staff Shifts</div>
                {selectedShifts.map((sh, i) => {
                  const ev = BUSINESS_EVENTS.find((e) => e.id === sh.event);
                  const staffObj = STAFF.find((s) => s.name === sh.staff);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", background: C.infoBg, border: `1px solid ${C.info}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.info }}>
                        {sh.staff.split(" ").map((w) => w[0]).join("")}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{sh.staff}</div>
                        <div style={{ fontSize: 11, color: C.inkMuted }}>{staffObj?.role} &middot; {sh.hours}h {ev ? `(${ev.title})` : ""}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedLondonEvents.length === 0 && selectedBusinessEvents.length === 0 && selectedShifts.length === 0 && (
              <div style={{ fontSize: 13, color: C.inkMuted, textAlign: "center", padding: "40px 0" }}>No events on this date.</div>
            )}
          </div>
        </>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 199 }} onClick={() => setSelectedEvent(null)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 560, maxHeight: "85vh", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, overflowY: "auto", zIndex: 200, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <button onClick={() => setSelectedEvent(null)} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.inkMuted }}>&times;</button>
            {(() => {
              const ev = selectedEvent;
              const cc = getCC(ev.category);
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 32 }}>{cc.icon}</span>
                    <div>
                      <h2 style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 700, margin: 0 }}>{ev.title}</h2>
                      <div style={{ fontSize: 13, color: C.inkSec, marginTop: 2 }}>{ev.organiser}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: 12, background: C.bgWarm, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", marginBottom: 4 }}>Date</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {d(ev.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        {ev.date !== ev.endDate && <><br /><span style={{ fontWeight: 400, color: C.inkSec }}>to {d(ev.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</span></>}
                      </div>
                    </div>
                    <div style={{ padding: 12, background: C.bgWarm, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", marginBottom: 4 }}>Venue</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{ev.venue}</div>
                    </div>
                    <div style={{ padding: 12, background: C.bgWarm, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", marginBottom: 4 }}>Ticket Range</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{ev.priceRange}</div>
                    </div>
                    <div style={{ padding: 12, background: C.bgWarm, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", marginBottom: 4 }}>Est. Attendance</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{ev.estimatedAttendance.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.6, marginBottom: 16 }}>{ev.description}</div>
                  <div style={{ padding: 14, background: C.accentSubtle, borderRadius: 8, borderLeft: `4px solid ${C.accent}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 4 }}>HH&T Partnership Opportunity</div>
                    <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.5 }}>{ev.relevanceToHHT}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {ev.contactEmail && (
                      <a href={`mailto:${ev.contactEmail}`} style={{ padding: "8px 16px", borderRadius: 6, background: C.accent, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                        Contact: {ev.contactEmail}
                      </a>
                    )}
                    <span style={{ padding: "8px 16px", borderRadius: 6, background: C.bgWarm, color: C.inkSec, fontSize: 13 }}>
                      {ev.website}
                    </span>
                    <span style={{ padding: "8px 16px", borderRadius: 6, background: cc.bg, color: cc.fg, fontSize: 13, fontWeight: 600 }}>
                      {cc.icon} {ev.category}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}

function btnStyle(active) {
  return {
    padding: "6px 14px", borderRadius: 6,
    border: `1px solid ${active ? "#7D5A1A" : "#E6E1D9"}`,
    background: active ? "rgba(125,90,26,0.06)" : "#FFFFFF",
    color: active ? "#7D5A1A" : "#5C564E",
    fontFamily: "'Inter',-apple-system,'Segoe UI',sans-serif",
    fontSize: 13, fontWeight: 500, cursor: "pointer", lineHeight: 1,
  };
}
