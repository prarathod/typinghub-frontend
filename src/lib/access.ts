import type { SubscriptionItem, User } from "@/types/auth";
import type { AccessType, Category, Language } from "@/features/paragraphs/paragraphsApi";

export type ProductId =
  | "english-court"
  | "english-mpsc"
  | "marathi-court"
  | "marathi-mpsc";

/** Product IDs that unlock paid content for each language (e.g. paid lessons). */
const PRODUCT_IDS_BY_LANGUAGE: Record<Language, ProductId[]> = {
  english: ["english-court", "english-mpsc"],
  marathi: ["marathi-court", "marathi-mpsc"]
};

export function getProductIdForParagraph(
  language: Language,
  category: Category
): ProductId | null {
  if (category === "lessons") return null;
  const key = `${language}-${category}` as const;
  const map: Record<string, ProductId> = {
    "english-court-exam": "english-court",
    "english-mpsc": "english-mpsc",
    "marathi-court-exam": "marathi-court",
    "marathi-mpsc": "marathi-mpsc"
  };
  return map[key] ?? null;
}

/** Default productId to show in pricing when paragraph has no direct product (e.g. paid lessons). */
export function getDefaultProductIdForLanguage(language: Language): ProductId | null {
  const ids = PRODUCT_IDS_BY_LANGUAGE[language];
  return ids?.[0] ?? null;
}

export type ParagraphForAccess = {
  isFree?: boolean;
  accessType?: AccessType;
  language: Language;
  category: Category;
};

function getEffectiveAccessType(p: ParagraphForAccess): AccessType {
  if (p.accessType) return p.accessType;
  return p.isFree !== false ? "free" : "paid";
}

export function hasAccessToParagraph(
  user: User | null,
  paragraph: ParagraphForAccess
): boolean {
  const accessType = getEffectiveAccessType(paragraph);
  if (accessType === "free") return true;
  if (accessType === "free-after-login") return user != null;
  if (!user) return false;
  const productId = getProductIdForParagraph(paragraph.language, paragraph.category);
  const subs = user.subscriptions ?? [];
  const now = new Date();
  const activeIds =
    user.activeProductIds ??
    (subs.length > 0 && typeof subs[0] === "object" && subs[0] !== null && "productId" in subs[0]
      ? (subs as SubscriptionItem[]).filter((s) => !s.validUntil || new Date(s.validUntil) > now).map((s) => s.productId)
      : (subs as string[]));
  if (productId) return activeIds.includes(productId);
  // Paid lesson (category "lessons"): grant access if user has any product for this language
  if (paragraph.category === "lessons") {
    const allowed = PRODUCT_IDS_BY_LANGUAGE[paragraph.language] ?? [];
    return allowed.some((id) => activeIds.includes(id));
  }
  return false;
}
