import { Link } from "react-router-dom";
import VehicleCard from "../../components/client/VehicleCard.jsx";
import vehicles from "../../data/vehicles.js";

export default function ClientHome() {
  return (
    <>
      <section className="tw:max-w-[720px] tw:py-20">
        <p className="tw:font-semibold tw:text-[#a73700]">Your next journey starts here</p>
        <h1 className="tw:my-4 tw:text-[clamp(36px,6vw,64px)] tw:leading-[1.1]">Find a vehicle for your next trip.</h1>
        <p>Explore our sample fleet and compare daily rental prices.</p>
        <Link className="tw:mt-3 tw:inline-block tw:rounded-lg tw:bg-[#021731] tw:px-5 tw:py-3 tw:text-white" to="/vehicles">Explore vehicles</Link>
      </section>
      <section aria-labelledby="fleet-heading">
        <h2 id="fleet-heading">Explore the fleet</h2>
        <div className="tw:grid tw:grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] tw:gap-6">
          {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      </section>
    </>
  );
}
