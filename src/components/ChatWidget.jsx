import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Chat Widget — Persistent Floating Chat Overlay
// Lives in bottom-right of every page. Minimizable, multi-convo,
// notification badges, and tabbed conversation support.
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
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif" };

const LS_KEY = "hht_chat_widget_v1";

// ── Team members ──
const TEAM = [
  { id: "joe", name: "Joe Stokoe", initials: "JS", role: "Director & Founder", color: "#18150F", online: true },
  { id: "alex", name: "Alex Morgan", initials: "AM", role: "Senior Bartender", color: "#2A6680", online: true },
  { id: "sam", name: "Sam Taylor", initials: "ST", role: "Events Coordinator", color: "#2B7A4B", online: false },
  { id: "jordan", name: "Jordan Lee", initials: "JL", role: "Bar Manager", color: "#956018", online: true },
  { id: "pat", name: "Pat Quinn", initials: "PQ", role: "Business Development", color: "#5B4A9E", online: false },
  { id: "robin", name: "Robin James", initials: "RJ", role: "Stock Manager", color: "#9B3535", online: true },
  { id: "casey", name: "Casey Smith", initials: "CS", role: "Bartender", color: "#7D5A1A", online: false },
  { id: "jamie", name: "Jamie Brown", initials: "JB", role: "Bartender", color: "#4A7D6B", online: false },
];

// ── Default channels ──
const DEFAULT_CHANNELS = [
  { id: "general", name: "general", icon: "#", description: "Company-wide announcements", isChannel: true },
  { id: "events", name: "events", icon: "#", description: "Event planning & coordination", isChannel: true },
  { id: "recipes", name: "recipes", icon: "#", description: "Recipes & drink development", isChannel: true },
  { id: "business-dev", name: "business-dev", icon: "#", description: "New leads & partnerships", isChannel: true },
  { id: "stock-equipment", name: "stock-equipment", icon: "#", description: "Inventory & equipment", isChannel: true },
  { id: "diageo-masterclass", name: "diageo-masterclass", icon: "◈", description: "Diageo event — 15 Mar", isChannel: true },
  { id: "pernod-summer", name: "pernod-summer-party", icon: "◈", description: "Pernod Ricard — 20 Jun", isChannel: true },
];

