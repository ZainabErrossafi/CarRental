import { useEffect, useState } from "react";
import { Pencil, Trash2, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";


import {
  getVehicles,
  deleteVehicle,
  updateVehicleStatus,
} from "../../services/adminApi";

export default function AdminVehicles() {
  const navigate = useNavigate();
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
    navigate(`/admin/vehicles/${id}/edit`);
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
                  {/* EDIT */}
                  <button onClick={() => handleEdit(v.id)} title="Edit Vehicle">
                    <Pencil size={15} />
                  </button>

                  {/* ARCHIVE */}
                  <button onClick={() => handleArchive(v.id)} title="Archive Vehicle">
                    <Archive size={15} />
                  </button>

                  {/* DELETE */}
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
        </tbody>
      </table>
    </div>
  );
}