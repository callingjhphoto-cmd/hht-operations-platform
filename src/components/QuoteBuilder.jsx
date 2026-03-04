import { useState, useMemo, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Quote / Proposal Builder
// Full-featured quoting module with create, edit, preview,
// status management, duplication, and localStorage persistence.
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
const F = {
  serif: "'Georgia','Times New Roman',serif",
  sans: "'Inter',-apple-system,'Segoe UI',sans-serif",
  mono: "'SF Mono','Fira Code',monospace",
};

const STORAGE_KEY = "hht_quotes_v1";

// ── Status definitions ──────────────────────────────────────
const STATUSES = {
  draft: { label: "Draft", color: C.inkMuted, bg: C.bgWarm },
  sent: { label: "Sent", color: C.info, bg: C.infoBg },
  accepted: { label: "Accepted", color: C.success, bg: C.successBg },
  declined: { label: "Declined", color: C.danger, bg: C.dangerBg },
  expired: { label: "Expired", color: C.warn, bg: C.warnBg },
};

// ── Event types ─────────────────────────────────────────────
const EVENT_TYPES = [
  "Cocktail Bar Hire",
  "Masterclass",
  "Brand Activation",
  "Wedding Bar",
  "Corporate Event",
  "Festival Bar",
  "Pop-up Bar",
];

// ── Service templates ───────────────────────────────────────
const SERVICE_TEMPLATES = {
  "Cocktail Bar Hire": [
    { description: "Mobile bar setup", quantity: 1, unitPrice: 450 },
    { description: "Bartender (per person)", quantity: 1, unitPrice: 35 },
    { description: "Premium spirits package (per head)", quantity: 1, unitPrice: 12 },
    { description: "Glassware & equipment", quantity: 1, unitPrice: 150 },
  ],
  Masterclass: [
    { description: "Masterclass facilitation", quantity: 1, unitPrice: 650 },
    { description: "Ingredients per person", quantity: 1, unitPrice: 18 },
    { description: "Equipment hire", quantity: 1, unitPrice: 120 },
  ],
  "Brand Activation": [
    { description: "Brand activation setup", quantity: 1, unitPrice: 1200 },
    { description: "Experiential staff (per day)", quantity: 1, unitPrice: 250 },
    { description: "Branded materials", quantity: 1, unitPrice: 350 },
    { description: "Social media coverage", quantity: 1, unitPrice: 200 },
  ],
};

// ── Helper ──────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const fmt = (v) => "£" + Number(v || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const blankLine = () => ({ id: uid(), description: "", quantity: 1, unitPrice: 0 });

const blankQuote = () => ({
  id: uid(),
  status: "draft",
  createdAt: new Date().toISOString(),
  client: { name: "", email: "", company: "", phone: "" },
  event: { type: EVENT_TYPES[0], date: "", venue: "", guestCount: 50 },
  lineItems: [blankLine()],
  discountType: "percent",
  discountValue: 0,
  vatEnabled: true,
  notes: "Payment terms: 50% deposit upon acceptance, balance due 7 days before the event.\n\nThis quote is valid for 30 days from the date of issue.\n\nAll prices are subject to availability.",
});

// ── Seed data ───────────────────────────────────────────────
const seedQuotes = () => [
  {
    id: "q001", status: "accepted", createdAt: "2026-01-15T10:30:00Z",
    client: { name: "Sarah Whitfield", email: "sarah@elmsbank.co.uk", company: "Elmsbank Hotels", phone: "07700 112233" },
    event: { type: "Wedding Bar", date: "2026-06-21", venue: "Elmsbank Manor, Yorkshire", guestCount: 120 },
    lineItems: [
      { id: "s1a", description: "Mobile bar setup", quantity: 1, unitPrice: 450 },
      { id: "s1b", description: "Bartender (per person)", quantity: 120, unitPrice: 35 },
      { id: "s1c", description: "Premium spirits package (per head)", quantity: 120, unitPrice: 12 },
      { id: "s1d", description: "Glassware & equipment", quantity: 1, unitPrice: 150 },
      { id: "s1e", description: "Floral bar decoration", quantity: 1, unitPrice: 280 },
    ],
    discountType: "percent", discountValue: 5, vatEnabled: true,
    notes: "Bespoke cocktail menu agreed with bride & groom. Setup by 14:00, service 16:00–23:00.",
  },
  {
    id: "q002", status: "sent", createdAt: "2026-02-20T14:00:00Z",
    client: { name: "James Cartwright", email: "james@fenwicknewcastle.co.uk", company: "Fenwick Newcastle", phone: "07800 445566" },
    event: { type: "Brand Activation", date: "2026-04-10", venue: "Fenwick Newcastle, NE1", guestCount: 200 },
    lineItems: [
      { id: "s2a", description: "Brand activation setup", quantity: 1, unitPrice: 1200 },
      { id: "s2b", description: "Experiential staff (per day)", quantity: 2, unitPrice: 250 },
      { id: "s2c", description: "Branded materials", quantity: 1, unitPrice: 350 },
      { id: "s2d", description: "Social media coverage", quantity: 1, unitPrice: 200 },
      { id: "s2e", description: "Premium cocktail service (per head)", quantity: 200, unitPrice: 8 },
    ],
    discountType: "fixed", discountValue: 200, vatEnabled: true,
    notes: "Two-day activation in-store. Branded HH&T bar with Fenwick colour palette.",
  },
  {
    id: "q003", status: "draft", createdAt: "2026-03-01T09:15:00Z",
    client: { name: "Lisa Crawford", email: "lisa.crawford@deloitte.co.uk", company: "Deloitte UK", phone: "07900 778899" },
    event: { type: "Corporate Event", date: "2026-05-15", venue: "One Embankment, London", guestCount: 80 },
    lineItems: [
      { id: "s3a", description: "Mobile bar setup", quantity: 1, unitPrice: 450 },
      { id: "s3b", description: "Bartender (per person)", quantity: 80, unitPrice: 35 },
      { id: "s3c", description: "Premium spirits package (per head)", quantity: 80, unitPrice: 12 },
      { id: "s3d", description: "Glassware & equipment", quantity: 1, unitPrice: 150 },
    ],
    discountType: "percent", discountValue: 0, vatEnabled: true,
    notes: "Post-conference networking drinks. Require non-alcoholic cocktail options.",
  },
  {
    id: "q004", status: "declined", createdAt: "2026-01-28T11:45:00Z",
    client: { name: "Tom Brennan", email: "tom@brennanweddings.com", company: "Brennan & Co", phone: "07700 334455" },
    event: { type: "Masterclass", date: "2026-03-20", venue: "The Biscuit Factory, Newcastle", guestCount: 24 },
    lineItems: [
      { id: "s4a", description: "Masterclass facilitation", quantity: 1, unitPrice: 650 },
      { id: "s4b", description: "Ingredients per person", quantity: 24, unitPrice: 18 },
      { id: "s4c", description: "Equipment hire", quantity: 1, unitPrice: 120 },
    ],
    discountType: "percent", discountValue: 10, vatEnabled: true,
    notes: "Team-building masterclass for 24 guests. Client opted for a different vendor.",
  },
  {
    id: "q005", status: "expired", createdAt: "2025-11-10T16:00:00Z",
    client: { name: "Amelia Foster", email: "amelia@festivalrepublic.co.uk", company: "Festival Republic", phone: "07800 667788" },
    event: { type: "Festival Bar", date: "2026-07-18", venue: "Latitude Festival, Suffolk", guestCount: 500 },
    lineItems: [
      { id: "s5a", description: "Festival bar build & installation", quantity: 1, unitPrice: 3500 },
      { id: "s5b", description: "Bar staff (per day)", quantity: 12, unitPrice: 180 },
      { id: "s5c", description: "Spirits & mixers stock package", quantity: 1, unitPrice: 4200 },
      { id: "s5d", description: "Refrigeration & equipment hire", quantity: 1, unitPrice: 800 },
    ],
    discountType: "percent", discountValue: 0, vatEnabled: true,
    notes: "3-day festival bar. Quote expired — client did not respond within 30-day window.",
  },
  {
    id: "q006", status: "accepted", createdAt: "2026-02-05T08:30:00Z",
    client: { name: "Rachel Kim", email: "rachel@poptapldn.com", company: "Pop Tap London", phone: "07900 112244" },
    event: { type: "Pop-up Bar", date: "2026-04-25", venue: "Boxpark Shoreditch, London", guestCount: 150 },
    lineItems: [
      { id: "s6a", description: "Pop-up bar structure & branding", quantity: 1, unitPrice: 950 },
      { id: "s6b", description: "Bartenders (per day)", quantity: 3, unitPrice: 220 },
      { id: "s6c", description: "Cocktail menu development", quantity: 1, unitPrice: 300 },
      { id: "s6d", description: "Ingredients & spirits (per head)", quantity: 150, unitPrice: 10 },
    ],
    discountType: "fixed", discountValue: 150, vatEnabled: true,
    notes: "Weekend pop-up Fri–Sun. Bespoke neon signage included in bar structure cost.",
  },
];

// ── Load / save ─────────────────────────────────────────────
const loadQuotes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const seeds = seedQuotes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
  return seeds;
};

