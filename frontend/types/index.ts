export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface FinancialMission {
  id: number;
  user_id: number;
  goal_category: string;
  goal_title: string;
  description: string | null;
  destination: string | null;
  target_amount: number | null;
  currency: string;
  deadline: string | null;
  timeline_text: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  created_at: string;
  updated_at: string;
}

export interface GoalParseResponse {
  goal_category: string | null;
  goal_title: string | null;
  destination: string | null;
  target_amount: number | null;
  currency: string;
  deadline: string | null;
  timeline_text: string | null;
  description: string | null;
  confidence: number;
  needs_clarification: boolean;
  clarification_questions: string[];
}

export interface FinancialProfile {
  id: number;
  user_id: number;
  monthly_income: number | null;
  monthly_expenses: number | null;
  savings: number | null;
  existing_emi: number | null;
  income_source: string | null;
  employment_status: string | null;
  currency: string;
  completion_percentage: number;
  updated_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  original_filename: string;
  file_size: number;
  mime_type: string;
  document_type: string | null;
  classification_confidence: number | null;
  processing_status: ProcessingStatus;
  error_message: string | null;
  uploaded_at: string;
  processed_at: string | null;
}

export type ProcessingStatus =
  | "uploaded"
  | "processing"
  | "classified"
  | "extracting"
  | "extracted"
  | "review_required"
  | "confirmed"
  | "failed";

export interface DocumentExtraction {
  id: number;
  document_id: number;
  extracted_fields: Record<string, unknown> | null;
  edited_fields: Record<string, unknown> | null;
  confirmed_fields: Record<string, unknown> | null;
  extraction_confidence: number | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  salary_slip: "Salary Slip",
  bank_statement: "Bank Statement",
  scholarship_letter: "Scholarship Letter",
  identity_document: "Identity Document",
  loan_document: "Loan Document",
  insurance_document: "Insurance Document",
  other: "Other",
};

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  education: "Education",
  healthcare: "Healthcare",
  home: "Home",
  vehicle: "Vehicle",
  business: "Business",
  emergency: "Emergency",
  other: "Other",
};

export const GOAL_CATEGORY_ICONS: Record<string, string> = {
  education: "🎓",
  healthcare: "🏥",
  home: "🏠",
  vehicle: "🚗",
  business: "💼",
  emergency: "🚨",
  other: "⭐",
};
