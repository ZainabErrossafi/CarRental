import { Check } from "lucide-react";

export default function PasswordRequirement({ met, label }) {
  return (
    <div className={`password-requirement ${met ? "met" : ""}`}>
      <span className="password-requirement-icon">
        <Check size={11} strokeWidth={3} />
      </span>
      {label}
    </div>
  );
}
