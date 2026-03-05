import React, { useState, useMemo } from "react";

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
  padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const btnStyle = (variant = "primary") => ({
  padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer",
  fontFamily: F.sans, fontSize: 13, fontWeight: 600, transition: "all .15s",
  ...(variant === "primary" ? { background: C.accent, color: "#fff" } :
    variant === "danger" ? { background: C.danger, color: "#fff" } :
    { background: C.bgWarm, color: C.ink, border: `1px solid ${C.border}` }),
});
const pillStyle = (active) => ({
  padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? C.accent : C.border}`,
  background: active ? C.accentSubtle : "transparent", color: active ? C.accent : C.inkSec,
  cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: F.sans, transition: "all .15s",
});
const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 7, border: `1px solid ${C.border}`,
  fontFamily: F.sans, fontSize: 13, color: C.ink, background: C.card,
  outline: "none", boxSizing: "border-box",
};

const CATEGORIES = ["All", "Proposals", "Menus", "Operations", "Finance", "Reports"];

const TEMPLATES = [
  { id: "proposal", name: "Event Proposal", category: "Proposals", icon: "\u{1F4CB}",
    desc: "Formal proposal with branding, scope, and pricing breakdown",
    fields: ["clientName","eventName","date","venue","guestCount","budget","cocktailSelections","notes"] },
  { id: "menu", name: "Cocktail Menu", category: "Menus", icon: "\u{1F378}",
    desc: "Styled menu card layout for guest-facing cocktail selections",
    fields: ["eventName","date","venue","cocktailSelections","notes"] },
  { id: "runsheet", name: "Event Run Sheet", category: "Operations", icon: "\u{23F1}\uFE0F",
    desc: "Timeline with responsibilities and minute-by-minute schedule",
    fields: ["eventName","date","venue","guestCount","staffAssignments","notes"] },
  { id: "invoice", name: "Invoice Template", category: "Finance", icon: "\u{1F9FE}",
    desc: "Professional invoice with line items, totals, and payment terms",
    fields: ["clientName","eventName","date","budget","notes"] },
  { id: "checklist", name: "Equipment Checklist", category: "Operations", icon: "\u2705",
    desc: "Pre-event kit list with quantities and condition tracking",
    fields: ["eventName","date","venue","equipmentList","staffAssignments"] },
  { id: "report", name: "Post-Event Report", category: "Reports", icon: "\u{1F4CA}",
    desc: "Debrief with photos placeholder, metrics, and follow-ups",
    fields: ["clientName","eventName","date","venue","guestCount","notes"] },
  { id: "brief", name: "Client Brief", category: "Proposals", icon: "\u{1F4DD}",
    desc: "Discovery questionnaire to capture client requirements",
    fields: ["clientName","eventName","date","venue","guestCount","budget","cocktailSelections","notes"] },
  { id: "staffing", name: "Staff Briefing", category: "Operations", icon: "\u{1F465}",
    desc: "Event-specific staff notes, roles, and dress code details",
    fields: ["eventName","date","venue","guestCount","staffAssignments","equipmentList","notes"] },
];

const FIELD_LABELS = {
  clientName: "Client Name", eventName: "Event Name", date: "Date", venue: "Venue",
  guestCount: "Guest Count", budget: "Budget", cocktailSelections: "Cocktail Selections",
  staffAssignments: "Staff Assignments", equipmentList: "Equipment List", notes: "Additional Notes",
};
const FIELD_PLACEHOLDERS = {
  clientName: "e.g. Sarah Mitchell", eventName: "e.g. Summer Garden Party",
  date: "e.g. 15 March 2026", venue: "e.g. The Glasshouse, Dublin",
  guestCount: "e.g. 120", budget: "e.g. \u20AC3,500",
  cocktailSelections: "e.g. Espresso Martini, Aperol Spritz, Whiskey Sour",
  staffAssignments: "e.g. Tom (Lead), Amy (Bar 1), Jake (Bar 2)",
  equipmentList: "e.g. 2x Portable Bars, Ice Well, Glassware x150",
  notes: "Any extra details...",
};
const DEFAULTS = {
  clientName: "Sarah Mitchell", eventName: "Summer Garden Party", date: "15 March 2026",
  venue: "The Glasshouse, Dublin", guestCount: "120", budget: "\u20AC3,500",
  cocktailSelections: "Espresso Martini, Aperol Spritz, Whiskey Sour, Mojito",
  staffAssignments: "Tom (Lead Bartender), Amy (Bar 1), Jake (Bar 2), Ciara (Runner)",
  equipmentList: "2x Portable Bars, 1x Ice Well, Glassware x150, Garnish Trays x4",
  notes: "",
};

/* ---------- Thumbnail mockups ---------- */
const Thumb = ({ template }) => {
  const bg = { proposal: "#F8F6F2", menu: "#1A1A1A", runsheet: "#F0F7FA", invoice: "#FAFAF8",
    checklist: "#F0F9F3", report: "#FDF8F0", brief: "#F5F1EC", staffing: "#F0F7FA" };
  const fg = template.id === "menu" ? "#E8D5A8" : C.inkSec;
  return (
    <div style={{ width: "100%", height: 110, background: bg[template.id] || C.bgWarm,
      borderRadius: 6, display: "flex", flexDirection: "column", padding: 12,
      boxSizing: "border-box", overflow: "hidden", border: `1px solid ${C.borderLight}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ width: 18, height: 18, borderRadius: 3, background: C.accent, opacity: 0.7 }} />
        <div style={{ height: 6, width: 50, background: fg, borderRadius: 3, opacity: 0.5 }} />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 4, width: `${70 - i * 12}%`, background: fg,
          borderRadius: 2, opacity: 0.18 + i * 0.04, marginBottom: 5 }} />
      ))}
    </div>
  );
};

