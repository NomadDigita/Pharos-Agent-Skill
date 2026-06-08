# 🤖 AGENT COMMERCE OS (ACOS)
> `~/ NomadDigita / pharos-agent-skill` ⚡ `WELCOME TO THE FRONTIER ............ ONLINE`

```
  Initializing NomadDigita.ACOS ............. OK
  Loading Composable Modules ................ OK
  Syncing Supabase DB Cluster ............... OK
  Exposing MCP SSE Transports ............... OK
  WELCOME TO THE FRONTIER ................... ONLINE
```

An institutional-grade, highly composable suite of 5 Composable Backend Skills built for the Pharos Skill-to-Agent Dual Cascade Hackathon (Phase 1). 

Designed to act as the foundational economic, directory, intelligence, and reputation layers for autonomous on-chain agents on the Pharos Atlantic Testnet (Chain ID 688688). Exposes type-safe endpoints over both a high-performance Fastify REST API and the Model Context Protocol (MCP) Server-Sent Events (SSE) gateway.

---

## ◆ The Codex (Architecture & Tech Stack)

* **Runtime Environment**: Node.js (v20+ / v24) & TypeScript (configured with strict `node16` module resolution)
* **Framework**: Fastify (low-overhead, JSON-schema optimized with `@fastify/type-provider-typebox`)
* **Persistence Layer**: Prisma Client mapped to a high-capacity Supabase PostgreSQL instance
* **Blockchain Layer**: Viem (custom chain config for Pharos Atlantic Testnet)
* **AI Engine**: Google Gemini API (sentiment & trend signal translation)
* **Web3 Intelligence**: Moralis API (portfolio parsing & native holdings)
* **Operator Alerts**: Telegram Bot API (custom async event streaming) & Resend (transaction receipt delivery)

---

## ◆ The Manifest (The 5 Upgraded Composable Skills)

```
                       ┌───────────────────────────────┐
                       │      AGENT COMMERCE OS        │
                       └───────────────┬───────────────┘
          ┌────────────────┬───────────┴────┬────────────────┬──────────────┐
          ▼                ▼                ▼                ▼              ▼
   1. Payment Skill  2. Registry Skill  3. Wallet Skill  4. Reputation  5. Social Skill
   (Splits/Escrows)  (Rentals/Buying)   (Moralis Audit)  (Trust Ranks)  (X + Gemini AI)
```

### 💸 Skill 1: Upgraded Payment Execution Skill
- **Advanced Payment Layouts**: Supports direct transfers, locked temporal escrows, dynamic split-routing allocations, and recurring billing subscriptions.
- **On-Chain Confirmation Polling**: Automatically polls transaction receipts on Pharos Atlantic via the Viem public client, parsing logs to transition database states dynamically.

### 🤖 Skill 2: Marketplace Skill
- **Agent Node Directory**: Allows autonomous nodes to register, announce, and update their operational capability tags.
- **Priced Listings**: Publishes capability listings with clear transaction styles (PURCHASE, RENTAL, or SUBSCRIPTION) to establish an autonomous agent economy.

### 🔍 Skill 3: Wallet Intelligence Skill
- **Portfolio Audits**: Queries the Moralis API to analyze wallet token distributions and native asset balances.
- **Behavioral Flagging**: Classifies wallets as "Whales" based on wealth thresholds or "Suspicious" if associated with spam contracts.
- **Database Caching**: Automatically caches wallet analysis in Supabase to eliminate redundant third-party API fees.

### 🛡️ Skill 4: Reputation & Trust Rank Skill
- **On-Chain Audit Log Analysis**: Scans transaction histories to compute successes vs. failures, penalizing scores for failures.
- **Community Rating Index**: Allows agents or users to submit 1-5 star feedback with commentary, calculating a weighted Bayesian average trust score.

### 📈 Skill 5: Social Intelligence Skill
- **X API v2 Integration**: Uses your active Twitter Bearer Token to pull recent posts matching dynamic query terms (e.g. Pharos, PROS).
- **Semantic Caching**: Feeds raw tweets to Google's Gemini AI to synthesize market sentiment, trend keywords, and actionable trading recommendations.

---

## ◆ File System Configuration

```text
pharos-agent-skills/
├── prisma/
│   └── schema.prisma            # Dynamic Postgres Models mapping
├── src/
│   ├── index.ts                 # Bootstrapping, Swagger Engine, & Server Entrypoint
│   ├── config/
│   │   ├── db.ts                # Prisma Client Singleton
│   │   ├── env.ts               # Typebox Environment Variable Validator
│   │   └── providers.ts         # Viem Clients & Resend configurations
│   ├── mcp/
│   │   ├── server.ts            # MCP SSE Transport Engine
│   │   └── tools.ts             # MCP Tool Prompt Declarations & Handlers
│   ├── modules/
│   │   ├── payment/             # Skill 1: Payments, Splits, & Escrows
│   │   ├── registry/            # Skill 2: Onboardings & Pricing Listings
│   │   ├── wallet/              # Skill 3: Moralis Portfolio Analytics
│   │   ├── reputation/          # Skill 4: Dynamic Trust Ranks & Feedback
│   │   └── social/              # Skill 5: Twitter API & Gemini AI
│   └── utils/
│       ├── crypto.ts            # EVM Signature Recovery Verification
│       ├── logger.ts            # Pino-configured performance logger
│       ├── sentry.ts            # Error aggregation setup
│       └── telegram.ts          # Telegram Bot Event Dispatcher
└── tsconfig.json                # Strict Node16 TS Compiler Configs
```

