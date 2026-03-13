import type { Scenario } from './types';

export const SCENARIOS: Record<string, Scenario> = {
  'learning-arc': {
    id: 'learning-arc',
    name: 'The Learning Arc',
    description: '5 calls — watch the agent go from blank to strategic',
    conversations: [
      {
        label: 'Call 1 — First Prospect',
        entityId: 'prospect_alpha',
        turns: [
          {
            role: 'user',
            content:
              "Hi, I'm Sarah from TechCorp. We're evaluating memory solutions for our AI agents. What's your pricing look like?",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "We currently use Redis with some custom code on top. It works but we spend a lot of engineering time maintaining it. Our main concern is cost — we need to justify the switch.",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
      {
        label: 'Call 2 — Same Objection, Different Prospect',
        entityId: 'prospect_beta',
        turns: [
          {
            role: 'user',
            content:
              "I'm Mike from DataFlow. We've been looking at agent memory solutions. Honestly, what does this cost? That's the first question from our CFO.",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "We tried building something in-house with Pinecone but it's just vector search — no real learning. Still, the cost question is going to come up.",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
      {
        label: 'Call 3 — Competitor Intelligence',
        entityId: 'prospect_gamma',
        turns: [
          {
            role: 'user',
            content:
              "We're also looking at Mem0. They seem to offer something similar. Why should we go with HEBBS instead?",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "Our biggest pain point is that our agents forget context between sessions. A customer calls back and the agent has no idea what happened last time. It's embarrassing.",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
      {
        label: 'Call 4 — ROI Focused',
        entityId: 'prospect_delta',
        turns: [
          {
            role: 'user',
            content:
              "I need hard numbers. What kind of ROI are your customers seeing? Our engineering team costs $200/hr and they spend 15 hours a week maintaining our memory system.",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "Also, how fast is recall? We need sub-10ms latency for our real-time voice agents. That's non-negotiable.",
            delayMs: 2000,
          },
        ],
        reflectAfter: true,
      },
      {
        label: 'Call 5 — Post-Insight Conversation',
        entityId: 'prospect_epsilon',
        turns: [
          {
            role: 'user',
            content:
              "We're a Series B startup, 50 engineers. Our AI agents serve 10k customers. Pricing is always the first question from our board. What's the value prop?",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "We were looking at competitors but they all seem like glorified vector databases. What makes HEBBS actually different?",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
    ],
  },

  'returning-customer': {
    id: 'returning-customer',
    name: 'Returning Customer',
    description: 'The agent remembers — 2 weeks later',
    conversations: [
      {
        label: 'Call 1 — Initial Discovery',
        entityId: 'acme_corp',
        turns: [
          {
            role: 'user',
            content:
              "Hi, I'm Jennifer from Acme Corp. We run a support platform with about 50,000 tickets a month through Zendesk. We're drowning in repeat questions.",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "Our biggest deadline is Q4 — we need something deployed before Black Friday. Our VP of Engineering, David Chen, is the final decision maker.",
            delayMs: 2000,
          },
          {
            role: 'user',
            content:
              "Budget-wise, we can go up to $5k/month if the ROI is clear. Our current solution costs us about $3k/month in Pinecone plus engineering overhead.",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
      {
        label: '— 2 weeks later —',
        entityId: 'acme_corp',
        turns: [
          { role: 'system-label', content: '2 weeks later…', delayMs: 2000 },
          {
            role: 'user',
            content:
              "Hey, it's Jennifer again from Acme. We've been evaluating a few options. Can we pick up where we left off?",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "David wants to know about the SSO integration. That's become a blocker for our security review.",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
    ],
  },

  'world-changed': {
    id: 'world-changed',
    name: 'World Changed',
    description: 'Belief revision — insights cascade and rebuild',
    conversations: [
      {
        label: 'Call 1 — Learning Competitor Gap',
        entityId: 'prospect_world',
        turns: [
          {
            role: 'user',
            content:
              "We're comparing HEBBS with CompetitorX. One thing I noticed is that CompetitorX doesn't support SSO at all. Is that true?",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "SSO is critical for us. Every enterprise deal falls apart without it. If CompetitorX truly lacks SSO, that's a huge differentiator for you.",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
      {
        label: 'Call 2 — Using Competitor Intel',
        entityId: 'prospect_world_2',
        turns: [
          {
            role: 'user',
            content:
              "We're looking at both HEBBS and CompetitorX. What's your honest take on how you compare?",
            delayMs: 1500,
          },
          {
            role: 'user',
            content:
              "Enterprise security features are our top priority — SSO, audit logs, encryption at rest. We can't compromise on any of them.",
            delayMs: 2000,
          },
        ],
        reflectAfter: false,
      },
      {
        label: 'Call 3 — Reinforcing the Pattern',
        entityId: 'prospect_world_3',
        turns: [
          {
            role: 'user',
            content:
              "My CTO asked me to compare your security features against CompetitorX. He's particularly focused on authentication.",
            delayMs: 1500,
          },
        ],
        reflectAfter: true,
      },
    ],
  },
};
