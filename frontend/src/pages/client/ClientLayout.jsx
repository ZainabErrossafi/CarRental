import { Outlet } from "react-router-dom";
import ClientHeader from "../../components/client/ClientHeader.jsx";
import ClientFooter from "../../components/client/ClientFooter.jsx";
import "../../styles/client.css";

export default function ClientLayout() {
  return (
    <div className="client-app">
      <ClientHeader />
      <main className="client-main"><Outlet /></main>
      <ClientFooter />
    </div>
  );
}
