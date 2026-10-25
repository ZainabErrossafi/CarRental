import VehicleBooking from "../../components/client/VehicleBooking.jsx";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Users,
  Settings2,
  Fuel,
  Briefcase,
  Wind,
  Car,
  ShieldCheck,
  Gauge,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { CATALOG_ICONS } from "../../components/CatalogIcons.jsx";
import { getClientVehicle } from "../../services/clientVehicles.js";

export default function ClientVehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setVehicle(null);
    setError("");
    setSelectedImage(null);
    getClientVehicle(id)
      .then((item) => {
        if (active) setVehicle(item);
      })
      .catch((err) => {
        if (active)
          setError(
            err.response?.status === 404
              ? "Vehicle not found"
              : "Could not load this vehicle. Please try again later.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (loading) return <p role="status">Loading vehicle…</p>;
  if (error)
    return (
      <section>
        <p role="alert">{error}</p>
        <Link to="/vehicles">Back to vehicles</Link>
      </section>
    );
  if (!vehicle)
    return (
      <section>
        <h1>Vehicle not found</h1>
        <Link to="/vehicles">Back to vehicles</Link>
      </section>
    );
  const images = [vehicle.main_image, ...(vehicle.gallery || []).map((photo) => photo.image)].filter(Boolean);
  const uniqueImages = [...new Set(images)];
  const selected = selectedImage || uniqueImages[0];
  const specs = [
    [Users, "Seats", vehicle.seats],
    [Settings2, "Transmission", vehicle.transmission],
    [Fuel, "Fuel", vehicle.fuel],
    [Car, "Doors", vehicle.doors],
    [Briefcase, "Luggage", vehicle.luggage],
    [Wind, "Air conditioning", vehicle.air_conditioning ? "Included" : "Not included"],
  ];
  const money = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value));

  return (
    <section className="vehicle-detail">
      <nav className="vehicle-detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Location de voiture Maroc</Link>
        <ArrowRight size={12} aria-hidden="true" />
        <Link to="/vehicles">Vehicles</Link>
        <ArrowRight size={12} aria-hidden="true" />
        <span aria-current="page">{vehicle.name}</span>
      </nav>

      <div className="vehicle-detail-layout">
        <div className="vehicle-detail-main">
          <div className="vehicle-detail-photo">
            {selected ? (
              <img src={selected} alt={vehicle.name} />
            ) : (
              <div className="vehicle-detail-no-photo">
                <Car size={76} strokeWidth={1} aria-hidden="true" />
                <span>Photos coming soon</span>
              </div>
            )}
            <span className="vehicle-detail-category">{vehicle.category}</span>
          </div>
          {uniqueImages.length > 1 && (
            <div className="vehicle-detail-gallery" aria-label="Vehicle photos">
              {uniqueImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={selected === image}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
          <section className="vehicle-detail-panel vehicle-detail-overview">
            <h1>
              {vehicle.name} {vehicle.year}
            </h1>
            <div className="vehicle-detail-heading-chips">
              <span>
                <Fuel size={13} aria-hidden="true" />
                {vehicle.fuel}
              </span>
              <span>
                <Settings2 size={13} aria-hidden="true" />
                {vehicle.transmission}
              </span>
              <span>
                <Car size={13} aria-hidden="true" />
                {vehicle.doors} doors
              </span>
              <span>
                <Users size={13} aria-hidden="true" />
                {vehicle.seats} seats
              </span>
            </div>
            {vehicle.description && <p className="vehicle-detail-description">{vehicle.description}</p>}
          </section>
          <section className="vehicle-detail-panel">
            <h2>At a glance</h2>
            <div className="vehicle-detail-specs">
              {specs.map(([Icon, label, value]) => (
                <div key={label}>
                  <Icon size={21} strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    {label}
                    <strong>{value ?? "—"}</strong>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {vehicle.features?.length > 0 && (
            <section className="vehicle-detail-panel">
              <h2>Included features</h2>
              <div className="vehicle-detail-features">
                {vehicle.features.map((feature) => {
                  const Icon = CATALOG_ICONS[feature.icon] || CATALOG_ICONS.tag;
                  return (
                    <span key={feature.id}>
                      <Icon size={18} aria-hidden="true" />
                      {feature.name}
                    </span>
                  );
                })}
              </div>
            </section>
          )}
          <section className="vehicle-detail-panel">
            <h2>Before you drive</h2>
            <div className="vehicle-detail-conditions">
              <div>
                <ShieldCheck size={20} aria-hidden="true" />
                <span>
                  Security deposit<strong>{money(vehicle.deposit ?? 0)} MAD</strong>
                </span>
              </div>
              <div>
                <Users size={20} aria-hidden="true" />
                <span>
                  Minimum driver age<strong>{vehicle.min_driver_age ?? "—"} years</strong>
                </span>
              </div>
              <div>
                <Gauge size={20} aria-hidden="true" />
                <span>
                  Daily mileage
                  <strong>
                    {vehicle.daily_mileage_limit === "" || vehicle.daily_mileage_limit == null
                      ? "Unlimited"
                      : `${vehicle.daily_mileage_limit} km / day`}
                  </strong>
                </span>
              </div>
              <div>
                <CalendarDays size={20} aria-hidden="true" />
                <span>
                  Driving licence held for<strong>{vehicle.min_license_years ?? "—"} years minimum</strong>
                </span>
              </div>
            </div>
          </section>
        </div>
        <VehicleBooking key={vehicle.id} vehicle={vehicle} />
      </div>
    </section>
  );
}
