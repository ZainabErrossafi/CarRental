import { Link } from "react-router-dom";

export default function VehicleCard({ vehicle }) {
  return (
    <article className="tw:rounded-2xl tw:border tw:border-solid tw:border-[#e8e2de] tw:bg-white tw:p-7 tw:text-[#021731]">
      <p className="tw:font-semibold tw:text-[#a73700]">{vehicle.category}</p>
      <h3>{vehicle.name}</h3>
      <p>{vehicle.seats} seats · {vehicle.transmission}</p>
      <p><strong>{vehicle.pricePerDay} MAD</strong> / day</p>
      <Link className="tw:mt-3 tw:inline-block tw:rounded-lg tw:bg-[#021731] tw:px-5 tw:py-3 tw:text-white" to={`/vehicles/${vehicle.id}`}>View vehicle</Link>
    </article>
  );
}
