import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from "recharts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADS, HEARTS & TAILS — OPERATIONS PLATFORM v2.0
// Design Language: Liquid Glass · Copper Accents · Dark Mode Supremacy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const C = {
  bg: "#0A0A0C",
  bgDeep: "#060608",
  glass: "rgba(255,255,255,0.03)",
  glassBorder: "rgba(255,255,255,0.06)",
  glassHover: "rgba(255,255,255,0.06)",
  glassStrong: "rgba(255,255,255,0.08)",
  copper: "#C87533",
  copperLight: "#D4915A",
  copperDim: "rgba(200,117,51,0.15)",
  copperGlow: "rgba(200,117,51,0.25)",
  bronze: "#B8860B",
  text: "#F0EDE8",
  textSecondary: "#9A9590",
  textMuted: "#5A5550",
  success: "#5EBD73",
  successDim: "rgba(94,189,115,0.12)",
  warning: "#E0A84A",
  warningDim: "rgba(224,168,74,0.12)",
  danger: "#D94F4F",
  dangerDim: "rgba(217,79,79,0.12)",
  info: "#5BA4CF",
  infoDim: "rgba(91,164,207,0.12)",
  border: "rgba(255,255,255,0.04)",
  borderLight: "rgba(255,255,255,0.08)",
};

