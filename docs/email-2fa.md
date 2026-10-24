# Email OTP authentication

The implementation is entirely in the backend. No frontend files are changed.

## Files

- `backend/apps/users/models.py`: requested enable flag, six-digit code and timestamp; secure random generation, email delivery and constant-time verification with a ten-minute expiry. Extra challenge ID and attempt count bind a pending token to one login attempt and limit guessing.
- `backend/apps/users/serializers.py`: case-insensitive email/password login for active users, OTP interception, and a guard against bypass through dj-rest-auth login.
- `backend/apps/users/two_factor.py`: ten-minute `email_2fa` tokens, challenge creation and final access/refresh token issuance. Pending tokens are bound to the current password and email, contain `is_2fa_pending=true`, and are not access or refresh tokens.
- `backend/apps/users/views_2fa.py`: toggle, resend, verify, request throttling, and transactional row locking.
- `backend/config/urls.py`: API routes.
- `backend/config/settings.py`: development console email backend and environment-based SMTP configuration.
- `backend/apps/users/migrations/0004_email_two_factor.py`: database schema migration.
- `backend/apps/users/test_email_2fa.py`: regression and security tests.

## Apply migration

```sh
docker compose exec backend python manage.py migrate
```

## Login

`POST /api/token/`

```json
{"email": "user@example.com", "password": "your-password"}
```

With 2FA enabled:

```json
{
  "two_factor_required": true,
  "ephemeral_token": "...",
  "message": "Verification code sent to email"
}
```

Without 2FA, returns `access`, `refresh`, and `role` directly. Active client accounts are accepted as well as administrators. Existing role-based permissions still protect admin APIs.

## Enable or disable

`POST /api/auth/2fa/toggle/` with `Authorization: Bearer <access>`:

```json
{"enabled": true, "password": "your-current-password"}
```

Send `false` to disable. The current password is required to prevent someone with only a stolen access token from changing this setting. Passwordless Google accounts must set a password through the existing password recovery process before using this endpoint. Changing the setting clears outstanding OTP challenges. Existing access/refresh tokens are not revoked by this operation.

## Verify

`POST /api/auth/2fa/verify/`:

```json
{"ephemeral_token": "...", "code": "012345"}
```

Keep the code as a string to preserve leading zeroes. Success returns `access`, `refresh`, and `role`; the code, timestamp and pending challenge are cleared. Failed verification returns 401. Five unsuccessful attempts invalidate the challenge. Start login again with valid credentials to obtain a new challenge.

## Resend

`POST /api/auth/2fa/resend/`:

```json
{"ephemeral_token": "..."}
```

Resending replaces the stored OTP without resetting the failed-attempt count or extending the pending token's ten-minute lifetime. A 60-second cooldown applies to email generation, including repeated logins. Expired pending tokens require a new login. Verification and resend endpoints have an additional IP throttle; use a shared Django cache across production workers for consistent request throttling. Database-backed challenge attempt counts and cooldowns are shared across workers.

## Existing authentication routes

The dj-rest-auth `/api/auth/login/` endpoint rejects accounts with 2FA enabled and directs them to `/api/token/`. The Google success callback returns the same pending challenge JSON for enabled accounts; it does not issue session tokens before OTP verification. Its existing redirect behavior is retained for accounts without 2FA.

The current frontend does not implement the OTP entry step. Enabling 2FA requires a client that handles the interception response and calls the verify endpoint. A Google callback challenge is currently displayed as JSON; a future frontend integration can provide the OTP form.

## Email settings

Development uses `django.core.mail.backends.console.EmailBackend`, which prints the code to backend logs rather than delivering real email. Production environment example:

```dotenv
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.example
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=your-smtp-user
EMAIL_HOST_PASSWORD=your-smtp-password
DEFAULT_FROM_EMAIL=noreply@your-domain.example
```

Email delivery failures return 503 without committing the new challenge through the API flow.

The requested six-character database field stores the OTP itself. Protect database access and avoid exposing these fields through profile serializers or admin displays. OTP verification uses row locks in a transaction; production should retain PostgreSQL. Console email is only for development.

## Test

```sh
docker compose exec backend python manage.py test apps.users
```
