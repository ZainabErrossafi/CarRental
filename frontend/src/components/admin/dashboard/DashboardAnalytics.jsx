import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../context/I18nContext";
import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, Printer } from 'lucide-react';
import { getReservations } from "../../../services/adminApi";
import { buildAnalytics, dateRange } from "../../../services/dashboardAnalytics";
import { serializeReport } from "../../../services/reportFiles";
import { TOKEN_KEY } from "../../../services/api";

const COLORS = ['#ffc58c', '#2563eb', '#16a34a', '#dc2626'];
export default function DashboardAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();
  const [reservations, setReservations] = useState([]);
  const [range, setRange] = useState(() => dateRange(30));
  const [preset, setPreset] = useState('30');
  const [status, setStatus] = useState('all');
  const [vehicle, setVehicle] = useState('all');
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState(null);
  const [metric, setMetric] = useState('revenue');
  const [point, setPoint] = useState(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const refresh = async () => {
    if (busy.current || authLoading || !user || !localStorage.getItem(TOKEN_KEY)) return;
    busy.current = true;
    if (mounted.current) setLoading(true);
    try {
      const rows = await getReservations();
      if (mounted.current && localStorage.getItem(TOKEN_KEY)) { setReservations(rows); setUpdated(new Date()); setError(false); }
    } catch { if (mounted.current) setError(true); }
    finally { busy.current = false; if (mounted.current) setLoading(false); }
  };

  useEffect(() => {
    if (authLoading || !user) {
      setReservations([]);
      setUpdated(null);
      return;
    }
    mounted.current = true;
    refresh();
    return () => { mounted.current = false; };
  }, [user, authLoading]);
  useEffect(() => {
    if (!live || authLoading || !user) return;
    const update = () => { if (document.visibilityState !== 'hidden') refresh(); };
    const timer = window.setInterval(update, 10000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, [live, user, authLoading]);
  const invalid = !range.start || !range.end || range.start > range.end;
  const data = invalid ? null : buildAnalytics(reservations, { ...range, status, vehicle });
  const vehicles = [...new Map(reservations.map((row) => [row.vehicle, row.vehicle_name || row.vehicle])).entries()];
  const money = (value) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value);
  const number = (value) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(value);
  const csv = () => {
    const records = data.rows.map((row) => ({ reference: row.reference, created_at: row.created_at, vehicle: row.vehicle_name, status: row.status, booking_value_MAD: row.total_price }));
    const url = URL.createObjectURL(new Blob([serializeReport('reservations', records, 'csv')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `analytics-${range.start}-${range.end}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const timeline = data?.timeline || [];
  const max = Math.max(1, ...timeline.map((row) => row[metric]));
  const coords = timeline.map((row, index) => ({ x: 50 + index / Math.max(1, timeline.length - 1) * 700, y: 205 - row[metric] / max * 165, row }));
  const selected = point === null ? null : coords[point];
  let angle = 0;
  const stops = Object.values(data?.statuses || {}).map((value, index) => {
    const start = angle; angle += data?.rows.length ? value / data.rows.length * 360 : 0;
    return `${COLORS[index]} ${start}deg ${angle}deg`;
  });
  return <section className="dashboard-analytics" aria-label={t('Analytics dashboard')}>
    <div className="analytics-heading"><div><h1>{t('Analytics dashboard')}</h1><p>{t('Track bookings and revenue across your fleet.')}</p></div>
      <div className="analytics-actions"><button className="btn" disabled={loading} onClick={refresh} aria-label={t('Refresh')}><RefreshCw size={16} />{t('Refresh')}</button><button className="btn" disabled={!data || !updated} onClick={csv}><Download size={16} />CSV</button><button className="btn" disabled={!data || !updated} onClick={() => window.print()}><Printer size={16} />{t('Save as PDF')}</button></div>
    </div>
    <div className="analytics-filters">
      <label>{t('Date range')}<select value={preset} onChange={(e) => { setPreset(e.target.value); if (e.target.value !== 'custom') setRange(dateRange(Number(e.target.value))); setPoint(null); }}><option value="7">{t('Last 7 days')}</option><option value="30">{t('Last 30 days')}</option><option value="90">{t('Last 90 days')}</option><option value="365">{t('Last 365 days')}</option><option value="custom">{t('Custom range')}</option></select></label>
      <label>{t('From')}<input type="date" value={range.start} onChange={(e) => { setRange({ ...range, start: e.target.value }); setPreset('custom'); setPoint(null); }} /></label>
      <label>{t('To')}<input type="date" value={range.end} onChange={(e) => { setRange({ ...range, end: e.target.value }); setPreset('custom'); setPoint(null); }} /></label>
      <label>{t('Status')}<select value={status} onChange={(e) => { setStatus(e.target.value); setPoint(null); }}><option value="all">{t('All statuses')}</option>{['pending', 'confirmed', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{t(s)}</option>)}</select></label>
      <label>{t('Vehicle')}<select value={vehicle} onChange={(e) => { setVehicle(e.target.value); setPoint(null); }}><option value="all">{t('All vehicles')}</option>{vehicles.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
    </div>
    <div className="analytics-update"><label><input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> {t('Auto-refresh every 10 seconds')}</label><span role="status">{loading ? t('Updating…') : updated ? `${t('Last updated')}: ${updated.toLocaleTimeString(lang)}` : ''}</span></div>
    {error && <p role="alert" className="analytics-error">{t('Could not refresh analytics. Please retry. Previous data is shown if available.')}</p>}
    {invalid && <p role="alert" className="analytics-error">{t('Choose a valid start and end date.')}</p>}
    {data && <>
      <p className="analytics-note">{t('Filtered by booking creation date. Revenue is the booking value of confirmed and completed reservations, not payments collected.')}</p>
      <div className="stats-grid analytics-stats">{[
        ['Bookings', number(data.rows.length)], ['Booked revenue', money(data.revenue)], ['Active reservations', number(data.active)], ['Average booking value', money(data.average)], ['Cancellation rate', `${number(data.cancellationRate)}%`],
      ].map(([label, value]) => <div className="stat-card" key={label}><span className="stat-label">{t(label)}</span><strong className="stat-value">{updated ? value : '—'}</strong></div>)}</div>
      {!data.rows.length && updated && <p className="analytics-empty">{t('No bookings match these filters.')}</p>}
      <div className="analytics-charts">
        <article className="analytics-card analytics-trend"><div className="analytics-card-heading"><h2>{t('Booking trends')}</h2><label>{t('Metric')}<select value={metric} onChange={(e) => { setMetric(e.target.value); setPoint(null); }}><option value="revenue">{t('Booked revenue')}</option><option value="bookings">{t('Bookings')}</option></select></label></div>
          <svg viewBox="0 0 800 255" role="img" aria-label={t('Booking trends')}>
            {[0, 0.5, 1].map((fraction) => <g key={fraction}><line x1="50" x2="750" y1={205 - fraction * 165} y2={205 - fraction * 165} stroke="#eee4df" /><text x="45" y={209 - fraction * 165} textAnchor="end" fontSize="11" fill="#897973">{new Intl.NumberFormat(lang, { notation: 'compact' }).format(max * fraction)}</text></g>)}
            <polyline points={coords.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke="#ffc58c" strokeWidth="3" />
            {coords.map(({ x, y, row }, index) => <circle key={row.date} cx={x} cy={y} r={point === index ? 6 : 4} fill="#ffc58c" tabIndex="0" role="button" aria-label={`${row.date}: ${metric === 'revenue' ? money(row.revenue) : row.bookings}`} onFocus={() => setPoint(index)} onMouseEnter={() => setPoint(index)} onClick={() => setPoint(index)}><title>{row.date}: {metric === 'revenue' ? money(row.revenue) : row.bookings}</title></circle>)}
            {coords.filter((_, index) => index === 0 || index === coords.length - 1 || index === Math.floor(coords.length / 2)).map(({ x, row }) => <text key={row.date} x={x} y="240" textAnchor="middle" fontSize="11" fill="#897973">{row.date}</text>)}
          </svg><div className="analytics-tooltip" aria-live="polite">{selected ? `${selected.row.date} · ${t('Bookings')}: ${selected.row.bookings} · ${money(selected.row.revenue)}` : t('Hover or focus a point to see details.')}</div>
        </article>
        <article className="analytics-card"><h2>{t('Booking status')}</h2><div className="analytics-donut" role="img" aria-label={Object.entries(data.statuses).map(([key, count]) => `${t(key)}: ${count}`).join(', ')} style={{ background: data.rows.length ? `conic-gradient(${stops.join(',')})` : '#eee4df' }}><div><strong>{number(data.rows.length)}</strong><span>{t('Bookings')}</span></div></div>
          <div className="analytics-legend">{Object.entries(data.statuses).map(([key, count], index) => <button key={key} onClick={() => setStatus(status === key ? 'all' : key)} title={t('Filter by status')}><i style={{ background: COLORS[index] }} />{t(key)}<strong>{count}</strong></button>)}</div>
        </article>
        <article className="analytics-card analytics-ranking"><h2>{t('Top vehicles by bookings')}</h2><p>{t('Select a vehicle to filter the dashboard.')}</p>{data.topVehicles.map((item) => <button key={item.id} onClick={() => setVehicle(String(item.id))} className="analytics-bar"><span>{item.name}</span><span className="analytics-bar-track"><i style={{ width: `${item.bookings / Math.max(1, data.topVehicles[0].bookings) * 100}%` }} /></span><strong>{item.bookings}</strong><small>{money(item.revenue)}</small></button>)}</article>
      </div>
    </>}
  </section>;
}
