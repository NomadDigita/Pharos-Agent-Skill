```markdown
# 🤖 AGENT COMMERCE OS (ACOS)
> `~/ NomadDigita / pharos-agent-skill` ⚡ `WELCOME TO THE FRONTIER ............ ONLINE`

An institutional-grade, highly composable suite of **5 Backend Skills** built for the **Pharos Skill-to-Agent Dual Cascade Hackathon (Phase 1)**. 

Designed to act as the foundational economic, directory, intelligence, and reputation layers for autonomous on-chain agents on the **Pharos Atlantic Testnet (Chain ID 688688)**. Exposes type-safe endpoints over both a high-performance **Fastify REST API** and the **Model Context Protocol (MCP)** Server-Sent Events (SSE) gateway.

---

## ◆ The Codex (Architecture & Tech Stack)

* **Runtime Environment**: Node.js (v20+ / v24) & TypeScript (configured with strict `node16` module resolution)
* **Framework**: Fastify (low-overhead, JSON-schema optimized with `@fastify/type-provider-typebox`)
* **Persistence Layer**: Prisma Client mapped to a high-capacity **Supabase PostgreSQL** instance
* **Blockchain Layer**: Viem (custom chain config for Pharos Atlantic Testnet)
* **AI Engine**: Google Gemini API (sentiment & trend signal translation)
* **Web3 Intelligence**: Moralis API (portfolio parsing & native holdings)
* **Operator Alerts**: Telegram Bot API (custom async event streaming) & Resend (transaction receipt delivery)

---

## ◆ The Manifest (The 5 Composable Skills)

```
                       ┌───────────────────────────────┐
                       │      AGENT COMMERCE OS        │
                       └───────────────┬───────────────┘
          ┌────────────────┬───────────┴────┬────────────────┬──────────────┐
          ▼                ▼                ▼                ▼              ▼
   1. Payment Skill  2. Registry Skill  3. Wallet Skill  4. Reputation  5. Social Skill
   (Splits/Escrows)  (Rentals/Buying)   (Moralis Audit)  (Trust Ranks)  (X + Gemini AI)
```

### 💸 Skill 1: Advanced Payment Execution Skill
- **Multiple Payment Styles**: Supports direct transfers, locked temporal escrows, dynamic split-routing allocations, and recurring billing subscriptions.
- **On-Chain confirmation Polling**: Automatically polls transaction receipts on Pharos Atlantic via the Viem public client, parsing logs to transition database states dynamically.

### 🤖 Skill 2: Marketplace Registry Skill
- **Agent Node Directory**: Allows autonomous nodes to register, announce, and update their operational capability tags.
- **Priced Listings**: Publishes capability listings with clear transaction styles (`PURCHASE`, `RENTAL`, or `SUBSCRIPTION`).

### 🔍 Skill 3: Wallet Intelligence Skill
- **Portfolio Audits**: Queries the Moralis API to analyze wallet token distributions and native asset balances.
- **Behavioral Flagging**: Classifies wallets as "Whales" based on wealth thresholds or "Suspicious" if associated with spam contracts.
- **Database Caching**: Automatically caches wallet analysis in Supabase to eliminate redundant third-party API fees.

### 🛡️ Skill 4: Reputation & Trust Rank Skill
- **On-Chain Audit Log Analysis**: Scans transaction histories to compute successes vs. failures, penalizing scores for failures.
- **Community Rating Index**: Allows agents or users to submit 1-5 star feedback with commentary, calculating a weighted Bayesian average trust score.

### 📈 Skill 5: Social Intelligence Skill
- **X API v2 Integration**: Uses your active Twitter Bearer Token to pull recent posts matching dynamic query terms (e.g. `Pharos`, `PROS`).
- **Semantic Caching**: Feeds raw tweets to Google's Gemini AI to synthesize market sentiment, trend keywords, and actionable trading recommendations.

---

## ◆ Mission Control (Installation & Setup)

### 1. Initialize the Environment
Clone the repository and copy the environment template:
```bash
git clone https://github.com/NomadDigita/Pharos-Agent-Skill.git
cd Pharos-Agent-Skill
cp .env.example .env
```

Open `.env` and configure your API keys (ensure your Supabase database passwords are URL-encoded):
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

# Twitter API Configurations
TWITTER_BEARER_TOKEN="YOUR_BEARER_TOKEN"
```

### 2. Install Dependencies & Build Models
Install your local node packages and push the database schema to your Supabase PostgreSQL cluster:
```powershell
npm install
npx prisma generate
npx prisma db push
```

### 3. Run Local Server
```powershell
npm run dev
```

---

## ◆ Live Transmission (Public Sandbox & Docs)

Our Agent Commerce OS is deployed 24/7 autonomously in the cloud on Render:

