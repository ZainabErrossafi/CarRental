import LocationsTable from "../../components/admin/locations/LocationsTable.jsx";
import LocationFormDialog from "../../components/admin/locations/LocationFormDialog.jsx";
import { useI18n } from "../../context/I18nContext";
import { useConfirm } from "../../context/Confirmcontext";

import usePagination from "../../hooks/usePagination.js";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../services/adminApi";

const STATUS_TABS = ["All", "Active", "Inactive"];

const EMPTY_LOCATION = { name: "", city: "", country: "Morocco", active: true };

export default function AdminLocations() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [locations, setLocations] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_LOCATION);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  const filtered = locations
    .filter((l) => {
      if (tab === "Active") return l.active;
      if (tab === "Inactive") return !l.active;
      return true;
    })
    .filter((l) =>
      `${l.name} ${l.city} ${l.country}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  const activeCount = locations.filter((l) => l.active).length;
  const cityCount = new Set(locations.map((l) => l.city)).size;

  const openNew = () => {
    setForm(EMPTY_LOCATION);
    setEditing("new");
  };

  const openEdit = (loc) => {
    setForm({
      name: loc.name,
      city: loc.city,
      country: loc.country,
      active: loc.active,
    });
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
        setLocations((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l)),
        );
      }
      closeModal();
    } catch (err) {
      setSaving(false);
    }
  };

  const handleDelete = async (loc) => {
    if (
      !(await confirm(
        t('Are you sure you want to delete "{name}"?', { name: loc.name }),
        { danger: true, confirmLabel: "Delete" },
      ))
    )
      return;
    await deleteLocation(loc.id);
    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
  };

  const handleToggleActive = async (loc) => {
    const updated = await updateLocation(loc.id, { active: !loc.active });
    setLocations((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l)),
    );
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

      <LocationsTable
        tab={tab}
        filtered={filtered}
        query={query}
        setQuery={setQuery}
        pagination={pagination}
        handleToggleActive={handleToggleActive}
        openEdit={openEdit}
        handleDelete={handleDelete}
      />

      {editing && (
        <LocationFormDialog
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
