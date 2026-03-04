// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lead Enrichment Agent — Analyzes venues, fills data gaps, enhances scoring
// Specialty: Venue research, contact discovery, deal value estimation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { registerAgent } from './agentFramework.js';

// ── Enrichment Analysis Engine ──

// Estimate deal value based on venue attributes
function estimateDealValue(lead) {
  const cap = lead.capacity || 0;
  const cat = (lead.category || '').toLowerCase();
  const dist = lead.distance_from_london_miles || 0;

  let baseValue = 0;

  // Base value from capacity tiers
  if (cap >= 500) baseValue = 8000;
  else if (cap >= 300) baseValue = 5500;
  else if (cap >= 150) baseValue = 3500;
  else if (cap >= 80) baseValue = 2200;
  else if (cap >= 30) baseValue = 1500;
  else baseValue = 800;

  // Category multipliers — premium venues command higher packages
  if (cat.includes('castle')) baseValue *= 1.6;
  else if (cat.includes('estate') || cat.includes('country')) baseValue *= 1.4;
  else if (cat.includes('historic') || cat.includes('livery')) baseValue *= 1.5;
  else if (cat.includes('museum') || cat.includes('gallery')) baseValue *= 1.3;
  else if (cat.includes('wedding') || cat.includes('barn')) baseValue *= 1.2;
  else if (cat.includes('event')) baseValue *= 1.1;

  // Proximity bonus — London venues have higher event density
  if (dist <= 10) baseValue *= 1.3;
  else if (dist <= 30) baseValue *= 1.15;
  else if (dist > 80) baseValue *= 0.85;

  return Math.round(baseValue / 50) * 50; // Round to nearest £50
}

// Identify what data is missing for a lead
function analyzeDataGaps(lead) {
  const gaps = [];
  if (!lead.contactName && !lead.contact_name) gaps.push({ field: 'contactName', label: 'Contact Name', priority: 'high', suggestion: `Search for "${lead.venue_name || lead.name}" events manager or wedding coordinator on LinkedIn` });
  if (!lead.contactEmail && !lead.contact_email) gaps.push({ field: 'contactEmail', label: 'Contact Email', priority: 'high', suggestion: `Check ${lead.website || 'venue website'} for events@ or enquiries@ email addresses` });
  if (!lead.contactPhone && !lead.contact_phone && !lead.phone) gaps.push({ field: 'contactPhone', label: 'Phone Number', priority: 'medium', suggestion: `Find on Google Maps listing or website contact page` });
  if (!lead.website) gaps.push({ field: 'website', label: 'Website', priority: 'medium', suggestion: `Google "${lead.venue_name || lead.name} ${lead.city || lead.location || ''} venue"` });
  if (!lead.capacity || lead.capacity === 0) gaps.push({ field: 'capacity', label: 'Capacity', priority: 'medium', suggestion: `Check venue website or Google listing for max capacity info` });
  if (!lead.notes && !lead.trigger_event) gaps.push({ field: 'notes', label: 'Trigger Event / Notes', priority: 'low', suggestion: `Research recent events, refurbishments, or seasonal offerings` });
  if (!lead.estimatedValue && !lead.est_value) gaps.push({ field: 'estimatedValue', label: 'Estimated Deal Value', priority: 'low', suggestion: 'Can be auto-estimated from venue attributes' });
  return gaps;
}

