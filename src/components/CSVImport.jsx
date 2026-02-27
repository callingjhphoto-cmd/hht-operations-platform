import { useState, useRef } from "react";
import Papa from "papaparse";
import { bulkCreateLeads } from "../lib/store";

// ── Theme ──
const C = {
  bg: "#FAFAF8", bgWarm: "#F5F1EC", card: "#FFFFFF",
  ink: "#18150F", inkSec: "#5C564E", inkMuted: "#9A948C",
  accent: "#7D5A1A", accentSubtle: "rgba(125,90,26,0.06)",
  border: "#E6E1D9", borderLight: "#F0ECE5",
  success: "#2B7A4B", successBg: "#F0F9F3",
  warn: "#956018", warnBg: "#FFF9F0",
  danger: "#9B3535", dangerBg: "#FDF2F2",
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif" };
const cardStyle = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...extra });
const btnStyle = (variant = "primary") => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", border: "none", transition: "all 0.15s" };
  if (variant === "primary") return { ...base, background: C.ink, color: "#fff" };
  if (variant === "outline") return { ...base, background: "transparent", color: C.ink, border: `1px solid ${C.border}` };
  if (variant === "accent") return { ...base, background: C.accent, color: "#fff" };
  if (variant === "ghost") return { ...base, background: "transparent", color: C.inkSec, padding: "6px 10px" };
  if (variant === "success") return { ...base, background: C.success, color: "#fff" };
  return base;
};

// ── Column mapping — maps CSV headers to our fields ──
const FIELD_MAP = {
  // Venue name
  'name': 'name', 'venue': 'name', 'venue name': 'name', 'venue_name': 'name',
  'business name': 'name', 'business': 'name', 'company': 'name',
  // Location
  'location': 'location', 'area': 'location', 'neighbourhood': 'location', 'district': 'location',
  'address': 'location',
  // City
  'city': 'city', 'town': 'city',
  // Category
  'category': 'category', 'type': 'category', 'venue type': 'category', 'venue_type': 'category',
  // Capacity
  'capacity': 'capacity', 'cap': 'capacity', 'pax': 'capacity', 'guests': 'capacity', 'max capacity': 'capacity',
  // Contact
  'contact': 'contactName', 'contact name': 'contactName', 'contact_name': 'contactName',
  'email': 'contactEmail', 'contact email': 'contactEmail', 'contact_email': 'contactEmail',
  'phone': 'contactPhone', 'contact phone': 'contactPhone', 'contact_phone': 'contactPhone', 'telephone': 'contactPhone',
  // Other
  'website': 'website', 'url': 'website', 'site': 'website',
  'notes': 'notes', 'note': 'notes', 'comments': 'notes', 'description': 'notes',
};

const normalizeHeader = (h) => h.trim().toLowerCase().replace(/[^a-z0-9 _]/g, '');

// ══════════════════════════════════════════════════════════════════════════════
// CSV IMPORT — Upload venues from Google Sheets / CSV
// ══════════════════════════════════════════════════════════════════════════════

