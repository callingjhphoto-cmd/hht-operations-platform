import { useState, useEffect, useMemo, useCallback } from "react";

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

const cardStyle = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...extra });
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });
const inputStyle = { padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%", boxSizing: "border-box" };
const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 30 };
const btnPrimary = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", border: "none", background: C.ink, color: "#fff", transition: "all 0.15s" };
const btnOutline = { ...btnPrimary, background: "transparent", color: C.ink, border: `1px solid ${C.border}` };
const btnAccent = { ...btnPrimary, background: C.accent };
const btnGhost = { ...btnPrimary, background: "transparent", color: C.inkSec, padding: "6px 12px" };

const CLIENT_TYPES = ["Brand", "Corporate", "Private", "Venue Partner", "Agency"];
const SEGMENTS = ["VIP", "Active", "Dormant", "New", "At Risk"];

const TYPE_COLORS = { Brand: C.accent, Corporate: C.info, Private: C.success, "Venue Partner": C.warn, Agency: "#8B5CF6" };
const SEG_COLORS = { VIP: C.accent, Active: C.success, Dormant: C.inkMuted, New: C.info, "At Risk": C.danger };

const SEED_CLIENTS = [
  { id: "c1", name: "Diageo", type: "Brand", industry: "Spirits & Beverages", website: "diageo.com", address: "16 Great Marlborough St, London W1F 7HS", segment: "VIP", relationshipScore: 9, lifetimeRevenue: 180000, outstandingInvoices: 12000, avgEventValue: 15000, totalEvents: 12, contacts: [{ name: "Sarah Mitchell", role: "Events Director", email: "sarah.mitchell@diageo.com", phone: "020 7927 5200" }, { name: "James Park", role: "Brand Manager", email: "james.park@diageo.com", phone: "020 7927 5201" }], events: [{ name: "Johnnie Walker Masterclass", date: "2025-11-15", revenue: 12000, status: "Complete" }, { name: "Tanqueray Launch Party", date: "2025-09-20", revenue: 18000, status: "Complete" }, { name: "Diageo Summer Showcase", date: "2026-06-15", revenue: 28000, status: "Confirmed" }], tags: ["Premium Spirits", "Long-term Partner", "High Volume"], comms: [{ type: "call", note: "Discussed 2026 activation calendar", date: "2026-02-15", by: "Joe Stokoe" }, { type: "email", note: "Sent Q1 proposal for Tanqueray campaign", date: "2026-01-20", by: "Joe Stokoe" }], lastContact: "2026-02-15", created: "2022-03-10" },
  { id: "c2", name: "Pernod Ricard", type: "Brand", industry: "Spirits & Beverages", website: "pernod-ricard.com", address: "Central St Giles, London WC2H 8AG", segment: "VIP", relationshipScore: 8, lifetimeRevenue: 145000, outstandingInvoices: 8500, avgEventValue: 16100, totalEvents: 9, contacts: [{ name: "Claire Dubois", role: "UK Marketing Manager", email: "claire.dubois@pernod-ricard.com", phone: "020 7268 5800" }], events: [{ name: "Absolut Art Exhibition", date: "2025-10-05", revenue: 22000, status: "Complete" }, { name: "Havana Club Summer Series", date: "2026-07-10", revenue: 15000, status: "Planning" }], tags: ["Premium Spirits", "Creative Briefs", "Annual Contract"], comms: [{ type: "meeting", note: "2026 brand calendar planning session", date: "2026-01-30", by: "Joe Stokoe" }], lastContact: "2026-01-30", created: "2022-06-15" },
  { id: "c3", name: "William Grant & Sons", type: "Brand", industry: "Spirits & Beverages", website: "williamgrant.com", address: "4th Floor, 20 St James's St, London SW1A 1ES", segment: "Active", relationshipScore: 7, lifetimeRevenue: 85000, outstandingInvoices: 0, avgEventValue: 14200, totalEvents: 6, contacts: [{ name: "Tom Hargreaves", role: "Brand Experience Manager", email: "tom.hargreaves@wgrant.com", phone: "020 7290 2400" }], events: [{ name: "Hendrick's Gin Garden Pop-up", date: "2025-04-10", revenue: 18500, status: "Complete" }, { name: "Glenfiddich Tasting", date: "2026-03-22", revenue: 8000, status: "Confirmed" }], tags: ["Gin Focus", "Pop-up Events"], comms: [{ type: "email", note: "Follow up on Hendrick's summer activation", date: "2026-02-01", by: "Emily Blacklock" }], lastContact: "2026-02-01", created: "2023-01-20" },
  { id: "c4", name: "Campari Group", type: "Brand", industry: "Spirits & Beverages", website: "camparigroup.com", address: "Campari Group UK, London EC2A 4BX", segment: "Active", relationshipScore: 6, lifetimeRevenue: 42000, outstandingInvoices: 4200, avgEventValue: 14000, totalEvents: 3, contacts: [{ name: "Marco Rossi", role: "UK Events Lead", email: "marco.rossi@campari.com", phone: "020 7655 2100" }], events: [{ name: "Aperol Spritz Summer", date: "2025-07-12", revenue: 16000, status: "Complete" }], tags: ["Italian Spirits", "Summer Activations"], comms: [{ type: "call", note: "Pitched Negroni Week activation concept", date: "2025-12-10", by: "Joe Stokoe" }], lastContact: "2025-12-10", created: "2023-08-05" },
  { id: "c5", name: "Rémy Cointreau", type: "Brand", industry: "Spirits & Beverages", website: "remy-cointreau.com", address: "5 Golden Square, London W1F 9BS", segment: "Active", relationshipScore: 6, lifetimeRevenue: 38000, outstandingInvoices: 0, avgEventValue: 12700, totalEvents: 3, contacts: [{ name: "Amélie Laurent", role: "Brand Ambassador", email: "amelie.laurent@remy-cointreau.com", phone: "020 3102 3500" }], events: [{ name: "Cointreau Soirée", date: "2025-12-01", revenue: 14000, status: "Complete" }], tags: ["Premium Cognac", "Elegant Events"], comms: [], lastContact: "2025-12-01", created: "2023-11-15" },
  { id: "c6", name: "Goldman Sachs", type: "Corporate", industry: "Financial Services", website: "goldmansachs.com", address: "Plumtree Court, London EC4A 4HQ", segment: "VIP", relationshipScore: 8, lifetimeRevenue: 95000, outstandingInvoices: 18000, avgEventValue: 19000, totalEvents: 5, contacts: [{ name: "Victoria Chen", role: "Head of Corporate Events", email: "victoria.chen@gs.com", phone: "020 7774 1000" }, { name: "David Brown", role: "EA to Managing Director", email: "david.brown@gs.com", phone: "020 7774 1001" }], events: [{ name: "GS Summer Party 2025", date: "2025-07-18", revenue: 25000, status: "Complete" }, { name: "GS Christmas Gala", date: "2025-12-12", revenue: 22000, status: "Complete" }, { name: "GS Summer Party 2026", date: "2026-07-16", revenue: 28000, status: "Confirmed" }], tags: ["High Budget", "Repeat Client", "City Events"], comms: [{ type: "meeting", note: "Tasting session for summer party menu", date: "2026-02-20", by: "Joe Stokoe" }], lastContact: "2026-02-20", created: "2022-11-01" },
  { id: "c7", name: "Deloitte", type: "Corporate", industry: "Professional Services", website: "deloitte.co.uk", address: "1 New Street Square, London EC4A 3HQ", segment: "Active", relationshipScore: 7, lifetimeRevenue: 52000, outstandingInvoices: 0, avgEventValue: 13000, totalEvents: 4, contacts: [{ name: "Rachel Adams", role: "Events & Hospitality Manager", email: "radams@deloitte.co.uk", phone: "020 7936 3000" }], events: [{ name: "Deloitte Partner Dinner", date: "2025-11-20", revenue: 15000, status: "Complete" }], tags: ["Professional Services", "Annual Events"], comms: [{ type: "email", note: "Sent 2026 events brochure", date: "2026-01-15", by: "Emily Blacklock" }], lastContact: "2026-01-15", created: "2023-03-10" },
  { id: "c8", name: "Google UK", type: "Corporate", industry: "Technology", website: "google.co.uk", address: "1 St Giles High Street, London WC2H 8AG", segment: "Active", relationshipScore: 6, lifetimeRevenue: 35000, outstandingInvoices: 0, avgEventValue: 17500, totalEvents: 2, contacts: [{ name: "Priya Sharma", role: "People Experience Lead", email: "priyasharma@google.com", phone: "020 7031 3000" }], events: [{ name: "Google Pixel Launch Party", date: "2025-10-15", revenue: 20000, status: "Complete" }], tags: ["Tech", "Product Launches", "Creative Brief"], comms: [], lastContact: "2025-10-15", created: "2024-06-20" },
  { id: "c9", name: "Spotify", type: "Corporate", industry: "Technology", website: "spotify.com", address: "4 Savoy Court, London WC2R 0EZ", segment: "New", relationshipScore: 5, lifetimeRevenue: 12000, outstandingInvoices: 12000, avgEventValue: 12000, totalEvents: 1, contacts: [{ name: "Ben Taylor", role: "Events Coordinator", email: "ben.taylor@spotify.com", phone: "020 3219 8000" }], events: [{ name: "Spotify Wrapped Party", date: "2025-12-05", revenue: 12000, status: "Complete" }], tags: ["Tech", "Music Industry", "Growth Potential"], comms: [{ type: "email", note: "Thank you email post-event", date: "2025-12-08", by: "Emily Blacklock" }], lastContact: "2025-12-08", created: "2025-09-15" },
  { id: "c10", name: "Henderson-White Wedding", type: "Private", industry: "Private Event", website: "", address: "Oxfordshire", segment: "Active", relationshipScore: 9, lifetimeRevenue: 8500, outstandingInvoices: 4250, avgEventValue: 8500, totalEvents: 1, contacts: [{ name: "Charlotte Henderson-White", role: "Bride", email: "charlotte.hw@gmail.com", phone: "07700 900123" }], events: [{ name: "Henderson-White Wedding", date: "2026-06-21", revenue: 8500, status: "Confirmed" }], tags: ["Wedding", "Country Estate", "Premium"], comms: [{ type: "call", note: "Menu tasting confirmed for March", date: "2026-02-10", by: "Seb Davis" }], lastContact: "2026-02-10", created: "2025-08-15" },
  { id: "c11", name: "Thompson 40th Birthday", type: "Private", industry: "Private Event", website: "", address: "Chelsea, London SW3", segment: "Active", relationshipScore: 7, lifetimeRevenue: 4200, outstandingInvoices: 0, avgEventValue: 4200, totalEvents: 1, contacts: [{ name: "Mark Thompson", role: "Host", email: "mark.thompson@email.com", phone: "07700 900456" }], events: [{ name: "Mark's 40th Birthday Bash", date: "2025-10-28", revenue: 4200, status: "Complete" }], tags: ["Birthday", "Private Party", "London"], comms: [], lastContact: "2025-10-28", created: "2025-07-20" },
  { id: "c12", name: "Chambers Engagement", type: "Private", industry: "Private Event", website: "", address: "Richmond, London TW9", segment: "Dormant", relationshipScore: 5, lifetimeRevenue: 3800, outstandingInvoices: 0, avgEventValue: 3800, totalEvents: 1, contacts: [{ name: "Lucy Chambers", role: "Host", email: "lucy.chambers@email.com", phone: "07700 900789" }], events: [{ name: "Chambers Engagement Party", date: "2025-05-10", revenue: 3800, status: "Complete" }], tags: ["Engagement", "Private Party"], comms: [], lastContact: "2025-05-10", created: "2025-02-10" },
  { id: "c13", name: "The Connaught", type: "Venue Partner", industry: "Luxury Hospitality", website: "the-connaught.co.uk", address: "Carlos Place, Mayfair, London W1K 2AL", segment: "VIP", relationshipScore: 9, lifetimeRevenue: 65000, outstandingInvoices: 0, avgEventValue: 8125, totalEvents: 8, contacts: [{ name: "Alessandro Fiori", role: "Events Director", email: "a.fiori@the-connaught.co.uk", phone: "020 7499 7070" }], events: [{ name: "Connaught Cocktail Night", date: "2025-09-15", revenue: 8000, status: "Complete" }], tags: ["Luxury", "Mayfair", "Preferred Partner", "8 Referrals"], comms: [{ type: "meeting", note: "Quarterly partner review", date: "2026-01-22", by: "Joe Stokoe" }], lastContact: "2026-01-22", created: "2021-06-01" },
  { id: "c14", name: "Claridge's", type: "Venue Partner", industry: "Luxury Hospitality", website: "claridges.co.uk", address: "Brook Street, Mayfair, London W1K 4HR", segment: "Active", relationshipScore: 7, lifetimeRevenue: 42000, outstandingInvoices: 0, avgEventValue: 8400, totalEvents: 5, contacts: [{ name: "Helena Grant", role: "Private Events Manager", email: "h.grant@claridges.co.uk", phone: "020 7629 8860" }], events: [{ name: "Claridge's NYE Celebration", date: "2025-12-31", revenue: 12000, status: "Complete" }], tags: ["Art Deco", "Luxury", "5 Referrals"], comms: [], lastContact: "2025-12-31", created: "2022-04-15" },
  { id: "c15", name: "Soho House", type: "Venue Partner", industry: "Members Club", website: "sohohouse.com", address: "76 Dean Street, London W1D 3SQ", segment: "VIP", relationshipScore: 8, lifetimeRevenue: 78000, outstandingInvoices: 6500, avgEventValue: 6500, totalEvents: 12, contacts: [{ name: "Olivia Hart", role: "Group Events Director", email: "olivia.hart@sohohouse.com", phone: "020 7734 5188" }], events: [{ name: "Soho House Members' Cocktail Night", date: "2026-01-25", revenue: 6500, status: "Complete" }, { name: "Soho Farmhouse Summer Party", date: "2026-08-10", revenue: 15000, status: "Planning" }], tags: ["Members Club", "Multiple Venues", "12 Referrals", "High Volume"], comms: [{ type: "call", note: "Discussed Farmhouse summer party logistics", date: "2026-02-18", by: "Joe Stokoe" }], lastContact: "2026-02-18", created: "2021-01-10" },
  { id: "c16", name: "Imagination", type: "Agency", industry: "Experiential Agency", website: "imagination.com", address: "25 Store Street, London WC1E 7BL", segment: "Active", relationshipScore: 7, lifetimeRevenue: 65000, outstandingInvoices: 15000, avgEventValue: 16250, totalEvents: 4, contacts: [{ name: "George Mitchell", role: "Senior Producer", email: "g.mitchell@imagination.com", phone: "020 7323 3300" }], events: [{ name: "Ford UK Launch Event", date: "2025-11-08", revenue: 18000, status: "Complete" }, { name: "Samsung Galaxy Experience", date: "2026-04-15", revenue: 22000, status: "Confirmed" }], tags: ["Experiential", "Big Budget", "Tech Brands"], comms: [{ type: "email", note: "Samsung brief received, proposal due Friday", date: "2026-02-25", by: "Joe Stokoe" }], lastContact: "2026-02-25", created: "2023-02-20" },
  { id: "c17", name: "Jack Morton", type: "Agency", industry: "Brand Experience Agency", website: "jackmorton.com", address: "46 Farringdon Road, London EC1M 3JB", segment: "Active", relationshipScore: 6, lifetimeRevenue: 28000, outstandingInvoices: 0, avgEventValue: 14000, totalEvents: 2, contacts: [{ name: "Emma Williams", role: "Account Director", email: "emma.williams@jackmorton.com", phone: "020 7253 1000" }], events: [{ name: "Mastercard Priceless Experience", date: "2025-09-22", revenue: 16000, status: "Complete" }], tags: ["Agency", "Finance Brands", "Experiential"], comms: [], lastContact: "2025-09-22", created: "2024-04-10" },
];

