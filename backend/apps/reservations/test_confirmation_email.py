from datetime import datetime, timedelta, timezone as dt_timezone
from decimal import Decimal
from unittest.mock import patch
from zoneinfo import ZoneInfo

from django.core import mail
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.extras.models import Extra
from apps.locations.models import Location
from apps.notifications.models import Notification
from apps.users.models import User
from apps.vehicles.models import Vehicle
from .models import Reservation, ReservationExtra


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class ConfirmationEmailTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user('manager', 'manager@example.com', role='admin')
        self.customer = User.objects.create_user('driver', 'account@example.com')
        location = Location.objects.create(name='Airport office', city='Casablanca', country='Morocco')
        vehicle = Vehicle.objects.create(
            brand=Brand.objects.create(name='Toyota'), category=Category.objects.create(name='SUV'),
            model='RAV4', year=2025, transmission='automatic', fuel='hybrid',
            seats=5, doors=4, daily_rate=Decimal('300.00'),
        )
        pickup = datetime(2027, 6, 1, 9, 30, tzinfo=dt_timezone.utc)
        self.reservation = Reservation.objects.create(
            reference='RES-EMAIL', user=self.customer, vehicle=vehicle,
            pickup_location=location, dropoff_location=location,
            driver_name='Amina Driver', phone='0600000000', email='booking@example.com',
            pickup_date=pickup, return_date=pickup + timedelta(days=2, hours=3, minutes=15),
            total_price=Decimal('900.00'),
        )
        self.url = f'/api/reservations/{self.reservation.pk}/confirm/'
        self.client.force_authenticate(self.admin)

    def test_confirmation_sends_full_details_to_booking_email_once(self):
        extra = Extra.objects.create(name='Child seat', flat_price=Decimal('50.00'))
        ReservationExtra.objects.create(reservation=self.reservation, extra=extra, quantity=2)
        self.reservation.refresh_from_db()
        total = self.reservation.total_price
        self.assertEqual(self.client.post(self.url).status_code, 200)
        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.status, 'confirmed')
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertEqual(message.to, ['booking@example.com'])
        local_pickup = timezone.localtime(self.reservation.pickup_date, ZoneInfo('Africa/Casablanca'))
        local_return = timezone.localtime(self.reservation.return_date, ZoneInfo('Africa/Casablanca'))
        for detail in ['RES-EMAIL', 'Amina Driver', 'Toyota RAV4 (2025)', 'Automatic',
                       'Hybrid', 'Airport office', 'Casablanca', local_pickup.strftime('%d/%m/%Y at %H:%M %z'),
                       local_return.strftime('%d/%m/%Y at %H:%M %z'), 'Africa/Casablanca',
                       '2 day(s), 3 hour(s), 15 minute(s)', f'{total:.2f} MAD', 'Child seat × 2']:
            self.assertIn(detail, message.body)
        self.assertEqual(message.alternatives[0][1], 'text/html')
        self.assertIn('Your reservation is confirmed', message.alternatives[0][0])
        self.assertEqual(Notification.objects.filter(user=self.customer, type='reservation_confirmed').count(), 1)
        self.assertEqual(self.client.post(self.url).status_code, 400)
        self.assertEqual(len(mail.outbox), 1)

    def test_client_cannot_confirm_and_no_email_on_creation(self):
        self.assertEqual(len(mail.outbox), 0)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post(self.url).status_code, 403)
        self.assertEqual(len(mail.outbox), 0)

    def test_guest_receives_email_without_account_notification(self):
        self.reservation.user = None
        self.reservation.save(update_fields=['user'])
        self.assertEqual(self.client.post(self.url).status_code, 200)
        self.assertEqual(mail.outbox[0].to, ['booking@example.com'])
        self.assertFalse(Notification.objects.exists())

    def test_delivery_failure_keeps_pending_and_allows_retry(self):
        with patch('apps.reservations.emails.send_mail', side_effect=OSError('Unavailable')):
            response = self.client.post(self.url)
        self.assertEqual(response.status_code, 503)
        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.status, 'pending')
        self.assertFalse(Notification.objects.exists())
        self.assertEqual(self.client.post(self.url).status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_zero_deliveries_are_treated_as_failure(self):
        with patch('apps.reservations.emails.send_mail', return_value=0):
            self.assertEqual(self.client.post(self.url).status_code, 503)
        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.status, 'pending')

    def test_cancelled_or_completed_cannot_be_confirmed(self):
        for status in ('cancelled', 'completed'):
            self.reservation.status = status
            self.reservation.save(update_fields=['status'])
            self.assertEqual(self.client.post(self.url).status_code, 400)
        self.assertEqual(len(mail.outbox), 0)

    def test_html_escapes_customer_supplied_content(self):
        self.reservation.driver_name = '<script>alert(1)</script>'
        self.reservation.save(update_fields=['driver_name'])
        self.assertEqual(self.client.post(self.url).status_code, 200)
        html = mail.outbox[0].alternatives[0][0]
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)
