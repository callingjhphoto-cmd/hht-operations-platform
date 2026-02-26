import { useState, useEffect, useCallback, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADS, HEARTS & TAILS — OPERATIONS PLATFORM
// Brand: Black bg, #6EC1E4 accent, White text, Lato font
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COLORS = {
  bg: "#000000",
  bgCard: "#0A0A0A",
  bgCardHover: "#111111",
  bgSidebar: "#050505",
  accent: "#6EC1E4",
  accentDim: "rgba(110,193,228,0.15)",
  accentGlow: "rgba(110,193,228,0.3)",
  text: "#FFFFFF",
  textMuted: "#8A8A8A",
  textDim: "#555555",
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#EF4444",
  border: "#1A1A1A",
  borderLight: "#222222",
};

// ── Mock Data ──────────────────────────────────────────────────────────────────

const revenueData = [
  { month: "Jan", revenue: 42000, costs: 28000, profit: 14000 },
  { month: "Feb", revenue: 18000, costs: 26000, profit: -8000 },
  { month: "Mar", revenue: 25000, costs: 25000, profit: 0 },
  { month: "Apr", revenue: 55000, costs: 30000, profit: 25000 },
  { month: "May", revenue: 68000, costs: 32000, profit: 36000 },
  { month: "Jun", revenue: 95000, costs: 38000, profit: 57000 },
  { month: "Jul", revenue: 110000, costs: 42000, profit: 68000 },
  { month: "Aug", revenue: 85000, costs: 36000, profit: 49000 },
  { month: "Sep", revenue: 72000, costs: 34000, profit: 38000 },
  { month: "Oct", revenue: 62000, costs: 32000, profit: 30000 },
  { month: "Nov", revenue: 78000, costs: 35000, profit: 43000 },
  { month: "Dec", revenue: 120000, costs: 45000, profit: 75000 },
];

const staffingRevenue = [
  { month: "Jan", amount: 35000, events: 12 },
  { month: "Feb", amount: 12000, events: 4 },
  { month: "Mar", amount: 18000, events: 6 },
  { month: "Apr", amount: 45000, events: 15 },
  { month: "May", amount: 58000, events: 20 },
  { month: "Jun", amount: 82000, events: 28 },
  { month: "Jul", amount: 95000, events: 35 },
  { month: "Aug", amount: 72000, events: 25 },
  { month: "Sep", amount: 60000, events: 22 },
  { month: "Oct", amount: 48000, events: 18 },
  { month: "Nov", amount: 65000, events: 24 },
  { month: "Dec", amount: 105000, events: 40 },
];

const serviceBreakdown = [
  { name: "Staffing", value: 500000, color: COLORS.accent },
  { name: "Events", value: 180000, color: "#9B59B6" },
  { name: "Drink Styling", value: 95000, color: "#E74C3C" },
  { name: "Consultancy", value: 75000, color: "#2ECC71" },
  { name: "Creative/Studio", value: 60000, color: "#F39C12" },
];

const subscriptions = [
  { name: "Scoro", cost: 250, annual: 3000, category: "CRM / Quoting", status: "active", replaceable: true },
  { name: "StaffWise", cost: 150, annual: 1800, category: "Staffing", status: "active", replaceable: true },
  { name: "Dropbox Business", cost: 80, annual: 960, category: "File Storage", status: "active", replaceable: true },
  { name: "Canva Pro", cost: 100, annual: 1200, category: "Design", status: "active", replaceable: false },
  { name: "Microsoft 365", cost: 90, annual: 1080, category: "Productivity", status: "active", replaceable: false },
  { name: "Xero", cost: 42, annual: 504, category: "Accounting", status: "active", replaceable: false },
  { name: "SiteGround", cost: 25, annual: 300, category: "Web Hosting", status: "active", replaceable: false },
  { name: "Google Workspace", cost: 55, annual: 660, category: "Email / Docs", status: "active", replaceable: false },
  { name: "Mailchimp", cost: 35, annual: 420, category: "Email Marketing", status: "estimated", replaceable: true },
  { name: "Zoom", cost: 15, annual: 180, category: "Video Calls", status: "estimated", replaceable: true },
];

const teamMembers = [
  { name: "James", role: "Director / BD", billableHrs: 22, nonBillableHrs: 18, utilisation: 55 },
  { name: "Seb", role: "Creative Director", billableHrs: 30, nonBillableHrs: 10, utilisation: 75 },
  { name: "Emily", role: "Events Manager", billableHrs: 28, nonBillableHrs: 12, utilisation: 70 },
  { name: "Jason", role: "Operations", billableHrs: 15, nonBillableHrs: 25, utilisation: 38 },
  { name: "Matt", role: "Studio / Content", billableHrs: 32, nonBillableHrs: 8, utilisation: 80 },
];

const pipelineEvents = [
  { id: 1, client: "Bombay Sapphire", event: "Summer Activation", value: 35000, stage: "confirmed", date: "2026-04-15", type: "Brand Activation" },
  { id: 2, client: "Coca-Cola", event: "Festival Pop-Up", value: 28000, stage: "confirmed", date: "2026-05-20", type: "Events" },
  { id: 3, client: "Moët Hennessy", event: "Trade Tasting", value: 18000, stage: "proposal", date: "2026-06-10", type: "Trade Advocacy" },
  { id: 4, client: "Diageo", event: "World Class Regional", value: 42000, stage: "proposal", date: "2026-05-05", type: "Competition" },
  { id: 5, client: "Private Client", event: "Wedding — Soho Farmhouse", value: 12000, stage: "lead", date: "2026-07-18", type: "Private Event" },
  { id: 6, client: "Pernod Ricard", event: "Gin Festival Activation", value: 55000, stage: "lead", date: "2026-06-22", type: "Brand Activation" },
  { id: 7, client: "Taste of London", event: "Drinks Village 2026", value: 65000, stage: "confirmed", date: "2026-06-15", type: "Festival" },
  { id: 8, client: "NBA London", event: "VIP Bar Experience", value: 40000, stage: "proposal", date: "2026-03-28", type: "Sports" },
  { id: 9, client: "London Cocktail Week", event: "Hub Bar Operations", value: 30000, stage: "lead", date: "2026-10-05", type: "Festival" },
  { id: 10, client: "Silverstone", event: "Paddock Hospitality", value: 48000, stage: "confirmed", date: "2026-07-04", type: "Sports" },
];

const outreachLeads = [
  { id: 1, name: "The Savoy", type: "Venue", status: "contacted", lastContact: "2026-02-20", priority: "high", notes: "Drinks menu refresh — follow up next week" },
  { id: 2, name: "Claridge's", type: "Venue", status: "new", lastContact: null, priority: "high", notes: "Cold approach — new F&B director started Jan" },
  { id: 3, name: "Carly Foxwell / Fox In The Well", type: "Agency", status: "warm", lastContact: "2026-02-15", priority: "high", notes: "Platform demo opportunity — brand consultancy" },
  { id: 4, name: "Soho House Group", type: "Venue Group", status: "contacted", lastContact: "2026-01-28", priority: "medium", notes: "Seasonal menu consultancy pitch" },
  { id: 5, name: "Fever-Tree", type: "Brand", status: "warm", lastContact: "2026-02-18", priority: "medium", notes: "Event activation partnerships 2026" },
  { id: 6, name: "The Ned", type: "Venue", status: "new", lastContact: null, priority: "medium", notes: "Multiple bars — staffing & styling opportunity" },
  { id: 7, name: "Sketch", type: "Venue", status: "contacted", lastContact: "2026-02-10", priority: "low", notes: "Enquired about drink styling for new menu" },
  { id: 8, name: "William Grant & Sons", type: "Brand", status: "new", lastContact: null, priority: "high", notes: "Hendrick's summer campaign — tender expected" },
];

const timeTrackingData = [
  { week: "W1", billable: 120, nonBillable: 80 },
  { week: "W2", billable: 105, nonBillable: 95 },
  { week: "W3", billable: 135, nonBillable: 65 },
  { week: "W4", billable: 110, nonBillable: 90 },
];

const chatMessages = [
  { role: "user", content: "What was the total revenue from Bombay Sapphire events in 2025?" },
  { role: "assistant", content: "Bombay Sapphire generated £87,400 across 6 events in 2025. The largest was the Summer Garden Activation (£32,000). Q3 was the strongest quarter at £52,000." },
  { role: "user", content: "How many non-billable hours did the team log last week?" },
  { role: "assistant", content: "Last week the team logged 90 non-billable hours vs 110 billable hours. Jason had the highest non-billable ratio at 62%. The main non-billable categories were: admin (35hrs), internal meetings (28hrs), and marketing (27hrs)." },
];

// ── Reusable Components ────────────────────────────────────────────────────────

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: { bg: COLORS.accentDim, color: COLORS.accent },
    success: { bg: "rgba(74,222,128,0.15)", color: COLORS.success },
    warning: { bg: "rgba(251,191,36,0.15)", color: COLORS.warning },
    danger: { bg: "rgba(239,68,68,0.15)", color: COLORS.danger },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{ background: v.bg, color: v.color, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {children}
    </span>
  );
};

