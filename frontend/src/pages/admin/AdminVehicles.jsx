import { useEffect, useState } from "react";
import { Pencil, Trash2, Archive } from "lucide-react";

import {
  getVehicles,
  deleteVehicle,
  updateVehicleStatus,
} from "../../services/adminApi";

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    getVehicles().then(setVehicles);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this vehicle?")) return;

    await deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleEdit = (id) => {
    console.log("Edit vehicle:", id);
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
      <h1>Vehicles</h1>

      <table>
        <thead>
          <tr>
            <th>Brand / Model</th>
            <th>Year</th>
            <th>Category</th>
            <th>Daily Rate</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td>
                {v.brand} {v.model}
              </td>

              <td>{v.year}</td>

              <td>{v.category}</td>

              <td>{v.dailyRate} MAD</td>

              <td>
                <select
                  value={v.status}
                  onChange={(e) => handleStatusChange(v.id, e.target.value)}
                >
                  <option value="available" style={{ color: '#16a34a' }}>● Available</option>
                  <option value="maintenance" style={{ color: '#d97706' }}>● Maintenance</option>
                  <option value="hidden" style={{ color: '#6b7280' }}>● Hidden</option>
                </select>
              </td>
              <td>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  {/* EDIT */}
                  <button
                    onClick={() => handleEdit(v.id)}
                    title="Edit Vehicle"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      color: "#1976d2",
                    }}
                  >
                    <Pencil size={18} strokeWidth={2} />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(v.id)}
                    title="Delete Vehicle"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      color: "#d32f2f",
                    }}
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>

                  {/* ARCHIVE */}
                  <button
                    onClick={() => handleArchive(v.id)}
                    title="Archive Vehicle"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      color: "#a77917",
                    }}
                  >
                    <Archive size={18} strokeWidth={2} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}