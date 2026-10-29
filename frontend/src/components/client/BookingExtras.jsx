import { CATALOG_ICONS } from "../CatalogIcons.jsx";

export default function BookingExtras({ extras, selectedExtras, loading, error, onChange, money }) {
  return (
    <details className="booking-extras booking-extras-picker">
      <summary>
        <span><strong>Optional extras</strong><small>Personalize your rental</small></span>
        <span className="booking-extras-count" aria-live="polite">
          {selectedExtras.length ? `${selectedExtras.length} added` : "Add extras"}
        </span>
        <span className="booking-extras-chevron" aria-hidden="true">⌄</span>
      </summary>
      {loading ? <p role="status">Loading extras…</p>
        : error ? <p role="status">Extras are temporarily unavailable. You can still book without them.</p>
        : !extras.length ? <p>No extras available.</p>
        : (
          <div className="booking-extras-list" tabIndex={0} role="group" aria-label="Available optional extras">
            {extras.map((extra) => {
              const Icon = CATALOG_ICONS[extra.icon] || CATALOG_ICONS.tag;
              const prices = [
                Number(extra.price_per_day) > 0 && `${money(extra.price_per_day)} MAD / day`,
                Number(extra.flat_price) > 0 && `${money(extra.flat_price)} MAD once`,
              ].filter(Boolean);
              return (
                <label key={extra.id} className="booking-extra-option">
                  <input type="checkbox" checked={selectedExtras.includes(extra.id)}
                    onChange={(event) => onChange(extra.id, event.target.checked)} />
                  <span className="booking-extra-content">
                    <span className="booking-extra-icon"><Icon size={18} strokeWidth={1.6} aria-hidden="true" /></span>
                    <span className="booking-extra-copy">
                      <strong>{extra.name}</strong>
                      <small>{prices.join(" + ") || "Included"}</small>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
    </details>
  );
}
