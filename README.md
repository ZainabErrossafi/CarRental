# Rently — Car Rental: Study and Presentation Guide

This README explains what the project contains, how it works, and which files to study so you can present it confidently.
It reflects the source code, documentation, and Git history available on October 30, 2026, including local changes that have not been committed yet.
Earlier conversations outside this session are unavailable. This guide does not attribute all team changes to one person or reproduce the chat history.

## 1. What is the project?

Rently is a car rental agency management application. Customers can browse vehicles, choose rental dates and extras, and make reservations. Administrators manage vehicles, reservations, users, locations, the catalog, FAQs, notifications, and reports.

| Technology | Purpose | Where to look |
| --- | --- | --- |
| React 18 + React Router | Pages, components, and navigation | `frontend/src/App.jsx` |
| Vite + Tailwind CSS + MUI | Build tooling, styling, and UI elements | `frontend/package.json` |
| Axios | API requests, errors, and token handling | `frontend/src/services/api.js` |
| Django 4.2 + Django REST Framework | Business rules and REST API | `backend/config/` and `backend/apps/` |
| SimpleJWT | Access, refresh, and pending OTP tokens | `backend/apps/users/two_factor.py` |
| django-allauth + dj-rest-auth | Authentication integration and Google OAuth | `backend/config/settings.py` |
| PostgreSQL 16 | Data storage, relationships, and transactions | `docker-compose.yml` |
| Docker Compose + Gunicorn + Nginx | Services, HTTPS, and request routing | `docker-compose.yml` and `nginx/` |
| Django email + SMTP | Verification, account, and reservation emails | `backend/apps/users/templates/` |

## 2. Exactly what should you study, and in what order?

Follow these stages in order. After each stage, you should be able to answer its question.

| Order | Topic | Main files | What should you explain? |
| --- | --- | --- | --- |
| 1 | Overview and setup | This README, `docker-compose.yml`, `Makefile` | How does the browser reach the backend and database? |
| 2 | Data and relationships | `backend/apps/*/models.py` | What is stored, and how are records related? |
| 3 | Routing and permissions | `backend/config/urls.py`, `backend/apps/users/permissions.py` | Who can use each endpoint? |
| 4 | Registration and email verification | `users/registration.py`, `users/models.py`, `users/views.py` | Why use PendingSignup before creating a User? |
| 5 | Login, OTP, and JWT | `users/serializers.py`, `users/two_factor.py`, `users/views_2fa.py` | Why can't a pending token authenticate API requests? |
| 6 | Passwords and emails | `users/password_reset.py`, `users/password_change.py`, templates | How do password reset and password change differ? |
| 7 | Reservations and pricing | `reservations/serializers.py`, `reservations/models.py`, `reservations/views.py`, `reservations/emails.py` | How are reservations priced and confirmed? |
| 8 | Frontend/backend integration | `services/api.js`, `services/authApi.js`, `context/AuthContext.jsx` | How are requests, sessions, and errors handled? |
| 9 | Pages and components | `App.jsx`, `pages/`, `components/` | What are the roles of a page, service, context, and hook? |
| 10 | Integration and validation | `apps/public_api/`, `test_*.py` files, documentation | How do you use the API and verify its behavior? |

Paths starting with `users/` or `reservations/` refer to `backend/apps/`. Frontend services, contexts, and pages are under `frontend/src/`.

## 3. How does a request travel through the application?

```text
Browser / React
    → Axios: /api/...
    → Nginx: HTTPS and forwarding to the backend
    → Django URL → View / ViewSet
    → Permission + Serializer: authorization and data validation
    → Model / Service → PostgreSQL or email backend
    → JSON response → React state → UI
```

- A **Model** defines data, relationships, and some business rules.
- A **Serializer** converts data to/from JSON and validates input.
- A **View / ViewSet** defines operations, permissions, and responses.
- A **Migration** changes the database schema; it is executable database maintenance.
- A **frontend service** groups API calls so pages can reuse request logic.
- A **Context** shares state, such as the current user, language, or notifications, between components.

