import type { SubscriptionItem, User } from "@/types/auth";
import type { AccessType, Category, Language, ParagraphViewContext } from "@/features/paragraphs/paragraphsApi";

export type ProductId =
  | "english-court"
  | "english-court-new"
  | "english-mpsc"
  | "marathi-court"
  | "marathi-mpsc";

/** Product IDs that unlock paid content for each language (e.g. paid lessons). */
const PRODUCT_IDS_BY_LANGUAGE: Record<Language, ProductId[]> = {
  english: ["english-court", "english-court-new", "english-mpsc"],
  marathi: ["marathi-court", "marathi-mpsc"]
};

/** All product IDs whose ownership unlocks a given paragraph, for a given
 * viewing context. Every category maps to exactly one product except Court
 * Exam, which resolves to "english-court" or the separately-sold
 * "english-court-new" ("New Pattern") depending on context — defaulting to
 * "english-court" when context is omitted, so an unrecognized/missing
 * context never falls back to accepting either product. */
export function getAcceptableProductIdsForParagraph(
  language: Language,
  category: Category,
  context?: ParagraphViewContext
): ProductId[] {
  if (category === "lessons") return [];
  const key = `${language}-${category}` as const;
  if (key === "english-court-exam") {
    return context === "high-court" ? ["english-court-new"] : ["english-court"];
  }
  const map: Record<string, ProductId[]> = {
    "english-mpsc": ["english-mpsc"],
    "marathi-court-exam": ["marathi-court"],
    "marathi-mpsc": ["marathi-mpsc"]
  };
  return map[key] ?? [];
}

export function getProductIdForParagraph(
  language: Language,
  category: Category,
  context?: ParagraphViewContext
): ProductId | null {
  return getAcceptableProductIdsForParagraph(language, category, context)[0] ?? null;
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

export function isPaidParagraph(p: ParagraphForAccess): boolean {
  return getEffectiveAccessType(p) === "paid";
}

/**
 * Derive currently-active product IDs from the user object.
 * Always re-checks validUntil dates so stale localStorage cache can't bypass expiry.
 * Falls back to cached activeProductIds only when subscriptions array is absent
 * (e.g. legacy isPaid admin users whose backend grants them all products directly).
 */
function getActiveProductIds(user: User): string[] {
  const subs = user.subscriptions ?? [];
  const now = new Date();
  if (subs.length > 0 && typeof subs[0] === "object" && subs[0] !== null && "productId" in subs[0]) {
    return (subs as SubscriptionItem[])
      .filter((s) => !s.validUntil || new Date(s.validUntil) > now)
      .map((s) => s.productId);
  }
  // No subscription records: fall back to cached activeProductIds (covers isPaid users
  // where the backend sets them without creating Subscription documents).
  return user.activeProductIds ?? [];
}

export function hasAnyPaidAccess(user: User | null): boolean {
  if (!user) return false;
  return getActiveProductIds(user).length > 0;
}

export function hasAccessToParagraph(
  user: User | null,
  paragraph: ParagraphForAccess,
  context?: ParagraphViewContext
): boolean {
  const accessType = getEffectiveAccessType(paragraph);
  if (accessType === "free") return true;
  if (accessType === "free-after-login") return user != null;
  if (!user) return false;
  const acceptableIds = getAcceptableProductIdsForParagraph(paragraph.language, paragraph.category, context);
  const activeIds = getActiveProductIds(user);
  if (acceptableIds.length > 0) return acceptableIds.some((id) => activeIds.includes(id));
  // Paid lesson (category "lessons"): grant access if user has any product for this language
  if (paragraph.category === "lessons") {
    const allowed = PRODUCT_IDS_BY_LANGUAGE[paragraph.language] ?? [];
    return allowed.some((id) => activeIds.includes(id));
  }
  return false;
}
