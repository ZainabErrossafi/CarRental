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

// =========================
// CATALOG
// Mirrors the Brand, Category, Feature and Extra models.
// =========================
let catalogData = {
  brands: [
    { id: 1, name: "Toyota", slug: "toyota" },
    { id: 2, name: "Renault", slug: "renault" },
    { id: 3, name: "Dacia", slug: "dacia" },
    { id: 4, name: "Mercedes", slug: "mercedes" },
  ],
  categories: [
    { id: 1, icon: "car", name: "Economy", name_fr: "Économique", name_ar: "اقتصادية", order: 1, active: true, created_at: "2026-01-05", updated_at: "2026-01-05" },
    { id: 2, icon: "truck", name: "SUV", name_fr: "SUV", name_ar: "دفع رباعي", order: 2, active: true, created_at: "2026-01-05", updated_at: "2026-01-05" },
    { id: 3, icon: "gem", name: "Luxury", name_fr: "Luxe", name_ar: "فاخرة", order: 3, active: false, created_at: "2026-01-05", updated_at: "2026-03-10" },
  ],
  features: [
    { id: 1, icon: "snowflake", name: "Air Conditioning", name_fr: "Climatisation", name_ar: "تكييف الهواء" },
    { id: 2, icon: "navigation", name: "GPS Navigation", name_fr: "Navigation GPS", name_ar: "نظام تحديد المواقع" },
    { id: 3, icon: "bluetooth", name: "Bluetooth", name_fr: "Bluetooth", name_ar: "بلوتوث" },
  ],
  extras: [
    { id: 1, icon: "baby", name: "Child Seat", price_per_day: 30, flat_price: 0, max_qty: 2, active: true, created_at: "2026-01-05", updated_at: "2026-01-05" },
    { id: 2, icon: "navigation", name: "GPS Device", price_per_day: 20, flat_price: 0, max_qty: 1, active: true, created_at: "2026-01-05", updated_at: "2026-01-05" },
    { id: 3, icon: "userplus", name: "Additional Driver", price_per_day: 50, flat_price: 0, max_qty: 2, active: true, created_at: "2026-01-05", updated_at: "2026-01-05" },
  ],
};

const catalogToday = () => new Date().toISOString().slice(0, 10);

export const getCatalog = () => delay(catalogData);

// kind: "brands" | "categories" | "features" | "extras"
export const createCatalogItem = (kind, data) => {
  const list = catalogData[kind];
  const nextId = list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1;
  const item = { ...data, id: nextId };

  if (kind === "categories") {
    item.order = list.length ? Math.max(...list.map((i) => i.order)) + 1 : 1;
  }
  if (kind === "categories" || kind === "extras") {
    item.created_at = catalogToday();
    item.updated_at = catalogToday();
  }

  catalogData = { ...catalogData, [kind]: [...list, item] };
  return delay(item);
};

export const updateCatalogItem = (kind, id, data) => {
  const withStamp = kind === "categories" || kind === "extras"
    ? { ...data, updated_at: catalogToday() }
    : data;

  catalogData = {
    ...catalogData,
    [kind]: catalogData[kind].map((i) => (i.id === id ? { ...i, ...withStamp } : i)),
  };
  return delay(catalogData[kind].find((i) => i.id === id));
};

export const deleteCatalogItem = (kind, id) => {
  catalogData = {
    ...catalogData,
    [kind]: catalogData[kind].filter((i) => i.id !== id),
  };
  return delay(null);
};

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
  {
    id: 1,
    question: "What documents do I need to rent a car?",
    answer:
      "You need a valid driver's license (held for at least the minimum required years), a national ID or passport, and a credit or debit card for the security deposit.",
    order: 1,
    active: true,
    created_at: "2026-01-05",
    updated_at: "2026-08-12",
  },
  {
    id: 2,
    question: "Can I extend my rental?",
    answer:
      "Yes, as long as the vehicle isn't booked by another client. Contact us at least 24 hours before your return date to request an extension.",
    order: 2,
    active: true,
    created_at: "2026-01-05",
    updated_at: "2026-08-12",
  },
  {
    id: 3,
    question: "Is there a mileage limit?",
    answer:
      "Each vehicle has its own daily mileage limit, shown on its listing. Extra kilometers are charged at the rate stated in your rental agreement.",
    order: 3,
    active: false,
    created_at: "2026-02-14",
    updated_at: "2026-02-14",
  },
];

const today = () => new Date().toISOString().slice(0, 10);

export const getFaqs = () =>
  delay([...mockFaqs].sort((a, b) => a.order - b.order));

export const createFaq = (data) => {
  const newFaq = {
    ...data,
    id: mockFaqs.length ? Math.max(...mockFaqs.map((f) => f.id)) + 1 : 1,
    order: mockFaqs.length ? Math.max(...mockFaqs.map((f) => f.order)) + 1 : 1,
    created_at: today(),
    updated_at: today(),
  };
  mockFaqs = [...mockFaqs, newFaq];
  return delay(newFaq);
};

