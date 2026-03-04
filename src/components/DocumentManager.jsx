import { useState, useMemo, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Document Management Module
// Premium cocktail events company — Heads, Hearts & Tails
// Manage contracts, proposals, templates, media & more
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

const LS_KEY = "hht_documents_v1";

const CATEGORIES = [
  "Contracts", "Proposals", "Insurance", "Health & Safety",
  "Menus & Recipes", "Brand Guidelines", "Templates",
  "Photos & Media", "Training", "Licences",
];

const CATEGORY_ICONS = {
  "Contracts": "\u{1F4DD}", "Proposals": "\u{1F4CB}", "Insurance": "\u{1F6E1}\uFE0F",
  "Health & Safety": "\u26D1\uFE0F", "Menus & Recipes": "\u{1F378}", "Brand Guidelines": "\u{1F3A8}",
  "Templates": "\u{1F4C4}", "Photos & Media": "\u{1F4F7}", "Training": "\u{1F393}", "Licences": "\u{1F4DC}",
};

const FILE_TYPES = ["PDF", "DOC", "IMG", "XLS"];

const TYPE_COLORS = {
  PDF: { bg: "#FDF2F2", fg: "#9B3535", border: "#F0C4C4" },
  DOC: { bg: "#F0F7FA", fg: "#2A6680", border: "#B8D8E8" },
  IMG: { bg: "#F0F9F3", fg: "#2B7A4B", border: "#B8DCC8" },
  XLS: { bg: "#FFF9F0", fg: "#956018", border: "#E8D4A8" },
};

const TEMPLATES = [
  { id: "tmpl-1", name: "Event Contract Template", description: "Standard contract for cocktail event bookings including terms, cancellation policy, and service scope.", category: "Templates", type: "DOC" },
  { id: "tmpl-2", name: "Risk Assessment Template", description: "Comprehensive risk assessment for on-site cocktail bars including glass handling, alcohol service, and fire safety.", category: "Templates", type: "DOC" },
  { id: "tmpl-3", name: "Cocktail Menu Template", description: "Branded menu template with space for 6-8 cocktails, descriptions, garnish notes, and allergen information.", category: "Templates", type: "DOC" },
  { id: "tmpl-4", name: "Staff Briefing Template", description: "Pre-event staff briefing document covering venue layout, service plan, dress code, and client preferences.", category: "Templates", type: "DOC" },
  { id: "tmpl-5", name: "Equipment Checklist", description: "Complete equipment and stock checklist for mobile bar setup including glassware, spirits, mixers, and tools.", category: "Templates", type: "XLS" },
  { id: "tmpl-6", name: "Client Feedback Form", description: "Post-event feedback form for clients to rate service quality, cocktail selection, and overall experience.", category: "Templates", type: "DOC" },
  { id: "tmpl-7", name: "Post-Event Report Template", description: "Internal report template for documenting event performance, stock usage, revenue, and lessons learned.", category: "Templates", type: "DOC" },
];

function generateId() {
  return "doc-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = d.getDate();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const SEED_DOCUMENTS = [
  { id: generateId(), name: "Savoy Cocktail Event Contract", category: "Contracts", type: "PDF", size: 245760, tags: ["savoy", "contract", "2026"], description: "Master service agreement for The Savoy monthly cocktail series.", createdAt: daysAgo(90), modifiedAt: daysAgo(3), client: "The Savoy", versions: [{ version: 1, date: daysAgo(90), note: "Initial draft" }, { version: 2, date: daysAgo(45), note: "Legal review updates" }, { version: 3, date: daysAgo(3), note: "Final signed version" }] },
  { id: generateId(), name: "Claridge's Wedding Proposal", category: "Proposals", type: "PDF", size: 1887436, tags: ["claridges", "wedding", "premium"], description: "Bespoke cocktail package proposal for Claridge's wedding partnership.", createdAt: daysAgo(30), modifiedAt: daysAgo(7), client: "Claridge's", versions: [{ version: 1, date: daysAgo(30), note: "First draft" }, { version: 2, date: daysAgo(7), note: "Revised pricing" }] },
  { id: generateId(), name: "Public Liability Insurance 2026", category: "Insurance", type: "PDF", size: 532480, tags: ["insurance", "liability", "2026"], description: "Annual public liability insurance certificate — \u00A310M cover.", createdAt: daysAgo(120), modifiedAt: daysAgo(120), client: "", versions: [{ version: 1, date: daysAgo(120), note: "Policy renewal" }] },
  { id: generateId(), name: "Employers Liability Certificate", category: "Insurance", type: "PDF", size: 412672, tags: ["insurance", "employers", "certificate"], description: "Employers liability insurance certificate for all HH&T staff.", createdAt: daysAgo(118), modifiedAt: daysAgo(118), client: "", versions: [{ version: 1, date: daysAgo(118), note: "Annual renewal" }] },
  { id: generateId(), name: "Fire Risk Assessment — Mobile Bar", category: "Health & Safety", type: "DOC", size: 189440, tags: ["fire", "risk", "mobile-bar", "safety"], description: "Fire risk assessment for deployable mobile cocktail bar units.", createdAt: daysAgo(200), modifiedAt: daysAgo(15), client: "", versions: [{ version: 1, date: daysAgo(200), note: "Initial assessment" }, { version: 2, date: daysAgo(15), note: "Annual review update" }] },
  { id: generateId(), name: "Allergen Policy & Procedures", category: "Health & Safety", type: "DOC", size: 156672, tags: ["allergen", "policy", "natasha-law"], description: "Comprehensive allergen management policy including Natasha's Law compliance.", createdAt: daysAgo(180), modifiedAt: daysAgo(60), client: "", versions: [{ version: 1, date: daysAgo(180), note: "Policy created" }, { version: 2, date: daysAgo(60), note: "Updated for new regs" }] },
  { id: generateId(), name: "Summer Cocktail Menu 2026", category: "Menus & Recipes", type: "PDF", size: 2456576, tags: ["summer", "menu", "2026", "seasonal"], description: "Seasonal summer cocktail menu featuring elderflower, watermelon, and citrus-forward drinks.", createdAt: daysAgo(45), modifiedAt: daysAgo(10), client: "", versions: [{ version: 1, date: daysAgo(45), note: "Draft menu" }, { version: 2, date: daysAgo(10), note: "Final with photography" }] },
  { id: generateId(), name: "Signature Cocktail Recipes — Master List", category: "Menus & Recipes", type: "XLS", size: 98304, tags: ["recipes", "master", "cocktails"], description: "Complete recipe book with 85+ signature cocktails including specs, costs, and garnish details.", createdAt: daysAgo(365), modifiedAt: daysAgo(5), client: "", versions: [{ version: 1, date: daysAgo(365), note: "First compilation" }, { version: 2, date: daysAgo(180), note: "Added 20 new recipes" }, { version: 3, date: daysAgo(5), note: "Spring 2026 additions" }] },
  { id: generateId(), name: "HH&T Brand Guidelines v3", category: "Brand Guidelines", type: "PDF", size: 8912896, tags: ["brand", "guidelines", "identity", "logo"], description: "Complete brand guidelines including logo usage, typography, colour palette, and tone of voice.", createdAt: daysAgo(300), modifiedAt: daysAgo(90), client: "", versions: [{ version: 1, date: daysAgo(300), note: "v3.0 launch" }] },
  { id: generateId(), name: "Social Media Asset Pack", category: "Brand Guidelines", type: "IMG", size: 15728640, tags: ["social", "instagram", "templates", "brand"], description: "Instagram, LinkedIn and TikTok templates with brand-correct overlays and frames.", createdAt: daysAgo(60), modifiedAt: daysAgo(20), client: "", versions: [{ version: 1, date: daysAgo(60), note: "Initial pack" }, { version: 2, date: daysAgo(20), note: "Added TikTok formats" }] },
  { id: generateId(), name: "Event Photos — Kew Gardens Gala", category: "Photos & Media", type: "IMG", size: 52428800, tags: ["kew-gardens", "gala", "photos", "portfolio"], description: "Professional photography from the Kew Gardens charity gala — 120 edited images.", createdAt: daysAgo(25), modifiedAt: daysAgo(25), client: "Kew Gardens", versions: [{ version: 1, date: daysAgo(25), note: "Photographer delivery" }] },
  { id: generateId(), name: "Promotional Video — Brand Reel", category: "Photos & Media", type: "IMG", size: 104857600, tags: ["video", "promo", "brand-reel"], description: "60-second brand reel showcasing HH&T at premium events. 4K resolution.", createdAt: daysAgo(90), modifiedAt: daysAgo(90), client: "", versions: [{ version: 1, date: daysAgo(90), note: "Final cut" }] },
  { id: generateId(), name: "Bartender Training Manual", category: "Training", type: "PDF", size: 3145728, tags: ["training", "bartender", "manual", "onboarding"], description: "Comprehensive training manual for new bartenders covering cocktail technique, service standards, and HH&T protocols.", createdAt: daysAgo(150), modifiedAt: daysAgo(30), client: "", versions: [{ version: 1, date: daysAgo(150), note: "First edition" }, { version: 2, date: daysAgo(30), note: "Updated service standards" }] },
  { id: generateId(), name: "WSET Level 2 Study Guide", category: "Training", type: "PDF", size: 1572864, tags: ["wset", "wine", "spirits", "education"], description: "Study materials and tasting notes for WSET Level 2 Award in Spirits.", createdAt: daysAgo(200), modifiedAt: daysAgo(200), client: "", versions: [{ version: 1, date: daysAgo(200), note: "Uploaded" }] },
  { id: generateId(), name: "Premises Licence — HQ Bar", category: "Licences", type: "PDF", size: 327680, tags: ["licence", "premises", "alcohol"], description: "Premises licence for HH&T headquarters tasting bar and training space.", createdAt: daysAgo(400), modifiedAt: daysAgo(100), client: "", versions: [{ version: 1, date: daysAgo(400), note: "Original grant" }, { version: 2, date: daysAgo(100), note: "Variation approved" }] },
  { id: generateId(), name: "Personal Licence — Joe Stokoe", category: "Licences", type: "PDF", size: 204800, tags: ["licence", "personal", "joe-stokoe"], description: "Personal alcohol licence for Joe Stokoe — designated premises supervisor.", createdAt: daysAgo(500), modifiedAt: daysAgo(500), client: "", versions: [{ version: 1, date: daysAgo(500), note: "Licence granted" }] },
  { id: generateId(), name: "TEN Application Template", category: "Licences", type: "DOC", size: 143360, tags: ["ten", "temporary-event", "licence", "template"], description: "Pre-filled Temporary Event Notice template for quick submission to local authorities.", createdAt: daysAgo(180), modifiedAt: daysAgo(40), client: "", versions: [{ version: 1, date: daysAgo(180), note: "Template created" }, { version: 2, date: daysAgo(40), note: "Updated council addresses" }] },
  { id: generateId(), name: "Corporate Rate Card 2026", category: "Proposals", type: "PDF", size: 1048576, tags: ["rate-card", "corporate", "pricing", "2026"], description: "Standard corporate rate card with tiered pricing for cocktail masterclasses and event bars.", createdAt: daysAgo(60), modifiedAt: daysAgo(12), client: "", versions: [{ version: 1, date: daysAgo(60), note: "2026 pricing set" }, { version: 2, date: daysAgo(12), note: "Added masterclass tier" }] },
  { id: generateId(), name: "Supplier Agreement — Premium Spirits", category: "Contracts", type: "DOC", size: 286720, tags: ["supplier", "spirits", "agreement"], description: "Framework agreement with premium spirits suppliers for preferential trade pricing.", createdAt: daysAgo(220), modifiedAt: daysAgo(50), client: "Various Suppliers", versions: [{ version: 1, date: daysAgo(220), note: "Initial agreement" }, { version: 2, date: daysAgo(50), note: "2026 pricing update" }] },
  { id: generateId(), name: "Venue Partner Onboarding Pack", category: "Proposals", type: "PDF", size: 3670016, tags: ["venue", "partner", "onboarding", "deck"], description: "Comprehensive onboarding pack for new venue partners including service overview, logistics, and case studies.", createdAt: daysAgo(75), modifiedAt: daysAgo(18), client: "", versions: [{ version: 1, date: daysAgo(75), note: "First version" }, { version: 2, date: daysAgo(18), note: "Added 3 new case studies" }] },
  { id: generateId(), name: "HACCP Plan — Mobile Operations", category: "Health & Safety", type: "DOC", size: 215040, tags: ["haccp", "food-safety", "mobile"], description: "Hazard Analysis Critical Control Points plan for all mobile bar operations.", createdAt: daysAgo(250), modifiedAt: daysAgo(35), client: "", versions: [{ version: 1, date: daysAgo(250), note: "Plan established" }, { version: 2, date: daysAgo(35), note: "Annual review" }] },
  { id: generateId(), name: "Winter Warmers Menu 2025", category: "Menus & Recipes", type: "PDF", size: 2097152, tags: ["winter", "menu", "2025", "seasonal", "hot-cocktails"], description: "Winter seasonal menu featuring hot toddies, mulled cocktails, and fireside serves.", createdAt: daysAgo(140), modifiedAt: daysAgo(140), client: "", versions: [{ version: 1, date: daysAgo(140), note: "Final version" }] },
];

function loadDocuments() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) { /* ignore */ }
  return SEED_DOCUMENTS;
}

