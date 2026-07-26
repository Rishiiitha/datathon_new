# CrimeIQ — Karnataka Police Crime Intelligence Platform

> **AI-powered conversational crime intelligence system built for Karnataka Police.**  
> Natural-language queries → SQL → structured investigation insights, repeat-offender graphs, forecasting, and multilingual (English + Kannada) support.

deployed in zoho-catalyst: https://meridian-60078546885.development.catalystserverless.in/app/financial

had fun and easy work using it.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [LLM Options](#llm-options)
- [Available Functions](#available-functions)
- [Database Schema](#database-schema)
- [Deployment (Zoho Catalyst)](#deployment-zoho-catalyst)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Module | Description |
|--------|-------------|
| 💬 **AI Chat** | Natural-language queries converted to SQL, answered with context-aware intelligence using conversation history |
| 🕸️ **Criminal Networks** | Interactive force-graph visualization of accused ↔ case ↔ victim ↔ officer relationships |
| 📊 **Analytics Dashboard** | Real-time KPIs — FIRs, arrests, chargesheet rates, crime-type breakdown |
| 🗺️ **Crime Forecasting** | Trend prediction and district-level hotspot heatmaps |
| 👤 **Offender Profiles** | Risk-scored dossiers with behavioral analysis and co-accused links |
| 🔍 **Case Investigation** | AI-generated leads, similar-case matching, evidence timeline |
| 💰 **Financial Crime** | Transaction network graphs for economic offenses |
| 🌐 **Multilingual** | Full support for English and Kannada (ಕನ್ನಡ) |
| 🔐 **Role-based Access** | Investigator / Analyst / Supervisor / Policymaker / Admin roles |

---

## Tech Stack

**Frontend**
- React 18 + Vite 5
- Zustand (state management)
- Recharts (analytics charts)
- Vis-Network (criminal network graphs)
- React-Leaflet (heatmaps)
- Axios

**Backend (Zoho Catalyst Serverless Functions)**
- Node.js 18 (CommonJS)
- `zcatalyst-sdk-node` (Datastore, Connections)
- OpenAI GPT-4o or local Ollama (Llama 3.2) for NL→SQL + answer generation

**Platform**
- [Zoho Catalyst](https://catalyst.zoho.com/) — serverless hosting, managed MySQL datastore, file store

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│               React SPA (crimeiq/)              │
│  Dashboard · Chat · Networks · Analytics · ...  │
└───────────────────┬─────────────────────────────┘
                    │ HTTP (Axios, 3-second timeout + static fallback)
                    ▼
┌─────────────────────────────────────────────────┐
│        Zoho Catalyst Advanced I/O Functions     │
│                                                 │
│  /server/chat-function         (NL→SQL→Answer)  │
│  /server/analytics-function    (KPIs, trends)   │
│  /server/network-function      (graph data)     │
│  /server/profiling-function    (offender risk)  │
│  /server/forecast-function     (ML prediction)  │
│  /server/investigation-function(case leads)     │
│  /server/financial-function    (tx networks)    │
│  /server/admin-function        (users, audit)   │
│  /server/export-function       (PDF reports)    │
│  /server/voice-function        (transcription)  │
└───────────────────┬─────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌──────────────┐    ┌──────────────────────┐
│ Catalyst     │    │ LLM Provider         │
│ Datastore    │    │ Ollama (local)  OR   │
│ (MySQL)      │    │ OpenAI GPT-4o (cloud)│
└──────────────┘    └──────────────────────┘
```

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9.x | Bundled with Node.js |
| Zoho Catalyst CLI | latest | `npm i -g @zohocorp/catalyst-cli` |
| Zoho Account | — | [catalyst.zoho.com](https://catalyst.zoho.com) — free tier available |
| Git | ≥ 2.x | [git-scm.com](https://git-scm.com) |
| **LLM** (pick one): | | |
| → Ollama (free, local) | latest | [ollama.com](https://ollama.com) |
| → OpenAI API key | — | [platform.openai.com](https://platform.openai.com) |

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/<your-org>/crimeiq.git
cd crimeiq
```

### 2. Install dependencies

```bash
# Frontend
cd crimeiq
npm install
cd ..

# Backend functions (run in each function directory, or use the loop below)
for dir in functions/*/; do
  [ -f "$dir/package.json" ] && (cd "$dir" && npm install)
done
```

> **Windows PowerShell alternative:**
> ```powershell
> Get-ChildItem -Path functions -Directory | ForEach-Object {
>   if (Test-Path "$($_.FullName)/package.json") {
>     Push-Location $_.FullName; npm install; Pop-Location
>   }
> }
> ```

### 3. Configure environment

```bash
# Root — LLM credentials
cp .env.example .env
# Edit .env and set OPENAI_API_KEY (or leave blank for Ollama)

# Frontend — Vite base URL
cp crimeiq/.env.example crimeiq/.env
# Default VITE_API_BASE_URL=http://localhost:3000 works for local dev
```

### 4. Set up Zoho Catalyst

```bash
# Login to Catalyst (opens browser)
catalyst login

# Link to your Catalyst project
catalyst init
# → Select or create a project and choose the Development environment
```

### 5. Build the frontend

```bash
cd crimeiq
npm run build
cd ..
```

### 6. Start the local dev server

```bash
# From the project root (datathon_new/)
catalyst serve
```

The app is now running at **http://localhost:3000/app/**

> Dev mode with hot-reload (separate terminal):
> ```bash
> cd crimeiq && npm run dev
> # Opens at http://localhost:3001 with proxy to Catalyst on :3000
> ```

---

## Configuration

### Environment Variables

**Root `.env`** (backend functions)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Optional* | — | OpenAI API key. Leave blank to use Ollama. |
| `LLM_PROVIDER` | No | `openai` | `openai` or `ollama` |
| `LLM_MODEL` | No | `gpt-4o` | e.g. `gpt-4o`, `gpt-3.5-turbo` |
| `OLLAMA_MODEL` | No | `llama3.2` | Ollama model name (e.g. `llama3.2`, `mistral`) |

> \* Either `OPENAI_API_KEY` or a running Ollama instance is required for AI-generated answers. The app works without both — it falls back to a smart rule-based engine.

**`crimeiq/.env`** (frontend)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `''` | API base URL. Leave empty for Catalyst deployment. Set to `http://localhost:3000` for local dev. |

### Catalyst Connections (for OpenAI via Zoho Vault)

As an alternative to the `.env` key, you can store the OpenAI API key securely in **Catalyst → Connections**:

1. Go to **Catalyst Console → Connections → Add Connection**
2. Name it `openai`, type: **API Key**, key name: `apiKey`
3. Paste your OpenAI key
4. The function will auto-detect it at runtime

---

## Project Structure

```
datathon_new/                    ← Catalyst project root
├── .env                         ← Backend secrets (git-ignored)
├── .env.example                 ← Template — copy to .env
├── .gitignore
├── .catalystrc                  ← Catalyst project config (git-ignored)
├── catalyst.json                ← Function & client source mapping
│
├── crimeiq/                     ← React frontend (Vite)
│   ├── src/
│   │   ├── pages/               ← Route-level components
│   │   │   ├── Dashboard/
│   │   │   ├── Chat/            ← AI chat interface
│   │   │   ├── Network/         ← Criminal network graph
│   │   │   ├── Analytics/
│   │   │   ├── AccusedProfile/
│   │   │   ├── Forecasting/
│   │   │   ├── Financial/
│   │   │   ├── Sociological/
│   │   │   ├── Cases/
│   │   │   ├── Admin/
│   │   │   └── Login/
│   │   ├── components/          ← Shared UI components
│   │   ├── services/
│   │   │   └── api.js           ← All API calls + static fallbacks
│   │   ├── store/               ← Zustand state (auth, chat)
│   │   ├── App.jsx              ← Routes + auth guard
│   │   └── index.css            ← Global design system
│   ├── .env                     ← Frontend env (git-ignored)
│   ├── .env.example
│   ├── dist/                    ← Production build (git-ignored)
│   └── vite.config.js
│
└── functions/                   ← Catalyst serverless functions
    ├── chat-function/           ← NL→SQL→Answer engine
    │   ├── index.js
    │   └── lib/
    │       ├── openai.js        ← LLM client (Ollama + OpenAI) + fallback
    │       ├── db.js            ← Catalyst Datastore query wrapper
    │       └── auth.js          ← Role extraction + PII masking
    ├── analytics-function/
    ├── network-function/
    ├── profiling-function/
    ├── forecast-function/
    ├── investigation-function/
    ├── financial-function/
    ├── admin-function/
    ├── export-function/
    ├── voice-function/
    └── seed-function/           ← Database seeder
```

---

## LLM Options

CrimeIQ supports two LLM backends. It tries them **in order** — if one fails, it falls back to the next:

```
1. Ollama (local)  →  2. OpenAI GPT-4o (cloud)  →  3. Rule-based fallback
```

### Option A — Ollama (Free, runs locally)

```bash
# Install Ollama from https://ollama.com
ollama pull llama3.2          # recommended model (~2GB)
# or: ollama pull mistral     # lighter alternative

# Leave OPENAI_API_KEY blank in .env
# Ollama must be running on port 11434 when catalyst serve is active
ollama serve                   # usually auto-starts after install
```

### Option B — OpenAI (Cloud, best quality)

```bash
# In .env
OPENAI_API_KEY=sk-proj-your-key-here
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o              # or gpt-3.5-turbo for lower cost
```

### Option C — No LLM (offline demo)

Leave both blank — the rule-based engine handles 10+ crime query types (murder/302, theft/379, NDPS, cyber fraud, repeat offenders, trends, district stats, FIR lookup, accused dossier, and more) with realistic Karnataka Police data.

---

## Available Functions

| Endpoint | Function | Description |
|----------|----------|-------------|
| `POST /server/chat-function` | chat-function | Context-aware NL→SQL→Answer with history |
| `GET /server/analytics-function/summary` | analytics-function | KPI summary |
| `GET /server/analytics-function/trends` | analytics-function | Monthly crime trends |
| `GET /server/analytics-function/by-crime-type` | analytics-function | Crime category breakdown |
| `GET /server/analytics-function/by-district` | analytics-function | District-wise counts |
| `GET /server/analytics-function/heatmap` | analytics-function | Lat/lng heatmap data |
| `GET /server/network-function/:accusedId` | network-function | Criminal network graph |
| `GET /server/network-function/search` | network-function | Search accused by name |
| `GET /server/profiling-function/:accusedId` | profiling-function | Offender risk dossier |
| `GET /server/forecast-function` | forecast-function | Crime forecast + hotspots |
| `GET /server/investigation-function/case/:id` | investigation-function | Case deep-dive + AI leads |
| `GET /server/financial-function/network/:id` | financial-function | Financial transaction graph |
| `POST /server/admin-function/auth/login` | admin-function | Authentication |
| `GET /server/admin-function/admin/users` | admin-function | User management |
| `GET /server/export-function/:sessionId` | export-function | Export chat as PDF |
| `POST /server/voice-function/transcribe` | voice-function | Voice → text transcription |

---

## Database Schema

The Catalyst Datastore uses the following MySQL tables:

```sql
CaseMaster      (CaseMasterID, CrimeNo, CaseNo, CrimeRegisteredDate, 
                 PoliceStationID, DistrictName, BriefFacts, CaseStatusName, GravityOffence)

Accused         (AccusedMasterID, CaseMasterID, AccusedName, AgeYear, GenderID, PersonID)

Victim          (VictimMasterID, CaseMasterID, VictimName, AgeYear)

ArrestSurrender (ArrestSurrenderID, CaseMasterID, ArrestSurrenderDate)

ActSectionAssociation (CaseMasterID, ActID, SectionID, SectionDescription)
```

### Seed the database

```bash
# After catalyst serve is running
curl -X POST http://localhost:3000/server/seed-function
```

The seed function inserts sample Karnataka Police FIR data including accused, victims, and IPC section associations.

---

## Deployment (Zoho Catalyst)

### First-time deploy

```bash
# Build frontend
cd crimeiq && npm run build && cd ..

# Deploy everything to Catalyst cloud
catalyst deploy
```

### Update functions only

```bash
catalyst deploy --only functions
```

### Update frontend only

```bash
cd crimeiq && npm run build && cd ..
catalyst deploy --only client
```

Your live app URL will be:
```
https://<project-name>.<domain>.catalystserverless.com/app/
```

> **Set environment variables in Catalyst Console:**  
> Go to **Console → Functions → Environment Variables** and add `OPENAI_API_KEY`, `LLM_PROVIDER`, `LLM_MODEL`.

---

## Local Development

```
Terminal 1: Catalyst backend + DB proxy
  cd datathon_new/
  catalyst serve                      # http://localhost:3000

Terminal 2: Vite dev server (hot reload)
  cd datathon_new/crimeiq/
  npm run dev                         # http://localhost:3001
```

The Vite dev server proxies `/api` and `/server` routes to `localhost:3000`, so both environments share the same backend.

### Demo login credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@karnataka.gov.in` | `Admin@123` |
| Investigator | `investigator@karnataka.gov.in` | `Inv@123` |
| Analyst | `analyst@karnataka.gov.in` | `Ana@123` |
| Supervisor | `supervisor@karnataka.gov.in` | `Sup@123` |

---

## Troubleshooting

### App loads but shows "loading forever"
The frontend has a **3-second timeout** on all API calls and will automatically fall back to static demo data. If you're seeing a spinner for more than 3 seconds, hard-refresh: `Ctrl + Shift + R`.

### Chat gives same response for every query
- Ensure `catalyst serve` is running
- Check that the chat-function `lib/openai.js` can reach Ollama (`ollama serve`) or OpenAI
- The rule-based fallback fires for 10+ intent types — try specific queries: *"Show murder cases in Bengaluru 2024"*, *"Who are the repeat offenders in Mysuru?"*

### `catalyst: command not found`
```bash
npm install -g @zohocorp/catalyst-cli
catalyst login
```

### Ollama not responding
```bash
ollama serve               # start the daemon
ollama list                # confirm llama3.2 is installed
ollama pull llama3.2       # install if missing
```

### CORS errors in browser
Make sure you are hitting the Catalyst dev server (`localhost:3000`) not the Vite dev server directly for API calls. The `vite.config.js` proxy handles this automatically in dev mode.

### `node_modules` missing in a function
```bash
cd functions/chat-function && npm install
```

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes — keep functions in `functions/<name>/` and UI in `crimeiq/src/`
3. Build the frontend: `cd crimeiq && npm run build`
4. Test locally with `catalyst serve`
5. Open a Pull Request with a clear description of what changed

---

## License

This project was built for the **Karnataka Police Datathon 2024**.  
Released under the [MIT License](LICENSE).

---

<p align="center">
  Signing off - Team Meridian :)
</p>
