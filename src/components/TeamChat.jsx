import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Team Chat — Slack-style Internal Messaging
// Channels for projects, DMs, and real-time coordination
// Built for seamless in-app team communication
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
  return base;
};
const inputStyle = { padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: F.sans, background: C.card, color: C.ink, outline: "none", width: "100%" };

const LS_KEY = "hht_chat_v1";

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
  { id: "general", name: "general", icon: "#", description: "Company-wide announcements and general chat", members: TEAM.map(t => t.id), pinned: true },
  { id: "events", name: "events", icon: "#", description: "Event planning, coordination, and live updates", members: TEAM.map(t => t.id), pinned: true },
  { id: "recipes", name: "recipes", icon: "#", description: "New recipes, drink development, and menu ideas", members: ["joe", "alex", "jordan", "casey", "jamie"], pinned: false },
  { id: "business-dev", name: "business-dev", icon: "#", description: "New leads, pitches, and partnership opportunities", members: ["joe", "pat", "sam"], pinned: false },
  { id: "stock-equipment", name: "stock-equipment", icon: "#", description: "Inventory updates, orders, and equipment issues", members: ["joe", "robin", "alex", "jordan"], pinned: false },
  { id: "diageo-masterclass", name: "diageo-masterclass", icon: "◈", description: "Diageo Whisky Masterclass — 15 March", members: ["joe", "alex"], pinned: false },
  { id: "pernod-summer", name: "pernod-summer-party", icon: "◈", description: "Pernod Ricard Summer Party — 20 June", members: ["joe", "sam", "jordan", "pat"], pinned: false },
];

