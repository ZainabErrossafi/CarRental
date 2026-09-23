
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

let mockReservations = [
  { id: 1, reference: "DG-0001", vehicle: "Toyota Yaris", client: "amine@example.com", pickup: "Rabat Agdal", dropoff: "Rabat Agdal", pickupDate: "2026-09-20", returnDate: "2026-09-25", status: "confirmed", totalPrice: 1250 },
  { id: 2, reference: "DG-0002", vehicle: "Dacia Duster", client: "sara@example.com", pickup: "Casablanca Aéroport", dropoff: "Rabat Ville", pickupDate: "2026-09-22", returnDate: "2026-09-23", status: "pending", totalPrice: 350 },
];
export const getReservations = () => delay(mockReservations);
export const updateReservationStatus = (id, status) => {
  mockReservations = mockReservations.map((r) => (r.id === id ? { ...r, status } : r));
  return delay(null);
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
  { id: 3, email: "staff1@Rently.com", role: "staff", isActive: true },
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