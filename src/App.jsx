import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADS, HEARTS & TAILS — OPERATIONS PLATFORM v2.0
// Design: High-End Editorial · Warm Ivory · Serif Typography
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const C = {
  bg: "#FAF8F5",
  bgWarm: "#F5F0EA",
  card: "#FFFFFF",
  cardHover: "#FDFCFB",
  ink: "#1A1613",
  inkSecondary: "#6B6560",
  inkMuted: "#A39E98",
  accent: "#8B6914",
  accentLight: "#C4A44A",
  accentSubtle: "rgba(139,105,20,0.08)",
  accentBorder: "rgba(139,105,20,0.2)",
  divider: "#E8E3DC",
  dividerLight: "#F0EBE4",
  success: "#2D7A4F",
  successBg: "#EFF8F3",
  warning: "#A06B1B",
  warningBg: "#FFF8ED",
  danger: "#A63D3D",
  dangerBg: "#FEF2F2",
  hot: "#A63D3D",
  warm: "#A06B1B",
  newLead: "#2D6B8A",
  cold: "#7A7A7A",
};

const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans: "'Inter', -apple-system, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', monospace",
};

// ── HHT Logo ──
const HHTLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
    <rect width="200" height="200" rx="12" fill={C.ink}/>
    <path d="M100 170C100 170 30 125 30 80C30 55 50 38 72 38C86 38 96 46 100 55C104 46 114 38 128 38C150 38 170 55 170 80C170 125 100 170 100 170Z" fill="white"/>
    <text x="100" y="128" textAnchor="middle" fontFamily="Georgia, serif" fontSize="90" fontWeight="bold" fill={C.ink}>&amp;</text>
  </svg>
);

// ── Venue Categories & Data ──
const VENUE_CATEGORIES = [
  "All",
  "Historic House & Estate",
  "Hotel",
  "5-star hotel",
  "Castle",
  "Museum & Gallery",
  "Garden & Park Venue",
  "Restaurant & Private Dining",
  "Members Club",
  "Church & Cathedral",
  "Theatre & Concert Venue",
  "Racecourse & Sporting",
  "Vineyard & Brewery",
  "Conference & Exhibition",
  "School & University",
  "Barn & Farm",
  "Warehouse & Industrial",
  "Riverside & Waterside",
  "Civic & Community Venue",
  "Festival & Unique",
];

const COUNTIES = ["All","London","Surrey","Kent","Sussex","Hampshire","Berkshire","Buckinghamshire","Oxfordshire","Hertfordshire","Essex","Suffolk","Norfolk","Cambridgeshire","Bedfordshire","Wiltshire","Gloucestershire","Somerset","Dorset","Northamptonshire","Warwickshire","West Midlands"];

