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

    if (editing === "new") {
      const created = await createLocation(form);
      setLocations((prev) => [...prev, created]);
    } else {
      const updated = await updateLocation(editing.id, form);
      setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    }

    closeModal();
  };

  const handleDelete = async (loc) => {
    if (!(await confirm(`Are you sure you want to delete "${loc.name}"?`, { danger: true, confirmLabel: "Delete" }))) return;
    await deleteLocation(loc.id);
    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
  };

  const handleToggleActive = async (loc) => {
    const updated = await updateLocation(loc.id, { active: !loc.active });
    setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Locations</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={openNew}>
            <Plus size={16} strokeWidth={2.5} />
            Add Location
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total locations</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{locations.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Cities covered</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{cityCount}</span>
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            className={`pill-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {tab === "All" ? "All Locations" : `${tab} Locations`}
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box" style={{ marginLeft: "auto" }}>
            <input
              placeholder="Search locations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "none", width: "160px" }}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((l) => (
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
                    title={l.active ? "Click to deactivate" : "Click to activate"}
                  >
                    <span className="toggle-knob" />
                  </button>
                </td>

                <td>
                  <div className="row-actions">
                    <button onClick={() => openEdit(l)} title="Edit location">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(l)} title="Delete location" className="danger">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  {query ? "No locations match your search." : "No locations yet."}
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
                <h3>{editing === "new" ? "Add Location" : "Edit Location"}</h3>
                <button type="button" className="modal-close" onClick={closeModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ gap: "1rem", padding: "1.25rem 1.5rem" }}>
                <div className="form-field">
                  <label htmlFor="loc_name">Location Name</label>
                  <input
                    id="loc_name"
                    type="text"
                    placeholder="e.g. Rabat Agdal"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="loc_city">City</label>
                  <input
                    id="loc_city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="loc_country">Country</label>
                  <input
                    id="loc_country"
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                    required
                  />
                </div>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  />
                  Active (available as a pickup/dropoff point)
                </label>
              </div>

              <div className="modal-footer" style={{ gap: "0.6rem" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editing === "new" ? "Add Location" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}