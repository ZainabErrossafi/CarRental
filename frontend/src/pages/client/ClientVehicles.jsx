import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search, RotateCcw, ChevronDown, MapPin, CalendarDays, ArrowRight, Info } from "lucide-react";
import VehicleCard from "../../components/client/VehicleCard.jsx";
import { getClientVehicles } from "../../services/clientVehicles.js";

const brandOf = (vehicle) => vehicle.brand;
const formatTripDate = (value) => {
  if (!value) return "Date à préciser";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export default function ClientVehicles() {
  const [params, setParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    getClientVehicles().then((items) => { if (active) setVehicles(items); })
      .catch(() => { if (active) setError("Could not load vehicles. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const categories = [...new Set(vehicles.map((vehicle) => vehicle.category))];
  const brands = [...new Set(vehicles.map(brandOf))];
  const transmissions = [...new Set(vehicles.map((vehicle) => vehicle.transmission))];
  const priceLimit = Math.ceil(Math.max(...vehicles.map((vehicle) => vehicle.pricePerDay), 100) / 50) * 50;
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [transmission, setTransmission] = useState("");
  const [maxPrice, setMaxPrice] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sort, setSort] = useState("default");
  const selectedCategory = params.get("category") || "";
  const setCategory = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("category", value);
    else next.delete("category");
    setParams(next, { replace: true });
  };
  const reset = () => {
    setCategory(""); setSearch(""); setBrand(""); setTransmission(""); setMaxPrice(null);
  };
  const activeFilters = [selectedCategory, brand, transmission, maxPrice !== null && maxPrice < priceLimit, search.trim()].filter(Boolean).length;
  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.name.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!selectedCategory || vehicle.category === selectedCategory) &&
    (!brand || brandOf(vehicle) === brand) &&
    (!transmission || vehicle.transmission === transmission) && vehicle.pricePerDay <= (maxPrice ?? priceLimit)
  );
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sort === "price-asc") return a.pricePerDay - b.pricePerDay;
    if (sort === "price-desc") return b.pricePerDay - a.pricePerDay;
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <section className="fleet-page">
      <div className="fleet-page-heading fleet-page-heading-simple"><h1>Our vehicles</h1></div>
      {params.get("departure_agency") && <div className="fleet-trip-summary" aria-label="Résumé du trajet">
        <div className="fleet-trip-route">
          {["departure", "return"].map((kind, index) => <div className="fleet-trip-stop" key={kind}>
            <span className={`fleet-trip-pin${index ? " is-return" : ""}`}><MapPin size={20} aria-hidden="true" /></span>
            <div><span className="fleet-trip-label">{index ? "Retour" : "Départ"}</span><h2>{params.get(`${kind}_agency`) || "Agence à préciser"}</h2><p><CalendarDays size={14} aria-hidden="true" />{formatTripDate(params.get(`${kind}_date`))}<span className="fleet-trip-time">{params.get(`${kind}_time`) || "—"}</span></p></div>
          </div>)}
          <span className="fleet-trip-arrow"><ArrowRight size={18} aria-hidden="true" /></span>
        </div>
        <p className="fleet-trip-notice"><Info size={13} aria-hidden="true" />Les dates sélectionnées ne vérifient pas encore la disponibilité des véhicules.</p>
      </div>}
      <div className="fleet-layout">
        <aside className="fleet-filters" aria-label="Vehicle filters">
          <div className="fleet-filter-heading"><span><SlidersHorizontal size={18} aria-hidden="true" />Filters {activeFilters > 0 && <b>{activeFilters}</b>}</span><button type="button" onClick={reset} aria-label="Reset all filters" title="Reset all filters"><RotateCcw size={15} aria-hidden="true" /></button></div>
          <button type="button" className="fleet-filter-toggle" aria-expanded={mobileOpen} aria-controls="fleet-filter-fields" onClick={() => setMobileOpen(!mobileOpen)}>Refine your search <ChevronDown size={16} aria-hidden="true" /></button>
          <div id="fleet-filter-fields" className={`fleet-filter-fields${mobileOpen ? " is-open" : ""}`}>
            <fieldset><legend>Category</legend>
              {["", ...categories, ...(selectedCategory && !categories.includes(selectedCategory) ? [selectedCategory] : [])].map((category) => <label className="fleet-filter-choice" key={category}><input type="radio" name="category" checked={selectedCategory === category} onChange={() => setCategory(category)} /><span>{category || "All categories"}</span><small>{category ? vehicles.filter((vehicle) => vehicle.category === category).length : vehicles.length}</small></label>)}
            </fieldset>
            <label className="fleet-filter-select">Brand<select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="">All brands</option>{brands.map((name) => <option key={name}>{name}</option>)}</select></label>
            <fieldset><legend>Transmission</legend><div className="fleet-transmission-options">{["", ...transmissions].map((value) => <button key={value} type="button" aria-pressed={transmission === value} className={transmission === value ? "is-selected" : ""} onClick={() => setTransmission(value)}>{value || "All"}</button>)}</div></fieldset>
            <label className="fleet-price-filter"><span>Daily budget<strong>{maxPrice ?? priceLimit} MAD</strong></span><input type="range" min="0" max={priceLimit} step="50" value={maxPrice ?? priceLimit} onChange={(event) => setMaxPrice(Number(event.target.value))} /><span className="fleet-price-limits"><small>0 MAD</small><small>{priceLimit} MAD</small></span></label>
            <button type="button" className="fleet-clear-filters" onClick={reset}><RotateCcw size={14} aria-hidden="true" />Clear all filters</button>
          </div>
        </aside>
        <div className="fleet-results">
          <div className="fleet-results-toolbar"><p role="status"><strong>{filteredVehicles.length}</strong> {filteredVehicles.length === 1 ? "vehicle" : "vehicles"} found</p><label className="fleet-search"><Search size={17} aria-hidden="true" /><input aria-label="Search vehicles by name" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a vehicle…" /></label>
          <label className="fleet-sort">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="default">Default order</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name-asc">Name: A–Z</option><option value="name-desc">Name: Z–A</option></select></label></div>
          <div aria-live="polite">{loading && <p role="status">Loading vehicles…</p>}{error && <div role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>}</div>
          <div className="fleet-results-grid">{sortedVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
          {!loading && !error && filteredVehicles.length === 0 && <div className="fleet-empty"><Search size={30} aria-hidden="true" /><h2>No matching vehicles</h2><p>Try a different category or increase your budget.</p><button type="button" onClick={reset}>Clear filters</button></div>}
        </div>
      </div>
    </section>
  );
}
