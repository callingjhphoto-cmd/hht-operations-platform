import React, { useState, useMemo, useCallback } from "react";

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

const cardStyle = {
  background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
  padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const btnStyle = (primary) => ({
  fontFamily: F.sans, fontSize: 13, fontWeight: 600, border: "none", borderRadius: 6,
  padding: "8px 16px", cursor: "pointer", transition: "all 0.15s",
  background: primary ? C.accent : C.card, color: primary ? "#fff" : C.ink,
  border: primary ? "none" : `1px solid ${C.border}`,
});
const pillStyle = (active) => ({
  fontFamily: F.sans, fontSize: 12, fontWeight: 500, borderRadius: 20,
  padding: "5px 12px", cursor: "pointer", border: `1px solid ${active ? C.accent : C.border}`,
  background: active ? C.accentSubtle : C.card, color: active ? C.accent : C.inkSec,
  transition: "all 0.15s",
});
const inputStyle = {
  fontFamily: F.sans, fontSize: 13, padding: "8px 12px", borderRadius: 6,
  border: `1px solid ${C.border}`, background: C.card, color: C.ink,
  outline: "none", width: "100%", boxSizing: "border-box",
};

const USERS = [
  { name: "Joe Stokoe", initials: "JS" },
  { name: "Alex Morgan", initials: "AM" },
  { name: "Sam Taylor", initials: "ST" },
  { name: "Jordan Lee", initials: "JL" },
  { name: "Pat Quinn", initials: "PQ" },
  { name: "Robin James", initials: "RJ" },
  { name: "Casey Smith", initials: "CS" },
];

const MODULES = ["Quotes", "Invoices", "Events", "Inventory", "Library", "Staff", "Leads"];
const ACTIONS = ["Create", "Update", "Delete", "Approve", "Send"];

const avatarColors = ["#7D5A1A", "#2B7A4B", "#2A6680", "#956018", "#9B3535", "#6B5B95", "#4A7C59"];
const getAvatarColor = (initials) => {
  const idx = initials.charCodeAt(0) + initials.charCodeAt(1);
  return avatarColors[idx % avatarColors.length];
};

const d = (daysAgo, h, m) => {
  const dt = new Date(); dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(h, m, 0, 0); return dt.toISOString();
};

const ENTRIES = [
  { id: 1, timestamp: d(0, 14, 32), user: USERS[0], module: "Quotes", action: "Update", description: "Joe Stokoe updated Quote #Q-2025-014 — changed total from £10,500 to £12,000", details: { field: "Total", before: "£10,500", after: "£12,000" } },
  { id: 2, timestamp: d(0, 13, 15), user: USERS[1], module: "Inventory", action: "Update", description: "Alex Morgan added 3 items to Diageo Masterclass inventory", details: { field: "Items added", before: "12 items", after: "15 items" } },
  { id: 3, timestamp: d(0, 11, 45), user: USERS[2], module: "Events", action: "Update", description: "Sam Taylor moved 'Pernod Ricard Summer Party' from Proposal → Planning", details: { field: "Status", before: "Proposal", after: "Planning" } },
  { id: 4, timestamp: d(0, 10, 20), user: USERS[4], module: "Leads", action: "Create", description: "Pat Quinn created new lead: Soho House", details: null },
  { id: 5, timestamp: d(0, 9, 50), user: USERS[5], module: "Invoices", action: "Send", description: "Robin James marked Invoice #INV-047 as sent", details: { field: "Status", before: "Draft", after: "Sent" } },
  { id: 6, timestamp: d(0, 9, 10), user: USERS[3], module: "Library", action: "Update", description: "Jordan Lee updated cocktail recipe: Espresso Martini v2", details: { field: "Version", before: "v1", after: "v2" } },
  { id: 7, timestamp: d(0, 8, 0), user: { name: "System", initials: "SY" }, module: "Library", action: "Create", description: "System: Automated backup completed", details: null },
  { id: 8, timestamp: d(0, 16, 5), user: USERS[0], module: "Quotes", action: "Approve", description: "Joe Stokoe approved Quote #Q-2025-018 for Moët VIP Dinner", details: { field: "Approval Status", before: "Pending", after: "Approved" } },
  { id: 9, timestamp: d(0, 15, 30), user: USERS[6], module: "Staff", action: "Update", description: "Casey Smith logged 8h for Fever-Tree event prep", details: { field: "Hours logged", before: "0h", after: "8h" } },
  { id: 10, timestamp: d(0, 12, 0), user: USERS[1], module: "Library", action: "Delete", description: "Alex Morgan deleted file: Old Menu Template.docx from Library", details: null },
  { id: 11, timestamp: d(1, 17, 20), user: USERS[0], module: "Quotes", action: "Create", description: "Joe Stokoe created Quote #Q-2025-019 for Campari Group Tasting", details: null },
  { id: 12, timestamp: d(1, 14, 0), user: USERS[2], module: "Events", action: "Update", description: "Sam Taylor updated venue details for Hendrick's Gin Garden Party", details: { field: "Venue", before: "TBC", after: "Kensington Roof Gardens" } },
  { id: 13, timestamp: d(1, 11, 30), user: USERS[3], module: "Inventory", action: "Update", description: "Jordan Lee restocked 24x Tanqueray No. Ten 70cl", details: { field: "Stock level", before: "6 bottles", after: "30 bottles" } },
  { id: 14, timestamp: d(1, 9, 45), user: USERS[5], module: "Invoices", action: "Create", description: "Robin James created Invoice #INV-048 for Bacardi Brand Day", details: null },
  { id: 15, timestamp: d(2, 16, 10), user: USERS[4], module: "Leads", action: "Update", description: "Pat Quinn updated lead status: The Ned — moved to Qualified", details: { field: "Lead status", before: "New", after: "Qualified" } },
  { id: 16, timestamp: d(2, 13, 0), user: USERS[6], module: "Staff", action: "Create", description: "Casey Smith added new team member: Freelancer — Mia Chen", details: null },
  { id: 17, timestamp: d(2, 10, 15), user: USERS[1], module: "Events", action: "Update", description: "Alex Morgan confirmed 45 guests for Rémy Martin VIP Lounge", details: { field: "Guest count", before: "Est. 30", after: "Confirmed 45" } },
  { id: 18, timestamp: d(2, 8, 30), user: { name: "System", initials: "SY" }, module: "Invoices", action: "Send", description: "System: Payment reminder sent for Invoice #INV-041", details: null },
  { id: 19, timestamp: d(3, 15, 45), user: USERS[0], module: "Quotes", action: "Update", description: "Joe Stokoe revised line items on Quote #Q-2025-016 for Absolut Launch", details: { field: "Line items", before: "8 items", after: "11 items" } },
  { id: 20, timestamp: d(3, 12, 20), user: USERS[2], module: "Events", action: "Approve", description: "Sam Taylor approved final run sheet for Bombay Sapphire Supper Club", details: { field: "Run sheet", before: "Draft", after: "Approved" } },
  { id: 21, timestamp: d(3, 9, 0), user: USERS[3], module: "Library", action: "Create", description: "Jordan Lee uploaded new recipe: Negroni Sbagliato (batch spec)", details: null },
  { id: 22, timestamp: d(4, 17, 0), user: USERS[5], module: "Invoices", action: "Update", description: "Robin James applied £500 discount to Invoice #INV-045", details: { field: "Discount", before: "£0", after: "£500" } },
  { id: 23, timestamp: d(4, 14, 30), user: USERS[4], module: "Leads", action: "Delete", description: "Pat Quinn removed stale lead: Old client — The Ivy (duplicate)", details: null },
  { id: 24, timestamp: d(4, 11, 0), user: USERS[6], module: "Staff", action: "Update", description: "Casey Smith updated availability for weekend 15–16 March", details: { field: "Availability", before: "Unavailable", after: "Available (Sat only)" } },
  { id: 25, timestamp: d(5, 16, 40), user: USERS[1], module: "Inventory", action: "Create", description: "Alex Morgan added new item: Fever-Tree Mediterranean Tonic (case of 24)", details: null },
  { id: 26, timestamp: d(5, 13, 15), user: USERS[0], module: "Events", action: "Create", description: "Joe Stokoe created new event: William Grant & Sons Trade Show", details: null },
  { id: 27, timestamp: d(5, 10, 0), user: USERS[2], module: "Quotes", action: "Send", description: "Sam Taylor sent Quote #Q-2025-015 to Belvedere Vodka team", details: { field: "Status", before: "Draft", after: "Sent" } },
  { id: 28, timestamp: d(6, 15, 20), user: USERS[3], module: "Library", action: "Update", description: "Jordan Lee updated brand guidelines PDF for Jägermeister activation", details: { field: "File", before: "v1.2 (2024)", after: "v2.0 (2025)" } },
  { id: 29, timestamp: d(6, 11, 45), user: USERS[5], module: "Invoices", action: "Approve", description: "Robin James approved Invoice #INV-046 — £8,750 for Grey Goose pop-up", details: { field: "Status", before: "Pending approval", after: "Approved" } },
  { id: 30, timestamp: d(6, 8, 30), user: USERS[4], module: "Leads", action: "Create", description: "Pat Quinn created new lead: Chiltern Firehouse — cocktail consultancy", details: null },
];

const actionColors = {
  Create: { color: C.success, bg: C.successBg },
  Update: { color: C.info, bg: C.infoBg },
  Delete: { color: C.danger, bg: C.dangerBg },
  Approve: { color: C.success, bg: C.successBg },
  Send: { color: C.warn, bg: C.warnBg },
};

const formatTimestamp = (iso) => {
  const dt = new Date(iso);
  const now = new Date();
  const diffMs = now - dt;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const formatFullDate = (iso) => {
  const dt = new Date(iso);
  return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
    " at " + dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedModule, setSelectedModule] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filtered = useMemo(() => {
    return ENTRIES
      .filter((e) => {
        if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
        if (selectedUser !== "All" && e.user.name !== selectedUser) return false;
        if (selectedModule !== "All" && e.module !== selectedModule) return false;
        if (selectedAction !== "All" && e.action !== selectedAction) return false;
        if (dateFrom) {
          const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
          if (new Date(e.timestamp) < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
          if (new Date(e.timestamp) > to) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [search, selectedUser, selectedModule, selectedAction, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEntries = ENTRIES.filter((e) => new Date(e.timestamp) >= today);
    const userCounts = {};
    const moduleCounts = {};
    ENTRIES.forEach((e) => {
      userCounts[e.user.name] = (userCounts[e.user.name] || 0) + 1;
      moduleCounts[e.module] = (moduleCounts[e.module] || 0) + 1;
    });
    const topUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];
    const topModule = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0];
    return { todayCount: todayEntries.length, topUser: topUser?.[0] || "—", topModule: topModule?.[0] || "—" };
  }, []);

  const handleRefresh = useCallback(() => setLastRefresh(new Date()), []);

  const handleExport = useCallback(() => {
    const lines = filtered.map((e) => `${formatFullDate(e.timestamp)}\t${e.user.name}\t${e.module}\t${e.action}\t${e.description}`);
    const csv = "Date\tUser\tModule\tAction\tDescription\n" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-log-export.tsv"; a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const clearFilters = () => {
    setSearch(""); setSelectedUser("All"); setSelectedModule("All");
    setSelectedAction("All"); setDateFrom(""); setDateTo("");
  };

  const hasFilters = search || selectedUser !== "All" || selectedModule !== "All" || selectedAction !== "All" || dateFrom || dateTo;

  return (
    <div style={{ fontFamily: F.sans, background: C.bg, minHeight: "100vh", padding: 32, color: C.ink }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, margin: 0, color: C.ink }}>Audit Log</h1>
          <p style={{ color: C.inkMuted, fontSize: 14, margin: "6px 0 0" }}>Track all changes across the platform</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.inkMuted, fontSize: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block" }} />
            Auto-refresh {formatTimestamp(lastRefresh.toISOString())}
          </div>
          <button onClick={handleRefresh} style={btnStyle(false)}>Refresh</button>
          <button onClick={handleExport} style={btnStyle(true)}>Export</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Actions Today", value: stats.todayCount, icon: "+" },
          { label: "Most Active User", value: stats.topUser, icon: "@" },
          { label: "Most Changed Module", value: stats.topModule, icon: "#" },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: C.accentSubtle, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.accent, fontSize: 18 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.serif, color: C.ink }}>{s.value}</div>
              <div style={{ fontSize: 12, color: C.inkMuted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ ...cardStyle, padding: 16, marginBottom: 16 }}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.inkMuted, fontSize: 14 }}>&#128269;</span>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit log entries..."
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>

        {/* Filter rows */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>User</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["All", ...USERS.map((u) => u.name)].map((u) => (
                <button key={u} onClick={() => setSelectedUser(u)} style={pillStyle(selectedUser === u)}>{u === "All" ? "All Users" : u.split(" ")[0]}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Module</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["All", ...MODULES].map((m) => (
                <button key={m} onClick={() => setSelectedModule(m)} style={pillStyle(selectedModule === m)}>{m === "All" ? "All Modules" : m}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Action</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["All", ...ACTIONS].map((a) => (
                <button key={a} onClick={() => setSelectedAction(a)} style={pillStyle(selectedAction === a)}>{a === "All" ? "All Actions" : a}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Date Range</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 140, fontSize: 12 }} />
              <span style={{ color: C.inkMuted, fontSize: 12 }}>to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ ...inputStyle, width: 140, fontSize: 12 }} />
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ ...btnStyle(false), fontSize: 12, color: C.danger }}>Clear filters</button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 13, color: C.inkMuted, marginBottom: 12 }}>
        Showing {filtered.length} of {ENTRIES.length} entries
      </div>

      {/* Feed */}
      <div>
        {filtered.length === 0 && (
          <div style={{ ...cardStyle, textAlign: "center", padding: 48, color: C.inkMuted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>No entries found</div>
            <div style={{ fontSize: 14 }}>Try adjusting your search or filters</div>
          </div>
        )}
        {filtered.map((entry) => {
          const ac = actionColors[entry.action] || { color: C.inkSec, bg: C.bgWarm };
          const isExpanded = expandedId === entry.id;
          return (
            <div
              key={entry.id}
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              style={{
                ...cardStyle, padding: 0, cursor: "pointer", marginBottom: 8,
                borderLeft: `3px solid ${ac.color}`,
                background: isExpanded ? C.bgWarm : C.card,
                transition: "all 0.15s",
              }}
            >
              <div style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: getAvatarColor(entry.user.initials),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                }}>
                  {entry.user.initials}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: C.ink }}>{entry.user.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                      background: ac.bg, color: ac.color,
                    }}>{entry.action}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 10,
                      background: C.accentSubtle, color: C.accent,
                    }}>{entry.module}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.5 }}>{entry.description}</div>
                </div>

                {/* Timestamp */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: C.inkMuted, whiteSpace: "nowrap" }}>{formatTimestamp(entry.timestamp)}</div>
                  {entry.details && (
                    <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 4 }}>{isExpanded ? "▲" : "▼"} details</div>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && entry.details && (
                <div style={{ padding: "0 18px 14px 68px", borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Change Details</div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 2 }}>Field</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{entry.details.field}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 2 }}>Before</div>
                      <div style={{ fontSize: 13, padding: "4px 10px", borderRadius: 4, background: C.dangerBg, color: C.danger, display: "inline-block" }}>{entry.details.before}</div>
                    </div>
                    <div style={{ fontSize: 16, color: C.inkMuted }}>→</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 2 }}>After</div>
                      <div style={{ fontSize: 13, padding: "4px 10px", borderRadius: 4, background: C.successBg, color: C.success, display: "inline-block" }}>{entry.details.after}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 10 }}>{formatFullDate(entry.timestamp)}</div>
                </div>
              )}

              {isExpanded && !entry.details && (
                <div style={{ padding: "0 18px 14px 68px", borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: C.inkMuted, fontStyle: "italic" }}>No additional change details recorded for this action.</div>
                  <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 6 }}>{formatFullDate(entry.timestamp)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
