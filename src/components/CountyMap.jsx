import { useState, useEffect, useMemo, useCallback } from "react";
import { geoPath, geoMercator } from "d3-geo";

// ═══════════════════════════════════════════════════════════════
// HH&T Interactive County Map — England
// Real geographic boundaries from ONS Open Geography Portal
// Counties & Unitary Authorities (Dec 2022) — BUC (ultra-generalised)
// Rendered with d3-geo Mercator projection
// Hover for county name + lead count, click to filter
// ═══════════════════════════════════════════════════════════════

// Bundled in public/ — fetched from own domain, no CORS issues
const GEO_URL = import.meta.env.BASE_URL + "counties.geojson";

// ── Map ONS names → venue-data county names ──
// ONS data includes London boroughs, unitary authorities etc.
// We group them into the ceremonial counties our venue data uses.
const LONDON_BOROUGHS = new Set([
  "Barking and Dagenham","Barnet","Bexley","Brent","Bromley","Camden",
  "City of London","Croydon","Ealing","Enfield","Greenwich","Hackney",
  "Hammersmith and Fulham","Haringey","Harrow","Havering","Hillingdon",
  "Hounslow","Islington","Kensington and Chelsea","Kingston upon Thames",
  "Lambeth","Lewisham","Merton","Newham","Redbridge","Richmond upon Thames",
  "Southwark","Sutton","Tower Hamlets","Waltham Forest","Wandsworth",
  "Westminster",
]);

const NAME_MAP = {
  "Herefordshire, County of": "Herefordshire",
  "Bristol, City of": "Bristol",
  // Bedfordshire unitaries
  "Bedford": "Bedfordshire",
  "Central Bedfordshire": "Bedfordshire",
  "Luton": "Bedfordshire",
  // Berkshire unitaries
  "Bracknell Forest": "Berkshire",
  "Reading": "Berkshire",
  "Slough": "Berkshire",
  "West Berkshire": "Berkshire",
  "Windsor and Maidenhead": "Berkshire",
  "Wokingham": "Berkshire",
};

// ── Short display names for map labels ──
const SHORT = {
  Cornwall: "Cornwall", Devon: "Devon", Somerset: "Somerset", Dorset: "Dorset",
  Wiltshire: "Wilts", Hampshire: "Hants", "Isle of Wight": "IoW",
  Gloucestershire: "Glos", Herefordshire: "Herefs", Worcestershire: "Worcs",
  Shropshire: "Shrops", Warwickshire: "Warks", Northamptonshire: "Northants",
  Oxfordshire: "Oxon", Buckinghamshire: "Bucks", Berkshire: "Berks",
  Bedfordshire: "Beds", Hertfordshire: "Herts", "Greater London": "London",
  Essex: "Essex", Surrey: "Surrey", "West Sussex": "W.Sussex",
  "East Sussex": "E.Sussex", Kent: "Kent", Cambridgeshire: "Cambs",
  Suffolk: "Suffolk", Norfolk: "Norfolk",
};

// ── All venue-data county names (used to decide which to label) ──
const VENUE_COUNTIES = new Set(Object.keys(SHORT));

// ── Colour scale ──
const HEAT = [
  "#F5ECD7", "#E8D9B4", "#D4BF8A", "#C1A664",
  "#A88C42", "#8F7232", "#705824", "#574318",
];
function heatCol(count, max) {
  if (!count || !max) return HEAT[0];
  const idx = Math.min(
    Math.floor((count / max) * (HEAT.length - 1)),
    HEAT.length - 1
  );
  return HEAT[idx];
}

// ── Design tokens ──
const C = {
  bg: "#FAFAF8", card: "#FFFFFF", ink: "#18150F", inkSec: "#5C564E",
  accent: "#7D5A1A", border: "#E6E1D9", borderLight: "#F0ECE5",
};
const F = {
  serif: "'Georgia','Times New Roman',serif",
  sans: "'Inter',-apple-system,sans-serif",
};

// ── SVG dimensions ──
const W = 520;
const H = 380;

