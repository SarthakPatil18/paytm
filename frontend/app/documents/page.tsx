"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { listDocuments, uploadDocument, confirmExtraction } from "@/lib/services";
import type { Document, DocumentExtraction } from "@/types";
import { DOCUMENT_TYPE_LABELS } from "@/types";
import { formatAmount } from "@/lib/utils";

interface SampleExtractionData {
  university?: string;
  program?: string;
  start_date?: string;
  tuition?: string;
  employee_name?: string;
  employer_name?: string;
  net_salary?: number;
  bank_name?: string;
  account_holder?: string;
  approximate_balance?: number;
}

export default function DocumentCenterPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Review Modal state
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sampleData, setSampleData] = useState<SampleExtractionData>({
    university: "Technical University of Munich",
    program: "M.Sc Computer Science",
    start_date: "October 2027",
    tuition: "€12,000 / year",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload a PDF, JPG, or PNG document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum supported size is 10MB.");
      return;
    }

    setUploadError("");
    setUploadSuccess("");
    setUploading(true);

    try {
      const newDoc = await uploadDocument(file);
      setDocuments((prev) => [newDoc, ...prev]);
      setUploadSuccess(`Successfully uploaded "${file.name}". OCR extraction in progress.`);
      setTimeout(() => setUploadSuccess(""), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleOpenReview = (doc: Document) => {
    setSelectedDoc(doc);
    if (doc.document_type === "salary_slip") {
      setSampleData({
        employee_name: "Account Holder",
        employer_name: "FinPath Technologies",
        net_salary: 68500,
      });
    } else if (doc.document_type === "bank_statement") {
      setSampleData({
        bank_name: "HDFC Bank",
        account_holder: "Account Holder",
        approximate_balance: 345000,
      });
    } else {
      setSampleData({
        university: "Technical University of Munich",
        program: "M.Sc Computer Science",
        start_date: "October 2027",
        tuition: "€12,000 / year",
      });
    }
    setReviewModalOpen(true);
  };

  const handleConfirmData = async () => {
    if (!selectedDoc) return;
    setConfirming(true);
    try {
      await confirmExtraction(selectedDoc.id, sampleData as Record<string, unknown>).catch(() => null);
      // Update local state
      setDocuments((prev) =>
        prev.map((d) => (d.id === selectedDoc.id ? { ...d, processing_status: "confirmed" } : d))
      );
      setReviewModalOpen(false);
      setUploadSuccess(`Document "${selectedDoc.original_filename}" verified and marked as trusted!`);
      setTimeout(() => setUploadSuccess(""), 4000);
    } finally {
      setConfirming(false);
    }
  };

  // Standard checklist mapping
  const requiredCategories = [
    {
      type: "identity_document",
      title: "Passport / National ID",
      defaultStatus: "confirmed",
      date: "Uploaded Sep 2026",
      desc: "Identity verification for international student eligibility.",
    },
    {
      type: "bank_statement",
      title: "Bank Statement (Last 6 Months)",
      defaultStatus: "confirmed",
      date: "Uploaded Sep 2026",
      desc: "Liquid fund proofs and financial solvency proof.",
    },
    {
      type: "scholarship_letter",
      title: "Offer Letter / Admission",
      defaultStatus: "review_required",
      date: "Uploaded Sep 2026",
      desc: "University acceptance verification and fee schedule.",
    },
    {
      type: "salary_slip",
      title: "Salary Slip / Co-Borrower Income",
      defaultStatus: "review_required",
      date: "Uploaded Sep 2026",
      desc: "Income verification for student loan approval.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", paddingBottom: 80 }}>
      <AppNav />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Secure Document Center
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#002e6e", margin: "4px 0 0", letterSpacing: "-0.02em" }}>
              Your Documents
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: "4px 0 0" }}>
              Upload and verify financial paperwork to build your trusted financial profile.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
            style={{ padding: "10px 22px" }}
          >
            + Upload Document
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {/* Alerts */}
        {uploadError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠️ {uploadError}</span>
          </div>
        )}
        {uploadSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <span>✅ {uploadSuccess}</span>
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#002e6e", margin: "0 0 4px" }}>
            Drop your financial documents here
          </p>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px" }}>
            Supported formats: <strong>PDF, JPG, PNG</strong> (Max 10MB)
          </p>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: 13, padding: "7px 18px", pointerEvents: "none" }}
          >
            {uploading ? "Uploading & Extracting..." : "Browse Files"}
          </button>
        </div>

        {/* AI Trust Flow Indicator */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#002e6e" }}>
              FinPath Trusted Data Architecture:
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600 }}>
            <span style={{ color: "#0052cc", background: "#ebf4ff", padding: "3px 10px", borderRadius: 6 }}>
              1. AI Extracted
            </span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span style={{ color: "#b45309", background: "#fef3c7", padding: "3px 10px", borderRadius: 6 }}>
              2. User Verifies
            </span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span style={{ color: "#00875a", background: "#e6f9f2", padding: "3px 10px", borderRadius: 6 }}>
              3. Data Becomes Trusted
            </span>
          </div>
        </div>

        {/* Documents Section */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#002e6e", marginBottom: 16 }}>
          Mission Document Requirements
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {/* Card 1: Passport */}
          <div className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🛂</span>
                <span className="badge badge-green">✓ Verified</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002e6e", margin: "0 0 4px" }}>
                Passport
              </h3>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
                Identity and nationality verification for Germany student visa eligibility.
              </p>
            </div>
            <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Uploaded Sep 2026</span>
              <button
                onClick={() =>
                  handleOpenReview({
                    id: 101,
                    original_filename: "Passport_Front_Back.pdf",
                    document_type: "identity_document",
                    processing_status: "confirmed",
                    file_size: 1024000,
                    mime_type: "application/pdf",
                    user_id: 1,
                    classification_confidence: 0.98,
                    error_message: null,
                    uploaded_at: "2026-09-20",
                    processed_at: "2026-09-20",
                  })
                }
                className="btn-ghost"
                style={{ fontSize: 12.5, color: "#0052cc" }}
              >
                View Details →
              </button>
            </div>
          </div>

          {/* Card 2: Bank Statement */}
          <div className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🏦</span>
                <span className="badge badge-green">✓ Verified</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002e6e", margin: "0 0 4px" }}>
                Bank Statement
              </h3>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
                6 months statement from HDFC Bank verifying savings balance of ₹3,45,000.
              </p>
            </div>
            <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Uploaded Sep 2026</span>
              <button
                onClick={() =>
                  handleOpenReview({
                    id: 102,
                    original_filename: "HDFC_6M_Statement.pdf",
                    document_type: "bank_statement",
                    processing_status: "confirmed",
                    file_size: 2048000,
                    mime_type: "application/pdf",
                    user_id: 1,
                    classification_confidence: 0.95,
                    error_message: null,
                    uploaded_at: "2026-09-21",
                    processed_at: "2026-09-21",
                  })
                }
                className="btn-ghost"
                style={{ fontSize: 12.5, color: "#0052cc" }}
              >
                View Details →
              </button>
            </div>
          </div>

          {/* Card 3: Offer Letter */}
          <div
            className="card card-hover"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1.5px solid #b9d9ff",
              background: "#fafcff",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🎓</span>
                <span className="badge badge-amber">Review Required</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002e6e", margin: "0 0 4px" }}>
                Offer Letter
              </h3>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
                AI extracted: TUM M.Sc CS starting Oct 2027. Review values to verify.
              </p>
            </div>
            <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>AI Extracted (94%)</span>
              <button
                onClick={() =>
                  handleOpenReview({
                    id: 103,
                    original_filename: "TUM_Admission_Letter.pdf",
                    document_type: "scholarship_letter",
                    processing_status: "review_required",
                    file_size: 1548000,
                    mime_type: "application/pdf",
                    user_id: 1,
                    classification_confidence: 0.94,
                    error_message: null,
                    uploaded_at: "2026-09-23",
                    processed_at: "2026-09-23",
                  })
                }
                className="btn-primary"
                style={{ fontSize: 12, padding: "6px 14px", background: "#0052cc" }}
              >
                Review Document
              </button>
            </div>
          </div>

          {/* Card 4: Salary Slip */}
          <div className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>💼</span>
                <span className="badge badge-gray">Pending</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002e6e", margin: "0 0 4px" }}>
                Salary Slip
              </h3>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
                Income proof for co-borrower / personal contribution assessment.
              </p>
            </div>
            <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Not yet uploaded</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                Upload Slip
              </button>
            </div>
          </div>
        </div>

        {/* Live Uploaded Documents List */}
        {documents.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#002e6e", marginBottom: 16 }}>
              All Uploaded Documents ({documents.length})
            </h3>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Document Type</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>
                        {d.original_filename}
                      </td>
                      <td>
                        <span className="badge badge-gray">
                          {d.document_type ? d.document_type.replace(/_/g, " ") : "Unclassified"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            d.processing_status === "confirmed"
                              ? "badge badge-green"
                              : d.processing_status === "review_required"
                              ? "badge badge-amber"
                              : "badge badge-blue"
                          }
                        >
                          {d.processing_status === "confirmed"
                            ? "Verified"
                            : d.processing_status === "review_required"
                            ? "Review Required"
                            : d.processing_status}
                        </span>
                      </td>
                      <td style={{ color: "#64748b", fontSize: 13 }}>
                        {d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : "Today"}
                      </td>
                      <td>
                        <Link
                          href={`/documents/${d.id}`}
                          className="btn-ghost"
                          style={{ color: "#0052cc", fontSize: 13 }}
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 9: AI DOCUMENT EXTRACTION REVIEW MODAL */}
      {reviewModalOpen && selectedDoc && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 580,
              width: "100%",
              background: "#ffffff",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 20px 50px rgba(0, 46, 110, 0.2)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0052cc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  AI Extraction Verification
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#002e6e", margin: "2px 0 0" }}>
                  {selectedDoc.document_type ? selectedDoc.document_type.replace(/_/g, " ").toUpperCase() : "DOCUMENT"}
                </h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {selectedDoc.original_filename}
                </span>
              </div>
              <span className="badge badge-blue">Confidence: 94%</span>
            </div>

            {/* AI Extracted notice */}
            <div
              style={{
                background: "#f0f7ff",
                border: "1px solid #c8e0ff",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 13,
                color: "#1e40af",
                marginBottom: 20,
                display: "flex",
                gap: 8,
              }}
            >
              <span>ℹ️</span>
              <span>
                FinPath extracted these values automatically. Please review and confirm so this data becomes trusted for your mission.
              </span>
            </div>

            {/* Extracted Fields Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {sampleData.university && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>University:</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#002e6e" }}>{sampleData.university}</span>
                </div>
              )}
              {sampleData.program && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Program:</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#002e6e" }}>{sampleData.program}</span>
                </div>
              )}
              {sampleData.start_date && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Start Date:</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#002e6e" }}>{sampleData.start_date}</span>
                </div>
              )}
              {sampleData.tuition && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Tuition:</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#00875a" }}>{sampleData.tuition}</span>
                </div>
              )}
              {sampleData.net_salary && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Net Salary:</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#002e6e" }}>₹{sampleData.net_salary.toLocaleString("en-IN")}</span>
                </div>
              )}
              {sampleData.approximate_balance && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Approx Balance:</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#00875a" }}>₹{sampleData.approximate_balance.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="btn-ghost"
                style={{ fontSize: 13 }}
              >
                Reject
              </button>
              <Link
                href={`/documents/${selectedDoc.id}`}
                className="btn-secondary"
                style={{ fontSize: 13, padding: "8px 16px" }}
              >
                Edit Values
              </Link>
              <button
                type="button"
                onClick={handleConfirmData}
                disabled={confirming}
                className="btn-primary"
                style={{ fontSize: 13, padding: "8px 20px", background: "#00875a" }}
              >
                {confirming ? "Confirming..." : "Confirm Information ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
