import { useI18n } from "../../../context/I18nContext";
import Pagination from "../pagination/Pagination.jsx";
import { Pencil, Trash2, MapPin } from "lucide-react";

export default function LocationsTable({
  tab,
  filtered,
  query,
  setQuery,
  pagination,
  handleToggleActive,
  openEdit,
  handleDelete,
}) {
  const { t } = useI18n();
  return (
    <div className="table-card">
      <div className="table-card-header">
        {tab === "All"
          ? t("All Locations")
          : t("{value0} Locations", { value0: t(tab) })}
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
                  title={
                    l.active ? t("Click to deactivate") : t("Click to activate")
                  }
                >
                  <span className="toggle-knob" />
                </button>
              </td>

              <td>
                <div className="row-actions">
                  <button
                    onClick={() => openEdit(l)}
                    title={t("Edit location")}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(l)}
                    title={t("Delete location")}
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
              <td colSpan={5} className="table-empty">
                {query
                  ? t("No locations match your search.")
                  : t("No locations yet.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  );
}
