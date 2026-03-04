// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lead Scraper Agent — Automated lead discovery from multiple data sources
// Finds potential HHT clients: venues, planners, caterers, agencies, etc.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { registerAgent } from './agentFramework.js';

// ── Data Source Definitions ──
// Each source represents a category of leads and known directories/platforms
const DATA_SOURCES = [
  {
    id: 'wedding-directories',
    name: 'Wedding Directories',
    description: 'Hitched, Bridebook, Rock My Wedding, Love My Dress, Wedding Wire UK',
    searchTemplates: [
      'site:hitched.co.uk wedding planner {county}',
      'site:bridebook.com wedding planner {county}',
      'site:rockmywedding.co.uk directory {county}',
      '"wedding planner" "{county}" recommended supplier list',
    ],
    category: 'Wedding Planner',
  },
  {
    id: 'venue-directories',
    name: 'Venue Directories',
    description: 'Hire Space, Venue Scanner, Tagvenue, Square Meal Venues',
    searchTemplates: [
      'site:hirespace.com venue {county}',
      'site:venuescanner.com {county} event venue',
      'site:squaremealvenues.co.uk {county}',
      '"preferred supplier" "cocktail" site:{domain}',
    ],
    category: 'Event Venue',
  },
  {
    id: 'corporate-directories',
    name: 'Corporate Event Directories',
    description: 'Eventbrite organisers, Conference News, C&IT Magazine',
    searchTemplates: [
      '"corporate event planner" "{county}" -london',
      '"event management company" "{county}" site:linkedin.com',
      'site:conferenceandmeetings.co.uk {county}',
    ],
    category: 'Corporate Event Planner',
  },
  {
    id: 'catering-directories',
    name: 'Catering Companies',
    description: 'Cater, Eden Caterers, outside catering companies',
    searchTemplates: [
      '"outside catering" "{county}" wedding corporate events',
      '"event caterer" "{county}" preferred suppliers',
      'site:caterersearch.com {county}',
    ],
    category: 'Caterer',
  },
  {
    id: 'google-maps',
    name: 'Google Maps / Places',
    description: 'Local business search via Google Maps',
    searchTemplates: [
      '{category} near {city} {county}',
      'event venue {city} {county} google maps',
    ],
    category: 'Mixed',
  },
  {
    id: 'instagram-discovery',
    name: 'Instagram Discovery',
    description: 'Find leads via hashtag and account analysis',
    searchTemplates: [
      'site:instagram.com "{county} wedding planner"',
      'site:instagram.com "{county} event styling"',
      '#weddingplanner{county} site:instagram.com',
    ],
    category: 'Mixed',
  },
  {
    id: 'preferred-vendor-lists',
    name: 'Preferred Vendor Lists',
    description: 'Venues that publish their recommended supplier lists',
    searchTemplates: [
      '"preferred suppliers" OR "recommended suppliers" cocktail bar {county}',
      '"supplier list" venue {county} cocktail',
      '"approved suppliers" event venue {county}',
    ],
    category: 'Venue (Vendor List)',
  },
  {
    id: 'charity-gala',
    name: 'Charity & Gala Organisers',
    description: 'Charities and companies running fundraising events',
    searchTemplates: [
      '"charity gala" "{county}" 2025 OR 2026',
      '"fundraising dinner" "{county}" organiser',
      '"charity ball" "{county}" event management',
    ],
    category: 'Charity Events',
  },
  {
    id: 'festival-organisers',
    name: 'Festival & Show Organisers',
    description: 'Food festivals, county shows, outdoor events',
    searchTemplates: [
      'food festival {county} 2025 OR 2026 organiser',
      'county show {county} trade stand cocktail',
      '"summer party" OR "outdoor event" {county} organiser',
    ],
    category: 'Festival Organiser',
  },
  {
    id: 'racecourse-sports',
    name: 'Racecourses & Sports Hospitality',
    description: 'Racecourses, polo clubs, cricket grounds with hospitality',
    searchTemplates: [
      'racecourse {county} corporate hospitality events',
      'polo club {county} events hospitality',
      'cricket ground {county} event hire corporate',
    ],
    category: 'Sports Venue',
  },
];

