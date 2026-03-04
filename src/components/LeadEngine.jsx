import { useState, useEffect, useMemo, useCallback } from "react";
import { VENUE_DATABASE } from "../lib/venueData";
import { WEDDING_PLANNER_LEADS } from "../lib/weddingPlannerLeads";
import { SPORT_CHARITY_ENTERTAINMENT_LEADS } from "../lib/sportCharityEntertainmentLeads";
import { PARTNERSHIP_LEADS } from "../lib/partnershipLeads";
import { UNIVERSITY_VENUE_LEADS, HOTEL_GROUP_LEADS, PR_AGENCY_LEADS } from "../lib/newBusinessLeads";
import { CORPORATE_EXPERIENTIAL_LEADS } from "../lib/corporateExperientialLeads";
import { NEW_VENUE_LEADS } from "../lib/newVenueLeads";
import CSVImport from "./CSVImport";
import CountyMap from "./CountyMap";
import AgentPanel from "./AgentPanel";
import ScraperPanel from "./ScraperPanel";

// ═══════════════════════════════════════════════════════════════
// HH&T Lead Generation CRM — White Editorial Design
// Matches site design: clean, warm, Georgia serif + Inter sans
// Kanban Pipeline: Scraped → Enriched → Outreach → Warm Reply → Converted
// ═══════════════════════════════════════════════════════════════

// Site-matching colour palette (from App.jsx C object)
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
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };

const PIPELINE_COLUMNS = [
  { id: "scraped", label: "Scraped Leads", color: "#2A6680" },
  { id: "enriched", label: "Enriched & Scored", color: "#5B6AAF" },
  { id: "outreach", label: "Outreach Deployed", color: "#956018" },
  { id: "warm_reply", label: "Warm Reply", color: "#B8922E" },
  { id: "converted", label: "Converted to Project", color: "#2B7A4B" },
];

const TEAM = ["Joe Stokoe", "Matt Robertson", "Emily Blacklock", "Seb Davis", "Jason Sales", "Anja Rubin", "Katy Kedslie"];

function scoreVenue(v) {
  let s = 40;
  if (v.capacity >= 50 && v.capacity <= 300) s += 20;
  else if (v.capacity >= 30 && v.capacity <= 500) s += 12;
  else if (v.capacity > 500) s += 5;
  else s += 3;
  if (v.distance_from_london_miles <= 15) s += 15;
  else if (v.distance_from_london_miles <= 40) s += 12;
  else if (v.distance_from_london_miles <= 70) s += 8;
  else s += 4;
  const cat = (v.category || "").toLowerCase();
  if (cat.includes("wedding") || cat.includes("barn") || cat.includes("estate")) s += 15;
  else if (cat.includes("castle") || cat.includes("historic")) s += 12;
  else if (cat.includes("racecourse") || cat.includes("polo") || cat.includes("cricket")) s += 14;
  else if (cat.includes("charity") || cat.includes("rugby")) s += 13;
  else if (cat.includes("entertainment") || cat.includes("team building")) s += 11;
  else if (cat.includes("event") || cat.includes("museum")) s += 8;
  else s += 5;
  if (v.trigger_event && v.trigger_event.length > 50) s += 10;
  else s += 5;
  return Math.min(s, 100);
}

function getPriority(score) {
  if (score >= 85) return { label: "Hot", color: C.danger };
  if (score >= 70) return { label: "Warm", color: C.warn };
  if (score >= 55) return { label: "Cool", color: C.info };
  return { label: "Cold", color: C.inkMuted };
}

