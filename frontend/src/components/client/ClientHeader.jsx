import { Link, NavLink } from "react-router-dom";

export default function ClientHeader() {
  return (
    <header className="client-header">
      <Link className="client-brand" to="/">Rently<span>.</span></Link>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/vehicles">Vehicles</NavLink>
      </nav>
    </header>
  );
}
