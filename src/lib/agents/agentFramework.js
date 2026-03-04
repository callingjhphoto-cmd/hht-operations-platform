// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HHT Agent Framework — Specialized Agent Registry & Execution Engine
// Each agent has a specialty, can analyze leads, and produce actionable results
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const uuid = () => crypto.randomUUID ? crypto.randomUUID() :
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

// ── Agent Status Constants ──
export const AGENT_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error',
};

// ── Agent Registry ──
const agentRegistry = new Map();

export function registerAgent(agent) {
  if (!agent.id || !agent.name || !agent.specialty || !agent.execute) {
    throw new Error(`Agent must have id, name, specialty, and execute function`);
  }
  agentRegistry.set(agent.id, agent);
}

export function getAgent(id) {
  return agentRegistry.get(id) || null;
}

export function getAllAgents() {
  return Array.from(agentRegistry.values());
}

// ── Task Execution Engine ──
// Runs an agent against a lead or set of leads, tracks progress via callbacks
export async function runAgent(agentId, { leads, targetLeadId, onProgress, onComplete, onError }) {
  const agent = getAgent(agentId);
  if (!agent) {
    onError?.({ message: `Agent "${agentId}" not found` });
    return null;
  }

  const task = {
    id: uuid(),
    agentId,
    agentName: agent.name,
    status: AGENT_STATUS.RUNNING,
    targetLeadId: targetLeadId || null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    results: null,
    error: null,
  };

  onProgress?.({ ...task, message: `${agent.name} is starting...` });

  try {
    const results = await agent.execute({
      leads: targetLeadId ? leads.filter(l => l.id === targetLeadId) : leads,
      allLeads: leads,
      onProgress: (msg) => onProgress?.({ ...task, message: msg }),
    });

    task.status = AGENT_STATUS.COMPLETED;
    task.completedAt = new Date().toISOString();
    task.results = results;
    onComplete?.(task);
    return task;
  } catch (err) {
    task.status = AGENT_STATUS.ERROR;
    task.completedAt = new Date().toISOString();
    task.error = err.message;
    onError?.(task);
    return task;
  }
}

// ── Task History (localStorage-backed) ──
const TASK_HISTORY_KEY = 'hht_agent_tasks';

export function getTaskHistory() {
  try { return JSON.parse(localStorage.getItem(TASK_HISTORY_KEY)) || []; }
  catch { return []; }
}

export function saveTask(task) {
  const history = getTaskHistory();
  const idx = history.findIndex(t => t.id === task.id);
  if (idx >= 0) history[idx] = task;
  else history.unshift(task);
  // Keep last 100 tasks
  localStorage.setItem(TASK_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

export function clearTaskHistory() {
  localStorage.removeItem(TASK_HISTORY_KEY);
}