export const updateFaq = (id, data) => {
  mockFaqs = mockFaqs.map((f) =>
    f.id === id ? { ...f, ...data, updated_at: today() } : f
  );
  return delay(mockFaqs.find((f) => f.id === id));
};

export const deleteFaq = (id) => {
  mockFaqs = mockFaqs.filter((f) => f.id !== id);
  return delay(null);
};

// Swaps the `order` value of two FAQs so they trade places in the list.
export const swapFaqOrder = (idA, idB) => {
  const a = mockFaqs.find((f) => f.id === idA);
  const b = mockFaqs.find((f) => f.id === idB);
  if (!a || !b) return delay(mockFaqs);

  mockFaqs = mockFaqs.map((f) => {
    if (f.id === idA) return { ...f, order: b.order, updated_at: today() };
    if (f.id === idB) return { ...f, order: a.order, updated_at: today() };
    return f;
  });
  return delay([...mockFaqs].sort((x, y) => x.order - y.order));
};

let mockSiteSettings = {
  company_name: "Rently",
  email: "contact@rently.com",
  phone: "+212 6 00 00 00 00",
  whatsapp: "+212 6 00 00 00 00",
  address: "12 Avenue Mohammed V",
  city: "Rabat",
  country: "Morocco",
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  hero_title_en: "Drive your way",
  hero_title_fr: "Roulez à votre façon",
  hero_title_ar: "قد بطريقتك",
  hero_subtitle_en: "Rent the perfect car for every trip.",
  hero_subtitle_fr: "Louez la voiture idéale pour chaque trajet.",
  hero_subtitle_ar: "استأجر السيارة المثالية لكل رحلة.",
  hero_image: "",
  about_en: "",
  about_fr: "",
  about_ar: "",
  created_at: "2026-01-05",
  updated_at: "2026-09-20",
};

export const getSiteSettings = () => delay(mockSiteSettings);

export const updateSiteSettings = (data) => {
  mockSiteSettings = {
    ...mockSiteSettings,
    ...data,
    updated_at: new Date().toISOString().slice(0, 10),
  };
  return delay(mockSiteSettings);
};
// =========================
// NOTIFICATIONS
// Mirrors the Notification model: type, title, message, related_id,
// related_type, is_read, read_at, created_at.
// =========================
const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

let mockNotifications = [
  {
    id: 1,
    type: "reservation_confirmed",
    title: "Reservation confirmed",
    message: "Reservation DG-0001 for Toyota Yaris was confirmed.",
    related_id: 1,
    related_type: "Reservation",
    is_read: false,
    read_at: null,
    created_at: minutesAgo(12),
  },
  {
    id: 2,
    type: "pickup_reminder",
    title: "Pickup tomorrow",
    message: "Amine El Fassi picks up the Toyota Yaris tomorrow at 10:00.",
    related_id: 1,
    related_type: "Reservation",
    is_read: false,
    read_at: null,
    created_at: minutesAgo(95),
  },
  {
    id: 3,
    type: "payment_received",
    title: "Payment received",
    message: "A payment of 350 MAD was received for reservation DG-0002.",
    related_id: 2,
    related_type: "Reservation",
    is_read: false,
    read_at: null,
    created_at: minutesAgo(60 * 5),
  },
  {
    id: 4,
    type: "reservation_cancelled",
    title: "Reservation cancelled",
    message: "Reservation DG-0003 for Renault Clio was cancelled by the client.",
    related_id: 3,
    related_type: "Reservation",
    is_read: true,
    read_at: minutesAgo(60 * 20),
    created_at: minutesAgo(60 * 26),
  },
  {
    id: 5,
    type: "return_reminder",
    title: "Vehicle due back today",
    message: "Dacia Duster is due back today by 18:00.",
    related_id: 2,
    related_type: "Reservation",
    is_read: true,
    read_at: minutesAgo(60 * 46),
    created_at: minutesAgo(60 * 50),
  },
  {
    id: 6,
    type: "review_request",
    title: "Review requested",
    message: "A review request was sent to sara@example.com after her rental.",
    related_id: 2,
    related_type: "Reservation",
    is_read: true,
    read_at: minutesAgo(60 * 70),
    created_at: minutesAgo(60 * 72),
  },
];

export const getNotifications = () =>
  delay([...mockNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

// Mirrors the Notification model's mark_as_read() method.
export const markNotificationAsRead = (id) => {
  mockNotifications = mockNotifications.map((n) =>
    n.id === id && !n.is_read
      ? { ...n, is_read: true, read_at: new Date().toISOString() }
      : n
  );
  return delay(mockNotifications.find((n) => n.id === id));
};

export const markAllNotificationsAsRead = () => {
  const now = new Date().toISOString();
  mockNotifications = mockNotifications.map((n) =>
    n.is_read ? n : { ...n, is_read: true, read_at: now }
  );
  return delay([...mockNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
};

export const deleteNotification = (id) => {
  mockNotifications = mockNotifications.filter((n) => n.id !== id);
  return delay(null);
};