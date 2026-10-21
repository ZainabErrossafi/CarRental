import { Link, useParams } from "react-router-dom";
import vehicles from "../../data/vehicles.js";

export default function ClientVehicleDetails() {
  const { id } = useParams();
  const vehicle = vehicles.find((item) => String(item.id) === id);

  if (!vehicle) {
    return <section><h1>Vehicle not found</h1><Link to="/vehicles">Back to vehicles</Link></section>;
  }

  return (
    <section>
      <Link to="/vehicles">← Back to vehicles</Link>
      <div className="tw:rounded-2xl tw:border tw:border-solid tw:border-[#e8e2de] tw:bg-white tw:p-7 tw:mt-6 tw:[&_dt]:mt-3 tw:[&_dt]:font-semibold tw:[&_dd]:ml-0">
        <p className="tw:font-semibold tw:text-[#a73700]">{vehicle.category}</p>
        <h1>{vehicle.name}</h1>
        <p>{vehicle.description}</p>
        <dl>
          <dt>Seats</dt><dd>{vehicle.seats}</dd>
          <dt>Transmission</dt><dd>{vehicle.transmission}</dd>
          <dt>Daily price</dt><dd>{vehicle.pricePerDay} MAD</dd>
        </dl>
        <p>Online booking is not available yet. This is a sample vehicle.</p>
      </div>
    </section>
  );
}
