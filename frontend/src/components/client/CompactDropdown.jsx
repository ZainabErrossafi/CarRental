import { useEffect, useId, useRef, useState } from "react";

export default function CompactDropdown({ label, value, options, onChange, placeholder = "Select an option", disabled = false, className = "" }) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const selected = options.find((option) => String(option.value) === String(value));
  return <div className={`compact-dropdown ${className}`} ref={root} onKeyDown={(event) => {
    if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
  }}>
    <span id={`${id}-label`}>{label}</span>
    <button ref={trigger} type="button" className="compact-dropdown-trigger" disabled={disabled} aria-expanded={open} aria-controls={`${id}-options`} aria-labelledby={`${id}-label ${id}-value`} onClick={() => setOpen(!open)}>
      <span id={`${id}-value`}>{selected?.label || placeholder}</span><span aria-hidden="true">⌄</span>
    </button>
    {open && !disabled && <div className="compact-dropdown-options" id={`${id}-options`} role="group" aria-labelledby={`${id}-label`}>{options.map((option) => <button type="button" key={option.value} aria-pressed={String(value) === String(option.value)} onClick={() => {
      onChange(String(option.value)); setOpen(false); trigger.current?.focus();
    }}>{option.label}</button>)}</div>}
  </div>;
}