// ── Counties within 150 miles of London ──
const TARGET_COUNTIES = [
  'Surrey', 'Kent', 'East Sussex', 'West Sussex', 'Hampshire', 'Berkshire',
  'Oxfordshire', 'Buckinghamshire', 'Hertfordshire', 'Essex', 'Suffolk',
  'Norfolk', 'Cambridgeshire', 'Dorset', 'Wiltshire', 'Somerset', 'Devon',
  'Cornwall', 'Gloucestershire', 'Warwickshire', 'Northamptonshire',
  'Bedfordshire', 'Leicestershire', 'Worcestershire', 'Nottinghamshire',
  'Lincolnshire', 'Staffordshire', 'Shropshire',
];

// Cities for targeted searches
const TARGET_CITIES = {
  'Surrey': ['Guildford', 'Epsom', 'Woking', 'Reigate'],
  'Kent': ['Canterbury', 'Maidstone', 'Tunbridge Wells', 'Sevenoaks'],
  'East Sussex': ['Brighton', 'Eastbourne', 'Lewes'],
  'West Sussex': ['Chichester', 'Horsham', 'Worthing'],
  'Hampshire': ['Winchester', 'Southampton', 'Portsmouth', 'Basingstoke'],
  'Berkshire': ['Reading', 'Newbury', 'Windsor', 'Ascot'],
  'Oxfordshire': ['Oxford', 'Henley-on-Thames', 'Banbury', 'Witney'],
  'Buckinghamshire': ['Aylesbury', 'High Wycombe', 'Milton Keynes'],
  'Hertfordshire': ['St Albans', 'Watford', 'Hertford'],
  'Essex': ['Chelmsford', 'Colchester', 'Brentwood', 'Southend'],
  'Suffolk': ['Bury St Edmunds', 'Ipswich', 'Aldeburgh'],
  'Norfolk': ['Norwich', 'Kings Lynn'],
  'Cambridgeshire': ['Cambridge', 'Peterborough', 'Ely'],
  'Dorset': ['Bournemouth', 'Poole', 'Dorchester', 'Sherborne'],
  'Wiltshire': ['Salisbury', 'Swindon', 'Marlborough', 'Bath'],
  'Somerset': ['Taunton', 'Glastonbury', 'Frome', 'Wells'],
  'Devon': ['Exeter', 'Plymouth', 'Torquay', 'Totnes'],
  'Cornwall': ['Truro', 'Falmouth', 'Newquay', 'St Ives'],
  'Gloucestershire': ['Cheltenham', 'Cirencester', 'Stow-on-the-Wold'],
  'Warwickshire': ['Warwick', 'Stratford-upon-Avon', 'Leamington Spa'],
  'Northamptonshire': ['Northampton', 'Towcester'],
  'Bedfordshire': ['Bedford', 'Luton'],
  'Leicestershire': ['Leicester', 'Market Harborough'],
  'Worcestershire': ['Worcester', 'Malvern'],
  'Nottinghamshire': ['Nottingham'],
  'Lincolnshire': ['Lincoln', 'Stamford'],
  'Staffordshire': ['Lichfield', 'Stafford'],
  'Shropshire': ['Shrewsbury', 'Ludlow'],
};

// ── Lead Deduplication ──
function isDuplicate(newLead, existingLeads) {
  const newName = (newLead.venue_name || '').toLowerCase().trim();
  const newWebsite = (newLead.website || '').toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

  return existingLeads.some(existing => {
    const existName = (existing.venue_name || existing.name || '').toLowerCase().trim();
    const existWebsite = (existing.website || '').toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

    // Exact name match
    if (newName && existName && newName === existName) return true;

    // Website match
    if (newWebsite && existWebsite && newWebsite === existWebsite) return true;

    // Fuzzy name match (one contains the other)
    if (newName.length > 5 && existName.length > 5) {
      if (newName.includes(existName) || existName.includes(newName)) return true;
    }

    return false;
  });
}

// ── Search Query Generator ──
function generateSearchQueries(source, county, city) {
  return source.searchTemplates.map(template =>
    template
      .replace(/\{county\}/g, county)
      .replace(/\{city\}/g, city || county)
      .replace(/\{category\}/g, source.name)
      .replace(/\{domain\}/g, '')
  );
}

