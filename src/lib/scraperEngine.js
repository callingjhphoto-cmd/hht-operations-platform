// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scraper Engine — Multi-source lead discovery using real APIs & techniques
// Adapts patterns from Crawlee, Firecrawl, ScrapeGraphAI, Jina AI Reader
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Rate Limiter ──
// Pattern from Crawlee: token bucket with configurable rate
class RateLimiter {
  constructor(requestsPerMinute = 20) {
    this.interval = (60 * 1000) / requestsPerMinute;
    this.lastRequest = 0;
    this.queue = [];
    this.processing = false;
  }

  async throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.interval) {
      await new Promise(r => setTimeout(r, this.interval - elapsed));
    }
    this.lastRequest = Date.now();
  }
}

// ── Retry with exponential backoff ──
// Pattern from Crawlee/Firecrawl: retry failed requests with backoff
async function retryFetch(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok && response.status >= 500 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
}

// ── Result normalizer ──
// Pattern from ScrapeGraphAI: normalize all sources to a common schema
function normalizeToLead(raw, source) {
  return {
    venue_name: raw.name || raw.title || raw.displayName?.text || '',
    location: raw.address || raw.formattedAddress || raw.location || '',
    city: raw.city || extractCity(raw.address || raw.formattedAddress || '') || '',
    county: raw.county || '',
    category: raw.category || raw.type || source.defaultCategory || 'Unknown',
    capacity: raw.capacity || 0,
    distance_from_london_miles: raw.distance || 0,
    website: cleanUrl(raw.website || raw.websiteUri || raw.url || raw.link || ''),
    trigger_event: raw.description || raw.snippet || raw.notes || '',
    contact_email: raw.email || '',
    phone: raw.phone || raw.nationalPhoneNumber || '',
    rating: raw.rating || null,
    reviewCount: raw.userRatingCount || raw.reviews || 0,
    source: source.id,
    scraped_at: new Date().toISOString(),
  };
}

function cleanUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function extractCity(address) {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
}

// ══════════════════════════════════════════════════════════════════════════════
// SOURCE ADAPTERS — Each adapter knows how to query one data source
// Pattern from Crawlee: pluggable request handlers per source type
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Jina AI Reader (FREE, no API key needed) ──
// Technique: Converts any URL to clean markdown via headless browser rendering
// Used by: ScrapeGraphAI, LangChain, many AI agent frameworks
// How it works: Jina runs a headless browser, renders the page, strips nav/ads,
// returns clean markdown. AI can then extract structured data from the markdown.
const jinaAdapter = {
  id: 'jina-reader',
  name: 'Jina AI Reader',
  description: 'Converts any URL to clean markdown. Free at 20 req/min. Uses headless browser rendering like Firecrawl.',
  freeLimit: '20 requests/minute (no API key), 200/min with free key',
  technique: 'Headless browser → HTML → Readability algorithm → Markdown',
  rateLimit: new RateLimiter(18),

  // Scrape a single URL and extract business info
  async scrapeUrl(url) {
    await this.rateLimit.throttle();
    const response = await retryFetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'application/json' },
    });
    return await response.json();
  },

  // Search the web (Jina's search endpoint)
  async search(query) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://s.jina.ai/${encodeURIComponent(query)}`,
      { headers: { 'Accept': 'application/json' } },
    );
    return await response.json();
  },

  // Extract contact details from markdown content using regex patterns
  extractContacts(markdown) {
    const emails = [...new Set((markdown.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [])
      .filter(e => !e.includes('example.') && !e.includes('sentry.')))];
    const phones = [...new Set((markdown.match(/(?:0\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}|(?:\+44|0044)[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4})/g) || []))];
    const websites = [...new Set((markdown.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:co\.uk|com|org\.uk|org|uk|net)/g) || []))];
    return { emails, phones, websites };
  },
};

// ── 2. Companies House API (FREE, unlimited, UK government) ──
// Technique: Official REST API querying the UK company register
// How it works: Search by SIC code + location to find all registered event companies
const companiesHouseAdapter = {
  id: 'companies-house',
  name: 'Companies House',
  description: 'Free UK government API. Search event companies by SIC code & location. 600 req/5min.',
  freeLimit: '600 requests per 5 minutes (completely free)',
  technique: 'REST API → UK company register → SIC code filtering',
  rateLimit: new RateLimiter(100),

  // SIC codes for the events industry
  sicCodes: {
    '82301': 'Exhibition organisers',
    '82302': 'Conference organisers',
    '56210': 'Event catering',
    '96090': 'Wedding planners / event managers (catch-all)',
    '70229': 'Event management consultancy',
    '55100': 'Hotels (venue businesses)',
    '82990': 'Event support services',
  },

  async search(sicCode, location, apiKey) {
    if (!apiKey) return [];
    await this.rateLimit.throttle();

    const params = new URLSearchParams({
      sic_codes: sicCode,
      location,
      company_status: 'active',
      size: '100',
      start_index: '0',
    });

    const response = await retryFetch(
      `https://api.company-information.service.gov.uk/advanced-search/companies?${params}`,
      { headers: { 'Authorization': `Basic ${btoa(apiKey + ':')}` } },
    );
    const data = await response.json();

    return (data.items || []).map(company => ({
      name: company.company_name,
      number: company.company_number,
      address: [
        company.registered_office_address?.address_line_1,
        company.registered_office_address?.locality,
        company.registered_office_address?.region,
        company.registered_office_address?.postal_code,
      ].filter(Boolean).join(', '),
      city: company.registered_office_address?.locality || '',
      county: company.registered_office_address?.region || location,
      category: this.sicCodes[sicCode] || 'Event Company',
      type: company.company_type,
      dateCreated: company.date_of_creation,
    }));
  },

  async getCompanyDetails(companyNumber, apiKey) {
    if (!apiKey) return null;
    await this.rateLimit.throttle();

    const response = await retryFetch(
      `https://api.company-information.service.gov.uk/company/${companyNumber}`,
      { headers: { 'Authorization': `Basic ${btoa(apiKey + ':')}` } },
    );
    return await response.json();
  },
};

// ── 3. Google Places API (10,000 free/month) ──
// Technique: Text Search or Nearby Search using Google's Places database
// How it works: Send a text query + location bias, get back business listings
// with name, address, phone, website, rating
const googlePlacesAdapter = {
  id: 'google-places',
  name: 'Google Places',
  description: 'Search for businesses by type + location. 10,000 free calls/month.',
  freeLimit: '10,000 API calls/month (Essentials tier)',
  technique: 'REST API → Google Maps database → Text Search / Nearby Search',
  rateLimit: new RateLimiter(50),

  // County center coordinates for 150mi radius searches
  countyCoords: {
    'Surrey': { lat: 51.2488, lng: -0.4072 },
    'Kent': { lat: 51.2787, lng: 0.7757 },
    'East Sussex': { lat: 50.9522, lng: 0.2623 },
    'West Sussex': { lat: 50.9361, lng: -0.4614 },
    'Hampshire': { lat: 51.0617, lng: -1.3091 },
    'Berkshire': { lat: 51.4540, lng: -1.0782 },
    'Oxfordshire': { lat: 51.7520, lng: -1.2577 },
    'Buckinghamshire': { lat: 51.7762, lng: -0.8087 },
    'Hertfordshire': { lat: 51.8099, lng: -0.2378 },
    'Essex': { lat: 51.7343, lng: 0.4691 },
    'Suffolk': { lat: 52.1872, lng: 1.0052 },
    'Norfolk': { lat: 52.6140, lng: 1.0270 },
    'Cambridgeshire': { lat: 52.2053, lng: 0.1218 },
    'Dorset': { lat: 50.7488, lng: -2.3445 },
    'Wiltshire': { lat: 51.3492, lng: -1.9927 },
    'Somerset': { lat: 51.1051, lng: -2.9262 },
    'Devon': { lat: 50.7156, lng: -3.5309 },
    'Cornwall': { lat: 50.2660, lng: -5.0527 },
    'Gloucestershire': { lat: 51.8642, lng: -2.2382 },
    'Warwickshire': { lat: 52.2819, lng: -1.5849 },
    'Northamptonshire': { lat: 52.2340, lng: -0.8975 },
    'Bedfordshire': { lat: 52.0035, lng: -0.4510 },
    'Leicestershire': { lat: 52.6369, lng: -1.1398 },
    'Worcestershire': { lat: 52.1920, lng: -2.2216 },
    'Nottinghamshire': { lat: 53.1000, lng: -1.0308 },
    'Lincolnshire': { lat: 53.0667, lng: -0.3833 },
    'Staffordshire': { lat: 52.8794, lng: -2.0516 },
    'Shropshire': { lat: 52.6760, lng: -2.7652 },
  },

  async textSearch(query, county, apiKey) {
    if (!apiKey) return [];
    await this.rateLimit.throttle();

    const coords = this.countyCoords[county] || { lat: 51.5074, lng: -0.1278 };

    const response = await retryFetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryType',
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: { center: { latitude: coords.lat, longitude: coords.lng }, radius: 50000.0 },
        },
        maxResultCount: 20,
      }),
    });

    const data = await response.json();
    return (data.places || []).map(p => ({
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      phone: p.nationalPhoneNumber || '',
      website: p.websiteUri || '',
      rating: p.rating,
      reviews: p.userRatingCount,
      type: p.primaryType || '',
      county,
    }));
  },
};

