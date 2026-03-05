import { useState, useMemo, useCallback } from "react";

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

/* ── Demo Data ── */
const EVENTS = [
  { id: 1, title: "Diageo Whisky Masterclass", start: "2025-03-15", end: "2025-03-15", status: "confirmed", revenue: 12000, client: "Diageo" },
  { id: 2, title: "Pernod Ricard Summer Party", start: "2025-06-20", end: "2025-06-20", status: "planning", revenue: 28000, client: "Pernod Ricard" },
  { id: 3, title: "Hendrick's Gin Garden Pop-up", start: "2025-04-10", end: "2025-04-12", status: "proposal", revenue: 18500, client: "Hendrick's" },
  { id: 4, title: "Campari Aperitivo Week", start: "2025-05-05", end: "2025-05-05", status: "discovery", revenue: 15000, client: "Campari" },
  { id: 5, title: "Private Birthday Chelsea", start: "2025-03-28", end: "2025-03-28", status: "confirmed", revenue: 8500, client: "Private" },
  { id: 6, title: "BrewDog Tap Takeover", start: "2025-04-01", end: "2025-06-30", status: "planning", revenue: 22000, client: "BrewDog" },
  { id: 7, title: "Moet VIP Dinner", start: "2025-05-18", end: "2025-05-18", status: "proposal", revenue: 35000, client: "Moet" },
  { id: 8, title: "Fever-Tree Mixology", start: "2025-04-22", end: "2025-04-22", status: "confirmed", revenue: 11000, client: "Fever-Tree" },
];

const STAFF = [
  { name: "Joe Stokoe", role: "Lead Bartender" },
  { name: "Matt Robertson", role: "Bar Manager" },
  { name: "Emily Blacklock", role: "Mixologist" },
  { name: "Seb Davis", role: "Bartender" },
  { name: "Anja Rubin", role: "Event Coordinator" },
];

const SHIFTS = [
  { staff: "Joe Stokoe", date: "2025-03-15", hours: 8, event: 1 },
  { staff: "Matt Robertson", date: "2025-03-15", hours: 8, event: 1 },
  { staff: "Emily Blacklock", date: "2025-03-28", hours: 10, event: 5 },
  { staff: "Seb Davis", date: "2025-03-28", hours: 10, event: 5 },
  { staff: "Joe Stokoe", date: "2025-04-10", hours: 8, event: 3 },
  { staff: "Emily Blacklock", date: "2025-04-11", hours: 8, event: 3 },
  { staff: "Matt Robertson", date: "2025-04-12", hours: 8, event: 3 },
  { staff: "Joe Stokoe", date: "2025-04-22", hours: 6, event: 8 },
  { staff: "Anja Rubin", date: "2025-05-05", hours: 8, event: 4 },
  { staff: "Seb Davis", date: "2025-05-18", hours: 10, event: 7 },
  { staff: "Matt Robertson", date: "2025-05-18", hours: 10, event: 7 },
  { staff: "Emily Blacklock", date: "2025-06-20", hours: 12, event: 2 },
  { staff: "Joe Stokoe", date: "2025-06-20", hours: 12, event: 2 },
  { staff: "Seb Davis", date: "2025-06-20", hours: 12, event: 2 },
];