// ── Generate venue data (361 venues) ──
const generateVenues = () => {
  const venues = [
    // ── 5-STAR HOTELS (15) ──
    {name:"Claridge's",location:"Mayfair",county:"London",category:"5-star hotel",capacity:"200",note:"Art Deco ballroom, Royal warrant holder"},
    {name:"The Ritz London",location:"Piccadilly",county:"London",category:"5-star hotel",capacity:"180",note:"The Ritz Restaurant & William Kent House"},
    {name:"The Dorchester",location:"Park Lane",county:"London",category:"5-star hotel",capacity:"500",note:"The Ballroom Suite, Oriental mandarin rooms"},
    {name:"The Savoy",location:"Strand",county:"London",category:"5-star hotel",capacity:"450",note:"Lancaster Ballroom, Thames Foyer"},
    {name:"Four Seasons Park Lane",location:"Park Lane",county:"London",category:"5-star hotel",capacity:"250",note:"Ballroom and private dining suites"},
    {name:"Mandarin Oriental Hyde Park",location:"Knightsbridge",county:"London",category:"5-star hotel",capacity:"300",note:"Ballroom with park views"},
    {name:"The Langham",location:"Portland Place",county:"London",category:"5-star hotel",capacity:"350",note:"Grand Ballroom, Artesian bar events"},
    {name:"Coworth Park",location:"Ascot",county:"Berkshire",category:"5-star hotel",capacity:"200",note:"Dorchester Collection country estate"},
    {name:"Cliveden House",location:"Taplow",county:"Buckinghamshire",category:"5-star hotel",capacity:"180",note:"National Trust Grade I listed estate"},
    {name:"Chewton Glen",location:"New Milton",county:"Hampshire",category:"5-star hotel",capacity:"200",note:"Country house hotel, Relais & Châteaux"},
    {name:"Lucknam Park",location:"Colerne",county:"Wiltshire",category:"5-star hotel",capacity:"150",note:"Palladian mansion with spa"},
    {name:"Pennyhill Park",location:"Bagshot",county:"Surrey",category:"5-star hotel",capacity:"300",note:"Exclusive Hotels collection"},
    {name:"The Grove",location:"Chandler's Cross",county:"Hertfordshire",category:"5-star hotel",capacity:"350",note:"300-acre estate, former home of Earls of Clarendon"},
    {name:"Stoke Park",location:"Stoke Poges",county:"Buckinghamshire",capacity:"300",category:"5-star hotel",note:"James Bond filming location, golf & spa"},
    {name:"Danesfield House",location:"Marlow",county:"Buckinghamshire",category:"5-star hotel",capacity:"200",note:"Italianate mansion overlooking Thames"},

    // ── HOTELS WITH EVENT SPACES (34) ──
    {name:"The Ned",location:"City of London",county:"London",category:"Hotel",capacity:"400",note:"Former Midland Bank HQ, Soho House group"},
    {name:"Kimpton Fitzroy London",location:"Bloomsbury",county:"London",category:"Hotel",capacity:"350",note:"Restored Victorian terracotta building"},
    {name:"Ham Yard Hotel",location:"Soho",county:"London",category:"Hotel",capacity:"150",note:"Firmdale Hotels, rooftop events"},
    {name:"Rosewood London",location:"Holborn",county:"London",category:"Hotel",capacity:"250",note:"Grand Mirror Room, Edwardian mansion"},
    {name:"Corinthia London",location:"Whitehall",county:"London",category:"Hotel",capacity:"350",note:"Ballroom, Hamilton Penthouse"},
    {name:"Shangri-La The Shard",location:"London Bridge",county:"London",category:"Hotel",capacity:"200",note:"Sky-high event spaces, panoramic views"},
    {name:"The Berkeley",location:"Knightsbridge",county:"London",category:"Hotel",capacity:"180",note:"Blue Bar, rooftop pool events"},
    {name:"Nobu Hotel Portman Square",location:"Marylebone",county:"London",category:"Hotel",capacity:"200",note:"Events with Nobu dining"},
    {name:"Beaverbrook",location:"Leatherhead",county:"Surrey",category:"Hotel",capacity:"200",note:"Historic estate, Churchill connections"},
    {name:"Tylney Hall",location:"Hook",county:"Hampshire",category:"Hotel",capacity:"200",note:"Grade II listed Victorian country house"},
    {name:"Luton Hoo",location:"Luton",county:"Bedfordshire",category:"Hotel",capacity:"250",note:"Capability Brown parkland, mansion hotel"},
    {name:"De Vere Wokefield Estate",location:"Reading",county:"Berkshire",category:"Hotel",capacity:"350",note:"18th century mansion with modern conference"},
    {name:"Eastwell Manor",location:"Ashford",county:"Kent",category:"Hotel",capacity:"200",note:"Champneys spa, Italianate gardens"},
    {name:"South Lodge Hotel",location:"Horsham",county:"Sussex",category:"Hotel",capacity:"250",note:"Victorian country house, Camellia restaurant"},
    {name:"Wotton House",location:"Dorking",county:"Surrey",category:"Hotel",capacity:"300",note:"17th century Italianate house"},
    {name:"Chilston Park Hotel",location:"Lenham",county:"Kent",category:"Hotel",capacity:"200",note:"Grade I listed country house"},
    {name:"Nutfield Priory",location:"Redhill",county:"Surrey",category:"Hotel",capacity:"180",note:"Victorian Gothic hilltop hotel"},
    {name:"Great Fosters",location:"Egham",county:"Surrey",category:"Hotel",capacity:"250",note:"Grade I Elizabethan mansion, tithe barn"},
    {name:"Ashdown Park Hotel",location:"Forest Row",county:"Sussex",category:"Hotel",capacity:"300",note:"Gothic mansion in Ashdown Forest"},
    {name:"Fawsley Hall",location:"Daventry",county:"Northamptonshire",category:"Hotel",capacity:"200",note:"Tudor, Georgian & Victorian wings"},
    {name:"The Spread Eagle Hotel",location:"Midhurst",county:"Sussex",category:"Hotel",capacity:"100",note:"One of England's oldest coaching inns"},
    {name:"Oakley Court",location:"Windsor",county:"Berkshire",category:"Hotel",capacity:"250",note:"Victorian Gothic, Thames riverside"},
    {name:"Mercure Box Hill Burford Bridge",location:"Dorking",county:"Surrey",category:"Hotel",capacity:"200",note:"Historic inn, Nelson & Hardy connections"},
    {name:"Hever Castle Inn",location:"Edenbridge",county:"Kent",category:"Hotel",capacity:"100",note:"Adjacent to Anne Boleyn's childhood home"},
    {name:"Alexander House Hotel",location:"Turners Hill",county:"Sussex",category:"Hotel",capacity:"180",note:"Country house with Utopia spa"},
    {name:"Horsley Towers",location:"East Horsley",county:"Surrey",category:"Hotel",capacity:"250",note:"Gothic Revival Victorian mansion"},
    {name:"Tortworth Court",location:"Tortworth",county:"Gloucestershire",category:"Hotel",capacity:"300",note:"Victorian Gothic mansion"},
    {name:"Ellenborough Park",location:"Cheltenham",county:"Gloucestershire",category:"Hotel",capacity:"200",note:"15th century manor near racecourse"},
    {name:"The Montagu Arms",location:"Beaulieu",county:"Hampshire",category:"Hotel",capacity:"100",note:"17th century New Forest coaching inn"},
    {name:"Hotel du Vin Brighton",location:"Brighton",county:"Sussex",category:"Hotel",capacity:"150",note:"Gothic Revival former wine merchant's"},
    {name:"Bailbrook House",location:"Bath",county:"Somerset",category:"Hotel",capacity:"200",note:"Georgian mansion overlooking Bath"},
    {name:"The Crown Manor House",location:"Lyndhurst",county:"Hampshire",category:"Hotel",capacity:"200",note:"New Forest country house hotel"},
    {name:"Sopwell House",location:"St Albans",county:"Hertfordshire",category:"Hotel",capacity:"300",note:"Georgian country house, events & spa"},
    {name:"Down Hall Hotel",location:"Bishop's Stortford",county:"Hertfordshire",category:"Hotel",capacity:"250",note:"Italianate mansion in 110 acres"},

    // ── HISTORIC HOUSES & ESTATES (77) ──
    {name:"Blenheim Palace",location:"Woodstock",county:"Oxfordshire",category:"Historic House & Estate",capacity:"800",note:"UNESCO World Heritage, birthplace of Churchill"},
    {name:"Hampton Court Palace",location:"East Molesey",county:"Surrey",category:"Historic House & Estate",capacity:"500",note:"Tudor royal palace, maze gardens"},
    {name:"Hatfield House",location:"Hatfield",county:"Hertfordshire",category:"Historic House & Estate",capacity:"400",note:"Jacobean house, Elizabeth I childhood home"},
    {name:"Woburn Abbey",location:"Woburn",county:"Bedfordshire",category:"Historic House & Estate",capacity:"350",note:"Home of Duke of Bedford, safari park"},
    {name:"Syon House",location:"Brentford",county:"London",category:"Historic House & Estate",capacity:"300",note:"Robert Adam interiors, Great Conservatory"},
    {name:"Kew Palace",location:"Kew",county:"London",category:"Historic House & Estate",capacity:"200",note:"Royal Botanic Gardens setting"},
    {name:"Eltham Palace",location:"Eltham",county:"London",category:"Historic House & Estate",capacity:"250",note:"English Heritage, Art Deco interiors"},
    {name:"Knole House",location:"Sevenoaks",county:"Kent",category:"Historic House & Estate",capacity:"300",note:"National Trust, one of largest houses in England"},
    {name:"Penshurst Place",location:"Penshurst",county:"Kent",category:"Historic House & Estate",capacity:"300",note:"Medieval manor, Baron's Hall 1341"},
    {name:"Loseley Park",location:"Guildford",county:"Surrey",category:"Historic House & Estate",capacity:"300",note:"Elizabethan mansion, walled garden"},
    {name:"Waddesdon Manor",location:"Waddesdon",county:"Buckinghamshire",category:"Historic House & Estate",capacity:"400",note:"Rothschild French château-style manor, National Trust"},
    {name:"Stonor Park",location:"Henley-on-Thames",county:"Oxfordshire",category:"Historic House & Estate",capacity:"200",note:"Oldest continually inhabited home in England"},
    {name:"Mapledurham House",location:"Reading",county:"Oxfordshire",category:"Historic House & Estate",capacity:"200",note:"Elizabethan mansion, Thames-side"},
    {name:"Dorney Court",location:"Windsor",county:"Buckinghamshire",category:"Historic House & Estate",capacity:"250",note:"Tudor manor, Grade I listed"},
    {name:"Stansted Park",location:"Rowlands Castle",county:"Hampshire",category:"Historic House & Estate",capacity:"300",note:"Edwardian house, 1800 acres"},
    {name:"Goodwood House",location:"Chichester",county:"Sussex",category:"Historic House & Estate",capacity:"400",note:"Home of Duke of Richmond, events & motorsport"},
    {name:"Firle Place",location:"Lewes",county:"Sussex",category:"Historic House & Estate",capacity:"250",note:"Tudor & Georgian, Gage family since 15th century"},
    {name:"Parham House",location:"Pulborough",county:"Sussex",category:"Historic House & Estate",capacity:"200",note:"Elizabethan house, deer park"},
    {name:"Petworth House",location:"Petworth",county:"Sussex",category:"Historic House & Estate",capacity:"300",note:"National Trust, Turner paintings, Capability Brown park"},
    {name:"Uppark House",location:"South Harting",county:"Sussex",category:"Historic House & Estate",capacity:"200",note:"National Trust, 17th century hilltop house"},
    {name:"Highclere Castle",location:"Newbury",county:"Berkshire",category:"Historic House & Estate",capacity:"350",note:"Downton Abbey filming location"},
    {name:"Basildon Park",location:"Reading",county:"Berkshire",category:"Historic House & Estate",capacity:"200",note:"National Trust, Palladian mansion"},
    {name:"Englefield House",location:"Theale",county:"Berkshire",category:"Historic House & Estate",capacity:"300",note:"Elizabethan estate, deer park"},
    {name:"Wrest Park",location:"Silsoe",county:"Bedfordshire",category:"Historic House & Estate",capacity:"250",note:"English Heritage, French-style gardens"},
    {name:"Boughton House",location:"Kettering",county:"Northamptonshire",category:"Historic House & Estate",capacity:"350",note:"'English Versailles', Duke of Buccleuch"},
    {name:"Althorp House",location:"Northampton",county:"Northamptonshire",category:"Historic House & Estate",capacity:"300",note:"Spencer family seat, Princess Diana exhibition"},
    {name:"Burghley House",location:"Stamford",county:"Cambridgeshire",category:"Historic House & Estate",capacity:"400",note:"Elizabethan prodigy house, horse trials"},
    {name:"Audley End House",location:"Saffron Walden",county:"Essex",category:"Historic House & Estate",capacity:"300",note:"English Heritage, Jacobean mansion"},
    {name:"Ingatestone Hall",location:"Ingatestone",county:"Essex",category:"Historic House & Estate",capacity:"150",note:"Tudor mansion, Petre family since 1539"},
    {name:"Layer Marney Tower",location:"Colchester",county:"Essex",category:"Historic House & Estate",capacity:"200",note:"Tudor gatehouse, tallest in Britain"},
    {name:"Hedingham Castle",location:"Castle Hedingham",county:"Essex",category:"Historic House & Estate",capacity:"200",note:"Norman keep, Tudor bridge"},
    {name:"Helmingham Hall",location:"Stowmarket",county:"Suffolk",category:"Historic House & Estate",capacity:"250",note:"Moated Tudor hall, gardens"},
    {name:"Kentwell Hall",location:"Long Melford",county:"Suffolk",category:"Historic House & Estate",capacity:"250",note:"Tudor moated manor, re-creation events"},
    {name:"Houghton Hall",location:"King's Lynn",county:"Norfolk",category:"Historic House & Estate",capacity:"300",note:"Palladian mansion, Walpole family"},
    {name:"Holkham Hall",location:"Wells-next-the-Sea",county:"Norfolk",category:"Historic House & Estate",capacity:"350",note:"Palladian mansion, 25,000 acre estate"},
    {name:"Blickling Hall",location:"Aylsham",county:"Norfolk",category:"Historic House & Estate",capacity:"250",note:"National Trust, Jacobean red-brick"},
    {name:"Wimpole Estate",location:"Royston",county:"Cambridgeshire",category:"Historic House & Estate",capacity:"300",note:"National Trust, largest house in Cambridgeshire"},
    {name:"Anglesey Abbey",location:"Cambridge",county:"Cambridgeshire",category:"Historic House & Estate",capacity:"200",note:"National Trust, 114 acres of gardens"},
    {name:"Corsham Court",location:"Corsham",county:"Wiltshire",category:"Historic House & Estate",capacity:"250",note:"Elizabethan house, Old Master paintings"},
    {name:"Bowood House",location:"Calne",county:"Wiltshire",category:"Historic House & Estate",capacity:"300",note:"Capability Brown gardens, adventure playground"},
    {name:"Longleat House",location:"Warminster",county:"Wiltshire",category:"Historic House & Estate",capacity:"400",note:"Elizabethan prodigy house, safari park"},
    {name:"Wilton House",location:"Salisbury",county:"Wiltshire",category:"Historic House & Estate",capacity:"350",note:"Earl of Pembroke's seat, Double Cube Room"},
    {name:"Sudeley Castle",location:"Winchcombe",county:"Gloucestershire",category:"Historic House & Estate",capacity:"300",note:"Royal castle, Katherine Parr buried here"},
    {name:"Stanway House",location:"Cheltenham",county:"Gloucestershire",category:"Historic House & Estate",capacity:"150",note:"Jacobean manor, tallest gravity fountain"},
    {name:"Chavenage House",location:"Tetbury",county:"Gloucestershire",category:"Historic House & Estate",capacity:"150",note:"Elizabethan manor, Poldark filming location"},
    {name:"Squerryes Court",location:"Westerham",county:"Kent",category:"Historic House & Estate",capacity:"200",note:"1681 manor house, vineyard"},
    {name:"Groombridge Place",location:"Tunbridge Wells",county:"Kent",category:"Historic House & Estate",capacity:"250",note:"Moated manor, enchanted forest"},
    {name:"Quex Park",location:"Birchington",county:"Kent",category:"Historic House & Estate",capacity:"200",note:"Regency house, Powell-Cotton Museum"},
    {name:"Nymans",location:"Handcross",county:"Sussex",category:"Historic House & Estate",capacity:"200",note:"National Trust, romantic garden ruins"},
    {name:"Wakehurst",location:"Ardingly",county:"Sussex",category:"Historic House & Estate",capacity:"250",note:"Kew's wild botanic garden, Elizabethan mansion"},
    {name:"Glynde Place",location:"Lewes",county:"Sussex",category:"Historic House & Estate",capacity:"200",note:"Elizabethan manor, near Glyndebourne"},
    {name:"Michelham Priory",location:"Hailsham",county:"Sussex",category:"Historic House & Estate",capacity:"200",note:"Augustinian priory, largest moat in England"},
    {name:"Pashley Manor",location:"Ticehurst",county:"Sussex",category:"Historic House & Estate",capacity:"150",note:"Timber-framed ironmaster's house, tulip festival"},
    {name:"Polesden Lacey",location:"Dorking",county:"Surrey",category:"Historic House & Estate",capacity:"250",note:"National Trust, Edwardian house, Mrs Greville's parties"},
    {name:"Clandon Park",location:"Guildford",county:"Surrey",category:"Historic House & Estate",capacity:"200",note:"National Trust, Palladian mansion (restoration)"},
    {name:"Hatchlands Park",location:"East Clandon",county:"Surrey",category:"Historic House & Estate",capacity:"200",note:"National Trust, Robert Adam's first commission"},
    {name:"Fenton House",location:"Hampstead",county:"London",category:"Historic House & Estate",capacity:"100",note:"National Trust, 17th century merchant's house"},
    {name:"Chiswick House",location:"Chiswick",county:"London",category:"Historic House & Estate",capacity:"200",note:"English Heritage, Palladian villa"},
    {name:"Kenwood House",location:"Hampstead",county:"London",category:"Historic House & Estate",capacity:"250",note:"English Heritage, Rembrandt & Vermeer"},
    {name:"Spencer House",location:"St James's",county:"London",category:"Historic House & Estate",capacity:"300",note:"London's finest surviving 18th century town house"},
    {name:"Fulham Palace",location:"Fulham",county:"London",category:"Historic House & Estate",capacity:"250",note:"Former Bishops of London residence, Tudor courtyard"},
    {name:"Osterley Park",location:"Isleworth",county:"London",category:"Historic House & Estate",capacity:"200",note:"National Trust, Robert Adam transformation"},
    {name:"Marble Hill House",location:"Twickenham",county:"London",category:"Historic House & Estate",capacity:"150",note:"English Heritage, Palladian villa on Thames"},
    {name:"Ranger's House",location:"Greenwich",county:"London",category:"Historic House & Estate",capacity:"150",note:"English Heritage, Wernher Collection"},
    {name:"Ditchley Park",location:"Enstone",county:"Oxfordshire",category:"Historic House & Estate",capacity:"200",note:"James Gibbs mansion, Churchill wartime retreat"},
    {name:"Rousham House",location:"Steeple Aston",county:"Oxfordshire",category:"Historic House & Estate",capacity:"150",note:"William Kent gardens, unchanged since 1730s"},
    {name:"Claydon House",location:"Middle Claydon",county:"Buckinghamshire",category:"Historic House & Estate",capacity:"200",note:"National Trust, extraordinary Rococo interiors"},
    {name:"Hughenden Manor",location:"High Wycombe",county:"Buckinghamshire",category:"Historic House & Estate",capacity:"200",note:"National Trust, Disraeli's country home"},
    {name:"Chenies Manor",location:"Rickmansworth",county:"Buckinghamshire",category:"Historic House & Estate",capacity:"120",note:"15th century, Tudor sunken garden"},
    {name:"Ashridge House",location:"Berkhamsted",county:"Hertfordshire",category:"Historic House & Estate",capacity:"300",note:"Gothic Revival, 190 acres of gardens"},
    {name:"Knebworth House",location:"Knebworth",county:"Hertfordshire",category:"Historic House & Estate",capacity:"350",note:"Gothic country house, rock festivals"},
    {name:"Shaw's Corner",location:"Ayot St Lawrence",county:"Hertfordshire",category:"Historic House & Estate",capacity:"60",note:"National Trust, George Bernard Shaw's home"},
    {name:"Gorhambury House",location:"St Albans",county:"Hertfordshire",category:"Historic House & Estate",capacity:"200",note:"Palladian mansion, Grimston family"},
    {name:"Wrotham Park",location:"Barnet",county:"Hertfordshire",category:"Historic House & Estate",capacity:"250",note:"Palladian mansion, filming location"},
    {name:"Beaulieu Palace House",location:"Beaulieu",county:"Hampshire",category:"Historic House & Estate",capacity:"300",note:"Former abbey gatehouse, motor museum"},
    {name:"Hinton Ampner",location:"Alresford",county:"Hampshire",category:"Historic House & Estate",capacity:"200",note:"National Trust, Ralph Dutton's country house"},
    {name:"The Vyne",location:"Basingstoke",county:"Hampshire",category:"Historic House & Estate",capacity:"200",note:"National Trust, Tudor mansion with classical portico"},

    // ── CASTLES (22) ──
    {name:"Leeds Castle",location:"Maidstone",county:"Kent",category:"Castle",capacity:"400",note:"'Loveliest castle in the world', moated"},
    {name:"Hever Castle",location:"Edenbridge",county:"Kent",category:"Castle",capacity:"300",note:"Childhood home of Anne Boleyn, double moat"},
    {name:"Dover Castle",location:"Dover",county:"Kent",category:"Castle",capacity:"300",note:"English Heritage, 'Key to England'"},
    {name:"Bodiam Castle",location:"Robertsbridge",county:"Sussex",category:"Castle",capacity:"200",note:"National Trust, 14th century moated castle"},
    {name:"Arundel Castle",location:"Arundel",county:"Sussex",category:"Castle",capacity:"350",note:"Duke of Norfolk's seat, 1000 years of history"},
    {name:"Windsor Castle",location:"Windsor",county:"Berkshire",category:"Castle",capacity:"500",note:"Oldest & largest occupied castle in the world"},
    {name:"Warwick Castle",location:"Warwick",county:"Warwickshire",category:"Castle",capacity:"400",note:"Medieval castle, Merlin Entertainment"},
    {name:"Kenilworth Castle",location:"Kenilworth",county:"Warwickshire",category:"Castle",capacity:"250",note:"English Heritage, Elizabethan garden"},
    {name:"Walmer Castle",location:"Deal",county:"Kent",category:"Castle",capacity:"150",note:"English Heritage, Duke of Wellington's residence"},
    {name:"Scotney Castle",location:"Lamberhurst",county:"Kent",category:"Castle",capacity:"150",note:"National Trust, romantic ruins & gardens"},
    {name:"Lullingstone Castle",location:"Eynsford",county:"Kent",category:"Castle",capacity:"200",note:"One of England's oldest family estates"},
    {name:"Rochester Castle",location:"Rochester",county:"Kent",category:"Castle",capacity:"200",note:"English Heritage, Norman keep"},
    {name:"Tonbridge Castle",location:"Tonbridge",county:"Kent",category:"Castle",capacity:"150",note:"Motte and bailey, 13th century gatehouse"},
    {name:"Lewes Castle",location:"Lewes",county:"Sussex",category:"Castle",capacity:"150",note:"Norman castle with two mottes"},
    {name:"Portchester Castle",location:"Fareham",county:"Hampshire",category:"Castle",capacity:"200",note:"Roman walls, Norman keep"},
    {name:"Donnington Castle",location:"Newbury",county:"Berkshire",category:"Castle",capacity:"100",note:"English Heritage, Civil War site"},
    {name:"Berkhamsted Castle",location:"Berkhamsted",county:"Hertfordshire",category:"Castle",capacity:"150",note:"English Heritage, Norman motte & bailey"},
    {name:"Framlingham Castle",location:"Framlingham",county:"Suffolk",category:"Castle",capacity:"200",note:"English Heritage, Tudor connections"},
    {name:"Orford Castle",location:"Orford",county:"Suffolk",category:"Castle",capacity:"100",note:"English Heritage, Henry II's keep"},
    {name:"Castle Rising",location:"King's Lynn",county:"Norfolk",category:"Castle",capacity:"150",note:"Norman keep, Queen Isabella's residence"},
    {name:"Norwich Castle",location:"Norwich",county:"Norfolk",category:"Castle",capacity:"250",note:"Norman keep, major museum"},
    {name:"Carisbrooke Castle",location:"Newport",county:"Hampshire",category:"Castle",capacity:"200",note:"English Heritage, Charles I imprisoned here"},

    // ── MUSEUMS & GALLERIES (30) ──
    {name:"Victoria & Albert Museum",location:"South Kensington",county:"London",category:"Museum & Gallery",capacity:"500",note:"World's leading museum of art & design"},
    {name:"Natural History Museum",location:"South Kensington",county:"London",category:"Museum & Gallery",capacity:"600",note:"Hintze Hall events, dinosaur backdrop"},
    {name:"Tate Modern",location:"Bankside",county:"London",category:"Museum & Gallery",capacity:"400",note:"Turbine Hall events, panoramic views"},
    {name:"British Museum",location:"Bloomsbury",county:"London",category:"Museum & Gallery",capacity:"500",note:"Great Court events, 8 million objects"},
    {name:"Science Museum",location:"South Kensington",county:"London",category:"Museum & Gallery",capacity:"400",note:"Late events, IMAX theatre"},
    {name:"National Gallery",location:"Trafalgar Square",county:"London",category:"Museum & Gallery",capacity:"350",note:"Events among masterpieces"},
    {name:"Serpentine Galleries",location:"Hyde Park",county:"London",category:"Museum & Gallery",capacity:"200",note:"Pavilion events, contemporary art"},
    {name:"Saatchi Gallery",location:"Chelsea",county:"London",category:"Museum & Gallery",capacity:"300",note:"Duke of York's HQ, contemporary art"},
    {name:"Design Museum",location:"Kensington",county:"London",category:"Museum & Gallery",capacity:"250",note:"Commonwealth Institute building"},
    {name:"Barbican Centre",location:"City of London",county:"London",category:"Museum & Gallery",capacity:"400",note:"Brutalist arts centre, multiple venues"},
    {name:"Whitechapel Gallery",location:"Whitechapel",county:"London",category:"Museum & Gallery",capacity:"200",note:"Contemporary art, Art Nouveau building"},
    {name:"ICA",location:"The Mall",county:"London",category:"Museum & Gallery",capacity:"150",note:"Institute of Contemporary Arts"},
    {name:"Wallace Collection",location:"Marylebone",county:"London",category:"Museum & Gallery",capacity:"200",note:"Great Gallery events, Old Masters"},
    {name:"Sir John Soane's Museum",location:"Holborn",county:"London",category:"Museum & Gallery",capacity:"80",note:"Architect's eccentric home, candlelit events"},
    {name:"Dulwich Picture Gallery",location:"Dulwich",county:"London",category:"Museum & Gallery",capacity:"200",note:"England's first purpose-built public gallery"},
    {name:"Royal Academy of Arts",location:"Piccadilly",county:"London",category:"Museum & Gallery",capacity:"300",note:"Burlington House, Summer Exhibition"},
    {name:"Ashmolean Museum",location:"Oxford",county:"Oxfordshire",category:"Museum & Gallery",capacity:"300",note:"World's first university museum"},
    {name:"Pitt Rivers Museum",location:"Oxford",county:"Oxfordshire",category:"Museum & Gallery",capacity:"200",note:"Ethnographic & archaeological collections"},
    {name:"Brighton Museum",location:"Brighton",county:"Sussex",category:"Museum & Gallery",capacity:"200",note:"Art Deco interiors, Royal Pavilion gardens"},
    {name:"De La Warr Pavilion",location:"Bexhill-on-Sea",county:"Sussex",category:"Museum & Gallery",capacity:"250",note:"Modernist Grade I landmark"},
    {name:"Turner Contemporary",location:"Margate",county:"Kent",category:"Museum & Gallery",capacity:"200",note:"David Chipperfield design, seafront"},
    {name:"The Fitzwilliam Museum",location:"Cambridge",county:"Cambridgeshire",category:"Museum & Gallery",capacity:"250",note:"University museum, Egyptian collections"},
    {name:"Kettle's Yard",location:"Cambridge",county:"Cambridgeshire",category:"Museum & Gallery",capacity:"150",note:"Modern art in a domestic setting"},
    {name:"Sainsbury Centre",location:"Norwich",county:"Norfolk",category:"Museum & Gallery",capacity:"300",note:"Norman Foster building, UEA campus"},
    {name:"Watts Gallery",location:"Compton",county:"Surrey",category:"Museum & Gallery",capacity:"150",note:"Artists' village, Pre-Raphaelite connections"},
    {name:"Museum of the Home",location:"Hackney",county:"London",category:"Museum & Gallery",capacity:"200",note:"Almshouse setting, garden events"},
    {name:"Horniman Museum",location:"Forest Hill",county:"London",category:"Museum & Gallery",capacity:"200",note:"Art Nouveau building, panoramic gardens"},
    {name:"Pallant House Gallery",location:"Chichester",county:"Sussex",category:"Museum & Gallery",capacity:"150",note:"Queen Anne townhouse, modern British art"},
    {name:"The Lightbox",location:"Woking",county:"Surrey",category:"Museum & Gallery",capacity:"200",note:"Contemporary gallery & museum"},
    {name:"River & Rowing Museum",location:"Henley-on-Thames",county:"Oxfordshire",category:"Museum & Gallery",capacity:"200",note:"David Chipperfield, Thames-side"},

    // ── MEMBERS CLUBS (7) ──
    {name:"Annabel's",location:"Mayfair",county:"London",category:"Members Club",capacity:"250",note:"Berkeley Square, legendary private club"},
    {name:"Soho House Dean Street",location:"Soho",county:"London",category:"Members Club",capacity:"200",note:"Flagship, private events & screening room"},
    {name:"The Groucho Club",location:"Soho",county:"London",category:"Members Club",capacity:"150",note:"Media & arts private members"},
    {name:"Home House",location:"Marylebone",county:"London",category:"Members Club",capacity:"200",note:"Three Georgian townhouses"},
    {name:"The Arts Club",location:"Mayfair",county:"London",category:"Members Club",capacity:"150",note:"Founded 1863, Dickens & Monet members"},
    {name:"Babington House",location:"Frome",county:"Somerset",category:"Members Club",capacity:"200",note:"Soho House country retreat"},
    {name:"Shoreditch House",location:"Shoreditch",county:"London",category:"Members Club",capacity:"200",note:"Rooftop pool, creative hub"},

    // ── RESTAURANTS & PRIVATE DINING (15) ──
    {name:"Scott's",location:"Mayfair",county:"London",category:"Restaurant & Private Dining",capacity:"60",note:"Iconic seafood, private dining rooms"},
    {name:"The Ivy",location:"Covent Garden",county:"London",category:"Restaurant & Private Dining",capacity:"100",note:"Theatrical dining, private rooms"},
    {name:"Sketch",location:"Mayfair",county:"London",category:"Restaurant & Private Dining",capacity:"200",note:"David Shrigley installation, The Lecture Room"},
    {name:"Chiltern Firehouse",location:"Marylebone",county:"London",category:"Restaurant & Private Dining",capacity:"120",note:"André Balazs hotel-restaurant"},
    {name:"BRAT",location:"Shoreditch",county:"London",category:"Restaurant & Private Dining",capacity:"60",note:"Wood-fired Basque, Michelin star"},
    {name:"The Fat Duck",location:"Bray",county:"Berkshire",category:"Restaurant & Private Dining",capacity:"42",note:"Heston Blumenthal, 3 Michelin stars"},
    {name:"The Waterside Inn",location:"Bray",county:"Berkshire",category:"Restaurant & Private Dining",capacity:"70",note:"Roux family, 3 Michelin stars"},
    {name:"Le Manoir aux Quat'Saisons",location:"Great Milton",county:"Oxfordshire",category:"Restaurant & Private Dining",capacity:"80",note:"Raymond Blanc, 2 Michelin stars"},
    {name:"The Hand & Flowers",location:"Marlow",county:"Buckinghamshire",category:"Restaurant & Private Dining",capacity:"50",note:"Tom Kerridge, 2 Michelin stars"},
    {name:"Restaurant Sat Bains",location:"Nottingham",county:"Nottinghamshire",category:"Restaurant & Private Dining",capacity:"40",note:"2 Michelin stars, tasting menu"},
    {name:"Moor Hall",location:"Aughton",county:"Lancashire",category:"Restaurant & Private Dining",capacity:"50",note:"Mark Birchall, 2 Michelin stars"},
    {name:"The Clove Club",location:"Shoreditch",county:"London",category:"Restaurant & Private Dining",capacity:"60",note:"Shoreditch Town Hall, tasting menus"},
    {name:"Lyle's",location:"Shoreditch",county:"London",category:"Restaurant & Private Dining",capacity:"50",note:"Tea Building, seasonal British"},
    {name:"The River Café",location:"Hammersmith",county:"London",category:"Restaurant & Private Dining",capacity:"100",note:"Italian, Thames-side garden"},
    {name:"Spring",location:"Somerset House",county:"London",category:"Restaurant & Private Dining",capacity:"120",note:"Skye Gyngell, New Wing setting"},

    // ── GARDENS & PARKS (17) ──
    {name:"RHS Wisley",location:"Wisley",county:"Surrey",category:"Garden & Park Venue",capacity:"300",note:"Royal Horticultural Society flagship garden"},
    {name:"Kew Gardens",location:"Kew",county:"London",category:"Garden & Park Venue",capacity:"400",note:"UNESCO World Heritage, Palm House & Temperate House"},
    {name:"Sissinghurst Castle Garden",location:"Cranbrook",county:"Kent",category:"Garden & Park Venue",capacity:"200",note:"National Trust, Vita Sackville-West's creation"},
    {name:"Great Dixter",location:"Northiam",county:"Sussex",category:"Garden & Park Venue",capacity:"150",note:"Christopher Lloyd's garden, Arts & Crafts house"},
    {name:"Sheffield Park",location:"Uckfield",county:"Sussex",category:"Garden & Park Venue",capacity:"200",note:"National Trust, landscape garden, lakes"},
    {name:"Leonardslee Gardens",location:"Horsham",county:"Sussex",category:"Garden & Park Venue",capacity:"250",note:"Grade I listed woodland gardens, wallabies"},
    {name:"RHS Hyde Hall",location:"Chelmsford",county:"Essex",category:"Garden & Park Venue",capacity:"200",note:"Hilltop garden, dry garden"},
    {name:"Beth Chatto Gardens",location:"Colchester",county:"Essex",category:"Garden & Park Venue",capacity:"150",note:"Ecological gardening pioneer"},
    {name:"The Savill Garden",location:"Windsor",county:"Berkshire",category:"Garden & Park Venue",capacity:"200",note:"Crown Estate, woodland & formal gardens"},
    {name:"Stowe Landscape Gardens",location:"Buckingham",county:"Buckinghamshire",category:"Garden & Park Venue",capacity:"300",note:"National Trust, 18th century landscape"},
    {name:"Painshill Park",location:"Cobham",county:"Surrey",category:"Garden & Park Venue",capacity:"200",note:"18th century landscape garden, crystal grotto"},
    {name:"RHS Garden Bridgewater",location:"Worsley",county:"Greater Manchester",category:"Garden & Park Venue",capacity:"300",note:"RHS northern garden"},
    {name:"Wisley Alpine House",location:"Wisley",county:"Surrey",category:"Garden & Park Venue",capacity:"100",note:"Glasshouse events, intimate setting"},
    {name:"Waterperry Gardens",location:"Wheatley",county:"Oxfordshire",category:"Garden & Park Venue",capacity:"200",note:"8 acres of ornamental gardens"},
    {name:"Exbury Gardens",location:"Beaulieu",county:"Hampshire",category:"Garden & Park Venue",capacity:"200",note:"Rothschild woodland garden, steam railway"},
    {name:"Borde Hill Garden",location:"Haywards Heath",county:"Sussex",category:"Garden & Park Venue",capacity:"200",note:"Heritage garden, champion trees"},
    {name:"West Dean Gardens",location:"Chichester",county:"Sussex",category:"Garden & Park Venue",capacity:"200",note:"Edward James Foundation, arts college"},

    // ── THEATRES & CONCERT VENUES (12) ──
    {name:"Royal Opera House",location:"Covent Garden",county:"London",category:"Theatre & Concert Venue",capacity:"400",note:"Paul Hamlyn Hall events, iconic setting"},
    {name:"Roundhouse",location:"Camden",county:"London",category:"Theatre & Concert Venue",capacity:"350",note:"Converted railway engine shed, events & arts"},
    {name:"Royal Albert Hall",location:"Kensington",county:"London",category:"Theatre & Concert Venue",capacity:"500",note:"Victorian concert hall, private hire"},
    {name:"Southbank Centre",location:"South Bank",county:"London",category:"Theatre & Concert Venue",capacity:"400",note:"Royal Festival Hall & Queen Elizabeth Hall"},
    {name:"Somerset House",location:"Strand",county:"London",category:"Theatre & Concert Venue",capacity:"350",note:"Neoclassical courtyard, ice rink events"},
    {name:"Glyndebourne",location:"Lewes",county:"Sussex",category:"Theatre & Concert Venue",capacity:"350",note:"Opera house, gardens, corporate hospitality"},
    {name:"Garsington Opera",location:"Wormsley",county:"Buckinghamshire",category:"Theatre & Concert Venue",capacity:"200",note:"Getty estate, summer opera festival"},
    {name:"The Old Vic",location:"Waterloo",county:"London",category:"Theatre & Concert Venue",capacity:"200",note:"Historic theatre, private events"},
    {name:"Cadogan Hall",location:"Chelsea",county:"London",category:"Theatre & Concert Venue",capacity:"250",note:"Concert hall, Royal Philharmonic home"},
    {name:"Theatre Royal Drury Lane",location:"Covent Garden",county:"London",category:"Theatre & Concert Venue",capacity:"300",note:"London's oldest theatre, grand staircase"},
    {name:"Oxford Playhouse",location:"Oxford",county:"Oxfordshire",category:"Theatre & Concert Venue",capacity:"200",note:"University drama, private hire"},
    {name:"Theatre Royal Brighton",location:"Brighton",county:"Sussex",category:"Theatre & Concert Venue",capacity:"250",note:"Grade II listed Victorian theatre"},

    // ── RACECOURSES & SPORTING (10) ──
    {name:"Royal Ascot",location:"Ascot",county:"Berkshire",category:"Racecourse & Sporting",capacity:"500",note:"Royal Enclosure, corporate hospitality"},
    {name:"Goodwood Racecourse",location:"Chichester",county:"Sussex",category:"Racecourse & Sporting",capacity:"400",note:"Glorious Goodwood, Festival of Speed"},
    {name:"Epsom Downs",location:"Epsom",county:"Surrey",category:"Racecourse & Sporting",capacity:"400",note:"The Derby, Queen's Stand"},
    {name:"Sandown Park",location:"Esher",county:"Surrey",category:"Racecourse & Sporting",capacity:"350",note:"Racing & events, Eclipse Bar"},
    {name:"Kempton Park",location:"Sunbury",county:"Surrey",category:"Racecourse & Sporting",capacity:"300",note:"Jockey Club, flat & jump racing"},
    {name:"Newbury Racecourse",location:"Newbury",county:"Berkshire",category:"Racecourse & Sporting",capacity:"350",note:"Conference & events centre"},
    {name:"Cheltenham Racecourse",location:"Cheltenham",county:"Gloucestershire",category:"Racecourse & Sporting",capacity:"500",note:"The Festival, Gold Cup"},
    {name:"Lord's Cricket Ground",location:"St John's Wood",county:"London",category:"Racecourse & Sporting",capacity:"300",note:"Home of cricket, Long Room events"},
    {name:"The Hurlingham Club",location:"Fulham",county:"London",category:"Racecourse & Sporting",capacity:"250",note:"42-acre private members sporting club"},
    {name:"Guards Polo Club",location:"Windsor",county:"Berkshire",category:"Racecourse & Sporting",capacity:"300",note:"Premier polo, royal connections"},

    // ── CHURCHES & CATHEDRALS (31) ──
    {name:"St Paul's Cathedral",location:"City of London",county:"London",category:"Church & Cathedral",capacity:"500",note:"Wren masterpiece, events in the crypt"},
    {name:"Southwark Cathedral",location:"London Bridge",county:"London",category:"Church & Cathedral",capacity:"300",note:"Gothic, Borough Market adjacent"},
    {name:"Canterbury Cathedral",location:"Canterbury",county:"Kent",category:"Church & Cathedral",capacity:"400",note:"UNESCO World Heritage, mother church"},
    {name:"Winchester Cathedral",location:"Winchester",county:"Hampshire",category:"Church & Cathedral",capacity:"350",note:"Longest medieval cathedral in Europe"},
    {name:"Salisbury Cathedral",location:"Salisbury",county:"Wiltshire",category:"Church & Cathedral",capacity:"350",note:"Tallest spire in UK, Magna Carta"},
    {name:"Chichester Cathedral",location:"Chichester",county:"Sussex",category:"Church & Cathedral",capacity:"300",note:"Norman cathedral, Chagall window"},
    {name:"Guildford Cathedral",location:"Guildford",county:"Surrey",category:"Church & Cathedral",capacity:"300",note:"20th century brick cathedral"},
    {name:"St Albans Cathedral",location:"St Albans",county:"Hertfordshire",category:"Church & Cathedral",capacity:"300",note:"Medieval wall paintings, longest nave"},
    {name:"Christ Church Cathedral",location:"Oxford",county:"Oxfordshire",category:"Church & Cathedral",capacity:"250",note:"Harry Potter dining hall"},
    {name:"Rochester Cathedral",location:"Rochester",county:"Kent",category:"Church & Cathedral",capacity:"250",note:"Second oldest cathedral in England"},
    {name:"Chelmsford Cathedral",location:"Chelmsford",county:"Essex",category:"Church & Cathedral",capacity:"200",note:"Parish church elevated to cathedral"},
    {name:"Norwich Cathedral",location:"Norwich",county:"Norfolk",category:"Church & Cathedral",capacity:"300",note:"Norman cathedral, second tallest spire"},
    {name:"Ely Cathedral",location:"Ely",county:"Cambridgeshire",category:"Church & Cathedral",capacity:"300",note:"'Ship of the Fens', octagonal lantern"},
    {name:"Peterborough Cathedral",location:"Peterborough",county:"Cambridgeshire",category:"Church & Cathedral",capacity:"300",note:"Norman architecture, Catherine of Aragon buried here"},
    {name:"Gloucester Cathedral",location:"Gloucester",county:"Gloucestershire",category:"Church & Cathedral",capacity:"300",note:"Fan vaulting, Harry Potter filming"},
    {name:"Temple Church",location:"City of London",county:"London",category:"Church & Cathedral",capacity:"150",note:"Knights Templar, circular nave"},
    {name:"St Bartholomew the Great",location:"Smithfield",county:"London",category:"Church & Cathedral",capacity:"200",note:"London's oldest parish church, Norman"},
    {name:"St Martin-in-the-Fields",location:"Trafalgar Square",county:"London",category:"Church & Cathedral",capacity:"200",note:"James Gibbs design, crypt café"},
    {name:"St James's Piccadilly",location:"Piccadilly",county:"London",category:"Church & Cathedral",capacity:"200",note:"Wren church, courtyard market"},
    {name:"St Bride's Church",location:"Fleet Street",county:"London",category:"Church & Cathedral",capacity:"200",note:"Journalists' church, wedding cake spire"},
    {name:"St George's Chapel",location:"Windsor",county:"Berkshire",category:"Church & Cathedral",capacity:"250",note:"Royal weddings, Order of the Garter"},
    {name:"Romsey Abbey",location:"Romsey",county:"Hampshire",category:"Church & Cathedral",capacity:"200",note:"Norman abbey, Mountbatten connections"},
    {name:"Tewkesbury Abbey",location:"Tewkesbury",county:"Gloucestershire",category:"Church & Cathedral",capacity:"300",note:"Norman tower, medieval stained glass"},
    {name:"Battle Abbey",location:"Battle",county:"Sussex",category:"Church & Cathedral",capacity:"200",note:"English Heritage, 1066 battlefield site"},
    {name:"Boxgrove Priory",location:"Chichester",county:"Sussex",category:"Church & Cathedral",capacity:"150",note:"Benedictine priory, medieval paintings"},
    {name:"Bayham Old Abbey",location:"Lamberhurst",county:"Kent",category:"Church & Cathedral",capacity:"150",note:"English Heritage, Premonstratensian ruins"},
    {name:"St Mary's Church Rye",location:"Rye",county:"Sussex",category:"Church & Cathedral",capacity:"150",note:"Norman church, turret clock"},
    {name:"Waltham Abbey",location:"Waltham Abbey",county:"Essex",category:"Church & Cathedral",capacity:"200",note:"Norman nave, Harold II buried here"},
    {name:"Dorchester Abbey",location:"Dorchester",county:"Oxfordshire",category:"Church & Cathedral",capacity:"200",note:"Augustinian abbey, Jesse window"},
    {name:"Christchurch Priory",location:"Christchurch",county:"Dorset",category:"Church & Cathedral",capacity:"250",note:"Longest parish church in England"},
    {name:"Malmesbury Abbey",location:"Malmesbury",county:"Wiltshire",category:"Church & Cathedral",capacity:"200",note:"Norman abbey, oldest borough in England"},

    // ── VINEYARDS & BREWERIES (5) ──
    {name:"Denbies Wine Estate",location:"Dorking",county:"Surrey",category:"Vineyard & Brewery",capacity:"200",note:"England's largest vineyard, events & tours"},
    {name:"Gusbourne Estate",location:"Appledore",county:"Kent",category:"Vineyard & Brewery",capacity:"100",note:"Award-winning English sparkling wine"},
    {name:"Chapel Down",location:"Tenterden",county:"Kent",category:"Vineyard & Brewery",capacity:"150",note:"Leading English winemaker, restaurant"},
    {name:"Ridgeview Estate",location:"Ditchling",county:"Sussex",category:"Vineyard & Brewery",capacity:"100",note:"English sparkling, served at State banquets"},
    {name:"Meantime Brewery",location:"Greenwich",county:"London",category:"Vineyard & Brewery",capacity:"150",note:"Craft brewery, Old Royal Naval College adjacent"},

    // ── CONFERENCE & EXHIBITION (4) ──
    {name:"ExCeL London",location:"Royal Victoria Dock",county:"London",category:"Conference & Exhibition",capacity:"5000",note:"100,000 sqm, major exhibitions"},
    {name:"Olympia London",location:"Hammersmith",county:"London",category:"Conference & Exhibition",capacity:"3000",note:"Victorian exhibition centre, events"},
    {name:"Business Design Centre",location:"Islington",county:"London",category:"Conference & Exhibition",capacity:"2000",note:"Former Royal Agricultural Hall"},
    {name:"Farnborough International",location:"Farnborough",county:"Hampshire",category:"Conference & Exhibition",capacity:"3000",note:"Airshow venue, exhibition centre"},

    // ── SCHOOLS & UNIVERSITIES (10) ──
    {name:"Eton College",location:"Windsor",county:"Berkshire",category:"School & University",capacity:"200",note:"Historic school, chapel & hall"},
    {name:"Christ Church College",location:"Oxford",county:"Oxfordshire",category:"School & University",capacity:"250",note:"Great Hall, Tom Quad, cathedral"},
    {name:"Balliol College",location:"Oxford",county:"Oxfordshire",category:"School & University",capacity:"200",note:"Medieval hall, garden quad"},
    {name:"Bodleian Library",location:"Oxford",county:"Oxfordshire",category:"School & University",capacity:"200",note:"Divinity School events, Duke Humfrey's Library"},
    {name:"King's College Cambridge",location:"Cambridge",county:"Cambridgeshire",category:"School & University",capacity:"250",note:"Gothic chapel, choral events"},
    {name:"Trinity College Cambridge",location:"Cambridge",county:"Cambridgeshire",category:"School & University",capacity:"250",note:"Wren Library, Great Court"},
    {name:"St John's College Cambridge",location:"Cambridge",county:"Cambridgeshire",category:"School & University",capacity:"200",note:"Bridge of Sighs, medieval courts"},
    {name:"University of London Senate House",location:"Bloomsbury",county:"London",category:"School & University",capacity:"300",note:"Art Deco landmark, events"},
    {name:"Charterhouse School",location:"Godalming",county:"Surrey",category:"School & University",capacity:"200",note:"Historic public school, chapel"},
    {name:"Wellington College",location:"Crowthorne",county:"Berkshire",category:"School & University",capacity:"250",note:"Victorian school, chapel & grounds"},

    // ── WAREHOUSE & INDUSTRIAL (3) ──
    {name:"The Steel Yard",location:"City of London",county:"London",category:"Warehouse & Industrial",capacity:"300",note:"Converted warehouse, exposed steel"},
    {name:"MC Motors",location:"Dalston",county:"London",category:"Warehouse & Industrial",capacity:"200",note:"Restored garage, industrial chic"},
    {name:"Trinity Buoy Wharf",location:"East London",county:"London",category:"Warehouse & Industrial",capacity:"250",note:"Container City, lighthouse, Thames views"},

    // ── RIVERSIDE & WATERSIDE (4) ──
    {name:"Battersea Power Station",location:"Battersea",county:"London",category:"Riverside & Waterside",capacity:"500",note:"Turbine Halls, iconic landmark events"},
    {name:"Old Royal Naval College",location:"Greenwich",county:"London",category:"Riverside & Waterside",capacity:"400",note:"Painted Hall, Thames riverside"},
    {name:"Cutty Sark",location:"Greenwich",county:"London",category:"Riverside & Waterside",capacity:"200",note:"Historic clipper ship, events on board"},
    {name:"Henley Royal Regatta",location:"Henley-on-Thames",county:"Oxfordshire",category:"Riverside & Waterside",capacity:"300",note:"Riverside hospitality, summer event"},

    // ── BARNS & FARMS (1) ──
    {name:"Bury Court Barn",location:"Farnham",county:"Surrey",category:"Barn & Farm",capacity:"180",note:"Converted barn, Piet Oudolf gardens"},

    // ── CIVIC & COMMUNITY (40) ──
    {name:"Guildhall London",location:"City of London",county:"London",category:"Civic & Community Venue",capacity:"500",note:"Medieval Great Hall, City of London ceremonies"},
    {name:"Mansion House",location:"City of London",county:"London",category:"Civic & Community Venue",capacity:"350",note:"Lord Mayor's official residence"},
    {name:"Banqueting House",location:"Whitehall",county:"London",category:"Civic & Community Venue",capacity:"400",note:"Rubens ceiling, only surviving Whitehall Palace building"},
    {name:"Central Hall Westminster",location:"Westminster",county:"London",category:"Civic & Community Venue",capacity:"500",note:"Methodist hall, first UN General Assembly"},
    {name:"Alexandra Palace",location:"Muswell Hill",county:"London",category:"Civic & Community Venue",capacity:"500",note:"'The People's Palace', panoramic views"},
    {name:"Woolwich Town Hall",location:"Woolwich",county:"London",category:"Civic & Community Venue",capacity:"300",note:"Edwardian civic building"},
    {name:"Islington Assembly Hall",location:"Islington",county:"London",category:"Civic & Community Venue",capacity:"250",note:"Art Deco hall, live events"},
    {name:"Shoreditch Town Hall",location:"Shoreditch",county:"London",category:"Civic & Community Venue",capacity:"300",note:"Victorian civic, arts venue"},
    {name:"Hackney Town Hall",location:"Hackney",county:"London",category:"Civic & Community Venue",capacity:"250",note:"1930s Art Deco civic building"},
    {name:"Brighton Dome",location:"Brighton",county:"Sussex",category:"Civic & Community Venue",capacity:"350",note:"Royal Pavilion estate, concert hall"},
    {name:"Royal Pavilion Brighton",location:"Brighton",county:"Sussex",category:"Civic & Community Venue",capacity:"300",note:"Indo-Saracenic palace, banqueting rooms"},
    {name:"Cheltenham Town Hall",location:"Cheltenham",county:"Gloucestershire",category:"Civic & Community Venue",capacity:"300",note:"Victorian hall, festival venue"},
    {name:"Oxford Town Hall",location:"Oxford",county:"Oxfordshire",category:"Civic & Community Venue",capacity:"250",note:"Victorian Gothic, Main Hall & Assembly Room"},
    {name:"Reading Town Hall",location:"Reading",county:"Berkshire",category:"Civic & Community Venue",capacity:"300",note:"Victorian municipal hall"},
    {name:"Winchester Guildhall",location:"Winchester",county:"Hampshire",category:"Civic & Community Venue",capacity:"250",note:"Gothic Revival civic building"},
    {name:"Tunbridge Wells Assembly Hall",location:"Tunbridge Wells",county:"Kent",category:"Civic & Community Venue",capacity:"300",note:"Art Deco theatre & events"},
    {name:"Canterbury Guildhall",location:"Canterbury",county:"Kent",category:"Civic & Community Venue",capacity:"200",note:"Medieval guildhall, city centre"},
    {name:"Maidstone Town Hall",location:"Maidstone",county:"Kent",category:"Civic & Community Venue",capacity:"250",note:"Victorian civic building"},
    {name:"Colchester Town Hall",location:"Colchester",county:"Essex",category:"Civic & Community Venue",capacity:"250",note:"Baroque tower, Moot Hall"},
    {name:"Ipswich Town Hall",location:"Ipswich",county:"Suffolk",category:"Civic & Community Venue",capacity:"250",note:"Victorian civic building"},
    {name:"Norwich Assembly House",location:"Norwich",county:"Norfolk",category:"Civic & Community Venue",capacity:"300",note:"Georgian rooms, Music Room events"},
    {name:"Cambridge Guildhall",location:"Cambridge",county:"Cambridgeshire",category:"Civic & Community Venue",capacity:"250",note:"Market Square civic building"},
    {name:"Bedford Corn Exchange",location:"Bedford",county:"Bedfordshire",category:"Civic & Community Venue",capacity:"250",note:"Victorian entertainment venue"},
    {name:"Aylesbury Waterside Theatre",location:"Aylesbury",county:"Buckinghamshire",category:"Civic & Community Venue",capacity:"300",note:"Modern theatre & events"},
    {name:"High Wycombe Guildhall",location:"High Wycombe",county:"Buckinghamshire",category:"Civic & Community Venue",capacity:"200",note:"Robert Adam design, 18th century"},
    {name:"St Albans Museum + Gallery",location:"St Albans",county:"Hertfordshire",category:"Civic & Community Venue",capacity:"200",note:"Old Town Hall, museum & events"},
    {name:"Watford Colosseum",location:"Watford",county:"Hertfordshire",category:"Civic & Community Venue",capacity:"300",note:"Art Deco concert hall"},
    {name:"Guildford Civic",location:"Guildford",county:"Surrey",category:"Civic & Community Venue",capacity:"250",note:"Multi-purpose events venue"},
    {name:"Dorking Halls",location:"Dorking",county:"Surrey",category:"Civic & Community Venue",capacity:"200",note:"Community events & cinema"},
    {name:"Worthing Assembly Hall",location:"Worthing",county:"Sussex",category:"Civic & Community Venue",capacity:"250",note:"Art Deco municipal hall"},
    {name:"Hastings White Rock Theatre",location:"Hastings",county:"Sussex",category:"Civic & Community Venue",capacity:"250",note:"Seafront theatre & events"},
    {name:"Eastbourne Winter Garden",location:"Eastbourne",county:"Sussex",category:"Civic & Community Venue",capacity:"300",note:"Seafront congress venue"},
    {name:"Margate Winter Gardens",location:"Margate",county:"Kent",category:"Civic & Community Venue",capacity:"250",note:"Grade II listed entertainment venue"},
    {name:"Folkestone Leas Cliff Hall",location:"Folkestone",county:"Kent",category:"Civic & Community Venue",capacity:"250",note:"Clifftop conference & events"},
    {name:"Basingstoke Anvil",location:"Basingstoke",county:"Hampshire",category:"Civic & Community Venue",capacity:"300",note:"Concert hall & Haymarket theatre"},
    {name:"Salisbury City Hall",location:"Salisbury",county:"Wiltshire",category:"Civic & Community Venue",capacity:"250",note:"Modern civic centre"},
    {name:"Swindon STEAM Museum",location:"Swindon",county:"Wiltshire",category:"Civic & Community Venue",capacity:"250",note:"Former GWR works, railway heritage"},
    {name:"Cheltenham Pittville Pump Room",location:"Cheltenham",county:"Gloucestershire",category:"Civic & Community Venue",capacity:"200",note:"Regency spa building, columns"},
    {name:"Northampton Guildhall",location:"Northampton",county:"Northamptonshire",category:"Civic & Community Venue",capacity:"250",note:"Victorian Gothic civic building"},
    {name:"Leamington Spa Royal Pump Rooms",location:"Leamington Spa",county:"Warwickshire",category:"Civic & Community Venue",capacity:"200",note:"Regency spa rooms, gallery"},

    // ── FESTIVAL & UNIQUE (23) ──
    {name:"Kensington Palace",location:"Kensington",county:"London",category:"Festival & Unique",capacity:"350",note:"Royal palace, Orangery & State Apartments"},
    {name:"Tower of London",location:"Tower Hamlets",county:"London",category:"Festival & Unique",capacity:"400",note:"Historic Royal Palace, White Tower"},
    {name:"HMS Belfast",location:"Southwark",county:"London",category:"Festival & Unique",capacity:"200",note:"WWII warship, Thames-side events"},
    {name:"The Shard",location:"London Bridge",county:"London",category:"Festival & Unique",capacity:"200",note:"Floor 72 events, panoramic London views"},
    {name:"Two Temple Place",location:"Embankment",county:"London",category:"Festival & Unique",capacity:"200",note:"Neo-Gothic mansion, Astor connections"},
    {name:"One Marylebone",location:"Marylebone",county:"London",category:"Festival & Unique",capacity:"300",note:"Deconsecrated church, Soane design"},
    {name:"The Charterhouse",location:"Smithfield",county:"London",category:"Festival & Unique",capacity:"200",note:"14th century Carthusian monastery"},
    {name:"Battersea Arts Centre",location:"Battersea",county:"London",category:"Festival & Unique",capacity:"200",note:"Former town hall, Grand Hall events"},
    {name:"The Brewery",location:"City of London",county:"London",category:"Festival & Unique",capacity:"400",note:"Restored 18th century brewery, Porter Tun Room"},
    {name:"Tobacco Dock",location:"Wapping",county:"London",category:"Festival & Unique",capacity:"500",note:"Grade I listed warehouse, events"},
    {name:"Strawberry Hill House",location:"Twickenham",county:"London",category:"Festival & Unique",capacity:"200",note:"Gothic Revival, Horace Walpole's creation"},
    {name:"Ightham Mote",location:"Sevenoaks",county:"Kent",category:"Festival & Unique",capacity:"150",note:"National Trust, medieval moated manor"},
    {name:"The Observatory Science Centre",location:"Herstmonceux",county:"Sussex",category:"Festival & Unique",capacity:"200",note:"Former Royal Observatory, telescopes"},
    {name:"Brooklands Museum",location:"Weybridge",county:"Surrey",category:"Festival & Unique",capacity:"300",note:"Birthplace of British motorsport & aviation"},
    {name:"Bletchley Park",location:"Milton Keynes",county:"Buckinghamshire",category:"Festival & Unique",capacity:"300",note:"WWII codebreaking centre, Enigma"},
    {name:"Waddesdon Dairy",location:"Waddesdon",county:"Buckinghamshire",category:"Festival & Unique",capacity:"100",note:"National Trust, Victorian model dairy"},
    {name:"Dungeness",location:"Romney Marsh",county:"Kent",category:"Festival & Unique",capacity:"100",note:"Derek Jarman's garden, dramatic coastal"},
    {name:"Port Lympne Reserve",location:"Hythe",county:"Kent",category:"Festival & Unique",capacity:"200",note:"Safari park, Mansion House events"},
    {name:"Leeds Castle Golf Course",location:"Maidstone",county:"Kent",category:"Festival & Unique",capacity:"150",note:"Parkland course, castle backdrop"},
    {name:"Thorpe Park",location:"Chertsey",county:"Surrey",category:"Festival & Unique",capacity:"300",note:"Theme park, corporate events"},
    {name:"Hampton Court Flower Show",location:"East Molesey",county:"Surrey",category:"Festival & Unique",capacity:"500",note:"RHS festival, summer marquees"},
    {name:"Wilderness Festival Site",location:"Cornbury Park",county:"Oxfordshire",category:"Festival & Unique",capacity:"500",note:"Boutique festival grounds"},
    {name:"Henley Festival",location:"Henley-on-Thames",county:"Oxfordshire",category:"Festival & Unique",capacity:"300",note:"Black-tie arts festival, floating stage"},
  ];

  // Add lead score and status to each venue
  return venues.map((v, i) => ({
    ...v,
    id: i + 1,
    score: Math.max(40, Math.min(99, Math.floor(65 + Math.sin(i * 0.7) * 25 + Math.cos(i * 1.3) * 10))),
    status: i % 7 === 0 ? "Contacted" : i % 5 === 0 ? "Qualified" : i % 3 === 0 ? "Researched" : "New",
    lastActivity: i % 4 === 0 ? "Email sent" : i % 3 === 0 ? "LinkedIn viewed" : i % 2 === 0 ? "Website visited" : "Added to list",
  }));
};

