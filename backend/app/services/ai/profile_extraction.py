"""
ProfileExtractionService — maps confirmed document extractions to financial profile fields.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Mapping from document extraction fields to financial profile fields
PROFILE_FIELD_MAPPING = {
    "salary_slip": {
        "net_salary": "monthly_income",
        "gross_salary": None,  # informational only
    },
    "bank_statement": {
        "approximate_balance": "savings",
    },
}


class ProfileExtractionService:
    """
    Maps confirmed document extraction data to financial profile fields.
    This is NOT financial analysis — it's only data organization.
    """

    def extract_profile_updates(
        self,
        document_type: str,
        confirmed_fields: dict
    ) -> dict:
        """
        Given a document type and confirmed extracted fields,
        return a dict of financial profile fields to update.
        """
        updates = {}
        mapping = PROFILE_FIELD_MAPPING.get(document_type, {})

        for doc_field, profile_field in mapping.items():
            if profile_field and doc_field in confirmed_fields:
                value = confirmed_fields.get(doc_field)
                if value is not None:
                    updates[profile_field] = value

        # Employment status from salary slip
        if document_type == "salary_slip":
            if "employer_name" in confirmed_fields and confirmed_fields.get("employer_name"):
                updates["employment_status"] = "employed"
                updates["income_source"] = confirmed_fields.get("employer_name")

        return updates


profile_extraction_service = ProfileExtractionService()
