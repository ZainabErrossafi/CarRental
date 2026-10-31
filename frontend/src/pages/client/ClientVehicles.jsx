import CompactDropdown from "../../components/client/CompactDropdown.jsx";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RotateCcw, ChevronDown, MapPin, CalendarDays, ArrowRight, Info } from "lucide-react";
import VehicleCard from "../../components/client/VehicleCard.jsx";
import { getClientVehicles } from "../../services/clientVehicles.js";

const sortOptions = [
  ["default", "Default order"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["name-asc", "Name: A–Z"],
  ["name-desc", "Name: Z–A"],
];

function SortDropdown({ value, onChange }) {
  return (
    <label className="fleet-sort">
      <span>Sort by</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {sortOptions.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

const formatTripDate = (value) => {
  if (!value) return "Date à préciser";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export default function ClientVehicles() {
  const [params, setParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getClientVehicles()
      .then((items) => {
        if (active) setVehicles(items);
      })
      .catch(() => {
        if (active) setError("Could not load vehicles. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const categories = [...new Set(vehicles.map((vehicle) => vehicle.category))];
  const brands = [...new Set(vehicles.map((vehicle) => vehicle.brand))];
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
    setCategory("");
    setSearch("");
    setBrand("");
    setTransmission("");
    setMaxPrice(null);
  };
  const searchText = search.trim().toLowerCase();
  const budget = maxPrice ?? priceLimit;
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchText);
    const matchesCategory = !selectedCategory || vehicle.category === selectedCategory;
    const matchesBrand = !brand || vehicle.brand === brand;
    const matchesTransmission = !transmission || vehicle.transmission === transmission;
    const matchesPrice = vehicle.pricePerDay <= budget;

    return matchesSearch && matchesCategory && matchesBrand && matchesTransmission && matchesPrice;
  });
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sort === "price-asc") return a.pricePerDay - b.pricePerDay;
    if (sort === "price-desc") return b.pricePerDay - a.pricePerDay;
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <section className="fleet-page" aria-label="Vehicles">
      {params.get("departure_agency") && (
        <div className="fleet-trip-summary" aria-label="Résumé du trajet">
          <div className="fleet-trip-route">
            {["departure", "return"].map((kind, index) => (
              <div className="fleet-trip-stop" key={kind}>
                <span className={`fleet-trip-pin${index ? " is-return" : ""}`}>
                  <MapPin size={20} aria-hidden="true" />
                </span>
                <div>
                  <span className="fleet-trip-label">{index ? "Retour" : "Départ"}</span>
                  <h2>{params.get(`${kind}_agency`) || "Agence à préciser"}</h2>
                  <p>
                    <CalendarDays size={14} aria-hidden="true" />
                    {formatTripDate(params.get(`${kind}_date`))}
                    <span className="fleet-trip-time">{params.get(`${kind}_time`) || "—"}</span>
                  </p>
                </div>
              </div>
            ))}
            <span className="fleet-trip-arrow">
              <ArrowRight size={18} aria-hidden="true" />
            </span>
          </div>
          <p className="fleet-trip-notice">
            <Info size={13} aria-hidden="true" />
            Les dates sélectionnées ne vérifient pas encore la disponibilité des véhicules.
          </p>
        </div>
      )}
      <div className="fleet-layout fleet-layout-horizontal">
        <aside className="fleet-filters fleet-unified-controls" aria-label="Vehicle filters">
          <div className="fleet-results-toolbar">
            <p role="status">
              <strong>{filteredVehicles.length}</strong>{" "}
              {filteredVehicles.length === 1 ? "vehicle" : "vehicles"} found
            </p>
            <label className="fleet-search">
              <Search size={17} aria-hidden="true" />
              <input
                aria-label="Search vehicles by name"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a vehicle…"
              />
            </label>
            <SortDropdown value={sort} onChange={setSort} />
          </div>
          <button
            type="button"
            className="fleet-filter-toggle"
            aria-expanded={mobileOpen}
            aria-controls="fleet-filter-fields"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            Refine your search <ChevronDown size={16} aria-hidden="true" />
          </button>
          <div id="fleet-filter-fields" className={`fleet-filter-fields${mobileOpen ? " is-open" : ""}`}>
            <CompactDropdown
              label="Category"
              value={selectedCategory}
              onChange={setCategory}
              options={[
                { value: "", label: "All categories" },
                ...[...new Set([...categories, ...(selectedCategory ? [selectedCategory] : [])])].map(
                  (name) => ({ value: name, label: name }),
                ),
              ]}
            />
            <CompactDropdown
              label="Brand"
              value={brand}
              onChange={setBrand}
              options={[
                { value: "", label: "All brands" },
                ...brands.map((name) => ({ value: name, label: name })),
              ]}
            />
            <CompactDropdown
              label="Transmission"
              value={transmission}
              onChange={setTransmission}
              options={[
                { value: "", label: "All transmissions" },
                ...transmissions.map((name) => ({ value: name, label: name })),
              ]}
            />
            <label className="fleet-price-filter">
              <span>Daily budget</span>
              <span className="fleet-budget-control">
                <strong>{budget} MAD</strong>
                <input
                  aria-label="Maximum daily budget"
                  style={{
                    "--budget-fill": `${Math.min(100, Math.max(0, (budget / priceLimit) * 100))}%`,
                  }}
                  type="range"
                  min="0"
                  max={priceLimit}
                  step="50"
                  value={budget}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                />
                <small className="fleet-budget-min">0</small>
              </span>
            </label>
            <button type="button" className="fleet-clear-filters" onClick={reset}>
              <RotateCcw size={14} aria-hidden="true" />
              Clear all filters
            </button>
          </div>
        </aside>
        <div className="fleet-results">
          <div aria-live="polite">
            {loading && <p role="status">Loading vehicles…</p>}
            {error && (
              <div role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => setRetry((value) => value + 1)}>
                  Try again
                </button>
              </div>
            )}
          </div>
          <div className="fleet-results-grid">
            {sortedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          {!loading && !error && filteredVehicles.length === 0 && (
            <div className="fleet-empty">
              <Search size={30} aria-hidden="true" />
              <h2>No matching vehicles</h2>
              <p>Try a different category or increase your budget.</p>
              <button type="button" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