const saveQuotes = (quotes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
};

// ═══════════════════════════════════════════════════════════════
// Shared style helpers
// ═══════════════════════════════════════════════════════════════
const btnBase = {
  fontFamily: F.sans, fontSize: 13, fontWeight: 600, border: "none",
  borderRadius: 6, cursor: "pointer", transition: "all 0.15s ease",
  display: "inline-flex", alignItems: "center", gap: 6,
};
const btnPrimary = {
  ...btnBase, background: C.accent, color: "#fff", padding: "9px 18px",
};
const btnSecondary = {
  ...btnBase, background: C.bgWarm, color: C.ink, padding: "8px 16px",
  border: `1px solid ${C.border}`,
};
const btnDanger = {
  ...btnBase, background: C.dangerBg, color: C.danger, padding: "8px 16px",
  border: `1px solid ${C.danger}22`,
};
const btnSmall = { ...btnBase, padding: "5px 12px", fontSize: 12 };
const inputStyle = {
  fontFamily: F.sans, fontSize: 14, padding: "9px 12px", borderRadius: 6,
  border: `1px solid ${C.border}`, background: C.card, color: C.ink,
  outline: "none", width: "100%", boxSizing: "border-box",
  transition: "border-color 0.15s",
};
const labelStyle = {
  fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: C.inkSec,
  marginBottom: 4, display: "block", letterSpacing: "0.3px",
  textTransform: "uppercase",
};
const cardStyle = {
  background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
  padding: 24, marginBottom: 20,
};

