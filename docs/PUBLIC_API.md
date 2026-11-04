# Public API

The API-key-protected public API is available under `/api/public/v1/`.

- Human-readable documentation: `/api/public/v1/docs/`
- OpenAPI JSON: `/api/public/v1/openapi.json`
- Send your personal API key in the `X-API-Key` header.
- Default rate limit: 60 requests per minute per user, preserved across key rotation. Configure `PUBLIC_API_RATE_LIMIT` to change it.
- All active users can read the shared catalog. Only users with the `admin` role can create, update or delete vehicles. This is a shared catalog, without agency isolation.

## Manage your key

After logging in, use your account JWT access token (not an API key):

```sh
# Generate a key, or rotate it (immediately invalidating the previous key).
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" https://your-domain.example/api/users/api-key/
# Read metadata only; the original key cannot be recovered.
curl -H "Authorization: Bearer $ACCESS_TOKEN" https://your-domain.example/api/users/api-key/
# Revoke your key immediately.
curl -X DELETE -H "Authorization: Bearer $ACCESS_TOKEN" https://your-domain.example/api/users/api-key/
```

POST returns HTTP 201 with `key`, `prefix`, `is_active`, `created_at`, `expires_at`, and `is_expired`. Save `key` immediately: it is returned only once. GET returns the same metadata without `key` (404 if no key exists). DELETE returns 204. Each user has one key, valid for one year; rotating a key starts a new year. Only its SHA-256 hash is stored. Disabled or deleted users cannot authenticate with their keys.

Apply the database migration with `python manage.py migrate` before using these endpoints.

Keep keys in a trusted server or API client, never in browser code or source control. Vehicle writes require existing brand and category IDs.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET, POST | `/api/public/v1/vehicles/` | List or create vehicles |
| GET, PUT, PATCH, DELETE | `/api/public/v1/vehicles/{id}/` | Retrieve, replace, partially update, or delete a vehicle |
| GET | `/api/public/v1/brands/` | List brands |
| GET | `/api/public/v1/categories/` | List active categories |
| GET | `/api/public/v1/locations/` | List active locations |
| GET | `/api/public/v1/faqs/` | List active FAQs |

## Example

All requests to the data endpoints need the API key. For the commands below, set a variable in your terminal so you don't repeat or save the key in each command:

```sh
export API_KEY='YOUR_PRIVATE_API_KEY'
export API_BASE='https://your-domain.example/api/public/v1'
```

Use the key only from a server or trusted API client. Never expose it in frontend JavaScript, a public repository, or a mobile app.

### 1. Read vehicles from the database

```sh
curl -H "X-API-Key: $API_KEY" "$API_BASE/vehicles/"
```

The list is paginated. A response looks like this:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 12,
      "brand_name": "Toyota",
      "category_name": "SUV",
      "home_location_name": "Casablanca",
      "feature_names": ["Air conditioning"],
      "model": "RAV4",
      "year": 2025,
      "status": "available",
      "transmission": "automatic",
      "fuel": "hybrid",
      "seats": 5,
      "daily_rate": "450.00",
      "deposit": "2000.00"
    }
  ]
}
```

Get one vehicle by its database ID:

```sh
curl -H "X-API-Key: $API_KEY" "$API_BASE/vehicles/12/"
```

Filter and search the list with query parameters:

```sh
curl -H "X-API-Key: $API_KEY" \
  "$API_BASE/vehicles/?fuel=hybrid&min_rate=300&max_rate=700&search=Toyota&ordering=daily_rate&page=1"
```

Supported vehicle filters are `brand`, `category`, `status`, `fuel`, `transmission`, `min_rate`, and `max_rate`. `search` looks at the model, brand, and category. `ordering` accepts `year`, `daily_rate`, or `created_at` (prefix a field with `-` for descending order).

### 2. Read other database records

These catalog endpoints are read-only and return active categories, locations, and FAQs:

```sh
curl -H "X-API-Key: $API_KEY" "$API_BASE/brands/"
curl -H "X-API-Key: $API_KEY" "$API_BASE/categories/"
curl -H "X-API-Key: $API_KEY" "$API_BASE/locations/"
curl -H "X-API-Key: $API_KEY" "$API_BASE/faqs/"
```

### 3. Create a vehicle

Use IDs that already exist in the database for `brand_id` and `category_id`. `feature_ids` and `home_location_id` are optional.

```sh
curl -X POST "$API_BASE/vehicles/" \
  -H "X-API-Key: $API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "brand_id": 1,
    "category_id": 2,
    "home_location_id": 1,
    "feature_ids": [1, 3],
    "model": "RAV4",
    "year": 2025,
    "transmission": "automatic",
    "fuel": "hybrid",
    "seats": 5,
    "doors": 4,
    "daily_rate": "450.00",
    "deposit": "2000.00"
  }'
```

### 4. Update or delete a vehicle

`PUT` replaces the vehicle fields, so send all required fields. `PATCH` changes only the fields in its JSON body.

```sh
curl -X PUT "$API_BASE/vehicles/12/" \
  -H "X-API-Key: $API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "brand_id": 1,
    "category_id": 2,
    "model": "RAV4",
    "year": 2025,
    "transmission": "automatic",
    "fuel": "hybrid",
    "seats": 5,
    "doors": 4,
    "daily_rate": "475.00",
    "deposit": "2000.00"
  }'

curl -X PATCH "$API_BASE/vehicles/12/" \
  -H "X-API-Key: $API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"daily_rate": "490.00"}'

curl -X DELETE "$API_BASE/vehicles/12/" \
  -H "X-API-Key: $API_KEY"
```

Successful deletion returns HTTP `204` with an empty body. A successful create returns HTTP `201`; reads and updates return HTTP `200`.

### Common errors

- `401`: API key missing or incorrect.
- `403`: an admin role is required for vehicle writes.
- `400`: invalid JSON or a database ID such as `brand_id` does not exist.
- `404`: requested vehicle ID does not exist.
- `429`: the API key exceeded its rate limit; wait before retrying.

The API is intended for vehicle catalog integration and lookup data. It does not expose reservation or customer records.
