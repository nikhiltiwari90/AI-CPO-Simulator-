# Agent Design
## AI CPO Simulator — Architecture & Agent Decisions
**Author:** Nikhil Tiwari

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     USER INPUT                              │
│         "Our D30 retention dropped 18% after launch"        │
└───────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AGENT 1 — Product Analytics Agent                           │
│  Input:  problem statement                                   │
│  Output: root cause diagnosis, funnel analysis                │
└───────────────────────────┬──────────────────────────────────┘
                           │ output passed as context
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AGENT 2 — Customer Voice Agent                               │
│  Input:  problem statement + Agent 1 output                   │
│  Output: VOC synthesis, sentiment themes                      │
└───────────────────────────┬──────────────────────────────────┘
                           │ output passed as context
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AGENT 3 — Competitive Intelligence Agent                     │
│  Input:  problem statement + Agents 1-2 output                │
│  Output: competitive context, market signals                  │
└───────────────────────────┬──────────────────────────────────┘
                           │ output passed as context
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AGENT 4 — Experimentation Agent                               │
│  Input:  problem statement + Agents 1-3 output                │
│  Output: 3 prioritised A/B experiments                        │
└───────────────────────────┬──────────────────────────────────┘
                           │ output passed as context
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AGENT 5 — Roadmap Agent                                      │
│  Input:  problem statement + Agents 1-4 output                │
│  Output: RICE-scored roadmap re-prioritisation                │
└───────────────────────────┬──────────────────────────────────┘
                           │ output passed as context
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AGENT 6 — Executive Memo Agent                                │
│  Input:  problem statement + ALL previous agent outputs       │
│  Output: VP-ready Executive Product Review                    │
└───────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  FINAL ARTIFACT                              │
│          Executive Product Review (rendered in UI)           │
└──────────────────────────────────────────────────────────────┘
```

---

## Why Sequential, Not Parallel

The obvious naive design would fire all 6 agents in parallel and stitch the results together. This was deliberately rejected.

**Reasoning:** A real VP Product team doesn't work this way. The analytics finding shapes what customer feedback you go looking for. The competitive context shapes what experiments make sense. The experiments shape what roadmap trade-offs you propose. The roadmap shapes what goes in the executive memo.

**Sequential design models how product organisations actually reason** — each function builds on the previous function's findings, not six people writing isolated reports that someone else has to synthesise later.

This also means the **Executive Memo Agent is the most context-rich agent in the system** — it receives all 5 previous outputs and is explicitly prompted to synthesise, not just summarise.

---

## Agent Prompt Architecture

Every agent prompt follows the same structural pattern (see `buildPrompt()` in `src/App.jsx`):

```
1. Role framing       — "You are the [Agent Name] in an AI CPO system"
2. Problem statement  — the original user input, unchanged across all agents
3. Prior context      — all previous agent outputs, labelled by agent name
4. Specific mandate   — the unique job for this agent
5. Format constraints — markdown structure, word count, tone requirements
```

This consistency matters for two reasons:
1. **Predictable output structure** — the markdown renderer can reliably parse headers, bullets, and bold text across all 6 agents
2. **Maintainability** — adding a 7th agent requires only adding a new entry to the `AGENTS` array with a `job` description; the prompt construction logic doesn't change

---

## Context Window Management

Each agent receives the FULL text of every previous agent's output. For a 6-agent pipeline, this means:

| Agent | Approx. context size (prior outputs) |
|---|---|
| 1 | 0 (no prior agents) |
| 2 | ~500 words |
| 3 | ~1000 words |
| 4 | ~1500 words |
| 5 | ~2000 words |
| 6 | ~2500 words |

This is well within context limits for claude-sonnet-4-6 even at the final agent. For a system with many more agents or longer individual outputs, a **summarisation layer** between agents would be the next architectural addition — each agent's output gets compressed to its key findings before being passed forward, preventing context bloat.

**Noted as a v2 improvement**, not implemented in v1 because 6 agents at ~400 words each doesn't yet require it.

---

## Streaming Design

Each agent's output streams token-by-token into the UI via Server-Sent Events (SSE) from the Anthropic Messages API streaming mode.

**Why this matters for the product experience:**
- Makes the multi-agent nature of the system *visible*, not just described
- A static "Loading…" spinner for 6 sequential LLM calls (potentially 30-60 seconds total) would feel broken
- Streaming text + agent pipeline progress indicators together communicate: "this is a real system doing real work, not a single cached response"

---

## Error Handling Strategy

If any agent in the sequence fails (network error, API error, rate limit):

1. The pipeline halts immediately — no agent runs on a broken prior context
2. The error is surfaced to the user with the specific HTTP status
3. All completed agent outputs up to the failure point remain visible
4. User can retry the full sequence (current v1 behaviour) — **v2 improvement:** retry from the failed agent only, preserving completed agent outputs

This was a deliberate trade-off for v1 simplicity. A production system would need per-agent retry logic and partial-failure recovery.

---

## Production Deployment Note — CORS & API Key Security

**Important architectural note for anyone deploying this:**

The current implementation calls `https://api.anthropic.com/v1/messages` directly from the browser. This works in the Claude.ai artifact sandbox (which proxies the request), but **will not work in a standalone deployed app** due to:

1. **CORS policy** — Anthropic's API does not set permissive CORS headers for direct browser calls
2. **API key exposure** — putting your API key in client-side code exposes it to anyone who opens dev tools

### Recommended production fix: Serverless proxy

```javascript
// /api/agent.js — Vercel Edge Function example
export default async function handler(req) {
  const { prompt } = await req.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY, // server-side only, never exposed
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  return new Response(response.body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

export const config = { runtime: "edge" };
```

Then update `runAgent()` in `App.jsx` to call `/api/agent` instead of the Anthropic API directly. This keeps the API key server-side and avoids CORS entirely.

---

*Architecture documentation authored by Nikhil Tiwari · Proprietary — see LICENSE.md*