// Generate venue-type tags for better classification
function generateTags(lead) {
  const tags = [];
  const cat = (lead.category || '').toLowerCase();
  const name = (lead.venue_name || lead.name || '').toLowerCase();
  const notes = (lead.trigger_event || lead.notes || '').toLowerCase();

  // Venue type tags
  if (cat.includes('wedding') || cat.includes('barn')) tags.push('Weddings');
  if (cat.includes('castle') || cat.includes('historic') || cat.includes('livery')) tags.push('Heritage');
  if (cat.includes('estate') || cat.includes('country')) tags.push('Country');
  if (cat.includes('event') || cat.includes('conference')) tags.push('Corporate');
  if (cat.includes('museum') || cat.includes('gallery')) tags.push('Cultural');

  // Capacity-based tags
  const cap = lead.capacity || 0;
  if (cap >= 500) tags.push('Large Scale');
  else if (cap >= 150) tags.push('Mid-Size');
  else if (cap > 0 && cap < 80) tags.push('Intimate');

  // Opportunity tags from notes
  if (notes.includes('exclusive')) tags.push('Exclusive Hire');
  if (notes.includes('brand') || notes.includes('activation')) tags.push('Brand Activation');
  if (notes.includes('gala') || notes.includes('dinner')) tags.push('Gala Dinners');
  if (notes.includes('masterclass')) tags.push('Masterclasses');
  if (notes.includes('launch') || notes.includes('product')) tags.push('Product Launches');
  if (notes.includes('garden') || notes.includes('outdoor')) tags.push('Outdoor Events');
  if (notes.includes('immersive') || notes.includes('experience')) tags.push('Immersive');

  // Distance-based tags
  const dist = lead.distance_from_london_miles || 0;
  if (dist <= 5) tags.push('Central London');
  else if (dist <= 20) tags.push('Greater London');
  else if (dist <= 50) tags.push('Home Counties');

  // Website-based tag
  if (name.includes('palace') || name.includes('castle') || name.includes('hall')) tags.push('Prestige');

  return [...new Set(tags)]; // Deduplicate
}

// Generate a research brief for a venue
function generateResearchBrief(lead) {
  const venueName = lead.venue_name || lead.name || 'Unknown venue';
  const location = lead.city || lead.location || '';
  const category = lead.category || '';
  const capacity = lead.capacity || 'Unknown';
  const website = lead.website || '';

  const brief = {
    summary: `${venueName} — ${category} in ${location}`,
    keyActions: [],
    searchQueries: [],
    contactStrategy: '',
  };

  // Prioritized key actions
  const gaps = analyzeDataGaps(lead);
  const highPriority = gaps.filter(g => g.priority === 'high');
  const medPriority = gaps.filter(g => g.priority === 'medium');

  if (highPriority.length > 0) {
    brief.keyActions.push(`Priority: Fill ${highPriority.length} critical data gap${highPriority.length > 1 ? 's' : ''} (${highPriority.map(g => g.label).join(', ')})`);
  }
  if (medPriority.length > 0) {
    brief.keyActions.push(`Secondary: Complete ${medPriority.length} additional field${medPriority.length > 1 ? 's' : ''}`);
  }

  // Search queries for manual research
  brief.searchQueries = [
    `"${venueName}" events contact email`,
    `"${venueName}" ${location} wedding coordinator`,
    `site:linkedin.com "${venueName}" events manager`,
  ];
  if (website) {
    brief.searchQueries.push(`site:${website} contact events enquiries`);
  }

  // Contact strategy
  if (category.toLowerCase().includes('wedding') || category.toLowerCase().includes('barn')) {
    brief.contactStrategy = `Wedding venues respond best to partnership proposals. Lead with "complementary service" positioning — HHT enhances their existing package without competing with in-house catering. Best contact: Wedding Coordinator or Events Manager.`;
  } else if (category.toLowerCase().includes('castle') || category.toLowerCase().includes('historic') || category.toLowerCase().includes('livery')) {
    brief.contactStrategy = `Heritage venues value prestige and brand alignment. Emphasise HHT's premium positioning and experience with comparable venues. Best contact: Events Director or Commercial Manager.`;
  } else if (category.toLowerCase().includes('museum') || category.toLowerCase().includes('gallery')) {
    brief.contactStrategy = `Cultural venues often have exclusive catering partners. Position as a "complementary experience" rather than F&B replacement. Best contact: Venue Hire Manager or Commercial Events team.`;
  } else if (category.toLowerCase().includes('event') || category.toLowerCase().includes('conference')) {
    brief.contactStrategy = `Corporate event spaces value reliability and professional service. Lead with client testimonials and case studies. Best contact: Sales Manager or Head of Events.`;
  } else {
    brief.contactStrategy = `Research the venue's current events offering before reaching out. Position HHT as adding value to their existing programme. Contact the Events team directly.`;
  }

  return brief;
}

