import { useState, useMemo } from "react";
import { competitorIntelligence } from "../lib/competitorIntelligence";

// ── Theme ──
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
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };
const cardStyle = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...extra });
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });

const tierColors = {
  1: { bg: "#FDF2F2", color: "#9B3535", label: "Tier 1 — Major" },
  2: { bg: "#FFF9F0", color: "#956018", label: "Tier 2 — Significant" },
  3: { bg: "#F0F7FA", color: "#2A6680", label: "Tier 3 — Notable" },
};

const threatColors = { HIGH: C.danger, "MEDIUM-HIGH": C.warn, MEDIUM: C.accentLight, "LOW-MEDIUM": C.info, LOW: C.inkMuted };

export default function CompetitorMatrix() {
  const [view, setView] = useState("matrix"); // matrix | clients | brands | detail
  const [selectedComp, setSelectedComp] = useState(null);
  const [tierFilter, setTierFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const competitors = useMemo(() => {
    let filtered = competitorIntelligence;
    if (tierFilter) filtered = filtered.filter(c => c.tier === tierFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.keyClients || []).some(cl => cl.toLowerCase().includes(q)) ||
        (c.services || []).some(s => s.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [tierFilter, searchTerm]);

  // Client overlap analysis
  const clientMap = useMemo(() => {
    const map = {};
    competitorIntelligence.forEach(comp => {
      (comp.keyClients || []).forEach(client => {
        const key = client.toLowerCase().trim();
        if (!map[key]) map[key] = { name: client, competitors: [] };
        map[key].competitors.push(comp.name);
      });
    });
    return Object.values(map).sort((a, b) => b.competitors.length - a.competitors.length);
  }, []);

  // Brand category analysis
  const brandCategories = useMemo(() => {
    const cats = {
      "Spirits & Drinks": [], "Tech": [], "Fashion & Luxury": [], "Automotive": [],
      "Entertainment & Media": [], "FMCG & Consumer": [], "Finance & Professional": [],
      "Sports & Fitness": [], "Other": [],
    };
    clientMap.forEach(({ name, competitors }) => {
      const n = name.toLowerCase();
      if (n.includes("gin") || n.includes("vodka") || n.includes("rum") || n.includes("whisky") || n.includes("diageo") || n.includes("pernod") || n.includes("bacardi") || n.includes("beer") || n.includes("brew") || n.includes("sipsmith") || n.includes("tanqueray") || n.includes("absolut") || n.includes("bull")) {
        cats["Spirits & Drinks"].push({ name, competitors });
      } else if (n.includes("google") || n.includes("amazon") || n.includes("tiktok") || n.includes("spotify") || n.includes("samsung") || n.includes("sky") || n.includes("apple") || n.includes("sony")) {
        cats["Tech"].push({ name, competitors });
      } else if (n.includes("vuitton") || n.includes("dior") || n.includes("gucci") || n.includes("nike") || n.includes("adidas") || n.includes("puma") || n.includes("h&m") || n.includes("river island") || n.includes("diesel") || n.includes("harris reed")) {
        cats["Fashion & Luxury"].push({ name, competitors });
      } else if (n.includes("mercedes") || n.includes("bentley") || n.includes("porsche") || n.includes("bmw") || n.includes("ford")) {
        cats["Automotive"].push({ name, competitors });
      } else if (n.includes("mtv") || n.includes("itv") || n.includes("disney") || n.includes("marvel") || n.includes("netflix") || n.includes("bbc")) {
        cats["Entertainment & Media"].push({ name, competitors });
      } else if (n.includes("gymshark") || n.includes("red bull") || n.includes("formula")) {
        cats["Sports & Fitness"].push({ name, competitors });
      } else if (n.includes("tesco") || n.includes("waitrose") || n.includes("mcdonald") || n.includes("heinz") || n.includes("haribo") || n.includes("coca") || n.includes("pepsi")) {
        cats["FMCG & Consumer"].push({ name, competitors });
      } else if (n.includes("barclay") || n.includes("bank") || n.includes("invest")) {
        cats["Finance & Professional"].push({ name, competitors });
      } else {
        cats["Other"].push({ name, competitors });
      }
    });
    return Object.entries(cats).filter(([, items]) => items.length > 0).sort((a, b) => b[1].length - a[1].length);
  }, [clientMap]);

  const detail = selectedComp ? competitorIntelligence.find(c => c.id === selectedComp) : null;

  return (
    <div style={{ fontFamily: F.sans }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0, fontFamily: F.serif }}>Competitive Intelligence</h3>
          <p style={{ fontSize: 12, color: C.inkMuted, margin: "4px 0 0" }}>
            {competitorIntelligence.length} competitors profiled with client databases
          </p>
        </div>
        <div style={{ display: "flex", gap: 4, background: C.bgWarm, padding: 3, borderRadius: 6 }}>
          {[
            { id: "matrix", label: "Matrix" },
            { id: "clients", label: "Client Map" },
            { id: "brands", label: "Brand Sectors" },
          ].map(v => (
            <button key={v.id} onClick={() => { setView(v.id); setSelectedComp(null); }} style={{
              padding: "5px 12px", borderRadius: 4, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, fontFamily: F.sans,
              background: view === v.id ? C.card : "transparent",
              color: view === v.id ? C.ink : C.inkMuted,
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* Search + Tier filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <input
          type="text" placeholder="Search competitors or clients..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {[null, 1, 2, 3].map(t => (
            <button key={t || "all"} onClick={() => setTierFilter(t)} style={{
              padding: "6px 12px", borderRadius: 4, border: `1px solid ${tierFilter === t ? C.accent : C.border}`,
              background: tierFilter === t ? C.accentSubtle : "transparent",
              color: tierFilter === t ? C.accent : C.inkMuted,
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.sans,
            }}>{t ? `Tier ${t}` : "All"}</button>
          ))}
        </div>
      </div>

      {/* ═══ MATRIX VIEW ═══ */}
      {view === "matrix" && !detail && (
        <div style={cardStyle({ padding: 0, overflow: "hidden" })}>
          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: "180px 80px 1fr 80px 70px 80px",
            gap: 8, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: C.bgWarm,
          }}>
            {["Competitor", "Tier", "Key Clients", "Threat", "Founded", "Team"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>

          {competitors.map((comp, idx) => {
            const tier = tierColors[comp.tier] || tierColors[3];
            const threat = comp.threatLevel || "MEDIUM";
            return (
              <div
                key={comp.id}
                onClick={() => setSelectedComp(comp.id)}
                style={{
                  display: "grid", gridTemplateColumns: "180px 80px 1fr 80px 70px 80px",
                  gap: 8, padding: "12px 16px", cursor: "pointer", alignItems: "center",
                  borderBottom: `1px solid ${C.borderLight}`,
                  background: idx % 2 === 0 ? "transparent" : `${C.bgWarm}40`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.accentSubtle}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : `${C.bgWarm}40`}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{comp.name}</div>
                  {comp.instagram && <div style={{ fontSize: 10, color: C.info }}>{comp.instagram}</div>}
                </div>
                <span style={pillStyle(tier.bg, tier.color)}>T{comp.tier}</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", overflow: "hidden", maxHeight: 40 }}>
                  {(comp.keyClients || []).slice(0, 5).map(cl => (
                    <span key={cl} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: C.bgWarm, color: C.inkSec }}>{cl}</span>
                  ))}
                  {(comp.keyClients || []).length > 5 && (
                    <span style={{ fontSize: 10, color: C.inkMuted }}>+{comp.keyClients.length - 5}</span>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: threatColors[threat] || C.inkMuted }}>{threat}</span>
                <span style={{ fontSize: 12, fontFamily: F.mono, color: C.inkSec }}>{comp.founded || "—"}</span>
                <span style={{ fontSize: 11, color: C.inkSec }}>{comp.teamSize || "—"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ DETAIL VIEW ═══ */}
      {detail && (
        <div>
          <button onClick={() => setSelectedComp(null)} style={{
            padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: "transparent", color: C.inkSec, fontSize: 12, cursor: "pointer",
            fontFamily: F.sans, marginBottom: 12,
          }}>&#8592; Back to matrix</button>

          <div style={cardStyle({ marginBottom: 16 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, fontFamily: F.serif, margin: 0, color: C.ink }}>{detail.name}</h3>
                <div style={{ fontSize: 12, color: C.inkSec, marginTop: 4 }}>
                  {detail.website && <span>{detail.website.replace(/^https?:\/\//, '')}</span>}
                  {detail.instagram && <span style={{ marginLeft: 12, color: C.info }}>{detail.instagram}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={pillStyle(tierColors[detail.tier]?.bg, tierColors[detail.tier]?.color)}>
                  {tierColors[detail.tier]?.label}
                </span>
                <span style={pillStyle(
                  detail.threatLevel === "HIGH" ? C.dangerBg : C.warnBg,
                  threatColors[detail.threatLevel] || C.warn,
                )}>
                  {detail.threatLevel} Threat
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left: Company info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={cardStyle({ padding: 16 })}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Overview</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["Founded", detail.founded || "Unknown"],
                    ["Team", detail.teamSize || "Unknown"],
                    ["Leadership", detail.founderOrLeadership || "Unknown"],
                    ["Price Tier", detail.priceTier || "Unknown"],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: C.inkMuted, fontWeight: 600 }}>{l}</div>
                      <div style={{ fontSize: 12, color: C.ink }}>{v}</div>
                    </div>
                  ))}
                </div>
                {detail.coverage && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: C.inkMuted, fontWeight: 600 }}>Coverage</div>
                    <div style={{ fontSize: 12, color: C.ink }}>{detail.coverage}</div>
                  </div>
                )}
              </div>

              {/* Services */}
              {detail.services && detail.services.length > 0 && (
                <div style={cardStyle({ padding: 16 })}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Services</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {detail.services.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: C.accentSubtle, color: C.accent }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Differentiators */}
              {detail.differentiators && (
                <div style={cardStyle({ padding: 16 })}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Differentiators</div>
                  <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.6 }}>{detail.differentiators}</div>
                </div>
              )}

              {/* Strategic Notes */}
              {detail.strategicNotes && (
                <div style={cardStyle({ padding: 16, background: C.warnBg, borderColor: `${C.warn}33` })}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.warn, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Strategic Notes</div>
                  <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.6 }}>{detail.strategicNotes}</div>
                </div>
              )}
            </div>

            {/* Right: Clients */}
            <div style={cardStyle({ padding: 16 })}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                Known Clients ({(detail.keyClients || []).length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(detail.keyClients || []).map(client => {
                  const shared = clientMap.find(c => c.name.toLowerCase() === client.toLowerCase());
                  const otherComps = shared ? shared.competitors.filter(c => c !== detail.name) : [];
                  return (
                    <div key={client} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "6px 8px", borderRadius: 4, background: otherComps.length > 0 ? C.warnBg : "transparent",
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{client}</span>
                      {otherComps.length > 0 && (
                        <span style={{ fontSize: 10, color: C.warn }}>
                          Also: {otherComps.join(", ")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Agency partners */}
              {detail.agencyPartners && detail.agencyPartners.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Agency Partners</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {detail.agencyPartners.map(ap => (
                      <span key={ap} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: C.infoBg, color: C.info }}>{ap}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Venues */}
              {detail.venues && detail.venues.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Known Venues</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {detail.venues.map(v => (
                      <span key={v} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: C.successBg, color: C.success }}>{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CLIENT MAP VIEW ═══ */}
      {view === "clients" && (
        <div style={cardStyle({ padding: 0, overflow: "hidden" })}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.bgWarm }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: F.serif }}>
              Client Overlap Map — Which brands work with multiple competitors
            </div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>
              Highlighted rows show clients shared between 2+ competitors
            </div>
          </div>
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            {clientMap.filter(c => searchTerm ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) : true).map(({ name, competitors: comps }) => (
              <div key={name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 16px", borderBottom: `1px solid ${C.borderLight}`,
                background: comps.length > 1 ? C.warnBg : "transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {comps.length > 1 && (
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", background: C.warn, color: "#fff",
                      fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{comps.length}</span>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{name}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {comps.map(comp => (
                    <span key={comp} style={pillStyle(C.accentSubtle, C.accent)}>{comp}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BRAND SECTORS VIEW ═══ */}
      {view === "brands" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {brandCategories.map(([category, items]) => (
            <div key={category} style={cardStyle({ padding: 0, overflow: "hidden" })}>
              <div style={{
                padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: C.bgWarm,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif }}>{category}</span>
                <span style={pillStyle(C.accentSubtle, C.accent)}>{items.length} brands</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 12 }}>
                {items.map(({ name, competitors: comps }) => (
                  <div key={name} style={{
                    padding: "6px 10px", borderRadius: 6, fontSize: 12,
                    background: comps.length > 1 ? C.warnBg : C.bgWarm,
                    border: `1px solid ${comps.length > 1 ? `${C.warn}33` : C.borderLight}`,
                  }}>
                    <span style={{ fontWeight: 600, color: C.ink }}>{name}</span>
                    <span style={{ color: C.inkMuted, marginLeft: 6, fontSize: 10 }}>
                      ({comps.join(", ")})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Strategic gaps */}
          <div style={cardStyle({ background: C.successBg, borderColor: `${C.success}33` })}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, color: C.success, marginBottom: 8 }}>
              Opportunities — Sectors Where Competitors Are Weak
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Wedding market is underserved by premium competitors — most focus on corporate/brand work",
                "No competitor dominates the luxury-private + strong-corporate middle ground",
                "Sustainability messaging is a differentiator — very few competitors lead with this",
                "Virtual/hybrid cocktail events remain niche — only Mix & Match plays here seriously",
                "Property developer launch events are completely untapped by cocktail bar competitors",
                "Tourism board and council events — zero competitors are targeting this recurring market",
                "Brewery/distillery partnerships — no competitor is positioning as a complementary service",
              ].map((opp, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: C.success, fontWeight: 800, flexShrink: 0 }}>+</span>
                  <span style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>{opp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