// ═══════════════════════════════════════════════════════════════
// StatusBadge
// ═══════════════════════════════════════════════════════════════
function StatusBadge({ status }) {
  const s = STATUSES[status] || STATUSES.draft;
  return (
    <span style={{
      fontFamily: F.sans, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.5px", padding: "4px 10px", borderRadius: 20,
      color: s.color, background: s.bg, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// calcTotals
// ═══════════════════════════════════════════════════════════════
function calcTotals(lineItems, discountType, discountValue, vatEnabled) {
  const subtotal = lineItems.reduce((sum, li) => sum + (li.quantity || 0) * (li.unitPrice || 0), 0);
  const discount = discountType === "percent"
    ? subtotal * (Math.min(Math.max(discountValue || 0, 0), 100) / 100)
    : Math.min(Math.max(discountValue || 0, 0), subtotal);
  const afterDiscount = subtotal - discount;
  const vat = vatEnabled ? afterDiscount * 0.2 : 0;
  const grandTotal = afterDiscount + vat;
  return { subtotal, discount, afterDiscount, vat, grandTotal };
}

// ═══════════════════════════════════════════════════════════════
// QuoteListView
// ═══════════════════════════════════════════════════════════════
function QuoteListView({ quotes, onEdit, onPreview, onDuplicate, onDelete, onCreate, statusFilter, setStatusFilter, searchTerm, setSearchTerm }) {
  const filtered = useMemo(() => {
    let q = [...quotes];
    if (statusFilter !== "all") q = q.filter((x) => x.status === statusFilter);
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      q = q.filter((x) =>
        x.client.name.toLowerCase().includes(s) ||
        x.client.company.toLowerCase().includes(s) ||
        x.event.type.toLowerCase().includes(s) ||
        x.id.toLowerCase().includes(s)
      );
    }
    q.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return q;
  }, [quotes, statusFilter, searchTerm]);

  const totals = useMemo(() => {
    const all = quotes.length;
    const byStatus = {};
    Object.keys(STATUSES).forEach((k) => { byStatus[k] = 0; });
    let totalValue = 0;
    let acceptedValue = 0;
    quotes.forEach((q) => {
      byStatus[q.status] = (byStatus[q.status] || 0) + 1;
      const t = calcTotals(q.lineItems, q.discountType, q.discountValue, q.vatEnabled);
      totalValue += t.grandTotal;
      if (q.status === "accepted") acceptedValue += t.grandTotal;
    });
    return { all, byStatus, totalValue, acceptedValue };
  }, [quotes]);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Quotes", value: totals.all, color: C.ink },
          { label: "Pipeline Value", value: fmt(totals.totalValue), color: C.accent },
          { label: "Accepted Value", value: fmt(totals.acceptedValue), color: C.success },
          { label: "Accepted", value: totals.byStatus.accepted, color: C.success },
          { label: "Sent", value: totals.byStatus.sent, color: C.info },
          { label: "Drafts", value: totals.byStatus.draft, color: C.inkMuted },
        ].map((c, i) => (
          <div key={i} style={{ ...cardStyle, padding: 16, marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 20 }}>
        <button onClick={onCreate} style={btnPrimary}>+ New Quote</button>
        <div style={{ flex: 1 }} />
        <input
          type="text" placeholder="Search clients, companies..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, width: 240, fontSize: 13 }}
        />
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: 140, fontSize: 13, cursor: "pointer" }}
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.sans, fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bgWarm }}>
              {["Ref", "Client", "Event Type", "Event Date", "Status", "Total", "Created", "Actions"].map((h) => (
                <th key={h} style={{
                  padding: "12px 14px", textAlign: "left", fontWeight: 700, fontSize: 11,
                  textTransform: "uppercase", letterSpacing: "0.4px", color: C.inkSec,
                  borderBottom: `2px solid ${C.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.inkMuted, fontStyle: "italic" }}>
                  No quotes found.
                </td>
              </tr>
            ) : filtered.map((q, idx) => {
              const t = calcTotals(q.lineItems, q.discountType, q.discountValue, q.vatEnabled);
              return (
                <tr key={q.id} style={{
                  background: idx % 2 === 0 ? C.card : C.accentSubtle,
                  transition: "background 0.12s",
                  cursor: "pointer",
                }} onMouseEnter={(e) => { e.currentTarget.style.background = C.cardHover; }}
                   onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? C.card : C.accentSubtle; }}>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                    <span style={{ fontFamily: F.mono, fontSize: 12, color: C.accent }}>{q.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontWeight: 600, color: C.ink }}>{q.client.name || "—"}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted }}>{q.client.company}</div>
                  </td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, color: C.inkSec }}>{q.event.type}</td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, color: C.inkSec }}>{fmtDate(q.event.date)}</td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}` }}><StatusBadge status={q.status} /></td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, fontWeight: 700, fontFamily: F.mono, color: C.ink }}>{fmt(t.grandTotal)}</td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, color: C.inkMuted, fontSize: 12 }}>{fmtDate(q.createdAt)}</td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(q.id); }} style={{ ...btnSmall, background: C.accentSubtle, color: C.accent }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); onPreview(q.id); }} style={{ ...btnSmall, background: C.infoBg, color: C.info }}>View</button>
                      <button onClick={(e) => { e.stopPropagation(); onDuplicate(q.id); }} style={{ ...btnSmall, background: C.bgWarm, color: C.inkSec }}>Dup</button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(q.id); }} style={{ ...btnSmall, background: C.dangerBg, color: C.danger }}>Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QuoteForm (Create / Edit)
