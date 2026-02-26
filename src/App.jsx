import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADS, HEARTS & TAILS — OPERATIONS PLATFORM v4.0
// Design: High-End Editorial · CRM-Grade Lead Engine · Holistic Business OS
// Inspired by: Apollo.io · HubSpot · Monday.com · Xero · QuickBooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const C = {
  bg: "#FAFAF8", bgWarm: "#F5F1EC", card: "#FFFFFF", cardHover: "#FDFCFA",
  ink: "#18150F", inkSec: "#5C564E", inkMuted: "#9A948C",
  accent: "#7D5A1A", accentLight: "#B8922E", accentSubtle: "rgba(125,90,26,0.06)",
  border: "#E6E1D9", borderLight: "#F0ECE5",
  success: "#2B7A4B", successBg: "#F0F9F3", successBorder: "#C6E7D1",
  warn: "#956018", warnBg: "#FFF9F0", warnBorder: "#E8D4A8",
  danger: "#9B3535", dangerBg: "#FDF2F2", dangerBorder: "#E8C4C4",
  info: "#2A6680", infoBg: "#F0F7FA", infoBorder: "#B8D8E8",
  stages: { identified:"#2A6680", researched:"#5B6AAF", contacted:"#956018", responded:"#B8922E", qualified:"#2B7A4B", meeting:"#1A6B4A", won:"#18150F", lost:"#9A948C" },
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };

const HHTLogo = ({ s = 32 }) => (
  <svg width={s} height={s} viewBox="0 0 200 200" fill="none">
    <rect width="200" height="200" rx="12" fill={C.ink}/>
    <path d="M100 170C100 170 30 125 30 80C30 55 50 38 72 38C86 38 96 46 100 55C104 46 114 38 128 38C150 38 170 55 170 80C170 125 100 170 100 170Z" fill="white"/>
    <text x="100" y="108" textAnchor="middle" fontSize="52" fontWeight="bold" fill={C.ink} fontFamily={F.serif}>&amp;</text>
  </svg>
);

// ── Style Utilities ──
const cardStyle = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...extra });
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });
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
const selectStyle = { ...inputStyle, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A948C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 30, cursor: "pointer" };

// ── Seeded RNG for consistent lead data ──
const sRng = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return () => { h = (h * 16807 + 0) % 2147483647; return (h & 0x7FFFFFFF) / 2147483647; }; };

// ── Lead Stages & Sources ──
const LEAD_STAGES = ["Identified", "Researched", "Contacted", "Responded", "Qualified", "Meeting Booked", "Won", "Lost"];
const LEAD_SOURCES = ["Web Research", "Referral", "LinkedIn", "Industry Event", "Cold Outreach", "Inbound", "Partner", "Directory"];
const SCORE_FACTORS = ["Venue capacity fit", "Event history", "Budget alignment", "Decision-maker access", "Location synergy", "Category match", "Response time", "Engagement level"];

