# CrikIQ — Where Data Meets Match-Winning Decisions

> ICC Men's T20 World Cup 2026 · Cricket Intelligence Platform

---

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   React SPA  │  │  Framer      │  │   Recharts / D3      │  │
│  │  (Vite 8)    │  │  Motion      │  │   Visualizations     │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘  │
│         │  Axios HTTP (proxied via Vite dev server)             │
└─────────┼───────────────────────────────────────────────────────┘
          │ /api/*  →  127.0.0.1:8001
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Route Layer                          │   │
│  │  /matches  /players  /teams  /predict  /strategy        │   │
│  │  /insights  /venues  /awards  /advanced  /ai            │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                  Analytics Layer                        │   │
│  │                                                         │   │
│  │  insights_engine.py   ← Rule-based NLP                 │   │
│  │  advanced_analytics.py ← Deep stats                    │   │
│  │  strategy_engine.py   ← Best XI / bowling plan         │   │
│  │  simulation.py        ← Monte Carlo                    │   │
│  │  ai_engine.py         ← AI orchestrator                │   │
│  │  query_parser.py      ← Intent detection               │   │
│  │  response_generator.py ← Template responses            │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                  Data Layer (Pandas)                    │   │
│  │                                                         │   │
│  │  matches.csv · squads.csv · batting_stats.csv           │   │
│  │  bowling_stats.csv · key_scorecards.csv                 │   │
│  │  venues.csv · awards.csv · points_table.csv             │   │
│  │  tournament_summary.csv                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (JavaScript), Vite 8 |
| Styling | Tailwind CSS v4 + custom Apple/iOS design system |
| Animations | Framer Motion (spring physics) |
| Charts | Recharts |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Python FastAPI + Uvicorn |
| Data Processing | Pandas |
| Data Source | 9 CSV files (no database) |

---

## Project Structure

```
pitchiq/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, router registration
│   ├── requirements.txt
│   ├── *.csv                      # 9 tournament datasets
│   │
│   ├── routes/                    # API route handlers
│   │   ├── matches.py             # GET /matches/*
│   │   ├── players.py             # GET /players/*
│   │   ├── teams.py               # GET /teams/*
│   │   ├── predict.py             # GET /predict/*
│   │   ├── strategy.py            # GET /strategy/*
│   │   ├── insights.py            # GET /insights/*
│   │   ├── venues.py              # GET /venues/*
│   │   ├── awards.py              # GET /awards/*
│   │   ├── advanced.py            # GET /advanced/*
│   │   └── ai_chat.py             # POST /ai/chat, GET /ai/*
│   │
│   ├── services/
│   │   └── data_loader.py         # CSV → Pandas DataFrame loaders
│   │
│   └── analytics/
│       ├── insights_engine.py     # Rule-based NLP insight generation
│       ├── advanced_analytics.py  # Century tracker, H2H, streaks, etc.
│       ├── strategy_engine.py     # Best XI, batting order, bowling plan
│       ├── simulation.py          # Monte Carlo tournament simulation
│       ├── ai_engine.py           # AI query orchestrator
│       ├── query_parser.py        # Keyword intent detection
│       └── response_generator.py  # Template-based response generation
│
└── frontend/
    ├── vite.config.js             # Vite + Tailwind + proxy config
    ├── src/
    │   ├── App.jsx                # Router, layout, AIChat mount
    │   ├── index.css              # Design system (glass, glow, vibrancy)
    │   │
    │   ├── pages/                 # 16 route pages
    │   │   ├── Overview.jsx       # Executive dashboard
    │   │   ├── Matches.jsx        # Match timeline + nail-biters
    │   │   ├── Players.jsx        # Player leaderboard + profiles
    │   │   ├── Batting.jsx        # Batting analytics lab
    │   │   ├── Bowling.jsx        # Bowling intelligence
    │   │   ├── Strategy.jsx       # Strategy lab (Best XI)
    │   │   ├── Venues.jsx         # Venue intelligence
    │   │   ├── Teams.jsx          # Team standings + radar
    │   │   ├── Predict.jsx        # Match prediction + simulation
    │   │   ├── Awards.jsx         # Tournament awards
    │   │   ├── Records.jsx        # Records wall + century tracker
    │   │   ├── HeadToHead.jsx     # H2H + winning streaks
    │   │   ├── PlayerCompare.jsx  # Player comparison + clutch
    │   │   ├── TeamDepth.jsx      # Dependency + NRR + qual paths
    │   │   ├── AIPredictions.jsx  # AI predictions + anomaly detection
    │   │   └── Settings.jsx       # Feature toggles + model params
    │   │
    │   ├── components/
    │   │   ├── Sidebar.jsx        # Collapsible grouped navigation
    │   │   ├── AIChat.jsx         # Floating AI chat widget
    │   │   ├── KPICard.jsx        # Glowing metric card
    │   │   ├── AIInsightCard.jsx  # AI insight display
    │   │   ├── GlassCard.jsx      # Reusable glass container
    │   │   ├── StatNumber.jsx     # Glowing stat number
    │   │   ├── ImpactBadge.jsx    # Player impact tier badge
    │   │   ├── LoadingSpinner.jsx # Dual-ring loader
    │   │   └── PageHeader.jsx     # Page title with icon glow
    │   │
    │   ├── services/
    │   │   └── api.js             # All Axios API calls
    │   │
    │   ├── hooks/
    │   │   └── useFetch.js        # Generic data fetching hook
    │   │
    │   └── utils/
    │       └── colors.js          # Team colors + chart palette
```

---

## API Endpoints

```
GET  /matches/                     All matches
GET  /matches/summary              Tournament summary + AI insight
GET  /matches/toss-analysis        Toss win correlation
GET  /players/batting              Batting stats + AI insights
GET  /players/bowling              Bowling stats + AI insights
GET  /players/leaderboard          Combined impact score ranking
GET  /players/{name}               Full player profile
GET  /teams/standings              Points table by group
GET  /teams/{team}/stats           Team batting, bowling, squad
GET  /teams/{team}/radar           Radar chart data
GET  /predict/match                Match winner probability
GET  /predict/tournament           Monte Carlo simulation
GET  /predict/win-probability      Live win probability engine
GET  /strategy/best-xi             Best XI + batting order + bowling plan
GET  /advanced/centuries           Century tracker
GET  /advanced/head-to-head        H2H records
GET  /advanced/streaks             Winning streaks
GET  /advanced/closest-matches     Nail-biters ranked by margin
GET  /advanced/dependency          Batting dependency score
GET  /advanced/bowling-variety     Spin vs pace balance
GET  /advanced/boundary-stats      Boundary percentage analysis
GET  /advanced/clutch              Knockout vs group performance
GET  /advanced/compare-players     Side-by-side player comparison
GET  /advanced/qualification-path  Team journey through tournament
GET  /advanced/records             Tournament records wall
GET  /advanced/nrr-breakdown       NRR for all teams
GET  /advanced/venue-strategy      Chase vs defend per venue
POST /ai/chat                      AI chat query → natural language response
GET  /ai/suggestions               Suggested queries
GET  /ai/anomalies                 Performance anomaly detection
GET  /ai/predictions               Next match performance predictions
```

---

## AI Intelligence Layer

No external APIs. All intelligence is rule-based and runs entirely on local data.

```
User Query
    │
    ▼
query_parser.py
  └─ parse_intent()        → 23 intent categories via keyword matching
  └─ extract_player_names() → fuzzy match against known players
  └─ extract_team_names()   → match against known teams
    │
    ▼
ai_engine.py
  └─ handle_query()        → routes to correct analytics function
  └─ _predict_player()     → weighted formula: avg×0.4 + form×0.3 + SR×0.3
  └─ _detect_anomaly()     → flags >130% or <70% of average
    │
    ▼
response_generator.py
  └─ 14 response functions  → 2–3 random templates each
  └─ random.choice()        → natural variation, avoids repetition
    │
    ▼
JSON response → AIChat.jsx → formatted chat bubble
```

---

## Analytics Models

| Model | Formula / Logic |
|---|---|
| Player Impact Score | `runs/4 + (SR-100)/8 + avg/4 + 100s×5 + 50s×2 + wkts×2 + (10-econ)×2` capped at 100 |
| Win Probability (1st inn) | `(runs/overs × 20 - wickets×8)` mapped to 20–80% |
| Win Probability (2nd inn) | `100 - (RRR-6)×12 + wickets_remaining×3` |
| Performance Prediction | `avg×0.4 + recent_form×0.3 + (SR/10)×0.3` |
| Monte Carlo Simulation | 2000 iterations, points-weighted random knockout bracket |
| Best XI Optimizer | Impact score ranking by role (1 WK, 3 BAT, 3 AR, 4 BOWL) |
| Batting Dependency | `top2_runs / total_team_runs × 100` |
| Boundary % | `(4s×4 + 6s×6) / total_runs × 100` |
| Clutch Index | `knockout_avg - group_avg` delta |
| Anomaly Detection | `>130%` of average = spike · `<70%` = below par |

---

## Quick Start

```bash
# Backend
cd pitchiq/backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload

# Frontend (separate terminal)
cd pitchiq/frontend
npm install
npm run dev
```

App: `http://localhost:5173`  
API docs: `http://127.0.0.1:8001/docs`
