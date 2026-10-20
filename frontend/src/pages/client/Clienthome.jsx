import { Link } from "react-router-dom";
import VehicleCard from "../../components/client/VehicleCard.jsx";
import vehicles from "../../data/vehicles.js";

export default function ClientHome() {
  return (
    <>
      <section className="client-hero">
        <p className="client-eyebrow">Your next journey starts here</p>
        <h1>Find a vehicle for your next trip.</h1>
        <p>Explore our sample fleet and compare daily rental prices.</p>
        <Link className="client-button" to="/vehicles">Explore vehicles</Link>
      </section>
      <section aria-labelledby="fleet-heading">
        <h2 id="fleet-heading">Explore the fleet</h2>
        <div className="client-grid">
          {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      </section>
    </>
  );
}