const VENUES = generateVenues();

// ── Chart Data ──
const revenueData = [
  {month:"Jan",revenue:42000,costs:28000},{month:"Feb",revenue:38000,costs:25000},
  {month:"Mar",revenue:55000,costs:32000},{month:"Apr",revenue:68000,costs:35000},
  {month:"May",revenue:82000,costs:38000},{month:"Jun",revenue:95000,costs:42000},
  {month:"Jul",revenue:78000,costs:40000},{month:"Aug",revenue:88000,costs:44000},
  {month:"Sep",revenue:105000,costs:48000},{month:"Oct",revenue:92000,costs:45000},
  {month:"Nov",revenue:110000,costs:52000},{month:"Dec",revenue:125000,costs:55000},
];

const serviceData = [
  {name:"Staffing",value:40,color:C.accent},
  {name:"Events",value:25,color:"#6B8E6B"},
  {name:"Drink Styling",value:15,color:"#7A6B5D"},
  {name:"Consultancy",value:12,color:"#5D7A8E"},
  {name:"Creative/Studio",value:8,color:"#8E6B7A"},
];

const events = [
  {client:"Bombay Sapphire",event:"Summer Activation",date:"2026-04-15",value:"£35k"},
  {client:"Coca-Cola",event:"Festival Pop-Up",date:"2026-05-20",value:"£28k"},
  {client:"Taste of London",event:"Drinks Village 2026",date:"2026-06-15",value:"£65k"},
  {client:"Silverstone",event:"Paddock Hospitality",date:"2026-07-04",value:"£48k"},
  {client:"Fever-Tree",event:"Garden Party Series",date:"2026-07-18",value:"£22k"},
  {client:"Lord's Cricket",event:"Corporate Box Bar",date:"2026-08-01",value:"£18k"},
];

