# Prompt Strategy
## AI CPO Simulator — Prompt Engineering Approach
**Author:** Nikhil Tiwari

---

## Design Goal

Every agent's prompt needed to produce output that is:
1. **Structurally consistent** — so the markdown renderer works reliably across all 6 agents
2. **Substantively different** — each agent must produce genuinely distinct analysis, not six versions of the same answer
3. **Executive-quality** — concise, decisive, framework-literate, not generic chatbot hedging

---

## The Core Prompt Template

```javascript
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

Respond in structured markdown with clear headers, bullet points, and
specific actionable insights. Be concrete — use realistic metrics,
frameworks (RICE, ICE, HEART, AARRR, 5-Whys), and PM-quality analysis.
Write as a senior product leader would. Do not hedge excessively.
Be decisive.

Format your response with:
- A bold one-line diagnosis/headline at the top
- 3-5 structured sections with ## headers
- Specific numbers, percentages, and timeframes where relevant
- A "Key Recommendation" section at the end

Keep response focused and executive-quality — 350-500 words.`;
}
```

---

## Why Each Instruction Exists

### "You are the [Agent Name] (Role) in an AI CPO system"
Establishes role identity. Without this, agents tend to produce generic "as an AI" hedging language. Role-framing consistently produces more decisive, in-character output across all tested LLMs.

### Passing `previousOutputs` as labelled context
This is the mechanism that creates the "compounding intelligence" effect. Critically, outputs are labelled `[Agent Name]:` so the current agent can explicitly reference what a specific prior agent found — e.g., the Experimentation Agent prompt can produce output like *"Building on the Analytics Agent's finding that onboarding step 3 is the drop-off point..."*

### "Do not hedge excessively. Be decisive."
LLMs default to qualified, hedged language ("this could potentially indicate...", "it's possible that..."). For an executive-facing artifact, hedging reads as weak product judgment. This instruction consistently produces more direct, confident analytical language — closer to how a senior PM actually writes.

### "Use realistic metrics... PM-quality analysis"
Without this, agents sometimes produce purely qualitative analysis with no numbers. Explicitly requesting metrics (even illustrative/realistic ones, clearly framed as such within a simulated scenario) makes the output feel like real product analysis rather than generic advice.

### Word count constraint (350-500 words)
Critical for two reasons:
1. **UX** — 6 agents at unlimited length would make the page unreadable
2. **Cost/latency** — `max_tokens: 1000` in the API call caps this naturally, but the prompt-level instruction also shapes the model's internal planning toward conciseness rather than truncating mid-thought

### Structural format requirements (headline, ## headers, Key Recommendation)
This is the most important instruction for **product reliability**. The custom markdown renderer in `App.jsx` specifically looks for:
- Lines starting with `## ` → rendered as section headers
- Lines starting with `**text**` (full line bold) → rendered as headline/emphasis blocks
- Lines starting with `- ` → rendered as bulleted insights with inline bold support

Without enforcing this structure in the prompt, agent outputs would be inconsistently formatted and the renderer would produce visually broken results. **The prompt and the renderer were co-designed** — this is prompt engineering in service of a specific UI contract, not prompting in the abstract.

---

## Per-Agent Mandate Design

Each agent's `job` field is deliberately narrow and specific:

```javascript
{
  id: "analytics",
  job: "Diagnose the metric drop with data frameworks. Identify which
        funnel stage broke, segment cohorts, and pinpoint leading
        indicators."
}
```

**Why narrow mandates matter:** A broad mandate like "analyse the product problem" produces generic output that overlaps heavily with other agents. A narrow mandate like "identify which funnel stage broke" forces the agent into a specific analytical lane, which is what creates genuine differentiation between the 6 agents' outputs.

---

## Handling the "Last Agent" Problem

The Executive Memo Agent receives the most context (all 5 previous outputs) and has the hardest job: **synthesis, not addition**. Its mandate explicitly says:

```
"Write a VP-ready Executive Product Review memo. Include problem
diagnosis, root cause, experiments, roadmap shifts, and projected
business impact."
```

This mandate is structured to mirror the actual sections a real Executive Product Review would contain — meaning the memo agent isn't just "agent #6 with more context," it has a genuinely distinct deliverable format (memo, not analysis) that pulls from everything before it.

---

## What I'd Improve in v2

1. **Few-shot examples** — including 1-2 example outputs per agent in the prompt would tighten format consistency further, at the cost of prompt length and latency
2. **Explicit citation of prior agents** — currently agents *can* reference prior findings but aren't required to; a stronger version would mandate "explicitly reference at least one finding from a previous agent"
3. **Confidence calibration** — agents could be asked to flag which claims are illustrative/simulated vs. genuinely inferable from the problem statement, making the simulated nature of the data transparent within the output itself
4. **Per-agent temperature tuning** — the Analytics Agent likely benefits from lower temperature (more consistent, less creative) while the Competitive Intelligence Agent might benefit from slightly higher temperature (more exploratory market scenarios)

---

*Prompt strategy documented by Nikhil Tiwari · Proprietary — see LICENSE.md*