function generatePitch(venue) {
  const benefits = [];
  if (venue.capacity >= 100 && venue.capacity <= 300) {
    benefits.push("perfectly sized for our signature cocktail experiences (100-300 guests)");
  } else if (venue.capacity > 300) {
    benefits.push("ideal scale for our large-format brand activations and corporate celebrations");
  } else {
    benefits.push("an intimate setting perfect for our bespoke cocktail masterclasses");
  }
  const cat = (venue.category || "").toLowerCase();
  let venueStyle = "your stunning venue";
  if (cat.includes("barn")) venueStyle = "your beautiful rustic barn setting";
  else if (cat.includes("castle")) venueStyle = "your extraordinary castle backdrop";
  else if (cat.includes("estate") || cat.includes("country")) venueStyle = "your magnificent estate grounds";
  else if (cat.includes("historic") || cat.includes("livery")) venueStyle = "your incredible historic space";
  else if (cat.includes("museum") || cat.includes("gallery")) venueStyle = "your inspiring gallery setting";
  else if (cat.includes("racecourse")) venueStyle = "your prestigious racecourse hospitality";
  else if (cat.includes("cricket")) venueStyle = "your world-class cricket ground hospitality";
  else if (cat.includes("polo")) venueStyle = "your exclusive polo club setting";
  else if (cat.includes("rugby")) venueStyle = "your electric matchday hospitality";
  else if (cat.includes("charity")) venueStyle = "your prestigious fundraising events";
  else if (cat.includes("entertainment")) venueStyle = "your entertainment booking expertise";
  else if (cat.includes("team building")) venueStyle = "your corporate team building experiences";
  else if (cat.includes("event")) venueStyle = "your versatile event space";
  const dist = venue.distance_from_london_miles;
  const logistics = dist <= 20
    ? "Being so close to central London, logistics would be seamless for our team."
    : dist <= 50
    ? `At just ${dist} miles from London, we can easily mobilise our full production team and bar fleet.`
    : `Even at ${dist} miles out, we regularly service venues across the Home Counties and would love to bring our setup to you.`;
  return {
    subject: `Partnership Opportunity — Bespoke Drinks Experiences for ${venue.venue_name}`,
    body: `Dear ${venue.venue_name} Events Team,

I'm Joe Stokoe, Director & Founder of Heads, Hearts & Tails (HH&T), a London-based drinks and events agency specialising in bespoke cocktail bars, brand activations, and immersive drinks experiences.

I came across ${venue.venue_name} and was genuinely impressed — ${venueStyle} is ${benefits[0]}.

THE TRIPLE WIN:

1. FOR YOUR VENUE: We bring a premium, turnkey cocktail bar service that elevates your events offering without any additional investment from your side. Our setups are designed to complement, not compete with, your existing F&B operations.

2. FOR YOUR CLIENTS: Your couples, corporate bookers, and event planners get access to bespoke cocktail menus, theatrical serves, and a fully branded bar experience that transforms any celebration into something truly memorable.

3. FOR HH&T: We get to work in ${venueStyle}, reaching your audience of engaged event organisers who are already looking for premium experiences.

${logistics}

We've worked with venues across the South East including country estates, historic halls, and creative event spaces. Our services include:

• Bespoke cocktail bar hire (full mobile bar setup)
• Cocktail masterclasses for 20-200 guests
• Brand activations and product launches
• Wedding bar packages with personalised menus
• Corporate entertaining and team experiences

I'd love to arrange a quick 15-minute call or, better still, pop over for a coffee and show you what we do. No pressure — just a conversation about whether there's a fit.

Would next week work for a brief chat?

Best,
Joe Stokoe
Director & Founder, Heads Hearts & Tails
joe@headsandtails.co.uk | +44 7XXX XXX XXX
headsandtails.co.uk`
  };
}

// ═══ SHARED STYLE HELPERS ═══
const cardStyle = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, ...extra });
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });
const inputStyle = { padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%", boxSizing: "border-box" };
const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 30, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A948C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };

const btnPrimary = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", border: "none", background: C.ink, color: "#fff", transition: "all 0.15s" };
const btnOutline = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", background: "transparent", color: C.ink, border: `1px solid ${C.border}`, transition: "all 0.15s" };
const btnAccent = { ...btnPrimary, background: C.accent, color: "#fff" };
const btnGhost = { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", background: "transparent", color: C.inkSec, border: "none", transition: "all 0.15s" };
const btnDanger = { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}33`, transition: "all 0.15s" };

const overlay = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(24,21,15,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const closeBtn = { width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.inkMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const lbl = { fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, display: "block", fontFamily: F.sans };
const pgBtn = { padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.inkSec, fontSize: 12, cursor: "pointer", fontFamily: F.sans };
function tag(color) { return { display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${color}12`, color, border: `1px solid ${color}20`, fontFamily: F.sans }; }

