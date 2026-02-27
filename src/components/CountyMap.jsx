import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Interactive County Map — Southern England
// Hover to see county name + lead count, click to filter leads
// Matches white editorial design: cream/ivory, Georgia serif, warm tones
// ═══════════════════════════════════════════════════════════════

// Approximate SVG polygon paths for Southern England counties
// ViewBox: 0 0 1000 800 — West Cornwall at left, Norfolk/Suffolk at right
// These are simplified but geographically recognisable shapes

const COUNTY_PATHS = {
  "Cornwall": "M 30,530 L 55,505 L 80,498 L 105,505 L 120,520 L 135,530 L 150,528 L 165,535 L 175,550 L 160,570 L 140,580 L 115,585 L 90,575 L 65,565 L 45,555 L 30,545 Z",
  "Devon": "M 135,530 L 150,528 L 165,535 L 175,550 L 190,525 L 205,510 L 225,500 L 245,490 L 260,485 L 275,478 L 280,495 L 275,515 L 265,530 L 255,550 L 240,565 L 220,575 L 195,580 L 170,575 L 160,570 L 175,550 Z",
  "Somerset": "M 225,500 L 245,490 L 260,485 L 275,478 L 290,470 L 310,460 L 325,455 L 325,475 L 320,490 L 310,500 L 295,505 L 280,495 L 275,515 L 265,530 L 250,520 L 235,510 Z",
  "Dorset": "M 265,530 L 275,515 L 295,505 L 310,500 L 320,490 L 335,500 L 350,510 L 365,515 L 375,525 L 365,540 L 345,548 L 325,552 L 305,548 L 285,545 L 270,540 Z",
  "Wiltshire": "M 310,460 L 325,455 L 340,450 L 360,445 L 380,440 L 395,448 L 400,465 L 395,480 L 385,495 L 375,510 L 365,515 L 350,510 L 335,500 L 320,490 L 325,475 Z",
  "Hampshire": "M 375,510 L 385,495 L 395,480 L 400,465 L 420,460 L 440,455 L 460,460 L 475,470 L 480,490 L 475,510 L 465,525 L 450,535 L 430,540 L 410,538 L 395,530 L 380,525 Z",
  "Isle of Wight": "M 420,558 L 440,552 L 460,555 L 465,565 L 450,572 L 430,572 L 420,565 Z",
  "Gloucestershire": "M 280,380 L 300,370 L 320,365 L 340,360 L 355,370 L 360,390 L 355,410 L 345,425 L 335,440 L 325,455 L 310,460 L 290,470 L 275,460 L 270,440 L 272,420 L 275,400 Z",
  "Herefordshire": "M 230,365 L 250,355 L 270,350 L 280,358 L 280,380 L 275,400 L 270,420 L 260,430 L 245,425 L 232,415 L 225,400 L 225,380 Z",
  "Worcestershire": "M 270,350 L 290,340 L 310,335 L 320,345 L 320,365 L 300,370 L 280,380 L 280,358 Z",
  "Shropshire": "M 215,310 L 240,300 L 260,295 L 280,300 L 290,315 L 290,340 L 270,350 L 250,355 L 230,365 L 220,350 L 215,335 Z",
  "Warwickshire": "M 310,335 L 330,325 L 350,315 L 370,310 L 385,320 L 390,340 L 385,360 L 370,370 L 355,370 L 340,360 L 320,365 L 320,345 Z",
  "Northamptonshire": "M 385,320 L 405,310 L 430,305 L 455,310 L 470,320 L 475,340 L 468,355 L 455,365 L 435,370 L 415,375 L 395,380 L 385,370 L 385,360 L 390,340 Z",
  "Oxfordshire": "M 355,410 L 370,400 L 385,395 L 395,380 L 415,375 L 430,380 L 440,395 L 435,415 L 425,430 L 410,440 L 395,448 L 380,440 L 360,445 L 355,430 Z",
  "Buckinghamshire": "M 435,370 L 455,365 L 470,370 L 480,380 L 485,400 L 480,420 L 470,435 L 455,440 L 440,445 L 440,430 L 435,415 L 440,395 L 430,380 Z",
  "Bedfordshire": "M 470,320 L 490,315 L 510,320 L 520,335 L 515,355 L 500,365 L 485,370 L 470,370 L 468,355 L 475,340 Z",
  "Hertfordshire": "M 485,370 L 500,365 L 515,370 L 530,378 L 540,390 L 538,405 L 525,415 L 510,420 L 495,418 L 485,410 L 480,400 L 485,385 Z",
  "Cambridgeshire": "M 510,320 L 535,310 L 560,305 L 580,310 L 595,325 L 600,345 L 595,365 L 580,375 L 560,380 L 540,378 L 530,378 L 515,370 L 515,355 L 520,335 Z",
  "Norfolk": "M 595,260 L 625,250 L 660,248 L 695,255 L 720,268 L 730,285 L 725,305 L 710,318 L 690,325 L 665,328 L 640,325 L 620,318 L 605,310 L 595,295 L 592,278 Z",
  "Suffolk": "M 605,310 L 620,318 L 640,325 L 665,328 L 680,335 L 685,355 L 675,370 L 660,378 L 640,382 L 620,380 L 600,375 L 585,370 L 580,375 L 595,365 L 600,345 L 595,325 Z",
  "Essex": "M 540,390 L 560,380 L 580,375 L 600,375 L 620,380 L 635,390 L 645,405 L 640,420 L 628,432 L 612,438 L 595,435 L 578,430 L 562,425 L 548,418 L 538,405 Z",
  "Greater London": "M 495,418 L 510,420 L 525,415 L 538,418 L 548,425 L 555,440 L 548,455 L 535,462 L 518,465 L 500,462 L 488,455 L 480,445 L 480,435 L 485,425 Z",
  "Surrey": "M 480,445 L 488,455 L 500,462 L 518,465 L 535,462 L 548,455 L 555,460 L 555,478 L 545,492 L 528,498 L 508,500 L 490,498 L 475,490 L 468,478 L 470,462 Z",
  "Kent": "M 548,425 L 562,425 L 578,430 L 595,435 L 612,438 L 628,432 L 645,440 L 658,450 L 665,465 L 655,480 L 638,490 L 615,495 L 592,492 L 572,488 L 555,478 L 555,460 L 548,455 Z",
  "Berkshire": "M 400,465 L 420,460 L 440,455 L 455,440 L 470,435 L 480,445 L 470,462 L 460,475 L 445,480 L 428,478 L 412,475 Z",
  "West Sussex": "M 475,490 L 490,498 L 508,500 L 528,498 L 545,492 L 555,502 L 548,518 L 530,528 L 510,532 L 490,530 L 472,522 L 465,510 L 468,498 Z",
  "East Sussex": "M 545,492 L 555,502 L 572,505 L 590,500 L 608,498 L 620,502 L 625,515 L 615,528 L 598,535 L 575,535 L 555,530 L 548,518 Z",
};