## 4. Database structure

| Model | Represents | Main relationships |
| --- | --- | --- |
| User | Customer or administrator, account details, verification state | Reservations and notifications |
| PendingSignup | Temporary registration before email confirmation | Separate from User; stores a password hash and OTP challenge |
| PasswordChange | Password change requested from an authenticated session | OneToOne with User |
| PasswordResetChallenge | Forgotten password recovery | OneToOne with User |
| Vehicle | Vehicle specifications, status, and pricing | Brand, category, home location, features, gallery |
| Brand / Category / Feature | Make, category, and equipment | Related to vehicles |
| Location | Pickup or return location | Related to reservations and vehicles |
| Extra | Optional service with a daily or fixed price | Through ReservationExtra |
| Reservation | Booking, driver, dates, price, and status | Optional user, vehicle, pickup/dropoff locations |
| ReservationExtra | Selected extra and quantity | Reservation + Extra |
| Review | Customer review | User and vehicle |
| Notification | In-account notification | Recipient user |
| FAQ | Question and answer | Displayed and managed through the API |

`ReservationExtra` is an intermediate table because the relationship also needs a `quantity` field.
Study each model's `on_delete` behavior. For example, reservation locations use `PROTECT`, and the User API rejects deletion of users with reservations with HTTP 409.

## 5. Registration and email verification

1. React submits `username`, `email`, and `password` to `POST /api/auth/signup/`.
2. `SignupSerializer` validates the input, password strength, and email uniqueness.
3. `start_registration()` stores a `PendingSignup` with a **hashed password**, without creating a User immediately.
4. A six-digit code is generated using `secrets` and emailed with HTML and plain-text content.
5. The response includes `ephemeral_token` and `email_verification_required`, without session tokens.
6. React saves the pending token in `sessionStorage` and displays `/verify-email`.
7. `POST /api/auth/2fa/verify/` checks the token, code, expiry, and attempt count.
8. A correct code creates an active, verified User, deletes PendingSignup, and returns `access`, `refresh`, and `role`.

**Numbers to remember:** codes and pending tokens last ten minutes; five wrong attempts invalidate a challenge; email generation has a 60-second cooldown. Resending does not reset failed attempts or extend the pending token's lifetime.

Expired registration requests are cleaned up during later registration attempts. Older unverified accounts also have a compatibility flow, so not every verification uses the same table.

Read: [registration.py](backend/apps/users/registration.py), [models.py](backend/apps/users/models.py), [views_2fa.py](backend/apps/users/views_2fa.py), [authApi.js](frontend/src/services/authApi.js), and [AdminVerifyEmail.jsx](frontend/src/pages/admin/AdminVerifyEmail.jsx).

## 6. Login, OTP, and JWT

`POST /api/token/` accepts an email or username plus a password. The current backend requires an email code for every password login, including accounts with `two_factor_enabled=false`.

```text
email/username + password
    → ephemeral_token + OTP email
    → ephemeral_token + code sent to /api/auth/2fa/verify/
    → access + refresh + role
    → Authorization: Bearer <access> for protected requests
```

- `access` authenticates requests to protected resources.
- `refresh` obtains a new access token through `/api/token/refresh/`.
- `ephemeral_token` has the special type `email_2fa` and can only be used for verification.
- Challenges are bound to a `jti` and a credential version. Changing the password or email invalidates the previous challenge.
- `select_for_update()` inside `transaction.atomic()` locks the row during verification so concurrent requests cannot successfully reuse the same code.
- Codes are checked with `constant_time_compare` and cleared after success.
- `/api/auth/login/` rejects password login to prevent bypassing OTP.
- `/api/auth/2fa/toggle/` requires the current password. Its flag controls optional Google verification and cannot disable OTP for password login.

**Current integration limitation:** `authApi.js → login()` still treats the `/api/token/` response as session tokens and does not redirect users to OTP verification. The frontend password login flow needs to handle the backend challenge. The existing signup OTP page does not complete that integration automatically.

