# 🦜 SynapseSQL Enterprise - AI Database Intelligence

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![Groq](https://img.shields.io/badge/AI%20Engine-Groq%20Llama%20%2F%20Qwen-f55036.svg?style=flat)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, conversational database intelligence assistant designed to query relational databases (**SQLite, MySQL, PostgreSQL**) and NoSQL (**MongoDB**) using natural English and voice commands. 

Featuring real-time Server-Sent Events (SSE) streaming, automated data visualization (Bar, Line, Pie, Donut charts), interactive sortable data grids, live database schema introspection, 1-click SQL copy, read-only safety guardrails, and Google OAuth 2.0 with Role-Based Access Control (RBAC).

---

## 🏗️ Architecture & Unified Single-Link Delivery

SynapseSQL delivers a seamless developer experience by compiling the React/Vite single-page application and serving it directly through FastAPI on a **single unified port**:

```
                                  BROWSER CLIENT
                                        │
                         http://localhost:8000
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │         FastAPI Unified Host         │
                     │          (Port 8000 / ASGI)          │
                     └──────────────────┬───────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
    Static File Handler                                      API Router (/api/*)
  (Serves React SPA Dist)                                  (Endpoints & Controllers)
             │                                                     │
    ┌────────┴────────┐                                  ┌─────────┴─────────┐
    │  React 18 App   │                                  │  LangChain Agent  │
    │  - UI Dashboard │                                  │  - Groq AI Models │
    │  - Chart.js     │                                  │  - SQL Generation │
    │  - Voice Mic    │                                  │  - Guardrails     │
    └─────────────────┘                                  └─────────┬─────────┘
                                                                   │
                                                ┌──────────────────┴──────────────────┐
                                                ▼                                     ▼
                                       Relational Databases                   NoSQL Database
                                     (SQLite / MySQL / Postgres)                 (MongoDB)
```

---

## 📁 Repository Structure

```
MAJOR_PROJECT/
├── .env.example               # Environment variable template
├── .gitignore                 # Excludes secrets, venv, and node_modules
├── Dockerfile                 # Multi-stage production container
├── docker-compose.yml         # Container orchestration
├── README.md                  # Comprehensive setup & architecture documentation
│
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── api/               # REST & SSE Streaming Endpoints (chat, db, auth, export)
│   │   ├── core/              # Config, Rate Limiter, Security Guardrails, DB Pool
│   │   ├── models/            # Pydantic validation schemas & JWT models
│   │   ├── services/          # LangChain SQL Agents, MongoDB Agent & Export Engine
│   │   └── main.py            # FastAPI Entrypoint & Static SPA Host
│   ├── data/
│   │   ├── student.db         # Pre-configured sample SQLite database
│   │   ├── supabase_schema.sql# PostgreSQL DDL for Supabase (user profiles & query logs)
│   │   ├── init_sqlite.py     # Database schema & sample records generator
│   │   └── populate_mongo.py  # Sample MongoDB generator
│   └── requirements.txt       # Python backend dependencies

│
└── frontend/                  # React 18 + TypeScript + Vite Frontend
    ├── dist/                  # Pre-built production bundle (served by FastAPI)
    ├── src/
    │   ├── components/        # ChatContainer, QueryCard, TableView, Charts, Modals
    │   ├── context/           # AuthContext (Google OAuth + Demo Roles)
    │   ├── services/          # API client & SSE stream consumer
    │   ├── types/             # TypeScript definitions
    │   ├── App.tsx            # Root dashboard interface
    │   ├── index.css          # Design system
    │   └── main.tsx           # Entrypoint & OAuth Provider
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Complete Step-by-Step Setup Guide (From Scratch in VS Code)

Follow these exact steps if you have forked or cloned this repository to set up and run both backend and frontend seamlessly.

### Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.10 or 3.11** ([Download Python](https://www.python.org/downloads/)) — *ensure "Add python.exe to PATH" is checked during installation*.
- **Node.js 18+ and npm** ([Download Node.js](https://nodejs.org/))
- **Git** ([Download Git](https://git-scm.com/))
- **VS Code** ([Download VS Code](https://code.visualstudio.com/))

---

### Step 1: Clone & Open in VS Code

Open terminal or command prompt and run:

```bash
# Clone your forked repository
git clone https://github.com/<your-username>/<your-repo-name>.git

# Navigate into the project directory
cd MAJOR_PROJECT

# Open the project in VS Code
code .
```

---

### Step 2: Configure Environment Variables (`.env`)

In VS Code, create a `.env` file in the `MAJOR_PROJECT` root by copying `.env.example`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux (Bash):**
```bash
cp .env.example .env
```

Open `.env` and configure your API keys:

```env
# Required: Free API key from https://console.groq.com
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Required for session security (can keep default or customize)
JWT_SECRET_KEY="synapsesql-enterprise-secret-jwt-key-2026-production"

# Supabase Authentication & PostgreSQL Usage Ingestion
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_your_service_role_key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_your_anon_key"
```

> 💡 **Supabase Database Setup (1-Minute Quick Setup)**:
> 1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com).
> 2. Navigate to **SQL Editor** on the left menu.
> 3. Open [`backend/data/supabase_schema.sql`](backend/data/supabase_schema.sql) in this repo, copy its entire contents, paste it into the Supabase SQL editor, and click **Run**.
> 4. This creates the `user_profiles` and `query_logs` tables with Row-Level Security (RLS) enabled.

---


### Step 3: Set Up the Backend & Database

Open an integrated terminal in VS Code (`Ctrl + ~` or `Cmd + ~`):

#### 1. Create and activate a Python virtual environment:

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If PowerShell restricts scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

**macOS / Linux (Bash):**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2. Install Python dependencies:
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

#### 3. Initialize the Sample Database:
The project includes a ready-to-query SQLite database with `STUDENT` and `DEPARTMENTS` tables. To generate or reset fresh sample records:
```bash
python backend/data/init_sqlite.py
```

---

### Step 4: (Optional) Build or Modify the Frontend

The repository comes with a pre-compiled `frontend/dist` directory so you can run the application immediately. 

If you make any changes to frontend code or want to compile freshly:

```bash
# In a new terminal tab or navigate to frontend
cd frontend

# Install Node modules
npm install

# Build the production bundle into frontend/dist
npm run build

# Return to root
cd ..
```

---

### Step 5: Run the Unified Application (Single-Link Delivery)

Start the unified server from the `backend` directory:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

### 🌐 Step 6: Open & Test the Model (Single Link)

Open your browser and navigate to:

👉 **[http://localhost:8000](http://localhost:8000)**

*(Both the React frontend and the FastAPI backend are connected and running on this single link!)*

---

## 🧪 Testing the AI Model

Once the interface opens at `http://localhost:8000`:

### 1. Instant Sign In
- Click **Sign In** in the top right navigation bar.
- Click **Admin Role** or **Data Analyst Role** for instant 1-click access (no Google Cloud setup needed).

### 2. Check Database Schema Explorer
- In the left sidebar under **Schema Explorer**, expand `STUDENT` and `DEPARTMENTS` to inspect columns (`NAME`, `MARKS`, `AGE`, `CLASS`, `SECTION`, `DEPT_NAME`).

### 3. Example Natural Language Queries to Test:

Type or speak using the microphone button:

| Goal | Prompt |
|---|---|
| **Department Analysis** | *"Show average marks and student count grouped by department"* |
| **Filtered Search** | *"List all students in Data Science class with marks greater than 80"* |
| **Top Performers** | *"Who are the top 3 highest scoring students with their department names?"* |
| **Age Distribution** | *"Show the average age and maximum marks of students across each section"* |

### 4. Interactive Features to Explore:
- **⚡ 1-Click SQL Copy**: Click the **Copy SQL** button on any response to copy the executed SQL query directly to your clipboard.
- **📊 Auto-Visualization**: Toggle between **AI Explanation**, **Interactive Data Grid**, and dynamic **Charts** (Bar, Line, Pie, Donut).
- **📥 Data Export**: Export table query results directly to **CSV** or **Excel** (`.xlsx`).
- **🛡️ Safety Interceptor**: Try asking *"Delete all students with marks below 40"* to observe the safety guardrail intercept and block destructive operations.

---

## 💻 Optional: Frontend Development Mode (Hot Reloading)

If you are actively developing and styling the frontend with live instant reload:

```bash
# Terminal 1: Backend API Server
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Vite Dev Server
cd frontend
npm run dev
```

Open **`http://localhost:5173`**. Vite automatically proxies `/api` calls to `http://localhost:8000`.

---

## 🔐 Google OAuth 2.0 Setup (Optional)

If you want to use personal or corporate Google Accounts instead of Demo Roles:

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:8000`
   - `http://localhost:5173`
   - `http://localhost`
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:8000`
   - `http://localhost:5173`
5. Copy your Client ID into `.env` as `GOOGLE_CLIENT_ID="..."`.

> ⚠️ **Note on `Error 400: origin_mismatch`**: Google OAuth forbids raw IP addresses (e.g. `127.0.0.1`). Always access the application through `http://localhost:8000` or use the built-in **Demo Roles**.

---

## 🛠️ Troubleshooting FAQ

### Q1: "localhost refused to connect" (ERR_CONNECTION_REFUSED)
**Solution**: Ensure uvicorn was started with `--host 0.0.0.0 --port 8000`. On Windows, binding strictly to `127.0.0.1` can cause IPv6 resolution (`::1`) to be refused by the browser. Using `0.0.0.0` enables dual-stack routing so `http://localhost:8000` connects instantly.

### Q2: "Groq API Key Invalid or Missing"
**Solution**: Verify that `.env` exists in the `MAJOR_PROJECT` root folder and contains `GROQ_API_KEY="gsk_..."`. Alternatively, click the **Key icon** in the top navigation bar of the web app to paste your API key directly in the UI.

### Q3: How to connect to MySQL or MongoDB instead of SQLite?
**Solution**: Click the **Database icon / Database Settings** button in the header bar. Select **MySQL** or **MongoDB**, enter your host, port, username, and password, and click **Test Connection** followed by **Save & Connect**.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
