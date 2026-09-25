"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { getMission, listDocuments, uploadDocument, getProfile } from "@/lib/services";
import type { FinancialMission, Document, FinancialProfile } from "@/types";
import { GOAL_CATEGORY_ICONS, GOAL_CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "@/types";
import { formatAmount, getDocumentStatusLabel, getDocumentStatusIcon, getDocumentStatusColor } from "@/lib/utils";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ALLOWED_EXTS = [".pdf", ".png", ".jpg", ".jpeg"];

export default function MissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mission, setMission] = useState<FinancialMission | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const missionId = parseInt(id as string);
      const [m, d, p] = await Promise.all([
        getMission(missionId),
        listDocuments(),
        getProfile(),
      ]);
      setMission(m);
      setDocuments(d);
      setProfile(p);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError("");

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setUploadError(`Unsupported format. Please upload PDF, PNG, JPG, or JPEG files.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum allowed size is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const missionId = parseInt(id as string);
      await uploadDocument(file, missionId);
      await loadData(); // Refresh
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || "Upload failed. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
        <AppNav />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  if (!mission) return null;

  const confirmedDocs = documents.filter(d => d.processing_status === "confirmed").length;
  const profileCompletion = profile?.completion_percentage || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      <AppNav />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Back */}
        <button onClick={() => router.push("/dashboard")} className="btn-ghost" style={{ padding: "6px 0", marginBottom: 20 }}>
          ← Dashboard
        </button>

        {/* Mission Header */}
        <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid #1d4ed8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <span style={{ fontSize: 40, lineHeight: 1 }}>{GOAL_CATEGORY_ICONS[mission.goal_category] || "⭐"}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{mission.goal_title}</h1>
                  <span className={`badge ${mission.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
                    {mission.status}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                  {GOAL_CATEGORY_LABELS[mission.goal_category]}
                  {mission.destination && ` · ${mission.destination}`}
                </p>
                {mission.description && (
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6, maxWidth: 500 }}>
                    {mission.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <hr className="divider" style={{ margin: "20px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div>
              <p className="label">Goal</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                {GOAL_CATEGORY_LABELS[mission.goal_category]}
              </p>
            </div>
            <div>
              <p className="label">Target Amount</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                {mission.target_amount ? formatAmount(mission.target_amount) : "Not specified"}
              </p>
            </div>
            <div>
              <p className="label">Timeline</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                {mission.timeline_text || "Not specified"}
              </p>
            </div>
            <div>
              <p className="label">Destination</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                {mission.destination || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Document Upload */}
          <div>
            <div className="card" id="upload" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Upload Documents</h2>

              {uploadError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  {uploadError}
                </div>
              )}

              {/* Drop Zone */}
              <div
                id="drop-zone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#1d4ed8" : "#d1d5db"}`,
                  borderRadius: 10, padding: "32px 24px",
                  textAlign: "center", cursor: "pointer",
                  background: dragOver ? "#dbeafe" : "#f8f9fc",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>
                  {uploading ? "⏳" : "📄"}
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  {uploading ? "Uploading…" : "Drop your file here or click to browse"}
                </p>
                <p style={{ fontSize: 12, color: "#9ca3af" }}>
                  PDF, PNG, JPG, JPEG · Max 10MB
                </p>
                <input
                  ref={fileInputRef}
                  id="file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>Suggested documents:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Salary Slip", "Bank Statement", "Scholarship Letter", "ID Document"].map((label) => (
                    <span key={label} className="badge badge-gray" style={{ fontSize: 11 }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Profile */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Financial Profile</h2>
                <Link href="/profile" style={{ fontSize: 13, color: "#1d4ed8", textDecoration: "none", fontWeight: 500 }}>
                  Edit →
                </Link>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Completeness</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{profileCompletion}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>

              {[
                { label: "Monthly Income", value: profile?.monthly_income ? formatAmount(profile.monthly_income) : null },
                { label: "Savings", value: profile?.savings ? formatAmount(profile.savings) : null },
                { label: "Existing EMI", value: profile?.existing_emi ? formatAmount(profile.existing_emi) : null },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: item.value ? "#111827" : "#d1d5db" }}>
                    {item.value || "Not provided"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents List */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                Documents <span style={{ color: "#6b7280", fontWeight: 400 }}>({documents.length})</span>
              </h2>
              <span className="badge badge-blue">{confirmedDocs} confirmed</span>
            </div>

            {documents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
                <p style={{ fontSize: 14 }}>No documents uploaded yet.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    id={`mission-doc-${doc.id}`}
                    style={{
                      display: "block", padding: "14px 16px",
                      background: "#f8f9fc", borderRadius: 8,
                      border: "1px solid #e5e7eb", textDecoration: "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginBottom: 3, wordBreak: "break-all" }}>
                          {doc.original_filename}
                        </p>
                        <p style={{ fontSize: 12, color: "#6b7280" }}>
                          {doc.document_type ? DOCUMENT_TYPE_LABELS[doc.document_type] : "Detecting type…"}
                          {doc.classification_confidence && ` · ${Math.round(doc.classification_confidence * 100)}% confident`}
                        </p>
                      </div>
                      <span className={`badge ${
                        doc.processing_status === "confirmed" ? "badge-green" :
                        doc.processing_status === "review_required" ? "badge-orange" :
                        doc.processing_status === "failed" ? "badge-red" : "badge-blue"
                      }`} style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}>
                        {getDocumentStatusIcon(doc.processing_status)} {getDocumentStatusLabel(doc.processing_status)}
                      </span>
                    </div>

                    {doc.processing_status === "review_required" && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef3c7", borderRadius: 6 }}>
                        <p style={{ fontSize: 12, color: "#92400e", fontWeight: 500 }}>
                          ⚠ Click to review extracted information
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