// ── 4. Serper.dev (2,500 free queries) ──
// Technique: Google Search Results API with structured local/organic results
// How it works: Submit search query, get back Google SERP data including
// local business listings with phone, website, address, rating
const serperAdapter = {
  id: 'serper',
  name: 'Serper.dev',
  description: 'Google Search API. Returns organic + local results. 2,500 free queries.',
  freeLimit: '2,500 one-time queries (no expiry for 6 months)',
  technique: 'REST API → Google SERP scraping → Structured JSON',
  rateLimit: new RateLimiter(30),

  // Web search
  async search(query, apiKey) {
    if (!apiKey) return { organic: [], local: [] };
    await this.rateLimit.throttle();

    const response = await retryFetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'gb', hl: 'en', num: 20 }),
    });

    const data = await response.json();
    return {
      organic: (data.organic || []).map(r => ({
        name: r.title, link: r.link, description: r.snippet,
      })),
      local: (data.places || []).map(p => ({
        name: p.title, address: p.address, phone: p.phone,
        website: p.website, rating: p.rating, reviews: p.reviews,
      })),
      knowledgeGraph: data.knowledgeGraph || null,
    };
  },

  // Google Maps / Places search
  async searchPlaces(query, apiKey) {
    if (!apiKey) return [];
    await this.rateLimit.throttle();

    const response = await retryFetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'gb' }),
    });

    const data = await response.json();
    return (data.places || []).map(p => ({
      name: p.title, address: p.address, phone: p.phone,
      website: p.website, rating: p.rating, reviews: p.reviews,
    }));
  },
};

// ── 5. Instagram Discovery ──
// Technique: Public profile scraping via Jina Reader + hashtag search via Serper
// How it works: Instagram business profiles are public — we use Google to find
// them, then Jina Reader to extract the bio, website, and contact info
const instagramAdapter = {
  id: 'instagram',
  name: 'Instagram Discovery',
  description: 'Find event businesses via Instagram hashtags and profiles. Uses Google search + Jina Reader.',
  freeLimit: 'No direct Instagram API needed — uses Google + Jina',
  technique: 'Google site:instagram.com search → Jina Reader for profile extraction',
  rateLimit: new RateLimiter(10),

  // Search hashtags for event businesses
  eventHashtags: [
    'weddingplanner{county}', 'eventplanner{county}', '{county}wedding',
    '{county}events', 'cocktailbar{county}', 'mobilebar{county}',
    '{county}venue', '{county}weddingvenue', 'corporateevents{county}',
    'eventcatering{county}', '{county}eventplanner', 'luxurywedding{county}',
    'barnwedding{county}', '{county}cocktails', 'privateevent{county}',
    'weddingstylist{county}', 'eventdesign{county}', 'partyplanner{county}',
    'festivalbar{county}', 'popupbar{county}',
  ],

  // Find Instagram accounts via Google search
  async findProfiles(searchTerm, county, serperApiKey) {
    if (!serperApiKey) return [];
    await this.rateLimit.throttle();

    const query = `site:instagram.com "${searchTerm}" "${county}" -p/ -reel`;
    const response = await retryFetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'gb', num: 10 }),
    });

    const data = await response.json();
    return (data.organic || [])
      .filter(r => r.link?.includes('instagram.com/'))
      .map(r => ({
        username: r.link.match(/instagram\.com\/([^/?]+)/)?.[1] || '',
        profileUrl: r.link,
        title: r.title,
        bio: r.snippet,
        county,
      }))
      .filter(p => p.username && !['p', 'reel', 'explore', 'stories', 'accounts'].includes(p.username));
  },

  // Extract business info from an Instagram profile page using Jina Reader
  async scrapeProfile(profileUrl) {
    try {
      const data = await jinaAdapter.scrapeUrl(profileUrl);
      if (!data?.content) return null;

      const content = data.content;
      const contacts = jinaAdapter.extractContacts(content);

      // Extract follower count if visible
      const followers = content.match(/([\d,.]+[KMkm]?)\s*(?:Followers|followers)/)?.[1] || '';

      // Extract website from bio
      const bioWebsite = content.match(/(?:Website|Link|Bio)\s*[:\-]?\s*(https?:\/\/[\w.-]+\.\w+[^\s]*)/i)?.[1] || '';

      return {
        followers,
        website: contacts.websites[0] || bioWebsite || '',
        email: contacts.emails[0] || '',
        phone: contacts.phones[0] || '',
        bio: data.description || '',
      };
    } catch {
      return null;
    }
  },

  // Generate search queries for a county
  getHashtagQueries(county) {
    const cleanCounty = county.toLowerCase().replace(/\s+/g, '');
    return this.eventHashtags.map(h => h.replace(/\{county\}/g, cleanCounty));
  },
};

// ── 6. Hunter.io (25 free/month — email enrichment) ──
// Technique: Domain email search using public sources
const hunterAdapter = {
  id: 'hunter',
  name: 'Hunter.io',
  description: 'Find email addresses for any domain. 25 free searches/month.',
  freeLimit: '25 searches + 50 verifications per month',
  technique: 'Domain crawling → Email pattern detection → Public source aggregation',
  rateLimit: new RateLimiter(10),

  async findEmails(domain, apiKey) {
    if (!apiKey || !domain) return null;
    await this.rateLimit.throttle();

    const response = await retryFetch(
      `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}`,
    );
    const data = await response.json();

    return {
      domain: data.data?.domain,
      organization: data.data?.organization,
      emailPattern: data.data?.pattern,
      emails: (data.data?.emails || []).map(e => ({
        email: e.value,
        type: e.type,
        confidence: e.confidence,
        name: [e.first_name, e.last_name].filter(Boolean).join(' '),
        position: e.position,
        department: e.department,
      })),
    };
  },
};

