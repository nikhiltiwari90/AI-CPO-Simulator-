# AI CPO Simulator — Complete Project Documentation
## End-to-End Build Record: Decisions, Tradeoffs, Implementation, Outcomes, Future Roadmap
**Author:** Nikhil Tiwari
**Project Type:** Personal Portfolio · Agentic AI Product
**Document Purpose:** Single source of truth covering the entire project lifecycle

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Definition & Goals](#2-problem-definition--goals)
3. [Strategic Decisions & Rationale](#3-strategic-decisions--rationale)
4. [Architecture Deep Dive](#4-architecture-deep-dive)
5. [AI Decisions — Model, Prompts, Orchestration](#5-ai-decisions--model-prompts-orchestration)
6. [Every Tradeoff Made, In Detail](#6-every-tradeoff-made-in-detail)
7. [Step-by-Step Implementation Log](#7-step-by-step-implementation-log)
8. [Technical Challenges & How They Were Solved](#8-technical-challenges--how-they-were-solved)
9. [Outcome & What Was Actually Delivered](#9-outcome--what-was-actually-delivered)
10. [Metrics Framework — How Success Is Defined](#10-metrics-framework--how-success-is-defined)
11. [Known Limitations — Honest Accounting](#11-known-limitations--honest-accounting)
12. [Future Roadmap — v2, v3, and Beyond](#12-future-roadmap--v2-v3-and-beyond)
13. [Lessons Learned](#13-lessons-learned)
14. [Appendix — Full Decision Log](#14-appendix--full-decision-log)

---

## 1. Project Overview

### What Was Built
A working, deployable agentic AI web application in which a single product-crisis problem statement (e.g., "Our D30 retention dropped 18% after launch") triggers six specialised AI agents that run **sequentially**, each consuming the full output of every prior agent as context, culminating in a synthesised, VP-ready **Executive Product Review** document.

### Why It Was Built
As a fresh-graduate-to-mid-level Product Manager building a portfolio for AI-native PM roles at companies like Amazon, Google, and Microsoft, the standard portfolio artifact — PRDs, wireframes, case studies — proves you can *describe* product thinking. It does not prove you can *build* with AI, *architect* an agentic system, or *ship* a working product.

This project exists specifically to close that gap: to be the one artifact in the portfolio that is a **functioning product**, not a document about a hypothetical product.

### Who It's For
- **Primary audience:** Technical recruiters and hiring managers at AI-forward companies evaluating PM candidates for AI-native or technical PM roles
- **Secondary audience:** Engineering interviewers who want to see whether a PM candidate can reason about system architecture, not just user stories

### One-Sentence Summary
*A sequential multi-agent AI system that simulates how a six-person product leadership team would diagnose a metric crisis and produce a board-ready strategy memo — built to demonstrate agentic AI architecture, prompt engineering discipline, and executive-level product synthesis.*

---

## 2. Problem Definition & Goals

### The Portfolio Problem (Meta-Level)
Before defining the product problem the *app* solves, it's worth being explicit about the problem the *project* solves for its creator:

| Gap in a Typical PM Portfolio | How This Project Closes It |
|---|---|
| "I understand AI products" (claimed) | A working AI product (proven) |
| Static case studies | A live, interactive, runnable system |
| PM frameworks mentioned in a resume | PM frameworks operationalised inside working prompts |
| No evidence of technical fluency | React + streaming API integration + agent orchestration, all readable in one file |
| No evidence of systems thinking | Explicit agent-boundary design derived from a real artifact's structure |

### The Simulated Product Problem (App-Level)
The application itself is designed to solve a real, recognisable problem inside product organisations:

> When a critical metric drops, the diagnostic process is **slow, fragmented, and siloed**. Data analysis happens in one tool. Customer feedback synthesis happens in another. Competitive context lives in someone's head. Experimentation ideas get proposed without rigorous prioritisation. The roadmap conversation happens in a separate meeting. By the time an executive memo is written, the narrative has often drifted from the underlying data.

### Goals — What Success Looks Like

**Primary goal (portfolio):**
Produce a project that a senior technical interviewer would look at and conclude: *"This person can actually build with AI, not just talk about it."*

**Secondary goal (product):**
Demonstrate that a sequential multi-agent architecture produces measurably more coherent, synthesised output than either (a) a single mega-prompt or (b) six parallel, disconnected agent calls.

**Tertiary goal (craft):**
Use the project as a forcing function to deeply internalise the actual structural anatomy of a real Executive Product Review — which sections it needs, in what order, and why — by being forced to decompose it into discrete, codeable agent mandates.

### Non-Goals (Explicitly Out of Scope)
- This is **not** intended to connect to real analytics platforms (Amplitude, Mixpanel) in v1
- This is **not** intended to be a commercial SaaS product
- This is **not** intended to replace real product analysts, researchers, or strategists — it simulates their *reasoning structure*, not their access to real proprietary data

---

## 3. Strategic Decisions & Rationale

This section captures the **highest-leverage decisions** made before any code was written, and why each one was made.

### Decision 1: Build a working app, not a designed mockup

**Options considered:**
- A) Figma mockup of what the system would look like
- B) A written PRD describing the system in detail
- C) A fully working, deployable application

**Chosen: C**

**Rationale:** Mockups and PRDs are abundant in PM portfolios. They are low-signal because anyone can describe a system. A working application — especially one involving live AI API orchestration — is rare in PM portfolios and therefore high-signal. The cost (significantly more build time, real engineering risk) was deliberately accepted because the differentiation value justified it.

---

### Decision 2: Six agents, not three, not ten

**Options considered:**
- A) 3 agents (Analysis, Strategy, Communication) — simpler, faster to build
- B) 6 agents (the chosen design)
- C) 10+ agents (more granular: separate agents for funnel analysis, cohort analysis, NPS analysis, etc.)

**Chosen: B (6 agents)**

**Rationale:** The number of agents was derived from working backwards from the structure of a real Executive Product Review (see Section 5 for the full mapping). Three agents would have been too coarse — "Analysis" as a single agent would have conflated data analytics with customer voice with competitive intelligence, three genuinely different reasoning modes. Ten-plus agents would have introduced diminishing returns: more orchestration complexity, more latency (each agent is a sequential API call), and increasingly narrow mandates with overlapping content. Six was the point where each agent had a **genuinely distinct, non-overlapping reasoning mode** mapped to a **genuinely distinct section** of the target output document.

---

### Decision 3: Sequential orchestration, not parallel

**Options considered:**
- A) Fire all 6 agents in parallel (faster — total latency = slowest single agent, not sum of all agents)
- B) Run agents sequentially, each consuming all prior outputs as context (slower — total latency = sum of all agents)

**Chosen: B (sequential)**

**Rationale — this is the single most important architectural decision in the project:**

Parallel agents would each only see the original problem statement. This produces six independent analyses that *might* coincidentally align, but more often produce contradictions, redundancy, or missed connections (e.g., the Experimentation Agent designing a test that ignores a finding the Analytics Agent already surfaced).

Sequential agents, each receiving the full text of every previous agent's output, can explicitly build on prior findings. This is not a stylistic preference — it changes the actual content. An Experimentation Agent that knows "the Analytics Agent found the drop-off is concentrated at onboarding step 3" designs a fundamentally different, better-targeted experiment than one reasoning from the bare problem statement alone.

**Cost accepted:** Total latency for a full run is roughly 6× a single agent's latency (~45-90 seconds total vs ~8-15 seconds for one call). This was accepted because the *quality* of the final synthesised memo was the primary success criterion, not speed. (See Section 6 for the full latency-vs-quality tradeoff analysis.)

---

### Decision 4: Single-file React app, not a multi-file enterprise structure

**Options considered:**
- A) Conventional React project structure: separate component files, custom hooks file, services layer, types
- B) Single `App.jsx` file containing the entire application

**Chosen: B (single file)**

**Rationale:** This is a portfolio artifact meant to be read end-to-end by a hiring manager or technical interviewer, often under time pressure. A conventional enterprise structure optimises for team maintainability at scale — which is irrelevant for a single-developer portfolio piece, and actively harmful for *readability in one sitting*, which is the actual goal here. The single-file decision is itself a demonstrated tradeoff-awareness: "I know how to structure a production app, and I'm deliberately choosing differently because the audience and goal here are different."

**Cost accepted:** The file is long (~713 lines). This was mitigated by clear section comments (`// ── Section name ──`) that make the file scannable even at length.

---

### Decision 5: Streaming output, not a single blocking response

**Options considered:**
- A) Wait for each agent's full response, then render it all at once
- B) Stream each agent's output token-by-token in real time

**Chosen: B (streaming)**

**Rationale:** Given the sequential architecture already implies a 45-90 second total runtime, a blocking UI during that window would feel broken — like the app had frozen or crashed. Streaming serves two purposes simultaneously: (1) it makes the wait feel productive and alive rather than dead, and (2) it makes the *multi-agent nature of the system visible* — watching six distinct agents "think" in sequence, each with their own visual identity (icon, colour), communicates the architecture experientially, not just in a README's prose description.

**Cost accepted:** Streaming via Server-Sent Events adds implementation complexity (manual SSE parsing, partial-chunk buffering) compared to a simple `await fetch().json()` call. This complexity was accepted because the UX payoff was judged to outweigh the implementation cost.

---

## 4. Architecture Deep Dive

### 4.1 Full System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          BROWSER (CLIENT)                           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  React Application (App.jsx)                                │    │
│  │                                                              │    │
│  │  State:                                                      │    │
│  │   - problem (string)              user's input              │    │
│  │   - phase (idle|running|done)     pipeline state machine    │    │
│  │   - activeAgent (number)          which agent is running    │    │
│  │   - results (array)               completed agent outputs   │    │
│  │   - streamingText (string)        live partial output       │    │
│  │   - expandedAgent (string|null)   UI accordion state        │    │
│  │                                                              │    │
│  │  Core functions:                                             │    │
│  │   - buildPrompt(agent, problem, previousOutputs)             │    │
│  │   - runAgent(agent, problem, previousOutputs, onChunk)       │    │
│  │   - runSimulation()  ← orchestrates the full 6-agent loop   │    │
│  │   - renderMarkdown(text)  ← custom markdown → JSX renderer  │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                        │                                            │
│                        │  fetch() with stream: true                 │
│                        ▼                                            │
└────────────────────────┼─────────────────────────────────────────────┘
                        │
                        │  HTTPS POST (SSE response)
                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  ANTHROPIC API (api.anthropic.com)                  │
│                                                                      │
│  POST /v1/messages                                                   │
│  model: claude-sonnet-4-6                                            │
│  stream: true                                                        │
│  max_tokens: 1000                                                     │
│  messages: [{ role: "user", content: <constructed prompt> }]         │
│                                                                      │
│  Returns: text/event-stream                                          │
│  data: {"type":"content_block_delta","delta":{"text":"..."}}        │
│  data: {"type":"content_block_delta","delta":{"text":"..."}}        │
│  ... (repeated for each token chunk)                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 The Orchestration Loop (Pseudocode Walkthrough)

```javascript
async function runSimulation() {
  setPhase("running")
  collected = []                          // accumulator for all agent outputs

  for (i = 0 to 5):                       // 6 agents, indices 0-5
    agent = AGENTS[i]
    setActiveAgent(i)                     // updates UI pipeline indicator
    setStreamingText("")                  // clear streaming buffer

    output = await runAgent(
      agent,
      problem,                             // original user input — never changes
      collected.map(extract agentName+output),  // all PRIOR agent outputs
      onChunk = (partial) => setStreamingText(partial)  // live UI update
    )

    collected.push({ agentId, agentName, output, ... })
    setResults([...collected])            // commits this agent as "done" in UI
    setStreamingText("")                  // clear buffer before next agent

    if not last agent:
      await sleep(600ms)                  // UX breathing room between agents

  setPhase("done")
  setExpandedAgent("memo")                // auto-open the final artifact
}
```

**Key architectural property:** `collected` grows by one entry after every agent completes, and the *entire* `collected` array is passed into `buildPrompt()` for every subsequent agent. This is the literal implementation of "sequential context passing" described in Section 3, Decision 3.

### 4.3 The Prompt Construction Function

```javascript
function buildPrompt(agent, problem, previousOutputs) {
  context = previousOutputs.length > 0
    ? "\n\nPrevious agent findings:\n" +
      previousOutputs.map(o => `[${o.agentName}]:\n${o.output}`).join("\n\n")
    : ""

  return `
    You are the ${agent.name} (${agent.role}) in an AI CPO system.
    The product problem statement is: "${problem}"
    ${context}
    Your specific mandate: ${agent.job}
    [+ formatting and tone constraints]
  `
}
```

This function is called fresh for every agent, every run. It is **stateless** — all state lives in the `collected` array passed in from the orchestration loop, not in the prompt builder itself. This separation (stateless prompt construction vs. stateful orchestration) was a deliberate design choice for testability: `buildPrompt()` can be unit tested in isolation with mock inputs, independent of the live API integration.

### 4.4 The Markdown Rendering Pipeline

A custom markdown-to-JSX renderer was built rather than using a library (e.g., `react-markdown`). This was a specific, deliberate choice:

**Why not use `react-markdown`:**
1. Adding a dependency for a narrow, controlled use case (agent outputs follow a *known, constrained* markdown subset, not arbitrary user-authored markdown) was judged as unnecessary weight
2. A custom renderer can be precisely tuned to the *exact* markdown patterns the prompts are engineered to produce (`## headers`, `**bold**`, `- bullets`), and nothing else — no need to handle tables, images, code blocks, nested lists, or other markdown features that will never appear in this controlled context
3. It keeps the entire application dependency-free beyond React itself, reinforcing the single-file portfolio readability goal from Decision 4

**The tradeoff accepted:** the custom renderer is less robust than a battle-tested library — if an agent's output ever produces an edge-case markdown pattern outside the four handled cases (`##`, `**`, `-`, plain paragraph), it will render as a plain paragraph rather than crash, which was the deliberate fail-safe design (see the final `else if` branch in `renderMarkdown()`).

---

## 5. AI Decisions — Model, Prompts, Orchestration

### 5.1 Model Selection: claude-sonnet-4-6

**Alternatives considered:**

| Model class | Why considered | Why not chosen for v1 |
|---|---|---|
| A larger, more capable reasoning model | Potentially higher-quality strategic analysis | Higher latency × 6 sequential calls = unacceptable total wait time; higher cost per run |
| A smaller, faster model | Lower latency, lower cost | Risk of shallower analysis, less reliable adherence to the structured markdown format the renderer depends on |
| **claude-sonnet-4-6 (chosen)** | Balanced reasoning quality and speed | — |

**Rationale:** With a 6-call sequential pipeline, model latency multiplies directly into total user wait time. claude-sonnet-4-6 was selected as the point on the quality/speed curve that produces consistently structured, framework-literate output (RICE scoring, AARRR references, etc.) without pushing total pipeline runtime into the multi-minute range that would degrade the demo experience.

**`max_tokens: 1000` per agent** — this cap was set based on the prompt's own instruction to produce 350-500 word responses. 1000 tokens (~750 words) provides headroom above the target without allowing runaway, unbounded generation that would both slow the pipeline and produce excessively long UI cards.

### 5.2 Agent Boundary Design — The Working-Backwards Mapping

This is the core AI/product design decision of the entire project. Agent boundaries were not chosen arbitrarily — they were derived by reverse-engineering the sections of a real Executive Product Review:

| Real Exec Review Section | Question It Answers | Agent Assigned | Agent's Narrow Mandate |
|---|---|---|---|
| Problem Diagnosis | What broke, and where? | Analytics Agent | "Identify which funnel stage broke, segment cohorts, pinpoint leading indicators" |
| Customer Evidence | Is this hurting real people, and how do we know? | Customer Voice Agent | "Synthesise support ticket themes, NPS verbatims, App Store review patterns" |
| Market Context | Are we losing to a competitor, or is this internal? | Competitive Intelligence Agent | "Analyse competitor moves, identify switching triggers and market context" |
| Forward Test Plan | What will we do to confirm and fix this? | Experimentation Agent | "Design 3 prioritised A/B experiments with hypothesis, metric, sample size, risk" |
| Roadmap Implication | What changes in our plan as a result? | Roadmap Agent | "Re-prioritise the roadmap using RICE; identify what to accelerate, pause, or kill" |
| Executive Narrative | How do we explain this upward, with a business case? | Executive Memo Agent | "Write a VP-ready memo: diagnosis, root cause, experiments, roadmap shifts, projected impact" |

**This mapping is the single most defensible design decision in the project** — every agent boundary traces directly to a real, recognisable artifact structure, not to an arbitrary decomposition.

### 5.3 Prompt Engineering Principles Applied

Full detail lives in `docs/PromptStrategy.md` within the project repository; the headline principles:

1. **Role-framing** ("You are the [Agent] in an AI CPO system") — measurably reduces generic AI hedging language across all tested prompts
2. **Explicit anti-hedging instruction** ("Do not hedge excessively. Be decisive.") — directly counteracts the default LLM tendency toward qualified, uncertain phrasing, which reads as weak product judgment in an executive context
3. **Structural format contracts** — the prompt's formatting instructions (`## headers`, bold headline, bullet structure, "Key Recommendation" closing section) were **co-designed with the markdown renderer**, not written independently. The prompt and the rendering code form a single contract; changing one without the other breaks the UI.
4. **Framework-literacy requirement** — explicitly naming RICE, ICE, HEART, AARRR, 5-Whys in the prompt ensures agents reach for real PM vocabulary rather than generic business-speak
5. **Word count discipline** (350-500 words) — serves both UX (six unlimited-length agent outputs would be unreadable) and cost control (bounds token usage predictably)

### 5.4 Context Window Management Decision

**Decision:** Pass full, unsummarised prior agent outputs as context to each subsequent agent, with no compression layer.

**Why this is safe at the current scale:** 6 agents × ~400 words average output ≈ 2,400 words (~3,200 tokens) of accumulated context by the time the final agent runs — comfortably within claude-sonnet-4-6's context window, with no risk of truncation or context-window-related quality degradation at this pipeline length.

**Why this would need to change at scale:** If this architecture were extended to 15-20 agents, or if individual agent outputs were allowed to grow beyond ~500 words, a summarisation layer between agents (compressing each agent's output to its key findings before forwarding) would become necessary to avoid context bloat and rising per-call cost. **This is explicitly flagged as a v2 architectural improvement, not implemented in v1, because it is unneeded at the current 6-agent scale** — a deliberate decision to avoid premature complexity.

---

## 6. Every Tradeoff Made, In Detail

This section consolidates every tradeoff referenced above into a single comparative table, with the explicit cost and benefit of each decision spelled out.

| # | Decision | Benefit Gained | Cost Accepted | Why The Cost Was Worth It |
|---|---|---|---|---|
| 1 | Working app over mockup/PRD | High differentiation signal in a PM portfolio | Significantly more build time and engineering risk | Differentiation value in a competitive hiring market outweighs build cost |
| 2 | 6 agents, not 3 or 10 | Each agent maps to a real artifact section with no overlap | More orchestration complexity than 3 agents; more latency than fewer agents | The mapping fidelity to a real Exec Review structure was the priority |
| 3 | Sequential, not parallel orchestration | Genuinely compounding analysis; later agents reference earlier findings | ~6× total latency vs. parallel execution (45-90s vs ~10-15s) | Output *quality* and *coherence* were prioritised over raw speed for this demo context |
| 4 | Single-file React app | One-pass readability for time-pressured reviewers | Long file (713 lines); less "enterprise-conventional" | Audience and goal (portfolio readability) differ from a production team codebase |
| 5 | Streaming output via SSE | Makes wait time feel alive; visualises multi-agent nature | Higher implementation complexity (manual SSE chunk parsing) | UX payoff judged to outweigh added implementation complexity |
| 6 | Custom markdown renderer (no library) | Zero extra dependencies; precisely tuned to known output patterns | Less robust to edge-case markdown the agents might occasionally produce | Controlled, narrow use case made a custom solution lower-risk than it would be for general markdown |
| 7 | claude-sonnet-4-6 over a larger reasoning model | Acceptable total pipeline latency; lower cost per run | Potentially less deep strategic reasoning than a larger model could produce | 6× latency multiplication made a larger model's added latency cost prohibitive for the demo UX |
| 8 | No context summarisation layer between agents | Simpler implementation; nothing lost at current scale | Would not scale cleanly past ~10-15 agents or longer outputs without rework | Premature optimisation avoided; flagged explicitly as a v2 item instead of over-engineering v1 |
| 9 | Direct browser-to-Anthropic-API calls (no proxy) | Simplest possible implementation for a sandboxed demo | Breaks in real production deployment due to CORS + API key exposure | Acceptable for v1 demo context; documented serverless-proxy fix provided for production readiness |
| 10 | Simulated/illustrative data rather than real analytics integration | Dramatically faster to build; no OAuth/integration complexity | Cannot claim the output reflects real customer data | Explicitly and honestly disclosed in every public-facing document — see Section 11 |
| 11 | Whole-pipeline retry on any agent failure (no per-agent resume) | Simpler error-handling code | User must restart all 6 agents if agent 5 fails, wasting completed work | Accepted for v1; flagged as a clear v2 improvement (see Section 12) |

---

## 7. Step-by-Step Implementation Log

This is a chronological account of how the project was actually built, structured as a real implementation log.

### Phase 1 — Problem Framing & Agent Design (Pre-Code)
1. Defined the target output artifact (Executive Product Review) before writing any code
2. Reverse-engineered the 6 sections such a review needs
3. Mapped each section to a candidate agent with a named role and narrow mandate
4. Validated the mapping had no significant content overlap between agents
5. Drafted example problem statements (the 5 example prompts in the final UI) to stress-test whether the agent boundaries would hold up across different crisis types (retention, conversion, NPS, DAU, trial conversion)

### Phase 2 — Prompt Architecture
6. Designed the shared prompt template structure (role-framing → problem → prior context → mandate → format constraints)
7. Wrote the per-agent `job` field for all 6 agents
8. Decided on the structural format contract (headline, `##` headers, bullets, "Key Recommendation" close) — this was decided *before* the renderer was built, so the renderer could be built to match the contract exactly

### Phase 3 — Core Application Logic
9. Built `buildPrompt()` as a pure, stateless function
10. Built `runAgent()` to handle the streaming fetch call and SSE chunk parsing
11. Built `runSimulation()` as the orchestration loop tying together sequential execution, context accumulation, and UI state updates
12. Built `renderMarkdown()` as the custom JSX renderer matching the format contract from step 8

### Phase 4 — UI/UX Construction
13. Designed the dark, executive-tool visual aesthetic (deep near-black background, accent indigo/gold, card-based layout) — deliberately avoiding a "playful AI chatbot" visual register in favour of something that reads as a serious analytical tool
14. Built the agent pipeline progress indicator (the row of pills showing each agent's icon, name, and completion state)
15. Built the live-streaming agent card (shown only for the currently active agent)
16. Built the collapsed/expandable completed-agent cards (accordion pattern, to keep the page scannable once multiple agents have completed)
17. Built the highlighted, always-expanded Executive Memo card with distinct gold styling to visually mark it as the "final artifact," distinct from the five supporting agent analyses

### Phase 5 — State Machine & Edge Cases
18. Implemented the `phase` state machine (`idle → running → done`, with error handling collapsing back to `idle`)
19. Implemented auto-scroll-to-bottom behaviour during streaming so the live output stays in view
20. Implemented the "auto-expand the Executive Memo" behaviour on pipeline completion, so the user's attention lands on the final synthesised artifact without requiring a manual click
21. Implemented error handling: any agent failure halts the pipeline, surfaces the error message, and preserves all previously completed agent cards rather than discarding them

### Phase 6 — Packaging for Distribution
22. Extracted the single-file app into a proper Vite + React project structure (`package.json`, `vite.config.js`, `index.html`, `src/main.jsx`) so it can be cloned and run independently of the artifact sandbox it was originally prototyped in
23. Wrote `.env.example` and `.gitignore` to establish a safe pattern for local API key handling
24. Wrote the full documentation set (`README.md`, `docs/AgentDesign.md`, `docs/PromptStrategy.md`, `docs/ProductThinking.md`, `docs/InterviewScript.md`) to make the project's reasoning legible to a reader who never sees the build process directly
25. Wrote this document — the comprehensive end-to-end record — as the final artifact tying every decision back to its rationale

---

## 8. Technical Challenges & How They Were Solved

### Challenge 1: Getting consistent markdown structure out of the LLM
**Problem:** Early prompt iterations produced inconsistent output — sometimes headers, sometimes plain paragraphs, sometimes bullet styles that varied between `-` and `•` and `*`.
**Solution:** Tightened the prompt's format instructions to explicitly specify `##` for headers and `-` for bullets (not `•` or `*`), and added the explicit structural checklist (headline → 3-5 `##` sections → "Key Recommendation" close) as a hard format contract rather than a soft suggestion. This is the co-design referenced in Section 4.4 and 5.3.

### Challenge 2: Streaming state management without UI flicker
**Problem:** Naively updating React state on every single SSE chunk caused visible flicker and excessive re-renders during streaming.
**Solution:** Accumulated the full streamed text in a local variable (`full`) inside `runAgent()`, calling `onChunk(full)` with the complete accumulated string on each update rather than just the delta — this keeps React's rendering simple (always rendering the full current text, no diffing logic needed) at the cost of slightly more string concatenation work, which is computationally negligible at this text length.

### Challenge 3: Sequencing UI state with async agent execution
**Problem:** Coordinating `activeAgent` (which agent is currently highlighted), `streamingText` (its live partial output), and `results` (the array of completed agents) needed careful ordering to avoid showing stale or contradictory UI states (e.g., an agent appearing both "active" and "complete" simultaneously).
**Solution:** Strict ordering within the `for` loop in `runSimulation()`: set `activeAgent` and clear `streamingText` *before* awaiting the agent call; only push to `collected`/`results` and clear `streamingText` again *after* the agent call resolves. This ordering guarantees the UI never shows two agents as simultaneously active.

### Challenge 4: Making the wait time feel intentional, not broken
**Problem:** A 45-90 second total pipeline runtime risks feeling like the application has frozen, especially for a user unfamiliar with the multi-agent architecture.
**Solution:** Three layered UX signals working together: (1) the pipeline progress pills showing real-time agent-by-agent completion, (2) the streaming text itself proving the system is actively working, (3) a small animated "thinking" indicator (three bouncing dots) on the active agent card. No single signal alone solved this; the combination was necessary.

---

## 9. Outcome & What Was Actually Delivered

### Deliverable 1: A working, deployable application
A complete React + Vite application (`ai-cpo-simulator/`) that runs locally with `npm install && npm run dev`, and is deployable to Vercel/Netlify with a documented serverless-proxy fix for production API security.

### Deliverable 2: A fully documented architecture
Five supporting documents (`README.md` + 4 files in `docs/`) that make every architectural decision, prompt engineering choice, and product rationale explicit and reviewable — designed so that a reader never has to guess *why* something was built a certain way.

### Deliverable 3: A demonstrable, narratable interview asset
A 90-second live demo script and a 60-second verbal pitch (in `docs/InterviewScript.md`), plus pre-written, honest answers to the hardest likely interviewer questions (including the question "is this connected to real data?" — answered honestly rather than evasively).

### Deliverable 4: This document
A single comprehensive record tying every decision, tradeoff, and outcome together — designed to serve as both an interview-prep resource and a demonstration, in itself, of structured product thinking and thorough documentation practice.

### What "Done" Means For This Project
"Done" for a portfolio artifact is not the same as "done" for a commercial product. This project is considered complete at v1 when:
- ✅ It runs end-to-end without errors for the example prompts provided
- ✅ All 6 agents produce structurally consistent, readable output
- ✅ The Executive Memo genuinely synthesises (not just lists) the prior 5 agents' findings
- ✅ The architecture and every major decision is documented with honest rationale
- ✅ The known limitations are disclosed, not hidden
- ✅ A clear, credible v2 roadmap exists (see Section 12)

All six conditions are met as of this document's writing.

---

## 10. Metrics Framework — How Success Is Defined

Because this is a portfolio/demo project rather than a live product with real users, "metrics" here are defined across two layers: **simulated in-app metrics** (what the agents discuss) and **real meta-metrics** (how the project itself performs as a portfolio asset).

### 10.1 Simulated In-App Metrics (What the Agents Reason About)

These are the *types* of metrics the agents are prompted to generate within their simulated analysis — illustrative, not pulled from real data:

| Agent | Example Metric Type Generated |
|---|---|
| Analytics Agent | D30 retention %, funnel stage conversion rates, cohort comparison deltas |
| Customer Voice Agent | Support ticket volume by theme, NPS verbatim sentiment distribution |
| Competitive Intelligence Agent | Feature gap counts, estimated switching rate signals |
| Experimentation Agent | Minimum detectable effect (MDE) estimates, sample size rationale |
| Roadmap Agent | RICE scores (Reach × Impact × Confidence ÷ Effort) per initiative |
| Executive Memo Agent | Projected business impact (e.g., estimated revenue/retention recovery) |

**Honest framing maintained throughout all documentation:** these are illustrative numbers generated by the LLM to be realistic and internally consistent within a simulated scenario — not measurements of any real product.

### 10.2 Real Meta-Metrics — How This Project's Success Is Actually Measured

| Metric | Definition | How It's Evaluated |
|---|---|---|
| **Functional completeness** | Does the full 6-agent pipeline run end-to-end without crashing? | Manual testing across all 5 example prompts |
| **Output structural consistency** | Do all 6 agents produce parseable markdown matching the renderer's expected format? | Visual inspection across multiple runs |
| **Synthesis quality (qualitative)** | Does the Executive Memo demonstrably reference findings from prior agents, rather than just repeating the original problem statement? | Manual review — checking for explicit cross-references in memo output |
| **Documentation completeness** | Is every major decision traceable to a stated rationale? | This document and `docs/AgentDesign.md` / `docs/PromptStrategy.md` serve as the audit trail |
| **Interview readiness** | Can the project be demoed live in under 2 minutes and explained verbally in under 90 seconds without notes? | `docs/InterviewScript.md` — tested against the described demo flow |
| **Honest disclosure** | Are all limitations and simulated (non-real) elements clearly and proactively disclosed, rather than glossed over? | Cross-referenced against Section 11 of this document |

### 10.3 What Would Be Measured If This Became a Real Product

If this architecture were extended into an actual internal tool connected to real data sources, the metrics framework would shift to:

- **Time-to-diagnosis** — wall-clock time from metric alert to completed Executive Product Review (target: minutes, not days)
- **Diagnosis accuracy** — when validated against actual root causes found by human analysts after the fact, what % of AI-generated root-cause hypotheses were directionally correct?
- **Adoption rate** — % of actual product crises where the team chose to run the AI pipeline rather than only manual analysis
- **Executive trust score** — survey-based measure of whether VPs/executives found the AI-generated memo's recommendations credible enough to act on without requiring a fully independent human re-analysis

This forward-looking metrics framework is deliberately included to demonstrate the ability to think past the prototype stage into real operational measurement — a skill explicitly valued in AI product management roles.

---

## 11. Known Limitations — Honest Accounting

This section exists because overclaiming is the single most common and most damaging failure mode in a technical portfolio project. Every limitation below is disclosed proactively, matching the disclosure already present in `docs/ProductThinking.md` and `docs/InterviewScript.md`.

| Limitation | Detail | Why It Exists | Plan to Address |
|---|---|---|---|
| **No real data integration** | All agent outputs are LLM-generated, illustrative analysis based solely on the text problem statement — not connected to any real analytics, support ticket, or competitive intelligence system | Building real integrations (OAuth flows, API connectors for Amplitude/Zendesk/etc.) was out of scope for a portfolio timeline | v2 roadmap item — see Section 12 |
| **CORS / API key exposure in current deployment pattern** | Direct browser-to-Anthropic-API calls work only in a sandboxed environment; a real public deployment needs a server-side proxy | Avoiding backend infrastructure kept v1 build complexity manageable | Documented fix provided in `docs/AgentDesign.md`; planned for v2 |
| **No per-agent retry / partial failure recovery** | If any agent in the sequence fails, the entire 6-agent run must restart from agent 1 | Simpler error-handling logic for v1 | v2 roadmap item — see Section 12 |
| **No automated testing** | No unit tests for `buildPrompt()`, no integration tests for the orchestration loop | Time constraints; manual testing was used instead | v2 roadmap item — see Section 12 |
| **Single example domain (metric-crisis diagnosis)** | The system is narrowly scoped to one type of product problem; it does not generalise to, e.g., a feature prioritisation request or a pricing strategy question | Deliberate scope discipline (see Section 2, Non-Goals) | Could be extended with additional "problem type" agent configurations in future versions |
| **No persistence** | Results are not saved; refreshing the page loses the completed analysis | No backend/database in v1 | Could add local storage or a lightweight backend in v2 |
| **English-only** | All prompts and expected output are in English | Scope discipline; multilingual support was not a goal for v1 | Not currently planned — out of scope for this project's purpose |

---

## 12. Future Roadmap — v2, v3, and Beyond

### v1.1 — Near-Term Hardening (small, high-value fixes)
- Implement the documented serverless-proxy pattern so the app can be safely deployed to a real public URL with the API key secured server-side
- Add per-agent retry logic — if agent 4 fails, allow resuming from agent 4 rather than restarting the full pipeline
- Add basic unit tests for `buildPrompt()` and the markdown renderer, since these are pure functions and straightforward to test in isolation

### v2 — Real Data Integration (the highest-leverage next step)
Replace simulated reasoning with real data connectors for each agent:

| Agent | v1 (Simulated) | v2 (Real Integration) |
|---|---|---|
| Analytics Agent | LLM-generated illustrative funnel analysis | Live query against a connected analytics API (e.g., Amplitude, Mixpanel) scoped to the relevant date range and metric |
| Customer Voice Agent | LLM-generated illustrative ticket themes | Real support ticket pull (e.g., Zendesk/Intercom API) with actual clustering/sentiment analysis on real ticket text |
| Competitive Intelligence Agent | LLM-generated illustrative market context | Web search integration (already demonstrated as a capability in other parts of this portfolio) to pull real, current competitor news and feature launches |
| Experimentation Agent | LLM-generated illustrative test designs | Could integrate with a real experimentation platform's API to check for already-running or already-tested overlapping experiments, avoiding duplicate test proposals |
| Roadmap Agent | LLM-generated illustrative RICE scores | Could integrate with a real roadmap tool (e.g., Productboard, Jira) to re-prioritise actual backlog items rather than generating illustrative ones |
| Executive Memo Agent | Synthesises the above | Synthesises real, integration-sourced findings — at this point the memo's business impact projections would be grounded in real numbers, not illustrative ones |

This is explicitly the single most important next step, because it is the one change that would convert this from "a compelling demonstration of agentic architecture" into "a genuinely useful internal product tool."

### v2 — Context Summarisation Layer
As discussed in Section 5.4, once individual agent outputs grow or the agent count increases, add a summarisation step between agents — each agent's raw output gets compressed to a structured key-findings object before being passed to the next agent, preventing unbounded context growth.

### v2 — Confidence Calibration
Have each agent explicitly tag which of its claims are "high confidence / directly evidenced" vs. "illustrative / inferred" — making the simulated nature of any remaining non-integrated reasoning transparent *within* the output itself, not just in external documentation.

### v3 — Multi-Problem-Type Support
Extend beyond "metric crisis diagnosis" to other recurring PM problem archetypes:
- Feature prioritisation requests ("We have 12 feature requests and capacity for 3 — which do we build?")
- Pricing strategy questions ("Should we introduce a new pricing tier?")
- Competitive response planning ("A competitor just launched X — how should we respond?")

Each archetype would likely warrant a different 5-7 agent configuration, reusing the same orchestration engine (`runSimulation()`, `buildPrompt()`, the streaming/rendering infrastructure) with a swapped `AGENTS` array — demonstrating that the underlying architecture, not just the specific 6 agents, is the genuinely reusable asset.

### v3 — Human-in-the-Loop Editing
Allow a user to edit or annotate any agent's output before it's passed forward to the next agent — e.g., a real PM reviewing the Analytics Agent's output, correcting a misread assumption, and having that correction flow into the Customer Voice Agent's context. This would convert the tool from "fully autonomous simulation" into "AI-augmented analyst workflow," which is arguably the more realistic and more valuable real-world deployment pattern.

### v3 — Multi-Model Comparison Mode
Run the same agent pipeline using different underlying models (e.g., compare claude-sonnet-4-6 output against a different model's output for the same agent) to demonstrate model evaluation thinking — directly relevant to AI PM roles that require model selection and evaluation literacy.

---

## 13. Lessons Learned

### On agent architecture
The single highest-leverage decision in the entire project was deriving agent boundaries from the target output document's structure, rather than from an abstract sense of "what functions exist in a product org." Working backwards from the artifact, not forwards from an org chart, produced cleaner, less overlapping agent mandates.

### On prompt engineering
Prompt engineering and UI rendering cannot be designed independently when the output needs to drive structured UI. The format contract between the prompt's instructions and the renderer's parsing logic is a single, co-designed system — treating them as separate concerns early in the build led to inconsistent rendering that had to be fixed by tightening the prompt, not the renderer.

### On scope discipline
The decision to *not* build real data integrations in v1, and to be explicit and honest about that limitation everywhere it's discussed, was itself a product decision worth making deliberately. A narrower, fully-working, honestly-disclosed v1 is a stronger artifact than a broader, partially-working, vaguely-described one.

### On portfolio-building as a discipline
Treating a personal project with the same documentation rigor as a real product — PRDs, architecture docs, decision logs, honest limitations sections — is itself the skill being demonstrated. The quality of *this document* is as much the deliverable as the application code is.

---

## 14. Appendix — Full Decision Log

| Decision ID | Decision | Date Context | Status |
|---|---|---|---|
| D-01 | Build working app over mockup/PRD | Project inception | ✅ Implemented |
| D-02 | 6 agents derived from Exec Review structure | Pre-code design phase | ✅ Implemented |
| D-03 | Sequential orchestration over parallel | Pre-code design phase | ✅ Implemented |
| D-04 | Single-file React app | Build phase start | ✅ Implemented |
| D-05 | Streaming SSE output | Build phase start | ✅ Implemented |
| D-06 | Custom markdown renderer, no library | Build phase | ✅ Implemented |
| D-07 | claude-sonnet-4-6 model selection | Build phase | ✅ Implemented |
| D-08 | No context summarisation layer (v1) | Build phase | ✅ Implemented (v1 scope) — flagged for v2 |
| D-09 | Direct browser API calls (no proxy, v1) | Build phase | ✅ Implemented (v1 scope) — documented fix for production |
| D-10 | Simulated data, no real integrations (v1) | Project scoping | ✅ Implemented (v1 scope) — flagged as top v2 priority |
| D-11 | Whole-pipeline retry, no per-agent resume (v1) | Build phase | ✅ Implemented (v1 scope) — flagged for v2 |
| D-12 | Honest, proactive limitations disclosure | Documentation phase | ✅ Implemented throughout all docs |

---

*This document is the single source of truth for the AI CPO Simulator project's full lifecycle — decisions, tradeoffs, implementation, outcomes, and roadmap. Authored by Nikhil Tiwari. Proprietary — see LICENSE.md.*
