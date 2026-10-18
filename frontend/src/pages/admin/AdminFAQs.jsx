import { useI18n } from "../../context/I18nContext";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  swapFaqOrder,
} from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

const STATUS_TABS = ["All", "Active", "Hidden"];

const EMPTY_FAQ = { question: "", answer: "", active: true };

export default function AdminFaqs() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [faqs, setFaqs] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); 
  const [form, setForm] = useState(EMPTY_FAQ);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFaqs().then(setFaqs);
  }, []);

  const filtered = useMemo(() => {
    return faqs
      .filter((f) => {
        if (tab === "Active") return f.active;
        if (tab === "Hidden") return !f.active;
        return true;
      })
      .filter((f) =>
        `${f.question} ${f.answer}`.toLowerCase().includes(query.toLowerCase())
      );
  }, [faqs, tab, query]);

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  const activeCount = faqs.filter((f) => f.active).length;
  const isNew = editing === "new";

  const openNew = () => {
    setForm(EMPTY_FAQ);
    setEditing("new");
  };

  const openEdit = (faq) => {
    setForm({ question: faq.question, answer: faq.answer, active: faq.active });
    setEditing(faq);
  };

  const closeModal = () => {
    setEditing(null);
    setSaving(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isNew) {
        const created = await createFaq(form);
        setFaqs((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      } else {
        const updated = await updateFaq(editing.id, form);
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      }
      closeModal();
    } catch (err) {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm("Are you sure you want to delete this FAQ?", { danger: true, confirmLabel: "Delete" }))) return;
    await deleteFaq(id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleToggleActive = async (faq) => {
    const updated = await updateFaq(faq.id, { active: !faq.active });
    setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  // Move up/down relative to the *full* ordered list (not the filtered view),
  // so reordering stays correct even while a filter/search is active.
  const handleMove = async (faq, direction) => {
    const index = faqs.findIndex((f) => f.id === faq.id);
    const neighbor = faqs[index + direction];
    if (!neighbor) return;

    const reordered = await swapFaqOrder(faq.id, neighbor.id);
    setFaqs(reordered);
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t("FAQs")}</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={openNew}>
            <Plus size={16} strokeWidth={2.5} />
            {t("Add FAQ")}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Total FAQs")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{faqs.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Published")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Hidden")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{faqs.length - activeCount}</span>
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {STATUS_TABS.map((tabLabel) => (
          <button
            key={tabLabel}
            className={`pill-tab ${tab === tabLabel ? "active" : ""}`}
            onClick={() => setTab(tabLabel)}
          >
            {t(tabLabel)}
          </button>
        ))}
      </div>

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
                      title={f.active ? t("Click to hide") : t("Click to publish")}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </td>

                  <td>
                    <div className="row-actions">
                      <button onClick={() => openEdit(f)} title={t("Edit FAQ")}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(f.id)} title={t("Delete FAQ")} className="danger">
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

      {editing && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card modal-wide catalog-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <div className="catalog-dialog-heading">
                  <h3>{isNew ? t("Add FAQ") : t("Edit FAQ")}</h3>
                  <p>{t("Answer the questions your customers ask most often.")}</p>
                </div>
                <button type="button" className="modal-close" onClick={closeModal} aria-label={t("Close")}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body catalog-dialog-body">
                <div className="form-field">
                  <label className="catalog-field-label" htmlFor="faq_question">{t("Question")}</label>
                  <input
                    id="faq_question"
                    type="text"
                    placeholder={t("e.g. Can I extend my rental?")}
                    value={form.question}
                    onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                    autoFocus
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="catalog-field-label" htmlFor="faq_answer">{t("Answer")}</label>
                  <textarea
                    id="faq_answer"
                    className="form-textarea"
                    rows={5}
                    placeholder={t("Write a clear, helpful answer...")}
                    value={form.answer}
                    onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                    required
                  />
                  <span className="field-hint">{t("Keep it short and easy to scan.")}</span>
                </div>

                <label className="vehicle-featured-control">
                  <span className="vehicle-featured-copy">
                    <span className="vehicle-featured-title">{t("Published")}</span>
                    <span className="field-hint" id="faq-active-hint">
                      {t("Show this FAQ on the public site.")}
                    </span>
                  </span>
                  <input
                    className="vehicle-featured-input"
                    type="checkbox"
                    role="switch"
                    aria-describedby="faq-active-hint"
                    checked={!!form.active}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  />
                  <span className="vehicle-featured-switch" aria-hidden="true" />
                </label>
              </div>

              <div className="modal-footer" style={{ gap: "0.6rem" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                  {t("Cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t("Saving...") : isNew ? t("Add FAQ") : t("Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}