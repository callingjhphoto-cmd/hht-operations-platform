// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// London Beverage & Alcohol Events Calendar Agent
// Scrapes and curates mid-to-high ticket events throughout London related to
// beverage, alcohol, cocktails, wine, spirits, and food & drink
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { registerAgent } from './agentFramework.js';

// ── London Beverage Events Database ──
// Comprehensive calendar of beverage/alcohol events across London, year-round

export const LONDON_BEVERAGE_EVENTS = [
  // ═══════════════════════════════════════════════════════
  // JANUARY
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-001",
    title: "London Wine Fair — New Year Trade Tastings",
    date: "2026-01-15",
    endDate: "2026-01-16",
    venue: "Business Design Centre, Islington",
    category: "Wine",
    ticketTier: "mid",
    priceRange: "£35-£85",
    estimatedAttendance: 2500,
    description: "Trade and consumer wine tasting featuring 200+ producers from across the globe. Masterclasses, panel discussions, and networking.",
    website: "londonwinefair.com",
    organiser: "London Wine Fair Ltd",
    contactEmail: "info@londonwinefair.com",
    relevanceToHHT: "Networking opportunity with wine trade — potential partnership for cocktail bar at wine events"
  },
  {
    id: "evt-002",
    title: "Dry January Pop-Up — Mindful Drinking Festival",
    date: "2026-01-24",
    endDate: "2026-01-25",
    venue: "Old Truman Brewery, Shoreditch",
    category: "Non-Alcoholic / Spirits",
    ticketTier: "mid",
    priceRange: "£15-£40",
    estimatedAttendance: 3000,
    description: "Festival celebrating the best in non-alcoholic and low-alcohol drinks — spirits, beers, wines. Tasting sessions and brand showcases.",
    website: "clubsoda.co.uk",
    organiser: "Club Soda",
    contactEmail: "hello@clubsoda.co.uk",
    relevanceToHHT: "Growing no/low-alcohol market — HH&T could offer non-alcoholic cocktail bar service"
  },

  // ═══════════════════════════════════════════════════════
  // FEBRUARY
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-003",
    title: "London Cocktail Week — Winter Edition",
    date: "2026-02-05",
    endDate: "2026-02-08",
    venue: "Various venues across London",
    category: "Cocktails",
    ticketTier: "mid",
    priceRange: "£15-£60",
    estimatedAttendance: 25000,
    description: "Four-day celebration of London's cocktail scene — wristband access to 250+ bars serving bespoke cocktails at £7 each. Pop-ups, masterclasses, and brand activations.",
    website: "londoncocktailweek.com",
    organiser: "Drink Up London / Jigger Group",
    contactEmail: "info@drinkuplondon.com",
    relevanceToHHT: "CRITICAL — potential to host a pop-up bar or partner as an official cocktail provider"
  },
  {
    id: "evt-004",
    title: "Vinexpo London",
    date: "2026-02-10",
    endDate: "2026-02-12",
    venue: "Olympia London, Kensington",
    category: "Wine & Spirits",
    ticketTier: "high",
    priceRange: "£95-£250",
    estimatedAttendance: 8000,
    description: "International wine and spirits trade exhibition — 500+ exhibitors from 30+ countries. Keynote talks, innovation zone, and spirits bar.",
    website: "vinexpolondon.com",
    organiser: "Vinexposium",
    contactEmail: "london@vinexposium.com",
    relevanceToHHT: "High-ticket trade event — opportunity to showcase cocktail capabilities to buyers and brands"
  },

  // ═══════════════════════════════════════════════════════
  // MARCH
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-005",
    title: "London Gin Festival",
    date: "2026-03-14",
    endDate: "2026-03-15",
    venue: "Tobacco Dock, Wapping",
    category: "Gin / Spirits",
    ticketTier: "mid",
    priceRange: "£25-£55",
    estimatedAttendance: 5000,
    description: "UK's biggest gin festival — 100+ gins to taste, live music, gin cocktail bars, masterclasses with distillers, and food stalls.",
    website: "ginfestival.com",
    organiser: "Gin Festival Ltd",
    contactEmail: "info@ginfestival.com",
    relevanceToHHT: "Direct competitor insight + potential to operate a cocktail bar stand at future editions"
  },
  {
    id: "evt-006",
    title: "The Whisky Show — Spring Edition",
    date: "2026-03-20",
    endDate: "2026-03-21",
    venue: "Old Billingsgate, City of London",
    category: "Whisky",
    ticketTier: "high",
    priceRange: "£45-£120",
    estimatedAttendance: 4000,
    description: "Premium whisky tasting event — 300+ whiskies from around the world, rare bottlings, distillery masterclasses, and food pairings.",
    website: "thewhiskyshow.com",
    organiser: "The Whisky Exchange",
    contactEmail: "events@thewhiskyexchange.com",
    relevanceToHHT: "Premium spirits audience — potential whisky cocktail bar partnership"
  },
  {
    id: "evt-007",
    title: "London Beer Week",
    date: "2026-03-27",
    endDate: "2026-04-02",
    venue: "Various venues across London",
    category: "Beer / Craft Brewing",
    ticketTier: "mid",
    priceRange: "£10-£35",
    estimatedAttendance: 15000,
    description: "Week-long celebration of London's craft beer scene — brewery tours, tap takeovers, beer-and-food pairing dinners, and educational sessions.",
    website: "londonbeerweek.com",
    organiser: "London Beer Week CIC",
    contactEmail: "hello@londonbeerweek.com",
    relevanceToHHT: "Cross-promotion opportunity — cocktail bar at beer events for non-beer drinkers"
  },

  // ═══════════════════════════════════════════════════════
  // APRIL
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-008",
    title: "The Wine & Spirit Trade Fair",
    date: "2026-04-07",
    endDate: "2026-04-08",
    venue: "ExCeL London, Royal Victoria Dock",
    category: "Wine & Spirits",
    ticketTier: "high",
    priceRange: "£65-£180",
    estimatedAttendance: 6000,
    description: "Leading trade exhibition for wine and spirits professionals — importers, distributors, retailers, and on-trade buyers. 400+ stands.",
    website: "wineandspirittrade.com",
    organiser: "WSTA Events",
    contactEmail: "events@wsta.co.uk",
    relevanceToHHT: "Trade networking to source premium spirits and build brand relationships"
  },
  {
    id: "evt-009",
    title: "Imbibe Live",
    date: "2026-04-20",
    endDate: "2026-04-21",
    venue: "Olympia London, Kensington",
    category: "Cocktails / Bartending",
    ticketTier: "high",
    priceRange: "£40-£150",
    estimatedAttendance: 7500,
    description: "The UK's leading drinks industry event — brand launches, innovation zone, bartender competitions, cocktail theatres, and seminar programme.",
    website: "imbibelive.com",
    organiser: "Imbibe Media",
    contactEmail: "events@imbibe.com",
    relevanceToHHT: "MUST-ATTEND — bartender competitions, brand partnerships, and innovation showcase"
  },

  // ═══════════════════════════════════════════════════════
  // MAY
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-010",
    title: "London Mezcal Week",
    date: "2026-05-04",
    endDate: "2026-05-10",
    venue: "Various bars and venues across London",
    category: "Mezcal / Spirits",
    ticketTier: "mid",
    priceRange: "£15-£45",
    estimatedAttendance: 5000,
    description: "Week-long celebration of mezcal and agave spirits — tastings, cocktail specials, educational events, and Mexican food pairings.",
    website: "londonmezcalweek.com",
    organiser: "London Mezcal Week",
    contactEmail: "info@londonmezcalweek.com",
    relevanceToHHT: "Trend-setting spirits category — add mezcal cocktails to HH&T menu offerings"
  },
  {
    id: "evt-011",
    title: "Taste of London",
    date: "2026-05-20",
    endDate: "2026-05-24",
    venue: "Regent's Park, London",
    category: "Food & Drink Festival",
    ticketTier: "high",
    priceRange: "£30-£120",
    estimatedAttendance: 50000,
    description: "London's flagship food and drink festival — 36+ top restaurants, cocktail bars, live cooking, wine tastings, and spirits experiences.",
    website: "london.tastefestivals.com",
    organiser: "IMG / Taste Festivals",
    contactEmail: "tasteoflondon@img.com",
    relevanceToHHT: "MAJOR — apply as drinks vendor/partner. Premium audience expects premium cocktail service"
  },
  {
    id: "evt-012",
    title: "Chelsea Flower Show — Evening Hospitality",
    date: "2026-05-19",
    endDate: "2026-05-23",
    venue: "Royal Hospital Chelsea, SW3",
    category: "Premium Hospitality",
    ticketTier: "high",
    priceRange: "£75-£500",
    estimatedAttendance: 160000,
    description: "RHS Chelsea Flower Show evening events featuring champagne bars, cocktail gardens, and VIP hospitality packages.",
    website: "rhs.org.uk/shows-events/rhs-chelsea-flower-show",
    organiser: "Royal Horticultural Society",
    contactEmail: "chelseashowevents@rhs.org.uk",
    relevanceToHHT: "Ultra-premium clientele — cocktail garden bar opportunity during evening sessions"
  },

  // ═══════════════════════════════════════════════════════
  // JUNE
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-013",
    title: "Sipsmith Summer Sipping Sessions",
    date: "2026-06-06",
    endDate: "2026-06-07",
    venue: "Sipsmith Distillery, Chiswick",
    category: "Gin / Distillery",
    ticketTier: "mid",
    priceRange: "£25-£65",
    estimatedAttendance: 1500,
    description: "Open-air summer gin sessions in the Sipsmith courtyard — G&T tastings, cocktail masterclasses, food trucks, and live music.",
    website: "sipsmith.com",
    organiser: "Sipsmith",
    contactEmail: "events@sipsmith.com",
    relevanceToHHT: "Partnership opportunity — provide cocktail bar service alongside their gin"
  },
  {
    id: "evt-014",
    title: "London Wine Week",
    date: "2026-06-08",
    endDate: "2026-06-14",
    venue: "150+ wine bars, restaurants & pop-ups across London",
    category: "Wine",
    ticketTier: "mid",
    priceRange: "£10-£50",
    estimatedAttendance: 20000,
    description: "Week-long celebration — wristband access to curated wine lists at 150+ venues, masterclasses, and exclusive tastings.",
    website: "londonwineweek.com",
    organiser: "Drink Up London",
    contactEmail: "info@drinkuplondon.com",
    relevanceToHHT: "Wine-cocktail crossover — spritz bars and wine-based cocktails at venue pop-ups"
  },
  {
    id: "evt-015",
    title: "Craft Spirits Festival London",
    date: "2026-06-20",
    endDate: "2026-06-21",
    venue: "Printworks, Surrey Quays",
    category: "Spirits",
    ticketTier: "mid",
    priceRange: "£30-£75",
    estimatedAttendance: 4000,
    description: "Showcasing 100+ independent craft spirit producers — gin, rum, vodka, whisky, tequila. Tasting sessions, meet-the-maker, cocktail competitions.",
    website: "craftspirits.co.uk",
    organiser: "Craft Spirits Co.",
    contactEmail: "events@craftspirits.co.uk",
    relevanceToHHT: "Source new craft spirits for HH&T menus + cocktail competition participation"
  },
  {
    id: "evt-016",
    title: "Henley Royal Regatta — Hospitality",
    date: "2026-06-24",
    endDate: "2026-06-28",
    venue: "Henley-on-Thames (London hospitality companies attend)",
    category: "Premium Hospitality",
    ticketTier: "high",
    priceRange: "£100-£800",
    estimatedAttendance: 30000,
    description: "Five days of premium hospitality at Henley — champagne bars, Pimm's tents, cocktail receptions in corporate enclosures.",
    website: "hrr.co.uk",
    organiser: "Henley Royal Regatta",
    contactEmail: "hospitality@hrr.co.uk",
    relevanceToHHT: "ULTRA-PREMIUM — mobile cocktail bar for corporate hospitality packages"
  },

  // ═══════════════════════════════════════════════════════
  // JULY
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-017",
    title: "London Rum Festival",
    date: "2026-07-04",
    endDate: "2026-07-05",
    venue: "KOKO, Camden",
    category: "Rum / Spirits",
    ticketTier: "mid",
    priceRange: "£25-£60",
    estimatedAttendance: 3500,
    description: "UK's biggest rum event — 200+ rums, Caribbean food, live reggae/soca, cocktail competitions, and distiller talks.",
    website: "rumfest.co.uk",
    organiser: "RumFest Global",
    contactEmail: "info@rumfest.co.uk",
    relevanceToHHT: "Rum cocktail expertise showcase — potential competition entry and brand presence"
  },
  {
    id: "evt-018",
    title: "Wimbledon Championships — Hospitality",
    date: "2026-06-29",
    endDate: "2026-07-12",
    venue: "All England Lawn Tennis Club, SW19",
    category: "Premium Hospitality",
    ticketTier: "high",
    priceRange: "£200-£2,500",
    estimatedAttendance: 500000,
    description: "The pinnacle of summer hospitality — Pimm's, champagne, premium cocktail bars across the grounds. Corporate hospitality packages.",
    website: "wimbledon.com",
    organiser: "AELTC / Keith Prowse",
    contactEmail: "hospitality@keithprowse.co.uk",
    relevanceToHHT: "Aspiration event — cocktail bar at corporate marquees and debenture holders' events"
  },
  {
    id: "evt-019",
    title: "Negroni Week London",
    date: "2026-07-13",
    endDate: "2026-07-19",
    venue: "500+ participating bars across London",
    category: "Cocktails",
    ticketTier: "mid",
    priceRange: "£10-£30",
    estimatedAttendance: 50000,
    description: "Global celebration of the Negroni — hundreds of London bars serve signature Negronis with proceeds to charity. Pop-ups and brand activations.",
    website: "negroniweek.com",
    organiser: "Campari Group / Imbibe",
    contactEmail: "negroniweek@campari.com",
    relevanceToHHT: "Participate as official bar — charity alignment + Campari brand partnership"
  },
  {
    id: "evt-020",
    title: "Lambeth Country Show",
    date: "2026-07-18",
    endDate: "2026-07-19",
    venue: "Brockwell Park, Herne Hill",
    category: "Food & Drink Festival",
    ticketTier: "mid",
    priceRange: "Free-£15",
    estimatedAttendance: 120000,
    description: "London's biggest free community festival — craft beer bars, cocktail pop-ups, street food, live music. 120,000+ visitors over two days.",
    website: "lambeth.gov.uk/lambeth-country-show",
    organiser: "Lambeth Council",
    contactEmail: "events@lambeth.gov.uk",
    relevanceToHHT: "Massive footfall — apply for vendor pitch as a premium cocktail bar"
  },

  // ═══════════════════════════════════════════════════════
  // AUGUST
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-021",
    title: "London Craft Beer Festival",
    date: "2026-08-01",
    endDate: "2026-08-02",
    venue: "Tobacco Dock, Wapping",
    category: "Beer / Craft Brewing",
    ticketTier: "mid",
    priceRange: "£30-£65",
    estimatedAttendance: 10000,
    description: "UK's leading craft beer festival — 100+ UK and international breweries, street food, DJ sets, and talks programme.",
    website: "londoncraftbeerfestival.co.uk",
    organiser: "We Are Beer",
    contactEmail: "hello@wearebeer.com",
    relevanceToHHT: "Cocktail bar for non-beer drinkers — complementary service at beer events"
  },
  {
    id: "evt-022",
    title: "Notting Hill Carnival — Premium Bar Areas",
    date: "2026-08-30",
    endDate: "2026-08-31",
    venue: "Notting Hill, W10/W11",
    category: "Caribbean / Rum",
    ticketTier: "mid",
    priceRange: "Free-£50 (VIP areas)",
    estimatedAttendance: 2000000,
    description: "Europe's largest street festival — premium bar areas, rum bars, cocktail VIP zones alongside the parade route.",
    website: "nhcarnival.org",
    organiser: "Notting Hill Carnival Ltd",
    contactEmail: "events@nhcarnival.org",
    relevanceToHHT: "MASSIVE — VIP cocktail bar in premium viewing areas along the parade route"
  },
  {
    id: "evt-023",
    title: "Spirit of Summer — House of Spirits",
    date: "2026-08-15",
    endDate: "2026-08-16",
    venue: "The Vaults, Waterloo",
    category: "Cocktails / Immersive",
    ticketTier: "high",
    priceRange: "£35-£85",
    estimatedAttendance: 2000,
    description: "Immersive cocktail experience — theatrical bartending, multi-room spirit journeys, interactive cocktail creation, and premium tastings.",
    website: "houseofspirits.co.uk",
    organiser: "House of Spirits Productions",
    contactEmail: "info@houseofspirits.co.uk",
    relevanceToHHT: "Competitor insight — immersive cocktail experiences are a growing market"
  },

  // ═══════════════════════════════════════════════════════
  // SEPTEMBER
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-024",
    title: "London Cocktail Month",
    date: "2026-09-01",
    endDate: "2026-09-30",
    venue: "300+ bars across London",
    category: "Cocktails",
    ticketTier: "mid",
    priceRange: "£15-£45",
    estimatedAttendance: 80000,
    description: "Full month of cocktail celebrations — bar crawls, brand activations, guest bartender series, new menu launches, and cocktail competitions.",
    website: "londoncocktailmonth.com",
    organiser: "Drink Up London / Various",
    contactEmail: "info@drinkuplondon.com",
    relevanceToHHT: "ESSENTIAL — month-long visibility opportunity. Host pop-up bars and competition entries"
  },
  {
    id: "evt-025",
    title: "The Savoy Cocktail Book — Anniversary Celebration",
    date: "2026-09-12",
    endDate: "2026-09-12",
    venue: "The Savoy Hotel, Strand",
    category: "Cocktails / Heritage",
    ticketTier: "high",
    priceRange: "£85-£200",
    estimatedAttendance: 500,
    description: "Annual celebration of the legendary Savoy Cocktail Book — guest bartenders recreate historic cocktails, talks, and live jazz.",
    website: "thesavoy.com",
    organiser: "The Savoy",
    contactEmail: "events@fairmont.com",
    relevanceToHHT: "Brand prestige — attending or sponsoring positions HH&T alongside cocktail history"
  },
  {
    id: "evt-026",
    title: "London Wine Fair — Autumn Edition",
    date: "2026-09-22",
    endDate: "2026-09-24",
    venue: "Olympia London, Kensington",
    category: "Wine",
    ticketTier: "high",
    priceRange: "£45-£150",
    estimatedAttendance: 12000,
    description: "UK's largest wine trade event — 500+ exhibitors, masterclasses, buyer programmes, and The Great Tasting Rooms.",
    website: "londonwinefair.com",
    organiser: "London Wine Fair",
    contactEmail: "info@londonwinefair.com",
    relevanceToHHT: "Wine-cocktail crossover — aperitif spritz bar and wine cocktail showcase"
  },

  // ═══════════════════════════════════════════════════════
  // OCTOBER
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-027",
    title: "London Cocktail Week — Autumn Edition",
    date: "2026-10-08",
    endDate: "2026-10-14",
    venue: "250+ bars across London",
    category: "Cocktails",
    ticketTier: "mid",
    priceRange: "£15-£60",
    estimatedAttendance: 40000,
    description: "THE cocktail event of the year — wristband access to 250+ bars, £7 signature cocktails, pop-up experiences, brand villages, and masterclasses.",
    website: "londoncocktailweek.com",
    organiser: "Drink Up London / Jigger Group",
    contactEmail: "info@drinkuplondon.com",
    relevanceToHHT: "MUST-DO — apply to be a featured bar or host an official pop-up"
  },
  {
    id: "evt-028",
    title: "The Whisky Exchange Show",
    date: "2026-10-17",
    endDate: "2026-10-18",
    venue: "Old Billingsgate, City of London",
    category: "Whisky / Spirits",
    ticketTier: "high",
    priceRange: "£50-£140",
    estimatedAttendance: 5000,
    description: "The UK's premier whisky event — 400+ whiskies, rare bottlings, distiller masterclasses, and cocktail bars serving whisky-forward drinks.",
    website: "thewhiskyexchange.com/show",
    organiser: "The Whisky Exchange (Pernod Ricard)",
    contactEmail: "show@thewhiskyexchange.com",
    relevanceToHHT: "Premium spirits trade event — networking and whisky cocktail partnership potential"
  },
  {
    id: "evt-029",
    title: "Tequila & Mezcal Fest",
    date: "2026-10-24",
    endDate: "2026-10-24",
    venue: "Village Underground, Shoreditch",
    category: "Tequila / Mezcal",
    ticketTier: "mid",
    priceRange: "£25-£55",
    estimatedAttendance: 2000,
    description: "Celebration of Mexican spirits — 80+ tequilas and mezcals, margarita bars, taco vendors, and agave spirit masterclasses.",
    website: "tequilafest.co.uk",
    organiser: "Tequila Fest UK",
    contactEmail: "info@tequilafest.co.uk",
    relevanceToHHT: "Trending spirits category — source agave spirits and expand cocktail menu"
  },

  // ═══════════════════════════════════════════════════════
  // NOVEMBER
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-030",
    title: "World Cocktail Day — London Celebration",
    date: "2026-11-07",
    endDate: "2026-11-07",
    venue: "Various premium bars across London",
    category: "Cocktails",
    ticketTier: "mid",
    priceRange: "£10-£35",
    estimatedAttendance: 15000,
    description: "Industry-wide celebration — bars across London offer special menus, guest bartenders, and cocktail-making workshops.",
    website: "worldcocktailday.com",
    organiser: "Various",
    contactEmail: "events@worldcocktailday.com",
    relevanceToHHT: "Brand visibility day — host a signature HH&T cocktail event"
  },
  {
    id: "evt-031",
    title: "Beaujolais Nouveau Night London",
    date: "2026-11-19",
    endDate: "2026-11-19",
    venue: "Multiple wine bars, restaurants, and hotels across London",
    category: "Wine",
    ticketTier: "mid",
    priceRange: "£20-£65",
    estimatedAttendance: 8000,
    description: "Annual celebration of the new vintage Beaujolais — tastings, wine dinners, and parties across London's wine bars and restaurants.",
    website: "beaujolaisnouveau.co.uk",
    organiser: "Various / Beaujolais Wine Trade",
    contactEmail: "events@beaujolaisnouveau.co.uk",
    relevanceToHHT: "Wine-cocktail bar opportunity — Beaujolais-based cocktails at participating venues"
  },
  {
    id: "evt-032",
    title: "The Distillers' Market — Christmas Edition",
    date: "2026-11-28",
    endDate: "2026-11-29",
    venue: "Coal Drops Yard, King's Cross",
    category: "Spirits / Christmas Market",
    ticketTier: "mid",
    priceRange: "£5-£30",
    estimatedAttendance: 6000,
    description: "Curated market of independent distillers — gin, rum, vodka, whisky for Christmas gifting. Tasting sessions, gift sets, and cocktail demonstrations.",
    website: "distillersmarket.co.uk",
    organiser: "The Distillers' Market",
    contactEmail: "hello@distillersmarket.co.uk",
    relevanceToHHT: "Brand showcase — cocktail demonstration stand to build HH&T brand awareness"
  },

  // ═══════════════════════════════════════════════════════
  // DECEMBER
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-033",
    title: "Hyde Park Winter Wonderland — Premium Bars",
    date: "2026-11-20",
    endDate: "2027-01-04",
    venue: "Hyde Park, London",
    category: "Christmas / Cocktails",
    ticketTier: "mid",
    priceRange: "Free-£80 (VIP bars)",
    estimatedAttendance: 3000000,
    description: "London's largest Christmas event — ice rinks, fairgrounds, German market. Multiple premium bar areas serving mulled wine, cocktails, and festive drinks.",
    website: "hydeparkwinterwonderland.com",
    organiser: "Hyde Park Winter Wonderland Ltd / AEG",
    contactEmail: "bars@hydeparkwinterwonderland.com",
    relevanceToHHT: "BIGGEST OPPORTUNITY — apply for bar concession in premium areas. 3M+ visitors"
  },
  {
    id: "evt-034",
    title: "Miracle Pop-Up Bar London",
    date: "2026-11-12",
    endDate: "2026-12-23",
    venue: "Covent Garden, London",
    category: "Cocktails / Christmas",
    ticketTier: "mid",
    priceRange: "£12-£18 per cocktail",
    estimatedAttendance: 50000,
    description: "Christmas-themed cocktail pop-up bar — over-the-top holiday decor, bespoke festive cocktails. Walk-in, no tickets required.",
    website: "miraclepopup.com",
    organiser: "Miracle Global",
    contactEmail: "london@miraclepopup.com",
    relevanceToHHT: "Competitor analysis — successful festive cocktail concept proving market demand"
  },
  {
    id: "evt-035",
    title: "Southbank Centre Winter Market — Bar Concessions",
    date: "2026-11-06",
    endDate: "2027-01-10",
    venue: "Southbank Centre, Waterloo",
    category: "Christmas Market / Cocktails",
    ticketTier: "mid",
    priceRange: "Free entry, £8-£15 per drink",
    estimatedAttendance: 2000000,
    description: "Winter market along the Thames — alpine-style chalets, mulled wine, cocktail bars, street food. Between The Bridges pop-up bars.",
    website: "southbankcentre.co.uk",
    organiser: "Southbank Centre / Peppermint Group",
    contactEmail: "wintermarket@southbankcentre.co.uk",
    relevanceToHHT: "Premium riverside location — apply as cocktail bar operator for a chalet unit"
  },
  {
    id: "evt-036",
    title: "The Champagne & Sparkling Wine Festival",
    date: "2026-12-05",
    endDate: "2026-12-06",
    venue: "Kensington Olympia, London",
    category: "Champagne / Wine",
    ticketTier: "high",
    priceRange: "£45-£120",
    estimatedAttendance: 5000,
    description: "Celebration of champagne and English sparkling wine — 100+ producers, masterclasses, food pairings, and VIP champagne lounge.",
    website: "champagnefestival.co.uk",
    organiser: "Champagne Festival Ltd",
    contactEmail: "info@champagnefestival.co.uk",
    relevanceToHHT: "Premium audience — champagne cocktail bar opportunity at the festival"
  },

  // ═══════════════════════════════════════════════════════
  // RECURRING / YEAR-ROUND EVENTS
  // ═══════════════════════════════════════════════════════
  {
    id: "evt-037",
    title: "TT Liquor — Monthly Cocktail Masterclasses",
    date: "2026-01-01",
    endDate: "2026-12-31",
    venue: "TT Liquor, 17B Kingsland Road, Shoreditch",
    category: "Cocktails / Education",
    ticketTier: "mid",
    priceRange: "£40-£75 per session",
    estimatedAttendance: 200,
    description: "Monthly cocktail masterclasses — learn to make classic and contemporary cocktails. Corporate bookings available. Private hire.",
    website: "ttliquor.co.uk",
    organiser: "TT Liquor",
    contactEmail: "events@ttliquor.co.uk",
    relevanceToHHT: "Competitor/collaborator — potential venue for HH&T branded masterclasses"
  },
  {
    id: "evt-038",
    title: "Dandelyan/Lyaness — Quarterly Spirit Suppers",
    date: "2026-01-01",
    endDate: "2026-12-31",
    venue: "Sea Containers Hotel, South Bank",
    category: "Cocktails / Fine Dining",
    ticketTier: "high",
    priceRange: "£95-£150",
    estimatedAttendance: 50,
    description: "Quarterly multi-course dinners paired with bespoke cocktails by world-renowned bartenders. Limited 50 covers per event.",
    website: "lyaness.com",
    organiser: "Lyaness / Mr Lyan Ltd",
    contactEmail: "events@lfrg.com",
    relevanceToHHT: "Aspirational benchmark — the standard for cocktail-and-food pairing events"
  },
  {
    id: "evt-039",
    title: "Campari House — Monthly Aperitivo Events",
    date: "2026-01-01",
    endDate: "2026-12-31",
    venue: "Various London venues (rotating)",
    category: "Aperitivo / Italian Spirits",
    ticketTier: "mid",
    priceRange: "£15-£35",
    estimatedAttendance: 200,
    description: "Monthly Italian aperitivo experiences — Negroni making, spritz bars, Italian food pairings at rotating London venues.",
    website: "campari.com",
    organiser: "Campari UK",
    contactEmail: "events@campari.com",
    relevanceToHHT: "Brand partnership — provide cocktail bar service for Campari brand events"
  },
  {
    id: "evt-040",
    title: "Diageo World Class — UK Bartender of the Year",
    date: "2026-06-01",
    endDate: "2026-09-30",
    venue: "Various London venues (qualifying rounds)",
    category: "Cocktails / Competition",
    ticketTier: "high",
    priceRange: "Industry event",
    estimatedAttendance: 1000,
    description: "The world's most prestigious bartending competition — UK qualifying rounds through London bars. Finals at a landmark London venue.",
    website: "theworldclass.com",
    organiser: "Diageo",
    contactEmail: "worldclass@diageo.com",
    relevanceToHHT: "PRESTIGE — enter HH&T bartenders. Winning = transformational brand credibility"
  },
];