// ── 7. Google Business Reviews Enrichment ──
// Technique: Uses Google Places API Place Details to pull reviews, Q&A, photos
// Pattern from ZoomInfo/Apollo: enrich existing leads with intent signals from reviews
const googleReviewsAdapter = {
  id: 'google-reviews',
  name: 'Google Reviews Enrichment',
  description: 'Enrich leads with Google reviews, rating trends, and event mentions. Uses Places API.',
  freeLimit: 'Shares Google Places quota (10,000/month)',
  technique: 'Places API → Place Details → Review text mining for event signals',
  rateLimit: new RateLimiter(30),

  // Search terms that indicate event-hosting potential in reviews
  eventSignals: [
    'event', 'wedding', 'party', 'private hire', 'corporate', 'function',
    'cocktail', 'birthday', 'celebration', 'reception', 'launch', 'bar',
    'catering', 'hosted', 'booked', 'venue hire', 'exclusive hire',
  ],

  async getPlaceDetails(placeId, apiKey) {
    if (!apiKey || !placeId) return null;
    await this.rateLimit.throttle();

    const fields = 'displayName,formattedAddress,websiteUri,nationalPhoneNumber,rating,userRatingCount,reviews,regularOpeningHours,photos,editorialSummary,priceLevel,types';
    const response = await retryFetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}`,
      { headers: { 'X-Goog-Api-Key': apiKey, 'Content-Type': 'application/json' } },
    );
    return await response.json();
  },

  // Analyze reviews for event-related signals
  analyzeReviews(reviews) {
    if (!reviews || !reviews.length) return { eventScore: 0, eventMentions: 0, recentPositive: 0, signals: [] };

    let eventMentions = 0;
    let recentPositive = 0;
    const signals = new Set();
    const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString();

    for (const review of reviews) {
      const text = (review.text?.text || review.originalText?.text || '').toLowerCase();
      const isRecent = (review.publishTime || '') > sixMonthsAgo;

      for (const signal of this.eventSignals) {
        if (text.includes(signal)) {
          eventMentions++;
          signals.add(signal);
          break;
        }
      }

      if (isRecent && (review.rating >= 4)) recentPositive++;
    }

    const eventScore = Math.min(100, Math.round(
      (eventMentions / reviews.length) * 40 +
      (recentPositive / reviews.length) * 30 +
      Math.min(reviews.length / 50, 1) * 30
    ));

    return { eventScore, eventMentions, recentPositive, signals: [...signals] };
  },

  // Find competitors near a venue
  async findNearbyCompetitors(lat, lng, apiKey) {
    if (!apiKey) return [];
    await this.rateLimit.throttle();

    const response = await retryFetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: { 'X-Goog-Api-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        includedTypes: ['bar', 'restaurant', 'event_venue', 'night_club'],
        maxResultCount: 10,
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 2000 } },
      }),
    });
    const data = await response.json();
    return (data.places || []).map(p => ({
      name: p.displayName?.text,
      rating: p.rating,
      reviews: p.userRatingCount,
      types: p.types,
    }));
  },
};

// ── 8. Eventbrite Discovery ──
// Technique: Uses Serper to find Eventbrite event organizers in target areas
// Pattern from Apollo: intent-based prospecting — find people actively hosting events
const eventbriteAdapter = {
  id: 'eventbrite',
  name: 'Eventbrite Discovery',
  description: 'Find event organizers via Eventbrite listings. Discovers venues and planners actively hosting events.',
  freeLimit: 'Uses Serper quota (2,500/month)',
  technique: 'Serper Google Search → site:eventbrite.co.uk → organizer extraction',
  rateLimit: new RateLimiter(15),

  searchQueries: [
    'site:eventbrite.co.uk cocktail event {county}',
    'site:eventbrite.co.uk gin tasting {county}',
    'site:eventbrite.co.uk whisky masterclass {county}',
    'site:eventbrite.co.uk corporate drinks {county}',
    'site:eventbrite.co.uk bar experience {county}',
    'site:eventbrite.co.uk cocktail making {county}',
    'site:eventbrite.co.uk wine tasting event {county}',
    'site:eventbrite.co.uk private dining {county}',
  ],

  async search(county, serperKey) {
    if (!serperKey) return [];
    const results = [];

    for (const queryTemplate of this.searchQueries.slice(0, 3)) {
      await this.rateLimit.throttle();
      const query = queryTemplate.replace('{county}', county);

      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, num: 10, gl: 'uk', hl: 'en' }),
        });
        const data = await response.json();

        for (const item of (data.organic || [])) {
          // Extract organizer name from Eventbrite URL/title
          const orgMatch = item.title?.match(/by\s+(.+?)(?:\s*\||\s*-|\s*$)/i);
          results.push({
            name: orgMatch?.[1]?.trim() || item.title?.split('|')[0]?.trim() || '',
            description: item.snippet || '',
            link: item.link || '',
            city: '',
            county,
            category: 'Event Organizer (Eventbrite)',
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },
};

// ── 9. TripAdvisor & Yelp Discovery ──
// Technique: Uses Serper to find venue listings on review platforms
// Pattern from Lusha/ZoomInfo: aggregate data from multiple directories
const reviewPlatformAdapter = {
  id: 'review-platforms',
  name: 'TripAdvisor & Yelp',
  description: 'Discover venues via TripAdvisor and Yelp listings. Extracts ratings, review counts, and venue details.',
  freeLimit: 'Uses Serper quota (2,500/month)',
  technique: 'Serper → site:tripadvisor.co.uk + site:yelp.co.uk → venue extraction',
  rateLimit: new RateLimiter(15),

  async search(county, venueType, serperKey) {
    if (!serperKey) return [];
    await this.rateLimit.throttle();

    const results = [];
    const queries = [
      `site:tripadvisor.co.uk "${county}" ${venueType} private hire`,
      `site:yelp.co.uk "${county}" ${venueType} events`,
    ];

    for (const query of queries) {
      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, num: 10, gl: 'uk', hl: 'en' }),
        });
        const data = await response.json();

        for (const item of (data.organic || [])) {
          const source = item.link?.includes('tripadvisor') ? 'TripAdvisor' : 'Yelp';
          // Extract rating from snippet (e.g., "4.5 of 5 bubbles")
          const ratingMatch = item.snippet?.match(/([\d.]+)\s*(?:of 5|\/5|stars?|bubbles)/i);
          const reviewMatch = item.snippet?.match(/(\d[\d,]*)\s*reviews?/i);

          results.push({
            name: item.title?.replace(/\s*[-|].*$/, '').replace(/,.*$/, '').trim() || '',
            description: item.snippet || '',
            link: item.link || '',
            rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
            reviewCount: reviewMatch ? parseInt(reviewMatch[1].replace(',', '')) : 0,
            city: '',
            county,
            category: `${venueType} (${source})`,
            source: source.toLowerCase(),
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },
};

// ── 10. Facebook Events & Pages Discovery ──
// Technique: Uses Serper to find Facebook business pages and events
// Pattern from HubSpot: social media prospecting via search
const facebookAdapter = {
  id: 'facebook',
  name: 'Facebook Events & Pages',
  description: 'Find venue Facebook pages and event listings via Google search.',
  freeLimit: 'Uses Serper quota (2,500/month)',
  technique: 'Serper → site:facebook.com → page/event extraction',
  rateLimit: new RateLimiter(15),

  async searchPages(county, serperKey) {
    if (!serperKey) return [];
    await this.rateLimit.throttle();

    const queries = [
      `site:facebook.com "${county}" cocktail bar events`,
      `site:facebook.com "${county}" event venue hire`,
      `site:facebook.com "${county}" mobile bar service`,
    ];

    const results = [];
    for (const query of queries) {
      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, num: 10, gl: 'uk', hl: 'en' }),
        });
        const data = await response.json();

        for (const item of (data.organic || [])) {
          if (!item.link?.includes('facebook.com')) continue;
          results.push({
            name: item.title?.replace(/\s*[-|].*Facebook.*$/i, '').replace(/\s*\|.*$/, '').trim() || '',
            description: item.snippet || '',
            facebook_url: item.link,
            city: '',
            county,
            category: 'Facebook Lead',
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },

  async searchEvents(county, serperKey) {
    if (!serperKey) return [];
    await this.rateLimit.throttle();

    try {
      const response = await retryFetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: `site:facebook.com/events "${county}" cocktail OR bar OR mixology OR tasting 2025`,
          num: 10, gl: 'uk', hl: 'en',
        }),
      });
      const data = await response.json();

      return (data.organic || []).map(item => ({
        name: item.title?.replace(/\s*\|.*$/, '').trim() || '',
        description: item.snippet || '',
        facebook_url: item.link,
        county,
        category: 'Facebook Event Organizer',
      }));
    } catch {
      return [];
    }
  },
};

// ── 11. Twitter/X Event Monitoring ──
// Technique: Uses Serper to find X/Twitter posts about events in target areas
// Pattern from Brandwatch/Mention: social listening for intent signals
const twitterAdapter = {
  id: 'twitter',
  name: 'X/Twitter Monitoring',
  description: 'Find event-related tweets and venue accounts. Social listening for lead signals.',
  freeLimit: 'Uses Serper quota (2,500/month)',
  technique: 'Serper → site:twitter.com/x.com → event intent extraction',
  rateLimit: new RateLimiter(15),

  intentKeywords: [
    'looking for cocktail bar', 'need a bartender', 'hiring mobile bar',
    'cocktail event', 'venue looking for', 'bar service needed',
    'mixologist wanted', 'event bar service', 'wedding bar',
  ],

  async searchIntentSignals(county, serperKey) {
    if (!serperKey) return [];
    const results = [];

    for (const keyword of this.intentKeywords.slice(0, 4)) {
      await this.rateLimit.throttle();
      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: `(site:twitter.com OR site:x.com) "${county}" ${keyword}`,
            num: 5, gl: 'uk', hl: 'en', tbs: 'qdr:m', // Last month only
          }),
        });
        const data = await response.json();

        for (const item of (data.organic || [])) {
          results.push({
            name: item.title?.split(/[-|@]/)[0]?.trim() || '',
            description: item.snippet || '',
            twitter_url: item.link,
            county,
            category: 'Twitter Intent Signal',
            intent_keyword: keyword,
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },
};

// ── 12. Venue Directory Aggregator ──
// Technique: Scrapes major UK venue directory sites via Serper
// Pattern from Apollo: multi-directory prospecting for comprehensive coverage
const venueDirectoryAdapter = {
  id: 'venue-directories',
  name: 'Venue Directory Aggregator',
  description: 'Aggregate leads from Hire Space, Square Meal, VenueScanner, Tagvenue, and more.',
  freeLimit: 'Uses Serper quota (2,500/month)',
  technique: 'Serper → multiple directory sites → venue extraction + dedup',
  rateLimit: new RateLimiter(15),

  directories: [
    { domain: 'hirespace.com', name: 'Hire Space' },
    { domain: 'squaremeal.co.uk', name: 'Square Meal' },
    { domain: 'venuescanner.com', name: 'VenueScanner' },
    { domain: 'tagvenue.com', name: 'Tagvenue' },
    { domain: 'headbox.com', name: 'HeadBox' },
    { domain: 'designmynight.com', name: 'DesignMyNight' },
    { domain: 'bridebook.com', name: 'Bridebook' },
    { domain: 'hitched.co.uk', name: 'Hitched' },
  ],

  async search(county, venueType, serperKey) {
    if (!serperKey) return [];
    const results = [];

    for (const dir of this.directories) {
      await this.rateLimit.throttle();
      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: `site:${dir.domain} "${county}" ${venueType}`,
            num: 5, gl: 'uk', hl: 'en',
          }),
        });
        const data = await response.json();

        for (const item of (data.organic || [])) {
          results.push({
            name: item.title?.replace(/\s*[-|].*$/, '').replace(/,.*$/, '').trim() || '',
            description: item.snippet || '',
            link: item.link,
            county,
            category: `${venueType} (${dir.name})`,
            directory_source: dir.name,
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },
};

// ── 14. Apollo.io Enrichment ──
// Pattern from Apollo.io: company enrichment by domain returns firmographics, key personnel
const apolloAdapter = {
  id: 'apollo',
  name: 'Apollo.io Enrichment',
  description: 'Company enrichment by domain — industry, size, revenue, key event/hospitality personnel',
  freeLimit: '60 credits/month free',
  technique: 'REST API — firmographics + people search',
  rateLimit: new RateLimiter(10),

  async enrichCompany(domain, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch('https://api.apollo.io/api/v1/organizations/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, domain }),
    });
    return response.json();
  },

  async searchPeople(filters, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        person_titles: filters.titles || [
          'Event Manager', 'Head of Events', 'Events Director', 'Hospitality Manager',
          'Venue Manager', 'Wedding Coordinator', 'Conference Manager', 'Banqueting Manager',
          'F&B Manager', 'Concierge', 'Head Concierge', 'Private Events Manager',
        ],
        organization_industry_tag_ids: filters.industries,
        person_locations: filters.locations || ['United Kingdom'],
        per_page: 25,
      }),
    });
    const data = await response.json();
    return (data.people || []).map(p => ({
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      title: p.title || '',
      company: p.organization?.name || '',
      email: p.email || '',
      phone: p.phone_numbers?.[0]?.sanitized_number || '',
      linkedin: p.linkedin_url || '',
      website: p.organization?.website_url || '',
      city: p.city || '',
      county: p.state || '',
      industry: p.organization?.industry || '',
      employeeCount: p.organization?.estimated_num_employees || 0,
    }));
  },
};

// ── 15. LinkedIn / Proxycurl ──
// Pattern from Proxycurl: enrich LinkedIn URLs with structured profile data
const linkedinAdapter = {
  id: 'linkedin',
  name: 'LinkedIn (Proxycurl)',
  description: 'Enrich LinkedIn profiles — find event managers, concierge contacts, hospitality decision-makers',
  freeLimit: '10 credits on signup, then ~$0.01/profile',
  technique: 'Proxycurl REST API — profile enrichment + people search',
  rateLimit: new RateLimiter(10),

  async enrichProfile(linkedinUrl, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(linkedinUrl)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    return response.json();
  },

  async searchPeople(query, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://nubela.co/proxycurl/api/search/person?country=GB&current_role_title=${encodeURIComponent(query)}&enrich_profiles=enrich`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    const data = await response.json();
    return (data.results || []).map(p => ({
      name: p.profile?.full_name || '',
      title: p.profile?.headline || '',
      company: p.profile?.experiences?.[0]?.company || '',
      linkedin: p.linkedin_profile_url || '',
      city: p.profile?.city || '',
    }));
  },

  async companyEmployees(companyLinkedinUrl, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://nubela.co/proxycurl/api/linkedin/company/employees?url=${encodeURIComponent(companyLinkedinUrl)}&role_search=event%20OR%20hospitality%20OR%20concierge%20OR%20catering`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    return response.json();
  },
};

