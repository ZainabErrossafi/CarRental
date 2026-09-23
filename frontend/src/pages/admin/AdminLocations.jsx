import { useEffect, useState } from "react";
import { getLocations } from "../../services/adminApi";

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  return (
    <div>
      <h1>Locations</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Country</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.city}</td>
              <td>{l.country}</td>
              <td>
                <span className={`badge badge-${l.active ? "active" : "inactive"}`}>
                  {l.active ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}