// ═══ MAIN COMPONENT ═══
export default function LeadEngineCRM() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [pitchModal, setPitchModal] = useState(null);
  const [view, setView] = useState("map");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDistance, setFilterDistance] = useState("all");
  const [filterCounty, setFilterCounty] = useState("All");
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragItem, setDragItem] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("hht_pipeline_v3");
    if (stored) { try { setLeads(JSON.parse(stored)); return; } catch {} }
    initFromDB();
  }, []);

  function initFromDB() {
    const venues = VENUE_DATABASE.map((v, i) => ({
      ...v, id: `venue_${i}`, score: scoreVenue(v), stage: i < 60 ? "scraped" : "enriched",
      assigned_to: "", est_value: 0, notes: "", activities: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }));
    const planners = WEDDING_PLANNER_LEADS.map((v, i) => ({
      ...v, id: `planner_${i}`, score: scoreVenue(v), stage: "scraped",
      assigned_to: "", est_value: 0, notes: "", activities: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }));
    const sportCharityEnt = SPORT_CHARITY_ENTERTAINMENT_LEADS.map((v, i) => ({
      ...v, id: `sce_${i}`, score: scoreVenue(v), stage: "scraped",
      assigned_to: "", est_value: 0, notes: "", activities: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }));
    const mapLeadSet = (arr, prefix) => arr.map((v, i) => ({
      ...v, id: `${prefix}_${i}`, score: scoreVenue(v), stage: "scraped",
      assigned_to: "", est_value: 0, notes: "", activities: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }));
    const enriched = [
      ...venues, ...planners, ...sportCharityEnt,
      ...mapLeadSet(PARTNERSHIP_LEADS, "partner"),
      ...mapLeadSet(UNIVERSITY_VENUE_LEADS, "uni"),
      ...mapLeadSet(HOTEL_GROUP_LEADS, "hotel"),
      ...mapLeadSet(PR_AGENCY_LEADS, "pr"),
      ...mapLeadSet(CORPORATE_EXPERIENTIAL_LEADS, "corp"),
      ...mapLeadSet(NEW_VENUE_LEADS, "newvenue"),
    ];
    setLeads(enriched);
    localStorage.setItem("hht_pipeline_v3", JSON.stringify(enriched));
  }

  useEffect(() => { if (leads.length > 0) localStorage.setItem("hht_pipeline_v3", JSON.stringify(leads)); }, [leads]);

  const updateLead = useCallback((id, updates) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l));
  }, []);

  // Fixed: moveToStage now also updates selectedLead so the modal reflects the change
  const moveToStage = useCallback((id, newStage) => {
    updateLead(id, { stage: newStage });
    setSelectedLead(prev => prev && prev.id === id ? { ...prev, stage: newStage } : prev);
  }, [updateLead]);

  const deleteLeadFn = useCallback((id) => { setLeads(prev => prev.filter(l => l.id !== id)); setSelectedLead(null); }, []);

  const categories = useMemo(() => { const c = [...new Set(leads.map(l => l.category))].sort(); return ["All", ...c]; }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!(l.venue_name || "").toLowerCase().includes(q) && !(l.city || "").toLowerCase().includes(q) && !(l.county || "").toLowerCase().includes(q) && !(l.category || "").toLowerCase().includes(q)) return false;
      }
      if (filterCategory !== "All" && l.category !== filterCategory) return false;
      if (filterCounty !== "All" && l.county !== filterCounty) return false;
      if (filterDistance === "close" && l.distance_from_london_miles > 30) return false;
      if (filterDistance === "medium" && (l.distance_from_london_miles <= 30 || l.distance_from_london_miles > 60)) return false;
      if (filterDistance === "far" && l.distance_from_london_miles <= 60) return false;
      return true;
    });
  }, [leads, searchTerm, filterCategory, filterCounty, filterDistance]);

  const counties = useMemo(() => {
    const c = [...new Set(leads.map(l => l.county).filter(Boolean))].sort();
    return ["All", ...c];
  }, [leads]);

  const handleCountyClick = useCallback((county) => {
    setFilterCounty(county);
    setView("table");
  }, []);

  const stats = useMemo(() => {
    const byStage = {}; PIPELINE_COLUMNS.forEach(c => { byStage[c.id] = 0; });
    leads.forEach(l => { byStage[l.stage] = (byStage[l.stage] || 0) + 1; });
    return { byStage, avgScore: leads.length ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0, total: leads.length };
  }, [leads]);

  const handleDragStart = (e, lead) => { setDragItem(lead); e.dataTransfer.effectAllowed = "move"; };
  const handleDrop = (e, colId) => { e.preventDefault(); if (dragItem && dragItem.stage !== colId) moveToStage(dragItem.id, colId); setDragItem(null); };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  return (
    <div style={{ fontFamily: F.sans }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, fontFamily: F.serif }}>Lead Engine</h2>
            <p style={{ color: C.inkMuted, fontSize: 13, margin: "4px 0 0" }}>
              {filterCounty !== "All" ? `${filteredLeads.length} venues in ${filterCounty}` : `${stats.total} venues`} · Avg score {stats.avgScore} · {(stats.byStage.warm_reply || 0) + (stats.byStage.converted || 0)} warm+
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowCSVImport(true)} style={btnOutline}>Import CSV</button>
            <button onClick={() => setShowAddForm(true)} style={btnOutline}>+ Add Lead</button>
            <button onClick={() => { localStorage.removeItem("hht_pipeline_v3"); initFromDB(); }} style={btnGhost}>Reset</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: C.bgWarm, borderRadius: 8, padding: 3, border: `1px solid ${C.borderLight}` }}>
            {["map", "kanban", "table", "stats", "agents", "scraper"].map(v => (
              <button key={v} onClick={() => { setView(v); if (v === "map") setFilterCounty("All"); }} style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: F.sans, background: view === v ? C.card : "transparent", color: view === v ? C.ink : C.inkMuted, boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all .2s" }}>
                {v === "map" ? "🗺 Map" : v === "agents" ? "🤖 Agents" : v === "scraper" ? "🌐 Scraper" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          {view !== "map" && <>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search venues, cities, counties..." style={{ ...inputStyle, width: 220 }} />
            <select value={filterCounty} onChange={e => setFilterCounty(e.target.value)} style={selectStyle}>
              {counties.map(c => <option key={c} value={c}>{c === "All" ? "All counties" : c}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selectStyle}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select value={filterDistance} onChange={e => setFilterDistance(e.target.value)} style={selectStyle}>
              <option value="all">All distances</option><option value="close">Within 30 mi</option><option value="medium">30–60 mi</option><option value="far">60+ mi</option>
            </select>
            {filterCounty !== "All" && (
              <button onClick={() => setFilterCounty("All")} style={{ ...btnGhost, color: C.danger, fontSize: 12 }}>✕ Clear {filterCounty}</button>
            )}
          </>}
        </div>
      </div>

      {/* PIPELINE BAR */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {PIPELINE_COLUMNS.map((col) => {
          const count = stats.byStage[col.id] || 0;
          return (
            <div key={col.id} style={{ flex: 1, padding: "10px 12px", background: `${col.color}08`, textAlign: "center", borderRight: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: col.color, fontFamily: F.sans }}>{count}</div>
              <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: F.sans }}>{col.label}</div>
            </div>
          );
        })}
      </div>

      {/* CONTENT */}
      <div>
        {view === "map" && <CountyMap leads={leads} onCountyClick={handleCountyClick} />}
        {view === "kanban" && <KanbanView leads={filteredLeads} onDragStart={handleDragStart} onDrop={handleDrop} onDragOver={handleDragOver} onSelect={setSelectedLead} onPitch={setPitchModal} onMove={moveToStage} />}
        {view === "table" && <TableView leads={filteredLeads} onSelect={setSelectedLead} onMove={moveToStage} onPitch={setPitchModal} />}
        {view === "stats" && <StatsView leads={leads} stats={stats} />}
        {view === "agents" && <AgentPanel leads={leads} onUpdateLead={updateLead} />}
        {view === "scraper" && <ScraperPanel leads={leads} onAddLeads={(newLeads) => {
          setLeads(prev => {
            const existingNames = new Set(prev.map(l => (l.venue_name || '').toLowerCase()));
            const deduped = newLeads.filter(l => !existingNames.has((l.venue_name || '').toLowerCase()));
            const merged = [...prev, ...deduped];
            localStorage.setItem("hht_pipeline_v3", JSON.stringify(merged));
            return merged;
          });
        }} />}
      </div>

      {/* MODALS */}
      {selectedLead && <DetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={(id, u) => { updateLead(id, u); setSelectedLead(prev => ({ ...prev, ...u })); }} onDelete={deleteLeadFn} onMove={moveToStage} onPitch={setPitchModal} />}
      {pitchModal && <PitchModal venue={pitchModal} onClose={() => setPitchModal(null)} />}
      {showCSVImport && <ModalWrap title="Import CSV" onClose={() => setShowCSVImport(false)}><CSVImport onImport={(newLeads) => { const e = newLeads.map((v, i) => ({ ...v, id: `imp_${Date.now()}_${i}`, score: scoreVenue(v), stage: "scraped", assigned_to: "", est_value: 0, activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() })); setLeads(p => [...p, ...e]); setShowCSVImport(false); }} onClose={() => setShowCSVImport(false)} /></ModalWrap>}
      {showAddForm && <AddModal onClose={() => setShowAddForm(false)} onAdd={(v) => { setLeads(p => [{ ...v, id: `m_${Date.now()}`, score: scoreVenue(v), stage: "scraped", assigned_to: "", est_value: 0, activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...p]); setShowAddForm(false); }} />}
    </div>
  );
}

// ═══ KANBAN ═══
function KanbanView({ leads, onDragStart, onDrop, onDragOver, onSelect, onPitch, onMove }) {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
      {PIPELINE_COLUMNS.map(col => {
        const colLeads = leads.filter(l => l.stage === col.id).sort((a, b) => (b.score || 0) - (a.score || 0));
        return (
          <div key={col.id} onDrop={e => onDrop(e, col.id)} onDragOver={onDragOver} style={{ flex: "0 0 280px", minHeight: 400, ...cardStyle({ padding: 0, overflow: "hidden", borderTop: `3px solid ${col.color}` }) }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `${col.color}06` }}>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: col.color, fontFamily: F.sans }}>{col.label}</div><div style={{ fontSize: 11, color: C.inkMuted }}>{colLeads.length} leads</div></div>
              <div style={{ ...pillStyle(`${col.color}12`, col.color), fontSize: 13, fontWeight: 900 }}>{colLeads.length}</div>
            </div>
            <div style={{ padding: 8, maxHeight: "60vh", overflowY: "auto" }}>
              {colLeads.map(lead => <KCard key={lead.id} lead={lead} col={col} onDragStart={onDragStart} onSelect={onSelect} onPitch={onPitch} />)}
              {colLeads.length === 0 && <div style={{ padding: "30px 16px", textAlign: "center", color: C.inkMuted, fontSize: 12, fontStyle: "italic" }}>Drop leads here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KCard({ lead, col, onDragStart, onSelect, onPitch }) {
  const [h, setH] = useState(false);
  const p = getPriority(lead.score || 0);
  return (
    <div draggable onDragStart={e => onDragStart(e, lead)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={() => onSelect(lead)}
      style={{ padding: "12px 14px", marginBottom: 8, borderRadius: 8, cursor: "pointer", background: h ? C.cardHover : C.card, border: `1px solid ${h ? C.border : C.borderLight}`, transition: "all 0.2s", transform: h ? "translateY(-1px)" : "none", boxShadow: h ? "0 4px 12px rgba(0,0,0,0.06)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.3, flex: 1, marginRight: 8, fontFamily: F.sans }}>{lead.venue_name}</div>
        <div style={{ fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: `${p.color}12`, color: p.color }}>{lead.score}</div>
      </div>
      <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>{lead.city || lead.location}{lead.distance_from_london_miles > 0 ? ` · ${lead.distance_from_london_miles}mi` : ""}</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={tag(col.color)}>{lead.category}</span>
        {lead.capacity > 0 && <span style={tag(C.inkMuted)}>{lead.capacity} pax</span>}
      </div>
      {lead.trigger_event && <div style={{ fontSize: 10, color: C.inkMuted, lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{lead.trigger_event}</div>}
      {(lead.stage === "enriched" || lead.stage === "scraped") && (
        <button onClick={e => { e.stopPropagation(); onPitch(lead); }} style={{ width: "100%", padding: "6px 0", borderRadius: 6, border: `1px solid ${C.accent}33`, background: C.accentSubtle, color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: F.sans, transition: "all .15s" }}>Generate Pitch</button>
      )}
    </div>
  );
}

// ═══ TABLE ═══
function TableView({ leads, onSelect, onMove, onPitch }) {
  const [sortF, setSortF] = useState("score");
  const [sortD, setSortD] = useState("desc");
  const [page, setPage] = useState(0);
  const PP = 25;
  const sorted = useMemo(() => [...leads].sort((a, b) => { let av = a[sortF], bv = b[sortF]; if (typeof av === "string") { av = av.toLowerCase(); bv = (bv || "").toLowerCase(); } return sortD === "asc" ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1); }), [leads, sortF, sortD]);
  const pg = sorted.slice(page * PP, (page + 1) * PP);
  const tp = Math.ceil(sorted.length / PP);
  const ts = (f) => { if (sortF === f) setSortD(d => d === "asc" ? "desc" : "asc"); else { setSortF(f); setSortD("desc"); } };

  return (
    <div style={{ ...cardStyle({ padding: 0, overflow: "hidden" }) }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `2px solid ${C.border}`, background: C.bgWarm }}>
            {[["venue_name","Venue"],["city","Location"],["category","Type"],["capacity","Cap."],["distance_from_london_miles","Dist."],["score","Score"],["stage","Stage"],["","Actions"]].map(([k,l]) => (
              <th key={k||l} onClick={() => k && ts(k)} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.inkSec, textTransform: "uppercase", letterSpacing: 0.5, cursor: k ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none", fontFamily: F.sans }}>{l}{sortF===k?(sortD==="asc"?" ↑":" ↓"):""}</th>
            ))}
          </tr></thead>
          <tbody>{pg.map(lead => {
            const p = getPriority(lead.score || 0); const sc = PIPELINE_COLUMNS.find(c => c.id === lead.stage);
            return (
              <tr key={lead.id} onClick={() => onSelect(lead)} style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.accentSubtle} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: C.ink, maxWidth: 220, fontFamily: F.sans }}>{lead.venue_name}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: C.inkSec }}>{lead.city}{lead.county && lead.county !== "Greater London" ? `, ${lead.county}` : ""}</td>
                <td style={{ padding: "10px 14px" }}><span style={tag(sc?.color || C.info)}>{lead.category}</span></td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: C.inkSec }}>{lead.capacity || "—"}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: C.inkSec }}>{lead.distance_from_london_miles === 0 ? "Central" : `${lead.distance_from_london_miles}mi`}</td>
                <td style={{ padding: "10px 14px" }}><span style={{ ...pillStyle(`${p.color}12`, p.color) }}>{lead.score}</span></td>
                <td style={{ padding: "10px 14px" }}><select value={lead.stage} onClick={e => e.stopPropagation()} onChange={e => onMove(lead.id, e.target.value)} style={{ background: `${sc?.color || C.accent}08`, color: sc?.color || C.accent, border: `1px solid ${sc?.color || C.accent}25`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none", fontFamily: F.sans }}>{PIPELINE_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></td>
                <td style={{ padding: "10px 14px" }}><button onClick={e => { e.stopPropagation(); onPitch(lead); }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.accent}33`, background: C.accentSubtle, color: C.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.sans }}>Pitch</button></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: `1px solid ${C.border}`, background: C.bgWarm }}>
        <span style={{ fontSize: 12, color: C.inkMuted }}>Showing {page*PP+1}–{Math.min((page+1)*PP, sorted.length)} of {sorted.length}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} style={{...pgBtn, opacity: page===0 ? 0.4 : 1}}>←</button>
          <span style={{ padding: "4px 10px", fontSize: 12, color: C.inkSec, fontFamily: F.sans }}>{page+1}/{tp}</span>
          <button onClick={() => setPage(p => Math.min(tp-1, p+1))} disabled={page>=tp-1} style={{...pgBtn, opacity: page>=tp-1 ? 0.4 : 1}}>→</button>
        </div>
      </div>
    </div>
  );
}

// ═══ STATS ═══
function StatsView({ leads, stats }) {
  const byCat = useMemo(() => { const m = {}; leads.forEach(l => { m[l.category] = (m[l.category] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [leads]);
  const byCo = useMemo(() => { const m = {}; leads.forEach(l => { m[l.county || "Unknown"] = (m[l.county || "Unknown"] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [leads]);
  const scoreDist = useMemo(() => { const b = {"90-100":0,"80-89":0,"70-79":0,"60-69":0,"50-59":0,"<50":0}; leads.forEach(l => { const s=l.score||0; if(s>=90)b["90-100"]++;else if(s>=80)b["80-89"]++;else if(s>=70)b["70-79"]++;else if(s>=60)b["60-69"]++;else if(s>=50)b["50-59"]++;else b["<50"]++; }); return Object.entries(b); }, [leads]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ ...cardStyle({ padding: 20 }) }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 16px", fontFamily: F.serif }}>Score Distribution</h3>
        {scoreDist.map(([r, c]) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.inkSec, width: 50, fontFamily: F.mono }}>{r}</span>
            <div style={{ flex: 1, height: 20, background: C.bgWarm, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, width: `${(c / leads.length) * 100}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})` }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink, width: 30, textAlign: "right", fontFamily: F.mono }}>{c}</span>
          </div>
        ))}
      </div>
      <div style={{ ...cardStyle({ padding: 20 }) }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 16px", fontFamily: F.serif }}>By Category</h3>
        {byCat.map(([cat, n]) => <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderLight}` }}><span style={{ fontSize: 13, color: C.ink }}>{cat}</span><span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{n}</span></div>)}
      </div>
      <div style={{ ...cardStyle({ padding: 20 }) }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 16px", fontFamily: F.serif }}>By County / Region</h3>
        {byCo.map(([co, n]) => <div key={co} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderLight}` }}><span style={{ fontSize: 13, color: C.ink }}>{co}</span><span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{n}</span></div>)}
      </div>
      <div style={{ ...cardStyle({ padding: 20 }) }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 16px", fontFamily: F.serif }}>Pipeline Summary</h3>
        {PIPELINE_COLUMNS.map(col => { const c = stats.byStage[col.id]||0; return (
          <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: col.color }} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{col.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: col.color }}>{c}</span>
          </div>
        ); })}
      </div>
    </div>
  );
}

// ═══ PITCH MODAL ═══
function PitchModal({ venue, onClose }) {
  const [pitch, setPitch] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPitch(generatePitch(venue)), 800); return () => clearTimeout(t); }, [venue]);
  const copy = () => { if (pitch) { navigator.clipboard.writeText(`Subject: ${pitch.subject}\n\n${pitch.body}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  return (
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...cardStyle({ padding: 0, width: 720, maxHeight: "90vh", overflow: "auto", borderRadius: 14, boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }) }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.bgWarm }}>
        <div><div style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: F.sans }}>AI Triple Win Pitch</div><div style={{ fontSize: 17, fontWeight: 700, color: C.ink, fontFamily: F.serif }}>{venue.venue_name}</div></div>
        <button onClick={onClose} style={closeBtn}>✕</button>
      </div>
      <div style={{ padding: 24 }}>
        {!pitch ? <div style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 14, color: C.accent }}>Generating personalised pitch...</div></div> : <>
          <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 16, background: C.accentSubtle, border: `1px solid ${C.accent}20` }}>
            <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>Subject: </span><span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>{pitch.subject}</span>
          </div>
          <div style={{ padding: "20px 24px", borderRadius: 10, background: C.bgWarm, border: `1px solid ${C.borderLight}`, fontFamily: F.serif, fontSize: 13, lineHeight: 1.8, color: C.ink, whiteSpace: "pre-wrap" }}>{pitch.body}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={copy} style={btnPrimary}>{copied ? "Copied!" : "Copy to Clipboard"}</button>
            <button onClick={onClose} style={btnOutline}>Close</button>
          </div>
        </>}
      </div>
    </div></div>
  );
}

