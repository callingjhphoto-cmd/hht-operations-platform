import React, { useState, useEffect, useCallback, useRef } from "react";

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

const ICONS = {
  task: "\u2611", finance: "\u00A3", event: "\uD83C\uDF89", chat: "\uD83D\uDCAC", stock: "\uD83D\uDCE6", system: "\u2699",
};
const PRIORITY_DOT = { urgent: C.danger, normal: C.accent, low: C.inkMuted };
const PRIORITY_LABEL = { urgent: "Urgent", normal: "Normal", low: "Low" };
const TABS = ["All", "Tasks", "Finance", "Events", "Chat", "System"];
const TAB_MAP = { Tasks: "task", Finance: "finance", Events: "event", Chat: "chat", System: "system" };

const now = Date.now();
const h = (n) => now - n * 3600000;
const d = (n) => now - n * 86400000;

const SEED = [
  { id: 1, type: "task", priority: "urgent", title: "Alex assigned you: Prep Diageo cocktail spec", detail: "Due tomorrow \u2014 Classic Margarita, Old Fashioned, Negroni variations", ts: h(0.5), read: false },
  { id: 2, type: "finance", priority: "urgent", title: "Invoice #INV-047 due in 3 days \u2014 Pernod Ricard \u00A328,000", detail: "Payment terms: NET 30. Send reminder if unpaid by Friday.", ts: h(1), read: false },
  { id: 3, type: "event", priority: "normal", title: "Diageo Masterclass in 10 days \u2014 38/40 guests confirmed", detail: "Venue: The Savoy, London. 2 spots remaining.", ts: h(2), read: false },
  { id: 4, type: "finance", priority: "normal", title: "Quote #Q-2025-014 approved by Diageo \u2014 \u00A312,000", detail: "Cocktail masterclass package. Contract signed.", ts: h(3), read: false },
  { id: 5, type: "chat", priority: "normal", title: "@joe mentioned you in #events", detail: "\"Can we add a rum station to the Pernod activation?\"", ts: h(4), read: false },
  { id: 6, type: "stock", priority: "urgent", title: "Low stock: Boston shakers (2 remaining)", detail: "Minimum threshold is 10. Reorder from BarSupplies UK.", ts: h(5), read: false },
  { id: 7, type: "task", priority: "normal", title: "Sarah assigned you: Update staff rota for March", detail: "12 events scheduled. 4 staff unconfirmed.", ts: h(8), read: true },
  { id: 8, type: "system", priority: "low", title: "Quote builder updated with new templates", detail: "3 new cocktail package templates added.", ts: h(10), read: true },
  { id: 9, type: "finance", priority: "normal", title: "Invoice #INV-052 paid \u2014 Bacardi \u00A38,500", detail: "Payment received via BACS. Auto-reconciled.", ts: h(14), read: true },
  { id: 10, type: "event", priority: "normal", title: "Campari activation confirmed for 22 Mar", detail: "Westfield London, 200 guests. Brief attached.", ts: d(1) + h(2), read: false },
  { id: 11, type: "chat", priority: "low", title: "@emma mentioned you in #finance", detail: "\"Invoice template looks great, sending to Diageo now.\"", ts: d(1) + h(4), read: true },
  { id: 12, type: "task", priority: "urgent", title: "Complete risk assessment \u2014 Pernod Ricard launch", detail: "H&S documents required by venue before Friday.", ts: d(1) + h(6), read: false },
  { id: 13, type: "stock", priority: "normal", title: "Delivery confirmed: Glassware order #GW-310", detail: "48x coup\u00E9 glasses arriving Thursday via DHL.", ts: d(1) + h(8), read: true },
  { id: 14, type: "system", priority: "low", title: "New feature: Client portal sharing", detail: "You can now share event timelines directly with clients.", ts: d(2), read: true },
  { id: 15, type: "finance", priority: "normal", title: "Quote #Q-2025-016 sent to Hendrick\u2019s \u2014 \u00A39,400", detail: "Gin garden pop-up. Awaiting client approval.", ts: d(3), read: true },
  { id: 16, type: "event", priority: "low", title: "Post-event survey results: Bacardi training day", detail: "4.8/5 avg rating. 96% would recommend.", ts: d(4), read: true },
  { id: 17, type: "task", priority: "normal", title: "Review Marcus\u2019s cocktail recipes for Hendrick\u2019s", detail: "6 recipes submitted. Deadline: end of week.", ts: d(5), read: true },
  { id: 18, type: "chat", priority: "normal", title: "@tom mentioned you in #general", detail: "\"Team drinks Friday \u2014 who\u2019s in?\"", ts: d(5), read: true },
  { id: 19, type: "finance", priority: "urgent", title: "Invoice #INV-039 overdue \u2014 LVMH \u00A315,200", detail: "14 days past due. Escalate to account manager.", ts: d(6), read: false },
  { id: 20, type: "system", priority: "low", title: "Scheduled maintenance: Sunday 02:00\u201304:00", detail: "Platform will be briefly unavailable for upgrades.", ts: d(7), read: true },
];

