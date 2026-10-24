<!-- ####oussama: Set up and verify sign-up email delivery. -->
# Sign-up email verification

<!-- ####oussama: Registration data stays in a separate temporary table until verification. -->
New registrations are stored in `PendingSignup`, not the user table. Passwords are
hashed. A six-digit email code expires after ten minutes. Correct verification
creates the active, verified user, deletes the temporary request, and returns session tokens. Five wrong codes
invalidate a challenge. Resend is limited to once per minute. New accounts also
require an email code on later sign-ins. Existing accounts are preserved.

The browser stores the pending challenge in sessionStorage, without login tokens.
To resume an expired or lost challenge, sign in with the same email and password.

## Real email delivery

Set these in the local `.env` (never commit credentials):

```dotenv
# ####oussama: Replace SMTP placeholders with your provider's settings.
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.example
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_USE_SSL=false
EMAIL_HOST_USER=your-sender@example.com
EMAIL_HOST_PASSWORD=your-provider-app-password
DEFAULT_FROM_EMAIL=Rently <your-sender@example.com>
```

For Gmail use `smtp.gmail.com`, port 587, and a Google App Password where supported.
For implicit SSL use port 465, `EMAIL_USE_SSL=true`, and `EMAIL_USE_TLS=false`.
Recreate the backend after changing environment variables:

```sh
docker compose up -d --force-recreate --no-deps backend
```

Without SMTP configuration Django uses the console backend: codes appear in backend
logs and are **not delivered** to an inbox. Never enable console emails in production.
SMTP failures return 503; a failed initial delivery rolls back the temporary request.
Expired requests are removed on subsequent sign-up attempts. Previously created
unverified users retain their existing verification flow; existing accounts are not deleted.

## Endpoints

- `POST /api/auth/signup/`: username, email, password; returns a pending challenge.
- `POST /api/auth/2fa/verify/`: ephemeral_token, six-digit code; activates and signs in.
- `POST /api/auth/2fa/resend/`: ephemeral_token; sends another code.
- `POST /api/token/`: email, password; resumes pending sign-up or starts sign-in 2FA.

Run `python manage.py migrate` and `python manage.py test apps.users` inside the backend.