const MetricCard = ({ label, value, change, prefix = "", suffix = "", small = false }) => (
  <div style={{
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: small ? "14px 16px" : "20px 24px",
    flex: 1,
    minWidth: small ? 140 : 180,
  }}>
    <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{label}</div>
    <div style={{ color: COLORS.text, fontSize: small ? 22 : 28, fontWeight: 700 }}>{prefix}{value}{suffix}</div>
    {change !== undefined && (
      <div style={{ color: change >= 0 ? COLORS.success : COLORS.danger, fontSize: 12, marginTop: 4, fontWeight: 500 }}>
        {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% vs last period
      </div>
    )}
  </div>
);

const SectionTitle = ({ children, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>{children}</h2>
    {subtitle && <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>{subtitle}</p>}
  </div>
);

// ── Page Components ────────────────────────────────────────────────────────────

const CommandCentre = () => {
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalCosts = revenueData.reduce((s, d) => s + d.costs, 0);
  const confirmedPipeline = pipelineEvents.filter(e => e.stage === "confirmed").reduce((s, e) => s + e.value, 0);
  const totalPipeline = pipelineEvents.reduce((s, e) => s + e.value, 0);
  const avgUtilisation = Math.round(teamMembers.reduce((s, t) => s + t.utilisation, 0) / teamMembers.length);

  return (
    <div>
      <SectionTitle subtitle="Real-time overview of HHT operations, revenue, and pipeline">Command Centre</SectionTitle>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <MetricCard label="Annual Revenue" value={`£${(totalRevenue / 1000).toFixed(0)}k`} change={8.2} />
        <MetricCard label="Staffing Revenue" value="£500k" change={12.5} />
        <MetricCard label="Confirmed Pipeline" value={`£${(confirmedPipeline / 1000).toFixed(0)}k`} change={15} />
        <MetricCard label="Total Pipeline" value={`£${(totalPipeline / 1000).toFixed(0)}k`} />
        <MetricCard label="Team Utilisation" value={`${avgUtilisation}%`} change={-3} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Revenue vs Costs — Monthly</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" stroke={COLORS.textDim} fontSize={11} />
              <YAxis stroke={COLORS.textDim} fontSize={11} tickFormatter={v => `£${v / 1000}k`} />
              <Tooltip contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, fontSize: 12 }} formatter={v => [`£${v.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.accent} fill={COLORS.accentDim} strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="costs" stroke={COLORS.danger} fill="rgba(239,68,68,0.08)" strokeWidth={2} name="Costs" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Revenue by Service</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {serviceBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, fontSize: 12 }} formatter={v => [`£${(v / 1000).toFixed(0)}k`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {serviceBreakdown.map((s, i) => (
              <span key={i} style={{ fontSize: 10, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />{s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Upcoming Events</div>
          {pipelineEvents.filter(e => e.stage === "confirmed").slice(0, 4).map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none" }}>
              <div>
                <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{e.client}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{e.event} — {e.date}</div>
              </div>
              <div style={{ color: COLORS.accent, fontSize: 14, fontWeight: 700 }}>£{(e.value / 1000).toFixed(0)}k</div>
            </div>
          ))}
        </div>

        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Team Utilisation — This Week</div>
          {teamMembers.map((t, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: COLORS.text, fontSize: 12, fontWeight: 500 }}>{t.name} <span style={{ color: COLORS.textMuted }}>— {t.role}</span></span>
                <span style={{ color: t.utilisation >= 70 ? COLORS.success : t.utilisation >= 50 ? COLORS.warning : COLORS.danger, fontSize: 12, fontWeight: 700 }}>{t.utilisation}%</span>
              </div>
              <div style={{ width: "100%", height: 4, background: COLORS.border, borderRadius: 2 }}>
                <div style={{ width: `${t.utilisation}%`, height: 4, background: t.utilisation >= 70 ? COLORS.success : t.utilisation >= 50 ? COLORS.warning : COLORS.danger, borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EventPipeline = () => {
  const [filterStage, setFilterStage] = useState("all");
  const stages = { confirmed: { label: "Confirmed", color: COLORS.success }, proposal: { label: "Proposal", color: COLORS.warning }, lead: { label: "Lead", color: COLORS.accent } };
  const filtered = filterStage === "all" ? pipelineEvents : pipelineEvents.filter(e => e.stage === filterStage);
  const stageValues = Object.entries(stages).map(([k, v]) => ({ stage: v.label, value: pipelineEvents.filter(e => e.stage === k).reduce((s, e) => s + e.value, 0), color: v.color, count: pipelineEvents.filter(e => e.stage === k).length }));

  return (
    <div>
      <SectionTitle subtitle="Track events from lead to confirmed — pipeline value and conversion">Event Pipeline</SectionTitle>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {stageValues.map((s, i) => (
          <div key={i} style={{ flex: 1, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
              <span style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{s.stage}</span>
            </div>
            <div style={{ color: COLORS.text, fontSize: 24, fontWeight: 700 }}>£{(s.value / 1000).toFixed(0)}k</div>
            <div style={{ color: COLORS.textMuted, fontSize: 12 }}>{s.count} events</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "confirmed", "proposal", "lead"].map(s => (
          <button key={s} onClick={() => setFilterStage(s)} style={{ background: filterStage === s ? COLORS.accent : "transparent", color: filterStage === s ? "#000" : COLORS.textMuted, border: `1px solid ${filterStage === s ? COLORS.accent : COLORS.border}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
            {s === "all" ? "All Events" : s}
          </button>
        ))}
      </div>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["Client", "Event", "Type", "Date", "Value", "Stage"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: COLORS.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.15s" }}>
                <td style={{ padding: "14px 16px", color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{e.client}</td>
                <td style={{ padding: "14px 16px", color: COLORS.textMuted, fontSize: 13 }}>{e.event}</td>
                <td style={{ padding: "14px 16px" }}><Badge>{e.type}</Badge></td>
                <td style={{ padding: "14px 16px", color: COLORS.textMuted, fontSize: 13 }}>{e.date}</td>
                <td style={{ padding: "14px 16px", color: COLORS.accent, fontSize: 14, fontWeight: 700 }}>£{e.value.toLocaleString()}</td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge variant={e.stage === "confirmed" ? "success" : e.stage === "proposal" ? "warning" : "default"}>{e.stage}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CRMOutreach = () => {
  const [selectedLead, setSelectedLead] = useState(null);
  const statusColors = { new: COLORS.accent, contacted: COLORS.warning, warm: COLORS.success };

  return (
    <div>
      <SectionTitle subtitle="Business outreach, lead tracking, and CRM — replacing Scoro for prospecting">CRM & Business Outreach</SectionTitle>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <MetricCard small label="Total Leads" value={outreachLeads.length} />
        <MetricCard small label="Hot Leads" value={outreachLeads.filter(l => l.priority === "high").length} />
        <MetricCard small label="Contacted" value={outreachLeads.filter(l => l.status === "contacted").length} />
        <MetricCard small label="Warm" value={outreachLeads.filter(l => l.status === "warm").length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Lead List</span>
          </div>
          {outreachLeads.map((lead, i) => (
            <div key={lead.id} onClick={() => setSelectedLead(lead)} style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${COLORS.border}`,
              cursor: "pointer",
              background: selectedLead?.id === lead.id ? COLORS.accentDim : "transparent",
              transition: "background 0.15s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{lead.type}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {lead.priority === "high" && <span style={{ color: COLORS.danger, fontSize: 10, fontWeight: 700 }}>HIGH</span>}
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[lead.status] || COLORS.textDim }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          {selectedLead ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 700 }}>{selectedLead.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Badge>{selectedLead.type}</Badge>
                  <Badge variant={selectedLead.status === "warm" ? "success" : selectedLead.status === "contacted" ? "warning" : "default"}>{selectedLead.status}</Badge>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Priority</div>
                <div style={{ color: selectedLead.priority === "high" ? COLORS.danger : selectedLead.priority === "medium" ? COLORS.warning : COLORS.textMuted, fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{selectedLead.priority}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Last Contact</div>
                <div style={{ color: COLORS.text, fontSize: 14 }}>{selectedLead.lastContact || "Not yet contacted"}</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Notes</div>
                <div style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.5 }}>{selectedLead.notes}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ background: COLORS.accent, color: "#000", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Send Outreach</button>
                <button style={{ background: "transparent", color: COLORS.accent, border: `1px solid ${COLORS.accent}`, borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Log Activity</button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: COLORS.textMuted, fontSize: 13 }}>
              Select a lead to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TimeTracking = () => {
  const totalBillable = teamMembers.reduce((s, t) => s + t.billableHrs, 0);
  const totalNonBillable = teamMembers.reduce((s, t) => s + t.nonBillableHrs, 0);
  const totalHrs = totalBillable + totalNonBillable;

  return (
    <div>
      <SectionTitle subtitle="Billable vs non-billable hours — team performance and utilisation tracking">Time & Utilisation</SectionTitle>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <MetricCard small label="Billable Hours (Week)" value={totalBillable} suffix="hrs" />
        <MetricCard small label="Non-Billable Hours" value={totalNonBillable} suffix="hrs" />
        <MetricCard small label="Utilisation Rate" value={`${Math.round((totalBillable / totalHrs) * 100)}%`} change={-5} />
        <MetricCard small label="Revenue per Hour" value="£68" change={3.2} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Weekly Breakdown — Billable vs Non-Billable</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeTrackingData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="week" stroke={COLORS.textDim} fontSize={11} />
              <YAxis stroke={COLORS.textDim} fontSize={11} />
              <Tooltip contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, fontSize: 12 }} />
              <Bar dataKey="billable" fill={COLORS.accent} name="Billable" radius={[3, 3, 0, 0]} />
              <Bar dataKey="nonBillable" fill={COLORS.danger} name="Non-Billable" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Individual Breakdown</div>
          {teamMembers.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.accentDim, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, fontSize: 12, fontWeight: 700 }}>{t.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: COLORS.text, fontSize: 12, fontWeight: 600 }}>{t.name}</span>
                  <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{t.billableHrs}h billable / {t.nonBillableHrs}h non</span>
                </div>
                <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${t.utilisation}%`, background: COLORS.accent }} />
                  <div style={{ width: `${100 - t.utilisation}%`, background: "rgba(239,68,68,0.4)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
        <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>February Analysis — Cost Alert</div>
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "14px 18px", marginBottom: 12 }}>
          <div style={{ color: COLORS.danger, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Low Revenue Period Warning</div>
          <div style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.5 }}>
            February is tracking at £18,000 revenue against £26,000 fixed costs. Current burn rate suggests a potential -£8,000 loss this month. Consider reallocating non-billable hours to outreach and business development to accelerate Q2 pipeline.
          </div>
        </div>
        <div style={{ background: COLORS.accentDim, border: `1px solid rgba(110,193,228,0.2)`, borderRadius: 6, padding: "14px 18px" }}>
          <div style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Recommendation</div>
          <div style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.5 }}>
            Jason and James have 43 combined non-billable hours this week. Redirecting 50% of those hours to venue outreach and cold prospecting could generate 3-5 qualified leads based on previous conversion rates.
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialHub = () => {
  const totalSubs = subscriptions.reduce((s, sub) => s + sub.annual, 0);
  const replaceableSubs = subscriptions.filter(s => s.replaceable).reduce((s, sub) => s + sub.annual, 0);

  return (
    <div>
      <SectionTitle subtitle="Financial overview, subscription audit, and cost optimisation">Financial Hub</SectionTitle>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <MetricCard small label="Annual Revenue" value="£910k" change={8.2} />
        <MetricCard small label="Annual Costs" value="£403k" />
        <MetricCard small label="Gross Margin" value="56%" change={2.1} />
        <MetricCard small label="SaaS Spend (Annual)" value={`£${(totalSubs / 1000).toFixed(1)}k`} />
        <MetricCard small label="Potential Savings" value={`£${(replaceableSubs / 1000).toFixed(1)}k`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Monthly P&L</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" stroke={COLORS.textDim} fontSize={11} />
              <YAxis stroke={COLORS.textDim} fontSize={11} tickFormatter={v => `£${v / 1000}k`} />
              <Tooltip contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, fontSize: 12 }} formatter={v => [`£${v.toLocaleString()}`, ""]} />
              <Bar dataKey="profit" name="Profit" radius={[3, 3, 0, 0]}>
                {revenueData.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? COLORS.success : COLORS.danger} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Staffing Revenue — Monthly</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={staffingRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" stroke={COLORS.textDim} fontSize={11} />
              <YAxis stroke={COLORS.textDim} fontSize={11} tickFormatter={v => `£${v / 1000}k`} />
              <Tooltip contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, fontSize: 12 }} formatter={v => [`£${v.toLocaleString()}`, ""]} />
              <Line type="monotone" dataKey="amount" stroke={COLORS.accent} strokeWidth={2} dot={{ fill: COLORS.accent, r: 3 }} name="Staffing Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Subscription Audit</span>
          <span style={{ color: COLORS.danger, fontSize: 12, fontWeight: 600 }}>£{replaceableSubs.toLocaleString()}/yr replaceable</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["Platform", "Category", "Monthly", "Annual", "Status", "Replaceable"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: COLORS.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "12px 16px", color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{sub.name}</td>
                <td style={{ padding: "12px 16px", color: COLORS.textMuted, fontSize: 12 }}>{sub.category}</td>
                <td style={{ padding: "12px 16px", color: COLORS.text, fontSize: 13 }}>£{sub.cost}/mo</td>
                <td style={{ padding: "12px 16px", color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>£{sub.annual.toLocaleString()}</td>
                <td style={{ padding: "12px 16px" }}><Badge variant={sub.status === "active" ? "success" : "warning"}>{sub.status}</Badge></td>
                <td style={{ padding: "12px 16px" }}>
                  {sub.replaceable ? (
                    <span style={{ color: COLORS.success, fontSize: 12, fontWeight: 600 }}>Yes — integrate into platform</span>
                  ) : (
                    <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Keep</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AIAssistant = () => {
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const responses = {
      default: "I can pull that data for you. Let me check the HHT records. Based on current data, I'd recommend reviewing the financial hub for the most up-to-date figures. Is there anything specific you'd like me to drill into?"
    };
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: responses.default }]);
    setInput("");
  };

  return (
    <div>
      <SectionTitle subtitle="Ask anything about HHT — invoicing, figures, staffing, events, or business data">AI Assistant</SectionTitle>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, display: "flex", flexDirection: "column", height: 500 }}>
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
              <div style={{
                maxWidth: "75%",
                background: msg.role === "user" ? COLORS.accent : COLORS.borderLight,
                color: msg.role === "user" ? "#000" : COLORS.text,
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "14px 20px", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about HHT — invoicing, revenue, staffing, events..."
            style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 13, outline: "none" }}
          />
          <button onClick={handleSend} style={{ background: COLORS.accent, color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Send</button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["What's our outstanding revenue?", "February cost analysis", "Top clients by revenue", "Non-billable hours breakdown", "Pipeline conversion rate"].map((q, i) => (
          <button key={i} onClick={() => setInput(q)} style={{ background: COLORS.accentDim, color: COLORS.accent, border: `1px solid rgba(110,193,228,0.2)`, borderRadius: 20, padding: "6px 14px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{q}</button>
        ))}
      </div>
    </div>
  );
};

// ── Main App ───────────────────────────────────────────────────────────────────

const navItems = [
  { id: "command", label: "Command Centre", icon: "◆" },
  { id: "pipeline", label: "Event Pipeline", icon: "◎" },
  { id: "crm", label: "CRM & Outreach", icon: "◉" },
  { id: "time", label: "Time & Utilisation", icon: "◷" },
  { id: "financial", label: "Financial Hub", icon: "◈" },
  { id: "assistant", label: "AI Assistant", icon: "◐" },
];

export default function HHTOperationsPlatform() {
  const [activePage, setActivePage] = useState("command");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const pages = {
    command: CommandCentre,
    pipeline: EventPipeline,
    crm: CRMOutreach,
    time: TimeTracking,
    financial: FinancialHub,
    assistant: AIAssistant,
  };

  const ActivePage = pages[activePage];

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bg, fontFamily: "'Lato', -apple-system, system-ui, sans-serif", color: COLORS.text, overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: COLORS.bgSidebar, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${COLORS.accent}, rgba(110,193,228,0.5))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>H</div>
            <div>
              <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 800, letterSpacing: "0.5px" }}>HH&T</div>
              <div style={{ color: COLORS.textMuted, fontSize: 9, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" }}>Operations</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 8px" }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                marginBottom: 2,
                background: activePage === item.id ? COLORS.accentDim : "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.15s",
                borderLeft: activePage === item.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 14, color: activePage === item.id ? COLORS.accent : COLORS.textDim }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: activePage === item.id ? 700 : 500, color: activePage === item.id ? COLORS.text : COLORS.textMuted }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ color: COLORS.textMuted, fontSize: 9, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Heads, Hearts & Tails</div>
          <div style={{ color: COLORS.textDim, fontSize: 9 }}>Drinks, Design & Peace of Mind</div>
          <div style={{ color: COLORS.textDim, fontSize: 9, marginTop: 8 }}>{time.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <ActivePage />
      </div>
    </div>
  );
}