const glassPanel = {
  background: C.glass,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${C.glassBorder}`,
  borderRadius: 12,
};

const glassPanelStrong = {
  ...glassPanel,
  background: C.glassStrong,
  border: `1px solid ${C.borderLight}`,
};

// ── HHT Logo (Heart + Ampersand SVG) ──
const HHTLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="12" fill="#000"/>
    <path d="M100 170C100 170 30 125 30 80C30 55 50 38 72 38C86 38 96 46 100 55C104 46 114 38 128 38C150 38 170 55 170 80C170 125 100 170 100 170Z" fill="white"/>
    <text x="100" y="128" textAnchor="middle" fontFamily="Georgia, serif" fontSize="90" fontWeight="bold" fill="black">&amp;</text>
  </svg>
);

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
  { name: "Staffing", value: 500000, color: C.copper },
  { name: "Events", value: 180000, color: C.copperLight },
  { name: "Drink Styling", value: 95000, color: C.info },
  { name: "Consultancy", value: 75000, color: C.success },
  { name: "Creative/Studio", value: 60000, color: C.warning },
];

const subscriptions = [
  { name: "Scoro", cost: 250, annual: 3000, category: "CRM / Quoting", status: "active", integrated: true },
  { name: "StaffWise", cost: 150, annual: 1800, category: "Staffing", status: "active", integrated: true },
  { name: "Xero", cost: 42, annual: 504, category: "Accounting", status: "active", integrated: true },
  { name: "Dropbox Business", cost: 80, annual: 960, category: "File Storage", status: "active", integrated: false },
  { name: "Canva Pro", cost: 100, annual: 1200, category: "Design", status: "active", integrated: false },
  { name: "Microsoft 365", cost: 90, annual: 1080, category: "Productivity", status: "active", integrated: false },
  { name: "SiteGround", cost: 25, annual: 300, category: "Web Hosting", status: "active", integrated: false },
  { name: "Google Workspace", cost: 55, annual: 660, category: "Email / Docs", status: "active", integrated: false },
  { name: "Mailchimp", cost: 35, annual: 420, category: "Email Marketing", status: "estimated", integrated: false },
  { name: "Zoom", cost: 15, annual: 180, category: "Video Calls", status: "estimated", integrated: false },
];

const teamMembers = [
  { name: "Joe Stokoe", role: "Director / BD", billableHrs: 22, nonBillableHrs: 18, utilisation: 55, avatar: "JS" },
  { name: "Seb", role: "Creative Director", billableHrs: 30, nonBillableHrs: 10, utilisation: 75, avatar: "SB" },
  { name: "Emily", role: "Events Manager", billableHrs: 28, nonBillableHrs: 12, utilisation: 70, avatar: "EM" },
  { name: "Jason", role: "Operations", billableHrs: 15, nonBillableHrs: 25, utilisation: 38, avatar: "JN" },
  { name: "Matt", role: "Studio / Content", billableHrs: 32, nonBillableHrs: 8, utilisation: 80, avatar: "MT" },
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

// ── Lead Generation Data ─────────────────────────────────────────────────────

const venueLeads = [
  { id: 1, name: "The Savoy", location: "London WC2", type: "5-Star Hotel", capacity: "800+", fbDirector: "Marcus Webb", email: "events@thesavoy.com", website: "thesavoy.com", score: 94, status: "hot", source: "Companies House", lastActivity: "New F&B director appointed Jan 2026", tags: ["Wedding", "Corporate", "Cocktail Bar"] },
  { id: 2, name: "Claridge's", location: "London W1", type: "5-Star Hotel", capacity: "500+", fbDirector: "Sarah Chen", email: "events@claridges.co.uk", website: "claridges.co.uk", score: 91, status: "hot", source: "LinkedIn", lastActivity: "Drinks menu refresh announced", tags: ["Luxury", "Private Dining", "Cocktail"] },
  { id: 3, name: "Soho House Group", location: "Multi-site", type: "Members Club", capacity: "Various", fbDirector: "Group Procurement", email: "partnerships@sohohouse.com", website: "sohohouse.com", score: 88, status: "warm", source: "Web Scrape", lastActivity: "3 new UK openings planned 2026", tags: ["Members", "Events", "Staffing"] },
  { id: 4, name: "The Ned", location: "London EC2", type: "Hotel / Members", capacity: "1000+", fbDirector: "Tom Richards", email: "events@thened.com", website: "thened.com", score: 85, status: "warm", source: "Companies House", lastActivity: "Multiple bars — seasonal rotation due", tags: ["Cocktail Bar", "Restaurant", "Events"] },
  { id: 5, name: "Sketch", location: "London W1", type: "Restaurant / Bar", capacity: "350", fbDirector: "Pierre Roux", email: "info@sketch.london", website: "sketch.london", score: 82, status: "new", source: "Instagram", lastActivity: "New menu launch imminent", tags: ["Luxury", "Cocktail", "Styling"] },
  { id: 6, name: "Chiltern Firehouse", location: "London W1", type: "Hotel / Restaurant", capacity: "250", fbDirector: "Operations Team", email: "events@chilternfirehouse.com", website: "chilternfirehouse.com", score: 80, status: "new", source: "Web Scrape", lastActivity: "Summer terrace programme", tags: ["Private Events", "Celebrity", "Cocktail"] },
  { id: 7, name: "Beaverbrook", location: "Surrey", type: "Country Estate", capacity: "400", fbDirector: "Events Dept", email: "events@beaverbrook.co.uk", website: "beaverbrook.co.uk", score: 78, status: "new", source: "Google", lastActivity: "Expanding wedding programme 2026", tags: ["Wedding", "Country", "Luxury"] },
  { id: 8, name: "Goodwood Estate", location: "West Sussex", type: "Estate / Events", capacity: "2000+", fbDirector: "Hospitality Director", email: "hospitality@goodwood.com", website: "goodwood.com", score: 76, status: "new", source: "Web Scrape", lastActivity: "Festival of Speed 2026 planning", tags: ["Festival", "Sports", "Hospitality"] },
  { id: 9, name: "The Berkeley", location: "London SW1", type: "5-Star Hotel", capacity: "350", fbDirector: "David Liu", email: "events@the-berkeley.co.uk", website: "the-berkeley.co.uk", score: 90, status: "hot", source: "LinkedIn", lastActivity: "Blue Bar concept refresh Q2", tags: ["Cocktail Bar", "Luxury", "Private"] },
  { id: 10, name: "Nobu Hotel Portman Square", location: "London W1", type: "Hotel / Restaurant", capacity: "300", fbDirector: "Guest Relations", email: "events@nobuhotels.com", website: "nobuhotels.com", score: 73, status: "warm", source: "Instagram", lastActivity: "Expanding cocktail programme", tags: ["Japanese", "Cocktail", "Corporate"] },
];

const brandLeads = [
  { id: 101, name: "Fever-Tree", type: "Mixer Brand", contact: "Marketing Dept", email: "partnerships@fever-tree.com", score: 92, status: "hot", source: "LinkedIn", opportunity: "Summer activation partnerships — festival season", revenue: "£25-40k", tags: ["Activation", "Festival", "Sampling"] },
  { id: 102, name: "William Grant & Sons", type: "Spirit Producer", contact: "Brand Team", email: "trade@wgrant.com", score: 89, status: "hot", source: "Industry Event", opportunity: "Hendrick's summer campaign — tender expected March", revenue: "£30-55k", tags: ["Brand Activation", "Trade", "Gin"] },
  { id: 103, name: "Carly Foxwell / Fox In The Well", type: "PR Agency", contact: "Carly Foxwell", email: "carly@foxinthewell.com", score: 95, status: "hot", source: "Network", opportunity: "Platform demo — data consultancy partnership", revenue: "£15-25k retainer", tags: ["Consultancy", "Data", "PR"] },
  { id: 104, name: "Campari Group UK", type: "Spirit Producer", contact: "UK Trade Team", email: "uktrade@campari.com", score: 84, status: "warm", source: "Web Scrape", opportunity: "Aperol Spritz summer activations — 40+ events", revenue: "£40-80k", tags: ["Activation", "Summer", "Staffing"] },
  { id: 105, name: "BrewDog", type: "Brewery", contact: "Events Manager", email: "events@brewdog.com", score: 77, status: "warm", source: "Instagram", opportunity: "Bar takeover experiences at flagship venues", revenue: "£10-20k", tags: ["Beer", "Takeover", "Events"] },
  { id: 106, name: "Rémy Cointreau", type: "Spirit Producer", contact: "Trade Advocacy", email: "advocacy@remycointreau.com", score: 86, status: "warm", source: "LinkedIn", opportunity: "Cointreau cocktail masterclass series", revenue: "£20-35k", tags: ["Masterclass", "Trade", "Cocktail"] },
  { id: 107, name: "Seedlip / Aecorn", type: "No/Low Spirits", contact: "Brand Manager", email: "partnerships@seedlipdrinks.com", score: 81, status: "new", source: "Web Scrape", opportunity: "Dry January 2027 campaign activation", revenue: "£15-25k", tags: ["No/Low", "Activation", "Wellness"] },
  { id: 108, name: "Bacardi-Martini UK", type: "Spirit Producer", contact: "On-Trade Team", email: "ontrade@bacardi.com", score: 88, status: "warm", source: "Network", opportunity: "Grey Goose summer terrace programme", revenue: "£35-60k", tags: ["Luxury", "Terrace", "Staffing"] },
];

const outreachCampaigns = [
  { name: "Q2 Venue Outreach", status: "active", sent: 48, opened: 31, replied: 12, meetings: 4, pipeline: "£85k" },
  { name: "Brand Activation Push", status: "active", sent: 35, opened: 24, replied: 8, meetings: 3, pipeline: "£120k" },
  { name: "Winter Wedding Drive", status: "paused", sent: 62, opened: 38, replied: 15, meetings: 6, pipeline: "£45k" },
  { name: "Festival Season 2026", status: "draft", sent: 0, opened: 0, replied: 0, meetings: 0, pipeline: "£0" },
];

// ── Reusable Components ────────────────────────────────────────────────────────

const GlassCard = ({ children, style = {}, hover = false, onClick }) => (
  <div onClick={onClick} style={{
    ...glassPanel,
    padding: "20px 24px",
    transition: "all 0.2s ease",
    cursor: onClick ? "pointer" : "default",
    ...(hover ? { ":hover": { background: C.glassHover } } : {}),
    ...style,
  }}>
    {children}
  </div>
);

const CopperBadge = ({ children }) => (
  <span style={{
    background: `linear-gradient(135deg, ${C.copperDim}, rgba(184,134,11,0.12))`,
    color: C.copperLight,
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    border: `1px solid rgba(200,117,51,0.15)`,
  }}>
    {children}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    hot: { bg: C.dangerDim, color: C.danger, border: "rgba(217,79,79,0.2)" },
    warm: { bg: C.warningDim, color: C.warning, border: "rgba(224,168,74,0.2)" },
    new: { bg: C.infoDim, color: C.info, border: "rgba(91,164,207,0.2)" },
    confirmed: { bg: C.successDim, color: C.success, border: "rgba(94,189,115,0.2)" },
    proposal: { bg: C.warningDim, color: C.warning, border: "rgba(224,168,74,0.2)" },
    lead: { bg: C.infoDim, color: C.info, border: "rgba(91,164,207,0.2)" },
    active: { bg: C.successDim, color: C.success, border: "rgba(94,189,115,0.2)" },
    paused: { bg: C.warningDim, color: C.warning, border: "rgba(224,168,74,0.2)" },
    draft: { bg: "rgba(255,255,255,0.04)", color: C.textMuted, border: "rgba(255,255,255,0.06)" },
    contacted: { bg: C.infoDim, color: C.info, border: "rgba(91,164,207,0.2)" },
  };
  const s = map[status] || map.new;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "2px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.5px",
    }}>
      {status}
    </span>
  );
};

const MetricCard = ({ label, value, change, icon, accent = false }) => (
  <div style={{
    ...glassPanel,
    padding: "18px 22px",
    flex: 1,
    minWidth: 170,
    position: "relative",
    overflow: "hidden",
  }}>
    {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.copper}, ${C.bronze})` }} />}
    <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
      {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
    </div>
    <div style={{ color: C.text, fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>{value}</div>
    {change !== undefined && (
      <div style={{ color: change >= 0 ? C.success : C.danger, fontSize: 11, marginTop: 6, fontWeight: 600 }}>
        {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs last period
      </div>
    )}
  </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
    <div>
      <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>{title}</h2>
      {subtitle && <p style={{ color: C.textSecondary, fontSize: 13, margin: "6px 0 0", lineHeight: 1.4 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const ScoreBar = ({ score, size = "md" }) => {
  const color = score >= 85 ? C.success : score >= 70 ? C.warning : C.textMuted;
  const h = size === "sm" ? 3 : 4;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: h, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ width: `${score}%`, height: h, background: color, borderRadius: 2 }} />
      </div>
      <span style={{ color, fontSize: 11, fontWeight: 700 }}>{score}</span>
    </div>
  );
};

const LeadTag = ({ tag }) => (
  <span style={{
    background: "rgba(255,255,255,0.04)",
    color: C.textSecondary,
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.3px",
    border: `1px solid ${C.border}`,
  }}>{tag}</span>
);

// ── Tooltip Styles ───────────────────────────────────────────────────────────
const tooltipStyle = {
  background: "rgba(15,15,18,0.95)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${C.borderLight}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 12,
  padding: "10px 14px",
};

// ── Page Components ────────────────────────────────────────────────────────────

const CommandCentre = () => {
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalProfit = revenueData.reduce((s, d) => s + d.profit, 0);
  const confirmedPipeline = pipelineEvents.filter(e => e.stage === "confirmed").reduce((s, e) => s + e.value, 0);
  const totalPipeline = pipelineEvents.reduce((s, e) => s + e.value, 0);
  const avgUtilisation = Math.round(teamMembers.reduce((s, t) => s + t.utilisation, 0) / teamMembers.length);

  return (
    <div>
      <SectionHeader title="Command Centre" subtitle="Real-time operational overview — revenue, pipeline, and team performance" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <MetricCard label="Annual Revenue" value={`£${(totalRevenue / 1000).toFixed(0)}k`} change={8.2} accent />
        <MetricCard label="Staffing Revenue" value="£500k" change={12.5} />
        <MetricCard label="Confirmed Pipeline" value={`£${(confirmedPipeline / 1000).toFixed(0)}k`} change={15} />
        <MetricCard label="Net Profit" value={`£${(totalProfit / 1000).toFixed(0)}k`} change={6.1} />
        <MetricCard label="Team Utilisation" value={`${avgUtilisation}%`} change={-3} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>Revenue vs Costs — Monthly</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="copperGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.copper} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.copper} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.danger} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" stroke={C.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={C.textMuted} fontSize={10} tickFormatter={v => `£${v / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`£${v.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="revenue" stroke={C.copper} fill="url(#copperGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="costs" stroke={C.danger} fill="url(#dangerGrad)" strokeWidth={1.5} name="Costs" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>Revenue by Service</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {serviceBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`£${(v / 1000).toFixed(0)}k`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
            {serviceBreakdown.map((s, i) => (
              <span key={i} style={{ fontSize: 10, color: C.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, display: "inline-block" }} />{s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Upcoming Confirmed Events</div>
          {pipelineEvents.filter(e => e.stage === "confirmed").slice(0, 4).map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{e.client}</div>
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{e.event} · {e.date}</div>
              </div>
              <div style={{ color: C.copper, fontSize: 15, fontWeight: 700 }}>£{(e.value / 1000).toFixed(0)}k</div>
            </div>
          ))}
        </div>

        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Team Utilisation</div>
          {teamMembers.map((t, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${C.copperDim}, rgba(184,134,11,0.08))`, border: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.copperLight }}>{t.avatar}</div>
                  <span style={{ color: C.text, fontSize: 12, fontWeight: 500 }}>{t.name}</span>
                </div>
                <span style={{ color: t.utilisation >= 70 ? C.success : t.utilisation >= 50 ? C.warning : C.danger, fontSize: 12, fontWeight: 700 }}>{t.utilisation}%</span>
              </div>
              <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2 }}>
                <div style={{ width: `${t.utilisation}%`, height: 3, borderRadius: 2, background: t.utilisation >= 70 ? C.success : t.utilisation >= 50 ? C.warning : C.danger, transition: "width 0.6s ease" }} />
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
  const stages = { confirmed: { label: "Confirmed", color: C.success }, proposal: { label: "Proposal", color: C.warning }, lead: { label: "Lead", color: C.info } };
  const filtered = filterStage === "all" ? pipelineEvents : pipelineEvents.filter(e => e.stage === filterStage);
  const stageValues = Object.entries(stages).map(([k, v]) => ({ stage: v.label, value: pipelineEvents.filter(e => e.stage === k).reduce((s, e) => s + e.value, 0), color: v.color, count: pipelineEvents.filter(e => e.stage === k).length }));

  return (
    <div>
      <SectionHeader title="Event Pipeline" subtitle="Track events from lead to confirmed — pipeline value and conversion" />

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {stageValues.map((s, i) => (
          <div key={i} style={{ ...glassPanel, flex: 1, padding: "18px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.6 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
              <span style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{s.stage}</span>
            </div>
            <div style={{ color: C.text, fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>£{(s.value / 1000).toFixed(0)}k</div>
            <div style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>{s.count} events</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "confirmed", "proposal", "lead"].map(s => (
          <button key={s} onClick={() => setFilterStage(s)} style={{
            background: filterStage === s ? `linear-gradient(135deg, ${C.copper}, ${C.bronze})` : "transparent",
            color: filterStage === s ? "#fff" : C.textSecondary,
            border: `1px solid ${filterStage === s ? "transparent" : C.glassBorder}`,
            borderRadius: 8, padding: "7px 16px", fontSize: 11, fontWeight: 700,
            cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.3px",
            transition: "all 0.2s ease",
          }}>
            {s === "all" ? "All Events" : s}
          </button>
        ))}
      </div>

      <div style={{ ...glassPanel, overflow: "hidden", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Client", "Event", "Type", "Date", "Value", "Stage"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "14px 18px", color: C.textMuted, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}>
                <td style={{ padding: "14px 18px", color: C.text, fontSize: 13, fontWeight: 600 }}>{e.client}</td>
                <td style={{ padding: "14px 18px", color: C.textSecondary, fontSize: 12 }}>{e.event}</td>
                <td style={{ padding: "14px 18px" }}><CopperBadge>{e.type}</CopperBadge></td>
                <td style={{ padding: "14px 18px", color: C.textSecondary, fontSize: 12 }}>{e.date}</td>
                <td style={{ padding: "14px 18px", color: C.copper, fontSize: 13, fontWeight: 700 }}>£{e.value.toLocaleString()}</td>
                <td style={{ padding: "14px 18px" }}><StatusBadge status={e.stage} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Lead Generation Module ──────────────────────────────────────────────────

const LeadGeneration = () => {
  const [tab, setTab] = useState("venues");
  const [searchTerm, setSearchTerm] = useState("");

  const leads = tab === "venues" ? venueLeads : brandLeads;
  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.tags && l.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const hotLeads = leads.filter(l => l.status === "hot").length;
  const warmLeads = leads.filter(l => l.status === "warm").length;
  const totalLeads = leads.length;

  return (
    <div>
      <SectionHeader
        title="Lead Generation"
        subtitle="Automated B2B pipeline — venue discovery and brand outreach engine"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: `linear-gradient(135deg, ${C.copper}, ${C.bronze})`, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px" }}>
              + Run Scraper
            </button>
            <button style={{ background: "transparent", color: C.textSecondary, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "8px 18px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Export CSV
            </button>
          </div>
        }
      />

      {/* Outreach Campaign Stats */}
      <div style={{ ...glassPanel, padding: "18px 24px", marginBottom: 24 }}>
        <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Active Outreach Campaigns</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {outreachCampaigns.map((c, i) => (
            <div key={i} style={{ ...glassPanelStrong, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                <StatusBadge status={c.status} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                <div><span style={{ color: C.textMuted }}>Sent:</span> <span style={{ color: C.text, fontWeight: 600 }}>{c.sent}</span></div>
                <div><span style={{ color: C.textMuted }}>Opened:</span> <span style={{ color: C.text, fontWeight: 600 }}>{c.opened}</span></div>
                <div><span style={{ color: C.textMuted }}>Replied:</span> <span style={{ color: C.success, fontWeight: 600 }}>{c.replied}</span></div>
                <div><span style={{ color: C.textMuted }}>Meetings:</span> <span style={{ color: C.copper, fontWeight: 600 }}>{c.meetings}</span></div>
              </div>
              <div style={{ marginTop: 8, color: C.copper, fontSize: 13, fontWeight: 700 }}>Pipeline: {c.pipeline}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Metrics */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <MetricCard label="Total Leads" value={totalLeads} accent />
        <MetricCard label="Hot Leads" value={hotLeads} />
        <MetricCard label="Warm Leads" value={warmLeads} />
        <MetricCard label="Conversion Rate" value="24%" change={5.2} />
        <MetricCard label="Pipeline Value" value="£250k" change={18} />
      </div>

      {/* Tab + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ key: "venues", label: "Venues" }, { key: "brands", label: "Brands & Agencies" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearchTerm(""); }} style={{
              background: tab === t.key ? `linear-gradient(135deg, ${C.copper}, ${C.bronze})` : "transparent",
              color: tab === t.key ? "#fff" : C.textSecondary,
              border: `1px solid ${tab === t.key ? "transparent" : C.glassBorder}`,
              borderRadius: 8, padding: "8px 20px", fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${C.glassBorder}`,
            borderRadius: 8,
            padding: "8px 14px",
            color: C.text,
            fontSize: 12,
            width: 220,
            outline: "none",
          }}
        />
      </div>

      {/* Lead Table */}
      <div style={{ ...glassPanel, overflow: "hidden", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {tab === "venues"
                ? ["Name", "Location", "Type", "Score", "Status", "Source", "Tags"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "14px 16px", color: C.textMuted, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px" }}>{h}</th>
                  ))
                : ["Name", "Type", "Opportunity", "Est. Revenue", "Score", "Status", "Tags"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "14px 16px", color: C.textMuted, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px" }}>{h}</th>
                  ))
              }
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                {tab === "venues" ? (
                  <>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                      <div style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{l.lastActivity}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: C.textSecondary, fontSize: 12 }}>{l.location}</td>
                    <td style={{ padding: "14px 16px" }}><CopperBadge>{l.type}</CopperBadge></td>
                    <td style={{ padding: "14px 16px" }}><ScoreBar score={l.score} /></td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={l.status} /></td>
                    <td style={{ padding: "14px 16px", color: C.textSecondary, fontSize: 11 }}>{l.source}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{l.tags.slice(0, 2).map((t, i) => <LeadTag key={i} tag={t} />)}</div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                      <div style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{l.contact}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><CopperBadge>{l.type}</CopperBadge></td>
                    <td style={{ padding: "14px 16px", color: C.textSecondary, fontSize: 12, maxWidth: 200 }}>{l.opportunity}</td>
                    <td style={{ padding: "14px 16px", color: C.copper, fontSize: 13, fontWeight: 700 }}>{l.revenue}</td>
                    <td style={{ padding: "14px 16px" }}><ScoreBar score={l.score} /></td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={l.status} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{l.tags.slice(0, 2).map((t, i) => <LeadTag key={i} tag={t} />)}</div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TimeUtilisation = () => {
  const totalBillable = timeTrackingData.reduce((s, d) => s + d.billable, 0);
  const totalNonBillable = timeTrackingData.reduce((s, d) => s + d.nonBillable, 0);
  const ratio = Math.round((totalBillable / (totalBillable + totalNonBillable)) * 100);

  return (
    <div>
      <SectionHeader title="Time & Utilisation" subtitle="Billable vs non-billable tracking — team efficiency and resource allocation" />

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <MetricCard label="Billable Hours (Month)" value={totalBillable} change={4.5} accent />
        <MetricCard label="Non-Billable Hours" value={totalNonBillable} change={-2.1} />
        <MetricCard label="Billable Ratio" value={`${ratio}%`} change={3.2} />
        <MetricCard label="Revenue / Billable Hr" value="£68" change={7.1} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>Weekly Hours Breakdown</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeTrackingData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="week" stroke={C.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={C.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="billable" fill={C.copper} radius={[4, 4, 0, 0]} name="Billable" />
              <Bar dataKey="nonBillable" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} name="Non-Billable" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>Individual Utilisation</div>
          {teamMembers.map((t, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${C.copperDim}, rgba(184,134,11,0.08))`, border: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.copperLight }}>{t.avatar}</div>
                  <div>
                    <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: C.textMuted, fontSize: 10 }}>{t.role}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                <span style={{ color: C.copper }}>Billable: {t.billableHrs}h</span>
                <span style={{ color: C.textMuted }}>·</span>
                <span style={{ color: C.textMuted }}>Non-billable: {t.nonBillableHrs}h</span>
              </div>
              <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginTop: 6 }}>
                <div style={{ width: `${t.utilisation}%`, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${C.copper}, ${C.copperLight})`, transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...glassPanel, padding: "20px 24px" }}>
        <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Recommendation</div>
        <div style={{ ...glassPanelStrong, padding: "16px 20px", borderLeft: `3px solid ${C.copper}` }}>
          <p style={{ color: C.text, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Jason's utilisation is at <strong style={{ color: C.danger }}>38%</strong> — predominantly non-billable admin hours. Recommend reallocating Jason and Joe toward active lead follow-up during Q1 trough, leveraging the automated pipeline to convert warm leads to confirmed bookings for Q2/Q3 season.
          </p>
        </div>
      </div>
    </div>
  );
};

const FinancialHub = () => {
  const totalSubs = subscriptions.reduce((s, sub) => s + sub.annual, 0);
  const integratedSubs = subscriptions.filter(s => s.integrated);
  const savingsEstimate = integratedSubs.reduce((s, sub) => s + sub.annual, 0);

  return (
    <div>
      <SectionHeader title="Financial Hub" subtitle="SaaS consolidation, subscription tracking, and cost analysis" />

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <MetricCard label="Annual SaaS Spend" value={`£${(totalSubs / 1000).toFixed(1)}k`} accent />
        <MetricCard label="Monthly Total" value={`£${subscriptions.reduce((s, sub) => s + sub.cost, 0)}`} />
        <MetricCard label="Platforms" value={subscriptions.length} />
        <MetricCard label="Integration Savings" value={`£${(savingsEstimate / 1000).toFixed(1)}k`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>Staffing Revenue — Monthly</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={staffingRevenue}>
              <defs>
                <linearGradient id="staffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.copper} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={C.copper} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" stroke={C.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={C.textMuted} fontSize={10} tickFormatter={v => `£${v / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`£${v.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="amount" stroke={C.copper} fill="url(#staffGrad)" strokeWidth={2} name="Staffing Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...glassPanel, padding: "20px 24px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>Seasonal Risk</div>
          <div style={{ ...glassPanelStrong, padding: "14px 16px", marginBottom: 10, borderLeft: `3px solid ${C.danger}` }}>
            <div style={{ color: C.danger, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>February — Loss Month</div>
            <div style={{ color: C.textSecondary, fontSize: 11, lineHeight: 1.4 }}>Revenue £18k vs fixed costs £26k. Net loss of -£8k. Lead gen module active to build Q2 pipeline.</div>
          </div>
          <div style={{ ...glassPanelStrong, padding: "14px 16px", marginBottom: 10, borderLeft: `3px solid ${C.warning}` }}>
            <div style={{ color: C.warning, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>March — Breakeven Risk</div>
            <div style={{ color: C.textSecondary, fontSize: 11, lineHeight: 1.4 }}>Revenue £25k vs costs £25k. Critical to convert pipeline leads to confirmed Q2 events.</div>
          </div>
          <div style={{ ...glassPanelStrong, padding: "14px 16px", borderLeft: `3px solid ${C.success}` }}>
            <div style={{ color: C.success, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Peak Season: Jun-Aug</div>
            <div style={{ color: C.textSecondary, fontSize: 11, lineHeight: 1.4 }}>Combined revenue £290k. Festival season and brand activation peak. 88 events executed.</div>
          </div>
        </div>
      </div>

      <div style={{ ...glassPanel, overflow: "hidden", padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>SaaS Stack — Integration Status</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Platform", "Category", "Monthly", "Annual", "Status", "Integrated"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 18px", color: C.textMuted, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 18px", color: C.text, fontSize: 13, fontWeight: 600 }}>{sub.name}</td>
                <td style={{ padding: "12px 18px" }}><CopperBadge>{sub.category}</CopperBadge></td>
                <td style={{ padding: "12px 18px", color: C.textSecondary, fontSize: 12 }}>£{sub.cost}</td>
                <td style={{ padding: "12px 18px", color: C.copper, fontSize: 13, fontWeight: 700 }}>£{sub.annual.toLocaleString()}</td>
                <td style={{ padding: "12px 18px" }}><StatusBadge status={sub.status} /></td>
                <td style={{ padding: "12px 18px" }}>
                  {sub.integrated ? (
                    <span style={{ color: C.success, fontSize: 11, fontWeight: 700 }}>● Connected</span>
                  ) : (
                    <span style={{ color: C.textMuted, fontSize: 11 }}>○ Standalone</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: C.textSecondary, fontSize: 12 }}>Total annual SaaS cost</span>
          <span style={{ color: C.copper, fontSize: 14, fontWeight: 700 }}>£{totalSubs.toLocaleString()}</span>
        </div>
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
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I've queried the platform data. Based on current Scoro project budgets and StaffWise timesheet exports, I can see that the information you're requesting requires a live API connection. This demo shows the RAG architecture that will power real-time queries against your Xero financials, Scoro projects, and StaffWise labour data."
      }]);
    }, 800);
  };

  return (
    <div>
      <SectionHeader title="AI Assistant" subtitle="RAG-powered intelligence — query financials, projects, and team data in natural language" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...glassPanel, padding: "18px 22px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12 }}>Data Sources Connected</div>
          {[
            { name: "Scoro", desc: "Projects, CRM, Quotes", status: "live" },
            { name: "StaffWise", desc: "Timesheets, Shifts, Payroll", status: "live" },
            { name: "Xero", desc: "Invoices, Expenses, Bank", status: "live" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: C.textMuted, fontSize: 11 }}>{s.desc}</div>
              </div>
              <span style={{ color: C.success, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block" }} />
                LIVE
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...glassPanel, padding: "18px 22px" }}>
          <div style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12 }}>Example Queries</div>
          {[
            "What were our non-billable hours in February?",
            "Show profit margin on the Glenmorangie project",
            "Which leads have the highest conversion potential?",
            "What's our outstanding invoice total this month?",
          ].map((q, i) => (
            <div key={i} onClick={() => setInput(q)} style={{
              padding: "10px 14px", marginBottom: 6, borderRadius: 8,
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
              color: C.textSecondary, fontSize: 12, cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {q}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...glassPanel, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ color: C.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>Conversation</span>
        </div>
        <div style={{ padding: "16px 24px", maxHeight: 320, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: m.role === "user" ? `linear-gradient(135deg, ${C.copperDim}, rgba(184,134,11,0.08))` : "rgba(255,255,255,0.04)",
                border: `1px solid ${m.role === "user" ? "rgba(200,117,51,0.2)" : C.glassBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
                color: m.role === "user" ? C.copperLight : C.textSecondary,
              }}>
                {m.role === "user" ? "JS" : "AI"}
              </div>
              <div style={{
                ...glassPanelStrong,
                padding: "12px 16px", flex: 1,
                borderLeft: m.role === "assistant" ? `2px solid ${C.copper}` : "none",
              }}>
                <div style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>{m.content}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Ask about your business data..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            style={{
              flex: 1, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`,
              borderRadius: 8, padding: "10px 16px", color: C.text, fontSize: 13, outline: "none",
            }}
          />
          <button onClick={handleSend} style={{
            background: `linear-gradient(135deg, ${C.copper}, ${C.bronze})`,
            color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main App ─────────────────────────────────────────────────────────────────

const navItems = [
  { key: "command", label: "Command Centre", icon: "◉" },
  { key: "pipeline", label: "Event Pipeline", icon: "◈" },
  { key: "leads", label: "Lead Generation", icon: "◎" },
  { key: "time", label: "Time & Utilisation", icon: "◐" },
  { key: "finance", label: "Financial Hub", icon: "◆" },
  { key: "ai", label: "AI Assistant", icon: "◇" },
];

export default function App() {
  const [page, setPage] = useState("command");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "command": return <CommandCentre />;
      case "pipeline": return <EventPipeline />;
      case "leads": return <LeadGeneration />;
      case "time": return <TimeUtilisation />;
      case "finance": return <FinancialHub />;
      case "ai": return <AIAssistant />;
      default: return <CommandCentre />;
    }
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      color: C.text,
    }}>
      {/* Global CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${C.bg}; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        ::selection { background: ${C.copperDim}; color: ${C.text}; }
        input::placeholder { color: ${C.textMuted}; }
        table tr:hover { background: rgba(255,255,255,0.015); }
        button:hover { opacity: 0.9; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 240,
        background: C.bgDeep,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <HHTLogo size={36} />
            <div>
              <div style={{ color: C.text, fontSize: 14, fontWeight: 700, letterSpacing: "-0.3px" }}>Heads, Hearts</div>
              <div style={{ color: C.copperLight, fontSize: 11, fontWeight: 600, letterSpacing: "0.5px" }}>& TAILS</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                marginBottom: 2,
                background: page === item.key ? `linear-gradient(135deg, ${C.copperDim}, rgba(184,134,11,0.06))` : "transparent",
                border: page === item.key ? `1px solid rgba(200,117,51,0.15)` : "1px solid transparent",
                borderRadius: 8,
                color: page === item.key ? C.copperLight : C.textSecondary,
                fontSize: 12,
                fontWeight: page === item.key ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                letterSpacing: "0.1px",
              }}
            >
              <span style={{ fontSize: 14, opacity: page === item.key ? 1 : 0.5 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.copperDim}, rgba(184,134,11,0.08))`,
              border: `1px solid rgba(200,117,51,0.15)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: C.copperLight,
            }}>JS</div>
            <div>
              <div style={{ color: C.text, fontSize: 11, fontWeight: 600 }}>Joe Stokoe</div>
              <div style={{ color: C.textMuted, fontSize: 10 }}>Director</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 240, flex: 1, minHeight: "100vh" }}>
        {/* Top Bar */}
        <div style={{
          padding: "14px 32px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(6,6,8,0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: C.textMuted, fontSize: 12 }}>
              {time.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ color: C.border }}>·</span>
            <span style={{ color: C.textMuted, fontSize: 12 }}>
              {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success }} />
              <span style={{ color: C.textSecondary, fontSize: 11 }}>3 APIs Connected</span>
            </div>
            <CopperBadge>Ghost Operator v2.0</CopperBadge>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: "28px 32px" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
