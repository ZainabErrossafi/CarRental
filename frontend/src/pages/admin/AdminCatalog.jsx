import CatalogItemDialog from "../../components/admin/catalog/CatalogItemDialog.jsx";
import CatalogTable from "../../components/admin/catalog/CatalogTable.jsx";
import {
  KINDS,
  EMPTY_FORMS,
  slugify,
} from "../../components/admin/catalog/catalogConfig.js";
import { useI18n } from "../../context/I18nContext";
import { useConfirm } from "../../context/Confirmcontext";

import usePagination from "../../hooks/usePagination.js";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  getCatalog,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "../../services/adminApi";

export default function AdminCatalog() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [catalog, setCatalog] = useState(null);
  const [tab, setTab] = useState("brands");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORMS.brands);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCatalog()
      .then(setCatalog)
      .catch((err) => setError(err.message));
  }, []);

  const items = catalog?.[tab] ?? [];

  const calculateFiltered = () => {
    const q = query.toLowerCase();
    return items.filter((i) =>
      `${i.name} ${i.slug ?? ""}`.toLowerCase().includes(q),
    );
  };
  const filtered = calculateFiltered();

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  if (!catalog)
    return error ? (
      <div role="alert" className="alert alert-error">
        {t(error)}
      </div>
    ) : (
      <p>{t("Loading...")}</p>
    );

  const meta = KINDS[tab];

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const switchTab = (next) => {
    setTab(next);
    setQuery("");
  };

  const openNew = () => {
    setForm(EMPTY_FORMS[tab]);
    setSlugTouched(false);
    setEditing("new");
  };

  const openEdit = (item) => {
    const { id, created_at, updated_at, order, ...editable } = item;
    setForm(editable);
    setSlugTouched(true);
    setEditing(item);
  };

  const closeModal = () => {
    setEditing(null);
    setSaving(false);
  };

  const handleNameChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, name: value };
      if (tab === "brands" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") {
        const created = await createCatalogItem(tab, form);
        setCatalog((prev) => ({ ...prev, [tab]: [...prev[tab], created] }));
      } else {
        const updated = await updateCatalogItem(tab, editing.id, form);
        setCatalog((prev) => ({
          ...prev,
          [tab]: prev[tab].map((i) => (i.id === updated.id ? updated : i)),
        }));
      }

      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !(await confirm(
        t('Are you sure you want to delete "{name}"?', { name: item.name }),
        { danger: true, confirmLabel: "Delete" },
      ))
    )
      return;
    try {
      await deleteCatalogItem(tab, item.id);
      setCatalog((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((i) => i.id !== item.id),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = await updateCatalogItem(tab, item.id, {
        active: !item.active,
      });
      setCatalog((prev) => ({
        ...prev,
        [tab]: prev[tab].map((i) => (i.id === updated.id ? updated : i)),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && (
        <div role="alert" className="alert alert-error">
          {t(error)}
        </div>
      )}
      <div className="page-header">
        <h1>{t("Vehicle Catalog")}</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={openNew}>
            <Plus size={16} strokeWidth={2.5} />
            {t("Add {value0}", { value0: t(meta.singular) })}
          </button>
        </div>
      </div>

      <div className="pill-tabs">
        {Object.entries(KINDS).map(([key, k]) => (
          <button
            key={key}
            className={`pill-tab ${tab === key ? "active" : ""}`}
            onClick={() => switchTab(key)}
          >
            {t(k.label)}
            <span className="tab-count">{catalog[key].length}</span>
          </button>
        ))}
      </div>

      <CatalogTable
        tab={tab}
        meta={meta}
        filtered={filtered}
        query={query}
        setQuery={setQuery}
        pagination={pagination}
        handleToggleActive={handleToggleActive}
        openEdit={openEdit}
        handleDelete={handleDelete}
      />

      {editing && (
        <CatalogItemDialog
          editing={editing}
          tab={tab}
          meta={meta}
          form={form}
          saving={saving}
          error={error}
          closeModal={closeModal}
          handleSave={handleSave}
          setField={setField}
          handleNameChange={handleNameChange}
          setSlugTouched={setSlugTouched}
        />
      )}
    </div>
  );
}
