import { useState, useEffect, useMemo, useCallback } from "react";
import { VENUE_DATABASE } from "../lib/venueData";
import CSVImport from "./CSVImport";

// ═══════════════════════════════════════════════════════════════
// HH&T Lead Generation CRM — "Dark Mode Supremacy" + Liquid Glass
// Kanban Pipeline: Scraped → Enriched → Outreach → Warm Reply → Converted
// ═══════════════════════════════════════════════════════════════

const PIPELINE_COLUMNS = [
  { id: "scraped", label: "Scraped Leads", color: "#CD7F32" },
  { id: "enriched", label: "Enriched & Scored", color: "#B87333" },
  { id: "outreach", label: "Outreach Deployed", color: "#C9A961" },
  { id: "warm_reply", label: "Warm Reply", color: "#D4A844" },
  { id: "converted", label: "Converted to Project", color: "#8B6914" },
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
  else if (cat.includes("event") || cat.includes("museum")) s += 8;
  else s += 5;
  if (v.trigger_event && v.trigger_event.length > 50) s += 10;
  else s += 5;
  return Math.min(s, 100);
}

function getPriority(score) {
  if (score >= 85) return { label: "Hot", color: "#FF4444" };
  if (score >= 70) return { label: "Warm", color: "#D4A844" };
  if (score >= 55) return { label: "Cool", color: "#B87333" };
  return { label: "Cold", color: "#666" };
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

// ═══════════════════════════════════════════════════════════════
// DARK MODE STYLES
// ═══════════════════════════════════════════════════════════════
const S = {
  glass: { background: "rgba(30, 25, 20, 0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(205, 127, 50, 0.15)", borderRadius: 16 },
  copper: "#CD7F32", copperLight: "#D4A844", copperDark: "#8B6914", bronze: "#B87333",
  textPrimary: "#e8e0d4", textSecondary: "#9a8e7f", textMuted: "#6b6055",
  bgInput: "rgba(20, 18, 14, 0.8)",
};

export default function LeadEngineCRM() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [pitchModal, setPitchModal] = useState(null);
  const [view, setView] = useState("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDistance, setFilterDistance] = useState("all");
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragItem, setDragItem] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("hht_pipeline_v2");
    if (stored) { try { setLeads(JSON.parse(stored)); return; } catch {} }
    initFromDB();
  }, []);

  function initFromDB() {
    const enriched = VENUE_DATABASE.map((v, i) => ({
      ...v, id: `venue_${i}`, score: scoreVenue(v), stage: i < 60 ? "scraped" : "enriched",
      assigned_to: "", est_value: 0, notes: "", activities: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }));
    setLeads(enriched);
    localStorage.setItem("hht_pipeline_v2", JSON.stringify(enriched));
  }

  useEffect(() => { if (leads.length > 0) localStorage.setItem("hht_pipeline_v2", JSON.stringify(leads)); }, [leads]);

  const updateLead = useCallback((id, updates) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l));
  }, []);
  const moveToStage = useCallback((id, newStage) => { updateLead(id, { stage: newStage }); }, [updateLead]);
  const deleteLeadFn = useCallback((id) => { setLeads(prev => prev.filter(l => l.id !== id)); setSelectedLead(null); }, []);

  const categories = useMemo(() => { const c = [...new Set(leads.map(l => l.category))].sort(); return ["All", ...c]; }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!(l.venue_name || "").toLowerCase().includes(q) && !(l.city || "").toLowerCase().includes(q) && !(l.county || "").toLowerCase().includes(q) && !(l.category || "").toLowerCase().includes(q)) return false;
      }
      if (filterCategory !== "All" && l.category !== filterCategory) return false;
      if (filterDistance === "close" && l.distance_from_london_miles > 30) return false;
      if (filterDistance === "medium" && (l.distance_from_london_miles <= 30 || l.distance_from_london_miles > 60)) return false;
      if (filterDistance === "far" && l.distance_from_london_miles <= 60) return false;
      return true;
    });
  }, [leads, searchTerm, filterCategory, filterDistance]);

  const stats = useMemo(() => {
    const byStage = {}; PIPELINE_COLUMNS.forEach(c => { byStage[c.id] = 0; });
    leads.forEach(l => { byStage[l.stage] = (byStage[l.stage] || 0) + 1; });
    return { byStage, avgScore: leads.length ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0, total: leads.length };
  }, [leads]);

  const handleDragStart = (e, lead) => { setDragItem(lead); e.dataTransfer.effectAllowed = "move"; };
  const handleDrop = (e, colId) => { e.preventDefault(); if (dragItem && dragItem.stage !== colId) moveToStage(dragItem.id, colId); setDragItem(null); };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  return (
    <div style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1510 50%, #0d0d0d 100%)", minHeight: "100vh", color: "#e8e0d4", fontFamily: "'Lato', -apple-system, sans-serif" }}>
      {/* HEADER */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(205,127,50,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", margin: 0, background: "linear-gradient(135deg, #CD7F32, #D4A844, #B87333)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lead Engine</h1>
            <p style={{ color: S.textSecondary, fontSize: 13, margin: "4px 0 0" }}>{stats.total} venues · Avg score {stats.avgScore} · {stats.byStage.warm_reply + stats.byStage.converted} warm+</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowCSVImport(true)} style={btnGhost}>⬆ Import</button>
            <button onClick={() => setShowAddForm(true)} style={btnGhost}>+ Add Lead</button>
            <button onClick={() => { localStorage.removeItem("hht_pipeline_v2"); initFromDB(); }} style={btnGhost}>↻ Reset</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ ...S.glass, display: "flex", padding: 3, borderRadius: 10 }}>
            {["kanban", "table", "stats"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: view === v ? "rgba(205,127,50,0.2)" : "transparent", color: view === v ? S.copperLight : S.textSecondary, transition: "all .2s" }}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
            ))}
          </div>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search venues, cities, counties..." style={{ ...S.glass, padding: "8px 14px", border: "1px solid rgba(205,127,50,0.15)", borderRadius: 10, background: S.bgInput, color: S.textPrimary, fontSize: 13, width: 260, outline: "none" }} />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selStyle}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select value={filterDistance} onChange={e => setFilterDistance(e.target.value)} style={selStyle}>
            <option value="all">All distances</option><option value="close">≤30 mi</option><option value="medium">30-60 mi</option><option value="far">60+ mi</option>
          </select>
        </div>
      </div>

      {/* PIPELINE BAR */}
      <div style={{ display: "flex", gap: 2, padding: "16px 32px 0", overflow: "auto" }}>
        {PIPELINE_COLUMNS.map((col, i) => {
          const count = stats.byStage[col.id] || 0;
          return (
            <div key={col.id} style={{ flex: 1, padding: "10px 12px", borderRadius: i === 0 ? "10px 0 0 10px" : i === 4 ? "0 10px 10px 0" : 0, background: `linear-gradient(135deg, ${col.color}22, ${col.color}11)`, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: col.color }}>{count}</div>
              <div style={{ fontSize: 10, color: S.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>{col.label}</div>
            </div>
          );
        })}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "16px 32px 32px" }}>
        {view === "kanban" && <KanbanView leads={filteredLeads} onDragStart={handleDragStart} onDrop={handleDrop} onDragOver={handleDragOver} onSelect={setSelectedLead} onPitch={setPitchModal} onMove={moveToStage} />}
        {view === "table" && <TableView leads={filteredLeads} onSelect={setSelectedLead} onMove={moveToStage} onPitch={setPitchModal} />}
        {view === "stats" && <StatsView leads={leads} stats={stats} />}
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
          <div key={col.id} onDrop={e => onDrop(e, col.id)} onDragOver={onDragOver} style={{ flex: "0 0 280px", minHeight: 400, ...S.glass, borderRadius: 14, overflow: "hidden", borderTop: `3px solid ${col.color}` }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(205,127,50,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</div><div style={{ fontSize: 11, color: S.textMuted }}>{colLeads.length} leads</div></div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${col.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: col.color }}>{colLeads.length}</div>
            </div>
            <div style={{ padding: 8, maxHeight: "60vh", overflowY: "auto" }}>
              {colLeads.map(lead => <KCard key={lead.id} lead={lead} col={col} onDragStart={onDragStart} onSelect={onSelect} onPitch={onPitch} />)}
              {colLeads.length === 0 && <div style={{ padding: "30px 16px", textAlign: "center", color: S.textMuted, fontSize: 12 }}>Drop leads here</div>}
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
      style={{ padding: "12px 14px", marginBottom: 8, borderRadius: 12, cursor: "pointer", background: h ? "rgba(50,40,30,0.7)" : "rgba(25,20,16,0.5)", backdropFilter: "blur(12px)", border: `1px solid ${h ? "rgba(205,127,50,0.3)" : "rgba(205,127,50,0.08)"}`, transition: "all 0.2s", transform: h ? "translateY(-1px)" : "none", boxShadow: h ? "0 4px 20px rgba(205,127,50,0.1)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: S.textPrimary, lineHeight: 1.3, flex: 1, marginRight: 8 }}>{lead.venue_name}</div>
        <div style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 6, background: `${p.color}22`, color: p.color, whiteSpace: "nowrap" }}>{lead.score}</div>
      </div>
      <div style={{ fontSize: 11, color: S.textSecondary, marginBottom: 4 }}>{lead.city || lead.location}{lead.distance_from_london_miles > 0 ? ` · ${lead.distance_from_london_miles}mi` : ""}</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={tag(col.color)}>{lead.category}</span>
        {lead.capacity > 0 && <span style={tag("#666")}>{lead.capacity} pax</span>}
      </div>
      {lead.trigger_event && <div style={{ fontSize: 10, color: S.textMuted, lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{lead.trigger_event}</div>}
      {(lead.stage === "enriched" || lead.stage === "scraped") && (
        <button onClick={e => { e.stopPropagation(); onPitch(lead); }} style={{ width: "100%", padding: "6px 0", borderRadius: 8, border: "1px solid rgba(205,127,50,0.3)", background: "linear-gradient(135deg, rgba(205,127,50,0.15), rgba(184,115,51,0.1))", color: S.copperLight, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✦ Generate Pitch</button>
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
    <div style={{ ...S.glass, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(205,127,50,0.15)" }}>
            {[["venue_name","Venue"],["city","Location"],["category","Type"],["capacity","Cap."],["distance_from_london_miles","Dist."],["score","Score"],["stage","Stage"],["","Actions"]].map(([k,l]) => (
              <th key={k||l} onClick={() => k && ts(k)} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: S.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, cursor: k ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none" }}>{l}{sortF===k?(sortD==="asc"?" ↑":" ↓"):""}</th>
            ))}
          </tr></thead>
          <tbody>{pg.map(lead => {
            const p = getPriority(lead.score || 0); const sc = PIPELINE_COLUMNS.find(c => c.id === lead.stage);
            return (
              <tr key={lead.id} onClick={() => onSelect(lead)} style={{ borderBottom: "1px solid rgba(205,127,50,0.06)", cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(205,127,50,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: S.textPrimary, maxWidth: 220 }}>{lead.venue_name}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: S.textSecondary }}>{lead.city}{lead.county && lead.county !== "Greater London" ? `, ${lead.county}` : ""}</td>
                <td style={{ padding: "10px 14px" }}><span style={tag(S.bronze)}>{lead.category}</span></td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: S.textSecondary }}>{lead.capacity || "—"}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: S.textSecondary }}>{lead.distance_from_london_miles === 0 ? "Central" : `${lead.distance_from_london_miles}mi`}</td>
                <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: `${p.color}22`, color: p.color }}>{lead.score}</span></td>
                <td style={{ padding: "10px 14px" }}><select value={lead.stage} onClick={e => e.stopPropagation()} onChange={e => onMove(lead.id, e.target.value)} style={{ background: `${sc?.color || S.copper}15`, color: sc?.color || S.copper, border: `1px solid ${sc?.color || S.copper}33`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none" }}>{PIPELINE_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></td>
                <td style={{ padding: "10px 14px" }}><button onClick={e => { e.stopPropagation(); onPitch(lead); }} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(205,127,50,0.3)", background: "transparent", color: S.copperLight, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✦ Pitch</button></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid rgba(205,127,50,0.1)" }}>
        <span style={{ fontSize: 12, color: S.textMuted }}>Showing {page*PP+1}-{Math.min((page+1)*PP, sorted.length)} of {sorted.length}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} style={pgBtn}>←</button>
          <span style={{ padding: "4px 10px", fontSize: 12, color: S.textSecondary }}>{page+1}/{tp}</span>
          <button onClick={() => setPage(p => Math.min(tp-1, p+1))} disabled={page>=tp-1} style={pgBtn}>→</button>
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
      <div style={{ ...S.glass, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: S.copperLight, margin: "0 0 16px" }}>Score Distribution</h3>
        {scoreDist.map(([r, c]) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: S.textSecondary, width: 50 }}>{r}</span>
            <div style={{ flex: 1, height: 20, background: "rgba(20,18,14,0.8)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, width: `${(c / leads.length) * 100}%`, background: `linear-gradient(90deg, ${S.copper}, ${S.copperLight})` }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: S.textPrimary, width: 30, textAlign: "right" }}>{c}</span>
          </div>
        ))}
      </div>
      <div style={{ ...S.glass, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: S.copperLight, margin: "0 0 16px" }}>By Category</h3>
        {byCat.map(([cat, n]) => <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(205,127,50,0.06)" }}><span style={{ fontSize: 13, color: S.textPrimary }}>{cat}</span><span style={{ fontSize: 13, fontWeight: 700, color: S.copperLight }}>{n}</span></div>)}
      </div>
      <div style={{ ...S.glass, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: S.copperLight, margin: "0 0 16px" }}>By County / Region</h3>
        {byCo.map(([co, n]) => <div key={co} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(205,127,50,0.06)" }}><span style={{ fontSize: 13, color: S.textPrimary }}>{co}</span><span style={{ fontSize: 13, fontWeight: 700, color: S.copperLight }}>{n}</span></div>)}
      </div>
      <div style={{ ...S.glass, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: S.copperLight, margin: "0 0 16px" }}>Pipeline Summary</h3>
        {PIPELINE_COLUMNS.map(col => { const c = stats.byStage[col.id]||0; return (
          <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: col.color }} />
            <span style={{ fontSize: 13, color: S.textPrimary, flex: 1 }}>{col.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{c}</span>
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
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...S.glass, width: 720, maxHeight: "90vh", overflow: "auto", borderRadius: 20, border: "1px solid rgba(205,127,50,0.2)", boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(205,127,50,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontSize: 11, fontWeight: 700, color: S.copper, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>✦ AI Triple Win Pitch</div><div style={{ fontSize: 17, fontWeight: 700, color: S.textPrimary }}>{venue.venue_name}</div></div>
        <button onClick={onClose} style={closeBtn}>✕</button>
      </div>
      <div style={{ padding: 24 }}>
        {!pitch ? <div style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 14, color: S.copperLight }}>Generating personalised pitch...</div></div> : <>
          <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, background: "rgba(205,127,50,0.08)", border: "1px solid rgba(205,127,50,0.15)" }}>
            <span style={{ fontSize: 11, color: S.textMuted }}>Subject: </span><span style={{ fontSize: 13, fontWeight: 600, color: S.copperLight }}>{pitch.subject}</span>
          </div>
          <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(15,12,10,0.6)", border: "1px solid rgba(205,127,50,0.08)", fontFamily: "'Georgia', serif", fontSize: 13, lineHeight: 1.8, color: S.textPrimary, whiteSpace: "pre-wrap" }}>{pitch.body}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={copy} style={btnPrimary}>{copied ? "✓ Copied!" : "Copy to Clipboard"}</button>
            <button onClick={onClose} style={btnGhost}>Close</button>
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
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...S.glass, width: 640, maxHeight: "90vh", overflow: "auto", borderRadius: 20, border: "1px solid rgba(205,127,50,0.2)", boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(205,127,50,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><div style={{ fontSize: 20, fontWeight: 800, color: S.textPrimary }}>{lead.venue_name}</div><div style={{ fontSize: 13, color: S.textSecondary, marginTop: 4 }}>{lead.location || lead.city} · {lead.distance_from_london_miles === 0 ? "Central London" : `${lead.distance_from_london_miles} miles`}</div></div>
        <div style={{ display: "flex", gap: 8 }}><div style={{ padding: "4px 12px", borderRadius: 8, fontWeight: 800, fontSize: 14, background: `${p.color}22`, color: p.color }}>{lead.score}</div><button onClick={onClose} style={closeBtn}>✕</button></div>
      </div>
      <div style={{ padding: 24 }}>
        {/* Stage buttons */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {PIPELINE_COLUMNS.map(col => <button key={col.id} onClick={() => onMove(lead.id, col.id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: "pointer", border: lead.stage === col.id ? `2px solid ${col.color}` : "1px solid rgba(205,127,50,0.1)", background: lead.stage === col.id ? `${col.color}22` : "transparent", color: lead.stage === col.id ? col.color : S.textMuted }}>{col.label}</button>)}
        </div>
        {/* Info */}
        <div style={{ ...S.glass, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Category", lead.category], ["Capacity", lead.capacity ? `${lead.capacity} pax` : "—"], ["Website", lead.website || "—"], ["Assigned", lead.assigned_to || "Unassigned"]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 10, fontWeight: 700, color: S.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, color: S.textPrimary }}>{v}</div></div>
            ))}
          </div>
          {lead.trigger_event && <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(205,127,50,0.08)" }}><div style={{ fontSize: 10, fontWeight: 700, color: S.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Trigger / Notes</div><div style={{ fontSize: 12, color: S.textSecondary, lineHeight: 1.5 }}>{lead.trigger_event}</div></div>}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <select value={lead.assigned_to || ""} onChange={e => onUpdate(lead.id, { assigned_to: e.target.value })} style={{ ...selStyle, flex: 1 }}><option value="">Assign to...</option>{TEAM.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <button onClick={() => onPitch(lead)} style={btnPrimary}>✦ Generate Pitch</button>
        </div>
        {/* Activity */}
        <div style={{ ...S.glass, borderRadius: 12, padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: S.copperLight, margin: "0 0 10px" }}>Activity Log</h4>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {["note","call","email","meeting"].map(t => <button key={t} onClick={() => setActType(t)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: actType === t ? `1px solid ${S.copper}` : "1px solid rgba(205,127,50,0.1)", background: actType === t ? "rgba(205,127,50,0.15)" : "transparent", color: actType === t ? S.copperLight : S.textMuted }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addAct()} placeholder="Log activity..." style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(205,127,50,0.15)", background: S.bgInput, color: S.textPrimary, fontSize: 12, outline: "none" }} />
            <button onClick={addAct} style={btnPrimary}>Add</button>
          </div>
          {(lead.activities || []).length > 0 && <div style={{ marginTop: 14 }}>
            {[...(lead.activities || [])].reverse().map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(205,127,50,0.05)" }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: S.copper, marginTop: 5, flexShrink: 0 }} />
              <div><div style={{ fontSize: 12, color: S.textPrimary }}>{a.text}</div><div style={{ fontSize: 10, color: S.textMuted, marginTop: 2 }}>{a.type} · {a.by} · {new Date(a.date).toLocaleDateString("en-GB")}</div></div>
            </div>)}
          </div>}
        </div>
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button onClick={() => { if (confirm("Delete this lead permanently?")) onDelete(lead.id); }} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(255,68,68,0.2)", background: "rgba(255,68,68,0.08)", color: "#FF4444", fontSize: 12, cursor: "pointer" }}>Delete Lead</button>
        </div>
      </div>
    </div></div>
  );
}

// ═══ ADD MODAL ═══
function AddModal({ onClose, onAdd }) {
  const [f, setF] = useState({ venue_name: "", location: "", city: "", county: "", category: "Wedding Venue", capacity: "", distance_from_london_miles: "", website: "", trigger_event: "", contact_email: "", phone: "" });
  const fs = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(205,127,50,0.15)", background: S.bgInput, color: S.textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box" };
  return (
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...S.glass, width: 500, borderRadius: 20, border: "1px solid rgba(205,127,50,0.2)", boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(205,127,50,0.1)", display: "flex", justifyContent: "space-between" }}><h3 style={{ fontSize: 17, fontWeight: 700, color: S.textPrimary, margin: 0 }}>Add New Venue Lead</h3><button onClick={onClose} style={closeBtn}>✕</button></div>
      <div style={{ padding: 24, display: "grid", gap: 12 }}>
        <div><label style={lbl}>Venue Name *</label><input value={f.venue_name} onChange={e => setF({...f, venue_name: e.target.value})} style={fs} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>City</label><input value={f.city} onChange={e => setF({...f, city: e.target.value})} style={fs} /></div>
          <div><label style={lbl}>County</label><input value={f.county} onChange={e => setF({...f, county: e.target.value})} style={fs} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Category</label><select value={f.category} onChange={e => setF({...f, category: e.target.value})} style={{...fs, cursor:"pointer"}}>{["Wedding Venue","Country Estate","Historic Hall","Event Space","Barn Venue","Livery Hall","Museum/Gallery","Castle","Conference Centre"].map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label style={lbl}>Capacity</label><input type="number" value={f.capacity} onChange={e => setF({...f, capacity: e.target.value})} style={fs} /></div>
          <div><label style={lbl}>Miles from London</label><input type="number" value={f.distance_from_london_miles} onChange={e => setF({...f, distance_from_london_miles: e.target.value})} style={fs} /></div>
        </div>
        <div><label style={lbl}>Website</label><input value={f.website} onChange={e => setF({...f, website: e.target.value})} style={fs} /></div>
        <div><label style={lbl}>Trigger / Notes</label><textarea value={f.trigger_event} onChange={e => setF({...f, trigger_event: e.target.value})} rows={3} style={{...fs, resize:"vertical"}} /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={() => { if(!f.venue_name.trim()) return; onAdd({...f, capacity: parseInt(f.capacity)||0, distance_from_london_miles: parseInt(f.distance_from_london_miles)||0}); }} style={btnPrimary}>Add Lead</button>
        </div>
      </div>
    </div></div>
  );
}

function ModalWrap({ title, onClose, children }) {
  return (
    <div style={overlay} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ ...S.glass, width: 600, maxHeight: "85vh", overflow: "auto", borderRadius: 20, border: "1px solid rgba(205,127,50,0.2)", boxShadow: "0 25px 80px rgba(0,0,0,0.6)", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700, color: S.textPrimary, margin: 0 }}>{title}</h3><button onClick={onClose} style={closeBtn}>✕</button></div>
      {children}
    </div></div>
  );
}

// ═══ SHARED STYLES ═══
const overlay = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const closeBtn = { width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(205,127,50,0.15)", background: "rgba(30,25,20,0.6)", color: S.textSecondary, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const btnPrimary = { padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(205,127,50,0.4)", background: "linear-gradient(135deg, rgba(205,127,50,0.2), rgba(184,115,51,0.15))", color: "#D4A844", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnGhost = { padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(205,127,50,0.15)", background: "transparent", color: "#9a8e7f", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const selStyle = { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(205,127,50,0.15)", background: "rgba(20,18,14,0.8)", color: "#e8e0d4", fontSize: 13, outline: "none", cursor: "pointer" };
const lbl = { fontSize: 11, fontWeight: 700, color: "#9a8e7f", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, display: "block" };
const pgBtn = { padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(205,127,50,0.15)", background: "transparent", color: "#9a8e7f", fontSize: 12, cursor: "pointer" };
function tag(color) { return { display: "inline-block", padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}25` }; }
