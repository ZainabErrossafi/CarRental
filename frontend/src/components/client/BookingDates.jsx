export default function BookingDates({ values, onChange, minimum }) {
  return (
    <div className="vehicle-booking-dates">
      {[
        ["pickup", "Pick-up", minimum.pickup],
        ["returned", "Return", minimum.returned],
      ].map(([field, label, minimum]) => {
        const [date = "", time = ""] = values[field].split("T");
        return (
          <div className="vehicle-booking-date-group" key={field}>
            <label>
              {label} date
              <input
                type="date"
                required
                min={minimum.slice(0, 10)}
                value={date}
                onChange={(event) =>
                  onChange(field, event.target.value ? `${event.target.value}T${time || minimum.slice(11)}` : "")
                }
              />
            </label>
            <label>
              {label} time
              <input
                type="time"
                required
                disabled={!date}
                value={time}
                min={date === minimum.slice(0, 10) ? minimum.slice(11) : undefined}
                onChange={(event) => {
                  if (event.target.value) onChange(field, `${date}T${event.target.value}`);
                  else onChange(field, date);
                }}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
