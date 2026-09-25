# FinPath AI

> **Turn your financial goal into a clear journey.**

FinPath AI is a goal-first financial journey platform. Instead of starting with financial products, FinPath starts with your real-life goal — and guides you step by step to achieve it.

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone and setup

```bash
git clone <repo-url>
cd paytm
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` from `.env.example`:
```bash
cp .env.example .env
# Edit .env — at minimum set SECRET_KEY
# Add LLM_API_KEY for AI features (optional — fallback mode works without it)
```

Run backend:
```bash
# Development (SQLite — no DB setup needed)
$env:DATABASE_URL="sqlite+aiosqlite:///./finpath_dev.db"
$env:SECRET_KEY="your-secret-key"
python -m uvicorn app.main:app --port 8000 --reload
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend at: http://localhost:3000

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| AI Goal Parsing | ✅ | Natural language → structured mission |
| 7-Stage Journey | ✅ | From goal to completion |
| Readiness Engine | ✅ | Deterministic 5-component score |
| Next Best Action | ✅ | 9-rule priority engine |
| Document Pipeline | ✅ | Upload → Extract → Review → Confirm |
| Financial Profile | ✅ | Income, expenses, EMI, savings |
| AI Chat Assistant | ✅ | Contextual journey guidance |
| Notifications | ✅ | Real-time system notifications |
| Demo Mode | ✅ | `/demo` — no auth required |
| Docker | ✅ | Full containerization |

---

## Architecture Overview

```
Next.js Frontend → FastAPI Backend → SQLAlchemy ORM → SQLite/PostgreSQL
                        ↓
              Readiness Engine (deterministic)
              NBA Engine (deterministic)
              AI Service (Gemini + fallback)
```

**Key principle**: LLM is never the source of truth. All application state decisions are deterministic.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Product Documentation](docs/PRODUCT_DOCUMENTATION.md) | Features, philosophy, user personas |
| [System Architecture](docs/SYSTEM_ARCHITECTURE.md) | Technical architecture, DB schema, AI constraints |
| [API Reference](docs/API_REFERENCE.md) | All API endpoints with request/response formats |
| [User Journey](docs/USER_JOURNEY.md) | 7-stage flow, document pipeline, NBA rules |

---

## Testing

```bash
cd backend
pytest tests/ -v
# Expected: 18+ tests passed
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `sqlite+aiosqlite:///./finpath_dev.db` | DB connection string |
| `SECRET_KEY` | Yes | — | JWT signing key |
| `LLM_API_KEY` | No | — | Gemini API key (app works in fallback mode without it) |
| `LLM_MODEL` | No | `gemini-1.5-flash` | Gemini model name |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS origin |
| `ENVIRONMENT` | No | `development` | `development` or `production` |

---

## Project Structure

```
paytm/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers
│   │   ├── core/         # Config, DB, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── repositories/ # DB access layer
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic (readiness, NBA, AI)
│   └── tests/
├── frontend/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # Shared components
│   ├── lib/              # API client + services
│   ├── store/            # Zustand auth store
│   └── types/            # TypeScript types
└── docs/                 # Documentation
```

---

## License

MIT License — see [LICENSE](LICENSE) file.
