import { useI18n } from "../../context/I18nContext";
import { useConfirm } from "../../context/Confirmcontext";
import { CATALOG_ICONS as ICONS } from "../../components/CatalogIcons.jsx";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Tag,
} from "lucide-react";
import {
  getCatalog,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "../../services/adminApi";



// The `icon` field on Category / Feature / Extra stores one of these keys.


const ICON_LABELS = {
  car: "Car", sportscar: "Sports car", truck: "Truck", gem: "Luxury",
  snowflake: "Air conditioning", navigation: "Navigation", bluetooth: "Bluetooth",
  baby: "Child seat", userplus: "Additional driver", fuel: "Fuel", gauge: "Mileage",
  users: "Passengers", briefcase: "Luggage", shield: "Insurance", wifi: "Wi-Fi",
  sun: "Sunroof", music: "Audio", zap: "Electric", key: "Key", pin: "Location", tag: "Tag",
};

// Categories only offer these three icons (Economy / SUV / Luxury style).
const CATEGORY_ICON_KEYS = ["car", "truck", "sportscar"];

const KINDS = {
  brands: { label: "Brands", singular: "Brand" },
  categories: { label: "Categories", singular: "Category" },
  features: { label: "Features", singular: "Feature" },
  extras: { label: "Extras", singular: "Extra" },
};

const EMPTY_FORMS = {
  brands: { name: "", slug: "" },
  categories: { icon: "car", name: "", active: true },
  features: { icon: "tag", name: "" },
  extras: { icon: "tag", name: "", price_per_day: 0, flat_price: 0, max_qty: 1, active: true },
};

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function IconBadge({ name }) {
  const Icon = ICONS[name] || Tag;
  return (
    <span className="icon-badge">
      <Icon size={16} />
    </span>
  );
}

export default function AdminCatalog() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [catalog, setCatalog] = useState(null);
  const [tab, setTab] = useState("brands");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | item
  const [form, setForm] = useState(EMPTY_FORMS.brands);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCatalog().then(setCatalog).catch((err) => setError(err.message));
  }, []);

  const items = catalog?.[tab] ?? [];

  const calculateFiltered = () => {
    const q = query.toLowerCase();
    return items.filter((i) =>
      `${i.name} ${i.slug ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  };
  const filtered = calculateFiltered();

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  if (!catalog) return error ? <div role="alert" className="alert alert-error">{t(error)}</div> : <p>{t("Loading...")}</p>;

  const meta = KINDS[tab];

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

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
    if (!(await confirm(t('Are you sure you want to delete "{name}"?', { name: item.name }), { danger: true, confirmLabel: "Delete" }))) return;
    try {
    await deleteCatalogItem(tab, item.id);
    setCatalog((prev) => ({ ...prev, [tab]: prev[tab].filter((i) => i.id !== item.id) }));
    } catch (err) { setError(err.message); }
  };

  const handleToggleActive = async (item) => {
    try {
    const updated = await updateCatalogItem(tab, item.id, { active: !item.active });
    setCatalog((prev) => ({
      ...prev,
      [tab]: prev[tab].map((i) => (i.id === updated.id ? updated : i)),
    }));
    } catch (err) { setError(err.message); }
  };

  const colCount = { brands: 3, categories: 4, features: 2, extras: 6 }[tab];

  return (
    <div>
      {error && <div role="alert" className="alert alert-error">{t(error)}</div>}
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

      <div className="table-card">
        <div className="table-card-header">
          {t(meta.label)}
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box" style={{ marginInlineStart: "auto" }}>
            <Search size={14} />
            <input
              placeholder={t("Search {value0}", { value0: t(meta.label).toLowerCase() })}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "none", width: "140px" }}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              {tab === "brands" && (
                <>
                  <th>{t("Name")}</th>
                  <th>{t("Slug")}</th>
                </>
              )}
              {tab === "categories" && (
                <>
                  <th style={{ width: "60px" }}>{t("Order")}</th>
                  <th>{t("Name")}</th>
                  <th>{t("Status")}</th>
                </>
              )}
              {tab === "features" && (
                <>
                  <th>{t("Name")}</th>
                </>
              )}
              {tab === "extras" && (
                <>
                  <th>{t("Name")}</th>
                  <th>{t("Price / day")}</th>
                  <th>{t("Flat price")}</th>
                  <th>{t("Max qty")}</th>
                  <th>{t("Status")}</th>
                </>
              )}
              <th>{t("Actions")}</th>
            </tr>
          </thead>

          <tbody>
            {pagination.pageItems.map((item) => (
              <tr key={item.id}>
                {tab === "brands" && (
                  <>
                    <td><strong>{item.name}</strong></td>
                    <td><code className="slug">{item.slug}</code></td>
                  </>
                )}

                {tab === "categories" && (
                  <>
                    <td>{item.order}</td>
                    <td>
                      <div className="name-cell">
                        <IconBadge name={item.icon} />
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td><ActiveToggle item={item} onToggle={handleToggleActive} /></td>
                  </>
                )}

                {tab === "features" && (
                  <>
                    <td>
                      <div className="name-cell">
                        <IconBadge name={item.icon} />
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                  </>
                )}

                {tab === "extras" && (
                  <>
                    <td>
                      <div className="name-cell">
                        <IconBadge name={item.icon} />
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>{item.price_per_day ? t("{value0} MAD", { value0: item.price_per_day }) : "—"}</td>
                    <td>{item.flat_price ? t("{value0} MAD", { value0: item.flat_price }) : "—"}</td>
                    <td>{item.max_qty}</td>
                    <td><ActiveToggle item={item} onToggle={handleToggleActive} /></td>
                  </>
                )}

                <td>
                  <div className="row-actions">
                    <button onClick={() => openEdit(item)} title={t("Edit {value0}", { value0: t(meta.singular).toLowerCase() })}>
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title={t("Delete {value0}", { value0: t(meta.singular).toLowerCase() })}
                      className="danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={colCount} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  {query ? t("No {value0} match your search.", { value0: t(meta.label).toLowerCase() }) : t("No {value0} yet.", { value0: t(meta.label).toLowerCase() })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>

      {editing && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card modal-wide catalog-dialog vehicle-details-card"
            role="dialog" aria-modal="true" aria-labelledby="catalog-dialog-title" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <div className="catalog-dialog-heading">
                  <h3 id="catalog-dialog-title">{editing === "new" ? t("Add {value0}", { value0: t(meta.singular) }) : t("Edit {value0}", { value0: t(meta.singular) })}</h3>
                  <p>{t("Organize your fleet catalog with clear, consistent details.")}</p>
                </div>
                <button type="button" className="modal-close" aria-label={t("Close dialog")} onClick={closeModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body catalog-dialog-body">
                {error && <div role="alert" className="alert alert-error">{t(error)}</div>}
                {tab !== "brands" && (
                  <div className="form-field">
                    <span className="catalog-field-label" id="catalog-icon-label">{t("Choose an icon")}</span>
                    <div className="icon-picker" role="group" aria-labelledby="catalog-icon-label">
                      {Object.entries(ICONS)
                        .filter(([key]) => tab !== "categories" || CATEGORY_ICON_KEYS.includes(key))
                        .map(([key, Icon]) => (
                          <button
                            type="button"
                            key={key}
                            title={t(ICON_LABELS[key])}
                            aria-label={t(ICON_LABELS[key])}
                            aria-pressed={form.icon === key}
                            className={form.icon === key ? "selected" : ""}
                            onClick={() => setField("icon", key)}
                          >
                            <Icon size={18} />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="c_name">
                    {t("Name")}
                  </label>
                  <input
                    id="c_name"
                    placeholder={tab === "brands" ? t("e.g. Toyota") : tab === "categories" ? t("e.g. Economy") : tab === "extras" ? t("e.g. Child seat") : t("e.g. Bluetooth")}
                    autoFocus
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                {tab === "brands" && (
                  <div className="form-field">
                    <label htmlFor="c_slug">{t("Slug")}</label>
                    <input
                      id="c_slug"
                      type="text"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setField("slug", slugify(e.target.value));
                      }}
                      required
                    />
                    <span className="field-hint">{t("URL-friendly name, e.g.")} {form.slug || t("toyota")}</span>
                  </div>
                )}

                {tab === "extras" && (
                  <div className="form-grid catalog-pricing-grid">
                    <div className="form-field">
                      <label htmlFor="c_ppd">{t("Price per day")}</label>
                      <div className="input-group">
                        <input
                          id="c_ppd"
                          type="number"
                          min="0"
                          step="5"
                          value={form.price_per_day}
                          onChange={(e) => setField("price_per_day", Number(e.target.value))}
                        />
                        <span className="input-suffix">{t("MAD/day")}</span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="c_flat">{t("Flat price")}</label>
                      <div className="input-group">
                        <input
                          id="c_flat"
                          type="number"
                          min="0"
                          step="5"
                          value={form.flat_price}
                          onChange={(e) => setField("flat_price", Number(e.target.value))}
                        />
                        <span className="input-suffix">{t("MAD")}</span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="c_max">{t("Max quantity")}</label>
                      <input
                        id="c_max"
                        type="number"
                        min="1"
                        value={form.max_qty}
                        onChange={(e) => setField("max_qty", Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {(tab === "categories" || tab === "extras") && (
                  <label className="vehicle-featured-control">
                    <span className="vehicle-featured-copy">
                      <span className="vehicle-featured-title">{t("Active")}</span>
                      <span className="field-hint">{t("Active")}</span>
                    </span>
                    <input
                      className="vehicle-featured-input"
                      type="checkbox"
                      role="switch"
                      checked={!!form.active}
                      onChange={(e) => setField("active", e.target.checked)}
                    />
                    <span className="vehicle-featured-switch" aria-hidden="true" />
                  </label>
                )}
              </div>

              <div className="modal-footer" style={{ gap: "0.6rem" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                  {t("Cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t("Saving...") : editing === "new" ? t("Add {value0}", { value0: t(meta.singular) }) : t("Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveToggle({ item, onToggle }) {
  const { t } = useI18n();
  return (
    <button
      className={`toggle ${item.active ? "on" : ""}`}
      onClick={() => onToggle(item)}
      title={item.active ? t("Click to deactivate") : t("Click to activate")}
    >
      <span className="toggle-knob" />
    </button>
  );
}