import { useState, useEffect, useCallback, useRef } from "react";
import scraperEngine from "../lib/scraperEngine";

// ── Theme (matches LeadEngine) ──
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
const btnStyle = (variant = "primary") => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", border: "none", transition: "all 0.15s" };
  if (variant === "primary") return { ...base, background: C.ink, color: "#fff" };
  if (variant === "accent") return { ...base, background: C.accent, color: "#fff" };
  if (variant === "outline") return { ...base, background: "transparent", color: C.ink, border: `1px solid ${C.border}` };
  if (variant === "ghost") return { ...base, background: "transparent", color: C.inkSec, padding: "6px 10px" };
  if (variant === "danger") return { ...base, background: C.danger, color: "#fff" };
  if (variant === "success") return { ...base, background: C.success, color: "#fff" };
  return base;
};
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });
const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", boxSizing: "border-box" };

// ══════════════════════════════════════════════════════════════════════════════
// SCRAPER PANEL — Configure APIs, run scrapes, view results, schedule
// ══════════════════════════════════════════════════════════════════════════════

export default function ScraperPanel({ leads, onAddLeads, onBack }) {
  const [tab, setTab] = useState("sources"); // sources | run | results | schedule
  const [adapters, setAdapters] = useState([]);
  const [apiKeys, setApiKeys] = useState(() => scraperEngine.state.apiKeys || {});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [scrapedLeads, setScrapedLeads] = useState(() => scraperEngine.getScrapedLeads());
  const [schedule, setSchedule] = useState(() => scraperEngine.state.schedule || {});
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [scanType, setScanType] = useState("full"); // full | instagram | enrich
  const logRef = useRef([]);
  const [logLines, setLogLines] = useState([]);

  useEffect(() => {
    setAdapters(scraperEngine.getAdapterInfo());
  }, [apiKeys]);

  // Save API keys
  const handleSaveKeys = useCallback(() => {
    scraperEngine.setApiKeys(apiKeys);
    setAdapters(scraperEngine.getAdapterInfo());
  }, [apiKeys]);

  // Add log line
  const addLog = useCallback((msg) => {
    const entry = { time: new Date().toLocaleTimeString('en-GB'), msg };
    logRef.current = [...logRef.current.slice(-99), entry];
    setLogLines([...logRef.current]);
  }, []);

  // Run scan
  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setScanResults(null);
    logRef.current = [];
    setLogLines([]);

    scraperEngine.onProgress = (info) => {
      setProgress(info);
      addLog(info.message);
    };
    scraperEngine.onLeadFound = (lead) => {
      addLog(`NEW LEAD: ${lead.venue_name} (${lead.county})`);
      setScrapedLeads(scraperEngine.getScrapedLeads());
    };

    try {
      let results;
      if (scanType === "instagram") {
        results = await scraperEngine.runInstagramScan({
          counties: selectedCounties.length > 0 ? selectedCounties : undefined,
        });
      } else if (scanType === "enrich") {
        results = await scraperEngine.enrichLeadsWithJina(leads || []);
      } else {
        results = await scraperEngine.runFullScan({
          counties: selectedCounties.length > 0 ? selectedCounties : undefined,
          sources: selectedSources.length > 0 ? selectedSources : undefined,
        });
      }
      setScanResults(results);
      addLog(`SCAN COMPLETE: ${results.found || results.enriched || 0} new leads found`);
    } catch (err) {
      addLog(`ERROR: ${err.message}`);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }, [running, scanType, selectedCounties, selectedSources, leads, addLog]);

  // Abort
  const handleAbort = useCallback(() => {
    scraperEngine.abort();
    setRunning(false);
    addLog("ABORTED by user");
  }, [addLog]);

  // Import scraped leads into main pipeline
  const handleImportAll = useCallback(() => {
    const newLeads = scrapedLeads.map((lead, i) => ({
      ...lead,
      id: `scraped_${Date.now()}_${i}`,
      score: 30,
      stage: "scraped",
      assigned_to: "",
      est_value: 0,
      notes: lead.trigger_event || "",
      activities: [],
      created_at: lead.scraped_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    onAddLeads?.(newLeads);
    addLog(`IMPORTED ${newLeads.length} leads into pipeline`);
  }, [scrapedLeads, onAddLeads, addLog]);

  // Schedule toggle
  const handleScheduleToggle = useCallback(() => {
    const newEnabled = !schedule.enabled;
    const interval = schedule.intervalHours || 4;
    scraperEngine.setSchedule(interval, newEnabled);
    setSchedule(scraperEngine.state.schedule);
    addLog(newEnabled ? `SCHEDULER ON: every ${interval}h` : "SCHEDULER OFF");
  }, [schedule, addLog]);

  const allCounties = Object.keys(
    scraperEngine.adapters?.['google-places']?.countyCoords ||
    { Surrey: 1, Kent: 1, 'East Sussex': 1, 'West Sussex': 1, Hampshire: 1, Berkshire: 1, Oxfordshire: 1, Buckinghamshire: 1, Hertfordshire: 1, Essex: 1, Suffolk: 1, Norfolk: 1, Cambridgeshire: 1, Dorset: 1, Wiltshire: 1, Somerset: 1, Devon: 1, Cornwall: 1, Gloucestershire: 1, Warwickshire: 1, Northamptonshire: 1, Bedfordshire: 1, Leicestershire: 1, Worcestershire: 1, Nottinghamshire: 1, Lincolnshire: 1, Staffordshire: 1, Shropshire: 1 }
  );

  return (
    <div style={{ fontFamily: F.sans }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onBack && <button onClick={onBack} style={btnStyle("ghost")}>&#8592;</button>}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, fontFamily: F.serif }}>Scraper Engine</h2>
          </div>
          <p style={{ color: C.inkMuted, fontSize: 13, margin: "4px 0 0" }}>
            Multi-source lead discovery using Jina AI, Google Places, Companies House, Instagram & more
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={pillStyle(
            scraperEngine.state.totalLeadsFound > 0 ? C.successBg : C.infoBg,
            scraperEngine.state.totalLeadsFound > 0 ? C.success : C.info,
          )}>
            {scraperEngine.state.totalLeadsFound} leads scraped
          </span>
          {schedule.enabled && (
            <span style={pillStyle(C.successBg, C.success)}>
              Scheduler ON
            </span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: C.bgWarm, padding: 3, borderRadius: 8 }}>
        {[
          { id: "sources", label: "Data Sources" },
          { id: "run", label: "Run Scraper" },
          { id: "results", label: `Results (${scrapedLeads.length})` },
          { id: "schedule", label: "Schedule" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, fontFamily: F.sans,
              background: tab === t.id ? C.card : "transparent",
              color: tab === t.id ? C.ink : C.inkMuted,
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: Data Sources ═══ */}
      {tab === "sources" && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>
            Configured Data Sources
          </div>
          <p style={{ fontSize: 12, color: C.inkSec, marginBottom: 16, lineHeight: 1.5 }}>
            Each source uses a different scraping technique. Jina AI Reader works without any API key.
            Add API keys below to unlock more sources.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginBottom: 24 }}>
            {adapters.map(adapter => (
              <div key={adapter.id} style={{
                ...cardStyle({ padding: 16 }),
                borderColor: adapter.configured ? C.success : C.border,
                borderWidth: adapter.configured ? 2 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, fontFamily: F.serif }}>{adapter.name}</div>
                  <span style={pillStyle(
                    adapter.configured ? C.successBg : C.warnBg,
                    adapter.configured ? C.success : C.warn,
                  )}>
                    {adapter.configured ? 'Active' : 'Needs Key'}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: C.inkSec, margin: "0 0 8px", lineHeight: 1.4 }}>
                  {adapter.description}
                </p>
                <div style={{ fontSize: 10, color: C.inkMuted, marginBottom: 6 }}>
                  <strong>Free limit:</strong> {adapter.freeLimit}
                </div>
                <div style={{ fontSize: 10, fontFamily: F.mono, color: C.info, background: C.infoBg, padding: "4px 8px", borderRadius: 4 }}>
                  {adapter.technique}
                </div>
              </div>
            ))}
          </div>

          {/* API Key Configuration */}
          <div style={cardStyle({ marginBottom: 20 })}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>
              API Keys
            </div>
            <p style={{ fontSize: 12, color: C.inkSec, marginBottom: 16 }}>
              All keys are stored locally in your browser. None are sent to any server except the respective API provider.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { key: "serper", label: "Serper.dev", hint: "Free: 2,500 queries. Get key at serper.dev", unlocks: "Google Search + Instagram Discovery" },
                { key: "companiesHouse", label: "Companies House", hint: "Free & unlimited. Get key at developer.company-information.service.gov.uk", unlocks: "UK company register by SIC code" },
                { key: "googlePlaces", label: "Google Places", hint: "Free: 10,000/month. Get key at console.cloud.google.com", unlocks: "Business search by location" },
                { key: "hunter", label: "Hunter.io", hint: "Free: 25/month. Get key at hunter.io", unlocks: "Email address discovery" },
              ].map(api => (
                <div key={api.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.inkSec, display: "block", marginBottom: 4 }}>
                    {api.label}
                    {apiKeys[api.key] && <span style={{ color: C.success, marginLeft: 6 }}>&#10003;</span>}
                  </label>
                  <input
                    type="password"
                    placeholder={api.hint}
                    value={apiKeys[api.key] || ''}
                    onChange={e => setApiKeys(prev => ({ ...prev, [api.key]: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 2 }}
                  />
                  <div style={{ fontSize: 10, color: C.inkMuted }}>Unlocks: {api.unlocks}</div>
                </div>
              ))}
            </div>

            <button onClick={handleSaveKeys} style={{ ...btnStyle("accent"), marginTop: 16 }}>
              Save API Keys
            </button>
          </div>
        </div>
      )}

      {/* ═══ TAB: Run Scraper ═══ */}
      {tab === "run" && (
        <div>
          {/* Scan Type Selection */}
          <div style={cardStyle({ marginBottom: 16 })}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>Scan Type</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: "full", label: "Full Multi-Source Scan", desc: "All configured sources across all counties" },
                { id: "instagram", label: "Instagram Discovery", desc: "Find event businesses via Instagram profiles & hashtags" },
                { id: "enrich", label: "Website Enrichment", desc: "Scrape existing lead websites for contact details using Jina AI" },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setScanType(st.id)}
                  style={{
                    ...cardStyle({ padding: "12px 16px", cursor: "pointer", flex: "1 1 200px" }),
                    borderColor: scanType === st.id ? C.accent : C.border,
                    boxShadow: scanType === st.id ? `0 0 0 2px ${C.accent}20` : "none",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, textAlign: "left" }}>{st.label}</div>
                  <div style={{ fontSize: 11, color: C.inkSec, textAlign: "left", marginTop: 2 }}>{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* County Filter */}
          {scanType !== "enrich" && (
            <div style={cardStyle({ marginBottom: 16 })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif }}>
                  Counties ({selectedCounties.length === 0 ? 'All' : selectedCounties.length} selected)
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setSelectedCounties(allCounties)} style={btnStyle("ghost")}>Select All</button>
                  <button onClick={() => setSelectedCounties([])} style={btnStyle("ghost")}>Clear</button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {allCounties.map(county => {
                  const selected = selectedCounties.includes(county);
                  return (
                    <button
                      key={county}
                      onClick={() => setSelectedCounties(prev =>
                        selected ? prev.filter(c => c !== county) : [...prev, county]
                      )}
                      style={{
                        padding: "4px 10px", borderRadius: 4, border: `1px solid ${selected ? C.accent : C.borderLight}`,
                        background: selected ? C.accentSubtle : "transparent", color: selected ? C.accent : C.inkMuted,
                        fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.sans,
                      }}
                    >
                      {county}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source Filter (full scan only) */}
          {scanType === "full" && (
            <div style={cardStyle({ marginBottom: 16 })}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 8 }}>
                Sources ({selectedSources.length === 0 ? 'All available' : selectedSources.length} selected)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {adapters.filter(a => a.configured).map(adapter => {
                  const selected = selectedSources.includes(adapter.id);
                  return (
                    <button
                      key={adapter.id}
                      onClick={() => setSelectedSources(prev =>
                        selected ? prev.filter(s => s !== adapter.id) : [...prev, adapter.id]
                      )}
                      style={{
                        ...pillStyle(selected ? C.accentSubtle : C.bgWarm, selected ? C.accent : C.inkMuted),
                        cursor: "pointer", padding: "6px 14px",
                      }}
                    >
                      {adapter.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Run / Abort */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <button
              onClick={running ? handleAbort : handleRun}
              style={{
                ...btnStyle(running ? "danger" : "accent"),
                padding: "12px 32px", fontSize: 15,
              }}
            >
              {running ? 'Stop Scraping' : 'Start Scraping'}
            </button>
            {!running && scrapedLeads.length > 0 && (
              <button onClick={handleImportAll} style={btnStyle("success")}>
                Import {scrapedLeads.length} Leads to Pipeline
              </button>
            )}
          </div>

          {/* Progress */}
          {running && progress && (
            <div style={cardStyle({ marginBottom: 16, background: C.bgWarm })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{progress.message}</div>
                <span style={pillStyle(C.successBg, C.success)}>{progress.found || 0} found</span>
              </div>
              <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: C.accent, borderRadius: 2,
                  width: `${progress.progress || 0}%`, transition: "width 0.3s",
                }} />
              </div>
            </div>
          )}

          {/* Live Log */}
          {logLines.length > 0 && (
            <div style={{
              ...cardStyle({ padding: 12 }),
              maxHeight: 300, overflowY: "auto", fontFamily: F.mono, fontSize: 11,
              background: "#1a1a1a", color: "#e0e0e0", borderColor: "#333",
            }}>
              {logLines.map((line, i) => (
                <div key={i} style={{
                  padding: "2px 0",
                  color: line.msg.includes('NEW LEAD') ? '#4ade80' :
                         line.msg.includes('ERROR') ? '#f87171' :
                         line.msg.includes('COMPLETE') ? '#60a5fa' :
                         line.msg.includes('IMPORTED') ? '#a78bfa' : '#9ca3af',
                }}>
                  <span style={{ color: '#6b7280' }}>{line.time}</span> {line.msg}
                </div>
              ))}
            </div>
          )}

          {/* Scan Results Summary */}
          {scanResults && (
            <div style={{ ...cardStyle({ marginTop: 16 }) }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>Scan Results</div>
              <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase" }}>New Leads</div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: F.serif, color: C.success }}>
                    {scanResults.found || scanResults.enriched || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase" }}>Searches</div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: F.serif }}>{scanResults.searched || 0}</div>
                </div>
                {scanResults.errors?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase" }}>Errors</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: F.serif, color: C.danger }}>{scanResults.errors.length}</div>
                  </div>
                )}
              </div>
              {scanResults.bySource && Object.keys(scanResults.bySource).length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, marginBottom: 6 }}>By Source</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Object.entries(scanResults.bySource).map(([source, count]) => (
                      <span key={source} style={pillStyle(C.infoBg, C.info)}>
                        {source}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Results ═══ */}
      {tab === "results" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif }}>
              Scraped Leads ({scrapedLeads.length})
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {scrapedLeads.length > 0 && (
                <>
                  <button onClick={handleImportAll} style={btnStyle("success")}>
                    Import All to Pipeline
                  </button>
                  <button onClick={() => {
                    localStorage.removeItem('hht_scraped_leads');
                    setScrapedLeads([]);
                    addLog("CLEARED scraped leads");
                  }} style={btnStyle("outline")}>
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {scrapedLeads.length === 0 ? (
            <div style={{ ...cardStyle(), textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>&#128269;</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.inkSec }}>No scraped leads yet</div>
              <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 4 }}>
                Go to the Run tab and start a scan to discover new leads
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {scrapedLeads.slice(0, 50).map((lead, i) => (
                <div key={i} style={cardStyle({ padding: "12px 16px" })}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, fontFamily: F.serif }}>
                        {lead.venue_name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>
                        {[lead.city, lead.county].filter(Boolean).join(', ')}
                        {lead.category && ` \u2014 ${lead.category}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                      {lead.website && (
                        <span style={{ fontSize: 11, color: C.info, fontFamily: F.mono }}>
                          {lead.website.slice(0, 30)}
                        </span>
                      )}
                      {lead.phone && (
                        <span style={{ fontSize: 11, color: C.success }}>{lead.phone}</span>
                      )}
                      <span style={pillStyle(C.accentSubtle, C.accent)}>{lead.source || 'manual'}</span>
                    </div>
                  </div>
                  {lead.trigger_event && (
                    <div style={{ fontSize: 11, color: C.inkSec, marginTop: 4, lineHeight: 1.4 }}>
                      {lead.trigger_event.slice(0, 200)}
                    </div>
                  )}
                </div>
              ))}
              {scrapedLeads.length > 50 && (
                <div style={{ textAlign: "center", padding: 12, color: C.inkMuted, fontSize: 12 }}>
                  Showing 50 of {scrapedLeads.length} leads
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Schedule ═══ */}
      {tab === "schedule" && (
        <div>
          <div style={cardStyle({ marginBottom: 16 })}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>
              Periodic Scraping
            </div>
            <p style={{ fontSize: 12, color: C.inkSec, marginBottom: 16, lineHeight: 1.5 }}>
              Set the scraper to run automatically at regular intervals. It will cycle through all
              configured sources and counties, deduplicating against existing leads. Keep this browser
              tab open for the scheduler to work.
            </p>

            <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.inkSec, display: "block", marginBottom: 4 }}>
                  Interval (hours)
                </label>
                <select
                  value={schedule.intervalHours || 4}
                  onChange={e => setSchedule(prev => ({ ...prev, intervalHours: parseInt(e.target.value) }))}
                  style={{ ...inputStyle, width: 120 }}
                >
                  <option value={1}>Every 1h</option>
                  <option value={2}>Every 2h</option>
                  <option value={4}>Every 4h</option>
                  <option value={8}>Every 8h</option>
                  <option value={12}>Every 12h</option>
                  <option value={24}>Every 24h</option>
                </select>
              </div>
              <button
                onClick={handleScheduleToggle}
                style={btnStyle(schedule.enabled ? "danger" : "success")}
              >
                {schedule.enabled ? 'Stop Scheduler' : 'Start Scheduler'}
              </button>
            </div>

            {schedule.enabled && schedule.nextRun && (
              <div style={pillStyle(C.successBg, C.success)}>
                Next scan: {new Date(schedule.nextRun).toLocaleString('en-GB')}
              </div>
            )}
          </div>

          {/* Scraping techniques explanation */}
          <div style={cardStyle()}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>
              How It Works — Techniques Used
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "Jina AI Reader", tech: "Headless Browser Rendering", desc: "Like Firecrawl — renders pages in a real browser, strips navigation/ads, converts to clean markdown. AI then extracts structured data. Free, no API key needed." },
                { name: "Companies House API", tech: "Official UK Government REST API", desc: "Searches the UK company register by SIC code (82301=exhibition organisers, 82302=conference organisers, 56210=event catering, 96090=wedding planners). Returns company name, address, directors." },
                { name: "Google Places API", tech: "Text Search + Nearby Search", desc: "Queries Google Maps database for businesses by type and location. Returns name, address, phone, website, rating. Like how omkarcloud/google-maps-scraper works but via official API." },
                { name: "Serper.dev", tech: "Google SERP Structured Extraction", desc: "Extracts Google Search results as structured JSON. Returns organic results + local business listings with full contact details. Includes Knowledge Graph data." },
                { name: "Instagram Discovery", tech: "Google site: Search + Profile Scraping", desc: "Uses Google to find Instagram business profiles, then Jina Reader to extract bio, website, email, and follower count from public profiles." },
                { name: "Hunter.io", tech: "Domain Email Pattern Detection", desc: "Crawls public sources to find email addresses associated with a domain. Detects patterns (e.g. first.last@company.co.uk) and returns emails with confidence scores." },
              ].map(item => (
                <div key={item.name} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 140, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: 10, fontFamily: F.mono, color: C.info }}>{item.tech}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.inkSec, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
