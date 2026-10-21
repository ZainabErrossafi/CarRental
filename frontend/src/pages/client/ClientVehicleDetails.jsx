import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClientVehicle } from "../../services/clientVehicles.js";

export default function ClientVehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true); setVehicle(null); setError("");
    getClientVehicle(id).then((item) => { if (active) setVehicle(item); })
      .catch((err) => { if (active) setError(err.response?.status === 404 ? "Vehicle not found" : "Could not load this vehicle. Please try again later."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <p role="status">Loading vehicle…</p>;
  if (error) return <section><p role="alert">{error}</p><Link to="/vehicles">Back to vehicles</Link></section>;

  if (!vehicle) {
    return <section><h1>Vehicle not found</h1><Link to="/vehicles">Back to vehicles</Link></section>;
  }

  return (
    <section>
      <Link to="/vehicles">← Back to vehicles</Link>
      <div className="tw:rounded-2xl tw:border tw:border-solid tw:border-[#e8e2de] tw:bg-white tw:text-[#021731] tw:p-7 tw:mt-6 tw:[&_dt]:mt-3 tw:[&_dt]:font-semibold tw:[&_dd]:ml-0">
        {vehicle.main_image && <img className="client-vehicle-detail-image" src={vehicle.main_image} alt={vehicle.name} />}
        <p className="tw:font-semibold tw:text-[#a73700]">{vehicle.category}</p>
        <h1>{vehicle.name}</h1>
        <p>{vehicle.description}</p>
        <dl>
          <dt>Seats</dt><dd>{vehicle.seats}</dd>
          <dt>Transmission</dt><dd>{vehicle.transmission}</dd>
          <dt>Daily price</dt><dd>{vehicle.pricePerDay} MAD</dd>
        </dl>
        <p>Online booking is not available yet.</p>
      </div>
    </section>
  );
}