// ── Demo messages ──
const DEFAULT_MESSAGES = {
  general: [
    { id: "msg-1", channelId: "general", userId: "joe", text: "Morning everyone. Quick reminder — team sync at 10am today. We've got a packed March ahead.", timestamp: "2025-03-05T08:30:00Z", reactions: [{ emoji: "👍", users: ["alex", "sam", "jordan"] }] },
    { id: "msg-2", channelId: "general", userId: "alex", text: "On it. Will dial in from the warehouse — doing stock check this morning.", timestamp: "2025-03-05T08:35:00Z", reactions: [] },
    { id: "msg-3", channelId: "general", userId: "pat", text: "Good news — Campari meeting confirmed for Tuesday. Pitch deck is in the Library if anyone wants to review.", timestamp: "2025-03-05T08:42:00Z", reactions: [{ emoji: "🎉", users: ["joe", "sam"] }, { emoji: "🍸", users: ["alex", "jordan"] }] },
    { id: "msg-4", channelId: "general", userId: "robin", text: "Heads up: two Boston shakers need replacing before Diageo. Ordering today.", timestamp: "2025-03-05T09:00:00Z", reactions: [{ emoji: "👍", users: ["joe"] }] },
    { id: "msg-5", channelId: "general", userId: "joe", text: "Thanks Robin — good catch. Let's make sure all kit is sorted by Wednesday.", timestamp: "2025-03-05T09:05:00Z", reactions: [] },
  ],
  events: [
    { id: "msg-6", channelId: "events", userId: "sam", text: "Sketch have confirmed the Lecture Room for the Moët dinner on 18 May. Access from 14:00, event 19:00–23:00. Floor plan needed by 1 May.", timestamp: "2025-03-04T11:30:00Z", reactions: [{ emoji: "✅", users: ["joe"] }] },
    { id: "msg-7", channelId: "events", userId: "joe", text: "Brilliant. @alex can you start thinking about the cocktail pairings? Champagne-forward menu, 5 courses.", timestamp: "2025-03-04T11:45:00Z", reactions: [] },
    { id: "msg-8", channelId: "events", userId: "alex", text: "Already on it. Thinking: French 75 welcome, then Bellini / Champagne Cobbler / Kir Royale / Champagne Julep through the courses. Will have full spec by Friday.", timestamp: "2025-03-04T12:00:00Z", reactions: [{ emoji: "🥂", users: ["joe", "sam", "jordan"] }] },
    { id: "msg-9", channelId: "events", userId: "sam", text: "Easter weekend staffing update: full team Saturday, but we're thin on Sunday. Need 2 freelancers if Sketch confirms. @joe shall I reach out to our contacts?", timestamp: "2025-03-04T14:30:00Z", reactions: [] },
    { id: "msg-10", channelId: "events", userId: "joe", text: "Yes please — contact Maria and Dan, they were great last time.", timestamp: "2025-03-04T14:35:00Z", reactions: [{ emoji: "👍", users: ["sam"] }] },
  ],
  recipes: [
    { id: "msg-11", channelId: "recipes", userId: "alex", text: "Been experimenting with a new Espresso Martini variant — cold brew base instead of freshly pulled, with a cardamom-vanilla syrup. Smoother, less bitter. Thoughts?", timestamp: "2025-03-03T16:00:00Z", reactions: [{ emoji: "🤔", users: ["jordan"] }, { emoji: "👀", users: ["joe", "casey"] }] },
    { id: "msg-12", channelId: "recipes", userId: "jordan", text: "Interesting. How's the crema on top? Cold brew usually gives less foam.", timestamp: "2025-03-03T16:10:00Z", reactions: [] },
    { id: "msg-13", channelId: "recipes", userId: "alex", text: "Good point — I'm doing a quick shake with aquafaba to compensate. Works a treat. Will bring samples tomorrow.", timestamp: "2025-03-03T16:15:00Z", reactions: [{ emoji: "🔥", users: ["joe", "jordan", "casey", "jamie"] }] },
    { id: "msg-14", channelId: "recipes", userId: "joe", text: "Love this. If it's as good as it sounds, could be our signature for the summer menus. Make sure you log the spec in the Library.", timestamp: "2025-03-03T16:30:00Z", reactions: [{ emoji: "👍", users: ["alex"] }] },
  ],
  "business-dev": [
    { id: "msg-15", channelId: "business-dev", userId: "pat", text: "Just had a call with Pernod Ricard — summer party budget approved at £28K. They want cocktail menu by mid-April and a site visit at Tobacco Dock end of March.", timestamp: "2025-02-28T14:00:00Z", reactions: [{ emoji: "🎉", users: ["joe", "sam"] }] },
    { id: "msg-16", channelId: "business-dev", userId: "joe", text: "Excellent work Pat. That's our biggest event this year. Let's make sure we over-deliver.", timestamp: "2025-02-28T14:10:00Z", reactions: [] },
    { id: "msg-17", channelId: "business-dev", userId: "pat", text: "Also got a speculative enquiry from a luxury car brand for a launch event in September. Early days but could be £40K+. Setting up an intro call next week.", timestamp: "2025-03-04T10:00:00Z", reactions: [{ emoji: "👀", users: ["joe"] }, { emoji: "🚗", users: ["sam"] }] },
  ],
  "stock-equipment": [
    { id: "msg-18", channelId: "stock-equipment", userId: "robin", text: "Post-event inventory done. Missing: 2x Boston shakers (dented), 1x Hawthorne strainer (spring gone). Flagged in Inventory Manager.", timestamp: "2025-03-01T09:30:00Z", reactions: [] },
    { id: "msg-19", channelId: "stock-equipment", userId: "joe", text: "Order replacements from our usual supplier. Need them before the 15th.", timestamp: "2025-03-01T09:45:00Z", reactions: [{ emoji: "👍", users: ["robin"] }] },
    { id: "msg-20", channelId: "stock-equipment", userId: "robin", text: "Done. Also — we're running low on Angostura bitters and Luxardo maraschino. Shall I add to the next spirits order?", timestamp: "2025-03-01T10:00:00Z", reactions: [] },
    { id: "msg-21", channelId: "stock-equipment", userId: "alex", text: "Yes please, and add fee brothers orange bitters too. We'll need them for the Diageo Old Fashioneds.", timestamp: "2025-03-01T10:15:00Z", reactions: [{ emoji: "✅", users: ["robin"] }] },
  ],
  "diageo-masterclass": [
    { id: "msg-22", channelId: "diageo-masterclass", userId: "joe", text: "Diageo confirmed 38/40 guests. Sarah Jenkins sent the final list — it's in email. Welcome cocktail: going with Smoked Old Fashioned using the new Talisker.", timestamp: "2025-03-05T10:30:00Z", reactions: [{ emoji: "🥃", users: ["alex"] }] },
    { id: "msg-23", channelId: "diageo-masterclass", userId: "alex", text: "Perfect. I'll prep the smoking kit and get the Talisker measured out. What garnish — orange peel or cherry?", timestamp: "2025-03-05T10:45:00Z", reactions: [] },
    { id: "msg-24", channelId: "diageo-masterclass", userId: "joe", text: "Dehydrated orange wheel with a rosemary sprig. Premium look for this crowd.", timestamp: "2025-03-05T10:50:00Z", reactions: [{ emoji: "🔥", users: ["alex"] }] },
  ],
  "pernod-summer": [
    { id: "msg-25", channelId: "pernod-summer", userId: "sam", text: "Tobacco Dock site visit options: w/c 24 March. What day works for everyone?", timestamp: "2025-03-04T15:00:00Z", reactions: [] },
    { id: "msg-26", channelId: "pernod-summer", userId: "joe", text: "Tuesday or Wednesday work for me. @pat?", timestamp: "2025-03-04T15:10:00Z", reactions: [] },
    { id: "msg-27", channelId: "pernod-summer", userId: "pat", text: "Wednesday is clear. I'll coordinate with Emma at Pernod Ricard.", timestamp: "2025-03-04T15:20:00Z", reactions: [{ emoji: "👍", users: ["joe", "sam"] }] },
  ],
};

