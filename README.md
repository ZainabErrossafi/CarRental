# .env
DB_HOST=postgres
DB_PORT=5432
DB_USER=car_rental_user
DB_PASSWORD=change_me
DB_NAME=car_rental

DJANGO_SECRET_KEY=change_me
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=

MAPS_API_KEY=

VITE_API_URL=/api

# Optional local Vite settings (in the root .env).
# DEV_PORT: preferred development server port; omit to use Vite's default.
# DEV_PROXY_TARGET: backend origin, including its port if needed.
# Set DEV_PROXY_TARGET when running Vite locally with VITE_API_URL=/api.
# Docker uses its existing reverse proxy and does not need these settings.


GOOGLE_CLIENT_ID="your-client-id-from-google-console"
GOOGLE_CLIENT_SECRET="your-client-secret-from-google-console"


# Public API (set a generated private key; never put it in frontend code)
PUBLIC_API_KEY=
PUBLIC_API_RATE_LIMIT=60/minute

## -----------------------
