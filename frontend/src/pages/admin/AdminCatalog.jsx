import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Car,
  Truck,
  Gem,
  Snowflake,
  Navigation,
  Bluetooth,
  Baby,
  UserPlus,
  Fuel,
  Gauge,
  Users,
  Briefcase,
  ShieldCheck,
  Wifi,
  Sun,
  Music,
  Zap,
  KeyRound,
  MapPin,
  Tag,
} from "lucide-react";
import {
  getCatalog,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "../../services/adminApi";

// The `icon` field on Category / Feature / Extra stores one of these keys.
const ICONS = {
  car: Car,
  truck: Truck,
  gem: Gem,
  snowflake: Snowflake,
  navigation: Navigation,
  bluetooth: Bluetooth,
  baby: Baby,
  userplus: UserPlus,
  fuel: Fuel,
  gauge: Gauge,
  users: Users,
  briefcase: Briefcase,
  shield: ShieldCheck,
  wifi: Wifi,
  sun: Sun,
  music: Music,
  zap: Zap,
  key: KeyRound,
  pin: MapPin,
  tag: Tag,
};

// Categories only offer these three icons (Economy / SUV / Luxury style).
const CATEGORY_ICON_KEYS = ["car", "truck", "gem"];

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
  const [catalog, setCatalog] = useState(null);
  const [tab, setTab] = useState("brands");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | item
  const [form, setForm] = useState(EMPTY_FORMS.brands);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCatalog().then(setCatalog);
  }, []);

  const items = catalog?.[tab] ?? [];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((i) =>
      `${i.name} ${i.slug ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  if (!catalog) return <p>Loading...</p>;

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
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    await deleteCatalogItem(tab, item.id);
    setCatalog((prev) => ({ ...prev, [tab]: prev[tab].filter((i) => i.id !== item.id) }));
  };

  const handleToggleActive = async (item) => {
    const updated = await updateCatalogItem(tab, item.id, { active: !item.active });
    setCatalog((prev) => ({
      ...prev,
      [tab]: prev[tab].map((i) => (i.id === updated.id ? updated : i)),
    }));
  };

  const colCount = { brands: 3, categories: 4, features: 2, extras: 6 }[tab];

  return (
    <div>
      <div className="page-header">
        <h1>Vehicle Catalog</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={openNew}>
            <Plus size={16} strokeWidth={2.5} />
            Add {meta.singular}
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
            {k.label}
            <span className="tab-count">{catalog[key].length}</span>
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {meta.label}
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box" style={{ marginLeft: "auto" }}>
            <Search size={14} />
            <input
              placeholder={`Search ${meta.label.toLowerCase()}`}
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
                  <th>Name</th>
                  <th>Slug</th>
                </>
              )}
              {tab === "categories" && (
                <>
                  <th style={{ width: "60px" }}>Order</th>
                  <th>Name</th>
                  <th>Status</th>
                </>
              )}
              {tab === "features" && (
                <>
                  <th>Name</th>
                </>
              )}
              {tab === "extras" && (
                <>
                  <th>Name</th>
                  <th>Price / day</th>
                  <th>Flat price</th>
                  <th>Max qty</th>
                  <th>Status</th>
                </>
              )}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
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
                    <td>{item.price_per_day ? `${item.price_per_day} MAD` : "—"}</td>
                    <td>{item.flat_price ? `${item.flat_price} MAD` : "—"}</td>
                    <td>{item.max_qty}</td>
                    <td><ActiveToggle item={item} onToggle={handleToggleActive} /></td>
                  </>
                )}

                <td>
                  <div className="row-actions">
                    <button onClick={() => openEdit(item)} title={`Edit ${meta.singular.toLowerCase()}`}>
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title={`Delete ${meta.singular.toLowerCase()}`}
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
                  {query ? `No ${meta.label.toLowerCase()} match your search.` : `No ${meta.label.toLowerCase()} yet.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card modal-wide" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <h3>{editing === "new" ? `Add ${meta.singular}` : `Edit ${meta.singular}`}</h3>
                <button type="button" className="modal-close" onClick={closeModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ gap: "1rem", padding: "1.25rem 1.5rem" }}>
                {tab !== "brands" && (
                  <div className="form-field">
                    <label>Icon</label>
                    <div className="icon-picker">
                      {Object.entries(ICONS)
                        .filter(([key]) => tab !== "categories" || CATEGORY_ICON_KEYS.includes(key))
                        .map(([key, Icon]) => (
                          <button
                            type="button"
                            key={key}
                            title={key}
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
                    {tab === "brands" ? "Name" : "Name"}
                  </label>
                  <input
                    id="c_name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                {tab === "brands" && (
                  <div className="form-field">
                    <label htmlFor="c_slug">Slug</label>
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
                    <span className="field-hint">Used in URLs, e.g. /brands/{form.slug || "toyota"}</span>
                  </div>
                )}

                {tab === "extras" && (
                  <div className="form-grid" style={{ marginTop: 0, maxWidth: "none" }}>
                    <div className="form-field">
                      <label htmlFor="c_ppd">Price per day</label>
                      <div className="input-group">
                        <input
                          id="c_ppd"
                          type="number"
                          min="0"
                          step="5"
                          value={form.price_per_day}
                          onChange={(e) => setField("price_per_day", Number(e.target.value))}
                        />
                        <span className="input-suffix">MAD/day</span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="c_flat">Flat price</label>
                      <div className="input-group">
                        <input
                          id="c_flat"
                          type="number"
                          min="0"
                          step="5"
                          value={form.flat_price}
                          onChange={(e) => setField("flat_price", Number(e.target.value))}
                        />
                        <span className="input-suffix">MAD</span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="c_max">Max quantity</label>
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
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setField("active", e.target.checked)}
                    />
                    Active (available on the public site)
                  </label>
                )}
              </div>

              <div className="modal-footer" style={{ gap: "0.6rem" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editing === "new" ? `Add ${meta.singular}` : "Save Changes"}
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
  return (
    <button
      className={`toggle ${item.active ? "on" : ""}`}
      onClick={() => onToggle(item)}
      title={item.active ? "Click to deactivate" : "Click to activate"}
    >
      <span className="toggle-knob" />
    </button>
  );
}