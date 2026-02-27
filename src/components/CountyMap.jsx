import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Interactive County Map — Southern England
// Generated from real lat/long boundary coordinates
// Hover to see county name + lead count, click to filter leads
// Matches white editorial design: cream/ivory, Georgia serif, warm tones
// ═══════════════════════════════════════════════════════════════

// SVG polygon paths projected from real geographic coordinates
// ViewBox: 0 0 900 580
const COUNTY_PATHS = {
  "Cornwall": "M 30.0,551.4 L 105.2,555.0 L 133.3,513.5 L 161.4,502.7 L 200.7,499.1 L 198.4,470.2 L 178.2,466.6 L 146.8,437.7 L 129.9,416.1 L 79.4,407.1 L 80.5,443.2 L 39.0,482.8 L 32.2,517.1 L 30.0,551.4 Z",
  "Devon": "M 198.4,470.2 L 200.7,499.1 L 259.1,522.5 L 277.1,524.3 L 295.0,511.7 L 326.5,509.9 L 339.9,457.6 L 326.5,432.3 L 305.1,407.1 L 309.6,372.8 L 289.4,349.3 L 254.6,372.8 L 242.2,369.2 L 198.4,349.3 L 178.2,358.4 L 161.4,351.1 L 146.8,389.0 L 129.9,416.1 L 146.8,437.7 L 178.2,466.6 L 198.4,470.2 Z",
  "Somerset": "M 242.2,369.2 L 289.4,349.3 L 309.6,372.8 L 326.5,369.2 L 348.9,383.6 L 375.9,387.2 L 378.1,369.2 L 380.4,351.1 L 373.6,333.1 L 339.9,329.5 L 328.7,315.1 L 301.8,315.1 L 279.3,333.1 L 268.1,340.3 L 242.2,369.2 Z",
  "Dorset": "M 339.9,457.6 L 375.9,450.4 L 423.0,452.2 L 443.3,450.4 L 454.5,434.1 L 452.2,410.7 L 443.3,394.4 L 420.8,392.6 L 398.3,383.6 L 375.9,387.2 L 348.9,383.6 L 326.5,369.2 L 309.6,372.8 L 326.5,432.3 L 339.9,457.6 Z",
  "Wiltshire": "M 398.3,383.6 L 420.8,392.6 L 443.3,394.4 L 472.5,387.2 L 485.9,365.6 L 497.2,340.3 L 501.7,318.7 L 497.2,293.4 L 483.7,282.6 L 465.7,268.1 L 436.5,271.8 L 418.6,282.6 L 407.3,300.6 L 384.9,315.1 L 373.6,333.1 L 380.4,351.1 L 378.1,369.2 L 375.9,387.2 L 398.3,383.6 Z",
  "Hampshire": "M 454.5,434.1 L 474.7,432.3 L 501.7,434.1 L 533.1,430.5 L 562.3,425.1 L 578.0,419.7 L 582.5,401.7 L 584.8,383.6 L 578.0,365.6 L 564.5,354.7 L 548.8,343.9 L 526.4,333.1 L 515.1,333.1 L 497.2,340.3 L 485.9,365.6 L 472.5,387.2 L 443.3,394.4 L 452.2,410.7 L 454.5,434.1 Z",
  "Isle of Wight": "M 501.7,459.4 L 524.1,459.4 L 548.8,455.8 L 551.1,441.3 L 542.1,430.5 L 526.4,425.1 L 501.7,434.1 L 497.2,445.0 L 501.7,459.4 Z",
  "Gloucestershire": "M 373.6,333.1 L 384.9,315.1 L 407.3,300.6 L 418.6,282.6 L 436.5,271.8 L 465.7,268.1 L 479.2,246.5 L 481.4,224.8 L 477.0,210.4 L 468.0,199.6 L 450.0,196.0 L 427.5,196.0 L 405.1,206.8 L 400.6,228.5 L 380.4,242.9 L 375.9,264.5 L 366.9,279.0 L 339.9,329.5 L 373.6,333.1 Z",
  "Herefordshire": "M 375.9,264.5 L 380.4,242.9 L 400.6,228.5 L 405.1,206.8 L 393.9,185.2 L 382.6,170.7 L 366.9,163.5 L 346.7,167.1 L 326.5,174.3 L 322.0,196.0 L 326.5,217.6 L 333.2,235.7 L 348.9,253.7 L 366.9,279.0 L 375.9,264.5 Z",
  "Worcestershire": "M 405.1,206.8 L 427.5,196.0 L 450.0,196.0 L 456.7,177.9 L 452.2,159.9 L 443.3,138.2 L 425.3,134.6 L 402.8,138.2 L 382.6,149.1 L 366.9,163.5 L 382.6,170.7 L 393.9,185.2 L 405.1,206.8 Z",
  "Shropshire": "M 366.9,163.5 L 382.6,149.1 L 402.8,138.2 L 400.6,116.6 L 402.8,94.9 L 400.6,73.3 L 380.4,62.5 L 357.9,62.5 L 335.5,73.3 L 322.0,98.6 L 317.5,123.8 L 322.0,149.1 L 326.5,174.3 L 346.7,167.1 L 366.9,163.5 Z",
  "Warwickshire": "M 450.0,196.0 L 468.0,199.6 L 488.2,196.0 L 503.9,188.8 L 519.6,177.9 L 526.4,159.9 L 524.1,134.6 L 512.9,116.6 L 492.7,113.0 L 470.2,116.6 L 452.2,123.8 L 443.3,138.2 L 452.2,159.9 L 456.7,177.9 L 450.0,196.0 Z",
  "Northamptonshire": "M 519.6,177.9 L 537.6,192.4 L 557.8,196.0 L 580.3,192.4 L 602.7,185.2 L 616.2,170.7 L 620.7,149.1 L 611.7,123.8 L 596.0,113.0 L 575.8,109.4 L 555.6,116.6 L 535.3,113.0 L 512.9,116.6 L 524.1,134.6 L 526.4,159.9 L 519.6,177.9 Z",
  "Oxfordshire": "M 465.7,268.1 L 483.7,282.6 L 497.2,293.4 L 515.1,293.4 L 537.6,289.8 L 551.1,279.0 L 562.3,264.5 L 560.1,242.9 L 553.3,228.5 L 539.8,217.6 L 524.1,210.4 L 503.9,203.2 L 503.9,188.8 L 488.2,196.0 L 468.0,199.6 L 477.0,210.4 L 481.4,224.8 L 479.2,246.5 L 465.7,268.1 Z",
  "Buckinghamshire": "M 537.6,289.8 L 551.1,279.0 L 562.3,264.5 L 578.0,271.8 L 591.5,275.4 L 607.2,268.1 L 618.4,260.9 L 620.7,242.9 L 616.2,224.8 L 609.5,210.4 L 602.7,196.0 L 580.3,192.4 L 557.8,196.0 L 537.6,192.4 L 519.6,177.9 L 503.9,188.8 L 503.9,203.2 L 524.1,210.4 L 539.8,217.6 L 553.3,228.5 L 560.1,242.9 L 562.3,264.5 L 551.1,279.0 L 537.6,289.8 Z",
  "Berkshire": "M 515.1,333.1 L 526.4,333.1 L 548.8,333.1 L 562.3,325.9 L 578.0,315.1 L 591.5,304.2 L 596.0,293.4 L 591.5,282.6 L 591.5,275.4 L 578.0,271.8 L 562.3,264.5 L 551.1,279.0 L 537.6,289.8 L 515.1,293.4 L 501.7,318.7 L 497.2,340.3 L 515.1,333.1 Z",
  "Bedfordshire": "M 602.7,196.0 L 609.5,210.4 L 616.2,224.8 L 629.7,221.2 L 645.4,217.6 L 656.6,210.4 L 663.4,196.0 L 661.1,174.3 L 654.4,159.9 L 638.7,156.3 L 620.7,163.5 L 616.2,170.7 L 602.7,185.2 L 602.7,196.0 Z",
  "Hertfordshire": "M 616.2,224.8 L 620.7,242.9 L 625.2,260.9 L 638.7,268.1 L 652.1,271.8 L 665.6,268.1 L 676.8,260.9 L 683.6,250.1 L 690.3,235.7 L 685.8,221.2 L 679.1,210.4 L 663.4,196.0 L 656.6,210.4 L 645.4,217.6 L 629.7,221.2 L 616.2,224.8 Z",
  "Cambridgeshire": "M 661.1,174.3 L 663.4,196.0 L 679.1,210.4 L 685.8,221.2 L 697.1,210.4 L 710.5,192.4 L 721.8,170.7 L 728.5,149.1 L 719.5,123.8 L 706.0,109.4 L 688.1,98.6 L 670.1,102.2 L 654.4,113.0 L 638.7,123.8 L 638.7,156.3 L 654.4,159.9 L 661.1,174.3 Z",
  "Norfolk": "M 728.5,87.7 L 717.3,109.4 L 719.5,123.8 L 728.5,149.1 L 744.2,141.9 L 771.2,134.6 L 791.4,127.4 L 818.3,116.6 L 843.0,109.4 L 870.0,94.9 L 867.8,73.3 L 854.3,51.6 L 825.1,37.2 L 795.9,30.0 L 768.9,33.6 L 744.2,48.0 L 728.5,69.7 L 728.5,87.7 Z",
  "Suffolk": "M 719.5,123.8 L 721.8,170.7 L 735.2,192.4 L 753.2,203.2 L 771.2,206.8 L 791.4,203.2 L 809.4,199.6 L 827.3,192.4 L 847.5,177.9 L 865.5,163.5 L 870.0,138.2 L 870.0,116.6 L 870.0,94.9 L 843.0,109.4 L 818.3,116.6 L 791.4,127.4 L 771.2,134.6 L 744.2,141.9 L 728.5,149.1 L 719.5,123.8 Z",
  "Essex": "M 676.8,260.9 L 688.1,282.6 L 701.6,289.8 L 719.5,289.8 L 739.7,286.2 L 759.9,282.6 L 780.2,271.8 L 795.9,250.1 L 798.1,228.5 L 791.4,210.4 L 791.4,203.2 L 771.2,206.8 L 753.2,203.2 L 735.2,192.4 L 721.8,170.7 L 710.5,192.4 L 697.1,210.4 L 685.8,221.2 L 690.3,235.7 L 683.6,250.1 L 676.8,260.9 Z",
  "Greater London": "M 618.4,260.9 L 638.7,268.1 L 652.1,271.8 L 665.6,268.1 L 676.8,260.9 L 683.6,279.0 L 692.6,293.4 L 688.1,304.2 L 679.1,315.1 L 665.6,322.3 L 654.4,322.3 L 640.9,318.7 L 625.2,315.1 L 616.2,304.2 L 611.7,293.4 L 607.2,279.0 L 607.2,268.1 L 618.4,260.9 Z",
  "Surrey": "M 578.0,315.1 L 591.5,304.2 L 596.0,293.4 L 611.7,293.4 L 616.2,304.2 L 625.2,315.1 L 640.9,318.7 L 654.4,322.3 L 665.6,322.3 L 667.9,336.7 L 665.6,351.1 L 656.6,358.4 L 640.9,362.0 L 622.9,362.0 L 605.0,358.4 L 591.5,351.1 L 582.5,343.9 L 578.0,329.5 L 578.0,315.1 Z",
  "Kent": "M 679.1,315.1 L 688.1,304.2 L 692.6,293.4 L 688.1,282.6 L 701.6,289.8 L 719.5,289.8 L 739.7,304.2 L 762.2,315.1 L 784.7,318.7 L 807.1,325.9 L 827.3,333.1 L 829.6,351.1 L 816.1,365.6 L 793.6,376.4 L 768.9,380.0 L 742.0,372.8 L 717.3,369.2 L 697.1,362.0 L 683.6,354.7 L 672.4,347.5 L 667.9,336.7 L 665.6,322.3 L 679.1,315.1 Z",
  "West Sussex": "M 582.5,383.6 L 584.8,383.6 L 605.0,383.6 L 622.9,387.2 L 640.9,390.8 L 656.6,387.2 L 672.4,380.0 L 667.9,369.2 L 665.6,358.4 L 665.6,351.1 L 656.6,358.4 L 640.9,362.0 L 622.9,362.0 L 605.0,358.4 L 591.5,351.1 L 582.5,365.6 L 578.0,365.6 L 582.5,383.6 Z",
  "East Sussex": "M 672.4,380.0 L 683.6,405.3 L 697.1,416.1 L 710.5,419.7 L 730.7,412.5 L 746.5,405.3 L 762.2,398.0 L 766.7,380.0 L 742.0,372.8 L 717.3,369.2 L 697.1,362.0 L 683.6,354.7 L 672.4,347.5 L 667.9,369.2 L 672.4,380.0 Z",
};

