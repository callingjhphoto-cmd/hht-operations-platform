// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HHT CRM — Local Data Store with localStorage persistence
// Supabase upgrade path: replace localStorage calls with Supabase client calls
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STORAGE_KEYS = {
  leads: 'hht_leads',
  activities: 'hht_activities',
  initialized: 'hht_initialized_v3',
};

// ── UUID generator ──
const uuid = () => crypto.randomUUID ? crypto.randomUUID() :
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

// ── Load / Save helpers ──
const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ── Lead Stages ──
export const LEAD_STAGES = [
  "Identified", "Researched", "Contacted", "Responded",
  "Qualified", "Meeting Booked", "Won", "Lost"
];

// ── Lead Scoring Algorithm ──
// Real scoring based on: capacity fit, activity recency, venue type, stage progression
export function calculateScore(lead, activities = []) {
  let score = 40; // base

  // Capacity fit (0-20): HHT sweet spot is 50-300 pax
  const cap = lead.capacity || 0;
  if (cap >= 50 && cap <= 300) score += 20;
  else if (cap >= 30 && cap <= 500) score += 12;
  else if (cap > 0) score += 5;

  // Activity recency (0-20): Recent interactions = higher score
  const leadActivities = activities.filter(a => a.leadId === lead.id);
  if (leadActivities.length > 0) {
    const latest = Math.max(...leadActivities.map(a => new Date(a.createdAt).getTime()));
    const daysSince = (Date.now() - latest) / (1000 * 60 * 60 * 24);
    if (daysSince <= 3) score += 20;
    else if (daysSince <= 7) score += 16;
    else if (daysSince <= 14) score += 12;
    else if (daysSince <= 30) score += 6;
    else score += 2;
  }

  // Venue type match (0-10): Event-only venues score higher
  const eventCategories = ['Wedding Venue', 'Event Hall', 'Function Room', 'Conference Centre', 'Banqueting Hall'];
  const cat = (lead.category || '').toLowerCase();
  if (eventCategories.some(c => cat.includes(c.toLowerCase()))) score += 10;
  else if (cat.includes('event') || cat.includes('private hire') || cat.includes('function')) score += 7;
  else if (cat.includes('bar') || cat.includes('restaurant')) score += 3;

  // Stage progression (0-10): Further along = higher score
  const stageIdx = LEAD_STAGES.indexOf(lead.stage);
  if (stageIdx >= 5) score += 10;      // Meeting Booked+
  else if (stageIdx >= 3) score += 7;   // Responded+
  else if (stageIdx >= 1) score += 3;   // Researched+

  return Math.min(100, Math.max(0, score));
}

// ── Priority from score ──
export function getPriority(score) {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

// ── Initialize store with seed data ──
export function initializeStore(seedLeads) {
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return false;

  const leads = seedLeads.map((raw, i) => ({
    id: uuid(),
    name: raw.n,
    location: raw.l,
    city: raw.co,
    category: raw.cat,
    capacity: raw.cap,
    notes: raw.note || '',
    stage: 'Identified',
    assignedTo: null,
    estimatedValue: null,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    source: 'Seed Data',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  save(STORAGE_KEYS.leads, leads);
  save(STORAGE_KEYS.activities, []);
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  return true;
}

// ── CRUD Operations ──

// LEADS
export function getLeads() {
  return load(STORAGE_KEYS.leads);
}

export function getLead(id) {
  return getLeads().find(l => l.id === id) || null;
}

export function createLead(data) {
  const leads = getLeads();
  const lead = {
    id: uuid(),
    name: data.name || '',
    location: data.location || '',
    city: data.city || '',
    category: data.category || '',
    capacity: data.capacity || 0,
    notes: data.notes || '',
    stage: data.stage || 'Identified',
    assignedTo: data.assignedTo || null,
    estimatedValue: data.estimatedValue || null,
    contactName: data.contactName || '',
    contactEmail: data.contactEmail || '',
    contactPhone: data.contactPhone || '',
    website: data.website || '',
    source: data.source || 'Manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.unshift(lead);
  save(STORAGE_KEYS.leads, leads);

  // Log creation activity
  logActivity(lead.id, 'created', `Lead created from ${lead.source}`);

  return lead;
}

export function updateLead(id, updates) {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;

  const old = leads[idx];
  const updated = { ...old, ...updates, updatedAt: new Date().toISOString() };
  leads[idx] = updated;
  save(STORAGE_KEYS.leads, leads);

  // Log stage change
  if (updates.stage && updates.stage !== old.stage) {
    logActivity(id, 'stage_change', `Stage changed: ${old.stage} → ${updates.stage}`, { oldStage: old.stage, newStage: updates.stage });
  }

  return updated;
}

export function deleteLead(id) {
  const leads = getLeads().filter(l => l.id !== id);
  save(STORAGE_KEYS.leads, leads);
  return true;
}

export function bulkCreateLeads(dataArray) {
  const leads = getLeads();
  const newLeads = dataArray.map(data => ({
    id: uuid(),
    name: data.name || data.n || '',
    location: data.location || data.l || '',
    city: data.city || data.co || '',
    category: data.category || data.cat || '',
    capacity: parseInt(data.capacity || data.cap) || 0,
    notes: data.notes || data.note || '',
    stage: data.stage || 'Identified',
    assignedTo: null,
    estimatedValue: null,
    contactName: data.contactName || data.contact_name || '',
    contactEmail: data.contactEmail || data.contact_email || '',
    contactPhone: data.contactPhone || data.contact_phone || '',
    website: data.website || '',
    source: data.source || 'CSV Import',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const all = [...newLeads, ...leads];
  save(STORAGE_KEYS.leads, all);
  return newLeads;
}

// ACTIVITIES
export function getActivities(leadId = null) {
  const all = load(STORAGE_KEYS.activities);
  return leadId ? all.filter(a => a.leadId === leadId) : all;
}

export function logActivity(leadId, type, description, meta = {}) {
  const activities = load(STORAGE_KEYS.activities);
  const activity = {
    id: uuid(),
    leadId,
    type, // 'note', 'call', 'email', 'meeting', 'stage_change', 'created'
    description,
    meta,
    createdAt: new Date().toISOString(),
    userName: 'You', // Will be replaced by auth user
  };
  activities.unshift(activity);
  save(STORAGE_KEYS.activities, activities);
  return activity;
}

// ── Stats ──
export function getLeadStats() {
  const leads = getLeads();
  const activities = getActivities();
  const stageCounts = {};
  LEAD_STAGES.forEach(s => stageCounts[s] = 0);
  leads.forEach(l => { if (stageCounts[l.stage] !== undefined) stageCounts[l.stage]++; });

  const withScores = leads.map(l => ({ ...l, score: calculateScore(l, activities) }));
  const activeLeads = withScores.filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
  const totalValue = activeLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0);
  const avgScore = activeLeads.length > 0
    ? Math.round(activeLeads.reduce((s, l) => s + l.score, 0) / activeLeads.length)
    : 0;

  return {
    total: leads.length,
    stageCounts,
    activeLeads: activeLeads.length,
    totalPipelineValue: totalValue,
    avgScore,
    recentActivities: activities.slice(0, 20),
    wonCount: stageCounts['Won'] || 0,
    lostCount: stageCounts['Lost'] || 0,
  };
}

// ── Export for Supabase migration ──
export function exportAllData() {
  return {
    leads: getLeads(),
    activities: getActivities(),
    exportedAt: new Date().toISOString(),
  };
}

// ── Reset (for development) ──
export function resetStore() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}
