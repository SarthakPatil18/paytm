"""
Readiness Engine — deterministic financial readiness calculation.

This is NOT an AI feature. It uses transparent weighted rules based on
verifiable application state: mission completeness, profile completeness,
document verification, and requirements.

Weights (configurable):
  goal_completeness:        15%
  profile_completeness:     25%
  document_verification:    30%
  financial_info:           20%
  timeline_completeness:    10%
"""
from typing import Optional
from dataclasses import dataclass, field

# Weights — must sum to 100
READINESS_WEIGHTS = {
    "goal_completeness": 15,
    "profile_completeness": 25,
    "document_verification": 30,
    "financial_info": 20,
    "timeline_completeness": 10,
}

# Documents typically required per goal category
REQUIRED_DOCS_BY_CATEGORY = {
    "education": ["identity_document", "bank_statement", "salary_slip"],
    "home": ["identity_document", "bank_statement", "salary_slip"],
    "home_purchase": ["identity_document", "bank_statement", "salary_slip"],
    "vehicle": ["identity_document", "bank_statement", "salary_slip"],
    "business": ["identity_document", "bank_statement"],
    "travel": ["identity_document", "bank_statement"],
    "investment": ["identity_document", "bank_statement", "salary_slip"],
    "healthcare": ["identity_document", "bank_statement"],
    "emergency": ["identity_document"],
    "other": ["identity_document"],
}


@dataclass
class ReadinessComponent:
    name: str
    score: float       # 0–100
    weight: float      # % contribution
    max_score: float   # weighted max contribution
    current: float     # weighted current contribution
    details: list = field(default_factory=list)
    missing: list = field(default_factory=list)


@dataclass
class ReadinessReport:
    overall_score: float            # 0–100
    components: list                # List[ReadinessComponent]
    what_is_affecting: list         # Human-readable issues
    next_improvement: Optional[str] # Single best action to improve score
    stage_recommendation: int       # 1-7 mission stage recommendation