// ═══════════════════════════════════════════════════════════════
function QuoteForm({ quote, onSave, onCancel }) {
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(quote)));

  const updateClient = useCallback((field, value) => {
    setForm((f) => ({ ...f, client: { ...f.client, [field]: value } }));
  }, []);

  const updateEvent = useCallback((field, value) => {
    setForm((f) => ({ ...f, event: { ...f.event, [field]: value } }));
  }, []);

  const updateLineItem = useCallback((id, field, value) => {
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.map((li) => li.id === id ? { ...li, [field]: field === "description" ? value : Number(value) || 0 } : li),
    }));
  }, []);

  const addLineItem = useCallback(() => {
    setForm((f) => ({ ...f, lineItems: [...f.lineItems, blankLine()] }));
  }, []);

  const removeLineItem = useCallback((id) => {
    setForm((f) => ({ ...f, lineItems: f.lineItems.length > 1 ? f.lineItems.filter((li) => li.id !== id) : f.lineItems }));
  }, []);

  const applyTemplate = useCallback((templateName) => {
    const tpl = SERVICE_TEMPLATES[templateName];
    if (!tpl) return;
    const items = tpl.map((t) => ({ ...t, id: uid() }));
    setForm((f) => ({ ...f, lineItems: items }));
  }, []);

  const totals = useMemo(() => calcTotals(form.lineItems, form.discountType, form.discountValue, form.vatEnabled), [form.lineItems, form.discountType, form.discountValue, form.vatEnabled]);

  const handleSave = useCallback(() => {
    onSave(form);
  }, [form, onSave]);

  const fieldGroup = (label, children) => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onCancel} style={btnSecondary}>← Back</button>
        <h2 style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, margin: 0 }}>
          {quote.client.name ? `Edit Quote — ${quote.client.name}` : "New Quote"}
        </h2>
        <div style={{ flex: 1 }} />
        <StatusBadge status={form.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* LEFT COLUMN */}
        <div>
          {/* Client Details */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, color: C.ink, margin: "0 0 16px", borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 10 }}>Client Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {fieldGroup("Client Name", <input style={inputStyle} value={form.client.name} onChange={(e) => updateClient("name", e.target.value)} placeholder="Full name" />)}
              {fieldGroup("Email", <input style={inputStyle} type="email" value={form.client.email} onChange={(e) => updateClient("email", e.target.value)} placeholder="email@example.com" />)}
              {fieldGroup("Company", <input style={inputStyle} value={form.client.company} onChange={(e) => updateClient("company", e.target.value)} placeholder="Company name" />)}
              {fieldGroup("Phone", <input style={inputStyle} value={form.client.phone} onChange={(e) => updateClient("phone", e.target.value)} placeholder="07xxx xxxxxx" />)}
            </div>
          </div>

          {/* Event Details */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, color: C.ink, margin: "0 0 16px", borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 10 }}>Event Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {fieldGroup("Event Type",
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.event.type} onChange={(e) => updateEvent("type", e.target.value)}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              {fieldGroup("Event Date", <input style={inputStyle} type="date" value={form.event.date} onChange={(e) => updateEvent("date", e.target.value)} />)}
              {fieldGroup("Venue", <input style={inputStyle} value={form.event.venue} onChange={(e) => updateEvent("venue", e.target.value)} placeholder="Venue name & location" />)}
              {fieldGroup("Guest Count", <input style={inputStyle} type="number" min={1} value={form.event.guestCount} onChange={(e) => updateEvent("guestCount", parseInt(e.target.value) || 0)} />)}
            </div>
          </div>

          {/* Line Items */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 10 }}>
              <h3 style={{ fontFamily: F.serif, fontSize: 16, color: C.ink, margin: 0 }}>Line Items</h3>
              <div style={{ flex: 1 }} />
              {Object.keys(SERVICE_TEMPLATES).map((tpl) => (
                <button key={tpl} onClick={() => applyTemplate(tpl)} style={{ ...btnSmall, background: C.accentSubtle, color: C.accent, fontSize: 11 }}>
                  + {tpl}
                </button>
              ))}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.sans, fontSize: 13 }}>
              <thead>
                <tr>
                  {["Description", "Qty", "Unit Price", "Subtotal", ""].map((h, i) => (
                    <th key={i} style={{
                      padding: "8px 10px", textAlign: i > 0 && i < 4 ? "right" : "left",
                      fontWeight: 700, fontSize: 11, textTransform: "uppercase",
                      letterSpacing: "0.3px", color: C.inkMuted, borderBottom: `1px solid ${C.border}`,
                      width: i === 0 ? "auto" : i === 4 ? 40 : 110,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.lineItems.map((li) => (
                  <tr key={li.id}>
                    <td style={{ padding: "6px 4px" }}>
                      <input style={{ ...inputStyle, fontSize: 13, padding: "7px 10px" }} value={li.description} onChange={(e) => updateLineItem(li.id, "description", e.target.value)} placeholder="Service description" />
                    </td>
                    <td style={{ padding: "6px 4px" }}>
                      <input style={{ ...inputStyle, fontSize: 13, padding: "7px 10px", textAlign: "right" }} type="number" min={0} value={li.quantity} onChange={(e) => updateLineItem(li.id, "quantity", e.target.value)} />
                    </td>
                    <td style={{ padding: "6px 4px" }}>
                      <input style={{ ...inputStyle, fontSize: 13, padding: "7px 10px", textAlign: "right" }} type="number" min={0} step="0.01" value={li.unitPrice} onChange={(e) => updateLineItem(li.id, "unitPrice", e.target.value)} />
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: F.mono, fontWeight: 600, color: C.ink }}>
                      {fmt(li.quantity * li.unitPrice)}
                    </td>
                    <td style={{ padding: "6px 4px", textAlign: "center" }}>
                      <button onClick={() => removeLineItem(li.id)} style={{ ...btnSmall, background: "transparent", color: C.danger, padding: "4px 8px", fontSize: 16, lineHeight: 1 }} title="Remove line">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addLineItem} style={{ ...btnSecondary, marginTop: 12, fontSize: 12 }}>+ Add Line Item</button>
          </div>

          {/* Notes */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, color: C.ink, margin: "0 0 12px", borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 10 }}>Notes &amp; Terms</h3>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.5 }}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Payment terms, special requirements, etc."
            />
          </div>
        </div>

        {/* RIGHT COLUMN — Summary */}
        <div>
          <div style={{ ...cardStyle, position: "sticky", top: 20 }}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, color: C.ink, margin: "0 0 18px", borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 10 }}>Quote Summary</h3>

            {/* Discount */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Discount</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  style={{ ...inputStyle, width: 100, fontSize: 13, cursor: "pointer" }}
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                >
                  <option value="percent">%</option>
                  <option value="fixed">£ Fixed</option>
                </select>
                <input
                  style={{ ...inputStyle, width: 90, fontSize: 13, textAlign: "right" }}
                  type="number" min={0} step="0.01"
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* VAT toggle */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ ...labelStyle, margin: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox" checked={form.vatEnabled}
                  onChange={(e) => setForm((f) => ({ ...f, vatEnabled: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: C.accent }}
                />
                VAT (20%)
              </label>
            </div>

            {/* Totals */}
            <div style={{ borderTop: `2px solid ${C.border}`, paddingTop: 14 }}>
              {[
                { label: "Subtotal", value: fmt(totals.subtotal) },
                totals.discount > 0 && { label: `Discount${form.discountType === "percent" ? ` (${form.discountValue}%)` : ""}`, value: `−${fmt(totals.discount)}`, color: C.danger },
                form.vatEnabled && { label: "VAT (20%)", value: fmt(totals.vat) },
              ].filter(Boolean).map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontFamily: F.sans, fontSize: 14, color: row.color || C.inkSec }}>
                  <span>{row.label}</span>
                  <span style={{ fontFamily: F.mono }}>{row.value}</span>
                </div>
              ))}
              <div style={{
                display: "flex", justifyContent: "space-between", padding: "14px 0 0",
                marginTop: 8, borderTop: `2px solid ${C.accent}`,
                fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: C.ink,
              }}>
                <span>Grand Total</span>
                <span style={{ color: C.accent }}>{fmt(totals.grandTotal)}</span>
              </div>
            </div>

            {/* Save / Cancel */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={handleSave} style={{ ...btnPrimary, flex: 1, justifyContent: "center" }}>Save Quote</button>
              <button onClick={onCancel} style={{ ...btnSecondary }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QuotePreview (professional client-facing view)
// ═══════════════════════════════════════════════════════════════
function QuotePreview({ quote, onBack, onStatusChange, onEdit, onDuplicate }) {
  const totals = useMemo(() => calcTotals(quote.lineItems, quote.discountType, quote.discountValue, quote.vatEnabled), [quote]);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={btnSecondary}>← Back to Quotes</button>
        <button onClick={() => onEdit(quote.id)} style={{ ...btnSecondary, color: C.accent }}>Edit</button>
        <button onClick={() => onDuplicate(quote.id)} style={{ ...btnSecondary, color: C.inkSec }}>Duplicate</button>
        <div style={{ flex: 1 }} />
        {quote.status === "draft" && (
          <button onClick={() => onStatusChange(quote.id, "sent")} style={{ ...btnPrimary, background: C.info }}>Mark as Sent</button>
        )}
        {quote.status === "sent" && (
          <>
            <button onClick={() => onStatusChange(quote.id, "accepted")} style={{ ...btnPrimary, background: C.success }}>Accept</button>
            <button onClick={() => onStatusChange(quote.id, "declined")} style={btnDanger}>Decline</button>
          </>
        )}
        {(quote.status === "declined" || quote.status === "expired") && (
          <button onClick={() => onStatusChange(quote.id, "draft")} style={{ ...btnSecondary, color: C.accent }}>Reopen as Draft</button>
        )}
        {quote.status === "accepted" && (
          <button onClick={() => onStatusChange(quote.id, "draft")} style={{ ...btnSecondary, color: C.warn }}>Revert to Draft</button>
        )}
      </div>

      {/* Preview card */}
      <div style={{
        background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
        padding: 48, maxWidth: 820, margin: "0 auto",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, borderBottom: `3px solid ${C.accent}`, paddingBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: F.serif, fontSize: 30, color: C.accent, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              Heads, Hearts &amp; Tails
            </h1>
            <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkMuted, margin: 0, letterSpacing: "0.3px" }}>
              Premium Cocktail Events
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, margin: "0 0 8px" }}>Quote</h2>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: C.inkMuted }}>Ref: {quote.id.slice(0, 8).toUpperCase()}</div>
            <div style={{ fontFamily: F.sans, fontSize: 12, color: C.inkMuted, marginTop: 4 }}>Date: {fmtDate(quote.createdAt)}</div>
            <div style={{ marginTop: 6 }}><StatusBadge status={quote.status} /></div>
          </div>
        </div>

        {/* Client & Event info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
          <div>
            <h3 style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: C.inkMuted, marginBottom: 10 }}>Prepared For</h3>
            <div style={{ fontFamily: F.serif, fontSize: 17, color: C.ink, fontWeight: 700, marginBottom: 4 }}>{quote.client.name}</div>
            {quote.client.company && <div style={{ fontFamily: F.sans, fontSize: 14, color: C.inkSec, marginBottom: 2 }}>{quote.client.company}</div>}
            {quote.client.email && <div style={{ fontFamily: F.sans, fontSize: 13, color: C.inkMuted }}>{quote.client.email}</div>}
            {quote.client.phone && <div style={{ fontFamily: F.sans, fontSize: 13, color: C.inkMuted }}>{quote.client.phone}</div>}
          </div>
          <div>
            <h3 style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: C.inkMuted, marginBottom: 10 }}>Event Details</h3>
            <div style={{ fontFamily: F.sans, fontSize: 14, color: C.ink, marginBottom: 4 }}><strong>Type:</strong> {quote.event.type}</div>
            <div style={{ fontFamily: F.sans, fontSize: 14, color: C.ink, marginBottom: 4 }}><strong>Date:</strong> {fmtDate(quote.event.date)}</div>
            <div style={{ fontFamily: F.sans, fontSize: 14, color: C.ink, marginBottom: 4 }}><strong>Venue:</strong> {quote.event.venue || "TBC"}</div>
            <div style={{ fontFamily: F.sans, fontSize: 14, color: C.ink }}><strong>Guests:</strong> {quote.event.guestCount}</div>
          </div>
        </div>

        {/* Line items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.sans, fontSize: 13, marginBottom: 28 }}>
          <thead>
            <tr>
              {["Service", "Qty", "Unit Price", "Amount"].map((h, i) => (
                <th key={h} style={{
                  padding: "10px 12px", textAlign: i === 0 ? "left" : "right",
                  fontWeight: 700, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.4px", color: C.inkMuted,
                  borderBottom: `2px solid ${C.accent}`, background: C.accentSubtle,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((li, idx) => (
              <tr key={li.id} style={{ background: idx % 2 === 0 ? "transparent" : C.accentSubtle }}>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, color: C.ink }}>{li.description}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", color: C.inkSec }}>{li.quantity}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", fontFamily: F.mono, color: C.inkSec }}>{fmt(li.unitPrice)}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", fontFamily: F.mono, fontWeight: 600, color: C.ink }}>{fmt(li.quantity * li.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 300 }}>
            {[
              { label: "Subtotal", value: fmt(totals.subtotal) },
              totals.discount > 0 && {
                label: `Discount${quote.discountType === "percent" ? ` (${quote.discountValue}%)` : ""}`,
                value: `−${fmt(totals.discount)}`, color: C.danger,
              },
              quote.vatEnabled && { label: "VAT (20%)", value: fmt(totals.vat) },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "8px 0",
                fontFamily: F.sans, fontSize: 14, color: row.color || C.inkSec,
                borderBottom: `1px solid ${C.borderLight}`,
              }}>
                <span>{row.label}</span>
                <span style={{ fontFamily: F.mono }}>{row.value}</span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between", padding: "16px 0 0",
              marginTop: 4, borderTop: `3px solid ${C.accent}`,
              fontFamily: F.serif, fontSize: 22, fontWeight: 700,
            }}>
              <span style={{ color: C.ink }}>Grand Total</span>
              <span style={{ color: C.accent }}>{fmt(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div style={{ marginTop: 36, padding: 20, background: C.bgWarm, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
            <h4 style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: C.inkMuted, marginTop: 0, marginBottom: 10 }}>Terms &amp; Notes</h4>
            <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{quote.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${C.borderLight}`, textAlign: "center" }}>
          <p style={{ fontFamily: F.serif, fontSize: 14, color: C.accent, margin: "0 0 4px", fontStyle: "italic" }}>
            Heads, Hearts &amp; Tails — Premium Cocktail Experiences
          </p>
          <p style={{ fontFamily: F.sans, fontSize: 11, color: C.inkMuted, margin: 0 }}>
            hello@headsheartsandtails.com &nbsp;|&nbsp; headsheartsandtails.com &nbsp;|&nbsp; @haboretails
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export default function QuoteBuilder() {
  const [quotes, setQuotes] = useState(loadQuotes);
  const [view, setView] = useState("list");           // list | edit | preview
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Persist on every change
  useEffect(() => { saveQuotes(quotes); }, [quotes]);

  const activeQuote = useMemo(() => quotes.find((q) => q.id === activeQuoteId) || null, [quotes, activeQuoteId]);

  // ── Actions ──────────────────────────────────────────────
  const handleCreate = useCallback(() => {
    const nq = blankQuote();
    setQuotes((prev) => [nq, ...prev]);
    setActiveQuoteId(nq.id);
    setView("edit");
  }, []);

  const handleEdit = useCallback((id) => {
    setActiveQuoteId(id);
    setView("edit");
  }, []);

  const handlePreview = useCallback((id) => {
    setActiveQuoteId(id);
    setView("preview");
  }, []);

  const handleSave = useCallback((updated) => {
    setQuotes((prev) => prev.map((q) => q.id === updated.id ? { ...updated } : q));
    setActiveQuoteId(updated.id);
    setView("preview");
  }, []);

  const handleDuplicate = useCallback((id) => {
    setQuotes((prev) => {
      const orig = prev.find((q) => q.id === id);
      if (!orig) return prev;
      const dup = {
        ...JSON.parse(JSON.stringify(orig)),
        id: uid(),
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      dup.lineItems = dup.lineItems.map((li) => ({ ...li, id: uid() }));
      return [dup, ...prev];
    });
  }, []);

  const handleDelete = useCallback((id) => {
    if (!window.confirm("Delete this quote? This cannot be undone.")) return;
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    if (activeQuoteId === id) {
      setView("list");
      setActiveQuoteId(null);
    }
  }, [activeQuoteId]);

  const handleStatusChange = useCallback((id, newStatus) => {
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status: newStatus } : q));
  }, []);

  const handleBack = useCallback(() => {
    setView("list");
    setActiveQuoteId(null);
  }, []);

  return (
    <div style={{ fontFamily: F.sans, background: C.bg, minHeight: "100vh", padding: 32, color: C.ink }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 28, color: C.ink, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
          Quote Builder
        </h1>
        <p style={{ fontFamily: F.sans, fontSize: 14, color: C.inkMuted, margin: 0 }}>
          Create, manage and send professional proposals to clients
        </p>
      </div>

      {view === "list" && (
        <QuoteListView
          quotes={quotes}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onCreate={handleCreate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      {view === "edit" && activeQuote && (
        <QuoteForm
          key={activeQuote.id}
          quote={activeQuote}
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}

      {view === "preview" && activeQuote && (
        <QuotePreview
          key={activeQuote.id}
          quote={activeQuote}
          onBack={handleBack}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
        />
      )}
    </div>
  );
}
