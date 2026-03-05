import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Library — Google Drive–Backed Asset Library
// Recipes, imagery, past projects — all accessible in-app
// Replaces Dropbox with unified Google Drive storage
// ═══════════════════════════════════════════════════════════════

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
  if (variant === "outline") return { ...base, background: "transparent", color: C.ink, border: `1px solid ${C.border}` };
  if (variant === "accent") return { ...base, background: C.accent, color: "#fff" };
  if (variant === "ghost") return { ...base, background: "transparent", color: C.inkSec, padding: "6px 10px" };
  if (variant === "danger") return { ...base, background: C.danger, color: "#fff" };
  return base;
};
const inputStyle = { padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%" };
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });

const LS_KEY = "hht_library_v1";
const GDRIVE_CONFIG_KEY = "hht_gdrive_config";

// ── Collection Categories ──
const COLLECTIONS = [
  { id: "recipes", label: "Recipes", icon: "🍸", description: "Cocktail recipes, menu builds, and drink specifications" },
  { id: "imagery", label: "Imagery", icon: "📸", description: "Event photography, brand assets, and promotional material" },
  { id: "past-projects", label: "Past Projects", icon: "📁", description: "Complete project archives — briefs, decks, and deliverables" },
  { id: "brand-assets", label: "Brand Assets", icon: "🎨", description: "Logos, fonts, colour palettes, and brand guidelines" },
  { id: "training", label: "Training Materials", icon: "🎓", description: "Staff training guides, SOPs, and onboarding resources" },
  { id: "menus", label: "Menus & Print", icon: "📋", description: "Final menus, print-ready artwork, and signage designs" },
];

const FILE_TYPE_ICONS = {
  pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊", ppt: "📊", pptx: "📊",
  jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", svg: "🖼️", webp: "🖼️",
  mp4: "🎬", mov: "🎬", avi: "🎬",
  folder: "📂", default: "📎",
};

const FILE_TYPE_COLORS = {
  pdf: { bg: "#FDF2F2", fg: "#9B3535" },
  doc: { bg: "#F0F7FA", fg: "#2A6680" },
  docx: { bg: "#F0F7FA", fg: "#2A6680" },
  xls: { bg: "#F0F9F3", fg: "#2B7A4B" },
  xlsx: { bg: "#F0F9F3", fg: "#2B7A4B" },
  jpg: { bg: "#FFF9F0", fg: "#956018" },
  jpeg: { bg: "#FFF9F0", fg: "#956018" },
  png: { bg: "#FFF9F0", fg: "#956018" },
  gif: { bg: "#FFF9F0", fg: "#956018" },
  mp4: { bg: "#F3F0F9", fg: "#5B4A9E" },
  mov: { bg: "#F3F0F9", fg: "#5B4A9E" },
  folder: { bg: C.accentSubtle, fg: C.accent },
  default: { bg: "#F5F5F5", fg: "#666" },
};