## 7. Google OAuth

Google authentication uses allauth under `/api/accounts/`. The success callback in `users/views.py`:

- Rejects unauthenticated or inactive users.
- Starts an email challenge and redirects to `/verify-email#google_2fa=...` when `two_factor_enabled=true`.
- Otherwise returns access/refresh tokens in the URL fragment, consumed by `services/googleRedirect.js`.

Google requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and provider callback configuration. The `POST /api/auth/google/` route is commented out in `config/urls.py`, although a frontend helper calls it. Also, `AdminVerifyEmail.jsx` currently reads pending signup details from sessionStorage without consuming `google_2fa` from the fragment. This branch needs frontend integration too.

## 8. Password reset and password change

| Situation | Endpoints | Flow |
| --- | --- | --- |
| Forgotten password, signed out | `/api/auth/password-reset/request/`, then `verify/`, then `confirm/` | email → code → new_password |
| Signed in and changing a password | `/api/users/change-password/`, then `/api/users/confirm-password/` | old_password + new_password → code → confirmation |

`PasswordChange` temporarily stores the new password hash. The current password remains in use until code confirmation. For password reset, verification does not consume the challenge: confirmation checks the code again, updates the password, and deletes the challenge.

Reset/change codes are hashed and have expiry and attempt limits. The original password hash is also recorded so a challenge becomes invalid if the password changes through another flow.

Read [password_reset.py](backend/apps/users/password_reset.py) and [password_change.py](backend/apps/users/password_change.py), followed by `AdminForgotPassword.jsx`, `AdminResetPassword.jsx`, and `AccountSettings.jsx`.

## 9. User management and administrator emails

- Administrators can create and update users, change roles, and activate/deactivate accounts.
- Regular users cannot promote themselves or change `is_active` through profile updates.
- Administrators cannot demote themselves or deactivate/delete their own account through these operations.
- Users with reservations cannot be deleted through the API; they can be deactivated.
- Changing a client to an administrator sends an informational email. The user's existing password remains in use.
- Current local changes add an email when `UserSerializer.create()` creates an account. It includes the name, username, email, role, and **password entered by the administrator**. This sends sensitive credentials by email, although the database stores a password hash.
- These messages run through `transaction.on_commit()` after account changes are saved. SMTP failures are logged without rolling back account creation or role changes.
- Public signup uses `PendingSignup` rather than the administrator's account creation flow.

Read `users/serializers.py`, `users/views.py`, `templates/users/admin_promotion_email.html`, and `account_created_email.html/.txt`.

## 10. Reservations, pricing, and confirmation emails

1. Customers must be authenticated to create reservations. The backend assigns the current user as owner.
2. Administrators can choose an owner; if none is supplied, the reservation belongs to the current administrator.
3. The serializer checks that return follows pickup, pickup is not in the past when creating a reservation, and the vehicle is available for the selected period.
4. The backend generates a reference such as `RES-XXXXXXXX` and calculates the total. Price, status, and reference are read-only serializer fields.
5. Administrators receive a notification to review the reservation.

```text
pending → confirmed → completed
pending or confirmed → cancelled
```

Confirmation and completion require an administrator. Cancellation is available to the administrator or owner according to permissions. Cancelled and completed reservations cannot be updated.

**Pricing:** rental duration is rounded up to whole days, with a minimum of one day. For example, 25 hours means two billed days. The total is:

```text
vehicle daily rate × billed days
+ sum(extra daily price × billed days × quantity)
+ sum(extra fixed price × quantity)
```

If an extra has both daily and fixed prices, both are included.

`POST /api/reservations/{id}/confirm/` changes the status, adds a notification when a linked user exists, and emails the reservation's contact address. The message contains vehicle and driver details, dates, locations, extras, and the stored total in MAD. Dates use `Africa/Casablanca` by default.

Confirmation uses a transaction and row lock. Repeated confirmation is rejected. Email failure returns 503 and rolls back the status and notification. Delivery is synchronous without a durable queue; a timeout after provider acceptance can lead to duplicate email on retry.

