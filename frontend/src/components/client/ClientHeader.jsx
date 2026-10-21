import { NavLink } from "react-router-dom";

export default function ClientHeader() {
  return (
    <header className="tw:flex tw:flex-col tw:items-start tw:justify-between tw:gap-6 tw:border-b tw:border-solid tw:border-[#e8e2de] tw:px-[5vw] tw:py-6 tw:sm:flex-row tw:sm:items-center">
      <NavLink className="tw:text-[28px] tw:font-extrabold tw:text-inherit" to="/">Rently</NavLink>
      <nav className="tw:flex tw:flex-wrap tw:gap-5" aria-label="Main navigation">
        <NavLink to="/faqs">FAQs</NavLink>
        <NavLink to="/vehicles">Vehicles</NavLink>
        <NavLink to="/login">Login</NavLink>
      </nav>
    </header>
  );
}
