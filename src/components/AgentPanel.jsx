import { useState, useEffect, useCallback } from "react";
import { getAllAgents, runAgent, AGENT_STATUS, getTaskHistory, saveTask } from "../lib/agents/agentFramework";
import "../lib/agents/leadEnrichmentAgent";

// ── Theme (matches LeadEngine) ──
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
  if (variant === "success") return { ...base, background: C.success, color: "#fff" };
  return base;
};
const pillStyle = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: F.sans, background: bg, color, letterSpacing: 0.3 });

// ── Priority pill colors ──
const priorityColors = {
  high: { bg: "#FDF2F2", color: "#9B3535" },
  medium: { bg: "#FFF9F0", color: "#956018" },
  low: { bg: "#F0F7FA", color: "#2A6680" },
};

// ══════════════════════════════════════════════════════════════════════════════
// AGENT PANEL — Run specialized agents, view results, apply enrichments
// ══════════════════════════════════════════════════════════════════════════════

export default function AgentPanel({ leads, onUpdateLead, onBack }) {
  const [agents] = useState(() => getAllAgents());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [expandedLead, setExpandedLead] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [taskHistory, setTaskHistory] = useState(() => getTaskHistory());
  const [scope, setScope] = useState('all'); // 'all' | 'top20' | 'gaps'

  const handleRun = useCallback(async () => {
    if (!selectedAgent || running) return;

    let targetLeads = leads;
    if (scope === 'top20') {
      targetLeads = [...leads].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 20);
    } else if (scope === 'gaps') {
      targetLeads = leads.filter(l =>
        (!l.contactName && !l.contact_name) ||
        (!l.contactEmail && !l.contact_email) ||
        (!l.website)
      );
    }

    setRunning(true);
    setResults(null);
    setExpandedLead(null);
    setAppliedIds(new Set());

    const task = await runAgent(selectedAgent.id, {
      leads: targetLeads,
      onProgress: (info) => setProgress(info.message || ''),
      onComplete: (completedTask) => {
        setResults(completedTask.results);
        setRunning(false);
        setProgress('');
        saveTask(completedTask);
        setTaskHistory(getTaskHistory());
      },
      onError: (failedTask) => {
        setRunning(false);
        setProgress(`Error: ${failedTask.error}`);
        saveTask(failedTask);
        setTaskHistory(getTaskHistory());
      },
    });
  }, [selectedAgent, running, leads, scope]);

  const handleApplyEnrichment = useCallback((enriched) => {
    if (!onUpdateLead) return;

    const updates = {};
    if (enriched.estimatedValue) updates.est_value = enriched.estimatedValue;
    if (enriched.tags?.length) updates.tags = enriched.tags;
    if (enriched.enrichedScore) updates.score = enriched.enrichedScore;

    onUpdateLead(enriched.leadId, updates);
    setAppliedIds(prev => new Set([...prev, enriched.leadId]));
  }, [onUpdateLead]);

  const handleApplyAll = useCallback(() => {
    if (!results?.enrichedLeads || !onUpdateLead) return;
    results.enrichedLeads.forEach(e => {
      if (!appliedIds.has(e.leadId)) {
        handleApplyEnrichment(e);
      }
    });
  }, [results, onUpdateLead, appliedIds, handleApplyEnrichment]);

  return (
    <div style={{ fontFamily: F.sans }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onBack && <button onClick={onBack} style={btnStyle("ghost")}>&#8592;</button>}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, fontFamily: F.serif }}>Agent Hub</h2>
          </div>
          <p style={{ color: C.inkMuted, fontSize: 13, margin: "4px 0 0" }}>
            Specialized agents that analyze and enrich your lead data
          </p>
        </div>
      </div>

      {/* Agent Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 24 }}>
        {agents.map(agent => {
          const isSelected = selectedAgent?.id === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => { setSelectedAgent(isSelected ? null : agent); setResults(null); }}
              style={{
                ...cardStyle(),
                cursor: "pointer",
                borderColor: isSelected ? agent.color || C.accent : C.border,
                boxShadow: isSelected ? `0 0 0 2px ${(agent.color || C.accent)}20` : "none",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, background: `${agent.color || C.accent}12`,
                }}>
                  {agent.icon || '🤖'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, fontFamily: F.serif }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted }}>{agent.specialty.split(',')[0]}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.5, margin: 0 }}>{agent.description}</p>
            </div>
          );
        })}

        {/* Placeholder for future agents */}
        <div style={{ ...cardStyle(), opacity: 0.5, border: `2px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
          <div style={{ fontSize: 28, marginBottom: 6, opacity: 0.4 }}>+</div>
          <div style={{ fontSize: 13, color: C.inkMuted, fontWeight: 600 }}>More agents coming soon</div>
          <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>Pipeline Coach, Sales Outreach, Data Analyst</div>
        </div>
      </div>

      {/* Run Controls */}
      {selectedAgent && (
        <div style={{ ...cardStyle({ marginBottom: 24, background: C.bgWarm }) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif }}>
                Run {selectedAgent.name}
              </div>
              <div style={{ fontSize: 12, color: C.inkSec, marginTop: 2 }}>
                {scope === 'all' && `Analyze all ${leads.length} leads`}
                {scope === 'top20' && `Analyze top 20 leads by score`}
                {scope === 'gaps' && `Analyze leads with missing data`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", background: C.card, borderRadius: 6, padding: 2, border: `1px solid ${C.border}` }}>
                {[
                  { id: 'all', label: 'All Leads' },
                  { id: 'top20', label: 'Top 20' },
                  { id: 'gaps', label: 'Missing Data' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setScope(s.id)}
                    style={{
                      padding: "5px 12px", borderRadius: 4, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, fontFamily: F.sans,
                      background: scope === s.id ? C.ink : "transparent",
                      color: scope === s.id ? "#fff" : C.inkMuted,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                style={{
                  ...btnStyle("accent"),
                  opacity: running ? 0.6 : 1,
                  cursor: running ? "wait" : "pointer",
                }}
              >
                {running ? 'Running...' : 'Run Agent'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {running && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: C.inkSec, marginBottom: 6 }}>{progress}</div>
              <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: selectedAgent.color || C.accent, borderRadius: 2,
                  animation: "pulse 1.5s ease-in-out infinite", width: "60%",
                }} />
              </div>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; width: 30%; } 50% { opacity: 1; width: 80%; } }`}</style>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && results.enrichedLeads && (
        <div>
          {/* Summary Bar */}
          <div style={{ ...cardStyle({ marginBottom: 20 }), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Leads Analyzed</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F.serif }}>{results.summary.totalAnalyzed}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Data Gaps Found</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F.serif, color: C.warn }}>{results.summary.gapsFound}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Values Estimated</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F.serif, color: C.success }}>{results.summary.valuesEstimated}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Tags Generated</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F.serif, color: C.info }}>{results.summary.tagsGenerated}</div>
              </div>
            </div>
            <button onClick={handleApplyAll} style={btnStyle("success")} disabled={appliedIds.size === results.enrichedLeads.length}>
              {appliedIds.size === results.enrichedLeads.length ? 'All Applied' : `Apply All (${results.enrichedLeads.length - appliedIds.size})`}
            </button>
          </div>

          {/* Enriched Lead Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.enrichedLeads.map((enriched) => {
              const isExpanded = expandedLead === enriched.leadId;
              const isApplied = appliedIds.has(enriched.leadId);

              return (
                <div key={enriched.leadId} style={cardStyle({ padding: 0, overflow: "hidden" })}>
                  {/* Collapsed row */}
                  <div
                    onClick={() => setExpandedLead(isExpanded ? null : enriched.leadId)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "14px 20px", cursor: "pointer",
                      background: isApplied ? C.successBg : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: enriched.dataCompleteness >= 80 ? C.success :
                                    enriched.dataCompleteness >= 50 ? C.warn : C.danger,
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, fontFamily: F.serif, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {enriched.leadName}
                        </div>
                        <div style={{ fontSize: 11, color: C.inkMuted }}>
                          {enriched.location} &middot; {enriched.category}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: C.inkMuted }}>Score</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {enriched.originalScore !== enriched.enrichedScore ? (
                            <>{enriched.originalScore} <span style={{ color: enriched.enrichedScore > enriched.originalScore ? C.success : C.danger }}>&#8594; {enriched.enrichedScore}</span></>
                          ) : enriched.enrichedScore}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: C.inkMuted }}>Est. Value</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.success }}>
                          &pound;{enriched.estimatedValue.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "center", width: 52 }}>
                        <div style={{ fontSize: 10, color: C.inkMuted }}>Complete</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: enriched.dataCompleteness >= 80 ? C.success : enriched.dataCompleteness >= 50 ? C.warn : C.danger }}>
                          {enriched.dataCompleteness}%
                        </div>
                      </div>
                      <div style={{ width: 20, textAlign: "center", color: C.inkMuted, fontSize: 12 }}>
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {/* Left: Data gaps & tags */}
                        <div>
                          {/* Tags */}
                          {enriched.tags.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Tags</div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {enriched.tags.map(tag => (
                                  <span key={tag} style={pillStyle(C.accentSubtle, C.accent)}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Data Gaps */}
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                              Data Gaps ({enriched.gaps.length})
                            </div>
                            {enriched.gaps.length === 0 ? (
                              <div style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>All fields complete</div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {enriched.gaps.map(gap => (
                                  <div key={gap.field} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                    <span style={pillStyle(priorityColors[gap.priority].bg, priorityColors[gap.priority].color)}>
                                      {gap.priority}
                                    </span>
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 600 }}>{gap.label}</div>
                                      <div style={{ fontSize: 11, color: C.inkSec, marginTop: 1 }}>{gap.suggestion}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Outreach Timing */}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Best Outreach Window</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{enriched.outreachTiming.bestMonths}</div>
                            <div style={{ fontSize: 11, color: C.inkSec, marginTop: 2 }}>{enriched.outreachTiming.reason}</div>
                          </div>
                        </div>

                        {/* Right: Research brief */}
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Research Brief</div>

                          {enriched.brief.keyActions.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                              {enriched.brief.keyActions.map((action, i) => (
                                <div key={i} style={{ fontSize: 12, color: C.ink, padding: "4px 0", display: "flex", gap: 6, alignItems: "flex-start" }}>
                                  <span style={{ color: C.accent, fontWeight: 700, flexShrink: 0 }}>&bull;</span>
                                  {action}
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Contact Strategy</div>
                            <div style={{ fontSize: 12, color: C.inkSec, lineHeight: 1.5 }}>{enriched.brief.contactStrategy}</div>
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Search Queries</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              {enriched.brief.searchQueries.map((q, i) => (
                                <div key={i} style={{ fontSize: 11, fontFamily: F.mono, color: C.inkSec, background: C.bgWarm, padding: "3px 8px", borderRadius: 4 }}>
                                  {q}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Apply button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApplyEnrichment(enriched); }}
                            disabled={isApplied}
                            style={{
                              ...btnStyle(isApplied ? "outline" : "accent"),
                              width: "100%",
                              justifyContent: "center",
                              opacity: isApplied ? 0.6 : 1,
                            }}
                          >
                            {isApplied ? 'Enrichment Applied' : 'Apply Score & Value to Lead'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task History */}
      {!results && taskHistory.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.serif, marginBottom: 12 }}>Recent Agent Runs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {taskHistory.slice(0, 5).map(task => (
              <div key={task.id} style={{ ...cardStyle({ padding: "10px 16px" }), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{task.agentName}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted }}>
                    {new Date(task.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {task.results?.summary && ` \u2014 ${task.results.summary.totalAnalyzed} leads analyzed`}
                  </div>
                </div>
                <span style={pillStyle(
                  task.status === AGENT_STATUS.COMPLETED ? C.successBg : task.status === AGENT_STATUS.ERROR ? C.dangerBg : C.infoBg,
                  task.status === AGENT_STATUS.COMPLETED ? C.success : task.status === AGENT_STATUS.ERROR ? C.danger : C.info,
                )}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