// ── Demo messages per channel ──
const DEFAULT_MESSAGES = {
  general: [
    { id: "wm-1", channelId: "general", userId: "joe", text: "Morning everyone. Quick reminder — team sync at 10am today.", timestamp: "2025-03-05T08:30:00Z" },
    { id: "wm-2", channelId: "general", userId: "alex", text: "On it. Will dial in from the warehouse — doing stock check this morning.", timestamp: "2025-03-05T08:35:00Z" },
    { id: "wm-3", channelId: "general", userId: "pat", text: "Good news — Campari meeting confirmed for Tuesday. Pitch deck is in the Library.", timestamp: "2025-03-05T08:42:00Z" },
    { id: "wm-4", channelId: "general", userId: "robin", text: "Heads up: two Boston shakers need replacing before Diageo. Ordering today.", timestamp: "2025-03-05T09:00:00Z" },
  ],
  events: [
    { id: "wm-5", channelId: "events", userId: "sam", text: "Sketch confirmed Lecture Room for Moët dinner — 18 May. Floor plan needed by 1 May.", timestamp: "2025-03-04T11:30:00Z" },
    { id: "wm-6", channelId: "events", userId: "joe", text: "@alex can you start thinking about the cocktail pairings? Champagne-forward menu, 5 courses.", timestamp: "2025-03-04T11:45:00Z" },
    { id: "wm-7", channelId: "events", userId: "alex", text: "Already on it. French 75 welcome, then Bellini / Champagne Cobbler / Kir Royale / Champagne Julep. Spec by Friday.", timestamp: "2025-03-04T12:00:00Z" },
  ],
  recipes: [
    { id: "wm-8", channelId: "recipes", userId: "alex", text: "New Espresso Martini variant — cold brew base with cardamom-vanilla syrup. Smoother, less bitter.", timestamp: "2025-03-03T16:00:00Z" },
    { id: "wm-9", channelId: "recipes", userId: "jordan", text: "How's the crema? Cold brew usually gives less foam.", timestamp: "2025-03-03T16:10:00Z" },
    { id: "wm-10", channelId: "recipes", userId: "alex", text: "Quick shake with aquafaba to compensate. Works a treat. Bringing samples tomorrow.", timestamp: "2025-03-03T16:15:00Z" },
  ],
  "business-dev": [
    { id: "wm-11", channelId: "business-dev", userId: "pat", text: "Pernod Ricard summer party budget approved at £28K! Cocktail menu by mid-April, site visit end of March.", timestamp: "2025-02-28T14:00:00Z" },
    { id: "wm-12", channelId: "business-dev", userId: "joe", text: "Excellent work Pat. That's our biggest event this year.", timestamp: "2025-02-28T14:10:00Z" },
  ],
  "stock-equipment": [
    { id: "wm-13", channelId: "stock-equipment", userId: "robin", text: "Post-event inventory done. Missing: 2x Boston shakers (dented), 1x Hawthorne strainer.", timestamp: "2025-03-01T09:30:00Z" },
    { id: "wm-14", channelId: "stock-equipment", userId: "alex", text: "Add fee brothers orange bitters too. Need them for Diageo Old Fashioneds.", timestamp: "2025-03-01T10:15:00Z" },
  ],
  "diageo-masterclass": [
    { id: "wm-15", channelId: "diageo-masterclass", userId: "joe", text: "Diageo confirmed 38/40 guests. Welcome cocktail: Smoked Old Fashioned with new Talisker.", timestamp: "2025-03-05T10:30:00Z" },
    { id: "wm-16", channelId: "diageo-masterclass", userId: "alex", text: "Perfect. I'll prep the smoking kit. What garnish — orange peel or cherry?", timestamp: "2025-03-05T10:45:00Z" },
    { id: "wm-17", channelId: "diageo-masterclass", userId: "joe", text: "Dehydrated orange wheel with rosemary sprig. Premium look for this crowd.", timestamp: "2025-03-05T10:50:00Z" },
  ],
  "pernod-summer": [
    { id: "wm-18", channelId: "pernod-summer", userId: "sam", text: "Tobacco Dock site visit options: w/c 24 March. What day works?", timestamp: "2025-03-04T15:00:00Z" },
    { id: "wm-19", channelId: "pernod-summer", userId: "pat", text: "Wednesday is clear. I'll coordinate with Emma at Pernod Ricard.", timestamp: "2025-03-04T15:20:00Z" },
  ],
  // DM conversations
  "dm-alex": [
    { id: "dm-1", channelId: "dm-alex", userId: "alex", text: "Hey Joe, quick question — should I order the Talisker 10 or the Storm for the Diageo event?", timestamp: "2025-03-05T11:00:00Z" },
    { id: "dm-2", channelId: "dm-alex", userId: "joe", text: "Storm — it's the new expression they want to showcase. Sarah confirmed.", timestamp: "2025-03-05T11:05:00Z" },
    { id: "dm-3", channelId: "dm-alex", userId: "alex", text: "Perfect, ordering now. Also got 3 bottles of Lagavulin 16 for the tasting flight.", timestamp: "2025-03-05T11:08:00Z" },
  ],
  "dm-pat": [
    { id: "dm-4", channelId: "dm-pat", userId: "pat", text: "Joe, that luxury car brand enquiry — they want to do something at Goodwood. September. Could be huge.", timestamp: "2025-03-04T16:00:00Z" },
    { id: "dm-5", channelId: "dm-pat", userId: "joe", text: "Brilliant. Set up the intro call and let's prepare a mini pitch deck. What's the brand?", timestamp: "2025-03-04T16:10:00Z" },
    { id: "dm-6", channelId: "dm-pat", userId: "pat", text: "Can't say yet — NDA. But think top-tier German. Call is Thursday 2pm.", timestamp: "2025-03-04T16:15:00Z" },
  ],
};

// DM "channels"
const DM_CONTACTS = [
  { id: "dm-alex", name: "Alex Morgan", memberId: "alex", isChannel: false },
  { id: "dm-pat", name: "Pat Quinn", memberId: "pat", isChannel: false },
];

