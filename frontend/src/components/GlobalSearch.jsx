import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft } from "lucide-react";
import {
  getVehicles,
  getLocations,
  getCatalog,
  getReservations,
  getUsers,
  getFaqs,
  getNotifications,
} from "../services/adminApi";
import { useI18n } from "../context/I18nContext";

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // "Aéroport" matches "aeroport"

// Build one flat, searchable list from every page's data.
async function loadIndex() {
  const [vehicles, locations, catalog, reservations, users, faqs, notifs] =
    await Promise.allSettled([
      getVehicles(),
      getLocations(),
      getCatalog(),
      getReservations(),
      getUsers(),
      getFaqs(),
      getNotifications(),
    ]).then((results) => results.map((result, index) =>
      result.status === "fulfilled" ? result.value : index === 2
        ? { brands: [], categories: [], features: [], extras: [] } : []
    ));

  const items = [];
  const add = (type, title, subtitle, to, extra = "") =>
    items.push({ type, title, subtitle, to, haystack: norm(`${title} ${subtitle} ${extra}`) });

  vehicles.forEach((v) =>
    add("Vehicle", `${v.brand} ${v.model}`, `${v.category} · ${v.year} · ${v.dailyRate} MAD · ${v.status}`, `/admin/vehicles/${v.id}/edit`)
  );
  reservations.forEach((r) =>
    add("Reservation", `${r.reference} — ${r.driver_name}`, `${r.vehicle} · ${r.pickup_date} → ${r.return_date} · ${r.status}`, "/admin/reservations", `${r.email} ${r.phone} ${r.pickup_location} ${r.dropoff_location}`)
  );
  locations.forEach((l) => add("Location", l.name, `${l.city}, ${l.country}`, "/admin/locations"));
  catalog.categories.forEach((c) =>
    add("Category", c.name, [c.name_fr, c.name_ar].filter(Boolean).join(" · "), "/admin/catalog")
  );
  catalog.brands.forEach((b) => add("Brand", b.name, b.slug, "/admin/catalog"));
  catalog.features.forEach((f) =>
    add("Feature", f.name, [f.name_fr, f.name_ar].filter(Boolean).join(" · "), "/admin/catalog")
  );
  catalog.extras.forEach((e) => add("Extra", e.name, `${e.price_per_day} MAD / day`, "/admin/catalog"));
  users.forEach((u) => add("User", u.email, u.role, "/admin/users"));
  faqs.forEach((f) => add("FAQ", f.question, f.answer.slice(0, 90), "/admin/faqs", f.answer));
  notifs.forEach((n) => add("Notification", n.title, n.message, "/admin/notifications"));
  return items;
}

export default function GlobalSearch({ open, onClose, pages }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  // (Re)load fresh data every time the palette opens
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    setLoading(true);
    let cancelled = false;
    loadIndex()
      .then((items) => !cancelled && setIndex(items))
      .catch(() => !cancelled && setIndex([]))
      .finally(() => !cancelled && setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      cancelled = true;
    };
  }, [open]);

  const results = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return [];

    const pageHits = pages
      .map((p) => ({ type: "Pages", title: t(p.label), subtitle: p.to, to: p.to, haystack: norm(`${p.label} ${t(p.label)}`) }))
      .filter((p) => words.every((w) => p.haystack.includes(w)));

    const dataHits = index.filter((i) => words.every((w) => i.haystack.includes(w))).slice(0, 30);
    return [...pageHits, ...dataHits];
  }, [query, index, pages, t]);

  // Group while keeping a single flat order for keyboard navigation
  const groups = useMemo(() => {
    const map = new Map();
    results.forEach((r, i) => {
      if (!map.has(r.type)) map.set(r.type, []);
      map.get(r.type).push({ ...r, flatIndex: i });
    });
    return [...map.entries()];
  }, [results]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (item) => {
    if (!item) return;
    onClose();
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    }
  };

  if (!open) return null;

  return (
    <div className="gsearch-overlay" onMouseDown={onClose}>
      <div
        className="gsearch"
        role="dialog"
        aria-modal="true"
        aria-label={t("Search")}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="gsearch-input">
          <Search size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search pages, vehicles, reservations…")}
          />
          <kbd>Esc</kbd>
        </div>

        <div className="gsearch-results" ref={listRef}>
          {!query.trim() && (
            <div className="gsearch-empty">
              {loading ? t("Loading…") : t("Start typing to search everything")}
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="gsearch-empty">
              {loading ? t("Loading…") : `${t("No results for")} “${query}”`}
            </div>
          )}

          {groups.map(([type, items]) => (
            <div key={type} className="gsearch-group">
              <div className="gsearch-group-label">{t(type)}</div>
              {items.map((item) => (
                <button
                  key={`${type}-${item.flatIndex}`}
                  type="button"
                  data-index={item.flatIndex}
                  className={`gsearch-item${item.flatIndex === active ? " active" : ""}`}
                  onMouseEnter={() => setActive(item.flatIndex)}
                  onClick={() => choose(item)}
                >
                  <span className="gsearch-item-title">{item.title}</span>
                  <span className="gsearch-item-sub">{item.subtitle}</span>
                  {item.flatIndex === active && <CornerDownLeft size={14} />}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="gsearch-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> {t("to navigate")}</span>
          <span><kbd>↵</kbd> {t("to open")}</span>
          <span><kbd>Esc</kbd> {t("to close")}</span>
        </div>
      </div>
    </div>
  );
}
