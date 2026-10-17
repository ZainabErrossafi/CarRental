import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnalytics, dateRange } from './dashboardAnalytics.js';
const rows = [
  { created_at: '2026-10-01T12:00:00', status: 'confirmed', vehicle: 1, total_price: '100' },
  { created_at: '2026-10-02T12:00:00', status: 'pending', vehicle: 1, total_price: '200' },
  { created_at: '2026-10-03T12:00:00', status: 'cancelled', vehicle: 2, total_price: '300' },
  { created_at: '2026-10-03T12:00:00', status: 'completed', vehicle: 2, total_price: '400' },
  { created_at: '2026-09-30T12:00:00', status: 'completed', vehicle: 1, total_price: '500' },
];
const range = { start: '2026-10-01', end: '2026-10-04' };
test('revenue excludes pending/cancelled bookings; date boundaries and empty days are included', () => {
  const data = buildAnalytics(rows, range);
  assert.equal(data.rows.length, 4); assert.equal(data.revenue, 500);
  assert.equal(data.average, 250); assert.equal(data.active, 2); assert.equal(data.cancellationRate, 25);
  assert.equal(data.timeline.length, 4); assert.equal(data.timeline[3].bookings, 0);
  assert.equal(data.topVehicles[0].bookings, 2);
});
test('filters intersect and all summaries use the same rows', () => {
  const data = buildAnalytics(rows, { ...range, status: 'completed', vehicle: '2' });
  assert.equal(data.rows.length, 1); assert.equal(data.revenue, 400); assert.equal(data.statuses.completed, 1);
  assert.equal(data.timeline.reduce((sum, d) => sum + d.revenue, 0), 400);
});
test('empty result avoids divisions by zero', () => {
  const data = buildAnalytics([], range);
  assert.equal(data.average, 0); assert.equal(data.cancellationRate, 0); assert.equal(data.revenue, 0);
});
test('long ranges aggregate by month', () => {
  const data = buildAnalytics(rows, { start: '2026-01-01', end: '2026-12-31' });
  assert.equal(data.timeline.length, 12); assert.equal(data.timeline[9].revenue, 500);
});
test('preset includes today and handles month boundaries', () => {
  assert.deepEqual(dateRange(7, new Date('2026-10-03T12:00:00')), { start: '2026-09-27', end: '2026-10-03' });
});
