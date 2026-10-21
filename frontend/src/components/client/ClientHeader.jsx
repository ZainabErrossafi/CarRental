import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/faqs", label: "FAQs" },
];

export default function ClientHeader({ overlay = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const headerRef = useRef(null);
  const accountButtonRef = useRef(null);
  const mobileButtonRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setAccountOpen(false);
        setMobileOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        if (accountOpen) accountButtonRef.current?.focus();
        else if (mobileOpen) mobileButtonRef.current?.focus();
        setAccountOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen, mobileOpen]);

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  return (
    <header ref={headerRef} className={`tw:top-0 tw:z-20 tw:w-full tw:border-b tw:border-solid ${overlay ? "tw:absolute tw:inset-x-0 tw:border-white/20 tw:bg-[#021731]/40 tw:backdrop-blur-sm" : "tw:sticky tw:border-[#e8e2de] tw:bg-white"}`}>
      <nav aria-label="Main navigation" className="tw:mx-auto tw:flex tw:max-w-screen-xl tw:flex-wrap tw:items-center tw:justify-between tw:gap-4 tw:px-4 tw:py-2 tw:font-sans">
        <NavLink to="/" onClick={closeMenus} className={`tw:flex tw:items-center tw:gap-3 ${overlay ? "tw:text-white" : "tw:text-[#021731]"}`}>
          <span className="tw:relative tw:block tw:h-12 tw:w-16 tw:shrink-0 tw:overflow-hidden">
            <img src={logo} alt="Rently — Car Rental Morocco" className="tw:absolute tw:left-1/2 tw:top-1/2 tw:h-[88px] tw:w-[88px] tw:max-w-none tw:-translate-x-1/2 tw:-translate-y-1/2 tw:object-contain tw:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
          </span>
        </NavLink>

        <div className="tw:relative tw:flex tw:items-center tw:gap-3 tw:md:order-2">
          <button ref={accountButtonRef} type="button" aria-label="Open account menu" aria-expanded={accountOpen} aria-controls="client-account-menu" onClick={() => { setAccountOpen(!accountOpen); setMobileOpen(false); }} className="tw:flex tw:size-9 tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-full tw:border-0 tw:bg-[#f3f4f6] tw:text-[#021731] tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-[#ff4f00]">
            <svg aria-hidden="true" className="tw:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>
          </button>
          {accountOpen && (
            <div id="client-account-menu" className="tw:absolute tw:end-0 tw:top-full tw:mt-3 tw:w-48 tw:rounded-lg tw:border tw:border-solid tw:border-[#e8e2de] tw:bg-white tw:shadow-lg">
              <div className="tw:border-b tw:border-solid tw:border-[#e8e2de] tw:px-4 tw:py-3 tw:text-sm tw:font-semibold">Your account</div>
              <ul className="tw:m-0 tw:list-none tw:p-2 tw:text-sm">
                <li><NavLink to="/login" onClick={closeMenus} className="tw:block tw:rounded tw:p-2 tw:text-[#021731] tw:hover:bg-gray-100">Login</NavLink></li>
                <li><NavLink to="/signup" onClick={closeMenus} className="tw:block tw:rounded tw:p-2 tw:text-[#021731] tw:hover:bg-gray-100">Create account</NavLink></li>
              </ul>
            </div>
          )}
          <button ref={mobileButtonRef} type="button" aria-label="Toggle main menu" aria-controls="client-navigation" aria-expanded={mobileOpen} onClick={() => { setMobileOpen(!mobileOpen); setAccountOpen(false); }} className="tw:inline-flex tw:size-10 tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-lg tw:border-0 tw:bg-white tw:text-[#021731] tw:hover:bg-gray-100 tw:focus-visible:outline-2 tw:focus-visible:outline-[#ff4f00] tw:md:hidden">
            <svg aria-hidden="true" className="tw:size-6" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" /></svg>
          </button>
        </div>

        <div id="client-navigation" className={`${mobileOpen ? "tw:block" : "tw:hidden"} tw:w-full tw:md:order-1 tw:md:block tw:md:w-auto`}>
          <ul className="tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-2 tw:rounded-lg tw:border tw:border-solid tw:border-[#e8e2de] tw:bg-gray-50 tw:p-4 tw:font-medium tw:md:flex-row tw:md:gap-8 tw:md:border-0 tw:md:bg-transparent tw:md:p-0">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === "/"} onClick={closeMenus} className={({ isActive }) => `tw:block tw:rounded tw:px-3 tw:py-2 tw:md:p-0 ${overlay ? "tw:md:text-white" : ""} ${isActive ? "tw:bg-[#021731] tw:text-white tw:md:bg-transparent tw:md:text-[#c83e00]" : "tw:text-[#021731] tw:hover:bg-gray-100 tw:md:hover:bg-transparent tw:md:hover:text-[#c83e00]"}`}>
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
