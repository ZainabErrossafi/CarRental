import { Outlet, useLocation } from "react-router-dom";
import ClientHeader from "../../components/client/ClientHeader.jsx";
import ClientFooter from "../../components/client/ClientFooter.jsx";
import "../../styles/client.css";
import brandsBackground from "../../assets/vehicle-brands-background.png";

export default function ClientLayout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div
      className="tw:flex tw:min-h-screen tw:flex-col tw:bg-[#fdfaf5] tw:text-[#021731] tw:[&_a]:no-underline"
      style={{
        backgroundImage: `linear-gradient(rgba(253, 250, 245, 0.45), rgba(253, 250, 245, 0.45)), url(${brandsBackground})`,
        backgroundSize: "auto, 900px 900px",
        backgroundRepeat: "repeat",
      }}
    >
      <ClientHeader overlay={isHome} />
      <main className={isHome ? "tw:w-full tw:flex-1" : "tw:mx-auto tw:w-[90%] tw:max-w-[1120px] tw:flex-1 tw:pb-12"}><Outlet /></main>
      <ClientFooter />
    </div>
  );
}