// ── 16. Enhanced Google Places ──
// Extended fields: cocktail attributes, editorial summaries, event-relevant types
const enhancedGooglePlacesAdapter = {
  id: 'enhanced-google-places',
  name: 'Enhanced Google Places',
  description: 'Deep venue analysis — cocktail/event attributes, editorial summaries, hours, price level',
  freeLimit: 'Included in Google Places quota (10K/month)',
  technique: 'Places API (New) — extended field masks for event venue profiling',
  rateLimit: new RateLimiter(10),

  // Fields specifically relevant to identifying venues that outsource bar services
  fieldMask: [
    'displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteUri',
    'rating', 'userRatingCount', 'reviews', 'editorialSummary',
    'currentOpeningHours', 'regularOpeningHours', 'priceLevel', 'primaryType', 'types',
    'servesCocktails', 'servesWine', 'servesBeer', 'liveMusic',
    'outdoorSeating', 'reservable', 'dineIn', 'goodForGroups',
    'photos', 'businessStatus',
  ].join(','),

  // Venue types that typically outsource bar services (NOT bars themselves)
  outsourcerTypes: [
    'country house', 'manor house', 'stately home', 'castle', 'estate',
    'hotel', 'boutique hotel', 'spa hotel', 'conference centre', 'conference center',
    'wedding venue', 'barn venue', 'marquee venue', 'garden venue',
    'gallery', 'museum', 'art gallery', 'cultural centre',
    'yacht club', 'polo club', 'golf club', 'country club', 'members club',
    'racecourse', 'race course', 'cricket ground', 'sports venue',
    'private dining', 'function room', 'banqueting suite', 'ballroom',
    'rooftop venue', 'warehouse venue', 'loft venue', 'industrial venue',
    'botanical garden', 'orangery', 'conservatory', 'pavilion',
    'village hall', 'town hall', 'civic centre',
    'corporate venue', 'training centre', 'business centre',
  ],

  // Types to EXCLUDE (they have their own bars)
  excludeTypes: [
    'bar', 'pub', 'nightclub', 'cocktail bar', 'wine bar', 'brewery',
    'taproom', 'tavern', 'lounge bar', 'sports bar',
  ],

  async getPlaceDetails(placeId, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': this.fieldMask,
        },
      },
    );
    return response.json();
  },

  // Search specifically for venue types that outsource bar services
  async searchOutsourcerVenues(county, apiKey) {
    const results = [];
    const searchQueries = [
      `wedding venue hire ${county}`,
      `country house venue ${county}`,
      `conference venue ${county}`,
      `private hire venue ${county}`,
      `event space no bar ${county}`,
      `dry hire venue ${county}`, // Dry hire = no in-house catering
      `blank canvas venue ${county}`,
    ];

    for (const query of searchQueries) {
      await this.rateLimit.throttle();
      try {
        const response = await retryFetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.primaryType,places.editorialSummary,places.priceLevel',
          },
          body: JSON.stringify({ textQuery: query, locationBias: { rectangle: googlePlacesAdapter.countyCoords[county] }, languageCode: 'en' }),
        });
        const data = await response.json();
        for (const place of (data.places || [])) {
          // Filter out bars/pubs
          const name = (place.displayName?.text || '').toLowerCase();
          const type = (place.primaryType || '').toLowerCase();
          const isBar = this.excludeTypes.some(t => name.includes(t) || type.includes(t));
          if (!isBar) {
            results.push({
              ...place,
              name: place.displayName?.text || '',
              address: place.formattedAddress || '',
              county,
              category: this.categorizeVenue(place),
              outsource_indicator: this.outsourceScore(place),
            });
          }
        }
      } catch { /* continue */ }
    }

    return results;
  },

  categorizeVenue(place) {
    const name = (place.displayName?.text || '').toLowerCase();
    const summary = (place.editorialSummary?.text || '').toLowerCase();
    const combined = `${name} ${summary}`;
    for (const vType of this.outsourcerTypes) {
      if (combined.includes(vType)) return vType;
    }
    return place.primaryType || 'venue';
  },

  // Score how likely this venue is to outsource bar services
  outsourceScore(place) {
    let score = 0;
    const summary = (place.editorialSummary?.text || '').toLowerCase();
    const name = (place.displayName?.text || '').toLowerCase();
    const combined = `${name} ${summary}`;

    // Strong outsource indicators
    if (combined.includes('dry hire')) score += 30;
    if (combined.includes('blank canvas')) score += 25;
    if (combined.includes('outside caterer')) score += 30;
    if (combined.includes('bring your own')) score += 20;
    if (combined.includes('approved supplier') || combined.includes('preferred supplier')) score += 20;

    // Venue types that commonly outsource
    if (combined.includes('country house') || combined.includes('manor')) score += 15;
    if (combined.includes('barn') || combined.includes('marquee')) score += 15;
    if (combined.includes('estate') || combined.includes('castle')) score += 15;
    if (combined.includes('gallery') || combined.includes('museum')) score += 10;

    // Premium indicators
    if (place.priceLevel === 'PRICE_LEVEL_EXPENSIVE' || place.priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE') score += 10;
    if (place.rating >= 4.5) score += 5;

    return Math.min(score, 100);
  },
};