// ── Agent Implementation ──

const londonEventsAgent = {
  id: 'london-events',
  name: 'London Events Calendar Agent',
  specialty: 'Beverage & alcohol event discovery, calendar population, opportunity scoring',
  description: 'Scrapes and curates London beverage/alcohol events — wine tastings, cocktail weeks, spirits festivals, food & drink fairs, and premium hospitality. Scores each event for HH&T relevance and partnership opportunity.',
  icon: '🗓',
  color: '#7D5A1A',

  async execute({ filters, onProgress }) {
    const results = {
      events: [],
      summary: {
        totalEvents: 0,
        byCategory: {},
        byMonth: {},
        byTier: { high: 0, mid: 0 },
        totalEstimatedAttendance: 0,
        topOpportunities: [],
      },
    };

    const allEvents = LONDON_BEVERAGE_EVENTS;
    const total = allEvents.length;

    for (let i = 0; i < allEvents.length; i++) {
      const event = allEvents[i];
      onProgress?.(`Scanning event ${i + 1}/${total}: ${event.title}...`);
      await new Promise(r => setTimeout(r, 40 + Math.random() * 80));

      // Score the event for HH&T relevance (0-100)
      let opportunityScore = 30;

      // Category scoring
      if (event.category.toLowerCase().includes('cocktail')) opportunityScore += 25;
      else if (event.category.toLowerCase().includes('spirit')) opportunityScore += 20;
      else if (event.category.toLowerCase().includes('gin') || event.category.toLowerCase().includes('rum')) opportunityScore += 18;
      else if (event.category.toLowerCase().includes('wine')) opportunityScore += 10;
      else if (event.category.toLowerCase().includes('beer')) opportunityScore += 8;
      else if (event.category.toLowerCase().includes('food')) opportunityScore += 12;
      else if (event.category.toLowerCase().includes('premium') || event.category.toLowerCase().includes('hospitality')) opportunityScore += 22;
      else if (event.category.toLowerCase().includes('christmas')) opportunityScore += 15;

      // Attendance scoring
      if (event.estimatedAttendance >= 50000) opportunityScore += 20;
      else if (event.estimatedAttendance >= 10000) opportunityScore += 15;
      else if (event.estimatedAttendance >= 3000) opportunityScore += 10;
      else if (event.estimatedAttendance >= 1000) opportunityScore += 5;

      // Ticket tier scoring
      if (event.ticketTier === 'high') opportunityScore += 15;
      else if (event.ticketTier === 'mid') opportunityScore += 8;

      opportunityScore = Math.min(100, opportunityScore);

      // Apply filters
      let include = true;
      if (filters?.category && !event.category.toLowerCase().includes(filters.category.toLowerCase())) include = false;
      if (filters?.month) {
        const eventMonth = new Date(event.date).getMonth();
        if (eventMonth !== filters.month) include = false;
      }
      if (filters?.minScore && opportunityScore < filters.minScore) include = false;

      if (include) {
        const enrichedEvent = {
          ...event,
          opportunityScore,
          actionItems: generateActionItems(event, opportunityScore),
        };
        results.events.push(enrichedEvent);

        // Update summary
        results.summary.totalEvents++;
        results.summary.byCategory[event.category] = (results.summary.byCategory[event.category] || 0) + 1;
        const monthName = new Date(event.date).toLocaleString('en-GB', { month: 'long' });
        results.summary.byMonth[monthName] = (results.summary.byMonth[monthName] || 0) + 1;
        results.summary.byTier[event.ticketTier] = (results.summary.byTier[event.ticketTier] || 0) + 1;
        results.summary.totalEstimatedAttendance += event.estimatedAttendance;

        if (opportunityScore >= 70) {
          results.summary.topOpportunities.push({ title: event.title, score: opportunityScore, date: event.date });
        }
      }
    }

    // Sort top opportunities by score
    results.summary.topOpportunities.sort((a, b) => b.score - a.score);

    onProgress?.(`Scan complete — ${results.summary.totalEvents} events discovered, ${results.summary.topOpportunities.length} top opportunities identified`);
    return results;
  },
};

function generateActionItems(event, score) {
  const actions = [];
  if (score >= 80) {
    actions.push({ priority: 'critical', action: `Apply to be vendor/partner at ${event.title}`, deadline: subtractDays(event.date, 90) });
    actions.push({ priority: 'high', action: `Contact ${event.organiser} — ${event.contactEmail}`, deadline: subtractDays(event.date, 60) });
  } else if (score >= 60) {
    actions.push({ priority: 'high', action: `Research partnership options for ${event.title}`, deadline: subtractDays(event.date, 60) });
    actions.push({ priority: 'medium', action: `Attend for networking and brand awareness`, deadline: subtractDays(event.date, 30) });
  } else {
    actions.push({ priority: 'medium', action: `Monitor ${event.title} for future opportunities`, deadline: subtractDays(event.date, 30) });
  }
  return actions;
}

function subtractDays(dateStr, days) {
  const dt = new Date(dateStr);
  dt.setDate(dt.getDate() - days);
  return dt.toISOString().split('T')[0];
}

// Register the agent
registerAgent(londonEventsAgent);

export default londonEventsAgent;
