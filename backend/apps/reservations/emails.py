from smtplib import SMTPException
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework.exceptions import APIException


class ReservationEmailUnavailable(APIException):
    status_code = 503
    default_detail = 'Confirmation email could not be sent. The reservation is still pending. Please try again.'


def send_confirmation_email(reservation):
    # Rental times are shown in the agency's timezone, independently of server time.
    rental_timezone = ZoneInfo(getattr(settings, 'RENTAL_TIME_ZONE', 'Africa/Casablanca'))
    duration_seconds = int((reservation.return_date - reservation.pickup_date).total_seconds())
    days, remainder = divmod(duration_seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes = remainder // 60
    duration = ', '.join(f'{value} {label}' for value, label in (
        (days, 'day(s)'), (hours, 'hour(s)'), (minutes, 'minute(s)'),
    ) if value) or 'Less than a minute'
    context = {
        'reservation': reservation,
        'vehicle': reservation.vehicle,
        'pickup': timezone.localtime(reservation.pickup_date, rental_timezone).strftime('%d/%m/%Y at %H:%M %z'),
        'return_time': timezone.localtime(reservation.return_date, rental_timezone).strftime('%d/%m/%Y at %H:%M %z'),
        'rental_timezone': str(rental_timezone),
        'duration': duration,
        'total': format(reservation.total_price, '.2f'),
        'daily_rate': format(reservation.vehicle.daily_rate, '.2f'),
        'deposit': format(reservation.vehicle.deposit, '.2f'),
        'extras': reservation.reservation_extras.select_related('extra'),
    }
    try:
        delivered = send_mail(
            f'Rently — reservation {reservation.reference} confirmed',
            render_to_string('reservations/confirmation_email.txt', context),
            settings.DEFAULT_FROM_EMAIL, [reservation.email], fail_silently=False,
            html_message=render_to_string('reservations/confirmation_email.html', context),
        )
        if delivered != 1:
            raise ReservationEmailUnavailable()
    except (SMTPException, OSError) as error:
        raise ReservationEmailUnavailable() from error
