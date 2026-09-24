<div align="center">

# 🧠 SynapseSQL Enterprise

### *AI Database Intelligence Platform — Ask Anything. Query Everything.*


[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-synapsesql--enterpise.onrender.com-0ea5e9?style=for-the-badge&logo=render&logoColor=white)](https://synapsesql-enterpise.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-SHARATH204--MAX__%2FSynapseSQL--Enterpise-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SHARATH204-MAX/SynapseSQL-Enterpise)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Uvicorn-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript%206-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Language-Python%203.11-3776AB?style=flat-square&logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/Orchestration-LangChain%20%2B%20Groq-1C3C3C?style=flat-square&logo=langchain&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite%20%7C%20MySQL%20%7C%20MongoDB-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Supabase](https://img.shields.io/badge/Auth-Supabase%20%2B%20JWT-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker%20Multi--Stage-2496ED?style=flat-square&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![Tests](https://img.shields.io/badge/Testing-pytest-F7DC6F?style=flat-square&logo=pytest&logoColor=black)

**An enterprise-grade, conversational database intelligence assistant** that turns plain English (and voice) into safe, executed, analyzed and visualized database answers — streamed in real time with full audit trails.

[**🌐 Live App**](https://synapsesql-enterpise.onrender.com/) · [**📖 Documentation**](https://synapsesql-enterpise.onrender.com/docs) · [**🧪 API Reference**](https://synapsesql-enterpise.onrender.com/openapi.json) · [**📄 Report Bug**](https://github.com/SHARATH204-MAX/SynapseSQL-Enterpise/issues)

---

</div>

## 📑 Table of Contents

- [🌟 About The Project](#-about-the-project)
- [✨ Key Features](#-key-features)
- [🧠 Architecture (Unique Format)](#-architecture-unique-format)
- [🌀 Query Lifecycle Pipeline](#-query-lifecycle-pipeline)
- [🧰 Technology Stack](#-technology-stack)
- [🚀 Quick Start (3 Ways)](#-quick-start-3-ways)
- [🛠️ Complete Clone & Run Guide (From Scratch)](#️-complete-clone--run-guide-from-scratch)
- [🐳 Docker Deployment](#-docker-deployment)
- [☁️ Render Cloud Deployment](#️-render-cloud-deployment)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [📡 API Reference](#-api-reference)
- [🔌 SSE Event Protocol](#-sse-event-protocol)
- [💬 Usage Guide](#-usage-guide)
- [🧪 Testing](#-testing)
- [📁 Project Structure](#-project-structure)
- [🔐 Security Architecture](#-security-architecture)
- [🛣️ Roadmap & Known Limitations](#️-roadmap--known-limitations)
- [❓ FAQ & Troubleshooting](#-faq--troubleshooting)
- [📄 License](#-license)

---

## 🌟 About The Project

**SynapseSQL Enterprise** solves a simple but expensive problem: **data questions shouldn't require SQL expertise.**

Millions of business users have data locked inside databases they can't query. Analysts become human APIs — interrupted constantly to "just run one query." SynapseSQL eliminates that bottleneck with an AI copilot that:

1. **Understands** natural English questions (typed or spoken)
2. **Grounds** the answer on your database's **live schema** — introspected in real time, never hallucinated
3. **Generates** deterministic SQL via LLM (temperature 0.0) with **self-healing** on execution errors
4. **Executes** safely under layered read-only guardrails
5. **Explains** results in a structured 4-section analytical report, streamed token-by-token over SSE
6. **Visualizes** into interactive tables (sort/search/paginate), charts (Bar/Line/Pie/Donut) and 1-click CSV/Excel/JSON exports
7. **Audits** every interaction to Supabase (metadata only — raw rows are never logged, by design)

### 🎯 What Makes It "Enterprise" Grade

| Concern | How SynapseSQL Handles It |
|---|---|
| **Reliability** | Multi-model failover + self-healing SQL + every failure path yields a typed SSE event (never a hung stream) |
| **Safety** | Prompt-level guardrails → execution-level guardrails → DB-level read-only mode (3 layers) |
| **Access Control** | JWT sessions (7-day HS256) + RBAC roles (admin / analyst / viewer) + optional Google OAuth + Supabase Auth |
| **Abuse Prevention** | SlowAPI rate limiting (chat 25/min, API 60/min, auth 30/min, default 120/min per IP) |
| **Privacy** | `query_logs` stores prompts/SQL/timings — **never result rows**; Supabase RLS scopes users to their own logs |
| **Observability** | `/health` diagnostics (uptime, DB probe, system info) + per-query execution time telemetry |
| **Delivery** | Single-port unified hosting — FastAPI serves the React SPA **and** the API on one URL; multi-stage Docker; Render-ready `$PORT` binding |

---

## ✨ Key Features

- 💬 **Natural Language → SQL** — ask in plain English, get executed answers with explanation
- 🎤 **Voice Queries** — Web Speech API microphone input, auto-sends transcript
- ⚡ **Real-Time SSE Streaming** — status, agent reasoning steps, generated SQL, and answer tokens stream live
- 🧠 **Self-Healing Queries** — DB error → LLM corrects the SQL → re-executes (bounded single retry)
- 🔄 **Multi-Model Failover** — Qwen3.8-27B → GPT-OSS-120B → GPT-OSS-20B, automatic with backoff
- 🛡️ **Read-Only Guardrails** — destructive keyword interception (DROP/DELETE/TRUNCATE/ALTER/GRANT/REVOKE/SHUTDOWN...) with a UI toggle
- 🗂️ **Live Schema Explorer** — tables, columns, types, PKs, foreign keys, row counts, 5-row samples in the sidebar
- 🔌 **Multi-Database** — SQLite (bundled sample), MySQL, MongoDB (schema inspection + connection testing)
- 📊 **Auto-Visualization** — Bar / Line / Pie / Donut charts with axis & metric column selectors
- 📈 **Interactive Data Grid** — search, type-aware sorting, 10-row pagination, null rendering
- 📥 **1-Click Export** — CSV, Excel (.xlsx), JSON via pandas/openpyxl
- 📋 **Copy & Re-Run SQL** — every generated query is copyable and directly re-executable with latency badge
- 🧾 **Query History** — past 30 queries per user fetched from Supabase
- 🔐 **Auth Trio** — Supabase email/password, Google OAuth, and instant 1-click Demo Roles
- 🌐 **Unified Single-Port Delivery** — one URL serves SPA + API (no CORS headaches in production)
- 🧱 **Multi-Stage Docker** — Node build stage → slim Python runtime, healthchecked

---

## 🧠 Architecture (Unique Format)

### 🏛️ The Three-Tier Unified Host

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          🌐  BROWSER CLIENT                                 ║
║              React 19 SPA · Chart.js · Voice · SSE Consumer                 ║
╚════════════════════════════════╦═════════════════════════════════════════════╝
                                 ║  https://synapsesql-enterpise.onrender.com
                                 ║  (single unified port)
╔════════════════════════════════╩═════════════════════════════════════════════╗
║                     🖥️  FastAPI Unified Host  (ASGI · Uvicorn)              ║
╠════════════════════════╦═════════════════════════════════════════════════════╣
║  📦 Static Handler     ║              🔌  API Router  (/api + /api/v1)      ║
║  serves frontend/dist  ║  ┌──────────┬──────────┬─────────┬─────────────┐    ║
║  catch-all @app.get    ║  │ /chat    │/database │  /auth  │  /export    │    ║
║  SPA fallback→index    ║  │ /stream  │ /schema  │ /google │ /csv /excel │    ║
║  excludes api/docs     ║  │ /models  │ /execute │ /demo   │  /json      │    ║
║                        ║  │          │ /test    │ /me     │             │    ║
║                        ║  └────┬─────┴────┬─────┴────┬────┴──────┬──────┘    ║
╠════════════════════════╬═══════╧══════════╧══════════╧═══════════╧══════════╣
║                        ║            🧠  SERVICE LAYER                       ║
║                        ║  AgentService · DatabaseManager · UserService       ║
║                        ║  ExportService · SupabaseService                    ║
╠════════════════════════╬════════════════════════════════════════════════════╣
║                        ║           🔧  CORE LAYER                           ║
║                        ║  config · auth(JWT) · security(guardrails)          ║
║                        ║  limiter(SlowAPI) · database(SQLAlchemy) · supabase ║
╠════════════════════════╬════════════════════════════════════════════════════╣
║                        ║           🗄️  DATA PLANE                           ║
║                        ║  SQLite(student.db) · MySQL · MongoDB               ║
║                        ║  Supabase Postgres(user_profiles, query_logs + RLS) ║
║                        ║  auth.db(internal users, RBAC roles)                ║
╠════════════════════════╩════════════════════════════════════════════════════╣
║                          🤖  EXTERNAL AI                                     ║
║              Groq Cloud (ChatGroq · Llama / OSS / Qwen models)               ║
╚═════════════════════════════════════════════════════════════════════════════╝
```

### 🔑 Architecture Decision Records (ADR) — say *why*, not just *what*

| # | Decision | Rationale |
|---|---|---|
| ADR-1 | **Single-port unified hosting** | The catch-all `@app.get("/{full_path:path}")` serves the built React `dist`, falls back to `index.html` (SPA routing), and explicitly skips `api`/`docs`/`openapi.json`. One URL → zero production CORS, one healthcheck, one deploy artifact. |
| ADR-2 | **SSE over WebSocket** | LLM output is strictly unidirectional (server→client). SSE rides plain HTTP → works with `fetch` + auth headers + proxies, auto-reconnects, and needs no upgrade handshake. |
| ADR-3 | **Manual SSE frame parsing client-side** | Native `EventSource` cannot send `POST` bodies or `Authorization` headers. We read the `ReadableStream`, normalize `\r\n→\n`, and split frames on `\n\n` so TCP chunk boundaries can never corrupt JSON. |
| ADR-4 | **Schema-in-prompt grounding** | Live introspection (tables/columns/PK/FK/samples) injected into the system prompt = deterministic grounding without a vector store; the perfect fit for compact schemas (RAG-over-DDL is the scale path). |
| ADR-5 | **Two-pass LLM design** | Pass 1: SQL generation at `temperature=0.0` (deterministic). Pass 2: explanation at `temperature=0.2` streamed (human prose). Separation gives reliability **and** UX. |
| ADR-6 | **SQLAlchemy Inspector, no ORM** | We execute *LLM-generated arbitrary SQL* — we need dialect-neutral introspection + raw execution, not object relational mapping. |
| ADR-7 | **Stateless API + JWT** | Tokens in `Authorization` headers → horizontal scalability behind any load balancer; no server session store. |
| ADR-8 | **Fail-fast secrets** | `JWT_SECRET_KEY` validated at import (min 32 chars, deny-list of leaked values) — refuse to boot with a forgeable secret rather than fail at first login. |

---

## 🌀 Query Lifecycle Pipeline

What happens when a user asks *"Show average marks by department"*:

```
 ┌────────────┐   POST /api/chat/stream     ┌──────────────────────────┐
 │  💬 User   │ ───────────────────────────► │  🔐 1. Auth (JWT/Bearer) │
 │  question  │   {query, history, dbConfig, │  ⏳ 2. Rate limit 25/min │
 └────────────┘   model, readOnly, token}    │  🛡️ 3. Guardrail regex   │
                                            └───────────┬──────────────┘
                                                        │ pass
                                            ┌───────────▼──────────────┐
                                            │ 🔍 4. Live schema inspect│
                                            │    tables · PK/FK · rows │
                                            │    counts · 5 samples    │
                                            └───────────┬──────────────┘
                                                        │
                                            ┌───────────▼──────────────┐
                                            │ 🤖 5. LLM Pass #1        │
                                            │    temp 0.0 · 350 tokens │
                                            │    → raw SQL (fences ⌫)  │
                                            └───────────┬──────────────┘
                                                        │ {"type":"sql"}
                                            ┌───────────▼──────────────┐
                                            │ ⚙️ 6. Execute (SQLAlchemy)│
                                            │   ✗ error? → self-heal:  │
                                            │   LLM fixes → re-run 1×  │
                                            └───────────┬──────────────┘
                                                        │ {columns, rows}
                                            ┌───────────▼──────────────┐
                                            │ 📝 7. LLM Pass #2        │
                                            │    temp 0.2 · streaming  │
                                            │    4-section report      │
                                            │    → {"type":"token"}×N  │
                                            └───────────┬──────────────┘
                                                        │
                      ┌─────────────────────────────────▼───────────────┐
                      │ 🗃️ 8. Audit → Supabase query_logs              │
                      │    (prompt · SQL · model · ms · rowcount)      │
                      │    ⚠️ raw result rows NEVER logged (privacy)    │
                      └─────────────────────────────────┬───────────────┘
                                                        │ {"type":"done"}
 ┌────────────┐    render tabs:                         │
 │  💻 UI     │ ◄── Explanation · Table · Chart · SQL card + copy/run  │
 └────────────┘                                         │
        ❌ any stage fails → typed SSE event (error/warning) → model failover loop
```

**SSE event vocabulary:** `status` → `thought` → `tool_output` → `sql` → `token`… → `done` | `error` | `warning`

---

## 🧰 Technology Stack

### ⚙️ Backend

| Category | Technology | Purpose |
|---|---|---|
| Language | **Python 3.11** | Runtime |
| Web Framework | **FastAPI ≥ 0.110** | Async API, DI, OpenAPI docs |
| ASGI Server | **Uvicorn ≥ 0.28** | High-performance serving |
| Streaming | **sse-starlette ≥ 2.0** | `EventSourceResponse` SSE frames |
| Validation | **Pydantic v2 + pydantic-settings** | Typed request models & `.env` |
| AI Orchestration | **LangChain ≥ 0.1.16 · langchain-groq · langchain-core** | LLM calls, streaming, prompting |
| LLM Provider | **Groq** (Qwen3.8-27B, GPT-OSS-120B/20B) | Ultra-low-latency inference |
| Relational Access | **SQLAlchemy ≥ 2.0** | Engine, dialect-neutral introspection |
| NoSQL Access | **pymongo ≥ 4.6** | MongoDB schema inspection |
| MySQL Driver | **mysql-connector-python ≥ 8.3** | SQLAlchemy MySQL dialect |
| Rate Limiting | **slowapi ≥ 0.1.10** | Per-IP endpoint policies |
| Auth / JWT | **pyjwt ≥ 2.8 · google-auth ≥ 2.28** | HS256 sessions, Google ID-token verify |
| BaaS Client | **supabase ≥ 2.3** | Profiles, query logs, auth fallback |
| Export Engine | **pandas ≥ 2.2 · openpyxl ≥ 3.1** | CSV / Excel / JSON |
| Testing | **pytest ≥ 8 · httpx ≥ 0.27** | TestClient integration tests |

### 🎨 Frontend

| Category | Technology | Purpose |
|---|---|---|
| UI Library | **React 19** | Component model |
| Language | **TypeScript 6** | End-to-end type safety |
| Bundler / Dev | **Vite 8** + `@vitejs/plugin-react` | Instant HMR, fast builds |
| Charts | **Chart.js 4 + react-chartjs-2 5** | Bar / Line / Pie / Donut |
| Markdown | **react-markdown 10 + remark-gfm** | Renders the 4-section report & tables (XSS-safe) |
| Auth SDKs | **@supabase/supabase-js 2 · @react-oauth/google** | Email/OAuth sessions, Google sign-in |
| Icons | **lucide-react** | UI iconography |
| Voice | **Web Speech API** (native) | Browser speech-to-text |
| State | **React Hooks + Context API** | Conversations, auth, config |

### 🗄️ Data & DevOps

| Category | Technology |
|---|---|
| Sample / Default DB | **SQLite** — `student.db` (STUDENT ⇄ DEPARTMENTS with FK) |
| Identity Store | **SQLite** — `auth.db` (users, RBAC roles, activity) |
| Alt. Query Targets | **MySQL 8** · **MongoDB** (via Connection modal) |
| Managed Backend | **Supabase (PostgreSQL)** — `user_profiles`, `query_logs` with RLS |
| Containers | **Docker** multi-stage (`node:20-alpine` build → `python:3.11-slim` run) |
| Orchestration | **docker-compose** (healthcheck + volume persistence) |
| Cloud Hosting | **Render** — Docker runtime, `$PORT` binding, `/health` probe |
| CI/CD Ready | GitHub Actions-friendly (`pytest` + `tsc && vite build`) |

---

## 🚀 Quick Start (3 Ways)

| Path | Best For | Time |
|---|---|---|
| **① Live Demo** | Just try it | 0 sec |
| **② Docker** | Zero-setup local run | ~2 min |
| **③ Manual (source)** | Development & customization | ~10 min |

### ① 🌐 Use the Hosted App
Open **[https://synapsesql-enterpise.onrender.com/](https://synapsesql-enterpise.onrender.com/)** → **Sign In** → pick **Admin / Analyst / Viewer Demo Role** → ask away.

### ② 🐳 Docker (recommended local run)
```bash
git clone https://github.com/SHARATH204-MAX/SynapseSQL-Enterpise.git
cd SynapseSQL-Enterpise
cp .env.example .env      # add your GROQ_API_KEY + JWT_SECRET_KEY
docker compose up --build
# → http://localhost:8000
```

### ③ 🧑‍💻 Manual source run
```bash
git clone https://github.com/SHARATH204-MAX/SynapseSQL-Enterpise.git
cd SynapseSQL-Enterpise
# see the full guide below 👇
```

---

## 🛠️ Complete Clone & Run Guide (From Scratch)

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Python | 3.10 / 3.11 | `python --version` |
| Node.js | 18+ | `node -v` |
| Git | any | `git --version` |
| Docker *(optional)* | 20+ | `docker -v` |
| Groq API Key | free | [console.groq.com](https://console.groq.com) |

### Step 1 — Clone the repository

```bash
git clone https://github.com/SHARATH204-MAX/SynapseSQL-Enterpise.git
cd SynapseSQL-Enterpise
code .                      # optional: open in VS Code
```

### Step 2 — Configure environment

```bash
cp .env.example .env        # macOS/Linux
Copy-Item .env.example .env # Windows PowerShell
```

Edit `.env` (minimum viable config):

```env
GROQ_API_KEY="gsk_your_groq_key_here"
JWT_SECRET_KEY=""   # generate → python -c "import secrets; print(secrets.token_urlsafe(48))"
```

> ⚠️ **The server refuses to start without a strong `JWT_SECRET_KEY`** (min 32 chars, leaked values deny-listed). This is deliberate fail-fast security.

Full variable reference: [⚙️ Environment Configuration](#️-environment-configuration).

### Step 3 — Backend setup

```bash
# Create & activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# (Re)seed the sample SQLite database: STUDENT + DEPARTMENTS
python backend/data/init_sqlite.py

# Optional: seed sample MongoDB data (test_store.products)
python backend/data/populate_mongo.py
```

### Step 4 — Build the frontend (single-port serving)

```bash
cd frontend
npm install
npm run build          # tsc && vite build → frontend/dist
cd ..
```

> 💡 The repo may already ship a pre-built `frontend/dist` — rebuild only after changing frontend code.

### Step 5 — Launch the unified server

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Step 6 — Open & verify

| Check | URL | Expected |
|---|---|---|
| 🖥️ App | http://localhost:8000 | React chat UI |
| 💚 Health | http://localhost:8000/health | `"status": "healthy"` |
| 📖 Docs | http://localhost:8000/docs | Swagger UI |
| 📡 API | http://localhost:8000/api/health | JSON diagnostics |

### 🔄 Development Mode (hot reload, 2 terminals)

```bash
# Terminal 1 — backend
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend (proxies /api → :8000 via vite.config.ts)
cd frontend && npm run dev
# → open http://localhost:5173
```

---

## 🐳 Docker Deployment

### Dockerfile — Multi-stage build explained

```dockerfile
# Stage 1: compile React SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: slim production runtime
FROM python:3.11-slim AS production-runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY backend/ /app/backend/
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
ENV PYTHONPATH=/app/backend PYTHONUNBUFFERED=1
WORKDIR /app/backend
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/health || exit 1
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
```

**Why multi-stage?** Build tooling (Node, npm cache) never reaches the production image → smaller attack surface & image size. The container speaks **Render's `$PORT` convention** (default 10000).

### docker-compose.yml

```bash
docker compose up --build      # → http://localhost:8000 (host 8000 → container 10000)
```

- `env_file: .env` injects secrets
- Volume `./backend/data:/app/backend/data` persists SQLite across rebuilds
- Healthcheck probes `/health` every 30s, `restart: unless-stopped`

---

## ☁️ Render Cloud Deployment

> 🔗 **Live:** [https://synapsesql-enterpise.onrender.com/](https://synapsesql-enterpise.onrender.com/)

This project deploys on Render as a **Docker Web Service**. Reproduce it in ~4 minutes:

1. **Push** the repository to GitHub.
2. Render Dashboard → **New → Web Service** → connect the repo.
3. **Runtime: Docker** (Render detects the root `Dockerfile`).
4. **Port:** Render injects `$PORT`; the Dockerfile's CMD already binds `${PORT:-10000}` — no manual port editing needed.
5. **Environment Variables** (Dashboard → Environment):

   | Key | Notes |
   |---|---|
   | `GROQ_API_KEY` | required for AI queries |
   | `JWT_SECRET_KEY` | required, ≥32 chars |
   | `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | optional — enables auth sync + audit logs |
   | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | baked at **frontend build** time |
   | `GOOGLE_CLIENT_ID` | optional — Google sign-in |
   | `ENVIRONMENT` | `production` (set via compose/Dockerfile) |

6. **Health Check Path:** `/health` (compose + Dockerfile both define probes).
7. **Persistent Disk (optional):** mount at `/app/backend/data` so `student.db` / `auth.db` survive deploys.
8. **Deploy** — every `git push` to `main` triggers a rebuild (Node stage → pip stage → boot).

> 💡 **Frontend change?** `VITE_*` variables are compiled into the bundle during `npm run build` — update them and redeploy so the new values are baked in.

---

## ⚙️ Environment Configuration

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ (AI) | Groq cloud key — free tier at [console.groq.com](https://console.groq.com). Also pasteable at runtime via the 🔑 Key modal. |
| `JWT_SECRET_KEY` | ✅ | HS256 signing secret. **Min 32 chars**; known-leaked values rejected at boot. Generate: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `SUPABASE_URL` | optional | Project URL — enables profile sync & query audit logs |
| `SUPABASE_ANON_KEY` | optional | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Server-side admin key (used by backend writes) |
| `VITE_SUPABASE_URL` | optional | Frontend build-time Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | optional | Frontend build-time anon key |
| `GOOGLE_CLIENT_ID` | optional | Google OAuth Web client ID |
| `OPENAI_API_KEY` / `HF_TOKEN` | optional | Reserved integrations |
| `LANGCHAIN_API_KEY` / `LANGCHAIN_PROJECT` / `LANGCHAIN_TRACING_V2` | optional | LangSmith tracing toggle |

All variables are documented in **[`.env.example`](.env.example)** — copy it to `.env` to begin. **Never commit `.env`** (it's `.gitignore`d).

---

## 📡 API Reference

Base paths: `/api` *(frontend)* and `/api/v1` *(versioned convention)* — identical routers.

### 🏥 Health
| Method | Endpoint | Auth | Rate | Description |
|---|---|---|---|---|
| GET | `/health` | — | 120/min | Liveness + DB probe + system info |
| GET | `/api/health` | — | 120/min | Same diagnostics under API prefix |

### 🔐 Auth
| Method | Endpoint | Auth | Rate | Description |
|---|---|---|---|---|
| GET | `/api/auth/config` | — | — | Public Supabase/Google client config |
| POST | `/api/auth/demo-login` | — | 30/min | 1-click role login → JWT |
| POST | `/api/auth/google` | — | 30/min | Verify Google ID token → JWT |
| GET | `/api/auth/me` | Bearer | — | Current session profile |
| GET | `/api/auth/history` | Bearer | — | Last 30 query logs (Supabase) |
| POST | `/api/auth/logout` | — | — | Session termination notice |

### 💬 Chat & Agent
| Method | Endpoint | Auth | Rate | Description |
|---|---|---|---|---|
| GET | `/api/chat/models` | optional | 60/min | Available Groq models (priority-ordered) |
| POST | `/api/chat/stream` | **Bearer** | **25/min** | **SSE streaming NL→SQL→report pipeline** |

**Body:** `{ query, conversationHistory[], databaseConfig{}, modelName?, apiKey?, readOnly }`

### 🗄️ Database
| Method | Endpoint | Auth | Rate | Description |
|---|---|---|---|---|
| POST | `/api/database/schema` | optional | 60/min | Deep introspection (tables/cols/FK/counts/samples) |
| POST | `/api/database/test-connection` | optional | 60/min | `{status, tablesCount}` connectivity probe |
| POST | `/api/database/execute` | optional | 60/min | Guardrailed raw query → `{columns, rows, rowCount}` |

### 📥 Export
| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/export/csv` | `{columns[], rows[][], filename}` | `text/csv` attachment |
| POST | `/api/export/excel` | same | `.xlsx` attachment |
| POST | `/api/export/json` | same | `application/json` attachment |

---

## 🔌 SSE Event Protocol

`POST /api/chat/stream` responds `text/event-stream`; each `data:` line is a JSON object:

| Type | Payload | Meaning |
|---|---|---|
| `status` | `{message}` | Pipeline heartbeat ("Inspecting schema…", "Executing SQL…") |
| `thought` | `{tool, input, thought}` | Agent reasoning step (collapsible accordion in UI) |
| `tool_output` | `{output}` | Result attached to the previous thought |
| `sql` | `{query}` | Generated SQL — rendered instantly in the SQL card |
| `token` | `{content}` | One streamed answer token (accumulated client-side) |
| `done` | `{answer, sql, data, model, executionTimeMs}` | Terminal success event |
| `error` | `{message}` | Terminal failure (guardrail block, auth, all-models-failed) |
| `warning` | `{message}` | Non-fatal (model failing over to next) |

---

## 💬 Usage Guide

### 1️⃣ Sign In
**Sign In** (top-right) → choose:
- 🔑 **Demo Role** — instant Admin / Analyst / Viewer access (no setup)
- 📧 **Supabase Email** — password auth
- 🔵 **Google OAuth** — if configured

### 2️⃣ Connect a Database
Sidebar → **Configure** → pick **SQLite / MySQL / MongoDB** → enter credentials → **Test Connection** → **Save & Apply**. The Schema Explorer refreshes instantly.

### 3️⃣ Ask Questions — typed or spoken 🎤

| Goal | Try this prompt |
|---|---|
| Aggregation | *"Show average marks and student count grouped by department"* |
| Filter | *"List all students in Data Science class with marks greater than 80"* |
| Ranking | *"Who are the top 3 highest scoring students with their department names?"* |
| Distribution | *"Show the average age and maximum marks across each section"* |
| Safety demo | *"Delete all students with marks below 40"* → 🛡️ **blocked by guardrails** |

### 4️⃣ Explore the Answer
- **Explanation** tab — structured 4-section markdown report
- **Table (N)** tab — search, click headers to sort, paginate, export **CSV / Excel**
- **Chart** tab — Bar / Line / Pie / Donut + Axis/Metric selectors
- **SQL Card** — ⧉ *Copy Query* · ▶ *Run SQL* · ⏱ latency · model badge
- **Agent Reasoning Steps** — expandable thought trace

### 5️⃣ Controls
- **Read-Only Guardrail toggle** (header) — defensive keyword blocking on/off
- **Model selector** — Qwen3.8-27B / GPT-OSS-120B / GPT-OSS-20B
- **🔑 API Key modal** — paste your own Groq key (stored in localStorage)
- **⏹ Stop** — abort generation mid-stream (AbortController)
- **🗂 Conversations** — multi-thread sidebar, persisted to localStorage

---

## 🧪 Testing

```bash
cd backend
pytest -v
```

**Test suite highlights** (`backend/tests/`):

| File | Verifies |
|---|---|
| `test_health.py` | Health diagnostics + DB probe |
| `test_database.py` | Schema finds `STUDENT`/`DEPARTMENTS` · safe SELECT returns exact rows · **`DROP TABLE` → 403 guardrail block** |
| `test_auth.py` | JWT issuance, demo roles, protected-route gating |
| `test_supabase_auth_gate.py` | 401 without valid token |
| `test_rate_limit.py` | Rate-limit enforcement & headers |

**Design:** session-scoped `TestClient` + fixture-minted JWTs for each role (`admin_token`, `analyst_token`, `viewer_token`, `auth_headers`) — tests assert **behavioral contracts** (e.g., the security guarantee), not implementation details.

---

## 📁 Project Structure

```
SynapseSQL-Enterpise/
├── 📄 README.md                  # You are here
├── 📄 LICENSE                    # MIT © 2026 SHARATH M
├── 📄 .env.example               # Env template (copy → .env)
├── 🐳 Dockerfile                 # Multi-stage: node build → python runtime
├── 🐳 docker-compose.yml         # Orchestration + healthcheck + volumes
│
├── ⚙️ backend/                   # ─────────── FastAPI ───────────
│   ├── app/
│   │   ├── main.py               # App entry · CORS · routers · SPA catch-all
│   │   ├── api/
│   │   │   ├── router.py         # /health /auth /chat /database /export
│   │   │   └── endpoints/        # health · auth · chat · database · export
│   │   ├── core/
│   │   │   ├── config.py         # Settings + fail-fast JWT secret validation
│   │   │   ├── auth.py           # JWT create/decode · Google verify · RBAC
│   │   │   ├── security.py       # Destructive-keyword guardrails
│   │   │   ├── limiter.py        # SlowAPI policies (25/60/30/120)
│   │   │   ├── database.py       # DatabaseManager · introspection · execution
│   │   │   └── supabase.py       # Singleton client · profiles · audit logs
│   │   ├── services/
│   │   │   ├── agent_service.py  # 🧠 SSE AI pipeline (failover + self-heal)
│   │   │   ├── user_service.py   # auth.db users & roles
│   │   │   └── export_service.py # pandas CSV/Excel/JSON
│   │   └── models/               # Pydantic schemas
│   ├── data/
│   │   ├── student.db            # Sample: STUDENT ⇄ DEPARTMENTS
│   │   ├── auth.db               # Internal identities & RBAC
│   │   ├── init_sqlite.py        # Seed/reset sample data
│   │   ├── populate_mongo.py     # Seed test_store.products
│   │   └── supabase_schema.sql   # Postgres DDL + RLS policies
│   ├── tests/                    # pytest suite
│   └── requirements.txt
│
└── 🎨 frontend/                  # ─────────── React 19 + TS ───────────
    ├── dist/                     # Production bundle (served by FastAPI)
    ├── src/
    │   ├── main.tsx              # Root · GoogleOAuthProvider · AuthProvider
    │   ├── App.tsx               # State hub · SSE consumer · modals
    │   ├── types/index.ts        # Shared TS contracts
    │   ├── services/
    │   │   ├── api.ts            # REST client + blob export downloads
    │   │   └── supabase.ts       # Browser Supabase client
    │   ├── context/AuthContext.tsx  # Session state · onAuthStateChange
    │   └── components/
    │       ├── layout/           # Sidebar (schema explorer) · Header
    │       ├── chat/             # ChatContainer · MessageItem · QueryCard
    │       │                     # DataTableView · ChartView · VoiceInput
    │       └── modals/           # Connection · ApiKey · Login · History · Table
    ├── index.css                 # Design system
    ├── vite.config.ts            # Dev proxy /api → :8000
    └── package.json
```

---

## 🔐 Security Architecture

```
                 🛡️  DEFENSE-IN-DEPTH LAYERS  🛡️

 Layer 1 · PROMPT FILTER      validate_query_safety() regex —
                              DROP · DELETE · TRUNCATE · ALTER ·
                              GRANT · REVOKE · CREATE/DROP USER · SHUTDOWN
                                       │
 Layer 2 · EXECUTION GATE     /database/execute re-validates → HTTP 403
                                       │
 Layer 3 · DB-LEVEL RO        SQLite opened read-only (file:...?mode=ro)
                              — the database itself refuses writes
                                       │
 Layer 4 · AUTHN              HTTPBearer → own HS256 JWT (7-day) →
                              Supabase JWT fallback → 401
                                       │
 Layer 5 · AUTHZ (RBAC)       admin / analyst / viewer · require_role() → 403
                                       │
 Layer 6 · RATE LIMITING      SlowAPI per-IP: chat 25 · db 60 · auth 30 · default 120
                                       │
 Layer 7 · SECRET HYGIENE     JWT_SECRET_KEY fail-fast: ≥32 chars,
                              leaked-value deny-list, validated at boot
                                       │
 Layer 8 · DATA PRIVACY       query_logs = prompt + SQL + metadata only.
                              Raw result rows NEVER persisted. Supabase RLS
                              scopes every user to their own rows.
```

> 📌 **Honest note:** regex guardrails are a *filter*, not a parser. Production hardening path: SQL AST allow-listing (SELECT-only via sqlparse/sqlglot) + least-privilege DB credentials + read replicas. This is tracked in the roadmap.

---

## 🛣️ Roadmap & Known Limitations

### ✅ Implemented
- [x] SSE streaming pipeline with self-healing SQL & multi-model failover
- [x] SQLite / MySQL / MongoDB connection management + live introspection
- [x] RBAC + Supabase/Google/Demo auth + audit logging with RLS
- [x] Charts, data grid, exports, voice input, query history
- [x] Multi-stage Docker + Render deployment

### 🚧 In Progress / Next
- [ ] **MySQL custom port plumbing** — `SchemaRequest`/URIs currently assume 3306; adding `mysql_port` end-to-end
- [ ] **MongoDB chat execution** — introspection works today; the executor path is SQL-native (pymongo/aggregation branch planned)
- [ ] **SQL AST allow-listing** — replace regex-only guardrails with parse-tree SELECT-only enforcement
- [ ] **httpOnly cookie sessions** — move tokens out of localStorage (XSS hardening)
- [ ] **Schema RAG** — embedding-retrieved DDL for 100+ table databases
- [ ] **Function-calling SQL tools** — structured `run_sql()` tool instead of free-text generation
- [ ] **CI/CD** — GitHub Actions pipeline (pytest + build + image publish)

---

## ❓ FAQ & Troubleshooting

<details>
<summary><b>localhost refused to connect (ERR_CONNECTION_REFUSED)</b></summary>

Run uvicorn with `--host 0.0.0.0 --port 8000`. On Windows, binding only `127.0.0.1` can break IPv6 (`::1`) resolution — `0.0.0.0` enables dual-stack routing.
</details>

<details>
<summary><b>Server exits: "JWT_SECRET_KEY is not set / too short / leaked"</b></summary>

Generate one: `python -c "import secrets; print(secrets.token_urlsafe(48))"` → paste into `.env`. Minimum 32 characters; known-compromised values are rejected by design.
</details>

<details>
<summary><b>Groq API key invalid or missing</b></summary>

Confirm `.env` sits in the repo root with `GROQ_API_KEY="gsk_..."`, or click the 🔑 key icon in the app and paste a key at runtime.
</details>

<details>
<summary><b>How do I connect MySQL / MongoDB instead of SQLite?</b></summary>

Sidebar → **Configure** → select the engine → enter host/username/password/DB (Mongo: URI + DB name) → **Test Connection** → **Save & Apply**. Seed Mongo sample data with `python backend/data/populate_mongo.py`.
</details>

<details>
<summary><b>Frontend not loading on the unified port</b></summary>

Build it first: `cd frontend && npm install && npm run build`. The catch-all handler serves `frontend/dist` — if missing, you'll see the API JSON fallback message.
</details>

<details>
<summary><b>Google OAuth error 400: origin_mismatch</b></summary>

Google rejects raw IPs. Access via `http://localhost:8000`, add origins in Google Cloud Console, or simply use Demo Roles.
</details>

<details>
<summary><b>App sleeps / first request is slow on Render</b></summary>

Free-tier services spin down after inactivity — the first hit wakes the instance (~30–60s). Subsequent requests are fast.
</details>

<details>
<summary><b>429 Too Many Requests</b></summary>

Working as intended — rate limits are per IP (chat 25/min). Wait a minute or raise the policy in `backend/app/core/limiter.py`.
</details>

<details>
<summary><b>Query blocked by Security Guardrails</b></summary>

Read-only mode intercepted a destructive keyword. Toggle the guardrail switch in the header for write sessions (or rephrase to a SELECT).
</details>

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn and build. **Any contributions you make are greatly appreciated.**

1. **Fork** the Project
2. **Create** your Feature Branch → `git checkout -b feature/AmazingFeature`
3. **Commit** your Changes → `git commit -m 'Add some AmazingFeature'`
4. **Push** to the Branch → `git push origin feature/AmazingFeature`
5. **Open** a Pull Request

Please run `pytest -v` (backend) and `npm run build` (frontend) before submitting.

---

## 📄 License

Distributed under the **MIT License**.

```
MIT License · Copyright (c) 2026 SHARATH M

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the full text in [`LICENSE`](LICENSE).

---

<div align="center">

**⭐ If this project helped you, consider giving it a star on [GitHub](https://github.com/SHARATH204-MAX/SynapseSQL-Enterpise)! ⭐**

[![Live Demo](https://img.shields.io/badge/🚀_Launch_SynapseSQL-synapsesql--enterpise.onrender.com-0ea5e9?style=for-the-badge&logo=render&logoColor=white)](https://synapsesql-enterpise.onrender.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/SHARATH204-MAX/SynapseSQL-Enterpise/pulls)

*Built with FastAPI · LangChain · Groq · React · Supabase · Docker*

</div>
