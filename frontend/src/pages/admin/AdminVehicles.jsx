import { useI18n } from "../../context/I18nContext";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Archive, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getVehicles,
  deleteVehicle,
  updateVehicleStatus,
} from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

export default function AdminVehicles() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return vehicles.filter((vehicle) =>
      [vehicle.brand, vehicle.model, vehicle.year, vehicle.category, vehicle.status, t(vehicle.category), t(vehicle.status)]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [vehicles, query, t]);
  const pagination = usePagination(filtered, query);

  useEffect(() => {
    getVehicles().then(setVehicles);
  }, []);

  const handleDelete = async (id) => {
    if (!(await confirm("Delete this vehicle?", { danger: true, confirmLabel: "Delete" }))) return;

    await deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleEdit = (id) => {
    navigate(`/admin/vehicles/${id}/edit`);
  };

  const handleAdd = () => {
    navigate("/admin/vehicles/new");
  };

  const handleArchive = (id) => {
    console.log("Archive vehicle:", id);
  };

  const handleStatusChange = async (id, status) => {
    await updateVehicleStatus(id, status);

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status } : v
      )
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t("Vehicles")}</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={handleAdd}>
            <Plus size={16} strokeWidth={2.5} />
            {t("Add Vehicle")}
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header vehicles-list-header">
          {t("All Vehicles")}
          <span className="count-pill">{filtered.length}</span>
          <div className="search-box users-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              aria-label={t("Search vehicles")}
              placeholder={t("Search vehicles")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>{t("Brand / Model")}</th>
              <th>{t("Year")}</th>
              <th>{t("Category")}</th>
              <th>{t("Daily Rate")}</th>
              <th>{t("Status")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>

          <tbody>
            {pagination.pageItems.map((v) => (
              <tr key={v.id}>
                <td>{v.brand} {v.model}</td>
                <td>{v.year}</td>
                <td>{t(v.category)}</td>
                <td>{v.dailyRate} {t("MAD")}</td>

                <td>
                  <select
                    className="status-select"
                    data-status={v.status}
                    value={v.status}
                    onChange={(e) => handleStatusChange(v.id, e.target.value)}
                  >
                    <option value="available">{t("Available")}</option>
                    <option value="maintenance">{t("Maintenance")}</option>
                    <option value="hidden">{t("Hidden")}</option>
                  </select>
                </td>

                <td>
                  <div className="row-actions">
                    <button onClick={() => handleEdit(v.id)} title={t("Edit Vehicle")}>
                      <Pencil size={15} />
                    </button>

                    <button onClick={() => handleArchive(v.id)} title={t("Archive Vehicle")}>
                      <Archive size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      title={t("Delete Vehicle")}
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
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  {query.trim() ? t("No vehicles match your search.") : t("No vehicles yet.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>
    </div>
  );
}