const INCOMING = [
  { type: "task", priority: "normal", title: "New task: Source botanicals for Hendrick\u2019s activation", detail: "Cucumber, rose petals, juniper. Supplier list attached." },
  { type: "finance", priority: "normal", title: "Quote #Q-2025-018 viewed by Absolut", detail: "Client opened the quote 3 times today." },
  { type: "event", priority: "urgent", title: "Venue change: Campari activation moved to Shoreditch Studios", detail: "Updated floor plan required by Wednesday." },
  { type: "chat", priority: "normal", title: "@sarah mentioned you in #operations", detail: "\"Can you confirm ice delivery for Saturday?\"" },
  { type: "stock", priority: "urgent", title: "Critical: Jigger sets out of stock", detail: "Next delivery not until 18 Mar. Check alternative suppliers." },
];

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)}d ago`;
}

function groupByTime(items) {
  const groups = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart.getTime() - 86400000;
  const weekStart = todayStart.getTime() - 6 * 86400000;
  items.forEach((n) => {
    if (n.ts >= todayStart.getTime()) groups.Today.push(n);
    else if (n.ts >= yesterdayStart) groups.Yesterday.push(n);
    else if (n.ts >= weekStart) groups["This Week"].push(n);
    else groups.Earlier.push(n);
  });
  return groups;
}

function Btn({ children, active, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", border: `1px solid ${active ? C.accent : C.border}`, borderRadius: 6,
      background: active ? C.accent : C.card, color: active ? "#fff" : C.inkSec,
      fontFamily: F.sans, fontSize: 13, fontWeight: 500, cursor: "pointer",
      transition: "all .15s", ...style,
    }}>{children}</button>
  );
}

export default function NotificationCentre() {
  const [notifications, setNotifications] = useState(SEED);
  const [tab, setTab] = useState("All");
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({ task: true, finance: true, event: true, chat: true, stock: true, system: true });
  const [actioned, setActioned] = useState(new Set());
  const incomingIdx = useRef(0);

  // Simulate new notification every 60s
  useEffect(() => {
    const iv = setInterval(() => {
      const tpl = INCOMING[incomingIdx.current % INCOMING.length];
      incomingIdx.current += 1;
      setNotifications((prev) => [
        { ...tpl, id: Date.now(), ts: Date.now(), read: false },
        ...prev,
      ]);
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  const toggleRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleClick = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setActioned((prev) => { const s = new Set(prev); s.add(id); return s; });
  }, []);

  const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const filtered = notifications
    .filter((n) => prefs[n.type])
    .filter((n) => {
      if (tab === "All") return true;
      const mapped = TAB_MAP[tab];
      if (mapped) return n.type === mapped;
      return true;
    })
    .sort((a, b) => b.ts - a.ts);

  const unreadCount = notifications.filter((n) => !n.read && prefs[n.type]).length;
  const groups = groupByTime(filtered);

  const sectionStyle = { marginBottom: 24 };
  const sectionTitle = {
    fontFamily: F.serif, fontSize: 14, fontWeight: 600, color: C.inkMuted,
    textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, paddingLeft: 2,
  };

  return (
    <div style={{ fontFamily: F.sans, background: C.bg, minHeight: "100vh", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 700, color: C.ink, margin: 0 }}>
            Notification Centre
          </h1>
          {unreadCount > 0 && (
            <span style={{
              background: C.danger, color: "#fff", fontSize: 12, fontWeight: 700, borderRadius: 10,
              padding: "2px 9px", minWidth: 20, textAlign: "center", lineHeight: "18px",
            }}>{unreadCount}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={markAllRead} style={{ fontSize: 12 }}>Mark all read</Btn>
          <Btn onClick={() => setShowPrefs((p) => !p)} active={showPrefs} style={{ fontSize: 12 }}>
            {showPrefs ? "Close Preferences" : "Preferences"}
          </Btn>
        </div>
      </div>

      {/* Preferences panel */}
      {showPrefs && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 22px",
          marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center",
        }}>
          <span style={{ fontFamily: F.serif, fontSize: 14, fontWeight: 600, color: C.ink, marginRight: 8 }}>
            Show notifications for:
          </span>
          {Object.entries({ task: "Tasks", finance: "Finance", event: "Events", chat: "Chat", stock: "Stock", system: "System" }).map(([key, label]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: C.inkSec }}>
              <input type="checkbox" checked={prefs[key]} onChange={() => togglePref(key)}
                style={{ accentColor: C.accent, width: 16, height: 16 }} />
              {label}
            </label>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <Btn key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Btn>
        ))}
      </div>

      {/* Notification feed */}
      <div style={{ maxWidth: 760 }}>
        {Object.entries(groups).map(([label, items]) =>
          items.length > 0 && (
            <div key={label} style={sectionStyle}>
              <div style={sectionTitle}>{label}</div>
              {items.map((n) => (
                <NotificationCard key={n.id} n={n} actioned={actioned.has(n.id)}
                  onToggleRead={toggleRead} onClick={handleClick} />
              ))}
            </div>
          )
        )}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: C.inkMuted, fontFamily: F.serif, fontSize: 16 }}>
            No notifications to show.
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ n, actioned, onToggleRead, onClick }) {
  const [hovered, setHovered] = useState(false);
  const typeBg = { task: C.warnBg, finance: C.successBg, event: C.infoBg, chat: C.accentSubtle, stock: C.dangerBg, system: C.bgWarm };
  const typeColor = { task: C.warn, finance: C.success, event: C.info, chat: C.accent, stock: C.danger, system: C.inkMuted };
  const icon = ICONS[n.type] || ICONS.system;

  return (
    <div
      onClick={() => onClick(n.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", marginBottom: 6,
        background: actioned ? C.accentSubtle : hovered ? C.bgWarm : (n.read ? C.bg : C.card),
        border: `1px solid ${actioned ? C.accentLight : n.read ? C.borderLight : C.border}`,
        borderLeft: `3px solid ${actioned ? C.accentLight : PRIORITY_DOT[n.priority]}`,
        borderRadius: 8, cursor: "pointer", transition: "all .15s",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: typeBg[n.type] || C.bgWarm,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
        color: typeColor[n.type] || C.inkMuted,
      }}>{icon}</div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          {!n.read && (
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: C.accent, flexShrink: 0,
            }} />
          )}
          <span style={{
            fontFamily: F.sans, fontSize: 14, fontWeight: n.read ? 400 : 600, color: C.ink,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{n.title}</span>
        </div>
        <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.45, marginBottom: 6 }}>{n.detail}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
          <span style={{ color: C.inkMuted }}>{timeAgo(n.ts)}</span>
          <span style={{
            padding: "1px 7px", borderRadius: 4, fontSize: 11, fontWeight: 600,
            background: n.priority === "urgent" ? C.dangerBg : n.priority === "low" ? C.bgWarm : C.warnBg,
            color: n.priority === "urgent" ? C.danger : n.priority === "low" ? C.inkMuted : C.warn,
          }}>{PRIORITY_LABEL[n.priority]}</span>
          <span style={{
            padding: "1px 7px", borderRadius: 4, fontSize: 11, background: typeBg[n.type], color: typeColor[n.type],
          }}>{n.type}</span>
          {actioned && (
            <span style={{ color: C.success, fontWeight: 600, fontSize: 11 }}>Actioned</span>
          )}
        </div>
      </div>

      {/* Read toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleRead(n.id); }}
        title={n.read ? "Mark as unread" : "Mark as read"}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 4, fontSize: 18,
          color: n.read ? C.inkMuted : C.accent, flexShrink: 0, lineHeight: 1,
        }}
      >{n.read ? "\u25CB" : "\u25CF"}</button>
    </div>
  );
}