Read [models.py](backend/apps/reservations/models.py), [serializers.py](backend/apps/reservations/serializers.py), [views.py](backend/apps/reservations/views.py), [emails.py](backend/apps/reservations/emails.py), and [reservationTime.js](frontend/src/utils/reservationTime.js).

## 11. Frontend and administration

- `App.jsx`: public, authentication, and `/admin` routes.
- `ProtectedRoute.jsx`: protects access to the administration UI. Backend permissions must enforce authorization too.
- `AuthContext.jsx`: current user, loading state, login/logout/signup/verification, and refreshUser.
- `api.js`: base URL, Bearer headers, access renewal after 401, shared concurrent refresh handling, and readable error messages.
- Session tokens are stored in `localStorage`; pending signup data uses `sessionStorage`.
- `adminApi.js`: requests for vehicles, reservations, users, FAQs, catalog data, and notifications.
- `getList()` collects backend pagination results; `usePagination.js` controls pagination in the UI.
- `components/admin/`: reusable forms, tables, and dialogs grouped by domain.
- `I18nContext.jsx` and `i18n/translations.js`: translations and language switching.
- `dashboardAnalytics.js`, `reportFiles.js`, and `reservationInvoice.jsx`: frontend analytics, reports, and invoices. Their presence does not establish payment gateway integration.
- The current brands/categories/features/extras catalog uses the API through `adminApi.js`.
- Site settings use `localAdminData.js` and browser localStorage. They are local to the browser rather than shared database settings.

**Other current limitations:** the regular vehicles API uses `IsAuthenticatedOrReadOnly`, allowing writes by any authenticated user under that view's permissions. The notifications backend is a `ReadOnlyModelViewSet` with `mark_as_read`; its frontend DELETE helper has no corresponding destroy endpoint here. Present these behaviors accurately when explaining the project.

## 12. Public API

An additional API under `/api/public/v1/` requires the server's `PUBLIC_API_KEY` in the `X-API-Key` header.

- Vehicles: read, create, update, and delete.
- Brands/categories/locations/FAQs: read.
- Vehicle pagination, search, filtering, and ordering.
- Default rate limit: `60/minute`, configurable through `PUBLIC_API_RATE_LIMIT`.
- Documentation: `/api/public/v1/docs/`; OpenAPI: `/api/public/v1/openapi.json`.
- Keep the key on a server or trusted client; never embed it in React code.

Details and examples: [docs/PUBLIC_API.md](docs/PUBLIC_API.md).

## 13. Running the project

Install Docker with Compose, `make`, and OpenSSL for local certificate generation. Create a root `.env` using this example and replace the placeholders. Keep secrets out of Git.

```dotenv
DB_HOST=postgres
DB_PORT=5432
DB_USER=car_rental_user
DB_PASSWORD=replace-with-a-local-password
DB_NAME=car_rental
DJANGO_SECRET_KEY=replace-with-a-random-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=
MAPS_API_KEY=
VITE_API_URL=/api
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PUBLIC_API_KEY=
PUBLIC_API_RATE_LIMIT=60/minute
```

```sh
make up
make ps
make create_user
```

`make up` generates local certificates, builds images, and starts services. The backend automatically runs migrations before starting Gunicorn. You can rerun migrations with `make migrate`.

Open `https://localhost:8443`, or the port configured in `HTTPS_PORT`. The local certificate is self-signed, so the browser may display a certificate warning. `/admin` is the React administration page, separate from Django admin. The current Nginx configuration forwards `/api/` to the backend and other application routes to the frontend.

```sh
docker compose logs -f backend
make down
```

`make down` stops services. `make clean` also deletes the database volume; use it only when you intend to remove stored data.
Changing `DB_PASSWORD` in `.env` does not automatically update an existing database password. The `make db-sync-password` target addresses that situation; review its script before using it.

For local Vite development, run `npm install` and `npm run dev` inside `frontend/`. The root `.env` supports `DEV_PORT` and `DEV_PROXY_TARGET` to forward `/api` and `/media` to your running backend. The current Compose configuration does not expose the backend directly on the host; the full Docker setup is the prepared path here.