function saveDocuments(docs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(docs));
  } catch (e) { /* ignore */ }
}

// ── Shared style helpers ──

const btnBase = {
  fontFamily: F.sans, fontSize: 13, fontWeight: 500, cursor: "pointer",
  border: "none", borderRadius: 6, padding: "8px 16px", transition: "all 0.15s ease",
};

const inputBase = {
  fontFamily: F.sans, fontSize: 13, padding: "9px 12px", border: `1px solid ${C.border}`,
  borderRadius: 6, background: C.card, color: C.ink, outline: "none", width: "100%",
  boxSizing: "border-box",
};

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════

export default function DocumentManager() {
  const [documents, setDocuments] = useState(loadDocuments);
  const [view, setView] = useState("grid"); // grid | list
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("modifiedAt"); // modifiedAt | name | size
  const [sortDir, setSortDir] = useState("desc");
  const [activeTab, setActiveTab] = useState("library"); // library | templates | upload | folder
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showVersions, setShowVersions] = useState(null);
  const [folderCategory, setFolderCategory] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: "", category: "Contracts", type: "PDF", description: "",
    tags: "", client: "", size: 0,
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Persist on change
  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  // ── Filtering & Search ──
  const filtered = useMemo(() => {
    let docs = [...documents];
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q) ||
        (d.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (d.client || "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "All") {
      docs = docs.filter(d => d.category === categoryFilter);
    }
    if (typeFilter !== "All") {
      docs = docs.filter(d => d.type === typeFilter);
    }
    docs.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "size") cmp = (a.size || 0) - (b.size || 0);
      else cmp = new Date(a.modifiedAt) - new Date(b.modifiedAt);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return docs;
  }, [documents, search, categoryFilter, typeFilter, sortBy, sortDir]);

  // ── Stats ──
  const stats = useMemo(() => {
    const byCategory = {};
    CATEGORIES.forEach(c => { byCategory[c] = 0; });
    documents.forEach(d => { byCategory[d.category] = (byCategory[d.category] || 0) + 1; });
    const recentlyModified = [...documents]
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
      .slice(0, 5);
    const totalSize = documents.reduce((sum, d) => sum + (d.size || 0), 0);
    return { total: documents.length, byCategory, recentlyModified, totalSize };
  }, [documents]);

  // ── Handlers ──
  const handleUpload = useCallback((e) => {
    e.preventDefault();
    const newDoc = {
      id: generateId(),
      name: uploadForm.name.trim(),
      category: uploadForm.category,
      type: uploadForm.type,
      size: uploadForm.size || Math.floor(Math.random() * 5000000) + 50000,
      tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      description: uploadForm.description.trim(),
      client: uploadForm.client.trim(),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      versions: [{ version: 1, date: new Date().toISOString(), note: "Initial upload" }],
    };
    setDocuments(prev => [newDoc, ...prev]);
    setUploadForm({ name: "", category: "Contracts", type: "PDF", description: "", tags: "", client: "", size: 0 });
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  }, [uploadForm]);

  const handleDelete = useCallback((docId) => {
    if (window.confirm("Delete this document? This cannot be undone.")) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (selectedDoc && selectedDoc.id === docId) setSelectedDoc(null);
    }
  }, [selectedDoc]);

  const handleCreateFromTemplate = useCallback((tmpl) => {
    const newDoc = {
      id: generateId(),
      name: tmpl.name.replace("Template", "").trim() + " — " + new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      category: tmpl.category === "Templates" ? "Contracts" : tmpl.category,
      type: tmpl.type,
      size: Math.floor(Math.random() * 300000) + 50000,
      tags: ["from-template"],
      description: "Created from: " + tmpl.name,
      client: "",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      versions: [{ version: 1, date: new Date().toISOString(), note: "Created from template" }],
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveTab("library");
  }, []);

  const handleFolderNav = useCallback((cat) => {
    setFolderCategory(cat);
    setCategoryFilter(cat || "All");
    if (cat) setActiveTab("library");
  }, []);

  // ══════════════════════════════════════
  // Render Helpers
  // ══════════════════════════════════════

  const TypeBadge = ({ type }) => {
    const tc = TYPE_COLORS[type] || TYPE_COLORS.PDF;
    return (
      <span style={{
        display: "inline-block", fontSize: 10, fontWeight: 700, fontFamily: F.mono,
        padding: "2px 8px", borderRadius: 4, background: tc.bg, color: tc.fg,
        border: `1px solid ${tc.border}`, letterSpacing: 0.5,
      }}>{type}</span>
    );
  };

  const Tag = ({ label }) => (
    <span style={{
      display: "inline-block", fontSize: 11, fontFamily: F.sans, color: C.accent,
      background: C.accentSubtle, padding: "2px 8px", borderRadius: 10, marginRight: 4,
      marginBottom: 2,
    }}>{label}</span>
  );

  // ── Document Card (Grid) ──
  const renderDocCardGrid = (doc) => {
    const isHovered = hoveredCard === doc.id;
    return (
      <div
        key={doc.id}
        onClick={() => setSelectedDoc(doc)}
        onMouseEnter={() => setHoveredCard(doc.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          background: isHovered ? C.cardHover : C.card,
          border: `1px solid ${isHovered ? C.accentLight : C.border}`,
          borderRadius: 10, padding: 20, cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: isHovered ? "0 4px 16px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <TypeBadge type={doc.type} />
          <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>{formatBytes(doc.size)}</span>
        </div>
        <h4 style={{ fontFamily: F.serif, fontSize: 15, fontWeight: 600, color: C.ink, margin: "0 0 6px", lineHeight: 1.3 }}>
          {doc.name}
        </h4>
        <p style={{ fontFamily: F.sans, fontSize: 12, color: C.inkSec, margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {doc.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 8 }}>
          {(doc.tags || []).slice(0, 3).map(t => <Tag key={t} label={t} />)}
          {(doc.tags || []).length > 3 && <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, lineHeight: "22px" }}>+{doc.tags.length - 3}</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.borderLight}`, paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>
            {CATEGORY_ICONS[doc.category]} {doc.category}
          </span>
          <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans }}>
            {formatDate(doc.modifiedAt)}
          </span>
        </div>
      </div>
    );
  };

  // ── Document Row (List) ──
  const renderDocRow = (doc) => {
    const isHovered = hoveredCard === doc.id;
    return (
      <div
        key={doc.id}
        onClick={() => setSelectedDoc(doc)}
        onMouseEnter={() => setHoveredCard(doc.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          display: "grid", gridTemplateColumns: "60px 1fr 140px 100px 100px 90px 40px",
          alignItems: "center", gap: 12, padding: "12px 16px",
          background: isHovered ? C.cardHover : C.card,
          borderBottom: `1px solid ${C.borderLight}`,
          cursor: "pointer", transition: "background 0.15s",
        }}
      >
        <TypeBadge type={doc.type} />
        <div>
          <div style={{ fontFamily: F.serif, fontSize: 14, fontWeight: 600, color: C.ink }}>{doc.name}</div>
          <div style={{ fontFamily: F.sans, fontSize: 11, color: C.inkMuted, marginTop: 2 }}>
            {(doc.tags || []).slice(0, 3).join(", ")}
          </div>
        </div>
        <span style={{ fontSize: 12, color: C.inkSec, fontFamily: F.sans }}>{doc.category}</span>
        <span style={{ fontSize: 12, color: C.inkMuted, fontFamily: F.sans }}>{formatBytes(doc.size)}</span>
        <span style={{ fontSize: 12, color: C.inkMuted, fontFamily: F.sans }}>{formatDate(doc.modifiedAt)}</span>
        <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.mono }}>{(doc.versions || []).length}v</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
          style={{ ...btnBase, padding: "4px 8px", background: "transparent", color: C.danger, fontSize: 14 }}
          title="Delete"
        >&times;</button>
      </div>
    );
  };

  // ── Document Detail Panel ──
  const renderDocDetail = () => {
    if (!selectedDoc) return null;
    const doc = documents.find(d => d.id === selectedDoc.id) || selectedDoc;
    return (
      <div style={{
        position: "fixed", top: 0, right: 0, width: 480, height: "100vh", background: C.card,
        borderLeft: `1px solid ${C.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
        zIndex: 1000, overflowY: "auto", padding: 32,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <TypeBadge type={doc.type} />
          <button onClick={() => setSelectedDoc(null)} style={{ ...btnBase, background: "transparent", color: C.inkMuted, fontSize: 20, padding: "4px 8px" }}>&times;</button>
        </div>
        <h2 style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, margin: "0 0 8px", lineHeight: 1.3 }}>{doc.name}</h2>
        <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, lineHeight: 1.6, margin: "0 0 20px" }}>{doc.description}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            ["Category", `${CATEGORY_ICONS[doc.category] || ""} ${doc.category}`],
            ["File Type", doc.type],
            ["Size", formatBytes(doc.size)],
            ["Created", formatDate(doc.createdAt)],
            ["Last Modified", formatDate(doc.modifiedAt)],
            ["Client", doc.client || "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, color: C.ink, fontFamily: F.sans, fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>

        {doc.tags && doc.tags.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {doc.tags.map(t => <Tag key={t} label={t} />)}
            </div>
          </div>
        )}

        {/* Version History */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>Version History</div>
          {(doc.versions || []).slice().reverse().map((v, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0",
              borderBottom: i < (doc.versions || []).length - 1 ? `1px solid ${C.borderLight}` : "none",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: i === 0 ? C.accent : C.bgWarm,
                color: i === 0 ? "#FFF" : C.inkSec, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, fontFamily: F.mono, flexShrink: 0,
              }}>v{v.version}</div>
              <div>
                <div style={{ fontSize: 13, color: C.ink, fontFamily: F.sans, fontWeight: 500 }}>{v.note}</div>
                <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginTop: 2 }}>{formatDate(v.date)}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleDelete(doc.id)} style={{ ...btnBase, background: C.dangerBg, color: C.danger, flex: 1 }}>Delete Document</button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // TAB CONTENT
  // ══════════════════════════════════════

  const renderStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
      {[
        { label: "Total Documents", value: stats.total, color: C.accent, bg: C.accentSubtle },
        { label: "Categories Used", value: Object.values(stats.byCategory).filter(v => v > 0).length, color: C.info, bg: C.infoBg },
        { label: "Total Storage", value: formatBytes(stats.totalSize), color: C.warn, bg: C.warnBg },
        { label: "Recently Updated", value: stats.recentlyModified.length, color: C.success, bg: C.successBg },
      ].map(s => (
        <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: F.serif }}>{s.value}</div>
          <div style={{ fontSize: 12, color: C.inkSec, fontFamily: F.sans, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );

  const renderToolbar = () => (
    <div style={{
      display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
      marginBottom: 20, padding: "14px 18px", background: C.card, borderRadius: 10,
      border: `1px solid ${C.border}`,
    }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
        <input
          type="text" placeholder="Search documents, tags, clients..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputBase, paddingLeft: 34 }}
        />
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.inkMuted, pointerEvents: "none" }}>{"\u{1F50D}"}</span>
      </div>

      {/* Category filter */}
      <select
        value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
        style={{ ...inputBase, width: "auto", minWidth: 140, cursor: "pointer" }}
      >
        <option value="All">All Categories</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Type filter */}
      <select
        value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
        style={{ ...inputBase, width: "auto", minWidth: 100, cursor: "pointer" }}
      >
        <option value="All">All Types</option>
        {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Sort */}
      <select
        value={sortBy} onChange={e => setSortBy(e.target.value)}
        style={{ ...inputBase, width: "auto", minWidth: 120, cursor: "pointer" }}
      >
        <option value="modifiedAt">Last Modified</option>
        <option value="name">Name</option>
        <option value="size">File Size</option>
      </select>
      <button
        onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
        style={{ ...btnBase, background: C.bgWarm, color: C.inkSec, padding: "8px 12px" }}
        title="Toggle sort direction"
      >{sortDir === "asc" ? "\u2191" : "\u2193"}</button>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 2, background: C.bgWarm, borderRadius: 6, padding: 2 }}>
        {["grid", "list"].map(v => (
          <button
            key={v} onClick={() => setView(v)}
            style={{
              ...btnBase, padding: "6px 12px", fontSize: 12,
              background: view === v ? C.card : "transparent",
              color: view === v ? C.accent : C.inkMuted,
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              borderRadius: 4,
            }}
          >{v === "grid" ? "\u25A6 Grid" : "\u2261 List"}</button>
        ))}
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div>
      {renderStats()}
      {renderToolbar()}

      {/* Results count */}
      <div style={{ marginBottom: 14, fontFamily: F.sans, fontSize: 13, color: C.inkMuted }}>
        Showing {filtered.length} of {documents.length} documents
        {search && <> matching &ldquo;<strong style={{ color: C.ink }}>{search}</strong>&rdquo;</>}
        {categoryFilter !== "All" && <> in <strong style={{ color: C.accent }}>{categoryFilter}</strong></>}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 60, background: C.card, borderRadius: 12,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u{1F4C2}"}</div>
          <h3 style={{ fontFamily: F.serif, fontSize: 18, color: C.ink, margin: "0 0 6px" }}>No documents found</h3>
          <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkMuted }}>Try adjusting your search or filters.</p>
        </div>
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(renderDocCardGrid)}
        </div>
      ) : (
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {/* List header */}
          <div style={{
            display: "grid", gridTemplateColumns: "60px 1fr 140px 100px 100px 90px 40px",
            gap: 12, padding: "10px 16px", background: C.bgWarm,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {["Type", "Name", "Category", "Size", "Modified", "Ver.", ""].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
            ))}
          </div>
          {filtered.map(renderDocRow)}
        </div>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, color: C.ink, margin: "0 0 6px" }}>Template Library</h3>
        <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, margin: 0 }}>
          Pre-built document templates for common HH&T operations. Create a new document from any template instantly.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {TEMPLATES.map(tmpl => (
          <div key={tmpl.id} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 22, display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <TypeBadge type={tmpl.type} />
              <span style={{ fontSize: 22 }}>{"\u{1F4C4}"}</span>
            </div>
            <h4 style={{ fontFamily: F.serif, fontSize: 16, color: C.ink, margin: "0 0 8px", fontWeight: 600 }}>{tmpl.name}</h4>
            <p style={{ fontFamily: F.sans, fontSize: 12, color: C.inkSec, margin: "0 0 16px", lineHeight: 1.5, flex: 1 }}>{tmpl.description}</p>
            <button
              onClick={() => handleCreateFromTemplate(tmpl)}
              style={{ ...btnBase, background: C.accent, color: "#FFF", width: "100%", textAlign: "center" }}
            >Create from Template</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUpload = () => (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, color: C.ink, margin: "0 0 6px" }}>Upload Document</h3>
        <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, margin: 0 }}>
          Add a new document record to the library. File content is not stored — only metadata is saved.
        </p>
      </div>

      {uploadSuccess && (
        <div style={{
          background: C.successBg, border: `1px solid ${C.success}`, borderRadius: 8,
          padding: "12px 16px", marginBottom: 16, fontFamily: F.sans, fontSize: 13, color: C.success,
        }}>
          Document uploaded successfully and added to the library.
        </div>
      )}

      <form onSubmit={handleUpload} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28 }}>
        {/* Name */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: F.sans, marginBottom: 6 }}>Document Name *</label>
          <input
            required type="text" value={uploadForm.name}
            onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Savoy Event Contract Q2 2026"
            style={inputBase}
          />
        </div>

        {/* Category & Type row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: F.sans, marginBottom: 6 }}>Category *</label>
            <select
              value={uploadForm.category}
              onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}
              style={{ ...inputBase, cursor: "pointer" }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: F.sans, marginBottom: 6 }}>File Type *</label>
            <select
              value={uploadForm.type}
              onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))}
              style={{ ...inputBase, cursor: "pointer" }}
            >
              {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: F.sans, marginBottom: 6 }}>Description</label>
          <textarea
            value={uploadForm.description}
            onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this document..."
            rows={3}
            style={{ ...inputBase, resize: "vertical" }}
          />
        </div>

        {/* Tags & Client row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: F.sans, marginBottom: 6 }}>Tags (comma-separated)</label>
            <input
              type="text" value={uploadForm.tags}
              onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. contract, savoy, 2026"
              style={inputBase}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: F.sans, marginBottom: 6 }}>Associated Client / Event</label>
            <input
              type="text" value={uploadForm.client}
              onChange={e => setUploadForm(f => ({ ...f, client: e.target.value }))}
              placeholder="e.g. The Savoy"
              style={inputBase}
            />
          </div>
        </div>

        {/* File size (simulated) */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: F.sans, marginBottom: 6 }}>File Size (bytes, optional)</label>
          <input
            type="number" value={uploadForm.size || ""}
            onChange={e => setUploadForm(f => ({ ...f, size: parseInt(e.target.value) || 0 }))}
            placeholder="Auto-generated if left blank"
            style={inputBase}
          />
          <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.sans, marginTop: 4 }}>
            Metadata only — actual file content is not stored in localStorage.
          </div>
        </div>

        <button type="submit" disabled={!uploadForm.name.trim()} style={{
          ...btnBase, background: uploadForm.name.trim() ? C.accent : C.border,
          color: uploadForm.name.trim() ? "#FFF" : C.inkMuted,
          padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: uploadForm.name.trim() ? "pointer" : "not-allowed",
        }}>
          Upload Document
        </button>
      </form>
    </div>
  );

  const renderFolders = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, color: C.ink, margin: "0 0 6px" }}>
          {folderCategory ? (
            <span>
              <button onClick={() => handleFolderNav(null)} style={{ ...btnBase, background: "transparent", color: C.accent, padding: 0, fontSize: 20, fontFamily: F.serif }}>
                Documents
              </button>
              <span style={{ color: C.inkMuted, margin: "0 8px" }}>/</span>
              {folderCategory}
            </span>
          ) : "Document Folders"}
        </h3>
        <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, margin: 0 }}>
          {folderCategory ? `${stats.byCategory[folderCategory] || 0} documents in this category` : "Browse documents by category"}
        </p>
      </div>

      {!folderCategory ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {CATEGORIES.map(cat => {
            const count = stats.byCategory[cat] || 0;
            return (
              <div
                key={cat}
                onClick={() => handleFolderNav(cat)}
                style={{
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: "20px 18px", cursor: "pointer", transition: "all 0.15s",
                  textAlign: "center",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accentLight; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{CATEGORY_ICONS[cat]}</div>
                <div style={{ fontFamily: F.serif, fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{cat}</div>
                <div style={{ fontFamily: F.sans, fontSize: 12, color: C.inkMuted }}>
                  {count} document{count !== 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <button
            onClick={() => { handleFolderNav(null); setCategoryFilter("All"); }}
            style={{ ...btnBase, background: C.bgWarm, color: C.inkSec, marginBottom: 16 }}
          >{"\u2190"} Back to Folders</button>
          {renderToolbar()}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: C.inkMuted, fontFamily: F.sans, fontSize: 13 }}>
              No documents in this category yet.
            </div>
          ) : view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map(renderDocCardGrid)}
            </div>
          ) : (
            <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "60px 1fr 140px 100px 100px 90px 40px",
                gap: 12, padding: "10px 16px", background: C.bgWarm,
                borderBottom: `1px solid ${C.border}`,
              }}>
                {["Type", "Name", "Category", "Size", "Modified", "Ver.", ""].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
                ))}
              </div>
              {filtered.map(renderDocRow)}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════

  const TABS = [
    { id: "library", label: "Document Library", icon: "\u{1F4DA}" },
    { id: "folder", label: "Folders", icon: "\u{1F4C1}" },
    { id: "templates", label: "Templates", icon: "\u{1F4C4}" },
    { id: "upload", label: "Upload", icon: "\u{2B06}\uFE0F" },
  ];

  return (
    <div style={{ fontFamily: F.sans, background: C.bg, minHeight: "100vh", color: C.ink }}>
      {/* Header */}
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "24px 32px 0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: -0.3 }}>
              Document Manager
            </h1>
            <p style={{ fontFamily: F.sans, fontSize: 13, color: C.inkSec, margin: "4px 0 0" }}>
              HH&T Operations — Contracts, proposals, templates & media library
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: C.inkMuted, background: C.bgWarm, padding: "6px 12px", borderRadius: 6 }}>
              {stats.total} docs &middot; {formatBytes(stats.totalSize)}
            </span>
            <button
              onClick={() => setActiveTab("upload")}
              style={{ ...btnBase, background: C.accent, color: "#FFF", fontWeight: 600 }}
            >+ New Document</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "folder") {
                  setFolderCategory(null);
                  if (tab.id !== "library") setCategoryFilter("All");
                }
              }}
              style={{
                ...btnBase,
                borderRadius: 0,
                padding: "10px 20px",
                fontSize: 13,
                background: "transparent",
                color: activeTab === tab.id ? C.accent : C.inkMuted,
                borderBottom: activeTab === tab.id ? `2px solid ${C.accent}` : "2px solid transparent",
                fontWeight: activeTab === tab.id ? 600 : 400,
                marginBottom: -1,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>
        {activeTab === "library" && renderLibrary()}
        {activeTab === "folder" && renderFolders()}
        {activeTab === "templates" && renderTemplates()}
        {activeTab === "upload" && renderUpload()}
      </div>

      {/* Detail Slide-over */}
      {selectedDoc && (
        <>
          <div
            onClick={() => setSelectedDoc(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 999 }}
          />
          {renderDocDetail()}
        </>
      )}
    </div>
  );
}
