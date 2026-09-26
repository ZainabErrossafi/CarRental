import { useEffect, useState } from "react";
import { getCatalog } from "../../services/adminApi";

const TABS = ["brands", "categories", "features", "extras"];

export default function AdminCatalog() {
  const [catalog, setCatalog] = useState(null);
  const [tab, setTab] = useState("brands");

  useEffect(() => {
    getCatalog().then(setCatalog);
  }, []);

  if (!catalog) return <p>Loading...</p>;

  const items = catalog[tab];

  return (
    <div>
      <div className="page-header">
        <h1>Vehicle Catalog</h1>
      </div>

      <div className="pill-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`pill-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
          <span className="count-pill">{items.length}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              {tab === "extras" && <th>Price / Day</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                {tab === "extras" && <td>{item.pricePerDay} MAD</td>}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={tab === "extras" ? 2 : 1} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  No {tab} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}