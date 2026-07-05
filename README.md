# AI CPO Simulator ⚡
### Autonomous Product Intelligence System — 6 Agents · VP-Ready Output

**Author:** Nikhil Tiwari — Product Manager Portfolio
**Stack:** React · Anthropic Claude API · Streaming · Agentic AI

> *"What if a VP of Product had six autonomous AI analysts who could diagnose any product crisis in under 3 minutes?"*

---

## What This Is

A working agentic AI system where a single product problem statement triggers **6 specialised AI agents** running in sequence, each building on the previous agent's output, producing a complete **Executive Product Review** — the kind of artifact a CPO would bring to a board meeting.

This is not a chatbot. This is not a PM copilot. This is an **autonomous product intelligence pipeline**.

---

## The 6 Agents

| # | Agent | Role | Output |
|---|---|---|---|
| 1 | 📊 Product Analytics Agent | Root Cause Analyst | Funnel diagnosis, cohort analysis, leading indicators |
| 2 | 💬 Customer Voice Agent | VOC Synthesiser | Support ticket themes, NPS verbatims, user sentiment |
| 3 | 🔭 Competitive Intelligence Agent | Market Analyst | Competitor moves, switching triggers, market context |
| 4 | 🧪 Experimentation Agent | A/B Test Designer | 3 prioritised experiments with hypothesis + metrics |
| 5 | 🗺️ Roadmap Agent | RICE Prioritiser | What to accelerate, pause, or kill |
| 6 | 📋 Executive Memo Agent | Strategy Writer | VP-ready Executive Product Review memo |

Each agent receives the full output of all previous agents as context — creating a **compounding intelligence pipeline**, not isolated responses.

---

## Example Input → Output

**Input:**
> "Our D30 retention dropped 18% after our v3.2 launch last month."

**Output:** A complete Executive Product Review including:
- Root cause diagnosis with funnel analysis
- Customer sentiment synthesis
- Competitive context
- 3 A/B experiments with RICE-scored priority
- Roadmap re-prioritisation
- VP-ready strategy memo with projected business impact

---

## Why This Shows PM Depth

This project demonstrates simultaneously:

- **AI-native product thinking** — decomposing a product problem into specialised agent tasks
- **Product analytics** — the analytics agent uses real frameworks (AARRR, cohort analysis, leading/lagging indicators)
- **Experimentation design** — hypothesis-first, metric-driven A/B test design
- **Roadmap prioritisation** — RICE scoring, trade-off reasoning
- **Executive communication** — VP-ready memo structure
- **Agentic AI architecture** — sequential agents with shared context, not parallel isolated calls
- **Systems thinking** — understanding how product, data, customer voice, and strategy interconnect

---

## Tech Stack

```
Frontend:    React (JSX) · No framework overhead
AI:          Anthropic Claude claude-sonnet-4-6 via /v1/messages
Streaming:   Server-Sent Events (SSE) for real-time agent output
State:       React hooks (useState, useEffect, useRef)
Styling:     Inline design tokens — no CSS framework dependency
Deploy:      Vite · Vercel / Netlify (zero config)
```

---

## Project Structure

```
ai-cpo-simulator/
├── README.md                    ← You are here
├── LICENSE.md                   ← © Nikhil Tiwari
├── package.json                 ← Vite + React setup
├── vite.config.js               ← Dev server config
├── index.html                   ← Entry point
├── .env.example                 ← API key template
├── .gitignore
├── src/
│   ├── App.jsx                  ← Main application (single file, 713 lines)
│   └── main.jsx                 ← React entry
├── public/
│   └── favicon.svg
└── docs/
    ├── PROJECT_MASTER_DOCUMENT.md ← ⭐ Complete end-to-end record: every
    │                                 decision, tradeoff, implementation
    │                                 step, outcome, metric, and future
    │                                 roadmap item. Start here for depth.
    ├── AgentDesign.md            ← Agent architecture decisions
    ├── PromptStrategy.md         ← Prompt engineering approach
    ├── ProductThinking.md        ← Why this product matters + PRD framing
    └── InterviewScript.md        ← How to demo + talk about this
```

> **For the complete project story** — every architectural decision, every tradeoff with its accepted cost, the full implementation log, honest limitations, and the v2/v3 roadmap — see [`docs/PROJECT_MASTER_DOCUMENT.md`](docs/PROJECT_MASTER_DOCUMENT.md). It's the single source of truth for this project's reasoning.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/nikhiltiwari/ai-cpo-simulator
cd ai-cpo-simulator

# 2. Install
npm install

# 3. Add your Anthropic API key
cp .env.example .env
# Edit .env and add: VITE_ANTHROPIC_API_KEY=your_key_here

# 4. Run
npm run dev
```

Visit `http://localhost:5173`

---

## Deploy to Vercel (2 minutes)

```bash
npm install -g vercel
vercel --prod
```
Set environment variable `VITE_ANTHROPIC_API_KEY` in the Vercel dashboard under Project Settings → Environment Variables.

**Note on CORS:** The Anthropic API does not allow direct browser calls in production due to CORS restrictions. For a production deploy, route requests through a lightweight serverless function (Vercel Edge Function / Netlify Function) that holds the API key server-side. A sample proxy function is included in `docs/AgentDesign.md`.

---

## Design Decisions

### Why sequential agents, not parallel?
Each agent builds on previous findings. The Experimentation Agent designs better experiments when it knows what the Analytics Agent found. The Executive Memo Agent writes a better memo when it has all 5 previous analyses as context. **Sequencing creates compounding intelligence**, not just six disconnected answers.

### Why streaming?
Watching an agent think in real-time is qualitatively different from waiting for a result. It makes the agentic nature of the system viscerally clear — you see each agent working independently, then handing off to the next.

### Why a single React file for the app?
Portfolio projects should be readable in one pass. A recruiter or hiring manager opening the source should understand the entire system without jumping between a dozen files.

### Why Claude claude-sonnet-4-6?
Optimal balance of reasoning quality and speed for a 6-agent sequential pipeline. claude-sonnet-4-6 produces structured, PM-quality output consistently without the latency cost of a larger model across 6 sequential calls.

---

## PM Frameworks Used by the Agents

The agents are prompted to apply real PM frameworks, not just sound smart:

- **Analytics Agent:** AARRR, cohort analysis, D1/D7/D30 retention, leading vs lagging indicators
- **Customer Voice Agent:** NPS verbatim synthesis, support ticket clustering, sentiment arc
- **Competitive Agent:** Switching cost analysis, feature gap mapping, market positioning
- **Experimentation Agent:** Hypothesis-driven design, MDE reasoning, RICE-prioritised test backlog
- **Roadmap Agent:** RICE scoring (Reach × Impact × Confidence / Effort), MoSCoW triage
- **Executive Memo Agent:** Pyramid Principle structure, quantified business impact

---

## What Recruiters See

When a recruiter or hiring manager opens this project:

1. **Can build AI products** — not just describe them in a resume bullet
2. **Understands agentic AI** — agent design, context passing, sequential orchestration
3. **Knows PM frameworks** — used correctly inside prompts, not just name-dropped
4. **Executive communication** — the memo output reads like something a real CPO would write
5. **Systems thinker** — decomposed a vague, messy problem into 6 specialised agents with clean handoffs
6. **Ships** — this is a working product with a live demo, not a slide deck

---

*© 2026 Nikhil Tiwari. All rights reserved. See LICENSE.md.*
