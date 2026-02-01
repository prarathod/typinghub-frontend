import type { User } from "@/types/auth";
import type { Category, Language } from "@/features/paragraphs/paragraphsApi";

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
  isFree: boolean;
  language: Language;
  category: Category;
};

export function hasAccessToParagraph(
  user: User | null,
  paragraph: ParagraphForAccess
): boolean {
  if (paragraph.isFree) return true;
  if (!user) return false;
  const productId = getProductIdForParagraph(paragraph.language, paragraph.category);
  const subs = user.subscriptions ?? [];
  if (productId) return subs.includes(productId);
  // Paid lesson (category "lessons"): grant access if user has any product for this language
  if (paragraph.category === "lessons") {
    const allowed = PRODUCT_IDS_BY_LANGUAGE[paragraph.language] ?? [];
    return allowed.some((id) => subs.includes(id));
  }
  return false;
}
