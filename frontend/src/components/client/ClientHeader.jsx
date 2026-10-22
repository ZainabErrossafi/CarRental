import AccountSettings from "./AccountSettings.jsx";
import ReservationsDropdown from "./ReservationsDropdown.jsx";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/faqs", label: "FAQs" },
];

export default function ClientHeader({ overlay = false }) {
  const { user, loading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); setMobileOpen(false); }
    finally { setLoggingOut(false); }
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);
  const mobileButtonRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        if (mobileOpen) mobileButtonRef.current?.focus();
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  const closeMenus = () => {
    setMobileOpen(false);
  };

  return (
    <header ref={headerRef} className={`client-header${overlay ? " client-header-overlay" : ""} tw:top-0 tw:z-20 tw:w-full tw:px-3 tw:py-3 tw:sm:px-6 ${overlay ? "tw:absolute tw:inset-x-0" : "tw:relative"}`}>
      <nav aria-label="Main navigation" className="client-header-nav tw:relative tw:mx-auto tw:flex tw:w-full tw:box-border tw:flex-wrap tw:items-center tw:justify-between tw:gap-3 tw:bg-transparent tw:px-4 tw:py-2 tw:font-sans">
        <NavLink to="/" onClick={closeMenus} className={`client-header-brand tw:flex tw:items-center tw:gap-3 ${overlay ? "tw:text-white" : "tw:text-[#021731]"}`}>
          <span aria-hidden="true" className="tw:relative tw:block tw:h-9 tw:w-11 tw:shrink-0 tw:overflow-hidden tw:rounded-lg tw:bg-[#fdfaf5]">
            <img src={logo} alt="" className="tw:absolute tw:-left-7 tw:-top-4 tw:h-24 tw:w-24 tw:max-w-none tw:object-contain" />
          </span>
          <span className="tw:flex tw:flex-col tw:gap-0.5">
            <span className="client-hero-copy tw:text-xl tw:font-extrabold tw:leading-none tw:tracking-tight">Rently</span>
            <span className={`tw:text-[8px] tw:font-medium tw:uppercase tw:tracking-[0.16em] ${overlay ? "tw:text-white/65" : "tw:text-[#737f95]"}`}>Car rental Morocco</span>
          </span>
        </NavLink>

        <div className="client-header-actions tw:relative tw:flex tw:items-center tw:gap-2 tw:ml-auto tw:lg:order-2 tw:lg:ml-0">
          {!loading && user?.role === "admin" && <NavLink to="/admin" onClick={closeMenus} aria-label="Admin dashboard" title="Admin dashboard" className="tw:inline-flex tw:size-10 tw:items-center tw:justify-center tw:rounded-full tw:bg-[#ffc58c] tw:text-[#071b2e] tw:hover:bg-[#ffb36a] tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-[#ffc58c]"><ShieldCheck size={19} aria-hidden="true" /></NavLink>}
          {!loading && !user && <>
          <NavLink to="/login" onClick={closeMenus} className={`tw:inline-flex tw:box-border tw:h-10 tw:items-center tw:justify-center tw:rounded-full tw:border tw:border-solid tw:px-3 tw:text-xs tw:font-semibold tw:sm:px-5 tw:sm:text-sm ${overlay ? "tw:border-white/50 tw:text-white tw:hover:bg-white/10" : "tw:border-[#071b2e]/30 tw:text-[#071b2e] tw:hover:bg-gray-100"}`}>Login</NavLink>
          <NavLink to="/signup" onClick={closeMenus} className="tw:inline-flex tw:box-border tw:h-10 tw:items-center tw:justify-center tw:whitespace-nowrap tw:rounded-full tw:bg-[#ffc58c] tw:px-3 tw:text-xs tw:font-semibold tw:text-[#071b2e] tw:hover:bg-[#ffb36a] tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-[#ffc58c] tw:sm:px-5 tw:sm:text-sm">Create account</NavLink>
          </>}
          {!loading && user && <ReservationsDropdown overlay={overlay} />}
          {!loading && user && <AccountSettings overlay={overlay} />}
          {!loading && user && <button type="button" onClick={handleLogout} disabled={loggingOut} className={`tw:inline-flex tw:h-10 tw:cursor-pointer tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:border tw:border-solid tw:bg-transparent tw:px-4 tw:text-xs tw:font-semibold tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-[#ffc58c] tw:disabled:opacity-50 ${overlay ? "tw:border-white/50 tw:text-white tw:hover:bg-white/10" : "tw:border-[#071b2e]/30 tw:text-[#071b2e] tw:hover:bg-gray-100"}`}><LogOut size={16} aria-hidden="true" />{loggingOut ? "Signing out…" : "Logout"}</button>}
          <button ref={mobileButtonRef} type="button" aria-label="Toggle main menu" aria-controls="client-navigation" aria-expanded={mobileOpen} onClick={() => { setMobileOpen(!mobileOpen); }} className="tw:inline-flex tw:size-10 tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-lg tw:border-0 tw:bg-white tw:text-[#021731] tw:hover:bg-gray-100 tw:focus-visible:outline-2 tw:focus-visible:outline-[#ff4f00] tw:lg:hidden">
            <svg aria-hidden="true" className="tw:size-6" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" /></svg>
          </button>
        </div>

        <div id="client-navigation" className={`${mobileOpen ? "tw:block" : "tw:hidden"} tw:w-full tw:lg:absolute tw:lg:left-1/2 tw:lg:top-1/2 tw:lg:block tw:lg:w-auto tw:lg:-translate-x-1/2 tw:lg:-translate-y-1/2`}>
          <ul className={`tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-2 tw:rounded-2xl tw:p-0 tw:text-sm tw:font-semibold tw:lg:flex-row tw:lg:items-center ${overlay ? "tw:bg-transparent" : "tw:bg-transparent"}`}>
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === "/"} onClick={closeMenus} className={({ isActive }) => `tw:flex tw:box-border tw:h-10 tw:items-center tw:justify-center tw:rounded-full tw:px-5 tw:leading-5 tw:transition-colors tw:focus-visible:outline-2 tw:focus-visible:outline-[#ffc58c] ${isActive ? "tw:bg-[#ffc58c] tw:text-[#071b2e] tw:shadow-sm" : overlay ? "tw:text-white/90 tw:hover:bg-white/10 tw:hover:text-white" : "tw:text-[#071b2e] tw:hover:bg-[#071b2e]/10"}`}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
