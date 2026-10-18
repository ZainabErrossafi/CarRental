from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from apps.brands.models import Brand
from apps.categories.models import Category
from apps.extras.models import Extra
from apps.locations.models import Location
from apps.vehicles.models import Vehicle
from .models import Reservation


class ReservationCreationTests(APITestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(username='admin', role='admin')
        self.customer = get_user_model().objects.create_user(username='customer')
        self.location = Location.objects.create(name='Office', city='Rabat', country='Morocco')
        self.vehicle = Vehicle.objects.create(
            brand=Brand.objects.create(name='Toyota'),
            category=Category.objects.create(name='SUV'), model='RAV4', year=2025,
            transmission='automatic', fuel='petrol', seats=5, doors=4, daily_rate='122.99',
        )
        self.extra = Extra.objects.create(name='Seat', price_per_day=10, flat_price=5)
        self.payload = {
            'user_id': None, 'vehicle': self.vehicle.pk,
            'pickup_location': self.location.pk, 'dropoff_location': self.location.pk,
            'driver_name': 'Guest Driver', 'phone': '0600000000', 'email': 'guest@example.com',
            'pickup_date': '2026-10-17', 'return_date': '2026-10-23',
            'extras': [self.extra.pk], 'total_price': '0.01',
        }
        self.client.force_authenticate(self.admin)

    def test_guest_and_extras_with_server_calculated_total(self):
        response = self.client.post('/api/reservations/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        reservation = Reservation.objects.get()
        self.assertIsNone(reservation.user)
        self.assertEqual(reservation.reservation_extras.count(), 1)
        self.assertEqual(reservation.total_price, Decimal('802.94'))
        reservation.confirm()  # Guests have no account to notify.

    def test_admin_can_select_customer(self):
        self.payload['user_id'] = self.customer.pk
        response = self.client.post('/api/reservations/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(Reservation.objects.get().user, self.customer)

    def test_customer_cannot_assign_booking_to_another_user(self):
        self.client.force_authenticate(self.customer)
        self.payload['user_id'] = self.admin.pk
        response = self.client.post('/api/reservations/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(Reservation.objects.get().user, self.customer)

    def test_invalid_dates_do_not_create_reservation(self):
        self.payload['return_date'] = '2026-10-16'
        response = self.client.post('/api/reservations/', self.payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Reservation.objects.exists())
