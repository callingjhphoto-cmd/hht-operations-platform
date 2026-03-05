import React, { useState, useMemo } from "react";

/* ── design tokens ── */
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

/* ── style helpers ── */
const cardStyle = {
  background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
  padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const btnStyle = (active) => ({
  padding: "7px 16px", borderRadius: 6, border: `1px solid ${active ? C.accent : C.border}`,
  background: active ? C.accent : C.card, color: active ? "#fff" : C.inkSec,
  fontFamily: F.sans, fontSize: 13, fontWeight: 500, cursor: "pointer",
  transition: "all .15s",
});
const pillStyle = (color, bg) => ({
  display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11,
  fontWeight: 600, color, background: bg, fontFamily: F.sans,
});
const inputStyle = {
  padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
  fontFamily: F.sans, fontSize: 13, color: C.ink, background: C.card, outline: "none",
};

/* ── demo data ── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const PL_DATA = [
  { month: "Jan", revenue: 28500, costs: 18200 },
  { month: "Feb", revenue: 34200, costs: 21800 },
  { month: "Mar", revenue: 41800, costs: 26500 },
  { month: "Apr", revenue: 38600, costs: 24100 },
  { month: "May", revenue: 52300, costs: 31700 },
  { month: "Jun", revenue: 47900, costs: 29400 },
];

const CLIENT_REV = [
  { name: "LVMH", revenue: 35000 },
  { name: "Pernod Ricard", revenue: 28000 },
  { name: "BrewDog", revenue: 22000 },
  { name: "William Grant & Sons", revenue: 18500 },
  { name: "Campari Group", revenue: 15000 },
  { name: "Diageo", revenue: 12000 },
  { name: "Fever-Tree", revenue: 11000 },
  { name: "Bacardi", revenue: 9800 },
];

const EVENT_TYPES = [
  { type: "Brand Activation", revenue: 58200, pct: 31 },
  { type: "Corporate Event", revenue: 42800, pct: 23 },
  { type: "Festival", revenue: 28500, pct: 15 },
  { type: "Private Party", revenue: 22400, pct: 12 },
  { type: "Pop-up", revenue: 19600, pct: 10 },
  { type: "VIP Dinner", revenue: 16800, pct: 9 },
];

const INVOICE_AGING = [
  { bucket: "Current", amount: 42600, color: C.success },
  { bucket: "30 days", amount: 18400, color: C.warn },
  { bucket: "60 days", amount: 7200, color: "#c47a18" },
  { bucket: "90+ days", amount: 3800, color: C.danger },
];

const CASHFLOW_FORECAST = [
  { month: "Jul 2025", income: 48000, expenses: 30500 },
  { month: "Aug 2025", income: 56200, expenses: 34800 },
  { month: "Sep 2025", income: 44500, expenses: 28200 },
];

const EXPENSE_CATS = [
  { category: "Staff costs", amount: 68400, pct: 38 },
  { category: "Spirits & ingredients", amount: 43200, pct: 24 },
  { category: "Equipment hire", amount: 21600, pct: 12 },
  { category: "Transport & logistics", amount: 18000, pct: 10 },
  { category: "Venue fees", amount: 16200, pct: 9 },
  { category: "Insurance & licences", amount: 12600, pct: 7 },
];

const BUDGET_ACTUAL = [
  { event: "Diageo Summer Launch", budgeted: 8500, actual: 9200, status: "over" },
  { event: "LVMH VIP Tasting", budgeted: 12000, actual: 11400, status: "under" },
  { event: "BrewDog Festival Pop-up", budgeted: 6800, actual: 6750, status: "under" },
  { event: "Campari Brand Activation", budgeted: 9500, actual: 10100, status: "over" },
  { event: "Pernod Ricard Gala", budgeted: 15000, actual: 14200, status: "under" },
  { event: "William Grant Tasting", budgeted: 7200, actual: 7180, status: "under" },
  { event: "Fever-Tree Garden Party", budgeted: 5500, actual: 5900, status: "over" },
];

/* ── helpers ── */
const fmt = (n) => "£" + n.toLocaleString("en-GB");
const pct = (n) => n.toFixed(1) + "%";

/* ── component ── */
export default function FinancialDashboard() {
  const [period, setPeriod] = useState("ytd");

  const periods = [
    { key: "month", label: "This Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "ytd", label: "YTD" },
    { key: "lastyear", label: "Last Year" },
  ];

  const totalRevenue = useMemo(() => PL_DATA.reduce((s, d) => s + d.revenue, 0), []);
  const totalCosts = useMemo(() => PL_DATA.reduce((s, d) => s + d.costs, 0), []);
  const outstandingInv = INVOICE_AGING.reduce((s, d) => s + d.amount, 0);
  const grossMargin = ((totalRevenue - totalCosts) / totalRevenue) * 100;
  const netMargin = grossMargin - 8.2;
  const cashFlow = totalRevenue - totalCosts - 14200;
  const maxPL = Math.max(...PL_DATA.map((d) => Math.max(d.revenue, d.costs)));
  const maxClient = Math.max(...CLIENT_REV.map((c) => c.revenue));
  const maxAging = Math.max(...INVOICE_AGING.map((a) => a.amount));
  const maxExpense = Math.max(...EXPENSE_CATS.map((e) => e.amount));

  const SectionTitle = ({ children }) => (
    <h3 style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 600, color: C.ink, margin: "0 0 14px" }}>
      {children}
    </h3>
  );

  const KPICard = ({ label, value, sub, color }) => (
    <div style={{ ...cardStyle, flex: 1, minWidth: 180, textAlign: "center" }}>
      <div style={{ fontFamily: F.sans, fontSize: 12, color: C.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 700, color: color || C.ink, marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: F.sans, fontSize: 12, color: C.inkSec }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 24, fontFamily: F.sans, color: C.ink }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 700, margin: 0, color: C.ink }}>
            Financial Dashboard
          </h1>
          <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkMuted, margin: "4px 0 0" }}>
            Heads, Hearts &amp; Tails — Financial Overview
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {periods.map((p) => (
            <button key={p.key} style={btnStyle(period === p.key)} onClick={() => setPeriod(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Total Revenue (YTD)" value={fmt(totalRevenue)} sub="+12.4% vs prior year" color={C.success} />
        <KPICard label="Outstanding Invoices" value={fmt(outstandingInv)} sub={`${INVOICE_AGING.length} aging buckets`} color={C.warn} />
        <KPICard label="Profit Margin" value={pct(grossMargin)} sub="Gross margin" color={C.accent} />
        <KPICard label="Cash Flow" value={fmt(cashFlow)} sub="Net operating cash" color={cashFlow >= 0 ? C.success : C.danger} />
      </div>

      {/* P&L + Revenue by Client */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* P&L Summary */}
        <div style={cardStyle}>
          <SectionTitle>P&amp;L Summary — Revenue vs Costs</SectionTitle>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 180 }}>
            {PL_DATA.map((d) => (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 140, width: "100%" }}>
                  <div style={{
                    flex: 1, background: C.accent, borderRadius: "4px 4px 0 0",
                    height: `${(d.revenue / maxPL) * 100}%`, minHeight: 4, transition: "height .3s",
                  }} title={`Revenue: ${fmt(d.revenue)}`} />
                  <div style={{
                    flex: 1, background: C.inkMuted, borderRadius: "4px 4px 0 0",
                    height: `${(d.costs / maxPL) * 100}%`, minHeight: 4, transition: "height .3s",
                  }} title={`Costs: ${fmt(d.costs)}`} />
                </div>
                <span style={{ fontSize: 11, color: C.inkSec }}>{d.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: C.inkSec, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: C.accent, display: "inline-block" }} /> Revenue
            </span>
            <span style={{ fontSize: 11, color: C.inkSec, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: C.inkMuted, display: "inline-block" }} /> Costs
            </span>
          </div>
        </div>

        {/* Revenue by Client */}
        <div style={cardStyle}>
          <SectionTitle>Revenue by Client</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CLIENT_REV.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: C.inkSec, width: 130, flexShrink: 0, textAlign: "right" }}>{c.name}</span>
                <div style={{ flex: 1, background: C.borderLight, borderRadius: 4, height: 18, overflow: "hidden" }}>
                  <div style={{
                    width: `${(c.revenue / maxClient) * 100}%`, height: "100%",
                    background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`,
                    borderRadius: 4, transition: "width .4s",
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, width: 60, flexShrink: 0 }}>{fmt(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Event Type + Invoice Aging */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Revenue by Event Type */}
        <div style={cardStyle}>
          <SectionTitle>Revenue by Event Type</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EVENT_TYPES.map((e) => (
              <div key={e.type}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: C.ink }}>{e.type}</span>
                  <span style={{ fontSize: 12, color: C.inkSec }}>{fmt(e.revenue)} ({e.pct}%)</span>
                </div>
                <div style={{ background: C.borderLight, borderRadius: 4, height: 12, overflow: "hidden" }}>
                  <div style={{
                    width: `${e.pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`,
                    borderRadius: 4, transition: "width .4s",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Aging */}
        <div style={cardStyle}>
          <SectionTitle>Invoice Aging</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {INVOICE_AGING.map((a) => (
              <div key={a.bucket}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{a.bucket}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{fmt(a.amount)}</span>
                </div>
                <div style={{ background: C.borderLight, borderRadius: 4, height: 14, overflow: "hidden" }}>
                  <div style={{
                    width: `${(a.amount / maxAging) * 100}%`, height: "100%",
                    background: a.color, borderRadius: 4, opacity: 0.75, transition: "width .4s",
                  }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: `1px solid ${C.borderLight}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Total Outstanding</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{fmt(outstandingInv)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast + Expense Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Cash Flow Forecast */}
        <div style={cardStyle}>
          <SectionTitle>Cash Flow Forecast — Next 3 Months</SectionTitle>
          <div style={{ display: "flex", gap: 12 }}>
            {CASHFLOW_FORECAST.map((cf) => {
              const net = cf.income - cf.expenses;
              const maxVal = Math.max(cf.income, cf.expenses);
              return (
                <div key={cf.month} style={{ flex: 1, background: C.bgWarm, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 10 }}>{cf.month}</div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkSec, marginBottom: 3 }}>
                      <span>Income</span><span>{fmt(cf.income)}</span>
                    </div>
                    <div style={{ background: C.borderLight, borderRadius: 3, height: 10, overflow: "hidden" }}>
                      <div style={{ width: `${(cf.income / maxVal) * 100}%`, height: "100%", background: C.success, borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkSec, marginBottom: 3 }}>
                      <span>Expenses</span><span>{fmt(cf.expenses)}</span>
                    </div>
                    <div style={{ background: C.borderLight, borderRadius: 3, height: 10, overflow: "hidden" }}>
                      <div style={{ width: `${(cf.expenses / maxVal) * 100}%`, height: "100%", background: C.danger, borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.inkSec }}>Net</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: net >= 0 ? C.success : C.danger }}>{fmt(net)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Categories */}
        <div style={cardStyle}>
          <SectionTitle>Expense Categories</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EXPENSE_CATS.map((e) => (
              <div key={e.category}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 13, color: C.ink }}>{e.category}</span>
                  <span style={{ fontSize: 12, color: C.inkSec }}>{fmt(e.amount)} · {e.pct}%</span>
                </div>
                <div style={{ background: C.borderLight, borderRadius: 4, height: 10, overflow: "hidden" }}>
                  <div style={{
                    width: `${(e.amount / maxExpense) * 100}%`, height: "100%",
                    background: C.inkSec, borderRadius: 4, transition: "width .4s",
                  }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.borderLight}` }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Total Expenses (YTD)</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(EXPENSE_CATS.reduce((s, e) => s + e.amount, 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget vs Actual */}
      <div style={cardStyle}>
        <SectionTitle>Budget vs Actual — Per Event</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.sans, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {["Event", "Budgeted", "Actual", "Variance", "Status"].map((h) => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: h === "Event" ? "left" : "right",
                    fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUDGET_ACTUAL.map((row) => {
                const variance = row.actual - row.budgeted;
                const isOver = variance > 0;
                const variancePct = ((variance / row.budgeted) * 100).toFixed(1);
                return (
                  <tr key={row.event} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{row.event}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: C.inkSec }}>{fmt(row.budgeted)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{fmt(row.actual)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: isOver ? C.danger : C.success, fontWeight: 600 }}>
                      {isOver ? "+" : ""}{fmt(variance)} ({isOver ? "+" : ""}{variancePct}%)
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <span style={pillStyle(isOver ? C.danger : C.success, isOver ? C.dangerBg : C.successBg)}>
                        {isOver ? "Over budget" : "Under budget"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borderLight}` }}>
          <span style={{ fontSize: 12, color: C.inkSec }}>
            {BUDGET_ACTUAL.filter((r) => r.status === "under").length} of {BUDGET_ACTUAL.length} events under budget
          </span>
          <span style={{ fontSize: 12, color: C.inkSec }}>
            Total variance: <strong style={{ color: C.ink }}>
              {fmt(BUDGET_ACTUAL.reduce((s, r) => s + (r.actual - r.budgeted), 0))}
            </strong>
          </span>
        </div>
      </div>

      {/* Quick Stats Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <div style={{ ...cardStyle, background: C.successBg, borderColor: "transparent" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                YTD Profit
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: C.success }}>
                {fmt(totalRevenue - totalCosts)}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.success, fontWeight: 600, background: C.card, padding: "4px 10px", borderRadius: 6 }}>
              +18.3% YoY
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, background: C.infoBg, borderColor: "transparent" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Events Delivered
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: C.info }}>
                47
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.info, fontWeight: 600, background: C.card, padding: "4px 10px", borderRadius: 6 }}>
              8 this month
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, background: C.warnBg, borderColor: "transparent" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Avg Event Revenue
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: C.warn }}>
                {fmt(Math.round(totalRevenue / 47))}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.warn, fontWeight: 600, background: C.card, padding: "4px 10px", borderRadius: 6 }}>
              +6.1% vs Q1
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div style={cardStyle}>
        <SectionTitle>Financial Health Indicators</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {/* Gross Margin */}
          <div style={{ background: C.bgWarm, borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Gross Margin
            </div>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 8px" }}>
              <svg viewBox="0 0 36 36" style={{ width: 80, height: 80, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.borderLight} strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.success} strokeWidth="3"
                  strokeDasharray={`${grossMargin} ${100 - grossMargin}`} strokeLinecap="round" />
              </svg>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                fontSize: 16, fontWeight: 700, color: C.success, fontFamily: F.serif,
              }}>{pct(grossMargin)}</div>
            </div>
            <div style={pillStyle(C.success, C.successBg)}>Healthy</div>
          </div>

          {/* Net Margin */}
          <div style={{ background: C.bgWarm, borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Net Margin
            </div>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 8px" }}>
              <svg viewBox="0 0 36 36" style={{ width: 80, height: 80, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.borderLight} strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.accent} strokeWidth="3"
                  strokeDasharray={`${netMargin} ${100 - netMargin}`} strokeLinecap="round" />
              </svg>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                fontSize: 16, fontWeight: 700, color: C.accent, fontFamily: F.serif,
              }}>{pct(netMargin)}</div>
            </div>
            <div style={pillStyle(C.accent, C.accentSubtle)}>On track</div>
          </div>

          {/* Avg Days to Pay */}
          <div style={{ background: C.bgWarm, borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Avg Days to Pay
            </div>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 8px" }}>
              <svg viewBox="0 0 36 36" style={{ width: 80, height: 80, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.borderLight} strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.warn} strokeWidth="3"
                  strokeDasharray={`${(24 / 60) * 100} ${100 - (24 / 60) * 100}`} strokeLinecap="round" />
              </svg>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                fontSize: 16, fontWeight: 700, color: C.warn, fontFamily: F.serif,
              }}>24d</div>
            </div>
            <div style={pillStyle(C.warn, C.warnBg)}>Acceptable</div>
          </div>

          {/* Quote-to-Invoice Conversion */}
          <div style={{ background: C.bgWarm, borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Quote-to-Invoice
            </div>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 8px" }}>
              <svg viewBox="0 0 36 36" style={{ width: 80, height: 80, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.borderLight} strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={C.info} strokeWidth="3"
                  strokeDasharray="72 28" strokeLinecap="round" />
              </svg>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                fontSize: 16, fontWeight: 700, color: C.info, fontFamily: F.serif,
              }}>72%</div>
            </div>
            <div style={pillStyle(C.info, C.infoBg)}>Strong</div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      <div style={cardStyle}>
        <SectionTitle>Monthly Revenue Trend</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, marginBottom: 8 }}>
          {PL_DATA.map((d) => {
            const h = (d.revenue / maxPL) * 100;
            return (
              <div key={d.month + "-trend"} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 10, color: C.inkSec, marginBottom: 4 }}>{fmt(d.revenue)}</div>
                <div style={{
                  width: "60%",
                  height: `${h}%`,
                  background: `linear-gradient(180deg, ${C.accentLight}, ${C.accent})`,
                  borderRadius: "4px 4px 0 0",
                  transition: "height .3s",
                  minHeight: 6,
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {PL_DATA.map((d) => (
            <div key={d.month + "-label"} style={{ flex: 1, textAlign: "center", fontSize: 11, color: C.inkMuted }}>
              {d.month}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borderLight}`,
          display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkSec,
        }}>
          <span>Peak month: <strong style={{ color: C.ink }}>May ({fmt(52300)})</strong></span>
          <span>Avg monthly: <strong style={{ color: C.ink }}>{fmt(Math.round(totalRevenue / 6))}</strong></span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px 0 8px", fontSize: 11, color: C.inkMuted }}>
        Financial data as of June 2025 · Heads, Hearts &amp; Tails Operations Platform
      </div>
    </div>
  );
}
