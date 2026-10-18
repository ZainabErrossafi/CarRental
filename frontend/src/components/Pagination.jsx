import { useI18n } from "../context/I18nContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageCount, total, start, end, setPage }) {
  const { t } = useI18n();
  if (total === 0) return null;

  return (
    <nav className="list-pagination" aria-label={t("List pagination")}>
      <span className="pagination-summary" role="status">
        {t("Showing {start}–{end} of {total}", { start, end, total })}
      </span>
      <div className="pagination-controls">
        <button type="button" className="btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft size={15} /> {t("Previous")}
        </button>
        <span className="pagination-page">{t("Page {page} of {total}", { page, total: pageCount })}</span>
        <button type="button" className="btn" disabled={page === pageCount} onClick={() => setPage(page + 1)}>
          {t("Next")} <ChevronRight size={15} />
        </button>
      </div>
    </nav>
  );
}