function generateId() {
  return "wm-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const QUICK_REACTIONS = ["👍", "🔥", "✅", "🍸"];

// ══════════════════════════════════════════════════════════════
// CHAT WIDGET
// ══════════════════════════════════════════════════════════════

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // full-size mode
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [openConversations, setOpenConversations] = useState([]); // array of channel/DM ids currently open as tabs
  const [activeTab, setActiveTab] = useState(null); // currently focused tab
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  const [showDmPicker, setShowDmPicker] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({}); // channelId -> count
  const [lastReadTimestamps, setLastReadTimestamps] = useState({});
  const [searchChannels, setSearchChannels] = useState("");
  const messagesEndRef = useRef(null);
  const currentUser = "joe";

  // Load persisted data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.openConversations) setOpenConversations(parsed.openConversations);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.lastReadTimestamps) setLastReadTimestamps(parsed.lastReadTimestamps);
      }
    } catch { /* use defaults */ }
  }, []);

  const persist = useCallback((msgs, openConvos, active, lastRead) => {
    localStorage.setItem(LS_KEY, JSON.stringify({
      messages: msgs,
      openConversations: openConvos,
      activeTab: active,
      lastReadTimestamps: lastRead,
    }));
  }, []);

  // Calculate unread counts
  useEffect(() => {
    const counts = {};
    const allChannels = [...DEFAULT_CHANNELS, ...DM_CONTACTS];
    allChannels.forEach(ch => {
      const channelMsgs = messages[ch.id] || [];
      const lastRead = lastReadTimestamps[ch.id] || "1970-01-01T00:00:00Z";
      const unread = channelMsgs.filter(m => m.userId !== currentUser && m.timestamp > lastRead).length;
      if (unread > 0) counts[ch.id] = unread;
    });
    setUnreadCounts(counts);
  }, [messages, lastReadTimestamps, currentUser]);

  // Scroll to bottom when tab or messages change
  useEffect(() => {
    if (isOpen && activeTab) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [activeTab, messages, isOpen]);

  // Mark channel as read when viewing it
  useEffect(() => {
    if (isOpen && activeTab) {
      const channelMsgs = messages[activeTab] || [];
      const lastMsg = channelMsgs[channelMsgs.length - 1];
      if (lastMsg) {
        setLastReadTimestamps(prev => {
          const updated = { ...prev, [activeTab]: lastMsg.timestamp };
          persist(messages, openConversations, activeTab, updated);
          return updated;
        });
      }
    }
  }, [isOpen, activeTab, messages, openConversations, persist]);

  // Simulate incoming messages for demo
  useEffect(() => {
    const demoMessages = [
      { delay: 45000, channelId: "general", userId: "sam", text: "Just confirmed Easter weekend freelancers — Maria and Dan are both in." },
      { delay: 90000, channelId: "diageo-masterclass", userId: "alex", text: "Smoking kit prepped. Also made a test batch of the Talisker Storm Old Fashioned — it's incredible." },
      { delay: 150000, channelId: "dm-alex", userId: "alex", text: "Joe, do we want the smoking cloche or the handheld smoker for Diageo? Cloche is more theatrical." },
    ];

    const timers = demoMessages.map(dm =>
      setTimeout(() => {
        setMessages(prev => {
          const channelMsgs = prev[dm.channelId] || [];
          const newMsg = { id: generateId(), channelId: dm.channelId, userId: dm.userId, text: dm.text, timestamp: new Date().toISOString() };
          const updated = { ...prev, [dm.channelId]: [...channelMsgs, newMsg] };
          return updated;
        });
      }, dm.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const totalUnread = Object.values(unreadCounts).reduce((s, c) => s + c, 0);

  const openConversation = useCallback((channelId) => {
    setOpenConversations(prev => {
      const updated = prev.includes(channelId) ? prev : [...prev, channelId];
      setActiveTab(channelId);
      persist(messages, updated, channelId, lastReadTimestamps);
      return updated;
    });
    setShowChannelPicker(false);
    setShowDmPicker(false);
    setSearchChannels("");
  }, [messages, lastReadTimestamps, persist]);

  const closeConversation = useCallback((channelId, e) => {
    if (e) e.stopPropagation();
    setOpenConversations(prev => {
      const updated = prev.filter(id => id !== channelId);
      const newActive = activeTab === channelId ? (updated[updated.length - 1] || null) : activeTab;
      setActiveTab(newActive);
      persist(messages, updated, newActive, lastReadTimestamps);
      return updated;
    });
  }, [activeTab, messages, lastReadTimestamps, persist]);

  const sendMessage = useCallback(() => {
    if (!messageText.trim() || !activeTab) return;
    const newMsg = {
      id: generateId(),
      channelId: activeTab,
      userId: currentUser,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => {
      const updated = { ...prev, [activeTab]: [...(prev[activeTab] || []), newMsg] };
      persist(updated, openConversations, activeTab, lastReadTimestamps);
      return updated;
    });
    setMessageText("");
  }, [messageText, activeTab, openConversations, lastReadTimestamps, persist, currentUser]);

  const getChannelInfo = useCallback((channelId) => {
    const channel = DEFAULT_CHANNELS.find(c => c.id === channelId);
    if (channel) return { ...channel, displayName: `# ${channel.name}` };
    const dm = DM_CONTACTS.find(d => d.id === channelId);
    if (dm) {
      const member = TEAM.find(t => t.id === dm.memberId);
      return { ...dm, displayName: dm.name, member };
    }
    return { id: channelId, displayName: channelId, isChannel: true };
  }, []);

  const filteredChannels = useMemo(() => {
    const q = searchChannels.toLowerCase();
    return DEFAULT_CHANNELS.filter(c => !q || c.name.includes(q) || c.description?.toLowerCase().includes(q));
  }, [searchChannels]);

  const filteredDms = useMemo(() => {
    const q = searchChannels.toLowerCase();
    return TEAM.filter(t => t.id !== currentUser && (!q || t.name.toLowerCase().includes(q)));
  }, [searchChannels, currentUser]);

  const activeMessages = activeTab ? (messages[activeTab] || []) : [];
  const activeChannelInfo = activeTab ? getChannelInfo(activeTab) : null;

  // Widget dimensions
  const widgetWidth = isExpanded ? 520 : 380;
  const widgetHeight = isExpanded ? 560 : 440;

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, fontFamily: F.sans }}>

      {/* ── Floating button (minimized state) ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 52, height: 52, borderRadius: "50%", background: C.ink, color: "#fff",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "transform 0.15s, box-shadow 0.15s",
            position: "relative",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}
        >
          💬
          {totalUnread > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10,
              background: C.danger, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex",
              alignItems: "center", justifyContent: "center", padding: "0 5px",
              border: "2px solid #fff", animation: "pulse 2s infinite",
            }}>
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat panel (open state) ── */}
      {isOpen && (
        <div style={{
          width: widgetWidth, height: widgetHeight, background: C.card, borderRadius: 14,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)",
          border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden",
          transition: "width 0.2s, height 0.2s",
        }}>

          {/* Header */}
          <div style={{
            padding: "10px 14px", background: C.ink, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Team Chat</span>
              {totalUnread > 0 && (
                <span style={{ background: C.danger, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8, minWidth: 16, textAlign: "center" }}>
                  {totalUnread}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setIsExpanded(!isExpanded)} style={{ border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", width: 26, height: 26, borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }} title={isExpanded ? "Compact" : "Expand"}>
                {isExpanded ? "▾" : "▴"}
              </button>
              <button onClick={() => setIsOpen(false)} style={{ border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", width: 26, height: 26, borderRadius: 6, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }} title="Minimize">
                ─
              </button>
            </div>
          </div>

          {/* Conversation tabs */}
          {openConversations.length > 0 && (
            <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${C.borderLight}`, background: C.bg, flexShrink: 0 }}>
              {openConversations.map(convId => {
                const info = getChannelInfo(convId);
                const isActive = activeTab === convId;
                const unread = unreadCounts[convId] || 0;
                return (
                  <button
                    key={convId}
                    onClick={() => setActiveTab(convId)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "none",
                      borderBottom: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
                      background: isActive ? C.card : "transparent", cursor: "pointer", fontSize: 11,
                      fontWeight: isActive ? 600 : 400, color: isActive ? C.accent : C.inkSec,
                      fontFamily: F.sans, whiteSpace: "nowrap", flexShrink: 0, position: "relative",
                      transition: "all 0.1s",
                    }}
                  >
                    {info.isChannel ? (
                      <span style={{ color: C.inkMuted, fontSize: 10 }}>{info.icon || "#"}</span>
                    ) : (
                      <span style={{ width: 14, height: 14, borderRadius: "50%", background: info.member?.color || C.inkMuted, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                        {info.member?.initials || "?"}
                      </span>
                    )}
                    <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {info.isChannel ? info.name : info.displayName?.split(" ")[0]}
                    </span>
                    {unread > 0 && (
                      <span style={{ background: C.danger, color: "#fff", fontSize: 8, fontWeight: 700, padding: "0 4px", borderRadius: 6, minWidth: 12, textAlign: "center" }}>
                        {unread}
                      </span>
                    )}
                    <span
                      onClick={(e) => closeConversation(convId, e)}
                      style={{ fontSize: 10, color: C.inkMuted, marginLeft: 2, padding: "0 2px", borderRadius: 3, cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.borderLight; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      ✕
                    </span>
                  </button>
                );
              })}
              {/* New conversation button */}
              <button
                onClick={() => setShowChannelPicker(true)}
                style={{ padding: "6px 10px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: C.inkMuted, flexShrink: 0 }}
                title="Open conversation"
              >
                +
              </button>
            </div>
          )}

          {/* Main content area */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>

            {/* No conversations open — show channel picker */}
            {openConversations.length === 0 || !activeTab ? (
              <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Open a conversation</div>

                <input
                  type="text"
                  placeholder="Search channels or people..."
                  value={searchChannels}
                  onChange={e => setSearchChannels(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%", marginBottom: 10, boxSizing: "border-box" }}
                />

                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, marginTop: 4 }}>Channels</div>
                {filteredChannels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => openConversation(ch.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontFamily: F.sans, background: "transparent", color: C.inkSec, transition: "background 0.1s", marginBottom: 1, textAlign: "left" }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.bgWarm; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span><span style={{ color: C.inkMuted, marginRight: 4 }}>{ch.icon}</span> {ch.name}</span>
                    {unreadCounts[ch.id] > 0 && (
                      <span style={{ background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>{unreadCounts[ch.id]}</span>
                    )}
                  </button>
                ))}

                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, marginTop: 10 }}>Direct Messages</div>
                {filteredDms.map(member => {
                  const dmId = `dm-${member.id}`;
                  return (
                    <button
                      key={member.id}
                      onClick={() => openConversation(dmId)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontFamily: F.sans, background: "transparent", color: C.inkSec, transition: "background 0.1s", marginBottom: 1, textAlign: "left" }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.bgWarm; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ position: "relative", display: "inline-flex" }}>
                          <span style={{ width: 20, height: 20, borderRadius: "50%", background: member.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700 }}>{member.initials}</span>
                          <span style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: member.online ? C.success : C.inkMuted, border: "1.5px solid #fff" }}></span>
                        </span>
                        {member.name}
                      </span>
                      {unreadCounts[dmId] > 0 && (
                        <span style={{ background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>{unreadCounts[dmId]}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                {/* Channel/DM header */}
                <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {activeChannelInfo?.isChannel ? (
                      <>
                        <span style={{ color: C.inkMuted, fontSize: 12 }}>{activeChannelInfo.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{activeChannelInfo.name}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: activeChannelInfo?.member?.color || C.inkMuted, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700 }}>
                          {activeChannelInfo?.member?.initials || "?"}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{activeChannelInfo?.displayName}</span>
                        {activeChannelInfo?.member?.online && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success }}></span>}
                      </>
                    )}
                  </div>
                  {activeChannelInfo?.description && (
                    <span style={{ fontSize: 10, color: C.inkMuted, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeChannelInfo.description}</span>
                  )}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px" }}>
                  {activeMessages.length === 0 && (
                    <div style={{ textAlign: "center", color: C.inkMuted, padding: 20 }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>💬</div>
                      <div style={{ fontSize: 12 }}>No messages yet. Start the conversation!</div>
                    </div>
                  )}
                  {activeMessages.map(msg => {
                    const user = TEAM.find(t => t.id === msg.userId);
                    if (!user) return null;
                    const isMe = msg.userId === currentUser;
                    return (
                      <div key={msg.id} style={{ display: "flex", gap: 8, marginBottom: 10, flexDirection: isMe ? "row-reverse" : "row" }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: user.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                          {user.initials}
                        </div>
                        <div style={{ maxWidth: "75%" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2, flexDirection: isMe ? "row-reverse" : "row" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.ink }}>{isMe ? "You" : user.name.split(" ")[0]}</span>
                            <span style={{ fontSize: 9, color: C.inkMuted }}>{formatTime(msg.timestamp)}</span>
                          </div>
                          <div style={{
                            fontSize: 12.5, lineHeight: 1.5, color: C.ink, whiteSpace: "pre-wrap",
                            background: isMe ? C.accentSubtle : C.bgWarm, padding: "6px 10px", borderRadius: 8,
                            borderTopLeftRadius: isMe ? 8 : 2, borderTopRightRadius: isMe ? 2 : 8,
                          }}>
                            {msg.text.split(/(@\w+)/g).map((part, pi) =>
                              part.startsWith("@") ? <span key={pi} style={{ color: C.accent, fontWeight: 600 }}>{part}</span> : part
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.borderLight}`, display: "flex", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                  <textarea
                    placeholder={activeChannelInfo?.isChannel ? `Message #${activeChannelInfo.name}...` : `Message ${activeChannelInfo?.displayName?.split(" ")[0]}...`}
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%", resize: "none", height: 34, lineHeight: "22px", boxSizing: "border-box" }}
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      border: "none", background: messageText.trim() ? C.accent : C.borderLight,
                      color: messageText.trim() ? "#fff" : C.inkMuted, width: 34, height: 34,
                      borderRadius: 6, cursor: messageText.trim() ? "pointer" : "default",
                      fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "background 0.15s",
                    }}
                  >
                    ↗
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Channel picker overlay ── */}
          {showChannelPicker && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }} onClick={() => { setShowChannelPicker(false); setSearchChannels(""); }}>
              <div style={{ background: C.card, borderRadius: 10, padding: 14, width: widgetWidth - 40, maxHeight: widgetHeight - 60, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Open Conversation</div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchChannels}
                  onChange={e => setSearchChannels(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%", marginBottom: 8, boxSizing: "border-box" }}
                  autoFocus
                />
                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Channels</div>
                {filteredChannels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => openConversation(ch.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 8px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontFamily: F.sans, background: "transparent", color: C.inkSec, textAlign: "left", marginBottom: 1 }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.bgWarm; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span>{ch.icon} {ch.name}</span>
                    {unreadCounts[ch.id] > 0 && <span style={{ background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>{unreadCounts[ch.id]}</span>}
                  </button>
                ))}
                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, marginTop: 8 }}>Direct Messages</div>
                {filteredDms.map(member => {
                  const dmId = `dm-${member.id}`;
                  return (
                    <button
                      key={member.id}
                      onClick={() => openConversation(dmId)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 8px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontFamily: F.sans, background: "transparent", color: C.inkSec, textAlign: "left", marginBottom: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.bgWarm; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: member.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700 }}>{member.initials}</span>
                        {member.name}
                        {member.online && <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.success }}></span>}
                      </span>
                      {unreadCounts[dmId] > 0 && <span style={{ background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>{unreadCounts[dmId]}</span>}
                    </button>
                  );
                })}
                <button onClick={() => { setShowChannelPicker(false); setSearchChannels(""); }} style={{ width: "100%", padding: "6px", border: "none", background: "transparent", cursor: "pointer", fontSize: 11, color: C.inkMuted, marginTop: 6 }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pulse animation for notification badge */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
