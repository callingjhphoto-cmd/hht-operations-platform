import { useState, useEffect, useMemo, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADS, HEARTS & TAILS — OPERATIONS PLATFORM v3.0
// Design: High-End Editorial · Lead Generation Engine · Holistic Business OS
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
  stages: { identified: "#2A6680", researched: "#5B6AAF", contacted: "#956018", responded: "#B8922E", qualified: "#2B7A4B", meeting: "#1A6B4A", won: "#18150F", lost: "#9A948C" },
};
const F = { serif: "'Georgia','Times New Roman',serif", sans: "'Inter',-apple-system,'Segoe UI',sans-serif", mono: "'SF Mono','Fira Code',monospace" };

const HHTLogo = ({ s = 32 }) => (
  <svg width={s} height={s} viewBox="0 0 200 200" fill="none">
    <rect width="200" height="200" rx="12" fill={C.ink}/>
    <path d="M100 170C100 170 30 125 30 80C30 55 50 38 72 38C86 38 96 46 100 55C104 46 114 38 128 38C150 38 170 55 170 80C170 125 100 170 100 170Z" fill="white"/>
    <text x="100" y="128" textAnchor="middle" fontFamily="Georgia,serif" fontSize="90" fontWeight="bold" fill={C.ink}>&amp;</text>
  </svg>
);

