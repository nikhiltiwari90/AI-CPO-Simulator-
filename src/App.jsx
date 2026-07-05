import { useState, useRef, useEffect } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  bg:       "#07080C",
  surface:  "#0F1117",
  card:     "#141720",
  border:   "#1E2232",
  accent:   "#5B6EF5",
  accentLo: "#1A1F3D",
  gold:     "#E8A838",
  goldLo:   "#2A2010",
  green:    "#3EC97A",
  greenLo:  "#0E2018",
  red:      "#E84B4B",
  redLo:    "#2A0E0E",
  muted:    "#4A5068",
  sub:      "#8B92B0",
  text:     "#D8DCF0",
  white:    "#FFFFFF",
};

// ── Agent definitions ──────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "analytics",
    icon: "📊",
    name: "Product Analytics Agent",
    role: "Root Cause Analyst",
    color: T.accent,
    colorLo: T.accentLo,
    job: "Diagnose the metric drop with data frameworks. Identify which funnel stage broke, segment cohorts, and pinpoint leading indicators.",
  },
  {
    id: "voice",
    icon: "💬",
    name: "Customer Voice Agent",
    role: "VOC Synthesiser",
    color: T.green,
    colorLo: T.greenLo,
    job: "Synthesise what customers are saying. Generate representative support ticket themes, NPS verbatims, and App Store review patterns.",
  },
  {
    id: "competitive",
    icon: "🔭",
    name: "Competitive Intelligence Agent",
    role: "Market Analyst",
    color: T.gold,
    colorLo: T.goldLo,
    job: "Analyse competitor moves that may have impacted this metric. Identify gaps, switching triggers, and market context.",
  },
  {
    id: "experimentation",
    icon: "🧪",
    name: "Experimentation Agent",
    role: "A/B Test Designer",
    color: "#C47AF5",
    colorLo: "#1E1030",
    job: "Design 3 prioritised A/B experiments to address the root cause. Include hypothesis, metric, sample size rationale, and risk.",
  },
  {
    id: "roadmap",
    icon: "🗺️",
    name: "Roadmap Agent",
    role: "RICE Prioritiser",
    color: "#4BBFD4",
    colorLo: "#0C2028",
    job: "Re-prioritise the product roadmap using RICE scoring. Identify what to accelerate, pause, or kill given this signal.",
  },
  {
    id: "memo",
    icon: "📋",
    name: "Executive Memo Agent",
    role: "Strategy Writer",
    color: T.gold,
    colorLo: T.goldLo,
    job: "Write a VP-ready Executive Product Review memo. Include problem diagnosis, root cause, experiments, roadmap shifts, and projected business impact.",
  },
];

const EXAMPLES = [
  "Our D30 retention dropped 18% after our v3.2 launch last month.",
  "Checkout conversion fell 23% on mobile in the last two weeks.",
  "Our NPS dropped from 52 to 31 following our pricing change.",
  "Daily active users declined 31% after we removed the social feed feature.",
  "Trial-to-paid conversion dropped from 24% to 11% this quarter.",
];

// ── Prompt builder ─────────────────────────────────────────────────────────────
function buildPrompt(agent, problem, previousOutputs) {
  const context = previousOutputs.length > 0
    ? `\n\nPrevious agent findings:\n${previousOutputs
        .map(o => `[${o.agentName}]:\n${o.output}`)
        .join("\n\n")}`
    : "";

  return `You are the ${agent.name} (${agent.role}) in an AI CPO system.

The product problem statement is:
"${problem}"
${context}

Your specific mandate: ${agent.job}

Respond in structured markdown with clear headers, bullet points, and specific actionable insights. Be concrete — use realistic metrics, frameworks (RICE, ICE, HEART, AARRR, 5-Whys), and PM-quality analysis. Write as a senior product leader would. Do not hedge excessively. Be decisive.

Format your response with:
- A bold one-line diagnosis/headline at the top
- 3-5 structured sections with ## headers
- Specific numbers, percentages, and timeframes where relevant
- A "Key Recommendation" section at the end

Keep response focused and executive-quality — 350-500 words.`;
}