// ── Raw Leads Database (410 venues) ──
const RAW_LEADS=[{n:"The Experimental Cocktail Club",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:60,note:"Hidden speakeasy with private hire capacity, hosts cocktail masterclasses and br"},{n:"The Cocktail Club",l:"Oxford Circus",co:"London",cat:"Cocktail bars and speakeasies",cap:80,note:"Basement cocktail bar with strong event programming and private hire options"},{n:"The Royal Cocktail Exchange",l:"Central London",co:"London",cat:"Cocktail bars and speakeasies",cap:100,note:"Multiple private areas, specializes in cocktail events and mixology experiences"},{n:"The Little Violet Door",l:"Seven Dials",co:"London",cat:"Cocktail bars and speakeasies",cap:40,note:"Intimate speakeasy, hosts private cocktail experiences and brand partnerships"},{n:"Punch Room",l:"Fitzrovia",co:"London",cat:"Cocktail bars and speakeasies",cap:50,note:"Punch-focused bar with event space and private hire capabilities"},{n:"Nightjar",l:"Shoreditch",co:"London",cat:"Cocktail bars and speakeasies",cap:90,note:"Live music venue with cocktails, hosts private events and brand collaborations"},{n:"Beneath Driver Lane",l:"Barbican",co:"London",cat:"Cocktail bars and speakeasies",cap:65,note:"Underground speakeasy with event programming and private hire capacity"},{n:"Callooh Callay",l:"Shoreditch",co:"London",cat:"Cocktail bars and speakeasies",cap:75,note:"Alice in Wonderland themed bar with event spaces and private hire options"},{n:"Milk & Honey",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:55,note:"Iconic speakeasy with private hire and cocktail experience programming"},{n:"Kwānt",l:"Mayfair",co:"London",cat:"Cocktail bars and speakeasies",cap:70,note:"Luxury cocktail bar with private spaces and bespoke event services"},{n:"Bar Trench",l:"Fitzrovia",co:"London",cat:"Cocktail bars and speakeasies",cap:45,note:"Cocktail-focused with private event capacity and mixology focus"},{n:"The Booking Office Bar",l:"King's Cross",co:"London",cat:"Cocktail bars and speakeasies",cap:120,note:"Station hotel bar with event space and private hire options"},{n:"Hemmingway Bar",l:"Mayfair",co:"London",cat:"Cocktail bars and speakeasies",cap:80,note:"Classic cocktail bar with private event spaces"},{n:"Dandelyan",l:"South Bank",co:"London",cat:"Cocktail bars and speakeasies",cap:85,note:"Botanical-themed bar with event programming and private areas"},{n:"The Athenaeum",l:"Piccadilly",co:"London",cat:"Members clubs",cap:200,note:"Private members club with multiple event spaces and bar services"},{n:"Soho House",l:"Soho",co:"London",cat:"Members clubs",cap:300,note:"Flagship members club with event spaces, private dining, and bar services"},{n:"Shoreditch House",l:"Shoreditch",co:"London",cat:"Members clubs",cap:250,note:"Creative members club with rooftop bar and event spaces"},{n:"Groucho Club",l:"Soho",co:"London",cat:"Members clubs",cap:180,note:"Media and creative members club with multiple bars and event capabilities"},{n:"Annabel's",l:"Mayfair",co:"London",cat:"Members clubs",cap:400,note:"Luxury nightclub and members venue with premium event services"},{n:"Reformation Club",l:"Pall Mall",co:"London",cat:"Members clubs",cap:150,note:"Historic members club with dining and event facilities"},{n:"Everyman Club",l:"Belgravia",co:"London",cat:"Members clubs",cap:120,note:"Members-only venue with event and dining capabilities"},{n:"Home House",l:"Fitzrovia",co:"London",cat:"Members clubs",cap:140,note:"Private members club with event spaces and bar services"},{n:"Membership Collective Group",l:"London (Multiple locations)",co:"London",cat:"Members clubs",cap:200,note:"Chain of private clubs with multiple venues and event facilities"},{n:"Evelyn's Table",l:"Blackfriars",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Fine dining with private dining room and event hosting capability"},{n:"Dishoom Covent Garden",l:"Covent Garden",co:"London",cat:"Independent restaurants with event spaces",cap:80,note:"Indian restaurant with private spaces and event catering"},{n:"Lilia",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:70,note:"Italian restaurant with private event spaces and full bar service"},{n:"Ottolenghi Notting Hill",l:"Notting Hill",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Mediterranean restaurant with private dining and catering options"},{n:"Barrafina",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:45,note:"Spanish restaurant with counter and private room for events"},{n:"Ormer Mayfair",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:55,note:"Fine dining with private event spaces and sommelier services"},{n:"The Ledbury",l:"Notting Hill",co:"London",cat:"Independent restaurants with event spaces",cap:40,note:"Michelin-starred restaurant with private dining capacity"},{n:"Clipstone Street Dining",l:"Fitzrovia",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Modern British restaurant with private event spaces"},{n:"Nuno",l:"Bermondsey",co:"London",cat:"Independent restaurants with event spaces",cap:65,note:"Portuguese restaurant with private dining and event catering"},{n:"Cote Brasserie",l:"Multiple London locations",co:"London",cat:"Independent restaurants with event spaces",cap:75,note:"French bistro chain with multiple private event spaces"},{n:"Rotorino",l:"Bethnal Green",co:"London",cat:"Independent restaurants with event spaces",cap:70,note:"Italian restaurant with event space and full bar"},{n:"Hoppers Soho",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:55,note:"Sri Lankan restaurant with private event options"},{n:"Cote d'Azur",l:"St James's",co:"London",cat:"Independent restaurants with event spaces",cap:45,note:"French restaurant with private dining room and event hosting"},{n:"Social Eating House",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Modern British with private event spaces and full bar service"},{n:"Quo Vadis",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:80,note:"Historic restaurant with private dining rooms and event capacity"},{n:"Smoking Goat",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:65,note:"Thai restaurant with private hire and event catering"},{n:"Berners Tavern",l:"Fitzrovia",co:"London",cat:"Independent restaurants with event spaces",cap:90,note:"Brasserie with private spaces and comprehensive event services"},{n:"The Ivy",l:"Covent Garden",co:"London",cat:"Independent restaurants with event spaces",cap:120,note:"Iconic restaurant with multiple private dining rooms and event experience"},{n:"Rules",l:"Covent Garden",co:"London",cat:"Independent restaurants with event spaces",cap:75,note:"Historic restaurant with private dining capabilities and event hosting"},{n:"The Savoy Grill",l:"Strand",co:"London",cat:"Independent restaurants with event spaces",cap:85,note:"Iconic grill room with private dining and event services"},{n:"Sexy Fish",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:95,note:"Contemporary Asian with private event spaces and full bar"},{n:"The Wolseley",l:"Piccadilly",co:"London",cat:"Independent restaurants with event spaces",cap:100,note:"Grand cafe with private dining room and event hosting capacity"},{n:"The Archer Street Tavern",l:"Soho",co:"London",cat:"Pubs with event spaces",cap:70,note:"Historic pub with private hire and event programming capacity"},{n:"The Craftsman",l:"Shoreditch",co:"London",cat:"Pubs with event spaces",cap:85,note:"Craft beer pub with event space and private hire capability"},{n:"The Bell",l:"Shoreditch",co:"London",cat:"Pubs with event spaces",cap:75,note:"Historic pub with private event spaces and full bar service"},{n:"The Shakespeare's Head",l:"Fitzrovia",co:"London",cat:"Pubs with event spaces",cap:60,note:"Historic pub with upstairs private event space"},{n:"The Harp",l:"Covent Garden",co:"London",cat:"Pubs with event spaces",cap:50,note:"Real ale pub with private event options and full bar"},{n:"The Lamb & Flag",l:"Covent Garden",co:"London",cat:"Pubs with event spaces",cap:65,note:"Historic pub with private hire and event programming"},{n:"The Eagle",l:"Clerkenwell",co:"London",cat:"Pubs with event spaces",cap:55,note:"Original gastropub with private event space"},{n:"The Crown & Sceptre",l:"Fitzrovia",co:"London",cat:"Pubs with event spaces",cap:80,note:"Victorian pub with multiple private event areas"},{n:"The Old Fountain",l:"Old Street",co:"London",cat:"Pubs with event spaces",cap:70,note:"Traditional pub with event hire capability"},{n:"The Draft House",l:"Tower Bridge",co:"London",cat:"Pubs with event spaces",cap:90,note:"Craft beer focused pub with event space and private hire"},{n:"The Three Greyhounds",l:"Soho",co:"London",cat:"Pubs with event spaces",cap:60,note:"Soho pub with private event areas and bar service"},{n:"The George Inn",l:"Borough",co:"London",cat:"Pubs with event spaces",cap:100,note:"Historic coaching inn with courtyard and event spaces"},{n:"The Blackfriar",l:"Blackfriars",co:"London",cat:"Pubs with event spaces",cap:75,note:"Grade II listed pub with unique event spaces"},{n:"The Princess Louise",l:"Holborn",co:"London",cat:"Pubs with event spaces",cap:85,note:"Victorian pub with ornate interior and private hire"},{n:"The Lamb",l:"Bloomsbury",co:"London",cat:"Pubs with event spaces",cap:50,note:"Traditional pub with snob screens and private event space"},{n:"The Seven Stars",l:"Holborn",co:"London",cat:"Pubs with event spaces",cap:40,note:"Historic pub near Royal Courts with private hire"},{n:"The Old Bank of England",l:"Fleet Street",co:"London",cat:"Pubs with event spaces",cap:120,note:"Converted bank building with grand interior and event capability"},{n:"The Counting House",l:"Bank",co:"London",cat:"Pubs with event spaces",cap:110,note:"Former banking hall with impressive dome and event spaces"},{n:"The Coal Hole",l:"Strand",co:"London",cat:"Pubs with event spaces",cap:80,note:"Historic pub with cellar bar and private hire"},{n:"The Museum Tavern",l:"Bloomsbury",co:"London",cat:"Pubs with event spaces",cap:65,note:"Traditional pub opposite British Museum with event capacity"},{n:"Ye Olde Cheshire Cheese",l:"Fleet Street",co:"London",cat:"Pubs with event spaces",cap:95,note:"Historic pub with multiple rooms ideal for events"},{n:"The Spaniards Inn",l:"Hampstead",co:"London",cat:"Pubs with event spaces",cap:70,note:"Historic pub with garden and private event spaces"},{n:"The Flask",l:"Highgate",co:"London",cat:"Pubs with event spaces",cap:60,note:"Village pub with garden and event hosting capability"},{n:"The Holly Bush",l:"Hampstead",co:"London",cat:"Pubs with event spaces",cap:55,note:"Grade II listed pub with private rooms for events"},{n:"The Windsor Castle",l:"Kensington",co:"London",cat:"Pubs with event spaces",cap:75,note:"Traditional pub with garden and private event spaces"},{n:"The Churchill Arms",l:"Kensington",co:"London",cat:"Pubs with event spaces",cap:80,note:"Famous flower-covered pub with Thai kitchen and event space"},{n:"Bounce Farringdon",l:"Farringdon",co:"London",cat:"Activity and entertainment venues",cap:300,note:"Ping pong venue with private event packages and cocktail service"},{n:"Flight Club Shoreditch",l:"Shoreditch",co:"London",cat:"Activity and entertainment venues",cap:200,note:"Social darts venue with event packages and full bar"},{n:"Swingers West End",l:"West End",co:"London",cat:"Activity and entertainment venues",cap:400,note:"Crazy golf venue with street food, cocktails, and event packages"},{n:"Junkyard Golf Club",l:"Shoreditch",co:"London",cat:"Activity and entertainment venues",cap:250,note:"Mini golf venue with bar and private event options"},{n:"All Star Lanes Holborn",l:"Holborn",co:"London",cat:"Activity and entertainment venues",cap:180,note:"Bowling venue with private event packages and bar"},{n:"Lane7 Finsbury Park",l:"Finsbury Park",co:"London",cat:"Activity and entertainment venues",cap:220,note:"Bowling, beer pong, karaoke with event packages"},{n:"The Axe Throwing Company",l:"Multiple locations",co:"London",cat:"Activity and entertainment venues",cap:60,note:"Axe throwing venue with corporate event packages"},{n:"Escape Room London",l:"Cavendish Square",co:"London",cat:"Activity and entertainment venues",cap:48,note:"Escape rooms with corporate team building events"},{n:"Electric Shuffle",l:"Canary Wharf",co:"London",cat:"Activity and entertainment venues",cap:350,note:"Tech shuffleboard venue with events, cocktails, food"},{n:"Fairgame",l:"Canary Wharf",co:"London",cat:"Activity and entertainment venues",cap:500,note:"Fairground-themed venue with games, food, and event packages"},{n:"Boom Battle Bar",l:"Multiple locations",co:"London",cat:"Activity and entertainment venues",cap:200,note:"Multi-activity bar with axe throwing, darts, and events"},{n:"Puttshack Bank",l:"Bank",co:"London",cat:"Activity and entertainment venues",cap:350,note:"Tech-infused mini golf with food, drinks, and event spaces"},{n:"Topgolf Chigwell",l:"Chigwell",co:"London",cat:"Activity and entertainment venues",cap:500,note:"Golf entertainment venue with bays, food, and corporate events"},{n:"Gravity Wandsworth",l:"Wandsworth",co:"London",cat:"Activity and entertainment venues",cap:600,note:"Multi-activity venue with go-karts, bowling, VR, and events"},{n:"NQ64 Soho",l:"Soho",co:"London",cat:"Activity and entertainment venues",cap:150,note:"Retro arcade bar with events and private hire"},{n:"Four Thieves",l:"Battersea",co:"London",cat:"Activity and entertainment venues",cap:120,note:"Pub with VR, mini golf, and private event options"},{n:"Ballie Ballerson",l:"Shoreditch",co:"London",cat:"Activity and entertainment venues",cap:200,note:"Ball pit bar with events and private hire packages"},{n:"Hijingo",l:"Shoreditch",co:"London",cat:"Activity and entertainment venues",cap:300,note:"Immersive bingo experience with cocktails and event packages"},{n:"The Cauldron London",l:"Stoke Newington",co:"London",cat:"Activity and entertainment venues",cap:100,note:"Molecular cocktail experience with private events"},{n:"Namco Funscape",l:"South Bank",co:"London",cat:"Activity and entertainment venues",cap:400,note:"Entertainment centre with bowling, arcade, events"},{n:"Curzon Soho",l:"Soho",co:"London",cat:"Cinemas and screening venues",cap:100,note:"Independent cinema with private hire and screening events"},{n:"Everyman Screen on the Green",l:"Islington",co:"London",cat:"Cinemas and screening venues",cap:180,note:"Luxury cinema with event space and cocktail bar"},{n:"Electric Cinema Portobello",l:"Notting Hill",co:"London",cat:"Cinemas and screening venues",cap:100,note:"Boutique cinema with luxury seating and private hire"},{n:"The Prince Charles Cinema",l:"Leicester Square",co:"London",cat:"Cinemas and screening venues",cap:300,note:"Independent cinema with event programming and private hire"},{n:"Regent Street Cinema",l:"Regent Street",co:"London",cat:"Cinemas and screening venues",cap:200,note:"Historic cinema with event venue hire"},{n:"Backyard Cinema",l:"Wandsworth",co:"London",cat:"Cinemas and screening venues",cap:250,note:"Immersive cinema experience with themed events"},{n:"Rooftop Film Club",l:"Multiple locations",co:"London",cat:"Cinemas and screening venues",cap:150,note:"Open-air rooftop cinema with bar and event options"},{n:"Secret Cinema",l:"Various",co:"London",cat:"Cinemas and screening venues",cap:2000,note:"Immersive cinema events with ticketed experiences"},{n:"Luna Cinema",l:"Various outdoor",co:"London",cat:"Cinemas and screening venues",cap:1000,note:"Outdoor cinema events in iconic locations"},{n:"Hot Tub Cinema",l:"Various",co:"London",cat:"Cinemas and screening venues",cap:80,note:"Unique hot tub cinema experience for private events"},{n:"Roof East",l:"Stratford",co:"London",cat:"Rooftop and outdoor venues",cap:500,note:"Rooftop venue with activities, bar, and event space"},{n:"Skylight Tobacco Dock",l:"Wapping",co:"London",cat:"Rooftop and outdoor venues",cap:400,note:"Rooftop bar with croquet, petanque, and event hire"},{n:"Madison Rooftop",l:"St Paul's",co:"London",cat:"Rooftop and outdoor venues",cap:350,note:"Rooftop with St Paul's views, bar, and private events"},{n:"Radio Rooftop",l:"Strand",co:"London",cat:"Rooftop and outdoor venues",cap:200,note:"Hotel rooftop bar with panoramic views and event hire"},{n:"Netil360",l:"Hackney",co:"London",cat:"Rooftop and outdoor venues",cap:150,note:"Rooftop bar and terrace with DJs and private hire"},{n:"Frank's Cafe",l:"Peckham",co:"London",cat:"Rooftop and outdoor venues",cap:200,note:"Iconic rooftop bar with panoramic views and events"},{n:"Queen of Hoxton Rooftop",l:"Shoreditch",co:"London",cat:"Rooftop and outdoor venues",cap:250,note:"Themed rooftop with seasonal pop-ups and event hire"},{n:"Pergola Paddington",l:"Paddington",co:"London",cat:"Rooftop and outdoor venues",cap:350,note:"Open-air dining and drinking venue with event space"},{n:"The Culpeper Rooftop",l:"Spitalfields",co:"London",cat:"Rooftop and outdoor venues",cap:100,note:"Rooftop greenhouse bar with event hire"},{n:"Bussey Rooftop Bar",l:"Peckham",co:"London",cat:"Rooftop and outdoor venues",cap:300,note:"Multi-level rooftop with bar, events, and panoramic views"},{n:"Dalston Roof Park",l:"Dalston",co:"London",cat:"Rooftop and outdoor venues",cap:200,note:"Community rooftop space with bar and event hire"},{n:"Aviary Rooftop",l:"Finsbury Square",co:"London",cat:"Rooftop and outdoor venues",cap:250,note:"Rooftop bar and terrace with event packages"},{n:"The Berkeley Rooftop",l:"Knightsbridge",co:"London",cat:"Rooftop and outdoor venues",cap:120,note:"Luxury hotel rooftop with private event options"},{n:"Rumpus Room",l:"South Bank",co:"London",cat:"Rooftop and outdoor venues",cap:150,note:"Hotel rooftop bar with Thames views and event hire"},{n:"Jin Bo Law",l:"Aldgate",co:"London",cat:"Rooftop and outdoor venues",cap:100,note:"Rooftop cocktail bar with skyline views and events"},{n:"Pergola on the Wharf",l:"Canary Wharf",co:"London",cat:"Rooftop and outdoor venues",cap:400,note:"Waterside venue with restaurants, bars, and event space"},{n:"Skylight Peckham",l:"Peckham",co:"London",cat:"Rooftop and outdoor venues",cap:300,note:"Rooftop with activities, street food, and event hire"},{n:"The Nest",l:"Dalston",co:"London",cat:"Late-night and music venues",cap:250,note:"Multi-room club with events and private hire"},{n:"XOYO",l:"Shoreditch",co:"London",cat:"Late-night and music venues",cap:800,note:"Club and live music venue with event programming"},{n:"Fabric",l:"Farringdon",co:"London",cat:"Late-night and music venues",cap:2500,note:"Iconic nightclub with multiple rooms and event capability"},{n:"Ministry of Sound",l:"Elephant & Castle",co:"London",cat:"Late-night and music venues",cap:1500,note:"Legendary club with event spaces and brand partnerships"},{n:"Village Underground",l:"Shoreditch",co:"London",cat:"Late-night and music venues",cap:600,note:"Creative space for events, music, and private hire"},{n:"Corsica Studios",l:"Elephant & Castle",co:"London",cat:"Late-night and music venues",cap:300,note:"Music venue with event programming and private hire"},{n:"Printworks",l:"Surrey Quays",co:"London",cat:"Late-night and music venues",cap:5000,note:"Warehouse venue for large events and brand experiences"},{n:"EartH",l:"Dalston",co:"London",cat:"Late-night and music venues",cap:1500,note:"Multi-level venue for concerts, events, and private hire"},{n:"Omeara",l:"Borough",co:"London",cat:"Late-night and music venues",cap:350,note:"Live music venue with bar and event packages"},{n:"Lafayette",l:"King's Cross",co:"London",cat:"Late-night and music venues",cap:600,note:"Multi-purpose venue with live music and events"},{n:"The Jazz Cafe",l:"Camden",co:"London",cat:"Late-night and music venues",cap:500,note:"Jazz and soul venue with event programming and hire"},{n:"Ronnie Scott's",l:"Soho",co:"London",cat:"Late-night and music venues",cap:250,note:"Iconic jazz club with private events and dining"},{n:"Blues Kitchen Shoreditch",l:"Shoreditch",co:"London",cat:"Late-night and music venues",cap:300,note:"Live music bar with BBQ, events, and private hire"},{n:"Scala",l:"King's Cross",co:"London",cat:"Late-night and music venues",cap:1100,note:"Live music and club venue with event capability"},{n:"Oval Space",l:"Bethnal Green",co:"London",cat:"Late-night and music venues",cap:800,note:"Multi-use event space for music, art, and brand events"},{n:"The Cause",l:"Tottenham Hale",co:"London",cat:"Late-night and music venues",cap:1000,note:"Multi-room charity venue with events and private hire"},{n:"Brixton Academy",l:"Brixton",co:"London",cat:"Late-night and music venues",cap:4921,note:"Major live music venue with event partnerships"},{n:"The Troxy",l:"Limehouse",co:"London",cat:"Late-night and music venues",cap:3000,note:"Art deco venue for concerts, events, and private hire"},{n:"HERE at Outernet",l:"Tottenham Court Road",co:"London",cat:"Late-night and music venues",cap:2000,note:"Immersive venue with LED walls and event capability"},{n:"Cargo",l:"Shoreditch",co:"London",cat:"Late-night and music venues",cap:600,note:"Club and bar with outdoor space and event hire"},{n:"93 Feet East",l:"Brick Lane",co:"London",cat:"Late-night and music venues",cap:500,note:"Multi-room venue with events and private hire"},{n:"The Windmill Brixton",l:"Brixton",co:"London",cat:"Late-night and music venues",cap:200,note:"Grassroots music venue with events and hire"},{n:"Moth Club",l:"Hackney",co:"London",cat:"Late-night and music venues",cap:350,note:"Retro venue for live music, club nights, and events"},{n:"Phonox",l:"Brixton",co:"London",cat:"Late-night and music venues",cap:600,note:"Club with events programming and private hire"},{n:"The Pickle Factory",l:"Oval",co:"London",cat:"Late-night and music venues",cap:350,note:"Intimate club space with events and private hire"},{n:"Number 90",l:"Hackney Wick",co:"London",cat:"Late-night and music venues",cap:400,note:"Bar, club, and workspace with events and hire"},{n:"Bussey Building",l:"Peckham",co:"London",cat:"Late-night and music venues",cap:800,note:"Multi-floor venue for events, art, and music"},{n:"Bermondsey Social Club",l:"Bermondsey",co:"London",cat:"Bar groups and chains",cap:150,note:"Social club atmosphere with cocktails and event space"},{n:"Be At One",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:120,note:"Cocktail bar chain with event packages and party hire"},{n:"Simmons Bar",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:100,note:"Quirky bar chain with event space and hire options"},{n:"Dirty Martini",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:150,note:"Cocktail bar chain with event packages and VIP areas"},{n:"Revolution Bars",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:200,note:"Bar chain with cocktails, food, events, and private hire"},{n:"All Bar One",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:120,note:"Bar chain with events programming and private hire"},{n:"Slug & Lettuce",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:150,note:"Bar chain with events and party booking options"},{n:"BrewDog",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:180,note:"Craft beer chain with event programming and hire"},{n:"The Alchemist",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:160,note:"Cocktail bar with theatrical drinks and events"},{n:"Drake & Morgan",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:140,note:"Bar and restaurant group with event spaces"},{n:"Barworks",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:130,note:"Independent bar group with events and hire"},{n:"Inception Group",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:200,note:"Themed venues including Mr Fogg's with event experiences"},{n:"Mr Fogg's Residence",l:"Mayfair",co:"London",cat:"Bar groups and chains",cap:100,note:"Victorian-themed cocktail bar with private events"},{n:"Cahoots",l:"Soho",co:"London",cat:"Bar groups and chains",cap:120,note:"1940s themed bar with events and private hire"},{n:"Swift",l:"Soho",co:"London",cat:"Bar groups and chains",cap:80,note:"Two-level bar with upstairs events and whisky focus"},{n:"Oriole",l:"Smithfield",co:"London",cat:"Bar groups and chains",cap:100,note:"World's best bar with live music and events"},{n:"Satan's Whiskers",l:"Bethnal Green",co:"London",cat:"Bar groups and chains",cap:50,note:"Intimate cocktail bar with private events"},{n:"Happiness Forgets",l:"Hoxton",co:"London",cat:"Bar groups and chains",cap:55,note:"Basement cocktail bar with private hire"},{n:"Three Sheets",l:"Dalston",co:"London",cat:"Bar groups and chains",cap:40,note:"Intimate cocktail bar with events capability"},{n:"Tayēr + Elementary",l:"Old Street",co:"London",cat:"Bar groups and chains",cap:60,note:"Award-winning bar with events and private hire"},{n:"Lyaness",l:"South Bank",co:"London",cat:"Bar groups and chains",cap:100,note:"Innovative cocktail bar with events and hire"},{n:"Artesian",l:"Regent Street",co:"London",cat:"Bar groups and chains",cap:90,note:"Hotel cocktail bar with events and private hire"},{n:"American Bar at The Savoy",l:"Strand",co:"London",cat:"Bar groups and chains",cap:70,note:"Legendary cocktail bar with events capability"},{n:"Dukes Bar",l:"St James's",co:"London",cat:"Bar groups and chains",cap:40,note:"Famous martini bar with private events"},{n:"The Connaught Bar",l:"Mayfair",co:"London",cat:"Bar groups and chains",cap:60,note:"Luxury hotel bar with bespoke events"},{n:"Discount Suit Company",l:"Liverpool Street",co:"London",cat:"Bar groups and chains",cap:80,note:"Speakeasy with cocktails and private hire"},{n:"Original Sin",l:"Stoke Newington",co:"London",cat:"Bar groups and chains",cap:55,note:"Cocktail bar with small events capability"},{n:"Scout",l:"Hackney",co:"London",cat:"Bar groups and chains",cap:45,note:"Eco-friendly cocktail bar with events"},{n:"Silverleaf",l:"Liverpool Street",co:"London",cat:"Bar groups and chains",cap:80,note:"Modern cocktail bar with events and hire"},{n:"Scarfes Bar",l:"Holborn",co:"London",cat:"Bar groups and chains",cap:70,note:"Hotel bar with live music and events"},{n:"Opium Cocktails",l:"Chinatown",co:"London",cat:"Bar groups and chains",cap:100,note:"Oriental-themed with multiple rooms and events"},{n:"The Bloomsbury Club Bar",l:"Bloomsbury",co:"London",cat:"Bar groups and chains",cap:60,note:"Hotel bar with art deco theme and events"},{n:"Trailer Happiness",l:"Notting Hill",co:"London",cat:"Bar groups and chains",cap:70,note:"Tiki bar with events and private hire"},{n:"Barts",l:"Chelsea",co:"London",cat:"Bar groups and chains",cap:50,note:"Speakeasy with quirky entrance and events"},{n:"Freud",l:"Covent Garden",co:"London",cat:"Bar groups and chains",cap:90,note:"Underground bar with events and hire"},{n:"Covent Garden Cocktail Club",l:"Covent Garden",co:"London",cat:"Bar groups and chains",cap:60,note:"Cocktail bar with events programming"},{n:"London Cocktail Club",l:"Multiple locations",co:"London",cat:"Bar groups and chains",cap:70,note:"Cocktail chain with events and masterclasses"},{n:"The Sun Tavern",l:"Bethnal Green",co:"London",cat:"Bar groups and chains",cap:80,note:"Irish whiskey bar with events and hire"},{n:"Coupette",l:"Bethnal Green",co:"London",cat:"Bar groups and chains",cap:50,note:"French-inspired cocktail bar with events"},{n:"Peg + Patriot",l:"Bethnal Green",co:"London",cat:"Bar groups and chains",cap:45,note:"Innovative cocktail bar with events"},{n:"Bar Termini",l:"Soho",co:"London",cat:"Bar groups and chains",cap:40,note:"Italian-inspired bar with negronis and events"},{n:"Coin Laundry",l:"Exmouth Market",co:"London",cat:"Themed and experiential venues",cap:120,note:"Retro-themed bar and restaurant with private events"},{n:"Tonight Josephine",l:"Waterloo",co:"London",cat:"Themed and experiential venues",cap:200,note:"Neon-lit party bar with events and private hire"},{n:"Lucky Voice",l:"Multiple locations",co:"London",cat:"Themed and experiential venues",cap:100,note:"Private karaoke with events and cocktails"},{n:"Bunga Bunga",l:"Battersea",co:"London",cat:"Themed and experiential venues",cap:250,note:"Italian-themed party venue with events"},{n:"Bingo Lingo",l:"Various",co:"London",cat:"Themed and experiential venues",cap:500,note:"Rave bingo experience with events"},{n:"Dabbers Social Bingo",l:"Houndsditch",co:"London",cat:"Themed and experiential venues",cap:300,note:"Modern bingo hall with food, drinks, and events"},{n:"The Bletchley",l:"Chelsea",co:"London",cat:"Themed and experiential venues",cap:80,note:"WWII code-breaking themed cocktail experience"},{n:"Alcotraz",l:"Brick Lane",co:"London",cat:"Themed and experiential venues",cap:70,note:"Prison-themed immersive cocktail experience"},{n:"ABQ London",l:"Hackney",co:"London",cat:"Themed and experiential venues",cap:60,note:"Breaking Bad themed cocktail experience"},{n:"Circus",l:"Covent Garden",co:"London",cat:"Themed and experiential venues",cap:200,note:"Restaurant with circus acts and event programming"},{n:"Waeska",l:"Holborn",co:"London",cat:"Themed and experiential venues",cap:80,note:"Cocktail bar with immersive events"},{n:"Murder Mystery Events",l:"Various",co:"London",cat:"Themed and experiential venues",cap:100,note:"Murder mystery dinner events at various venues"},{n:"The Candlelight Club",l:"Secret locations",co:"London",cat:"Themed and experiential venues",cap:200,note:"1920s speakeasy pop-up events"},{n:"Lost in Brixton",l:"Brixton",co:"London",cat:"Street food and market venues",cap:300,note:"Street food market with bar and event space"},{n:"Dinerama",l:"Shoreditch",co:"London",cat:"Street food and market venues",cap:400,note:"Street food venue with bars and events"},{n:"Pop Brixton",l:"Brixton",co:"London",cat:"Street food and market venues",cap:350,note:"Community space with food, drink, events"},{n:"Boxpark Shoreditch",l:"Shoreditch",co:"London",cat:"Street food and market venues",cap:500,note:"Container mall with food, events, and rooftop"},{n:"Boxpark Croydon",l:"Croydon",co:"London",cat:"Street food and market venues",cap:600,note:"Container venue with food hall and event space"},{n:"Boxpark Wembley",l:"Wembley",co:"London",cat:"Street food and market venues",cap:400,note:"Container venue near stadium with events"},{n:"Market Hall West End",l:"West End",co:"London",cat:"Street food and market venues",cap:300,note:"Food hall with bars and event capability"},{n:"Market Hall Victoria",l:"Victoria",co:"London",cat:"Street food and market venues",cap:250,note:"Food hall with cocktail bar and events"},{n:"Mercato Metropolitano",l:"Elephant & Castle",co:"London",cat:"Street food and market venues",cap:400,note:"Italian market with bars and event space"},{n:"Bang Bang Oriental",l:"Colindale",co:"London",cat:"Street food and market venues",cap:350,note:"Asian food hall with events and hire"},{n:"Seven Dials Market",l:"Covent Garden",co:"London",cat:"Street food and market venues",cap:250,note:"Food market with bar and event options"},{n:"Flat Iron Square",l:"Southwark",co:"London",cat:"Street food and market venues",cap:300,note:"Food and entertainment venue with events"},{n:"Vinegar Yard",l:"London Bridge",co:"London",cat:"Street food and market venues",cap:350,note:"Street food, vintage market, bar, events"},{n:"Eataly London",l:"Liverpool Street",co:"London",cat:"Street food and market venues",cap:200,note:"Italian food emporium with events and private dining"},{n:"Coal Drops Yard",l:"King's Cross",co:"London",cat:"Street food and market venues",cap:300,note:"Shopping and dining destination with event capability"},{n:"Arcade Food Theatre",l:"Centre Point",co:"London",cat:"Street food and market venues",cap:250,note:"Food hall with cocktail bar and events"},{n:"Leather Lane Market",l:"Holborn",co:"London",cat:"Street food and market venues",cap:200,note:"Street market with food vendors and events"},{n:"Maltby Street Market",l:"Bermondsey",co:"London",cat:"Street food and market venues",cap:150,note:"Weekend food market with bars and events"},{n:"Greenwich Market",l:"Greenwich",co:"London",cat:"Street food and market venues",cap:300,note:"Historic market with food, arts, and events"},{n:"Broadway Market",l:"Hackney",co:"London",cat:"Street food and market venues",cap:200,note:"Saturday market with food, drink, and events"},{n:"Kricket White City",l:"White City",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Indian restaurant with private event spaces and bar"},{n:"Bao Soho",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:40,note:"Taiwanese restaurant with private hire capability"},{n:"The Palomar",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:55,note:"Jerusalem-inspired restaurant with private events"},{n:"Brigadiers",l:"Bloomberg Arcade",co:"London",cat:"Independent restaurants with event spaces",cap:100,note:"Indian BBQ and bar with event spaces and private hire"},{n:"Duck & Waffle",l:"Liverpool Street",co:"London",cat:"Independent restaurants with event spaces",cap:80,note:"40th floor restaurant with bar and private events"},{n:"Sushisamba",l:"Liverpool Street",co:"London",cat:"Independent restaurants with event spaces",cap:90,note:"Japanese-Brazilian at Heron Tower with events and hire"},{n:"Sketch",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:200,note:"Multi-room restaurant with bars, gallery, and events"},{n:"Bob Bob Ricard",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:70,note:"Luxury restaurant with press for champagne and events"},{n:"Cecconi's",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:85,note:"Italian restaurant with private dining and events"},{n:"Hakkasan Mayfair",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:120,note:"Chinese restaurant with multiple rooms and events"},{n:"Nobu Mayfair",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:100,note:"Japanese restaurant with private events and bar"},{n:"Chiltern Firehouse",l:"Marylebone",co:"London",cat:"Independent restaurants with event spaces",cap:90,note:"Celebrity hotspot with private dining and events"},{n:"The Clove Club",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Michelin-starred with private dining and events"},{n:"St John Smithfield",l:"Smithfield",co:"London",cat:"Independent restaurants with event spaces",cap:80,note:"Nose-to-tail restaurant with private dining and events"},{n:"Core by Clare Smyth",l:"Notting Hill",co:"London",cat:"Independent restaurants with event spaces",cap:40,note:"Three Michelin star with private dining events"},{n:"Brat",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Basque grill restaurant with private dining and events"},{n:"Spring Restaurant",l:"Somerset House",co:"London",cat:"Independent restaurants with event spaces",cap:70,note:"Restaurant in Somerset House with event capability"},{n:"Hawksmoor Seven Dials",l:"Covent Garden",co:"London",cat:"Independent restaurants with event spaces",cap:75,note:"Steakhouse with private dining and event hire"},{n:"Gymkhana",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:90,note:"Indian restaurant with private dining and events"},{n:"The River Cafe",l:"Hammersmith",co:"London",cat:"Independent restaurants with event spaces",cap:100,note:"Iconic Italian with garden and private events"},{n:"Lyle's",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Modern British with private dining and events"},{n:"Flat Three",l:"Holland Park",co:"London",cat:"Independent restaurants with event spaces",cap:40,note:"Scandi-Korean with private dining and events"},{n:"Portland",l:"Great Portland Street",co:"London",cat:"Independent restaurants with event spaces",cap:45,note:"Modern European with private dining"},{n:"Pidgin",l:"Hackney",co:"London",cat:"Independent restaurants with event spaces",cap:35,note:"Weekly changing menu with private events"},{n:"Sager + Wilde",l:"Hackney",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Wine bar-restaurant with private events"},{n:"Brawn",l:"Columbia Road",co:"London",cat:"Independent restaurants with event spaces",cap:55,note:"European restaurant with wine and private events"},{n:"P Franco",l:"Clapton",co:"London",cat:"Independent restaurants with event spaces",cap:30,note:"Wine bar with guest chef events"},{n:"Noble Rot",l:"Bloomsbury",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Wine bar-restaurant with events and hire"},{n:"Terroirs",l:"Covent Garden",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Wine bar with natural wines and events"},{n:"10 Greek Street",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Wine-focused restaurant with events"},{n:"The Quality Chop House",l:"Farringdon",co:"London",cat:"Independent restaurants with event spaces",cap:45,note:"Historic restaurant with wine and events"},{n:"The Marksman",l:"Hackney",co:"London",cat:"Independent restaurants with event spaces",cap:70,note:"Gastropub with private dining and events"},{n:"The Harwood Arms",l:"Fulham",co:"London",cat:"Independent restaurants with event spaces",cap:55,note:"Michelin-starred pub with events"},{n:"The Anchor & Hope",l:"Waterloo",co:"London",cat:"Independent restaurants with event spaces",cap:65,note:"Gastropub with private dining and events"},{n:"The Dairy",l:"Clapham",co:"London",cat:"Independent restaurants with event spaces",cap:40,note:"Farm-to-table with private events"},{n:"Paradise by Way of Kensal Green",l:"Kensal Rise",co:"London",cat:"Independent restaurants with event spaces",cap:200,note:"Pub with private rooms, garden, and events"},{n:"The Drapers Arms",l:"Islington",co:"London",cat:"Independent restaurants with event spaces",cap:70,note:"Gastropub with private dining room"},{n:"The Camberwell Arms",l:"Camberwell",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Neighbourhood restaurant with events"},{n:"The Eagle & Child",l:"Clerkenwell",co:"London",cat:"Pubs with event spaces",cap:55,note:"Historic pub with event space"},{n:"Battersea Arts Centre",l:"Battersea",co:"London",cat:"Arts and cultural venues",cap:400,note:"Arts centre with performance spaces and events"},{n:"The Barbican Centre",l:"Barbican",co:"London",cat:"Arts and cultural venues",cap:2000,note:"Major arts centre with multiple event spaces"},{n:"Southbank Centre",l:"South Bank",co:"London",cat:"Arts and cultural venues",cap:3000,note:"Arts complex with multiple venues and events"},{n:"Roundhouse",l:"Camden",co:"London",cat:"Arts and cultural venues",cap:3300,note:"Iconic venue for music, arts, and events"},{n:"Rich Mix",l:"Bethnal Green",co:"London",cat:"Arts and cultural venues",cap:300,note:"Arts centre with cinema, bar, and events"},{n:"ICA",l:"The Mall",co:"London",cat:"Arts and cultural venues",cap:200,note:"Contemporary arts centre with bar and events"},{n:"The Vaults",l:"Waterloo",co:"London",cat:"Arts and cultural venues",cap:500,note:"Underground arts venue with immersive events"},{n:"Wilton's Music Hall",l:"Whitechapel",co:"London",cat:"Arts and cultural venues",cap:300,note:"Historic music hall with events and hire"},{n:"Cecil Sharp House",l:"Camden",co:"London",cat:"Arts and cultural venues",cap:250,note:"Folk arts venue with event spaces and bar"},{n:"Conway Hall",l:"Holborn",co:"London",cat:"Arts and cultural venues",cap:400,note:"Ethical society venue with events and hire"},{n:"St Pancras Renaissance Hotel",l:"King's Cross",co:"London",cat:"Event spaces within hotels and landmarks",cap:500,note:"Historic hotel with grand event spaces"},{n:"The Ned",l:"Bank",co:"London",cat:"Event spaces within hotels and landmarks",cap:800,note:"Hotel with multiple restaurants and events"},{n:"One Marylebone",l:"Marylebone",co:"London",cat:"Event spaces within hotels and landmarks",cap:600,note:"Former church turned event venue"},{n:"The HAC",l:"City",co:"London",cat:"Event spaces within hotels and landmarks",cap:1000,note:"Honourable Artillery Company with event spaces"},{n:"Devonshire Terrace",l:"Liverpool Street",co:"London",cat:"Event spaces within hotels and landmarks",cap:350,note:"Bar restaurant with private events"},{n:"8 Northumberland Avenue",l:"Trafalgar Square",co:"London",cat:"Event spaces within hotels and landmarks",cap:2000,note:"Grand venue for large events"},{n:"Gibson Hall",l:"Bishopsgate",co:"London",cat:"Event spaces within hotels and landmarks",cap:500,note:"Former banking hall for events"},{n:"Banking Hall",l:"Cornhill",co:"London",cat:"Event spaces within hotels and landmarks",cap:400,note:"Grade I listed hall for events"},{n:"RSA House",l:"Strand",co:"London",cat:"Event spaces within hotels and landmarks",cap:300,note:"Historic venue with multiple event spaces"},{n:"30 Euston Square",l:"Euston",co:"London",cat:"Event spaces within hotels and landmarks",cap:600,note:"Art Deco venue with modern event spaces"},{n:"100 Wardour Street",l:"Soho",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:250,note:"Club, restaurant, and lounge with events"},{n:"Aqua Shard",l:"London Bridge",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:200,note:"31st floor bar with panoramic views and events"},{n:"Seabird at The Hoxton",l:"Southwark",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:150,note:"Rooftop restaurant with bar and events"},{n:"The Standard London",l:"King's Cross",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:200,note:"Hotel with rooftop, restaurant, and events"},{n:"Sea Containers",l:"South Bank",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:250,note:"Hotel with restaurant, bar, and events"},{n:"Boundary London",l:"Shoreditch",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:150,note:"Rooftop bar with restaurant and events"},{n:"The Hoxton Shoreditch",l:"Shoreditch",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:180,note:"Hotel with lobby bar and event spaces"},{n:"Mondrian London",l:"South Bank",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:200,note:"Hotel with bar, restaurant, and events"},{n:"Ace Hotel London",l:"Shoreditch",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:250,note:"Hotel with Hoi Polloi restaurant and events"},{n:"The Curtain",l:"Shoreditch",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:200,note:"Hotel with members club and events"},{n:"Ham Yard Hotel",l:"Soho",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:150,note:"Hotel with bar, bowling, and events"},{n:"The Zetter Townhouse",l:"Clerkenwell",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:80,note:"Boutique hotel with cocktail lounge and events"},{n:"Artist Residence",l:"Pimlico",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:60,note:"Boutique hotel with bar and events"},{n:"Good Hotel London",l:"Royal Docks",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:150,note:"Floating hotel with event spaces"},{n:"The Mandrake",l:"Fitzrovia",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:100,note:"Boutique hotel with garden bar and events"},{n:"L'oscar",l:"Holborn",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:120,note:"Converted church hotel with bar and events"},{n:"Town Hall Hotel",l:"Bethnal Green",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:300,note:"Art deco hotel with event spaces"},{n:"Shoreditch Treehouse",l:"Shoreditch",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:200,note:"Hotel with rooftop and event spaces"},{n:"The Londoner",l:"Leicester Square",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:400,note:"Super boutique hotel with multiple bars and events"},{n:"Nobu Hotel",l:"Shoreditch",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:150,note:"Design hotel with restaurant and events"},{n:"ME London",l:"Strand",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:200,note:"Hotel with rooftop bar and events"},{n:"W London",l:"Leicester Square",co:"London",cat:"Multi-use bar/restaurant/club venues",cap:180,note:"Hotel with bar and event spaces"},{n:"Wembley Stadium",l:"Wembley",co:"London",cat:"Large-scale event and sporting venues",cap:90000,note:"National stadium with extensive event facilities"},{n:"The O2",l:"Greenwich",co:"London",cat:"Large-scale event and sporting venues",cap:20000,note:"Entertainment district with arena and venues"},{n:"Alexandra Palace",l:"Muswell Hill",co:"London",cat:"Large-scale event and sporting venues",cap:10000,note:"Victorian palace with multiple event spaces"},{n:"ExCeL London",l:"Royal Docks",co:"London",cat:"Large-scale event and sporting venues",cap:100000,note:"Major exhibition centre for large events"},{n:"Olympia London",l:"Hammersmith",co:"London",cat:"Large-scale event and sporting venues",cap:20000,note:"Exhibition venue for events and shows"},{n:"Crystal Palace Park",l:"Crystal Palace",co:"London",cat:"Large-scale event and sporting venues",cap:5000,note:"Park with outdoor event capability"},{n:"Twickenham Stadium",l:"Twickenham",co:"London",cat:"Large-scale event and sporting venues",cap:82000,note:"Rugby stadium with corporate event facilities"},{n:"Lord's Cricket Ground",l:"St John's Wood",co:"London",cat:"Large-scale event and sporting venues",cap:30000,note:"Cricket ground with event and hospitality spaces"},{n:"Tobacco Dock",l:"Wapping",co:"London",cat:"Large-scale event and sporting venues",cap:10000,note:"Historic warehouse venue for large events"},{n:"Old Billingsgate",l:"City",co:"London",cat:"Large-scale event and sporting venues",cap:2000,note:"Victorian market hall for events"},{n:"Natural History Museum",l:"South Kensington",co:"London",cat:"Large-scale event and sporting venues",cap:1500,note:"Iconic museum with event hire spaces"},{n:"Science Museum",l:"South Kensington",co:"London",cat:"Large-scale event and sporting venues",cap:1000,note:"Museum with event spaces and hire"},{n:"V&A Museum",l:"South Kensington",co:"London",cat:"Large-scale event and sporting venues",cap:1200,note:"Art museum with event spaces and hire"},{n:"Tower of London",l:"Tower Hill",co:"London",cat:"Large-scale event and sporting venues",cap:500,note:"Historic castle with event hire"},{n:"Kensington Palace",l:"Kensington",co:"London",cat:"Large-scale event and sporting venues",cap:300,note:"Royal palace with event spaces"},{n:"Somerset House",l:"Strand",co:"London",cat:"Large-scale event and sporting venues",cap:2000,note:"Arts centre with courtyard and event spaces"},{n:"Brewery Market at Old Truman Brewery",l:"Brick Lane",co:"London",cat:"Creative and co-working venues",cap:350,note:"Market hall with bar and event capability"},{n:"Second Home",l:"Spitalfields",co:"London",cat:"Creative and co-working venues",cap:200,note:"Creative workspace with events and hire"},{n:"Ace Hotel Basement",l:"Shoreditch",co:"London",cat:"Creative and co-working venues",cap:200,note:"Underground venue for music and events"},{n:"The Book Club",l:"Shoreditch",co:"London",cat:"Creative and co-working venues",cap:250,note:"Bar, events, ping pong with private hire"},{n:"Drink, Shop & Do",l:"King's Cross",co:"London",cat:"Creative and co-working venues",cap:100,note:"Creative venue with crafts, events, bar"},{n:"Grow Hackney",l:"Hackney",co:"London",cat:"Creative and co-working venues",cap:150,note:"Warehouse venue for events and hire"},{n:"Studio 338",l:"Greenwich",co:"London",cat:"Creative and co-working venues",cap:2000,note:"Multi-room venue with garden and events"},{n:"The Trampery Old Street",l:"Old Street",co:"London",cat:"Creative and co-working venues",cap:100,note:"Co-working with events and community"},{n:"London Fields Brewery",l:"Hackney",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:150,note:"Craft brewery with taproom and events"},{n:"Beavertown Brewery",l:"Tottenham",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:200,note:"Craft brewery with taproom and events"},{n:"Bermondsey Beer Mile",l:"Bermondsey",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:300,note:"Collection of breweries with tasting events"},{n:"The Kernel Brewery",l:"Bermondsey",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:100,note:"Craft brewery with Saturday tastings"},{n:"Partizan Brewing",l:"Bermondsey",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:80,note:"Craft brewery with taproom and events"},{n:"Fourpure Brewery",l:"Bermondsey",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:150,note:"Brewery with taproom and event hire"},{n:"Sambrook's Brewery",l:"Wandsworth",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:100,note:"Brewery with tours and event hire"},{n:"Meantime Brewery",l:"Greenwich",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:120,note:"Brewery with tasting room and events"},{n:"Camden Town Brewery",l:"Camden",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:200,note:"Brewery bar with events and hire"},{n:"Howling Hops",l:"Hackney Wick",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:150,note:"Tank bar brewery with events"},{n:"Sipsmith Distillery",l:"Chiswick",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:80,note:"Gin distillery with tours and events"},{n:"Beefeater Gin Distillery",l:"Kennington",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:60,note:"Gin distillery with tours and events"},{n:"Jensen's Gin",l:"Bermondsey",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:40,note:"Craft gin with tastings and events"},{n:"East London Liquor Company",l:"Bow",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:150,note:"Distillery with bar, restaurant, events"},{n:"City of London Distillery",l:"City",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:60,note:"Gin distillery bar with events"},{n:"58 Gin",l:"Haggerston",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:40,note:"Craft gin distillery with events"},{n:"Berry Bros & Rudd",l:"St James's",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:100,note:"Historic wine merchant with tasting events"},{n:"Hedonism Wines",l:"Mayfair",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:60,note:"Luxury wine shop with tasting events"},{n:"Vinoteca",l:"Multiple locations",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:80,note:"Wine bar and shop with events"},{n:"Gordon's Wine Bar",l:"Embankment",co:"London",cat:"Breweries, distilleries, and tasting venues",cap:100,note:"Historic wine bar with events"}];

// ── Enrich Leads ──
const LEADS = RAW_LEADS.map((r, i) => {
  const rng = sRng(r.n + i);
  const stageIdx = Math.floor(rng() * 6);
  const stage = LEAD_STAGES[stageIdx];
  const source = LEAD_SOURCES[Math.floor(rng() * LEAD_SOURCES.length)];
  const score = Math.round(30 + rng() * 70);
  const revenue = Math.round((r.cap * (8 + rng() * 25)) / 10) * 10;
  const days = Math.floor(rng() * 90);
  const date = new Date(2025, 0, 1 + days);
  const lastContact = stageIdx > 1 ? new Date(2025, 0, 20 + Math.floor(rng() * 60)) : null;
  const email = r.n.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) + "@" + r.l.toLowerCase().replace(/[^a-z]/g, "") + ".co.uk";
  const phone = "020 " + (7000 + Math.floor(rng() * 3000)) + " " + (1000 + Math.floor(rng() * 9000));
  const factors = SCORE_FACTORS.slice(0, 3 + Math.floor(rng() * 4)).map(f => ({ name: f, val: Math.round(40 + rng() * 60) }));
  const contactName = ["Alex Morgan","Sam Taylor","Jordan Lee","Chris Walker","Pat Quinn","Robin James","Casey Smith","Jamie Brown","Avery Jones","Drew Clark"][Math.floor(rng()*10)];
  const role = ["Events Manager","General Manager","Owner","Head of Events","Venue Director","Operations Manager","Bar Manager","Events Coordinator"][Math.floor(rng()*8)];
  const timeline = [];
  if (stageIdx >= 0) timeline.push({ date: date.toISOString().slice(0,10), action: "Lead identified via " + source, type: "system" });
  if (stageIdx >= 1) timeline.push({ date: new Date(date.getTime() + 86400000 * (2 + Math.floor(rng()*5))).toISOString().slice(0,10), action: "Research completed — capacity, events history reviewed", type: "system" });
  if (stageIdx >= 2) timeline.push({ date: new Date(date.getTime() + 86400000 * (7 + Math.floor(rng()*7))).toISOString().slice(0,10), action: "Initial outreach email sent to " + contactName, type: "email" });
  if (stageIdx >= 3) timeline.push({ date: new Date(date.getTime() + 86400000 * (14 + Math.floor(rng()*10))).toISOString().slice(0,10), action: contactName + " responded — interested in cocktail events", type: "email" });
  if (stageIdx >= 4) timeline.push({ date: new Date(date.getTime() + 86400000 * (20 + Math.floor(rng()*14))).toISOString().slice(0,10), action: "Qualified — budget confirmed, decision timeline set", type: "call" });
  if (stageIdx >= 5) timeline.push({ date: new Date(date.getTime() + 86400000 * (30 + Math.floor(rng()*14))).toISOString().slice(0,10), action: "Meeting booked — presentation scheduled", type: "meeting" });
  return { id: i + 1, name: r.n, location: r.l, city: r.co, category: r.cat, capacity: r.cap, notes: r.note, stage, source, score, revenue, date: date.toISOString().slice(0, 10), lastContact: lastContact ? lastContact.toISOString().slice(0, 10) : null, email, phone, factors, contactName, role, timeline };
});

// ── Events Data ──
const EVENT_STAGES = ["Discovery", "Proposal", "Confirmed", "Planning", "Execution", "Complete", "Cancelled"];
const EVENTS = [
  { id: 1, name: "Diageo Whisky Masterclass", client: "Diageo", venue: "The Connaught Bar", date: "2025-03-15", endDate: "2025-03-15", stage: "Confirmed", revenue: 12000, cost: 5500, guests: 40, staff: ["Joe Stokoe","Alex M"], health: 92, probability: 95, type: "Brand Activation", notes: "Premium whisky tasting with brand ambassador" },
  { id: 2, name: "Pernod Ricard Summer Party", client: "Pernod Ricard", venue: "Skylight Tobacco Dock", date: "2025-06-20", endDate: "2025-06-20", stage: "Planning", revenue: 28000, cost: 14000, guests: 200, staff: ["Joe Stokoe","Sam T","Jordan L","Chris W"], health: 78, probability: 90, type: "Corporate Event", notes: "Summer rooftop party with cocktail stations" },
  { id: 3, name: "Hendrick's Gin Garden Pop-up", client: "William Grant & Sons", venue: "Pergola Paddington", date: "2025-04-10", endDate: "2025-04-12", stage: "Proposal", revenue: 18500, cost: 9200, guests: 150, staff: ["Joe Stokoe","Pat Q"], health: 65, probability: 70, type: "Pop-up Experience", notes: "3-day botanical gin garden activation" },
  { id: 4, name: "Campari Aperitivo Week Launch", client: "Campari Group", venue: "100 Wardour Street", date: "2025-05-05", endDate: "2025-05-05", stage: "Discovery", revenue: 15000, cost: 7500, guests: 100, staff: ["Joe Stokoe","Robin J"], health: 45, probability: 40, type: "Launch Event", notes: "Aperitivo week press launch and influencer event" },
  { id: 5, name: "Private Birthday — Chelsea Penthouse", client: "Private Client", venue: "Mr Fogg's Residence", date: "2025-03-28", endDate: "2025-03-28", stage: "Confirmed", revenue: 8500, cost: 3800, guests: 60, staff: ["Casey S","Jamie B"], health: 95, probability: 100, type: "Private Party", notes: "50th birthday celebration with cocktail bar" },
  { id: 6, name: "BrewDog Tap Takeover Series", client: "BrewDog", venue: "BrewDog Tower Hill", date: "2025-04-01", endDate: "2025-06-30", stage: "Planning", revenue: 22000, cost: 10000, guests: 800, staff: ["Alex M","Drew C","Avery J"], health: 82, probability: 85, type: "Recurring Series", notes: "Monthly tap takeover events Q2 2025" },
  { id: 7, name: "Moët & Chandon VIP Dinner", client: "LVMH", venue: "Sketch", date: "2025-05-18", endDate: "2025-05-18", stage: "Proposal", revenue: 35000, cost: 18000, guests: 80, staff: ["Joe Stokoe","Sam T","Pat Q","Robin J"], health: 58, probability: 55, type: "VIP Dinner", notes: "Black-tie dinner with champagne pairing" },
  { id: 8, name: "Fever-Tree Mixology Competition", client: "Fever-Tree", venue: "The Cocktail Club", date: "2025-04-22", endDate: "2025-04-22", stage: "Confirmed", revenue: 11000, cost: 5000, guests: 50, staff: ["Joe Stokoe","Jordan L"], health: 88, probability: 95, type: "Brand Activation", notes: "Bartender competition with brand content" },
  { id: 9, name: "Soho House Summer Members Event", client: "Soho House", venue: "Shoreditch House", date: "2025-07-10", endDate: "2025-07-10", stage: "Discovery", revenue: 20000, cost: 9500, guests: 120, staff: ["Joe Stokoe","Chris W","Casey S"], health: 35, probability: 30, type: "Members Event", notes: "Exclusive rooftop summer party for members" },
  { id: 10, name: "Jägermeister Ice Cold Event", client: "Jägermeister", venue: "Printworks", date: "2025-05-30", endDate: "2025-05-31", stage: "Planning", revenue: 42000, cost: 22000, guests: 500, staff: ["Joe Stokoe","Sam T","Alex M","Jordan L","Chris W","Pat Q"], health: 70, probability: 80, type: "Festival Activation", notes: "Two-day immersive brand experience" },
];

// ── Team Data ──
const TEAM = [
  { name: "Joe Stokoe", role: "Director / BD", rate: 150, capacity: 40, hoursThisWeek: 38, hoursThisMonth: 155, utilisation: 97, avatar: "JS" },
  { name: "Alex Morgan", role: "Events Manager", rate: 85, capacity: 40, hoursThisWeek: 36, hoursThisMonth: 142, utilisation: 89, avatar: "AM" },
  { name: "Sam Taylor", role: "Senior Coordinator", rate: 75, capacity: 40, hoursThisWeek: 42, hoursThisMonth: 168, utilisation: 105, avatar: "ST" },
  { name: "Jordan Lee", role: "Bar Manager", rate: 70, capacity: 40, hoursThisWeek: 34, hoursThisMonth: 132, utilisation: 83, avatar: "JL" },
  { name: "Chris Walker", role: "Logistics Lead", rate: 65, capacity: 40, hoursThisWeek: 30, hoursThisMonth: 120, utilisation: 75, avatar: "CW" },
  { name: "Pat Quinn", role: "Creative Director", rate: 90, capacity: 40, hoursThisWeek: 28, hoursThisMonth: 112, utilisation: 70, avatar: "PQ" },
  { name: "Robin James", role: "Account Manager", rate: 70, capacity: 40, hoursThisWeek: 32, hoursThisMonth: 128, utilisation: 80, avatar: "RJ" },
  { name: "Casey Smith", role: "Event Coordinator", rate: 55, capacity: 40, hoursThisWeek: 40, hoursThisMonth: 160, utilisation: 100, avatar: "CS" },
];

// ── Financial Data ──
const INVOICES = [
  { id: "INV-001", event: "Diageo Whisky Masterclass", client: "Diageo", amount: 12000, paid: 6000, status: "Partial", due: "2025-03-01", issued: "2025-02-15" },
  { id: "INV-002", event: "Private Birthday", client: "Private Client", amount: 8500, paid: 8500, status: "Paid", due: "2025-03-20", issued: "2025-02-28" },
  { id: "INV-003", event: "Fever-Tree Mixology", client: "Fever-Tree", amount: 11000, paid: 0, status: "Sent", due: "2025-04-15", issued: "2025-03-10" },
  { id: "INV-004", event: "BrewDog Tap Takeover", client: "BrewDog", amount: 7500, paid: 7500, status: "Paid", due: "2025-04-01", issued: "2025-03-15" },
  { id: "INV-005", event: "Hendrick's Gin Garden", client: "William Grant", amount: 18500, paid: 0, status: "Draft", due: "2025-04-30", issued: null },
  { id: "INV-006", event: "Jägermeister Ice Cold", client: "Jägermeister", amount: 21000, paid: 0, status: "Draft", due: "2025-05-15", issued: null },
];

const EXPENSES = [
  { id: 1, category: "Spirits & Ingredients", amount: 4200, event: "Diageo Masterclass", date: "2025-02-20", billable: true },
  { id: 2, category: "Venue Hire", amount: 3500, event: "Pernod Summer Party", date: "2025-03-01", billable: true },
  { id: 3, category: "Equipment Rental", amount: 1800, event: "BrewDog Tap Takeover", date: "2025-03-05", billable: true },
  { id: 4, category: "Staff Travel", amount: 650, event: "Various", date: "2025-03-08", billable: false },
  { id: 5, category: "Marketing & Design", amount: 2200, event: "Hendrick's Gin Garden", date: "2025-03-10", billable: true },
  { id: 6, category: "Insurance", amount: 1500, event: "All Events Q1", date: "2025-01-15", billable: false },
  { id: 7, category: "Glassware & Props", amount: 1100, event: "Campari Launch", date: "2025-03-12", billable: true },
  { id: 8, category: "Software & Tools", amount: 450, event: "Operations", date: "2025-03-01", billable: false },
];

const cashFlowData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 2, 1 + i);
  const inflow = (i === 5 ? 6000 : i === 12 ? 8500 : i === 20 ? 7500 : i === 25 ? 11000 : Math.round(Math.random() * 1500));
  const outflow = Math.round(800 + Math.random() * 2500);
  return { day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), inflow, outflow, net: inflow - outflow };
});

