import { useI18n } from "../../context/I18nContext";
import { useConfirm } from "../../context/Confirmcontext";
import DashboardAnalytics from "../../components/admin/dashboard/DashboardAnalytics.jsx";
import Pagination from "../../components/admin/pagination/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useState } from "react";
import { Search, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getVehicles, deleteVehicle } from "../../services/adminApi";

const dailyRate = (vehicle) => {
  const rate = Number(vehicle.dailyRate);
  return Number.isFinite(rate) && rate >= 0 ? rate : 0;
};

const TABLE_TABS = ["View all", "Available", "Maintenance", "Hidden"];

export default function AdminDashboard() {
  const confirm = useConfirm();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [tableTab, setTableTab] = useState("View all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getVehicles().then(setVehicles);
  }, []);

  const filtered = vehicles
      .filter((v) =>
        tableTab === "View all" ? true : v.status === tableTab.toLowerCase()
      )
      .filter((v) =>
        `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase())
      );

  const pagination = usePagination(filtered, JSON.stringify([tableTab, query]));

  const totalRate = vehicles.reduce((sum, vehicle) => sum + dailyRate(vehicle), 0);

  const handleEdit = (id) => {
    navigate(`/admin/vehicles/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!(await confirm(t("Delete this vehicle?"), { danger: true, confirmLabel: t("Delete") }))) return;

    await deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div>
      <DashboardAnalytics />
      <div className="dashboard-fleet">
      <div className="page-header">
        <h1>{t("Fleet overview")}</h1>
      </div>

      <div className="table-card">
        <div className="table-card-header">{t("Vehicles")}</div>
        <div className="table-toolbar">
          <div className="toolbar-tabs">
            {TABLE_TABS.map((tab) => (
              <button
                key={tab}
                className={`toolbar-tab ${tableTab === tab ? "active" : ""}`}
                onClick={() => setTableTab(tab)}
              >
                {t(tab)}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <div className="search-box">
              <Search size={14} />
              <input
                placeholder={t("Search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: "none", outline: "none", background: "none", width: "100px" }}
              />
              <kbd>{t("⌘K")}</kbd>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>{t("Vehicle")}</th>
              <th>{t("Daily rate")}</th>
              <th>{t("Share of fleet value")}</th>
              <th>{t("Category")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageItems.map((v) => {
              const share = totalRate > 0 ? Math.round((dailyRate(v) / totalRate) * 100) : 0;
              return (
                <tr key={v.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    {v.brand} {v.model}
                    <div style={{ marginTop: "0.2rem" }}>
                      <span className={`badge badge-${v.status}`}>{t(v.status)}</span>
                    </div>
                  </td>
                  <td>{v.dailyRate} {t("MAD")}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${share}%` }} />
                      </div>
                      {share}%
                    </div>
                  </td>
                  <td>
                    <span className="tag">
                      <span className="tag-dot" /> {t(v.category)}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => handleEdit(v.id)} title={t("Edit")}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} title={t("Delete")} className="danger">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#98a2b3", padding: "2rem" }}>
                  {t("No vehicles match this filter.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>
      </div>
    </div>
  );
}
