type AdminPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type PageToken = number | "ellipsis";

/** First, last, current ± 1 sibling, with "…" filling any gap. Keeps the
 * pagination bar bounded regardless of totalPages (some tables have thousands). */
function getPageTokens(current: number, total: number, siblingCount = 1): PageToken[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const tokens: PageToken[] = [1];
  if (showLeftEllipsis) tokens.push("ellipsis");
  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== total) tokens.push(p);
  }
  if (showRightEllipsis) tokens.push("ellipsis");
  tokens.push(total);
  return tokens;
}

export function AdminPagination({ page, totalPages, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null;
  const tokens = getPageTokens(page, totalPages);

  return (
    <nav className="mt-3">
      <ul className="pagination justify-content-center flex-wrap mb-0">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
        </li>
        {tokens.map((t, idx) =>
          t === "ellipsis" ? (
            <li key={`ellipsis-${idx}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={t} className={`page-item ${t === page ? "active" : ""}`}>
              <button type="button" className="page-link" onClick={() => onPageChange(t)}>
                {t}
              </button>
            </li>
          )
        )}
        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