function generateId() {
  return "lib-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function getFileExt(name) {
  const parts = (name || "").split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "default";
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Demo data for when Google Drive isn't connected ──
const DEMO_FILES = [
  { id: "demo-1", name: "Classic Cocktail Recipes 2025.pdf", collection: "recipes", type: "pdf", size: 2400000, modifiedTime: "2025-02-20T14:30:00Z", createdBy: "Joe Stokoe", starred: true, tags: ["cocktails", "classics", "menu-build"] },
  { id: "demo-2", name: "Espresso Martini Variations.docx", collection: "recipes", type: "docx", size: 185000, modifiedTime: "2025-03-01T09:15:00Z", createdBy: "Alex Morgan", starred: false, tags: ["espresso-martini", "signature"] },
  { id: "demo-3", name: "Summer Spritz Collection.pdf", collection: "recipes", type: "pdf", size: 1200000, modifiedTime: "2025-02-28T16:45:00Z", createdBy: "Joe Stokoe", starred: true, tags: ["summer", "spritz", "seasonal"] },
  { id: "demo-4", name: "Diageo Masterclass — Event Photos", collection: "imagery", type: "folder", size: null, modifiedTime: "2025-03-10T11:00:00Z", createdBy: "Sam Taylor", starred: false, tags: ["diageo", "event-photos"] },
  { id: "demo-5", name: "Pernod Ricard Summer Party — Hero Shots.zip", collection: "imagery", type: "zip", size: 45000000, modifiedTime: "2025-02-15T10:20:00Z", createdBy: "Jordan Lee", starred: true, tags: ["pernod-ricard", "summer", "hero-shots"] },
  { id: "demo-6", name: "Brand Photography Guidelines.pdf", collection: "imagery", type: "pdf", size: 3200000, modifiedTime: "2025-01-10T08:00:00Z", createdBy: "Joe Stokoe", starred: false, tags: ["brand", "photography", "guidelines"] },
  { id: "demo-7", name: "HH&T Mobile Bar Setup — BTS Reel.mp4", collection: "imagery", type: "mp4", size: 120000000, modifiedTime: "2025-02-05T14:10:00Z", createdBy: "Chris Walker", starred: false, tags: ["video", "behind-the-scenes"] },
  { id: "demo-8", name: "Moët VIP Dinner — Full Project Pack", collection: "past-projects", type: "folder", size: null, modifiedTime: "2025-03-08T13:30:00Z", createdBy: "Joe Stokoe", starred: true, tags: ["moet", "vip", "dinner", "project-pack"] },
  { id: "demo-9", name: "BrewDog Tap Takeover Series — Archive", collection: "past-projects", type: "folder", size: null, modifiedTime: "2025-02-22T17:45:00Z", createdBy: "Alex Morgan", starred: false, tags: ["brewdog", "tap-takeover", "series"] },
  { id: "demo-10", name: "Campari Aperitivo Week — Proposal & Debrief.pdf", collection: "past-projects", type: "pdf", size: 5600000, modifiedTime: "2025-01-28T12:00:00Z", createdBy: "Pat Quinn", starred: false, tags: ["campari", "aperitivo", "proposal"] },
  { id: "demo-11", name: "Hendrick's Gin Garden — Event Report.xlsx", collection: "past-projects", type: "xlsx", size: 890000, modifiedTime: "2025-02-18T15:30:00Z", createdBy: "Robin James", starred: false, tags: ["hendricks", "gin-garden", "report"] },
  { id: "demo-12", name: "HH&T Logo Pack — All Formats", collection: "brand-assets", type: "folder", size: null, modifiedTime: "2025-01-05T09:00:00Z", createdBy: "Joe Stokoe", starred: true, tags: ["logo", "brand"] },
  { id: "demo-13", name: "Brand Guidelines v3.1.pdf", collection: "brand-assets", type: "pdf", size: 8900000, modifiedTime: "2025-01-15T10:00:00Z", createdBy: "Joe Stokoe", starred: true, tags: ["brand", "guidelines"] },
  { id: "demo-14", name: "Cocktail Masterclass — Staff Training.pdf", collection: "training", type: "pdf", size: 4500000, modifiedTime: "2025-02-01T08:30:00Z", createdBy: "Joe Stokoe", starred: false, tags: ["training", "cocktails", "staff"] },
  { id: "demo-15", name: "Health & Safety SOP — Mobile Bars.docx", collection: "training", type: "docx", size: 320000, modifiedTime: "2025-01-20T11:15:00Z", createdBy: "Casey Smith", starred: false, tags: ["health-safety", "sop"] },
  { id: "demo-16", name: "Spring Menu 2025 — Print Ready.pdf", collection: "menus", type: "pdf", size: 6700000, modifiedTime: "2025-03-05T14:00:00Z", createdBy: "Joe Stokoe", starred: true, tags: ["menu", "spring", "print-ready"] },
  { id: "demo-17", name: "Private Wedding Cocktail Menu — Template.docx", collection: "menus", type: "docx", size: 450000, modifiedTime: "2025-02-10T16:30:00Z", createdBy: "Jamie Brown", starred: false, tags: ["wedding", "menu", "template"] },
];

// ══════════════════════════════════════════════════════════════
// LIBRARY COMPONENT
// ══════════════════════════════════════════════════════════════

export default function Library() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [sortBy, setSortBy] = useState("modified"); // modified | name | size
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveConfig, setDriveConfig] = useState({ rootFolderId: "", apiKey: "", clientId: "" });
  const [uploadForm, setUploadForm] = useState({ name: "", collection: "recipes", tags: "" });
  const [showBot, setShowBot] = useState(false);
  const [botQuery, setBotQuery] = useState("");
  const [botConversation, setBotConversation] = useState([
    { role: "bot", text: "Hi! I'm your Library Assistant. Ask me to find any file — invoices, recipes, project packs, brand assets, anything. Try something like:\n\n• \"Find the Diageo event photos\"\n• \"Show me cocktail recipes\"\n• \"Where's the Campari proposal?\"\n• \"Brand guidelines\"" },
  ]);
  const botMessagesRef = useRef(null);

  // Load persisted data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setFiles(JSON.parse(saved));
      } else {
        setFiles(DEMO_FILES);
        localStorage.setItem(LS_KEY, JSON.stringify(DEMO_FILES));
      }
      const gConfig = localStorage.getItem(GDRIVE_CONFIG_KEY);
      if (gConfig) {
        const parsed = JSON.parse(gConfig);
        setDriveConfig(parsed);
        setDriveConnected(!!(parsed.apiKey && parsed.clientId));
      }
    } catch { setFiles(DEMO_FILES); }
  }, []);

  const persist = useCallback((updated) => {
    setFiles(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }, []);

  const toggleStar = useCallback((id) => {
    persist(files.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  }, [files, persist]);

  const deleteFile = useCallback((id) => {
    persist(files.filter(f => f.id !== id));
    if (selectedFile?.id === id) setSelectedFile(null);
  }, [files, persist, selectedFile]);

  const addFile = useCallback(() => {
    if (!uploadForm.name.trim()) return;
    const ext = getFileExt(uploadForm.name);
    const newFile = {
      id: generateId(),
      name: uploadForm.name.trim(),
      collection: uploadForm.collection,
      type: ext,
      size: Math.floor(Math.random() * 5000000) + 100000,
      modifiedTime: new Date().toISOString(),
      createdBy: "Joe Stokoe",
      starred: false,
      tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    persist([newFile, ...files]);
    setUploadForm({ name: "", collection: "recipes", tags: "" });
    setShowUpload(false);
  }, [uploadForm, files, persist]);

  const saveDriveConfig = useCallback(() => {
    localStorage.setItem(GDRIVE_CONFIG_KEY, JSON.stringify(driveConfig));
    setDriveConnected(!!(driveConfig.apiKey && driveConfig.clientId));
    setShowSettings(false);
  }, [driveConfig]);

  // ── Bot search logic ──
  const botSearch = useCallback((query) => {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 2);
    setBotConversation(prev => [...prev, { role: "user", text: query }]);
    setBotQuery("");

    // Single pass: build haystack once per file, check exact + fuzzy together
    const exact = [];
    const fuzzy = [];
    for (const f of files) {
      const haystack = [f.name, (f.tags || []).join(" "), f.createdBy || "", COLLECTIONS.find(c => c.id === f.collection)?.label || ""].join(" ").toLowerCase();
      if (haystack.includes(q) || q.split(/\s+/).every(w => haystack.includes(w))) {
        exact.push(f);
      } else if (words.some(w => haystack.includes(w))) {
        fuzzy.push(f);
      }
    }

    setTimeout(() => {
      if (exact.length > 0) {
        setBotConversation(prev => [...prev, {
          role: "bot",
          text: `Found ${exact.length} file${exact.length > 1 ? "s" : ""} matching "${query}":`,
          results: exact.slice(0, 8),
        }]);
      } else if (fuzzy.length > 0) {
        setBotConversation(prev => [...prev, {
          role: "bot",
          text: `I didn't find an exact match, but here are ${fuzzy.length} related file${fuzzy.length > 1 ? "s" : ""}:`,
          results: fuzzy.slice(0, 5),
        }]);
      } else {
        setBotConversation(prev => [...prev, {
          role: "bot",
          text: `I couldn't find any files matching "${query}". Try different keywords, or check the collection categories on the left. You can also try:\n\n• Search by file type (e.g. "PDF", "photos")\n• Search by person (e.g. "Joe Stokoe")\n• Search by project (e.g. "Diageo", "Pernod Ricard")`,
        }]);
      }
      setTimeout(() => botMessagesRef.current?.scrollTo({ top: botMessagesRef.current.scrollHeight, behavior: "smooth" }), 50);
    }, 400 + Math.random() * 300);
  }, [files]);

  // ── Filtering & sorting ──
  const filtered = useMemo(() => {
    let result = files;
    if (activeCollection !== "all") result = result.filter(f => f.collection === activeCollection);
    if (showStarredOnly) result = result.filter(f => f.starred);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (f.createdBy || "").toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sortBy === "modified") return new Date(b.modifiedTime) - new Date(a.modifiedTime);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return (b.size || 0) - (a.size || 0);
      return 0;
    });
    return result;
  }, [files, activeCollection, showStarredOnly, search, sortBy]);

  // ── Stats ──
  const stats = useMemo(() => {
    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const byCollection = {};
    COLLECTIONS.forEach(c => { byCollection[c.id] = files.filter(f => f.collection === c.id).length; });
    return { total: files.length, totalSize, starred: files.filter(f => f.starred).length, byCollection };
  }, [files]);

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontFamily: F.serif, fontWeight: 700, margin: 0, letterSpacing: 0.3 }}>Library</h1>
          <p style={{ fontSize: 13, color: C.inkMuted, margin: "4px 0 0", fontFamily: F.sans }}>
            Recipes, imagery & project archives — powered by Google Drive
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowBot(!showBot)} style={btnStyle(showBot ? "primary" : "outline")}>
            🤖 Ask Library Bot
          </button>
          <button onClick={() => setShowSettings(true)} style={btnStyle("outline")}>
            ⚙ Drive Settings
          </button>
          <button onClick={() => setShowUpload(true)} style={btnStyle("accent")}>
            + Add to Library
          </button>
        </div>
      </div>

      {/* Google Drive connection status */}
      <div style={{ ...cardStyle({ marginBottom: 20, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>
            <svg width="20" height="20" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
              <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.3 44.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85l6.15 11.65 7.55 12.15z" fill="#EA4335"/>
              <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D"/>
              <path d="M59.85 49.2H27.5l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.4c1.6 0 3.15-.45 4.5-1.2L59.85 49.2z" fill="#2684FC"/>
              <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.2 24.2h27.5c0-1.55-.4-3.1-1.2-4.5l-12.75-18.2z" fill="#FFBA00"/>
            </svg>
          </span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: F.sans }}>Google Drive</span>
            <span style={{ ...pillStyle(driveConnected ? C.successBg : C.warnBg, driveConnected ? C.success : C.warn), marginLeft: 8 }}>
              {driveConnected ? "● Connected" : "○ Not connected"}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.inkMuted }}>
          {driveConnected
            ? `${stats.total} files synced · ${formatBytes(stats.totalSize)} total`
            : "Connect Google Drive to sync files across all team members"
          }
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Files", value: stats.total, sub: formatBytes(stats.totalSize) },
          { label: "Starred", value: stats.starred, sub: "Quick access" },
          { label: "Collections", value: COLLECTIONS.length, sub: "Categories" },
          { label: "Team Access", value: driveConnected ? "Live" : "Local", sub: driveConnected ? "All locations" : "This device" },
        ].map((s, i) => (
          <div key={i} style={cardStyle({ padding: 14, textAlign: "center" })}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: C.ink }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSec, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Collection sidebar + file area */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        {/* Collection nav */}
        <div style={cardStyle({ padding: 12 })}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, padding: "4px 8px", marginBottom: 4 }}>Collections</div>
          <button
            onClick={() => setActiveCollection("all")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontFamily: F.sans, fontWeight: activeCollection === "all" ? 600 : 400, background: activeCollection === "all" ? C.accentSubtle : "transparent", color: activeCollection === "all" ? C.accent : C.inkSec, transition: "all 0.15s", marginBottom: 2 }}
          >
            <span>📚 All Files</span>
            <span style={{ fontSize: 11, color: C.inkMuted }}>{stats.total}</span>
          </button>
          {COLLECTIONS.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontFamily: F.sans, fontWeight: activeCollection === col.id ? 600 : 400, background: activeCollection === col.id ? C.accentSubtle : "transparent", color: activeCollection === col.id ? C.accent : C.inkSec, transition: "all 0.15s", marginBottom: 2 }}
            >
              <span>{col.icon} {col.label}</span>
              <span style={{ fontSize: 11, color: C.inkMuted }}>{stats.byCollection[col.id] || 0}</span>
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${C.borderLight}`, marginTop: 8, paddingTop: 8 }}>
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontFamily: F.sans, fontWeight: showStarredOnly ? 600 : 400, background: showStarredOnly ? "#FFF9F0" : "transparent", color: showStarredOnly ? C.warn : C.inkSec, transition: "all 0.15s" }}
            >
              {showStarredOnly ? "★" : "☆"} Starred
            </button>
          </div>

          {/* Collection info */}
          {activeCollection !== "all" && (
            <div style={{ marginTop: 12, padding: "10px", background: C.bgWarm, borderRadius: 8, fontSize: 11, color: C.inkSec, lineHeight: 1.5 }}>
              {COLLECTIONS.find(c => c.id === activeCollection)?.description}
            </div>
          )}
        </div>

        {/* File area */}
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                placeholder="Search files, tags, or team members..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 32 }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.inkMuted }}>⌕</span>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 130, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A948C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 30, cursor: "pointer" }}>
              <option value="modified">Last Modified</option>
              <option value="name">Name A–Z</option>
              <option value="size">Size</option>
            </select>
            <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
              <button onClick={() => setViewMode("grid")} style={{ padding: "6px 10px", border: "none", cursor: "pointer", background: viewMode === "grid" ? C.ink : C.card, color: viewMode === "grid" ? "#fff" : C.inkSec, fontSize: 13, fontFamily: F.sans }}>▦</button>
              <button onClick={() => setViewMode("list")} style={{ padding: "6px 10px", border: "none", cursor: "pointer", background: viewMode === "list" ? C.ink : C.card, color: viewMode === "list" ? "#fff" : C.inkSec, fontSize: 13, fontFamily: F.sans }}>☰</button>
            </div>
          </div>

          {/* Results count */}
          <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 12 }}>
            {filtered.length} file{filtered.length !== 1 ? "s" : ""}
            {activeCollection !== "all" && ` in ${COLLECTIONS.find(c => c.id === activeCollection)?.label}`}
            {showStarredOnly && " · Starred only"}
            {search && ` · matching "${search}"`}
          </div>

          {/* Grid view */}
          {viewMode === "grid" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {filtered.map(file => {
                const ext = file.type || getFileExt(file.name);
                const colors = FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS.default;
                const icon = FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    style={{ ...cardStyle({ padding: 16, cursor: "pointer", transition: "all 0.15s", position: "relative" }), ...(selectedFile?.id === file.id ? { borderColor: C.accent, boxShadow: `0 0 0 1px ${C.accent}` } : {}) }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; }}
                    onMouseLeave={e => { if (selectedFile?.id !== file.id) e.currentTarget.style.borderColor = C.border; }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}
                      style={{ position: "absolute", top: 8, right: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: file.starred ? "#D4A017" : C.inkMuted }}
                    >
                      {file.starred ? "★" : "☆"}
                    </button>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 10 }}>
                      {icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: F.sans, color: C.ink, marginBottom: 4, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {file.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <span style={{ ...pillStyle(colors.bg, colors.fg), fontSize: 10 }}>{ext.toUpperCase()}</span>
                      {file.size && <span style={{ fontSize: 10, color: C.inkMuted }}>{formatBytes(file.size)}</span>}
                    </div>
                    <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 6 }}>{timeAgo(file.modifiedTime)} · {file.createdBy}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List view */}
          {viewMode === "list" && (
            <div style={cardStyle({ padding: 0, overflow: "hidden" })}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: F.sans }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Name</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Collection</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Type</th>
                    <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Size</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Modified</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>★</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(file => {
                    const ext = file.type || getFileExt(file.name);
                    const colors = FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS.default;
                    const icon = FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default;
                    const col = COLLECTIONS.find(c => c.id === file.collection);
                    return (
                      <tr
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", background: selectedFile?.id === file.id ? C.accentSubtle : "transparent", transition: "background 0.1s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.accentSubtle; }}
                        onMouseLeave={e => { if (selectedFile?.id !== file.id) e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{icon}</span>
                          <span style={{ fontWeight: 500 }}>{file.name}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: C.inkSec }}>{col?.icon} {col?.label || "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ ...pillStyle(colors.bg, colors.fg), fontSize: 10 }}>{ext.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", color: C.inkMuted }}>{formatBytes(file.size)}</td>
                        <td style={{ padding: "10px 14px", color: C.inkMuted }}>{timeAgo(file.modifiedTime)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}
                            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: file.starred ? "#D4A017" : C.inkMuted }}
                          >
                            {file.starred ? "★" : "☆"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: C.inkMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>No files found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search or filters</div>
                </div>
              )}
            </div>
          )}

          {/* Empty grid state */}
          {viewMode === "grid" && filtered.length === 0 && (
            <div style={{ ...cardStyle({ padding: 60, textAlign: "center" }) }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: F.serif }}>No files found</div>
              <div style={{ fontSize: 13, color: C.inkMuted, marginTop: 4 }}>Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      </div>

      {/* ── File Detail Panel (slide-over) ── */}
      {selectedFile && (
        <div style={{ position: "fixed", top: 0, right: 0, width: 400, height: "100vh", background: C.card, borderLeft: `1px solid ${C.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)", zIndex: 1000, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, fontFamily: F.sans }}>File Details</span>
            <button onClick={() => setSelectedFile(null)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: C.inkMuted }}>✕</button>
          </div>
          <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
            {(() => {
              const ext = selectedFile.type || getFileExt(selectedFile.name);
              const colors = FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS.default;
              const icon = FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default;
              const col = COLLECTIONS.find(c => c.id === selectedFile.collection);
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: F.sans, lineHeight: 1.3 }}>{selectedFile.name}</div>
                      <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>{col?.icon} {col?.label}</div>
                    </div>
                  </div>

                  {/* Preview placeholder */}
                  <div style={{ background: C.bgWarm, borderRadius: 10, padding: 40, textAlign: "center", marginBottom: 20, border: `1px dashed ${C.border}` }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 12, color: C.inkMuted }}>
                      {driveConnected ? "Click to preview in Google Drive" : "Connect Google Drive for file preview"}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Details</div>
                    {[
                      ["Type", ext.toUpperCase()],
                      ["Size", formatBytes(selectedFile.size)],
                      ["Modified", timeAgo(selectedFile.modifiedTime)],
                      ["Created by", selectedFile.createdBy],
                      ["Collection", col?.label || "—"],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderLight}`, fontSize: 13 }}>
                        <span style={{ color: C.inkMuted }}>{label}</span>
                        <span style={{ fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  {selectedFile.tags?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Tags</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {selectedFile.tags.map(tag => (
                          <span key={tag} style={pillStyle(C.bgWarm, C.inkSec)}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      onClick={() => {
                        if (driveConnected) {
                          alert("Opening in Google Drive...\n\nIn production, this opens the file directly in Google Drive for viewing/editing.");
                        } else {
                          alert("Connect Google Drive in settings to open files.");
                        }
                      }}
                      style={btnStyle("primary")}
                    >
                      {driveConnected ? "Open in Google Drive →" : "Connect Drive to Open"}
                    </button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleStar(selectedFile.id)} style={{ ...btnStyle("outline"), flex: 1 }}>
                        {selectedFile.starred ? "★ Unstar" : "☆ Star"}
                      </button>
                      <button onClick={() => { if (confirm("Remove this file from the library?")) deleteFile(selectedFile.id); }} style={{ ...btnStyle("ghost"), color: C.danger }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Upload / Add File Modal ── */}
      {showUpload && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowUpload(false)}>
          <div style={{ background: C.card, borderRadius: 14, padding: 28, width: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontFamily: F.serif, fontWeight: 700, margin: 0 }}>Add to Library</h2>
              <button onClick={() => setShowUpload(false)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: C.inkMuted }}>✕</button>
            </div>

            {driveConnected && (
              <div style={{ ...cardStyle({ padding: 14, marginBottom: 16, background: C.successBg, borderColor: "#C6E7D1" }) }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.success, marginBottom: 2 }}>Google Drive Connected</div>
                <div style={{ fontSize: 12, color: C.inkSec }}>Files will be stored in your shared Google Drive folder and accessible to all team members.</div>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4, fontFamily: F.sans }}>File Name</label>
              <input
                type="text"
                placeholder="e.g. Summer Cocktail Menu 2025.pdf"
                value={uploadForm.name}
                onChange={e => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4, fontFamily: F.sans }}>Collection</label>
              <select
                value={uploadForm.collection}
                onChange={e => setUploadForm(prev => ({ ...prev, collection: e.target.value }))}
                style={{ ...inputStyle, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A948C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 30, cursor: "pointer" }}
              >
                {COLLECTIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4, fontFamily: F.sans }}>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. summer, cocktails, seasonal"
                value={uploadForm.tags}
                onChange={e => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* Drop zone */}
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: 30, textAlign: "center", marginBottom: 20, background: C.bgWarm, cursor: "pointer" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSec }}>
                {driveConnected ? "Drop files here to upload to Google Drive" : "Drop files here to add to local library"}
              </div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>PDF, DOC, IMG, XLS, MP4 and more</div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowUpload(false)} style={btnStyle("outline")}>Cancel</button>
              <button onClick={addFile} style={btnStyle("accent")}>Add to Library</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Google Drive Settings Modal ── */}
      {showSettings && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowSettings(false)}>
          <div style={{ background: C.card, borderRadius: 14, padding: 28, width: 520, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontFamily: F.serif, fontWeight: 700, margin: 0 }}>Google Drive Settings</h2>
              <button onClick={() => setShowSettings(false)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: C.inkMuted }}>✕</button>
            </div>

            <div style={{ ...cardStyle({ padding: 16, marginBottom: 20, background: C.infoBg, borderColor: "#B8D8E8" }) }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.info, marginBottom: 4 }}>How it works</div>
              <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.6 }}>
                The Library connects to a shared Google Drive folder that all HH&T team members can access. Once connected, files are synced automatically — any team member can view, upload, and organise assets from any location.
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.ink }}>Setup Steps</div>
            <div style={{ marginBottom: 20 }}>
              {[
                { step: "1", title: "Create a shared Google Drive folder", desc: "Create a folder called 'HHT Library' in Google Drive and share it with your entire team." },
                { step: "2", title: "Enable the Google Drive API", desc: "Go to Google Cloud Console → APIs & Services → Enable the Google Drive API and Google Picker API." },
                { step: "3", title: "Create API credentials", desc: "Create an API key and OAuth 2.0 Client ID for your project. Set the authorised domains." },
                { step: "4", title: "Enter credentials below", desc: "Paste your API Key, Client ID, and the shared folder ID from the Drive URL." },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4 }}>Google API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={driveConfig.apiKey}
                onChange={e => setDriveConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4 }}>OAuth Client ID</label>
              <input
                type="text"
                placeholder="123456789.apps.googleusercontent.com"
                value={driveConfig.clientId}
                onChange={e => setDriveConfig(prev => ({ ...prev, clientId: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4 }}>Shared Folder ID</label>
              <input
                type="text"
                placeholder="1AbCdEfGhIjKlMnOpQrStUvWxYz"
                value={driveConfig.rootFolderId}
                onChange={e => setDriveConfig(prev => ({ ...prev, rootFolderId: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>Found in your Google Drive folder URL after /folders/</div>
            </div>

            {driveConnected && (
              <div style={{ ...cardStyle({ padding: 12, marginBottom: 16, background: C.successBg, borderColor: "#C6E7D1", display: "flex", alignItems: "center", gap: 8 }) }}>
                <span style={{ fontSize: 16 }}>✓</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.success }}>Google Drive connected</div>
                  <div style={{ fontSize: 11, color: C.inkSec }}>All team members with folder access can view and manage library files.</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowSettings(false)} style={btnStyle("outline")}>Cancel</button>
              {driveConnected && (
                <button
                  onClick={() => {
                    setDriveConfig({ rootFolderId: "", apiKey: "", clientId: "" });
                    localStorage.removeItem(GDRIVE_CONFIG_KEY);
                    setDriveConnected(false);
                  }}
                  style={{ ...btnStyle("ghost"), color: C.danger }}
                >
                  Disconnect
                </button>
              )}
              <button onClick={saveDriveConfig} style={btnStyle("accent")}>
                {driveConnected ? "Update Settings" : "Connect Google Drive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration notice */}
      <div style={{ ...cardStyle({ marginTop: 20, padding: 16, background: C.warnBg, borderColor: "#E8D4A8" }) }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.warn, marginBottom: 4 }}>Migrating from Dropbox?</div>
            <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.6 }}>
              Download all files from your Dropbox, then upload them to the shared Google Drive folder. Once everything is in Drive, all team members can access the full library through this app — from any location, on any device. No more Dropbox needed.
            </div>
          </div>
        </div>
      </div>

      {/* ── Library Search Bot Panel ── */}
      {showBot && (
        <div style={{ position: "fixed", bottom: 80, right: 80, width: 420, height: 520, background: C.card, borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 1500 }}>
          {/* Bot header */}
          <div style={{ padding: "12px 16px", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Library Assistant</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>Search files by asking in plain English</div>
              </div>
            </div>
            <button onClick={() => setShowBot(false)} style={{ border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", width: 26, height: 26, borderRadius: 6, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Conversation */}
          <div ref={botMessagesRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {botConversation.map((msg, i) => (
              <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 8 }}>
                {msg.role === "bot" && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
                )}
                <div style={{ maxWidth: "85%" }}>
                  <div style={{
                    fontSize: 13, lineHeight: 1.6, color: C.ink, whiteSpace: "pre-wrap",
                    background: msg.role === "user" ? C.accentSubtle : C.bgWarm,
                    padding: "8px 12px", borderRadius: 10,
                    borderTopLeftRadius: msg.role === "bot" ? 2 : 10,
                    borderTopRightRadius: msg.role === "user" ? 2 : 10,
                  }}>
                    {msg.text}
                  </div>
                  {/* File results */}
                  {msg.results && msg.results.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {msg.results.map(file => {
                        const ext = file.type || getFileExt(file.name);
                        const icon = FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default;
                        const colors = FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS.default;
                        const col = COLLECTIONS.find(c => c.id === file.collection);
                        return (
                          <div
                            key={file.id}
                            onClick={() => { setSelectedFile(file); setShowBot(false); }}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", transition: "all 0.1s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentSubtle; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                          >
                            <div style={{ width: 30, height: 30, borderRadius: 6, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                              <div style={{ fontSize: 10, color: C.inkMuted }}>{col?.icon} {col?.label} · {file.createdBy} · {formatBytes(file.size)}</div>
                            </div>
                            <span style={{ fontSize: 11, color: C.accent }}>→</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bot input */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.borderLight}`, display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Ask me to find a file..."
              value={botQuery}
              onChange={e => setBotQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") botSearch(botQuery); }}
              style={{ ...inputStyle, fontSize: 12 }}
              autoFocus
            />
            <button
              onClick={() => botSearch(botQuery)}
              disabled={!botQuery.trim()}
              style={{ ...btnStyle("accent"), opacity: botQuery.trim() ? 1 : 0.5, flexShrink: 0, padding: "8px 14px" }}
            >
              Search
            </button>
          </div>

          {/* Quick suggestions */}
          <div style={{ padding: "6px 14px 10px", display: "flex", gap: 4, flexWrap: "wrap", flexShrink: 0 }}>
            {["Diageo", "recipes", "brand guidelines", "Pernod Ricard", "menus", "training"].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => { setBotQuery(suggestion); botSearch(suggestion); }}
                style={{ ...pillStyle(C.bgWarm, C.inkSec), cursor: "pointer", border: `1px solid ${C.borderLight}`, fontSize: 10 }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
