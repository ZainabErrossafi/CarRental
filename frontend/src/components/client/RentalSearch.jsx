import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getList } from "../../services/api.js";

function AgencyDropdown({ name, label, locations, disabled, loading, labelClass, fieldClass }) {
  const [value, setValue] = useState("");
  const root = useRef(null);
  const selected = locations.find((item) => String(item.id) === value);
  useEffect(() => {
    const close = (event) => {
      if (!root.current?.contains(event.target)) root.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <div className={`agency-dropdown-field ${labelClass}`}>
    <span id={`${name}-label`}>{label}</span>
    <input type="hidden" name={name} value={selected ? value : ""} />
    <details ref={root} className="agency-dropdown" onKeyDown={(event) => {
      if (event.key === "Escape") { root.current.removeAttribute("open"); root.current.querySelector("summary").focus(); }
    }}>
      <summary className={fieldClass} aria-labelledby={`${name}-label ${name}-value`} aria-disabled={disabled} onClick={(event) => { if (disabled) event.preventDefault(); }}>
        <span id={`${name}-value`}>{selected ? `${selected.name} · ${selected.city}` : loading ? "Chargement…" : "Sélectionnez une agence..."}</span><span aria-hidden="true">⌄</span>
      </summary>
      {!disabled && <div className="agency-dropdown-options" role="group" aria-labelledby={`${name}-label`}>
        {locations.map((location) => <button key={location.id} type="button" aria-pressed={value === String(location.id)} onClick={() => {
          setValue(String(location.id)); root.current.removeAttribute("open"); root.current.querySelector("summary").focus();
        }}>{location.name} · {location.city}</button>)}
      </div>}
    </details>
  </div>;
}

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function RentalSearch() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const items = await getList("locations/?active=true");
        if (active) { setLocations(items.filter((item) => item.active)); setLocationsError(false); }
      } catch { if (active) setLocationsError(true); }
      finally { if (active) setLocationsLoading(false); }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, []);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");
  const fieldClass = "tw:box-border tw:h-10 tw:w-full tw:min-w-0 tw:rounded-lg tw:border tw:border-solid tw:border-white/65 tw:bg-[#071b2e]/55 tw:backdrop-blur-sm tw:[color-scheme:dark] tw:px-2.5 tw:font-sans tw:text-[11px] tw:font-semibold tw:text-white tw:drop-shadow-sm tw:focus:outline-2 tw:focus:outline-[#ff8a3d]";
  const labelClass = "tw:flex tw:min-w-0 tw:flex-col tw:gap-1 tw:text-left tw:text-[9px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-white tw:[text-shadow:0_1px_4px_rgba(0,0,0,0.9)]";

  const submit = (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const departureLocation = locations.find((item) => String(item.id) === fields.get("departure_agency"));
    const returnLocation = locations.find((item) => String(item.id) === fields.get("return_agency"));
    if (!departureLocation || !returnLocation || locationsError) {
      setError("Sélectionnez des agences disponibles.");
      return;
    }
    fields.set("pickup_location", String(departureLocation.id));
    fields.set("dropoff_location", String(returnLocation.id));
    fields.set("departure_agency", `${departureLocation.name} · ${departureLocation.city}`);
    fields.set("return_agency", `${returnLocation.name} · ${returnLocation.city}`);
    const departure = new Date(`${fields.get("departure_date")}T${fields.get("departure_time")}`);
    const returned = new Date(`${fields.get("return_date")}T${fields.get("return_time")}`);
    if (departure <= new Date()) {
      setError("La date et l’heure de départ doivent être dans le futur.");
      return;
    }
    if (returned <= departure) {
      setError("Le retour doit être après le départ.");
      return;
    }
    setError("");
    navigate(`/vehicles?${new URLSearchParams(fields).toString()}`);
  };

  return (
    <form onSubmit={submit} onChange={() => setError("")} aria-label="Rechercher une voiture" className="client-rental-search client-hero-copy tw:mx-auto tw:mt-7 tw:box-border tw:w-full tw:max-w-[1040px] tw:bg-transparent tw:p-0 tw:text-white">
      <div className="client-rental-search-grid tw:grid tw:grid-cols-1 tw:items-end tw:gap-2 tw:sm:grid-cols-2 tw:xl:grid-cols-[minmax(145px,1.3fr)_minmax(145px,1.3fr)_minmax(130px,1fr)_minmax(112px,0.9fr)_minmax(130px,1fr)_minmax(112px,0.9fr)_40px]">
        {[{ name: "departure_agency", label: "Départ" }, { name: "return_agency", label: "Retour" }].map(({ name, label }) => (
          <AgencyDropdown key={name} name={name} label={label} locations={locations} loading={locationsLoading} disabled={locationsLoading || locationsError || !locations.length} labelClass={labelClass} fieldClass={fieldClass} />
        ))}
        <label className={labelClass}>Date départ<input aria-label="Date de départ" type="date" name="departure_date" required min={localToday()} value={departureDate} onChange={(event) => { setDepartureDate(event.target.value); if (returnDate < event.target.value) setReturnDate(""); }} className={fieldClass} /></label>
        <label className={labelClass}>Heure<input aria-label="Heure de départ" type="time" name="departure_time" required defaultValue="10:00" className={fieldClass} /></label>
        <label className={labelClass}>Date retour<input aria-label="Date de retour" type="date" name="return_date" required min={departureDate || localToday()} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} className={fieldClass} /></label>
        <label className={labelClass}>Heure<input aria-label="Heure de retour" type="time" name="return_time" required defaultValue="10:00" className={fieldClass} /></label>
        <button type="submit" disabled={locationsLoading || locationsError || !locations.length} aria-label="Rechercher une voiture" title="Rechercher une voiture" className="tw:flex tw:w-10 tw:justify-self-end tw:h-10 tw:cursor-pointer tw:items-center tw:justify-center tw:gap-3 tw:rounded-lg tw:border tw:border-solid tw:border-white/50 tw:bg-[#071b2e]/65 tw:p-0 tw:font-sans tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-white tw:hover:bg-[#071b2e]/85 tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-[#ff8a3d] tw:sm:col-span-2 tw:xl:col-span-1"><Search aria-hidden="true" size={18} strokeWidth={2} /></button>
      </div>
      {locationsError && <p role="alert" className="tw:mt-3 tw:text-sm tw:text-red-200">Impossible de charger les agences. Revenez sur cette page pour réessayer.</p>}
      {!locationsLoading && !locationsError && !locations.length && <p role="status" className="tw:mt-3 tw:text-sm">Aucune agence disponible pour le moment.</p>}
      {error && <p role="alert" className="tw:mb-0 tw:mt-3 tw:text-left tw:text-sm tw:text-red-200">{error}</p>}
    </form>
  );
}
