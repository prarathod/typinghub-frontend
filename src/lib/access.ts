import type { User } from "@/types/auth";
import type { Category, Language } from "@/features/paragraphs/paragraphsApi";

export type ProductId =
  | "english-court"
  | "english-mpsc"
  | "marathi-court"
  | "marathi-mpsc";

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
  if (!productId) return true;
  const subs = user.subscriptions ?? [];
  return subs.includes(productId);
}
