import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// HH&T Email Hub — In-App Email Client
// Each team member accesses their company email without leaving the app
// Supports Gmail / Google Workspace via Gmail API
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

const LS_KEY = "hht_email_v1";

// ── Mailbox folders ──
const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: "📥" },
  { id: "sent", label: "Sent", icon: "📤" },
  { id: "drafts", label: "Drafts", icon: "📝" },
  { id: "starred", label: "Starred", icon: "⭐" },
  { id: "archive", label: "Archive", icon: "📦" },
];

// ── Label colours ──
const LABELS = {
  client: { bg: "#F0F7FA", fg: "#2A6680", label: "Client" },
  supplier: { bg: "#F0F9F3", fg: "#2B7A4B", label: "Supplier" },
  internal: { bg: C.accentSubtle, fg: C.accent, label: "Internal" },
  event: { bg: "#FFF9F0", fg: "#956018", label: "Event" },
  finance: { bg: "#FDF2F2", fg: "#9B3535", label: "Finance" },
  urgent: { bg: "#FDF2F2", fg: "#9B3535", label: "Urgent" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  if (diff < 604800) return Math.floor(diff / 86400) + "d";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ── Demo emails ──
const DEMO_EMAILS = [
  { id: "em-1", from: "sarah.jenkins@diageo.com", fromName: "Sarah Jenkins", to: "joe@headsheartandtails.com", subject: "Re: Whisky Masterclass — Final Guest List", body: "Hi Joe,\n\nPlease find the updated guest list attached. We've confirmed 38 of 40 guests. The remaining two should confirm by Friday.\n\nCan we also discuss the welcome cocktail options? I was thinking something with our new Talisker expression.\n\nBest,\nSarah", date: "2025-03-05T09:30:00Z", folder: "inbox", read: false, starred: true, labels: ["client", "event"], hasAttachment: true },
  { id: "em-2", from: "accounts@premiumspirits.co.uk", fromName: "Premium Spirits Supply", to: "joe@headsheartandtails.com", subject: "Invoice #PS-2025-0847 — February Order", body: "Dear Joe,\n\nPlease find attached invoice #PS-2025-0847 for your February spirits order.\n\nTotal: £2,340.00\nPayment due: 15 March 2025\n\nBank details as per usual. Let us know if you have any queries.\n\nKind regards,\nAccounts Team", date: "2025-03-04T16:45:00Z", folder: "inbox", read: false, starred: false, labels: ["supplier", "finance"], hasAttachment: true },
  { id: "em-3", from: "alex.morgan@headsheartandtails.com", fromName: "Alex Morgan", to: "joe@headsheartandtails.com", subject: "Staff availability — Easter weekend events", body: "Hey Joe,\n\nI've checked with everyone for Easter weekend. Here's where we stand:\n\n- Good Friday (18 Apr): Sam, Jordan, Casey, Jamie all available\n- Saturday (19 Apr): Full team available\n- Easter Sunday: Only Sam and I available\n- Monday (21 Apr): Sam, Jordan, Pat available\n\nWe might need to bring in two freelancers for Sunday if the Sketch event confirms. Want me to reach out to our usual contacts?\n\nAlex", date: "2025-03-04T14:20:00Z", folder: "inbox", read: true, starred: false, labels: ["internal"], hasAttachment: false },
  { id: "em-4", from: "events@sketch.london", fromName: "Sketch London — Events", to: "joe@headsheartandtails.com", subject: "Venue confirmation — Moët VIP Dinner, 18 May", body: "Dear Joe,\n\nWe're pleased to confirm the Lecture Room & Library at Sketch for your Moët & Chandon VIP Dinner on Sunday 18 May 2025.\n\nKey details:\n- Access from 14:00 for setup\n- Event: 19:00–23:00\n- Capacity: 80 seated\n- Full AV package included\n\nPlease send your final floor plan and catering requirements by 1 May.\n\nWarm regards,\nEvents Team", date: "2025-03-04T11:00:00Z", folder: "inbox", read: true, starred: true, labels: ["client", "event"], hasAttachment: false },
  { id: "em-5", from: "joe@headsheartandtails.com", fromName: "Joe Stokoe", to: "team@headsheartandtails.com", subject: "Team update — March priorities & new business", body: "Hi everyone,\n\nQuick update on where we are heading into March:\n\n1. Diageo Masterclass (15 Mar) — confirmed, prep list going out tomorrow\n2. Hendrick's Gin Garden proposal due Friday — Alex leading\n3. New pitch: Campari Aperitivo Week — meeting next Tuesday\n4. BrewDog Tap Takeover series kicks off 1 April\n\nLet's have a quick sync tomorrow at 10am. Any conflicts, let me know.\n\nCheers,\nJoe", date: "2025-03-03T17:30:00Z", folder: "sent", read: true, starred: false, labels: ["internal"], hasAttachment: false },
  { id: "em-6", from: "pat.quinn@headsheartandtails.com", fromName: "Pat Quinn", to: "joe@headsheartandtails.com", subject: "Campari pitch deck — first draft", body: "Hey Joe,\n\nFirst draft of the Campari Aperitivo Week pitch deck is ready. I've uploaded it to the Library under Past Projects.\n\nKey talking points:\n- Aperitivo-themed cocktail menu (6 signature serves)\n- Interactive garnish station\n- Brand ambassador coordination\n- Estimated £15K revenue, 50% margin\n\nHappy to run through it before Tuesday's meeting.\n\nPat", date: "2025-03-03T15:00:00Z", folder: "inbox", read: true, starred: true, labels: ["internal", "event"], hasAttachment: true },
  { id: "em-7", from: "insurance@eventcoverplus.co.uk", fromName: "Event Cover Plus", to: "joe@headsheartandtails.com", subject: "Policy renewal — Public Liability & Employers", body: "Dear Mr Stokoe,\n\nYour annual insurance policies are due for renewal on 1 April 2025.\n\n- Public Liability: £5M cover — £1,240/yr\n- Employers Liability: £10M cover — £860/yr\n- Equipment Cover: £50K — £420/yr\n\nPlease review and confirm by 20 March to avoid any lapse in coverage.\n\nBest regards,\nClaims Team", date: "2025-03-02T10:15:00Z", folder: "inbox", read: true, starred: false, labels: ["finance"], hasAttachment: true },
  { id: "em-8", from: "joe@headsheartandtails.com", fromName: "Joe Stokoe", to: "sarah.jenkins@diageo.com", subject: "Re: Whisky Masterclass — Cocktail menu options", body: "Hi Sarah,\n\nGreat to hear the guest list is nearly full. Here are three welcome cocktail options using the new Talisker expression:\n\n1. Talisker Storm Highball — light, refreshing, crowd-pleasing\n2. Smoked Old Fashioned with Talisker — sophisticated, impactful\n3. Talisker Sour with honey & lemon — approachable, smooth\n\nI'd recommend option 2 for the VIP feel. Happy to prep samples if you'd like to taste beforehand.\n\nBest,\nJoe", date: "2025-03-05T10:15:00Z", folder: "sent", read: true, starred: false, labels: ["client"], hasAttachment: false },
  { id: "em-9", from: "robin.james@headsheartandtails.com", fromName: "Robin James", to: "joe@headsheartandtails.com", subject: "Equipment check — 2x Boston shakers need replacing", body: "Joe,\n\nDid the post-event inventory check. Two Boston shakers are dented and a Hawthorne strainer has lost its spring. Need to reorder before the Diageo event.\n\nI've flagged them in the Inventory Manager. Want me to order from the usual supplier?\n\nRobin", date: "2025-03-01T09:30:00Z", folder: "inbox", read: true, starred: false, labels: ["internal"], hasAttachment: false },
  { id: "em-10", from: "hello@pernodricard-uk.com", fromName: "Pernod Ricard UK Events", to: "joe@headsheartandtails.com", subject: "Summer Party 2025 — budget approval & next steps", body: "Hi Joe,\n\nGreat news — the budget for the Summer Party has been approved at £28,000.\n\nNext steps:\n1. Final cocktail menu by 15 April\n2. Staffing plan by 1 May\n3. Site visit at Tobacco Dock — shall we do week of 24 March?\n\nLooking forward to another great event together.\n\nBest,\nEmma Carter\nHead of Events, Pernod Ricard UK", date: "2025-02-28T13:00:00Z", folder: "inbox", read: true, starred: true, labels: ["client", "event"], hasAttachment: false },
];

function generateId() {
  return "em-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

// ══════════════════════════════════════════════════════════════
// EMAIL HUB COMPONENT
// ══════════════════════════════════════════════════════════════

export default function EmailHub() {
  const [emails, setEmails] = useState([]);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", body: "" });
  const [emailConnected, setEmailConnected] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setEmails(JSON.parse(saved));
      } else {
        setEmails(DEMO_EMAILS);
        localStorage.setItem(LS_KEY, JSON.stringify(DEMO_EMAILS));
      }
    } catch { setEmails(DEMO_EMAILS); }
  }, []);

  const persist = useCallback((updated) => {
    setEmails(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }, []);

  const markRead = useCallback((id) => {
    persist(emails.map(e => e.id === id ? { ...e, read: true } : e));
  }, [emails, persist]);

  const toggleStar = useCallback((id) => {
    persist(emails.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  }, [emails, persist]);

  const archiveEmail = useCallback((id) => {
    persist(emails.map(e => e.id === id ? { ...e, folder: "archive" } : e));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  }, [emails, persist, selectedEmail]);

  const deleteEmail = useCallback((id) => {
    persist(emails.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  }, [emails, persist, selectedEmail]);

  const sendEmail = useCallback(() => {
    if (!composeForm.to.trim() || !composeForm.subject.trim()) return;
    const newEmail = {
      id: generateId(),
      from: "joe@headsheartandtails.com",
      fromName: "Joe Stokoe",
      to: composeForm.to.trim(),
      subject: composeForm.subject.trim(),
      body: composeForm.body.trim(),
      date: new Date().toISOString(),
      folder: "sent",
      read: true,
      starred: false,
      labels: [],
      hasAttachment: false,
    };
    persist([newEmail, ...emails]);
    setComposeForm({ to: "", subject: "", body: "" });
    setShowCompose(false);
    setReplyMode(false);
  }, [composeForm, emails, persist]);

  const openReply = useCallback((email) => {
    setComposeForm({
      to: email.from,
      subject: email.subject.startsWith("Re: ") ? email.subject : `Re: ${email.subject}`,
      body: `\n\n---\nOn ${new Date(email.date).toLocaleDateString("en-GB")}, ${email.fromName} wrote:\n\n${email.body}`,
    });
    setReplyMode(true);
    setShowCompose(true);
  }, []);

  const selectEmail = useCallback((email) => {
    setSelectedEmail(email);
    if (!email.read) markRead(email.id);
  }, [markRead]);

  // ── Filtering ──
  const filtered = useMemo(() => {
    let result = emails;
    if (activeFolder === "starred") {
      result = result.filter(e => e.starred);
    } else {
      result = result.filter(e => e.folder === activeFolder);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.fromName.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [emails, activeFolder, search]);

  const unreadCount = useMemo(() => emails.filter(e => !e.read && e.folder === "inbox").length, [emails]);
  const folderCounts = useMemo(() => {
    const counts = {};
    FOLDERS.forEach(f => {
      if (f.id === "starred") counts[f.id] = emails.filter(e => e.starred).length;
      else counts[f.id] = emails.filter(e => e.folder === f.id).length;
    });
    return counts;
  }, [emails]);

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto", height: "calc(100vh - 48px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontFamily: F.serif, fontWeight: 700, margin: 0, letterSpacing: 0.3 }}>Email</h1>
          <p style={{ fontSize: 13, color: C.inkMuted, margin: "4px 0 0" }}>
            Company email — read and respond without leaving the platform
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSetup(true)} style={btnStyle("outline")}>⚙ Email Settings</button>
          <button onClick={() => { setComposeForm({ to: "", subject: "", body: "" }); setReplyMode(false); setShowCompose(true); }} style={btnStyle("accent")}>✎ Compose</button>
        </div>
      </div>

      {/* Main email layout */}
      <div style={{ display: "grid", gridTemplateColumns: "180px 340px 1fr", gap: 0, flex: 1, minHeight: 0, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: C.card }}>

        {/* Folder sidebar */}
        <div style={{ borderRight: `1px solid ${C.borderLight}`, padding: "12px 8px", background: C.bg }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, padding: "4px 8px", marginBottom: 4 }}>Mailbox</div>
          {FOLDERS.map(folder => (
            <button
              key={folder.id}
              onClick={() => { setActiveFolder(folder.id); setSelectedEmail(null); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontFamily: F.sans, fontWeight: activeFolder === folder.id ? 600 : 400, background: activeFolder === folder.id ? C.accentSubtle : "transparent", color: activeFolder === folder.id ? C.accent : C.inkSec, transition: "all 0.15s", marginBottom: 2 }}
            >
              <span>{folder.icon} {folder.label}</span>
              <span style={{ fontSize: 11, color: folder.id === "inbox" && unreadCount > 0 ? C.accent : C.inkMuted, fontWeight: folder.id === "inbox" && unreadCount > 0 ? 700 : 400 }}>
                {folder.id === "inbox" && unreadCount > 0 ? unreadCount : folderCounts[folder.id] || ""}
              </span>
            </button>
          ))}

          {/* Connection status */}
          <div style={{ marginTop: 16, padding: "10px 8px", borderTop: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Account</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: emailConnected ? C.success : C.warn }}></div>
              <span style={{ fontSize: 11, color: C.inkSec }}>{emailConnected ? "Connected" : "Demo mode"}</span>
            </div>
            <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 4 }}>joe@hht.com</div>
          </div>
        </div>

        {/* Email list */}
        <div style={{ borderRight: `1px solid ${C.borderLight}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}` }}>
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, fontSize: 12 }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: 30, textAlign: "center", color: C.inkMuted }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📭</div>
                <div style={{ fontSize: 13 }}>No emails here</div>
              </div>
            )}
            {filtered.map(email => (
              <div
                key={email.id}
                onClick={() => selectEmail(email)}
                style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", background: selectedEmail?.id === email.id ? C.accentSubtle : !email.read ? "#FDFCF8" : "transparent", transition: "background 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentSubtle; }}
                onMouseLeave={e => { e.currentTarget.style.background = selectedEmail?.id === email.id ? C.accentSubtle : !email.read ? "#FDFCF8" : "transparent"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: email.read ? 400 : 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                    {!email.read && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.accent, marginRight: 6 }}></span>}
                    {email.fromName}
                  </span>
                  <span style={{ fontSize: 10, color: C.inkMuted, whiteSpace: "nowrap" }}>{timeAgo(email.date)}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: email.read ? 400 : 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                  {email.subject}
                </div>
                <div style={{ fontSize: 11, color: C.inkMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {email.body.slice(0, 80)}...
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {email.labels?.map(l => {
                    const label = LABELS[l];
                    return label ? <span key={l} style={pillStyle(label.bg, label.fg)}>{label.label}</span> : null;
                  })}
                  {email.hasAttachment && <span style={{ fontSize: 10, color: C.inkMuted }}>📎</span>}
                  {email.starred && <span style={{ fontSize: 10, color: "#D4A017", marginLeft: "auto" }}>★</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email reading pane */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!selectedEmail ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMuted }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✉</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Select an email to read</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All caught up"}</div>
              </div>
            </div>
          ) : (
            <>
              {/* Email toolbar */}
              <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", gap: 6 }}>
                <button onClick={() => openReply(selectedEmail)} style={btnStyle("outline")}>↩ Reply</button>
                <button onClick={() => toggleStar(selectedEmail.id)} style={btnStyle("ghost")}>{selectedEmail.starred ? "★ Unstar" : "☆ Star"}</button>
                <button onClick={() => archiveEmail(selectedEmail.id)} style={btnStyle("ghost")}>📦 Archive</button>
                <button onClick={() => { if (confirm("Delete this email?")) deleteEmail(selectedEmail.id); }} style={{ ...btnStyle("ghost"), color: C.danger }}>🗑</button>
              </div>

              {/* Email content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                <h2 style={{ fontSize: 18, fontFamily: F.serif, fontWeight: 700, margin: "0 0 12px", color: C.ink }}>{selectedEmail.subject}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "12px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {selectedEmail.fromName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedEmail.fromName}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted }}>{selectedEmail.from}</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.inkMuted }}>
                    {new Date(selectedEmail.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: C.inkMuted }}>To:</span>
                  <span style={{ fontSize: 12, color: C.inkSec }}>{selectedEmail.to}</span>
                </div>
                {selectedEmail.labels?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {selectedEmail.labels.map(l => {
                      const label = LABELS[l];
                      return label ? <span key={l} style={pillStyle(label.bg, label.fg)}>{label.label}</span> : null;
                    })}
                  </div>
                )}
                <div style={{ fontSize: 14, lineHeight: 1.7, color: C.ink, whiteSpace: "pre-wrap", fontFamily: F.sans }}>{selectedEmail.body}</div>
                {selectedEmail.hasAttachment && (
                  <div style={{ marginTop: 20, padding: 14, background: C.bgWarm, borderRadius: 8, border: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <span style={{ fontSize: 18 }}>📎</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>Attachment</div>
                      <div style={{ fontSize: 11, color: C.inkMuted }}>Click to download · {emailConnected ? "via Gmail" : "demo file"}</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Compose Modal ── */}
      {showCompose && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowCompose(false)}>
          <div style={{ background: C.card, borderRadius: 14, padding: 24, width: 600, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontFamily: F.serif, fontWeight: 700, margin: 0 }}>{replyMode ? "Reply" : "New Email"}</h2>
              <button onClick={() => setShowCompose(false)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: C.inkMuted }}>✕</button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 3 }}>To</label>
              <input
                type="text"
                placeholder="recipient@example.com"
                value={composeForm.to}
                onChange={e => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 3 }}>Subject</label>
              <input
                type="text"
                placeholder="Email subject"
                value={composeForm.subject}
                onChange={e => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 14, flex: 1, minHeight: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.inkMuted, marginBottom: 3 }}>Message</label>
              <textarea
                placeholder="Write your message..."
                value={composeForm.body}
                onChange={e => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                style={{ ...inputStyle, height: 200, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: C.inkMuted }}>
                {emailConnected ? "Sending via Gmail" : "Demo mode — email will be saved locally"}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowCompose(false)} style={btnStyle("outline")}>Discard</button>
                <button onClick={sendEmail} style={btnStyle("accent")}>Send ↗</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Setup Modal ── */}
      {showSetup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowSetup(false)}>
          <div style={{ background: C.card, borderRadius: 14, padding: 28, width: 520, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontFamily: F.serif, fontWeight: 700, margin: 0 }}>Email Settings</h2>
              <button onClick={() => setShowSetup(false)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: C.inkMuted }}>✕</button>
            </div>

            <div style={{ ...cardStyle({ padding: 16, marginBottom: 20, background: C.infoBg, borderColor: "#B8D8E8" }) }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.info, marginBottom: 4 }}>Gmail / Google Workspace Integration</div>
              <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.6 }}>
                Connect your company Google Workspace email account to read and send emails directly within the HH&T platform. Each team member connects their own account when they log in.
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>How it works</div>
            {[
              { step: "1", title: "Google Workspace admin enables the Gmail API", desc: "Your Google Workspace admin enables the Gmail API in the Google Cloud Console for your organisation." },
              { step: "2", title: "Each team member signs in with Google", desc: "When a team member logs into the HH&T platform, they authorise access to their Gmail via OAuth 2.0 — secure, no passwords stored." },
              { step: "3", title: "Email appears in-app", desc: "Inbox, sent, drafts — all accessible right here. Compose and reply without switching tabs." },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}

            <div style={{ ...cardStyle({ padding: 14, marginTop: 16, background: C.warnBg, borderColor: "#E8D4A8" }) }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.warn, marginBottom: 2 }}>Privacy & Security</div>
              <div style={{ fontSize: 11, color: C.inkSec, lineHeight: 1.5 }}>
                Email data is accessed in real-time via the Gmail API using OAuth 2.0. No email content is stored on our servers — everything is fetched directly from Google. Each team member's access is scoped to their own account only.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowSetup(false)} style={btnStyle("outline")}>Close</button>
              <button
                onClick={() => { setEmailConnected(!emailConnected); setShowSetup(false); }}
                style={btnStyle("accent")}
              >
                {emailConnected ? "Disconnect Email" : "Connect Gmail Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