function getSegment(client) {
  if (client.lifetimeRevenue >= 50000) return "VIP";
  const lastDate = new Date(client.lastContact || client.created);
  const monthsAgo = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsAgo > 6) return "Dormant";
  if (client.totalEvents <= 1 && client.lifetimeRevenue < 15000) return "New";
  if (monthsAgo > 3 && client.relationshipScore < 5) return "At Risk";
  return "Active";
}

export default function ClientPortal() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSegment, setFilterSegment] = useState("All");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");

  useEffect(() => {
    const stored = localStorage.getItem("hht_clients_v1");
    if (stored) { try { setClients(JSON.parse(stored)); return; } catch {} }
    setClients(SEED_CLIENTS);
    localStorage.setItem("hht_clients_v1", JSON.stringify(SEED_CLIENTS));
  }, []);

  useEffect(() => { if (clients.length > 0) localStorage.setItem("hht_clients_v1", JSON.stringify(clients)); }, [clients]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.industry?.toLowerCase().includes(q) && !c.tags?.some(t => t.toLowerCase().includes(q))) return false;
      }
      if (filterType !== "All" && c.type !== filterType) return false;
      if (filterSegment !== "All" && getSegment(c) !== filterSegment) return false;
      return true;
    });
  }, [clients, search, filterType, filterSegment]);

  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((s, c) => s + c.lifetimeRevenue, 0);
    const outstanding = clients.reduce((s, c) => s + c.outstandingInvoices, 0);
    const vipCount = clients.filter(c => getSegment(c) === "VIP").length;
    const activeCount = clients.filter(c => ["VIP", "Active", "New"].includes(getSegment(c))).length;
    return { total: clients.length, vipCount, activeCount, totalRevenue, outstanding };
  }, [clients]);

  const updateClient = useCallback((id, updates) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setSelectedClient(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  }, []);

  const deleteClient = useCallback((id) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setSelectedClient(null);
  }, []);

  const addComm = useCallback((id, comm) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, comms: [...(c.comms || []), comm], lastContact: comm.date } : c));
    setSelectedClient(prev => prev && prev.id === id ? { ...prev, comms: [...(prev.comms || []), comm], lastContact: comm.date } : prev);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: F.sans }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, fontFamily: F.serif }}>Client Portal</h2>
          <p style={{ color: C.inkMuted, fontSize: 13, margin: "4px 0 0" }}>{stats.total} clients · £{(stats.totalRevenue / 1000).toFixed(0)}k lifetime revenue · {stats.vipCount} VIP</p>
        </div>
        <button onClick={() => { setEditingClient(null); setShowForm(true); }} style={btnPrimary}>+ Add Client</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Clients", value: stats.total, color: C.ink },
          { label: "VIP Clients", value: stats.vipCount, color: C.accent },
          { label: "Active This Quarter", value: stats.activeCount, color: C.success },
          { label: "Lifetime Revenue", value: `£${(stats.totalRevenue / 1000).toFixed(0)}k`, color: C.accent },
          { label: "Outstanding", value: `£${(stats.outstanding / 1000).toFixed(1)}k`, color: stats.outstanding > 0 ? C.danger : C.success },
        ].map(s => (
          <div key={s.label} style={cardStyle({ padding: 16 })}>
            <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: F.serif, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients, industries, tags..." style={{ ...inputStyle, width: 280 }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...selectStyle, width: 160 }}>
          <option value="All">All Types</option>
          {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterSegment} onChange={e => setFilterSegment(e.target.value)} style={{ ...selectStyle, width: 140 }}>
          <option value="All">All Segments</option>
          {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.inkMuted }}>{filtered.length} results</span>
      </div>

      {/* Client Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {filtered.map(client => {
          const seg = getSegment(client);
          return (
            <div key={client.id} onClick={() => { setSelectedClient(client); setDetailTab("overview"); }} style={{ ...cardStyle({ padding: 16, cursor: "pointer", transition: "all 0.15s" }), borderLeft: `3px solid ${TYPE_COLORS[client.type] || C.accent}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: F.serif }}>{client.name}</div>
                  <div style={{ fontSize: 12, color: C.inkSec, marginTop: 2 }}>{client.industry}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={pillStyle(`${TYPE_COLORS[client.type]}12`, TYPE_COLORS[client.type])}>{client.type}</span>
                  <span style={pillStyle(`${SEG_COLORS[seg]}12`, SEG_COLORS[seg])}>{seg}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <div><div style={{ fontSize: 10, color: C.inkMuted }}>Revenue</div><div style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: F.mono }}>£{(client.lifetimeRevenue / 1000).toFixed(0)}k</div></div>
                <div><div style={{ fontSize: 10, color: C.inkMuted }}>Events</div><div style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: F.mono }}>{client.totalEvents}</div></div>
                <div><div style={{ fontSize: 10, color: C.inkMuted }}>Score</div><div style={{ fontSize: 14, fontWeight: 700, color: client.relationshipScore >= 8 ? C.success : client.relationshipScore >= 5 ? C.warn : C.danger, fontFamily: F.mono }}>{client.relationshipScore}/10</div></div>
              </div>
              {client.tags && client.tags.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                  {client.tags.slice(0, 3).map(t => <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: C.bgWarm, color: C.inkMuted }}>{t}</span>)}
                  {client.tags.length > 3 && <span style={{ fontSize: 10, color: C.inkMuted }}>+{client.tags.length - 3}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && <ClientDetail client={selectedClient} tab={detailTab} setTab={setDetailTab} onClose={() => setSelectedClient(null)} onUpdate={updateClient} onDelete={deleteClient} onAddComm={addComm} onEdit={(c) => { setEditingClient(c); setShowForm(true); setSelectedClient(null); }} />}

      {/* Add/Edit Form */}
      {showForm && <ClientForm client={editingClient} onClose={() => { setShowForm(false); setEditingClient(null); }} onSave={(data) => {
        if (editingClient) {
          updateClient(editingClient.id, data);
        } else {
          const newClient = { ...data, id: `c_${Date.now()}`, lifetimeRevenue: 0, outstandingInvoices: 0, avgEventValue: 0, totalEvents: 0, events: [], comms: [], tags: data.tags || [], lastContact: new Date().toISOString().slice(0, 10), created: new Date().toISOString().slice(0, 10) };
          setClients(prev => [newClient, ...prev]);
        }
        setShowForm(false);
        setEditingClient(null);
      }} />}
    </div>
  );
}

