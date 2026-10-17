import test from 'node:test';
import assert from 'node:assert/strict';
import { vehicleFromApi, vehiclePayload } from './vehicleData.js';

test('vehicle detail can be edited and saved using relation IDs and backend field names', async () => {
  const form = vehicleFromApi({
    id: 12, brand: { id: 3, name: 'Toyota' }, category: { id: 4, name: 'SUV' },
    daily_rate: '500.00', daily_mileage_limit: null, main_image: '/media/vehicles/main/car.jpg',
    transmission: 'automatic', fuel: 'petrol', model: 'RAV4',
  });
  assert.equal(form.brand, 'Toyota');
  assert.equal(form.category, 'SUV');
  assert.equal(form.dailyRate, '500.00');
  const payload = await vehiclePayload({ ...form, brand_id: '6', dailyRate: '550.00' });
  assert.equal(payload.brand_id, '6');
  assert.equal(payload.category_id, 4);
  assert.equal(payload.daily_rate, '550.00');
  assert.equal(payload.daily_mileage_limit, null);
  assert.equal(payload.fuel, 'petrol');
  assert.ok(!('brand' in payload));
  assert.ok(!('main_image' in payload), 'keep an existing image without re-uploading its URL');
});

test('photo selection uploads a file with multipart data and preserves zero and false values', async () => {
  const payload = await vehiclePayload({ brand_id: 1, category_id: 2, dailyRate: 200,
    deposit: 0, is_featured: false, daily_mileage_limit: '',
    main_image: 'data:image/png;base64,iVBORw0KGgo=',
  });
  assert.ok(payload instanceof FormData);
  assert.equal(payload.get('brand_id'), '1');
  assert.equal(payload.get('daily_rate'), '200');
  assert.equal(payload.get('deposit'), '0');
  assert.equal(payload.get('is_featured'), 'false');
  assert.equal(payload.get('daily_mileage_limit'), '');
  assert.equal(payload.get('main_image').type, 'image/png');
  assert.equal(payload.get('main_image').name, 'vehicle.png');
});

test('removing a photo explicitly clears the backend image', async () => {
  const payload = await vehiclePayload({ dailyRate: 100, daily_mileage_limit: 0, main_image: '' });
  assert.equal(payload.main_image, null);
  assert.equal(payload.daily_mileage_limit, 0);
});