function generateId() {
  return "msg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

// ══════════════════════════════════════════════════════════════
// TEAM CHAT COMPONENT
// ══════════════════════════════════════════════════════════════

export default function TeamChat() {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageText, setMessageText] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelForm, setNewChannelForm] = useState({ name: "", description: "", isProject: false });
  const [showMembers, setShowMembers] = useState(false);
  const [searchChannels, setSearchChannels] = useState("");
  const messagesEndRef = useRef(null);
  const currentUser = "joe"; // logged-in user

  // Load persisted data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channels) setChannels(parsed.channels);
        if (parsed.messages) setMessages(parsed.messages);
      }
    } catch { /* use defaults */ }
  }, []);

  const persist = useCallback((ch, msgs) => {
    localStorage.setItem(LS_KEY, JSON.stringify({ channels: ch, messages: msgs }));
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel, messages]);

  const sendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    const newMsg = {
      id: generateId(),
      channelId: activeChannel,
      userId: currentUser,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      reactions: [],
    };
    const updated = { ...messages, [activeChannel]: [...(messages[activeChannel] || []), newMsg] };
    setMessages(updated);
    persist(channels, updated);
    setMessageText("");
  }, [messageText, activeChannel, messages, channels, persist]);

  const addReaction = useCallback((msgId, emoji) => {
    const channelMsgs = messages[activeChannel] || [];
    const updatedMsgs = channelMsgs.map(msg => {
      if (msg.id !== msgId) return msg;
      const existing = msg.reactions.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.users.includes(currentUser)) {
          const filtered = existing.users.filter(u => u !== currentUser);
          return { ...msg, reactions: filtered.length > 0 ? msg.reactions.map(r => r.emoji === emoji ? { ...r, users: filtered } : r) : msg.reactions.filter(r => r.emoji !== emoji) };
        }
        return { ...msg, reactions: msg.reactions.map(r => r.emoji === emoji ? { ...r, users: [...r.users, currentUser] } : r) };
      }
      return { ...msg, reactions: [...msg.reactions, { emoji, users: [currentUser] }] };
    });
    const updated = { ...messages, [activeChannel]: updatedMsgs };
    setMessages(updated);
    persist(channels, updated);
  }, [activeChannel, messages, channels, persist, currentUser]);

  const createChannel = useCallback(() => {
    if (!newChannelForm.name.trim()) return;
    const slug = newChannelForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (channels.find(c => c.id === slug)) return;
    const newCh = {
      id: slug,
      name: slug,
      icon: newChannelForm.isProject ? "◈" : "#",
      description: newChannelForm.description.trim(),
      members: [currentUser],
      pinned: false,
    };
    const updated = [...channels, newCh];
    setChannels(updated);
    setMessages(prev => ({ ...prev, [slug]: [] }));
    persist(updated, { ...messages, [slug]: [] });
    setActiveChannel(slug);
    setNewChannelForm({ name: "", description: "", isProject: false });
    setShowNewChannel(false);
  }, [newChannelForm, channels, messages, persist, currentUser]);

  const activeChannelData = channels.find(c => c.id === activeChannel);
  const channelMessages = messages[activeChannel] || [];
  const onlineCount = TEAM.filter(t => t.online).length;

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = "";
    channelMessages.forEach(msg => {
      const date = formatDate(msg.timestamp);
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ type: "date", date });
      }
      groups.push({ type: "message", ...msg });
    });
    return groups;
  }, [channelMessages]);

  const filteredChannels = useMemo(() => {
    if (!searchChannels) return channels;
    const q = searchChannels.toLowerCase();
    return channels.filter(c => c.name.includes(q) || c.description?.toLowerCase().includes(q));
  }, [channels, searchChannels]);

  const pinnedChannels = filteredChannels.filter(c => c.pinned);
  const projectChannels = filteredChannels.filter(c => !c.pinned && c.icon === "◈");
  const regularChannels = filteredChannels.filter(c => !c.pinned && c.icon !== "◈");

  const QUICK_REACTIONS = ["👍", "🎉", "🔥", "❤️", "🍸", "✅"];

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div style={{ height: "calc(100vh - 48px)", display: "flex", flexDirection: "column", padding: "0" }}>
      {/* Main chat layout */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", flex: 1, minHeight: 0, background: C.card, borderRadius: 0, overflow: "hidden" }}>

        {/* Channel sidebar */}
        <div style={{ borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", background: C.bg }}>
          {/* Sidebar header */}
          <div style={{ padding: "16px 14px 10px", borderBottom: `1px solid ${C.borderLight}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: F.serif }}>Team Chat</span>
              <button onClick={() => setShowNewChannel(true)} style={{ border: "none", background: C.ink, color: "#fff", width: 24, height: 24, borderRadius: 6, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
            <input
              type="text"
              placeholder="Search channels..."
              value={searchChannels}
              onChange={e => setSearchChannels(e.target.value)}
              style={{ ...inputStyle, fontSize: 12, padding: "6px 10px" }}
            />
          </div>

          {/* Channel list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {pinnedChannels.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, padding: "6px 8px 4px" }}>Pinned</div>
                {pinnedChannels.map(ch => (
                  <ChannelButton key={ch.id} channel={ch} active={activeChannel === ch.id} onClick={() => setActiveChannel(ch.id)} msgCount={(messages[ch.id] || []).length} />
                ))}
              </>
            )}
            {regularChannels.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, padding: "10px 8px 4px" }}>Channels</div>
                {regularChannels.map(ch => (
                  <ChannelButton key={ch.id} channel={ch} active={activeChannel === ch.id} onClick={() => setActiveChannel(ch.id)} msgCount={(messages[ch.id] || []).length} />
                ))}
              </>
            )}
            {projectChannels.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, padding: "10px 8px 4px" }}>Projects</div>
                {projectChannels.map(ch => (
                  <ChannelButton key={ch.id} channel={ch} active={activeChannel === ch.id} onClick={() => setActiveChannel(ch.id)} msgCount={(messages[ch.id] || []).length} />
                ))}
              </>
            )}
          </div>

          {/* Online status */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.borderLight}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => setShowMembers(true)}>
              <div style={{ display: "flex" }}>
                {TEAM.filter(t => t.online).slice(0, 4).map((t, i) => (
                  <div key={t.id} style={{ width: 22, height: 22, borderRadius: "50%", background: t.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, border: `2px solid ${C.bg}`, marginLeft: i > 0 ? -6 : 0, position: "relative", zIndex: 4 - i }}>
                    {t.initials}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 11, color: C.inkSec }}>{onlineCount} online</span>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Channel header */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.sans }}>
                <span style={{ color: C.inkMuted, marginRight: 4 }}>{activeChannelData?.icon}</span>
                {activeChannelData?.name}
              </div>
              {activeChannelData?.description && (
                <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>{activeChannelData.description}</div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: C.inkMuted }}>{activeChannelData?.members?.length || 0} members</span>
              <button onClick={() => setShowMembers(true)} style={btnStyle("ghost")}>👥</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
            {groupedMessages.map((item, i) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 12px" }}>
                    <div style={{ flex: 1, height: 1, background: C.borderLight }}></div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, whiteSpace: "nowrap" }}>{item.date}</span>
                    <div style={{ flex: 1, height: 1, background: C.borderLight }}></div>
                  </div>
                );
              }
              const user = TEAM.find(t => t.id === item.userId);
              if (!user) return null;
              return (
                <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 14, padding: "6px 8px", borderRadius: 8, transition: "background 0.1s" }} onMouseEnter={e => { e.currentTarget.style.background = C.bgWarm; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: user.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {user.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{user.name}</span>
                      <span style={{ fontSize: 10, color: C.inkMuted }}>{formatTime(item.timestamp)}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: C.ink, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {item.text.split(/(@\w+)/g).map((part, pi) =>
                        part.startsWith("@") ? <span key={pi} style={{ color: C.accent, fontWeight: 600, background: C.accentSubtle, padding: "1px 4px", borderRadius: 4 }}>{part}</span> : part
                      )}
                    </div>
                    {item.reactions?.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                        {item.reactions.map(r => (
                          <button
                            key={r.emoji}
                            onClick={() => addReaction(item.id, r.emoji)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, border: `1px solid ${r.users.includes(currentUser) ? C.accent : C.border}`, background: r.users.includes(currentUser) ? C.accentSubtle : "transparent", cursor: "pointer", fontSize: 12, color: C.inkSec, transition: "all 0.1s" }}
                          >
                            {r.emoji} <span style={{ fontSize: 11, fontWeight: 500 }}>{r.users.length}</span>
                          </button>
                        ))}
                        {/* Quick reaction button */}
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <button
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              const popup = btn.nextElementSibling;
                              if (popup) popup.style.display = popup.style.display === "flex" ? "none" : "flex";
                            }}
                            style={{ padding: "2px 6px", borderRadius: 12, border: `1px solid ${C.borderLight}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.inkMuted }}
                          >
                            +
                          </button>
                          <div style={{ display: "none", position: "absolute", bottom: "100%", left: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 4, gap: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10 }}>
                            {QUICK_REACTIONS.map(emoji => (
                              <button key={emoji} onClick={() => addReaction(item.id, emoji)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 16, padding: "4px 6px", borderRadius: 4, transition: "background 0.1s" }} onMouseEnter={e => { e.currentTarget.style.background = C.bgWarm; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                placeholder={`Message #${activeChannelData?.name || ""}...`}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                style={{ ...inputStyle, resize: "none", height: 40, lineHeight: "24px", flex: 1 }}
                rows={1}
              />
              <button onClick={sendMessage} disabled={!messageText.trim()} style={{ ...btnStyle("accent"), opacity: messageText.trim() ? 1 : 0.5, height: 40 }}>
                Send
              </button>
            </div>
            <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 4 }}>Press Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>

      {/* ── New Channel Modal ── */}
      {showNewChannel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowNewChannel(false)}>
          <div style={{ background: C.card, borderRadius: 14, padding: 24, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontFamily: F.serif, fontWeight: 700, margin: 0 }}>Create Channel</h2>
              <button onClick={() => setShowNewChannel(false)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: C.inkMuted }}>✕</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4 }}>Channel Name</label>
              <input
                type="text"
                placeholder="e.g. moet-vip-dinner"
                value={newChannelForm.name}
                onChange={e => setNewChannelForm(prev => ({ ...prev, name: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSec, marginBottom: 4 }}>Description</label>
              <input
                type="text"
                placeholder="What's this channel about?"
                value={newChannelForm.description}
                onChange={e => setNewChannelForm(prev => ({ ...prev, description: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
              <input
                type="checkbox"
                checked={newChannelForm.isProject}
                onChange={e => setNewChannelForm(prev => ({ ...prev, isProject: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: C.accent }}
              />
              <span>Project channel (linked to a specific event)</span>
            </label>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowNewChannel(false)} style={btnStyle("outline")}>Cancel</button>
              <button onClick={createChannel} style={btnStyle("accent")}>Create Channel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Team Members Panel ── */}
      {showMembers && (
        <div style={{ position: "fixed", top: 0, right: 0, width: 300, height: "100vh", background: C.card, borderLeft: `1px solid ${C.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)", zIndex: 1000, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Team Members</span>
            <button onClick={() => setShowMembers(false)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: C.inkMuted }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, padding: "4px 8px", marginBottom: 4 }}>
              Online — {onlineCount}
            </div>
            {TEAM.filter(t => t.online).map(member => (
              <MemberRow key={member.id} member={member} />
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, padding: "12px 8px 4px" }}>
              Offline — {TEAM.length - onlineCount}
            </div>
            {TEAM.filter(t => !t.online).map(member => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelButton({ channel, active, onClick, msgCount }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontFamily: "'Inter',-apple-system,sans-serif", fontWeight: active ? 600 : 400, background: active ? "rgba(125,90,26,0.06)" : "transparent", color: active ? "#7D5A1A" : "#5C564E", transition: "all 0.15s", marginBottom: 1 }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{ color: "#9A948C", marginRight: 4, fontSize: 12 }}>{channel.icon}</span>
        {channel.name}
      </span>
      {msgCount > 0 && <span style={{ fontSize: 10, color: "#9A948C" }}>{msgCount}</span>}
    </button>
  );
}

function MemberRow({ member }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer", transition: "background 0.1s" }} onMouseEnter={e => { e.currentTarget.style.background = "#F5F1EC"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      <div style={{ position: "relative" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: member.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
          {member.initials}
        </div>
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: member.online ? "#2B7A4B" : "#9A948C", border: "2px solid #FFFFFF" }}></div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#18150F" }}>{member.name}</div>
        <div style={{ fontSize: 11, color: "#9A948C" }}>{member.role}</div>
      </div>
    </div>
  );
}
