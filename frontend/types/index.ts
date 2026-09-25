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
  stage: number;
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
  monthly_investments: number | null;
  dependents: number | null;
  income_source: string | null;
  employment_status: string | null;
  employment_experience_years: number | null;
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

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_resource: string | null;
  related_resource_id: number | null;
  created_at: string;
}

export interface NotificationSummary {
  unread_count: number;
  notifications: Notification[];
}

export interface ReadinessComponent {
  name: string;
  score: number;
  weight: number;
  max_score: number;
  current: number;
  details: string[];
  missing: string[];
}

export interface ReadinessReport {
  overall_score: number;
  components: ReadinessComponent[];
  what_is_affecting: string[];
  next_improvement: string | null;
  stage_recommendation: number;
}

export interface NBAAction {
  action: string;
  reason: string;
  priority: "critical" | "high" | "medium" | "low";
  target_route: string;
  icon: string;
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
  home: "Home Purchase",
  home_purchase: "Home Purchase",
  vehicle: "Vehicle",
  business: "Business",
  emergency: "Emergency Fund",
  travel: "Travel",
  investment: "Investment",
  other: "Other",
};

export const GOAL_CATEGORY_ICONS: Record<string, string> = {
  education: "🎓",
  healthcare: "🏥",
  home: "🏠",
  home_purchase: "🏠",
  vehicle: "🚗",
  business: "💼",
  emergency: "🛡️",
  travel: "✈️",
  investment: "📈",
  other: "⭐",
};

export const MISSION_STAGES = [
  { id: 1, name: "Goal Definition", description: "Define your financial goal" },
  { id: 2, name: "Financial Profile", description: "Complete your financial profile" },
  { id: 3, name: "Document Verification", description: "Upload and verify documents" },
  { id: 4, name: "Readiness Assessment", description: "Review your readiness score" },
  { id: 5, name: "Financial Options", description: "Explore financial products" },
  { id: 6, name: "Application Preparation", description: "Prepare your application" },
  { id: 7, name: "Completion", description: "Mission complete" },
];

export const PRIORITY_COLORS: Record<string, string> = {
  critical: "#D64545",
  high: "#D9822B",
  medium: "#0057D9",
  low: "#16803C",
};
