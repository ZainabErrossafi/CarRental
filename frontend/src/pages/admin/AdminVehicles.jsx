import { useEffect, useState } from "react";
import { Pencil, Trash2, Archive, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getVehicles,
  deleteVehicle,
  updateVehicleStatus,
} from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

export default function AdminVehicles() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);

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
        <h1>Vehicles</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={handleAdd}>
            <Plus size={16} strokeWidth={2.5} />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          All Vehicles
          <span className="count-pill">{vehicles.length}</span>
        </div>

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
                <td>{v.brand} {v.model}</td>
                <td>{v.year}</td>
                <td>{v.category}</td>
                <td>{v.dailyRate} MAD</td>

                <td>
                  <select
                    className="status-select"
                    data-status={v.status}
                    value={v.status}
                    onChange={(e) => handleStatusChange(v.id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </td>

                <td>
                  <div className="row-actions">
                    <button onClick={() => handleEdit(v.id)} title="Edit Vehicle">
                      <Pencil size={15} />
                    </button>

                    <button onClick={() => handleArchive(v.id)} title="Archive Vehicle">
                      <Archive size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      title="Delete Vehicle"
                      className="danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {vehicles.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  No vehicles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}