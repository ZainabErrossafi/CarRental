export default function CompactDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}) {
  return (
    <label className={`compact-dropdown ${className}`}>
      <span>{label}</span>
      <select
        className="compact-dropdown-trigger"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {!options.some((option) => String(option.value) === String(value)) && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
