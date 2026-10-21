import api, { getList } from "./api";
import { vehicleFromApi } from "./vehicleData";

const forClient = (data) => {
  const vehicle = vehicleFromApi(data);
  return {
    ...vehicle,
    name: [vehicle.brand, vehicle.model].filter(Boolean).join(" "),
    pricePerDay: Number(vehicle.dailyRate),
    description: vehicle.description_en || vehicle.description_fr || vehicle.description_ar || "",
  };
};

export const getClientVehicles = async () => (await getList("vehicles/?status=available")).map(forClient);
export const getClientVehicle = async (id) => {
  const { data } = await api.get(`vehicles/${encodeURIComponent(id)}/`);
  return forClient(data);
};
