"""
GoalUnderstandingService — converts natural-language goal input into structured JSON.
Uses Gemini (or configured LLM) with strict JSON schema output.
"""
import json
import logging
from typing import Optional
from app.core.config import settings
from app.schemas.mission import GoalParseResponse

logger = logging.getLogger(__name__)



GOAL_PARSE_PROMPT = """You are a financial goal understanding assistant for FinPath AI, an Indian fintech platform.

Your job is to extract structured information from a user's natural-language description of their financial goal.

STRICT RULES:
1. Do NOT invent or assume information the user did not mention.
2. If destination/location is not mentioned, set destination to null.
3. If amount is not mentioned, set target_amount to null.
4. If timeline is vague (e.g., "next year"), preserve it in timeline_text instead of inventing a date.
5. If critical information is missing (goal category unclear), ask for clarification.
6. confidence should reflect how certain you are about the extraction (0.0 to 1.0).
7. Set needs_clarification to true if the goal is too vague to create a meaningful mission.

GOAL CATEGORIES: education, healthcare, home, vehicle, business, emergency, other

Return ONLY valid JSON with this exact structure:
{
  "goal_category": "education" | "healthcare" | "home" | "vehicle" | "business" | "emergency" | "other" | null,
  "goal_title": "Short descriptive title" | null,
  "destination": "Country/City if mentioned" | null,
  "target_amount": 1200000 | null,
  "currency": "INR",
  "deadline": null,
  "timeline_text": "next year" | null,
  "description": "One sentence summary of what user wants",
  "confidence": 0.94,
  "needs_clarification": false,
  "clarification_questions": []
}

User input: {user_input}
"""