* **Healthcheck Entrypoint**: [https://pharos-agent-skills.onrender.com/health](https://pharos-agent-skills.onrender.com/health)
* **Interactive OpenAPI Specification**: [https://pharos-agent-skills.onrender.com/documentation](https://pharos-agent-skills.onrender.com/documentation)
* **MCP SSE Server Gateway**: [https://pharos-agent-skills.onrender.com/mcp/sse](https://pharos-agent-skills.onrender.com/mcp/sse)

---
`~ build with passion. ship without permission.`
```

---

### Sandbox Deep-Dive Testing Guide (All 5 Skills)

To test each of your newly implemented/upgraded skills inside the Swagger UI (`http://localhost:3000/documentation` or your live Render URL), use these raw JSON payloads and curl commands:

---

#### 💸 Skill 1: Payment Execution (Split Payment & Subscription)

To test creating a split-route payment intent distributing the total funds across two destination wallets (60/40 ratio):

* **Endpoint**: `POST /api/v1/payments/intent`
* **JSON Request Body**:
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
* **Testing Command (cURL)**:
  ```bash
  curl -X POST "http://localhost:3000/api/v1/payments/intent" \
       -H "Content-Type: application/json" \
       -d '{"senderAddress":"0x90F8bf6A479f320ced073E1412751d823802B714","recipientAddress":"0x1234567890123456789012345678901234567890","amount":"0.05","type":"SPLIT","splitRecipients":[{"address":"0xfe3b557e8fb62b89f4916b721be55ceb828dbd73","percentage":60},{"address":"0xf916b721be55ceb828dbd73fe3b557e8fb62b89f","percentage":40}]}'
  ```
* **Expected Result**: Returns a `201 Created` status with the database payload and triggers the **Advanced Payment Intent Generated** Telegram alert.

---

#### 🤖 Skill 2: Marketplace Skill (Listing Purchases/Rentals)

First, register an agent and use its generated `id` (e.g. `16363ad1-0815-470d-9e65-819c91fab990`) to create a subscription-style service listing:

* **Endpoint**: `POST /api/v1/registry/listings`
* **JSON Request Body**:
  ```json
  {
    "agentId": "REPLACE_WITH_YOUR_REGISTERED_AGENT_UUID",
    "title": "Autonomous Sentiment Predictor",
    "description": "Continuous on-chain market sentiment analysis with daily Qwen summary updates",
    "priceUnit": "PROS",
    "priceAmount": "0.15",
    "type": "SUBSCRIPTION",
    "billingInterval": "MONTHLY"
  }
  ```
* **Expected Result**: Publishes the priced capability to the directory, making it discoverable for other agents via `/api/v1/registry/listings`.

---

#### 🔍 Skill 3: Wallet Intelligence Skill

To perform a portfolio composition, whale classification, and risk check on any EVM address:

* **Endpoint**: `POST /api/v1/wallet/analyze`
* **JSON Request Body**:
  ```json
  {
    "address": "0x90F8bf6A479f320ced073E1412751d823802B714"
  }
  ```
* **Testing Command (cURL)**:
  ```bash
  curl -X POST "http://localhost:3000/api/v1/wallet/analyze" \
       -H "Content-Type: application/json" \
       -d '{"address":"0x90F8bf6A479f320ced073E1412751d823802B714"}'
  ```
* **Expected Result**: Returns the wallet balance, whale status (`true/false`), spam-token risk flags, and caches the report inside your `WalletAnalysis` table.

---

#### 🛡️ Skill 4: Reputation & Trust Rank Skill

To submit rated community feedback for an agent, triggering an automatic trust score recalculation:

* **Endpoint**: `POST /api/v1/reputation/feedback`
* **JSON Request Body**:
  ```json
  {
    "agentId": "REPLACE_WITH_YOUR_REGISTERED_AGENT_UUID",
    "rating": 5,
    "comment": "Outstanding processing speed and reliable payment settle verifications!"
  }
  ```
* **Expected Result**: Recalculates the agent's reputation score and appends the comment log securely inside Supabase.

---

#### 📈 Skill 5: Social Intelligence Skill (Twitter + Gemini AI)

To query real-time tweets for a keyword, summarize them using Gemini, and output actionable trading signals:

* **Endpoint**: `POST /api/v1/social/trends`
* **JSON Request Body**:
  ```json
  {
    "query": "Pharos"
  }
  ```
* **Testing Command (cURL)**:
  ```bash
  curl -X POST "http://localhost:3000/api/v1/social/trends" \
       -H "Content-Type: application/json" \
       -d '{"query":"Pharos"}'
  ```
* **Expected Result**: Reaches Google Gemini with live Twitter posts, producing a structured JSON analysis of current social trend sentiments.