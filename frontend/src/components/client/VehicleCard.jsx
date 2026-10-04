import { Link } from "react-router-dom";

export default function VehicleCard({ vehicle }) {
  return (
    <article className="client-card">
      <p className="client-eyebrow">{vehicle.category}</p>
      <h2>{vehicle.name}</h2>
      <p>{vehicle.seats} seats · {vehicle.transmission}</p>
      <p><strong>{vehicle.pricePerDay} MAD</strong> / day</p>
      <Link className="client-button" to={`/vehicles/${vehicle.id}`}>View details</Link>
    </article>
  );
}
