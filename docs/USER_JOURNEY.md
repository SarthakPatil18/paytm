# FinPath AI — User Journey

## Complete 7-Stage Journey

```
Stage 1: GOAL DEFINITION
   ↓ User describes goal in natural language
   ↓ AI parses goal → GoalParseResponse
   ↓ User reviews and creates Financial Mission
   
Stage 2: FINANCIAL PROFILE
   ↓ Complete income, expenses, savings, EMI, employment
   ↓ Profile completion % updates readiness score
   
Stage 3: DOCUMENT VERIFICATION
   ↓ Upload required documents (per goal category)
   ↓ AI classifies and extracts data
   ↓ User reviews and confirms extractions
   
Stage 4: READINESS ASSESSMENT
   ↓ Readiness score calculated (deterministic)
   ↓ NBA surfaces specific gaps to address
   ↓ Score breakdown shows exactly what is affecting score
   
Stage 5: FINANCIAL OPTIONS
   ↓ Loan/funding products matched to mission
   ↓ Eligibility estimated from confirmed profile data
   
Stage 6: APPLICATION PREPARATION
   ↓ Application checklist based on confirmed documents
   ↓ Remaining gaps identified
   
Stage 7: COMPLETION
   ↓ Mission marked complete
   ↓ Journey archived
```

---

## Example Journey: Germany Education

### User Input
> "I want to study in Germany next year and I need around ₹12 lakh."

### Stage 1 — AI Understanding
AI extracts:
- `goal_category`: education
- `goal_title`: Germany Education Fund
- `destination`: Germany
- `target_amount`: 1,200,000
- `timeline_text`: Next year
- `confidence`: 0.88

User reviews → Clicks "Create Financial Mission" → Mission created with Stage 1.

### Stage 2 — Financial Profile
User fills in:
- Monthly income: ₹85,000
- Monthly expenses: ₹45,000
- Current savings: ₹3,00,000
- Existing EMI: ₹12,000
- Employment: Salaried

Profile completion: 100%. Readiness increases by ~25%.

### Stage 3 — Document Upload
System prompts for education category requirements:
- Identity Document
- Bank Statement (last 6 months)
- Salary Slip (last 3 months)

User uploads → AI classifies and extracts → User reviews and confirms each.
Document score: 100%. Readiness increases by ~30%.

### Stage 4 — Readiness Assessment
Readiness score: ~82%.
NBA: "Advance to Financial Options — You're ready to move forward."
Stage advances to 4.

### Stage 5 — Financial Options
Education loan products displayed.
Estimated eligibility calculated from confirmed income and savings.

---

## Document Processing Flow

```
UPLOAD
  ↓
PROCESSING (background task)
  ↓
CLASSIFIED (AI identifies document type)
  ↓
EXTRACTING (AI reads fields)
  ↓
EXTRACTED (AI done, user must review)
  ↓ User reviews, edits if needed
CONFIRMED (trusted data — affects profile + readiness)

  OR

FAILED (processing error — user can re-upload)
```

---

## NBA Rule Priority

| Priority | Condition | Action |
|----------|-----------|--------|
| 1 | No mission exists | Create mission |
| 2 | Document in `review_required`/`extracted` status | Review document |
| 3 | Profile < 40% complete | Complete profile |
| 4 | Required document type missing | Upload document |
| 5 | Profile 40–70% complete | Improve profile |
| 6 | Documents unconfirmed | Verify documents |
| 7 | Readiness < 80%, component gaps exist | Improve weakest component |
| 8 | Deadline within 30 days | Review timeline |
| 9 | Readiness ≥ 80%, stage < 7 | Advance to next stage |

---

## Readiness Score Components

| Component | Weight | What it measures |
|-----------|--------|-----------------|
| Goal Definition | 15% | Category, title, amount, description |
| Financial Profile | 25% | All 5 key profile fields filled |
| Document Verification | 30% | Required docs uploaded and confirmed |
| Financial Information | 20% | Expense ratio, debt-to-income ratio |
| Timeline & Planning | 10% | Deadline or timeline_text set |
