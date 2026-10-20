import { NavLink } from "react-router-dom";

export default function ClientHeader() {
  return (
    <header className="client-header">
      <NavLink className="client-brand" to="/">Rently</NavLink>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/vehicles">Vehicles</NavLink>
        <NavLink to="/login">Admin login</NavLink>
      </nav>
    </header>
  );
}
