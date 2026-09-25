# FinPath AI — Product Documentation

## What is FinPath AI?

FinPath AI is a **goal-first financial journey platform**. Unlike traditional financial platforms that start with products (loans, credit cards, insurance), FinPath starts with **your real-life financial goal**.

> *"Turn your financial goal into a clear journey."*

---

## Core Philosophy

Traditional platforms: **Product → Customer**
FinPath: **Customer Goal → Understanding → Journey → Product**

### The Problem FinPath Solves

When people have a financial need (study abroad, buy a house, start a business), they don't know:
1. What financial products they need
2. What documents to prepare
3. Whether they are financially ready
4. What to do first

FinPath solves all four by understanding the goal first and guiding the user step by step.

---

## Key Features

### 1. AI Goal Understanding
- User describes goal in natural language
- AI extracts: category, target amount, timeline, destination
- Creates a structured **Financial Mission**

### 2. Financial Mission
- A mission wraps a goal with full lifecycle tracking
- Moves through 7 stages: Goal → Profile → Documents → Readiness → Options → Application → Completion

### 3. Readiness Engine (Deterministic)
- Calculates a 0–100% readiness score from **verifiable application state**
- 5 weighted components: goal completeness, profile, documents, financial info, timeline
- **No AI involvement** — transparent, auditable calculation

### 4. Next Best Action (NBA) Engine
- Deterministic rule engine with 9 priority-ordered rules
- Surfaces the single most important action to take right now
- Considers: unreviewed documents, profile gaps, missing documents, deadline proximity

### 5. Document Verification Pipeline
- Upload → AI Classification → Data Extraction → User Review → Confirmation
- Extractions become **trusted data** only after user confirmation
- Supported types: Salary Slip, Bank Statement, Identity Document, Scholarship Letter, Loan Document

### 6. Financial Profile
- Monthly income, expenses, savings, EMI, employment details
- Completion percentage drives readiness score
- Connected to loan eligibility and product matching

### 7. AI Financial Assistant
- Conversational assistant with mission context
- Never fabricates financial data — explains application state
- Falls back to heuristic responses when API key is unavailable

### 8. Notifications
- Real-time notification system for document reviews, profile updates, milestones
- Unread badge on nav bell icon

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Vanilla CSS |
| Backend | FastAPI (Python 3.11+) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy (async) |
| Auth | JWT (HS256) |
| AI | Google Gemini 1.5 Flash (with heuristic fallback) |
| Container | Docker + Docker Compose |

---

## User Personas

### Primary: Aspiring Borrower / Financial Goal-Setter
- Age 22–40
- Has a specific goal: education abroad, home purchase, business funding
- Unclear on which documents/products they need
- Needs structured guidance

### Secondary: First-time Financial Document User
- Uploading salary slips and bank statements for the first time
- Needs AI-assisted classification and verification

---

## Design Principles

1. **Goal-first** — Never start with products
2. **Deterministic trust** — Readiness and NBA are rule-based, not AI-generated
3. **User-controlled** — Document extractions require user confirmation before becoming trusted data
4. **Transparent** — Readiness score shows exactly what is affecting it
5. **Contextual** — AI assistant explains state, never fabricates
