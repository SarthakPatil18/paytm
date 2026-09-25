# FinPath AI — System Architecture Specification

## 1. Architectural Overview

**FinPath AI** follows a decoupled, layered micro-monolith architecture characterized by strict separation of concerns, deterministic business decision engines, asynchronous data ingestion, and human-in-the-loop AI boundaries.

```mermaid
graph TD
    Client["Client Layer\n(Next.js 16, TypeScript, Vanilla CSS)"] -->|HTTPS / REST| API["API Gateway & Controllers\n(FastAPI Routes + JWT Auth)"]
    
    subgraph CoreBackend["Application & Domain Services"]
        API --> Readiness["Readiness Engine\n(Deterministic 5-Factor)"]
        API --> NBA["NBA Priority Engine\n(Deterministic 9-Rule)"]
        API --> AI["AI Service Layer\n(Gemini 1.5 Flash + Heuristic)"]
        API --> DocService["Document Pipeline\n(SHA-256 Deduplication + OCR)"]
    end
    
    subgraph Repos["Data Access Layer"]
        Readiness & NBA & AI & DocService --> RepoLayer["Repository Layer\n(Mission, Document, Profile, Notification, Audit)"]
    end
    
    subgraph DataStores["Storage Layer"]
        RepoLayer --> AsyncORM["SQLAlchemy 2.0 AsyncIO"]
        AsyncORM --> DB[("Database\nSQLite (Dev) / PostgreSQL (Prod)")]
        DocService --> FileStore[("Secure File Storage\nLocal Hashed Filesystem")]
    end
```

---

## 2. Layered Component Responsibilities

### 2.1 Presentation Layer (Frontend)
- **Framework**: Next.js 16 (App Router) with Turbopack.
- **Styling Architecture**: FinPath Design System using native CSS custom properties (`globals.css`), eliminating heavy external CSS runtime overhead.
- **State Management**:
  - `store/auth.ts`: Zustand store managing user profile state and JWT session token persistence.
  - Component State: Native React hooks (`useState`, `useCallback`, `useEffect`) for localized forms and extraction reviews.
- **HTTP Client**: Axios with request/response interceptors injecting `Authorization: Bearer <token>` and handling 401 token expiry.

### 2.2 API Layer (FastAPI Backend)
- **FastAPI Core**: Async route controllers utilizing dependency injection (`Depends(get_db)`, `Depends(get_current_user)`).
- **Contract Enforcement**: Pydantic v2 schemas providing strict schema parsing, serialization, and input validation.
- **CORS Middleware**: Explicitly bound to configured origins (`FRONTEND_URL`).

### 2.3 Domain Services Layer
- **ReadinessEngine** (`app/services/missions/readiness.py`):
  - Pure, deterministic calculation taking mission parameters, verified documents, and profile statistics.
  - Produces an auditable 0–100% score broken into 5 weighted pillars.
  - **Zero LLM dependency**.
- **NBAEngine** (`app/services/missions/nba.py`):
  - 9-rule sequential priority queue evaluating application state to output a single, unambiguous Next Best Action.
  - **Zero LLM dependency**.
- **GoalUnderstandingService** (`app/services/ai/goal_understanding.py`):
  - Bridges Google Gemini with a zero-dependency heuristic fallback engine using regex entity extractors.

### 2.4 Data Access Layer (Repository Pattern)
All database interactions are encapsulated in typed repositories:
- `MissionRepository`: Handles CRUD for `FinancialMission`, category filtering, and stage progression.
- `DocumentRepository`: Handles `Document` and `DocumentExtraction` persistence and confirmation states.
- `ProfileRepository`: Handles `FinancialProfile` attributes, completeness metrics, and DTI indicators.
- `NotificationRepository`: Manages user notifications, unread queries, and batch status updates.
- `AuditRepository`: Logs immutable records of all state mutations.

---

## 3. End-to-End Request & Data Flows

### 3.1 Standard Authenticated API Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Nav as Frontend AppNav / Page
    participant API as FastAPI Controller
    participant Auth as JWT Dependency
    participant Repo as Repository Layer
    participant DB as SQLite / PostgreSQL

    User->>Nav: Interacts with Dashboard
    Nav->>API: GET /api/missions/ (with Bearer Token)
    API->>Auth: Validate JWT Signature & Expiry
    Auth-->>API: Yields Current User Object
    API->>Repo: MissionRepository.get_user_missions(user_id)
    Repo->>DB: SELECT * FROM financial_missions WHERE user_id = :uid
    DB-->>Repo: Mission records
    Repo-->>API: List[FinancialMission]
    API-->>Nav: HTTP 200 JSON Response
    Nav-->>User: Renders Missions & Stage Badges
