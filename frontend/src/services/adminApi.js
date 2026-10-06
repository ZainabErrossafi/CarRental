import api from './api';

// DASHBOARD STATS
export const getAdminStats = async () => {
  const { data } = await api.get('dashboard/stats/');
  return data;
};

// VEHICLES
export const getVehicles = async () => {
  const { data } = await api.get('vehicles/');
  return data;
};

export const getVehicle = async (id) => {
  const { data } = await api.get(`vehicles/${id}/`);
  return data;
};

export const createVehicle = async (vehicleData) => {
  const { data } = await api.post('vehicles/', vehicleData);
  return data;
};

export const updateVehicle = async (id, vehicleData) => {
  const { data } = await api.patch(`vehicles/${id}/`, vehicleData);
  return data;
};

export const deleteVehicle = async (id) => {
  const { data } = await api.delete(`vehicles/${id}/`);
  return data;
};

export const updateVehicleStatus = async (id, status) => {
  const { data } = await api.patch(`vehicles/${id}/`, { status });
  return data;
};

// LOCATIONS
export const getLocations = async () => {
  const { data } = await api.get('locations/');
  return data;
};

export const createLocation = async (locationData) => {
  const { data } = await api.post('locations/', locationData);
  return data;
};

export const updateLocation = async (id, locationData) => {
  const { data } = await api.patch(`locations/${id}/`, locationData);
  return data;
};

export const deleteLocation = async (id) => {
  const { data } = await api.delete(`locations/${id}/`);
  return data;
};

// CATALOG (Brands, Categories, Features, Extras)
export const getCatalog = async () => {
  // Assuming a custom backend endpoint that returns all catalog lists together
  const { data } = await api.get('catalog/');
  return data;
};

export const getExtras = async () => {
  const { data } = await api.get('extras/');
  return data;
};

// kind: "brands" | "categories" | "features" | "extras"
export const createCatalogItem = async (kind, itemData) => {
  const { data } = await api.post(`${kind}/`, itemData);
  return data;
};

export const updateCatalogItem = async (kind, id, itemData) => {
  const { data } = await api.patch(`${kind}/${id}/`, itemData);
  return data;
};

export const deleteCatalogItem = async (kind, id) => {
  const { data } = await api.delete(`${kind}/${id}/`);
  return data;
};

// RESERVATIONS
export const getReservations = async () => {
  const { data } = await api.get('reservations/');
  return data;
};

export const createReservation = async (reservationData) => {
  const { data } = await api.post('reservations/', reservationData);
  return data;
};

export const updateReservationStatus = async (id, status) => {
  const { data } = await api.patch(`reservations/${id}/`, { status });
  return data;
};

export const confirmReservation = (id) => updateReservationStatus(id, "confirmed");
export const cancelReservation = (id) => updateReservationStatus(id, "cancelled");
export const completeReservation = (id) => updateReservationStatus(id, "completed");

// REVIEWS
export const getReviews = async () => {
  const { data } = await api.get('reviews/');
  return data;
};

export const deleteReview = async (id) => {
  const { data } = await api.delete(`reviews/${id}/`);
  return data;
};

// USERS
export const getUsers = async () => {
  const { data } = await api.get('users/');
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`users/${id}/`, { role });
  return data;
};

// FAQS
export const getFaqs = async () => {
  const { data } = await api.get('faqs/');
  return data;
};

export const createFaq = async (faqData) => {
  const { data } = await api.post('faqs/', faqData);
  return data;
};

export const updateFaq = async (id, faqData) => {
  const { data } = await api.patch(`faqs/${id}/`, faqData);
  return data;
};

export const deleteFaq = async (id) => {
  const { data } = await api.delete(`faqs/${id}/`);
  return data;
};

export const swapFaqOrder = async (idA, idB) => {
  // If your backend handles swap via a dedicated endpoint:
  const { data } = await api.post('faqs/swap/', { id_a: idA, id_b: idB });
  return data;
};

// SITE SETTINGS
export const getSiteSettings = async () => {
  const { data } = await api.get('settings/');
  return data;
};

export const updateSiteSettings = async (settingsData) => {
  const { data } = await api.patch('settings/', settingsData);
  return data;
};

// NOTIFICATIONS
export const getNotifications = async () => {
  const { data } = await api.get('notifications/');
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await api.patch(`notifications/${id}/read/`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await api.post('notifications/read-all/');
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`notifications/${id}/`);
  return data;
};