const team = [
  {name:"Joe Stokoe",role:"Director",initials:"JS",util:55},
  {name:"Seb",role:"Creative Director",initials:"SB",util:75},
  {name:"Emily",role:"Events Manager",initials:"EM",util:70},
  {name:"Jason",role:"Operations",initials:"JN",util:38},
  {name:"Matt",role:"Studio/Content",initials:"MT",util:80},
];

const campaigns = [
  {name:"Q2 Venue Outreach",status:"Active",sent:48,opened:31,replied:12,meetings:4,pipeline:"£85k"},
  {name:"Brand Activation Push",status:"Active",sent:35,opened:24,replied:8,meetings:3,pipeline:"£120k"},
  {name:"Winter Wedding Drive",status:"Paused",sent:62,opened:38,replied:15,meetings:6,pipeline:"£45k"},
  {name:"Festival Season 2026",status:"Draft",sent:0,opened:0,replied:0,meetings:0,pipeline:"£0"},
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [activeSection, setActiveSection] = useState("Command Centre");
  const [time, setTime] = useState(new Date());
  const [leadCategory, setLeadCategory] = useState("All");
  const [leadCounty, setLeadCounty] = useState("All");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadPage, setLeadPage] = useState(0);
  const LEADS_PER_PAGE = 25;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const filteredVenues = useMemo(() => {
    return VENUES.filter(v => {
      if (leadCategory !== "All" && v.category !== leadCategory) return false;
      if (leadCounty !== "All" && v.county !== leadCounty) return false;
      if (leadSearch && !v.name.toLowerCase().includes(leadSearch.toLowerCase()) &&
          !v.location.toLowerCase().includes(leadSearch.toLowerCase()) &&
          !v.note.toLowerCase().includes(leadSearch.toLowerCase())) return false;
      return true;
    });
  }, [leadCategory, leadCounty, leadSearch]);

  const pagedVenues = useMemo(() => {
    return filteredVenues.slice(leadPage * LEADS_PER_PAGE, (leadPage + 1) * LEADS_PER_PAGE);
  }, [filteredVenues, leadPage]);

  const totalPages = Math.ceil(filteredVenues.length / LEADS_PER_PAGE);

  useEffect(() => { setLeadPage(0); }, [leadCategory, leadCounty, leadSearch]);

  const navItems = ["Command Centre","Event Pipeline","Lead Generation","Time & Utilisation","Financial Hub","AI Assistant"];
  const dateStr = time.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const timeStr = time.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});

  // ── Styles ──
  const card = {background:C.card,border:`1px solid ${C.divider}`,borderRadius:8,padding:24};
  const cardSm = {...card, padding:16};
  const label = {fontSize:11,fontFamily:fonts.sans,fontWeight:600,letterSpacing:"0.08em",color:C.inkMuted,textTransform:"uppercase",marginBottom:6};
  const bigNum = {fontSize:32,fontFamily:fonts.serif,fontWeight:400,color:C.ink,lineHeight:1.1};
  const sectionTitle = {fontSize:28,fontFamily:fonts.serif,fontWeight:400,color:C.ink,margin:0};
  const sectionSub = {fontSize:14,fontFamily:fonts.sans,color:C.inkSecondary,marginTop:4};

  const statusBadge = (status) => {
    const map = {
      Active:{bg:C.successBg,color:C.success},
      Paused:{bg:C.warningBg,color:C.warning},
      Draft:{bg:"#F5F5F5",color:C.inkMuted},
      Contacted:{bg:C.accentSubtle,color:C.accent},
      Qualified:{bg:C.successBg,color:C.success},
      Researched:{bg:"#EDF4FE",color:"#2D6B8A"},
      New:{bg:"#F5F5F5",color:C.inkMuted},
      HOT:{bg:"#FEF2F2",color:C.hot},
      WARM:{bg:C.warningBg,color:C.warm},
      NEW:{bg:"#EDF4FE",color:C.newLead},
      COLD:{bg:"#F5F5F5",color:C.cold},
    };
    const s = map[status] || map.New;
    return {display:"inline-block",padding:"3px 10px",borderRadius:4,fontSize:11,fontFamily:fonts.sans,fontWeight:600,letterSpacing:"0.04em",background:s.bg,color:s.color};
  };

  const getScoreLabel = (score) => score >= 85 ? "HOT" : score >= 70 ? "WARM" : score >= 55 ? "NEW" : "COLD";

  // ── Render Sections ──
  const renderCommandCentre = () => (
    <div>
      <div style={{marginBottom:32}}>
        <h1 style={sectionTitle}>Command Centre</h1>
        <p style={sectionSub}>Operational overview — revenue, pipeline, and team performance</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16,marginBottom:24}}>
        {[
          {label:"Annual Revenue",value:"£830k",change:"+8.2%"},
          {label:"Staffing Revenue",value:"£500k",change:"+12.5%"},
          {label:"Confirmed Pipeline",value:"£176k",change:"+15%"},
          {label:"Net Profit",value:"£427k",change:"+6.1%"},
          {label:"Team Utilisation",value:"64%",change:"-3%",neg:true},
        ].map((m,i) => (
          <div key={i} style={card}>
            <div style={label}>{m.label}</div>
            <div style={bigNum}>{m.value}</div>
            <div style={{fontSize:13,fontFamily:fonts.sans,color:m.neg?C.danger:C.success,marginTop:8}}>{m.change} vs last period</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:24}}>
        <div style={card}>
          <div style={{...label,marginBottom:16}}>Revenue vs Costs — Monthly</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity={0.15}/>
                  <stop offset="100%" stopColor={C.accent} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.dividerLight} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:12,fontFamily:fonts.sans,fill:C.inkMuted}} axisLine={{stroke:C.divider}}/>
              <YAxis tick={{fontSize:12,fontFamily:fonts.sans,fill:C.inkMuted}} axisLine={false} tickLine={false} tickFormatter={v=>`£${v/1000}k`}/>
              <Tooltip contentStyle={{fontFamily:fonts.sans,fontSize:13,border:`1px solid ${C.divider}`,borderRadius:6,boxShadow:"0 4px 12px rgba(0,0,0,0.06)"}} formatter={v=>`£${(v/1000).toFixed(0)}k`}/>
              <Area type="monotone" dataKey="revenue" stroke={C.accent} fill="url(#revGrad)" strokeWidth={2}/>
              <Line type="monotone" dataKey="costs" stroke={C.danger} strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{...label,marginBottom:16}}>Revenue by Service</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={serviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {serviceData.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{fontFamily:fonts.sans,fontSize:13}} formatter={(v)=>`${v}%`}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",marginTop:8}}>
            {serviceData.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontFamily:fonts.sans,color:C.inkSecondary}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={card}>
          <div style={{...label,marginBottom:16}}>Upcoming Confirmed Events</div>
          {events.map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<events.length-1?`1px solid ${C.dividerLight}`:"none"}}>
              <div>
                <div style={{fontSize:15,fontFamily:fonts.serif,color:C.ink}}>{e.client}</div>
                <div style={{fontSize:13,fontFamily:fonts.sans,color:C.inkMuted}}>{e.event} · {e.date}</div>
              </div>
              <div style={{fontSize:16,fontFamily:fonts.serif,color:C.accent,fontWeight:500}}>{e.value}</div>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{...label,marginBottom:16}}>Team Utilisation</div>
          {team.map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<team.length-1?`1px solid ${C.dividerLight}`:"none"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.accentSubtle,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontFamily:fonts.sans,fontWeight:600,color:C.accent}}>{t.initials}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontFamily:fonts.sans,color:C.ink,fontWeight:500}}>{t.name}</div>
                <div style={{fontSize:12,fontFamily:fonts.sans,color:C.inkMuted}}>{t.role}</div>
              </div>
              <div style={{fontSize:14,fontFamily:fonts.sans,fontWeight:600,color:t.util>65?C.success:t.util>45?C.warning:C.danger}}>{t.util}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLeadGeneration = () => {
    const catCounts = {};
    VENUES.forEach(v => { catCounts[v.category] = (catCounts[v.category]||0)+1; });
    const hotCount = filteredVenues.filter(v=>v.score>=85).length;
    const warmCount = filteredVenues.filter(v=>v.score>=70&&v.score<85).length;
    const contactedCount = filteredVenues.filter(v=>v.status==="Contacted"||v.status==="Qualified").length;

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
          <div>
            <h1 style={sectionTitle}>Lead Generation</h1>
            <p style={sectionSub}>Automated B2B pipeline — {VENUES.length} venues within 100 miles of London</p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{padding:"8px 20px",borderRadius:6,border:`1px solid ${C.accent}`,background:C.accent,color:"#fff",fontSize:13,fontFamily:fonts.sans,fontWeight:500,cursor:"pointer"}}>+ Run Scraper</button>
            <button style={{padding:"8px 20px",borderRadius:6,border:`1px solid ${C.divider}`,background:"transparent",color:C.ink,fontSize:13,fontFamily:fonts.sans,fontWeight:500,cursor:"pointer"}}>Export CSV</button>
          </div>
        </div>

        {/* Campaign Cards */}
        <div style={{...card,marginBottom:24}}>
          <div style={{...label,marginBottom:16}}>Active Outreach Campaigns</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {campaigns.map((c,i)=>(
              <div key={i} style={{...cardSm,background:C.bgWarm}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:14,fontFamily:fonts.serif,color:C.ink}}>{c.name}</span>
                  <span style={statusBadge(c.status)}>{c.status}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:12,fontFamily:fonts.sans,color:C.inkSecondary}}>
                  <span>Sent: <b style={{color:C.ink}}>{c.sent}</b></span>
                  <span>Opened: <b style={{color:C.ink}}>{c.opened}</b></span>
                  <span>Replied: <b style={{color:C.accent}}>{c.replied}</b></span>
                  <span>Meetings: <b style={{color:C.accent}}>{c.meetings}</b></span>
                </div>
                <div style={{marginTop:8,fontSize:13,fontFamily:fonts.sans,color:C.accent,fontWeight:500}}>Pipeline: {c.pipeline}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16,marginBottom:24}}>
          <div style={card}><div style={label}>Total Venues</div><div style={bigNum}>{filteredVenues.length}</div></div>
          <div style={card}><div style={label}>Hot Leads</div><div style={{...bigNum,color:C.hot}}>{hotCount}</div></div>
          <div style={card}><div style={label}>Warm Leads</div><div style={{...bigNum,color:C.warm}}>{warmCount}</div></div>
          <div style={card}><div style={label}>Contacted</div><div style={{...bigNum,color:C.accent}}>{contactedCount}</div></div>
          <div style={card}><div style={label}>Pipeline Value</div><div style={{...bigNum,color:C.success}}>£250k</div></div>
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <select value={leadCategory} onChange={e=>setLeadCategory(e.target.value)} style={{padding:"8px 12px",borderRadius:6,border:`1px solid ${C.divider}`,fontSize:13,fontFamily:fonts.sans,background:C.card,color:C.ink,minWidth:200}}>
            {VENUE_CATEGORIES.map(c=><option key={c} value={c}>{c}{c!=="All"?` (${catCounts[c]||0})`:` (${VENUES.length})`}</option>)}
          </select>
          <select value={leadCounty} onChange={e=>setLeadCounty(e.target.value)} style={{padding:"8px 12px",borderRadius:6,border:`1px solid ${C.divider}`,fontSize:13,fontFamily:fonts.sans,background:C.card,color:C.ink,minWidth:160}}>
            {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <input value={leadSearch} onChange={e=>setLeadSearch(e.target.value)} placeholder="Search venues..." style={{padding:"8px 16px",borderRadius:6,border:`1px solid ${C.divider}`,fontSize:13,fontFamily:fonts.sans,flex:1,minWidth:200,background:C.card}}/>
        </div>

        {/* Venue Table */}
        <div style={card}>
          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:fonts.sans,fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`2px solid ${C.divider}`}}>
                {["Name","Location","County","Category","Capacity","Score","Status","Activity"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"10px 8px",fontSize:11,fontWeight:600,letterSpacing:"0.06em",color:C.inkMuted,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedVenues.map((v,i)=>(
                <tr key={v.id} style={{borderBottom:`1px solid ${C.dividerLight}`,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.bgWarm} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"12px 8px"}}>
                    <div style={{fontFamily:fonts.serif,fontSize:14,color:C.ink,fontWeight:500}}>{v.name}</div>
                    <div style={{fontSize:11,color:C.inkMuted,marginTop:2,maxWidth:220,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.note}</div>
                  </td>
                  <td style={{padding:"12px 8px",color:C.inkSecondary}}>{v.location}</td>
                  <td style={{padding:"12px 8px",color:C.inkSecondary}}>{v.county}</td>
                  <td style={{padding:"12px 8px"}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:C.accentSubtle,color:C.accent,fontWeight:500}}>{v.category}</span></td>
                  <td style={{padding:"12px 8px",color:C.inkSecondary,fontFamily:fonts.mono,fontSize:12}}>{v.capacity}</td>
                  <td style={{padding:"12px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:48,height:4,borderRadius:2,background:C.dividerLight,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:2,width:`${v.score}%`,background:v.score>=85?C.hot:v.score>=70?C.warm:v.score>=55?C.newLead:C.cold}}/>
                      </div>
                      <span style={{fontSize:12,fontFamily:fonts.mono,color:C.inkSecondary}}>{v.score}</span>
                    </div>
                  </td>
                  <td style={{padding:"12px 8px"}}><span style={statusBadge(v.status)}>{v.status}</span></td>
                  <td style={{padding:"12px 8px",fontSize:12,color:C.inkMuted}}>{v.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,paddingTop:16,borderTop:`1px solid ${C.dividerLight}`}}>
              <span style={{fontSize:13,fontFamily:fonts.sans,color:C.inkMuted}}>
                Showing {leadPage*LEADS_PER_PAGE+1}–{Math.min((leadPage+1)*LEADS_PER_PAGE, filteredVenues.length)} of {filteredVenues.length} venues
              </span>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>setLeadPage(p=>Math.max(0,p-1))} disabled={leadPage===0} style={{padding:"6px 14px",borderRadius:4,border:`1px solid ${C.divider}`,background:leadPage===0?C.bgWarm:C.card,color:leadPage===0?C.inkMuted:C.ink,fontSize:13,fontFamily:fonts.sans,cursor:leadPage===0?"default":"pointer"}}>← Prev</button>
                {Array.from({length:Math.min(totalPages,7)},(_,i)=>{
                  const pg = totalPages<=7?i:leadPage<3?i:leadPage>totalPages-4?totalPages-7+i:leadPage-3+i;
                  return <button key={pg} onClick={()=>setLeadPage(pg)} style={{padding:"6px 12px",borderRadius:4,border:`1px solid ${pg===leadPage?C.accent:C.divider}`,background:pg===leadPage?C.accentSubtle:C.card,color:pg===leadPage?C.accent:C.ink,fontSize:13,fontFamily:fonts.sans,fontWeight:pg===leadPage?600:400,cursor:"pointer"}}>{pg+1}</button>;
                })}
                <button onClick={()=>setLeadPage(p=>Math.min(totalPages-1,p+1))} disabled={leadPage>=totalPages-1} style={{padding:"6px 14px",borderRadius:4,border:`1px solid ${C.divider}`,background:leadPage>=totalPages-1?C.bgWarm:C.card,color:leadPage>=totalPages-1?C.inkMuted:C.ink,fontSize:13,fontFamily:fonts.sans,cursor:leadPage>=totalPages-1?"default":"pointer"}}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div style={{...card,marginTop:24}}>
          <div style={{...label,marginBottom:16}}>Venue Categories Breakdown</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>(
              <div key={cat} style={{padding:12,borderRadius:6,border:`1px solid ${C.dividerLight}`,cursor:"pointer",background:leadCategory===cat?C.accentSubtle:"transparent",transition:"all 0.15s"}} onClick={()=>setLeadCategory(leadCategory===cat?"All":cat)}>
                <div style={{fontSize:14,fontFamily:fonts.serif,color:C.ink}}>{cat}</div>
                <div style={{fontSize:20,fontFamily:fonts.serif,color:C.accent,marginTop:4}}>{count}</div>
                <div style={{fontSize:11,fontFamily:fonts.sans,color:C.inkMuted}}>venues</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEventPipeline = () => (
    <div>
      <h1 style={sectionTitle}>Event Pipeline</h1>
      <p style={sectionSub}>Active and upcoming events across all service lines</p>
      <div style={{marginTop:24}}>
        {["Confirmed","Proposal Sent","In Discussion","Lead"].map((stage,si)=>(
          <div key={stage} style={{marginBottom:24}}>
            <div style={{...label,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:[C.success,C.accent,C.warning,"#7A7A7A"][si]}}/>
              {stage}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {events.slice(si,si+2).map((e,i)=>(
                <div key={i} style={card}>
                  <div style={{fontSize:16,fontFamily:fonts.serif,color:C.ink,marginBottom:4}}>{e.client}</div>
                  <div style={{fontSize:13,fontFamily:fonts.sans,color:C.inkSecondary}}>{e.event}</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
                    <span style={{fontSize:12,fontFamily:fonts.sans,color:C.inkMuted}}>{e.date}</span>
                    <span style={{fontSize:14,fontFamily:fonts.serif,color:C.accent,fontWeight:500}}>{e.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeUtil = () => (
    <div>
      <h1 style={sectionTitle}>Time & Utilisation</h1>
      <p style={sectionSub}>Team capacity and project allocation</p>
      <div style={{marginTop:24,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {team.map((t,i)=>(
          <div key={i} style={card}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:C.accentSubtle,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontFamily:fonts.sans,fontWeight:600,color:C.accent}}>{t.initials}</div>
              <div>
                <div style={{fontSize:16,fontFamily:fonts.serif,color:C.ink}}>{t.name}</div>
                <div style={{fontSize:13,fontFamily:fonts.sans,color:C.inkMuted}}>{t.role}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1,height:6,borderRadius:3,background:C.dividerLight,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,width:`${t.util}%`,background:t.util>65?C.success:t.util>45?C.warning:C.danger,transition:"width 0.5s"}}/>
              </div>
              <span style={{fontSize:14,fontFamily:fonts.mono,fontWeight:600,color:t.util>65?C.success:t.util>45?C.warning:C.danger}}>{t.util}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinancialHub = () => (
    <div>
      <h1 style={sectionTitle}>Financial Hub</h1>
      <p style={sectionSub}>Revenue tracking, cost analysis, and financial projections</p>
      <div style={{marginTop:24}}>
        <div style={{...card,marginBottom:24}}>
          <div style={{...label,marginBottom:16}}>Monthly Revenue Trend</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.dividerLight} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:12,fontFamily:fonts.sans,fill:C.inkMuted}}/>
              <YAxis tick={{fontSize:12,fontFamily:fonts.sans,fill:C.inkMuted}} tickFormatter={v=>`£${v/1000}k`}/>
              <Tooltip contentStyle={{fontFamily:fonts.sans,fontSize:13,borderRadius:6,border:`1px solid ${C.divider}`}} formatter={v=>`£${(v/1000).toFixed(0)}k`}/>
              <Bar dataKey="revenue" fill={C.accent} radius={[4,4,0,0]}/>
              <Bar dataKey="costs" fill={C.divider} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[{l:"Revenue YTD",v:"£830k",c:"+8.2%"},{l:"Costs YTD",v:"£403k",c:"+4.1%"},{l:"Gross Margin",v:"51.4%",c:"+2.3%"}].map((m,i)=>(
            <div key={i} style={card}>
              <div style={label}>{m.l}</div>
              <div style={bigNum}>{m.v}</div>
              <div style={{fontSize:13,fontFamily:fonts.sans,color:C.success,marginTop:8}}>{m.c} vs last year</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIAssistant = () => (
    <div>
      <h1 style={sectionTitle}>AI Assistant</h1>
      <p style={sectionSub}>RAG-powered operational intelligence — ask questions about your business data</p>
      <div style={{...card,marginTop:24,minHeight:400,display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
          <div style={{textAlign:"center",maxWidth:400}}>
            <div style={{fontSize:48,marginBottom:16,opacity:0.2}}>✦</div>
            <div style={{fontSize:18,fontFamily:fonts.serif,color:C.ink,marginBottom:8}}>Ghost Operator AI</div>
            <div style={{fontSize:14,fontFamily:fonts.sans,color:C.inkSecondary,lineHeight:1.6}}>
              Connected to Scoro, StaffWise & Xero. Ask about revenue forecasts, team utilisation, upcoming events, or venue leads.
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,padding:"16px 0",borderTop:`1px solid ${C.dividerLight}`}}>
          <input placeholder="Ask about your operations..." style={{flex:1,padding:"12px 16px",borderRadius:6,border:`1px solid ${C.divider}`,fontSize:14,fontFamily:fonts.sans}}/>
          <button style={{padding:"12px 24px",borderRadius:6,background:C.accent,color:"#fff",border:"none",fontSize:14,fontFamily:fonts.sans,fontWeight:500,cursor:"pointer"}}>Send</button>
        </div>
      </div>
    </div>
  );

  const sections = {
    "Command Centre": renderCommandCentre,
    "Event Pipeline": renderEventPipeline,
    "Lead Generation": renderLeadGeneration,
    "Time & Utilisation": renderTimeUtil,
    "Financial Hub": renderFinancialHub,
    "AI Assistant": renderAIAssistant,
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:fonts.sans}}>
      {/* Sidebar */}
      <div style={{width:220,background:C.card,borderRight:`1px solid ${C.divider}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:10}}>
        <div style={{padding:"24px 20px",borderBottom:`1px solid ${C.divider}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <HHTLogo size={32}/>
            <div>
              <div style={{fontSize:14,fontFamily:fonts.serif,fontWeight:600,color:C.ink,lineHeight:1.2}}>Heads, Hearts</div>
              <div style={{fontSize:11,fontFamily:fonts.sans,fontWeight:600,letterSpacing:"0.1em",color:C.accent,textTransform:"uppercase"}}>& Tails</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 8px"}}>
          {navItems.map(item=>(
            <button key={item} onClick={()=>setActiveSection(item)} style={{
              display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",marginBottom:2,
              borderRadius:6,border:"none",cursor:"pointer",fontSize:13,fontFamily:fonts.sans,fontWeight:activeSection===item?600:400,
              background:activeSection===item?C.accentSubtle:"transparent",
              color:activeSection===item?C.accent:C.inkSecondary,
              transition:"all 0.15s",textAlign:"left",
            }}>
              <span style={{fontSize:14,opacity:0.6}}>
                {item==="Command Centre"?"◉":item==="Event Pipeline"?"◈":item==="Lead Generation"?"◎":item==="Time & Utilisation"?"◑":item==="Financial Hub"?"◆":"✦"}
              </span>
              {item}
              {item==="Lead Generation" && <span style={{marginLeft:"auto",fontSize:11,fontFamily:fonts.mono,color:C.accent,fontWeight:600}}>{VENUES.length}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"16px 20px",borderTop:`1px solid ${C.divider}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:C.accentSubtle,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontFamily:fonts.sans,fontWeight:600,color:C.accent}}>JS</div>
            <div>
              <div style={{fontSize:13,fontFamily:fonts.sans,fontWeight:500,color:C.ink}}>Joe Stokoe</div>
              <div style={{fontSize:11,fontFamily:fonts.sans,color:C.inkMuted}}>Director</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{marginLeft:220,flex:1,minHeight:"100vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 32px",borderBottom:`1px solid ${C.divider}`,background:C.card}}>
          <div style={{fontSize:13,fontFamily:fonts.sans,color:C.inkMuted}}>{dateStr}<span style={{margin:"0 12px",color:C.divider}}>|</span>{timeStr}</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontFamily:fonts.sans,color:C.success}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.success}}/>3 APIs Connected
            </div>
            <span style={{padding:"4px 12px",borderRadius:4,fontSize:11,fontFamily:fonts.sans,fontWeight:600,letterSpacing:"0.06em",border:`1px solid ${C.divider}`,color:C.inkSecondary}}>GHOST OPERATOR v2.0</span>
          </div>
        </div>
        <div style={{padding:32}}>
          {sections[activeSection]?.()}
        </div>
      </div>
    </div>
  );
}