```

---

### 3.2 AI Goal Understanding Request Flow (with Fallback)

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant UI as Goal Input Component
    participant API as /api/ai/parse-goal
    participant Service as GoalUnderstandingService
    participant LLM as Google Gemini
    participant Heuristic as Rule Engine Fallback

    User->>UI: Types goal ("Study in Germany next year with ₹12L")
    UI->>API: POST /api/ai/parse-goal { text: "..." }
    API->>Service: parse_goal(text)
    alt Gemini API Key Available
        Service->>LLM: Structured Prompt with JSON Schema
        LLM-->>Service: Structured JSON Response
    else Gemini Key Missing / Network Error
        Service->>Heuristic: Regex Entity & Keyword Extractor
        Heuristic-->>Service: Structured JSON Response
    end
    Service-->>API: Validated GoalParseResponse
    API-->>UI: HTTP 200 { category, target_amount, timeline, ... }
    UI-->>User: Displays 4-Step Verification Card
```

---

### 3.3 Document Ingestion & Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Upload as Document Center
    participant API as /api/documents/upload
    participant Storage as File Storage
    participant OCR as Extraction Engine
    participant DB as Database

    User->>Upload: Drops PDF / Image
    Upload->>API: POST /api/documents/upload (Multipart Form)
    API->>API: Calculate SHA-256 Hash
    API->>DB: Check for duplicate hash
    alt Duplicate Found
        API-->>Upload: HTTP 409 Conflict (File already uploaded)
    else Unique File
        API->>Storage: Write to secure storage path
        API->>DB: Create Document record (status: 'processing')
        API->>OCR: Trigger background field extraction
        OCR->>DB: Store DocumentExtraction (status: 'review_required')
        API-->>Upload: HTTP 201 Created
        User->>Upload: Clicks "Review Document"
        User->>Upload: Edits / Confirms Extracted Values
        Upload->>API: POST /api/documents/{id}/confirm
        API->>DB: Set is_confirmed = true, status = 'confirmed'
        API->>DB: Create AuditLog record
        API-->>Upload: HTTP 200 (Readiness updated)
    end
```

---

## 4. Mission Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Stage1_GoalDefinition: User Inputs Ambition
    Stage1_GoalDefinition --> Stage2_FinancialProfile: Goal Confirmed & Mission Created
    Stage2_FinancialProfile --> Stage3_DocumentVerification: Profile Completeness >= 70%
    Stage3_DocumentVerification --> Stage4_ReadinessAssessment: Required Docs Uploaded & Confirmed
    Stage4_ReadinessAssessment --> Stage5_FinancialOptions: Readiness Score >= 80%
    Stage5_FinancialOptions --> Stage6_ApplicationPreApproval: Partner Product Selected
    Stage6_ApplicationPreApproval --> Stage7_Disbursement: Pre-Approval Granted
    Stage7_Disbursement --> [*]: Goal Funded & Mission Archived
```

---

## 5. Security & Isolation Model

1. **Authentication**: JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`) using a server-side secret key (`SECRET_KEY`). Expirations default to 7 days.
2. **Access Control**: Every database query filters by `user_id == current_user.id`. No user can view, edit, or delete another user's missions, documents, or profile data.
3. **Payload Sanitization**: Pydantic v2 schemas reject malformed attributes and prevent prototype injection attacks.
4. **File Safety**:
   - MIME validation restricting uploads to `application/pdf`, `image/png`, `image/jpeg`.
   - File size ceiling capped at 10 MB.
   - SHA-256 content hashing for integrity and collision deduplication.
5. **Audit Trails**: Critical life-cycle transitions write immutable entries to `audit_logs` tracking timestamp, acting user, resource type, and before/after metadata.

---

## 6. Resilience & Graceful Degradation

| Failure Mode | Detection | System Behavior |
| :--- | :--- | :--- |
| **Gemini API Down / Offline** | HTTP 5xx or API key missing | Automatically switches to deterministic regex heuristic fallback engine; 0 downtime. |
| **Corrupted Document File** | File parser exception | Marks document `status = 'failed'`; provides clean user-facing error message with re-upload prompt. |
| **Expired JWT Token** | HTTP 401 Unauthorized | Interceptor clears client credentials and cleanly redirects user to `/login` with saved return path. |
| **Duplicate Document** | SHA-256 collision in DB | Returns HTTP 409 Conflict with friendly message instead of overwriting existing data. |