// ── Score a scraped lead for HHT fit ──
function scoreLeadForHHT(lead) {
  let score = 30;

  const cat = (lead.category || '').toLowerCase();
  const notes = (lead.trigger_event || lead.notes || '').toLowerCase();
  const name = (lead.venue_name || '').toLowerCase();

  // Category fit
  if (cat.includes('wedding planner')) score += 20;
  else if (cat.includes('corporate event')) score += 18;
  else if (cat.includes('experiential') || cat.includes('brand activation')) score += 15;
  else if (cat.includes('caterer')) score += 12;
  else if (cat.includes('marquee')) score += 14;
  else if (cat.includes('festival')) score += 10;
  else if (cat.includes('racecourse') || cat.includes('sports')) score += 12;
  else if (cat.includes('charity')) score += 10;
  else if (cat.includes('venue')) score += 15;
  else if (cat.includes('hotel')) score += 12;
  else if (cat.includes('university')) score += 10;
  else if (cat.includes('pr agency')) score += 12;
  else score += 5;

  // Keyword signals in notes
  if (notes.includes('cocktail') || notes.includes('bar')) score += 15;
  if (notes.includes('preferred supplier') || notes.includes('vendor list')) score += 10;
  if (notes.includes('luxury') || notes.includes('premium') || notes.includes('bespoke')) score += 8;
  if (notes.includes('corporate') && notes.includes('wedding')) score += 5;
  if (notes.includes('award')) score += 5;
  if (notes.includes('exclusive')) score += 5;

  // Distance scoring
  const dist = lead.distance_from_london_miles || 999;
  if (dist <= 30) score += 10;
  else if (dist <= 60) score += 7;
  else if (dist <= 100) score += 4;
  else if (dist <= 150) score += 2;

  return Math.min(100, Math.max(0, score));
}

// ── Main Agent ──
const leadScraperAgent = {
  id: 'lead-scraper',
  name: 'Lead Discovery Agent',
  specialty: 'Automated lead discovery across directories, social media, and web sources',
  description: 'Searches multiple data sources to find new potential clients for HHT. Discovers venues, planners, caterers, agencies, and event organisers across Southern England. Generates research queries and scores leads for partnership fit.',
  icon: '🌐',
  color: '#5B6AAF',
  expectedSteps: 10,

  async execute({ leads, allLeads, onProgress }) {
    const results = {
      newLeads: [],
      searchQueries: [],
      sourcesScanned: 0,
      duplicatesSkipped: 0,
      summary: { totalFound: 0, byCategory: {}, byCounty: {}, topSources: [] },
    };

    const totalSources = DATA_SOURCES.length;

    for (let si = 0; si < DATA_SOURCES.length; si++) {
      const source = DATA_SOURCES[si];
      onProgress?.(`Scanning ${source.name} (${si + 1}/${totalSources})...`);

      // Generate queries for each county
      const queries = [];
      for (const county of TARGET_COUNTIES) {
        const cities = TARGET_CITIES[county] || [county];
        const mainCity = cities[0];
        const sourceQueries = generateSearchQueries(source, county, mainCity);
        queries.push(...sourceQueries.map(q => ({ query: q, county, city: mainCity, source: source.id, category: source.category })));
      }

      // Store generated queries for the user to execute manually or via future automation
      results.searchQueries.push({
        source: source.name,
        category: source.category,
        queryCount: queries.length,
        sampleQueries: queries.slice(0, 6).map(q => q.query),
      });

      results.sourcesScanned++;
      await new Promise(r => setTimeout(r, 50));
    }

    // Generate a research report for each county
    onProgress?.('Generating county-by-county research plan...');

    for (const county of TARGET_COUNTIES) {
      const cities = TARGET_CITIES[county] || [county];
      results.summary.byCounty[county] = {
        cities,
        queriesGenerated: DATA_SOURCES.length * cities.length,
        categories: DATA_SOURCES.map(s => s.category),
      };
    }

    // Compile category summary
    DATA_SOURCES.forEach(source => {
      results.summary.byCategory[source.category] = (results.summary.byCategory[source.category] || 0) + TARGET_COUNTIES.length;
    });

    results.summary.totalQueries = Object.values(results.summary.byCounty).reduce((sum, c) => sum + c.queriesGenerated, 0);
    results.summary.totalSources = DATA_SOURCES.length;
    results.summary.totalCounties = TARGET_COUNTIES.length;

    onProgress?.(`Discovery plan complete — ${results.summary.totalQueries} search queries across ${TARGET_COUNTIES.length} counties`);
    return results;
  },
};

// Export utilities for external use
export { DATA_SOURCES, TARGET_COUNTIES, TARGET_CITIES, isDuplicate, scoreLeadForHHT, generateSearchQueries };

registerAgent(leadScraperAgent);
export default leadScraperAgent;