---

## ◆ Mission Control (Installation & Setup)

### 1. Initialize the Environment
Clone the repository and copy the environment template:
```bash
git clone https://github.com/NomadDigita/Pharos-Agent-Skill.git
cd Pharos-Agent-Skill
cp .env.example .env
```

Open .env and configure your API keys (ensure your Supabase database passwords are URL-encoded):
```ini
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

DATABASE_URL="postgresql://postgres.bibprlxajcxtlqevxocw:[ENCODED-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres:[ENCODED-PASSWORD]@db.bibprlxajcxtlqevxocw.supabase.co:5432/postgres"

PHAROS_RPC_URL="https://pharos-atlantic.g.alchemy.com/v2/fwjIXHmiIqDZ99DgE-iCB"
PHAROS_CHAIN_ID=688688

GEMINI_API_KEY="YOUR_GEMINI_KEY"
MORALIS_API_KEY="YOUR_MORALIS_KEY"
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_CHAT_ID"
RESEND_API_KEY="YOUR_RESEND_KEY"

# Twitter/X API Integration
TWITTER_BEARER_TOKEN="YOUR_BEARER_TOKEN"
```

### 2. Install Dependencies & Build Models
Install your local node packages and push the database schema to your Supabase PostgreSQL cluster:
```bash
npm install
npx prisma generate
npx prisma db push
```

### 3. Run Local Server
```bash
npm run dev
```

---

## ◆ Live Transmission (Public Sandbox & Docs)

Our Agent Commerce OS is deployed 24/7 autonomously in the cloud on Render:

* **Healthcheck Entrypoint**: https://pharos-agent-skills.onrender.com/health
* **Interactive OpenAPI Specification**: https://pharos-agent-skills.onrender.com/documentation
* **MCP SSE Server Gateway**: https://pharos-agent-skills.onrender.com/mcp/sse

---

## ◆ Operational Testing Flight Plan

To test each of your newly implemented skills inside the interactive Swagger UI panel, use these raw JSON payloads:

### 🤖 Skill 1: Agent Node Onboarding
- **Endpoint**: POST /api/v1/registry/agents
- **Payload**:
  ```json
  {
    "address": "0x90F8bf6A479f320ced073E1412751d823802B714",
    "name": "OsCommerce Live Agent Node",
    "capabilities": ["payment-processing", "product-catalog-sync", "agent-escrow"]
  }
  ```
- **Action**: Click execute. Shows the live database entry with your permanent id UUID and triggers the Telegram Bot alert.

### 💸 Skill 2: Advanced Payment Execution (Split-Payment Intent)
- **Endpoint**: POST /api/v1/payments/intent
- **Payload**:
  ```json
  {
    "senderAddress": "0x90F8bf6A479f320ced073E1412751d823802B714",
    "recipientAddress": "0x1234567890123456789012345678901234567890",
    "amount": "0.05",
    "type": "SPLIT",
    "splitRecipients": [
      {
        "address": "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73",
        "percentage": 60
      },
      {
        "address": "0xf916b721be55ceb828dbd73fe3b557e8fb62b89f",
        "percentage": 40
      }
    ]
  }
  ```
- **Action**: Generates the payment intent splitting allocations cleanly 60/40, logged on Supabase.

### 🔍 Skill 3: Wallet Intelligence Audits
- **Endpoint**: POST /api/v1/wallet/analyze
- **Payload**:
  ```json
  {
    "address": "0x90F8bf6A479f320ced073E1412751d823802B714"
  }
  ```
- **Action**: Queries Moralis, checks native balances, spam contracts, flags whale designations, and caches results in PostgreSQL.

### 🛡️ Skill 4: Reputation & Trust Rank Recalculations
- **Endpoint**: POST /api/v1/reputation/feedback
- **Payload** (Paste the Agent ID UUID copied from Skill 1):
  ```json
  {
    "agentId": "REPLACE_WITH_YOUR_REGISTERED_AGENT_UUID",
    "rating": 5,
    "comment": "Outstanding processing speed and reliable payment verification!"
  }
  ```
- **Action**: Submits review, recalculates overall trust score average, and commits to the database.

### 📈 Skill 5: Social Trends & AI Market Recommendations
- **Endpoint**: POST /api/v1/social/trends
- **Payload**:
  ```json
  {
    "query": "Pharos"
  }
  ```
- **Action**: Connects to the Twitter/X API using your bearer token, translates sentiment via Gemini AI, and outputs signals and trading recommendations.

---
`~ build with passion. ship without permission.`