/* ---------- Document preview renderers ---------- */
const renderDocPreview = (tpl, data) => {
  const d = { ...DEFAULTS, ...data };
  const header = (title) => (
    <div style={{ borderBottom: `2px solid ${C.accent}`, paddingBottom: 16, marginBottom: 20,
      display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 10, fontFamily: F.sans, color: C.accent, fontWeight: 700,
          letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Heads, Hearts &amp; Tails</div>
        <div style={{ fontSize: 20, fontFamily: F.serif, color: C.ink, fontWeight: 700 }}>{title}</div>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 8, background: C.accentSubtle,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: C.accent, fontFamily: F.sans, fontWeight: 700 }}>LOGO</div>
    </div>
  );
  const field = (label, val) => (
    <div style={{ marginBottom: 10 }}>
      <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>{label}: </span>
      <span style={{ fontSize: 13, color: C.ink, fontFamily: F.sans, fontWeight: 500 }}>{val}</span>
    </div>
  );
  const sectionTitle = (t) => (
    <div style={{ fontSize: 14, fontFamily: F.serif, color: C.accent, fontWeight: 700,
      marginTop: 20, marginBottom: 10, borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 6 }}>{t}</div>
  );

  const docWrap = (children) => (
    <div style={{ background: "#fff", padding: 36, fontFamily: F.sans, fontSize: 13,
      color: C.ink, lineHeight: 1.6, minHeight: 500, boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      borderRadius: 4, maxWidth: 600, margin: "0 auto" }}>
      {children}
      <div style={{ marginTop: 30, paddingTop: 14, borderTop: `1px solid ${C.borderLight}`,
        fontSize: 10, color: C.inkMuted, textAlign: "center", fontFamily: F.sans }}>
        Heads, Hearts &amp; Tails &mdash; Premium Mobile Bar Services &mdash; info@hht.ie
      </div>
    </div>
  );

  switch (tpl.id) {
    case "proposal": return docWrap(<>
      {header("Event Proposal")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {field("Prepared for", d.clientName)}{field("Event", d.eventName)}
        {field("Date", d.date)}{field("Venue", d.venue)}
        {field("Expected Guests", d.guestCount)}{field("Budget", d.budget)}
      </div>
      {sectionTitle("Scope of Service")}
      <p style={{ margin: 0 }}>We are delighted to propose our premium mobile cocktail bar experience for your upcoming event. Our team will provide a fully equipped bar setup, professional bartending staff, and bespoke cocktail menu tailored to your preferences.</p>
      {sectionTitle("Cocktail Selection")}
      <p style={{ margin: 0 }}>{d.cocktailSelections}</p>
      {sectionTitle("Pricing Breakdown")}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
          {["Item","Qty","Unit","Total"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.inkSec, fontWeight: 600 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {[["Bar Setup & Equipment",1,"\u20AC400","\u20AC400"],["Bartending Staff (4h)",3,"\u20AC180","\u20AC540"],
            ["Cocktail Package",120,"\u20AC12","\u20AC1,440"],["Premium Spirits Upgrade",1,"\u20AC350","\u20AC350"]
          ].map(([a,b,c,e],i)=><tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
            {[a,b,c,e].map((v,j)=><td key={j} style={{ padding: "6px 8px" }}>{v}</td>)}
          </tr>)}
          <tr style={{ fontWeight: 700 }}><td colSpan={3} style={{ padding: "8px", textAlign: "right" }}>Total</td>
            <td style={{ padding: "8px" }}>\u20AC2,730</td></tr>
        </tbody>
      </table>
      {d.notes && <>{sectionTitle("Notes")}<p style={{ margin: 0 }}>{d.notes}</p></>}
    </>);

    case "menu": return (
      <div style={{ background: "#1A1A1A", padding: 36, fontFamily: F.serif, color: "#E8D5A8",
        minHeight: 500, borderRadius: 4, maxWidth: 420, margin: "0 auto", textAlign: "center",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6,
          fontFamily: F.sans, opacity: 0.6 }}>Heads, Hearts &amp; Tails presents</div>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Cocktail Menu</div>
        <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 6, fontFamily: F.sans }}>{d.eventName}</div>
        <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 24, fontFamily: F.sans }}>{d.date} &mdash; {d.venue}</div>
        <div style={{ width: 40, height: 1, background: "#E8D5A8", margin: "0 auto 24px", opacity: 0.3 }} />
        {(d.cocktailSelections || "").split(",").map((c, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.trim()}</div>
            <div style={{ fontSize: 11, opacity: 0.5, fontFamily: F.sans }}>
              {["Vodka, Kahlua, Espresso, Sugar Syrup","Aperol, Prosecco, Soda, Orange Slice",
                "Bourbon, Lemon, Sugar Syrup, Egg White","White Rum, Lime, Mint, Sugar, Soda"][i % 4]}
            </div>
          </div>
        ))}
        <div style={{ width: 40, height: 1, background: "#E8D5A8", margin: "24px auto 16px", opacity: 0.3 }} />
        <div style={{ fontSize: 10, opacity: 0.35, fontFamily: F.sans }}>Please inform staff of any allergies</div>
      </div>
    );

    case "runsheet": return docWrap(<>
      {header("Event Run Sheet")}
      {field("Event", d.eventName)}{field("Date", d.date)}{field("Venue", d.venue)}{field("Guests", d.guestCount)}
      {sectionTitle("Staff on Duty")}
      <p style={{ margin: 0 }}>{d.staffAssignments}</p>
      {sectionTitle("Timeline")}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
          {["Time","Task","Owner","Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.inkSec, fontWeight: 600 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {[["14:00","Arrive & Unload","Tom",""],["14:30","Bar Setup","All",""],
            ["15:30","Ice & Garnish Prep","Amy / Jake",""],["16:00","Final Check","Tom",""],
            ["16:30","Service Begins","All",""],["20:30","Last Orders","Tom",""],
            ["21:00","Pack Down & Clean","All",""],["21:30","Depart","Tom",""]
          ].map(([a,b,c,e],i)=><tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
            {[a,b,c].map((v,j)=><td key={j} style={{ padding: "6px 8px" }}>{v}</td>)}
            <td style={{ padding: "6px 8px" }}><span style={{ display: "inline-block", width: 14, height: 14, border: `1.5px solid ${C.border}`, borderRadius: 3 }} /></td>
          </tr>)}
        </tbody>
      </table>
      {d.notes && <>{sectionTitle("Notes")}<p style={{ margin: 0 }}>{d.notes}</p></>}
    </>);

    case "invoice": return docWrap(<>
      {header("Invoice")}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>{field("Bill To", d.clientName)}{field("Event", d.eventName)}{field("Date", d.date)}</div>
        <div style={{ textAlign: "right" }}>
          {field("Invoice #", "HHT-2026-0042")}{field("Issued", "01 March 2026")}{field("Due", "15 March 2026")}
        </div>
      </div>
      {sectionTitle("Line Items")}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ borderBottom: `2px solid ${C.accent}` }}>
          {["Description","Qty","Rate","Amount"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.accent, fontWeight: 600 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {[["Mobile Bar Setup",1,"\u20AC400","\u20AC400"],["Bartending Staff (4 hrs x3)",3,"\u20AC180","\u20AC540"],
            ["Cocktail Package (per head)",120,"\u20AC12","\u20AC1,440"],["Transport & Logistics",1,"\u20AC150","\u20AC150"]
          ].map(([a,b,c,e],i)=><tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
            {[a,b,c,e].map((v,j)=><td key={j} style={{ padding: "8px" }}>{v}</td>)}
          </tr>)}
        </tbody>
      </table>
      <div style={{ textAlign: "right", marginTop: 12 }}>
        <div style={{ fontSize: 12, color: C.inkSec }}>Subtotal: \u20AC2,530</div>
        <div style={{ fontSize: 12, color: C.inkSec }}>VAT (23%): \u20AC581.90</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginTop: 4 }}>Total: \u20AC3,111.90</div>
      </div>
      {sectionTitle("Payment Details")}
      <p style={{ margin: 0, fontSize: 12 }}>Bank: AIB &mdash; IBAN: IE12 AIBK 9312 3456 7890 &mdash; BIC: AIBKIE2D<br/>
        50% deposit due on confirmation. Balance due 7 days before event.</p>
    </>);

    case "checklist": return docWrap(<>
      {header("Equipment Checklist")}
      {field("Event", d.eventName)}{field("Date", d.date)}{field("Venue", d.venue)}
      {sectionTitle("Kit List")}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
          {["Item","Qty","Packed","Condition"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.inkSec, fontWeight: 600 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {[["Portable Bar Unit",2],["Ice Well",1],["Speed Rails",2],["Cocktail Shakers",4],
            ["Jiggers",4],["Strainers",4],["Glassware (Coupe)",60],["Glassware (Rocks)",50],
            ["Glassware (Highball)",40],["Garnish Trays",4],["Bar Mats",4],["Napkins (packs)",6]
          ].map(([a,b],i)=><tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
            <td style={{ padding: "6px 8px" }}>{a}</td><td style={{ padding: "6px 8px" }}>{b}</td>
            <td style={{ padding: "6px 8px" }}><span style={{ display: "inline-block", width: 14, height: 14, border: `1.5px solid ${C.border}`, borderRadius: 3 }} /></td>
            <td style={{ padding: "6px 8px", color: C.inkMuted, fontStyle: "italic" }}>Good</td>
          </tr>)}
        </tbody>
      </table>
      {sectionTitle("Assigned Staff")}
      <p style={{ margin: 0 }}>{d.staffAssignments}</p>
    </>);

    case "report": return docWrap(<>
      {header("Post-Event Report")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {field("Client", d.clientName)}{field("Event", d.eventName)}
        {field("Date", d.date)}{field("Venue", d.venue)}{field("Guests Served", d.guestCount)}
      </div>
      {sectionTitle("Event Photos")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 80, background: C.bgWarm, borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
          color: C.inkMuted, border: `1px dashed ${C.border}` }}>Photo {i}</div>)}
      </div>
      {sectionTitle("Key Metrics")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[["Cocktails Served","347"],["Top Cocktail","Espresso Martini"],["Avg Wait Time","2.5 min"]].map(([l,v])=>
          <div key={l} style={{ background: C.accentSubtle, borderRadius: 8, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{v}</div>
            <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 2 }}>{l}</div>
          </div>
        )}
      </div>
      {sectionTitle("Feedback & Follow-up")}
      <p style={{ margin: 0 }}>Event ran smoothly with no major issues. Client was very happy with service quality. Recommend follow-up for their annual Christmas party in December.</p>
      {d.notes && <>{sectionTitle("Notes")}<p style={{ margin: 0 }}>{d.notes}</p></>}
    </>);

    case "brief": return docWrap(<>
      {header("Client Brief")}
      {sectionTitle("Client Details")}
      {field("Name", d.clientName)}{field("Event", d.eventName)}
      {sectionTitle("Event Details")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {field("Date", d.date)}{field("Venue", d.venue)}
        {field("Guest Count", d.guestCount)}{field("Budget", d.budget)}
      </div>
      {sectionTitle("Preferences")}
      <p style={{ margin: 0 }}><strong>Cocktail Preferences:</strong> {d.cocktailSelections}</p>
      {sectionTitle("Discovery Questions")}
      {["What is the occasion?","What vibe/theme are you going for?","Any dietary requirements or restrictions?",
        "Have you used a mobile bar service before?","Do you have a preferred spirit or cocktail style?",
        "Is there anything else we should know?"
      ].map((q,i) => <div key={i} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{i+1}. {q}</div>
        <div style={{ height: 32, borderBottom: `1px solid ${C.borderLight}` }} />
      </div>)}
      {d.notes && <>{sectionTitle("Additional Notes")}<p style={{ margin: 0 }}>{d.notes}</p></>}
    </>);

    case "staffing": return docWrap(<>
      {header("Staff Briefing")}
      <div style={{ background: C.warnBg, border: `1px solid ${C.warn}`, borderRadius: 8,
        padding: 12, marginBottom: 16, fontSize: 12 }}>
        <strong>CONFIDENTIAL</strong> &mdash; This document is for HHT staff only.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {field("Event", d.eventName)}{field("Date", d.date)}
        {field("Venue", d.venue)}{field("Guests Expected", d.guestCount)}
      </div>
      {sectionTitle("Team & Roles")}
      <p style={{ margin: 0 }}>{d.staffAssignments}</p>
      {sectionTitle("Dress Code")}
      <p style={{ margin: 0 }}>All black. HHT branded apron provided on site. Clean shoes, no trainers.</p>
      {sectionTitle("Equipment")}
      <p style={{ margin: 0 }}>{d.equipmentList}</p>
      {sectionTitle("Menu")}
      <p style={{ margin: 0 }}>Cocktails being served: {d.cocktailSelections || "TBC"}</p>
      {sectionTitle("Key Reminders")}
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
        <li>Arrive 2 hours before service</li>
        <li>Check all glassware for chips before use</li>
        <li>Ask about allergies before serving</li>
        <li>No personal phones behind the bar</li>
        <li>Photograph the setup before guests arrive</li>
      </ul>
      {d.notes && <>{sectionTitle("Additional Notes")}<p style={{ margin: 0 }}>{d.notes}</p></>}
    </>);

    default: return null;
  }
};

