export function currentReservationTime(now = new Date()) {

  const nextMinute = new Date(Math.ceil((now.getTime() + 1) / 60000) * 60000);
  const local = new Date(nextMinute.getTime() - nextMinute.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function clampReservationTime(value, now = new Date()) {
  if (!value || new Date(value).getTime() > now.getTime()) return value;
  return currentReservationTime(now);
}
