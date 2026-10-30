import { useI18n } from "../../../context/I18nContext";
import SearchableSelect from "../../SearchableSelect";
import {
  clampReservationTime,
  currentReservationTime,
} from "../../../utils/reservationTime";

export default function ReservationBookingFields({
  form,
  handleChange,
  vehicles,
  locations,
  minimumTime,
  setMinimumTime,
}) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card">
      <div className="vehicle-identity-heading">
        <h3>{t("Reservation details")}</h3>
        <p>{t("Choose a vehicle, locations, and rental dates.")}</p>
      </div>
      <div className="form-grid">
        <div className="form-field full-width">
          <label htmlFor="vehicle_id">{t("Vehicle")}</label>
          <SearchableSelect
            disablePortal
            id="vehicle_id"
            value={form.vehicle_id}
            onChange={(value) => handleChange("vehicle_id", value)}
            placeholder={t("Select an available vehicle")}
            options={vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.brand} ${vehicle.model} — ${vehicle.dailyRate} ${t("MAD/day")}`,
            }))}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="pickup_location_id">{t("Pickup Location")}</label>
          <SearchableSelect
            disablePortal
            id="pickup_location_id"
            value={form.pickup_location_id}
            onChange={(value) =>
              handleChange("pickup_location_id", value ?? "")
            }
            placeholder={t("Select Location")}
            options={locations.map((loc) => ({
              value: loc.id,
              label: `${loc.name} - ${loc.city}`,
            }))}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="dropoff_location_id">{t("Dropoff Location")}</label>
          <SearchableSelect
            disablePortal
            id="dropoff_location_id"
            value={form.dropoff_location_id}
            onChange={(value) =>
              handleChange("dropoff_location_id", value ?? "")
            }
            placeholder={t("Select Location")}
            options={locations.map((loc) => ({
              value: loc.id,
              label: `${loc.name} - ${loc.city}`,
            }))}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="pickup_date">{t("Pickup date and time")}</label>
          <input
            id="pickup_date"
            type="datetime-local"
            min={minimumTime}
            onFocus={() => setMinimumTime(currentReservationTime())}
            value={form.pickup_date}
            onChange={(e) =>
              handleChange("pickup_date", clampReservationTime(e.target.value))
            }
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="return_date">{t("Return date and time")}</label>
          <input
            id="return_date"
            type="datetime-local"
            disabled={!form.pickup_date}
            min={
              form.pickup_date > minimumTime ? form.pickup_date : minimumTime
            }
            onFocus={() => setMinimumTime(currentReservationTime())}
            value={form.return_date}
            onChange={(e) =>
              handleChange("return_date", clampReservationTime(e.target.value))
            }
            required
          />
        </div>
      </div>
    </div>
  );
}
