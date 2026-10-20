import { useState } from "react";
import VehicleCard from "../../components/client/VehicleCard.jsx";
import vehicles from "../../data/vehicles.js";

export default function ClientVehicles() {
  const [search, setSearch] = useState("");
  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <section>
      <h1>Our vehicles</h1>
      <label className="client-search" htmlFor="vehicle-search">
        Search by name
        <input id="vehicle-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try Dacia or Renault" />
      </label>
      <p role="status">{filteredVehicles.length} vehicles found</p>
      <div className="client-grid">
        {filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
      </div>
      {filteredVehicles.length === 0 && <p>No vehicles match. Try another name.</p>}
    </section>
  );
}
