"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppNav from "@/components/layout/AppNav";
import { getDocument, getExtraction, updateExtraction, confirmExtraction, setDocumentType, deleteDocument } from "@/lib/services";
import type { Document, DocumentExtraction } from "@/types";
import { DOCUMENT_TYPE_LABELS } from "@/types";
import { getDocumentStatusLabel, getDocumentStatusColor, getDocumentStatusIcon } from "@/lib/utils";

const ALL_DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS);

// Human-readable field labels
const FIELD_LABELS: Record<string, string> = {
  // Salary slip
  employee_name: "Employee Name",
  employer_name: "Employer / Company",
  gross_salary: "Gross Salary",
  net_salary: "Net Salary",
  pay_period: "Pay Period",
  employee_id: "Employee ID",
  currency: "Currency",
  // Bank statement
  account_holder: "Account Holder",
  bank_name: "Bank Name",
  statement_period: "Statement Period",
  approximate_balance: "Approximate Balance",
  // Scholarship
  student_name: "Student Name",
  institution: "Institution / University",
  scholarship_amount: "Scholarship Amount",
  academic_period: "Academic Period",
  scholarship_type: "Scholarship Type",
  // Identity
  document_subtype: "Document Type",
  holder_name: "Name",
  nationality: "Nationality",
  // Other
  document_description: "Document Description",
  key_information: "Key Information",
};

const AMOUNT_FIELDS = ["gross_salary", "net_salary", "approximate_balance", "scholarship_amount"];

