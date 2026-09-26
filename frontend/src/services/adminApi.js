const delay = (data, ms = 250) => new Promise((res) => setTimeout(() => res(data), ms));

export const getAdminStats = () =>
  delay({
    totalVehicles: 36,
    activeReservations: 9,
    totalUsers: 214,
    monthlyRevenue: "62 300 MAD",
  });

let mockVehicles = [
  { id: 1, brand: "Toyota", model: "Yaris", year: 2022, category: "Economy", status: "available", dailyRate: 250 },
  { id: 2, brand: "Renault", model: "Clio", year: 2021, category: "Economy", status: "maintenance", dailyRate: 200 },
  { id: 3, brand: "Dacia", model: "Duster", year: 2023, category: "SUV", status: "available", dailyRate: 350 },
  { id: 4, brand: "Mercedes", model: "C-Class", year: 2023, category: "Luxury", status: "hidden", dailyRate: 900 },
];
export const getVehicles = () => delay(mockVehicles);
export const deleteVehicle = (id) => {
  mockVehicles = mockVehicles.filter((v) => v.id !== id);
  return delay(null);
};
export const updateVehicleStatus = (id, status) => {
  mockVehicles = mockVehicles.map((v) => (v.id === id ? { ...v, status } : v));
  return delay(null);
};

export const getVehicle = (id) => {
  const vehicle = mockVehicles.find((v) => v.id === Number(id));
  return delay(vehicle);
};

export const updateVehicle = (id, data) => {
  mockVehicles = mockVehicles.map((v) =>
    v.id === Number(id) ? { ...v, ...data } : v
  );
  return delay(mockVehicles.find((v) => v.id === Number(id)));
};

export const createVehicle = (data) => {
  const newVehicle = {
    ...data,
    id: mockVehicles.length ? Math.max(...mockVehicles.map((v) => v.id)) + 1 : 1,
  };
  mockVehicles = [...mockVehicles, newVehicle];
  return delay(newVehicle);
};

let mockReservations = [
  {
    id: 1,
    reference: "DG-0001",
    vehicle: "Toyota Yaris",
    status: "confirmed",
    driver_name: "Amine El Fassi",
    phone: "+212 6 12 34 56 78",
    email: "amine@example.com",
    pickup_date: "2026-09-20",
    return_date: "2026-09-25",
    total_price: 1250,
    created_at: "2026-09-15",
    updated_at: "2026-09-16",
  },
  {
    id: 2,
    reference: "DG-0002",
    vehicle: "Dacia Duster",
    status: "pending",
    driver_name: "Sara Bennani",
    phone: "+212 6 98 76 54 32",
    email: "sara@example.com",
    pickup_date: "2026-09-22",
    return_date: "2026-09-23",
    total_price: 350,
    created_at: "2026-09-18",
    updated_at: "2026-09-18",
  },
];

export const getReservations = () => delay(mockReservations);

const setReservationStatus = (id, status) => {
  mockReservations = mockReservations.map((r) =>
    r.id === id ? { ...r, status, updated_at: new Date().toISOString().slice(0, 10) } : r
  );
  return delay(mockReservations.find((r) => r.id === id));
};

// Mirrors the Reservation model's confirm()/cancel()/complete() methods.
export const confirmReservation = (id) => setReservationStatus(id, "confirmed");
export const cancelReservation = (id) => setReservationStatus(id, "cancelled");
export const completeReservation = (id) => setReservationStatus(id, "completed");

// Kept for backward compatibility with any existing callers.
export const updateReservationStatus = (id, status) => setReservationStatus(id, status);


// Mirrors the Reservation model's calculate_total() method:
// total = vehicle's daily rate × duration in days.
export const createReservation = (data) => {
  const start = new Date(data.pickup_date);
  const end = new Date(data.return_date);
  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  const vehicle = mockVehicles.find((v) => v.id === Number(data.vehicle_id));
  const total_price = vehicle ? vehicle.dailyRate * days : Number(data.total_price) || 0;

  const newReservation = {
    id: mockReservations.length
      ? Math.max(...mockReservations.map((r) => r.id)) + 1
      : 1,
    reference: `DG-${String(
      mockReservations.length
        ? Math.max(...mockReservations.map((r) => r.id)) + 1
        : 1
    ).padStart(4, "0")}`,
    vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : data.vehicle,
    status: "pending",
    driver_name: data.driver_name,
    phone: data.phone,
    email: data.email,
    pickup_date: data.pickup_date,
    return_date: data.return_date,
    total_price,
    created_at: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString().slice(0, 10),
  };

  mockReservations = [...mockReservations, newReservation];
  return delay(newReservation);
};

let mockLocations = [
  { id: 1, name: "Rabat Agdal", city: "Rabat", country: "Morocco", active: true },
  { id: 2, name: "Casablanca Aéroport", city: "Casablanca", country: "Morocco", active: true },
  { id: 3, name: "Marrakech Centre", city: "Marrakech", country: "Morocco", active: false },
];
export const getLocations = () => delay(mockLocations);

const mockBrands = [
  { id: 1, name: "Toyota" },
  { id: 2, name: "Renault" },
  { id: 3, name: "Dacia" },
  { id: 4, name: "Mercedes" },
];
const mockCategories = [
  { id: 1, name: "Economy" },
  { id: 2, name: "SUV" },
  { id: 3, name: "Luxury" },
];
const mockFeatures = [
  { id: 1, name: "Air Conditioning" },
  { id: 2, name: "GPS Navigation" },
  { id: 3, name: "Bluetooth" },
];
const mockExtras = [
  { id: 1, name: "Child Seat", pricePerDay: 30 },
  { id: 2, name: "GPS Device", pricePerDay: 20 },
  { id: 3, name: "Additional Driver", pricePerDay: 50 },
];
export const getCatalog = () =>
  delay({ brands: mockBrands, categories: mockCategories, features: mockFeatures, extras: mockExtras });

let mockReviews = [
  { id: 1, vehicle: "Toyota Yaris", user: "amine@example.com", rating: 5, comment: "Clean car, smooth pickup." },
  { id: 2, vehicle: "Dacia Duster", user: "sara@example.com", rating: 4, comment: "Good value, minor delay at return." },
];
export const getReviews = () => delay(mockReviews);
export const deleteReview = (id) => {
  mockReviews = mockReviews.filter((r) => r.id !== id);
  return delay(null);
};

let mockUsers = [
  { id: 1, email: "amine@example.com", role: "client", isActive: true },
  { id: 2, email: "sara@example.com", role: "client", isActive: true },
  { id: 4, email: "admin@Rently.com", role: "admin", isActive: true },
];
export const getUsers = () => delay(mockUsers);
export const updateUserRole = (id, role) => {
  mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, role } : u));
  return delay(null);
};

let mockFaqs = [
  { id: 1, question: "What documents do I need to rent a car?", order: 1, active: true },
  { id: 2, question: "Can I extend my rental?", order: 2, active: true },
];
export const getFaqs = () => delay(mockFaqs);

export const getSiteSettings = () =>
  delay({
    companyName: "Rently",
    email: "contact@Rently.com",
    phone: "+212 6 00 00 00 00",
    city: "Rabat",
    country: "Morocco",
  });