// ═══ DETAIL MODAL ═══
function DetailModal({ lead, onClose, onUpdate, onDelete, onMove, onPitch }) {
  const [newNote, setNewNote] = useState("");
  const [actType, setActType] = useState("note");
  const p = getPriority(lead.score || 0);
  const addAct = () => { if (!newNote.trim()) return; const a = { type: actType, text: newNote.trim(), date: new Date().toISOString(), by: "Joe Stokoe" }; onUpdate(lead.id, { activities: [...(lead.activities || []), a] }); setNewNote(""); };

  return (
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...cardStyle({ padding: 0, width: 640, maxHeight: "90vh", overflow: "auto", borderRadius: 14, boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }) }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: C.bgWarm }}>
        <div><div style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: F.serif }}>{lead.venue_name}</div><div style={{ fontSize: 13, color: C.inkSec, marginTop: 4 }}>{lead.location || lead.city} · {lead.distance_from_london_miles === 0 ? "Central London" : `${lead.distance_from_london_miles} miles`}</div></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ ...pillStyle(`${p.color}12`, p.color), fontSize: 14, fontWeight: 800 }}>{lead.score}</div><button onClick={onClose} style={closeBtn}>✕</button></div>
      </div>
      <div style={{ padding: 24 }}>
        {/* Stage buttons — FIXED: these now properly move the lead */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {PIPELINE_COLUMNS.map(col => <button key={col.id} onClick={() => onMove(lead.id, col.id)} style={{ flex: 1, padding: "7px 4px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: F.sans, border: lead.stage === col.id ? `2px solid ${col.color}` : `1px solid ${C.border}`, background: lead.stage === col.id ? `${col.color}12` : C.card, color: lead.stage === col.id ? col.color : C.inkMuted, transition: "all .15s" }}>{col.label}</button>)}
        </div>
        {/* Info */}
        <div style={{ ...cardStyle({ padding: 16, marginBottom: 16, background: C.bgWarm }) }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Category", lead.category], ["Capacity", lead.capacity ? `${lead.capacity} pax` : "—"], ["Website", lead.website || "—"], ["Assigned", lead.assigned_to || "Unassigned"]].map(([l, v]) => (
              <div key={l}><div style={{ ...lbl, marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, color: C.ink }}>{v}</div></div>
            ))}
          </div>
          {lead.trigger_event && <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}><div style={{ ...lbl, marginBottom: 4 }}>Trigger / Notes</div><div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.5 }}>{lead.trigger_event}</div></div>}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <select value={lead.assigned_to || ""} onChange={e => onUpdate(lead.id, { assigned_to: e.target.value })} style={{ ...selectStyle, flex: 1 }}><option value="">Assign to...</option>{TEAM.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <button onClick={() => onPitch(lead)} style={btnAccent}>Generate Pitch</button>
        </div>
        {/* Activity */}
        <div style={{ ...cardStyle({ padding: 16 }) }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 10px", fontFamily: F.serif }}>Activity Log</h4>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {["note","call","email","meeting"].map(t => <button key={t} onClick={() => setActType(t)} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.sans, border: actType === t ? `1px solid ${C.accent}` : `1px solid ${C.border}`, background: actType === t ? C.accentSubtle : C.card, color: actType === t ? C.accent : C.inkMuted }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addAct()} placeholder="Log activity..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addAct} style={btnPrimary}>Add</button>
          </div>
          {(lead.activities || []).length > 0 && <div style={{ marginTop: 14 }}>
            {[...(lead.activities || [])].reverse().map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: C.accent, marginTop: 5, flexShrink: 0 }} />
              <div><div style={{ fontSize: 12, color: C.ink }}>{a.text}</div><div style={{ fontSize: 10, color: C.inkMuted, marginTop: 2 }}>{a.type} · {a.by} · {new Date(a.date).toLocaleDateString("en-GB")}</div></div>
            </div>)}
          </div>}
        </div>
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button onClick={() => { if (confirm("Delete this lead permanently?")) onDelete(lead.id); }} style={btnDanger}>Delete Lead</button>
        </div>
      </div>
    </div></div>
  );
}

