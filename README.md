# MailGuard

MailGuard is a privacy-first email deliverability auditing platform built for small and medium-sized businesses. It inspects critical DNS authentication records, computes an actionable health score, and provides plain-English remediation guidance so business emails land in customer inboxes rather than spam folders.

---

## Deployments

- **Frontend Application (Vercel):** [https://mailguard-client.vercel.app](https://mailguard-client.vercel.app)
- **API Service (Render):** [https://mailguard-api.onrender.com](https://mailguard-api.onrender.com)
- **API Health Check:** [https://mailguard-api.onrender.com/health](https://mailguard-api.onrender.com/health)

---

## Core Capabilities

- **Automated DNS Deliverability Engine:**
  - **MX Verification:** Resolves mail exchange hosts and priority sorting to verify inbound mail routing.
  - **SPF Analysis (RFC 7208):** Detects duplicate SPF record violations (`PermError`), identifies policy qualifiers (`-all`, `~all`, `?all`, `+all`), and extracts mechanism definitions.
  - **DMARC Inspection (RFC 7489):** Verifies `_dmarc` policy alignment, policy enforcement states (`none`, `quarantine`, `reject`), and aggregate report routing (`rua`).
  - **DKIM Discovery:** Concurrently probes common selectors (`default`, `google`, `selector1`, `k1`, etc.) while gracefully handling provider-specific custom selectors.
- **Deliverability Scoring:** Computes an objective 0–100 rating based on MX routing, SPF authorization, DKIM signing, and DMARC enforcement.
- **Plain-English AI Explanations:**
  - Translates cryptic DNS terms into accessible, business-focused insights designed for non-technical domain owners.
  - Generates copy-pasteable DNS records (Type, Host, Value) tailored for providers like cPanel, Cloudflare, and GoDaddy.
  - Built with a deterministic rule-based baseline that operates with zero external dependencies and falls back seamlessly if an LLM is unreachable.
- **Scan History & Persistence:**
  - Authenticated scans persist to Supabase PostgreSQL with user-level isolation.
  - Paginated history dashboard with search and status filtering.
- **Guest & Authenticated Flows:** Immediate ad-hoc scans on the landing page with optional account creation for historical tracking.

---

## Technology Stack

### Frontend (`client/`)
- **Framework:** React 18, Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Auth Client:** `@supabase/supabase-js`
- **Hosting:** Vercel (SPA with rewrite routing via `vercel.json`)

### Backend (`server/`)
- **Runtime & Server:** Node.js, Express 5
- **DNS Resolution:** Native Node.js `dns.promises`
- **Database Driver:** `pg` (PostgreSQL client pool with SSL)
- **Database & Auth:** Supabase PostgreSQL & Supabase Auth
- **Security & Logging:** Helmet, CORS, Morgan
- **AI Integration:** Google Gemini / OpenAI / Anthropic with resilient timeout fallback
- **Hosting:** Render (Web Service via `render.yaml`)

---

## Project Architecture

```text
MailGuard/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI elements (Hero, Navbar, Footer)
│   │   ├── context/            # AuthContext and session state
│   │   ├── lib/                # Supabase browser client
│   │   ├── pages/              # Landing, Scan, Results, Dashboard, History
│   │   └── services/           # API client (fetch wrapper with bearer token)
│   ├── vercel.json             # SPA routing rewrite configuration
│   └── package.json
├── server/                     # Node.js + Express backend
│   ├── src/
│   │   ├── config/             # Database connection pool and Supabase config
│   │   ├── controllers/        # Scan and History route controllers
│   │   ├── middlewares/        # Supabase token authentication middleware
│   │   ├── routes/             # API routes (/api/scan, /api/history)
│   │   ├── services/           # DNS audit engine and AI explanation service
│   │   ├── utils/              # Scoring algorithm
│   │   └── server.js           # Express app entry point
│   ├── render.yaml             # Render deployment blueprint
│   └── package.json
├── LICENSE                     # MIT License
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm
- Supabase account and project

### 1. Clone the Repository

```bash
git clone https://github.com/I-am-Tofunmi/MailGuard.git
cd MailGuard
```

### 2. Configure Backend Environment

Navigate to the `server/` directory and configure environment variables:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Add for LLM-enhanced diagnostic copy
GEMINI_API_KEY=your_gemini_api_key
```

Install backend dependencies and start the server:

```bash
npm install
npm run dev
```

The API will listen on `http://localhost:5000`.

### 3. Configure Frontend Environment

In a separate terminal, navigate to the `client/` directory:

```bash
cd client
cp .env.example .env.local
```

Edit `client/.env.local`:

```env
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_API_BASE_URL=http://localhost:5000/api
```

Install frontend dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service health probe |
| `POST` | `/api/scan/audit` | Public / Optional Auth | Audits domain DNS and returns deliverability report |
| `GET` | `/api/history` | Authenticated | Retrieves paginated scan history |
| `GET` | `/api/history/:id` | Authenticated | Fetches a single scan record by ID |
| `DELETE` | `/api/history/:id` | Authenticated | Deletes a scan record by ID |

---

## Production Builds

To verify production builds locally:

```bash
# Build frontend
npm --prefix client run build

# Start production server
cd server
npm start
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