// Enhanced scoring that considers data completeness
function calculateEnrichedScore(lead) {
  let score = 40;

  // Capacity fit (0-20): HHT sweet spot is 50–300
  const cap = lead.capacity || 0;
  if (cap >= 50 && cap <= 300) score += 20;
  else if (cap >= 30 && cap <= 500) score += 12;
  else if (cap > 500) score += 5;
  else if (cap > 0) score += 3;

  // Venue category match (0-15)
  const cat = (lead.category || '').toLowerCase();
  if (cat.includes('wedding') || cat.includes('barn') || cat.includes('estate')) score += 15;
  else if (cat.includes('castle') || cat.includes('historic') || cat.includes('livery')) score += 13;
  else if (cat.includes('event') || cat.includes('conference')) score += 10;
  else if (cat.includes('museum') || cat.includes('gallery')) score += 8;
  else score += 4;

  // Proximity to London (0-15)
  const dist = lead.distance_from_london_miles || 999;
  if (dist <= 15) score += 15;
  else if (dist <= 40) score += 12;
  else if (dist <= 70) score += 8;
  else if (dist <= 100) score += 4;
  else score += 2;

  // Data completeness bonus (0-10)
  const gaps = analyzeDataGaps(lead);
  const completeness = Math.max(0, 7 - gaps.length);
  score += Math.round(completeness * (10 / 7));

  // Trigger event quality (0-10)
  const notes = lead.trigger_event || lead.notes || '';
  if (notes.length > 80) score += 10;
  else if (notes.length > 40) score += 6;
  else if (notes.length > 0) score += 3;

  return Math.min(100, Math.max(0, score));
}

// Identify best outreach window based on venue type
function suggestOutreachTiming(lead) {
  const cat = (lead.category || '').toLowerCase();

  if (cat.includes('wedding') || cat.includes('barn')) {
    return { bestMonths: 'September–November', reason: 'Wedding venues plan next season in autumn. Couples book cocktail services 6-12 months ahead.' };
  }
  if (cat.includes('castle') || cat.includes('estate') || cat.includes('historic')) {
    return { bestMonths: 'January–March', reason: 'Heritage venues set annual events calendars in Q1. Get in early for summer season.' };
  }
  if (cat.includes('conference') || cat.includes('event')) {
    return { bestMonths: 'July–September', reason: 'Corporate venues plan Q4 events (Christmas parties, year-end galas) in late summer.' };
  }
  if (cat.includes('museum') || cat.includes('gallery')) {
    return { bestMonths: 'March–May', reason: 'Cultural venues plan summer exhibition launches and late openings in spring.' };
  }
  return { bestMonths: 'Year-round', reason: 'No strong seasonal pattern — reach out when data is complete.' };
}

// ── Main Agent Execution ──

const leadEnrichmentAgent = {
  id: 'lead-enrichment',
  name: 'Lead Enrichment Agent',
  specialty: 'Venue research, data gap analysis, contact discovery, deal value estimation',
  description: 'Analyzes venue leads to identify missing data, estimate deal values, generate research briefs, and enhance lead scoring. Provides actionable next steps for each lead.',
  icon: '🔍',
  color: '#2A6680',

  async execute({ leads, allLeads, onProgress }) {
    const results = {
      enrichedLeads: [],
      summary: { totalAnalyzed: 0, gapsFound: 0, valuesEstimated: 0, tagsGenerated: 0 },
    };

    const total = leads.length;

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      onProgress?.(`Analyzing ${lead.venue_name || lead.name || 'lead'} (${i + 1}/${total})...`);

      // Simulate async processing
      await new Promise(r => setTimeout(r, 80 + Math.random() * 120));

      const gaps = analyzeDataGaps(lead);
      const tags = generateTags(lead);
      const brief = generateResearchBrief(lead);
      const enrichedScore = calculateEnrichedScore(lead);
      const estimatedValue = estimateDealValue(lead);
      const outreachTiming = suggestOutreachTiming(lead);

      results.enrichedLeads.push({
        leadId: lead.id,
        leadName: lead.venue_name || lead.name,
        location: lead.city || lead.location,
        category: lead.category,
        originalScore: lead.score || 0,
        enrichedScore,
        estimatedValue,
        gaps,
        tags,
        brief,
        outreachTiming,
        dataCompleteness: Math.round(((7 - gaps.length) / 7) * 100),
      });

      results.summary.totalAnalyzed++;
      results.summary.gapsFound += gaps.length;
      if (!lead.estimatedValue && !lead.est_value) results.summary.valuesEstimated++;
      results.summary.tagsGenerated += tags.length;
    }

    onProgress?.(`Enrichment complete — ${results.summary.totalAnalyzed} leads analyzed`);
    return results;
  },
};

// Register the agent
registerAgent(leadEnrichmentAgent);

export default leadEnrichmentAgent;