// ── 17. Concierge & Luxury Market ──
// Target: private members clubs, luxury travel concierge, wealth managers' events, HNWI services
const conciergeMarketAdapter = {
  id: 'concierge-market',
  name: 'Concierge & Luxury Market',
  description: 'Private members clubs, luxury concierge, HNWI event planners, estate managers, yacht clubs',
  freeLimit: 'Uses Serper credits',
  technique: 'Multi-site Google Search targeting luxury/concierge verticals',
  rateLimit: new RateLimiter(8),

  // Luxury venue & concierge search queries by vertical
  verticals: {
    privateMembers: {
      label: 'Private Members Clubs',
      queries: [
        'private members club event hire',
        'private members club function room',
        'exclusive members club private dining',
        'Soho House style private club event',
      ],
    },
    luxuryConcierge: {
      label: 'Luxury Concierge Services',
      queries: [
        'luxury concierge service events',
        'HNWI concierge event planning UK',
        'private client concierge party planning',
        'bespoke event concierge London',
        'quintessentially events', // Major luxury concierge
        'ten lifestyle group events',
        'john paul concierge events',
      ],
    },
    estateManagers: {
      label: 'Estate & Property Managers',
      queries: [
        'estate manager private event',
        'country estate event hire',
        'private estate venue hire UK',
        'stately home wedding venue',
        'National Trust venue hire events',
        'English Heritage venue hire',
      ],
    },
    yachtPolo: {
      label: 'Yacht & Polo Clubs',
      queries: [
        'yacht club event hire UK',
        'polo club hospitality corporate',
        'royal yacht squadron events',
        'cowes week corporate hospitality',
        'polo event hospitality UK',
        'regatta corporate hospitality',
      ],
    },
    luxuryWedding: {
      label: 'Luxury Wedding Venues',
      queries: [
        'luxury wedding venue outside caterer',
        'exclusive wedding venue dry hire UK',
        'castle wedding venue bar hire',
        'luxury marquee wedding',
        'country house wedding bar service',
        'stately home wedding bar hire',
      ],
    },
    corporateHospitality: {
      label: 'Corporate Hospitality',
      queries: [
        'corporate hospitality event provider',
        'prestige corporate event venue UK',
        'boardroom dining event service',
        'corporate entertaining venue London',
        'private corporate event space',
      ],
    },
    fashionLuxury: {
      label: 'Fashion & Luxury Brands',
      queries: [
        'luxury brand launch event venue UK',
        'fashion show event hire London',
        'product launch party venue',
        'luxury retail event space',
        'VIP brand experience event',
      ],
    },
  },

  // Specific directories & platforms for the luxury market
  luxuryDirectories: [
    { domain: 'quintessentially.com', name: 'Quintessentially' },
    { domain: 'tengroup.com', name: 'Ten Group' },
    { domain: 'pfrankly.com', name: 'Frankly' },
    { domain: 'hardens.com', name: 'Hardens' },
    { domain: 'theknot.com', name: 'The Knot' },
    { domain: 'tatler.com', name: 'Tatler' },
    { domain: 'countrylife.co.uk', name: 'Country Life' },
    { domain: 'hurlingham.co.uk', name: 'Hurlingham Club' },
    { domain: 'annabelsmember.co.uk', name: 'Annabels' },
    { domain: 'cliveden.co.uk', name: 'Cliveden House' },
  ],

  async searchVertical(vertical, county, serperKey) {
    if (!serperKey) return [];
    const results = [];
    const config = this.verticals[vertical];
    if (!config) return [];

    for (const query of config.queries) {
      await this.rateLimit.throttle();
      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: county ? `${query} ${county}` : `${query} UK`,
            num: 10, gl: 'uk', hl: 'en',
          }),
        });
        const data = await response.json();

        for (const item of (data.organic || [])) {
          // Filter out bars, pubs, and irrelevant results
          const title = (item.title || '').toLowerCase();
          const barTerms = ['bar hire', 'mobile bar', 'cocktail bar company', ' pub ', 'brewery'];
          if (barTerms.some(t => title.includes(t))) continue;

          results.push({
            name: item.title?.replace(/\s*[-|].*$/, '').replace(/,.*$/, '').trim(),
            description: item.snippet || '',
            link: item.link,
            county: county || 'UK',
            category: `${config.label} — ${vertical}`,
            market_tier: 'luxury',
            vertical,
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },

  async searchAllVerticals(county, serperKey) {
    const allResults = [];
    for (const vertical of Object.keys(this.verticals)) {
      const results = await this.searchVertical(vertical, county, serperKey);
      allResults.push(...results);
    }
    return allResults;
  },

  // Search luxury directories for event spaces
  async searchLuxuryDirectories(county, serperKey) {
    if (!serperKey) return [];
    const results = [];

    for (const dir of this.luxuryDirectories) {
      await this.rateLimit.throttle();
      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: `site:${dir.domain} event ${county ? county : 'London'}`,
            num: 5, gl: 'uk', hl: 'en',
          }),
        });
        const data = await response.json();
        for (const item of (data.organic || [])) {
          results.push({
            name: item.title?.replace(/\s*[-|].*$/, '').trim(),
            description: item.snippet || '',
            link: item.link,
            county: county || 'UK',
            category: `Luxury Directory (${dir.name})`,
            market_tier: 'luxury',
            directory_source: dir.name,
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },
};

// ── 18. Email Waterfall Verification ──
// Pattern from Apollo/ZoomInfo: cascade through verification services
const emailVerifier = {
  id: 'email-verifier',
  name: 'Email Verification Waterfall',
  description: 'Multi-step email verification — Hunter + ZeroBounce cascade for maximum accuracy',
  freeLimit: 'Hunter 50/mo + ZeroBounce 100/mo free',
  technique: 'Waterfall: syntax → MX → Hunter → ZeroBounce with demographic enrichment',
  rateLimit: new RateLimiter(5),

  disposableDomains: new Set([
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'temp-mail.org', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
  ]),

  basicValidation(email) {
    if (!email || typeof email !== 'string') return { valid: false, reason: 'empty' };
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return { valid: false, reason: 'invalid_syntax' };
    const domain = email.split('@')[1].toLowerCase();
    if (this.disposableDomains.has(domain)) return { valid: false, reason: 'disposable' };
    // Generic addresses less useful for B2B
    const generic = ['info@', 'hello@', 'contact@', 'admin@', 'support@', 'noreply@'];
    const isGeneric = generic.some(g => email.toLowerCase().startsWith(g));
    return { valid: true, isGeneric, domain };
  },

  async verifyWithHunter(email, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`,
    );
    const data = await response.json();
    return data.data || {};
  },

  async verifyWithZeroBounce(email, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}`,
    );
    return response.json();
  },

  async verify(email, apiKeys = {}) {
    // Step 1: Basic validation
    const basic = this.basicValidation(email);
    if (!basic.valid) return { valid: false, reason: basic.reason, confidence: 100 };

    // Step 2: Hunter verification
    if (apiKeys.hunter) {
      try {
        const hunter = await this.verifyWithHunter(email, apiKeys.hunter);
        if (hunter.status === 'valid') return { valid: true, confidence: 90, source: 'hunter', isGeneric: basic.isGeneric };
        if (hunter.status === 'invalid') return { valid: false, reason: 'hunter_invalid', confidence: 90 };
      } catch { /* fall through to next */ }
    }

    // Step 3: ZeroBounce for uncertain/remaining
    if (apiKeys.zeroBounce) {
      try {
        const zb = await this.verifyWithZeroBounce(email, apiKeys.zeroBounce);
        return {
          valid: zb.status === 'valid',
          reason: zb.status !== 'valid' ? zb.sub_status || zb.status : undefined,
          confidence: 95,
          source: 'zerobounce',
          isGeneric: basic.isGeneric,
          demographics: { firstname: zb.firstname, lastname: zb.lastname, gender: zb.gender, location: zb.location },
        };
      } catch { /* fall through */ }
    }

    // No verification available — return syntax-only result
    return { valid: null, reason: 'unverified', confidence: 30, isGeneric: basic.isGeneric };
  },

  // Batch verify an array of leads
  async verifyLeads(leads, apiKeys) {
    const results = { verified: 0, invalid: 0, unverified: 0 };
    for (const lead of leads) {
      if (!lead.contact_email) { results.unverified++; continue; }
      const result = await this.verify(lead.contact_email, apiKeys);
      lead.email_verified = result.valid;
      lead.email_confidence = result.confidence;
      lead.email_demographics = result.demographics;
      if (result.valid === true) results.verified++;
      else if (result.valid === false) results.invalid++;
      else results.unverified++;
    }
    return results;
  },
};

// ── 19. Outscraper — Popular Times & Busyness ──
// Identifies high-traffic venues that host frequent events
const outscraperAdapter = {
  id: 'outscraper',
  name: 'Outscraper (Popular Times)',
  description: 'Google Maps popular times & busyness data — identify high-traffic event venues',
  freeLimit: 'Free tier available',
  technique: 'Outscraper REST API — popular times histograms + review extraction',
  rateLimit: new RateLimiter(5),

  async searchWithPopularTimes(query, apiKey) {
    await this.rateLimit.throttle();
    const response = await retryFetch(
      `https://api.outscraper.com/maps/search-v3?query=${encodeURIComponent(query)}&limit=20&async=false`,
      { headers: { 'X-API-KEY': apiKey } },
    );
    const data = await response.json();
    return (data.data?.[0] || []).map(place => ({
      name: place.name || '',
      address: place.full_address || '',
      phone: place.phone || '',
      website: place.site || '',
      rating: place.rating || 0,
      reviews: place.reviews || 0,
      category: place.type || place.subtypes?.[0] || '',
      popular_times: place.popular_times || null,
      // Compute event-friendliness from popular times
      weekend_peak: this.analyzeWeekendPeaks(place.popular_times),
      evening_peak: this.analyzeEveningPeaks(place.popular_times),
    }));
  },

  analyzeWeekendPeaks(popularTimes) {
    if (!popularTimes) return 0;
    // Saturday + Sunday evening peaks indicate event hosting
    const sat = popularTimes.Saturday || popularTimes.saturday || [];
    const sun = popularTimes.Sunday || popularTimes.sunday || [];
    const satPeak = Math.max(...(sat.map?.(h => h.percentage || 0) || [0]));
    const sunPeak = Math.max(...(sun.map?.(h => h.percentage || 0) || [0]));
    return Math.round((satPeak + sunPeak) / 2);
  },

  analyzeEveningPeaks(popularTimes) {
    if (!popularTimes) return 0;
    // Look at 6pm-11pm across all days for consistent evening event patterns
    let totalPeak = 0;
    let days = 0;
    for (const day of Object.values(popularTimes)) {
      if (!Array.isArray(day)) continue;
      const eveningHours = day.filter(h => (h.hour || 0) >= 18 && (h.hour || 0) <= 23);
      if (eveningHours.length > 0) {
        totalPeak += Math.max(...eveningHours.map(h => h.percentage || 0));
        days++;
      }
    }
    return days > 0 ? Math.round(totalPeak / days) : 0;
  },
};

// ── 20. Instagram Hashtag & Content Monitoring ──
// Enhanced Instagram: hashtag monitoring, event detection, highlight reel analysis
const instagramEnhancedAdapter = {
  id: 'instagram-enhanced',
  name: 'Instagram Enhanced',
  description: 'Hashtag monitoring for event signals, content analysis for venue identification',
  freeLimit: 'Uses Serper + Jina credits',
  technique: 'Google hashtag search + Jina content extraction + event keyword analysis',
  rateLimit: new RateLimiter(8),

  // Event-related hashtags for the UK bartending/events market
  eventHashtags: [
    'corporateevent', 'londonevents', 'weddingbar', 'mobilebar', 'cocktailcatering',
    'luxurywedding', 'ukwedding', 'eventvenue', 'weddingvenue', 'privateevent',
    'corporatehospitality', 'productlaunch', 'brandevent', 'galaevent', 'charityball',
    'polopony', 'regatta', 'ascot', 'henley', 'cheltenham', 'goodwood',
    'dryherevenue', 'barnwedding', 'countryhousewedding', 'marquee',
    'luxuryevent', 'bespokeevent', 'vipevent', 'exclusiveevent',
  ],

  // Venue search terms — NOT bars/pubs
  venueSearchTerms: [
    'wedding venue', 'event venue', 'corporate venue', 'function venue',
    'country house events', 'castle wedding', 'estate venue',
    'private hire venue', 'dry hire venue', 'blank canvas venue',
  ],

  async searchHashtag(hashtag, county, serperKey) {
    if (!serperKey) return [];
    await this.rateLimit.throttle();
    try {
      const response = await retryFetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: `site:instagram.com "${hashtag}" ${county ? county : 'UK'} venue`,
          num: 10, gl: 'uk', tbs: 'qdr:m', // Last month
        }),
      });
      const data = await response.json();
      return (data.organic || []).map(r => ({
        name: r.title?.replace(/ on Instagram.*$/, '').replace(/@\w+/, '').trim(),
        description: r.snippet || '',
        link: r.link,
        instagram_url: r.link,
        county: county || 'UK',
        category: 'Instagram (Hashtag)',
        hashtag,
      }));
    } catch { return []; }
  },

  async searchVenueProfiles(county, serperKey) {
    if (!serperKey) return [];
    const results = [];

    for (const term of this.venueSearchTerms) {
      await this.rateLimit.throttle();
      try {
        const response = await retryFetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: `site:instagram.com "${term}" "${county}" -bar -pub -brewery -taproom`,
            num: 10, gl: 'uk',
          }),
        });
        const data = await response.json();
        for (const r of (data.organic || [])) {
          results.push({
            name: r.title?.replace(/ on Instagram.*$/, '').replace(/ \(@\w+\)/, '').trim(),
            description: r.snippet || '',
            link: r.link,
            instagram_url: r.link,
            county,
            category: `Venue Instagram (${term})`,
          });
        }
      } catch { /* continue */ }
    }

    return results;
  },

  // Deep scrape a single Instagram profile for contact & event data
  async analyzeProfile(profileUrl) {
    try {
      const data = await jinaAdapter.scrapeUrl(profileUrl);
      if (!data?.content) return null;
      const content = data.content;
      const contacts = jinaAdapter.extractContacts(content);

      // Extract structured fields
      const bioMatch = content.match(/(?:bio|description)[:\s]*([^\n]+)/i);
      const followersMatch = content.match(/([\d,.]+[KMkm]?)\s*(?:followers)/i);
      const linktreeMatch = content.match(/(linktr\.ee|linkin\.bio|bit\.ly|taplink)[^\s]*/i);

      // Event-related keywords in bio/content
      const eventKeywords = ['event', 'wedding', 'corporate', 'private hire', 'venue', 'function', 'reception', 'gala', 'dinner'];
      const hasEventSignals = eventKeywords.some(k => content.toLowerCase().includes(k));

      // Luxury indicators
      const luxuryKeywords = ['luxury', 'exclusive', 'bespoke', 'premium', 'five star', '5 star', 'michelin', 'award-winning'];
      const hasLuxurySignals = luxuryKeywords.some(k => content.toLowerCase().includes(k));

      return {
        bio: bioMatch?.[1]?.trim(),
        followers: followersMatch?.[1],
        linktree: linktreeMatch?.[0],
        emails: contacts.emails,
        phones: contacts.phones,
        hasEventSignals,
        hasLuxurySignals,
        market_tier: hasLuxurySignals ? 'luxury' : 'standard',
      };
    } catch { return null; }
  },
};

