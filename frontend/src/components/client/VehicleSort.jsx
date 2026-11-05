const sortOptions = [
  ["default", "Default order"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["name-asc", "Name: A–Z"],
  ["name-desc", "Name: Z–A"],
];

export default function VehicleSort({ value, onChange }) {
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
