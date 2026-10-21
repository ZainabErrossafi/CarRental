import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import VehicleCard from "../../components/client/VehicleCard.jsx";
import vehicles from "../../data/vehicles.js";

export default function ClientVehicles() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <section>
      <h1>Our vehicles</h1>
      {params.get("departure_agency") && (
        <div className="tw:mb-6 tw:rounded-xl tw:border tw:border-solid tw:border-[#e1e4eb] tw:bg-white tw:p-4 tw:text-[#021731] tw:font-sans tw:text-sm">
          <p><strong>Départ :</strong> {params.get("departure_agency")} · {params.get("departure_date")} à {params.get("departure_time")}</p>
          <p><strong>Retour :</strong> {params.get("return_agency")} · {params.get("return_date")} à {params.get("return_time")}</p>
          <p>Véhicules de démonstration : ces critères ne filtrent pas encore la disponibilité.</p>
        </div>
      )}
      <label className="tw:grid tw:max-w-[400px] tw:gap-2" htmlFor="vehicle-search">
        Search by name
        <input className="tw:rounded-lg tw:border tw:border-solid tw:border-[#897973] tw:p-3 tw:bg-white tw:text-[#021731] tw:[font:inherit]" id="vehicle-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try Dacia or Renault" />
      </label>
      <p role="status">{filteredVehicles.length} vehicles found</p>
      <div className="tw:grid tw:grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] tw:gap-6">
        {filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
      </div>
      {filteredVehicles.length === 0 && <p>No vehicles match. Try another name.</p>}
    </section>
  );
}
