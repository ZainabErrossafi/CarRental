import { Outlet, useLocation } from "react-router-dom";
import ClientHeader from "../../components/client/ClientHeader.jsx";
import ClientFooter from "../../components/client/ClientFooter.jsx";
import "../../styles/client.css";

export default function ClientLayout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div
      className="client-site-background client-page-gradient tw:flex tw:min-h-screen tw:flex-col tw:text-[#021731] tw:[&_a]:no-underline"
    >
      <ClientHeader overlay={isHome} />
      <main className={isHome ? "tw:w-full tw:flex-1" : "tw:mx-auto tw:w-[90%] tw:max-w-[1120px] tw:flex-1 tw:pb-12 tw:pt-10"}><Outlet /></main>
      <ClientFooter home={isHome} />
    </div>
  );
}
