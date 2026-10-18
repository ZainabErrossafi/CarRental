export const dateKey = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export function dateRange(days, now = new Date()) {
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  return { start: dateKey(start), end: dateKey(now) };
}
export function buildAnalytics(reservations, { start, end, status = 'all', vehicle = 'all' }) {
  const rows = reservations.filter((row) => {
    const day = dateKey(row.created_at);
    return day && (!start || day >= start) && (!end || day <= end)
      && (status === 'all' || row.status === status)
      && (vehicle === 'all' || String(row.vehicle) === String(vehicle));
  });
  const revenueOf = (row) => ['confirmed', 'completed'].includes(row.status) ? Math.max(0, Number(row.total_price) || 0) : 0;
  const days = new Map();
  // Limit chart density to monthly buckets for long date ranges.
  const monthly = start && end && (new Date(end) - new Date(start)) / 86400000 > 92;
  if (start && end) {
    const cursor = new Date(`${start}T12:00:00`);
    const stop = new Date(`${end}T12:00:00`);
    if (monthly) cursor.setDate(1);
    while (cursor <= stop) {
      days.set(dateKey(cursor).slice(0, monthly ? 7 : 10), { bookings: 0, revenue: 0 });
      if (monthly) cursor.setMonth(cursor.getMonth() + 1);
      else cursor.setDate(cursor.getDate() + 1);
    }
  }
  const statuses = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  const vehicles = new Map();
  for (const row of rows) {
    const key = dateKey(row.created_at).slice(0, monthly ? 7 : 10);
    const day = days.get(key) || { bookings: 0, revenue: 0 };
    day.bookings++;
    day.revenue += revenueOf(row);
    days.set(key, day);
    statuses[row.status] = (statuses[row.status] || 0) + 1;
    const item = vehicles.get(row.vehicle) || { id: row.vehicle, name: row.vehicle_name || String(row.vehicle), bookings: 0, revenue: 0 };
    item.bookings++;
    item.revenue += revenueOf(row);
    vehicles.set(row.vehicle, item);
  }
  const revenue = rows.reduce((sum, row) => sum + revenueOf(row), 0);
  const revenueBookings = rows.filter((row) => ['confirmed', 'completed'].includes(row.status)).length;
  return { rows, revenue, active: rows.filter((row) => ['pending', 'confirmed'].includes(row.status)).length,
    average: revenueBookings ? revenue / revenueBookings : 0,
    cancellationRate: rows.length ? statuses.cancelled / rows.length * 100 : 0,
    timeline: [...days].sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({ date, ...values })),
    statuses, topVehicles: [...vehicles.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 6) };
}
