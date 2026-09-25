export function formatCurrency(amount: number | null | undefined, currency = "INR"): string {
  if (amount === null || amount === undefined) return "Not provided";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Not provided";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getDocumentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    uploaded: "Uploaded",
    processing: "Processing",
    classified: "Classified",
    extracting: "Extracting",
    extracted: "Extracted",
    review_required: "Review Required",
    confirmed: "Confirmed",
    failed: "Failed",
  };
  return labels[status] || status;
}

export function getDocumentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    uploaded: "text-blue-600",
    processing: "text-yellow-600",
    classified: "text-blue-600",
    extracting: "text-yellow-600",
    extracted: "text-green-600",
    review_required: "text-orange-600",
    confirmed: "text-green-700",
    failed: "text-red-600",
  };
  return colors[status] || "text-gray-600";
}

export function getDocumentStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    uploaded: "⬆",
    processing: "⏳",
    classified: "🏷",
    extracting: "🔍",
    extracted: "✓",
    review_required: "⚠",
    confirmed: "✓",
    failed: "✗",
  };
  return icons[status] || "•";
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function storeAuth(token: string, user: object): void {
  localStorage.setItem("finpath_token", token);
  localStorage.setItem("finpath_user", JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem("finpath_token");
  localStorage.removeItem("finpath_user");
}

export function getStoredUser(): object | null {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem("finpath_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("finpath_token");
}
