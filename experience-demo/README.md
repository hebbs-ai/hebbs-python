# HEBBS Experience Demo

A self-serve web playground where anyone — in under 3 minutes, with zero setup — watches an AI agent go from dumb to expert across conversations, with every HEBBS operation rendered in real-time.

## Quick Start (Local Development)

### Prerequisites

- Node.js >= 18
- A running HEBBS server (gRPC on port 6380)
- An OpenAI API key

### Setup

```bash
cd experience-demo
npm install

# Copy environment template and fill in your keys
cp .env.example .env.local
```

Edit `.env.local`:

```env
HEBBS_SERVER_ADDRESS=localhost:6380
HEBBS_API_KEY=hb_your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
LLM_MODEL=gpt-4o
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000/playground](http://localhost:3000/playground).

---

## Architecture

```
Browser (Client)                Next.js API Routes (Server)         HEBBS Server
┌──────────────┐               ┌──────────────────────┐           ┌─────────────┐
│  React App   │──fetch──────▶ │  /api/hebbs/*        │──gRPC──▶  │  Port 6380  │
│  (3 panels)  │               │  (@hebbs/sdk)        │           │  (RocksDB)  │
│              │──fetch──────▶ │  /api/chat           │──HTTP──▶  │             │
│              │               │  (OpenAI SDK)        │           └─────────────┘
└──────────────┘               └──────────────────────┘                    │
                                                                    ┌─────┴──────┐
                                                                    │ LLM for    │
                                                                    │ reflect()  │
                                                                    └────────────┘
```

**Why this architecture:**

1. **gRPC cannot run in browsers.** `@hebbs/sdk` uses `@grpc/grpc-js` which requires Node.js. API routes bridge the gap.
2. **Keys stay server-side.** Both the HEBBS API key and OpenAI API key never touch the client.
3. **Dogfooding.** The demo runs on the same `@hebbs/sdk` npm package customers install.
4. **Accurate latency.** Each API route times the SDK call and returns real engine latency, not network round-trip.

---

## The Three Panels

| Panel | Purpose |
|---|---|
| **Conversation** (left) | Chat interface. Click a pre-built scenario or type freely. |
| **Engine Inspector** (center) | Real-time feed of every HEBBS operation — REMEMBER, RECALL, REFLECT, REVISE — with latency and scores. |
| **Learning Timeline** (right) | Visual timeline showing memories accumulating and insights appearing across conversations. |

## Pre-Built Scenarios

| Scenario | Duration | What It Shows |
|---|---|---|
| **The Learning Arc** | ~2 min | 5 calls — the agent learns pricing patterns, competitor intel, and synthesizes insights |
| **Returning Customer** | ~1 min | Agent remembers a prospect from 2 weeks ago via temporal recall + prime() |
| **World Changed** | ~1.5 min | Belief revision — CompetitorX launches SSO, insights cascade and rebuild |

## Interactive Features

- **Reflect Now** — Manual trigger that consolidates memories into insights
- **World Changed** — Fires revise(), shows insight invalidation + re-reflection
- **Code Reveal** — Toggle to see the TypeScript/Python agent code powering the conversation
- **Latency Scoreboard** — Running p99 for remember/recall/reflect in the header

---

## Production Deployment (AWS)

### Prerequisites

1. An AWS EC2 instance (or two, for separation)
2. HEBBS server built and configured
3. OpenAI API key for conversation generation
4. HEBBS server configured with an LLM provider for reflect (in its own `hebbs.toml`)

### Step 1: Deploy HEBBS Server

The HEBBS server runs as a separate process with its own configuration.

```bash
# On the server instance
./hebbs-server

# The server will print a bootstrap API key on first start:
# ╔══════════════════════════════════════════════════════════════════╗
# ║  BOOTSTRAP API KEY (save this -- it will not be shown again)    ║
# ║  hb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx            ║
# ╚══════════════════════════════════════════════════════════════════╝

# Save this key — you'll need it for the demo app.
```

Verify the server is healthy:

```bash
curl http://localhost:6381/v1/health/ready
# {"status": "ready"}
```

### Step 2: Build the Demo App

```bash
cd experience-demo
npm install
npm run build
```

### Step 3: Configure Environment

Create `.env.local` (or set environment variables):

```env
# Required
HEBBS_SERVER_ADDRESS=localhost:6380    # or 10.0.1.5:6380 if separate machines
HEBBS_API_KEY=hb_your-bootstrap-key
OPENAI_API_KEY=sk-your-openai-key

# Optional
LLM_MODEL=gpt-4o                      # default: gpt-4o
SESSION_TTL_HOURS=1                    # default: 1 hour
```

### Step 4: Start the App

```bash
# Production mode
npm run start

# Or with a process manager (recommended)
pm2 start npm --name "hebbs-demo" -- start
```

The app starts on port 3000 by default. Use a reverse proxy (nginx, Caddy) for HTTPS.

### Step 5: (Optional) Session Cleanup Cron

Ephemeral demo sessions accumulate data. Set up hourly cleanup:

```bash
# crontab -e
0 * * * * curl -s -X POST http://localhost:3000/api/hebbs/forget -H 'Content-Type: application/json' -d '{"entityId":"demo_"}' > /dev/null 2>&1
```

### Nginx Configuration (Example)

```nginx
server {
    listen 443 ssl http2;
    server_name playground.hebbs.ai;

    ssl_certificate     /etc/letsencrypt/live/playground.hebbs.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/playground.hebbs.ai/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `HEBBS_SERVER_ADDRESS` | Yes | `localhost:6380` | gRPC address of the HEBBS server |
| `HEBBS_API_KEY` | If auth enabled | — | API key for the HEBBS server |
| `OPENAI_API_KEY` | Yes | — | OpenAI API key for conversation generation |
| `LLM_MODEL` | No | `gpt-4o` | OpenAI model to use |
| `SESSION_TTL_HOURS` | No | `1` | Hours before ephemeral session data is wiped |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| HEBBS SDK | `@hebbs/sdk` (gRPC, npm) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand |
| Code Highlighting | Shiki |
| Fonts | Inter + JetBrains Mono (via next/font) |
| LLM | OpenAI SDK (server-side) |

---

## Development

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## File Structure

```
experience-demo/
├── app/
│   ├── page.tsx                     # Redirect to /playground
│   ├── playground/page.tsx          # Three-panel experience
│   ├── layout.tsx                   # Root layout with fonts
│   ├── globals.css                  # Glass theme + animations
│   └── api/
│       ├── hebbs/                   # HEBBS SDK API routes
│       │   ├── remember/route.ts
│       │   ├── recall/route.ts
│       │   ├── prime/route.ts
│       │   ├── revise/route.ts
│       │   ├── forget/route.ts
│       │   ├── reflect/route.ts
│       │   ├── insights/route.ts
│       │   └── health/route.ts
│       └── chat/route.ts           # OpenAI LLM proxy
├── components/
│   ├── ChatPanel.tsx                # Conversation + scenario buttons
│   ├── InspectorPanel.tsx           # Engine event feed
│   ├── InspectorCard.tsx            # REMEMBER/RECALL/REFLECT/REVISE cards
│   ├── TimelinePanel.tsx            # Memory timeline visualization
│   ├── BottomBar.tsx                # Reflect/WorldChanged + counters
│   ├── LatencyScoreboard.tsx        # p99 latency display
│   ├── CodeReveal.tsx               # Toggle for code view
│   ├── CodePanel.tsx                # Syntax-highlighted agent code
│   └── ConnectionStatus.tsx         # HEBBS connection indicator
├── lib/
│   ├── store.ts                     # Zustand state management
│   ├── types.ts                     # Client-side type definitions
│   ├── agent.ts                     # Agent orchestration hook
│   ├── scenarios.ts                 # Pre-built scenario data
│   ├── api-client.ts                # Client-side fetch wrapper
│   ├── api-helpers.ts               # Server-side response helpers
│   └── hebbs-singleton.ts           # Server-side SDK singleton
├── middleware.ts                     # Rate limiting
├── .env.example                     # Environment template
└── README.md
```
