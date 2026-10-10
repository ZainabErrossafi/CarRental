import { useI18n } from "../../context/I18nContext";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, MapPin } from "lucide-react";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

const STATUS_TABS = ["All", "Active", "Inactive"];

const EMPTY_LOCATION = { name: "", city: "", country: "Morocco", active: true };

export default function AdminLocations() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [locations, setLocations] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | location
  const [form, setForm] = useState(EMPTY_LOCATION);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  const filtered = useMemo(() => {
    return locations
      .filter((l) => {
        if (tab === "Active") return l.active;
        if (tab === "Inactive") return !l.active;
        return true;
      })
      .filter((l) =>
        `${l.name} ${l.city} ${l.country}`.toLowerCase().includes(query.toLowerCase())
      );
  }, [locations, tab, query]);

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  const activeCount = locations.filter((l) => l.active).length;
  const cityCount = new Set(locations.map((l) => l.city)).size;

  const openNew = () => {
    setForm(EMPTY_LOCATION);
    setEditing("new");
  };

  const openEdit = (loc) => {
    setForm({ name: loc.name, city: loc.city, country: loc.country, active: loc.active });
    setEditing(loc);
  };

  const closeModal = () => {
    setEditing(null);
    setSaving(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing === "new") {
        const created = await createLocation(form);
        setLocations((prev) => [...prev, created]);
      } else {
        const updated = await updateLocation(editing.id, form);
        setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      }
      closeModal();
    } catch (err) {
      setSaving(false);
    }
  };

  const handleDelete = async (loc) => {
    if (!(await confirm(t('Are you sure you want to delete "{name}"?', { name: loc.name }), { danger: true, confirmLabel: "Delete" }))) return;
    await deleteLocation(loc.id);
    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
  };

  const handleToggleActive = async (loc) => {
    const updated = await updateLocation(loc.id, { active: !loc.active });
    setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const isNew = editing === "new";

  return (
    <div>
      <div className="page-header">
        <h1>{t("Locations")}</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={openNew}>
            <Plus size={16} strokeWidth={2.5} />
            {t("Add Location")}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Total locations")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{locations.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Active")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Cities covered")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{cityCount}</span>
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
          {tab === "All" ? t("All Locations") : t("{value0} Locations", { value0: t(tab) })}
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box users-search">
            <input
              placeholder={t("Search locations")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>{t("Name")}</th>
              <th>{t("City")}</th>
              <th>{t("Country")}</th>
              <th>{t("Status")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>

          <tbody>
            {pagination.pageItems.map((l) => (
              <tr key={l.id}>
                <td>
                  <div className="name-cell">
                    <span className="icon-badge">
                      <MapPin size={16} />
                    </span>
                    <strong>{l.name}</strong>
                  </div>
                </td>

                <td>{l.city}</td>
                <td>{l.country}</td>

                <td>
                  <button
                    className={`toggle ${l.active ? "on" : ""}`}
                    onClick={() => handleToggleActive(l)}
                    title={l.active ? t("Click to deactivate") : t("Click to activate")}
                  >
                    <span className="toggle-knob" />
                  </button>
                </td>

                <td>
                  <div className="row-actions">
                    <button onClick={() => openEdit(l)} title={t("Edit location")}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(l)} title={t("Delete location")} className="danger">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="table-empty">
                  {query ? t("No locations match your search.") : t("No locations yet.")}
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
                  <h3>{isNew ? t("Add Location") : t("Edit Location")}</h3>
                  <p>{t("Set up a pickup or dropoff point customers can choose when booking.")}</p>
                </div>
                <button type="button" className="modal-close" onClick={closeModal} aria-label={t("Close")}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body catalog-dialog-body">
                <div className="form-field">
                  <label className="catalog-field-label" htmlFor="loc_name">{t("Name")}</label>
                  <input
                    id="loc_name"
                    type="text"
                    placeholder={t("e.g. Rabat Agdal")}
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    autoFocus
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="catalog-field-label" htmlFor="loc_city">{t("City")}</label>
                  <input
                    id="loc_city"
                    type="text"
                    placeholder={t("e.g. Rabat")}
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="catalog-field-label" htmlFor="loc_country">{t("Country")}</label>
                  <input
                    id="loc_country"
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                    required 
                  />
                </div>

                <label className="vehicle-featured-control">
                  <span className="vehicle-featured-copy">
                    <span className="vehicle-featured-title">{t("Active")}</span>
                    <span className="field-hint"> {t("Available as a pickup and dropoff point.")}
                    </span>
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
              </div>

              <div className="modal-footer" style={{ gap: "0.6rem" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                  {t("Cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t("Saving...") : isNew ? t("Add Location") : t("Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}