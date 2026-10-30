import { useI18n } from "../../../context/I18nContext";
import Pagination from "../pagination/Pagination.jsx";
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export default function FaqsTable({
  tab,
  filtered,
  query,
  setQuery,
  pagination,
  faqs,
  handleMove,
  handleToggleActive,
  openEdit,
  handleDelete,
}) {
  const { t } = useI18n();
  return (
    <div className="table-card">
      <div className="table-card-header">
        {tab === "All" ? t("All FAQs") : t("{value0} FAQs", { value0: t(tab) })}
        <span className="count-pill">{filtered.length}</span>

        <div className="search-box users-search">
          <input
            placeholder={t("Search FAQs")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: "90px" }}>{t("Order")}</th>
            <th>{t("Question")}</th>
            <th>{t("Answer")}</th>
            <th>{t("Status")}</th>
            <th>{t("Actions")}</th>
          </tr>
        </thead>

        <tbody>
          {pagination.pageItems.map((f) => {
            const fullIndex = faqs.findIndex((x) => x.id === f.id);

            return (
              <tr key={f.id}>
                <td>
                  <div className="order-cell">
                    <span className="order-number">{f.order}</span>
                    <div className="order-arrows">
                      <button
                        onClick={() => handleMove(f, -1)}
                        disabled={fullIndex === 0}
                        title={t("Move up")}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMove(f, 1)}
                        disabled={fullIndex === faqs.length - 1}
                        title={t("Move down")}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                </td>

                <td className="faq-question">{f.question}</td>

                <td className="faq-answer">{f.answer}</td>

                <td>
                  <button
                    className={`toggle ${f.active ? "on" : ""}`}
                    onClick={() => handleToggleActive(f)}
                    title={
                      f.active ? t("Click to hide") : t("Click to publish")
                    }
                  >
                    <span className="toggle-knob" />
                  </button>
                </td>

                <td>
                  <div className="row-actions">
                    <button onClick={() => openEdit(f)} title={t("Edit FAQ")}>
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      title={t("Delete FAQ")}
                      className="danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="table-empty">
                {t("No FAQs match this filter.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  );
}
