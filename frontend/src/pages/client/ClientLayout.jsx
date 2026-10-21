import { Outlet } from "react-router-dom";
import ClientHeader from "../../components/client/ClientHeader.jsx";
import ClientFooter from "../../components/client/ClientFooter.jsx";
import "../../styles/client.css";

export default function ClientLayout() {
  return (
    <div className="tw:flex tw:min-h-screen tw:flex-col tw:bg-[#fdfaf5] tw:text-[#021731] tw:[&_a]:no-underline">
      <ClientHeader />
      <main className="tw:mx-auto tw:w-[90%] tw:max-w-[1120px] tw:flex-1 tw:pb-12"><Outlet /></main>
      <ClientFooter />
    </div>
  );
}
