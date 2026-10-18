// Keep the API's nested relations compatible with fleet, search and booking screens.
export const vehicleFromApi = (vehicle) => ({
  ...vehicle,
  brand_id: vehicle.brand?.id ?? vehicle.brand_id,
  category_id: vehicle.category?.id ?? vehicle.category_id,
  brand: vehicle.brand?.name ?? vehicle.brand ?? '',
  category: vehicle.category?.name ?? vehicle.category ?? '',
  dailyRate: vehicle.daily_rate,
  daily_mileage_limit: vehicle.daily_mileage_limit ?? '',
  main_image: vehicle.main_image ?? '',
});

export const vehiclePayload = async (vehicle) => {
  const fields = ['brand_id', 'category_id', 'model', 'year', 'status', 'is_featured',
    'transmission', 'fuel', 'seats', 'doors', 'luggage', 'air_conditioning', 'deposit',
    'min_driver_age', 'min_license_years', 'description_en', 'description_fr', 'description_ar'];
  const payload = Object.fromEntries(fields.filter((key) => vehicle[key] !== undefined)
    .map((key) => [key, vehicle[key]]));
  payload.daily_rate = vehicle.dailyRate;
  payload.daily_mileage_limit = vehicle.daily_mileage_limit === '' ? null : vehicle.daily_mileage_limit;
  if (vehicle.main_image?.startsWith('data:')) {
    const blob = await (await fetch(vehicle.main_image)).blob();
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      // An empty multipart field is accepted as null for the mileage limit.
      form.append(key, value ?? '');
    });
    form.append('main_image', blob, `vehicle.${blob.type.split('/')[1] || 'jpg'}`);
    return form;
  }
  if (!vehicle.main_image) payload.main_image = null;
  return payload;
};