class ReadinessEngine:
    """
    Deterministic readiness calculator.
    All inputs are structured application state — no LLM involved.
    """

    def calculate(
        self,
        mission: Optional[dict],
        profile: Optional[dict],
        documents: list,
    ) -> ReadinessReport:
        components = []
        affecting = []
        weighted_total = 0.0

        # --- 1. GOAL COMPLETENESS (15%) ---
        goal_score, goal_details, goal_missing = self._score_goal(mission)
        gc = ReadinessComponent(
            name="Goal Definition",
            score=goal_score,
            weight=READINESS_WEIGHTS["goal_completeness"],
            max_score=READINESS_WEIGHTS["goal_completeness"],
            current=(goal_score / 100) * READINESS_WEIGHTS["goal_completeness"],
            details=goal_details,
            missing=goal_missing,
        )
        components.append(gc)
        weighted_total += gc.current
        if goal_missing:
            affecting.extend([f"Goal: {m}" for m in goal_missing[:2]])

        # --- 2. PROFILE COMPLETENESS (25%) ---
        profile_score, profile_details, profile_missing = self._score_profile(profile)
        pc = ReadinessComponent(
            name="Financial Profile",
            score=profile_score,
            weight=READINESS_WEIGHTS["profile_completeness"],
            max_score=READINESS_WEIGHTS["profile_completeness"],
            current=(profile_score / 100) * READINESS_WEIGHTS["profile_completeness"],
            details=profile_details,
            missing=profile_missing,
        )
        components.append(pc)
        weighted_total += pc.current
        if profile_missing:
            affecting.extend([f"Profile: {m}" for m in profile_missing[:2]])

        # --- 3. DOCUMENT VERIFICATION (30%) ---
        doc_score, doc_details, doc_missing = self._score_documents(mission, documents)
        dc = ReadinessComponent(
            name="Document Verification",
            score=doc_score,
            weight=READINESS_WEIGHTS["document_verification"],
            max_score=READINESS_WEIGHTS["document_verification"],
            current=(doc_score / 100) * READINESS_WEIGHTS["document_verification"],
            details=doc_details,
            missing=doc_missing,
        )
        components.append(dc)
        weighted_total += dc.current
        if doc_missing:
            affecting.extend([f"Documents: {m}" for m in doc_missing[:2]])

        # --- 4. FINANCIAL INFO QUALITY (20%) ---
        fi_score, fi_details, fi_missing = self._score_financial_info(profile)
        fi = ReadinessComponent(
            name="Financial Information",
            score=fi_score,
            weight=READINESS_WEIGHTS["financial_info"],
            max_score=READINESS_WEIGHTS["financial_info"],
            current=(fi_score / 100) * READINESS_WEIGHTS["financial_info"],
            details=fi_details,
            missing=fi_missing,
        )
        components.append(fi)
        weighted_total += fi.current
        if fi_missing:
            affecting.extend([f"Financial info: {m}" for m in fi_missing[:1]])

        # --- 5. TIMELINE COMPLETENESS (10%) ---
        tl_score, tl_details, tl_missing = self._score_timeline(mission)
        tl = ReadinessComponent(
            name="Timeline & Planning",
            score=tl_score,
            weight=READINESS_WEIGHTS["timeline_completeness"],
            max_score=READINESS_WEIGHTS["timeline_completeness"],
            current=(tl_score / 100) * READINESS_WEIGHTS["timeline_completeness"],
            details=tl_details,
            missing=tl_missing,
        )
        components.append(tl)
        weighted_total += tl.current
        if tl_missing:
            affecting.extend([f"Timeline: {m}" for m in tl_missing[:1]])

        overall = round(weighted_total, 1)

        # Determine best next action to improve score
        # Find the component with the most room for improvement (weighted gap)
        worst = min(components, key=lambda c: c.current / c.max_score if c.max_score > 0 else 1)
        next_improvement = worst.missing[0] if worst.missing else None

        # Recommend stage
        stage = self._recommend_stage(overall, mission, profile, documents)

        return ReadinessReport(
            overall_score=overall,
            components=components,
            what_is_affecting=affecting[:5],
            next_improvement=next_improvement,
            stage_recommendation=stage,
        )

    def _score_goal(self, mission: Optional[dict]):
        if not mission:
            return 0.0, [], ["No mission created yet"]

        score = 0
        details = []
        missing = []

        if mission.get("goal_category"):
            score += 30
            details.append(f"Category: {mission['goal_category']}")
        else:
            missing.append("Goal category not set")

        if mission.get("goal_title"):
            score += 25
            details.append(f"Title: {mission['goal_title']}")
        else:
            missing.append("Goal title not defined")

        if mission.get("target_amount"):
            score += 30
            details.append(f"Target amount: ₹{mission['target_amount']:,.0f}")
        else:
            missing.append("Target amount not specified")

        if mission.get("description"):
            score += 15
            details.append("Goal description added")
        else:
            missing.append("Add a goal description")

        return min(score, 100), details, missing

    def _score_profile(self, profile: Optional[dict]):
        if not profile:
            return 0.0, [], ["Financial profile not started"]

        fields = {
            "monthly_income": ("Monthly income", 25),
            "monthly_expenses": ("Monthly expenses", 20),
            "savings": ("Current savings", 20),
            "existing_emi": ("Existing EMI", 15),
            "employment_status": ("Employment status", 20),
        }

        score = 0
        details = []
        missing = []

        for field, (label, weight) in fields.items():
            val = profile.get(field)
            if val is not None:
                score += weight
                details.append(f"{label}: provided")
            else:
                missing.append(f"Provide {label.lower()}")

        return min(score, 100), details, missing

    def _score_documents(self, mission: Optional[dict], documents: list):
        category = (mission or {}).get("goal_category", "other")
        required_types = REQUIRED_DOCS_BY_CATEGORY.get(category, ["identity_document"])

        if not documents:
            return 0.0, [], [f"Upload required documents: {', '.join(required_types)}"]

        score = 0
        details = []
        missing = []

        # Map uploaded doc types
        confirmed_types = set()
        review_types = set()
        for doc in documents:
            doc_type = doc.get("document_type") or "other"
            status = doc.get("processing_status", "uploaded")
            if status == "confirmed":
                confirmed_types.add(doc_type)
            elif status in ("extracted", "review_required", "classified"):
                review_types.add(doc_type)

        per_doc = 100 // len(required_types) if required_types else 100

        for req_type in required_types:
            if req_type in confirmed_types:
                score += per_doc
                details.append(f"{req_type.replace('_', ' ').title()}: verified ✓")
            elif req_type in review_types:
                score += per_doc // 2
                details.append(f"{req_type.replace('_', ' ').title()}: needs review")
                missing.append(f"Confirm {req_type.replace('_', ' ')} extraction")
            else:
                missing.append(f"Upload {req_type.replace('_', ' ')}")

        # Bonus for extra verified docs
        bonus_count = len(confirmed_types) - len(required_types)
        if bonus_count > 0:
            score = min(score + 10, 100)

        return min(score, 100), details, missing

    def _score_financial_info(self, profile: Optional[dict]):
        if not profile:
            return 0.0, [], ["Complete financial profile to improve score"]

        income = profile.get("monthly_income") or 0
        expenses = profile.get("monthly_expenses") or 0
        emi = profile.get("existing_emi") or 0
        savings = profile.get("savings") or 0

        score = 0
        details = []
        missing = []

        if income > 0:
            score += 30
            details.append(f"Monthly income: ₹{income:,.0f}")

        if income > 0 and expenses > 0:
            ratio = expenses / income
            if ratio < 0.7:
                score += 30
                details.append(f"Expense ratio: {ratio:.0%} (healthy)")
            elif ratio < 0.9:
                score += 15
                details.append(f"Expense ratio: {ratio:.0%} (moderate)")
                missing.append("High expense ratio — consider reducing expenses")
            else:
                details.append(f"Expense ratio: {ratio:.0%} (high)")
                missing.append("Expense ratio too high — income may not support goal")
        else:
            missing.append("Add monthly expenses for ratio analysis")

        if savings > 0:
            score += 20
            details.append(f"Savings: ₹{savings:,.0f}")
        else:
            missing.append("Add current savings amount")

        if emi is not None:  # 0 EMI is valid (no EMI)
            score += 20
            dti = emi / income if income > 0 else 0
            if dti < 0.3:
                details.append(f"Debt-to-income: {dti:.0%} (low)")
            elif dti < 0.5:
                details.append(f"Debt-to-income: {dti:.0%} (moderate)")
            else:
                details.append(f"Debt-to-income: {dti:.0%} (high)")
                missing.append("High debt-to-income ratio")
        else:
            missing.append("Provide existing EMI amount (0 if none)")

        return min(score, 100), details, missing

    def _score_timeline(self, mission: Optional[dict]):
        if not mission:
            return 0.0, [], ["Create a mission with a timeline"]

        score = 0
        details = []
        missing = []

        if mission.get("deadline"):
            score += 60
            details.append("Target deadline set")
        elif mission.get("timeline_text"):
            score += 40
            details.append(f"Timeline: {mission['timeline_text']}")
            missing.append("Set a specific deadline date for better tracking")
        else:
            missing.append("Add target timeline or deadline")

        if mission.get("destination"):
            score += 40
            details.append(f"Destination: {mission['destination']}")

        return min(score, 100), details, missing

    def _recommend_stage(
        self,
        overall: float,
        mission: Optional[dict],
        profile: Optional[dict],
        documents: list,
    ) -> int:
        if not mission:
            return 1
        if not profile or (profile.get("monthly_income") is None):
            return 2
        confirmed_docs = [d for d in documents if d.get("processing_status") == "confirmed"]
        if len(confirmed_docs) == 0:
            return 3
        if overall < 60:
            return 4
        if overall < 80:
            return 5
        if overall < 95:
            return 6
        return 7


readiness_engine = ReadinessEngine()
