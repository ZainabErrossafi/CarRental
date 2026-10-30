import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminTerms from "./pages/admin/AdminTerms.jsx";
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
import AdminForgotPassword from "./pages/admin/AdminForgotPassword.jsx";
import AdminResetPassword from "./pages/admin/AdminResetPassword.jsx";
import AdminVerifyEmail from "./pages/admin/AdminVerifyEmail.jsx";
import ProtectedRoute from "./components/admin/auth/ProtectedRoute.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings.jsx";
import AdminFaqs from "./pages/admin/AdminFAQs.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import ClientLayout from "./pages/client/ClientLayout.jsx";
import ClientHome from "./pages/client/Clienthome.jsx";
import ClientVehicles from "./pages/client/ClientVehicles.jsx";
import ClientVehicleDetails from "./pages/client/ClientVehicleDetails.jsx";
import ClientFaqs from "./pages/client/ClientFaqs.jsx";
import ClientTwoFactor from "./pages/client/ClientTwoFactor.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminAuth initialMode="login" />} />
      <Route path="/terms" element={<AdminTerms />} />
      <Route path="/signup" element={<AdminAuth initialMode="signup" />} />
      <Route path="/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/reset-password" element={<AdminResetPassword />} />
      <Route path="/verify-email" element={<AdminVerifyEmail />} />
      <Route path="/two-factor" element={<ClientTwoFactor />} />
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<ClientHome />} />
        <Route path="faqs" element={<ClientFaqs />} />
        <Route path="vehicles" element={<ClientVehicles />} />
        <Route path="vehicles/:id" element={<ClientVehicleDetails />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="vehicles/:id/edit" element={<AdminVehicleEdit />} />
        <Route path="vehicles/new" element={<AdminVehicleAdd />} />
        <Route path="locations" element={<AdminLocations label="Locations" />} />
        <Route path="catalog" element={<AdminCatalog label="Catalog" />} />
        <Route path="reservations" element={<AdminReservations label="Reservations" />} />
        <Route path="reservations/new" element={<AdminReservationAdd />} />
        <Route path="users" element={<AdminUsers label="Users & Roles" />} />
        <Route path="site-settings" element={<AdminSiteSettings label="Site Settings" />} />
        <Route path="faqs" element={<AdminFaqs label="FAQs" />} />
        <Route path="notifications" element={<AdminNotifications label="Notifications" />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
