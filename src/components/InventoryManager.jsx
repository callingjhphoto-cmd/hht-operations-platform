import { useState, useEffect, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Inventory & Stock Management Module
// Premium cocktail events company — track spirits, mixers,
// glassware, equipment, and everything needed for flawless events
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

const STORAGE_KEY = "hht_inventory_v1";

const CATEGORIES = [
  "Spirits",
  "Mixers & Soft Drinks",
  "Fresh Ingredients",
  "Garnishes",
  "Glassware",
  "Bar Equipment",
  "Consumables",
  "Branded Materials",
];

const ADJUSTMENT_REASONS = [
  "Event Usage",
  "Purchase",
  "Wastage",
  "Damaged",
  "Returned",
];

const EVENT_TYPES = [
  { id: "cocktail_party", label: "Cocktail Party", drinksPerGuest: 3 },
  { id: "wedding", label: "Wedding Reception", drinksPerGuest: 5 },
  { id: "corporate", label: "Corporate Event", drinksPerGuest: 3 },
  { id: "festival", label: "Festival / Outdoor", drinksPerGuest: 4 },
  { id: "gala_dinner", label: "Gala Dinner", drinksPerGuest: 4 },
  { id: "product_launch", label: "Product Launch", drinksPerGuest: 2 },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getStatus(qty, min) {
  if (qty <= 0) return "Out of Stock";
  if (qty <= min) return "Low Stock";
  return "In Stock";
}

function statusStyle(status) {
  if (status === "Out of Stock") return { color: C.danger, bg: C.dangerBg };
  if (status === "Low Stock") return { color: C.warn, bg: C.warnBg };
  return { color: C.success, bg: C.successBg };
}

const SEED_DATA = [
  // Spirits
  { id: "s1", name: "Absolut Vodka", category: "Spirits", quantity: 12, unit: "bottles", minStock: 6, unitCost: 18.50 },
  { id: "s2", name: "Hendrick's Gin", category: "Spirits", quantity: 8, unit: "bottles", minStock: 4, unitCost: 28.00 },
  { id: "s3", name: "Bacardi Rum", category: "Spirits", quantity: 6, unit: "bottles", minStock: 4, unitCost: 16.50 },
  { id: "s4", name: "Bulleit Bourbon", category: "Spirits", quantity: 6, unit: "bottles", minStock: 3, unitCost: 26.00 },
  { id: "s5", name: "Espolon Tequila", category: "Spirits", quantity: 8, unit: "bottles", minStock: 4, unitCost: 24.00 },
  { id: "s6", name: "Campari", category: "Spirits", quantity: 4, unit: "bottles", minStock: 2, unitCost: 18.00 },
  { id: "s7", name: "Cointreau", category: "Spirits", quantity: 4, unit: "bottles", minStock: 2, unitCost: 22.00 },
  { id: "s8", name: "Aperol", category: "Spirits", quantity: 6, unit: "bottles", minStock: 3, unitCost: 14.50 },
  // Mixers & Soft Drinks
  { id: "m1", name: "Fever-Tree Tonic", category: "Mixers & Soft Drinks", quantity: 48, unit: "bottles", minStock: 24, unitCost: 1.20 },
  { id: "m2", name: "Fever-Tree Soda", category: "Mixers & Soft Drinks", quantity: 24, unit: "bottles", minStock: 12, unitCost: 1.10 },
  { id: "m3", name: "Ginger Beer", category: "Mixers & Soft Drinks", quantity: 24, unit: "bottles", minStock: 12, unitCost: 1.30 },
  { id: "m4", name: "Cranberry Juice", category: "Mixers & Soft Drinks", quantity: 12, unit: "litres", minStock: 6, unitCost: 2.80 },
  { id: "m5", name: "Orange Juice", category: "Mixers & Soft Drinks", quantity: 12, unit: "litres", minStock: 6, unitCost: 2.50 },
  // Fresh Ingredients
  { id: "f1", name: "Lemons", category: "Fresh Ingredients", quantity: 50, unit: "pieces", minStock: 20, unitCost: 0.30 },
  { id: "f2", name: "Limes", category: "Fresh Ingredients", quantity: 60, unit: "pieces", minStock: 25, unitCost: 0.35 },
  { id: "f3", name: "Mint", category: "Fresh Ingredients", quantity: 20, unit: "bunches", minStock: 10, unitCost: 1.50 },
  { id: "f4", name: "Cucumber", category: "Fresh Ingredients", quantity: 10, unit: "pieces", minStock: 5, unitCost: 0.60 },
  // Bar Equipment
  { id: "e1", name: "Boston Shakers", category: "Bar Equipment", quantity: 12, unit: "pieces", minStock: 6, unitCost: 14.00 },
  { id: "e2", name: "Jiggers", category: "Bar Equipment", quantity: 12, unit: "pieces", minStock: 6, unitCost: 6.50 },
  { id: "e3", name: "Hawthorne Strainers", category: "Bar Equipment", quantity: 8, unit: "pieces", minStock: 4, unitCost: 8.00 },
  { id: "e4", name: "Bar Spoons", category: "Bar Equipment", quantity: 10, unit: "pieces", minStock: 4, unitCost: 5.50 },
  { id: "e5", name: "Muddlers", category: "Bar Equipment", quantity: 6, unit: "pieces", minStock: 3, unitCost: 7.00 },
  // Glassware
  { id: "g1", name: "Coupe Glasses", category: "Glassware", quantity: 120, unit: "pieces", minStock: 60, unitCost: 3.50 },
  { id: "g2", name: "Highball Glasses", category: "Glassware", quantity: 100, unit: "pieces", minStock: 50, unitCost: 2.80 },
  { id: "g3", name: "Rocks Glasses", category: "Glassware", quantity: 80, unit: "pieces", minStock: 40, unitCost: 3.20 },
  { id: "g4", name: "Champagne Flutes", category: "Glassware", quantity: 60, unit: "pieces", minStock: 30, unitCost: 4.00 },
];

const SEED_LOG = SEED_DATA.map(item => ({
  id: generateId(),
  itemId: item.id,
  itemName: item.name,
  date: "2026-02-20",
  reason: "Purchase",
  quantityChange: item.quantity,
  quantityAfter: item.quantity,
}));

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.items && parsed.items.length > 0) return parsed;
    }
  } catch (e) { /* ignore */ }
  return { items: SEED_DATA, log: SEED_LOG };
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function InventoryManager() {
  const [items, setItems] = useState([]);
  const [movementLog, setMovementLog] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Event Usage");
  const [eventType, setEventType] = useState("cocktail_party");
  const [guestCount, setGuestCount] = useState(100);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadState();
    setItems(data.items);
    setMovementLog(data.log || []);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, log: movementLog }));
    }
  }, [items, movementLog]);

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length;
    const outOfStock = items.filter(i => i.quantity <= 0).length;
    const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const categoryCounts = {};
    items.forEach(i => { categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1; });
    return { totalItems, lowStock, outOfStock, totalValue, categoryCounts, categories: Object.keys(categoryCounts).length };
  }, [items]);

  // ── Filtered & Sorted Items ────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") {
      result = result.filter(i => i.category === categoryFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter(i => getStatus(i.quantity, i.minStock) === statusFilter);
    }
    result.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "totalValue") { va = a.quantity * a.unitCost; vb = b.quantity * b.unitCost; }
      if (sortField === "status") { va = getStatus(a.quantity, a.minStock); vb = getStatus(b.quantity, b.minStock); }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return result;
  }, [items, searchQuery, categoryFilter, statusFilter, sortField, sortDir]);

  const lowStockItems = useMemo(() => items.filter(i => i.quantity > 0 && i.quantity <= i.minStock), [items]);
  const outOfStockItems = useMemo(() => items.filter(i => i.quantity <= 0), [items]);

  // ── Handlers ───────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === "asc" ? "desc" : "asc"); return field; }
      setSortDir("asc");
      return field;
    });
  }, []);

  const handleSaveItem = useCallback((item) => {
    if (item.id) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      const newItem = { ...item, id: generateId() };
      setItems(prev => [...prev, newItem]);
      setMovementLog(prev => [{
        id: generateId(), itemId: newItem.id, itemName: newItem.name,
        date: new Date().toISOString().slice(0, 10), reason: "Purchase",
        quantityChange: newItem.quantity, quantityAfter: newItem.quantity,
      }, ...prev]);
    }
    setShowForm(false);
    setEditingItem(null);
  }, []);

  const handleDeleteItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleAdjust = useCallback((itemId, delta, reason) => {
    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const newQty = Math.max(0, i.quantity + delta);
      setMovementLog(log => [{
        id: generateId(), itemId: i.id, itemName: i.name,
        date: new Date().toISOString().slice(0, 10), reason,
        quantityChange: delta, quantityAfter: newQty,
      }, ...log]);
      return { ...i, quantity: newQty };
    }));
    setAdjustItem(null);
    setAdjustQty(0);
    setAdjustReason("Event Usage");
  }, []);

  const handleReorder = useCallback((item) => {
    const reorderQty = item.minStock * 2 - item.quantity;
    if (reorderQty <= 0) return;
    handleAdjust(item.id, reorderQty, "Purchase");
  }, [handleAdjust]);

  // ── Event Calculator Logic ─────────────────────────────────
  const eventCalculation = useMemo(() => {
    const evtType = EVENT_TYPES.find(e => e.id === eventType);
    if (!evtType) return null;
    const totalDrinks = guestCount * evtType.drinksPerGuest;
    // Rough breakdown: 40% spirit-based cocktails, 30% long drinks, 20% wine/champagne, 10% soft
    const spiritDrinks = Math.ceil(totalDrinks * 0.4);
    const longDrinks = Math.ceil(totalDrinks * 0.3);
    const champagneDrinks = Math.ceil(totalDrinks * 0.2);
    const softDrinks = Math.ceil(totalDrinks * 0.1);
    // ~15 drinks per 700ml spirit bottle, ~5 mixer servings per bottle/litre
    const spiritBottles = Math.ceil(spiritDrinks / 15);
    const mixerBottles = Math.ceil(longDrinks / 5);
    // Garnishes: ~1 per 2 drinks
    const lemons = Math.ceil(totalDrinks / 6);
    const limes = Math.ceil(totalDrinks / 5);
    const mintBunches = Math.ceil(totalDrinks / 20);
    // Glassware: assume 1.5x drinks for breakage/washing
    const glassware = Math.ceil(guestCount * 1.5);

    return {
      totalDrinks, eventLabel: evtType.label,
      requirements: [
        { name: "Spirit Bottles (assorted)", needed: spiritBottles, unit: "bottles", category: "Spirits" },
        { name: "Mixer Bottles/Litres", needed: mixerBottles, unit: "bottles/L", category: "Mixers & Soft Drinks" },
        { name: "Champagne/Wine Servings", needed: champagneDrinks, unit: "servings", category: "Spirits" },
        { name: "Soft Drink Servings", needed: softDrinks, unit: "servings", category: "Mixers & Soft Drinks" },
        { name: "Lemons", needed: lemons, unit: "pieces", category: "Fresh Ingredients" },
        { name: "Limes", needed: limes, unit: "pieces", category: "Fresh Ingredients" },
        { name: "Mint Bunches", needed: mintBunches, unit: "bunches", category: "Fresh Ingredients" },
        { name: "Glassware (total)", needed: glassware, unit: "pieces", category: "Glassware" },
      ],
      stockCheck: [
        { name: "Total Spirits", available: items.filter(i => i.category === "Spirits").reduce((s, i) => s + i.quantity, 0), needed: spiritBottles, unit: "bottles" },
        { name: "Total Mixers", available: items.filter(i => i.category === "Mixers & Soft Drinks").reduce((s, i) => s + i.quantity, 0), needed: mixerBottles + Math.ceil(softDrinks / 5), unit: "bottles/L" },
        { name: "Lemons", available: items.find(i => i.name === "Lemons")?.quantity || 0, needed: lemons, unit: "pieces" },
        { name: "Limes", available: items.find(i => i.name === "Limes")?.quantity || 0, needed: limes, unit: "pieces" },
        { name: "Mint", available: items.find(i => i.name === "Mint")?.quantity || 0, needed: mintBunches, unit: "bunches" },
        { name: "Total Glassware", available: items.filter(i => i.category === "Glassware").reduce((s, i) => s + i.quantity, 0), needed: glassware, unit: "pieces" },
      ],
    };
  }, [eventType, guestCount, items]);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "stock", label: "Stock List" },
    { id: "alerts", label: `Alerts (${lowStockItems.length + outOfStockItems.length})` },
    { id: "calculator", label: "Event Calculator" },
    { id: "log", label: "Movement Log" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.sans, color: C.ink }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "24px 32px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 400, margin: 0, color: C.ink }}>
              Inventory & Stock Management
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: C.inkMuted }}>
              HH&T — Heads, Hearts & Tails
            </p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setShowForm(true); setActiveTab("stock"); }}
            style={{
              padding: "10px 20px", background: C.accent, color: "#fff", border: "none",
              borderRadius: 6, fontFamily: F.sans, fontSize: 14, fontWeight: 500,
              cursor: "pointer", letterSpacing: 0.3,
            }}
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 24px", border: "none", background: "none",
                fontFamily: F.sans, fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? C.accent : C.inkSec,
                borderBottom: activeTab === tab.id ? `2px solid ${C.accent}` : "2px solid transparent",
                cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "stock" && renderStockList()}
        {activeTab === "alerts" && renderAlerts()}
        {activeTab === "calculator" && renderCalculator()}
        {activeTab === "log" && renderLog()}
      </div>

      {/* Modals */}
      {showForm && renderFormModal()}
      {adjustItem && renderAdjustModal()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD TAB
  // ═══════════════════════════════════════════════════════════
  function renderDashboard() {
    const statCards = [
      { label: "Total Items", value: stats.totalItems, icon: "&#9733;", color: C.accent, bg: C.accentSubtle },
      { label: "Low Stock Alerts", value: stats.lowStock, icon: "&#9888;", color: C.warn, bg: C.warnBg },
      { label: "Out of Stock", value: stats.outOfStock, icon: "&#10005;", color: C.danger, bg: C.dangerBg },
      { label: "Total Value", value: `£${stats.totalValue.toFixed(2)}`, icon: "&#163;", color: C.success, bg: C.successBg },
      { label: "Categories", value: stats.categories, icon: "&#9830;", color: C.info, bg: C.infoBg },
    ];

    return (
      <div>
        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {statCards.map(s => (
            <div key={s.label} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "20px 24px", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 12, right: 16, width: 36, height: 36,
                background: s.bg, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 16, color: s.color,
              }} dangerouslySetInnerHTML={{ __html: s.icon }} />
              <p style={{ margin: 0, fontSize: 12, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 500 }}>{s.label}</p>
              <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 600, fontFamily: F.serif, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 18, margin: "0 0 16px", color: C.ink }}>Stock by Category</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {CATEGORIES.filter(cat => stats.categoryCounts[cat]).map(cat => {
              const catItems = items.filter(i => i.category === cat);
              const catValue = catItems.reduce((s, i) => s + i.quantity * i.unitCost, 0);
              const catLow = catItems.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length;
              return (
                <div key={cat} style={{
                  padding: "14px 18px", background: C.bgWarm, borderRadius: 6,
                  border: `1px solid ${C.borderLight}`, cursor: "pointer",
                }} onClick={() => { setCategoryFilter(cat); setActiveTab("stock"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{cat}</span>
                    <span style={{ fontSize: 12, color: C.inkMuted }}>{catItems.length} items</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13 }}>
                    <span style={{ color: C.inkSec }}>Value: <strong style={{ color: C.accent }}>£{catValue.toFixed(2)}</strong></span>
                    {catLow > 0 && <span style={{ color: C.warn, fontWeight: 500 }}>{catLow} low</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Low Stock Overview */}
        {lowStockItems.length > 0 && (
          <div style={{ background: C.warnBg, border: `1px solid ${C.warn}33`, borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 18, margin: "0 0 12px", color: C.warn }}>Low Stock Items Requiring Attention</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {lowStockItems.map(item => (
                <span key={item.id} style={{
                  padding: "6px 14px", background: C.card, borderRadius: 20,
                  fontSize: 13, border: `1px solid ${C.warn}44`, color: C.warn, fontWeight: 500,
                }}>
                  {item.name} ({item.quantity}/{item.minStock})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STOCK LIST TAB
  // ═══════════════════════════════════════════════════════════
  function renderStockList() {
    const sortArrow = (field) => {
      if (sortField !== field) return "";
      return sortDir === "asc" ? " \u25B2" : " \u25BC";
    };

    const thStyle = {
      padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600,
      color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8,
      borderBottom: `2px solid ${C.border}`, cursor: "pointer", whiteSpace: "nowrap",
      userSelect: "none",
    };

    return (
      <div>
        {/* Filters */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center",
        }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: "1 1 220px", padding: "10px 14px", border: `1px solid ${C.border}`,
              borderRadius: 6, fontFamily: F.sans, fontSize: 14, background: C.card,
              outline: "none", color: C.ink,
            }}
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
              fontFamily: F.sans, fontSize: 14, background: C.card, color: C.ink, cursor: "pointer",
            }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
              fontFamily: F.sans, fontSize: 14, background: C.card, color: C.ink, cursor: "pointer",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <span style={{ fontSize: 13, color: C.inkMuted }}>{filteredItems.length} items</span>
        </div>

        {/* Table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle} onClick={() => handleSort("name")}>Item{sortArrow("name")}</th>
                  <th style={thStyle} onClick={() => handleSort("category")}>Category{sortArrow("category")}</th>
                  <th style={{ ...thStyle, textAlign: "right" }} onClick={() => handleSort("quantity")}>Qty{sortArrow("quantity")}</th>
                  <th style={thStyle}>Unit</th>
                  <th style={{ ...thStyle, textAlign: "right" }} onClick={() => handleSort("minStock")}>Min{sortArrow("minStock")}</th>
                  <th style={{ ...thStyle, textAlign: "right" }} onClick={() => handleSort("unitCost")}>Unit Cost{sortArrow("unitCost")}</th>
                  <th style={{ ...thStyle, textAlign: "right" }} onClick={() => handleSort("totalValue")}>Total Value{sortArrow("totalValue")}</th>
                  <th style={thStyle} onClick={() => handleSort("status")}>Status{sortArrow("status")}</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const status = getStatus(item.quantity, item.minStock);
                  const ss = statusStyle(status);
                  const isHovered = hoveredRow === item.id;
                  return (
                    <tr
                      key={item.id}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ background: isHovered ? C.cardHover : "transparent", transition: "background 0.12s" }}
                    >
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, fontWeight: 500, fontSize: 14 }}>{item.name}</td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 13, color: C.inkSec }}>{item.category}</td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", fontFamily: F.mono, fontSize: 14, fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 13, color: C.inkMuted }}>{item.unit}</td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", fontFamily: F.mono, fontSize: 13, color: C.inkMuted }}>{item.minStock}</td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", fontFamily: F.mono, fontSize: 13 }}>£{item.unitCost.toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", fontFamily: F.mono, fontSize: 13, fontWeight: 500 }}>£{(item.quantity * item.unitCost).toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 12,
                          fontSize: 12, fontWeight: 600, background: ss.bg, color: ss.color,
                        }}>{status}</span>
                      </td>
                      <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "center", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => setAdjustItem(item)}
                          title="Adjust stock"
                          style={{
                            padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 4,
                            background: C.card, fontSize: 12, cursor: "pointer", marginRight: 4,
                            color: C.inkSec, fontFamily: F.sans,
                          }}
                        >+/-</button>
                        <button
                          onClick={() => { setEditingItem(item); setShowForm(true); }}
                          title="Edit item"
                          style={{
                            padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 4,
                            background: C.card, fontSize: 12, cursor: "pointer", marginRight: 4,
                            color: C.info, fontFamily: F.sans,
                          }}
                        >Edit</button>
                        <button
                          onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) handleDeleteItem(item.id); }}
                          title="Delete item"
                          style={{
                            padding: "5px 10px", border: `1px solid ${C.danger}33`, borderRadius: 4,
                            background: C.dangerBg, fontSize: 12, cursor: "pointer",
                            color: C.danger, fontFamily: F.sans,
                          }}
                        >Del</button>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 40, textAlign: "center", color: C.inkMuted, fontSize: 14 }}>
                      No items match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ALERTS TAB
  // ═══════════════════════════════════════════════════════════
  function renderAlerts() {
    const alertItems = [...outOfStockItems, ...lowStockItems];

    return (
      <div>
        <h2 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 22, margin: "0 0 20px", color: C.ink }}>
          Stock Alerts
        </h2>

        {alertItems.length === 0 ? (
          <div style={{
            background: C.successBg, border: `1px solid ${C.success}33`, borderRadius: 8,
            padding: 40, textAlign: "center",
          }}>
            <p style={{ fontSize: 16, color: C.success, fontWeight: 500, margin: 0 }}>All stock levels are healthy. No alerts.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {alertItems.map(item => {
              const status = getStatus(item.quantity, item.minStock);
              const ss = statusStyle(status);
              const reorderQty = item.minStock * 2 - item.quantity;
              return (
                <div key={item.id} style={{
                  background: C.card, border: `1px solid ${ss.color}33`, borderRadius: 8,
                  padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 12, borderLeft: `4px solid ${ss.color}`,
                }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: ss.bg, color: ss.color,
                      }}>{status}</span>
                    </div>
                    <span style={{ fontSize: 13, color: C.inkSec }}>{item.category}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Current</p>
                      <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 600, fontFamily: F.mono, color: ss.color }}>{item.quantity}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Minimum</p>
                      <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 600, fontFamily: F.mono, color: C.inkSec }}>{item.minStock}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Reorder</p>
                      <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 600, fontFamily: F.mono, color: C.accent }}>{reorderQty > 0 ? reorderQty : 0}</p>
                    </div>
                    <button
                      onClick={() => handleReorder(item)}
                      style={{
                        padding: "10px 20px", background: C.accent, color: "#fff", border: "none",
                        borderRadius: 6, fontFamily: F.sans, fontSize: 13, fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Reorder
                    </button>
                    <button
                      onClick={() => setAdjustItem(item)}
                      style={{
                        padding: "10px 20px", background: C.card, color: C.inkSec,
                        border: `1px solid ${C.border}`, borderRadius: 6,
                        fontFamily: F.sans, fontSize: 13, fontWeight: 500, cursor: "pointer",
                      }}
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // EVENT CALCULATOR TAB
  // ═══════════════════════════════════════════════════════════
  function renderCalculator() {
    return (
      <div>
        <h2 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 22, margin: "0 0 20px", color: C.ink }}>
          Event Stock Calculator
        </h2>

        {/* Inputs */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: 24, marginBottom: 24, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end",
        }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Event Type</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
                borderRadius: 6, fontFamily: F.sans, fontSize: 14, background: C.card, color: C.ink,
              }}
            >
              {EVENT_TYPES.map(e => <option key={e.id} value={e.id}>{e.label} ({e.drinksPerGuest} drinks/guest)</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Guest Count</label>
            <input
              type="number"
              min={1}
              max={2000}
              value={guestCount}
              onChange={e => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
                borderRadius: 6, fontFamily: F.sans, fontSize: 14, background: C.card, color: C.ink,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ padding: "10px 0" }}>
            <span style={{ fontSize: 14, color: C.inkSec }}>
              Total Drinks: <strong style={{ fontSize: 20, color: C.accent, fontFamily: F.serif }}>{eventCalculation?.totalDrinks}</strong>
            </span>
          </div>
        </div>

        {eventCalculation && (
          <>
            {/* Requirements */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: 24, marginBottom: 24,
            }}>
              <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 18, margin: "0 0 16px" }}>Estimated Requirements</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {eventCalculation.requirements.map(r => (
                  <div key={r.name} style={{
                    padding: "14px 18px", background: C.accentSubtle, borderRadius: 6,
                    border: `1px solid ${C.borderLight}`,
                  }}>
                    <p style={{ margin: 0, fontSize: 12, color: C.inkMuted }}>{r.name}</p>
                    <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 600, fontFamily: F.mono, color: C.accent }}>
                      {r.needed} <span style={{ fontSize: 12, fontWeight: 400, color: C.inkMuted }}>{r.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Check */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24,
            }}>
              <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 18, margin: "0 0 16px" }}>Stock Availability Check</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {eventCalculation.stockCheck.map(s => {
                  const sufficient = s.available >= s.needed;
                  const pct = s.needed > 0 ? Math.min(100, (s.available / s.needed) * 100) : 100;
                  return (
                    <div key={s.name} style={{
                      display: "flex", alignItems: "center", gap: 16, padding: "12px 16px",
                      background: sufficient ? C.successBg : C.dangerBg,
                      borderRadius: 6, border: `1px solid ${sufficient ? C.success : C.danger}22`,
                    }}>
                      <span style={{ flex: "0 0 160px", fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                      <div style={{ flex: 1, height: 8, background: `${sufficient ? C.success : C.danger}22`, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: sufficient ? C.success : C.danger, borderRadius: 4, transition: "width 0.3s" }} />
                      </div>
                      <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: sufficient ? C.success : C.danger, whiteSpace: "nowrap" }}>
                        {s.available} / {s.needed} {s.unit}
                      </span>
                      <span style={{
                        padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: sufficient ? C.successBg : C.dangerBg,
                        color: sufficient ? C.success : C.danger,
                        border: `1px solid ${sufficient ? C.success : C.danger}33`,
                      }}>
                        {sufficient ? "OK" : "SHORT"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MOVEMENT LOG TAB
  // ═══════════════════════════════════════════════════════════
  function renderLog() {
    const logThStyle = {
      padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600,
      color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8,
      borderBottom: `2px solid ${C.border}`,
    };

    return (
      <div>
        <h2 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 22, margin: "0 0 20px", color: C.ink }}>
          Stock Movement Log
        </h2>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={logThStyle}>Date</th>
                  <th style={logThStyle}>Item</th>
                  <th style={logThStyle}>Reason</th>
                  <th style={{ ...logThStyle, textAlign: "right" }}>Change</th>
                  <th style={{ ...logThStyle, textAlign: "right" }}>Stock After</th>
                </tr>
              </thead>
              <tbody>
                {movementLog.slice(0, 100).map(entry => {
                  const isPositive = entry.quantityChange > 0;
                  return (
                    <tr key={entry.id}>
                      <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 13, color: C.inkSec, fontFamily: F.mono }}>{entry.date}</td>
                      <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 14, fontWeight: 500 }}>{entry.itemName}</td>
                      <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 13 }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500,
                          background: entry.reason === "Purchase" || entry.reason === "Returned" ? C.successBg : C.warnBg,
                          color: entry.reason === "Purchase" || entry.reason === "Returned" ? C.success : C.warn,
                        }}>{entry.reason}</span>
                      </td>
                      <td style={{
                        padding: "10px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right",
                        fontFamily: F.mono, fontSize: 14, fontWeight: 600,
                        color: isPositive ? C.success : C.danger,
                      }}>
                        {isPositive ? "+" : ""}{entry.quantityChange}
                      </td>
                      <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "right", fontFamily: F.mono, fontSize: 13, color: C.inkSec }}>{entry.quantityAfter}</td>
                    </tr>
                  );
                })}
                {movementLog.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: "center", color: C.inkMuted, fontSize: 14 }}>
                      No stock movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {movementLog.length > 100 && (
            <div style={{ padding: 14, textAlign: "center", fontSize: 13, color: C.inkMuted, borderTop: `1px solid ${C.borderLight}` }}>
              Showing most recent 100 of {movementLog.length} entries
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ADD/EDIT FORM MODAL
  // ═══════════════════════════════════════════════════════════
  function renderFormModal() {
    return (
      <FormModal
        item={editingItem}
        onSave={handleSaveItem}
        onClose={() => { setShowForm(false); setEditingItem(null); }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STOCK ADJUSTMENT MODAL
  // ═══════════════════════════════════════════════════════════
  function renderAdjustModal() {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(24,21,15,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }} onClick={() => setAdjustItem(null)}>
        <div style={{
          background: C.card, borderRadius: 12, padding: 32, width: "100%", maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: `1px solid ${C.border}`,
        }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 20, margin: "0 0 4px" }}>
            Adjust Stock
          </h3>
          <p style={{ fontSize: 14, color: C.inkSec, margin: "0 0 20px" }}>
            {adjustItem.name} — Current: <strong>{adjustItem.quantity} {adjustItem.unit}</strong>
          </p>

          {/* Quick Buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[-10, -5, -1, 1, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setAdjustQty(prev => prev + n)}
                style={{
                  padding: "8px 16px", border: `1px solid ${n > 0 ? C.success : C.danger}33`,
                  borderRadius: 6, background: n > 0 ? C.successBg : C.dangerBg,
                  color: n > 0 ? C.success : C.danger, fontWeight: 600, fontSize: 14,
                  cursor: "pointer", fontFamily: F.mono,
                }}
              >
                {n > 0 ? "+" : ""}{n}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Quantity Change</label>
              <input
                type="number"
                value={adjustQty}
                onChange={e => setAdjustQty(parseInt(e.target.value) || 0)}
                style={{
                  width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
                  borderRadius: 6, fontFamily: F.mono, fontSize: 18, fontWeight: 600,
                  textAlign: "center", boxSizing: "border-box",
                  color: adjustQty > 0 ? C.success : adjustQty < 0 ? C.danger : C.ink,
                  background: C.card,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>New Total</label>
              <div style={{
                padding: "10px 14px", border: `1px solid ${C.borderLight}`, borderRadius: 6,
                fontFamily: F.mono, fontSize: 18, fontWeight: 600, textAlign: "center",
                background: C.bgWarm, color: C.accent,
              }}>
                {Math.max(0, adjustItem.quantity + adjustQty)}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Reason</label>
            <select
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
                borderRadius: 6, fontFamily: F.sans, fontSize: 14, background: C.card, color: C.ink,
              }}
            >
              {ADJUSTMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => { setAdjustItem(null); setAdjustQty(0); setAdjustReason("Event Usage"); }}
              style={{
                padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 6,
                background: C.card, fontFamily: F.sans, fontSize: 14, cursor: "pointer", color: C.inkSec,
              }}
            >Cancel</button>
            <button
              onClick={() => adjustQty !== 0 && handleAdjust(adjustItem.id, adjustQty, adjustReason)}
              disabled={adjustQty === 0}
              style={{
                padding: "10px 20px", border: "none", borderRadius: 6,
                background: adjustQty === 0 ? C.inkMuted : C.accent, color: "#fff",
                fontFamily: F.sans, fontSize: 14, fontWeight: 500, cursor: adjustQty === 0 ? "not-allowed" : "pointer",
              }}
            >Apply Adjustment</button>
          </div>
        </div>
      </div>
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// FORM MODAL (separated to isolate local state)
// ═══════════════════════════════════════════════════════════════
function FormModal({ item, onSave, onClose }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    id: item?.id || "",
    name: item?.name || "",
    category: item?.category || CATEGORIES[0],
    quantity: item?.quantity ?? 0,
    unit: item?.unit || "bottles",
    minStock: item?.minStock ?? 0,
    unitCost: item?.unitCost ?? 0,
  });

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      quantity: Number(form.quantity),
      minStock: Number(form.minStock),
      unitCost: Number(form.unitCost),
    });
  }, [form, onSave]);

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600, color: C.inkMuted,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
  };
  const inputStyle = {
    width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
    borderRadius: 6, fontFamily: F.sans, fontSize: 14, background: C.card,
    color: C.ink, boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(24,21,15,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: C.card, borderRadius: 12, padding: 32, width: "100%", maxWidth: 520,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: `1px solid ${C.border}`,
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 20, margin: "0 0 20px" }}>
          {isEdit ? "Edit Item" : "Add New Item"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Item Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="e.g. Hendrick's Gin"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={e => handleChange("category", e.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: "0 0 120px" }}>
              <label style={labelStyle}>Unit</label>
              <select
                value={form.unit}
                onChange={e => handleChange("unit", e.target.value)}
                style={inputStyle}
              >
                {["bottles", "litres", "pieces", "bunches", "packs", "rolls", "boxes", "sets"].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quantity</label>
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={e => handleChange("quantity", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Minimum Stock</label>
              <input
                type="number"
                min={0}
                value={form.minStock}
                onChange={e => handleChange("minStock", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Unit Cost (£)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.unitCost}
                onChange={e => handleChange("unitCost", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 6,
                background: C.card, fontFamily: F.sans, fontSize: 14, cursor: "pointer", color: C.inkSec,
              }}
            >Cancel</button>
            <button
              type="submit"
              style={{
                padding: "10px 24px", border: "none", borderRadius: 6,
                background: C.accent, color: "#fff",
                fontFamily: F.sans, fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
            >{isEdit ? "Save Changes" : "Add Item"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