// ── 13. Advanced Lead Scoring ──
// Pattern from Apollo.io + ZoomInfo: multi-signal scoring model
// Combines: data completeness, engagement signals, fit signals, timing signals
const advancedLeadScorer = {
  // Fit signals — how well the lead matches ideal customer profile
  fitScore(lead) {
    let score = 0;
    // Category fit — prioritize venues that outsource bar services
    const topFitCategories = ['country house', 'manor', 'castle', 'estate', 'stately home', 'dry hire', 'blank canvas', 'marquee', 'barn venue'];
    const highFitCategories = ['wedding venue', 'event venue', 'hotel', 'private hire', 'luxury venue', 'conference', 'gallery', 'museum', 'members club', 'yacht club', 'polo club', 'golf club', 'racecourse'];
    const medFitCategories = ['restaurant', 'corporate venue', 'function room', 'banqueting', 'concierge'];
    const negativeFit = ['bar', 'pub', 'nightclub', 'brewery', 'taproom', 'cocktail bar', 'wine bar'];
    const cat = (lead.category || '').toLowerCase();
    if (negativeFit.some(c => cat.includes(c))) score -= 20; // Penalize bars — they don't outsource
    else if (topFitCategories.some(c => cat.includes(c))) score += 30;
    else if (highFitCategories.some(c => cat.includes(c))) score += 25;
    else if (medFitCategories.some(c => cat.includes(c))) score += 15;
    else score += 5;

    // Capacity fit
    if (lead.capacity >= 50 && lead.capacity <= 500) score += 20;
    else if (lead.capacity > 500) score += 10;
    else if (lead.capacity > 0) score += 5;

    // Location fit (distance from London)
    const dist = lead.distance_from_london_miles || 100;
    if (dist <= 30) score += 15;
    else if (dist <= 60) score += 10;
    else if (dist <= 100) score += 5;

    // Premium / outsource signals
    const desc = (lead.trigger_event || lead.description || '').toLowerCase();
    if (desc.includes('luxury') || desc.includes('premium') || desc.includes('exclusive') || desc.includes('bespoke')) score += 10;
    if (desc.includes('outside caterer') || desc.includes('dry hire') || desc.includes('approved supplier')) score += 15;
    if (desc.includes('concierge') || desc.includes('private client') || desc.includes('hnwi') || desc.includes('high net worth')) score += 15;
    if (lead.market_tier === 'luxury') score += 10;
    if (lead.outsource_indicator > 50) score += 10;

    return Math.min(score, 100);
  },

  // Data completeness — more data = higher quality lead
  completenessScore(lead) {
    let score = 0;
    if (lead.venue_name) score += 5;
    if (lead.contact_email) score += 15;
    if (lead.phone) score += 10;
    if (lead.website) score += 10;
    if (lead.capacity > 0) score += 5;
    if (lead.rating > 0) score += 5;
    if (lead.reviewCount > 10) score += 5;
    if (lead.trigger_event || lead.description) score += 5;
    if (lead.instagram_url || lead.facebook_url || lead.twitter_url) score += 5;
    return Math.min(score, 60);
  },

  // Engagement/intent signals — signs of buying readiness
  intentScore(lead) {
    let score = 0;
    const desc = (lead.trigger_event || lead.description || '').toLowerCase();

    // Active event hosting signals
    if (desc.includes('now booking') || desc.includes('enquire')) score += 15;
    if (desc.includes('new venue') || desc.includes('just opened') || desc.includes('grand opening')) score += 20;
    if (desc.includes('hiring') || desc.includes('looking for') || desc.includes('seeking')) score += 15;
    if (desc.includes('expand') || desc.includes('growing') || desc.includes('new')) score += 10;

    // Recency boost
    if (lead.scraped_at) {
      const daysAgo = (Date.now() - new Date(lead.scraped_at).getTime()) / 86400000;
      if (daysAgo <= 7) score += 10;
      else if (daysAgo <= 30) score += 5;
    }

    // Rating & review volume (popular = more events)
    if (lead.rating >= 4.5 && lead.reviewCount >= 50) score += 10;
    else if (lead.rating >= 4.0 && lead.reviewCount >= 20) score += 5;

    return Math.min(score, 60);
  },

  // Combined score with weighted components
  calculateScore(lead) {
    const fit = this.fitScore(lead);
    const completeness = this.completenessScore(lead);
    const intent = this.intentScore(lead);

    // Weighted: Fit 40%, Intent 35%, Completeness 25%
    const total = Math.round(fit * 0.4 + intent * 0.35 + completeness * 0.25);

    return {
      total: Math.min(total, 100),
      fit,
      completeness,
      intent,
      grade: total >= 80 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : 'D',
      recommendation: total >= 80 ? 'Hot — prioritize outreach'
        : total >= 60 ? 'Warm — schedule follow-up'
        : total >= 40 ? 'Cool — add to nurture sequence'
        : 'Cold — low priority, enrich first',
    };
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// SCRAPER ENGINE — Orchestrates all adapters with scheduling & dedup
// Pattern from Crawlee: RequestQueue + AutoscaledPool
// ══════════════════════════════════════════════════════════════════════════════

const SCRAPER_STATE_KEY = 'hht_scraper_state';
const SCRAPED_LEADS_KEY = 'hht_scraped_leads';

class ScraperEngine {
  constructor() {
    this.adapters = {
      'jina-reader': jinaAdapter,
      'companies-house': companiesHouseAdapter,
      'google-places': googlePlacesAdapter,
      'serper': serperAdapter,
      'instagram': instagramAdapter,
      'hunter': hunterAdapter,
      'google-reviews': googleReviewsAdapter,
      'eventbrite': eventbriteAdapter,
      'review-platforms': reviewPlatformAdapter,
      'facebook': facebookAdapter,
      'twitter': twitterAdapter,
      'venue-directories': venueDirectoryAdapter,
      'apollo': apolloAdapter,
      'linkedin': linkedinAdapter,
      'enhanced-google-places': enhancedGooglePlacesAdapter,
      'concierge-market': conciergeMarketAdapter,
      'email-verifier': emailVerifier,
      'outscraper': outscraperAdapter,
      'instagram-enhanced': instagramEnhancedAdapter,
    };
    this.leadScorer = advancedLeadScorer;

    this.state = this.loadState();
    this.isRunning = false;
    this.onProgress = null;
    this.onLeadFound = null;
    this.abortController = null;
  }

  loadState() {
    try {
      const saved = localStorage.getItem(SCRAPER_STATE_KEY);
      return saved ? JSON.parse(saved) : this.defaultState();
    } catch {
      return this.defaultState();
    }
  }

  defaultState() {
    return {
      lastRun: null,
      totalLeadsFound: 0,
      totalSearches: 0,
      completedCounties: [],
      completedSources: {},
      schedule: { intervalHours: 4, nextRun: null, enabled: false },
      apiKeys: {},
    };
  }

  saveState() {
    localStorage.setItem(SCRAPER_STATE_KEY, JSON.stringify(this.state));
  }

  // ── Get all scraped leads from storage ──
  getScrapedLeads() {
    try {
      return JSON.parse(localStorage.getItem(SCRAPED_LEADS_KEY)) || [];
    } catch {
      return [];
    }
  }

  saveScrapedLead(lead) {
    const leads = this.getScrapedLeads();
    // Dedup check
    const isDupe = leads.some(existing => {
      const existName = (existing.venue_name || '').toLowerCase();
      const newName = (lead.venue_name || '').toLowerCase();
      const existWeb = cleanUrl(existing.website || '');
      const newWeb = cleanUrl(lead.website || '');
      return (newName && existName === newName) || (newWeb && existWeb === newWeb);
    });

    if (!isDupe) {
      leads.push(lead);
      localStorage.setItem(SCRAPED_LEADS_KEY, JSON.stringify(leads));
      this.state.totalLeadsFound++;
      this.saveState();
      return true;
    }
    return false;
  }

  // ── Configure API keys ──
  setApiKeys(keys) {
    this.state.apiKeys = { ...this.state.apiKeys, ...keys };
    this.saveState();
  }

  // ── Schedule periodic scraping ──
  setSchedule(intervalHours, enabled) {
    this.state.schedule = {
      intervalHours,
      enabled,
      nextRun: enabled ? new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString() : null,
    };
    this.saveState();

    if (enabled) {
      this.startScheduler();
    }
  }

  startScheduler() {
    if (this._schedulerInterval) clearInterval(this._schedulerInterval);

    this._schedulerInterval = setInterval(() => {
      if (!this.state.schedule.enabled || this.isRunning) return;

      const nextRun = this.state.schedule.nextRun;
      if (nextRun && new Date(nextRun) <= new Date()) {
        this.runFullScan();
      }
    }, 60000); // Check every minute
  }

  stopScheduler() {
    if (this._schedulerInterval) {
      clearInterval(this._schedulerInterval);
      this._schedulerInterval = null;
    }
    this.state.schedule.enabled = false;
    this.saveState();
  }

  // ── Abort running scan ──
  abort() {
    this.abortController?.abort();
    this.isRunning = false;
  }

  // ── Run a full multi-source scan ──
  async runFullScan(options = {}) {
    if (this.isRunning) return { error: 'Already running' };

    this.isRunning = true;
    this.abortController = new AbortController();
    const results = { found: 0, searched: 0, errors: [], bySource: {} };

    const {
      counties = null,
      sources = null,
      searchTypes = ['event venue', 'wedding planner', 'corporate event', 'event catering', 'marquee hire'],
    } = options;

    const targetCounties = counties || Object.keys(googlePlacesAdapter.countyCoords);
    const targetSources = sources || this.getAvailableSources();

    const totalSteps = targetCounties.length * searchTypes.length * targetSources.length;
    let currentStep = 0;

    try {
      for (const county of targetCounties) {
        if (this.abortController.signal.aborted) break;

        for (const searchType of searchTypes) {
          if (this.abortController.signal.aborted) break;

          for (const sourceId of targetSources) {
            if (this.abortController.signal.aborted) break;
            currentStep++;
            const pct = Math.round((currentStep / totalSteps) * 100);

            this.onProgress?.({
              message: `[${pct}%] ${sourceId}: "${searchType}" in ${county}`,
              progress: pct,
              county,
              source: sourceId,
              found: results.found,
            });

            try {
              const leads = await this.searchSource(sourceId, searchType, county);
              results.searched++;
              results.bySource[sourceId] = (results.bySource[sourceId] || 0) + leads.length;

              for (const raw of leads) {
                const lead = normalizeToLead(raw, { id: sourceId, defaultCategory: searchType });
                lead.county = lead.county || county;
                if (this.saveScrapedLead(lead)) {
                  results.found++;
                  this.onLeadFound?.(lead);
                }
              }
            } catch (err) {
              results.errors.push({ source: sourceId, county, searchType, error: err.message });
            }
          }
        }
      }
    } finally {
      this.isRunning = false;
      this.state.lastRun = new Date().toISOString();
      if (this.state.schedule.enabled) {
        this.state.schedule.nextRun = new Date(
          Date.now() + this.state.schedule.intervalHours * 60 * 60 * 1000,
        ).toISOString();
      }
      this.saveState();
    }

    return results;
  }

  // ── Search a single source ──
  async searchSource(sourceId, searchType, county) {
    const keys = this.state.apiKeys;

    switch (sourceId) {
      case 'google-places':
        return googlePlacesAdapter.textSearch(`${searchType} ${county}`, county, keys.googlePlaces);

      case 'serper':
        const serperResults = await serperAdapter.searchPlaces(`${searchType} ${county} UK`, keys.serper);
        return serperResults;

      case 'companies-house': {
        const allResults = [];
        for (const sicCode of Object.keys(companiesHouseAdapter.sicCodes)) {
          const companies = await companiesHouseAdapter.search(sicCode, county, keys.companiesHouse);
          allResults.push(...companies);
        }
        return allResults;
      }

      case 'instagram':
        return instagramAdapter.findProfiles(searchType, county, keys.serper);

      case 'jina-reader':
        const jinaResults = await jinaAdapter.search(`${searchType} ${county} UK`);
        return jinaResults?.data ? [jinaResults.data] : [];

      default:
        return [];
    }
  }

  // ── Run Instagram-specific scan ──
  async runInstagramScan(options = {}) {
    if (this.isRunning) return { error: 'Already running' };
    if (!this.state.apiKeys.serper) return { error: 'Serper API key required for Instagram discovery' };

    this.isRunning = true;
    this.abortController = new AbortController();
    const results = { profiles: [], found: 0, searched: 0 };

    const counties = options.counties || Object.keys(googlePlacesAdapter.countyCoords);
    const searchTerms = [
      'wedding planner', 'event planner', 'mobile bar', 'cocktail bar',
      'event stylist', 'wedding venue', 'party planner', 'event catering',
      'luxury wedding', 'festival bar', 'popup bar', 'event design',
    ];

    const totalSteps = counties.length * searchTerms.length;
    let step = 0;

    try {
      for (const county of counties) {
        if (this.abortController.signal.aborted) break;

        for (const term of searchTerms) {
          if (this.abortController.signal.aborted) break;
          step++;
          const pct = Math.round((step / totalSteps) * 100);

          this.onProgress?.({
            message: `[${pct}%] Instagram: "${term}" in ${county}`,
            progress: pct,
            found: results.found,
          });

          try {
            const profiles = await instagramAdapter.findProfiles(term, county, this.state.apiKeys.serper);
            results.searched++;

            for (const profile of profiles) {
              const lead = normalizeToLead({
                name: profile.title?.replace(/ • Instagram.*$/, '').replace(/\(@.*\)/, '').trim(),
                description: profile.bio,
                website: '',
                city: '',
                county,
                category: term,
              }, { id: 'instagram', defaultCategory: 'Instagram Lead' });

              lead.instagram_url = profile.profileUrl;
              lead.instagram_username = profile.username;

              if (this.saveScrapedLead(lead)) {
                results.found++;
                results.profiles.push(profile);
                this.onLeadFound?.(lead);
              }
            }
          } catch (err) {
            // Continue on error
          }
        }
      }
    } finally {
      this.isRunning = false;
      this.state.lastRun = new Date().toISOString();
      this.saveState();
    }

    return results;
  }

  // ── Enrich existing leads with website scraping ──
  async enrichLeadsWithJina(leads) {
    const results = { enriched: 0, errors: 0 };

    for (const lead of leads) {
      if (!lead.website || lead.contact_email) continue;

      this.onProgress?.({
        message: `Scraping ${lead.venue_name || lead.website}...`,
        enriched: results.enriched,
      });

      try {
        const url = lead.website.startsWith('http') ? lead.website : `https://${lead.website}`;
        const data = await jinaAdapter.scrapeUrl(url);
        if (data?.content) {
          const contacts = jinaAdapter.extractContacts(data.content);
          if (contacts.emails.length > 0 || contacts.phones.length > 0) {
            results.enriched++;
            this.onLeadFound?.({
              ...lead,
              contact_email: contacts.emails[0] || lead.contact_email,
              phone: contacts.phones[0] || lead.phone,
            });
          }
        }
      } catch {
        results.errors++;
      }
    }

    return results;
  }

  // ── Get available sources based on configured API keys ──
  getAvailableSources() {
    const available = ['jina-reader'];
    const keys = this.state.apiKeys;
    if (keys.companiesHouse) available.push('companies-house');
    if (keys.googlePlaces) available.push('google-places', 'google-reviews', 'enhanced-google-places');
    if (keys.serper) available.push('serper', 'instagram', 'instagram-enhanced', 'eventbrite', 'review-platforms', 'facebook', 'twitter', 'venue-directories', 'concierge-market');
    if (keys.hunter) available.push('hunter');
    if (keys.apollo) available.push('apollo');
    if (keys.proxycurl) available.push('linkedin');
    if (keys.outscraper) available.push('outscraper');
    return available;
  }

  // ── Score a lead using the advanced scoring model ──
  scoreLeadAdvanced(lead) {
    return this.leadScorer.calculateScore(lead);
  }

  // ── Run Google Reviews enrichment on existing leads ──
  async enrichWithReviews(leads) {
    const results = { enriched: 0, errors: 0 };
    const apiKey = this.state.apiKeys.googlePlaces;
    if (!apiKey) return results;

    for (const lead of leads) {
      if (this.abortController?.signal.aborted) break;
      this.onProgress?.({ message: `Enriching reviews: ${lead.venue_name}...`, enriched: results.enriched });

      try {
        // Search for the place first
        const searchResults = await googlePlacesAdapter.textSearch(lead.venue_name, lead.county || 'London', apiKey);
        if (searchResults.length > 0) {
          const place = searchResults[0];
          if (place.id) {
            const details = await googleReviewsAdapter.getPlaceDetails(place.id, apiKey);
            if (details) {
              const analysis = googleReviewsAdapter.analyzeReviews(details.reviews || []);
              lead.google_event_score = analysis.eventScore;
              lead.google_event_signals = analysis.signals;
              lead.google_event_mentions = analysis.eventMentions;
              lead.rating = details.rating || lead.rating;
              lead.reviewCount = details.userRatingCount || lead.reviewCount;
              results.enriched++;
              this.onLeadFound?.(lead);
            }
          }
        }
      } catch {
        results.errors++;
      }
    }

    return results;
  }

  // ── Run multi-source discovery scan (new sources) ──
  async runExtendedScan(options = {}) {
    if (this.isRunning) throw new Error('Scan already running');
    this.isRunning = true;
    this.abortController = new AbortController();

    const counties = options.counties || ['London', 'Surrey', 'Kent'];
    const serperKey = this.state.apiKeys.serper;
    const results = { found: 0, sources: {} };

    const sources = [
      { id: 'eventbrite', fn: async (county) => eventbriteAdapter.search(county, serperKey) },
      { id: 'review-platforms', fn: async (county) => reviewPlatformAdapter.search(county, 'cocktail bar', serperKey) },
      { id: 'facebook', fn: async (county) => facebookAdapter.searchPages(county, serperKey) },
      { id: 'venue-directories', fn: async (county) => venueDirectoryAdapter.search(county, 'event venue', serperKey) },
    ];

    try {
      for (const county of counties) {
        if (this.abortController.signal.aborted) break;

        for (const source of sources) {
          if (this.abortController.signal.aborted) break;
          this.onProgress?.({ message: `[${source.id}] Scanning ${county}...`, found: results.found });

          try {
            const items = await source.fn(county);
            results.sources[source.id] = (results.sources[source.id] || 0) + items.length;

            for (const item of items) {
              const lead = normalizeToLead(item, { id: source.id, defaultCategory: item.category || 'Lead' });
              lead.county = county;
              if (item.facebook_url) lead.facebook_url = item.facebook_url;
              if (item.twitter_url) lead.twitter_url = item.twitter_url;
              if (item.directory_source) lead.directory_source = item.directory_source;

              // Apply advanced scoring
              const score = this.leadScorer.calculateScore(lead);
              lead.advanced_score = score.total;
              lead.score_grade = score.grade;
              lead.score_recommendation = score.recommendation;

              if (this.saveScrapedLead(lead)) {
                results.found++;
                this.onLeadFound?.(lead);
              }
            }
          } catch { /* continue */ }
        }
      }
    } finally {
      this.isRunning = false;
      this.state.lastRun = new Date().toISOString();
      this.saveState();
    }

    return results;
  }

  // ── Run concierge & luxury market scan ──
  async runConciergeScan(options = {}) {
    if (this.isRunning) throw new Error('Scan already running');
    this.isRunning = true;
    this.abortController = new AbortController();

    const counties = options.counties || ['London', 'Surrey', 'Kent', 'Oxfordshire', 'Berkshire', 'Buckinghamshire'];
    const serperKey = this.state.apiKeys.serper;
    const results = { found: 0, sources: {} };

    try {
      for (const county of counties) {
        if (this.abortController.signal.aborted) break;

        // Search all luxury verticals
        this.onProgress?.({ message: `Concierge scan: ${county} — all verticals...`, found: results.found });
        const verticalResults = await conciergeMarketAdapter.searchAllVerticals(county, serperKey);
        results.sources['concierge-verticals'] = (results.sources['concierge-verticals'] || 0) + verticalResults.length;

        for (const item of verticalResults) {
          const lead = normalizeToLead(item, { id: 'concierge-market', defaultCategory: item.category || 'Luxury Venue' });
          lead.county = county;
          lead.market_tier = 'luxury';
          lead.vertical = item.vertical;
          const score = this.leadScorer.calculateScore(lead);
          lead.advanced_score = score.total;
          lead.score_grade = score.grade;
          if (this.saveScrapedLead(lead)) { results.found++; this.onLeadFound?.(lead); }
        }

        // Search luxury directories
        this.onProgress?.({ message: `Luxury directories: ${county}...`, found: results.found });
        const dirResults = await conciergeMarketAdapter.searchLuxuryDirectories(county, serperKey);
        results.sources['luxury-directories'] = (results.sources['luxury-directories'] || 0) + dirResults.length;

        for (const item of dirResults) {
          const lead = normalizeToLead(item, { id: 'concierge-market', defaultCategory: item.category || 'Luxury Directory' });
          lead.county = county;
          lead.market_tier = 'luxury';
          if (this.saveScrapedLead(lead)) { results.found++; this.onLeadFound?.(lead); }
        }
      }
    } finally {
      this.isRunning = false;
      this.state.lastRun = new Date().toISOString();
      this.saveState();
    }

    return results;
  }

  // ── Run outsourcer venue scan — venues that hire outside bar providers ──
  async runOutsourcerScan(options = {}) {
    if (this.isRunning) throw new Error('Scan already running');
    this.isRunning = true;
    this.abortController = new AbortController();

    const counties = options.counties || Object.keys(googlePlacesAdapter.countyCoords);
    const googleKey = this.state.apiKeys.googlePlaces;
    const serperKey = this.state.apiKeys.serper;
    const results = { found: 0, sources: {} };

    try {
      for (const county of counties) {
        if (this.abortController.signal.aborted) break;

        // Enhanced Google Places — dry hire / blank canvas / outsourcer venues
        if (googleKey) {
          this.onProgress?.({ message: `Outsourcer venues: ${county} (Google Places)...`, found: results.found });
          const venues = await enhancedGooglePlacesAdapter.searchOutsourcerVenues(county, googleKey);
          results.sources['enhanced-google-places'] = (results.sources['enhanced-google-places'] || 0) + venues.length;

          for (const item of venues) {
            const lead = normalizeToLead(item, { id: 'enhanced-google-places', defaultCategory: item.category || 'Outsourcer Venue' });
            lead.county = county;
            lead.outsource_indicator = item.outsource_indicator;
            const score = this.leadScorer.calculateScore(lead);
            lead.advanced_score = score.total;
            lead.score_grade = score.grade;
            if (this.saveScrapedLead(lead)) { results.found++; this.onLeadFound?.(lead); }
          }
        }

        // Instagram enhanced — venue profiles (not bars)
        if (serperKey) {
          this.onProgress?.({ message: `Instagram venues: ${county}...`, found: results.found });
          const igResults = await instagramEnhancedAdapter.searchVenueProfiles(county, serperKey);
          results.sources['instagram-enhanced'] = (results.sources['instagram-enhanced'] || 0) + igResults.length;

          for (const item of igResults) {
            const lead = normalizeToLead(item, { id: 'instagram-enhanced', defaultCategory: item.category || 'Instagram Venue' });
            lead.county = county;
            lead.instagram_url = item.instagram_url;
            if (this.saveScrapedLead(lead)) { results.found++; this.onLeadFound?.(lead); }
          }
        }
      }
    } finally {
      this.isRunning = false;
      this.state.lastRun = new Date().toISOString();
      this.saveState();
    }

    return results;
  }

  // ── Verify emails for existing leads ──
  async verifyEmails(leads) {
    const apiKeys = this.state.apiKeys;
    return emailVerifier.verifyLeads(leads, apiKeys);
  }

  // ── Apollo enrichment for a batch of leads ──
  async enrichWithApollo(leads) {
    const results = { enriched: 0, errors: 0 };
    const apiKey = this.state.apiKeys.apollo;
    if (!apiKey) return results;

    for (const lead of leads) {
      if (this.abortController?.signal.aborted) break;
      if (!lead.website) continue;

      this.onProgress?.({ message: `Apollo enriching: ${lead.venue_name}...`, enriched: results.enriched });

      try {
        const domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        const data = await apolloAdapter.enrichCompany(domain, apiKey);
        if (data.organization) {
          lead.company_size = data.organization.estimated_num_employees;
          lead.company_industry = data.organization.industry;
          lead.company_revenue = data.organization.annual_revenue_printed;
          lead.company_linkedin = data.organization.linkedin_url;
          lead.company_technologies = (data.organization.current_technologies || []).slice(0, 5);
          results.enriched++;
          this.onLeadFound?.(lead);
        }
      } catch {
        results.errors++;
      }
    }

    return results;
  }

  // ── Get adapter info for UI ──
  getAdapterInfo() {
    return Object.values(this.adapters).map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      freeLimit: a.freeLimit,
      technique: a.technique,
      configured: this.isAdapterConfigured(a.id),
    }));
  }

  isAdapterConfigured(adapterId) {
    const keys = this.state.apiKeys;
    switch (adapterId) {
      case 'jina-reader': return true;
      case 'companies-house': return !!keys.companiesHouse;
      case 'google-places': return !!keys.googlePlaces;
      case 'enhanced-google-places': return !!keys.googlePlaces;
      case 'google-reviews': return !!keys.googlePlaces;
      case 'serper': return !!keys.serper;
      case 'instagram': return !!keys.serper;
      case 'instagram-enhanced': return !!keys.serper;
      case 'eventbrite': return !!keys.serper;
      case 'review-platforms': return !!keys.serper;
      case 'facebook': return !!keys.serper;
      case 'twitter': return !!keys.serper;
      case 'venue-directories': return !!keys.serper;
      case 'concierge-market': return !!keys.serper;
      case 'hunter': return !!keys.hunter;
      case 'apollo': return !!keys.apollo;
      case 'linkedin': return !!keys.proxycurl;
      case 'email-verifier': return !!keys.hunter || !!keys.zeroBounce;
      case 'outscraper': return !!keys.outscraper;
      default: return false;
    }
  }
}

// Singleton instance
const scraperEngine = new ScraperEngine();

export {
  scraperEngine,
  ScraperEngine,
  jinaAdapter,
  companiesHouseAdapter,
  googlePlacesAdapter,
  serperAdapter,
  instagramAdapter,
  hunterAdapter,
  googleReviewsAdapter,
  eventbriteAdapter,
  reviewPlatformAdapter,
  facebookAdapter,
  twitterAdapter,
  venueDirectoryAdapter,
  advancedLeadScorer,
  apolloAdapter,
  linkedinAdapter,
  enhancedGooglePlacesAdapter,
  conciergeMarketAdapter,
  emailVerifier,
  outscraperAdapter,
  instagramEnhancedAdapter,
  normalizeToLead,
  RateLimiter,
};

export default scraperEngine;
