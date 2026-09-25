# FinPath AI — Phase 1

> **Goal-first financial journey platform.**  
> Tell FinPath what you're trying to achieve. We'll help organize your financial journey around it.

---

## What Was Built

### Phase 1 — Complete Foundation

| Feature | Status |
|---------|--------|
| Landing page with typewriter effect | ✅ |
| User registration + login (JWT) | ✅ |
| Natural language goal parsing (Gemini AI) | ✅ |
| Structured goal input | ✅ |
| Goal confirmation UI | ✅ |
| Financial Mission creation + persistence | ✅ |
| Mission dashboard | ✅ |
| Document upload (PDF, PNG, JPG) | ✅ |
| Document classification (AI + fallback) | ✅ |
| Field extraction (AI Vision) | ✅ |
| Extraction review + edit UI | ✅ |
| Extraction confirm → profile update | ✅ |
| Financial Profile CRUD | ✅ |
| Profile completeness tracking | ✅ |
| Multi-mission support | ✅ |
| Demo mode page | ✅ |
| Audit logging | ✅ |
| User isolation (auth on all APIs) | ✅ |
| Mobile-responsive layout | ✅ |
| Docker Compose setup | ✅ |
| Test suite | ✅ |

---

## Architecture

```
finpath/
├── frontend/          # Next.js 14 (App Router) + TypeScript + Tailwind
│   ├── app/           # Pages (App Router)
│   ├── components/    # UI components
│   ├── lib/           # API client, services, utilities
│   ├── store/         # Zustand state management
│   └── types/         # TypeScript definitions
│
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/
│   │   │   ├── ai/    # GoalUnderstanding, Classification, Extraction services
│   │   │   └── documents/  # Processing pipeline
│   │   ├── repositories/   # DB access layer
│   │   └── core/      # Config, DB, Security
│   └── tests/
│
├── storage/           # Document file storage
├── docker-compose.yml
└── .env.example
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State Management | Zustand |
| HTTP Client | Axios |
| Backend | FastAPI, Python 3.11 |
| Database | PostgreSQL (async via SQLAlchemy) |
| AI / LLM | Google Gemini (gemini-1.5-flash) |
| Document Processing | PyMuPDF + Gemini Vision |
| Auth | JWT (python-jose + passlib bcrypt) |
| Containerization | Docker + Docker Compose |

---

## Database Schema

```
users
├── id, email, full_name, hashed_password
├── is_active, is_demo
└── created_at, updated_at

financial_missions
├── id, user_id → users.id
├── goal_category, goal_title, description, destination
├── target_amount, currency
├── deadline, timeline_text
├── status (DRAFT/ACTIVE/PAUSED/COMPLETED)
└── created_at, updated_at

financial_profiles
├── id, user_id → users.id (unique)
├── monthly_income, monthly_expenses, savings, existing_emi
├── income_source, employment_status, currency
└── updated_at

documents
├── id, user_id → users.id
├── original_filename, stored_filename, file_path
├── file_size, mime_type
├── document_type, classification_confidence
├── processing_status, error_message
└── uploaded_at, processed_at

document_extractions
├── id, document_id → documents.id
├── extracted_fields (JSON), edited_fields (JSON), confirmed_fields (JSON)
├── extraction_confidence, is_confirmed, confirmed_at
└── created_at, updated_at

mission_documents
├── id, mission_id → financial_missions.id
└── document_id → documents.id

audit_logs
├── id, user_id, event
├── resource_type, resource_id
└── metadata (JSON), created_at
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/ai/parse-goal` | Parse NL goal → structured JSON |
| POST | `/api/missions/` | Create mission |
| GET | `/api/missions/` | List user's missions |
| GET | `/api/missions/{id}` | Get mission |
| PATCH | `/api/missions/{id}` | Update mission |
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents/` | List documents |
| GET | `/api/documents/{id}` | Get document |
| POST | `/api/documents/{id}/process` | Reprocess document |
| PATCH | `/api/documents/{id}/classify` | Override document type |
| GET | `/api/documents/{id}/extraction` | Get extraction |
| PATCH | `/api/documents/{id}/extraction` | Edit extraction fields |
| POST | `/api/documents/{id}/confirm` | Confirm extraction → updates profile |
| GET | `/api/profile/` | Get financial profile |
| PATCH | `/api/profile/` | Update profile |

---

## AI Services

| Service | Description |
|---------|-------------|
| `GoalUnderstandingService` | Converts NL text → structured goal JSON via Gemini |
| `DocumentClassificationService` | Classifies document type using Gemini Vision |
| `DocumentClassificationService.extract_fields()` | Extracts fields from classified documents |
| `ProfileExtractionService` | Maps confirmed doc fields → financial profile fields |

All services have keyword-based fallbacks when AI is unavailable.

---

## How to Run Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL (or Docker)
- Gemini API key

### 1. Setup environment
```bash
cp .env.example .env
# Edit .env and fill in:
# DATABASE_URL=postgresql+asyncpg://finpath:finpath_secret@localhost:5432/finpath_db
# LLM_API_KEY=your-gemini-api-key
# SECRET_KEY=your-random-secret
```

### 2. Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env in backend directory
cp ..\\.env.example .env

# Run backend (tables auto-created on startup)
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

### 4. With Docker (full stack)
```bash
# Copy env
cp .env.example .env
# Set LLM_API_KEY in .env

docker-compose up --build
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | (required) |
| `SECRET_KEY` | JWT signing key | (required) |
| `LLM_API_KEY` | Google Gemini API key | (required for AI) |
| `LLM_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `STORAGE_PATH` | File storage directory | `./storage` |
| `MAX_FILE_SIZE_MB` | Max upload size | `10` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

---

## Running Tests

```bash
cd backend
pip install aiosqlite pytest-anyio
pytest tests/ -v
```

Tests cover:
- Auth: register, login, token validation
- Goal parsing: education extraction, missing data handling
- Mission: create, persist, authorization
- Document: upload, format validation, duplicate rejection, authorization
- Profile: empty state, update, completion calculation

---

## Demo Flow (End-to-End)

1. Open `http://localhost:3000`
2. Register or click "Explore Demo"
3. Dashboard shows empty state → click "Create My First Mission"
4. Type: *"I want to study in Germany next year and need around ₹12 lakh."*
5. Click "Create My Mission" → AI extracts goal
6. Review confirmation screen — edit fields if needed
7. Click "Confirm Mission" → mission created
8. Back on dashboard: progress bars appear
9. Click "Upload Document" → drag in a salary slip PDF
10. Wait 15–30 sec → status changes to "Review Required"
11. Click document → review extracted: Employee Name, Net Salary, Employer
12. Edit any field → click "Confirm Information"
13. Dashboard updates: Monthly Income shows ₹75,000, profile completion increases
14. Upload bank statement → same flow → Savings updates
15. Refresh dashboard → all data persists (stored in DB)

---

## Known Limitations (Phase 1)

- No email verification
- No password reset flow
- AI extraction depends on document image quality
- PDF extraction converts page 1 to image (multi-page PDFs partially supported)
- No file deletion UI (backend supports it via DB delete)
- No session management UI (tokens expire after 7 days)

---

## Intentionally Left for Phase 2

- ❌ Funding Gap Engine
- ❌ Eligibility scoring
- ❌ Loan/insurance recommendations
- ❌ Policy RAG
- ❌ Fraud detection
- ❌ Risk scoring
- ❌ What-if simulator
- ❌ Multi-product optimization
- ❌ Automated application submission
- ❌ Agent-to-agent architecture

The architecture is modular by design — each AI service is independent and Phase 2 agents can be added without rewriting Phase 1.