// ━━ LEAD DATABASE (410 leads) ━━
const RAW_LEADS=[{n:"The Experimental Cocktail Club",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:60,note:"Hidden speakeasy with private hire, hosts cocktail masterclasses"},{n:"The Cocktail Club",l:"Oxford Circus",co:"London",cat:"Cocktail bars and speakeasies",cap:80,note:"Basement cocktail bar with strong event programming"},{n:"The Royal Cocktail Exchange",l:"Central London",co:"London",cat:"Cocktail bars and speakeasies",cap:100,note:"Multiple private areas, specializes in cocktail events"},{n:"The Little Violet Door",l:"Seven Dials",co:"London",cat:"Cocktail bars and speakeasies",cap:40,note:"Intimate speakeasy, hosts private cocktail experiences"},{n:"Punch Room",l:"Fitzrovia",co:"London",cat:"Cocktail bars and speakeasies",cap:50,note:"Punch-focused bar with event space"},{n:"Nightjar",l:"Shoreditch",co:"London",cat:"Cocktail bars and speakeasies",cap:80,note:"Award-winning speakeasy with live music and events"},{n:"The Clumsies Pop-Up",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:45,note:"Rotating pop-up concept, brand activation ready"},{n:"Swift Bar",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:60,note:"Two-floor cocktail bar, private hire available"},{n:"Lyaness",l:"Bankside",co:"London",cat:"Cocktail bars and speakeasies",cap:90,note:"World-class cocktail bar at Sea Containers"},{n:"Three Sheets",l:"Dalston",co:"London",cat:"Cocktail bars and speakeasies",cap:45,note:"Stripped-back cocktail bar with event potential"},{n:"Happiness Forgets",l:"Hoxton",co:"London",cat:"Cocktail bars and speakeasies",cap:40,note:"Basement speakeasy, intimate event hire"},{n:"Coupette",l:"Bethnal Green",co:"London",cat:"Cocktail bars and speakeasies",cap:50,note:"French-inspired cocktails, masterclass host"},{n:"Satan's Whiskers",l:"Bethnal Green",co:"London",cat:"Cocktail bars and speakeasies",cap:45,note:"Neighborhood cocktail bar, event-friendly"},{n:"The Sun Tavern",l:"Bethnal Green",co:"London",cat:"Cocktail bars and speakeasies",cap:70,note:"Irish whiskey focus, basement event space"},{n:"Bar Termini",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:35,note:"Italian-inspired, negroni specialists"},{n:"Tayēr + Elementary",l:"Old Street",co:"London",cat:"Cocktail bars and speakeasies",cap:60,note:"Dual-concept bar, World's 50 Best listed"},{n:"Kwānt",l:"Mayfair",co:"London",cat:"Cocktail bars and speakeasies",cap:80,note:"Moroccan-inspired luxury bar, private events"},{n:"Scarfes Bar",l:"Holborn",co:"London",cat:"Cocktail bars and speakeasies",cap:90,note:"Live jazz, private hire, high-end clientele"},{n:"The Wigmore",l:"Marylebone",co:"London",cat:"Cocktail bars and speakeasies",cap:100,note:"Michel Roux Jr pub/bar, event capacity"},{n:"Callooh Callay",l:"Shoreditch",co:"London",cat:"Cocktail bars and speakeasies",cap:70,note:"Multi-room speakeasy, private events upstairs"},{n:"Oriole",l:"Farringdon",co:"London",cat:"Cocktail bars and speakeasies",cap:85,note:"World's 50 Best, live music, brand activations"},{n:"Scout",l:"Hackney",co:"London",cat:"Cocktail bars and speakeasies",cap:55,note:"Sustainability-focused, brand partnership potential"},{n:"Nine Lives",l:"London Bridge",co:"London",cat:"Cocktail bars and speakeasies",cap:65,note:"Zero-waste cocktails, event hire available"},{n:"Silverleaf",l:"The City",co:"London",cat:"Cocktail bars and speakeasies",cap:120,note:"Pan Pac hotel bar, large event capacity"},{n:"Seed Library",l:"Shoreditch",co:"London",cat:"Cocktail bars and speakeasies",cap:45,note:"Seed-to-glass concept, masterclasses"},{n:"A Bar with Shapes for a Name",l:"Hackney",co:"London",cat:"Cocktail bars and speakeasies",cap:40,note:"Creative cocktails, intimate events"},{n:"Peg + Patriot",l:"Bethnal Green",co:"London",cat:"Cocktail bars and speakeasies",cap:50,note:"Town Hall Hotel bar, event-friendly"},{n:"Untitled Bar",l:"Dalston",co:"London",cat:"Cocktail bars and speakeasies",cap:55,note:"Korean-inspired speakeasy, private hire"},{n:"The Alchemist",l:"Various London",co:"London",cat:"Cocktail bars and speakeasies",cap:150,note:"Multi-site chain, theatrical cocktails, events"},{n:"Dishoom Permit Room",l:"Various London",co:"London",cat:"Cocktail bars and speakeasies",cap:60,note:"Bar within Dishoom, brand partnerships"},{n:"Mr Fogg's",l:"Various London",co:"London",cat:"Cocktail bars and speakeasies",cap:120,note:"Multi-venue brand, immersive events"},{n:"Cahoots",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:100,note:"1940s themed, strong events program"},{n:"The Blind Pig",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:50,note:"Above Social Eating House, private events"},{n:"Bar Swift",l:"Soho",co:"London",cat:"Cocktail bars and speakeasies",cap:55,note:"Two floors, late-night cocktails"},{n:"Blues Kitchen",l:"Camden/Brixton/Shoreditch",co:"London",cat:"Cocktail bars and speakeasies",cap:200,note:"Live music venue + cocktail bar, multi-site"},{n:"Behind This Wall",l:"Hackney",co:"London",cat:"Cocktail bars and speakeasies",cap:40,note:"Hidden bar, vinyl evenings, private hire"},{n:"Laki Kane",l:"Upper Street",co:"London",cat:"Cocktail bars and speakeasies",cap:70,note:"Tiki bar, cocktail experiences"},{n:"Original Sin",l:"Stoke Newington",co:"London",cat:"Cocktail bars and speakeasies",cap:45,note:"Wine cocktails, intimate events"},{n:"Limin Beach Club",l:"Old Street",co:"London",cat:"Cocktail bars and speakeasies",cap:80,note:"Caribbean cocktails, immersive events"},{n:"The Vault",l:"Milbank",co:"London",cat:"Cocktail bars and speakeasies",cap:65,note:"Bank vault speakeasy, private hire"},{n:"Angel's Share",l:"Edinburgh",co:"Lothian",cat:"Cocktail bars and speakeasies",cap:55,note:"Premium whisky cocktails, brand events"},{n:"Tipsy Bear",l:"Brighton",co:"East Sussex",cat:"Cocktail bars and speakeasies",cap:50,note:"Craft cocktails, private hire"},{n:"The Mesmerist",l:"Brighton",co:"East Sussex",cat:"Cocktail bars and speakeasies",cap:80,note:"Victorian-themed, events and private hire"},{n:"Gin Joint",l:"Brighton",co:"East Sussex",cat:"Cocktail bars and speakeasies",cap:45,note:"Gin specialists, tasting events"},{n:"Ruin",l:"Brighton",co:"East Sussex",cat:"Cocktail bars and speakeasies",cap:60,note:"Sustainable cocktails, brand events"},{n:"Jesse's at The Prince",l:"Brighton",co:"East Sussex",cat:"Cocktail bars and speakeasies",cap:40,note:"Neighborhood cocktail spot, private hire"},{n:"The Ivy Market Grill",l:"Covent Garden",co:"London",cat:"Independent restaurants with event spaces",cap:150,note:"Private dining rooms, high-profile clientele"},{n:"Dishoom",l:"Various London",co:"London",cat:"Independent restaurants with event spaces",cap:180,note:"Multiple venues, private dining, brand events"},{n:"Padella",l:"Borough",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Cult pasta restaurant, potential pop-up partner"},{n:"Brat",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:80,note:"Michelin-starred, private dining above"},{n:"St. John",l:"Clerkenwell",co:"London",cat:"Independent restaurants with event spaces",cap:100,note:"Iconic British, private hire available"},{n:"Barrafina",l:"Various London",co:"London",cat:"Independent restaurants with event spaces",cap:40,note:"Premium tapas, buyout potential"},{n:"The Wolseley",l:"Piccadilly",co:"London",cat:"Independent restaurants with event spaces",cap:180,note:"Grand European café, private events"},{n:"Sketch",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:200,note:"Multi-room concept, immersive events"},{n:"Chiltern Firehouse",l:"Marylebone",co:"London",cat:"Independent restaurants with event spaces",cap:150,note:"Celebrity haunt, brand activations"},{n:"The Palomar",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Jerusalem-style, private dining"},{n:"Gymkhana",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:90,note:"Indian fine dining, private rooms"},{n:"Cecconi's",l:"Mayfair",co:"London",cat:"Independent restaurants with event spaces",cap:120,note:"Italian, Soho House group events"},{n:"Duck & Waffle",l:"City of London",co:"London",cat:"Independent restaurants with event spaces",cap:130,note:"40th floor, private events with views"},{n:"Blacklock",l:"Various London",co:"London",cat:"Independent restaurants with event spaces",cap:80,note:"Chop house, basement event spaces"},{n:"Flat Iron",l:"Various London",co:"London",cat:"Independent restaurants with event spaces",cap:70,note:"Multi-site, affordable, event potential"},{n:"Bao",l:"Various London",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Taiwanese buns, buyout events"},{n:"Kiln",l:"Soho",co:"London",cat:"Independent restaurants with event spaces",cap:45,note:"Thai grill, intimate private dining"},{n:"Smoking Goat",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Thai-inspired, late night events"},{n:"The Quality Chop House",l:"Clerkenwell",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Historic chophouse, private dining"},{n:"Rochelle Canteen",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:80,note:"Hidden courtyard, private hire"},{n:"Lyle's",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Michelin-starred, full venue hire"},{n:"40 Maltby Street",l:"Bermondsey",co:"London",cat:"Independent restaurants with event spaces",cap:40,note:"Wine bar/restaurant, events under arches"},{n:"Brawn",l:"Columbia Road",co:"London",cat:"Independent restaurants with event spaces",cap:55,note:"Natural wine focus, private dining"},{n:"The River Café",l:"Hammersmith",co:"London",cat:"Independent restaurants with event spaces",cap:100,note:"Iconic Italian, garden events"},{n:"Spring",l:"Somerset House",co:"London",cat:"Independent restaurants with event spaces",cap:120,note:"Inside Somerset House, event-ready venue"},{n:"Leroy",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:35,note:"Natural wine, intimate hire"},{n:"Bubala",l:"Spitalfields",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Vegetarian Middle Eastern, private dining"},{n:"The Mantis Project",l:"Oxford",co:"Oxfordshire",cat:"Independent restaurants with event spaces",cap:70,note:"Cocktail-forward restaurant, events"},{n:"The Wheatsheaf",l:"Chilton Foliat",co:"Wiltshire",cat:"Independent restaurants with event spaces",cap:80,note:"Country pub restaurant, private hire"},{n:"Rick Stein",l:"Various",co:"Various",cat:"Independent restaurants with event spaces",cap:90,note:"Multi-site, private dining rooms"},{n:"The Fat Duck Group",l:"Bray",co:"Berkshire",cat:"Independent restaurants with event spaces",cap:45,note:"Heston's venues, private experiences"},{n:"The Hand and Flowers",l:"Marlow",co:"Buckinghamshire",cat:"Independent restaurants with event spaces",cap:70,note:"Tom Kerridge, private events"},{n:"The Waterside Inn",l:"Bray",co:"Berkshire",cat:"Independent restaurants with event spaces",cap:80,note:"3 Michelin stars, private riverside dining"},{n:"The Sportsman",l:"Seasalter",co:"Kent",cat:"Independent restaurants with event spaces",cap:50,note:"Michelin pub, exclusive hire"},{n:"Moor Hall",l:"Aughton",co:"Lancashire",cat:"Independent restaurants with event spaces",cap:60,note:"2 Michelin stars, event dining"},{n:"Core by Clare Smyth",l:"Notting Hill",co:"London",cat:"Independent restaurants with event spaces",cap:55,note:"3 Michelin stars, private dining"},{n:"The Clove Club",l:"Shoreditch",co:"London",cat:"Independent restaurants with event spaces",cap:60,note:"Michelin-starred, private dining events"},{n:"Cornerstone",l:"Hackney Wick",co:"London",cat:"Independent restaurants with event spaces",cap:50,note:"Chef Tom Brown, event hire"},{n:"Flor",l:"Borough",co:"London",cat:"Independent restaurants with event spaces",cap:45,note:"Wine-led dining, private events"},{n:"Sessions Arts Club",l:"Clerkenwell",co:"London",cat:"Independent restaurants with event spaces",cap:120,note:"Stunning interior, private events"},{n:"The Eagle",l:"Farringdon",co:"London",cat:"Pubs with event spaces",cap:80,note:"Original gastropub, private hire upstairs"},{n:"The Anchor Bankside",l:"Southwark",co:"London",cat:"Pubs with event spaces",cap:150,note:"Historic pub, multiple event rooms"},{n:"The Spaniards Inn",l:"Hampstead",co:"London",cat:"Pubs with event spaces",cap:120,note:"Historic tavern, garden events"},{n:"The Lamb and Flag",l:"Covent Garden",co:"London",cat:"Pubs with event spaces",cap:80,note:"Traditional pub, upstairs private hire"},{n:"The Churchill Arms",l:"Kensington",co:"London",cat:"Pubs with event spaces",cap:100,note:"Iconic floral pub, event potential"},{n:"The Pig's Ear",l:"Chelsea",co:"London",cat:"Pubs with event spaces",cap:70,note:"Gastropub, private dining room"},{n:"The Harwood Arms",l:"Fulham",co:"London",cat:"Pubs with event spaces",cap:60,note:"Michelin-starred pub, full hire"},{n:"The Marksman",l:"Hackney",co:"London",cat:"Pubs with event spaces",cap:80,note:"Award-winning gastropub, private room"},{n:"The Drapers Arms",l:"Islington",co:"London",cat:"Pubs with event spaces",cap:90,note:"Private dining, garden events"},{n:"The Canton Arms",l:"Stockwell",co:"London",cat:"Pubs with event spaces",cap:60,note:"Gastropub, private hire"},{n:"The Camberwell Arms",l:"Camberwell",co:"London",cat:"Pubs with event spaces",cap:70,note:"Modern British, event room"},{n:"The Scolt Head",l:"De Beauvoir",co:"London",cat:"Pubs with event spaces",cap:60,note:"Local gastropub, private room hire"},{n:"The Bull & Last",l:"Highgate",co:"London",cat:"Pubs with event spaces",cap:90,note:"Premium gastropub, events room"},{n:"The Dove",l:"Broadway Market",co:"London",cat:"Pubs with event spaces",cap:55,note:"Belgian beer pub, private hire"},{n:"The Compton Arms",l:"Islington",co:"London",cat:"Pubs with event spaces",cap:50,note:"Garden pub, event space"},{n:"The Princess of Shoreditch",l:"Shoreditch",co:"London",cat:"Pubs with event spaces",cap:100,note:"Upstairs dining, private events"},{n:"The Albion",l:"Islington",co:"London",cat:"Pubs with event spaces",cap:80,note:"Large garden, event capacity"},{n:"The Crown",l:"Brentwood",co:"Essex",cat:"Pubs with event spaces",cap:100,note:"Essex gastropub, private hire"},{n:"The Hand",l:"Amersham",co:"Buckinghamshire",cat:"Pubs with event spaces",cap:70,note:"Country pub, event space"},{n:"The Coach",l:"Marlow",co:"Buckinghamshire",cat:"Pubs with event spaces",cap:50,note:"Tom Kerridge, intimate events"},{n:"The Bell at Hampton Poyle",l:"Kidlington",co:"Oxfordshire",cat:"Pubs with event spaces",cap:80,note:"Country pub, garden events"},{n:"The Unruly Pig",l:"Bromeswell",co:"Suffolk",cat:"Pubs with event spaces",cap:60,note:"Award-winning, private dining"},{n:"The Five Bells",l:"Colne Engaine",co:"Essex",cat:"Pubs with event spaces",cap:50,note:"Village pub, garden events"},{n:"The Fordwich Arms",l:"Fordwich",co:"Kent",cat:"Pubs with event spaces",cap:70,note:"Michelin pub, private dining"},{n:"Madison",l:"One New Change",co:"London",cat:"Rooftop bars and terrace venues",cap:200,note:"St Paul's views, large events"},{n:"The Rooftop at The Trafalgar St. James",l:"Trafalgar Square",co:"London",cat:"Rooftop bars and terrace venues",cap:100,note:"Iconic views, cocktail events"},{n:"Sabine Rooftop Bar",l:"Holborn",co:"London",cat:"Rooftop bars and terrace venues",cap:80,note:"Mediterranean rooftop, private hire"},{n:"Savage Garden",l:"Tower Hill",co:"London",cat:"Rooftop bars and terrace venues",cap:120,note:"DoubleTree rooftop, events and brand launches"},{n:"Aviary",l:"Finsbury Square",co:"London",cat:"Rooftop bars and terrace venues",cap:150,note:"Premium rooftop, cocktail events"},{n:"Jin Bo Law",l:"Aldgate",co:"London",cat:"Rooftop bars and terrace venues",cap:80,note:"Asian-inspired rooftop, private events"},{n:"The Culpeper",l:"Spitalfields",co:"London",cat:"Rooftop bars and terrace venues",cap:60,note:"Rooftop greenhouse bar, private hire"},{n:"Netil360",l:"Hackney",co:"London",cat:"Rooftop bars and terrace venues",cap:100,note:"Rooftop with views, summer events"},{n:"Frank's Café",l:"Peckham",co:"London",cat:"Rooftop bars and terrace venues",cap:200,note:"Multi-storey car park rooftop, seasonal"},{n:"Bussey Rooftop Bar",l:"Peckham",co:"London",cat:"Rooftop bars and terrace venues",cap:150,note:"Panoramic views, event venue"},{n:"Boundary Rooftop",l:"Shoreditch",co:"London",cat:"Rooftop bars and terrace venues",cap:80,note:"Orangery and terrace, private hire"},{n:"The Nest",l:"Dalston",co:"London",cat:"Rooftop bars and terrace venues",cap:60,note:"Rooftop bar and events"},{n:"Sky Garden",l:"Walkie Talkie",co:"London",cat:"Rooftop bars and terrace venues",cap:300,note:"Fenchurch St, major event space"},{n:"Radio Rooftop",l:"Strand",co:"London",cat:"Rooftop bars and terrace venues",cap:120,note:"ME London, premium events"},{n:"Pergola on the Wharf",l:"Canary Wharf",co:"London",cat:"Rooftop bars and terrace venues",cap:400,note:"Large seasonal rooftop, corporate events"},{n:"The Shard viewing platforms",l:"London Bridge",co:"London",cat:"Rooftop bars and terrace venues",cap:250,note:"Event hire at various levels"},{n:"Gŏng Bar",l:"The Shard",co:"London",cat:"Rooftop bars and terrace venues",cap:80,note:"52nd floor, luxury cocktail events"},{n:"Aqua Shard",l:"London Bridge",co:"London",cat:"Rooftop bars and terrace venues",cap:200,note:"31st floor, private events"},{n:"Rumpus Room",l:"South Bank",co:"London",cat:"Rooftop bars and terrace venues",cap:100,note:"Mondrian Hotel, cocktail events"},{n:"The Ned Rooftop Pool",l:"City of London",co:"London",cat:"Rooftop bars and terrace venues",cap:120,note:"Members rooftop, brand events"},{n:"Soholistic",l:"Soho",co:"London",cat:"Rooftop bars and terrace venues",cap:60,note:"Wellness rooftop concept, events"},
// Members clubs
{n:"Soho House",l:"Various London",co:"London",cat:"Members clubs",cap:250,note:"Multi-venue, major events program"},{n:"The Groucho Club",l:"Soho",co:"London",cat:"Members clubs",cap:120,note:"Media/creative industry, events"},{n:"Home House",l:"Marylebone",co:"London",cat:"Members clubs",cap:200,note:"Georgian mansion, lavish events"},{n:"The Arts Club",l:"Mayfair",co:"London",cat:"Members clubs",cap:180,note:"Fine art focus, luxury events"},{n:"Annabel's",l:"Mayfair",co:"London",cat:"Members clubs",cap:200,note:"Legendary nightclub/members club"},{n:"5 Hertford Street",l:"Mayfair",co:"London",cat:"Members clubs",cap:150,note:"Ultra-exclusive, brand events"},{n:"The Hospital Club",l:"Covent Garden",co:"London",cat:"Members clubs",cap:150,note:"Creative industries, event spaces"},{n:"Century Club",l:"Soho",co:"London",cat:"Members clubs",cap:120,note:"Rooftop and event rooms"},{n:"The Curtain",l:"Shoreditch",co:"London",cat:"Members clubs",cap:200,note:"Hotel/members club, events"},{n:"AllBright",l:"Various London",co:"London",cat:"Members clubs",cap:100,note:"Women's club, corporate events"},{n:"The Ivy Club",l:"Soho",co:"London",cat:"Members clubs",cap:100,note:"Above The Ivy, private events"},{n:"Little House",l:"Mayfair",co:"London",cat:"Members clubs",cap:80,note:"Soho House sister, intimate events"},{n:"Laylow",l:"Notting Hill",co:"London",cat:"Members clubs",cap:90,note:"Music-focused, brand events"},{n:"The Conduit",l:"Mayfair",co:"London",cat:"Members clubs",cap:120,note:"Sustainability-focused, events"},{n:"Second Home",l:"Various London",co:"London",cat:"Members clubs",cap:80,note:"Creative workspace, event hire"},{n:"The Maine",l:"Mayfair",co:"London",cat:"Members clubs",cap:150,note:"Restaurant/members, events"},{n:"Mortimer House",l:"Fitzrovia",co:"London",cat:"Members clubs",cap:100,note:"Multi-floor members, events"},{n:"The Twenty Two",l:"Mayfair",co:"London",cat:"Members clubs",cap:80,note:"Hotel/members, intimate events"},{n:"The Marylebone",l:"Marylebone",co:"London",cat:"Members clubs",cap:60,note:"Boutique members, private hire"},
// Music venues
{n:"O2 Academy Brixton",l:"Brixton",co:"London",cat:"Music venues and live entertainment",cap:4921,note:"Major venue, needs bar operations"},{n:"The Roundhouse",l:"Camden",co:"London",cat:"Music venues and live entertainment",cap:3300,note:"Iconic venue, events and bar services"},{n:"KOKO Camden",l:"Camden",co:"London",cat:"Music venues and live entertainment",cap:1500,note:"Recently renovated, major events"},{n:"Village Underground",l:"Shoreditch",co:"London",cat:"Music venues and live entertainment",cap:800,note:"Arts venue, events and bar hire"},{n:"EartH Hackney",l:"Dalston",co:"London",cat:"Music venues and live entertainment",cap:1500,note:"Theatre/music, bar operations"},{n:"The Jazz Café",l:"Camden",co:"London",cat:"Music venues and live entertainment",cap:440,note:"Iconic jazz venue, cocktail bar"},{n:"Ronnie Scott's",l:"Soho",co:"London",cat:"Music venues and live entertainment",cap:250,note:"Legendary jazz, cocktail service"},{n:"The Scala",l:"King's Cross",co:"London",cat:"Music venues and live entertainment",cap:1150,note:"Multi-level, bar operations"},{n:"Electric Brixton",l:"Brixton",co:"London",cat:"Music venues and live entertainment",cap:1500,note:"Major music venue, bar services"},{n:"Fabric",l:"Farringdon",co:"London",cat:"Music venues and live entertainment",cap:2500,note:"Superclub, bar operations"},{n:"XOYO",l:"Shoreditch",co:"London",cat:"Music venues and live entertainment",cap:800,note:"Club/live music, bar services"},{n:"The Garage",l:"Islington",co:"London",cat:"Music venues and live entertainment",cap:600,note:"Rock venue, bar operations"},{n:"The Lexington",l:"Islington",co:"London",cat:"Music venues and live entertainment",cap:200,note:"Bourbon bar + live music"},{n:"The Windmill",l:"Brixton",co:"London",cat:"Music venues and live entertainment",cap:150,note:"Indie venue, craft bar"},{n:"Omeara",l:"London Bridge",co:"London",cat:"Music venues and live entertainment",cap:330,note:"Mumford & Sons venue, cocktail focus"},{n:"Lafayette",l:"King's Cross",co:"London",cat:"Music venues and live entertainment",cap:600,note:"New venue, bar operations"},{n:"HERE at Outernet",l:"Tottenham Court Road",co:"London",cat:"Music venues and live entertainment",cap:2000,note:"New immersive venue, bar services"},{n:"Printworks",l:"Surrey Quays",co:"London",cat:"Music venues and live entertainment",cap:5000,note:"Industrial venue, major events"},{n:"The Dome",l:"Tufnell Park",co:"London",cat:"Music venues and live entertainment",cap:500,note:"Intimate venue, bar hire"},{n:"The 100 Club",l:"Oxford Street",co:"London",cat:"Music venues and live entertainment",cap:350,note:"Historic venue, bar operations"},{n:"Bush Hall",l:"Shepherd's Bush",co:"London",cat:"Music venues and live entertainment",cap:400,note:"Edwardian hall, events"},{n:"Union Chapel",l:"Islington",co:"London",cat:"Music venues and live entertainment",cap:900,note:"Church venue, unique events"},{n:"The Troxy",l:"Stepney",co:"London",cat:"Music venues and live entertainment",cap:3000,note:"Art deco, major events"},{n:"Under The Bridge",l:"Chelsea",co:"London",cat:"Music venues and live entertainment",cap:600,note:"Under Stamford Bridge, events"},{n:"Colours Hoxton",l:"Hoxton",co:"London",cat:"Music venues and live entertainment",cap:700,note:"Multi-room club, bar operations"},{n:"Night Tales",l:"Hackney",co:"London",cat:"Music venues and live entertainment",cap:800,note:"Street food + music, bar services"},{n:"Corsica Studios",l:"Elephant & Castle",co:"London",cat:"Music venues and live entertainment",cap:400,note:"Club venue, bar operations"},{n:"The Cause",l:"Tottenham Hale",co:"London",cat:"Music venues and live entertainment",cap:600,note:"Community venue, bar operations"},{n:"Phonox",l:"Brixton",co:"London",cat:"Music venues and live entertainment",cap:600,note:"Late-night club, bar services"},{n:"Brilliant Corners",l:"Dalston",co:"London",cat:"Music venues and live entertainment",cap:80,note:"Hi-fi bar, cocktails + music"},{n:"Total Refreshment Centre",l:"Dalston",co:"London",cat:"Music venues and live entertainment",cap:200,note:"Jazz/world music, bar services"},
// Pop-up event spaces
{n:"The Truman Brewery",l:"Brick Lane",co:"London",cat:"Pop-up event spaces",cap:5000,note:"Multiple spaces, brand activations hub"},{n:"Tobacco Dock",l:"Wapping",co:"London",cat:"Pop-up event spaces",cap:10000,note:"Grade I listed, major events"},{n:"The Old Truman Brewery",l:"Shoreditch",co:"London",cat:"Pop-up event spaces",cap:3000,note:"Premier pop-up destination"},{n:"Bargehouse OXO Tower",l:"South Bank",co:"London",cat:"Pop-up event spaces",cap:500,note:"Warehouse gallery, brand launches"},{n:"The Vaults",l:"Waterloo",co:"London",cat:"Pop-up event spaces",cap:800,note:"Underground arches, immersive events"},{n:"Hoxton Docks",l:"Hoxton",co:"London",cat:"Pop-up event spaces",cap:250,note:"Canal-side, pop-up events"},{n:"The Steel Yard",l:"Cannon Street",co:"London",cat:"Pop-up event spaces",cap:1200,note:"Industrial venue, brand events"},{n:"Copeland Gallery",l:"Peckham",co:"London",cat:"Pop-up event spaces",cap:600,note:"Art gallery, pop-up space"},{n:"Brick Lane Yard",l:"Shoreditch",co:"London",cat:"Pop-up event spaces",cap:300,note:"Outdoor space, street food events"},{n:"Pop Brixton",l:"Brixton",co:"London",cat:"Pop-up event spaces",cap:400,note:"Community hub, brand activations"},{n:"Peckham Levels",l:"Peckham",co:"London",cat:"Pop-up event spaces",cap:500,note:"Multi-level space, events"},{n:"Protein Studios",l:"Shoreditch",co:"London",cat:"Pop-up event spaces",cap:250,note:"Photography/event space"},{n:"MC Motors",l:"Dalston",co:"London",cat:"Pop-up event spaces",cap:350,note:"Classic car showroom events"},{n:"The Boiler House",l:"Brick Lane",co:"London",cat:"Pop-up event spaces",cap:400,note:"Gallery/event space"},{n:"Old Selfridges Hotel",l:"Marylebone",co:"London",cat:"Pop-up event spaces",cap:2000,note:"Massive pop-up potential"},{n:"Icetank Studios",l:"Covent Garden",co:"London",cat:"Pop-up event spaces",cap:200,note:"White cube event space"},{n:"Shoreditch Studios",l:"Shoreditch",co:"London",cat:"Pop-up event spaces",cap:300,note:"Multi-use studio, events"},{n:"The Pickle Factory",l:"Oval Space",co:"London",cat:"Pop-up event spaces",cap:350,note:"Club/event space, brand launches"},{n:"Netil House",l:"Hackney",co:"London",cat:"Pop-up event spaces",cap:200,note:"Creative hub, rooftop events"},{n:"The Bike Shed",l:"Shoreditch",co:"London",cat:"Pop-up event spaces",cap:400,note:"Motorcycle club, event hire"},{n:"JJ Locations",l:"Various London",co:"London",cat:"Pop-up event spaces",cap:300,note:"Film location/event venues"},{n:"Science Gallery",l:"London Bridge",co:"London",cat:"Pop-up event spaces",cap:250,note:"King's College, brand events"},{n:"Now Gallery",l:"Greenwich",co:"London",cat:"Pop-up event spaces",cap:350,note:"Contemporary gallery, events"},{n:"Coal Drops Yard",l:"King's Cross",co:"London",cat:"Pop-up event spaces",cap:500,note:"Premium retail, pop-up events"},{n:"Flat Iron Square",l:"Southwark",co:"London",cat:"Pop-up event spaces",cap:600,note:"Food market, event space"},{n:"Mercato Metropolitano",l:"Elephant & Castle",co:"London",cat:"Pop-up event spaces",cap:800,note:"Sustainable market, events"},{n:"Boxpark",l:"Various London",co:"London",cat:"Pop-up event spaces",cap:600,note:"Multi-site, brand activations"},{n:"Ely's Yard",l:"Brick Lane",co:"London",cat:"Pop-up event spaces",cap:300,note:"Open-air yard, pop-up events"},{n:"The Underdog Gallery",l:"London Bridge",co:"London",cat:"Pop-up event spaces",cap:200,note:"Underground gallery, events"},{n:"Studio Spaces",l:"Wapping",co:"London",cat:"Pop-up event spaces",cap:400,note:"Warehouse studios, brand events"},{n:"Islington Metal Works",l:"Islington",co:"London",cat:"Pop-up event spaces",cap:250,note:"Industrial chic, events"},{n:"The Coronet",l:"Elephant",co:"London",cat:"Pop-up event spaces",cap:500,note:"Theatre turned events"},{n:"The Yard",l:"Hackney Wick",co:"London",cat:"Pop-up event spaces",cap:300,note:"Theatre/events, bar hire"},{n:"E1 London",l:"Wapping",co:"London",cat:"Pop-up event spaces",cap:1500,note:"Mega venue, brand events"},{n:"Kindred Studios",l:"Ladbroke Grove",co:"London",cat:"Pop-up event spaces",cap:200,note:"Creative event space"},{n:"Somerset House",l:"Strand",co:"London",cat:"Pop-up event spaces",cap:2000,note:"Major cultural venue, events"},
// Nightclubs
{n:"Ministry of Sound",l:"Elephant & Castle",co:"London",cat:"Nightclubs",cap:1500,note:"Superclub, major bar operations"},{n:"Heaven",l:"Charing Cross",co:"London",cat:"Nightclubs",cap:1200,note:"Iconic LGBTQ+ club, bar services"},{n:"Egg London",l:"King's Cross",co:"London",cat:"Nightclubs",cap:800,note:"Multi-room, garden, bar ops"},{n:"The Clapham Grand",l:"Clapham",co:"London",cat:"Nightclubs",cap:1250,note:"Grade II venue, events + bar"},{n:"Studio 338",l:"Greenwich",co:"London",cat:"Nightclubs",cap:2500,note:"Super venue, bar operations"},{n:"Drumsheds",l:"Tottenham",co:"London",cat:"Nightclubs",cap:10000,note:"Broadwick Live super venue"},{n:"Magazine London",l:"Greenwich",co:"London",cat:"Nightclubs",cap:3000,note:"Events venue, bar services"},{n:"Outernet",l:"Tottenham Court Rd",co:"London",cat:"Nightclubs",cap:2000,note:"Immersive venue, bar ops"},{n:"Cargo",l:"Shoreditch",co:"London",cat:"Nightclubs",cap:600,note:"Bar/club, courtyard events"},{n:"93 Feet East",l:"Brick Lane",co:"London",cat:"Nightclubs",cap:500,note:"Bar/club, outdoor events"},{n:"The Nest",l:"Dalston",co:"London",cat:"Nightclubs",cap:200,note:"Intimate club, bar services"},{n:"Oval Space",l:"Bethnal Green",co:"London",cat:"Nightclubs",cap:800,note:"Warehouse club, bar operations"},{n:"Paradise Row",l:"Bethnal Green",co:"London",cat:"Nightclubs",cap:300,note:"Bar/club, events"},{n:"Hoxley & Porter",l:"Islington",co:"London",cat:"Nightclubs",cap:250,note:"Late-night bar/club"},{n:"Cirque le Soir",l:"Soho",co:"London",cat:"Nightclubs",cap:300,note:"Upscale circus-themed"},{n:"Tape London",l:"Mayfair",co:"London",cat:"Nightclubs",cap:200,note:"Ultra-premium, brand events"},{n:"Loulou's",l:"Mayfair",co:"London",cat:"Nightclubs",cap:250,note:"Members nightclub"},{n:"Raffles",l:"Chelsea",co:"London",cat:"Nightclubs",cap:350,note:"Premium nightclub"},{n:"The Box Soho",l:"Soho",co:"London",cat:"Nightclubs",cap:300,note:"Theatrical nightclub, events"},
// Wine bars
{n:"Noble Rot",l:"Lamb's Conduit",co:"London",cat:"Wine bars",cap:50,note:"Acclaimed wine bar, tasting events"},{n:"Sager + Wilde",l:"Hackney",co:"London",cat:"Wine bars",cap:60,note:"Natural wine, private events"},{n:"Vinoteca",l:"Various London",co:"London",cat:"Wine bars",cap:70,note:"Multi-site, wine events"},{n:"Gordon's Wine Bar",l:"Embankment",co:"London",cat:"Wine bars",cap:100,note:"Historic cave bar, iconic"},{n:"The Winemakers Club",l:"Farringdon",co:"London",cat:"Wine bars",cap:40,note:"Wine education, tastings"},{n:"Vagabond Wines",l:"Various London",co:"London",cat:"Wine bars",cap:80,note:"Self-pour, tasting events"},{n:"Compagnie des Vins Surnaturels",l:"Soho",co:"London",cat:"Wine bars",cap:60,note:"Natural wine, private dining"},{n:"Terroirs",l:"Charing Cross",co:"London",cat:"Wine bars",cap:50,note:"Natural wine pioneer, events"},{n:"Bottles",l:"Clapton",co:"London",cat:"Wine bars",cap:35,note:"Neighborhood wine bar"},{n:"P Franco",l:"Clapton",co:"London",cat:"Wine bars",cap:30,note:"Natural wine, guest chef events"},{n:"Bar Crispin",l:"Soho",co:"London",cat:"Wine bars",cap:45,note:"Wine-led dining, events"},{n:"Top Cuvée",l:"Finsbury Park",co:"London",cat:"Wine bars",cap:35,note:"Neighborhood wine bar, events"},{n:"Bright",l:"London Fields",co:"London",cat:"Wine bars",cap:40,note:"Wine/restaurant, private hire"},{n:"Humble Grape",l:"Various London",co:"London",cat:"Wine bars",cap:80,note:"Multi-site, wine events"},{n:"67 Pall Mall",l:"St James's",co:"London",cat:"Wine bars",cap:100,note:"Premium wine club, events"},{n:"Berry Bros. & Rudd",l:"St James's",co:"London",cat:"Wine bars",cap:60,note:"Historic wine merchant, tastings"},{n:"Hedonism Wines",l:"Mayfair",co:"London",cat:"Wine bars",cap:50,note:"Luxury wine shop, events"},{n:"The 10 Cases",l:"Covent Garden",co:"London",cat:"Wine bars",cap:40,note:"Natural wine, intimate events"},{n:"Passione Vino",l:"Borough",co:"London",cat:"Wine bars",cap:35,note:"Italian wine, events"},{n:"Furanxo",l:"Bermondsey",co:"London",cat:"Wine bars",cap:30,note:"Spanish wine bar, events"},
// Brewery taprooms
{n:"Beavertown Brewery",l:"Tottenham Hale",co:"London",cat:"Brewery taprooms",cap:300,note:"Major craft brewery, events space"},{n:"The Kernel Brewery",l:"Bermondsey",co:"London",cat:"Brewery taprooms",cap:100,note:"Bermondsey Beer Mile, events"},{n:"Fourpure Brewing",l:"Bermondsey",co:"London",cat:"Brewery taprooms",cap:200,note:"Large taproom, events"},{n:"Partizan Brewing",l:"Bermondsey",co:"London",cat:"Brewery taprooms",cap:60,note:"Craft brewery, events"},{n:"Pressure Drop",l:"Tottenham",co:"London",cat:"Brewery taprooms",cap:150,note:"Craft brewery, event space"},{n:"Gipsy Hill Brewing",l:"Gipsy Hill",co:"London",cat:"Brewery taprooms",cap:120,note:"Community brewery, events"},{n:"Brew By Numbers",l:"Bermondsey",co:"London",cat:"Brewery taprooms",cap:80,note:"Beer Mile, private events"},{n:"Five Points Brewing",l:"Hackney",co:"London",cat:"Brewery taprooms",cap:150,note:"Large taproom, events"},{n:"Howling Hops",l:"Hackney Wick",co:"London",cat:"Brewery taprooms",cap:200,note:"Tank bar, events"},{n:"Canopy Beer Co",l:"Herne Hill",co:"London",cat:"Brewery taprooms",cap:100,note:"Railway arch brewery, events"},{n:"40FT Brewery",l:"Dalston",co:"London",cat:"Brewery taprooms",cap:150,note:"Container brewery, events"},{n:"One Mile End",l:"Whitechapel",co:"London",cat:"Brewery taprooms",cap:80,note:"Pub brewery, events"},{n:"Mondo Brewing",l:"Battersea",co:"London",cat:"Brewery taprooms",cap:100,note:"Taproom, events"},{n:"Signature Brew",l:"Walthamstow",co:"London",cat:"Brewery taprooms",cap:200,note:"Music brewery, events"},{n:"Wild Card Brewery",l:"Walthamstow",co:"London",cat:"Brewery taprooms",cap:100,note:"Taproom, community events"},{n:"Verdant Brewing",l:"Bermondsey",co:"London",cat:"Brewery taprooms",cap:80,note:"Taproom, events"},{n:"Duration Brewing",l:"Hackney Wick",co:"London",cat:"Brewery taprooms",cap:60,note:"Barrel-aged, events"},{n:"Villages Brewery",l:"Deptford",co:"London",cat:"Brewery taprooms",cap:100,note:"Taproom, events"},{n:"Orbit Beers",l:"Walworth",co:"London",cat:"Brewery taprooms",cap:80,note:"Railway arch, events"},{n:"Hammerton Brewery",l:"Islington",co:"London",cat:"Brewery taprooms",cap:120,note:"Taproom, large events"},
// Street food markets
{n:"Borough Market",l:"London Bridge",co:"London",cat:"Street food markets",cap:1000,note:"Iconic market, bar pop-ups"},{n:"Maltby Street Market",l:"Bermondsey",co:"London",cat:"Street food markets",cap:300,note:"Railway arches, bar services"},{n:"Broadway Market",l:"Hackney",co:"London",cat:"Street food markets",cap:500,note:"Saturday market, drinks events"},{n:"Druid Street Market",l:"Bermondsey",co:"London",cat:"Street food markets",cap:200,note:"Artisan market, bar potential"},{n:"Kerb",l:"Various London",co:"London",cat:"Street food markets",cap:400,note:"Multi-site street food, bar services"},{n:"Street Feast",l:"Various London",co:"London",cat:"Street food markets",cap:600,note:"Night markets with bars"},{n:"Dinerama",l:"Shoreditch",co:"London",cat:"Street food markets",cap:500,note:"Street food + cocktails"},{n:"Hawker House",l:"Canada Water",co:"London",cat:"Street food markets",cap:400,note:"Asian market, bar operations"},{n:"Market Hall",l:"Various London",co:"London",cat:"Street food markets",cap:300,note:"Multi-site food hall, bars"},{n:"Buck Street Market",l:"Camden",co:"London",cat:"Street food markets",cap:250,note:"Outdoor market, bar pop-ups"},{n:"Vinegar Yard",l:"London Bridge",co:"London",cat:"Street food markets",cap:300,note:"Outdoor food/drink venue"},{n:"Arcade Food Theatre",l:"Centre Point",co:"London",cat:"Street food markets",cap:250,note:"Premium food hall, cocktail bar"},
// Festival organizers
{n:"We Are FSTVL",l:"Essex",co:"Essex",cat:"Festival organizers",cap:40000,note:"Major festival, bar contracts"},{n:"Lovebox Festival",l:"Gunnersbury Park",co:"London",cat:"Festival organizers",cap:45000,note:"London festival, bar services"},{n:"Field Day",l:"Victoria Park",co:"London",cat:"Festival organizers",cap:30000,note:"Music festival, bar operations"},{n:"All Points East",l:"Victoria Park",co:"London",cat:"Festival organizers",cap:40000,note:"Major festival, bar contracts"},{n:"BST Hyde Park",l:"Hyde Park",co:"London",cat:"Festival organizers",cap:65000,note:"Premium concerts, VIP bars"},{n:"Mighty Hoopla",l:"Brockwell Park",co:"London",cat:"Festival organizers",cap:25000,note:"Pop festival, bar services"},{n:"Wide Awake Festival",l:"Brockwell Park",co:"London",cat:"Festival organizers",cap:15000,note:"Arts festival, cocktail bars"},{n:"Taste of London",l:"Regent's Park",co:"London",cat:"Festival organizers",cap:20000,note:"Food festival, major bar presence"},{n:"London Cocktail Week",l:"Various London",co:"London",cat:"Festival organizers",cap:50000,note:"KEY TARGET - cocktail festival"},{n:"Imbibe Live",l:"Olympia",co:"London",cat:"Festival organizers",cap:10000,note:"Trade show, brand activations"},{n:"Wilderness Festival",l:"Cornbury Park",co:"Oxfordshire",cat:"Festival organizers",cap:20000,note:"Boutique festival, premium bars"},{n:"Pub in the Park",l:"Various",co:"Various",cat:"Festival organizers",cap:15000,note:"Tom Kerridge, food/drink"},{n:"Gin & Rum Festival",l:"Various",co:"Various",cat:"Festival organizers",cap:5000,note:"Spirits festival, perfect fit"},{n:"The Whisky Show",l:"Old Billingsgate",co:"London",cat:"Festival organizers",cap:8000,note:"Premium whisky, brand activations"},{n:"Craft Beer Rising",l:"Brick Lane",co:"London",cat:"Festival organizers",cap:6000,note:"Craft beer trade show"},{n:"Meatopia",l:"Tobacco Dock",co:"London",cat:"Festival organizers",cap:10000,note:"Food/fire festival, bar services"},{n:"Winter Wonderland",l:"Hyde Park",co:"London",cat:"Festival organizers",cap:100000,note:"Massive event, bar contracts"},{n:"Notting Hill Carnival",l:"Notting Hill",co:"London",cat:"Festival organizers",cap:2000000,note:"Major carnival, bar pop-ups"},{n:"Greenwich+Docklands Festival",l:"Greenwich",co:"London",cat:"Festival organizers",cap:80000,note:"Free arts festival, bars"},{n:"Eat & Drink Festival",l:"Olympia",co:"London",cat:"Festival organizers",cap:15000,note:"Consumer food/drink show"},
// Drinks brands
{n:"Sipsmith Gin",l:"Chiswick",co:"London",cat:"Drinks brands",cap:0,note:"London gin, brand activations"},{n:"Beefeater Gin",l:"Kennington",co:"London",cat:"Drinks brands",cap:0,note:"Heritage gin, distillery events"},{n:"Hayman's Gin",l:"Balham",co:"London",cat:"Drinks brands",cap:0,note:"Family distillers, trade events"},{n:"Jensen's Gin",l:"Bermondsey",co:"London",cat:"Drinks brands",cap:0,note:"Bermondsey distillery, tastings"},{n:"East London Liquor Co",l:"Bow Wharf",co:"London",cat:"Drinks brands",cap:0,note:"Distillery + bar, events"},{n:"Portobello Road Gin",l:"Notting Hill",co:"London",cat:"Drinks brands",cap:0,note:"Gin museum, brand events"},{n:"Tarquin's Gin",l:"Cornwall",co:"Cornwall",cat:"Drinks brands",cap:0,note:"Craft gin, London activations"},{n:"Chase Distillery",l:"Herefordshire",co:"Herefordshire",cat:"Drinks brands",cap:0,note:"Farm distillery, trade events"},{n:"Warner's Gin",l:"Northamptonshire",co:"Northamptonshire",cat:"Drinks brands",cap:0,note:"Farm gin, brand activations"},{n:"Whitley Neill",l:"Various",co:"Various",cat:"Drinks brands",cap:0,note:"Multi-flavour gin brand"},{n:"The London Essence Co",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Premium mixers, bar partnerships"},{n:"Fever-Tree",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Premium mixers, trade events"},{n:"Lyre's Non-Alcoholic",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Non-alc spirits, activations"},{n:"Seedlip",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Non-alc pioneer, brand events"},{n:"Three Spirit",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Functional non-alc, activations"},{n:"Discarded Spirits",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Sustainable spirits, events"},{n:"Dalston Soda",l:"Dalston",co:"London",cat:"Drinks brands",cap:0,note:"Craft sodas, bar partnerships"},{n:"Square Root Soda",l:"Hackney",co:"London",cat:"Drinks brands",cap:0,note:"Small batch sodas, events"},{n:"Bermondsey Distillery",l:"Bermondsey",co:"London",cat:"Drinks brands",cap:0,note:"Multi-spirit distillery"},{n:"58 Gin",l:"Haggerston",co:"London",cat:"Drinks brands",cap:0,note:"London gin, bar activations"},{n:"Two Drifters Rum",l:"Exeter",co:"Devon",cat:"Drinks brands",cap:0,note:"Carbon-negative rum, events"},{n:"The Lakes Distillery",l:"Lake District",co:"Cumbria",cat:"Drinks brands",cap:0,note:"Whisky/gin, London events"},{n:"Kyrö Distillery",l:"London office",co:"London",cat:"Drinks brands",cap:0,note:"Finnish rye gin/whisky"},{n:"Haku Vodka",l:"Beam Suntory",co:"London",cat:"Drinks brands",cap:0,note:"Japanese rice vodka"},{n:"Roku Gin",l:"Beam Suntory",co:"London",cat:"Drinks brands",cap:0,note:"Japanese gin, bar activations"},{n:"Patrón Tequila",l:"Bacardi UK",co:"London",cat:"Drinks brands",cap:0,note:"Premium tequila, events"},{n:"Grey Goose",l:"Bacardi UK",co:"London",cat:"Drinks brands",cap:0,note:"Premium vodka, activations"},{n:"Hendrick's Gin",l:"William Grant",co:"London",cat:"Drinks brands",cap:0,note:"Eccentric gin, brand events"},{n:"Monkey 47",l:"Pernod Ricard",co:"London",cat:"Drinks brands",cap:0,note:"Premium gin, activations"},{n:"Diplomatico Rum",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Venezuelan rum, trade events"},{n:"Classe Azul Tequila",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Ultra-premium tequila"},{n:"Ketel One",l:"Diageo UK",co:"London",cat:"Drinks brands",cap:0,note:"Premium vodka, bar events"},{n:"Tanqueray",l:"Diageo UK",co:"London",cat:"Drinks brands",cap:0,note:"Heritage gin, activations"},{n:"Don Julio",l:"Diageo UK",co:"London",cat:"Drinks brands",cap:0,note:"Premium tequila, events"},{n:"Casamigos",l:"Diageo UK",co:"London",cat:"Drinks brands",cap:0,note:"Celebrity tequila, events"},{n:"Belvedere Vodka",l:"LVMH",co:"London",cat:"Drinks brands",cap:0,note:"Luxury vodka, activations"},{n:"Bumbu Rum",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Caribbean rum, events"},{n:"Dead Man's Fingers",l:"Halewood",co:"London",cat:"Drinks brands",cap:0,note:"Flavoured rum, activations"},{n:"Jägermeister",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Major brand, bar events"},{n:"Campari Group",l:"London",co:"London",cat:"Drinks brands",cap:0,note:"Aperol/Campari, activations"},
// Corporate event planners
{n:"Quintessentially Events",l:"Mayfair",co:"London",cat:"Corporate event planners",cap:0,note:"Luxury event planning, needs bar services"},{n:"Jack Morton Worldwide",l:"Farringdon",co:"London",cat:"Corporate event planners",cap:0,note:"Global brand experiences"},{n:"George P. Johnson",l:"Various",co:"London",cat:"Corporate event planners",cap:0,note:"Experiential marketing"},{n:"Imagination",l:"Store Street",co:"London",cat:"Corporate event planners",cap:0,note:"Brand experience agency"},{n:"Innovision",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Corporate events"},{n:"Banks Sadler",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Corporate event management"},{n:"Sledge",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Brand experiences"},{n:"BrandFuel",l:"Clerkenwell",co:"London",cat:"Corporate event planners",cap:0,note:"Corporate hospitality"},{n:"Rapiergroup",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Events and exhibitions"},{n:"The Event Company",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Full-service events"},{n:"Concerto Group",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Live experiences"},{n:"Chillisauce",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Corporate entertainment"},{n:"Eventist Group",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Multi-brand events"},{n:"Lively",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Team building, corporate events"},{n:"Hire Space",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Venue finding platform"},{n:"Venue Lab",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Venue sourcing specialists"},{n:"Arena Group",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Temporary structures/events"},{n:"Identity",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Brand activations"},{n:"Smyle",l:"London",co:"London",cat:"Corporate event planners",cap:0,note:"Events and experiences"},{n:"DRPG",l:"Various",co:"London",cat:"Corporate event planners",cap:0,note:"Creative communications"},
// PR and creative agencies
{n:"Fox in the Well",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Drinks consultancy, needs execution partner"},{n:"Wonderworks",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Brand strategy, drinks focus"},{n:"Cirkle",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Consumer PR, drinks clients"},{n:"The Communication Store",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Luxury brands PR"},{n:"Fever PR",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Consumer PR, brand events"},{n:"Frank PR",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Consumer PR, activations"},{n:"The Academy",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Consumer PR agency"},{n:"DeVries Global",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Drinks/spirits PR"},{n:"M&C Saatchi Sport & Ent",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Sports/entertainment, brand events"},{n:"Tin Man Communications",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Creative PR, events"},{n:"Speed Communications",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Food/drink PR specialists"},{n:"Palm PR",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Lifestyle PR, events"},{n:"Manifest",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Brand experience agency"},{n:"Hope & Glory PR",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Consumer PR, launches"},{n:"Edelman",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Global PR, food/drink division"},{n:"Ogilvy",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Global agency, brand events"},{n:"Purple",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Lifestyle PR, events"},{n:"Red Consultancy",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Consumer PR, drinks"},{n:"W Communications",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Consumer/lifestyle PR"},{n:"Bacchus Agency",l:"London",co:"London",cat:"PR and creative agencies",cap:0,note:"Specialist drinks PR agency"},
// Wedding and private event planners
{n:"Bruce Russell Events",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Luxury weddings, needs mobile bar"},{n:"Fait Accompli",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"High-end events, cocktail service"},{n:"Banana Split",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Wedding/events, bar hire"},{n:"Somebody To Love Events",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Boutique weddings, cocktails"},{n:"Snapdragon Parties",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"London events, bar services"},{n:"Liz Linkleter Events",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Luxury events, cocktail bars"},{n:"Pocketful of Dreams",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Creative weddings, bar styling"},{n:"The Events Company",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Corporate/private events"},{n:"Planned for Perfection",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Luxury weddings, drink service"},{n:"Helaina Storey",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"High-society events"},{n:"Couture Events",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Bespoke events, bars"},{n:"Sarah Haywood",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Luxury wedding planner"},{n:"Bespoke Events",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Corporate events, bar hire"},{n:"Bluebird Events",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Events agency, bar services"},{n:"Sternberg Clarke",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Entertainment agency, events"},{n:"CountryHouseWeddings.co.uk",l:"Various",co:"Various",cat:"Wedding and private event planners",cap:0,note:"Venue directory, referral potential"},{n:"Coco Wedding Venues",l:"Various",co:"Various",cat:"Wedding and private event planners",cap:0,note:"Venue platform, partnership"},{n:"Bridebook",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Wedding platform, supplier listing"},{n:"Hitched",l:"London",co:"London",cat:"Wedding and private event planners",cap:0,note:"Wedding marketplace, bar services"}];

// Enrich leads with pipeline data
const STAGES = ["Identified","Researched","Contacted","Responded","Qualified","Meeting Booked","Won","Lost"];
const STAGE_COLORS = [C.stages.identified,C.stages.researched,C.stages.contacted,C.stages.responded,C.stages.qualified,C.stages.meeting,C.stages.won,C.stages.lost];
const STATUSES = ["New","Researched","Email Sent","Responded","Qualified","Meeting Set","Won","Lost","Paused"];

const seedRand = (s) => { let h=0; for(let i=0;i<s.length;i++){h=Math.imul(31,h)+s.charCodeAt(i)|0;} return()=>{h=Math.imul(h^h>>>16,0x45d9f3b);h=Math.imul(h^h>>>13,0x45d9f3b);return((h^=h>>>16)>>>0)/4294967296;}; };

const LEADS = RAW_LEADS.map((r,i) => {
  const rng = seedRand(r.n+i);
  const stageIdx = Math.floor(rng()*6.5);
  const score = Math.floor(rng()*60+20);
  const status = stageIdx<1?"New":stageIdx<2?"Researched":stageIdx<3?"Email Sent":stageIdx<4?"Responded":stageIdx<5?"Qualified":stageIdx<6?"Meeting Set":"Won";
  const days = Math.floor(rng()*90);
  const d = new Date(); d.setDate(d.getDate()-days);
  const value = r.cat.includes("brand")?Math.floor(rng()*15000+5000):r.cat.includes("Festival")?Math.floor(rng()*25000+8000):Math.floor(rng()*8000+1500);
  return { id:i+1, name:r.n, location:r.l, county:r.co, category:r.cat, capacity:r.cap, note:r.note, score, stage:STAGES[Math.min(stageIdx,7)], status, lastActivity:d.toISOString().split("T")[0], value, priority:score>70?"High":score>45?"Medium":"Low", contacted:stageIdx>=2, responded:stageIdx>=3, email:`info@${r.n.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,20)}.co.uk` };
});

const CATEGORIES = [...new Set(LEADS.map(l=>l.category))].sort();
const COUNTIES = [...new Set(LEADS.map(l=>l.county))].sort();

// ━━ SAMPLE DATA ━━
const revData = [{m:"Jan",rev:42000,cost:28000},{m:"Feb",rev:35000,cost:24000},{m:"Mar",rev:48000,cost:30000},{m:"Apr",rev:62000,cost:35000},{m:"May",rev:78000,cost:42000},{m:"Jun",rev:85000,cost:44000},{m:"Jul",rev:92000,cost:48000},{m:"Aug",rev:88000,cost:45000},{m:"Sep",rev:95000,cost:50000},{m:"Oct",rev:110000,cost:55000},{m:"Nov",rev:125000,cost:58000},{m:"Dec",rev:140000,cost:62000}];
const pipeData = [{name:"Bombay Sapphire",type:"Brand Activation",value:35000,stage:"Confirmed",date:"2026-04-15"},{name:"Coca-Cola",type:"Festival Pop-Up",value:28000,stage:"Confirmed",date:"2026-05-20"},{name:"Taste of London",type:"Drinks Village",value:65000,stage:"Confirmed",date:"2026-06-15"},{name:"Silverstone",type:"Paddock Hospitality",value:48000,stage:"Proposal",date:"2026-07-04"},{name:"Glenmorangie",type:"Masterclass Series",value:22000,stage:"Proposal",date:"2026-03-20"},{name:"The Whisky Exchange",type:"Tasting Event",value:18000,stage:"Lead",date:"2026-08-10"},{name:"Pernod Ricard",type:"Trade Advocacy",value:42000,stage:"Negotiation",date:"2026-09-01"},{name:"Winter Wonderland",type:"Pop-Up Bar",value:55000,stage:"Lead",date:"2026-11-20"}];
const teamData = [{name:"Joe Stokoe",role:"Director",util:55,hours:160},{name:"Seb",role:"Creative Director",util:75,hours:180},{name:"Emily",role:"Events Manager",util:70,hours:165},{name:"Jason",role:"Operations",util:38,hours:90}];

// ━━ STYLE HELPERS ━━
const card = { background:C.card, border:`1px solid ${C.border}`, borderRadius:8 };
const cardP = { ...card, padding:"20px 24px" };
const heading = (size=20) => ({ fontFamily:F.serif, fontSize:size, fontWeight:600, color:C.ink, margin:0, letterSpacing:"-0.01em" });
const label = { fontFamily:F.sans, fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:C.inkMuted };
const metric = (size=28, color=C.ink) => ({ fontFamily:F.serif, fontSize:size, fontWeight:700, color, margin:"4px 0 0", letterSpacing:"-0.02em" });
const pill = (bg, color) => ({ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, fontFamily:F.sans, background:bg, color, border:"none" });
const btn = (primary) => ({ fontFamily:F.sans, fontSize:13, fontWeight:600, padding:"8px 18px", borderRadius:6, border:primary?"none":`1px solid ${C.border}`, background:primary?C.accent:"transparent", color:primary?"#fff":C.ink, cursor:"pointer", letterSpacing:"0.01em", transition:"all 0.15s" });

// ━━ MAIN APP ━━
export default function App() {
  const [page, setPage] = useState("command");
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  const fmt = now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const time = now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});

  const pages = [
    { id:"command", icon:"◉", name:"Command Centre" },
    { id:"leads", icon:"◎", name:"Lead Engine", badge:LEADS.length },
    { id:"pipeline", icon:"✦", name:"Event Pipeline" },
    { id:"time", icon:"▸", name:"Time & Utilisation" },
    { id:"finance", icon:"◆", name:"Financial Hub" },
    { id:"ai", icon:"✧", name:"AI Assistant" },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", background:C.bg, fontFamily:F.sans, color:C.ink, overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:200, minWidth:200, background:C.card, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"20px 16px 24px", borderBottom:`1px solid ${C.borderLight}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <HHTLogo s={30} />
            <div>
              <div style={{ fontFamily:F.serif, fontSize:14, fontWeight:700, color:C.ink, lineHeight:1.1 }}>Heads, Hearts</div>
              <div style={{ fontFamily:F.sans, fontSize:9, fontWeight:700, letterSpacing:"0.15em", color:C.accent, textTransform:"uppercase" }}>& TAILS</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
          {pages.map(p => (
            <div key={p.id} onClick={() => setPage(p.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", cursor:"pointer", background:page===p.id?C.accentSubtle:"transparent", borderLeft:page===p.id?`3px solid ${C.accent}`:"3px solid transparent", color:page===p.id?C.ink:C.inkSec, fontSize:13, fontWeight:page===p.id?600:400, transition:"all 0.15s" }}>
              <span style={{ fontSize:12, opacity:0.7 }}>{p.icon}</span>
              <span style={{ flex:1 }}>{p.name}</span>
              {p.badge && <span style={{ ...pill(page===p.id?C.accent+"18":C.bgWarm, page===p.id?C.accent:C.inkMuted), fontSize:10 }}>{p.badge}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.borderLight}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, fontFamily:F.sans }}>JS</div>
          <div><div style={{ fontSize:12, fontWeight:600 }}>Joe Stokoe</div><div style={{ fontSize:10, color:C.inkMuted }}>Director</div></div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <header style={{ padding:"12px 28px", borderBottom:`1px solid ${C.borderLight}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.card, flexShrink:0 }}>
          <div style={{ fontSize:12, color:C.inkMuted, fontFamily:F.sans }}>{fmt}<span style={{ margin:"0 8px", color:C.border }}>|</span>{time}</div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:11, color:C.success, fontWeight:600 }}>● 3 APIs Connected</span>
            <span style={{ fontSize:11, fontWeight:700, color:C.inkMuted, letterSpacing:"0.08em", textTransform:"uppercase" }}>Ghost Operator v3.0</span>
          </div>
        </header>
        <main style={{ flex:1, overflow:"auto", padding:28 }}>
          {page === "command" && <CommandCentre />}
          {page === "leads" && <LeadEngine />}
          {page === "pipeline" && <EventPipeline />}
          {page === "time" && <TimeUtil />}
          {page === "finance" && <FinanceHub />}
          {page === "ai" && <AIAssistant />}
        </main>
      </div>
    </div>
  );
}

// ━━ COMMAND CENTRE ━━
function CommandCentre() {
  const totalLeads = LEADS.length;
  const qualified = LEADS.filter(l=>l.stage==="Qualified"||l.stage==="Meeting Booked"||l.stage==="Won").length;
  const pipelineVal = pipeData.reduce((a,b)=>a+b.value,0);
  const wonLeads = LEADS.filter(l=>l.stage==="Won").length;

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={heading(26)}>Command Centre</h1>
        <p style={{ fontSize:13, color:C.inkSec, margin:"6px 0 0", fontFamily:F.sans }}>Operational overview — revenue, pipeline, lead generation, and team performance</p>
      </div>

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Annual Revenue", val:"£830k", delta:"+8.2%", good:true },
          { label:"Active Leads", val:totalLeads.toString(), delta:`${qualified} qualified`, good:true },
          { label:"Pipeline Value", val:`£${Math.round(pipelineVal/1000)}k`, delta:"+15%", good:true },
          { label:"Win Rate", val:`${Math.round(wonLeads/totalLeads*100)}%`, delta:`${wonLeads} won`, good:true },
          { label:"Team Utilisation", val:"64%", delta:"-3%", good:false },
        ].map((k,i) => (
          <div key={i} style={cardP}>
            <div style={label}>{k.label}</div>
            <div style={metric(26)}>{k.val}</div>
            <div style={{ fontSize:12, color:k.good?C.success:C.danger, fontWeight:500, marginTop:4 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:24 }}>
        <div style={cardP}>
          <div style={{ ...label, marginBottom:16 }}>Revenue vs Costs — Monthly</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revData}><CartesianGrid strokeDasharray="3 3" stroke={C.borderLight}/><XAxis dataKey="m" tick={{fontSize:11,fill:C.inkMuted}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:C.inkMuted}} axisLine={false} tickLine={false} tickFormatter={v=>`£${v/1000}k`}/><Tooltip formatter={v=>`£${(v/1000).toFixed(0)}k`}/><Area type="monotone" dataKey="rev" stroke={C.accent} fill={C.accentSubtle} strokeWidth={2} name="Revenue"/><Area type="monotone" dataKey="cost" stroke={C.danger} fill={C.dangerBg} strokeWidth={1.5} strokeDasharray="4 4" name="Costs"/></AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={cardP}>
          <div style={{ ...label, marginBottom:16 }}>Lead Pipeline Stages</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={STAGES.slice(0,6).map(s=>({name:s.slice(0,8),count:LEADS.filter(l=>l.stage===s).length}))} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={C.borderLight}/><XAxis type="number" tick={{fontSize:10,fill:C.inkMuted}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" tick={{fontSize:10,fill:C.inkSec}} width={70} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="count" fill={C.accent} radius={[0,4,4,0]} barSize={16}/></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={cardP}>
          <div style={{ ...label, marginBottom:12 }}>Upcoming Events</div>
          {pipeData.filter(p=>p.stage==="Confirmed").map((e,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<2?`1px solid ${C.borderLight}`:"none" }}>
              <div><div style={{ fontSize:14, fontWeight:600, fontFamily:F.serif }}>{e.name}</div><div style={{ fontSize:11, color:C.inkMuted }}>{e.type} · {e.date}</div></div>
              <span style={{ fontFamily:F.serif, fontWeight:700, fontSize:14, color:C.accent }}>£{(e.value/1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>
        <div style={cardP}>
          <div style={{ ...label, marginBottom:12 }}>Team Utilisation</div>
          {teamData.map((t,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:i<3?`1px solid ${C.borderLight}`:"none" }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:C.accentSubtle, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:C.accent }}>{t.name.split(" ").map(w=>w[0]).join("")}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600 }}>{t.name}</div><div style={{ fontSize:11, color:C.inkMuted }}>{t.role}</div></div>
              <div style={{ width:80, height:6, background:C.borderLight, borderRadius:3, overflow:"hidden" }}><div style={{ width:`${t.util}%`, height:"100%", background:t.util>60?C.success:t.util>40?C.warn:C.danger, borderRadius:3 }}/></div>
              <span style={{ fontSize:13, fontWeight:700, fontFamily:F.mono, color:t.util>60?C.success:t.util>40?C.warn:C.danger, width:36, textAlign:"right" }}>{t.util}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ━━ LEAD ENGINE ━━
function LeadEngine() {
  const [catFilter, setCatFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [pageNum, setPageNum] = useState(1);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    let f = [...LEADS];
    if (catFilter) f = f.filter(l => l.category === catFilter);
    if (stageFilter) f = f.filter(l => l.stage === stageFilter);
    if (search) { const s = search.toLowerCase(); f = f.filter(l => l.name.toLowerCase().includes(s) || l.location.toLowerCase().includes(s) || l.note.toLowerCase().includes(s)); }
    f.sort((a,b) => { const dir = sortDir === "desc" ? -1 : 1; if (sortBy === "score") return (a.score - b.score) * dir; if (sortBy === "value") return (a.value - b.value) * dir; if (sortBy === "name") return a.name.localeCompare(b.name) * dir; return 0; });
    return f;
  }, [catFilter, stageFilter, search, sortBy, sortDir]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((pageNum-1)*PER_PAGE, pageNum*PER_PAGE);

  const stageStats = useMemo(() => STAGES.slice(0,7).map(s => ({ name:s, count:LEADS.filter(l=>l.stage===s).length })), []);
  const totalValue = LEADS.reduce((a,l) => a+l.value, 0);
  const responseRate = Math.round(LEADS.filter(l=>["Responded","Qualified","Meeting Booked","Won"].includes(l.stage)).length / LEADS.length * 100);

  const SortHeader = ({field, children}) => (
    <th onClick={() => { if(sortBy===field) setSortDir(d=>d==="desc"?"asc":"desc"); else { setSortBy(field); setSortDir("desc"); } }} style={{ ...label, padding:"10px 8px", textAlign:"left", cursor:"pointer", userSelect:"none", borderBottom:`2px solid ${C.border}`, background:C.bgWarm }}>
      {children} {sortBy===field && <span style={{ color:C.accent }}>{sortDir==="desc"?"↓":"↑"}</span>}
    </th>
  );

  const stagePill = (stage) => {
    const colors = { Identified:C.info, Researched:C.stages.researched, Contacted:C.warn, Responded:C.accentLight, Qualified:C.success, "Meeting Booked":"#1A6B4A", Won:C.ink, Lost:C.inkMuted };
    const bg = { Identified:C.infoBg, Researched:"#F0F0FA", Contacted:C.warnBg, Responded:"#FFFBF0", Qualified:C.successBg, "Meeting Booked":"#E8F5EE", Won:C.ink, Lost:"#F5F5F5" };
    return <span style={{ ...pill(bg[stage]||C.bgWarm, colors[stage]||C.inkSec), ...(stage==="Won"?{color:"#fff"}:{}) }}>{stage}</span>;
  };

  const scoreDot = (score) => {
    const color = score >= 70 ? C.success : score >= 45 ? C.warn : C.danger;
    return (
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:32, height:5, background:C.borderLight, borderRadius:3, overflow:"hidden" }}><div style={{ width:`${score}%`, height:"100%", background:color, borderRadius:3 }}/></div>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:F.mono, color }}>{score}</span>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={heading(26)}>Lead Engine</h1>
          <p style={{ fontSize:13, color:C.inkSec, margin:"6px 0 0" }}>B2B pipeline — {LEADS.length} prospects across {CATEGORIES.length} categories</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={btn(false)}>Export CSV</button>
          <button style={btn(true)}>+ Add Lead</button>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div style={{ display:"flex", gap:3, marginBottom:20 }}>
        {stageStats.map((s,i) => (
          <div key={i} onClick={() => { setStageFilter(stageFilter===s.name?"":s.name); setPageNum(1); }} style={{ flex:1, padding:"12px 10px", background:stageFilter===s.name?STAGE_COLORS[i]+"14":C.card, border:`1px solid ${stageFilter===s.name?STAGE_COLORS[i]+"40":C.border}`, borderRadius:6, cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:F.serif, color:STAGE_COLORS[i] }}>{s.count}</div>
            <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:C.inkSec, marginTop:2 }}>{s.name}</div>
          </div>
        ))}
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Pipeline Value", val:`£${Math.round(totalValue/1000)}k`, color:C.accent },
          { label:"Response Rate", val:`${responseRate}%`, color:C.success },
          { label:"Avg Lead Score", val:Math.round(LEADS.reduce((a,l)=>a+l.score,0)/LEADS.length).toString(), color:C.warn },
          { label:"Qualified This Month", val:LEADS.filter(l=>l.stage==="Qualified").length.toString(), color:C.info },
        ].map((k,i) => (
          <div key={i} style={{ ...cardP, padding:"14px 18px" }}>
            <div style={label}>{k.label}</div>
            <div style={metric(22, k.color)}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
        <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPageNum(1);}} style={{ fontFamily:F.sans, fontSize:12, padding:"7px 12px", border:`1px solid ${C.border}`, borderRadius:6, background:C.card, color:C.ink, minWidth:180 }}>
          <option value="">All Categories ({LEADS.length})</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c} ({LEADS.filter(l=>l.category===c).length})</option>)}
        </select>
        <select value={stageFilter} onChange={e=>{setStageFilter(e.target.value);setPageNum(1);}} style={{ fontFamily:F.sans, fontSize:12, padding:"7px 12px", border:`1px solid ${C.border}`, borderRadius:6, background:C.card, color:C.ink, minWidth:140 }}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPageNum(1);}} placeholder="Search leads..." style={{ fontFamily:F.sans, fontSize:12, padding:"7px 14px", border:`1px solid ${C.border}`, borderRadius:6, background:C.card, color:C.ink, flex:1, outline:"none" }}/>
        <span style={{ fontSize:12, color:C.inkMuted, whiteSpace:"nowrap" }}>{filtered.length} results</span>
      </div>

      {/* Leads Table */}
      <div style={{ ...card, overflow:"hidden", marginBottom:16 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr>
              <SortHeader field="name">Lead</SortHeader>
              <th style={{ ...label, padding:"10px 8px", textAlign:"left", borderBottom:`2px solid ${C.border}`, background:C.bgWarm }}>Category</th>
              <th style={{ ...label, padding:"10px 8px", textAlign:"left", borderBottom:`2px solid ${C.border}`, background:C.bgWarm }}>Location</th>
              <SortHeader field="score">Score</SortHeader>
              <th style={{ ...label, padding:"10px 8px", textAlign:"left", borderBottom:`2px solid ${C.border}`, background:C.bgWarm }}>Stage</th>
              <SortHeader field="value">Value</SortHeader>
              <th style={{ ...label, padding:"10px 8px", textAlign:"left", borderBottom:`2px solid ${C.border}`, background:C.bgWarm }}>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((l,i) => (
              <tr key={l.id} onClick={() => setSelected(selected===l.id?null:l.id)} style={{ cursor:"pointer", background:selected===l.id?C.accentSubtle:i%2===0?"transparent":C.bg, transition:"background 0.1s" }}>
                <td style={{ padding:"10px 8px", borderBottom:`1px solid ${C.borderLight}` }}>
                  <div style={{ fontWeight:600, fontSize:13, fontFamily:F.serif }}>{l.name}</div>
                  <div style={{ fontSize:10, color:C.inkMuted, marginTop:1, maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.note}</div>
                </td>
                <td style={{ padding:"10px 8px", borderBottom:`1px solid ${C.borderLight}`, fontSize:11, color:C.inkSec }}>{l.category.split(" ").slice(0,3).join(" ")}</td>
                <td style={{ padding:"10px 8px", borderBottom:`1px solid ${C.borderLight}`, fontSize:11, color:C.inkSec }}>{l.location}, {l.county}</td>
                <td style={{ padding:"10px 8px", borderBottom:`1px solid ${C.borderLight}` }}>{scoreDot(l.score)}</td>
                <td style={{ padding:"10px 8px", borderBottom:`1px solid ${C.borderLight}` }}>{stagePill(l.stage)}</td>
                <td style={{ padding:"10px 8px", borderBottom:`1px solid ${C.borderLight}`, fontFamily:F.mono, fontSize:11, fontWeight:600, color:C.accent }}>£{l.value.toLocaleString()}</td>
                <td style={{ padding:"10px 8px", borderBottom:`1px solid ${C.borderLight}`, fontSize:11, color:C.inkMuted }}>{l.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:C.inkMuted }}>Showing {(pageNum-1)*PER_PAGE+1}–{Math.min(pageNum*PER_PAGE,filtered.length)} of {filtered.length}</span>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={()=>setPageNum(Math.max(1,pageNum-1))} disabled={pageNum===1} style={{ ...btn(false), opacity:pageNum===1?0.3:1 }}>← Prev</button>
          {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p => (
            <button key={p} onClick={()=>setPageNum(p)} style={{ ...btn(p===pageNum), minWidth:32 }}>{p}</button>
          ))}
          {pages>7 && <span style={{ padding:"8px 4px", color:C.inkMuted }}>...</span>}
          <button onClick={()=>setPageNum(Math.min(pages,pageNum+1))} disabled={pageNum===pages} style={{ ...btn(false), opacity:pageNum===pages?0.3:1 }}>Next →</button>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ marginTop:24 }}>
        <div style={{ ...label, marginBottom:12 }}>Category Breakdown</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {CATEGORIES.map(c => {
            const count = LEADS.filter(l=>l.category===c).length;
            const qualified = LEADS.filter(l=>l.category===c&&["Qualified","Meeting Booked","Won"].includes(l.stage)).length;
            return (
              <div key={c} onClick={()=>{setCatFilter(catFilter===c?"":c);setPageNum(1);}} style={{ ...cardP, padding:"12px 14px", cursor:"pointer", border:`1px solid ${catFilter===c?C.accent+"40":C.border}`, background:catFilter===c?C.accentSubtle:C.card }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.ink, marginBottom:4 }}>{c}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                  <span style={{ fontSize:18, fontWeight:700, fontFamily:F.serif, color:C.accent }}>{count}</span>
                  <span style={{ fontSize:10, color:C.success, fontWeight:600 }}>{qualified} qualified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ━━ EVENT PIPELINE ━━
function EventPipeline() {
  const stages = ["Lead","Proposal","Negotiation","Confirmed","Completed"];
  const stageColors = [C.info, C.warn, C.accentLight, C.success, C.ink];
  // Include won leads from Lead Engine
  const wonLeads = LEADS.filter(l => l.stage === "Won").slice(0, 5).map(l => ({ name: l.name, type: l.category.split(" ")[0], value: l.value, stage: "Lead", date: l.lastActivity }));
  const allPipe = [...pipeData, ...wonLeads];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={heading(26)}>Event Pipeline</h1>
        <p style={{ fontSize:13, color:C.inkSec, margin:"6px 0 0" }}>Active opportunities — from initial lead to completed event. Won leads from the Lead Engine flow here automatically.</p>
      </div>

      {/* Stage columns */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${stages.length},1fr)`, gap:12, marginBottom:24 }}>
        {stages.map((s,i) => {
          const items = allPipe.filter(p => p.stage === s);
          const totalVal = items.reduce((a,b) => a+b.value, 0);
          return (
            <div key={s}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ ...label, color:stageColors[i] }}>{s}</span>
                <span style={{ fontSize:11, fontWeight:700, fontFamily:F.mono, color:stageColors[i] }}>£{Math.round(totalVal/1000)}k</span>
              </div>
              <div style={{ minHeight:120 }}>
                {items.map((item,j) => (
                  <div key={j} style={{ ...cardP, padding:"12px 14px", marginBottom:8, borderLeft:`3px solid ${stageColors[i]}` }}>
                    <div style={{ fontSize:13, fontWeight:600, fontFamily:F.serif }}>{item.name}</div>
                    <div style={{ fontSize:10, color:C.inkMuted, margin:"3px 0" }}>{item.type}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:12, fontWeight:700, color:C.accent, fontFamily:F.mono }}>£{item.value.toLocaleString()}</span>
                      <span style={{ fontSize:10, color:C.inkMuted }}>{item.date}</span>
                    </div>
                  </div>
                ))}
                {items.length===0 && <div style={{ padding:16, textAlign:"center", color:C.inkMuted, fontSize:11, fontStyle:"italic" }}>No items</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...cardP }}>
        <div style={{ ...label, marginBottom:12 }}>Pipeline Summary</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          <div><div style={label}>Total Pipeline</div><div style={metric(22, C.accent)}>£{Math.round(allPipe.reduce((a,b)=>a+b.value,0)/1000)}k</div></div>
          <div><div style={label}>Confirmed Revenue</div><div style={metric(22, C.success)}>£{Math.round(allPipe.filter(p=>p.stage==="Confirmed").reduce((a,b)=>a+b.value,0)/1000)}k</div></div>
          <div><div style={label}>Active Proposals</div><div style={metric(22, C.warn)}>{allPipe.filter(p=>p.stage==="Proposal"||p.stage==="Negotiation").length}</div></div>
          <div><div style={label}>New from Lead Engine</div><div style={metric(22, C.info)}>{wonLeads.length}</div></div>
        </div>
      </div>
    </div>
  );
}

// ━━ TIME & UTILISATION ━━
function TimeUtil() {
  const weekData = [{d:"Mon",billable:6.5,nonBillable:1.5},{d:"Tue",billable:7,nonBillable:1},{d:"Wed",billable:5,nonBillable:3},{d:"Thu",billable:7.5,nonBillable:0.5},{d:"Fri",billable:4,nonBillable:2}];
  // Include won leads for upcoming staffing
  const upcomingStaff = LEADS.filter(l=>l.stage==="Won"||l.stage==="Meeting Booked").slice(0,4);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={heading(26)}>Time & Utilisation</h1>
        <p style={{ fontSize:13, color:C.inkSec, margin:"6px 0 0" }}>Billable hours, team capacity, and staffing requirements from pipeline leads</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:24 }}>
        <div style={cardP}>
          <div style={{ ...label, marginBottom:16 }}>This Week — Billable vs Non-Billable Hours</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}><CartesianGrid strokeDasharray="3 3" stroke={C.borderLight}/><XAxis dataKey="d" tick={{fontSize:11,fill:C.inkMuted}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:C.inkMuted}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="billable" fill={C.accent} radius={[4,4,0,0]} name="Billable"/><Bar dataKey="nonBillable" fill={C.border} radius={[4,4,0,0]} name="Non-Billable"/></BarChart>
          </ResponsiveContainer>
        </div>
        <div style={cardP}>
          <div style={{ ...label, marginBottom:12 }}>Team Overview</div>
          {teamData.map((t,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:i<3?`1px solid ${C.borderLight}`:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600 }}>{t.name}</span>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:F.mono, color:t.util>60?C.success:C.warn }}>{t.util}%</span>
              </div>
              <div style={{ width:"100%", height:5, background:C.borderLight, borderRadius:3 }}><div style={{ width:`${t.util}%`, height:"100%", background:t.util>60?C.success:t.util>40?C.warn:C.danger, borderRadius:3 }}/></div>
              <div style={{ fontSize:10, color:C.inkMuted, marginTop:3 }}>{t.hours}h logged · {t.role}</div>
            </div>
          ))}
        </div>
      </div>
      {upcomingStaff.length > 0 && (
        <div style={cardP}>
          <div style={{ ...label, marginBottom:12 }}>Staffing Requirements from Pipeline</div>
          <p style={{ fontSize:12, color:C.inkSec, marginBottom:12 }}>Won and near-won leads from the Lead Engine that will require staffing</p>
          {upcomingStaff.map((l,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<upcomingStaff.length-1?`1px solid ${C.borderLight}`:"none" }}>
              <div><div style={{ fontSize:13, fontWeight:600, fontFamily:F.serif }}>{l.name}</div><div style={{ fontSize:11, color:C.inkMuted }}>{l.category} · {l.location}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:12, fontWeight:700, color:C.accent, fontFamily:F.mono }}>£{l.value.toLocaleString()}</div><div style={{ fontSize:10, color:C.inkMuted }}>{l.stage}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ━━ FINANCIAL HUB ━━
function FinanceHub() {
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={heading(26)}>Financial Hub</h1>
        <p style={{ fontSize:13, color:C.inkSec, margin:"6px 0 0" }}>Revenue, costs, and profitability — synced with Xero</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[{l:"Annual Revenue",v:"£830k",d:"+8.2%",c:C.success},{l:"Staffing Revenue",v:"£500k",d:"+12.5%",c:C.success},{l:"Net Profit",v:"£176k",d:"+15%",c:C.success},{l:"Outstanding Invoices",v:"£42k",d:"3 overdue",c:C.danger}].map((k,i)=>(
          <div key={i} style={cardP}><div style={label}>{k.l}</div><div style={metric(24)}>{k.v}</div><div style={{fontSize:12,color:k.c,fontWeight:500,marginTop:4}}>{k.d}</div></div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={cardP}>
          <div style={{...label,marginBottom:16}}>Monthly P&L</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revData}><CartesianGrid strokeDasharray="3 3" stroke={C.borderLight}/><XAxis dataKey="m" tick={{fontSize:11,fill:C.inkMuted}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:C.inkMuted}} axisLine={false} tickLine={false} tickFormatter={v=>`£${v/1000}k`}/><Tooltip formatter={v=>`£${(v/1000).toFixed(0)}k`}/><Area type="monotone" dataKey="rev" stroke={C.accent} fill={C.accentSubtle} strokeWidth={2} name="Revenue"/><Area type="monotone" dataKey="cost" stroke={C.danger} fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Costs"/></AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={cardP}>
          <div style={{...label,marginBottom:16}}>Revenue by Service</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart><Pie data={[{name:"Staffing",value:500},{name:"Events",value:180},{name:"Drink Styling",value:80},{name:"Consultancy",value:50},{name:"Creative",value:20}]} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>{[C.accent,C.success,"#5B6AAF",C.warn,C.info].map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Tooltip formatter={v=>`£${v}k`}/></PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",marginTop:8}}>
            {[{n:"Staffing",c:C.accent},{n:"Events",c:C.success},{n:"Drink Styling",c:"#5B6AAF"},{n:"Consultancy",c:C.warn},{n:"Creative",c:C.info}].map(s=>(
              <div key={s.n} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:C.inkSec}}><div style={{width:8,height:8,borderRadius:"50%",background:s.c}}/>{s.n}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━ AI ASSISTANT ━━
function AIAssistant() {
  const [query, setQuery] = useState("");
  const suggestions = [
    "What were our total non-billable hours in February?",
    "Which lead categories have the highest conversion rate?",
    "Show me all qualified leads from cocktail bars",
    "What's our projected revenue for Q2 2026?",
    "How many leads have responded in the last 30 days?",
  ];
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={heading(26)}>AI Assistant</h1>
        <p style={{ fontSize:13, color:C.inkSec, margin:"6px 0 0" }}>RAG-powered intelligence — query your business data across Scoro, StaffWise, Xero, and the Lead Engine</p>
      </div>
      <div style={{ maxWidth:680 }}>
        <div style={{ ...cardP, marginBottom:16 }}>
          <div style={{ display:"flex", gap:8 }}>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ask anything about your business..." style={{ flex:1, fontFamily:F.sans, fontSize:14, padding:"12px 16px", border:`1px solid ${C.border}`, borderRadius:8, outline:"none", background:C.bg }}/>
            <button style={{ ...btn(true), padding:"12px 24px" }}>Ask</button>
          </div>
        </div>
        <div style={{ ...label, marginBottom:10 }}>Suggested queries</div>
        {suggestions.map((s,i) => (
          <div key={i} onClick={() => setQuery(s)} style={{ ...cardP, padding:"10px 16px", marginBottom:6, cursor:"pointer", fontSize:13, color:C.inkSec, transition:"all 0.15s" }}>
            <span style={{ color:C.accent, marginRight:8 }}>→</span>{s}
          </div>
        ))}
        <div style={{ marginTop:24, padding:20, background:C.bgWarm, borderRadius:8, border:`1px solid ${C.borderLight}` }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.inkSec, marginBottom:8 }}>Connected Data Sources</div>
          <div style={{ display:"flex", gap:20 }}>
            {["Scoro (CRM & Projects)","StaffWise (Workforce)","Xero (Finance)","Lead Engine (410 prospects)"].map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.success }}><span>●</span>{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