// County abbreviations/short names for compact display
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

// Approximate centre points for labels (x, y)
const COUNTY_CENTRES = {
  "Cornwall": [105, 548],
  "Devon": [218, 535],
  "Somerset": [290, 492],
  "Dorset": [328, 530],
  "Wiltshire": [362, 472],
  "Hampshire": [438, 498],
  "Isle of Wight": [442, 562],
  "Gloucestershire": [315, 415],
  "Herefordshire": [252, 390],
  "Worcestershire": [295, 358],
  "Shropshire": [255, 330],
  "Warwickshire": [360, 345],
  "Northamptonshire": [435, 342],
  "Oxfordshire": [400, 420],
  "Buckinghamshire": [465, 405],
  "Bedfordshire": [498, 342],
  "Hertfordshire": [512, 395],
  "Cambridgeshire": [558, 345],
  "Norfolk": [660, 288],
  "Suffolk": [635, 358],
  "Essex": [590, 410],
  "Greater London": [520, 442],
  "Surrey": [515, 478],
  "Kent": [608, 465],
  "Berkshire": [442, 465],
  "West Sussex": [508, 512],
  "East Sussex": [580, 515],
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

// Intensity colour based on lead count
function getCountyFill(count, maxCount) {
  if (count === 0) return "#F0ECE5";
  const intensity = Math.max(0.15, Math.min(1, count / Math.max(maxCount, 1)));
  // Warm gold gradient: from light (#E8D5A8) to deep (#7D5A1A)
  const r = Math.round(232 - intensity * (232 - 125));
  const g = Math.round(213 - intensity * (213 - 90));
  const b = Math.round(168 - intensity * (168 - 26));
  return `rgb(${r},${g},${b})`;
}

export default function CountyMap({ leads, onCountyClick }) {
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  // Count leads per county
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0, fontFamily: F.serif }}>
            Southern England — Venue Map
          </h3>
          <p style={{ fontSize: 13, color: C.inkMuted, margin: "6px 0 0", fontFamily: F.sans }}>
            {leads.length} venues across {totalCounties} counties · Click a county to view its leads
          </p>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>Fewer</span>
          <div style={{ display: "flex", gap: 2 }}>
            {[0.15, 0.35, 0.55, 0.75, 1].map((int, i) => (
              <div key={i} style={{
                width: 20, height: 12, borderRadius: 2,
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
          viewBox="0 0 770 600"
          style={{
            width: "100%",
            maxWidth: 900,
            margin: "0 auto",
            display: "block",
            cursor: "pointer",
          }}
        >
          {/* County paths */}
          {Object.entries(COUNTY_PATHS).map(([county, path]) => {
            const count = countsByCounty[county] || 0;
            const isHovered = hoveredCounty === county;
            const hasLeads = count > 0;

            return (
              <g key={county}>
                <path
                  d={path}
                  fill={isHovered ? (hasLeads ? C.accent : "#E6E1D9") : getCountyFill(count, maxCount)}
                  stroke={isHovered ? C.ink : (hasLeads ? C.accent + "60" : C.border)}
                  strokeWidth={isHovered ? 2.5 : 1.2}
                  style={{
                    transition: "all 0.2s ease",
                    filter: isHovered ? "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" : "none",
                    cursor: hasLeads ? "pointer" : "default",
                  }}
                  onMouseEnter={() => setHoveredCounty(county)}
                  onMouseLeave={() => setHoveredCounty(null)}
                  onClick={() => hasLeads && onCountyClick(county)}
                />
                {/* County label - only show for counties with leads */}
                {hasLeads && COUNTY_CENTRES[county] && (
                  <>
                    <text
                      x={COUNTY_CENTRES[county][0]}
                      y={COUNTY_CENTRES[county][1] - 6}
                      textAnchor="middle"
                      style={{
                        fontSize: county === "Greater London" || county === "Isle of Wight" ? 7 : 8,
                        fontWeight: 700,
                        fontFamily: "Inter, -apple-system, sans-serif",
                        fill: isHovered ? "#fff" : C.inkSec,
                        pointerEvents: "none",
                        transition: "fill 0.2s",
                      }}
                    >
                      {COUNTY_SHORT[county] || county}
                    </text>
                    <text
                      x={COUNTY_CENTRES[county][0]}
                      y={COUNTY_CENTRES[county][1] + 8}
                      textAnchor="middle"
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        fontFamily: "Inter, -apple-system, sans-serif",
                        fill: isHovered ? "#fff" : C.accent,
                        pointerEvents: "none",
                        transition: "fill 0.2s",
                      }}
                    >
                      {count}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip on hover */}
        {hoveredCounty && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x + 15,
              top: tooltip.y - 10,
              background: C.ink,
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: F.sans,
              fontWeight: 600,
              pointerEvents: "none",
              zIndex: 100,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
              transform: "translateY(-100%)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{hoveredCounty}</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>
              {countsByCounty[hoveredCounty] || 0} venue{(countsByCounty[hoveredCounty] || 0) !== 1 ? "s" : ""}
              {(countsByCounty[hoveredCounty] || 0) > 0 && " — click to view"}
            </div>
          </div>
        )}
      </div>

      {/* County grid below map */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.borderLight}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, fontFamily: F.sans }}>
          All Regions
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(countsByCounty)
            .sort((a, b) => b[1] - a[1])
            .map(([county, count]) => (
              <button
                key={county}
                onClick={() => count > 0 && onCountyClick(county)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: `1px solid ${count > 0 ? C.accent + "30" : C.borderLight}`,
                  background: count > 0 ? C.accentSubtle : "transparent",
                  color: count > 0 ? C.ink : C.inkMuted,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: F.sans,
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
                  padding: "1px 6px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 800,
                  color: count > 0 ? C.accent : C.inkMuted,
                }}>
                  {count}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
