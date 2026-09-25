# FinPath AI — System Architecture

## Overview

FinPath AI uses a clean layered architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│  Pages: dashboard, missions, documents, profile, ai, progress │
│  Components: AppNav, layouts                                  │
│  Services: lib/services.ts → lib/api.ts (Axios)              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (REST API)
┌──────────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend                             │
│  Routes: auth, missions, documents, profile, ai, notifications│
│  Dependencies: JWT auth, DB sessions                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼────────────────────┐
       ▼               ▼                    ▼
┌──────────┐  ┌──────────────────┐  ┌─────────────────────┐
│Repository│  │  Service Layer   │  │   AI Services        │
│  Layer   │  │ (Readiness,NBA)  │  │ (GoalUnderstanding)  │
└──────────┘  └──────────────────┘  └─────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│              SQLAlchemy ORM (async)                          │
│         SQLite (dev) / PostgreSQL (prod)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Repository Pattern

All database operations go through typed repository classes:

```python
MissionRepository    → FinancialMission table
DocumentRepository   → Document, DocumentExtraction tables
ProfileRepository    → FinancialProfile table
AuditRepository      → AuditLog table
NotificationRepository → Notification table
```

Repositories are injected into FastAPI route handlers via `Depends(get_db)`.

### Service Layer

Two key deterministic services (no LLM):

**ReadinessEngine** (`services/missions/readiness.py`):
- Weights: goal(15%), profile(25%), documents(30%), financial info(20%), timeline(10%)
- Pure function: takes mission dict, profile dict, docs list → ReadinessReport
- Fully testable, transparent, auditable

**NBAEngine** (`services/missions/nba.py`):
- 9 priority-ordered rules evaluated sequentially
- Pure function: returns single NextBestAction struct
- No state, no randomness, same inputs → same outputs

**GoalUnderstandingService** (`services/ai/goal_understanding.py`):
- Wraps Google Gemini (or heuristic fallback)
- `parse_goal(text)` → GoalParseResponse (structured JSON)
- `chat(message, context)` → reply + suggested actions

### API Routes

```
GET/POST  /api/auth/register
POST      /api/auth/login
GET       /api/auth/me

GET/POST  /api/missions/
GET/PATCH /api/missions/{id}
GET       /api/missions/{id}/readiness    ← Readiness Engine
GET       /api/missions/{id}/nba          ← NBA Engine

POST      /api/documents/upload
GET       /api/documents/
GET       /api/documents/{id}
DELETE    /api/documents/{id}
GET       /api/documents/{id}/extraction
PATCH     /api/documents/{id}/extraction
POST      /api/documents/{id}/confirm
PATCH     /api/documents/{id}/classify

GET/PATCH /api/profile/

POST      /api/ai/parse-goal              ← LLM (goal understanding)
POST      /api/ai/chat                    ← LLM (assistant)
GET       /api/ai/nba                     ← NBA Engine (global)
GET       /api/ai/readiness               ← Readiness Engine (global)

GET       /api/notifications/
GET       /api/notifications/summary
PATCH     /api/notifications/{id}/read
POST      /api/notifications/mark-all-read
```

---

## Frontend Architecture

### Next.js App Router Structure

```
app/
  page.tsx                    Landing page (goal input + AI analysis)
  layout.tsx                  Root layout
  dashboard/page.tsx          Main dashboard (real-time NBA + readiness)
  missions/page.tsx           Mission roadmap with 7-stage tracker
  mission/new/page.tsx        Create mission flow
  documents/page.tsx          Document list + upload
  documents/[id]/page.tsx     Document detail + extraction review
  profile/page.tsx            Financial profile form
  ai/page.tsx                 AI assistant chat
  progress/page.tsx           Progress dashboard (readiness + checklist)
  login/page.tsx              Authentication
  register/page.tsx           Registration
  demo/page.tsx               Demo mode (no auth required)
```

### State Management

- **Auth state**: Zustand store (`store/auth.ts`) — token, user, logout
- **Server state**: Direct API calls with React `useState` — no SWR/React Query
- **No Redux** — kept deliberately simple for hackathon context

### API Layer

```
lib/api.ts      → Axios instance with JWT interceptor
lib/services.ts → Typed API functions for all endpoints
types/index.ts  → All TypeScript interfaces + constants
lib/utils.ts    → formatAmount, isAuthenticated, status helpers
```

---

## Database Schema

### Core Tables

```sql
users                 id, email, full_name, hashed_password, is_active, is_demo
financial_missions    id, user_id, goal_category, goal_title, target_amount,
                       currency, deadline, timeline_text, status, stage
financial_profiles    id, user_id, monthly_income, monthly_expenses, savings,
                       existing_emi, monthly_investments, dependents,
                       employment_status, employment_experience_years, currency
documents             id, user_id, original_filename, file_path, file_size,
                       mime_type, document_type, processing_status
document_extractions  id, document_id, extracted_fields, edited_fields,
                       confirmed_fields, extraction_confidence, is_confirmed
notifications         id, user_id, type, title, message, is_read,
                       related_resource, related_resource_id
audit_logs            id, event, user_id, resource_type, resource_id, metadata_
```

---

## AI Architecture Constraints

1. **LLM is not the source of truth.** Database state is authoritative.
2. **Readiness score is deterministic.** No LLM involvement.
3. **NBA is deterministic.** No LLM involvement.
4. **Goal parsing uses LLM**, but result must be confirmed by user before a mission is created.
5. **Document extractions use LLM**, but user must confirm before data is trusted.
6. **Chat assistant** explains state — does not fabricate financial data.
7. **Fallback mode**: all features work without `LLM_API_KEY` via regex/heuristic rules.

---

## Security Model

- JWT tokens (HS256, 7-day expiry by default)
- User can only access their own resources (enforced at route level)
- All mutations are audit-logged
- File uploads restricted by MIME type and size
- CORS restricted to frontend URL
