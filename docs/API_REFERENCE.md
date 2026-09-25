# FinPath AI — API Reference

## Base URL
- Development: `http://localhost:8000`
- Frontend proxy: via `next.config.ts` rewrites to backend

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Token is obtained from `/api/auth/login` or `/api/auth/register`.

---

## Auth Endpoints

### POST /api/auth/register
Create a new user account.
```json
{ "email": "user@example.com", "full_name": "Arjun Sharma", "password": "secure123" }
```
**Response**: `{ "access_token": "...", "token_type": "bearer", "user": {...} }`

### POST /api/auth/login
```json
{ "email": "user@example.com", "password": "secure123" }
```
**Response**: `{ "access_token": "...", "token_type": "bearer", "user": {...} }`

### GET /api/auth/me
Returns current authenticated user.

---

## Mission Endpoints

### GET /api/missions/
Returns list of user's missions, newest first.

### POST /api/missions/
```json
{
  "goal_category": "education",
  "goal_title": "Germany Education Fund",
  "target_amount": 1200000,
  "currency": "INR",
  "timeline_text": "Next year",
  "destination": "Germany"
}
```

### GET /api/missions/{id}
Returns single mission.

### PATCH /api/missions/{id}
Partial update. Any field from MissionCreate plus `status` and `stage` (1–7).

### GET /api/missions/{id}/readiness
**Deterministic calculation — no LLM.**
```json
{
  "overall_score": 67.5,
  "components": [
    { "name": "Goal Definition", "score": 100.0, "weight": 15, "current": 15.0, "missing": [] },
    { "name": "Financial Profile", "score": 60.0, "weight": 25, "current": 15.0, "missing": ["Provide employment status"] },
    ...
  ],
  "what_is_affecting": ["Profile: Provide employment status"],
  "next_improvement": "Provide employment status",
  "stage_recommendation": 3
}
```

### GET /api/missions/{id}/nba
**Deterministic — no LLM.**
```json
{
  "action": "Review Extracted Data",
  "reason": "We extracted information from 'salary_slip.pdf'. Your review is required.",
  "priority": "high",
  "target_route": "/documents/5",
  "icon": "📋"
}
```

---

## AI Endpoints

### POST /api/ai/parse-goal
Parse natural-language goal text. Uses LLM if configured, else heuristic fallback.
```json
{ "text": "I want to study in Germany next year with ₹12 lakh" }
```
**Response**: `GoalParseResponse` — see Types section.

### POST /api/ai/chat
```json
{ "message": "What should I do next?", "mission_id": 3 }
```
**Response**: `{ "reply": "...", "suggested_actions": ["...", "..."] }`

### GET /api/ai/nba
Global NBA (uses active mission). Same response as `/api/missions/{id}/nba`.

### GET /api/ai/readiness
Global readiness (uses active mission). Same response as `/api/missions/{id}/readiness`.

---

## Document Endpoints

### POST /api/documents/upload
**Multipart form data.**
- `file`: the document file
- `mission_id` (optional): associate with a mission

### GET /api/documents/
Returns all user's documents.

### GET /api/documents/{id}
Returns single document.

### DELETE /api/documents/{id}
Deletes document. Audit logged.

### GET /api/documents/{id}/extraction
Returns extraction result (if processed).

### PATCH /api/documents/{id}/extraction
Edit extracted fields before confirmation.
```json
{ "edited_fields": { "name": "Arjun Sharma", "amount": "85000" } }
```

### POST /api/documents/{id}/confirm
Confirms extraction — fields become trusted data.
```json
{ "confirmed_fields": { "name": "Arjun Sharma", "amount": "85000" } }
```

### PATCH /api/documents/{id}/classify
Manually set document type.
```json
{ "document_type": "salary_slip" }
```

---

## Profile Endpoints

### GET /api/profile/
Returns user's financial profile (or empty profile with 0% completion).

### PATCH /api/profile/
Partial update. Only provided fields are updated.
```json
{
  "monthly_income": 85000,
  "monthly_expenses": 45000,
  "savings": 300000,
  "existing_emi": 12000,
  "employment_status": "salaried",
  "monthly_investments": 10000,
  "dependents": 1
}
```

---

## Notification Endpoints

### GET /api/notifications/
Returns up to 20 notifications, newest first.

### GET /api/notifications/summary
For the bell icon. Returns `{ "unread_count": 2, "notifications": [...] }`.

### PATCH /api/notifications/{id}/read
Marks one notification as read.

### POST /api/notifications/mark-all-read
Marks all unread as read. Returns `{ "marked_read": 3 }`.

---

## Types Reference

### GoalCategory
`education | healthcare | home | home_purchase | vehicle | business | emergency | travel | investment | other`

### ProcessingStatus
`uploaded | processing | classified | extracting | extracted | review_required | confirmed | failed`

### MissionStatus
`DRAFT | ACTIVE | PAUSED | COMPLETED`

### NotificationType
`document_review | profile_incomplete | milestone | deadline | action`

### NBA Priority
`critical | high | medium | low`