## 14. Email configuration

Django uses the console email backend by default. Messages appear in backend logs and are not delivered to an inbox. For real delivery, add SMTP settings to `.env`:

```dotenv
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.example
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_USE_SSL=false
EMAIL_HOST_USER=your-smtp-user
EMAIL_HOST_PASSWORD=your-smtp-password
DEFAULT_FROM_EMAIL=noreply@your-domain.example
```

```sh
docker compose up -d --force-recreate --no-deps backend
```

TLS on port 587 and implicit SSL on port 465 are common configurations. Use your provider's settings and do not enable both options. OTP delivery failures return 503 in transactional flows. Account creation and promotion messages run after commit and log delivery failures.

## 15. Tests and presentation preparation

Use the following commands to validate the application. Writing this README does not mean these tests have been run or passed during this documentation task.

```sh
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test apps.users
docker compose exec backend python manage.py test apps.reservations
```

For the frontend, inside `frontend/`:

```sh
npm run build
```

| Test file | What to study |
| --- | --- |
| `users/test_signup.py` | Temporary registration and confirmation |
| `users/test_email_2fa.py` | Pending tokens, OTP, attempts, and login |
| `users/test_password_reset.py` | Password recovery |
| `users/test_password_change.py` | Password change after verification |
| `users/test_admin_promotion.py` | Role promotion emails |
| `users/test_account_created_email.py` | Administrator-created account emails; currently a new local file |
| `users/test_inactive_account.py` | Inactive accounts |
| `reservations/test_confirmation_email.py` | Reservation emails and delivery failures |

Prepare a demonstration: signup → retrieve code from logs or inbox → verify → view profile. Demonstrate password login through the API until the frontend OTP integration is completed. Also prepare a pending reservation, confirm it as an administrator, and show the resulting status, notification, and email.

## 16. Questions you should be able to answer

1. **Why PendingSignup?** To create the permanent account only after email ownership is verified.
2. **Password hashing or encryption?** Hashing supports password verification without recovering the original password; database passwords are not stored as plain text.
3. **Why an ephemeral token?** To bind a code to a specific attempt without granting resource access before verification.
4. **Why transactions and row locks?** To commit or roll back related database changes together and coordinate concurrent requests on the same row.
5. **Why validate in the backend if the UI already validates?** Clients can call the API directly, so the UI cannot enforce the rules alone.
6. **What is the difference between 401 and 403?** 401 concerns authentication; 403 means the operation is forbidden. The authentication class also affects the actual response.
7. **Why calculate the reservation price in the backend?** To prevent clients from choosing their own total.
8. **Console email versus SMTP?** Console email writes messages to logs; SMTP submits them to a mail server. Backend acceptance does not guarantee inbox delivery.
9. **Is all data stored in the database?** No. Current site settings are stored locally in the browser.
10. **Is login OTP fully integrated into the UI?** The backend exists and signup is connected, but password login and Google OTP still need the frontend integration described above.

You can introduce the project like this: “The application has a React frontend, a Django API, and PostgreSQL. Requests pass through Nginx to the API, where permissions and input are checked before business rules are applied. Password authentication issues session tokens after email challenge verification, and reservation pricing and status changes are controlled by the backend.”

## 17. Further documentation

- [Email OTP](docs/email-2fa.md): endpoints, security constraints, and SMTP.
- [Signup email verification](docs/signup-email-verification.md): temporary registration and email delivery.
- [Reservation confirmation email](docs/reservation-confirmation-email.md): confirmation, transactions, and email.
- [Public API](docs/PUBLIC_API.md): curl examples and API key usage.
- `docs/ARCHITECTURE.md` and `docs/DB_SCHEMA.md` are currently empty. Use this guide and the models instead.

If an older comment or document conflicts with implementation, consult the current source code and tests. This README describes the current implementation and its limitations; it is not evidence that every flow has been tested end to end.
