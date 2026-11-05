import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import CompactDropdown from "./CompactDropdown.jsx";

export default function VehicleFilters({ options, values, onChange, onReset }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { categories, brands, transmissions, priceLimit } = options;
  const fields = [
    {
      name: "category",
      label: "Category",
      all: "All categories",
      items: [...new Set([...categories, ...(values.category ? [values.category] : [])])],
    },
    { name: "brand", label: "Brand", all: "All brands", items: brands },
    { name: "transmission", label: "Transmission", all: "All transmissions", items: transmissions },
  ];
  return (
    <>
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
        {fields.map(({ name, label, all, items }) => (
          <CompactDropdown
            key={name}
            label={label}
            value={values[name]}
            onChange={(value) => onChange(name, value)}
            options={[{ value: "", label: all }, ...items.map((item) => ({ value: item, label: item }))]}
          />
        ))}
        <label className="fleet-price-filter">
          <span>Daily budget</span>
          <span className="fleet-budget-control">
            <strong>{values.budget} MAD</strong>
            <input
              aria-label="Maximum daily budget"
              style={{
                "--budget-fill": `${Math.min(100, Math.max(0, (values.budget / priceLimit) * 100))}%`,
              }}
              type="range"
              min="0"
              max={priceLimit}
              step="50"
              value={values.budget}
              onChange={(event) => onChange("maxPrice", Number(event.target.value))}
            />
            <small className="fleet-budget-min">0</small>
          </span>
        </label>
        <button type="button" className="fleet-clear-filters" onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" />
          Clear all filters
        </button>
      </div>
    </>
  );
}
