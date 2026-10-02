import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Download, RefreshCw, Search, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getVehicles, deleteVehicle } from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

const TABLE_TABS = ["View all", "Available", "Maintenance", "Hidden"];

const SPARK_A = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14];
const SPARK_B = [9, 7, 10, 8, 12, 9, 13, 10, 15, 13];
const SPARK_C = [3, 5, 4, 6, 5, 8, 6, 9, 8, 11];

export default function AdminDashboard() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filterTab, setFilterTab] = useState("All vehicles");
  const [tableTab, setTableTab] = useState("View all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getVehicles().then(setVehicles);
  }, []);

  const filtered = useMemo(() => {
    return vehicles
      .filter((v) => filterTab === "All vehicles" || v.category === filterTab)
      .filter((v) =>
        tableTab === "View all" ? true : v.status === tableTab.toLowerCase()
      )
      .filter((v) =>
        `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase())
      );
  }, [vehicles, filterTab, tableTab, query]);

  const totalRate = vehicles.reduce((sum, v) => sum + v.dailyRate, 0) || 1;

  const handleEdit = (id) => {
    navigate(`/admin/vehicles/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!(await confirm("Delete this vehicle?", { danger: true, confirmLabel: "Delete" }))) return;

    await deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Fleet overview</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Total vehicles" value={vehicles.length || "—"} delta="2.4%" spark={SPARK_A} />
        <StatCard label="Avg. daily rate" value={`${Math.round(totalRate / (vehicles.length || 1))} MAD`} delta="8.6%" spark={SPARK_B} />
        <StatCard label="Active reservations" value="9" delta="6.0%" spark={SPARK_C} />
      </div>

      <div className="table-card">
        <div className="table-card-header">Vehicles</div>
        <div className="table-toolbar">
          <div className="toolbar-tabs">
            {TABLE_TABS.map((t) => (
              <button
                key={t}
                className={`toolbar-tab ${tableTab === t ? "active" : ""}`}
                onClick={() => setTableTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <div className="search-box">
              <Search size={14} />
              <input
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: "none", outline: "none", background: "none", width: "100px" }}
              />
              <kbd>⌘K</kbd>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Vehicle</th>
              <th>Daily rate</th>
              <th>Share of fleet value</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const share = Math.round((v.dailyRate / totalRate) * 100);
              return (
                <tr key={v.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    {v.brand} {v.model}
                    <div style={{ marginTop: "0.2rem" }}>
                      <span className={`badge badge-${v.status}`}>{v.status}</span>
                    </div>
                  </td>
                  <td>{v.dailyRate} MAD</td>
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
                      <span className="tag-dot" /> {v.category}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => handleEdit(v.id)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} title="Delete" className="danger">
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
                  No vehicles match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, spark }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value-row">
        <span className="stat-value">{value}</span>
        <span className="stat-delta">
          <ArrowUpRight size={13} /> {delta}
        </span>
        <span className="stat-delta-label">vs last month</span>
      </div>
      <Sparkline data={spark} />
    </div>
  );
}

function Sparkline({ data }) {
  const width = 220;
  const height = 44;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="#FF4F00"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}