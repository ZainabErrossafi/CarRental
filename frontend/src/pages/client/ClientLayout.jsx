import { Outlet, useLocation } from "react-router-dom";
import ClientHeader from "../../components/client/ClientHeader.jsx";
import ClientFooter from "../../components/client/ClientFooter.jsx";
import "../../styles/client.css";

const vehicleBrands = ["Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Toyota", "Renault", "Peugeot", "Dacia", "Ford", "Porsche", "Nissan", "Hyundai", "Kia", "Volvo"];

export default function ClientLayout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div
      className={`client-site-background ${isHome ? "" : "client-page-gradient"} tw:flex tw:min-h-screen tw:flex-col tw:text-[#021731] tw:[&_a]:no-underline`}
    >
      <div className="client-brand-pattern" aria-hidden="true">
        {Array.from({ length: 72 }, (_, index) => (
          <span
            key={index}
            className="client-brand-name"
            style={{
              "--brand-progress": `${Math.floor(index / 6) / 11 * 100}%`,
              "--brand-rotation": `${index % 2 === 0 ? -12 : 10}deg`,
            }}
          >
            {vehicleBrands[(index * 5 + Math.floor(index / 6)) % vehicleBrands.length]}
          </span>
        ))}
      </div>
      <ClientHeader overlay />
      <main className={isHome ? "tw:w-full tw:flex-1" : "tw:mx-auto tw:w-[90%] tw:max-w-[1120px] tw:flex-1 tw:pb-12 tw:pt-28"}><Outlet /></main>
      <ClientFooter />
    </div>
  );
}
