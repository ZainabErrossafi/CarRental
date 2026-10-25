# Reservation confirmation email

Only an administrator can confirm a pending reservation:

```http
POST /api/reservations/{id}/confirm/
Authorization: Bearer <admin access token>
```

The existing endpoint and successful response are unchanged. Confirmation sends
an HTML email with a plain-text alternative to the reservation's contact `email`
(including bookings without a linked account). It contains the reservation
reference, driver name, vehicle brand/model/year, transmission, fuel, seats and
doors, pickup and return times and locations, actual rental duration, billed
rental days, extras, and the stored total rental price in MAD. The stored total
includes the extras; confirmation does not recalculate the booking price.

Times are displayed in `Africa/Casablanca` with their UTC offset. A Django
`RENTAL_TIME_ZONE` setting can override this if the agency operates elsewhere.

The existing account notification is preserved. Repeated confirmations return
400 and do not send a second email. The pending-state check uses a row lock
inside a database transaction to serialize concurrent confirmation requests.

SMTP errors or zero delivered messages return 503 and roll back the status and
account notification, allowing the admin to retry. Email is sent synchronously;
as with any SMTP operation, a timeout after provider acceptance can still cause
a duplicate on retry. This is not a durable background delivery queue.

Uses the existing `EMAIL_BACKEND`, SMTP and `DEFAULT_FROM_EMAIL` settings. The
console backend prints the email to backend logs; real inbox delivery requires
SMTP configuration. See [email configuration](signup-email-verification.md#real-email-delivery).
No new migration is required for reservation emails.

Tests: `python manage.py test apps.reservations.test_confirmation_email`