export default function DocumentReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const docId = parseInt(id as string);

  const [doc, setDoc] = useState<Document | null>(null);
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [overrideType, setOverrideType] = useState("");
  const [settingType, setSettingType] = useState(false);

  // Poll for processing completion
  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const updatedDoc = await getDocument(docId).catch(() => null);
      if (updatedDoc && updatedDoc.processing_status !== doc?.processing_status) {
        setDoc(updatedDoc);
        if (["review_required", "confirmed", "failed"].includes(updatedDoc.processing_status)) {
          clearInterval(interval);
          await loadExtraction();
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const loadData = async () => {
    try {
      const [d] = await Promise.all([getDocument(docId)]);
      setDoc(d);
      if (["review_required", "confirmed", "extracted"].includes(d.processing_status)) {
        await loadExtraction();
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadExtraction = async () => {
    try {
      const ext = await getExtraction(docId);
      setExtraction(ext);
      // Set initial edit fields from extracted or confirmed
      const fields = ext.confirmed_fields || ext.edited_fields || ext.extracted_fields || {};
      setEditedFields(fields as Record<string, unknown>);
    } catch {
      // Not ready yet
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateExtraction(docId, editedFields);
      setExtraction(updated);
      setSuccess("Changes saved.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError("");
    try {
      const updated = await confirmExtraction(docId, editedFields);
      setExtraction(updated);
      const refreshed = await getDocument(docId);
      setDoc(refreshed);
      setSuccess("Information confirmed and added to your financial profile.");
    } catch {
      setError("Failed to confirm information. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const handleSetType = async () => {
    if (!overrideType) return;
    setSettingType(true);
    try {
      const updated = await setDocumentType(docId, overrideType);
      setDoc(updated);
      setSuccess("Document type updated. Reprocessing…");
    } catch {
      setError("Failed to update document type.");
    } finally {
      setSettingType(false);
    }
  };

  const renderFieldValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (AMOUNT_FIELDS.includes(key) && typeof value === "number") {
      return String(value);
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
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

  if (!doc) return null;

  const isProcessing = ["uploaded", "processing", "classified", "extracting"].includes(doc.processing_status);
  const isConfirmed = doc.processing_status === "confirmed";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      <AppNav />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* Back */}
        <button onClick={() => router.back()} className="btn-ghost" style={{ padding: "6px 0", marginBottom: 20 }}>
          ← Back
        </button>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
          Document Review
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          Review extracted information before it is added to your financial profile.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}

        {/* Document Info */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>
                  {doc.original_filename}
                </h2>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                {(doc.file_size / 1024).toFixed(1)} KB · {doc.mime_type}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`${getDocumentStatusColor(doc.processing_status)}`} style={{ fontSize: 13, fontWeight: 500 }}>
                {getDocumentStatusIcon(doc.processing_status)} {getDocumentStatusLabel(doc.processing_status)}
              </span>
            </div>
          </div>

          {/* Document Classification */}
          {doc.document_type && (
            <div style={{
              marginTop: 16, padding: "12px 16px", background: "#f8f9fc",
              borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>Detected Document Type</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                  {DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}
                </p>
              </div>
              {doc.classification_confidence !== null && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>Confidence</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: doc.classification_confidence > 0.8 ? "#059669" : "#d97706" }}>
                    {Math.round(doc.classification_confidence * 100)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Low confidence / manual type selection */}
          {doc.classification_confidence !== null && doc.classification_confidence < 0.7 && !isConfirmed && (
            <div className="alert alert-warning" style={{ marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, marginBottom: 8 }}>Document type is uncertain. Please confirm or correct it:</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    id="override-type-select"
                    className="select"
                    style={{ flex: 1, maxWidth: 280 }}
                    value={overrideType}
                    onChange={(e) => setOverrideType(e.target.value)}
                  >
                    <option value="">Select document type…</option>
                    {ALL_DOCUMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  <button
                    id="set-type-btn"
                    onClick={handleSetType}
                    className="btn-primary"
                    style={{ padding: "10px 16px", fontSize: 13 }}
                    disabled={!overrideType || settingType}
                  >
                    {settingType ? "Setting…" : "Set Type"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Processing state */}
        {isProcessing && (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <div className="spinner" style={{ margin: "0 auto 16px", width: 32, height: 32 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
              Processing your document…
            </h3>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              We&apos;re classifying and extracting information. This usually takes 10–30 seconds.
            </p>
            <div style={{ marginTop: 20 }}>
              {["Uploaded ✓", "Classifying…", "Extracting information…"].map((step, i) => {
                const statuses = ["uploaded", "classified", "extracting"];
                const done = statuses.indexOf(doc.processing_status) >= i;
                return (
                  <div key={step} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                    justifyContent: "center", color: done ? "#059669" : "#9ca3af"
                  }}>
                    <span>{done ? "✓" : "○"}</span>
                    <span style={{ fontSize: 14 }}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Failed state */}
        {doc.processing_status === "failed" && (
          <div className="card">
            <div className="alert alert-error" style={{ marginBottom: 0 }}>
              <div>
                <strong>We couldn&apos;t process this document.</strong>
                <p style={{ marginTop: 6, marginBottom: 0 }}>
                  {doc.error_message || "Please try uploading a clearer PDF or image."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extraction Review */}
        {extraction && !isProcessing && (
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                  {isConfirmed ? "Confirmed Information" : "Extracted Information"}
                </h2>
                {extraction.extraction_confidence && (
                  <span className="badge badge-blue" style={{ fontSize: 12 }}>
                    {Math.round(extraction.extraction_confidence * 100)}% confidence
                  </span>
                )}
              </div>
              {!isConfirmed && (
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                  Review the extracted data below. You can edit any field before confirming.
                  Confirmed information will update your Financial Profile.
                </p>
              )}
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {Object.entries(editedFields).map(([key, value]) => {
                if (key === "currency" || typeof value === "object") return null;
                const label = FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                const isAmount = AMOUNT_FIELDS.includes(key);

                return (
                  <div key={key}>
                    <label htmlFor={`field-${key}`} className="label">{label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isAmount && (
                        <span style={{ color: "#6b7280", fontSize: 15, fontWeight: 500 }}>₹</span>
                      )}
                      <input
                        id={`field-${key}`}
                        className="input"
                        type={isAmount ? "number" : "text"}
                        value={renderFieldValue(key, value)}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        disabled={isConfirmed}
                        style={{ opacity: isConfirmed ? 0.7 : 1 }}
                      />
                    </div>
                  </div>
                );
              })}

              {Object.keys(editedFields).length === 0 && (
                <div className="alert alert-warning">
                  No information could be extracted from this document. You can add information to your profile manually.
                </div>
              )}
            </div>

            {!isConfirmed && Object.keys(editedFields).length > 0 && (
              <>
                <hr className="divider" />
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button
                    id="save-extraction-btn"
                    onClick={handleSave}
                    className="btn-secondary"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    id="confirm-extraction-btn"
                    onClick={handleConfirm}
                    className="btn-primary"
                    disabled={confirming}
                    style={{ minWidth: 180 }}
                  >
                    {confirming ? <><span className="spinner" /> Confirming…</> : "Confirm Information →"}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, textAlign: "right" }}>
                  Confirming will update your Financial Profile with this information.
                </p>
              </>
            )}

            {isConfirmed && (
              <div className="alert alert-success" style={{ marginTop: 20 }}>
                ✓ Information confirmed on {extraction.confirmed_at ? new Date(extraction.confirmed_at).toLocaleDateString() : ""}. Your financial profile has been updated.
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button onClick={() => router.push("/dashboard")} className="btn-ghost">
            ← Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
