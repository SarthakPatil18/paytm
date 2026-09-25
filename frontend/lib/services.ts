import api from "./api";
import type {
  User,
  TokenResponse,
  FinancialMission,
  GoalParseResponse,
  FinancialProfile,
  Document,
  DocumentExtraction,
  Notification,
  NotificationSummary,
  ReadinessReport,
  NBAAction,
} from "@/types";

// ============================================================
// AUTH
// ============================================================
export async function register(email: string, full_name: string, password: string): Promise<TokenResponse> {
  const res = await api.post("/api/auth/register", { email, full_name, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get("/api/auth/me");
  return res.data;
}

// ============================================================
// MISSIONS
// ============================================================
export async function createMission(data: Partial<FinancialMission>): Promise<FinancialMission> {
  const res = await api.post("/api/missions/", data);
  return res.data;
}

export async function listMissions(): Promise<FinancialMission[]> {
  const res = await api.get("/api/missions/");
  return res.data;
}

export async function getMission(id: number): Promise<FinancialMission> {
  const res = await api.get(`/api/missions/${id}`);
  return res.data;
}

export async function updateMission(id: number, data: Partial<FinancialMission>): Promise<FinancialMission> {
  const res = await api.patch(`/api/missions/${id}`, data);
  return res.data;
}

export async function getMissionReadiness(missionId: number): Promise<ReadinessReport> {
  const res = await api.get(`/api/missions/${missionId}/readiness`);
  return res.data;
}

export async function getMissionNBA(missionId: number): Promise<NBAAction> {
  const res = await api.get(`/api/missions/${missionId}/nba`);
  return res.data;
}

// ============================================================
// AI
// ============================================================
export async function parseGoal(text: string): Promise<GoalParseResponse> {
  const res = await api.post("/api/ai/parse-goal", { text });
  return res.data;
}

export async function chatAssistant(message: string, missionId?: number): Promise<{ reply: string; suggested_actions: string[] }> {
  const res = await api.post("/api/ai/chat", { message, mission_id: missionId });
  return res.data;
}

export async function getGlobalNBA(): Promise<NBAAction> {
  const res = await api.get("/api/ai/nba");
  return res.data;
}

export async function getGlobalReadiness(): Promise<ReadinessReport> {
  const res = await api.get("/api/ai/readiness");
  return res.data;
}

// ============================================================
// DOCUMENTS
// ============================================================
export async function uploadDocument(file: File, missionId?: number): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  if (missionId) formData.append("mission_id", String(missionId));

  const res = await api.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function listDocuments(): Promise<Document[]> {
  const res = await api.get("/api/documents/");
  return res.data;
}

export async function getDocument(id: number): Promise<Document> {
  const res = await api.get(`/api/documents/${id}`);
  return res.data;
}

export async function getExtraction(documentId: number): Promise<DocumentExtraction> {
  const res = await api.get(`/api/documents/${documentId}/extraction`);
  return res.data;
}

export async function updateExtraction(documentId: number, editedFields: Record<string, unknown>): Promise<DocumentExtraction> {
  const res = await api.patch(`/api/documents/${documentId}/extraction`, { edited_fields: editedFields });
  return res.data;
}

export async function confirmExtraction(documentId: number, confirmedFields: Record<string, unknown>): Promise<DocumentExtraction> {
  const res = await api.post(`/api/documents/${documentId}/confirm`, { confirmed_fields: confirmedFields });
  return res.data;
}

export async function setDocumentType(documentId: number, documentType: string): Promise<Document> {
  const res = await api.patch(`/api/documents/${documentId}/classify`, { document_type: documentType });
  return res.data;
}

export async function deleteDocument(documentId: number): Promise<void> {
  await api.delete(`/api/documents/${documentId}`);
}

// ============================================================
// PROFILE
// ============================================================
export async function getProfile(): Promise<FinancialProfile> {
  const res = await api.get("/api/profile/");
  return res.data;
}

export async function updateProfile(data: Partial<FinancialProfile>): Promise<FinancialProfile> {
  const res = await api.patch("/api/profile/", data);
  return res.data;
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export async function listNotifications(limit = 20): Promise<Notification[]> {
  const res = await api.get(`/api/notifications/?limit=${limit}`);
  return res.data;
}

export async function getNotificationSummary(): Promise<NotificationSummary> {
  const res = await api.get("/api/notifications/summary");
  return res.data;
}

export async function markNotificationRead(id: number): Promise<Notification> {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead(): Promise<{ marked_read: number }> {
  const res = await api.post("/api/notifications/mark-all-read");
  return res.data;
}
