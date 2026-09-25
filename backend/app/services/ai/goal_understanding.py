"""
GoalUnderstandingService — converts natural-language goal input into structured JSON.
Uses Gemini (or configured LLM) with strict JSON schema output.
"""
import json
import logging
from typing import Optional
import google.generativeai as genai
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
        if settings.LLM_API_KEY:
            genai.configure(api_key=settings.LLM_API_KEY)
            self.model = genai.GenerativeModel(settings.LLM_MODEL)
        else:
            self.model = None
            logger.warning("No LLM_API_KEY configured. Goal parsing will use fallback mode.")

    async def parse_goal(self, text: str) -> GoalParseResponse:
        """Parse natural-language goal text into structured data."""
        if not self.model:
            return self._fallback_parse(text)

        try:
            prompt = GOAL_PARSE_PROMPT.format(user_input=text)
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                )
            )

            raw = response.text.strip()
            # Strip markdown code fences if present
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


goal_understanding_service = GoalUnderstandingService()
