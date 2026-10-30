import { useI18n } from "../../../context/I18nContext";
import { X } from "lucide-react";

export default function FaqFormDialog({
  closeModal,
  handleSave,
  isNew,
  form,
  setForm,
  saving,
}) {
  const { t } = useI18n();
  return (
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
            <button
              type="button"
              className="modal-close"
              onClick={closeModal}
              aria-label={t("Close")}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body catalog-dialog-body">
            <div className="form-field">
              <label className="catalog-field-label" htmlFor="faq_question">
                {t("Question")}
              </label>
              <input
                id="faq_question"
                type="text"
                placeholder={t("e.g. Can I extend my rental?")}
                value={form.question}
                onChange={(e) =>
                  setForm((p) => ({ ...p, question: e.target.value }))
                }
                autoFocus
                required
              />
            </div>

            <div className="form-field">
              <label className="catalog-field-label" htmlFor="faq_answer">
                {t("Answer")}
              </label>
              <textarea
                id="faq_answer"
                className="form-textarea"
                rows={5}
                placeholder={t("Write a clear, helpful answer...")}
                value={form.answer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, answer: e.target.value }))
                }
                required
              />
              <span className="field-hint">
                {t("Keep it short and easy to scan.")}
              </span>
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, active: e.target.checked }))
                }
              />
              <span className="vehicle-featured-switch" aria-hidden="true" />
            </label>
          </div>

          <div className="modal-footer" style={{ gap: "0.6rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={saving}
            >
              {t("Cancel")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? t("Saving...")
                : isNew
                  ? t("Add FAQ")
                  : t("Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
