import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminVehicles from "./pages/admin/AdminVehicles.jsx";
import AdminVehicleEdit from "./pages/admin/AdminVehicleEdit.jsx";
import AdminLocations from "./pages/admin/AdminLocations.jsx";
import AdminCatalog from "./pages/admin/AdminCatalog.jsx";
import AdminReservations from "./pages/admin/AdminReservations.jsx";
import AdminReservationAdd from "./pages/admin/Adminreservationadd.jsx";
import AdminVehicleAdd from "./pages/admin/AdminVehicleAdd.jsx";
import AdminAuth from "./pages/admin/AdminAuth.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminReviews from "./pages/admin/AdminReviews.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

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
      <Route path="/login" element={<AdminAuth initialMode="login" />} />
      <Route path="/signup" element={<AdminAuth initialMode="signup" />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="vehicles/:id/edit" element={<AdminVehicleEdit />} />
        <Route path="vehicles/new" element={<AdminVehicleAdd />} />
        <Route path="locations" element={<AdminLocations label="Locations" />} />
        <Route path="catalog" element={<AdminCatalog label="Catalog" />} />
        <Route path="reservations" element={<AdminReservations label="Reservations" />} />
        <Route path="reservations/new" element={<AdminReservationAdd />} />
        <Route path="reviews" element={<AdminReviews label="Reviews" />} />
        <Route path="users" element={<AdminUsers label="Users & Roles" />} />
        <Route path="site-settings" element={<ComingSoon label="Site Settings" />} />
        <Route path="faqs" element={<ComingSoon label="FAQs" />} />
        <Route path="notifications" element={<ComingSoon label="Notifications" />} />
        <Route path="analytics" element={<ComingSoon label="Analytics" />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}