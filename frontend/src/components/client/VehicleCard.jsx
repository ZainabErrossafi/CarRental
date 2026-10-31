import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Users, Settings2, ArrowUpRight, Car } from "lucide-react";

export default function VehicleCard({ vehicle }) {
  const { search } = useLocation();
  const [failedImage, setFailedImage] = useState(null);
  const image = vehicle.main_image || vehicle.image;
  const brand = typeof vehicle.brand === "object" ? vehicle.brand.name : vehicle.brand;
  const name = vehicle.name || [brand, vehicle.model].filter(Boolean).join(" ");
  const category = typeof vehicle.category === "object" ? vehicle.category.name : vehicle.category;
  const price = vehicle.pricePerDay ?? vehicle.dailyRate ?? vehicle.daily_rate;
  return (
    <Link
      to={{ pathname: `/vehicles/${vehicle.id}`, search }}
      className="fleet-card fleet-card-clickable"
      aria-label={`View details for ${name}`}
    >
      <div className="fleet-card-photo">
        {image && failedImage !== image ? (
          <img
            src={image}
            alt={vehicle.imageIllustrative ? "Illustrative vehicle photograph" : name}
            loading="lazy"
            onError={() => setFailedImage(image)}
          />
        ) : (
          <div className="fleet-card-placeholder">
            <Car size={56} strokeWidth={1.2} aria-hidden="true" />
            <span>Photo coming soon</span>
          </div>
        )}
        {category && <span className="fleet-card-category">{category}</span>}
      </div>
      <div className="fleet-card-body">
        <p className="fleet-card-brand">{brand || name.split(" ")[0]}</p>
        <h3>{name}</h3>
        <div className="fleet-card-specs">
          <span>
            <Users size={17} aria-hidden="true" />
            {vehicle.seats} seats
          </span>
          <span>
            <Settings2 size={17} aria-hidden="true" />
            {vehicle.transmission}
          </span>
        </div>
        <div className="fleet-card-bottom">
          <div className="fleet-card-price">
            <span>Daily rental</span>
            <p>
              <strong>{price}</strong> MAD <small>/ day</small>
            </p>
          </div>
          <span className="fleet-card-button" aria-hidden="true">
            <ArrowUpRight size={20} />
          </span>
        </div>
      </div>
    </Link>
  );
}