const CSVImport = ({ onClose, onImported }) => {
  const [step, setStep] = useState('upload'); // upload | preview | mapping | done
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [imported, setImported] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError('Could not parse file. Please make sure it\'s a valid CSV.');
          return;
        }
        if (results.data.length === 0) {
          setError('No data found in file.');
          return;
        }

        setRawData(results.data);
        const hdrs = results.meta.fields || [];
        setHeaders(hdrs);

        // Auto-map columns
        const autoMap = {};
        hdrs.forEach(h => {
          const norm = normalizeHeader(h);
          if (FIELD_MAP[norm]) autoMap[h] = FIELD_MAP[norm];
        });
        setMapping(autoMap);
        setStep('preview');
      },
      error: () => setError('Error reading file. Please try again.'),
    });
  };

  const handleImport = () => {
    const mapped = rawData.map(row => {
      const lead = {};
      Object.entries(mapping).forEach(([csvCol, field]) => {
        if (field && row[csvCol] !== undefined) {
          lead[field] = row[csvCol];
        }
      });
      return lead;
    }).filter(l => l.name); // Must have at least a name

    if (mapped.length === 0) {
      setError('No valid leads to import. Make sure at least the "name" column is mapped.');
      return;
    }

    const created = bulkCreateLeads(mapped);
    setImported(created.length);
    setStep('done');
  };

  const OUR_FIELDS = ['name', 'location', 'city', 'category', 'capacity', 'contactName', 'contactEmail', 'contactPhone', 'website', 'notes'];
  const fieldLabels = { name: 'Venue Name', location: 'Location', city: 'City', category: 'Category', capacity: 'Capacity', contactName: 'Contact Name', contactEmail: 'Contact Email', contactPhone: 'Contact Phone', website: 'Website', notes: 'Notes' };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <button onClick={onClose} style={btnStyle("ghost")}>← Back to Leads</button>
      <div style={cardStyle({ marginTop: 16 })}>
        <h2 style={{ fontFamily: F.serif, fontSize: 22, margin: "0 0 4px 0" }}>Import Venues from CSV</h2>
        <p style={{ color: C.inkMuted, fontSize: 13, marginBottom: 20 }}>
          Upload a CSV file exported from Google Sheets or any spreadsheet. We'll auto-detect your columns.
        </p>

        {error && (
          <div style={{ padding: "10px 14px", background: C.dangerBg, border: `1px solid #E8C4C4`, borderRadius: 6, color: C.danger, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${C.border}`, borderRadius: 10, padding: 40, textAlign: "center",
                cursor: "pointer", background: C.bgWarm, transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Click to upload CSV file</div>
              <div style={{ fontSize: 12, color: C.inkMuted }}>Accepts .csv files exported from Google Sheets, Excel, etc.</div>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} style={{ display: "none" }} />

            <div style={{ marginTop: 20, padding: 16, background: C.bgWarm, borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Expected columns (we'll auto-detect):</div>
              <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.6 }}>
                <strong>Required:</strong> Name (or Venue, Business Name)<br/>
                <strong>Optional:</strong> Location, City, Category, Capacity, Contact Name, Email, Phone, Website, Notes
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Column Mapping */}
        {step === 'preview' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Column Mapping ({rawData.length} rows found)</div>
              <p style={{ fontSize: 12, color: C.inkMuted }}>We auto-detected most columns. Review and adjust if needed:</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase" }}>CSV Column</div>
              <div style={{ fontSize: 11, color: C.inkMuted }}>→</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase" }}>Maps to</div>
              {headers.map(h => (
                <>
                  <div key={`csv-${h}`} style={{ fontSize: 13, padding: "6px 10px", background: C.bgWarm, borderRadius: 4 }}>
                    {h}
                    <span style={{ fontSize: 10, color: C.inkMuted, marginLeft: 8 }}>
                      e.g. "{rawData[0]?.[h]?.toString().slice(0, 30) || ''}"
                    </span>
                  </div>
                  <div key={`arrow-${h}`} style={{ color: C.inkMuted }}>→</div>
                  <select
                    key={`map-${h}`}
                    value={mapping[h] || ''}
                    onChange={e => setMapping({ ...mapping, [h]: e.target.value })}
                    style={{ padding: "6px 10px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: mapping[h] ? C.successBg : C.card }}
                  >
                    <option value="">— Skip —</option>
                    {OUR_FIELDS.map(f => (
                      <option key={f} value={f}>{fieldLabels[f]}</option>
                    ))}
                  </select>
                </>
              ))}
            </div>

            {/* Data Preview */}
            <div style={{ marginBottom: 16, maxHeight: 200, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 6 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: C.bgWarm }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, color: C.inkMuted }}>#</th>
                    {headers.filter(h => mapping[h]).map(h => (
                      <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, color: C.inkMuted }}>{fieldLabels[mapping[h]]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 5).map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ padding: "6px 8px", color: C.inkMuted }}>{i + 1}</td>
                      {headers.filter(h => mapping[h]).map(h => (
                        <td key={h} style={{ padding: "6px 8px" }}>{row[h]?.toString().slice(0, 40) || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rawData.length > 5 && <div style={{ padding: 8, textAlign: "center", fontSize: 11, color: C.inkMuted }}>...and {rawData.length - 5} more rows</div>}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleImport} style={btnStyle("accent")} disabled={!mapping[headers.find(h => mapping[h] === 'name')]}>
                Import {rawData.length} Venues
              </button>
              <button onClick={() => { setStep('upload'); setRawData([]); setHeaders([]); }} style={btnStyle("outline")}>Upload Different File</button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif, marginBottom: 8 }}>
              {imported} venues imported successfully
            </div>
            <p style={{ color: C.inkMuted, fontSize: 13, marginBottom: 20 }}>
              All new leads start in the "Identified" stage. You can now research and progress them through the pipeline.
            </p>
            <button onClick={() => onImported(imported)} style={btnStyle("accent")}>Back to Lead Engine</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVImport;
