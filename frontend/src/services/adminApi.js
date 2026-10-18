import api, { getList } from './api';

// DASHBOARD STATS
export const getAdminStats = async () => {
  const { data } = await api.get('dashboard/stats/');
  return data;
};

import { vehicleFromApi, vehiclePayload } from './vehicleData';

// VEHICLES
export const getVehicles = async () => {
  return (await getList('vehicles/')).map(vehicleFromApi);
};

export const getVehicle = async (id) => {
  const { data } = await api.get(`vehicles/${id}/`);
  return vehicleFromApi(data);
};

export const createVehicle = async (vehicleData) => {
  const { data } = await api.post('vehicles/', await vehiclePayload(vehicleData));
  return vehicleFromApi(data);
};

export const updateVehicle = async (id, vehicleData) => {
  const { data } = await api.patch(`vehicles/${id}/`, await vehiclePayload(vehicleData));
  return vehicleFromApi(data);
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
  return getList('locations/');
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

// CATALOG
const catalogKinds = ['brands', 'categories', 'features', 'extras'];
const catalogPath = (kind, id) => {
  if (!catalogKinds.includes(kind)) throw new Error('Unknown catalog type.');
  return `${kind}/${id == null ? '' : `${id}/`}`;
};
export const getCatalog = async () => Object.fromEntries(await Promise.all(
  catalogKinds.map(async (kind) => [kind, await getList(catalogPath(kind))]),
));
export const createCatalogItem = async (kind, fields) => {
  const { data } = await api.post(catalogPath(kind), fields);
  return data;
};
export const updateCatalogItem = async (kind, id, fields) => {
  const { data } = await api.patch(catalogPath(kind, id), fields);
  return data;
};
export const deleteCatalogItem = async (kind, id) => {
  await api.delete(catalogPath(kind, id));
};
export { getSiteSettings, updateSiteSettings } from './localAdminData';
export const getExtras = async () => getList('extras/');

// RESERVATIONS
export const getReservations = async () => {
  return getList('reservations/');
};

export const createReservation = async (reservationData) => {
  const { user_id, vehicle_id, pickup_location_id, dropoff_location_id, total_price, ...fields } = reservationData;
  const { data } = await api.post('reservations/', {
    ...fields,
    user_id: user_id ? Number(user_id) : null,
    vehicle: Number(vehicle_id),
    pickup_location: Number(pickup_location_id),
    dropoff_location: Number(dropoff_location_id),
  });
  return data;
};

export const updateReservationStatus = async (id, status) => {
  const action = { confirmed: 'confirm', cancelled: 'cancel', completed: 'complete' }[status];
  if (!action) throw new Error('Unsupported reservation status.');
  const { data } = await api.post(`reservations/${id}/${action}/`);
  return data;
};

export const confirmReservation = (id) => updateReservationStatus(id, "confirmed");
export const cancelReservation = (id) => updateReservationStatus(id, "cancelled");
export const completeReservation = (id) => updateReservationStatus(id, "completed");

// REVIEWS
export const getReviews = async () => {
  return getList('reviews/');
};

export const deleteReview = async (id) => {
  const { data } = await api.delete(`reviews/${id}/`);
  return data;
};

// USERS
export const getUsers = async () => {
  return getList('users/');
};

export const createUser = async (userData) => {
  const { data } = await api.post('users/', userData);
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(`users/${id}/`);
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`users/${id}/`, { role });
  return data;
};

// FAQS
export const getFaqs = async () => {
  return getList('faqs/');
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

// NOTIFICATIONS
export const getNotifications = async () => {
  return getList('notifications/');
};

export const markNotificationAsRead = async (id) => {
  const { data } = await api.post(`notifications/${id}/mark_as_read/`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const notifications = await getNotifications();
  return Promise.all(notifications.filter((item) => !item.is_read).map((item) => markNotificationAsRead(item.id)));
};

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`notifications/${id}/`);
  return data;
};