// ═══ ADD MODAL ═══
function AddModal({ onClose, onAdd }) {
  const [f, setF] = useState({ venue_name: "", location: "", city: "", county: "", category: "Wedding Venue", capacity: "", distance_from_london_miles: "", website: "", trigger_event: "", contact_email: "", phone: "" });
  return (
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...cardStyle({ padding: 0, width: 500, borderRadius: 14, boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }) }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", background: C.bgWarm }}><h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: 0, fontFamily: F.serif }}>Add New Venue Lead</h3><button onClick={onClose} style={closeBtn}>✕</button></div>
      <div style={{ padding: 24, display: "grid", gap: 12 }}>
        <div><label style={lbl}>Venue Name *</label><input value={f.venue_name} onChange={e => setF({...f, venue_name: e.target.value})} style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>City</label><input value={f.city} onChange={e => setF({...f, city: e.target.value})} style={inputStyle} /></div>
          <div><label style={lbl}>County</label><input value={f.county} onChange={e => setF({...f, county: e.target.value})} style={inputStyle} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Category</label><select value={f.category} onChange={e => setF({...f, category: e.target.value})} style={selectStyle}>{["Wedding Venue","Country Estate","Historic Hall","Event Space","Barn Venue","Livery Hall","Museum/Gallery","Castle","Conference Centre"].map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label style={lbl}>Capacity</label><input type="number" value={f.capacity} onChange={e => setF({...f, capacity: e.target.value})} style={inputStyle} /></div>
          <div><label style={lbl}>Miles from London</label><input type="number" value={f.distance_from_london_miles} onChange={e => setF({...f, distance_from_london_miles: e.target.value})} style={inputStyle} /></div>
        </div>
        <div><label style={lbl}>Website</label><input value={f.website} onChange={e => setF({...f, website: e.target.value})} style={inputStyle} /></div>
        <div><label style={lbl}>Trigger / Notes</label><textarea value={f.trigger_event} onChange={e => setF({...f, trigger_event: e.target.value})} rows={3} style={{...inputStyle, resize:"vertical"}} /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnOutline}>Cancel</button>
          <button onClick={() => { if(!f.venue_name.trim()) return; onAdd({...f, capacity: parseInt(f.capacity)||0, distance_from_london_miles: parseInt(f.distance_from_london_miles)||0}); }} style={btnPrimary}>Add Lead</button>
        </div>
      </div>
    </div></div>
  );
}

function ModalWrap({ title, onClose, children }) {
  return (
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...cardStyle({ padding: 24, width: 600, maxHeight: "85vh", overflow: "auto", borderRadius: 14, boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }) }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: 0, fontFamily: F.serif }}>{title}</h3><button onClick={onClose} style={closeBtn}>✕</button></div>
      {children}
    </div></div>
  );
}