// ── Markdown renderer ──────────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} style={{
          color: T.text, fontSize: 13, fontWeight: 600,
          marginTop: 14, marginBottom: 6, letterSpacing: "0.02em"
        }}>
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} style={{
          color: T.white, fontSize: 15, fontWeight: 700,
          marginTop: 10, marginBottom: 8
        }}>
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <p key={i} style={{
          color: T.white, fontSize: 13, fontWeight: 600,
          marginBottom: 10, lineHeight: 1.6
        }}>
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      const content = line.slice(2);
      const parts = content.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
          <span style={{ color: T.accent, fontSize: 12, marginTop: 2, flexShrink: 0 }}>▸</span>
          <span style={{ color: T.sub, fontSize: 12, lineHeight: 1.65 }}>
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} style={{ color: T.text, fontWeight: 600 }}>{p.slice(2, -2)}</strong>
                : p
            )}
          </span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else if (line.trim()) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={i} style={{ color: T.sub, fontSize: 12, lineHeight: 1.7, marginBottom: 4 }}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j} style={{ color: T.text, fontWeight: 600 }}>{p.slice(2, -2)}</strong>
              : p
          )}
        </p>
      );
    }
    i++;
  }
  return elements;
}

// ── Streaming agent call ───────────────────────────────────────────────────────
async function runAgent(agent, problem, previousOutputs, onChunk) {
  const prompt = buildPrompt(agent, problem, previousOutputs);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            full += parsed.delta.text;
            onChunk(full);
          }
        } catch (_) {}
      }
    }
  }
  return full;
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function CPOSimulator() {
  const [problem, setProblem] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [activeAgent, setActiveAgent] = useState(-1);
  const [results, setResults] = useState([]); // { agentId, agentName, output, done }
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (phase === "running") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamingText, activeAgent, phase]);

  async function runSimulation() {
    if (!problem.trim() || phase === "running") return;
    setPhase("running");
    setResults([]);
    setActiveAgent(0);
    setError(null);
    setExpandedAgent(null);

    const collected = [];

    for (let i = 0; i < AGENTS.length; i++) {
      const agent = AGENTS[i];
      setActiveAgent(i);
      setStreamingText("");

      try {
        const output = await runAgent(
          agent,
          problem,
          collected.map(r => ({ agentName: r.agentName, output: r.output })),
          (partial) => setStreamingText(partial)
        );

        const result = {
          agentId: agent.id,
          agentName: agent.name,
          agentIcon: agent.icon,
          agentColor: agent.color,
          agentColorLo: agent.colorLo,
          output,
          done: true,
        };
        collected.push(result);
        setResults([...collected]);
        setStreamingText("");

        // small pause between agents for UX breathing room
        if (i < AGENTS.length - 1) {
          await new Promise(r => setTimeout(r, 600));
        }
      } catch (err) {
        setError(err.message);
        setPhase("idle");
        setActiveAgent(-1);
        return;
      }
    }

    setActiveAgent(-1);
    setPhase("done");
    setExpandedAgent("memo"); // auto-expand the executive memo
  }

  function reset() {
    setPhase("idle");
    setResults([]);
    setActiveAgent(-1);
    setStreamingText("");
    setError(null);
    setExpandedAgent(null);
  }

  const memoResult = results.find(r => r.agentId === "memo");
  const nonMemoResults = results.filter(r => r.agentId !== "memo");

  return (
    <div style={{
      background: T.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif",
      color: T.text, padding: "0 0 60px",
    }}>

      {/* ── Header ── */}
      <div style={{
        borderBottom: `1px solid ${T.border}`, padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: T.bg, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.accent}, #8B5CF6)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.white, letterSpacing: "-0.01em" }}>
              AI CPO Simulator
            </div>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Nikhil Tiwari · Portfolio Project
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 20,
            background: T.accentLo, color: T.accent, border: `1px solid ${T.accent}30`,
            letterSpacing: "0.04em"
          }}>6 AGENTS</span>
          <span style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 20,
            background: T.greenLo, color: T.green, border: `1px solid ${T.green}30`,
          }}>AGENTIC AI</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Hero ── */}
        {phase === "idle" && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
            <div style={{
              display: "inline-block", fontSize: 11, letterSpacing: "0.12em",
              color: T.accent, background: T.accentLo, padding: "4px 14px",
              borderRadius: 20, marginBottom: 18, border: `1px solid ${T.accent}25`,
              textTransform: "uppercase"
            }}>
              Autonomous Product Intelligence System
            </div>
            <h1 style={{
              fontSize: 34, fontWeight: 800, color: T.white, lineHeight: 1.15,
              letterSpacing: "-0.03em", marginBottom: 14,
            }}>
              Your AI Product Team<br />
              <span style={{ color: T.accent }}>diagnoses any crisis.</span>
            </h1>
            <p style={{ fontSize: 14, color: T.sub, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
              Describe a product metric problem. Six autonomous AI agents run in sequence —
              analytics, customer voice, competitive intel, experimentation, roadmap, and
              executive memo — producing a complete VP-ready Product Review.
            </p>
          </div>
        )}

        {/* ── Input ── */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          <label style={{ fontSize: 11, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
            Product Problem Statement
          </label>
          <textarea
            value={problem}
            onChange={e => setProblem(e.target.value)}
            disabled={phase === "running"}
            placeholder="e.g. Our D30 retention dropped 18% after our v3.2 launch last month."
            style={{
              width: "100%", background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "12px 14px", color: T.text, fontSize: 13,
              lineHeight: 1.6, resize: "none", minHeight: 80, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />

          {/* Example prompts */}
          {phase === "idle" && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setProblem(ex)} style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 20, padding: "4px 11px", fontSize: 10,
                  color: T.sub, cursor: "pointer", transition: "all 0.15s",
                }}>
                  {ex.slice(0, 48)}…
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
            {(phase === "done" || error) && (
              <button onClick={reset} style={{
                background: "transparent", border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "9px 18px", color: T.sub,
                fontSize: 12, cursor: "pointer",
              }}>
                New Analysis
              </button>
            )}
            <button
              onClick={runSimulation}
              disabled={!problem.trim() || phase === "running"}
              style={{
                background: phase === "running"
                  ? T.muted
                  : `linear-gradient(135deg, ${T.accent}, #7C3AED)`,
                border: "none", borderRadius: 8, padding: "9px 22px",
                color: T.white, fontSize: 13, fontWeight: 600,
                cursor: phase === "running" ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
                opacity: !problem.trim() ? 0.5 : 1,
              }}
            >
              {phase === "running" ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                  Agents running…
                </>
              ) : "⚡ Run AI CPO Analysis"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: T.redLo, border: `1px solid ${T.red}40`,
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
            color: T.red, fontSize: 12,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Agent pipeline progress ── */}
        {(phase === "running" || phase === "done") && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "16px 18px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
              Agent Pipeline
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {AGENTS.map((a, i) => {
                const done = results.find(r => r.agentId === a.id);
                const running = activeAgent === i && phase === "running";
                return (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: done ? a.colorLo : running ? T.accentLo : T.surface,
                    border: `1px solid ${done ? a.color + "50" : running ? T.accent + "60" : T.border}`,
                    borderRadius: 8, padding: "6px 11px", transition: "all 0.3s",
                  }}>
                    <span style={{ fontSize: 13 }}>{a.icon}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 500,
                      color: done ? a.color : running ? T.accent : T.muted,
                    }}>
                      {a.role}
                    </span>
                    {done && <span style={{ fontSize: 9, color: a.color }}>✓</span>}
                    {running && (
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: T.accent, animation: "pulse 1s infinite",
                        display: "inline-block",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            {phase === "done" && (
              <div style={{
                marginTop: 12, fontSize: 11, color: T.green,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span>✓</span> All 6 agents complete — Executive Product Review ready
              </div>
            )}
          </div>
        )}

        {/* ── Streaming active agent ── */}
        {phase === "running" && activeAgent >= 0 && (
          <div style={{
            background: T.card, border: `1px solid ${AGENTS[activeAgent]?.color}40`,
            borderRadius: 14, padding: 18, marginBottom: 16,
            boxShadow: `0 0 24px ${AGENTS[activeAgent]?.color}15`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: AGENTS[activeAgent]?.colorLo,
                border: `1px solid ${AGENTS[activeAgent]?.color}50`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>
                {AGENTS[activeAgent]?.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: AGENTS[activeAgent]?.color }}>
                  {AGENTS[activeAgent]?.name}
                </div>
                <div style={{ fontSize: 10, color: T.muted }}>
                  Agent {activeAgent + 1} of {AGENTS.length} · {AGENTS[activeAgent]?.role}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: AGENTS[activeAgent]?.color,
                    animation: `bounce 1s ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
            <div style={{
              background: T.surface, borderRadius: 10, padding: 14,
              maxHeight: 280, overflowY: "auto",
            }}>
              {streamingText
                ? renderMarkdown(streamingText)
                : <div style={{ color: T.muted, fontSize: 12 }}>Thinking…</div>
              }
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        {/* ── Completed agent results (non-memo) ── */}
        {nonMemoResults.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {nonMemoResults.map((r) => {
              const isExpanded = expandedAgent === r.agentId;
              const agent = AGENTS.find(a => a.id === r.agentId);
              return (
                <div key={r.agentId} style={{
                  background: T.card, border: `1px solid ${r.agentColor}30`,
                  borderRadius: 14, overflow: "hidden",
                  transition: "all 0.2s",
                }}>
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : r.agentId)}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      padding: "13px 16px", display: "flex", alignItems: "center",
                      gap: 10, cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: r.agentColorLo,
                      border: `1px solid ${r.agentColor}40`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}>
                      {r.agentIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: r.agentColor }}>
                        {r.agentName}
                      </div>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>
                        {agent?.role} · Complete
                      </div>
                    </div>
                    <span style={{ color: T.muted, fontSize: 12, flexShrink: 0 }}>
                      {isExpanded ? "▲ Collapse" : "▼ Expand"}
                    </span>
                    <span style={{ fontSize: 10, color: T.green, flexShrink: 0 }}>✓</span>
                  </button>
                  {isExpanded && (
                    <div style={{
                      padding: "0 16px 16px",
                      borderTop: `1px solid ${T.border}`,
                      paddingTop: 14,
                    }}>
                      {renderMarkdown(r.output)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Executive Memo (always expanded, highlighted) ── */}
        {memoResult && (
          <div style={{
            background: T.card,
            border: `2px solid ${T.gold}50`,
            borderRadius: 16, overflow: "hidden",
            boxShadow: `0 0 40px ${T.gold}12`,
            marginBottom: 24,
          }}>
            <div style={{
              padding: "16px 20px",
              background: `linear-gradient(135deg, ${T.goldLo}, ${T.card})`,
              borderBottom: `1px solid ${T.gold}30`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: T.goldLo, border: `1px solid ${T.gold}50`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>📋</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>
                  Executive Product Review
                </div>
                <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>
                  VP-Ready · Synthesised from all 6 agents · Generated by AI CPO Simulator
                </div>
              </div>
              <div style={{
                background: T.goldLo, border: `1px solid ${T.gold}40`,
                borderRadius: 20, padding: "3px 10px", fontSize: 10, color: T.gold,
              }}>
                FINAL OUTPUT
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {renderMarkdown(memoResult.output)}
            </div>
          </div>
        )}

        {/* ── How it works ── */}
        {phase === "idle" && results.length === 0 && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: 20,
          }}>
            <div style={{ fontSize: 11, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              How it works
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {AGENTS.map((a, i) => (
                <div key={a.id} style={{
                  background: T.surface, borderRadius: 10, padding: "12px 14px",
                  border: `1px solid ${a.color}25`,
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: a.colorLo, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>
                    {a.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: a.color, marginBottom: 3 }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.5 }}>
                      {a.job.slice(0, 80)}…
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: "12px 14px",
              background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`,
              fontSize: 11, color: T.sub, lineHeight: 1.7,
            }}>
              <strong style={{ color: T.text }}>Built by Nikhil Tiwari</strong> · This project demonstrates agentic AI product thinking —
              each agent passes its output to the next, building a complete executive-grade product response
              from a single problem statement. Powered by Claude claude-sonnet-4-6 via the Anthropic API.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        * { box-sizing: border-box; }
        textarea:focus { border-color: ${T.accent}80 !important; box-shadow: 0 0 0 3px ${T.accent}15; }
        button:hover:not(:disabled) { opacity: 0.88; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
      `}</style>
    </div>
  );
}