// ── Activity Feed ──
const ACTIVITY = [
  { time: "2 min ago", icon: "📧", text: "Email opened by Alex Morgan at The Connaught Bar", type: "lead" },
  { time: "15 min ago", icon: "📞", text: "Call completed with Fever-Tree — confirmed Q2 activation", type: "event" },
  { time: "1 hr ago", icon: "💰", text: "Invoice INV-002 marked as paid — £8,500 from Private Client", type: "finance" },
  { time: "2 hrs ago", icon: "📋", text: "Proposal sent to Moët & Chandon for VIP Dinner — £35,000", type: "event" },
  { time: "3 hrs ago", icon: "🎯", text: "New lead scored 87/100 — Sketch, Mayfair (AI recommendation)", type: "lead" },
  { time: "5 hrs ago", icon: "👤", text: "Sam Taylor logged 8 hrs — Pernod Ricard Summer Party planning", type: "time" },
  { time: "Yesterday", icon: "✅", text: "BrewDog Tap Takeover April — all logistics confirmed", type: "event" },
  { time: "Yesterday", icon: "⚠️", text: "Campari Launch health score dropped to 45 — needs attention", type: "alert" },
];

// ── Format Helpers ──
const fmt = (n) => "£" + (n || 0).toLocaleString("en-GB");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
const pct = (n) => Math.round(n) + "%";