/* ========== Main Component ========== */
export default function DocumentTemplates() {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("gallery"); // gallery | preview | fill | generated
  const [formData, setFormData] = useState({});
  const [recentIds, setRecentIds] = useState(["proposal", "menu", "runsheet"]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (category !== "All") list = list.filter(t => t.category === category);
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [category, search]);

  const recentTemplates = useMemo(() => TEMPLATES.filter(t => recentIds.includes(t.id)), [recentIds]);

  const openPreview = (tpl) => { setSelected(tpl); setMode("preview"); };
  const openFill = () => { setFormData({}); setMode("fill"); };
  const generate = () => {
    if (selected && !recentIds.includes(selected.id)) setRecentIds(p => [selected.id, ...p].slice(0, 5));
    setMode("generated");
  };
  const back = () => {
    if (mode === "generated") setMode("fill");
    else if (mode === "fill") setMode("preview");
    else { setMode("gallery"); setSelected(null); }
  };

  /* ---------- Slide-over panel ---------- */
  const SlideOver = ({ children }) => (
    <>
      <div onClick={back} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
        zIndex: 900, transition: "opacity .2s" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(720px, 90vw)",
        background: C.bg, zIndex: 901, boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
        display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {mode !== "preview" && <button onClick={back} style={{ ...btnStyle("ghost"), padding: "4px 10px", fontSize: 12 }}>&larr; Back</button>}
            <span style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: C.ink }}>
              {selected?.name}{mode === "fill" ? " \u2014 Fill Details" : mode === "generated" ? " \u2014 Generated" : ""}
            </span>
          </div>
          <button onClick={() => { setMode("gallery"); setSelected(null); }}
            style={{ background: "none", border: "none", fontSize: 20, color: C.inkMuted, cursor: "pointer" }}>&times;</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>{children}</div>
      </div>
    </>
  );

  /* ---------- Template card ---------- */
  const TemplateCard = ({ tpl, compact }) => (
    <div onClick={() => openPreview(tpl)} style={{ ...cardStyle, cursor: "pointer", transition: "all .15s",
      ...(compact ? { display: "flex", alignItems: "center", gap: 14, padding: 14 } : {}) }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = "0 2px 8px rgba(125,90,26,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
      {compact ? (
        <>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: C.accentSubtle,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{tpl.icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: F.sans }}>{tpl.name}</div>
            <div style={{ fontSize: 11, color: C.inkMuted }}>{tpl.category}</div>
          </div>
        </>
      ) : (
        <>
          <Thumb template={tpl} />
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{tpl.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: F.sans }}>{tpl.name}</span>
            </div>
            <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.4 }}>{tpl.desc}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ ...pillStyle(false), fontSize: 10, padding: "3px 8px" }}>{tpl.category}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.sans, color: C.ink }}>
      {/* Header */}
      <div style={{ padding: "24px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontFamily: F.serif, color: C.ink }}>Document Templates</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.inkSec }}>
              Pre-built templates with auto-fill for proposals, menus, run sheets, and more
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..." style={{ ...inputStyle, width: 220 }} />
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={pillStyle(category === c)}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 28px 40px" }}>
        {/* Recently used */}
        {recentTemplates.length > 0 && category === "All" && !search && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontFamily: F.serif, color: C.inkSec, margin: "0 0 12px",
              fontWeight: 600 }}>Recently Used</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {recentTemplates.map(t => <TemplateCard key={t.id} tpl={t} compact />)}
            </div>
          </div>
        )}

        {/* Template gallery */}
        <h3 style={{ fontSize: 14, fontFamily: F.serif, color: C.inkSec, margin: "0 0 12px",
          fontWeight: 600 }}>{category === "All" ? "All Templates" : category} ({filtered.length})</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {filtered.map(t => <TemplateCard key={t.id} tpl={t} />)}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: C.inkMuted }}>
            No templates match your search.
          </div>
        )}
      </div>

      {/* Slide-over for preview / fill / generated */}
      {selected && mode === "preview" && (
        <SlideOver>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{selected.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: C.inkSec }}>{selected.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={openFill} style={btnStyle("primary")}>Use Template</button>
              <span style={{ ...pillStyle(false), fontSize: 11 }}>{selected.category}</span>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 20 }}>
            <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 12, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: 1 }}>Preview with sample data</div>
            {renderDocPreview(selected, DEFAULTS)}
          </div>
        </SlideOver>
      )}

      {selected && mode === "fill" && (
        <SlideOver>
          <div style={{ fontSize: 13, color: C.inkSec, marginBottom: 20 }}>
            Fill in the details below. Leave blank to use default placeholder values.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {selected.fields.map(f => (
              <div key={f} style={{ ...(f === "notes" || f === "cocktailSelections" || f === "staffAssignments" || f === "equipmentList" ? { gridColumn: "1 / -1" } : {}) }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.inkSec,
                  marginBottom: 4 }}>{FIELD_LABELS[f]}</label>
                {(f === "notes" || f === "cocktailSelections" || f === "staffAssignments" || f === "equipmentList") ? (
                  <textarea value={formData[f] || ""} onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                    placeholder={FIELD_PLACEHOLDERS[f]} rows={3}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: F.sans }} />
                ) : (
                  <input value={formData[f] || ""} onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                    placeholder={FIELD_PLACEHOLDERS[f]} style={inputStyle} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
            <button onClick={generate} style={btnStyle("primary")}>Generate Document</button>
            <button onClick={back} style={btnStyle("ghost")}>Cancel</button>
          </div>
        </SlideOver>
      )}

      {selected && mode === "generated" && (
        <SlideOver>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{selected.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Generated Document</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => window.print()} style={btnStyle("ghost")}>Print</button>
              <button onClick={() => { setMode("gallery"); setSelected(null); }} style={btnStyle("primary")}>Done</button>
            </div>
          </div>
          <div style={{ background: C.successBg, border: `1px solid ${C.success}`, borderRadius: 8,
            padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.success, fontWeight: 500 }}>
            Document generated successfully. You can print or save this page.
          </div>
          {renderDocPreview(selected, formData)}
        </SlideOver>
      )}
    </div>
  );
}
