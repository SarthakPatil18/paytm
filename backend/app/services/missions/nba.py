"""
Next Best Action (NBA) Engine — deterministic rule-based system.

Rules are evaluated in priority order.
LLM is never used to decide application state here.
"""
from typing import Optional
from dataclasses import dataclass


@dataclass
class NextBestAction:
    action: str
    reason: str
    priority: str          # "critical" | "high" | "medium" | "low"
    target_route: str
    icon: str = "→"


class NBAEngine:
    """
    Evaluates deterministic rules to surface the single best action
    the user should take right now.

    Priority order (highest → lowest):
    1. No mission → Create mission
    2. Document needs user review → Review document
    3. Profile critically incomplete → Complete profile
    4. Required document missing → Upload document
    5. Readiness below threshold → Address lowest readiness component
    6. Mission stage can be advanced → Advance stage
    7. Deadline approaching → Review timeline
    8. Default: well done, explore options
    """

    def get_next_action(
        self,
        mission: Optional[dict],
        profile: Optional[dict],
        documents: list,
        readiness_score: float = 0.0,
        readiness_components: Optional[list] = None,
    ) -> NextBestAction:

        # Rule 1: No mission
        if not mission:
            return NextBestAction(
                action="Create Your Financial Mission",
                reason="Start by telling FinPath what financial goal you want to achieve.",
                priority="critical",
                target_route="/mission/new",
                icon="🎯",
            )

        # Rule 2: Document needs user review (extraction awaiting confirmation)
        docs_to_review = [
            d for d in documents
            if d.get("processing_status") in ("review_required", "extracted")
        ]
        if docs_to_review:
            doc = docs_to_review[0]
            name = doc.get("original_filename", "document")
            doc_id = doc.get("id")
            return NextBestAction(
                action=f"Review Extracted Data",
                reason=f"We extracted information from '{name}'. Your review is required before it becomes trusted data.",
                priority="high",
                target_route=f"/documents/{doc_id}" if doc_id else "/documents",
                icon="📋",
            )

        # Rule 3: Profile critically incomplete (< 40%)
        profile_pct = self._profile_pct(profile)
        if profile_pct < 40:
            return NextBestAction(
                action="Complete Your Financial Profile",
                reason=f"Your profile is {profile_pct:.0f}% complete. Adding income and expense details unlocks accurate readiness assessment.",
                priority="high",
                target_route="/profile",
                icon="👤",
            )

        # Rule 4: Required documents are missing
        category = mission.get("goal_category", "other")
        missing_doc = self._get_missing_required_doc(category, documents)
        if missing_doc:
            return NextBestAction(
                action=f"Upload {missing_doc.replace('_', ' ').title()}",
                reason=f"This document is required for your {category} mission and has not been uploaded yet.",
                priority="high",
                target_route="/documents",
                icon="📄",
            )

        # Rule 5: Profile moderately incomplete (40-70%)
        if profile_pct < 70:
            return NextBestAction(
                action="Improve Your Financial Profile",
                reason=f"Your profile is {profile_pct:.0f}% complete. Adding more details improves your readiness score.",
                priority="medium",
                target_route="/profile",
                icon="📊",
            )

        # Rule 6: Unverified docs exist
        unverified = [
            d for d in documents
            if d.get("processing_status") not in ("confirmed", "failed")
            and d.get("document_type") is not None
        ]
        if unverified:
            doc = unverified[0]
            doc_id = doc.get("id")
            return NextBestAction(
                action="Verify Your Documents",
                reason="Some documents are processed but haven't been verified yet. Verification improves your readiness.",
                priority="medium",
                target_route=f"/documents/{doc_id}" if doc_id else "/documents",
                icon="✅",
            )

        # Rule 7: Readiness < 80 — improve the weakest component
        if readiness_score < 80 and readiness_components:
            weakest = min(
                readiness_components,
                key=lambda c: c.get("score", 100) if isinstance(c, dict) else c.score
            )
            comp_name = weakest.get("name") if isinstance(weakest, dict) else weakest.name
            missing = weakest.get("missing") if isinstance(weakest, dict) else weakest.missing
            reason_text = missing[0] if missing else f"Improve {comp_name}"
            return NextBestAction(
                action=f"Improve {comp_name}",
                reason=reason_text,
                priority="medium",
                target_route="/progress",
                icon="📈",
            )

        # Rule 8: Deadline check (if deadline is within 30 days)
        if mission.get("deadline"):
            from datetime import datetime, timezone
            try:
                deadline_str = mission["deadline"]
                if isinstance(deadline_str, str):
                    dl = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                else:
                    dl = deadline_str
                now = datetime.now(timezone.utc)
                days_left = (dl - now).days
                if 0 < days_left < 30:
                    return NextBestAction(
                        action="Review Mission Timeline",
                        reason=f"Your mission deadline is in {days_left} days. Review your preparation status.",
                        priority="high",
                        target_route="/missions",
                        icon="⏰",
                    )
            except Exception:
                pass

        # Rule 9: High readiness — move to next stage
        if readiness_score >= 80:
            stage = mission.get("stage", 1)
            if stage < 7:
                stage_names = {
                    1: "Financial Profile",
                    2: "Document Verification",
                    3: "Readiness Assessment",
                    4: "Financial Options",
                    5: "Application Preparation",
                    6: "Final Review",
                    7: "Completion",
                }
                next_stage = stage_names.get(stage + 1, "next step")
                return NextBestAction(
                    action=f"Advance to {next_stage}",
                    reason=f"Your readiness score is {readiness_score:.0f}%. You're ready to move forward.",
                    priority="medium",
                    target_route="/missions",
                    icon="🚀",
                )

        # Default
        return NextBestAction(
            action="Explore Financial Options",
            reason="Your journey is on track. Review available financial products aligned with your mission.",
            priority="low",
            target_route="/missions",
            icon="🔍",
        )

    def _profile_pct(self, profile: Optional[dict]) -> float:
        if not profile:
            return 0.0
        fields = ["monthly_income", "monthly_expenses", "savings", "existing_emi", "employment_status"]
        filled = sum(1 for f in fields if profile.get(f) is not None)
        return (filled / len(fields)) * 100

    def _get_missing_required_doc(self, category: str, documents: list) -> Optional[str]:
        from app.services.missions.readiness import REQUIRED_DOCS_BY_CATEGORY
        required = REQUIRED_DOCS_BY_CATEGORY.get(category, ["identity_document"])
        uploaded_types = {d.get("document_type") for d in documents if d.get("document_type")}
        for req in required:
            if req not in uploaded_types:
                return req
        return None


nba_engine = NBAEngine()