// ══════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS (Part 2-4 will populate these)
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// LEAD ENGINE — Apollo.io / HubSpot-Grade CRM
// ══════════════════════════════════════════════════════════════════════════════

const LeadEngine = () => {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [pg, setPg] = useState(1);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("table"); // table | kanban
  const perPage = 20;

  const categories = useMemo(() => ["All", ...new Set(LEADS.map(l => l.category))], []);
  const sources = useMemo(() => ["All", ...new Set(LEADS.map(l => l.source))], []);

  const filtered = useMemo(() => {
    let f = LEADS;
    if (search) { const s = search.toLowerCase(); f = f.filter(l => l.name.toLowerCase().includes(s) || l.location.toLowerCase().includes(s) || l.category.toLowerCase().includes(s) || l.contactName.toLowerCase().includes(s)); }
    if (stageFilter !== "All") f = f.filter(l => l.stage === stageFilter);
    if (catFilter !== "All") f = f.filter(l => l.category === catFilter);
    if (sourceFilter !== "All") f = f.filter(l => l.source === sourceFilter);
    f.sort((a, b) => { const m = sortDir === "asc" ? 1 : -1; if (sortBy === "score") return (a.score - b.score) * m; if (sortBy === "revenue") return (a.revenue - b.revenue) * m; if (sortBy === "name") return a.name.localeCompare(b.name) * m; if (sortBy === "capacity") return (a.capacity - b.capacity) * m; if (sortBy === "date") return (new Date(a.date) - new Date(b.date)) * m; return 0; });
    return f;
  }, [search, stageFilter, catFilter, sourceFilter, sortBy, sortDir]);

  const paged = filtered.slice((pg - 1) * perPage, pg * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const stageCounts = useMemo(() => {
    const c = {}; LEAD_STAGES.forEach(s => c[s] = 0); LEADS.forEach(l => { if (c[l.stage] !== undefined) c[l.stage]++; }); return c;
  }, []);

  const toggleSort = (col) => { if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(col); setSortDir("desc"); } };

  const ScoreBadge = ({ score }) => {
    const bg = score >= 80 ? C.successBg : score >= 60 ? C.warnBg : C.dangerBg;
    const color = score >= 80 ? C.success : score >= 60 ? C.warn : C.danger;
    return <span style={pillStyle(bg, color)}>{score}</span>;
  };

  // Lead Detail Panel
  if (selected) {
    const lead = LEADS.find(l => l.id === selected);
    if (!lead) { setSelected(null); return null; }
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <button onClick={() => setSelected(null)} style={btnStyle("ghost")}>← Back to Leads</button>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left — Lead Info */}
          <div>
            <div style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: F.serif, fontSize: 22, margin: 0 }}>{lead.name}</h2>
                  <div style={{ color: C.inkSec, fontSize: 13, marginTop: 4 }}>{lead.location} · {lead.category}</div>
                </div>
                <ScoreBadge score={lead.score} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                <div><span style={{ color: C.inkMuted }}>Contact:</span> <strong>{lead.contactName}</strong></div>
                <div><span style={{ color: C.inkMuted }}>Role:</span> {lead.role}</div>
                <div><span style={{ color: C.inkMuted }}>Email:</span> {lead.email}</div>
                <div><span style={{ color: C.inkMuted }}>Phone:</span> {lead.phone}</div>
                <div><span style={{ color: C.inkMuted }}>Capacity:</span> {lead.capacity} pax</div>
                <div><span style={{ color: C.inkMuted }}>Est. Revenue:</span> {fmt(lead.revenue)}</div>
                <div><span style={{ color: C.inkMuted }}>Source:</span> {lead.source}</div>
                <div><span style={{ color: C.inkMuted }}>Stage:</span> <span style={pillStyle(C.stages[lead.stage.toLowerCase().replace(/ /g,"")] ? C.infoBg : C.bgWarm, C.stages[lead.stage.toLowerCase().replace(/ /g,"")] || C.inkSec)}>{lead.stage}</span></div>
              </div>
              <div style={{ marginTop: 16, padding: 12, background: C.bgWarm, borderRadius: 8, fontSize: 12, color: C.inkSec }}>{lead.notes}</div>
            </div>

            {/* Score Factors */}
            <div style={cardStyle({ marginTop: 16 })}>
              <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 12px" }}>AI Score Breakdown</h3>
              {lead.factors.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 140, fontSize: 12, color: C.inkSec }}>{f.name}</div>
                  <div style={{ flex: 1, height: 6, background: C.borderLight, borderRadius: 3 }}>
                    <div style={{ width: f.val + "%", height: "100%", borderRadius: 3, background: f.val >= 70 ? C.success : f.val >= 50 ? C.warn : C.danger }} />
                  </div>
                  <div style={{ width: 30, fontSize: 11, fontWeight: 600, textAlign: "right" }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Timeline */}
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Contact Timeline</h3>
            {lead.timeline.length === 0 ? <div style={{ color: C.inkMuted, fontSize: 13 }}>No activity yet</div> :
              lead.timeline.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.type === "email" ? C.info : t.type === "call" ? C.success : t.type === "meeting" ? C.accent : C.inkMuted, flexShrink: 0 }} />
                    {i < lead.timeline.length - 1 && <div style={{ width: 1, flex: 1, background: C.borderLight, marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.inkMuted }}>{fmtDate(t.date)}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{t.action}</div>
                  </div>
                </div>
              ))
            }
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button style={btnStyle("primary")}>✉ Send Email</button>
              <button style={btnStyle("outline")}>📞 Log Call</button>
              <button style={btnStyle("outline")}>📅 Book Meeting</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kanban View
  if (view === "kanban") {
    const kanbanStages = LEAD_STAGES.filter(s => s !== "Won" && s !== "Lost");
    return (
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div><h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Lead Engine</h1><div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>{LEADS.length} leads · Pipeline view</div></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("table")} style={btnStyle("outline")}>☰ Table</button>
            <button onClick={() => setView("kanban")} style={btnStyle("primary")}>▤ Kanban</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {kanbanStages.map(stage => {
            const stageLeads = LEADS.filter(l => l.stage === stage).slice(0, 8);
            const stageColor = C.stages[stage.toLowerCase().replace(/ /g, "")] || C.inkSec;
            return (
              <div key={stage} style={{ minWidth: 240, maxWidth: 240, background: C.bgWarm, borderRadius: 10, padding: 12, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: stageColor, textTransform: "uppercase", letterSpacing: 0.5 }}>{stage}</div>
                  <span style={pillStyle(C.card, C.inkSec)}>{stageCounts[stage]}</span>
                </div>
                {stageLeads.map(l => (
                  <div key={l.id} onClick={() => setSelected(l.id)} style={{ ...cardStyle({ padding: 12, marginBottom: 8, cursor: "pointer" }), borderLeft: `3px solid ${stageColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted }}>{l.location} · {l.capacity} pax</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <ScoreBadge score={l.score} />
                      <span style={{ fontSize: 11, color: C.inkSec, fontWeight: 600 }}>{fmt(l.revenue)}</span>
                    </div>
                  </div>
                ))}
                {stageCounts[stage] > 8 && <div style={{ fontSize: 11, textAlign: "center", color: C.inkMuted, padding: 8 }}>+{stageCounts[stage] - 8} more</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Table View (default)
  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Lead Engine</h1>
          <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>{filtered.length} of {LEADS.length} leads · {LEADS.filter(l => l.stage === "Won").length} won · {fmt(LEADS.filter(l => l.stage !== "Lost").reduce((s, l) => s + l.revenue, 0))} pipeline value</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("table")} style={btnStyle("primary")}>☰ Table</button>
          <button onClick={() => setView("kanban")} style={btnStyle("outline")}>▤ Kanban</button>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div style={cardStyle({ marginBottom: 20, padding: 16 })}>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 48 }}>
          {LEAD_STAGES.map((s, i) => {
            const count = stageCounts[s];
            const maxCount = Math.max(...Object.values(stageCounts));
            const h = maxCount > 0 ? Math.max(12, (count / maxCount) * 48) : 12;
            const stageKey = s.toLowerCase().replace(/ /g, "");
            return (
              <div key={s} onClick={() => { setStageFilter(stageFilter === s ? "All" : s); setPg(1); }} style={{ flex: 1, cursor: "pointer", textAlign: "center" }}>
                <div style={{ height: h, background: stageFilter === s ? C.stages[stageKey] || C.accent : (C.stages[stageKey] || C.accent) + "33", borderRadius: "4px 4px 0 0", transition: "all 0.2s", marginBottom: 6, opacity: stageFilter !== "All" && stageFilter !== s ? 0.3 : 1 }} />
                <div style={{ fontSize: 10, fontWeight: 600, color: stageFilter === s ? C.ink : C.inkMuted, letterSpacing: 0.3 }}>{count}</div>
                <div style={{ fontSize: 9, color: C.inkMuted, marginTop: 1 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPg(1); }} placeholder="Search leads, contacts, locations..." style={{ ...inputStyle, maxWidth: 280 }} />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPg(1); }} style={{ ...selectStyle, maxWidth: 220 }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPg(1); }} style={{ ...selectStyle, maxWidth: 160 }}>
          {sources.map(s => <option key={s}>{s}</option>)}
        </select>
        {(stageFilter !== "All" || catFilter !== "All" || sourceFilter !== "All" || search) && (
          <button onClick={() => { setStageFilter("All"); setCatFilter("All"); setSourceFilter("All"); setSearch(""); setPg(1); }} style={btnStyle("ghost")}>✕ Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
              {[{ key: "name", label: "Venue / Contact" }, { key: "score", label: "Score" }, { key: "stage", label: "Stage" }, { key: "capacity", label: "Cap." }, { key: "revenue", label: "Est. Revenue" }, { key: "source", label: "Source" }, { key: "date", label: "Added" }].map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                  {col.label} {sortBy === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(l => (
              <tr key={l.id} onClick={() => setSelected(l.id)} style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", transition: "background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = C.cardHover} onMouseLeave={e => e.currentTarget.style.background = ""}>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted }}>{l.contactName} · {l.location}</div>
                </td>
                <td style={{ padding: "10px 12px" }}><ScoreBadge score={l.score} /></td>
                <td style={{ padding: "10px 12px" }}><span style={pillStyle((C.stages[l.stage.toLowerCase().replace(/ /g,"")] || C.inkSec) + "15", C.stages[l.stage.toLowerCase().replace(/ /g,"")] || C.inkSec)}>{l.stage}</span></td>
                <td style={{ padding: "10px 12px", fontSize: 12 }}>{l.capacity}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{fmt(l.revenue)}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: C.inkSec }}>{l.source}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: C.inkMuted }}>{fmtShort(l.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13 }}>
        <span style={{ color: C.inkMuted }}>Showing {(pg - 1) * perPage + 1}–{Math.min(pg * perPage, filtered.length)} of {filtered.length}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setPg(p => Math.max(1, p - 1))} disabled={pg === 1} style={{ ...btnStyle("outline"), opacity: pg === 1 ? 0.4 : 1 }}>←</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum;
            if (totalPages <= 7) pageNum = i + 1;
            else if (pg <= 4) pageNum = i + 1;
            else if (pg >= totalPages - 3) pageNum = totalPages - 6 + i;
            else pageNum = pg - 3 + i;
            return <button key={pageNum} onClick={() => setPg(pageNum)} style={{ ...btnStyle(pageNum === pg ? "primary" : "outline"), minWidth: 34 }}>{pageNum}</button>;
          })}
          <button onClick={() => setPg(p => Math.min(totalPages, p + 1))} disabled={pg === totalPages} style={{ ...btnStyle("outline"), opacity: pg === totalPages ? 0.4 : 1 }}>→</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// EVENT PIPELINE — Monday.com-Grade Kanban + Forecasting
// ══════════════════════════════════════════════════════════════════════════════

const EventPipeline = () => {
  const [view, setView] = useState("kanban"); // kanban | list | forecast
  const [selectedEvent, setSelectedEvent] = useState(null);

  const stageColors = { Discovery: C.info, Proposal: C.warn, Confirmed: C.success, Planning: C.accent, Execution: "#6B46C1", Complete: C.ink, Cancelled: C.danger };

  const totalRevenue = EVENTS.reduce((s, e) => s + e.revenue, 0);
  const weightedRevenue = EVENTS.reduce((s, e) => s + (e.revenue * e.probability / 100), 0);
  const confirmedRevenue = EVENTS.filter(e => ["Confirmed", "Planning", "Execution", "Complete"].includes(e.stage)).reduce((s, e) => s + e.revenue, 0);
  const avgHealth = Math.round(EVENTS.reduce((s, e) => s + e.health, 0) / EVENTS.length);

  // Event Detail
  if (selectedEvent) {
    const ev = EVENTS.find(e => e.id === selectedEvent);
    if (!ev) { setSelectedEvent(null); return null; }
    const profit = ev.revenue - ev.cost;
    const margin = Math.round((profit / ev.revenue) * 100);
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <button onClick={() => setSelectedEvent(null)} style={btnStyle("ghost")}>← Back to Pipeline</button>
        <div style={cardStyle({ marginTop: 16 })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: F.serif, fontSize: 22, margin: 0 }}>{ev.name}</h2>
              <div style={{ color: C.inkSec, fontSize: 13, marginTop: 4 }}>{ev.client} · {ev.venue} · {ev.type}</div>
            </div>
            <span style={pillStyle(stageColors[ev.stage] + "20", stageColors[ev.stage])}>{ev.stage}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            {[{ label: "Revenue", value: fmt(ev.revenue) }, { label: "Cost", value: fmt(ev.cost) }, { label: "Profit", value: fmt(profit), color: profit > 0 ? C.success : C.danger }, { label: "Margin", value: pct(margin) }].map((m, i) => (
              <div key={i} style={{ padding: 12, background: C.bgWarm, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.serif, color: m.color || C.ink }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
            <div><span style={{ color: C.inkMuted }}>Date:</span> {fmtDate(ev.date)}{ev.endDate !== ev.date ? ` — ${fmtDate(ev.endDate)}` : ""}</div>
            <div><span style={{ color: C.inkMuted }}>Guests:</span> {ev.guests}</div>
            <div><span style={{ color: C.inkMuted }}>Staff:</span> {ev.staff.join(", ")}</div>
            <div><span style={{ color: C.inkMuted }}>Probability:</span> {ev.probability}%</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ color: C.inkMuted, fontSize: 13 }}>Health Score:</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ flex: 1, height: 8, background: C.borderLight, borderRadius: 4 }}>
                <div style={{ width: ev.health + "%", height: "100%", borderRadius: 4, background: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger }}>{ev.health}</span>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: 12, background: C.bgWarm, borderRadius: 8, fontSize: 12, color: C.inkSec }}>{ev.notes}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Event Pipeline</h1>
          <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>{EVENTS.length} events · {fmt(weightedRevenue)} weighted revenue</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["kanban", "list", "forecast"].map(v => (
            <button key={v} onClick={() => setView(v)} style={btnStyle(view === v ? "primary" : "outline")}>{v === "kanban" ? "▤ Kanban" : v === "list" ? "☰ List" : "📊 Forecast"}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Pipeline", value: fmt(totalRevenue), sub: `${EVENTS.length} events` },
          { label: "Weighted Revenue", value: fmt(weightedRevenue), sub: "Probability-adjusted" },
          { label: "Confirmed", value: fmt(confirmedRevenue), sub: `${EVENTS.filter(e => ["Confirmed","Planning","Execution"].includes(e.stage)).length} events` },
          { label: "Avg Health", value: avgHealth + "/100", sub: avgHealth >= 70 ? "Good shape" : "Needs attention", color: avgHealth >= 70 ? C.success : C.warn },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center" })}>
            <div style={{ fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.serif, color: kpi.color || C.ink }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {EVENT_STAGES.filter(s => s !== "Complete" && s !== "Cancelled").map(stage => {
            const stageEvents = EVENTS.filter(e => e.stage === stage);
            const stageRev = stageEvents.reduce((s, e) => s + e.revenue, 0);
            return (
              <div key={stage} style={{ minWidth: 260, maxWidth: 260, background: C.bgWarm, borderRadius: 10, padding: 12, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: stageColors[stage], textTransform: "uppercase", letterSpacing: 0.5 }}>{stage}</div>
                  <span style={pillStyle(C.card, C.inkSec)}>{fmt(stageRev)}</span>
                </div>
                {stageEvents.map(ev => (
                  <div key={ev.id} onClick={() => setSelectedEvent(ev.id)} style={{ ...cardStyle({ padding: 14, marginBottom: 8, cursor: "pointer" }), borderLeft: `3px solid ${stageColors[stage]}` }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{ev.name}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 6 }}>{ev.client} · {fmtShort(ev.date)}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{fmt(ev.revenue)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 40, height: 4, background: C.borderLight, borderRadius: 2 }}>
                          <div style={{ width: ev.health + "%", height: "100%", borderRadius: 2, background: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger }} />
                        </div>
                        <span style={{ fontSize: 10, color: C.inkMuted }}>{ev.health}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {stageEvents.length === 0 && <div style={{ fontSize: 12, color: C.inkMuted, textAlign: "center", padding: 20 }}>No events</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
                {["Event", "Client", "Stage", "Date", "Revenue", "Health", "Probability"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EVENTS.map(ev => (
                <tr key={ev.id} onClick={() => setSelectedEvent(ev.id)} style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = C.cardHover} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "10px 12px" }}><div style={{ fontWeight: 600 }}>{ev.name}</div><div style={{ fontSize: 11, color: C.inkMuted }}>{ev.venue}</div></td>
                  <td style={{ padding: "10px 12px" }}>{ev.client}</td>
                  <td style={{ padding: "10px 12px" }}><span style={pillStyle(stageColors[ev.stage] + "20", stageColors[ev.stage])}>{ev.stage}</span></td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>{fmtShort(ev.date)}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{fmt(ev.revenue)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 4, background: C.borderLight, borderRadius: 2 }}><div style={{ width: ev.health + "%", height: "100%", borderRadius: 2, background: ev.health >= 80 ? C.success : ev.health >= 60 ? C.warn : C.danger }} /></div>
                      <span style={{ fontSize: 11 }}>{ev.health}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>{ev.probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Forecast View */}
      {view === "forecast" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>Revenue by Event Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(() => { const types = {}; EVENTS.forEach(e => { types[e.type] = (types[e.type] || 0) + e.revenue; }); return Object.entries(types).map(([type, rev]) => ({ type: type.length > 15 ? type.slice(0,15)+"…" : type, revenue: rev })).sort((a,b) => b.revenue - a.revenue); })()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: C.inkMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£" + (v/1000) + "k"} />
                <Tooltip formatter={(v) => [fmt(v), "Revenue"]} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
                <Bar dataKey="revenue" fill={C.accent} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>Revenue by Stage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={(() => { const stages = {}; EVENTS.forEach(e => { stages[e.stage] = (stages[e.stage] || 0) + e.revenue; }); return Object.entries(stages).map(([stage, rev]) => ({ name: stage, value: rev })); })()} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                  {Object.keys(stageColors).map((s, i) => <Cell key={i} fill={stageColors[s] || C.inkMuted} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle({ gridColumn: "1 / -1" })}>
            <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>Monthly Revenue Forecast</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={(() => { const months = {}; EVENTS.forEach(e => { const m = new Date(e.date).toLocaleDateString("en-GB", { month: "short" }); months[m] = (months[m] || { total: 0, weighted: 0 }); months[m].total += e.revenue; months[m].weighted += Math.round(e.revenue * e.probability / 100); }); return Object.entries(months).map(([month, d]) => ({ month, ...d })); })()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.inkMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£" + (v/1000) + "k"} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
                <Area type="monotone" dataKey="total" stroke={C.accent} fill={C.accent + "20"} name="Total" />
                <Area type="monotone" dataKey="weighted" stroke={C.success} fill={C.success + "20"} name="Weighted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND CENTRE — Dashboard with KPIs, Charts, Activity Feed
// ══════════════════════════════════════════════════════════════════════════════

const CommandCentre = () => {
  const totalPipeline = EVENTS.reduce((s, e) => s + e.revenue, 0);
  const confirmedRev = EVENTS.filter(e => ["Confirmed","Planning","Execution","Complete"].includes(e.stage)).reduce((s, e) => s + e.revenue, 0);
  const leadConversion = Math.round((LEADS.filter(l => l.stage === "Won").length / LEADS.length) * 100);
  const avgUtil = Math.round(TEAM.reduce((s, t) => s + t.utilisation, 0) / TEAM.length);
  const atRisk = EVENTS.filter(e => e.health < 60);
  const unpaidInvoices = INVOICES.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount - i.paid, 0);

  const revenueByMonth = (() => { const m = {}; EVENTS.forEach(e => { const mo = new Date(e.date).toLocaleDateString("en-GB",{month:"short"}); m[mo] = (m[mo]||0) + e.revenue; }); return Object.entries(m).map(([month,rev]) => ({month,rev})); })();
  const leadsByStage = LEAD_STAGES.map(s => ({ stage: s.length > 8 ? s.slice(0,8) : s, count: LEADS.filter(l => l.stage === s).length }));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Command Centre</h1>
        <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Business overview · Real-time metrics</div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Pipeline Value", value: fmt(totalPipeline), color: C.ink },
          { label: "Confirmed Revenue", value: fmt(confirmedRev), color: C.success },
          { label: "Total Leads", value: LEADS.length.toString(), color: C.info },
          { label: "Lead Conversion", value: pct(leadConversion), color: C.accent },
          { label: "Team Utilisation", value: pct(avgUtil), color: avgUtil >= 80 ? C.success : C.warn },
          { label: "Outstanding", value: fmt(unpaidInvoices), color: unpaidInvoices > 20000 ? C.danger : C.warn },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center", padding: 16 })}>
            <div style={{ fontSize: 10, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.serif, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.inkMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£"+(v/1000)+"k"} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              <Bar dataKey="rev" fill={C.accent} radius={[4,4,0,0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Activity Feed</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACTIVITY.slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: C.inkMuted, marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Lead Pipeline */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Lead Pipeline Stages</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={leadsByStage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis type="number" tick={{ fontSize: 10, fill: C.inkMuted }} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: C.inkMuted }} width={75} />
              <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              <Bar dataKey="count" fill={C.info} radius={[0,4,4,0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* At-Risk Events */}
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 12px" }}>At-Risk Events</h3>
          {atRisk.length === 0 ? <div style={{ color: C.success, fontSize: 13 }}>All events in good health</div> :
            atRisk.map(ev => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.name}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted }}>{ev.client} · {fmtShort(ev.date)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 50, height: 6, background: C.borderLight, borderRadius: 3 }}>
                    <div style={{ width: ev.health + "%", height: "100%", borderRadius: 3, background: ev.health < 50 ? C.danger : C.warn }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ev.health < 50 ? C.danger : C.warn }}>{ev.health}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TIME & UTILISATION — Capacity Planning
// ══════════════════════════════════════════════════════════════════════════════

const TimeUtilisation = () => {
  const avgUtil = Math.round(TEAM.reduce((s, t) => s + t.utilisation, 0) / TEAM.length);
  const totalCapacity = TEAM.reduce((s, t) => s + t.capacity, 0);
  const totalHours = TEAM.reduce((s, t) => s + t.hoursThisWeek, 0);
  const overloaded = TEAM.filter(t => t.utilisation > 100);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Time & Utilisation</h1>
        <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Team capacity · Workload planning</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Avg Utilisation", value: pct(avgUtil), color: avgUtil >= 80 ? C.success : C.warn },
          { label: "Weekly Hours", value: totalHours + " / " + totalCapacity, color: C.ink },
          { label: "Team Size", value: TEAM.length.toString(), color: C.info },
          { label: "Overloaded", value: overloaded.length.toString(), color: overloaded.length > 0 ? C.danger : C.success },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center" })}>
            <div style={{ fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.serif, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Team Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
        {TEAM.map((t, i) => (
          <div key={i} style={cardStyle({ display: "flex", gap: 16, alignItems: "center" })}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div><strong style={{ fontSize: 14 }}>{t.name}</strong><div style={{ fontSize: 11, color: C.inkMuted }}>{t.role} · {fmt(t.rate)}/hr</div></div>
                <span style={pillStyle(t.utilisation > 100 ? C.dangerBg : t.utilisation >= 80 ? C.successBg : C.warnBg, t.utilisation > 100 ? C.danger : t.utilisation >= 80 ? C.success : C.warn)}>{pct(t.utilisation)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: C.borderLight, borderRadius: 3 }}>
                  <div style={{ width: Math.min(t.utilisation, 120) + "%", maxWidth: "100%", height: "100%", borderRadius: 3, background: t.utilisation > 100 ? C.danger : t.utilisation >= 80 ? C.success : C.warn }} />
                </div>
                <span style={{ fontSize: 11, color: C.inkMuted, whiteSpace: "nowrap" }}>{t.hoursThisWeek}h / {t.capacity}h</span>
              </div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>This month: {t.hoursThisMonth}h</div>
            </div>
          </div>
        ))}
      </div>

      {/* Utilisation Chart */}
      <div style={cardStyle()}>
        <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Team Utilisation Overview</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={TEAM.map(t => ({ name: t.name.split(" ")[0], util: t.utilisation, capacity: 100 }))}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.inkMuted }} />
            <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} domain={[0, 120]} tickFormatter={v => v + "%"} />
            <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
            <Bar dataKey="capacity" fill={C.borderLight} radius={[4,4,0,0]} name="Capacity" />
            <Bar dataKey="util" fill={C.accent} radius={[4,4,0,0]} name="Utilisation" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FINANCIAL HUB — Xero/QuickBooks-Inspired
// ══════════════════════════════════════════════════════════════════════════════

const FinancialHub = () => {
  const [tab, setTab] = useState("overview"); // overview | invoices | expenses | cashflow

  const totalInvoiced = INVOICES.reduce((s, i) => s + i.amount, 0);
  const totalPaid = INVOICES.reduce((s, i) => s + i.paid, 0);
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const billableExpenses = EXPENSES.filter(e => e.billable).reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalPaid - totalExpenses;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>Financial Hub</h1>
          <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Invoicing · Expenses · Cash Flow</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{id:"overview",l:"Overview"},{id:"invoices",l:"Invoices"},{id:"expenses",l:"Expenses"},{id:"cashflow",l:"Cash Flow"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={btnStyle(tab === t.id ? "primary" : "outline")}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Invoiced", value: fmt(totalInvoiced) },
          { label: "Collected", value: fmt(totalPaid), color: C.success },
          { label: "Outstanding", value: fmt(totalInvoiced - totalPaid), color: C.warn },
          { label: "Expenses", value: fmt(totalExpenses), color: C.danger },
          { label: "Gross Profit", value: fmt(grossProfit), color: grossProfit > 0 ? C.success : C.danger },
        ].map((kpi, i) => (
          <div key={i} style={cardStyle({ textAlign: "center", padding: 14 })}>
            <div style={{ fontSize: 10, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.serif, color: kpi.color || C.ink }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Invoice Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[{ name: "Paid", value: INVOICES.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0) }, { name: "Partial", value: INVOICES.filter(i=>i.status==="Partial").reduce((s,i)=>s+i.amount-i.paid,0) }, { name: "Sent", value: INVOICES.filter(i=>i.status==="Sent").reduce((s,i)=>s+i.amount,0) }, { name: "Draft", value: INVOICES.filter(i=>i.status==="Draft").reduce((s,i)=>s+i.amount,0) }]} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                  <Cell fill={C.success} /><Cell fill={C.warn} /><Cell fill={C.info} /><Cell fill={C.inkMuted} />
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle()}>
            <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(() => { const cats = {}; EXPENSES.forEach(e => { cats[e.category] = (cats[e.category]||0) + e.amount; }); return Object.entries(cats).map(([cat,amt]) => ({ cat: cat.length > 12 ? cat.slice(0,12)+"…" : cat, amount: amt })).sort((a,b)=>b.amount-a.amount); })()}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                <XAxis dataKey="cat" tick={{ fontSize: 9, fill: C.inkMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£"+v} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
                <Bar dataKey="amount" fill={C.danger} radius={[4,4,0,0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Invoices */}
      {tab === "invoices" && (
        <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
                {["Invoice", "Event", "Client", "Amount", "Paid", "Status", "Due"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map(inv => {
                const statusColors = { Paid: C.success, Partial: C.warn, Sent: C.info, Draft: C.inkMuted };
                return (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, fontFamily: F.mono, fontSize: 12 }}>{inv.id}</td>
                    <td style={{ padding: "10px 12px" }}>{inv.event}</td>
                    <td style={{ padding: "10px 12px", color: C.inkSec }}>{inv.client}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{fmt(inv.amount)}</td>
                    <td style={{ padding: "10px 12px", color: C.success }}>{fmt(inv.paid)}</td>
                    <td style={{ padding: "10px 12px" }}><span style={pillStyle(statusColors[inv.status] + "20", statusColors[inv.status])}>{inv.status}</span></td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: C.inkMuted }}>{fmtShort(inv.due)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses */}
      {tab === "expenses" && (
        <div style={{ ...cardStyle({ padding: 0 }), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgWarm, borderBottom: `1px solid ${C.border}` }}>
                {["Category", "Event", "Amount", "Date", "Billable"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.inkMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXPENSES.map(exp => (
                <tr key={exp.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{exp.category}</td>
                  <td style={{ padding: "10px 12px", color: C.inkSec }}>{exp.event}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{fmt(exp.amount)}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: C.inkMuted }}>{fmtShort(exp.date)}</td>
                  <td style={{ padding: "10px 12px" }}><span style={pillStyle(exp.billable ? C.successBg : C.bgWarm, exp.billable ? C.success : C.inkMuted)}>{exp.billable ? "Billable" : "Non-billable"}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: C.bgWarm, borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>Total</td>
                <td></td>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>{fmt(totalExpenses)}</td>
                <td></td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: C.inkMuted }}>Billable: {fmt(billableExpenses)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Cash Flow */}
      {tab === "cashflow" && (
        <div style={cardStyle()}>
          <h3 style={{ fontFamily: F.serif, fontSize: 16, margin: "0 0 16px" }}>30-Day Cash Flow Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: C.inkMuted }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: C.inkMuted }} tickFormatter={v => "£"+(v/1000)+"k"} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6 }} />
              <Area type="monotone" dataKey="inflow" stroke={C.success} fill={C.success+"20"} name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke={C.danger} fill={C.danger+"20"} name="Outflow" />
              <Line type="monotone" dataKey="net" stroke={C.accent} strokeWidth={2} dot={false} name="Net" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// AI ASSISTANT — Smart Recommendations
// ══════════════════════════════════════════════════════════════════════════════

const AIAssistant = () => {
  const [query, setQuery] = useState("");

  const topLeads = [...LEADS].sort((a, b) => b.score - a.score).slice(0, 5);
  const atRiskEvents = EVENTS.filter(e => e.health < 60);
  const overloadedTeam = TEAM.filter(t => t.utilisation > 95);
  const overdueInvoices = INVOICES.filter(i => i.status !== "Paid" && new Date(i.due) < new Date());

  const insights = [
    { icon: "🎯", title: "Top Lead Opportunity", text: `${topLeads[0]?.name} scores ${topLeads[0]?.score}/100 with ${fmt(topLeads[0]?.revenue)} potential. Contact ${topLeads[0]?.contactName} (${topLeads[0]?.role}) to progress.`, priority: "high" },
    ...(atRiskEvents.length > 0 ? [{ icon: "⚠️", title: "At-Risk Events", text: `${atRiskEvents.length} event(s) have health below 60: ${atRiskEvents.map(e => e.name).join(", ")}. Immediate attention needed.`, priority: "high" }] : []),
    ...(overloadedTeam.length > 0 ? [{ icon: "👤", title: "Team Capacity Alert", text: `${overloadedTeam.map(t => t.name).join(", ")} ${overloadedTeam.length > 1 ? "are" : "is"} at ${overloadedTeam.map(t => pct(t.utilisation)).join(", ")} utilisation. Consider redistributing workload.`, priority: "medium" }] : []),
    ...(overdueInvoices.length > 0 ? [{ icon: "💰", title: "Overdue Invoices", text: `${overdueInvoices.length} invoice(s) overdue: ${overdueInvoices.map(i => i.id).join(", ")}. Follow up with clients.`, priority: "medium" }] : []),
    { icon: "📊", title: "Pipeline Health", text: `${EVENTS.filter(e=>e.health>=80).length} of ${EVENTS.length} events are healthy. Weighted pipeline value: ${fmt(EVENTS.reduce((s,e)=>s+e.revenue*e.probability/100,0))}.`, priority: "low" },
    { icon: "📈", title: "Lead Source Performance", text: `Top sources: ${(() => { const src={}; LEADS.forEach(l=>{src[l.source]=(src[l.source]||0)+1}); return Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([s,c])=>`${s} (${c})`).join(", "); })()}. Focus outreach on high-performing channels.`, priority: "low" },
    { icon: "🔮", title: "Revenue Forecast", text: `Confirmed revenue: ${fmt(EVENTS.filter(e=>["Confirmed","Planning","Execution"].includes(e.stage)).reduce((s,e)=>s+e.revenue,0))}. With proposals converting at 60%, expect additional ${fmt(Math.round(EVENTS.filter(e=>e.stage==="Proposal").reduce((s,e)=>s+e.revenue,0)*0.6))}.`, priority: "low" },
  ];

  const priorityColors = { high: { bg: C.dangerBg, border: C.dangerBorder, color: C.danger }, medium: { bg: C.warnBg, border: C.warnBorder, color: C.warn }, low: { bg: C.infoBg, border: C.infoBorder, color: C.info } };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, margin: 0 }}>AI Assistant</h1>
        <div style={{ color: C.inkMuted, fontSize: 13, marginTop: 2 }}>Smart insights · Recommendations · Natural language search</div>
      </div>

      {/* Search */}
      <div style={cardStyle({ marginBottom: 24, display: "flex", gap: 10 })}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask anything... e.g. 'Show me high-value leads in Mayfair' or 'Which events need attention?'" style={{ ...inputStyle, flex: 1 }} />
        <button style={btnStyle("primary")}>Ask AI</button>
      </div>

      {/* Insights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {insights.map((ins, i) => {
          const pc = priorityColors[ins.priority];
          return (
            <div key={i} style={{ ...cardStyle({ padding: 16 }), borderLeft: `3px solid ${pc.color}`, background: pc.bg }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{ins.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: C.ink }}>{ins.title}</div>
                  <div style={{ fontSize: 13, color: C.inkSec, lineHeight: 1.5 }}>{ins.text}</div>
                </div>
                <span style={pillStyle(pc.color + "20", pc.color)}>{ins.priority}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Leads */}
      <div style={cardStyle({ marginTop: 24 })}>
        <h3 style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px" }}>Top 5 Leads by AI Score</h3>
        {topLeads.map((l, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.borderLight}` : "none" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{l.name}</div>
              <div style={{ fontSize: 11, color: C.inkMuted }}>{l.contactName} · {l.location} · {l.stage}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(l.revenue)}</span>
              <span style={pillStyle(l.score >= 80 ? C.successBg : C.warnBg, l.score >= 80 ? C.success : C.warn)}>{l.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════════════════

const NAV = [
  { id: "command", label: "Command Centre", icon: "◎" },
  { id: "leads", label: "Lead Engine", icon: "◉" },
  { id: "pipeline", label: "Event Pipeline", icon: "▤" },
  { id: "time", label: "Time & Utilisation", icon: "◔" },
  { id: "finance", label: "Financial Hub", icon: "◈" },
  { id: "ai", label: "AI Assistant", icon: "◇" },
];

export default function App() {
  const [page, setPage] = useState("command");
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const pages = { command: CommandCentre, leads: LeadEngine, pipeline: EventPipeline, time: TimeUtilisation, finance: FinancialHub, ai: AIAssistant };
  const Page = pages[page] || CommandCentre;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: F.sans, color: C.ink }}>
      {/* Sidebar */}
      <nav style={{ width: 200, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 10 }}>
          <HHTLogo s={28} />
          <div>
            <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>HH&T</div>
            <div style={{ fontSize: 10, color: C.inkMuted, letterSpacing: 0.3 }}>Operations</div>
          </div>
        </div>
        <div style={{ padding: "12px 8px", flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px", marginBottom: 2, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontFamily: F.sans, fontWeight: page === n.id ? 600 : 400, background: page === n.id ? C.accentSubtle : "transparent", color: page === n.id ? C.accent : C.inkSec, transition: "all 0.15s" }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>JS</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Joe Stokoe</div>
              <div style={{ fontSize: 10, color: C.inkMuted }}>Director / BD</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "14px 24px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.card, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: C.inkMuted }}>{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={pillStyle(C.successBg, C.success)}>● 3 APIs Connected</span>
            <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: F.mono }}>Ghost Operator v4.0</span>
          </div>
        </header>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Page />
        </div>
      </main>
    </div>
  );
}
