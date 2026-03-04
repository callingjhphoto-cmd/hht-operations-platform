import { useState, useMemo, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Invoicing & Payments Module
// Heads, Hearts & Tails — Premium Cocktail Events
// Full invoice lifecycle: Draft → Sent → Viewed → Paid / Overdue
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

const STORAGE_KEY = "hht_invoices_v1";

const COMPANY = {
  name: "Heads, Hearts & Tails Ltd",
  tagline: "Premium Cocktail Events",
  address1: "123 Old Street",
  address2: "London EC1V 9BD",
  companyNo: "12345678",
  vat: "GB123456789",
  email: "accounts@headsandheartsandtails.co.uk",
  phone: "+44 (0)20 7123 4567",
};

const VAT_RATE = 0.2;

const STATUS_CONFIG = {
  Draft:     { color: C.inkMuted,    bg: C.bgWarm,    label: "Draft" },
  Sent:      { color: C.info,        bg: C.infoBg,    label: "Sent" },
  Viewed:    { color: C.accentLight, bg: C.accentSubtle, label: "Viewed" },
  Paid:      { color: C.success,     bg: C.successBg, label: "Paid" },
  Overdue:   { color: C.danger,      bg: C.dangerBg,  label: "Overdue" },
  Cancelled: { color: C.inkMuted,    bg: "#F0F0EE",   label: "Cancelled" },
};

const PAYMENT_TERMS = [
  { value: 7, label: "Net 7 (7 days)" },
  { value: 14, label: "Net 14 (14 days)" },
  { value: 30, label: "Net 30 (30 days)" },
  { value: "deposit", label: "50% Deposit Upfront" },
];

const PAYMENT_METHODS = ["Bank Transfer", "Card", "Cash", "Cheque"];

// ── Helpers ──────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isoDate(d) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

function daysBetween(a, b) {
  const d1 = new Date(a); const d2 = new Date(b);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function daysOverdue(dueDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function fmtCurrency(v) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(v);
}

function genInvoiceNumber(existingInvoices) {
  const year = new Date().getFullYear();
  const existing = existingInvoices
    .map(i => i.invoiceNumber)
    .filter(n => n.startsWith(`HHT-${year}-`))
    .map(n => parseInt(n.split("-")[2], 10))
    .filter(n => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `HHT-${year}-${String(next).padStart(3, "0")}`;
}

function calcLineTotal(item) {
  return (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
}

function calcInvoiceTotals(items) {
  const subtotal = items.reduce((s, i) => s + calcLineTotal(i), 0);
  const vat = subtotal * VAT_RATE;
  return { subtotal, vat, total: subtotal + vat };
}

// ── Seed Data ───────────────────────────────────────────────

function buildSeedData() {
  const now = new Date();
  const d = (offset) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + offset);
    return isoDate(dt);
  };

  return [
    {
      id: "inv_001", invoiceNumber: "HHT-2025-001", status: "Paid",
      client: { name: "Rothschild & Co", email: "events@rothschild.com", address: "1 King William St, London EC4N 7AR" },
      eventName: "Annual Gala Dinner", dateIssued: "2025-01-15", dateDue: "2025-02-14",
      datePaid: "2025-02-10", paymentMethod: "Bank Transfer", paymentRef: "BACS-09812",
      items: [
        { description: "Premium cocktail bar service (6 hours)", qty: 1, unitPrice: 3500 },
        { description: "Bespoke cocktail menu design", qty: 1, unitPrice: 450 },
        { description: "Additional bartender", qty: 2, unitPrice: 280 },
      ],
      paymentTerms: 30, notes: "Thank you for your continued partnership.",
    },
    {
      id: "inv_002", invoiceNumber: "HHT-2025-002", status: "Paid",
      client: { name: "Soho House Group", email: "accounts@sohohouse.com", address: "76 Dean St, London W1D 3SQ" },
      eventName: "Members' Cocktail Masterclass", dateIssued: "2025-02-01", dateDue: "2025-02-15",
      datePaid: "2025-02-14", paymentMethod: "Card", paymentRef: "CARD-4421",
      items: [
        { description: "Cocktail masterclass (2 sessions x 20 guests)", qty: 2, unitPrice: 1800 },
        { description: "Premium spirit package", qty: 1, unitPrice: 650 },
      ],
      paymentTerms: 14, notes: "",
    },
    {
      id: "inv_003", invoiceNumber: "HHT-2025-003", status: "Paid",
      client: { name: "Deloitte UK", email: "procurement@deloitte.co.uk", address: "1 New Street Square, London EC4A 3HQ" },
      eventName: "Partner Away Day", dateIssued: "2025-02-20", dateDue: "2025-03-22",
      datePaid: "2025-03-18", paymentMethod: "Bank Transfer", paymentRef: "BACS-11204",
      items: [
        { description: "Mobile cocktail bar hire (full day)", qty: 1, unitPrice: 4200 },
        { description: "Non-alcoholic cocktail station", qty: 1, unitPrice: 1200 },
        { description: "Setup and breakdown crew", qty: 4, unitPrice: 180 },
      ],
      paymentTerms: 30, notes: "PO Ref: DEL-2025-0892",
    },
    {
      id: "inv_004", invoiceNumber: "HHT-2025-004", status: "Overdue",
      client: { name: "Blenheim Palace Events", email: "events@blenheimpalace.com", address: "Blenheim Palace, Woodstock OX20 1PP" },
      eventName: "Summer Garden Party", dateIssued: "2025-04-01", dateDue: d(-45),
      items: [
        { description: "Outdoor cocktail garden (8 hours)", qty: 1, unitPrice: 5800 },
        { description: "Vintage Citroen bar van hire", qty: 1, unitPrice: 1500 },
        { description: "Staff (mixologists)", qty: 6, unitPrice: 320 },
        { description: "Glassware hire (300 guests)", qty: 300, unitPrice: 2.50 },
      ],
      paymentTerms: 30, notes: "Please remit payment at your earliest convenience.",
    },
    {
      id: "inv_005", invoiceNumber: "HHT-2025-005", status: "Overdue",
      client: { name: "Claridge's Hotel", email: "finance@claridges.co.uk", address: "Brook St, London W1K 4HR" },
      eventName: "NYE Rooftop Celebration", dateIssued: "2025-05-10", dateDue: d(-20),
      items: [
        { description: "Premium cocktail service (midnight package)", qty: 1, unitPrice: 8500 },
        { description: "Champagne cocktail tower", qty: 2, unitPrice: 1200 },
      ],
      paymentTerms: 30, notes: "",
    },
    {
      id: "inv_006", invoiceNumber: "HHT-2025-006", status: "Sent",
      client: { name: "Goldman Sachs International", email: "ap@gs.com", address: "Plumtree Court, 25 Shoe Ln, London EC4A 4AU" },
      eventName: "Q3 Client Entertainment", dateIssued: d(-10), dateDue: d(20),
      items: [
        { description: "Executive cocktail experience (4 hours)", qty: 1, unitPrice: 3200 },
        { description: "Sommelier consultation", qty: 1, unitPrice: 500 },
        { description: "Premium garnish & ice package", qty: 1, unitPrice: 380 },
      ],
      paymentTerms: 30, notes: "Invoice to be directed to AP department.",
    },
    {
      id: "inv_007", invoiceNumber: "HHT-2025-007", status: "Viewed",
      client: { name: "The Savoy", email: "purchasing@thesavoy.com", address: "Strand, London WC2R 0EZ" },
      eventName: "Art Deco Cocktail Evening", dateIssued: d(-5), dateDue: d(9),
      items: [
        { description: "Themed cocktail experience (1920s)", qty: 1, unitPrice: 4600 },
        { description: "Period costume hire for staff", qty: 8, unitPrice: 85 },
        { description: "Ice sculpture centrepiece", qty: 1, unitPrice: 750 },
      ],
      paymentTerms: 14, notes: "Costumes to be returned within 48 hours of event.",
    },
    {
      id: "inv_008", invoiceNumber: "HHT-2025-008", status: "Draft",
      client: { name: "Burberry Group", email: "events@burberry.com", address: "Horseferry House, London SW1P 2AW" },
      eventName: "Fashion Week After-Party", dateIssued: d(0), dateDue: d(7),
      items: [
        { description: "Fashion-forward cocktail menu curation", qty: 1, unitPrice: 1200 },
        { description: "Pop-up cocktail bar installation", qty: 1, unitPrice: 3800 },
        { description: "Brand-coloured cocktails (per 100)", qty: 5, unitPrice: 420 },
      ],
      paymentTerms: 7, notes: "Awaiting final guest count confirmation.",
    },
    {
      id: "inv_009", invoiceNumber: "HHT-2025-009", status: "Draft",
      client: { name: "Wimbledon AELTC", email: "hospitality@wimbledon.com", address: "Church Rd, London SW19 5AE" },
      eventName: "Champions Hospitality Suite", dateIssued: d(0), dateDue: d(30),
      items: [
        { description: "Pimm's & cocktail bar (5 days)", qty: 5, unitPrice: 2800 },
        { description: "Staff team (per day)", qty: 5, unitPrice: 960 },
        { description: "Premium spirit stock", qty: 1, unitPrice: 3200 },
      ],
      paymentTerms: 30, notes: "Multi-day event. Rates subject to final scheduling.",
    },
    {
      id: "inv_010", invoiceNumber: "HHT-2025-010", status: "Sent",
      client: { name: "Harvey Nichols", email: "events@harveynichols.com", address: "109-125 Knightsbridge, London SW1X 7RJ" },
      eventName: "VIP Shopping Evening", dateIssued: d(-3), dateDue: d(11),
      items: [
        { description: "In-store cocktail service (3 hours)", qty: 1, unitPrice: 2200 },
        { description: "Branded cocktail napkins (500)", qty: 1, unitPrice: 180 },
      ],
      paymentTerms: 14, notes: "",
    },
    {
      id: "inv_011", invoiceNumber: "HHT-2025-011", status: "Cancelled",
      client: { name: "Battersea Power Station", email: "events@bpsdc.com", address: "Circus Rd West, London SW11 8AL" },
      eventName: "Rooftop Launch Event (Cancelled)", dateIssued: "2025-03-15", dateDue: "2025-04-14",
      items: [
        { description: "Rooftop cocktail bar setup", qty: 1, unitPrice: 6000 },
        { description: "DJ & entertainment liaison", qty: 1, unitPrice: 800 },
      ],
      paymentTerms: 30, notes: "Event cancelled by client. No charges applied.",
    },
    {
      id: "inv_012", invoiceNumber: "HHT-2025-012", status: "Paid",
      client: { name: "Fortnum & Mason", email: "events@fortnumandmason.co.uk", address: "181 Piccadilly, London W1A 1ER" },
      eventName: "Tea & Cocktails Launch", dateIssued: "2025-03-01", dateDue: "2025-03-08",
      datePaid: "2025-03-07", paymentMethod: "Card", paymentRef: "CARD-7891",
      items: [
        { description: "Tea-infused cocktail menu development", qty: 1, unitPrice: 900 },
        { description: "Launch event bartending (4 hours)", qty: 1, unitPrice: 1800 },
        { description: "Premium tea spirit selection", qty: 1, unitPrice: 550 },
      ],
      paymentTerms: 7, notes: "",
    },
  ];
}

// ── Styles ───────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100vh", background: C.bg, fontFamily: F.sans,
    color: C.ink, padding: "32px 40px",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    marginBottom: 32, borderBottom: `1px solid ${C.border}`, paddingBottom: 24,
  },
  h1: { fontFamily: F.serif, fontSize: 28, fontWeight: 400, margin: 0, color: C.ink, letterSpacing: "-0.5px" },
  subtitle: { fontFamily: F.sans, fontSize: 14, color: C.inkMuted, marginTop: 4 },
  row: { display: "flex", gap: 16, flexWrap: "wrap" },
  statCard: {
    flex: "1 1 200px", background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "20px 24px", minWidth: 180,
  },
  statLabel: { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: C.inkMuted, marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: 600, fontFamily: F.mono, color: C.ink },
  statSub: { fontSize: 12, color: C.inkSec, marginTop: 4 },
  card: {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: 24, marginTop: 24,
  },
  cardTitle: { fontFamily: F.serif, fontSize: 20, fontWeight: 400, margin: "0 0 16px 0" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: {
    textAlign: "left", padding: "10px 12px", borderBottom: `2px solid ${C.border}`,
    fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px",
    color: C.inkMuted, whiteSpace: "nowrap",
  },
  td: { padding: "12px 12px", borderBottom: `1px solid ${C.borderLight}`, verticalAlign: "middle" },
  badge: (config) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 12,
    fontSize: 11, fontWeight: 600, color: config.color, background: config.bg,
    letterSpacing: "0.3px",
  }),
  overdueBadge: {
    display: "inline-block", padding: "2px 8px", borderRadius: 10,
    fontSize: 10, fontWeight: 700, color: C.danger, background: C.dangerBg,
    marginLeft: 6,
  },
  btn: (variant = "primary") => ({
    padding: variant === "sm" ? "6px 12px" : "10px 20px",
    borderRadius: 6, border: "none", cursor: "pointer", fontFamily: F.sans,
    fontSize: variant === "sm" ? 12 : 14, fontWeight: 600, transition: "all 0.15s",
    ...(variant === "primary" ? { background: C.accent, color: "#fff" } : {}),
    ...(variant === "secondary" ? { background: C.bgWarm, color: C.ink, border: `1px solid ${C.border}` } : {}),
    ...(variant === "danger" ? { background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}33` } : {}),
    ...(variant === "success" ? { background: C.successBg, color: C.success, border: `1px solid ${C.success}33` } : {}),
    ...(variant === "ghost" ? { background: "transparent", color: C.inkSec, padding: "6px 10px" } : {}),
    ...(variant === "sm" ? { background: C.bgWarm, color: C.inkSec, border: `1px solid ${C.border}` } : {}),
    ...(variant === "warn" ? { background: C.warnBg, color: C.warn, border: `1px solid ${C.warn}33` } : {}),
  }),
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 6,
    border: `1px solid ${C.border}`, fontFamily: F.sans, fontSize: 14,
    color: C.ink, background: C.card, outline: "none", boxSizing: "border-box",
  },
  select: {
    padding: "10px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
    fontFamily: F.sans, fontSize: 14, color: C.ink, background: C.card,
    outline: "none", cursor: "pointer",
  },
  textarea: {
    width: "100%", padding: "10px 12px", borderRadius: 6,
    border: `1px solid ${C.border}`, fontFamily: F.sans, fontSize: 14,
    color: C.ink, background: C.card, outline: "none", boxSizing: "border-box",
    resize: "vertical", minHeight: 80,
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" },
  fieldGroup: { marginBottom: 16 },
  modal: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: 20,
  },
  modalContent: {
    background: C.card, borderRadius: 12, padding: 32, maxWidth: 700,
    width: "100%", maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  tabs: { display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${C.border}` },
  tab: (active) => ({
    padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 500,
    color: active ? C.accent : C.inkMuted, borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
    background: "none", border: "none", fontFamily: F.sans, transition: "all 0.15s",
    marginBottom: -1,
  }),
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function InvoiceManager() {
  // ── State ──────────────────────────────────────────────────

  const [invoices, setInvoices] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* use seed */ }
    return buildSeedData();
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [reminderSent, setReminderSent] = useState({});

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices)); } catch (e) { /* silent */ }
  }, [invoices]);

  // ── Computed Stats ─────────────────────────────────────────

  const stats = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalOutstanding = 0;
    let overdueAmount = 0;
    let paidThisMonth = 0;
    let daysToPay = [];

    invoices.forEach(inv => {
      const totals = calcInvoiceTotals(inv.items);
      if (["Sent", "Viewed", "Overdue"].includes(inv.status)) {
        totalOutstanding += totals.total;
      }
      if (inv.status === "Overdue" || (["Sent", "Viewed"].includes(inv.status) && new Date(inv.dateDue) < now)) {
        overdueAmount += totals.total;
      }
      if (inv.status === "Paid" && inv.datePaid) {
        const paidDate = new Date(inv.datePaid);
        if (paidDate >= monthStart && paidDate <= now) {
          paidThisMonth += totals.total;
        }
        daysToPay.push(daysBetween(inv.dateIssued, inv.datePaid));
      }
    });

    const avgDaysToPay = daysToPay.length > 0
      ? Math.round(daysToPay.reduce((a, b) => a + b, 0) / daysToPay.length)
      : 0;

    return { totalOutstanding, overdueAmount, paidThisMonth, avgDaysToPay };
  }, [invoices]);

  // ── Filtered Invoices ──────────────────────────────────────

  const filteredInvoices = useMemo(() => {
    let list = [...invoices];

    // Auto-update overdue status
    const now = new Date(); now.setHours(0, 0, 0, 0);
    list = list.map(inv => {
      if (["Sent", "Viewed"].includes(inv.status) && new Date(inv.dateDue) < now) {
        return { ...inv, status: "Overdue" };
      }
      return inv;
    });

    if (statusFilter !== "All") {
      list = list.filter(i => i.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(i =>
        i.invoiceNumber.toLowerCase().includes(term) ||
        i.client.name.toLowerCase().includes(term) ||
        i.eventName.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued));
    return list;
  }, [invoices, statusFilter, searchTerm]);

  // ── Actions ────────────────────────────────────────────────

  const updateInvoice = useCallback((id, updates) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  }, []);

  const deleteInvoice = useCallback((id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  }, []);

  const addInvoice = useCallback((invoice) => {
    setInvoices(prev => [...prev, invoice]);
    setShowCreateForm(false);
  }, []);

  const recordPayment = useCallback((id, paymentData) => {
    updateInvoice(id, {
      status: "Paid",
      datePaid: paymentData.datePaid,
      paymentMethod: paymentData.method,
      paymentRef: paymentData.reference,
    });
    setPaymentModal(null);
  }, [updateInvoice]);

  const sendReminder = useCallback((id) => {
    setReminderSent(prev => ({ ...prev, [id]: new Date().toISOString() }));
    // In a real app, this would trigger an email
    alert("Payment reminder sent successfully.");
  }, []);

  const markAsSent = useCallback((id) => {
    updateInvoice(id, { status: "Sent" });
  }, [updateInvoice]);

  const exportCSV = useCallback(() => {
    const headers = ["Invoice Number", "Client", "Event", "Status", "Date Issued", "Date Due", "Subtotal", "VAT", "Total", "Date Paid", "Payment Method", "Payment Ref"];
    const rows = invoices.map(inv => {
      const t = calcInvoiceTotals(inv.items);
      return [
        inv.invoiceNumber, inv.client.name, inv.eventName, inv.status,
        inv.dateIssued, inv.dateDue, t.subtotal.toFixed(2), t.vat.toFixed(2),
        t.total.toFixed(2), inv.datePaid || "", inv.paymentMethod || "", inv.paymentRef || "",
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `hht-invoices-${isoDate(new Date())}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [invoices]);

  // ── Render: Dashboard Stats ────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={S.row}>
        <div style={S.statCard}>
          <div style={S.statLabel}>Total Outstanding</div>
          <div style={{ ...S.statValue, color: C.accent }}>{fmtCurrency(stats.totalOutstanding)}</div>
          <div style={S.statSub}>Across all unpaid invoices</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Overdue Amount</div>
          <div style={{ ...S.statValue, color: stats.overdueAmount > 0 ? C.danger : C.success }}>
            {fmtCurrency(stats.overdueAmount)}
          </div>
          <div style={S.statSub}>{stats.overdueAmount > 0 ? "Requires attention" : "All current"}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Paid This Month</div>
          <div style={{ ...S.statValue, color: C.success }}>{fmtCurrency(stats.paidThisMonth)}</div>
          <div style={S.statSub}>{new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Avg Days to Pay</div>
          <div style={S.statValue}>{stats.avgDaysToPay}</div>
          <div style={S.statSub}>Based on paid invoices</div>
        </div>
      </div>

      {/* Overdue Alerts */}
      {(() => {
        const overdueList = invoices.filter(i => i.status === "Overdue" || (["Sent", "Viewed"].includes(i.status) && new Date(i.dateDue) < new Date()));
        if (overdueList.length === 0) return null;
        return (
          <div style={{ ...S.card, borderLeft: `4px solid ${C.danger}`, marginTop: 24 }}>
            <h3 style={{ ...S.cardTitle, color: C.danger, margin: "0 0 12px 0", fontSize: 16 }}>
              Overdue Invoices ({overdueList.length})
            </h3>
            {overdueList.map(inv => {
              const t = calcInvoiceTotals(inv.items);
              const days = daysOverdue(inv.dateDue);
              return (
                <div key={inv.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: `1px solid ${C.borderLight}`,
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontFamily: F.mono, fontSize: 13 }}>{inv.invoiceNumber}</span>
                    <span style={{ color: C.inkSec, marginLeft: 12 }}>{inv.client.name}</span>
                    <span style={{ color: C.inkMuted, marginLeft: 12, fontSize: 13 }}>{inv.eventName}</span>
                    <span style={S.overdueBadge}>{days} days overdue</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontFamily: F.mono, color: C.danger }}>{fmtCurrency(t.total)}</span>
                    <button
                      style={S.btn("warn")}
                      onClick={() => sendReminder(inv.id)}
                      disabled={!!reminderSent[inv.id]}
                    >
                      {reminderSent[inv.id] ? "Reminder Sent" : "Send Reminder"}
                    </button>
                    <button style={S.btn("success")} onClick={() => setPaymentModal(inv)}>
                      Record Payment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Recent Activity */}
      <div style={{ ...S.card, marginTop: 24 }}>
        <h3 style={S.cardTitle}>Recent Invoices</h3>
        {renderInvoiceTable(invoices.slice().sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued)).slice(0, 5))}
      </div>
    </div>
  );

  // ── Render: Invoice Table ──────────────────────────────────

  const renderInvoiceTable = (list) => (
    <div style={{ overflowX: "auto" }}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Invoice</th>
            <th style={S.th}>Client</th>
            <th style={S.th}>Event</th>
            <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
            <th style={S.th}>Status</th>
            <th style={S.th}>Issued</th>
            <th style={S.th}>Due</th>
            <th style={S.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 && (
            <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: C.inkMuted, padding: 40 }}>No invoices found</td></tr>
          )}
          {list.map(inv => {
            const t = calcInvoiceTotals(inv.items);
            const config = STATUS_CONFIG[inv.status] || STATUS_CONFIG.Draft;
            const days = (inv.status === "Overdue" || (["Sent", "Viewed"].includes(inv.status) && new Date(inv.dateDue) < new Date())) ? daysOverdue(inv.dateDue) : 0;
            return (
              <tr key={inv.id} style={{ transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={S.td}>
                  <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 13, color: C.accent, cursor: "pointer" }}
                    onClick={() => setPreviewInvoice(inv)}>
                    {inv.invoiceNumber}
                  </span>
                </td>
                <td style={S.td}>{inv.client.name}</td>
                <td style={{ ...S.td, color: C.inkSec, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {inv.eventName}
                </td>
                <td style={{ ...S.td, textAlign: "right", fontFamily: F.mono, fontWeight: 600 }}>{fmtCurrency(t.total)}</td>
                <td style={S.td}>
                  <span style={S.badge(config)}>{config.label}</span>
                  {days > 0 && <span style={S.overdueBadge}>{days}d</span>}
                </td>
                <td style={{ ...S.td, fontSize: 13, color: C.inkSec }}>{fmtDate(inv.dateIssued)}</td>
                <td style={{ ...S.td, fontSize: 13, color: days > 0 ? C.danger : C.inkSec, fontWeight: days > 0 ? 600 : 400 }}>
                  {fmtDate(inv.dateDue)}
                </td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={S.btn("ghost")} onClick={() => setPreviewInvoice(inv)} title="Preview">
                      <span style={{ fontSize: 15 }}>View</span>
                    </button>
                    {inv.status === "Draft" && (
                      <button style={S.btn("sm")} onClick={() => markAsSent(inv.id)} title="Mark as Sent">Send</button>
                    )}
                    {["Sent", "Viewed", "Overdue"].includes(inv.status) && (
                      <button style={{ ...S.btn("sm"), color: C.success, borderColor: `${C.success}33` }}
                        onClick={() => setPaymentModal(inv)} title="Record Payment">Pay</button>
                    )}
                    {inv.status === "Overdue" && (
                      <button style={{ ...S.btn("sm"), color: C.warn, borderColor: `${C.warn}33` }}
                        onClick={() => sendReminder(inv.id)}
                        disabled={!!reminderSent[inv.id]}>
                        {reminderSent[inv.id] ? "Sent" : "Remind"}
                      </button>
                    )}
                    {inv.status === "Draft" && (
                      <button style={{ ...S.btn("ghost"), color: C.danger }} onClick={() => deleteInvoice(inv.id)}>Del</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── Render: Invoice List Tab ───────────────────────────────

  const renderInvoiceList = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            style={{ ...S.input, width: 260 }}
            placeholder="Search invoices, clients, events..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select style={S.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btn("secondary")} onClick={exportCSV}>Export CSV</button>
          <button style={S.btn("primary")} onClick={() => { setEditingInvoice(null); setShowCreateForm(true); }}>
            + New Invoice
          </button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ ...S.cardTitle, margin: 0 }}>
            Invoices
            <span style={{ fontSize: 14, color: C.inkMuted, fontFamily: F.sans, fontWeight: 400, marginLeft: 8 }}>
              ({filteredInvoices.length})
            </span>
          </h3>
        </div>
        {renderInvoiceTable(filteredInvoices)}
      </div>
    </div>
  );

  // ── Render: Create / Edit Form ─────────────────────────────

  const renderCreateForm = () => <CreateInvoiceForm
    invoices={invoices}
    onSave={addInvoice}
    onCancel={() => setShowCreateForm(false)}
    editing={editingInvoice}
  />;

  // ── Render: Invoice Preview ────────────────────────────────

  const renderPreview = () => {
    if (!previewInvoice) return null;
    const inv = previewInvoice;
    const t = calcInvoiceTotals(inv.items);
    const config = STATUS_CONFIG[inv.status] || STATUS_CONFIG.Draft;

    return (
      <div style={S.modal} onClick={() => setPreviewInvoice(null)}>
        <div style={{ ...S.modalContent, maxWidth: 800, padding: 0 }} onClick={e => e.stopPropagation()}>
          {/* Invoice Document */}
          <div style={{ padding: "40px 48px" }} id="invoice-preview">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
              <div>
                <div style={{ fontFamily: F.serif, fontSize: 24, color: C.accent, fontWeight: 400, letterSpacing: "-0.5px" }}>
                  Heads, Hearts & Tails
                </div>
                <div style={{ fontFamily: F.sans, fontSize: 11, color: C.inkMuted, marginTop: 2, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  Premium Cocktail Events
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: F.serif, fontSize: 28, color: C.ink, fontWeight: 400 }}>INVOICE</div>
                <div style={{ fontFamily: F.mono, fontSize: 14, color: C.accent, marginTop: 4 }}>{inv.invoiceNumber}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={S.badge(config)}>{config.label}</span>
                </div>
              </div>
            </div>

            {/* Company & Client Details */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, gap: 40 }}>
              <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>From</div>
                {COMPANY.name}<br />
                {COMPANY.address1}<br />
                {COMPANY.address2}<br />
                {COMPANY.email}<br />
                {COMPANY.phone}
              </div>
              <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.7, textAlign: "right" }}>
                <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>Bill To</div>
                {inv.client.name}<br />
                {inv.client.address}<br />
                {inv.client.email}
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: "flex", gap: 32, marginBottom: 32, fontSize: 13 }}>
              <div>
                <span style={{ color: C.inkMuted, marginRight: 8 }}>Date Issued:</span>
                <span style={{ fontWeight: 600 }}>{fmtDate(inv.dateIssued)}</span>
              </div>
              <div>
                <span style={{ color: C.inkMuted, marginRight: 8 }}>Due Date:</span>
                <span style={{ fontWeight: 600, color: inv.status === "Overdue" ? C.danger : C.ink }}>{fmtDate(inv.dateDue)}</span>
              </div>
              <div>
                <span style={{ color: C.inkMuted, marginRight: 8 }}>Event:</span>
                <span style={{ fontWeight: 600 }}>{inv.eventName}</span>
              </div>
            </div>

            {/* Line Items */}
            <table style={{ ...S.table, marginBottom: 24 }}>
              <thead>
                <tr style={{ background: C.bgWarm }}>
                  <th style={{ ...S.th, padding: "10px 12px" }}>Description</th>
                  <th style={{ ...S.th, padding: "10px 12px", textAlign: "center", width: 60 }}>Qty</th>
                  <th style={{ ...S.th, padding: "10px 12px", textAlign: "right", width: 100 }}>Unit Price</th>
                  <th style={{ ...S.th, padding: "10px 12px", textAlign: "right", width: 100 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={S.td}>{item.description}</td>
                    <td style={{ ...S.td, textAlign: "center", fontFamily: F.mono }}>{item.qty}</td>
                    <td style={{ ...S.td, textAlign: "right", fontFamily: F.mono }}>{fmtCurrency(item.unitPrice)}</td>
                    <td style={{ ...S.td, textAlign: "right", fontFamily: F.mono, fontWeight: 600 }}>{fmtCurrency(calcLineTotal(item))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
              <div style={{ width: 260 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: C.inkSec }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: F.mono }}>{fmtCurrency(t.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: C.inkSec, borderBottom: `1px solid ${C.border}` }}>
                  <span>VAT (20%)</span>
                  <span style={{ fontFamily: F.mono }}>{fmtCurrency(t.vat)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 18, fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: F.mono, color: C.accent }}>{fmtCurrency(t.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {inv.status === "Paid" && inv.datePaid && (
              <div style={{ background: C.successBg, borderRadius: 8, padding: 16, marginBottom: 24, border: `1px solid ${C.success}22` }}>
                <div style={{ fontWeight: 600, color: C.success, marginBottom: 6, fontSize: 13 }}>PAID</div>
                <div style={{ fontSize: 13, color: C.inkSec }}>
                  Paid on {fmtDate(inv.datePaid)}
                  {inv.paymentMethod && <> via {inv.paymentMethod}</>}
                  {inv.paymentRef && <> (Ref: {inv.paymentRef})</>}
                </div>
              </div>
            )}

            {/* Notes */}
            {inv.notes && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 6 }}>Notes</div>
                <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.6 }}>{inv.notes}</div>
              </div>
            )}

            {/* Payment Instructions */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 8 }}>Payment Instructions</div>
              <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.8 }}>
                Bank: Barclays Business<br />
                Account Name: Heads Hearts & Tails Ltd<br />
                Sort Code: 20-45-67<br />
                Account Number: 12345678<br />
                Reference: {inv.invoiceNumber}
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${C.borderLight}`, marginTop: 24, paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkMuted }}>
              <span>{COMPANY.name} | Company No: {COMPANY.companyNo}</span>
              <span>VAT Registration: {COMPANY.vat}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 48px", borderTop: `1px solid ${C.border}`, background: C.bgWarm }}>
            <button style={S.btn("secondary")} onClick={() => setPreviewInvoice(null)}>Close</button>
            <div style={{ display: "flex", gap: 8 }}>
              {inv.status === "Draft" && (
                <button style={S.btn("primary")} onClick={() => { markAsSent(inv.id); setPreviewInvoice({ ...inv, status: "Sent" }); }}>
                  Mark as Sent
                </button>
              )}
              {["Sent", "Viewed", "Overdue"].includes(inv.status) && (
                <button style={S.btn("success")} onClick={() => { setPreviewInvoice(null); setPaymentModal(inv); }}>
                  Record Payment
                </button>
              )}
              {inv.status === "Overdue" && (
                <button style={S.btn("warn")} onClick={() => sendReminder(inv.id)} disabled={!!reminderSent[inv.id]}>
                  {reminderSent[inv.id] ? "Reminder Sent" : "Send Reminder"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Payment Modal ──────────────────────────────────

  const renderPaymentModal = () => {
    if (!paymentModal) return null;
    return <PaymentRecordModal
      invoice={paymentModal}
      onSave={(data) => recordPayment(paymentModal.id, data)}
      onCancel={() => setPaymentModal(null)}
    />;
  };

  // ── Main Render ────────────────────────────────────────────

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.h1}>Invoicing & Payments</h1>
          <div style={S.subtitle}>Manage invoices, track payments, and monitor cash flow</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btn("secondary")} onClick={exportCSV}>Export CSV</button>
          <button style={S.btn("primary")} onClick={() => { setEditingInvoice(null); setShowCreateForm(true); }}>
            + New Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "invoices", label: "All Invoices" },
        ].map(tab => (
          <button key={tab.id} style={S.tab(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "invoices" && renderInvoiceList()}

      {/* Modals */}
      {showCreateForm && renderCreateForm()}
      {renderPreview()}
      {renderPaymentModal()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CreateInvoiceForm — Sub-component
// ═══════════════════════════════════════════════════════════════

function CreateInvoiceForm({ invoices, onSave, onCancel, editing }) {
  const [client, setClient] = useState(editing?.client || { name: "", email: "", address: "" });
  const [eventName, setEventName] = useState(editing?.eventName || "");
  const [items, setItems] = useState(editing?.items || [{ description: "", qty: 1, unitPrice: 0 }]);
  const [paymentTerms, setPaymentTerms] = useState(editing?.paymentTerms || 30);
  const [notes, setNotes] = useState(editing?.notes || "");
  const [dateIssued] = useState(editing?.dateIssued || isoDate(new Date()));

  const invoiceNumber = useMemo(() => editing?.invoiceNumber || genInvoiceNumber(invoices), [invoices, editing]);

  const totals = useMemo(() => calcInvoiceTotals(items), [items]);

  const dateDue = useMemo(() => {
    if (paymentTerms === "deposit") return isoDate(new Date());
    const d = new Date(dateIssued);
    d.setDate(d.getDate() + parseInt(paymentTerms, 10));
    return isoDate(d);
  }, [dateIssued, paymentTerms]);

  const updateItem = useCallback((idx, field, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }, []);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, { description: "", qty: 1, unitPrice: 0 }]);
  }, []);

  const removeItem = useCallback((idx) => {
    setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  }, []);

  const handleSave = useCallback(() => {
    if (!client.name.trim()) { alert("Please enter client name."); return; }
    if (!eventName.trim()) { alert("Please enter event name."); return; }
    if (items.some(i => !i.description.trim())) { alert("All line items must have a description."); return; }

    const invoice = {
      id: editing?.id || `inv_${Date.now()}`,
      invoiceNumber,
      status: "Draft",
      client,
      eventName,
      dateIssued,
      dateDue,
      items: items.map(i => ({ ...i, qty: parseFloat(i.qty) || 0, unitPrice: parseFloat(i.unitPrice) || 0 })),
      paymentTerms: paymentTerms === "deposit" ? "deposit" : parseInt(paymentTerms, 10),
      notes,
    };
    onSave(invoice);
  }, [client, eventName, items, paymentTerms, notes, invoiceNumber, dateIssued, dateDue, editing, onSave]);

  return (
    <div style={S.modal} onClick={onCancel}>
      <div style={{ ...S.modalContent, maxWidth: 780 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 400, margin: 0 }}>
            {editing ? "Edit Invoice" : "Create New Invoice"}
          </h2>
          <span style={{ fontFamily: F.mono, fontSize: 14, color: C.accent, fontWeight: 600 }}>{invoiceNumber}</span>
        </div>

        {/* Client Details */}
        <div style={{ background: C.bgWarm, borderRadius: 8, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSec, marginBottom: 12 }}>CLIENT DETAILS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Client Name *</label>
              <input style={S.input} value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} placeholder="Company or individual name" />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Email</label>
              <input style={S.input} value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} placeholder="accounts@company.com" />
            </div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Address</label>
            <input style={S.input} value={client.address} onChange={e => setClient(p => ({ ...p, address: e.target.value }))} placeholder="Full billing address" />
          </div>
        </div>

        {/* Event & Terms */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Event Name *</label>
            <input style={S.input} value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Annual Gala Dinner" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Payment Terms</label>
            <select style={{ ...S.select, width: "100%" }} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
              {PAYMENT_TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Date Issued</label>
            <input style={{ ...S.input, color: C.inkSec }} type="date" value={dateIssued} readOnly />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Due Date</label>
            <input style={{ ...S.input, color: C.inkSec }} type="date" value={dateDue} readOnly />
          </div>
        </div>

        {/* Line Items */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSec }}>LINE ITEMS</div>
            <button style={S.btn("sm")} onClick={addItem}>+ Add Item</button>
          </div>

          <div style={{ background: C.bgWarm, borderRadius: 8, padding: 16 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 110px 100px 36px", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase" }}>Description</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase" }}>Qty</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase" }}>Unit Price</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", textAlign: "right" }}>Total</span>
              <span></span>
            </div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 70px 110px 100px 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  style={{ ...S.input, fontSize: 13 }}
                  value={item.description}
                  onChange={e => updateItem(idx, "description", e.target.value)}
                  placeholder="Service description"
                />
                <input
                  style={{ ...S.input, fontSize: 13, textAlign: "center" }}
                  type="number" min="0" step="1"
                  value={item.qty}
                  onChange={e => updateItem(idx, "qty", e.target.value)}
                />
                <input
                  style={{ ...S.input, fontSize: 13, textAlign: "right" }}
                  type="number" min="0" step="0.01"
                  value={item.unitPrice}
                  onChange={e => updateItem(idx, "unitPrice", e.target.value)}
                />
                <div style={{ textAlign: "right", fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.ink }}>
                  {fmtCurrency(calcLineTotal(item))}
                </div>
                <button
                  style={{ ...S.btn("ghost"), color: C.danger, padding: "4px 8px", fontSize: 16, lineHeight: 1 }}
                  onClick={() => removeItem(idx)}
                  title="Remove item"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <div style={{ width: 260, background: C.accentSubtle, borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, color: C.inkSec }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: F.mono }}>{fmtCurrency(totals.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, color: C.inkSec }}>
              <span>VAT (20%)</span>
              <span style={{ fontFamily: F.mono }}>{fmtCurrency(totals.vat)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 18, fontWeight: 700, borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
              <span>Total</span>
              <span style={{ fontFamily: F.mono, color: C.accent }}>{fmtCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={S.fieldGroup}>
          <label style={S.label}>Notes / Payment Instructions</label>
          <textarea style={S.textarea} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Additional notes, PO references, special payment instructions..." />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <button style={S.btn("secondary")} onClick={onCancel}>Cancel</button>
          <button style={S.btn("primary")} onClick={handleSave}>
            {editing ? "Update Invoice" : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PaymentRecordModal — Sub-component
// ═══════════════════════════════════════════════════════════════

function PaymentRecordModal({ invoice, onSave, onCancel }) {
  const [datePaid, setDatePaid] = useState(isoDate(new Date()));
  const [method, setMethod] = useState("Bank Transfer");
  const [reference, setReference] = useState("");

  const totals = useMemo(() => calcInvoiceTotals(invoice.items), [invoice.items]);

  const handleSave = useCallback(() => {
    if (!datePaid) { alert("Please select a payment date."); return; }
    onSave({ datePaid, method, reference });
  }, [datePaid, method, reference, onSave]);

  return (
    <div style={S.modal} onClick={onCancel}>
      <div style={{ ...S.modalContent, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 400, margin: "0 0 8px 0" }}>
          Record Payment
        </h2>
        <div style={{ fontSize: 13, color: C.inkSec, marginBottom: 24 }}>
          <span style={{ fontFamily: F.mono, fontWeight: 600, color: C.accent }}>{invoice.invoiceNumber}</span>
          <span style={{ margin: "0 8px" }}>&mdash;</span>
          {invoice.client.name}
        </div>

        <div style={{ background: C.accentSubtle, borderRadius: 8, padding: 16, marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Amount Due</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: F.mono, color: C.accent }}>{fmtCurrency(totals.total)}</div>
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Payment Date *</label>
          <input style={S.input} type="date" value={datePaid} onChange={e => setDatePaid(e.target.value)} />
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Payment Method</label>
          <select style={{ ...S.select, width: "100%" }} value={method} onChange={e => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Reference Number</label>
          <input style={S.input} value={reference} onChange={e => setReference(e.target.value)}
            placeholder="e.g. BACS-12345, CARD-6789" />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <button style={S.btn("secondary")} onClick={onCancel}>Cancel</button>
          <button style={S.btn("success")} onClick={handleSave}>Confirm Payment</button>
        </div>
      </div>
    </div>
  );
}