// Centre points for labels
const COUNTY_CENTRES = {
  "Cornwall": [116.5, 481.7],
  "Devon": [238.2, 428.4],
  "Somerset": [324.5, 351.3],
  "Dorset": [388.5, 412.2],
  "Wiltshire": [434.5, 335.4],
  "Hampshire": [519.8, 388.3],
  "Isle of Wight": [524.1, 443.8],
  "Gloucestershire": [418.8, 255.3],
  "Herefordshire": [362.6, 213.2],
  "Worcestershire": [415.7, 168.0],
  "Shropshire": [361.8, 117.6],
  "Warwickshire": [482.9, 157.1],
  "Northamptonshire": [564.8, 150.0],
  "Oxfordshire": [510.6, 241.1],
  "Buckinghamshire": [564.7, 233.8],
  "Berkshire": [552.8, 303.3],
  "Bedfordshire": [632.1, 191.3],
  "Hertfordshire": [655.3, 237.3],
  "Cambridgeshire": [682.3, 157.0],
  "Norfolk": [783.3, 90.5],
  "Suffolk": [797.3, 155.9],
  "Essex": [734.6, 236.9],
  "Greater London": [648.4, 290.9],
  "Surrey": [621.7, 330.1],
  "Kent": [733.8, 332.3],
  "West Sussex": [626.0, 370.5],
  "East Sussex": [710.7, 385.2],
};