class GoalUnderstandingService:
    def __init__(self):
        self.model = None
        self._genai = None
        if settings.LLM_API_KEY:
            try:
                import google.genai as genai_new
                client = genai_new.Client(api_key=settings.LLM_API_KEY)
                self.model = client.models
                self._model_name = settings.LLM_MODEL
                self._client = client
                self._use_new_sdk = True
                logger.info(f"AI configured: google.genai SDK, model={settings.LLM_MODEL}")
            except ImportError:
                try:
                    import google.generativeai as genai_old
                    genai_old.configure(api_key=settings.LLM_API_KEY)
                    self.model = genai_old.GenerativeModel(settings.LLM_MODEL)
                    self._genai = genai_old
                    self._use_new_sdk = False
                    logger.info(f"AI configured: google.generativeai SDK (legacy), model={settings.LLM_MODEL}")
                except ImportError:
                    logger.warning("Neither google.genai nor google.generativeai found. Fallback mode.")
            except Exception as e:
                logger.warning(f"AI configuration failed: {e}. Fallback mode.")
        else:
            logger.warning("No LLM_API_KEY configured. Goal parsing will use fallback mode.")

    async def parse_goal(self, text: str) -> GoalParseResponse:
        """Parse natural-language goal text into structured data."""
        if not self.model:
            return self._fallback_parse(text)

        try:
            prompt = GOAL_PARSE_PROMPT.format(user_input=text)
            raw = self._generate(prompt)
            if not raw:
                return self._fallback_parse(text)

            # Strip markdown code fences if present
            raw = raw.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            raw = raw.strip()

            data = json.loads(raw)
            return GoalParseResponse(**data)

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error in goal parsing: {e}")
            return GoalParseResponse(
                confidence=0.0,
                needs_clarification=True,
                clarification_questions=["Could you describe your financial goal in a bit more detail?"]
            )
        except Exception as e:
            logger.error(f"Goal parsing error: {e}")
            return self._fallback_parse(text)

    def _fallback_parse(self, text: str) -> GoalParseResponse:
        """Simple keyword-based fallback when AI is unavailable."""
        text_lower = text.lower()
        category = None
        title = None
        amount = None
        destination = None
        timeline_text = None

        # Category detection
        if any(w in text_lower for w in ["study", "education", "university", "college", "school", "degree", "course"]):
            category = "education"
            title = "Education Goal"
        elif any(w in text_lower for w in ["hospital", "medical", "health", "treatment", "surgery"]):
            category = "healthcare"
            title = "Healthcare Goal"
        elif any(w in text_lower for w in ["house", "home", "flat", "apartment", "property"]):
            category = "home"
            title = "Home Purchase"
        elif any(w in text_lower for w in ["car", "vehicle", "bike", "motorcycle"]):
            category = "vehicle"
            title = "Vehicle Purchase"
        elif any(w in text_lower for w in ["business", "startup", "venture", "company"]):
            category = "business"
            title = "Business Goal"

        # Amount detection (₹ or lakh/crore)
        import re
        lakh_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)', text_lower)
        crore_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*crore', text_lower)
        if lakh_match:
            amount = float(lakh_match.group(1)) * 100000
        elif crore_match:
            amount = float(crore_match.group(1)) * 10000000

        # Destination
        common_countries = ["germany", "usa", "uk", "canada", "australia", "france", "japan", "singapore", "dubai"]
        for country in common_countries:
            if country in text_lower:
                destination = country.title()
                break

        # Timeline
        if "next year" in text_lower:
            timeline_text = "Next year"
        elif "this year" in text_lower:
            timeline_text = "This year"
        elif "6 months" in text_lower or "six months" in text_lower:
            timeline_text = "6 months"

        return GoalParseResponse(
            goal_category=category,
            goal_title=title,
            destination=destination,
            target_amount=amount,
            currency="INR",
            timeline_text=timeline_text,
            description=text[:200],
            confidence=0.6 if category else 0.2,
            needs_clarification=category is None,
            clarification_questions=[] if category else ["What type of financial goal are you trying to achieve?"]
        )

    def _generate(self, prompt: str) -> Optional[str]:
        """Internal helper: generate text using whichever SDK is configured."""
        if not self.model:
            return None
        try:
            if getattr(self, "_use_new_sdk", False):
                response = self._client.models.generate_content(
                    model=self._model_name,
                    contents=prompt,
                )
                return response.text
            else:
                response = self.model.generate_content(prompt)
                return response.text
        except Exception as e:
            logger.warning(f"LLM generate failed: {e}")
            return None

    async def chat(self, message: str, context: Optional[dict] = None) -> dict:
        """Provide contextual financial journey assistant responses."""
        ctx = context or {}
        mission_title = ctx.get("mission_title", "Financial Mission")
        target_amount = ctx.get("target_amount", 0)
        profile_pct = ctx.get("profile_completion", 0)
        doc_count = ctx.get("doc_count", 0)
        unverified_docs = ctx.get("unverified_docs", [])

        # Try LLM if configured
        if self.model:
            try:
                system_prompt = f"""You are FinPath AI, an empathetic, highly intelligent Indian fintech journey assistant.
User's Current Context:
- Active Mission: {mission_title}
- Target Amount: ₹{target_amount:,.0f} if target_amount else 'Not specified'
- Profile Completion: {profile_pct}%
- Total Documents: {doc_count}
- Documents needing verification: {', '.join(unverified_docs) if unverified_docs else 'None'}

Answer the user concisely, professionally, and encouragingly. Keep replies under 3 paragraphs with bullet points where helpful.
User says: {message}"""
                reply_text = self._generate(system_prompt)
                if reply_text:
                    return {
                        "reply": reply_text.strip(),
                        "suggested_actions": ["Review Next Best Action", "Upload Missing Document", "Update Profile"]
                    }
            except Exception as e:
                logger.warning(f"LLM chat failed, using fallback: {e}")

        # Intelligent contextual fallback
        msg_lower = message.lower()
        if "next" in msg_lower or "do next" in msg_lower or "action" in msg_lower:
            if unverified_docs:
                doc_name = unverified_docs[0]
                reply = f"Your highest priority next action is to verify your {doc_name}. We extracted information from it that needs your confirmation to become trusted data."
                actions = [f"Review {doc_name}", "Check Requirements", "View Dashboard"]
            elif profile_pct < 80:
                reply = f"Your next recommended step is to complete your Financial Profile (currently at {profile_pct}%). Adding your income and expense details will unlock accurate loan eligibility."
                actions = ["Complete Profile", "Upload Bank Statement", "Review Mission"]
            else:
                reply = f"You are making stellar progress on '{mission_title}'! Your next milestone is the Financial Readiness Assessment."
                actions = ["View Assessment", "Review Timeline", "Check Options"]
        elif "missing" in msg_lower or "document" in msg_lower or "require" in msg_lower:
            reply = f"For your '{mission_title}' journey, we standardly require:\n• Valid Passport / National ID\n• Recent 6-Month Bank Statement\n• Salary Slip or Income Proof\n• Admission / University Offer Letter\n\nCurrently, you have {doc_count} document(s) uploaded."
            actions = ["Upload Document", "Review Documents", "Check Checklist"]
        elif "profile" in msg_lower or "complete" in msg_lower:
            reply = f"Your Financial Profile is currently {profile_pct}% complete. Completing your profile gives lenders confidence and provides personalized funding options."
            actions = ["Update Profile", "Add Monthly Savings", "Add Existing EMI"]
        elif "explain" in msg_lower or "mission" in msg_lower or "goal" in msg_lower:
            reply = f"Your Financial Mission '{mission_title}' is configured with a target of ₹{target_amount:,.0f}. FinPath tracks your journey through 7 stages: Goal Definition → Profile → Documents → Assessment → Financial Options → Application → Completion."
            actions = ["View Stages", "Next Best Action", "Explore Funding"]
        else:
            reply = f"I'm your FinPath AI journey assistant. I'm tracking your mission '{mission_title}' (target ₹{target_amount:,.0f}). I can help you understand missing documents, verify extracted information, or guide you through your next best financial steps."
            actions = ["What should I do next?", "What documents are missing?", "How complete is my profile?"]

        return {
            "reply": reply,
            "suggested_actions": actions
        }


goal_understanding_service = GoalUnderstandingService()

