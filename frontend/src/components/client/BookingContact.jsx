import { useAuth } from "../../context/AuthContext";
import CompactDropdown from "./CompactDropdown.jsx";
import { sanitizePhone } from "../../utils/phone.js";
import { sanitizeName } from "../../utils/name.js";

export default function BookingContact({ form, onChange, agencies }) {
  const { user } = useAuth();
  return (
    <div className="vehicle-booking-fields">
      <CompactDropdown
        label="Pick-up agency"
        value={form.pickup_location}
        placeholder="Select an agency"
        onChange={(value) => onChange("pickup_location")({ target: { value } })}
        options={agencies}
      />
      <CompactDropdown
        label="Return agency"
        value={form.dropoff_location}
        placeholder="Select an agency"
        onChange={(value) => onChange("dropoff_location")({ target: { value } })}
        options={agencies}
      />
      <label>
        Driver name
        <input
          required
          maxLength={100}
          value={form.driver_name}
          onChange={(event) => onChange("driver_name")({ target: { value: sanitizeName(event.target.value) } })}
          autoComplete="name"
        />
      </label>
      <label>
        Email
        <input
          required
          type="email"
          value={user.email || ""}
          readOnly
          autoComplete="email"
          aria-label="Account email"
        />
      </label>
      <label>
        Phone
        <input required type="tel" maxLength={20} value={form.phone}
          onChange={(event) => onChange("phone")({ target: { value: sanitizePhone(event.target.value) } })}
          autoComplete="tel" />
      </label>
    </div>
  );
}