// County abbreviations for compact labels
const COUNTY_SHORT = {
  "Greater London": "London",
  "Buckinghamshire": "Bucks",
  "Hertfordshire": "Herts",
  "Gloucestershire": "Glos",
  "Cambridgeshire": "Cambs",
  "Northamptonshire": "Northants",
  "Herefordshire": "Herefs",
  "Worcestershire": "Worcs",
  "Isle of Wight": "IoW",
  "Warwickshire": "Warks",
  "Bedfordshire": "Beds",
  "Shropshire": "Shrops",
};

// Colour palette matching LeadEngine
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
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif" };

// Heat map colour based on lead count
function getCountyFill(count, maxCount) {
  if (count === 0) return "#F0ECE5";
  const intensity = Math.max(0.12, Math.min(1, count / Math.max(maxCount, 1)));
  const r = Math.round(232 - intensity * (232 - 125));
  const g = Math.round(213 - intensity * (213 - 90));
  const b = Math.round(168 - intensity * (168 - 26));
  return `rgb(${r},${g},${b})`;
}

export default function CountyMap({ leads, onCountyClick }) {
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  const countsByCounty = useMemo(() => {
    const counts = {};
    Object.keys(COUNTY_PATHS).forEach(c => { counts[c] = 0; });
    leads.forEach(l => {
      const co = l.county || "";
      if (counts[co] !== undefined) counts[co]++;
    });
    return counts;
  }, [leads]);

  const maxCount = useMemo(() => Math.max(...Object.values(countsByCounty), 1), [countsByCounty]);
  const totalCounties = useMemo(() => Object.values(countsByCounty).filter(c => c > 0).length, [countsByCounty]);
  const totalLeads = useMemo(() => Object.values(countsByCounty).reduce((s, c) => s + c, 0), [countsByCounty]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0, fontFamily: F.serif }}>
            Southern England — Venue Map
          </h3>
          <p style={{ fontSize: 13, color: C.inkMuted, margin: "6px 0 0", fontFamily: F.sans }}>
            {totalLeads} venues across {totalCounties} counties · Click a county to view its leads
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>Fewer</span>
          <div style={{ display: "flex", gap: 1 }}>
            {[0.12, 0.3, 0.5, 0.75, 1].map((int, i) => (
              <div key={i} style={{
                width: 18, height: 10, borderRadius: 2,
                background: getCountyFill(int * maxCount, maxCount),
                border: `1px solid ${C.border}`
              }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>More</span>
        </div>
      </div>

      {/* Map */}
      <div style={{ position: "relative" }} onMouseMove={handleMouseMove}>
        <svg
          viewBox="0 0 900 580"
          style={{ width: "100%", maxWidth: 900, margin: "0 auto", display: "block" }}
        >
          {/* Background sea */}
          <rect x="0" y="0" width="900" height="580" fill="#F7F5F0" rx="8" />

          {Object.entries(COUNTY_PATHS).map(([county, path]) => {
            const count = countsByCounty[county] || 0;
            const isHovered = hoveredCounty === county;
            const hasLeads = count > 0;
            const shortName = COUNTY_SHORT[county] || county;
            const centre = COUNTY_CENTRES[county];
            // Determine font size based on county area (small counties get smaller text)
            const isSmall = ["Isle of Wight", "Greater London", "Bedfordshire", "Berkshire"].includes(county);
            const fontSize = isSmall ? 7 : 8.5;

            return (
              <g key={county}>
                <path
                  d={path}
                  fill={isHovered ? (hasLeads ? C.accent : "#DDD8D0") : getCountyFill(count, maxCount)}
                  stroke={isHovered ? C.ink : (hasLeads ? "#B8922E80" : "#D4CFC6")}
                  strokeWidth={isHovered ? 2 : 0.8}
                  strokeLinejoin="round"
                  style={{
                    transition: "all 0.2s ease",
                    cursor: hasLeads ? "pointer" : "default",
                    filter: isHovered && hasLeads ? "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" : "none",
                  }}
                  onMouseEnter={() => setHoveredCounty(county)}
                  onMouseLeave={() => setHoveredCounty(null)}
                  onClick={() => hasLeads && onCountyClick(county)}
                />
                {/* Label — show name + count for counties with leads */}
                {hasLeads && centre && (
                  <>
                    <text
                      x={centre[0]} y={centre[1] - 5}
                      textAnchor="middle"
                      style={{
                        fontSize, fontWeight: 700,
                        fontFamily: "Inter, -apple-system, sans-serif",
                        fill: isHovered ? "#fff" : C.inkSec,
                        pointerEvents: "none",
                        transition: "fill 0.2s",
                      }}
                    >{shortName}</text>
                    <text
                      x={centre[0]} y={centre[1] + 8}
                      textAnchor="middle"
                      style={{
                        fontSize: 10, fontWeight: 900,
                        fontFamily: "Inter, -apple-system, sans-serif",
                        fill: isHovered ? "#fff" : C.accent,
                        pointerEvents: "none",
                        transition: "fill 0.2s",
                      }}
                    >{count}</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredCounty && (
          <div style={{
            position: "absolute",
            left: Math.min(tooltip.x + 16, 800),
            top: tooltip.y - 60,
            background: C.ink,
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: F.sans,
            fontWeight: 600,
            pointerEvents: "none",
            zIndex: 100,
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{hoveredCounty}</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>
              {countsByCounty[hoveredCounty] || 0} venue{(countsByCounty[hoveredCounty] || 0) !== 1 ? "s" : ""}
              {(countsByCounty[hoveredCounty] || 0) > 0 && " — click to view"}
            </div>
          </div>
        )}
      </div>

      {/* County pills grid */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.borderLight}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, fontFamily: F.sans }}>
          All Regions ({totalLeads} venues)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(countsByCounty)
            .sort((a, b) => b[1] - a[1])
            .map(([county, count]) => (
              <button
                key={county}
                onClick={() => count > 0 && onCountyClick(county)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 11px", borderRadius: 20,
                  border: `1px solid ${count > 0 ? C.accent + "30" : C.borderLight}`,
                  background: count > 0 ? C.accentSubtle : "transparent",
                  color: count > 0 ? C.ink : C.inkMuted,
                  fontSize: 12, fontWeight: 600, fontFamily: F.sans,
                  cursor: count > 0 ? "pointer" : "default",
                  transition: "all 0.15s",
                  opacity: count > 0 ? 1 : 0.5,
                }}
                onMouseEnter={e => {
                  if (count > 0) {
                    e.currentTarget.style.background = C.accent;
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = C.accent;
                  }
                }}
                onMouseLeave={e => {
                  if (count > 0) {
                    e.currentTarget.style.background = C.accentSubtle;
                    e.currentTarget.style.color = C.ink;
                    e.currentTarget.style.borderColor = C.accent + "30";
                  }
                }}
              >
                {COUNTY_SHORT[county] || county}
                <span style={{
                  background: count > 0 ? C.accent + "18" : "transparent",
                  padding: "1px 6px", borderRadius: 10,
                  fontSize: 11, fontWeight: 800,
                  color: count > 0 ? C.accent : C.inkMuted,
                }}>{count}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