const DEADLINES = [
  { title: "Diageo proposal sign-off", date: "2025-03-10", type: "proposal" },
  { title: "Hendrick's menu finalise", date: "2025-04-05", type: "prep" },
  { title: "Hendrick's kit prep", date: "2025-04-08", type: "kit" },
  { title: "Birthday bar plan due", date: "2025-03-25", type: "prep" },
  { title: "Campari brand deck due", date: "2025-04-28", type: "proposal" },
  { title: "Moet tasting menu due", date: "2025-05-10", type: "prep" },
  { title: "BrewDog equipment order", date: "2025-03-20", type: "kit" },
  { title: "Pernod Ricard risk assessment", date: "2025-06-10", type: "prep" },
  { title: "Fever-Tree spirits order", date: "2025-04-18", type: "kit" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Helpers ── */
const d = (s) => new Date(s + "T00:00:00");
const fmt = (n) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const pad = (n) => String(n).padStart(2, "0");
const key = (y, m, day) => `${y}-${pad(m + 1)}-${pad(day)}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isToday = (ds) => sameDay(d(ds), new Date());

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let startDay = first.getDay() - 1; // Mon=0
  if (startDay < 0) startDay = 6;
  const days = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const dt = new Date(year, month, -i);
    days.push({ date: dt, outside: true });
  }
  for (let i = 1; i <= last.getDate(); i++) {
    days.push({ date: new Date(year, month, i), outside: false });
  }
  while (days.length % 7 !== 0 || days.length < 35) {
    const dt = new Date(year, month + 1, days.length - (startDay + last.getDate()) + 1);
    days.push({ date: dt, outside: true });
  }
  return days;
}

function eventsOnDate(dateStr) {
  const dt = d(dateStr);
  return EVENTS.filter((e) => dt >= d(e.start) && dt <= d(e.end));
}

function getWeekDays(year, month, dayOfMonth) {
  const ref = new Date(year, month, dayOfMonth);
  let dow = ref.getDay() - 1;
  if (dow < 0) dow = 6;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - dow);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    days.push({ date: dt, outside: dt.getMonth() !== month });
  }
  return days;
}

/* ── Component ── */
export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(2); // March 2025
  const [view, setView] = useState("month"); // month | week
  const [weekAnchor, setWeekAnchor] = useState(15);
  const [selected, setSelected] = useState(null); // date string
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [showShifts, setShowShifts] = useState(true);

  const days = useMemo(() => view === "month"
    ? getCalendarDays(year, month)
    : getWeekDays(year, month, weekAnchor),
  [year, month, view, weekAnchor]);

  const monthEvents = useMemo(() => EVENTS.filter((e) => {
    const s = d(e.start), en = d(e.end);
    const mStart = new Date(year, month, 1), mEnd = new Date(year, month + 1, 0);
    return s <= mEnd && en >= mStart;
  }), [year, month]);

  const monthShiftHours = useMemo(() => SHIFTS.filter((s) => {
    const dt = d(s.date);
    return dt.getMonth() === month && dt.getFullYear() === year;
  }).reduce((a, s) => a + s.hours, 0), [year, month]);

  const monthRevenue = useMemo(() => monthEvents.reduce((a, e) => a + e.revenue, 0), [monthEvents]);

  const nav = useCallback((dir) => {
    let m = month + dir, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
    setSelected(null);
  }, [month, year]);

  const goToday = useCallback(() => {
    setYear(today.getFullYear()); setMonth(today.getMonth());
    setWeekAnchor(today.getDate()); setSelected(null);
  }, [today]);

  const dateKey = (dt) => key(dt.getFullYear(), dt.getMonth(), dt.getDate());

  const selectedEvents = selected ? eventsOnDate(selected) : [];
  const selectedShifts = selected ? SHIFTS.filter((s) => s.date === selected) : [];
  const selectedDeadlines = selected ? DEADLINES.filter((dl) => dl.date === selected) : [];

  /* ── Pill renderer ── */
  const renderPill = (ev, small) => {
    const st = STATUS[ev.status] || STATUS.discovery;
    return (
      <div key={ev.id} style={{
        background: st.bg, color: st.fg, borderLeft: `3px solid ${st.fg}`,
        padding: small ? "1px 5px" : "2px 6px", borderRadius: 4, fontSize: small ? 10 : 11,
        fontFamily: F.sans, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        marginBottom: 2, cursor: "pointer", lineHeight: 1.4,
      }}>{ev.title}</div>
    );
  };

  /* ── Styles ── */
  const S = {
    wrap: { fontFamily: F.sans, background: C.bg, minHeight: "100vh", color: C.ink, padding: 24 },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    title: { fontFamily: F.serif, fontSize: 26, fontWeight: 700, color: C.ink, margin: 0 },
    statsBar: {
      display: "flex", gap: 16, padding: "10px 16px", background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 10, marginBottom: 16, flexWrap: "wrap",
    },
    stat: { display: "flex", flexDirection: "column", gap: 2 },
    statVal: { fontSize: 18, fontWeight: 700, color: C.accent },
    statLbl: { fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.04em" },
    toolbar: {
      display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap",
    },
    btn: (active) => ({
      padding: "6px 14px", borderRadius: 6, border: `1px solid ${active ? C.accent : C.border}`,
      background: active ? C.accentSubtle : C.card, color: active ? C.accent : C.inkSec,
      fontFamily: F.sans, fontSize: 13, fontWeight: 500, cursor: "pointer", lineHeight: 1,
    }),
    navBtn: {
      padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.card, color: C.inkSec, cursor: "pointer", fontSize: 14, lineHeight: 1,
    },
    monthLabel: { fontSize: 18, fontWeight: 600, fontFamily: F.serif, minWidth: 180, textAlign: "center" },
    grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: C.card },
    dayHeader: { padding: "8px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, background: C.bgWarm },
    cell: (outside, isSelected, isTodayCell) => ({
      minHeight: view === "week" ? 200 : 100, padding: 4, borderRight: `1px solid ${C.borderLight}`,
      borderBottom: `1px solid ${C.borderLight}`, background: isSelected ? C.accentSubtle : isTodayCell ? "#FFFDF5" : outside ? C.bgWarm : C.card,
      cursor: "pointer", position: "relative", overflow: "hidden",
      outline: isSelected ? `2px solid ${C.accent}` : "none", outlineOffset: -2,
    }),
    dayNum: (outside, isTodayCell) => ({
      fontSize: 12, fontWeight: isTodayCell ? 700 : 500, color: isTodayCell ? C.accent : outside ? C.inkMuted : C.inkSec,
      marginBottom: 2, display: "flex", alignItems: "center", gap: 4,
    }),
    todayDot: { width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block" },
    sidebar: {
      position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: C.card,
      borderLeft: `1px solid ${C.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      padding: 24, overflowY: "auto", zIndex: 100,
    },
    sideClose: {
      position: "absolute", top: 12, right: 14, background: "none", border: "none",
      fontSize: 20, cursor: "pointer", color: C.inkMuted, lineHeight: 1,
    },
    sideTitle: { fontFamily: F.serif, fontSize: 18, fontWeight: 700, marginBottom: 4 },
    sideSection: { marginTop: 20 },
    sideSectionTitle: { fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 },
    eventCard: {
      padding: 12, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8,
    },
    shiftDot: { width: 6, height: 6, borderRadius: "50%", background: C.info, display: "inline-block", marginRight: 6 },
    dlIcon: (type) => ({
      width: 8, height: 8, borderRadius: 2, display: "inline-block", marginRight: 6,
      background: type === "proposal" ? C.warn : type === "kit" ? C.info : C.success,
    }),
    legend: { display: "flex", gap: 12, marginLeft: "auto", flexWrap: "wrap" },
    legendItem: (fg, bg) => ({
      display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: fg,
      padding: "2px 8px", borderRadius: 4, background: bg,
    }),
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", zIndex: 99,
    },
  };

  /* ── Render ── */
  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>Calendar &amp; Scheduling</h1>
        <div style={S.legend}>
          {Object.entries(STATUS).map(([k, v]) => (
            <span key={k} style={S.legendItem(v.fg, v.bg)}><span style={{ width: 8, height: 8, borderRadius: "50%", background: v.fg, display: "inline-block" }} />{v.label}</span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={S.statsBar}>
        <div style={S.stat}><span style={S.statVal}>{monthEvents.length}</span><span style={S.statLbl}>Events this month</span></div>
        <div style={{ width: 1, background: C.borderLight, alignSelf: "stretch" }} />
        <div style={S.stat}><span style={S.statVal}>{monthShiftHours}h</span><span style={S.statLbl}>Staff hours booked</span></div>
        <div style={{ width: 1, background: C.borderLight, alignSelf: "stretch" }} />
        <div style={S.stat}><span style={S.statVal}>{fmt(monthRevenue)}</span><span style={S.statLbl}>Revenue pipeline</span></div>
      </div>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <button style={S.navBtn} onClick={() => nav(-1)}>&lsaquo;</button>
        <span style={S.monthLabel}>{MONTHS[month]} {year}</span>
        <button style={S.navBtn} onClick={() => nav(1)}>&rsaquo;</button>
        <button style={S.btn(false)} onClick={goToday}>Today</button>
        <div style={{ width: 1, height: 24, background: C.borderLight }} />
        <button style={S.btn(view === "month")} onClick={() => setView("month")}>Month</button>
        <button style={S.btn(view === "week")} onClick={() => setView("week")}>Week</button>
        <div style={{ width: 1, height: 24, background: C.borderLight }} />
        <button style={S.btn(showShifts)} onClick={() => setShowShifts(!showShifts)}>Shifts</button>
        <button style={S.btn(showDeadlines)} onClick={() => setShowDeadlines(!showDeadlines)}>Deadlines</button>
      </div>

      {/* Calendar Grid */}
      <div style={S.grid}>
        {DAYS.map((d) => <div key={d} style={S.dayHeader}>{d}</div>)}
        {days.map(({ date: dt, outside }, i) => {
          const dk = dateKey(dt);
          const evs = eventsOnDate(dk);
          const shifts = showShifts ? SHIFTS.filter((s) => s.date === dk) : [];
          const dls = showDeadlines ? DEADLINES.filter((dl) => dl.date === dk) : [];
          const isTodayCell = isToday(dk);
          const isSelected = selected === dk;
          return (
            <div key={i} style={S.cell(outside, isSelected, isTodayCell)} onClick={() => setSelected(dk)}>
              <div style={S.dayNum(outside, isTodayCell)}>
                {isTodayCell && <span style={S.todayDot} />}
                {dt.getDate()}
              </div>
              {evs.slice(0, view === "week" ? 6 : 3).map((ev) => renderPill(ev, view !== "week"))}
              {evs.length > (view === "week" ? 6 : 3) && (
                <div style={{ fontSize: 10, color: C.inkMuted, paddingLeft: 4 }}>+{evs.length - (view === "week" ? 6 : 3)} more</div>
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
              {dls.map((dl, j) => (
                <div key={`dl-${j}`} style={{ fontSize: 9, color: C.danger, marginTop: 1, display: "flex", alignItems: "center" }}>
                  <span style={S.dlIcon(dl.type)} />{dl.title.length > 18 ? dl.title.slice(0, 18) + "..." : dl.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Sidebar */}
      {selected && (
        <>
          <div style={S.overlay} onClick={() => setSelected(null)} />
          <div style={S.sidebar}>
            <button style={S.sideClose} onClick={() => setSelected(null)}>&times;</button>
            <div style={S.sideTitle}>{d(selected).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
            <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 8 }}>{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""} &middot; {selectedShifts.length} shift{selectedShifts.length !== 1 ? "s" : ""} &middot; {selectedDeadlines.length} deadline{selectedDeadlines.length !== 1 ? "s" : ""}</div>

            {/* Events section */}
            <div style={S.sideSection}>
              <div style={S.sideSectionTitle}>Events</div>
              {selectedEvents.length === 0 && <div style={{ fontSize: 13, color: C.inkMuted }}>No events on this date.</div>}
              {selectedEvents.map((ev) => {
                const st = STATUS[ev.status];
                return (
                  <div key={ev.id} style={{ ...S.eventCard, borderLeft: `4px solid ${st.fg}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: C.inkSec, marginBottom: 4 }}>{ev.client}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                      <span style={{ color: st.fg, fontWeight: 600 }}>{st.label}</span>
                      <span style={{ color: C.inkMuted }}>{fmt(ev.revenue)}</span>
                      <span style={{ color: C.inkMuted }}>{ev.start === ev.end ? d(ev.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : `${d(ev.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${d(ev.end).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shifts section */}
            <div style={S.sideSection}>
              <div style={S.sideSectionTitle}>Staff Shifts</div>
              {selectedShifts.length === 0 && <div style={{ fontSize: 13, color: C.inkMuted }}>No shifts scheduled.</div>}
              {selectedShifts.map((sh, i) => {
                const ev = EVENTS.find((e) => e.id === sh.event);
                const staffObj = STAFF.find((s) => s.name === sh.staff);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: C.infoBg, border: `1px solid ${C.info}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.info }}>{sh.staff.split(" ").map((w) => w[0]).join("")}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{sh.staff}</div>
                      <div style={{ fontSize: 11, color: C.inkMuted }}>{staffObj?.role} &middot; {sh.hours}h {ev ? `(${ev.title})` : ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deadlines section */}
            <div style={S.sideSection}>
              <div style={S.sideSectionTitle}>Deadlines</div>
              {selectedDeadlines.length === 0 && <div style={{ fontSize: 13, color: C.inkMuted }}>No deadlines on this date.</div>}
              {selectedDeadlines.map((dl, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <span style={S.dlIcon(dl.type)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{dl.title}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "capitalize" }}>{dl.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
