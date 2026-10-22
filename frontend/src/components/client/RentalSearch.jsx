import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample agencies until a public locations endpoint is available.
export const sampleAgencies = ["Casablanca — Aéroport", "Marrakech — Aéroport", "Rabat — Centre-ville"];

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function RentalSearch() {
  const navigate = useNavigate();
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");
  const fieldClass = "tw:box-border tw:h-10 tw:w-full tw:min-w-0 tw:rounded-lg tw:border tw:border-solid tw:border-white/65 tw:bg-[#071b2e]/55 tw:backdrop-blur-sm tw:[color-scheme:dark] tw:px-2.5 tw:font-sans tw:text-[11px] tw:font-semibold tw:text-white tw:drop-shadow-sm tw:focus:outline-2 tw:focus:outline-[#ff8a3d]";
  const labelClass = "tw:flex tw:min-w-0 tw:flex-col tw:gap-1 tw:text-left tw:text-[9px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-white tw:[text-shadow:0_1px_4px_rgba(0,0,0,0.9)]";

  const submit = (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
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
    <form onSubmit={submit} onChange={() => setError("")} aria-label="Rechercher une voiture" className="client-hero-copy tw:mx-auto tw:mt-7 tw:box-border tw:w-full tw:max-w-[1040px] tw:bg-transparent tw:p-0 tw:text-white">
      <div className="tw:grid tw:grid-cols-1 tw:items-end tw:gap-2 tw:sm:grid-cols-2 tw:xl:grid-cols-[minmax(145px,1.3fr)_minmax(145px,1.3fr)_minmax(130px,1fr)_minmax(112px,0.9fr)_minmax(130px,1fr)_minmax(112px,0.9fr)_40px]">
        {[{ name: "departure_agency", label: "Départ" }, { name: "return_agency", label: "Retour" }].map(({ name, label }) => (
          <label key={name} className={labelClass}>
            {label}
            <select name={name} required defaultValue="" className={fieldClass}>
              <option className="tw:bg-[#071b2e] tw:text-white" value="" disabled>Sélectionnez une agence...</option>
              {sampleAgencies.map((agency) => <option className="tw:bg-[#071b2e] tw:text-white" key={agency} value={agency}>{agency}</option>)}
            </select>
          </label>
        ))}
        <label className={labelClass}>Date départ<input aria-label="Date de départ" type="date" name="departure_date" required min={localToday()} value={departureDate} onChange={(event) => { setDepartureDate(event.target.value); if (returnDate < event.target.value) setReturnDate(""); }} className={fieldClass} /></label>
        <label className={labelClass}>Heure<input aria-label="Heure de départ" type="time" name="departure_time" required defaultValue="10:00" className={fieldClass} /></label>
        <label className={labelClass}>Date retour<input aria-label="Date de retour" type="date" name="return_date" required min={departureDate || localToday()} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} className={fieldClass} /></label>
        <label className={labelClass}>Heure<input aria-label="Heure de retour" type="time" name="return_time" required defaultValue="10:00" className={fieldClass} /></label>
        <button type="submit" aria-label="Rechercher une voiture" title="Rechercher une voiture" className="tw:flex tw:w-10 tw:justify-self-end tw:h-10 tw:cursor-pointer tw:items-center tw:justify-center tw:gap-3 tw:rounded-lg tw:border tw:border-solid tw:border-white/50 tw:bg-[#071b2e]/65 tw:p-0 tw:font-sans tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-white tw:hover:bg-[#071b2e]/85 tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-[#ff8a3d] tw:sm:col-span-2 tw:xl:col-span-1"><Search aria-hidden="true" size={18} strokeWidth={2} /></button>
      </div>
      {error && <p role="alert" className="tw:mb-0 tw:mt-3 tw:text-left tw:text-sm tw:text-red-200">{error}</p>}
    </form>
  );
}
