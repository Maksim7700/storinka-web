// Tiny sessionStorage wrapper for the multi-step "new site" flow.
// The customizer accumulates content fields in memory, then hands them off
// to the domain step via sessionStorage so we don't lose them on navigation.
// Cleared after the site is created in the backend.

const STORAGE_KEY = "storinka:pending-site";

export type PendingSiteDraft = {
  templateId: number;
  templateKey: string;
  content: Record<string, string | number>;
};

export function saveDraft(draft: PendingSiteDraft) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage quota / disabled → ignore. Next.js navigation will just
    // land on an empty domain page and we redirect to /admin/catalog.
  }
}

export function loadDraft(): PendingSiteDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingSiteDraft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
