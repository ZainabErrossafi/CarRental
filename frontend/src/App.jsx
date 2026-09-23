import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminVehicles from "./pages/admin/AdminVehicles.jsx";

function ComingSoon({ label }) {
  return (
    <div>
      <div className="page-header"><h1>{label}</h1></div>
      <div className="table-card" style={{ padding: "3rem", textAlign: "center", color: "#667085" }}>
        This page isn't built yet.
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="locations" element={<ComingSoon label="Locations" />} />
        <Route path="catalog" element={<ComingSoon label="Catalog" />} />
        <Route path="reservations" element={<ComingSoon label="Reservations" />} />
        <Route path="reviews" element={<ComingSoon label="Reviews" />} />
        <Route path="users" element={<ComingSoon label="Users & Roles" />} />
        <Route path="site-settings" element={<ComingSoon label="Site Settings" />} />
        <Route path="faqs" element={<ComingSoon label="FAQs" />} />
        <Route path="notifications" element={<ComingSoon label="Notifications" />} />
        <Route path="analytics" element={<ComingSoon label="Analytics" />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
