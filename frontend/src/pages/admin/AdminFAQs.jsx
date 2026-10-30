import FaqsTable from "../../components/admin/faqs/FaqsTable.jsx";
import FaqFormDialog from "../../components/admin/faqs/FaqFormDialog.jsx";
import { useI18n } from "../../context/I18nContext";
import { useConfirm } from "../../context/Confirmcontext";

import usePagination from "../../hooks/usePagination.js";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  swapFaqOrder,
} from "../../services/adminApi";

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

  const filtered = faqs
    .filter((f) => {
      if (tab === "Active") return f.active;
      if (tab === "Hidden") return !f.active;
      return true;
    })
    .filter((f) =>
      `${f.question} ${f.answer}`.toLowerCase().includes(query.toLowerCase()),
    );

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
    if (
      !(await confirm("Are you sure you want to delete this FAQ?", {
        danger: true,
        confirmLabel: "Delete",
      }))
    )
      return;
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

      <FaqsTable
        tab={tab}
        filtered={filtered}
        query={query}
        setQuery={setQuery}
        pagination={pagination}
        faqs={faqs}
        handleMove={handleMove}
        handleToggleActive={handleToggleActive}
        openEdit={openEdit}
        handleDelete={handleDelete}
      />

      {editing && (
        <FaqFormDialog
          closeModal={closeModal}
          handleSave={handleSave}
          isNew={isNew}
          form={form}
          setForm={setForm}
          saving={saving}
        />
      )}
    </div>
  );
}
