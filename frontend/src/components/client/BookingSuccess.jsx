import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

export default function BookingSuccess({ reservation, money }) {
  return (
    <aside className="vehicle-booking-card booking-success" role="status">
      <div className="booking-success-icon"><Check size={27} aria-hidden="true" /></div>
      <span className="booking-success-eyebrow">ALL SET FOR THE NEXT STEP</span>
      <h2>Request received!</h2>
      <p>We’ll review your reservation and confirm it shortly.</p>
      <div className="booking-success-summary">
        <span>Booking reference<strong>{reservation.reference}</strong></span>
        <span>Total rental<strong>{money(reservation.total_price)} MAD</strong></span>
        <span>Status<strong className="booking-pending">Pending confirmation</strong></span>
      </div>
      <button type="button" className="vehicle-booking-button vehicle-booking-signin"
        onClick={() => window.dispatchEvent(new Event("rently:show-reservations"))}>
        My reservations <ArrowRight size={16} aria-hidden="true" />
      </button>
      <Link className="booking-success-back" to="/vehicles">Continue exploring vehicles</Link>
    </aside>
  );
}
