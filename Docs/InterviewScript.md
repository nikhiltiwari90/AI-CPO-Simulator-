# Interview Script
## AI CPO Simulator — How to Demo & Talk About This
**Author:** Nikhil Tiwari

---

## The 90-Second Live Demo Flow

If you have screen-share access in an interview:

1. **Open the app.** Say: *"This is something I built to demonstrate agentic AI product thinking — not a chatbot, an autonomous product intelligence pipeline."*

2. **Type an example prompt** (or click one of the pre-filled examples): *"Our D30 retention dropped 18% after our v3.2 launch last month."*

3. **Click "Run AI CPO Analysis"** and narrate while it streams: *"Six agents are now running in sequence. Watch — the Analytics Agent goes first and diagnoses the root cause. Then the Customer Voice Agent picks up that context and synthesises what customers are likely saying. Each agent builds on what came before."*

4. **Let it run to completion** (~60-90 seconds). While waiting, you can say: *"This is real-time streaming from Claude's API — I wanted the multi-agent nature of the system to be visible, not just described."*

5. **Land on the Executive Memo.** Say: *"This is the final artifact — a VP-ready Executive Product Review, synthesised from all 5 prior agents. This is the kind of document a real CPO would bring to a board meeting."*

---

## The 60-Second Verbal Pitch (No Screen Share)

> "I built an AI CPO Simulator — a working agentic system where you describe a product metric crisis, and six specialised AI agents run in sequence: Product Analytics, Customer Voice, Competitive Intelligence, Experimentation, Roadmap, and finally an Executive Memo agent that synthesises everything into a VP-ready Product Review.

> The key design decision was sequential, not parallel agents — each agent receives the full output of every previous agent as context, so by the time you get to the Executive Memo, it's not summarising six disconnected answers, it's synthesising a genuinely compounding analysis.

> I designed the agent boundaries by working backwards from what a real Executive Product Review needs: diagnosis, customer impact, competitive context, a forward experimentation plan, roadmap implications, and a business case. Each of those became one agent's mandate.

> It's built in React with streaming responses from Claude's API, so you watch each agent think in real time rather than waiting for a black-box result."

---

## Likely Interview Questions & Answers

---

### "Walk me through how you decided on these specific 6 agents."

> "I worked backwards from the output I wanted: a real Executive Product Review. I asked myself — what sections does a VP actually need to see in that document? Problem diagnosis, customer evidence, market context, a forward test plan, roadmap implications, and business impact. Each of those became one agent's job. The agent boundaries aren't arbitrary — they're derived from the structure of the artifact I was working backwards from."

---

### "Is this connected to real data?"

> "No, and I want to be upfront about that. This simulates the *type* of analysis a connected system would produce based on the problem statement alone. The metrics in the output are illustrative, generated to be realistic and structurally correct — not pulled from a real dataset. What I'm demonstrating is the orchestration architecture: how you'd structure a multi-agent system with compounding context. In a production version, Agent 1 would query a real analytics API like Amplitude, Agent 2 would pull real support tickets via an integration, and so on. The architecture is the transferable part."

---

### "Why sequential agents instead of parallel?"

> "Because that's how real product organisations reason. The data team's findings shape what customer feedback you go looking for. The competitive context shapes what experiments make sense. If you ran all six in parallel, you'd get six disconnected reports that someone still has to manually synthesise — which defeats the purpose. Sequential design with context passing means the system does the synthesis work itself, progressively, the same way a sharp product leader builds an argument."

---

### "What was the hardest technical part?"

> "Two things. First, getting consistent markdown structure out of the LLM across six different agent prompts, so my custom renderer could reliably parse headers, bullets, and bold text without breaking. I ended up co-designing the prompt format constraints and the renderer together rather than treating them as separate problems.

> Second, managing the streaming UX across a sequential pipeline — I wanted each agent's output to stream in real-time, then collapse into a summary card, then the next agent starts. Getting that state management right in React, especially making sure the scroll position and expand/collapse state felt natural, took more iteration than the AI integration itself."

---

### "What would you change if you were building this for production?"

> "Three things. First, I'd move the API calls behind a serverless proxy — right now it's calling Anthropic's API directly from the browser, which only works in a sandboxed environment, not a real deployment, because of CORS and API key exposure. Second, I'd connect each agent to real data sources instead of simulated reasoning. Third, I'd add per-agent retry logic — right now if any agent fails, the whole pipeline has to restart, which isn't acceptable for a production tool."

---

### "How does this relate to your PM experience?"

> "Directly. The hardest part of this project wasn't the React code or the API integration — it was deeply internalising what a real Executive Product Review needs to contain, narrowly enough that I could decompose it into six distinct, non-overlapping agent mandates. That's the same synthesis-under-ambiguity skill that any PM role requires. Building this forced me to be explicit about something senior PMs do intuitively."

---

## What NOT to Say

- Don't claim this is connected to real product data — it isn't, and overclaiming will be caught immediately by any technical interviewer who asks a follow-up
- Don't call it "just a chatbot wrapper" — be precise: it's a sequential multi-agent orchestration system with context passing
- Don't oversell the React complexity — be honest that the agent design and prompt engineering were harder than the frontend code
- Don't pretend the metrics in the output are real — they're illustrative, generated for realism within a simulated scenario

---

*Interview script authored by Nikhil Tiwari · Proprietary — see LICENSE.md*
