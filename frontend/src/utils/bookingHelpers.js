export const money = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value));

export function bookingDuration(pickup, returned) {
  if (!pickup || !returned) return 0;
  return Math.ceil((new Date(returned) - new Date(pickup)) / 86400000);
}

export function bookingExtrasTotal(extras, selectedExtras, duration) {
  return extras
    .filter((item) => selectedExtras.includes(item.id))
    .reduce((total, item) => total + Number(item.price_per_day) * Math.max(duration, 0) + Number(item.flat_price), 0);
}

export function validateBooking(form, contactComplete, valid) {
  if (![form.pickup, form.returned].every((value) => /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value))) {
    return "Enter valid times from 00:00 to 23:59.";
  }
  if (!form.pickup_location || !form.dropoff_location) {
    return "Select pick-up and return agencies.";
  }
  if (!contactComplete) {
    return "Driver name, phone number and account email are required to book.";
  }
  if (!valid) {
    return "Choose a future pick-up time and a later return time.";
  }
  return "";
}