export default function CountyMap({ leads, onCountyClick }) {
  const [hover, setHover] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch GeoJSON from ONS Open Geography Portal on mount
  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((geo) => {
        if (cancelled) return;
        setGeoData(geo);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load county boundaries:", err);
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Count venues per county
  const countByCounty = useMemo(() => {
    const m = {};
    (leads || []).forEach((l) => {
      if (l.county) m[l.county] = (m[l.county] || 0) + 1;
    });
    return m;
  }, [leads]);

  const maxCount = useMemo(
    () => Math.max(...Object.values(countByCounty), 1),
    [countByCounty]
  );
  const totalVenues = (leads || []).length;

  // Build projection + path generator + features
  const { pathGen, features } = useMemo(() => {
    if (!geoData) return { pathGen: null, features: [] };

    // Filter to only England (exclude Scottish islands etc) and set up projection
    const projection = geoMercator().fitSize([W, H], geoData);
    const pg = geoPath(projection);

    const feats = geoData.features.map((f) => {
      // ONS Counties & Unitary Authorities use CTYUA22NM
      const rawName = f.properties.n || f.properties.CTYUA22NM || "Unknown";
      const countyName = LONDON_BOROUGHS.has(rawName) ? "Greater London" : (NAME_MAP[rawName] || rawName);
      const centroid = pg.centroid(f);
      return {
        feature: f,
        path: pg(f),
        name: countyName,
        short: SHORT[countyName] || countyName.slice(0, 8),
        cx: centroid[0],
        cy: centroid[1],
        hasVenues: VENUE_COUNTIES.has(countyName),
      };
    });

    return { pathGen: pg, features: feats };
  }, [geoData]);

  // Counties sorted by venue count for pills
  const sortedCounties = useMemo(() => {
    return [...VENUE_COUNTIES].sort(
      (a, b) => (countByCounty[b] || 0) - (countByCounty[a] || 0)
    );
  }, [countByCounty]);

  const handleClick = useCallback(
    (name) => { if (onCountyClick) onCountyClick(name); },
    [onCountyClick]
  );

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{
        background: C.card, borderRadius: 12, border: `1px solid ${C.borderLight}`,
        padding: "24px 28px", marginBottom: 24, textAlign: "center",
      }}>
        <p style={{ fontFamily: F.sans, fontSize: 14, color: C.inkSec }}>
          Loading county boundaries…
        </p>
      </div>
    );
  }

  // ── Error state — show simple text list ──
  if (error || !features.length) {
    return (
      <div style={{
        background: C.card, borderRadius: 12, border: `1px solid ${C.borderLight}`,
        padding: "24px 28px", marginBottom: 24,
      }}>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, color: C.ink, margin: "0 0 12px" }}>
          England — Venue Map
        </h3>
        <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, marginBottom: 16 }}>
          {totalVenues} venues across {sortedCounties.length} counties · Click a county to view its leads
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {sortedCounties.map((name) => (
            <button key={name} onClick={() => handleClick(name)} style={{
              display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px",
              background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 16,
              fontFamily: F.sans, fontSize: 12, color: C.ink, cursor: "pointer",
            }}>
              {SHORT[name] || name}
              <span style={{ fontWeight: 700, color: C.accent, fontSize: 11 }}>
                {countByCounty[name] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: C.card, borderRadius: 12, border: `1px solid ${C.borderLight}`,
      padding: "24px 28px", marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16,
      }}>
        <div>
          <h3 style={{ fontFamily: F.serif, fontSize: 20, color: C.ink, margin: 0 }}>
            England — Venue Map
          </h3>
          <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, margin: "4px 0 0" }}>
            {totalVenues} venues across {sortedCounties.length} counties · Click a county to view its leads
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, fontFamily: F.sans, color: C.inkSec,
        }}>
          <span>Fewer</span>
          {HEAT.map((c, i) => (
            <div key={i} style={{ width: 14, height: 10, background: c, borderRadius: 2 }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* SVG Map */}
      <div style={{
        background: "#F0ECE5", borderRadius: 8, padding: 8, position: "relative",
      }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* County shapes */}
          {features.map((f, i) => {
            if (!f.path) return null;
            const count = countByCounty[f.name] || 0;
            const isHovered = hover === f.name;
            const isVenueCounty = f.hasVenues;
            return (
              <g
                key={f.name + i}
                onMouseEnter={() => setHover(f.name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => isVenueCounty && handleClick(f.name)}
                style={{ cursor: isVenueCounty ? "pointer" : "default" }}
              >
                <path
                  d={f.path}
                  fill={isVenueCounty ? heatCol(count, maxCount) : "#E8E4DC"}
                  stroke={isHovered && isVenueCounty ? C.accent : "#BEB6A8"}
                  strokeWidth={isHovered && isVenueCounty ? 2 : 0.75}
                  opacity={isHovered && isVenueCounty ? 1 : 0.92}
                />
              </g>
            );
          })}

          {/* Labels — one per unique county, averaged centroids */}
          {(() => {
            // Group centroids by county name, then average them
            const groups = {};
            features.forEach((f) => {
              if (!f.hasVenues || !f.cx || !f.cy || isNaN(f.cx)) return;
              if (!groups[f.name]) groups[f.name] = { xs: [], ys: [], short: f.short };
              groups[f.name].xs.push(f.cx);
              groups[f.name].ys.push(f.cy);
            });
            return Object.entries(groups).map(([name, g]) => {
              const cx = g.xs.reduce((a, b) => a + b, 0) / g.xs.length;
              const cy = g.ys.reduce((a, b) => a + b, 0) / g.ys.length;
              const count = countByCounty[name] || 0;
              const isLondon = name === "Greater London";
              const fontSize = name === "Isle of Wight" ? 5 : 7;

              // London gets white text + background pill to stand out on dark fill
              if (isLondon) {
                const pw = 38, ph = 16;
                return (
                  <g key={"lbl-" + name} pointerEvents="none">
                    <rect
                      x={cx - pw / 2} y={cy - ph / 2 - 1}
                      width={pw} height={ph} rx={4}
                      fill="rgba(255,255,255,0.88)"
                    />
                    <text
                      x={cx} y={cy + 1}
                      textAnchor="middle" fontSize={6}
                      fontFamily={F.sans} fontWeight="700" fill={C.accent}
                    >
                      London
                    </text>
                    <text
                      x={cx} y={cy + 8}
                      textAnchor="middle" fontSize={5.5}
                      fontFamily={F.sans} fontWeight="700" fill={C.accent}
                    >
                      {count}
                    </text>
                  </g>
                );
              }

              return (
                <g key={"lbl-" + name} pointerEvents="none">
                  <text
                    x={cx} y={cy - 2}
                    textAnchor="middle" fontSize={fontSize}
                    fontFamily={F.sans} fontWeight="600" fill={C.ink}
                  >
                    {g.short}
                  </text>
                  <text
                    x={cx} y={cy + 6}
                    textAnchor="middle" fontSize={6}
                    fontFamily={F.sans} fontWeight="700" fill={C.accent}
                  >
                    {count}
                  </text>
                </g>
              );
            });
          })()}
        </svg>

        {/* Tooltip */}
        {hover && VENUE_COUNTIES.has(hover) && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(255,255,255,0.96)",
            border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "8px 14px", fontFamily: F.sans,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{hover}</div>
            <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>
              {countByCounty[hover] || 0} venue
              {(countByCounty[hover] || 0) !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* County pills */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 11, fontFamily: F.sans, color: C.inkSec,
          textTransform: "uppercase", letterSpacing: 1, marginBottom: 8,
        }}>
          All Regions ({totalVenues} venues)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {sortedCounties.map((name) => (
            <button
              key={name}
              onClick={() => handleClick(name)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 10px", background: C.bg,
                border: `1px solid ${C.borderLight}`, borderRadius: 16,
                fontFamily: F.sans, fontSize: 12, color: C.ink, cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderLight; }}
            >
              {SHORT[name] || name}
              <span style={{ fontWeight: 700, color: C.accent, fontSize: 11 }}>
                {countByCounty[name] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