function ClientDetail({ client, tab, setTab, onClose, onUpdate, onDelete, onAddComm, onEdit }) {
  const [commType, setCommType] = useState("note");
  const [commText, setCommText] = useState("");
  const seg = getSegment(client);

  const logComm = () => {
    if (!commText.trim()) return;
    onAddComm(client.id, { type: commType, note: commText.trim(), date: new Date().toISOString().slice(0, 10), by: "Joe Stokoe" });
    setCommText("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(24,21,15,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ ...cardStyle({ padding: 0, width: 720, maxHeight: "90vh", overflow: "auto", borderRadius: 14, boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }) }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, background: C.bgWarm }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: F.serif }}>{client.name}</div>
              <div style={{ fontSize: 13, color: C.inkSec, marginTop: 4 }}>{client.industry} · {client.type}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={pillStyle(`${SEG_COLORS[seg]}12`, SEG_COLORS[seg])}>{seg}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: client.relationshipScore >= 8 ? C.success : client.relationshipScore >= 5 ? C.warn : C.danger }}>{client.relationshipScore}/10</span>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.inkMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
            {["overview", "contacts", "events", "finance", "comms"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: F.sans, background: tab === t ? C.card : "transparent", color: tab === t ? C.ink : C.inkMuted, boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[["Website", client.website || "—"], ["Address", client.address || "—"], ["Last Contact", client.lastContact || "—"], ["Client Since", client.created || "—"]].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{l}</div><div style={{ fontSize: 13, color: C.ink }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Lifetime Revenue", value: `£${client.lifetimeRevenue.toLocaleString()}`, color: C.accent },
                  { label: "Outstanding", value: `£${client.outstandingInvoices.toLocaleString()}`, color: client.outstandingInvoices > 0 ? C.danger : C.success },
                  { label: "Avg Event Value", value: `£${client.avgEventValue.toLocaleString()}`, color: C.ink },
                  { label: "Total Events", value: client.totalEvents, color: C.info },
                ].map(s => (
                  <div key={s.label} style={{ ...cardStyle({ padding: 12, background: C.bgWarm }) }}>
                    <div style={{ fontSize: 9, color: C.inkMuted, textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: F.mono, marginTop: 4 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {client.tags && client.tags.length > 0 && (
                <div><div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Tags</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {client.tags.map(t => <span key={t} style={pillStyle(C.accentSubtle, C.accent)}>{t}</span>)}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button onClick={() => onEdit(client)} style={btnOutline}>Edit Client</button>
                <button onClick={() => { if (confirm("Delete this client?")) onDelete(client.id); }} style={{ ...btnGhost, color: C.danger }}>Delete</button>
              </div>
            </div>
          )}

          {tab === "contacts" && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 12px", fontFamily: F.serif }}>Key Contacts</h4>
              {(client.contacts || []).map((c, i) => (
                <div key={i} style={{ ...cardStyle({ padding: 14, marginBottom: 8, background: C.bgWarm }) }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.inkSec, marginTop: 2 }}>{c.role}</div>
                  <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: C.info }}>{c.email}</span>
                    <span style={{ fontSize: 12, color: C.inkMuted }}>{c.phone}</span>
                  </div>
                </div>
              ))}
              {(!client.contacts || client.contacts.length === 0) && <div style={{ color: C.inkMuted, fontSize: 13, fontStyle: "italic" }}>No contacts added yet</div>}
            </div>
          )}

          {tab === "events" && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 12px", fontFamily: F.serif }}>Event History</h4>
              {(client.events || []).map((ev, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{ev.name}</div>
                    <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>{new Date(ev.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: F.mono }}>£{ev.revenue.toLocaleString()}</span>
                    <span style={pillStyle(ev.status === "Complete" ? C.successBg : ev.status === "Confirmed" ? C.infoBg : C.warnBg, ev.status === "Complete" ? C.success : ev.status === "Confirmed" ? C.info : C.warn)}>{ev.status}</span>
                  </div>
                </div>
              ))}
              {(!client.events || client.events.length === 0) && <div style={{ color: C.inkMuted, fontSize: 13, fontStyle: "italic" }}>No events yet</div>}
            </div>
          )}

          {tab === "finance" && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 12px", fontFamily: F.serif }}>Financial Summary</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={cardStyle({ padding: 16, background: C.bgWarm })}>
                  <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase" }}>Lifetime Revenue</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.accent, fontFamily: F.serif }}>£{client.lifetimeRevenue.toLocaleString()}</div>
                </div>
                <div style={cardStyle({ padding: 16, background: client.outstandingInvoices > 0 ? C.dangerBg : C.successBg })}>
                  <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase" }}>Outstanding Invoices</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: client.outstandingInvoices > 0 ? C.danger : C.success, fontFamily: F.serif }}>£{client.outstandingInvoices.toLocaleString()}</div>
                </div>
                <div style={cardStyle({ padding: 16, background: C.bgWarm })}>
                  <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase" }}>Avg Event Value</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, fontFamily: F.serif }}>£{client.avgEventValue.toLocaleString()}</div>
                </div>
                <div style={cardStyle({ padding: 16, background: C.bgWarm })}>
                  <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase" }}>Total Events</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.info, fontFamily: F.serif }}>{client.totalEvents}</div>
                </div>
              </div>
              {/* Relationship Score */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Relationship Score</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => onUpdate(client.id, { relationshipScore: n })} style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${n <= client.relationshipScore ? "transparent" : C.border}`, background: n <= client.relationshipScore ? (client.relationshipScore >= 8 ? C.success : client.relationshipScore >= 5 ? C.warn : C.danger) : C.bgWarm, color: n <= client.relationshipScore ? "#fff" : C.inkMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "comms" && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 12px", fontFamily: F.serif }}>Communication Log</h4>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {["note", "call", "email", "meeting"].map(t => (
                  <button key={t} onClick={() => setCommType(t)} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.sans, border: commType === t ? `1px solid ${C.accent}` : `1px solid ${C.border}`, background: commType === t ? C.accentSubtle : C.card, color: commType === t ? C.accent : C.inkMuted }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input value={commText} onChange={e => setCommText(e.target.value)} onKeyDown={e => e.key === "Enter" && logComm()} placeholder="Log a note, call, email..." style={{ ...inputStyle, flex: 1 }} />
                <button onClick={logComm} style={btnAccent}>Log</button>
              </div>
              {(client.comms || []).slice().reverse().map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: c.type === "call" ? C.success : c.type === "email" ? C.info : c.type === "meeting" ? C.accent : C.inkMuted, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, color: C.ink }}>{c.note}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 3 }}>{c.type} · {c.by} · {c.date}</div>
                  </div>
                </div>
              ))}
              {(!client.comms || client.comms.length === 0) && <div style={{ color: C.inkMuted, fontSize: 13, fontStyle: "italic" }}>No communications logged yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientForm({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    name: client?.name || "", type: client?.type || "Corporate", industry: client?.industry || "",
    website: client?.website || "", address: client?.address || "", relationshipScore: client?.relationshipScore || 5,
    contacts: client?.contacts || [{ name: "", role: "", email: "", phone: "" }],
    tags: client?.tags || [],
  });
  const [tagInput, setTagInput] = useState("");

  const addContact = () => setForm(f => ({ ...f, contacts: [...f.contacts, { name: "", role: "", email: "", phone: "" }] }));
  const updateContact = (i, field, value) => setForm(f => ({ ...f, contacts: f.contacts.map((c, j) => j === i ? { ...c, [field]: value } : c) }));
  const removeContact = (i) => setForm(f => ({ ...f, contacts: f.contacts.filter((_, j) => j !== i) }));
  const addTag = () => { if (tagInput.trim() && !form.tags.includes(tagInput.trim())) { setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] })); setTagInput(""); } };
  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(24,21,15,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ ...cardStyle({ padding: 0, width: 600, maxHeight: "90vh", overflow: "auto", borderRadius: 14, boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }) }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, background: C.bgWarm, display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: 0, fontFamily: F.serif }}>{client ? "Edit Client" : "Add New Client"}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.inkMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Company Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={selectStyle}>{CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Industry</label><input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} style={inputStyle} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Website</label><input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={inputStyle} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Address</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} /></div>
            </div>

            {/* Contacts */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Key Contacts</label>
                <button onClick={addContact} style={btnGhost}>+ Add Contact</button>
              </div>
              {form.contacts.map((c, i) => (
                <div key={i} style={{ ...cardStyle({ padding: 10, marginBottom: 6, background: C.bgWarm }) }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6 }}>
                    <input placeholder="Name" value={c.name} onChange={e => updateContact(i, "name", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} />
                    <input placeholder="Role" value={c.role} onChange={e => updateContact(i, "role", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} />
                    {form.contacts.length > 1 && <button onClick={() => removeContact(i)} style={{ ...btnGhost, color: C.danger, fontSize: 11 }}>✕</button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                    <input placeholder="Email" value={c.email} onChange={e => updateContact(i, "email", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} />
                    <input placeholder="Phone" value={c.phone} onChange={e => updateContact(i, "phone", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Tags</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                {form.tags.map(t => <span key={t} style={{ ...pillStyle(C.accentSubtle, C.accent), cursor: "pointer" }} onClick={() => removeTag(t)}>{t} ✕</span>)}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="Add tag..." style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addTag} style={btnOutline}>Add</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={onClose} style={btnOutline}>Cancel</button>
              <button onClick={() => { if (!form.name.trim()) return; onSave(form); }} style={btnPrimary}>{client ? "Save Changes" : "Add Client"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
