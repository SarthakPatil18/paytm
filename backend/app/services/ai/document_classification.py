"""
DocumentClassificationService — classifies uploaded documents using AI vision.
"""
import json
import logging
import base64
from pathlib import Path
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

CLASSIFICATION_PROMPT = """You are a document classification assistant for FinPath AI, an Indian fintech platform.

Analyze the provided document image/PDF and classify it.

DOCUMENT TYPES:
- salary_slip: Salary slip, payslip, pay stub, wage slip
- bank_statement: Bank account statement, passbook
- scholarship_letter: Scholarship award letter, financial aid letter
- identity_document: Aadhaar card, PAN card, passport, driving license, voter ID
- loan_document: Loan sanction letter, loan agreement, EMI schedule
- insurance_document: Insurance policy, premium receipt
- other: Any document that doesn't fit above categories

Return ONLY valid JSON:
{
  "document_type": "salary_slip",
  "confidence": 0.97,
  "reasoning": "Document contains salary breakdown, employer name, and pay period"
}
"""

FIELD_EXTRACTION_PROMPTS = {
    "salary_slip": """Extract the following fields from this salary slip document. 
Return ONLY valid JSON:
{
  "employee_name": "Full name of employee or null",
  "employer_name": "Company/employer name or null",
  "gross_salary": 85000.00 or null,
  "net_salary": 75000.00 or null,
  "pay_period": "August 2026 or null",
  "employee_id": "EMP123 or null",
  "currency": "INR"
}
Important: Return actual numbers for amounts (not strings). Return null for any field not found.""",

    "bank_statement": """Extract the following fields from this bank statement.
Return ONLY valid JSON:
{
  "account_holder": "Full name or null",
  "bank_name": "Bank name or null",
  "statement_period": "April 2026 - June 2026 or null",
  "approximate_balance": 300000.00 or null,
  "currency": "INR"
}
Important: Return actual numbers for amounts (not strings). Return null for any field not found.""",

    "scholarship_letter": """Extract the following fields from this scholarship letter.
Return ONLY valid JSON:
{
  "student_name": "Full name or null",
  "institution": "University/institution name or null",
  "scholarship_amount": 500000.00 or null,
  "currency": "INR",
  "academic_period": "2026-2027 or null",
  "scholarship_type": "Merit/Need-based/etc or null"
}
Important: Return actual numbers for amounts (not strings). Return null for any field not found.""",

    "identity_document": """Extract only safe, non-sensitive fields from this identity document.
Return ONLY valid JSON:
{
  "document_subtype": "aadhaar/pan/passport/driving_license or null",
  "holder_name": "Full name or null",
  "nationality": "Indian or null"
}
Important: Do NOT extract ID numbers, biometric data, or other sensitive information.""",

    "other": """Extract any relevant financial or personal information from this document.
Return ONLY valid JSON with the fields you can find:
{
  "document_description": "Brief description of what this document is",
  "key_information": {}
}"""
}


class DocumentClassificationService:
    def __init__(self):
        if settings.LLM_API_KEY:
            genai.configure(api_key=settings.LLM_API_KEY)
            self.model = genai.GenerativeModel(settings.LLM_MODEL)
        else:
            self.model = None
            logger.warning("No LLM_API_KEY. Document classification will use filename-based fallback.")

    async def classify_document(self, file_path: str, mime_type: str) -> dict:
        """Classify a document and return type + confidence."""
        if not self.model:
            return self._fallback_classify(file_path)

        try:
            image_data = self._load_file_as_base64(file_path)
            if not image_data:
                return self._fallback_classify(file_path)

            response = self.model.generate_content(
                [
                    CLASSIFICATION_PROMPT,
                    {"mime_type": mime_type, "data": image_data}
                ],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                )
            )

            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            data = json.loads(raw.strip())
            return {
                "document_type": data.get("document_type", "other"),
                "confidence": float(data.get("confidence", 0.5)),
                "reasoning": data.get("reasoning", "")
            }

        except Exception as e:
            logger.error(f"Document classification error: {e}")
            return self._fallback_classify(file_path)

    async def extract_fields(self, file_path: str, mime_type: str, document_type: str) -> dict:
        """Extract structured fields from a classified document."""
        if not self.model:
            return {"error": "AI service not configured", "fields": {}}

        prompt = FIELD_EXTRACTION_PROMPTS.get(document_type, FIELD_EXTRACTION_PROMPTS["other"])

        try:
            image_data = self._load_file_as_base64(file_path)
            if not image_data:
                return {"fields": {}, "confidence": 0.0}

            response = self.model.generate_content(
                [
                    prompt,
                    {"mime_type": mime_type, "data": image_data}
                ],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                )
            )

            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            fields = json.loads(raw.strip())
            return {
                "fields": fields,
                "confidence": 0.85
            }

        except Exception as e:
            logger.error(f"Field extraction error: {e}")
            return {"fields": {}, "confidence": 0.0, "error": str(e)}

    def _load_file_as_base64(self, file_path: str) -> str | None:
        """Load a file and convert to base64."""
        try:
            path = Path(file_path)
            if not path.exists():
                logger.error(f"File not found: {file_path}")
                return None

            # For PDFs, try to get the first page as image using PyMuPDF
            if path.suffix.lower() == ".pdf":
                try:
                    import fitz  # PyMuPDF
                    doc = fitz.open(str(path))
                    page = doc[0]
                    mat = fitz.Matrix(2, 2)  # 2x zoom for better quality
                    pix = page.get_pixmap(matrix=mat)
                    img_bytes = pix.tobytes("png")
                    doc.close()
                    return base64.b64encode(img_bytes).decode("utf-8")
                except ImportError:
                    logger.warning("PyMuPDF not available, reading PDF as binary")
                    with open(file_path, "rb") as f:
                        return base64.b64encode(f.read()).decode("utf-8")
            else:
                with open(file_path, "rb") as f:
                    return base64.b64encode(f.read()).decode("utf-8")

        except Exception as e:
            logger.error(f"Error loading file {file_path}: {e}")
            return None

    def _fallback_classify(self, file_path: str) -> dict:
        """Fallback classification based on filename keywords."""
        filename = Path(file_path).stem.lower()

        if any(w in filename for w in ["salary", "payslip", "pay_slip", "wage"]):
            return {"document_type": "salary_slip", "confidence": 0.7, "reasoning": "Filename contains salary-related keywords"}
        elif any(w in filename for w in ["bank", "statement", "account"]):
            return {"document_type": "bank_statement", "confidence": 0.7, "reasoning": "Filename contains bank-related keywords"}
        elif any(w in filename for w in ["scholarship", "award", "grant"]):
            return {"document_type": "scholarship_letter", "confidence": 0.7, "reasoning": "Filename contains scholarship-related keywords"}
        elif any(w in filename for w in ["aadhaar", "aadhar", "pan", "passport", "id", "identity"]):
            return {"document_type": "identity_document", "confidence": 0.7, "reasoning": "Filename contains identity-related keywords"}
        elif any(w in filename for w in ["loan", "emi", "credit"]):
            return {"document_type": "loan_document", "confidence": 0.7, "reasoning": "Filename contains loan-related keywords"}
        elif any(w in filename for w in ["insurance", "policy", "premium"]):
            return {"document_type": "insurance_document", "confidence": 0.7, "reasoning": "Filename contains insurance-related keywords"}

        return {"document_type": "other", "confidence": 0.3, "reasoning": "Could not determine document type from filename"}


document_classification_service = DocumentClassificationService()
